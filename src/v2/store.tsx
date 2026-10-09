import { trackRelationshipChanges } from './relationshipAdapter'
import { alumniSeedPosts } from './alumniModel'
import { useCallback, useEffect, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { initialV2State, v2StorageKey, type V2State } from './model'
import { V2Context } from './context'
import { hideRetiredContent } from './retiredContent'
import { resolvePortalRole } from './portalAccess'

const portalSessionKey = import.meta.env.DEV ? 'bnbu-campus-v2:dev-portal-role' : 'bnbu-campus-v2:portal-role'

function sessionRole(legacy?: unknown) {
  try {
    const preview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('previewRole') : null
    const requested = preview === 'student' || preview === 'teacher' || preview === 'admin' ? preview : null
    const role = resolvePortalRole(requested ?? window.sessionStorage.getItem(portalSessionKey), legacy)
    window.sessionStorage.setItem(portalSessionKey, role)
    return role
  } catch { return resolvePortalRole(null, legacy) }
}

function readState(): V2State {
  try {
    const value = JSON.parse(window.localStorage.getItem(v2StorageKey) ?? 'null') as Partial<V2State> | null
    if (value && Array.isArray(value.posts) && Array.isArray(value.rooms)) return hideRetiredContent({ ...initialV2State, ...value, posts: value.alumni ? value.posts : [...value.posts, ...alumniSeedPosts.filter(seed => !value.posts!.some(post => post.id === seed.id))], role: sessionRole(value.role), participatingActivities: Array.isArray(value.participatingActivities) ? [...new Set(value.participatingActivities.filter((id): id is string => typeof id === "string"))] : [], preferences: { ...initialV2State.preferences, ...value.preferences } })
  } catch { /* use seed */ }
  return { ...initialV2State, role: sessionRole() }
}

export function V2Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<V2State>(readState)
  const [persistenceError, setPersistenceError] = useState(false)
  const updateState: Dispatch<SetStateAction<V2State>> = useCallback(action => setState(previous => {
    const next = typeof action === 'function' ? action(previous) : action
    return trackRelationshipChanges(previous, next)
  }), [])
  const synced = useRef<V2State | null>(null)
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === v2StorageKey) setState(current => { const next = { ...readState(), role: current.role }; synced.current = next; return next }) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => { if (synced.current === state) return; try { window.localStorage.setItem(v2StorageKey, JSON.stringify({ ...state, role: undefined })); setPersistenceError(false) } catch { setPersistenceError(true) } }, [state])
  return <V2Context.Provider value={{ state, setState: updateState, persistenceError, reset: () => setState(current => ({ ...initialV2State, role: current.role })) }}>{children}</V2Context.Provider>
}

