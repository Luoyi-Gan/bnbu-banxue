import { events } from '../data/mockData'
import type { V2State } from './model'

export type ActivityReaction = 'likedActivities' | 'savedActivities'

export function setActivityReaction(state: V2State, id: string, kind: ActivityReaction, enabled: boolean): V2State {
  if (state.role !== 'student') return state
  const local = state.localEvents.find(item => item.id === id)
  const published = local ? local.status === 'published' : events.some(item => item.id === id)
  if (enabled && !published) return state
  const previous = state[kind] ?? []
  if (previous.includes(id) === enabled) return state
  return { ...state, [kind]: enabled ? [...new Set([...previous, id])] : previous.filter(item => item !== id) }
}
