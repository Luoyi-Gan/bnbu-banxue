import { randomUUID } from 'node:crypto';
import { demand } from '../auth';
import type { Entity, Fields } from '../repository';
import { calculateProgress } from '../sports/progress';
import { callSportsAi } from '../sports/ai-adapter';
import type { AiConnection } from '../sports/review-worker';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { configuredObjectStore } from './cos-object-store';

async function enqueue(repo:PostgresRepository,record:Entity,source:string) {
  const course=await repo.get(record.data.courseId,'sportsCourse');
  const rounds=(await repo.all('sportsReviewRound')).filter(r=>r.data.recordId===record.id);
  const calendar=(await repo.all('sportsCalendar')).sort((a,b)=>Number(b.data.sequence)-Number(a.data.sequence))[0];
  if(!rounds.some(r=>r.data.status==='OPEN')) await repo.create('sportsReviewRound',course.ownerId,{recordId:record.id,batchId:record.data.batchId,sequence:rounds.length+1,status:'OPEN',startedAt:Date.now(),calendarId:calendar?.id ?? null,calendarVersion:calendar?.version ?? null,calculationStatus:calendar?'BOUND':'CALENDAR_REQUIRED'});
  await repo.save(record,{status:'TEACHER_PENDING',queueSource:source,technicalCode:null});
  await repo.create('sportsReviewEvent',null,{recordId:record.id,batchId:record.data.batchId,action:'TEACHER_QUEUED',source,at:Date.now()});
  await repo.notify([record.ownerId!,course.ownerId!],record.id,'sports.review.queued','运动记录进入责任教师复核，尚未计入进度。');
}
export async function processPostgresSportsReview(db:PostgresDatabase,connection:AiConnection={url:process.env.BNBU_SPORTS_AI_URL,token:process.env.BNBU_SPORTS_AI_TOKEN,validationRef:process.env.BNBU_SPORTS_AI_VALIDATION_REF}) {
  const claimed=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422, 2)');const repo=new PostgresRepository(client);
    if((await repo.all('sportsSystem')).some(s=>s.data.mode!=='NORMAL')) return null;
    const tasks=await repo.all('sportsAiTask');
    const record=(await repo.all('sportsRecord')).find(r=>r.data.status==='PENDING_AI' && !tasks.some(t=>t.data.recordId===r.id && t.data.status==='PROCESSING' && Number(t.data.startedAt)>Date.now()-60000));
    if(!record) return null;
    const batch=await repo.get(record.data.batchId,'sportsMaterialBatch');
    const materials=(await repo.all('sportsMaterial')).filter(m=>m.data.batchId===batch.id);
    demand(batch.data.status==='COMPLETE' && materials.length>0 && materials.every(m=>m.data.status==='COMPLETE'),'材料未完整到账，不能审核。',409);
    const mode=(await repo.all('sportsManualMode')).find(m=>m.data.courseId===record.data.courseId && m.data.status==='ACTIVE' && Number(m.data.startAt)<=Date.now() && Date.now()<Number(m.data.endAt));
    if(mode) {await enqueue(repo,record,'MANUAL:'+mode.id);return null;}
    const old=tasks.find(t=>t.data.recordId===record.id && t.data.batchId===batch.id);
    const fields={recordId:record.id,batchId:batch.id,recordVersion:record.version,batchVersion:batch.version,requestId:randomUUID(),startedAt:Date.now(),status:'PROCESSING',attempt:Number(old?.data.attempt ?? 0)+1};
    const task=old?await repo.save(old,fields):await repo.create('sportsAiTask',null,fields);
    return {record,batch,task,materials};
  });
  if(!claimed) return;
  const {record,batch,task,materials}=claimed;
  let result:Fields|undefined,technicalCode:string|undefined;
  if(!connection.url) technicalCode='AI_NOT_CONFIGURED';
  else if(!connection.validationRef) technicalCode='AI_NOT_VALIDATED';
  else try {
    const evidence=await Promise.all(materials.map(async m=>({id:m.id,mime:m.data.mime,phase:m.data.phase ?? 'AUXILIARY',sha256:m.data.sha256,contentBase64:(await configuredObjectStore().get(String(m.data.objectKey))).toString('base64')})));
    result=await callSportsAi(connection,record,batch,task,evidence);
  } catch {technicalCode='AI_UNAVAILABLE_OR_INVALID_RESPONSE';}
  await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422, 2)');const repo=new PostgresRepository(client);
    const latest=await repo.get(record.id),currentTask=await repo.get(task.id),currentBatch=await repo.get(batch.id);
    if(currentTask.data.requestId!==task.data.requestId) return;
    const same=latest.version===record.version && latest.data.status==='PENDING_AI' && latest.data.batchId===batch.id && currentBatch.version===batch.version && !(await repo.all('sportsSystem')).some(s=>s.data.mode!=='NORMAL');
    const outcome={status:!same?'DISCARDED':technicalCode?'FAILED':'COMPLETE',endedAt:Date.now(),technicalCode:technicalCode ?? null,result:result ?? null,...(!same?{reason:'STATE_OR_VERSION_CHANGED'}:{})};
    await repo.create('sportsAiAttempt',null,{taskId:task.id,...task.data,...outcome});await repo.save(currentTask,outcome);
    if(!same) return;
    if(technicalCode) {
      await repo.save(latest,{status:'TECHNICAL',technicalCode});
      await repo.create('sportsReviewEvent',null,{recordId:record.id,batchId:batch.id,taskId:task.id,action:'TECHNICAL_FAILURE',technicalCode,at:Date.now()});
      await repo.notify([record.ownerId!],record.id,'sports.ai.technical','运动材料已保存，检查服务暂不可用，正在技术处理中；不会因此判为无效。');
    } else if(result?.outcome==='EXCEPTION') await enqueue(repo,latest,'AI:'+task.id);
    else {
      const saved=await repo.save(latest,{status:'VALID',lastDecisionAt:Date.now(),aiTaskId:task.id,technicalCode:null});
      const kinds=['sportsCourse','sportsRecord','sportsSession','sportsProgress','sportsCertification'],entities:Entity[]=[];
      for(const kind of kinds) entities.push(...await repo.all(kind));
      const projection=calculateProgress({all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,'进度来源不存在。',409);return e;}},String(saved.data.courseId),saved.ownerId);
      await repo.create('sportsProgress',saved.ownerId,{...projection,cause:'AI_PASS',at:Date.now()});
      await repo.create('sportsReviewEvent',null,{recordId:record.id,batchId:batch.id,taskId:task.id,action:'AI_PASS',at:Date.now()});
      await repo.notify([record.ownerId!],record.id,'sports.ai.pass','运动记录已通过检查，进度已按课程规则重新计算。');
    }
  });
}
