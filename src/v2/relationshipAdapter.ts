import { coffeeSlots, events, organizations, teachers } from '../data/mockData'
import { studentName, type V2State } from './model'
import { ownsActivity } from './activityPolicy'

export type EntityKind = 'activity' | 'team' | 'organization' | 'coffee'
export type RelationKind = 'marked' | 'hosted' | 'joined' | 'followed' | 'booked' | 'registered' | 'confirmed'
export const entityLabels: Record<EntityKind, string> = { activity: '活动', team: '队伍', organization: '组织', coffee: '交流' }
export const relationLabels: Record<RelationKind, string> = { marked: '标记参与', hosted: '主办', joined: '已加入', followed: '关注组织', booked: '预约已确认', registered: '已报名', confirmed: '已确认参与' }
export interface VisibleMember { id: string; name: string; canView: boolean; relation: string }
export interface RelationshipEntity {
  id: string
  sourceId: string
  title: string
  kind: EntityKind
  relation: RelationKind
  status: string
  active: boolean
  path: string
  establishedAt: string | null
  members: VisibleMember[]
  memberAccess: string
}
export interface RelationshipHistory {
  entity: Omit<RelationshipEntity, 'members' | 'memberAccess'>
  changes: { at: string; status: string; active: boolean }[]
}

/** Only data already visible in the current account's source screens is admitted here. */
export function relationshipSnapshot(state: V2State): RelationshipEntity[] {
  const items = new Map<string, RelationshipEntity>()
  const put = (item: RelationshipEntity) => items.set(item.id, item)
  const base = { establishedAt: null, members: [] as VisibleMember[], active: true }
  const allEvents = [...events, ...state.localEvents.filter(e => e.status === 'published')]
  for (const event of allEvents) {
    const hosted = state.localEvents.some(e => e.id === event.id && ownsActivity(state, e))
    if (!hosted && !state.participatingActivities.includes(event.id)) continue
    put({ ...base, id: `activity:${event.id}`, sourceId: event.id, title: event.title, kind: 'activity', relation: hosted ? 'hosted' : 'marked', status: hosted ? '本人主办 · 未核实出席' : '已标记参与 · 非报名或出席记录', path: `/v2/activities/${event.id}`, memberAccess: '活动参与者及授权接口未接入，不展示其他成员。' })
  }
  for (const room of state.rooms) {
    const inRoom = room.members.includes(studentName), owner = room.owner === studentName
    if (!inRoom && !owner) continue
    // Legacy records have names, not stable user IDs. Scope identities to the room,
    // so equal display names across rooms cannot silently merge two people.
    const members = inRoom && room.status === 'open' ? [...new Set(room.members)].filter(name => name !== studentName).map(name => ({ id: `room-member:${room.id}:${encodeURIComponent(name)}`, name, canView: true, relation: '同队成员 · 不等同于好友或共同到场' })) : []
    put({ ...base, id: `team:${room.id}`, sourceId: room.id, title: room.title, kind: 'team', relation: 'joined', active: room.status === 'open', status: room.status === 'finished' ? '队伍已结束 · 未核实实际参与' : owner ? '队长 · 已加入' : '已加入', path: '/v2/partners/teams', members, memberAccess: members.length ? '仅展示本人当前所在开放队伍中已有可见姓名；跨队伍同名不合并。' : '当前无可展示的成员；未加入、已退出或已结束时不展开名单。' })
  }
  for (const id of new Set(state.joinedOrganizations)) {
    const org = organizations.find(o => o.id === id)
    if (org) put({ ...base, id: `organization:${id}`, sourceId: id, title: org.name, kind: 'organization', relation: 'followed', status: '关注关系 · 正式入会未核验', path: '/v2/campus', memberAccess: '组织入会和授权成员接口未接入；关注不代表正式加入。' })
  }
  for (const id of new Set(state.coffeeBookings)) {
    const slot = coffeeSlots.find(s => s.id === id)
    if (slot) put({ ...base, id: `coffee:${id}`, sourceId: id, title: `与${teachers.find(t => t.id === slot.teacherId)?.name ?? '老师'}交流`, kind: 'coffee', relation: 'booked', status: '预约已确认 · 未核实到场', path: '/v2/me?tab=events', memberAccess: '预约不公开其他预约人的身份。' })
  }
  for (const booking of state.alumni?.bookings ?? []) {
    if (booking.status !== 'confirmed' || booking.student !== studentName) continue
    const slot = state.alumni!.slots.find(s => s.id === booking.slotId)
    const person = state.alumni!.profiles.find(p => p.id === slot?.alumniId)
    if (person) put({ ...base, establishedAt: state.alumni!.history.find(h => h.objectId === booking.id && h.action === '校友交流预约已确认')?.at ?? null, id: `coffee:alumni:${booking.id}`, sourceId: booking.id, title: `与${person.name}交流`, kind: 'coffee', relation: 'booked', status: '校友已确认预约 · 未核实到场', path: '/v2/alumni?view=bookings', memberAccess: '预约不公开其他申请人的身份。' })
  }
  return [...items.values()]
}

function removedStatus(kind: EntityKind) {
  return kind === 'team' ? '已退出或成员资格已移除' : kind === 'organization' ? '已取消关注' : kind === 'coffee' ? '预约已取消或不可用' : '已取消标记或活动不再公开'
}

/** Records only real local state transitions, never retroactively invents timestamps. */
export function trackRelationshipChanges(previous: V2State, next: V2State, now = new Date().toISOString()): V2State {
  const before = new Map(relationshipSnapshot(previous).map(e => [e.id, e]))
  const after = new Map(relationshipSnapshot(next).map(e => [e.id, e]))
  const history = { ...(previous.relationshipHistory ?? {}) }
  let changed = false
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(id), current = after.get(id)
    if (old?.status === current?.status && old?.relation === current?.relation && old?.active === current?.active) continue
    const entity = current ?? { ...old!, status: removedStatus(old!.kind), active: false }
    const { members: _members, memberAccess: _memberAccess, ...safe } = entity
    void _members; void _memberAccess
    const prior = history[id]
    history[id] = { entity: { ...safe, establishedAt: prior ? prior.entity.establishedAt : (old ? old.establishedAt : now) }, changes: [...(prior?.changes ?? []), { at: now, status: entity.status, active: entity.active }] }
    changed = true
  }
  return changed ? { ...next, relationshipHistory: history } : next
}

export function adaptRelationships(state: V2State): RelationshipEntity[] {
  const live = relationshipSnapshot(state)
  const ids = new Set(live.map(e => e.id))
  const current = live.map(e => ({ ...e, establishedAt: state.relationshipHistory?.[e.id]?.entity.establishedAt ?? e.establishedAt }))
  const history = Object.values(state.relationshipHistory ?? {}).filter(h => !ids.has(h.entity.id)).map(h => ({ ...h.entity, active: false, members: [], memberAccess: '历史关系不保留或展示其他成员资料。' }))
  return [...current, ...history]
}

export interface GraphNode { id: string; label: string; kind: EntityKind | 'self' | 'person'; entityId?: string; detail?: string }
export interface GraphEdge { id: string; source: string; target: string; relation: RelationKind | 'shared'; history: boolean }
export function buildRelationshipGraph(entities: RelationshipEntity[], expanded: ReadonlySet<string>, memberLimit = 6) {
  const nodes = new Map<string, GraphNode>([['self', { id: 'self', label: '我', kind: 'self' }]])
  const edges = new Map<string, GraphEdge>()
  // Rendering is bounded independently from total source records.
  for (const entity of entities.slice(0, 8)) {
    nodes.set(entity.id, { id: entity.id, label: entity.title, kind: entity.kind, entityId: entity.id })
    edges.set(`self:${entity.id}`, { id: `self:${entity.id}`, source: 'self', target: entity.id, relation: entity.relation, history: !entity.active })
    if (!expanded.has(entity.id) || !entity.active) continue
    for (const member of entity.members.filter(m => m.canView).slice(0, Math.min(12, Math.max(0, memberLimit)))) {
      nodes.set(member.id, { id: member.id, label: member.name, kind: 'person', entityId: entity.id, detail: member.relation })
      const id = `${entity.id}->${member.id}`
      edges.set(id, { id, source: entity.id, target: member.id, relation: 'shared', history: false })
    }
  }
  return { nodes: [...nodes.values()], edges: [...edges.values()] }
}
