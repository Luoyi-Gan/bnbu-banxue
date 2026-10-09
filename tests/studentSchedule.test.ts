import { describe, expect, it } from 'vitest'
import { initialV2State, studentName } from '../src/v2/model'
import { setActivityParticipation, studentSchedule } from '../src/v2/studentSchedule'

const now = Date.parse('2026-10-09T10:00:00+08:00')
const fixture = () => structuredClone(initialV2State)

describe('student participation and personal schedule', () => {
  it('marks idempotently and cancels without registration or capacity changes', () => {
    const initial = fixture()
    const marked = setActivityParticipation(initial, 'ai-agent-workshop', true, now)
    const repeated = setActivityParticipation(marked, 'ai-agent-workshop', true, now)
    expect(repeated.participatingActivities).toEqual(['ai-agent-workshop'])
    expect(repeated.eventRegistrations).toEqual(initial.eventRegistrations)
    expect(initial.participatingActivities).toEqual([])
    expect(studentSchedule(repeated, now).filter(item => item.kind === 'activity')).toHaveLength(1)
    expect(studentSchedule(setActivityParticipation(repeated, 'ai-agent-workshop', false, now), now).filter(item => item.kind === 'activity')).toHaveLength(0)
  })
  it('combines all member rooms, booked coffee and marked events; excludes unjoined and unmarked items', () => {
    const state = fixture()
    state.participatingActivities = ['ai-agent-workshop']
    state.coffeeBookings = ['slot-zhang-1600', 'slot-wang-1600', 'slot-wang-1600']
    const result = studentSchedule(state, now)
    expect(result.filter(item => item.kind === 'room')).toHaveLength(2)
    expect(result.filter(item => item.kind === 'coffee')).toHaveLength(2)
    expect(result.filter(item => item.kind === 'activity')).toHaveLength(1)
    expect(result.some(item => item.id === 'room:room-car')).toBe(false)
    expect(result.slice(0, 3).map(item => item.id)).toEqual(['activity:ai-agent-workshop', 'coffee:slot-wang-1600', 'coffee:slot-zhang-1600'])
  })
  it('removes cancelled coffee, ended teams and lost membership from the schedule', () => {
    const state = fixture()
    state.rooms[1].status = 'finished'
    state.rooms[2].members = state.rooms[2].members.filter(name => name !== studentName)
    expect(studentSchedule(state, now)).toEqual([])
  })
  it('handles locally published, hidden and elapsed activities and rejects other roles', () => {
    const state = fixture()
    state.localEvents = [{ id: 'local', title: 'Local', description: 'test', startAt: '2026-10-10T12:00:00+08:00', location: 'T2', capacity: 2, status: 'published', registrations: 0 }]
    const marked = setActivityParticipation(state, 'local', true, now)
    expect(studentSchedule(marked, now).some(item => item.id === 'activity:local')).toBe(true)
    marked.localEvents[0].status = 'draft'
    expect(studentSchedule(marked, now).some(item => item.kind === 'activity')).toBe(false)
    expect(setActivityParticipation(state, 'missing', true, now)).toBe(state)
    expect(setActivityParticipation({ ...state, role: 'teacher' }, 'ai-agent-workshop', true, now).participatingActivities).toEqual([])
    expect(studentSchedule({ ...state, participatingActivities: ['ai-agent-workshop'], rooms: [] }, Date.parse('2027-01-01'))).toEqual([])
  })
})
