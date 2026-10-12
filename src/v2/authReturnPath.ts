export function authReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/workspace'
  try {
    const url = new URL(value, 'https://bnbu.local')
    if (url.origin !== 'https://bnbu.local' || (url.pathname !== '/v2' && !url.pathname.startsWith('/v2/')) || /^\/v2\/(login|register)(\/|$)/.test(url.pathname)) return '/workspace'
    return url.pathname + url.search + url.hash
  } catch { return '/workspace' }
}

export function roleLoginPath(value: unknown, roles: string[]): string {
 const requested = authReturnPath(value)
 const admin = roles.some(role => ['superadmin','operator','reviewer'].includes(role))
 const allowed = requested.startsWith('/v2/admin') ? admin : requested.startsWith('/v2/teacher') ? roles.includes('teacher') : roles.includes('student')
 if(requested !== '/workspace' && allowed) return requested
 return roles.includes('student') ? '/v2' : roles.includes('teacher') ? '/v2/teacher/coffee' : admin ? '/v2/admin' : '/workspace'
}
