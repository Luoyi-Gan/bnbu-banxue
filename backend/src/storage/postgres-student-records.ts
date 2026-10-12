import { demand } from '../auth';
import { integerField, textField, type Fields } from '../repository';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate, recordDraftProjection } from './postgres-record-drafts';
import { supplementClock } from '../sports/supplements';

export function studentWorkflowStage(status:unknown) {
  return status==='TEACHER_PENDING'?'PENDING_TEACHER':status==='SUPPLEMENT_REQUIRED'?'AWAITING_SUPPLEMENT':status;
}
export function studentReasonCode(reason:unknown) {
  const code=typeof reason==='string'?reason:reason && typeof reason==='object'?(reason as Fields).code:null;
  const codes:Record<string,string>={UNCLEAR:'UNCLEAR_EVIDENCE',MISSING:'MISSING_REQUIRED_EVIDENCE',MISMATCH:'SESSION_MISMATCH',INCONSISTENT:'INCONSISTENT_EVIDENCE',AUTHENTICITY:'AUTHENTICITY_REQUIRES_CLARIFICATION',CONFIRMED_MISUSE:'CONFIRMED_REUSE_OR_MISUSE',SUPPLEMENT_EXPIRED:'SUPPLEMENT_EXPIRED'};
  return typeof code==='string'?(codes[code] ?? code):null;
}

export async function postgresProofTodos(db:PostgresDatabase,token:string,input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    demand(Object.keys(input).every(k=>['limit','cursor'].includes(k)),'补证查询参数无效。');
    const limit=input.limit===undefined?50:integerField({limit:Number(input.limit)},'limit',1,100),cursor=textField(input,'cursor',100,true);
    const records=(await repo.all('sportsRecord')).filter(r=>r.ownerId===actor.id && r.data.status==='SUPPLEMENT_REQUIRED').sort((a,b)=>a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
    const pauses=await repo.all('sportsPause'),systems=await repo.all('sportsSystem'),sessions=await repo.all('sportsSession'),courses=await repo.all('sportsCourse');
    const items=records.map(r=>{
      const clock=supplementClock({all:kind=>kind==='sportsPause'?pauses:systems},r),session=sessions.find(s=>s.id===r.data.sessionId && s.ownerId===actor.id);
      demand(Number.isFinite(clock.deadline) && Number.isFinite(clock.remaining),'补证期限资料不完整。',409);
      const started=(session?.data.clock as Fields|undefined)?.startedAt;
      return {recordId:String(r.data.sourceDraftId ?? r.id),classSectionId:r.data.courseId,courseName:courses.find(c=>c.id===r.data.courseId)?.data.name ?? null,
        sportType:r.data.sportType ?? null,sportName:r.data.sportName ?? null,startedAt:typeof started==='number'?new Date(started).toISOString():null,
        actualDurationSeconds:typeof r.data.activeMilliseconds==='number'?Math.floor(r.data.activeMilliseconds/1000):null,
        reasonCode:studentReasonCode(r.data.publicReason),publicComment:r.data.publicExplanation ?? null,
        deadlineAt:new Date(clock.deadline).toISOString(),remainingSeconds:Math.floor(clock.remaining/1000),paused:clock.paused,expired:clock.remaining<=0};
    });
    const index=cursor?items.findIndex(r=>r.recordId===cursor):-1;demand(!cursor || index>=0,'补证列表已变化，请刷新。',409);
    const page=items.slice(index+1,index+1+limit);
    return {data:{items:page,nextCursor:index+1+page.length<items.length?page.at(-1)!.recordId:null}};
  });
}

export async function postgresStudentWorkflow(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    await recordDraftGate(repo,actor);
    const record=(await repo.all('sportsRecord')).find(r=>r.ownerId===actor.id && (r.id===id || r.data.sourceDraftId===id));
    demand(record,'运动记录不存在。',404);
    const batches=(await repo.all('sportsMaterialBatch')).filter(b=>b.data.recordId===record.id);
    const materials=(await repo.all('sportsMaterial')).filter(m=>m.ownerId===actor.id && m.data.recordId===record.id && m.data.status==='COMPLETE' && typeof m.data.mediaId==='string');
    const pauses=await repo.all('sportsPause'),systems=await repo.all('sportsSystem');
    const clock=record.data.status==='SUPPLEMENT_REQUIRED'?supplementClock({all:kind=>kind==='sportsPause'?pauses:systems},record):null;
    if(clock) demand(Number.isFinite(clock.deadline) && Number.isFinite(clock.remaining),'补证期限资料不完整。',409);
    return {data:{recordId:String(record.data.sourceDraftId ?? record.id),version:record.version,stage:studentWorkflowStage(record.data.status),
      supplement:clock?{paused:clock.paused,expired:clock.remaining<=0,deadlineAt:new Date(clock.deadline).toISOString(),remainingMilliseconds:clock.remaining}:null,
      materials:materials.map(m=>({mediaId:m.data.mediaId,materialVersion:batches.find(b=>b.id===m.data.batchId)?.data.sequence ?? null})),
      reasonCode:studentReasonCode(record.data.publicReason),publicComment:record.data.publicExplanation ?? null}};
  });
}

export async function postgresStudentRecords(db:PostgresDatabase,token:string,input:Fields,id?:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    await recordDraftGate(repo,actor);
    demand(Object.keys(input).every(k=>['limit','cursor','sort','enrollmentId'].includes(k)),'运动记录查询参数无效。');
    demand(input.sort===undefined || input.sort==='-businessDate','运动记录排序无效。');
    const limit=input.limit===undefined?50:integerField({limit:Number(input.limit)},'limit',1,100);
    const enrollmentId=textField(input,'enrollmentId',100,true),cursor=textField(input,'cursor',100,true);
    const sessions=(await repo.all('sportsSession')).filter(s=>s.ownerId===actor.id);
    const sessionMap=new Map(sessions.map(s=>[s.id,s]));
    const records=(await repo.all('sportsRecord')).filter(r=>r.ownerId===actor.id);
    const batches=await repo.all('sportsMaterialBatch');
    const progress=(await repo.all('sportsProgress')).filter(p=>p.ownerId===actor.id).sort((a,b)=>Number(b.data.sequence)-Number(a.data.sequence));
    const submittedSessions=new Set(records.map(r=>r.data.sessionId));
    const drafts=(await repo.all('sportsRecordDraft')).filter(r=>r.ownerId===actor.id && !submittedSessions.has(r.data.sessionId));
    const entries=[...drafts.map(recordDraftProjection),...records.map(r=>{
      const d=r.data,session=sessionMap.get(String(d.sessionId));
      const latest=progress.find(p=>p.data.courseId===d.courseId);
      const detail=Array.isArray(latest?.data.details)?(latest.data.details as Fields[]).find(v=>v.recordId===r.id && v.version===r.version):undefined;
      const reviewed=['VALID','INVALID'].includes(String(d.status));
      return {id:String(d.sourceDraftId ?? r.id),studentId:r.ownerId,sessionId:d.sessionId,enrollmentId:session?.data.enrollmentId,
        classSectionId:d.courseId,status:reviewed?'REVIEWED':'SUBMITTED',materialVersion:batches.find(b=>b.id===d.batchId && b.data.recordId===r.id)?.data.sequence ?? null,
        creditType:d.category==='RELATED'?'COURSE_RELATED':'GENERAL',sportType:d.sportType ?? (d.activityType==='SWIM'?'SWIMMING':null),sportName:d.sportName ?? null,
        description:d.description,businessDate:d.businessDate,version:r.version,createdAt:r.createdAt,updatedAt:r.updatedAt,
        actualDurationSeconds:typeof d.activeMilliseconds==='number'?Math.floor(d.activeMilliseconds/1000):null,
        creditedDurationSeconds:typeof detail?.actual==='number'?detail.actual*60:null,eligibleMinutes:detail?.eligible ?? null,creditReason:detail?.reason ?? null,workflowStage:studentWorkflowStage(d.status),
        currentReview:reviewed || d.publicReason?{result:reviewed?d.status:studentWorkflowStage(d.status),reasonCode:studentReasonCode(d.publicReason),publicComment:d.publicExplanation ?? null}:null};
    })].filter(r=>!enrollmentId || r.enrollmentId===enrollmentId);
    if(id) {const found=entries.find(r=>r.id===id);demand(found,'运动记录不存在。',404);return {data:found};}
    entries.sort((a,b)=>String(b.businessDate).localeCompare(String(a.businessDate)) || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const index=cursor?entries.findIndex(r=>r.id===cursor):-1;
    demand(!cursor || index>=0,'记录分页基准已变化，请刷新。',409);
    const items=entries.slice(index+1,index+1+limit),hasMore=index+1+items.length<entries.length;
    return {data:items,meta:{pagination:{limit,total:entries.length,hasMore,nextCursor:hasMore?items.at(-1)!.id:null}}};
  });
}
