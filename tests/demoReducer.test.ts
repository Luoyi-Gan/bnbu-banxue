import { describe, expect, it } from 'vitest'
import { coffeeSlots, events, organizations, teachers } from '../src/data/mockData'
import { createInitialState, demoReducer, deriveGraph, getCheckInSummary } from '../src/store/demoReducer'
import type { Event } from '../src/types'

const event = (id: string) => events.find((item) => item.id === id)!

describe('BNBU Campus Hub unified Demo State', () => {
  it('registers an open event and derives its graph edge', () => {
    const initial = createInitialState('new')
    const state = demoReducer(initial, { type: 'REGISTER_EVENT', event: event('ai-agent-workshop') })
    expect(state.registrations['ai-agent-workshop']).toBe('going')
    expect(state.attendeeDeltas['ai-agent-workshop']).toBe(1)
    expect(state.notifications[0].titleMessage).toMatchObject({ key: 'notification.registration.going.title' })
    expect(Object.values(state.eventTickets).some((ticket) => ticket.eventId === 'ai-agent-workshop' && ticket.status === 'valid')).toBe(true)
    expect(deriveGraph(state).edges.some((edge) => edge.target === 'event-ai-agent-workshop' && edge.type === 'registered')).toBe(true)
  })

  it('routes approval events to pending', () => {
    const state = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('startup-meetup') })
    expect(state.registrations['startup-meetup']).toBe('pending')
    expect(Object.values(state.eventTickets).some((ticket) => ticket.eventId === 'startup-meetup')).toBe(false)
  })

  it('routes full events to waitlist', () => {
    const state = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('badminton-night') })
    expect(state.registrations['badminton-night']).toBe('waitlist')
    expect(Object.values(state.eventTickets).some((ticket) => ticket.eventId === 'badminton-night')).toBe(false)
  })

  it('upgrades registration to participated after check-in', () => {
    const registered = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('campus-night-run') })
    const checkedIn = demoReducer(registered, { type: 'CHECK_IN', event: event('campus-night-run') })
    expect(checkedIn.registrations['campus-night-run']).toBe('checked_in')
    expect(checkedIn.journey[0].titleMessage).toMatchObject({ key: 'journey.ticket.checkedIn.title' })
    expect(deriveGraph(checkedIn).edges.some((edge) => edge.type === 'participated')).toBe(true)
  })

  it('books Coffee Chat and adds a teacher relationship', () => {
    const slot = coffeeSlots.find((item) => item.id === 'slot-zhang-1530')!
    const teacher = teachers.find((item) => item.id === 'prof-zhang')!
    const state = demoReducer(createInitialState('new'), { type: 'BOOK_COFFEE', slot, topic: 'Marketing Career Planning', teacher })
    expect(state.coffeeBookings[slot.id].status).toBe('confirmed')
    expect(deriveGraph(state).edges.some((edge) => edge.type === 'coffee_chat')).toBe(true)
  })

  it('joins an organization and derives member_of', () => {
    const organization = organizations.find((item) => item.id === 'org-badminton')!
    const state = demoReducer(createInitialState('new'), { type: 'TOGGLE_MEMBERSHIP', organization })
    expect(state.memberships).toContain(organization.id)
    expect(deriveGraph(state).edges.some((edge) => edge.type === 'member_of')).toBe(true)
  })

  it('creates an event with a functional pending guest review', () => {
    const created: Event = { ...event('marketing-case-night'), id: 'created-marketing-case', slug: 'created-marketing-case' }
    const state = demoReducer(createInitialState('active'), { type: 'CREATE_EVENT', event: created })
    const pending = state.guestStatuses[created.id].find((guest) => guest.status === 'pending')!
    const approved = demoReducer(state, { type: 'UPDATE_GUEST', eventId: created.id, guestId: pending.id, status: 'going' })
    expect(approved.createdEvents).toContainEqual(created)
    expect(approved.guestStatuses[created.id].find((guest) => guest.id === pending.id)?.status).toBe('going')
    expect(deriveGraph(approved).edges.some((edge) => edge.type === 'hosts')).toBe(true)
  })

  it('reset restores the default active scenario', () => {
    const newStudent = createInitialState('new')
    const reset = demoReducer(newStudent, { type: 'RESET' })
    expect(reset.scenario).toBe('active')
    expect(reset.memberships).toContain('org-ai')
    expect(reset.notifications.length).toBeGreaterThanOrEqual(12)
  })

  it('starts and completes a sports check-in while updating the progress source', () => {
    const initial = createInitialState('active')
    const started = demoReducer(initial, { type: 'START_CHECK_IN', activity: 'Morning Campus Run', kind: 'other', location: 'BNBU Sports Field' })
    expect(started.activeCheckInId).toBeTruthy()
    expect(started.checkInRecords[0].status).toBe('in_progress')
    const completed = demoReducer(started, { type: 'COMPLETE_CHECK_IN', recordId: started.activeCheckInId!, durationMinutes: 45 })
    expect(completed.activeCheckInId).toBeNull()
    expect(completed.checkInRecords[0]).toMatchObject({ status: 'completed', durationMinutes: 45 })
    expect(getCheckInSummary(completed).totalMinutes).toBe(getCheckInSummary(initial).totalMinutes + 45)
  })

  it('keeps the default sports breakdown at sixteen hours', () => {
    const summary = getCheckInSummary(createInitialState('active'))
    expect(summary.courseMinutes).toBe(360)
    expect(summary.otherMinutes).toBe(600)
    expect(summary.totalHours).toBe(16)
  })
})
