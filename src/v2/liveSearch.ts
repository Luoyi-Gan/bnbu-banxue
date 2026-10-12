import type { Workspace } from '../live/api'
export type SearchResult = { id: string; title: string; meta: string; path: string; keywords?: string; image?: string; kind: 'event' | 'post' | 'room' }
export function liveSearch(data: Workspace | null): SearchResult[] {
  if (!data) return []
  return data.entities.flatMap((entity): SearchResult[] => {
    const d = entity.data, id = encodeURIComponent(entity.id)
    const owner = data.people.find(p => p.id === entity.ownerId)?.name ?? '校园成员'
    if (entity.kind === 'activity' && d.status === 'published') return [{id:entity.id, title:String(d.title ?? ''), meta:'活动 · '+String(d.location ?? ''), keywords:String(d.description ?? ''), path:'/v2/activities/'+id, kind:'event'}]
    if (entity.kind === 'post' && (d.status === 'visible' || d.status === 'pending' && entity.ownerId === data.account.id)) return [{id:entity.id, title:String(d.title ?? ''), meta:'社区 · '+owner, keywords:String(d.body ?? ''), path:'/v2/community?item='+id, kind:'post'}]
    if (entity.kind === 'room' && d.status === 'open' && d.visibility === 'visible') return [{id:entity.id, title:String(d.title ?? ''), meta:'找搭子 · '+String(d.place ?? ''), keywords:String(d.body ?? ''), path:'/v2/partners?item='+id, kind:'room'}]
    return []
  })
}
