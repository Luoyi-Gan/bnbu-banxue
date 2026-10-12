import { demand } from '../auth';
import type { Entity, Fields } from '../repository';
import { ownedCourse } from '../sports/courses';
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
    const raw=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>('SELECT * FROM entities ORDER BY id')).rows;
    const entities:Entity[]=raw.map(e=>({id:e.id,kind:e.kind,ownerId:e.owner_id,data:JSON.parse(e.data),version:e.version,createdAt:e.created_at,updatedAt:e.updated_at}));
    const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind),get:(id:unknown,kind?:string)=>{
      const entity=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(entity,'结算来源不存在。',404);return entity;
    }};
    const course=ownedCourse(reader,actor,courseId);
    const accounts=(await client.query<Fields>('SELECT id,name,email,status,roles FROM accounts ORDER BY id')).rows;
    const report=buildCourseReportData(reader,course,id=>accounts.find(a=>a.id===id));
    const manifest=settlementManifestData(entities.map(e=>({id:e.id,kind:e.kind,owner_id:e.ownerId,data:e.data,version:e.version})),accounts,course);
    return portalSettlementPreviewData(settlementCheckData(reader,actor,courseId,report,manifest));
  });
}
