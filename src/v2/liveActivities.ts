import type { Workspace } from '../live/api'
import type { ActivityItem } from './activityFilters'
import campusPhoto from '../assets/campus/home-background.jpg'

export function liveActivities(data: Workspace | null): ActivityItem[] {
  return (data?.entities ?? []).filter(e => e.kind === 'activity').map(e => {
    const d = e.data, mail = d.source === 'mail'
    const local = {id: e.id, title: String(d.title), description: String(d.description ?? ''), startAt: String(d.startAt), endAt: d.endAt as string | undefined, location: String(d.location), capacity: d.capacity == null ? null : Number(d.capacity), host: String(d.host ?? ''), image: d.image as string | undefined, ownerId: e.ownerId ?? undefined, status: d.status as 'published' | 'draft', registrations: 0, conditions: String(d.conditions ?? ''), mailSourceId: mail ? String(d.mailId ?? e.id) : undefined}
    // Older coverless mail records already store this placeholder URL. Keep the
    // record intact and display the same campus-photo fallback as new records.
    const isDefaultCover = typeof d.image !== 'string' || !d.image.trim() || d.image === '/activity-default-cover.svg'
    return {...local, image: isDefaultCover ? campusPhoto : d.image as string, isDefaultCover, subtitle: mail ? '来自学校邮件' : '校园成员发起的活动', category: mail ? '学校邮件活动' : '校园成员活动', local}
  })
}
