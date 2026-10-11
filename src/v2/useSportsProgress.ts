import { useEffect, useSyncExternalStore } from 'react'
import { loadSportsProgress, sportsProgressScope } from './sportsProgressAdapter'
import { createSportsProgressResource } from './sportsProgressResource'

const resource = createSportsProgressResource(loadSportsProgress, sportsProgressScope)

export function useSportsProgress() {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot)
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void resource.refresh() }
    const storage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith('bnbu.student.web.')) {
        resource.invalidate()
        refresh()
      }
    }
    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('online', refresh)
    window.addEventListener('storage', storage)
    document.addEventListener('visibilitychange', refresh)
    // Reviews from another device are picked up while the homepage is visible.
    const timer = window.setInterval(refresh, 30000)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('online', refresh)
      window.removeEventListener('storage', storage)
      document.removeEventListener('visibilitychange', refresh)
      resource.invalidate()
    }
  }, [])
  return { ...snapshot, retry: resource.refresh }
}
