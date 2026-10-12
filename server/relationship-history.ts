import type {Database} from './database'
import type {Entity} from './repository'
import type {RelationshipHistory} from '../src/v2/relationshipAdapter'

/** Returns only this account's own relationship actions; never historic private content. */
export function relationshipHistory(db: Database, actorId: string, visible: Entity[]): RelationshipHistory[] {
  const rows = db.prepare("SELECT entity_id AS entityId, data, created_at AS at FROM audit WHERE actor_id=? AND action='relation.set' ORDER BY created_at,rowid").all(actorId) as unknown as {entityId:string;data:string;at:string}[]
  const grouped = new Map<string, RelationshipHistory>()
  for (const row of rows) {
    const payload = JSON.parse(row.data) as {relation?:{kind?:string;enabled?:boolean}}
    const relation = payload.relation
    if (!relation || !['participate','follow'].includes(relation.kind ?? '') || typeof relation.enabled !== 'boolean') continue
    const source = visible.find(e=>e.id===row.entityId)
    const activity = relation.kind === 'participate'
    if (source && source.kind !== (activity ? 'activity' : 'organization')) continue
    const isPublic = source && (activity ? source.data.status === 'published' : source.data.status === 'approved' && source.data.visibility !== 'hidden')
    const id = (activity ? 'activity:' : 'organization:') + row.entityId
    const status = relation.enabled ? (activity ? '已标记参与 · 非到场记录' : '已关注 · 非正式入会') : (activity ? '已取消参与标记' : '已取消关注')
    let entry = grouped.get(id)
    if (!entry) {
      entry = {entity:{id,sourceId:row.entityId,title:isPublic ? String(source.data[activity ? 'title' : 'name']) : '原对象当前不可见',kind:activity ? 'activity' : 'organization',relation:activity ? 'marked' : 'followed',status,active:relation.enabled && !!isPublic,path:isPublic ? (activity ? '/v2/activities/' + row.entityId : '/v2/campus') : '/v2/me',establishedAt:relation.enabled ? row.at : null},changes:[]}
      grouped.set(id,entry)
    }
    if (entry.changes.at(-1)?.active === relation.enabled) continue
    entry.changes.push({at:row.at,status,active:relation.enabled})
    entry.entity.status = isPublic ? status : '原对象当前不可见'
    entry.entity.active = relation.enabled && !!isPublic
    if (relation.enabled && !entry.entity.establishedAt) entry.entity.establishedAt = row.at
  }
  const teamRows = db.prepare("SELECT action,data,created_at AS at FROM audit WHERE action IN ('room.create','room.decide','room.finish','room.moderate') ORDER BY created_at,rowid").all() as unknown as {action:string;data:string;at:string}[]
  const membership = new Map<string, boolean>()
  for (const row of teamRows) {
    const saved = (JSON.parse(row.data) as {teamResult?:Entity}).teamResult
    if (!saved?.data) continue
    let roomId: string, joined: boolean, status: string, active: boolean
    if (row.action === 'room.decide') {
      if (saved.ownerId !== actorId || saved.data.status !== 'approved' || typeof saved.data.roomId !== 'string') continue
      roomId = saved.data.roomId; joined = true; active = true; status = '入队申请已通过'
    } else {
      roomId = saved.id
      joined = Array.isArray(saved.data.members) && saved.data.members.includes(actorId)
      if (!joined && !membership.get(roomId)) continue
      active = joined && saved.data.status === 'open' && saved.data.visibility === 'visible'
      status = !joined ? '已被移出队伍' : saved.data.status === 'finished' ? '队伍已结束' : saved.data.visibility !== 'visible' ? '队伍已下架' : '已加入队伍'
    }
    membership.set(roomId, joined)
    const id = 'team:' + roomId, current = visible.find(e=>e.id===roomId && e.kind==='room')
    const isPublic = current?.data.visibility === 'visible'
    let entry = grouped.get(id)
    if (!entry) {
      entry = {entity:{id,sourceId:roomId,title:isPublic ? String(current.data.title) : '原队伍当前不可见',kind:'team',relation:'joined',status,active,path:'/v2/partners/teams',establishedAt:row.action==='room.create'||row.action==='room.decide' ? row.at : null},changes:[]}
      grouped.set(id,entry)
    }
    if (entry.changes.at(-1)?.status !== status) entry.changes.push({at:row.at,status,active})
    entry.entity.active = active && !!isPublic
    entry.entity.status = status
  }
  return [...grouped.values()]
}
