import {afterEach,describe,expect,it,vi} from 'vitest'
import {randomUUID} from 'node:crypto'
import {movementNative} from '../backend/src/movement-native'
const apiRoot='https://www.student.bnbusports.cn'
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
function fixture(otherRecord=false,progressMissing=false){
 const id=randomUUID(),student=randomUUID(),enrollment=randomUUID(),section=randomUUID(),semester=randomUUID(),course=randomUUID(),sportsUser=randomUUID(),token='a-realistic-server-only-token-for-tests',calls:{url:string;auth:string|null;body:unknown}[]=[]
 const actor={id,email:'owner@mail.bnbu.edu.cn',name:'Owner',roles:['student'],organization:'BNBU',status:'active' as const}
 vi.stubEnv('BNBU_SPORTS_BRIDGE_ORIGIN','http://127.0.0.1:4180');vi.stubEnv('BNBU_SPORTS_BRIDGE_SECRET','s'.repeat(40));vi.stubEnv('BNBU_SPORTS_WEB_ORIGIN',apiRoot)
 const json=(data:unknown,meta:unknown={})=>new Response(JSON.stringify({data,meta}),{status:200})
 const page=(data:unknown)=>json(data,{pagination:{nextCursor:null}})
 vi.stubGlobal('fetch',vi.fn(async(url:URL|string,options:RequestInit={})=>{
  const u=new URL(String(url));calls.push({url:u.pathname,auth:new Headers(options.headers).get('Authorization'),body:options.body?JSON.parse(String(options.body)):null})
  if(u.pathname==='/internal/companion-sports')return new Response(JSON.stringify({url:apiRoot+'/student/companion.html#'+'x'.repeat(43)}))
  if(u.pathname==='/api/companion-bridge/handoff')return new Response(JSON.stringify({authSession:{accessToken:token,accessTokenExpiresAt:new Date(Date.now()+600000).toISOString(),refreshToken:'never-return-this',user:{id:sportsUser}}}))
  expect(new Headers(options.headers).get('Authorization')).toBe('Bearer '+token)
  if(u.pathname==='/api/v1/me')return json({user:{id:sportsUser},studentProfile:{id:student,fullName:'Not forwarded'}})
  if(u.pathname==='/api/v1/semesters/current')return json({id:semester,displayName:'当前学期'})
  if(u.pathname==='/api/v1/enrollments')return page([{id:enrollment,studentId:student,classSectionId:section,status:'ACTIVE'},{id:randomUUID(),studentId:randomUUID(),classSectionId:section,status:'ACTIVE'},{id:randomUUID(),studentId:student,classSectionId:randomUUID(),status:'WITHDRAWN'}])
  if(u.pathname==='/api/v1/class-sections')return page([{id:section,courseId:course,semesterId:semester,displayName:'高尔夫',classCode:'G1'}])
  if(u.pathname==='/api/v1/courses/'+course)return json({courseName:'体育'})
  if(u.pathname==='/api/v1/student-progress')return progressMissing?new Response('{}',{status:404}):page([{enrollmentId:enrollment,status:'COMPLETED',courseRelated:{effectiveSeconds:36000,targetSeconds:36000},general:{effectiveSeconds:36000,targetSeconds:36000}}])
  if(u.pathname==='/api/v1/exercise-records')return page([{id:randomUUID(),studentId:otherRecord?randomUUID():student,enrollmentId:enrollment,sportType:'RUNNING',businessDate:'2026-10-22',actualDurationSeconds:600,creditedDurationSeconds:0,status:'REVIEWED',currentReview:{result:'VALID',publicComment:'有效但未计入'},accessToken:'must-not-leak',location:{lat:99,lng:99},mediaIds:['private-proof']}])
  throw Error('Unexpected route '+u.pathname)
 }))
 return {actor,calls,student,enrollment}
}
describe('native Sports data adapter',()=>{
 it('reads original student APIs and returns only the owner projection without bearer tokens or guessed credit',async()=>{
  const f=fixture(),data=await movementNative(f.actor,true,'sports.dashboard')
  expect(data).toMatchObject({courses:[{name:'高尔夫',current:true,progress:{courseSeconds:36000,generalSeconds:36000,totalTargetSeconds:72000}}],records:{items:[{creditedSeconds:0,actualSeconds:600,review:'VALID'}]}})
  expect('courses' in data&&data.courses).toHaveLength(1)
  const serialized=JSON.stringify(data);for(const secret of ['a-realistic-server-only-token','never-return-this','must-not-leak','mediaIds','location','Not forwarded'])expect(serialized).not.toContain(secret)
  await movementNative(f.actor,true,'sports.records',{})
  expect(f.calls.filter(c=>c.url==='/api/companion-bridge/handoff')).toHaveLength(1)
  expect(f.calls.filter(c=>c.auth).every(c=>c.url.startsWith('/api/v1/'))).toBe(true)
 })
 it('keeps missing progress unknown and rejects an upstream record belonging to another student',async()=>{
  const f=fixture(false,true),data=await movementNative(f.actor,true,'sports.dashboard');expect('courses' in data&&data.courses[0].progress).toBeNull()
  const other=fixture(true);await expect(movementNative(other.actor,true,'sports.dashboard')).rejects.toMatchObject({status:403})
 })
 it('requires current verified ownership and refuses malformed cursors or enrollment filters',async()=>{
  const f=fixture();await expect(movementNative(f.actor,false,'sports.dashboard')).rejects.toMatchObject({status:403})
  expect(f.calls).toHaveLength(0)
  await expect(movementNative(f.actor,true,'sports.records',{enrollmentId:'../other'})).rejects.toMatchObject({status:400})
 })
})
