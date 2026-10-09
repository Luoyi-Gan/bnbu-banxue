import type { V2State } from './model'

export function updateStudentProfile(state: V2State, nickname: string, avatar: string): V2State {
  const name = nickname.trim()
  if (!name || name.length > 20) throw new Error('昵称需要填写 1–20 个字符。')
  return { ...state, profile: { nickname: name, avatar } }
}
