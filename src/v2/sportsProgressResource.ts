import type { SportsProgress } from './sportsProgress'

export interface SportsProgressSnapshot {
  phase: 'loading' | 'ready' | 'error'
  data: SportsProgress | null
  refreshing: boolean
}

export function createSportsProgressResource(load: () => Promise<SportsProgress>, scope: () => string, timeoutMs = 20000) {
  let snapshot: SportsProgressSnapshot = { phase: 'loading', data: null, refreshing: false }
  let generation = 0
  let currentScope = scope()
  let pending: Promise<void> | null = null
  const listeners = new Set<() => void>()
  const publish = (value: SportsProgressSnapshot) => { snapshot = value; listeners.forEach(listener => listener()) }
  const invalidate = () => { generation++; currentScope = scope(); publish({ phase: 'loading', data: null, refreshing: false }) }
  const refresh = (): Promise<void> => {
    if (scope() !== currentScope) invalidate()
    // Includes timed-out requests: retain the lock until the original transport settles.
    if (pending) return pending
    const requestGeneration = generation
    let timedOut = false
    const isCurrent = () => requestGeneration === generation && currentScope === scope()
    publish({ ...snapshot, refreshing: true, phase: snapshot.data ? 'ready' : 'loading' })
    const timer = setTimeout(() => {
      timedOut = true
      if (isCurrent()) publish({ phase: 'error', data: null, refreshing: true })
    }, timeoutMs)
    pending = Promise.resolve().then(load).then(data => {
      if (isCurrent() && !timedOut) publish({ phase: 'ready', data, refreshing: false })
    }).catch(() => {
      if (isCurrent() && !timedOut) publish({ phase: 'error', data: null, refreshing: false })
    }).finally(() => {
      clearTimeout(timer)
      pending = null
      if (timedOut && isCurrent()) publish({ phase: 'error', data: null, refreshing: false })
      if (!isCurrent() && listeners.size) void refresh()
    })
    return pending
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    refresh, invalidate,
  }
}
