import { demand } from '../auth';
import type { Fields } from '../repository';
import { reconcileRosterData } from '../sports/roster';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate } from './postgres-record-drafts';

export async function postgresStudentRoster(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const member=await repo.get(id,'sportsEnrollment');demand(member.ownerId===actor.id,'成员关系不存在。',404);
    const bases=(await repo.all('sportsRosterBasis')).filter(b=>b.data.courseId===member.data.courseId);
    demand(bases.length<=1,'名单基准须核对。',409);
    const result={enrollmentId:id,classSectionId:member.data.courseId,generatedAt:new Date().toISOString()};
    if(!bases.length) return {data:{...result,available:false,rosterVersion:null,status:null,registrationComplete:false}};
    const snapshot=await repo.get(bases[0].data.snapshotId,'sportsRosterSnapshot');
    demand(snapshot.data.courseId===member.data.courseId,'名单基准与课程不一致。',409);
    const identities=await repo.all('sportsIdentity'),members=await repo.all('sportsEnrollment');
    const people=(await client.query<Fields>('SELECT id,name,email FROM accounts')).rows;
    const reconciled=reconcileRosterData({all:kind=>kind==='sportsIdentity'?identities:members},snapshot,id=>people.find(p=>p.id===id));
    const identity=identities.find(i=>i.ownerId===actor.id && i.data.role==='student' && i.data.status==='verified');
    const rows=reconciled.rows.filter(r=>r.studentNumber===identity?.data.studentNumber);
    const status=rows.some(r=>r.status==='CONFLICT')?'IDENTITY_CONFLICT':rows.some(r=>r.status==='COMPLETE')?'MATCHED':rows.length?'PENDING_REGISTRATION':'EXTRA_IN_PLATFORM';
    return {data:{...result,available:true,rosterVersion:bases[0].version,status,registrationComplete:status==='MATCHED'}};
  });
}
