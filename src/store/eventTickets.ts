import type { DemoState, EventTicket, TicketValidationResult } from '../types'

const TICKET_ORIGIN = 'https://campus-demo.bnbu.edu.cn'

export function createTicketPayload(ticket: Pick<EventTicket, 'eventId' | 'code'>) {
  return `${TICKET_ORIGIN}/event-check-in/${encodeURIComponent(ticket.eventId)}?ticket=${encodeURIComponent(ticket.code)}`
}

export function getTicketCode(payload: string) {
  try {
    const url = new URL(payload)
    if (url.origin !== TICKET_ORIGIN || !url.pathname.startsWith('/event-check-in/')) return null
    const code = url.searchParams.get('ticket')
    const eventId = decodeURIComponent(url.pathname.replace('/event-check-in/', ''))
    return code && eventId ? { code, eventId } : null
  } catch {
    return null
  }
}

export function validateEventTicket(state: Pick<DemoState, 'eventTickets'>, eventId: string, payload: string): TicketValidationResult {
  const decoded = getTicketCode(payload)
  if (!decoded) return { code: 'invalid' }
  const ticket = state.eventTickets[decoded.code]
  if (!ticket) return { code: 'invalid' }
  if (decoded.eventId !== eventId || ticket.eventId !== eventId) return { code: 'wrong_event', ticket }
  if (ticket.status === 'void') return { code: 'void', ticket }
  if (ticket.status === 'used') return { code: 'duplicate', ticket }
  return { code: 'valid', ticket }
}

export function makeTicket(eventId: string, attendeeId: string, attendeeName: string, issuedAt = '2026-10-18T09:00:00+08:00'): EventTicket {
  const opaque = `${eventId}-${attendeeId}`
    .split('')
    .reduce((hash, char) => ((hash * 33) ^ char.charCodeAt(0)) >>> 0, 2166136261)
    .toString(36)
    .toUpperCase()
    .padStart(7, '0')
  return {
    code: `BNBU-${opaque}-${attendeeId.slice(-4).toUpperCase()}`,
    eventId,
    attendeeId,
    attendeeName,
    status: 'valid',
    issuedAt,
  }
}
