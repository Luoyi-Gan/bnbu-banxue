import { demand, type Account } from '../auth';
import { enumField, integerField, textField, type Entity, type Fields } from '../repository';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate } from './postgres-record-drafts';
import type { SportsClock } from '../sports/session-clock';
import { version } from '../sports/courses';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { configuredObjectStore } from './cos-object-store';
import { objectKey } from './object-store';
import { inspectMedia } from '../sports/media-inspection';

export function studentMediaProjection(m:Entity) {
  const d=m.data;
  return {id:m.id,sessionId:d.sessionId,businessPurpose:d.businessPurpose,mediaType:d.mediaType,mimeType:d.mimeType,verifiedMimeType:d.uploadStatus==='AVAILABLE'?d.mimeType:null,
    uploadStatus:d.uploadStatus,verificationStatus:d.uploadStatus==='AVAILABLE'?'VERIFIED':'PENDING',
    declaredContentSha256:d.declaredContentSha256,declaredFileSizeBytes:d.fileSizeBytes,declaredDurationSeconds:d.durationSeconds,
    verifiedFileSizeBytes:d.verifiedFileSizeBytes ?? null,verifiedDurationSeconds:d.verifiedDurationSeconds ?? null,
    version:m.version,createdAt:m.createdAt,updatedAt:m.updatedAt};
}
export async function mediaCommand(repo:PostgresRepository,actor:Account,operation:string,input:Fields) {
  await recordDraftGate(repo,actor);
  if(operation==='initiate') {
    demand(Object.keys(input).every(k=>['sessionId','businessPurpose','mediaType','mimeType','fileSizeBytes','captureSource','declaredContentSha256','durationSeconds'].includes(k)),'材料上传参数无效。');
    const session=await repo.get(input.sessionId,'sportsSession');
    demand(session.ownerId===actor.id,'只能上传本人的运动材料。',403);
    const clock=session.data.clock as unknown as SportsClock;
    demand(clock.state==='ENDED' && !session.data.cancelledAt && clock.endedAt!==null,'请先正常结束运动。',409);
    demand(Date.now()<clock.endedAt+24*3600000,'首次材料受理窗口已结束。',409);
    demand((await repo.all('sportsRecordDraft')).some(r=>r.ownerId===actor.id && r.data.sessionId===session.id && r.data.status==='DRAFT'),'请先保存本次运动草稿。',409);
    demand(!(await repo.all('sportsRecord')).some(r=>r.data.sessionId===session.id),'本次运动已受理，请使用原材料批次。',409);
    const businessPurpose=enumField(input,'businessPurpose',['EXERCISE_RECORD'] as const),mediaType=enumField(input,'mediaType',['IMAGE','VIDEO'] as const),mimeType=enumField(input,'mimeType',['image/jpeg','image/png','video/mp4'] as const);
    demand((mediaType==='VIDEO')===(mimeType==='video/mp4'),'文件类型不一致。');
    const fileSizeBytes=integerField(input,'fileSizeBytes',1,mediaType==='VIDEO'?100*1024*1024:10*1024*1024);
    const hash=textField(input,'declaredContentSha256',64);demand(/^[a-f0-9]{64}$/.test(hash),'文件校验值无效。');
    const captureSource=enumField(input,'captureSource',['FILE_PICKER','IN_APP_CAMERA'] as const);
    const durationSeconds=mediaType==='VIDEO'?Number(input.durationSeconds):null;
    demand(mediaType==='IMAGE' || (Number.isFinite(durationSeconds) && durationSeconds!>=1 && durationSeconds!<=15),'视频须为1–15秒。');
    const reserved=(await repo.all('sportsMediaUpload')).filter(m=>m.ownerId===actor.id && m.data.sessionId===session.id && (m.data.uploadStatus==='AVAILABLE' || Number(m.data.expiresAt)>Date.now()));
    demand(reserved.filter(m=>m.data.mediaType===mediaType).length<(mediaType==='IMAGE'?6:1),'运动材料数量超过上限。',409);
    const expiresAt=Math.min(Date.now()+30*60000,clock.endedAt+24*3600000);
    const m=await repo.create('sportsMediaUpload',actor.id,{sessionId:session.id,businessPurpose,mediaType,mimeType,fileSizeBytes,captureSource,declaredContentSha256:hash,durationSeconds,expiresAt,uploadStatus:'PENDING'});
    return {mediaId:m.id,uploadSessionId:m.id,uploadUrl:'/api/v1/media-uploads/'+m.id+'/object',uploadMethod:'PUT',requiredHeaders:{'Content-Type':mimeType},expiresAt:new Date(expiresAt).toISOString()};
  }
  const m=await repo.get(input.id,'sportsMediaUpload');demand(m.ownerId===actor.id,'材料不存在。',404);
  if(operation==='access') {
    demand(Object.keys(input).every(k=>['id','purpose'].includes(k)) && input.purpose==='VIEW_ORIGINAL','凭证访问用途无效。');
    demand(m.data.uploadStatus==='AVAILABLE','凭证尚未验证。',409);
    const expiresAt=Date.now()+5*60000;
    const grant=await repo.create('sportsMediaAccess',actor.id,{mediaId:m.id,expiresAt});
    return {accessUrl:'/api/v1/media-access/'+grant.id,expiresAt:new Date(expiresAt).toISOString()};
  }
  if(operation==='confirm') {
    demand(Object.keys(input).every(k=>['id','etag'].includes(k)),'确认参数无效。');
    demand(m.data.uploadStatus==='AVAILABLE' && input.etag===m.data.declaredContentSha256,'文件尚未验证或校验值不一致。',409);
    return studentMediaProjection(m);
  }
  demand(operation==='bind','未知材料操作。');
  demand(Object.keys(input).every(k=>['id','sessionId','expectedVersion'].includes(k)),'绑定参数无效。');
  version(m,{version:input.expectedVersion});
  demand(m.data.sessionId===input.sessionId && m.data.uploadStatus==='AVAILABLE','不能绑定其他运动或尚未验证的材料。',409);
  return studentMediaProjection(await repo.save(m,{bound:true}));
}
export async function postgresMediaRead(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);const m=await repo.get(id,'sportsMediaUpload');demand(m.ownerId===actor.id,'材料不存在。',404);return studentMediaProjection(m);});
}
export async function postgresMediaPut(db:PostgresDatabase,token:string,id:string,bytes:Buffer,mime:string) {
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422, 2)');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const m=await repo.get(id,'sportsMediaUpload');demand(m.ownerId===actor.id,'材料不存在。',404);
    demand(bytes.length===m.data.fileSizeBytes && objectKey(bytes)===m.data.declaredContentSha256 && mime===m.data.mimeType,'文件内容与上传声明不一致。',409);
    if(m.data.uploadStatus==='AVAILABLE') return String(m.data.declaredContentSha256);
    demand(Date.now()<Number(m.data.expiresAt),'上传凭据已过期。',409);
    demand((await repo.all('sportsRecordDraft')).some(r=>r.ownerId===actor.id && r.data.sessionId===m.data.sessionId && r.data.status==='DRAFT'),'本次运动草稿已关闭。',409);
    const inspected=await inspectMedia(bytes,mime),key=await configuredObjectStore().put(bytes,mime);
    await repo.save(m,{uploadStatus:'AVAILABLE',objectKey:key,verifiedFileSizeBytes:bytes.length,verifiedDurationSeconds:'durationSeconds' in inspected?inspected.durationSeconds:null,verifiedAt:Date.now()});
    return key;
  });
}
export async function postgresEvidenceContext(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const record=await repo.get(id);demand(['sportsRecordDraft','sportsRecord'].includes(record.kind) && record.ownerId===actor.id,'运动记录不存在。',404);
    const canonical=record.kind==='sportsRecord'?record.id:record.data.recordId;
    const media=(await repo.all('sportsMediaUpload')).filter(m=>m.ownerId===actor.id && m.data.sessionId===record.data.sessionId && m.data.uploadStatus==='AVAILABLE' && m.data.bound===true && (!canonical || m.data.recordId===canonical));
    return {recordId:record.id,sessionId:record.data.sessionId,mediaIds:media.map(m=>m.id)};
  });
}

export async function postgresMediaOriginal(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const grant=await repo.get(id,'sportsMediaAccess');demand(grant.ownerId===actor.id,'凭证访问不存在。',404);
    demand(Date.now()<Number(grant.data.expiresAt),'凭证查看链接已过期，请重新打开。',410);
    const media=await repo.get(grant.data.mediaId,'sportsMediaUpload');demand(media.ownerId===actor.id && media.data.uploadStatus==='AVAILABLE','凭证不可用。',404);
    const mime=String(media.data.mimeType);demand(['image/png','image/jpeg','video/mp4'].includes(mime),'凭证类型无效。',500);
    return {bytes:await configuredObjectStore().get(String(media.data.objectKey)),mime};
  });
}
