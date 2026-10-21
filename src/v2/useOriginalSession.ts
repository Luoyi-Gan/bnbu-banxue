import { useEffect, useState } from 'react'
import { api, ApiError, type LiveAccount } from '../live/api'

export function useOriginalSession(pathname: string, navigationKey: string) {
  const [session, setSession] = useState<{path: string; navigationKey: string; account: LiveAccount | null; error: string; anonymous: boolean} | null>(null)
  const authPage = pathname === '/v2/login' || pathname === '/v2/register' || pathname === '/v2/forgot-password' || pathname === '/v2/privacy'
  useEffect(() => {
    if (authPage) {
      setSession(null)
      return
    }
    let active = true, generation = 0
    const refresh = async () => {
      const current = ++generation
      try {
        const {account} = await api<{account: LiveAccount}>('/api/auth/me')
        if (active && generation === current) setSession({path: pathname, navigationKey, account, error: '', anonymous: false})
      } catch (error) {
        if (active && generation === current) setSession({path: pathname, navigationKey, account: null, error: error instanceof Error ? error.message : '无法读取登录状态', anonymous: error instanceof ApiError && error.status === 401})
      }
    }
    void refresh()
    window.addEventListener('focus', refresh)
    return () => {active = false; window.removeEventListener('focus', refresh)}
  }, [pathname, authPage, navigationKey])
  if (authPage) return null
  if (session?.path === pathname && session.navigationKey === navigationKey) return session
  // Keep the authenticated shell mounted during navigation within the same portal.
  // Each navigation still revalidates with the server; auth pages clear the cache.
  const portal = (path: string) => path.startsWith('/v2/admin') ? 'admin' : path.startsWith('/v2/teacher') ? 'teacher' : 'student'
  return session?.account && portal(session.path) === portal(pathname) ? session : null
}
