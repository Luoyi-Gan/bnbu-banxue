import { coffeeSlots as seedSlots, teachers } from '../data/mockData'
import { makeId, studentName, type V2State } from './model'
import type { CoffeeSlot } from '../types'

export interface TeacherAccount { id: string; sportsQualified: boolean }
export interface ManagedSlot extends CoffeeSlot { location?: string; closed?: boolean }
export interface ChatBooking { id: string; slotId: string; student: string; topic: string; status: 'confirmed' | 'cancelled'; createdAt: string | null; proposedSlotId?: string; history: { at: string; action: string; reason: string }[] }
export interface TeacherNotice { id: string; teacherId: string; body: string; read: boolean; at: string }
export interface TeacherCoffeeData { slots: ManagedSlot[]; bookings: ChatBooking[]; notices: TeacherNotice[]; profiles: Record<string, { nickname: string; bio: string; topics: string[]; location: string }> }
export const teacherAccount = (state: V2State): TeacherAccount => state.teacherAccount ?? { id: 'prof-zhang', sportsQualified: false }
export const canUseTeacherSports = (state: V2State) => state.role === 'teacher' && teacherAccount(state).sportsQualified
export const managedSlots = (state: V2State): ManagedSlot[] => (state.teacherCoffee?.slots ?? seedSlots).map((s: ManagedSlot) => ({ ...s, location: s.location ?? teachers.find(t => t.id === s.teacherId)?.location }))
export const managedTeachers = (state: V2State) => teachers.map(t => ({ ...t, ...state.teacherCoffee?.profiles[t.id], name: state.teacherCoffee?.profiles[t.id]?.nickname || t.name }))
export function coffeeData(state: V2State): TeacherCoffeeData {
  const data = { ...(state.teacherCoffee ?? { bookings: [], notices: [], profiles: {} }), slots: managedSlots(state) }
  const legacy = state.coffeeBookings.filter(id => !data.bookings.some(b => b.slotId === id && b.student === studentName && b.status === 'confirmed')).map(id => ({ id: `legacy:${id}`, slotId: id, student: studentName, topic: '旧预约未提供交流问题', status: 'confirmed' as const, createdAt: null, history: [] }))
  return { ...data, bookings: [...data.bookings, ...legacy] }
}
const overlap = (a: ManagedSlot, b: { startAt: string; endAt: string }) => Date.parse(a.startAt) < Date.parse(b.endAt) && Date.parse(b.startAt) < Date.parse(a.endAt)
const requireRule: (condition: unknown, message: string) => asserts condition = (condition, message) => { if (!condition) throw new Error(message) }
export function occupied(state: V2State, slotId: string) {
  const data = coffeeData(state)
  const known = data.bookings.filter(b => b.status === 'confirmed' && (b.slotId === slotId || b.proposedSlotId === slotId)).length
  // Original seed occupancy has no identities; never invent names for it.
  const original = seedSlots.find(s => s.id === slotId)?.bookingCount ?? 0
  const legacyOwned = data.bookings.some(b => b.slotId === slotId && b.id.startsWith('legacy:'))
  return Math.max(0, original - (legacyOwned ? 1 : 0)) + known
}
function commit(state: V2State, data: TeacherCoffeeData, teacherId: string, message: string, notifyStudent = true): V2State {
  return { ...state, teacherCoffee: { ...data, notices: [{ id: makeId(), teacherId, body: message, read: false, at: new Date().toISOString() }, ...data.notices] }, coffeeBookings: [...new Set(data.bookings.filter(b => b.student === studentName && b.status === 'confirmed').map(b => b.slotId))], notifications: notifyStudent ? [{ id: makeId(), title: 'Coffee Chat 更新', body: message, path: '/v2/me?tab=events', date: '刚刚', read: false }, ...state.notifications] : state.notifications }
}
function conflicting(state: V2State, slot: ManagedSlot, except?: string) {
  const data = coffeeData(state)
  return data.bookings.some(b => b.id !== except && b.student === studentName && b.status === 'confirmed' && data.slots.some(s => (s.id === b.slotId || s.id === b.proposedSlotId) && overlap(s, slot))) || (state.alumni?.bookings ?? []).some(b => b.student === studentName && b.status === 'confirmed' && state.alumni?.slots.some(s => s.id === b.slotId && overlap(slot, s)))
}
export function bookCoffee(state: V2State, slotId: string, topic: string, now = Date.now()) {
  const data = coffeeData(state), slot = data.slots.find(s => s.id === slotId)
  requireRule(state.role === 'student' && slot && !slot.closed && Date.parse(slot.startAt) > now, '该时段不可预约。')
  requireRule(topic.trim().length > 0 && topic.trim().length <= 500, '请填写 1–500 字的交流问题。')
  requireRule(!data.bookings.some(b => b.student === studentName && b.slotId === slotId && b.status === 'confirmed'), '请勿重复预约。')
  requireRule(occupied(state, slotId) < slot.capacity && !conflicting(state, slot), '时段已满或与你的交流安排冲突。')
  data.bookings = [...data.bookings, { id: makeId(), slotId, student: studentName, topic: topic.trim(), status: 'confirmed', createdAt: new Date(now).toISOString(), history: [{ at: new Date(now).toISOString(), action: '预约成功', reason: '' }] }]
  return commit(state, data, slot.teacherId, `${studentName}预约了 ${managedTeachers(state).find(t => t.id === slot.teacherId)?.name} · ${slot.startAt}`)
}
export function cancelCoffee(state: V2State, bookingId: string, reason: string) {
  const data = coffeeData(state), booking = data.bookings.find(b => b.id === bookingId), slot = data.slots.find(s => s.id === booking?.slotId)
  requireRule(booking && slot && booking.status === 'confirmed', '预约不可取消。')
  requireRule(state.role === 'student' ? booking.student === studentName : state.role === 'teacher' && slot.teacherId === teacherAccount(state).id, '不能处理他人的预约。')
  requireRule(state.role !== 'teacher' || reason.trim(), '老师取消预约须说明原因。')
  data.bookings = data.bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled', proposedSlotId: undefined, history: [...b.history, { at: new Date().toISOString(), action: '取消预约', reason: reason.trim() }] } : b)
  return commit(state, data, slot.teacherId, `${booking.student}的预约已取消。${reason.trim()}`)
}
export function saveCoffeeSlot(state: V2State, input: { startAt: string; endAt: string; location: string; capacity: number }) {
  requireRule(state.role === 'teacher', '仅老师可以维护自己的时段。')
  requireRule(Number.isFinite(Date.parse(input.startAt)) && Date.parse(input.startAt) > Date.now() && Date.parse(input.endAt) > Date.parse(input.startAt) && input.location.trim() && Number.isInteger(input.capacity) && input.capacity > 0, '请填写未来有效时间、地点和正整数容量。')
  const data = coffeeData(state), teacherId = teacherAccount(state).id
  requireRule(!data.slots.some(s => s.teacherId === teacherId && !s.closed && overlap(s, input)), '与本人其他时段重叠。')
  const slot: ManagedSlot = { ...input, location: input.location.trim(), teacherId, id: makeId(), dateLabel: new Date(input.startAt).toLocaleDateString('zh-CN'), timeLabel: new Date(input.startAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), bookingCount: 0, status: 'available' }
  return { ...state, teacherCoffee: { ...data, slots: [...data.slots, slot] } }
}
export function closeCoffeeSlot(state: V2State, slotId: string) {
  const data = coffeeData(state), slot = data.slots.find(s => s.id === slotId)
  requireRule(state.role === 'teacher' && slot?.teacherId === teacherAccount(state).id, '只能维护本人的时段。')
  requireRule(occupied(state, slotId) === 0, '已有预约或改期预留，不能关闭。')
  return { ...state, teacherCoffee: { ...data, slots: data.slots.map(s => s.id === slotId ? { ...s, closed: true } : s) } }
}
export function proposeCoffeeMove(state: V2State, bookingId: string, nextId: string, reason: string) {
  const data = coffeeData(state), b = data.bookings.find(x => x.id === bookingId), old = data.slots.find(s => s.id === b?.slotId), next = data.slots.find(s => s.id === nextId)
  requireRule(state.role === 'teacher' && old?.teacherId === teacherAccount(state).id && b?.status === 'confirmed' && !b.proposedSlotId, '不能提出此次改期。')
  requireRule(next && old.id !== next.id && next.teacherId === old.teacherId && !next.closed && Date.parse(next.startAt) > Date.now() && reason.trim(), '请选择本人的未来时段并说明原因。')
  requireRule(occupied(state, nextId) < next.capacity && !conflicting(state, next, b.id), '新时段已满或发生时间冲突。')
  data.bookings = data.bookings.map(x => x.id === b.id ? { ...x, proposedSlotId: nextId, history: [...x.history, { at: new Date().toISOString(), action: '提出改期', reason: reason.trim() }] } : x)
  return commit(state, data, old.teacherId, `老师提出预约改期：${next.startAt}。${reason.trim()} 请确认或拒绝。`)
}
export function answerCoffeeMove(state: V2State, bookingId: string, accept: boolean) {
  const data = coffeeData(state), b = data.bookings.find(x => x.id === bookingId), next = data.slots.find(s => s.id === b?.proposedSlotId), old = data.slots.find(s => s.id === b?.slotId)
  requireRule(state.role === 'student' && b?.student === studentName && b.status === 'confirmed' && b.proposedSlotId && old, '只有预约学生可以处理改期。')
  if (accept) requireRule(next && !next.closed && Date.parse(next.startAt) > Date.now() && occupied(state, next.id) <= next.capacity && !conflicting(state, next, b.id), '新时段已失效或冲突，请拒绝后重新协调。')
  data.bookings = data.bookings.map(x => x.id === b.id ? { ...x, slotId: accept ? next!.id : x.slotId, proposedSlotId: undefined, history: [...x.history, { at: new Date().toISOString(), action: accept ? '接受改期' : '拒绝改期', reason: '' }] } : x)
  return commit(state, data, old.teacherId, `${b.student}${accept ? '接受' : '拒绝'}了改期。`)
}
