import { describe, expect, it } from 'vitest'
import type { ActivityItem } from '../src/v2/activityFilters'
import { campusActivitySchedule } from '../src/v2/campusActivitySchedule'

const now = Date.parse('2026-10-20T12:00:00+08:00')
function activity(id: string, start: number, end: number | null, location = '体育馆'): ActivityItem {
  return { id, title: id, startAt: new Date(now + start).toISOString(), endAt: end === null ? undefined : new Date(now + end).toISOString(), location, capacity: null, host: '', subtitle: '', description: '', category: '学校活动', local: { status: 'published' } as ActivityItem['local'] }
}
const schedule = (items: ActivityItem[], time = now) => campusActivitySchedule(items, 'way/664082915', time)

describe('campus building activity schedule', () => {
  it('uses inclusive start and exclusive end boundaries and refreshes groups as time passes', () => {
    const items = [activity('ended', -1000, 0), activity('ongoing', 0, 1000), activity('future', 1000, 2000)]
    expect(schedule(items).ongoing.map(e => e.id)).toEqual(['ongoing'])
    expect(schedule(items).upcoming.map(e => e.id)).toEqual(['future'])
    expect(schedule(items, now + 1000).ongoing.map(e => e.id)).toEqual(['future'])
    expect(schedule(items, now + 2000)).toEqual({ ongoing: [], upcoming: [] })
  })
  it('only shows published activities reliably associated with the chosen building', () => {
    const draft = activity('draft', -1000, 1000)
    draft.local!.status = 'draft'
    expect(schedule([draft, activity('elsewhere', 1000, 2000, 'T1 厚德楼'), activity('ambiguous', 1000, 2000, '学习资源中心')])).toEqual({ ongoing: [], upcoming: [] })
    expect(campusActivitySchedule([activity('x', 1000, 2000)], null, now)).toEqual({ ongoing: [], upcoming: [] })
  })
  it('keeps unknown end times from implying an activity is ongoing and rejects invalid times', () => {
    const invalid = activity('invalid', 1000, 2000)
    invalid.startAt = 'unknown'
    const invalidEnd = activity('bad-end', -1000, 1000)
    invalidEnd.endAt = 'unknown'
    const result = schedule([activity('unknown-end', -1000, null), activity('future-no-end', 1000, null), activity('reversed', 2000, 1000), invalid, invalidEnd])
    expect(result.ongoing).toEqual([])
    expect(result.upcoming.map(e => e.id)).toEqual(['future-no-end'])
  })
  it('orders upcoming activities chronologically with stable ties', () => {
    expect(schedule([activity('later', 2000, 3000), activity('b', 1000, 2000), activity('a', 1000, 2000)]).upcoming.map(e => e.id)).toEqual(['a', 'b', 'later'])
  })
})
