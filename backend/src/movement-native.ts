import {movementRequest} from './movement'
import {demand,ServiceError,type Account} from './auth'
import type {MovementCourse,MovementDashboard,MovementRecord,MovementRecords} from '../../shared/v2/movementDashboard'
type Row=Record<string,unknown>
const row=(value:unknown):Row=>value&&typeof value==='object'&&!Array.isArray(value)?value as Row:{}
const text=(value:unknown)=>typeof value==='string'?value:''
const seconds=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
type Session={token:string;userId:string;expires:number;origin:string}
const sessions=new Map<string,Promise<Session>>()
export function forgetMovementAccount(accountID:string){for(const key of sessions.keys())if(JSON.parse(key)[0]===accountID)sessions.delete(key);}
const keyFor=(actor:Account)=>JSON.stringify([actor.id,actor.email])
async function session(actor:Account,verified:boolean){
 demand(verified&&actor.roles.includes('student')&&actor.status!=='banned','需要本人已验证的有效学生账号。',403)
 const key=keyFor(actor),existing=sessions.get(key)
 if(existing){const value=await existing;if(value.expires>Date.now())return value;sessions.delete(key)}
 const pending=(async()=>{
  const launch=await movementRequest(actor,verified,'launch',{destination:'sports'})
  const url=new URL(String(launch.url)),code=url.hash.slice(1)
  const response=await fetch(new URL('/api/companion-bridge/handoff',url.origin),{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({code})})
  demand(response.ok,'体育会话暂时无法建立，请刷新重试。',503)
  const auth=row(row(await response.json()).authSession),user=row(auth.user)
  demand(typeof auth.accessToken==='string'&&auth.accessToken.length>20&&uuid.test(text(user.id)),'体育会话返回无效。',503)
  const expiry=Date.parse(text(auth.accessTokenExpiresAt));demand(Number.isFinite(expiry)&&expiry>Date.now(),'体育会话已过期，请重试。',503)
  return {token:auth.accessToken,userId:text(user.id),expires:Math.min(expiry-10000,Date.now()+5*60000),origin:url.origin}
 })()
 if(sessions.size>200){for(const [k,p]of sessions)void p.then(s=>{if(s.expires<Date.now())sessions.delete(k)}).catch(()=>sessions.delete(k));demand(sessions.size<250,'体育连接繁忙，请稍后重试。',503)}
 sessions.set(key,pending)
 try{return await pending}catch(error){sessions.delete(key);throw error}
}
async function get(actor:Account,s:Session,path:string,optional=false):Promise<{data:unknown;meta:Row}|null>{
 const response=await fetch(new URL('/api/v1'+path,s.origin),{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+s.token,Accept:'application/json'}})
 if(response.status===404&&optional)return null
 if(response.status===401)sessions.delete(keyFor(actor))
 if(!response.ok)throw new ServiceError(response.status===401?503:response.status,'SPORTS_READ','暂时无法读取本人体育资料，请刷新重试。')
 const value=row(await response.json());demand(Object.hasOwn(value,'data'),'体育资料格式异常。',503)
 return {data:value.data,meta:row(value.meta)}
}
async function list(actor:Account,s:Session,path:string,optional=false){
 const result:unknown[]=[],seen=new Set<string>();let cursor=''
 for(let page=0;page<20;page++){
  const value=await get(actor,s,path+(cursor?(path.includes('?')?'&':'?')+'cursor='+encodeURIComponent(cursor):''),optional)
  if(value===null)return null
  demand(Array.isArray(value.data),'体育列表格式异常。',503);result.push(...value.data)
  const next=row(value.meta.pagination).nextCursor
  if(next===null)return result
  demand(typeof next==='string'&&next.length>0&&!seen.has(next),'体育列表分页异常。',503);seen.add(next);cursor=next
 }
 throw new ServiceError(503,'SPORTS_READ','体育列表较多，请稍后重试。')
}
const sports:Record<string,string>={RUNNING:'跑步',WALKING:'健走',SWIMMING:'游泳',BADMINTON:'羽毛球',BASKETBALL:'篮球',FOOTBALL:'足球',TENNIS:'网球',TABLE_TENNIS:'乒乓球',GOLF:'高尔夫',OTHER:'其他运动'}
function record(value:unknown,student:string):MovementRecord{
 const d=row(value);demand(d.studentId===student,'体育记录归属异常。',403)
 const review=row(d.currentReview)
 return {id:text(d.id),enrollmentId:text(d.enrollmentId),sport:text(d.sportName)||sports[text(d.sportType)]||text(d.sportType)||'运动',businessDate:text(d.businessDate),actualSeconds:seconds(d.actualDurationSeconds),creditedSeconds:seconds(d.creditedDurationSeconds),status:text(d.status),review:text(review.result),comment:text(review.publicComment),category:text(d.creditType)}
}
async function identity(actor:Account,s:Session){
 const me=row((await get(actor,s,'/me'))?.data)
 demand(row(me.user).id===s.userId&&typeof row(me.studentProfile).id==='string','体育账号归属异常。',403)
 return text(row(me.studentProfile).id)
}
async function records(actor:Account,s:Session,student:string,input:Row):Promise<MovementRecords>{
 const cursor=input.cursor,enrollment=input.enrollmentId
 demand(cursor==null||typeof cursor==='string'&&cursor.length<=2048,'分页参数无效。')
 demand(enrollment==null||typeof enrollment==='string'&&uuid.test(enrollment),'课程参数无效。')
 const params=new URLSearchParams({limit:'50',sort:'-businessDate'});if(cursor)params.set('cursor',String(cursor));if(enrollment)params.set('enrollmentId',String(enrollment))
 const page=await get(actor,s,'/exercise-records?'+params),next=row(page?.meta.pagination).nextCursor
 demand(Array.isArray(page?.data)&&(next===null||typeof next==='string'),'体育记录分页异常。',503)
 return {items:page.data.map(d=>record(d,student)).filter(d=>['SUBMITTED','REVIEWED'].includes(d.status)),nextCursor:next as string|null}
}
export async function movementNative(actor:Account,verified:boolean,operation:string,input:Row={}):Promise<MovementDashboard|MovementRecords>{
 const s=await session(actor,verified),student=await identity(actor,s)
 if(operation==='sports.records')return records(actor,s,student,input)
 demand(operation==='sports.dashboard','无效体育操作。')
 const [semesterResult,enrollments,sections,progress,history]=await Promise.all([get(actor,s,'/semesters/current',true),list(actor,s,'/enrollments'),list(actor,s,'/class-sections'),list(actor,s,'/student-progress?limit=100',true),records(actor,s,student,{})])
 const semester=row(semesterResult?.data),own=(enrollments??[]).map(row).filter(e=>e.studentId===student&&(sections??[]).some(item=>row(item).id===e.classSectionId))
 const warnings:string[]=[];if(progress===null)warnings.push('当前体育服务暂未提供考核进度，进度保持待同步。')
 const courses:MovementCourse[]=await Promise.all(own.map(async e=>{
  const section=(sections??[]).map(row).find(item=>item.id===e.classSectionId)??{}
  const course=row((await get(actor,s,'/courses/'+encodeURIComponent(text(section.courseId)),true))?.data)
  const p=(progress??[]).map(row).find(item=>item.enrollmentId===e.id),related=row(p?.courseRelated),general=row(p?.general)
  return {id:text(section.id),enrollmentId:text(e.id),name:text(section.displayName)||text(course.courseName)||'体育课程',classCode:text(section.classCode),teacher:text(section.teacherDisplayName)||text(section.teacherName),semester:text(section.semesterId)===text(semester.id)?text(semester.displayName)||[text(semester.academicYear),text(semester.termCode)].filter(Boolean).join(' · '):'',current:!!semester.id&&section.semesterId===semester.id,status:text(e.status),progress:p?{courseSeconds:seconds(related.effectiveSeconds)??seconds(related.validExerciseSeconds),generalSeconds:seconds(general.effectiveSeconds)??seconds(general.validExerciseSeconds),courseTargetSeconds:seconds(related.targetSeconds),generalTargetSeconds:seconds(general.targetSeconds),totalTargetSeconds:seconds(related.targetSeconds)!==null&&seconds(general.targetSeconds)!==null?Number(related.targetSeconds)+Number(general.targetSeconds):null,status:text(p.status)}:null}
 }))
 return {courses,records:history,updatedAt:new Date().toISOString(),warnings}
}
