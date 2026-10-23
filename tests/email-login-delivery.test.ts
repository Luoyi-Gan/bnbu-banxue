import {afterEach,expect,it,vi} from 'vitest'
import {openDatabase} from '../backend/src/database'
import {LearningAuth} from '../backend/src/learning-auth'
import {sqliteLearningStore} from '../backend/src/learning-store'

afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
it('真实供应商适配发送登录码，重发限流、本人登录及一次消费联动',async()=>{
 const db=openDatabase(':memory:'),auth=new LearningAuth(sqliteLearningStore(db))
 try{
  vi.stubEnv('BNBU_EMAIL_PROVIDER','aoksend');vi.stubEnv('BNBU_EMAIL_DELIVERY_URL','https://apiv2.aoksend.com/index/api/send_email');vi.stubEnv('BNBU_AOKSEND_APP_KEY','test-only-key');vi.stubEnv('BNBU_AOKSEND_TEMPLATE_ID','test-only-template');vi.stubEnv('BNBU_AOKSEND_CODE_VARIABLE','code')
  const send=vi.fn().mockResolvedValue(Response.json({code:200}));vi.stubGlobal('fetch',send)
  await expect(auth.requestCode(' OWNER@mail.bnbu.edu.cn ','source',false)).resolves.toMatchObject({sent:true})
  const form=new URLSearchParams(send.mock.calls[0][1].body),code=JSON.parse(form.get('data')!).code
  expect(form.get('to')).toBe('owner@mail.bnbu.edu.cn')
  await expect(auth.requestCode('owner@mail.bnbu.edu.cn','source',false)).rejects.toThrow('稍后')
  expect(send).toHaveBeenCalledTimes(1)
  const result=await auth.emailLogin('owner@mail.bnbu.edu.cn',code,'source')
  expect(result.account.email).toBe('owner@mail.bnbu.edu.cn');expect(result.account.roles).toContain('student')
  expect(db.prepare('SELECT body FROM mail_outbox').get()?.body).not.toContain(code)
  await expect(auth.emailLogin('owner@mail.bnbu.edu.cn',code,'source')).rejects.toThrow('失效')
 }finally{db.close()}
})
it('发信配置缺失或供应商未确认时不声称已发送',async()=>{
 const db=openDatabase(':memory:'),auth=new LearningAuth(sqliteLearningStore(db))
 try{
  vi.stubEnv('BNBU_EMAIL_DELIVERY_URL','');await expect(auth.requestCode('owner@example.test','source',false)).rejects.toThrow('尚未配置')
  vi.stubEnv('BNBU_EMAIL_PROVIDER','aoksend');vi.stubEnv('BNBU_EMAIL_DELIVERY_URL','https://apiv2.aoksend.com/index/api/send_email');vi.stubEnv('BNBU_AOKSEND_APP_KEY','test-only-key');vi.stubEnv('BNBU_AOKSEND_TEMPLATE_ID','test-only-template');vi.stubEnv('BNBU_AOKSEND_CODE_VARIABLE','code')
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({code:40003})))
  await expect(auth.requestCode('owner@example.test','source',false)).rejects.toThrow('未确认')
  expect(db.prepare('SELECT delivered_at FROM mail_outbox').get()?.delivered_at).toBeNull()
 }finally{db.close()}
})
