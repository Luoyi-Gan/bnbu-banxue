import { useEffect, useState, type ReactNode } from 'react'
import { initialV2State, v2StorageKey, type V2State } from './model'
import { V2Context } from './context'

function readState(): V2State {
  try {
    const value = JSON.parse(window.localStorage.getItem(v2StorageKey) ?? 'null') as Partial<V2State> | null
    if (value && Array.isArray(value.announcements) && Array.isArray(value.posts) && Array.isArray(value.rooms)) return { ...initialV2State, ...value, preferences: { ...initialV2State.preferences, ...value.preferences } }
  } catch { /* use seed */ }
  return initialV2State
}

export function V2Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<V2State>(readState)
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === v2StorageKey) setState(readState()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => { try { window.localStorage.setItem(v2StorageKey, JSON.stringify(state)) } catch { /* ephemeral demo */ } }, [state])
  return <V2Context.Provider value={{ state, setState, reset: () => setState(initialV2State) }}>{children}</V2Context.Provider>
}

