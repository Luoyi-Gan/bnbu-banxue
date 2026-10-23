import {afterEach,describe,it,expect,vi} from 'vitest'
import {createServer} from 'node:http'
import {parseSportsInvite} from '../shared/v2/sportsInvite'
import {movementRequest,movementSubject} from '../backend/src/movement'
import {createHmac,timingSafeEqual} from 'node:crypto'
const verifySignature=(secret:string,time:string,nonce:string,body:string,supplied:string)=>{const expected=createHmac('sha256',secret).update(`companion-sports-v1\n${time}\n${nonce}\n${body}`).digest('hex');return expected.length===supplied.length&&timingSafeEqual(Buffer.from(expected),Buffer.from(supplied))}
const secret='test-bridge-key-that-is-long-enough-12345'
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
describe('运动平台连接与扫码',()=>{
 it('学校登录的40位账号ID映射为稳定UUID，保留旧UUID并隔离不同账号',()=>{
  const school='7a'.repeat(20),subject=movementSubject(school);
  expect(subject).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  expect(subject).toBe(movementSubject(school));expect(subject).not.toBe(movementSubject('7b'.repeat(20)));
  const existing='a3b9c2de-1234-5678-90ab-cdef12345678';expect(movementSubject(existing)).toBe(existing);
  expect(()=>movementSubject('')).toThrow();expect(()=>movementSubject('a b')).toThrow();
 })
 const token='a3b9c2de-1234-5678-90ab-cdef12345678.secret_token-123'
 it('识别原平台带点号邀请码、二维码链接和join路径，拒绝任意站点与脚本',()=>{
  for(const input of [token,`https://www.student.bnbusports.cn/student/?invite=${token}`,`https://www.student.bnbusports.cn/join/${token}`])expect(parseSportsInvite(input,'https://www.student.bnbusports.cn')).toBe(token)
  for(const input of ['javascript:alert(1)',`https://evil.test/student/?invite=${token}`,'123','https://www.student.bnbusports.cn/student/'])expect(()=>parseSportsInvite(input,'https://www.student.bnbusports.cn')).toThrow()
 })
 it('未配置时不能把不可用状态解释成新用户',async()=>{
  vi.stubEnv('BNBU_SPORTS_BRIDGE_ORIGIN','');vi.stubEnv('BNBU_SPORTS_BRIDGE_SECRET','')
  await expect(movementRequest({id:'a3b9c2de-1234-5678-90ab-cdef12345678',email:'own@mail.bnbu.edu.cn',name:'同学',organization:'学校',roles:['student'],status:'active'},true,'resolve')).rejects.toMatchObject({status:503})
 })
 it('真实模式拒绝把模拟目录当作体育账号结果',async()=>{
  vi.stubEnv('BNBU_SPORTS_MODE','real');vi.stubEnv('BNBU_SPORTS_BRIDGE_ORIGIN','http://127.0.0.1:4180');vi.stubEnv('BNBU_SPORTS_BRIDGE_SECRET',secret)
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({state:'new',localAcceptance:true}),{status:200})))
  await expect(movementRequest({id:'a3b9c2de-1234-5678-90ab-cdef12345678',email:'own@mail.bnbu.edu.cn',name:'同学',organization:'学校',roles:['student'],status:'active'},true,'resolve')).rejects.toMatchObject({status:503})
 })
 it('真实HTTP请求只带服务端本人邮箱，旧邮箱账号即使零记录也进入existing',async()=>{
  let received:Record<string,unknown>|undefined
  const server=createServer(async(req,res)=>{let body='';for await(const part of req)body+=part;received=JSON.parse(body);const time=String(req.headers['x-bridge-time']),nonce=String(req.headers['x-bridge-nonce']);expect(verifySignature(secret,time,nonce,body,String(req.headers['x-bridge-signature']))).toBe(true);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({state:'existing',checkedAt:new Date().toISOString()}))})
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const port=(server.address() as {port:number}).port
  try{
   vi.stubEnv('BNBU_SPORTS_BRIDGE_ORIGIN',`http://127.0.0.1:${port}`);vi.stubEnv('BNBU_SPORTS_BRIDGE_SECRET',secret);vi.stubEnv('BNBU_SPORTS_WEB_ORIGIN','https://www.student.bnbusports.cn')
   const actor={id:'a3b9c2de-1234-5678-90ab-cdef12345678',email:'own@mail.bnbu.edu.cn',name:'同学',organization:'学校',roles:['student'],status:'active' as const}
   expect(await movementRequest(actor,true,'resolve')).toMatchObject({state:'existing',sportsOrigin:'https://www.student.bnbusports.cn'})
   expect(received).toMatchObject({subject:actor.id,email:actor.email})
   await expect(movementRequest(actor,false,'resolve')).rejects.toMatchObject({status:403})
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()))}
 })
})
