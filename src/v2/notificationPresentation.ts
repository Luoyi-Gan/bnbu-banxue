import type { Workspace } from '../live/api'

export type Notice = Workspace['notifications'][number]
export const noticeCategories = ['全部', '活动', '交流', '社区', '系统'] as const
export function noticeCategory(event: string): typeof noticeCategories[number] {
  if (event.startsWith('activity.')) return '活动'
  if (/^(coffee|alumni\.booking|alumni\.slot|room)\./.test(event)) return '交流'
  if (/^(post|comment|community)\./.test(event)) return '社区'
  return '系统'
}

/** Resolve only known object relationships; never send a notice to an unrelated landing page. */
export function noticeDestination(notice: Notice, data: Workspace | null): { path: string; label: string } | null {
  if (!notice.entityId || !data) return null
  const id = notice.entityId
  const entity = data.entities.find(item => item.id === id)
  if (entity?.kind === 'activity' && entity.data.status === 'published') return {path:`/v2/activities/${encodeURIComponent(id)}`,label:'查看活动'}
  if (entity?.kind === 'coffeeBooking') return {path:`/v2/coffee?teacher=${encodeURIComponent(String(entity.data.teacherId))}&slot=${encodeURIComponent(String(entity.data.slotId))}`,label:'查看预约'}
  if (entity?.kind === 'room' && entity.data.isMember) return {path:`/v2/partners/teams?item=${encodeURIComponent(id)}`,label:'查看队伍'}
  if (entity?.kind === 'roomApplication') {
    const room = data.entities.find(item => item.id === entity.data.roomId && item.kind === 'room' && item.data.isMember)
    if (room) return {path:`/v2/partners/teams?item=${encodeURIComponent(room.id)}`,label:'查看队伍申请'}
  }
  if (/^(post|community\.post)\./.test(notice.event) && !/(hidden|delete|removed|rejected)/.test(notice.event)) return {path:`/v2/community?item=${encodeURIComponent(id)}`,label:'查看帖子'}
  if (entity?.kind === 'comment' && typeof entity.data.postId === 'string') return {path:`/v2/community?item=${encodeURIComponent(entity.data.postId)}`,label:'查看评论所在帖子'}
  return null
}
