import type { Workspace } from '../live/api'
import type { StudentScheduleItem } from './studentSchedule'
import {timetableSchedule} from './timetableSchedule'
import {schedulePreferences,scheduleCourseKey} from '../../shared/v2/schedulePreferences'
import {personalOccurrences,type PersonalLearningItem} from '../../shared/v2/learning'
import {dailyDeadlineSelected} from '../../shared/v2/dailyCourseSelection'

export function liveStudentSchedule(data: Workspace | null, now = Date.now()): StudentScheduleItem[] {
  if (!data) return []
  const items: StudentScheduleItem[] = [], actor = data.account.id
  for (const e of data.entities) {
    const d = e.data
    if (e.kind === 'activity' && d.status === 'published' && d.visibility !== 'hidden' && (e.ownerId === actor || data.relations.some(r => r.entityId === e.id && r.kind === 'participate')) && Date.parse(String(d.endAt ?? d.startAt)) > now)
      items.push({id: e.id, kind: 'activity', title: String(d.title), time: '', startAt: String(d.startAt), endAt: typeof d.endAt==='string'?d.endAt:undefined, location: String(d.location), path: `/v2/activities/${e.id}`, label: e.ownerId===actor?'我主办的活动':'已标记参与'})
    if (e.kind === 'room' && d.isMember && d.status === 'open' && d.visibility === 'visible')
      items.push({id: e.id, kind: 'room', title: String(d.title), time: String(d.time || '时间待商定'), location: String(d.place), path: `/v2/partners/teams?item=${encodeURIComponent(e.id)}`, label: '我的搭子'})
    if (e.kind === 'coffeeBooking' && e.ownerId === actor && d.status === 'confirmed') {
      const slot = data.entities.find(s => s.kind === 'coffeeSlot' && s.id === d.slotId)
      if (!slot || Date.parse(String(slot.data.endAt)) <= now) continue
      const teacher = data.people.find(p => p.id === d.teacherId)
      items.push({id: e.id, kind: 'coffee', title: `与${teacher?.name ?? '老师'}的 Coffee Chat`, time: '', startAt: String(slot.data.startAt), endAt:String(slot.data.endAt), location: String(slot.data.location), path: `/v2/coffee?teacher=${encodeURIComponent(String(d.teacherId))}&slot=${encodeURIComponent(String(d.slotId))}`, label: d.proposedSlotId ? 'Coffee Chat · 改期待确认' : 'Coffee Chat'})
    }
  }
  for (const b of data.alumni.bookings) {
    const slot = data.alumni.slots.find(s => s.id === b.slotId), person = data.alumni.profiles.find(p => p.id === slot?.alumniId)
    if (b.status !== 'confirmed' || !slot || !person || (b.student !== actor && person.owner !== actor) || Date.parse(slot.endAt) <= now) continue
    const name = person.owner === actor ? data.people.find(p => p.id === b.student)?.name ?? '同学' : person.name
    items.push({id: b.id, kind: 'coffee', title: `与${name}的 Coffee Chat`, time: '', startAt: slot.startAt, endAt:slot.endAt, location: slot.location, path: person.owner === actor ? '/v2/alumni?view=manage' : '/v2/alumni?view=bookings', label: '校友 Coffee Chat'})
  }
  const timetable=data.entities.find(e=>e.kind==='timetable'&&e.ownerId===actor)
  const preferences=schedulePreferences(data.entities.find(e=>e.kind==='preferences'&&e.ownerId===actor)?.data)
  const learning=data.entities.filter(e=>e.kind==='learningItem'&&e.ownerId===actor&&e.data.type==='deadline'&&dailyDeadlineSelected(e.data,timetable?.data.lessons,preferences.hiddenDailyCourses)).map(e=>({...e.data,id:e.id,version:e.version}) as unknown as PersonalLearningItem)
  items.push(...personalOccurrences(learning,now).map(item=>({...item,learningType:learning.find(source=>source.id===item.id||item.id.startsWith(source.id+':'))?.type,kind:'course' as const,time:'',path:'/v2'})))
  items.push(...timetableSchedule(timetable?.data.lessons,now,preferences.semesterStartDate,371,preferences.academicCalendar).filter(item=>!preferences.hiddenDailyCourses.includes(scheduleCourseKey(item.title))))
  return items.filter(item=>!item.startAt||Number.isFinite(Date.parse(item.startAt))).sort((a,b) => (a.startAt ? Date.parse(a.startAt) : Infinity) - (b.startAt ? Date.parse(b.startAt) : Infinity)||a.id.localeCompare(b.id))
}
