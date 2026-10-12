import { makeId, studentName, type LocalEvent, type V2State } from './model'

export const teacherActor = { id: 'prof-zhang', name: '张老师' }
export function activityActor(state: V2State) {
  return state.role === 'teacher' ? teacherActor : { id: 'student-demo', name: studentName }
}
export function canPublishActivity(state: V2State) {
  if (state.role !== 'student') return false
  return state.verifications.find((item) => item.name === studentName && item.kind === 'club')?.status === 'approved'
}
export function ownsActivity(state: V2State, event: LocalEvent) {
  return (event.ownerId ?? 'student-demo') === activityActor(state).id && state.role === 'student'
}
export function createActivity(state: V2State, input: { title: string; description: string; startAt: string; location: string; capacity: number }): V2State {
  if (!canPublishActivity(state)) throw new Error('仅已认证的学生社团成员可以发起活动。')
  if (!input.title.trim() || !input.description.trim() || !input.location.trim() || !Number.isFinite(Date.parse(input.startAt)) || Date.parse(input.startAt) <= Date.now() || !Number.isInteger(input.capacity) || input.capacity < 1) throw new Error('请填写完整的活动信息、未来开始时间和有效人数上限。')
  const actor = activityActor(state)
  const event: LocalEvent = { ...input, title: input.title.trim(), description: input.description.trim(), location: input.location.trim(), id: makeId(), ownerId: actor.id, host: actor.name, status: 'published', registrations: 0 }
  return { ...state, localEvents: [event, ...state.localEvents] }
}
export function changeActivityVisibility(state: V2State, id: string): V2State {
  const event = state.localEvents.find((item) => item.id === id)
  if (!event || !ownsActivity(state, event)) throw new Error('只能管理本人发起的活动。')
  if (event.status === 'draft' && !canPublishActivity(state)) throw new Error('当前身份没有重新发布活动的资格。')
  return { ...state, localEvents: state.localEvents.map((item) => item.id === id ? { ...item, status: item.status === 'published' ? 'draft' : 'published' } : item) }
}
