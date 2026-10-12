import { demand } from '../auth';
import type { Entity, Fields } from '../repository';
import { portalSettlementReports } from '../sports/portal-grades';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresSettlementReports(db:PostgresDatabase,token:string,courseId:string,input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),source=new PostgresRepository(client);
    const entities:Entity[]=[];
    for(const kind of ['sportsIdentity','sportsSystem','sportsCourse','sportsSettlementReport'])entities.push(...await source.all(kind));
    return portalSettlementReports({all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{
      const entity=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(entity,'课程不存在。',404);return entity;
    }},actor,courseId,input);
  });
}
