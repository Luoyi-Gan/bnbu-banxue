import { events, hosts } from '../data/mockData'
import { recommendationPhoto } from '../data/recommendationPhoto'
import { studentName, type LocalEvent, type V2State } from './model'
import type { ActivityItem } from './activityFilters'

export const seededActivities: ActivityItem[] = events.map((event) => ({ id: event.id, title: event.title, subtitle: event.subtitle, description: event.description, category: event.category, startAt: event.startAt, endAt: event.endAt, location: event.location, capacity: event.capacity, host: hosts.find((host) => host.id === event.hostId)?.name ?? 'BNBU', image: recommendationPhoto(event) }))

export function activityCatalog(localEvents: LocalEvent[]): ActivityItem[] {
  return [...localEvents.map((event): ActivityItem => ({ id: event.id, title: event.title, subtitle: event.mailSourceId ? '来自学校邮件' : '校园成员发起的活动', description: event.description, category: event.mailSourceId ? '学校邮件活动' : '校园成员活动', image: event.image, endAt: event.endAt, startAt: event.startAt, location: event.location, capacity: event.capacity, host: event.host ?? studentName, local: event })), ...seededActivities]
}

export function savedActivityItems(state: V2State) {
  return activityCatalog(state.localEvents).filter(item => item.local?.status !== 'draft' && state.savedActivities?.includes(item.id))
}
