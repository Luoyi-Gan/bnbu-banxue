import type { Workspace } from '../live/api'
import type { StudentScheduleItem } from './studentSchedule'

export function liveStudentSchedule(data: Workspace | null, now = Date.now()): StudentScheduleItem[] {
  if (!data) return []
  const items: StudentScheduleItem[] = [], actor = data.account.id
  for (const e of data.entities) {
    const d = e.data
    if (e.kind === 'activity' && d.status === 'published' && data.relations.some(r => r.entityId === e.id && r.kind === 'participate') && Date.parse(String(d.endAt ?? d.startAt)) > now)
      items.push({id: e.id, kind: 'activity', title: String(d.title), time: '', startAt: String(d.startAt), location: String(d.location), path: `/v2/activities/${e.id}`, label: '已标记参与'})
    if (e.kind === 'room' && d.isMember && d.status === 'open' && d.visibility === 'visible')
      items.push({id: e.id, kind: 'room', title: String(d.title), time: String(d.time || '时间待商定'), location: String(d.place), path: '/v2/partners/teams', label: '我的搭子'})
    if (e.kind === 'coffeeBooking' && e.ownerId === actor && d.status === 'confirmed') {
      const slot = data.entities.find(s => s.kind === 'coffeeSlot' && s.id === d.slotId)
      if (!slot || Date.parse(String(slot.data.endAt)) <= now) continue
      const teacher = data.people.find(p => p.id === d.teacherId)
      items.push({id: e.id, kind: 'coffee', title: `与${teacher?.name ?? '老师'}的 Coffee Chat`, time: '', startAt: String(slot.data.startAt), location: String(slot.data.location), path: '/v2/campus', label: d.proposedSlotId ? 'Coffee Chat · 改期待确认' : 'Coffee Chat'})
    }
  }
  for (const b of data.alumni.bookings) {
    const slot = data.alumni.slots.find(s => s.id === b.slotId), person = data.alumni.profiles.find(p => p.id === slot?.alumniId)
    if (b.status !== 'confirmed' || !slot || !person || (b.student !== actor && person.owner !== actor) || Date.parse(slot.endAt) <= now) continue
    const name = person.owner === actor ? data.people.find(p => p.id === b.student)?.name ?? '同学' : person.name
    items.push({id: b.id, kind: 'coffee', title: `与${name}的 Coffee Chat`, time: '', startAt: slot.startAt, location: slot.location, path: person.owner === actor ? '/v2/alumni?view=manage' : '/v2/alumni?view=bookings', label: '校友 Coffee Chat'})
  }
  return items.sort((a,b) => (a.startAt ? Date.parse(a.startAt) : Infinity) - (b.startAt ? Date.parse(b.startAt) : Infinity))
}
