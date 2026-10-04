import { describe, expect, it } from 'vitest'
import { createInitialState } from '../src/store/demoReducer'
import { migrateDemoState } from '../src/store/DemoStore'
import type { DemoState } from '../src/types'

describe('local Demo state migration', () => {
  it('adds event tickets and semantic messages without losing existing activity state', () => {
    const source = createInitialState('active')
    const legacy: Partial<DemoState> = {
      ...source,
      eventTickets: undefined,
      eventScanRecords: undefined,
      registrations: { ...source.registrations, 'ai-agent-workshop': 'going' },
      coffeeBookings: { ...source.coffeeBookings },
      checkInRecords: [...source.checkInRecords],
      memberships: [...source.memberships],
      notifications: [{ id: 'legacy-note', category: 'Events', title: 'Saved event reminder', body: 'Product Design Jam registration closes soon.', time: '3 days ago', read: false, path: '/events/product-design-jam' }],
      journey: [{ id: 'legacy-journey', date: '2026.10', title: '参加 English Corner', detail: 'Topic: stories from home', kind: 'event' }],
    }
    const migrated = migrateDemoState(legacy)
    expect(migrated.checkInRecords).toEqual(source.checkInRecords)
    expect(migrated.memberships).toEqual(source.memberships)
    expect(Object.values(migrated.eventTickets).some((ticket) => ticket.eventId === 'ai-agent-workshop' && ticket.status === 'valid')).toBe(true)
    expect(migrated.notifications[0].title).toBeUndefined()
    expect(migrated.notifications[0].titleMessage?.key).toBe('legacy.localized')
    expect(migrated.journey[0].title).toBeUndefined()
    expect(migrated.journey[0].titleMessage?.key).toBe('legacy.localized')
  })
})
