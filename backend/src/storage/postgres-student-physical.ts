import { demand } from '../auth';
import { approvedExemption } from '../sports/applications';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate } from './postgres-record-drafts';

export async function postgresStudentPhysical(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const member=await repo.get(id,'sportsEnrollment');demand(member.ownerId===actor.id,'成员关系不存在。',404);
    const exemptions=await repo.all('sportsExemption');
    if(approvedExemption({all:()=>exemptions},actor.id,member.data.courseId)) return {data:{status:'EXEMPT',result:null}};
    const records=(await repo.all('sportsEndurance')).filter(r=>r.ownerId===actor.id && r.data.enrollmentId===id);
    demand(records.length<=1,'体测事实重复，须核对。',409);
    if(!records.length) return {data:{status:'NOT_RECORDED',result:null}};
    const d=records[0].data;
    demand(d.courseId===member.data.courseId && [800,1000].includes(Number(d.event)) && Number.isSafeInteger(d.seconds) && Number(d.seconds)>=0 && typeof d.testDate==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d.testDate),'体测事实资料不完整。',409);
    return {data:{status:'RECORDED',result:{runType:String(d.event)+'m',elapsedSeconds:d.seconds,testedOn:d.testDate}}};
  });
}
