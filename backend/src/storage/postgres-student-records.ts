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
      reasonCode:record.data.publicReason ?? null,publicComment:record.data.publicExplanation ?? null}};
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
    const progress=(await repo.all('sportsProgress')).filter(p=>p.ownerId===actor.id).sort((a,b)=>Number(b.data.sequence)-Number(a.data.sequence));
    const submittedSessions=new Set(records.map(r=>r.data.sessionId));
    const drafts=(await repo.all('sportsRecordDraft')).filter(r=>r.ownerId===actor.id && !submittedSessions.has(r.data.sessionId));
    const entries=[...drafts.map(recordDraftProjection),...records.map(r=>{
      const d=r.data,session=sessionMap.get(String(d.sessionId));
      const latest=progress.find(p=>p.data.courseId===d.courseId);
      const detail=Array.isArray(latest?.data.details)?(latest.data.details as Fields[]).find(v=>v.recordId===r.id && v.version===r.version):undefined;
      const reviewed=['VALID','INVALID'].includes(String(d.status));
      return {id:String(d.sourceDraftId ?? r.id),studentId:r.ownerId,sessionId:d.sessionId,enrollmentId:session?.data.enrollmentId,
        classSectionId:d.courseId,status:reviewed?'REVIEWED':'SUBMITTED',
        creditType:d.category==='RELATED'?'COURSE_RELATED':'GENERAL',sportType:d.sportType ?? (d.activityType==='SWIM'?'SWIMMING':null),sportName:d.sportName ?? null,
        description:d.description,businessDate:d.businessDate,version:r.version,createdAt:r.createdAt,updatedAt:r.updatedAt,
        actualDurationSeconds:typeof d.activeMilliseconds==='number'?Math.floor(d.activeMilliseconds/1000):null,
        creditedDurationSeconds:typeof detail?.actual==='number'?detail.actual*60:null,eligibleMinutes:detail?.eligible ?? null,creditReason:detail?.reason ?? null,workflowStage:studentWorkflowStage(d.status),
        currentReview:reviewed?{result:d.status,publicComment:d.publicExplanation ?? d.publicReason ?? null}:null};
    })].filter(r=>!enrollmentId || r.enrollmentId===enrollmentId);
    if(id) {const found=entries.find(r=>r.id===id);demand(found,'运动记录不存在。',404);return {data:found};}
    entries.sort((a,b)=>String(b.businessDate).localeCompare(String(a.businessDate)) || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const index=cursor?entries.findIndex(r=>r.id===cursor):-1;
    demand(!cursor || index>=0,'记录分页基准已变化，请刷新。',409);
    const items=entries.slice(index+1,index+1+limit),hasMore=index+1+items.length<entries.length;
    return {data:items,meta:{pagination:{limit,total:entries.length,hasMore,nextCursor:hasMore?items.at(-1)!.id:null}}};
  });
}
