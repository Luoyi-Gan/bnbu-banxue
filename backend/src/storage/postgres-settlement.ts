import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { PostgresRepository } from './postgres-repository';
import { demand, type Account } from '../auth';
import type { Entity, Fields } from '../repository';
import { ownedCourse } from '../sports/courses';
import { sportsWriteGate } from '../sports/system';
import { buildCourseReportData } from '../sports/report';
import { settlementCheckData, settlementManifestData } from '../sports/settlement';
import { portalSettlementPreviewData } from '../sports/portal-settlement';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';

export async function postgresSettlementPreview(db:PostgresDatabase,token:string,courseId:string,input:Fields) {
  demand(Object.keys(input).length===0,'结算预检不接受客户端统计。');
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    return portalSettlementPreviewData(await postgresSettlementCheck(client,actor,courseId));
  });
}

export async function postgresSettlementCheck(client:PoolClient,actor:Account,courseId:string) {
    const raw=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>('SELECT * FROM entities ORDER BY id')).rows;
    const entities:Entity[]=raw.map(e=>({id:e.id,kind:e.kind,ownerId:e.owner_id,data:JSON.parse(e.data),version:e.version,createdAt:e.created_at,updatedAt:e.updated_at}));
    const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind),get:(id:unknown,kind?:string)=>{
      const entity=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(entity,'结算来源不存在。',404);return entity;
    }};
    const course=ownedCourse(reader,actor,courseId);
    const accounts=(await client.query<Fields>('SELECT id,name,email,status,roles FROM accounts ORDER BY id')).rows;
    const report=buildCourseReportData(reader,course,id=>accounts.find(a=>a.id===id));
    const manifest=settlementManifestData(entities.map(e=>({id:e.id,kind:e.kind,owner_id:e.ownerId,data:e.data,version:e.version})),accounts,course);
    return settlementCheckData(reader,actor,courseId,report,manifest);
}

/** Called only inside executePostgres's serialized command transaction. */
export async function postgresSettlementFinalize(repo:PostgresRepository,actor:Account,input:Fields) {
  demand(Object.keys(input).every(k=>['id','expectedVersion','previewFingerprint'].includes(k)),'结算确认不接受客户端报告内容。');
  demand(typeof input.id==='string' && input.expectedVersion===0,'首次结算版本必须为零。',409);
  demand(typeof input.previewFingerprint==='string' && /^[a-f0-9]{64}$/.test(input.previewFingerprint),'请先核对结算预览。');
  const check=await postgresSettlementCheck(repo.client,actor,input.id);
  demand(check.manifest.hash===input.previewFingerprint,'结算来源已变化，请重新检查并核对。',409);
  demand(!check.blockers.length,'仍有合法待办或教学事项，不能结算。',409);
  demand(!(await repo.all('sportsSettlementReport')).some(r=>r.data.courseId===check.course.id),'已有正式结算，旧事实更正须另出报告版本。',409);
  const prep=await repo.create('sportsSettlementPreparation',actor.id,{courseId:check.course.id,courseVersion:check.course.version,status:'READY',manifest:check.manifest,blockers:[],report:check.report,preparedAt:check.checkedAt});
  const report={...check.report,reportType:'SETTLEMENT_REPORT',settlementStatus:'SETTLED',unresolved:[],limitations:[]};
  const at=Date.now();
  const saved=await repo.create('sportsSettlementReport',actor.id,{courseId:check.course.id,semesterId:check.course.data.semesterId,sequence:1,previousId:null,sourceManifest:check.manifest,report,contentHash:createHash('sha256').update(JSON.stringify(report)).digest('hex'),confirmedAt:at});
  await repo.save(check.course,{status:'CLOSED',enrollmentOpen:false,settlementStatus:'SETTLED',settlementReportId:saved.id,settledAt:at});
  await repo.save(prep,{status:'CONFIRMED',reportId:saved.id});
  const recipients=(await repo.all('sportsEnrollment')).filter(m=>m.data.courseId===check.course.id).map(m=>m.ownerId).filter((id):id is string=>!!id);
  await repo.notify(recipients,saved.id,'sports.settlement.confirm','课程已完成考核结算，原始记录和分类进度保留；内部成绩不在站内公开。');
  return {id:saved.id,version:1,kind:'INITIAL',createdAt:saved.createdAt,correctionReason:null};
}

export async function postgresSettlementGate(repo:PostgresRepository,actor:Account,id:unknown) {
  const identities=await repo.all('sportsIdentity'),systems=await repo.all('sportsSystem'),course=await repo.get(id,'sportsCourse');
  const reader={all:(kind:string)=>kind==='sportsIdentity'?identities:kind==='sportsSystem'?systems:[],get:()=>course};
  ownedCourse(reader,actor,id);sportsWriteGate(reader,'sports.settlement.prepare');
}
