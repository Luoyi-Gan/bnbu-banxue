import { demand, type Account } from '../auth';
import { textField, type Entity, type Fields } from '../repository';
import { sportsRole, version } from '../sports/courses';
import { PostgresRepository } from './postgres-repository';
import { enqueuePostgresTeacher } from './postgres-review-worker';

export async function requireAiGovernor(repo:PostgresRepository,actor:Account) {
  const identities=await repo.all('sportsIdentity');sportsRole({all:()=>identities},actor,'admin');
  demand(actor.roles.includes('superadmin'),'仅总管理员可治理AI服务。',403);
}
async function complete(repo:PostgresRepository,record:Entity) {
  const batch=await repo.get(record.data.batchId,'sportsMaterialBatch'),materials=(await repo.all('sportsMaterial')).filter(m=>m.data.batchId===batch.id);
  demand(batch.data.status==='COMPLETE' && materials.length>0 && materials.every(m=>m.data.status==='COMPLETE'),'材料未完整到账，不能审核。',409);
}
export async function postgresAiGovernance(repo:PostgresRepository,actor:Account,action:string,input:Fields) {
  await requireAiGovernor(repo,actor);
  if(action==='sports.ai.manual') {
    const course=await repo.get(input.courseId,'sportsCourse'),now=Date.now(),endAt=Date.parse(textField(input,'endAt',80));
    demand(Number.isFinite(endAt) && endAt>now,'人工模式结束时间须晚于当前时刻。');
    const mode=await repo.create('sportsManualMode',actor.id,{courseId:course.id,startAt:now,endAt,reason:textField(input,'reason',1000),status:'ACTIVE'});
    await repo.notify([course.ownerId!],course.id,action,'本课程启用有限人工审核至'+new Date(endAt).toISOString()+'：'+mode.data.reason);
    for(const record of (await repo.all('sportsRecord')).filter(r=>r.data.courseId===course.id && ['PENDING_AI','TECHNICAL'].includes(String(r.data.status)))) {await complete(repo,record);await enqueuePostgresTeacher(repo,record,'MANUAL:'+mode.id);}
    return {id:mode.id};
  }
  if(action==='sports.ai.stop') {
    const mode=await repo.get(input.id,'sportsManualMode');version(mode,input);
    return {id:(await repo.save(mode,{status:'STOPPED',stoppedAt:Date.now(),stopReason:textField(input,'reason',1000)})).id};
  }
  demand(action==='sports.ai.retry','未知AI治理操作。');
  const record=await repo.get(input.id,'sportsRecord');version(record,input);
  demand(record.data.status==='TECHNICAL','仅技术失败任务可重试，不能覆盖教学结果。',409);
  await complete(repo,record);return {id:(await repo.save(record,{status:'PENDING_AI',technicalCode:null})).id};
}
