import type { LocalEvent, V2State } from './model'

export type ActivityItem = {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  startAt: string
  endAt?: string
  location: string
  capacity: number | null
  attendeeCount: number
  registrationMode: 'open' | 'approval'
  host: string
  image?: string
  local?: LocalEvent
}

export type ActivityPeriod = '全部时间' | '今天' | '本周' | '下周'
export type ActivityStatus = '全部状态' | '可参与' | '已报名' | '我主办'
export type ActivitySort = '推荐顺序' | '时间最近' | '热度最高'

export type ActivityFilters = {
  query: string
  category: string
  period: ActivityPeriod
  host: string
  status: ActivityStatus
  sort: ActivitySort
}

export function filterActivityItems(items: ActivityItem[], filters: ActivityFilters, registrations: V2State['eventRegistrations'], now = new Date()): ActivityItem[] {
  const needle = filters.query.trim().toLocaleLowerCase()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - (today.getDay() + 6) % 7)
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(weekStart.getDate() + 7)
  const weekAfterNext = new Date(nextWeekStart)
  weekAfterNext.setDate(nextWeekStart.getDate() + 7)

  const filtered = items.filter((item) => {
    if (item.local?.status === 'draft') return false
    if (needle && !`${item.title} ${item.subtitle} ${item.description} ${item.location} ${item.category} ${item.host}`.toLocaleLowerCase().includes(needle)) return false
    if (filters.category !== '全部' && filters.category !== item.category) return false
    if (filters.host !== '全部主办方' && filters.host !== item.host) return false
    const start = new Date(item.startAt)
    if (filters.period === '今天' && start.toDateString() !== today.toDateString()) return false
    if (filters.period === '本周' && (start < weekStart || start >= nextWeekStart)) return false
    if (filters.period === '下周' && (start < nextWeekStart || start >= weekAfterNext)) return false
    if (filters.status === '可参与' && (item.local || registrations[item.id] || Date.parse(item.endAt ?? item.startAt) <= now.getTime())) return false
    if (filters.status === '已报名' && !registrations[item.id]) return false
    if (filters.status === '我主办' && !item.local) return false
    return true
  })

  if (filters.sort === '热度最高') return filtered.sort((a, b) => b.attendeeCount - a.attendeeCount)
  if (filters.sort === '时间最近') return filtered.sort((a, b) => {
    const aUpcoming = Date.parse(a.endAt ?? a.startAt) >= now.getTime()
    const bUpcoming = Date.parse(b.endAt ?? b.startAt) >= now.getTime()
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
    return aUpcoming ? Date.parse(a.startAt) - Date.parse(b.startAt) : Date.parse(b.startAt) - Date.parse(a.startAt)
  })
  return filtered
}
