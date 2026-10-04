import { describe, expect, it } from 'vitest'
import { currentUser, events } from '../src/data/mockData'
import { createInitialState, demoReducer, deriveGraph } from '../src/store/demoReducer'
import { createTicketPayload, makeTicket, validateEventTicket } from '../src/store/eventTickets'

const event = (id: string) => events.find((item) => item.id === id)!

describe('event QR tickets', () => {
  it('creates a parseable payload with no personal data', () => {
    const ticket = makeTicket('campus-night-run', currentUser.id, currentUser.name)
    const payload = createTicketPayload(ticket)
    expect(payload).toContain('/event-check-in/campus-night-run?ticket=')
    expect(payload).not.toContain(currentUser.name)
    expect(payload).not.toContain(currentUser.studentNumber)
  })

  it('invalidates a ticket when registration is cancelled', () => {
    const registered = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('campus-night-run') })
    const ticket = Object.values(registered.eventTickets)[0]
    const cancelled = demoReducer(registered, { type: 'CANCEL_REGISTRATION', event: event('campus-night-run') })
    expect(cancelled.eventTickets[ticket.code].status).toBe('void')
    expect(validateEventTicket(cancelled, 'campus-night-run', createTicketPayload(ticket)).code).toBe('void')
  })

  it('checks in a valid ticket and links registration, journey, graph, and ticket state', () => {
    const registered = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('campus-night-run') })
    const ticket = Object.values(registered.eventTickets)[0]
    const checkedIn = demoReducer(registered, { type: 'CHECK_IN_TICKET', event: event('campus-night-run'), payload: createTicketPayload(ticket), mode: 'standard', scannedAt: '2026-10-18T19:02:00+08:00' })
    expect(checkedIn.registrations['campus-night-run']).toBe('checked_in')
    expect(checkedIn.eventTickets[ticket.code]).toMatchObject({ status: 'used', usedAt: '2026-10-18T19:02:00+08:00' })
    expect(checkedIn.notifications[0].titleMessage?.key).toBe('notification.ticket.checkedIn.title')
    expect(checkedIn.journey[0].titleMessage?.key).toBe('journey.ticket.checkedIn.title')
    expect(deriveGraph(checkedIn).edges.some((edge) => edge.type === 'participated')).toBe(true)
  })

  it('supports Express mode and records duplicate scans without a second journey entry', () => {
    const registered = demoReducer(createInitialState('new'), { type: 'REGISTER_EVENT', event: event('campus-night-run') })
    const ticket = Object.values(registered.eventTickets)[0]
    const payload = createTicketPayload(ticket)
    const first = demoReducer(registered, { type: 'CHECK_IN_TICKET', event: event('campus-night-run'), payload, mode: 'express' })
    const journeyCount = first.journey.length
    const duplicate = demoReducer(first, { type: 'CHECK_IN_TICKET', event: event('campus-night-run'), payload, mode: 'express' })
    expect(duplicate.eventScanRecords[0]).toMatchObject({ result: 'duplicate', mode: 'express' })
    expect(duplicate.journey).toHaveLength(journeyCount)
  })

  it('distinguishes invalid, wrong-event, and void tickets', () => {
    const state = createInitialState('active')
    const nightRun = Object.values(state.eventTickets).find((ticket) => ticket.eventId === 'campus-night-run')!
    expect(validateEventTicket(state, 'campus-night-run', 'not-a-url').code).toBe('invalid')
    expect(validateEventTicket(state, 'english-corner', createTicketPayload(nightRun)).code).toBe('wrong_event')
    const voidTicket = { ...makeTicket('campus-night-run', 'guest-void', 'Demo Guest'), status: 'void' as const }
    const withVoid = { ...state, eventTickets: { ...state.eventTickets, [voidTicket.code]: voidTicket } }
    expect(validateEventTicket(withVoid, 'campus-night-run', createTicketPayload(voidTicket)).code).toBe('void')
  })

  it('issues a guest ticket on approval and uses it during host check-in', () => {
    const organizer = createInitialState('organizer')
    const eventId = 'organizer-campus-mixer'
    const pending = organizer.guestStatuses[eventId].find((guest) => guest.status === 'pending')!
    const approved = demoReducer(organizer, { type: 'UPDATE_GUEST', eventId, guestId: pending.id, status: 'going' })
    const ticket = Object.values(approved.eventTickets).find((item) => item.eventId === eventId && item.attendeeId === pending.id)!
    const checkedIn = demoReducer(approved, { type: 'CHECK_IN_TICKET', event: approved.createdEvents[0], payload: createTicketPayload(ticket), mode: 'standard' })
    expect(checkedIn.guestStatuses[eventId].find((guest) => guest.id === pending.id)?.status).toBe('checked_in')
    expect(checkedIn.eventTickets[ticket.code].status).toBe('used')
  })
})

