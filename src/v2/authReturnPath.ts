export function authReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/workspace'
  try {
    const url = new URL(value, 'https://bnbu.local')
    if (url.origin !== 'https://bnbu.local' || (url.pathname !== '/v2' && !url.pathname.startsWith('/v2/')) || /^\/v2\/(login|register)(\/|$)/.test(url.pathname)) return '/workspace'
    return url.pathname + url.search + url.hash
  } catch { return '/workspace' }
}
