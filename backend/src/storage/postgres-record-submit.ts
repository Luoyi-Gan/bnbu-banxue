import { demand, ServiceError, type Account } from '../auth';
import type { Fields } from '../repository';
import { version } from '../sports/courses';
import { sportsMaterialPolicy } from '../sports/materials';
import { runAsync } from './effects';
import { recordDraftGate, recordDraftProjection } from './postgres-record-drafts';
import { PostgresRepository } from './postgres-repository';
import { configuredObjectStore } from './cos-object-store';

export async function submitStudentRecord(repo:PostgresRepository,actor:Account,input:Fields) {
  await recordDraftGate(repo,actor);
  demand(Object.keys(input).every(k=>['id','mediaIds','expectedVersion','swimDelayReason'].includes(k)),'提交参数无效。');
  const draft=await repo.get(input.id,'sportsRecordDraft');demand(draft.ownerId===actor.id,'运动记录不存在。',404);
  version(draft,{version:input.expectedVersion});demand(draft.data.status==='DRAFT','本次记录已提交或放弃。',409);
  const session=await repo.get(draft.data.sessionId,'sportsSession');
  if(session.data.activityType==='SWIM') throw new ServiceError(503,'SWIM_INTAKE_REQUIRED','游泳预受理接口尚未接通，不能按普通运动提交。');
  demand(input.swimDelayReason===undefined,'普通运动不能使用游泳延迟说明。');
  demand(Array.isArray(input.mediaIds) && input.mediaIds.length>=1 && input.mediaIds.length<=7 && new Set(input.mediaIds).size===input.mediaIds.length,'材料列表无效。');
  const media=await Promise.all(input.mediaIds.map(id=>repo.get(id,'sportsMediaUpload')));
  for(const m of media) {
    demand(m.ownerId===actor.id && m.data.sessionId===session.id && m.data.businessPurpose==='EXERCISE_RECORD','材料不属于本次运动。',403);
    demand(m.data.bound===true && m.data.uploadStatus==='AVAILABLE','材料尚未完整验证。',409);
    await configuredObjectStore().get(String(m.data.objectKey));
  }
  const record=await runAsync(sportsMaterialPolicy(repo,actor,'sports.record.accept',{sessionId:session.id,version:session.version,category:draft.data.creditType==='COURSE_RELATED'?'RELATED':'OTHER',description:draft.data.description,activityType:'EXERCISE',files:media.map(m=>({clientId:m.id,mime:m.data.mimeType,size:m.data.fileSizeBytes,sha256:m.data.declaredContentSha256}))}));
  demand(record,'材料受理失败。',500);
  const materials=(await repo.all('sportsMaterial')).filter(m=>m.data.recordId===record.id);
  for(const material of materials) {
    const source=media.find(m=>m.id===material.data.clientId)!;
    await repo.save(material,{status:'COMPLETE',completedAt:source.data.verifiedAt,objectKey:source.data.objectKey,mediaId:source.id});
    await repo.save(source,{recordId:record.id,publicRecordId:draft.id});
  }
  const now=Date.now(),batch=await repo.get(record.data.batchId,'sportsMaterialBatch');
  await repo.save(batch,{status:'COMPLETE',completedAt:now});
  await repo.save(record,{status:'PENDING_AI',submittedAt:now,sourceDraftId:draft.id,sportType:draft.data.sportType,sportName:draft.data.sportName});
  await repo.create('sportsReviewEvent',null,{recordId:record.id,batchId:batch.id,action:'MATERIALS_COMPLETE',at:now});
  await repo.notify([actor.id],record.id,'sports.material.complete','运动凭证传输完成，等待AI检查；尚未计入进度。');
  const saved=await repo.save(draft,{status:'SUBMITTED',recordId:record.id,submittedAt:now});
  return {...recordDraftProjection(saved),workflowStage:'PENDING_AI',creditedDurationSeconds:null,submittedAt:new Date(now).toISOString()};
}
