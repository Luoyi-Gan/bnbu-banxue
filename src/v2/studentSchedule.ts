import { managedSlots, managedTeachers } from './teacherCoffee'
import { alumniData } from './alumniPolicy'
import { events } from '../data/mockData'
import { studentName, type V2State } from './model'

export function availableActivities(state: V2State) {
  return [...events, ...state.localEvents.filter(event => event.status === 'published')]
}

export function setActivityParticipation(state: V2State, id: string, participating: boolean, now = Date.now()): V2State {
  if (state.role !== 'student') return state
  const marked = state.participatingActivities.filter(value => value !== id)
  if (!participating) return { ...state, participatingActivities: marked }
  const event = availableActivities(state).find(item => item.id === id)
  if (!event || Date.parse(event.endAt ?? event.startAt) <= now) return state
  return { ...state, participatingActivities: [...marked, id] }
}

export type StudentScheduleItem = { id: string; kind: 'activity' | 'room' | 'coffee'; title: string; time: string; startAt?: string; location: string; path: string; label: string }

export function studentSchedule(state: V2State, now = Date.now()): StudentScheduleItem[] {
  const items: StudentScheduleItem[] = []
  for (const event of availableActivities(state)) {
    if (!state.participatingActivities.includes(event.id) || Date.parse(event.endAt ?? event.startAt) <= now) continue
    items.push({ id: `activity:${event.id}`, kind: 'activity', title: event.title, time: '', startAt: event.startAt, location: event.location, path: `/v2/activities/${event.id}`, label: '已标记参与' })
  }
  for (const room of state.rooms) {
    if (room.status !== 'open' || !room.members.includes(studentName)) continue
    // Existing room times are free text; keep them verbatim instead of inventing dates.
    items.push({ id: `room:${room.id}`, kind: 'room', title: room.title, time: room.time || '时间待商定', location: room.place, path: '/v2/partners/teams', label: '我的搭子' })
  }
  for (const slot of managedSlots(state)) {
    if (!state.coffeeBookings.includes(slot.id) || Date.parse(slot.endAt) <= now) continue
    const teacher = managedTeachers(state).find(item => item.id === slot.teacherId)
    items.push({ id: `coffee:${slot.id}`, kind: 'coffee', title: `与${teacher?.name ?? '老师'}的 Coffee Chat`, time: '', startAt: slot.startAt, location: slot.location ?? teacher?.location ?? '地点待确认', path: '/v2/me?tab=events', label: 'Coffee Chat' })
  }
  const alumni = alumniData(state)
  for (const booking of alumni.bookings) {
    if (booking.status !== 'confirmed') continue
    const slot = alumni.slots.find(s => s.id === booking.slotId)
    const person = alumni.profiles.find(p => p.id === slot?.alumniId)
    if (!slot || !person || (booking.student !== studentName && person.owner !== studentName) || Date.parse(slot.endAt) <= now) continue
    items.push({ id: `alumni:${booking.id}`, kind: 'coffee', title: `与${person.owner === studentName ? booking.student : person.name}的 Coffee Chat`, time: '', startAt: slot.startAt, location: slot.location, path: '/v2/alumni?view=bookings', label: '校友 Coffee Chat' })
  }
  return items.sort((a, b) => (a.startAt ? Date.parse(a.startAt) : Infinity) - (b.startAt ? Date.parse(b.startAt) : Infinity))
}
