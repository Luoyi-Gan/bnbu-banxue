import { afterEach, expect, it, vi } from 'vitest'
import { deliverMessage } from '../backend/src/mail-delivery'

const endpoint = 'https://apiv2.aoksend.com/index/api/send_email'
const message = { id: 'test-mail', recipient: 'owner@example.test', subject: '会同里找回密码', body: '验证码：123456，10 分钟内有效。' }
function provider() {
  vi.stubEnv('BNBU_EMAIL_PROVIDER', 'aoksend')
  vi.stubEnv('BNBU_AOKSEND_APP_KEY', 'test-only-key')
  vi.stubEnv('BNBU_AOKSEND_TEMPLATE_ID', 'test-template')
  vi.stubEnv('BNBU_AOKSEND_CODE_VARIABLE', 'code')
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('找回邮件按已配置模板提交验证码，只有供应商确认后成功', async () => {
  provider()
  const send = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 200 }), { status: 200 }))
  vi.stubGlobal('fetch', send)
  await deliverMessage(message, endpoint)
  const [url, request] = send.mock.calls[0]
  expect(url).toBe(endpoint)
  const form = new URLSearchParams(request.body)
  expect(form.get('to')).toBe(message.recipient)
  expect(form.get('app_key')).toBe('test-only-key')
  expect(form.get('template_id')).toBe('test-template')
  expect(JSON.parse(form.get('data')!)).toEqual({ code: '123456', minutes: '10' })
})

it('拒绝错误域名、缺失配置和含多个验证码的内容，避免误发凭据', async () => {
  provider()
  const send = vi.fn()
  vi.stubGlobal('fetch', send)
  await expect(deliverMessage(message, 'https://other.example/send')).rejects.toThrow('地址配置无效')
  await expect(deliverMessage({ ...message, body: '123456 654321' }, endpoint)).rejects.toThrow('内容无效')
  vi.stubEnv('BNBU_AOKSEND_APP_KEY', '')
  await expect(deliverMessage(message, endpoint)).rejects.toThrow('尚未完整配置')
  expect(send).not.toHaveBeenCalled()
})

it('拒绝供应商业务失败及网络失败，不将 HTTP 200 当作发信成功', async () => {
  provider()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 40007 }), { status: 200 })))
  await expect(deliverMessage(message, endpoint)).rejects.toThrow('未确认发送')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')))
  await expect(deliverMessage(message, endpoint)).rejects.toThrow('未确认发送')
})
