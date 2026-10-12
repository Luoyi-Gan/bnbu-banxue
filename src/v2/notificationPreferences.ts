import type { Workspace } from '../live/api'
export function notificationPreferences(data: Workspace | null) {
  const preferences = data?.entities.find(e => e.kind === 'preferences' && e.ownerId === data.account.id)?.data
  return {messages: preferences?.messages !== false, teams: preferences?.teams !== false}
}
export function showNoticeBadge(data: Workspace | null, notice: Workspace['notifications'][number]) {
  const preferences = notificationPreferences(data)
  return !notice.readAt && (notice.event.startsWith('room.') ? preferences.teams : preferences.messages)
}
