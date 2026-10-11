import { afterEach, describe, expect, it, vi } from 'vitest'
import { authApi } from './authApi'

afterEach(() => vi.unstubAllGlobals())

describe('伴学账号接口边界', () => {
  it('没有邮件服务时不报告验证码已发送', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>preview</html>', { status: 200, headers: { 'content-type': 'text/html' } })))
    await expect(authApi.sendCode('person@example.com')).rejects.toThrow('验证码邮件不会发送')
  })

  it('只有服务端明确确认后才完成各步骤', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ sent: true }), { status: 200, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ registered: true }), { status: 200, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ authenticated: true }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    await authApi.sendCode('person@example.com')
    await authApi.register('person@example.com', '123456', 'a-password')
    await authApi.login('person@example.com', 'a-password')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ email: 'person@example.com', code: '123456', password: 'a-password' })
  })

  it('普通 JSON 成功响应不能被视为已登录', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })))
    await expect(authApi.login('person@example.com', 'a-password')).rejects.toThrow('未返回有效确认')
  })
})
