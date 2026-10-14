import type { Workspace } from '../live/api'
import { displayPerson } from './displayPerson'
import type { RelationshipEntity } from './relationshipAdapter'

export function liveRelationships(data: Workspace | null): RelationshipEntity[] {
  if (!data) return []
  const result: RelationshipEntity[] = [], actor = data.account.id
  const base = {establishedAt: null, members: [], active: true, memberAccess: '此关系不公开其他参与人的身份。'}
  for (const e of data.entities) {
    const d = e.data, relation = (kind: string) => data.relations.some(r => r.entityId === e.id && r.kind === kind)
    if (e.kind === 'activity' && d.status === 'published' && (e.ownerId === actor || relation('participate')))
      result.push({...base, id: 'activity:' + e.id, sourceId: e.id, title: String(d.title), kind: 'activity', relation: e.ownerId === actor ? 'hosted' : 'marked', status: '活动关系 · 未核实出席', path: '/v2/activities/' + e.id})
    if (e.kind === 'room' && (d.isMember || e.ownerId === actor)) {
      const active = d.status === 'open' && d.visibility === 'visible'
      const members = active && d.isMember && Array.isArray(d.members) ? d.members.filter(id => typeof id === 'string' && id !== actor).map(id => ({id: 'person:' + id, name: displayPerson(data, id, '同队成员').name, canView: true, relation: '同队成员 · 不代表好友或共同到场'})) : []
      result.push({...base, id: 'team:' + e.id, sourceId: e.id, title: String(d.title), kind: 'team', relation: 'joined', status: active ? '已加入' : '队伍已结束或停止公开', active, path: '/v2/partners/teams', members, memberAccess: '仅展示本人当前开放队伍中后端允许查看的成员。'})
    }
    if (e.kind === 'organization' && d.status === 'approved' && d.visibility !== 'hidden' && relation('follow'))
      result.push({...base, id: 'organization:' + e.id, sourceId: e.id, title: String(d.name), kind: 'organization', relation: 'followed', status: '已关注 · 不代表正式入会', path: '/v2/campus'})
    if (e.kind === 'coffeeBooking' && e.ownerId === actor)
      result.push({...base, id: 'coffee:' + e.id, sourceId: e.id, title: '与' + (data.people.find(p => p.id === d.teacherId)?.name ?? '老师') + '交流', kind: 'coffee', relation: 'booked', active: d.status === 'confirmed', status: d.status === 'confirmed' ? '预约已确认 · 未核实到场' : '预约已取消', establishedAt: e.createdAt, path: '/v2/me?tab=events'})
  }
  for (const b of data.alumni.bookings) {
    if (!['confirmed', 'cancelled'].includes(b.status)) continue
    const confirmation = data.alumni.history?.find(h => h.objectId === b.id && h.action === '校友交流预约已确认')
    if (b.status === 'cancelled' && !confirmation) continue
    const slot = data.alumni.slots.find(s => s.id === b.slotId), person = data.alumni.profiles.find(p => p.id === slot?.alumniId)
    if (!person || (b.student !== actor && person.owner !== actor)) continue
    const own = person.owner === actor
      result.push({...base, id: 'coffee:alumni:' + b.id, sourceId: b.id, title: '与' + (own ? displayPerson(data, b.student, '同学').name : displayPerson(data, person.owner, person.name).name) + '交流', kind: 'coffee', relation: 'booked', active: b.status === 'confirmed', status: b.status === 'confirmed' ? '校友已确认 · 未核实到场' : '交流申请或预约已取消', path: own ? '/v2/alumni?view=manage' : '/v2/alumni?view=bookings'})
  }
  for (const h of data.relationshipHistory ?? []) {
    if (!result.some(e => e.id === h.entity.id)) result.push({...h.entity, members: [], memberAccess: '历史关系不展示其他成员。'})
  }
  return result.map(item => {
    if (item.kind === 'activity' && item.relation === 'hosted')
      return {...item, establishedAt: data.entities.find(e => e.id === item.sourceId)?.createdAt ?? item.establishedAt}
    if (item.relation === 'marked' || item.relation === 'followed')
      return {...item, establishedAt: data.relations.find(r => r.entityId === item.sourceId && r.kind === (item.relation === 'marked' ? 'participate' : 'follow'))?.createdAt ?? null}
    if (item.id.startsWith('coffee:alumni:'))
      return {...item, establishedAt: data.alumni.history?.find(h => h.objectId === item.sourceId && h.action === '校友交流预约已确认')?.at ?? null}
    return item
  })
}

export function liveRelationshipChanges(data: Workspace | null, id: string) {
  if (!data) return []
  const recorded = data.relationshipHistory?.find(h => h.entity.id === id)
  if (recorded) return recorded.changes
  if (id.startsWith('coffee:alumni:')) {
    const bookingId = id.slice('coffee:alumni:'.length)
    return data.alumni.history.filter(h => h.objectId === bookingId).slice().sort((a,b)=>a.at.localeCompare(b.at)).map(h=>({at:h.at,status:h.action,active:h.action==='校友交流预约已确认'}))
  }
  if (id.startsWith('coffee:')) {
    const booking = data.entities.find(e => e.kind === 'coffeeBooking' && e.id === id.slice('coffee:'.length) && e.ownerId === data.account.id)
    if (!Array.isArray(booking?.data.history)) return []
    return booking.data.history.map((h: {action:string;at:string;accepted?:boolean})=>({at:h.at,status:h.action==='coffee.book' ? '预约已确认' : h.action==='coffee.move' ? '老师提出改期，等待回应' : h.action==='coffee.cancel' ? '预约已取消' : h.accepted===true ? '已接受改期' : h.accepted===false ? '已拒绝改期，保留原预约' : '已回应改期',active:h.action!=='coffee.cancel'}))
  }
  return []
}
