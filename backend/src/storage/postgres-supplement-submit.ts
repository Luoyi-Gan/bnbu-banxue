import { demand, type Account } from '../auth';
import type { Entity, Fields } from '../repository';
import { version } from '../sports/courses';
import { supplementFiles, supplementOpen } from '../sports/supplements';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate } from './postgres-record-drafts';
import { configuredObjectStore } from './cos-object-store';
import { objectKey } from './object-store';
import { enqueuePostgresTeacher } from './postgres-review-worker';

export async function submitStudentSupplement(repo:PostgresRepository,actor:Account,input:Fields) {
  await recordDraftGate(repo,actor);
  demand(Object.keys(input).every(k=>['id','expectedVersion','mediaIds'].includes(k)),'补证提交参数无效。');
  const record=(await repo.all('sportsRecord')).find(r=>r.ownerId===actor.id && (r.id===input.id || r.data.sourceDraftId===input.id));
  demand(record,'运动记录不存在。',404);version(record,{version:input.expectedVersion});
  const entities:Entity[]=[];
  for(const kind of ['sportsPause','sportsSystem','sportsCourse','sportsSemester','sportsMaterial','sportsMaterialBatch']) entities.push(...await repo.all(kind));
  const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind),get:(id:unknown,kind?:string)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,'补证来源不存在。',409);return e;}};
  supplementOpen(reader,record);
  demand(!record.data.supplementBatchId && !record.data.supplementAcceptedAt,'本记录已有补证批次。',409);
  demand(Array.isArray(input.mediaIds) && input.mediaIds.length>0 && input.mediaIds.length<=7 && new Set(input.mediaIds).size===input.mediaIds.length,'补证材料列表无效。');
  const media:Entity[]=[],originals:Entity[]=[],fresh:Entity[]=[];
  for(const id of input.mediaIds) {
    const m=await repo.get(id,'sportsMediaUpload');
    demand(m.ownerId===actor.id && m.data.sessionId===record.data.sessionId && m.data.businessPurpose==='EXERCISE_RECORD','材料不属于本次运动。',403);
    demand(m.data.bound===true && m.data.uploadStatus==='AVAILABLE','材料尚未验证完成。',409);
    const bytes=await configuredObjectStore().get(String(m.data.objectKey));
    demand(objectKey(bytes)===m.data.declaredContentSha256,'材料指纹不一致。',409);
    const original=reader.all('sportsMaterial').find(e=>e.data.recordId===record.id && e.data.batchId===record.data.batchId && e.data.mediaId===m.id && e.data.status==='COMPLETE');
    if(original) originals.push(original);
    else {demand(m.data.supplementRecordId===record.id && !m.data.recordId,'材料不是本次补证上传。',409);fresh.push(m);}
    media.push(m);
  }
  const {files,reused,lockedOriginals}=supplementFiles(reader,actor,record,{reuseIds:originals.map(m=>m.id),files:fresh.map(m=>({clientId:m.id,mime:m.data.mimeType,size:m.data.fileSizeBytes,sha256:m.data.declaredContentSha256}))});
  const now=Date.now(),batch=await repo.create('sportsMaterialBatch',actor.id,{recordId:record.id,sessionId:record.data.sessionId,sequence:2,status:'COMPLETE',preparedAt:now,acceptedAt:now});
  for(const [index,file] of files.entries()) {
    const source=reused[index],m=source?media.find(m=>m.id===source.data.mediaId)!:fresh[index-reused.length];
    await repo.create('sportsMaterial',actor.id,{...file,recordId:record.id,batchId:batch.id,sessionId:record.data.sessionId,status:'COMPLETE',mediaId:m.id,objectKey:m.data.objectKey,completedAt:m.data.verifiedAt,
      ...(source?{sourceMaterialId:source.id}:{}),...(lockedOriginals?{lockedOriginalMaterialId:lockedOriginals[index].id}:{}),
      ...(record.data.activityType==='SWIM'?{phase:source?.data.phase ?? lockedOriginals?.[index].data.phase ?? 'AUXILIARY',beforeEvidenceId:source?.data.beforeEvidenceId ?? lockedOriginals?.[index].data.beforeEvidenceId ?? null}:{})});
    if(!source) await repo.save(m,{recordId:record.id,publicRecordId:record.data.sourceDraftId ?? record.id});
  }
  const saved=await repo.save(record,{batchId:batch.id,supplementBatchId:batch.id,supplementAcceptedAt:now});
  await repo.create('sportsReviewEvent',actor.id,{recordId:record.id,batchId:batch.id,action:'SUPPLEMENT_ACCEPTED',at:now});
  await enqueuePostgresTeacher(repo,saved,'SUPPLEMENT');
  const latest=await repo.get(record.id);
  return {id:String(record.data.sourceDraftId ?? record.id),version:latest.version,status:'SUBMITTED',workflowStage:'PENDING_TEACHER',materialVersion:2};
}
