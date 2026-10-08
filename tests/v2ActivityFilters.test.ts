import { describe, expect, it } from 'vitest'
import { filterActivityItems, type ActivityFilters, type ActivityItem } from '../src/v2/activityFilters'

const now = new Date(2026, 9, 8, 12)
const at = (day: number, hour = 19) => new Date(2026, 9, day, hour).toISOString()
const item = (id: string, day: number, category: string, host: string, attendeeCount: number): ActivityItem => ({
  id, title: id, subtitle: '校园活动', description: '一起参与', category, host,
  startAt: at(day), endAt: at(day, 21), location: 'T2', capacity: 50,
  attendeeCount, registrationMode: 'open',
})
const items = [
  item('today', 8, 'Workshop', 'AI Club', 10),
  item('tomorrow', 9, '运动', 'Running Club', 40),
  item('next-week', 13, '运动', 'Running Club', 20),
  item('past', 6, '英语', 'English Club', 30),
]
const defaults: ActivityFilters = { query: '', category: '全部', period: '全部时间', host: '全部主办方', status: '全部状态', sort: '推荐顺序' }
const ids = (filters: Partial<ActivityFilters>, registrations = {}) => filterActivityItems(items, { ...defaults, ...filters }, registrations, now).map((event) => event.id)

describe('V2 student activity filters', () => {
  it('finds hosts and combines category with calendar weeks', () => {
    expect(ids({ query: 'Running Club', category: '运动', period: '本周' })).toEqual(['tomorrow'])
    expect(ids({ category: '运动', period: '下周' })).toEqual(['next-week'])
  })

  it('separates available events from registrations and restores results when a condition clears', () => {
    expect(ids({ status: '可参与', period: '今天' }, { today: 'going' as const })).toEqual([])
    expect(ids({ status: '全部状态', period: '今天' }, { today: 'going' as const })).toEqual(['today'])
    expect(ids({ status: '已报名' }, { today: 'going' as const })).toEqual(['today'])
  })

  it('sorts upcoming events first by time and by popularity', () => {
    expect(ids({ sort: '时间最近' })).toEqual(['today', 'tomorrow', 'next-week', 'past'])
    expect(ids({ sort: '热度最高' })).toEqual(['tomorrow', 'past', 'next-week', 'today'])
  })
})
