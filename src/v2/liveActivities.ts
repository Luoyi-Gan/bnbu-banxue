import type { Workspace } from '../live/api'
import type { ActivityItem } from './activityFilters'

export function liveActivities(data: Workspace | null): ActivityItem[] {
  return (data?.entities ?? []).filter(e => e.kind === 'activity').map(e => {
    const d = e.data, mail = d.source === 'mail'
    const local = {id: e.id, title: String(d.title), description: String(d.description ?? ''), startAt: String(d.startAt), endAt: d.endAt as string | undefined, location: String(d.location), capacity: d.capacity == null ? null : Number(d.capacity), host: String(d.host ?? ''), image: d.image as string | undefined, ownerId: e.ownerId ?? undefined, status: d.status as 'published' | 'draft', registrations: 0, conditions: String(d.conditions ?? ''), mailSourceId: mail ? String(d.mailId ?? e.id) : undefined}
    return {...local, subtitle: mail ? '来自学校邮件' : '校园成员发起的活动', category: mail ? '学校邮件活动' : '校园成员活动', local}
  })
}
