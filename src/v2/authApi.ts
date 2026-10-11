type AuthPayload = Record<string, string>

export class AuthServiceError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthServiceError' }
}

async function postAuth(path: string, payload: AuthPayload, successKey: 'authenticated' | 'sent' | 'registered'): Promise<void> {
  let response: Response
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthServiceError('暂时无法连接登录服务，请稍后重试。')
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) throw new AuthServiceError('当前预览尚未接入账号服务，验证码邮件不会发送。')
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : null
    throw new AuthServiceError(message ?? (response.status === 429 ? '请求过于频繁，请稍后再试。' : '操作未完成，请检查填写的信息。'))
  }
  if (!data || typeof data !== 'object' || (data as Record<string, unknown>)[successKey] !== true) {
    throw new AuthServiceError('账号服务未返回有效确认，请稍后重试。')
  }
}

export const authApi = {
  login: (email: string, password: string) => postAuth('login', { email, password }, 'authenticated'),
  sendCode: (email: string) => postAuth('verification-codes', { email, purpose: 'register' }, 'sent'),
  register: (email: string, code: string, password: string) => postAuth('register', { email, code, password }, 'registered'),
}
