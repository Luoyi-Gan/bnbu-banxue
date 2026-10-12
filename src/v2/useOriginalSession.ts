import { useEffect, useState } from 'react'
import { api, ApiError, type LiveAccount } from '../live/api'

export function useOriginalSession(pathname: string) {
  const [session, setSession] = useState<{path: string; account: LiveAccount | null; error: string; anonymous: boolean} | null>(null)
  const authPage = pathname === '/v2/login' || pathname === '/v2/register'
  useEffect(() => {
    if (authPage) return
    let active = true, generation = 0
    const refresh = async () => {
      const current = ++generation
      try {
        const {account} = await api<{account: LiveAccount}>('/api/auth/me')
        if (active && generation === current) setSession({path: pathname, account, error: '', anonymous: false})
      } catch (error) {
        if (active && generation === current) setSession({path: pathname, account: null, error: error instanceof Error ? error.message : '无法读取登录状态', anonymous: error instanceof ApiError && error.status === 401})
      }
    }
    void refresh()
    window.addEventListener('focus', refresh)
    return () => {active = false; window.removeEventListener('focus', refresh)}
  }, [pathname, authPage])
  return session?.path === pathname ? session : null
}
