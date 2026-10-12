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
  return [...grouped.values()]
}
