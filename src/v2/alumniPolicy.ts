import { coffeeData, managedSlots } from './teacherCoffee'
import { makeId, studentName, todayLabel, type Role, type V2State } from './model'
import { alumniSeed, type AlumniData, type AlumniProfile, type AlumniSlot, type AlumniBookingStatus } from './alumniModel'

export type AlumniActor = { role: Role; id: string }
export const currentAlumniActor = (state: V2State): AlumniActor => ({ role: state.role, id: studentName })
export const alumniData = (state: V2State) => state.alumni ?? alumniSeed
const demand = (condition: unknown, message: string) => { if (!condition) throw new Error(message) }
const overlap = (a: Pick<AlumniSlot, 'startAt' | 'endAt'>, b: Pick<AlumniSlot, 'startAt' | 'endAt'>) => Date.parse(a.startAt) < Date.parse(b.endAt) && Date.parse(b.startAt) < Date.parse(a.endAt)
export function bookingStatus(data: AlumniData, booking: AlumniData['bookings'][number], now = Date.now()): AlumniBookingStatus {
  const slot = data.slots.find(item => item.id === booking.slotId)
  return booking.status === 'pending' && (!slot || Date.parse(slot.startAt) <= now) ? 'expired' : booking.status
}
function record(data: AlumniData, actor: AlumniActor, objectId: string, action: string, reason: string, recipients: string[], now: number): AlumniData {
  const at = new Date(now).toISOString()
  return { ...data, history: [{ id: makeId(), actor: actor.id, objectId, action, reason, at }, ...data.history], notices: [...new Set(recipients)].map<AlumniData['notices'][number]>(recipient => ({ id: makeId(), recipient, body: `${action}${reason ? `：${reason}` : ''}`, read: false, at })).concat(data.notices) }
}
function owned(state: V2State, actor: AlumniActor) {
  const profile = alumniData(state).profiles.find(item => item.owner === actor.id)
  demand(actor.role === 'student' && profile?.status === 'approved', '需要本人已通过校友认证。')
  return profile!
}

export function followAlumni(state: V2State, actor: AlumniActor, id: string): V2State {
  const data = alumniData(state), person = data.profiles.find(item => item.id === id)
  demand(actor.role === 'student' && person?.status === 'approved' && person.owner !== actor.id, '无法关注此校友。')
  const exists = data.follows.some(item => item.student === actor.id && item.alumniId === id)
  return { ...state, alumni: { ...data, follows: exists ? data.follows.filter(item => item.student !== actor.id || item.alumniId !== id) : [...data.follows, { student: actor.id, alumniId: id }] } }
}

export function editAlumniProfile(state: V2State, actor: AlumniActor, input: Pick<AlumniProfile, 'city' | 'direction' | 'experience' | 'topics' | 'bio' | 'accepting'>): V2State {
  const person = owned(state, actor), data = alumniData(state)
  demand(input.city.trim() && input.experience.trim() && input.topics.trim(), '请填写城市、经历与交流话题。')
  demand(input.city.length <= 40 && input.experience.length <= 120 && input.topics.length <= 120 && input.bio.length <= 500, '资料内容过长。')
  return { ...state, alumni: { ...data, profiles: data.profiles.map(item => item.id === person.id ? { ...item, ...input } : item) } }
}

export function publishAlumniPost(state: V2State, actor: AlumniActor, title: string, body: string, topic: '升学' | '就业'): V2State {
  const person = owned(state, actor)
  demand(title.trim() && title.trim().length <= 80 && body.trim() && body.trim().length <= 1000, '标题限 1–80 字，正文限 1–1000 字。')
  return { ...state, posts: [{ id: makeId(), alumniId: person.id, author: person.name, title: title.trim(), body: body.trim(), board: `校友${topic}`, date: todayLabel(), status: 'pending', likes: 0, comments: [] }, ...state.posts] }
}

export function addAlumniSlot(state: V2State, actor: AlumniActor, input: Omit<AlumniSlot, 'id' | 'alumniId' | 'open'>, now = Date.now()): V2State {
  const person = owned(state, actor), data = alumniData(state)
  demand(person.accepting, '请先开启接受交流申请。')
  demand(Number.isFinite(Date.parse(input.startAt)) && Number.isFinite(Date.parse(input.endAt)) && Date.parse(input.startAt) > now && Date.parse(input.endAt) > Date.parse(input.startAt), '请设置未来的有效起止时间。')
  demand(input.location.trim() && input.location.length <= 120, '请填写交流地点或方式，最多 120 字。')
  const slot: AlumniSlot = { ...input, id: makeId(), alumniId: person.id, open: true }
  demand(!data.slots.some(item => item.alumniId === person.id && item.open && overlap(item, slot)), '该时段与已开放时段重叠。')
  return { ...state, alumni: { ...data, slots: [...data.slots, slot] } }
}

export function closeAlumniSlot(state: V2State, actor: AlumniActor, id: string, now = Date.now()): V2State {
  const person = owned(state, actor), data = alumniData(state), slot = data.slots.find(item => item.id === id)
  demand(slot?.alumniId === person.id && slot.open, '只能关闭本人开放的时段。')
  demand(!data.bookings.some(item => item.slotId === id && ['pending', 'confirmed'].includes(bookingStatus(data, item, now))), '该时段存在有效申请或预约，请先处理。')
  return { ...state, alumni: { ...data, slots: data.slots.map(item => item.id === id ? { ...item, open: false } : item) } }
}

export function cancelAlumniBooking(state: V2State, actor: AlumniActor, id: string, reason: string, now = Date.now()): V2State {
  const data = alumniData(state), booking = data.bookings.find(item => item.id === id), slot = data.slots.find(item => item.id === booking?.slotId), person = data.profiles.find(item => item.id === slot?.alumniId)
  demand(actor.role === 'student' && booking && (booking.student === actor.id || person?.owner === actor.id), '只能处理自己的预约。')
  const status = bookingStatus(data, booking!, now)
  demand(status === 'pending' && booking!.student === actor.id || status === 'confirmed', '当前预约不能取消。')
  demand(slot && Date.parse(slot.endAt) > now, '该交流时间已结束。')
  demand(status === 'pending' || reason.trim(), '取消已确认预约需要填写原因。')
  const next = { ...data, bookings: data.bookings.map(item => item.id === id ? { ...item, status: (status === 'pending' ? 'withdrawn' : 'cancelled') as AlumniBookingStatus, reason: reason.trim() } : item) }
  return { ...state, alumni: record(next, actor, id, status === 'pending' ? '校友交流申请已撤回' : '校友交流预约已取消', reason.trim(), [booking!.student, person!.owner], now) }
}

export function submitAlumniCertification(state: V2State, actor: AlumniActor, input: Pick<AlumniProfile, 'name' | 'major' | 'graduationYear' | 'city' | 'direction' | 'experience' | 'topics' | 'bio' | 'evidence'>, now = Date.now()): V2State {
  const data = alumniData(state), previous = data.profiles.find(p => p.owner === actor.id)
  demand(actor.role === 'student' && (!previous || previous.status === 'rejected'), '已有待审或通过的校友认证。')
  demand(input.name.trim() && input.major.trim() && input.evidence.trim() && input.city.trim() && input.experience.trim() && input.topics.trim(), '请补充必填资料与核验说明。')
  demand(Number.isInteger(input.graduationYear) && input.graduationYear >= 2005 && input.graduationYear <= new Date(now).getFullYear(), '请填写有效的毕业年份。')
  demand(input.name.length <= 40 && input.major.length <= 80 && input.city.length <= 40 && input.experience.length <= 120 && input.topics.length <= 120 && input.bio.length <= 500 && input.evidence.length <= 1000, '资料超过长度限制。')
  const profile: AlumniProfile = { ...input, owner: actor.id, id: previous?.id ?? makeId(), status: 'pending', accepting: true, reviewNote: '' }
  return { ...state, alumni: record({ ...data, profiles: [...data.profiles.filter(p => p.owner !== actor.id), profile] }, actor, profile.id, '校友认证已提交', '', [actor.id], now) }
}

export function reviewAlumni(state: V2State, actor: AlumniActor, id: string, approve: boolean, reason: string, now = Date.now()): V2State {
  const data = alumniData(state), profile = data.profiles.find(p => p.id === id)
  demand(actor.role === 'admin' && profile && (profile.status === 'pending' || profile.status === 'approved' && !approve), '当前认证不能进行该操作。')
  demand(approve || reason.trim(), '驳回或撤销认证必须填写原因。')
  const affected = !approve ? data.bookings.filter(b => {
    const slot = data.slots.find(s => s.id === b.slotId)
    return slot?.alumniId === id && Date.parse(slot.endAt) > now && ['pending', 'confirmed'].includes(bookingStatus(data, b, now))
  }) : []
  const next: AlumniData = { ...data, profiles: data.profiles.map(p => p.id === id ? { ...p, status: approve ? 'approved' : 'rejected', reviewNote: reason.trim() } : p), slots: !approve ? data.slots.map(s => s.alumniId === id ? { ...s, open: false } : s) : data.slots, bookings: data.bookings.map(b => affected.some(a => a.id === b.id) ? { ...b, status: 'cancelled', reason: '校友认证已撤销，预约取消' } : b) }
  return { ...state, alumni: record(next, actor, id, approve ? '校友认证已通过' : '校友认证未通过或已撤销，相关预约已取消', reason.trim(), [profile!.owner, ...affected.map(b => b.student)], now) }
}

export function hasAlumniConflict(state: V2State, personId: string, slot: Pick<AlumniSlot, 'startAt' | 'endAt'>) {
  const data = alumniData(state)
  return data.bookings.some(b => b.status === 'confirmed' && data.slots.some(s => s.id === b.slotId && overlap(s, slot) && (b.student === personId || data.profiles.some(p => p.id === s.alumniId && p.owner === personId))))
}

function hasConflict(state: V2State, student: string, slot: AlumniSlot, except?: string) {
  const data = alumniData(state)
  return (student === studentName && managedSlots(state).some(s => (state.coffeeBookings.includes(s.id) || coffeeData(state).bookings.some(b => b.student === studentName && b.status === 'confirmed' && b.proposedSlotId === s.id)) && overlap(s, slot))) || data.bookings.some(b => b.id !== except && b.status === 'confirmed' && b.student === student && data.slots.some(s => s.id === b.slotId && overlap(s, slot)))
}

export function requestAlumniChat(state: V2State, actor: AlumniActor, slotId: string, question: string, now = Date.now()): V2State {
  const data = alumniData(state), slot = data.slots.find(s => s.id === slotId), person = data.profiles.find(p => p.id === slot?.alumniId)
  demand(actor.role === 'student' && person?.status === 'approved' && person.accepting && person.owner !== actor.id && slot?.open && Date.parse(slot.startAt) > now, '此时段不能申请。')
  demand(question.trim() && question.trim().length <= 500, '请填写 1–500 字的交流问题。')
  demand(!data.bookings.some(b => b.slotId === slotId && (b.status === 'confirmed' || b.student === actor.id && bookingStatus(data, b, now) === 'pending')), '已有申请或该时段已确认预约。')
  demand(!hasConflict(state, actor.id, slot!), '与本人已确认的交流时间冲突。')
  const booking = { id: makeId(), slotId, student: actor.id, question: question.trim(), status: 'pending' as const, reason: '', createdAt: new Date(now).toISOString() }
  return { ...state, alumni: record({ ...data, bookings: [...data.bookings, booking] }, actor, booking.id, '收到校友交流申请，等待校友确认', '', [actor.id, person!.owner], now) }
}

export function decideAlumniChat(state: V2State, actor: AlumniActor, id: string, accept: boolean, reason: string, now = Date.now()): V2State {
  const person = owned(state, actor), data = alumniData(state), booking = data.bookings.find(b => b.id === id), slot = data.slots.find(s => s.id === booking?.slotId)
  demand(booking && slot?.alumniId === person.id && bookingStatus(data, booking, now) === 'pending' && slot.open, '该申请已变化或不属于本人。')
  demand(accept || reason.trim(), '拒绝申请需要说明原因。')
  if (accept) {
    demand(!data.bookings.some(b => b.status === 'confirmed' && data.slots.some(s => s.id === b.slotId && s.alumniId === person.id && overlap(s, slot!))), '该时段已有确认预约。')
    demand(!hasConflict(state, booking!.student, slot!, id), '学生已有冲突的预约。')
    demand(!hasConflict(state, actor.id, slot!, id), '校友本人已有冲突的交流。')
  }
  const others = accept ? data.bookings.filter(b => b.id !== id && b.slotId === slot!.id && bookingStatus(data, b, now) === 'pending') : []
  let next: AlumniData = { ...data, bookings: data.bookings.map(b => b.id === id ? { ...b, status: accept ? 'confirmed' : 'rejected', reason: reason.trim() } : others.some(o => o.id === b.id) ? { ...b, status: 'unavailable', reason: '校友已确认另一位学生的申请' } : b) }
  next = record(next, actor, id, accept ? '校友交流预约已确认' : '校友交流申请已拒绝', reason.trim(), [booking!.student, person.owner], now)
  if (others.length) next = record(next, actor, slot!.id, '校友交流时段已被预约，请选择其他时段', '', others.map(b => b.student), now)
  return { ...state, alumni: next }
}
