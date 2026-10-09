import { describe, expect, it } from 'vitest'
import { filterActivityItems, type ActivityFilters, type ActivityItem } from '../src/v2/activityFilters'

const now = new Date(2026, 9, 8, 12)
const at = (day: number, hour = 19) => new Date(2026, 9, day, hour).toISOString()
const item = (id: string, day: number, category: string, host: string): ActivityItem => ({
  id, title: id, subtitle: '校园活动', description: '一起参与', category, host,
  startAt: at(day), endAt: at(day, 21), location: 'T2', capacity: 50,
})
const items = [
  item('today', 8, 'Workshop', 'AI Club'),
  item('tomorrow', 9, '运动', 'Running Club'),
  item('next-week', 13, '运动', 'Running Club'),
  item('past', 6, '英语', 'English Club'),
]
const defaults: ActivityFilters = { query: '', category: '全部', period: '全部时间', host: '全部主办方', status: '全部状态', sort: '推荐顺序' }
const ids = (filters: Partial<ActivityFilters>, actorId = 'student-demo') => filterActivityItems(items, { ...defaults, ...filters }, actorId, now).map((event) => event.id)

describe('V2 student activity filters', () => {
  it('finds hosts and combines category with calendar weeks', () => {
    expect(ids({ query: 'Running Club', category: '运动', period: '本周' })).toEqual(['tomorrow'])
    expect(ids({ category: '运动', period: '下周' })).toEqual(['next-week'])
  })

  it('filters upcoming activities without registration state', () => {
    expect(ids({ status: '未结束', period: '今天' })).toEqual(['today'])
    expect(ids({ status: '未结束' })).toEqual(['today', 'tomorrow', 'next-week'])
    expect(ids({ status: '我主办' })).toEqual([])
  })

  it('sorts upcoming events first by time', () => {
    expect(ids({ sort: '时间最近' })).toEqual(['today', 'tomorrow', 'next-week', 'past'])
  })
})
