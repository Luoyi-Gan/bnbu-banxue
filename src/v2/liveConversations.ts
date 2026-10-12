import type { Workspace } from '../live/api'

export function liveConversations(data: Workspace | null) {
  if (!data) return []
  const read = new Set(data.relations.filter(r => r.kind === 'message.read').map(r => r.entityId))
  return data.entities.filter(e => e.kind === 'room' && e.data.isMember && e.data.status === 'open' && e.data.visibility === 'visible').map(room => {
    const messages = data.entities.filter(e => e.kind === 'message' && e.data.roomId === room.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).map(e => ({
      id: e.id, from: data.people.find(p => p.id === e.ownerId)?.name ?? '用户', mine: e.ownerId === data.account.id,
      body: String(e.data.body ?? ''), time: new Date(e.createdAt).toLocaleString('zh-CN'), unread: e.ownerId !== data.account.id && !read.has(e.id),
    }))
    return {id: room.id, title: String(room.data.title ?? ''), messages, unread: messages.filter(m => m.unread).length}
  })
}
export type LiveConversation = ReturnType<typeof liveConversations>[number]
