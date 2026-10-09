import { describe, expect, it } from 'vitest'
import cytoscape from 'cytoscape'
import { initialV2State, studentName } from './model'
import { events, organizations } from '../data/mockData'
import { adaptRelationships, buildRelationshipGraph, relationshipSnapshot, trackRelationshipChanges } from './relationshipAdapter'
import { relationshipDemo } from './relationshipMock'
import { graphElements, layoutRelationships, relationshipStyles } from './relationshipEngine'

const fresh = () => structuredClone(initialV2State)
describe('relationship adapter and privacy', () => {
  it('uses marks, not retired registration, and never fabricates activity members', () => {
    const state = fresh()
    state.participatingActivities = [events[0].id, events[0].id]
    state.eventRegistrations = { [events[1].id]: 'going' }
    const activity = relationshipSnapshot(state).filter(e => e.kind === 'activity')
    expect(activity).toHaveLength(1)
    expect(activity[0]).toMatchObject({ relation: 'marked', establishedAt: null, members: [] })
  })
  it('includes only my rooms and only names visible within open memberships', () => {
    const state = fresh(), entities = relationshipSnapshot(state)
    expect(entities.some(e => e.sourceId === 'room-car')).toBe(false)
    expect(entities.find(e => e.sourceId === 'room-ball')?.members.map(m => m.name)).toEqual(['王嘉', '林同学'])
    state.rooms = state.rooms.map(r => r.id === 'room-ball' ? { ...r, status: 'finished' } : r)
    expect(relationshipSnapshot(state).find(e => e.sourceId === 'room-ball')?.members).toEqual([])
  })
  it('does not merge names into globally identified people or infer organization membership', () => {
    const state = fresh()
    state.rooms[2].members.push('王嘉')
    state.joinedOrganizations = [organizations[0].id]
    const entities = relationshipSnapshot(state)
    const members = entities.flatMap(e => e.members).filter(m => m.name === '王嘉')
    expect(members[0].id).not.toBe(members[1].id)
    expect(entities.find(e => e.kind === 'organization')).toMatchObject({ relation: 'followed', members: [] })
  })
  it('deduplicates nodes and links and drops private or collapsed members', () => {
    const demo = relationshipDemo(), expanded = new Set(demo.map(e => e.id))
    demo[0].members.push({ id: 'private-person', name: 'PRIVATE', canView: false, relation: 'not-visible' })
    const graph = buildRelationshipGraph([...demo, demo[0]], expanded)
    expect(new Set(graph.nodes.map(n => n.id)).size).toBe(graph.nodes.length)
    expect(new Set(graph.edges.map(n => n.id)).size).toBe(graph.edges.length)
    expect(JSON.stringify(graph)).not.toContain('PRIVATE')
    expect(buildRelationshipGraph(demo, new Set()).nodes.some(n => n.kind === 'person')).toBe(false)
  })
})
describe('relationship history', () => {
  it('records successful mark/cancel/rejoin transitions once, retaining first known time', () => {
    const original = fresh(), id = events[0].id, nodeId = `activity:${id}`
    const first = trackRelationshipChanges(original, { ...original, participatingActivities: [id] }, '2026-10-09T10:00:00Z')
    const repeated = trackRelationshipChanges(first, { ...first, participatingActivities: [id, id] }, '2026-10-09T11:00:00Z')
    expect(repeated.relationshipHistory?.[nodeId].changes).toHaveLength(1)
    const cancelled = trackRelationshipChanges(repeated, { ...repeated, participatingActivities: [] }, '2026-10-09T12:00:00Z')
    expect(adaptRelationships(cancelled).find(e => e.id === nodeId)).toMatchObject({ active: false, members: [] })
    const rejoined = trackRelationshipChanges(cancelled, { ...cancelled, participatingActivities: [id] }, '2026-10-09T13:00:00Z')
    expect(rejoined.relationshipHistory?.[nodeId].changes).toHaveLength(3)
    expect(adaptRelationships(rejoined).find(e => e.id === nodeId)?.establishedAt).toBe('2026-10-09T10:00:00Z')
  })
  it('does not backfill existing dates or store other people in history after leaving', () => {
    const original = fresh()
    const next = trackRelationshipChanges(original, { ...original, rooms: original.rooms.map(r => r.id === 'room-ball' ? { ...r, members: r.members.filter(n => n !== studentName) } : r) })
    const record = next.relationshipHistory?.['team:room-ball']
    expect(record?.entity.establishedAt).toBeNull()
    expect(JSON.stringify(record)).not.toContain('王嘉')
    expect(adaptRelationships(next).find(e => e.id === 'team:room-ball')).toMatchObject({ active: false, members: [] })
    expect(buildRelationshipGraph(adaptRelationships(next), new Set(['team:room-ball'])).nodes.some(n => n.label === '王嘉')).toBe(false)
  })
  it('does not create history for rejected/pending joins or unrelated profile edits', () => {
    const original = fresh()
    const next = trackRelationshipChanges(original, { ...original, profile: { nickname: '小晴', avatar: '' }, applications: [{ roomId: 'room-car', status: 'pending' }] })
    expect(next.relationshipHistory).toBeUndefined()
  })
})
describe('mature graph layout and bounded work', () => {
  it('lays out actual typed nodes without overlap', () => {
    const sample = relationshipDemo(), graph = buildRelationshipGraph(sample, new Set(sample.slice(0, 2).map(e => e.id)))
    const cy = cytoscape({ headless: true, styleEnabled: true, style: relationshipStyles, elements: graphElements(graph) })
    try {
      layoutRelationships(cy)
      const nodes = cy.nodes().toArray()
      for (let i = 0; i < nodes.length; i++) {
        expect(Number.isFinite(nodes[i].position('x'))).toBe(true)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i].boundingBox(), b = nodes[j].boundingBox()
          expect(a.x2 <= b.x1 || b.x2 <= a.x1 || a.y2 <= b.y1 || b.y2 <= a.y1, JSON.stringify({ first: nodes[i].id(), second: nodes[j].id(), a, b })).toBe(true)
        }
      }
    } finally { cy.destroy() }
  })
  it('keeps 1000 source connections bounded and prepares a page within a practical budget', () => {
    const sample = relationshipDemo(1000), start = performance.now()
    const graph = buildRelationshipGraph(sample, new Set(sample.map(e => e.id)))
    expect(graph.nodes.length).toBeLessThanOrEqual(57)
    expect(graph.edges.length).toBeLessThanOrEqual(56)
    const cy = cytoscape({ headless: true, styleEnabled: true, style: relationshipStyles, elements: graphElements(graph) })
    try { layoutRelationships(cy) } finally { cy.destroy() }
    const elapsed = performance.now() - start
    console.info(`Relationship benchmark: 1000 connections → ${graph.nodes.length} nodes / ${graph.edges.length} edges, ${elapsed.toFixed(1)}ms`)
    expect(elapsed).toBeLessThan(1500)
  })
})
