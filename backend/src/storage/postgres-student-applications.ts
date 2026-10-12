import { demand } from '../auth';
import type { Fields } from '../repository';
import { applicationProjection, recognitionHistoryProjection } from '../sports/portal-applications';
import { page } from '../sports/portal-courses';
import { recordDraftGate } from './postgres-record-drafts';
import { PostgresAuth } from './postgres-auth';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentApplications(db:PostgresDatabase,token:string,input:Fields,certificationsOnly=false) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    demand(Object.keys(input).every(k=>['limit','cursor','enrollmentId'].includes(k)),'申请查询参数无效。');
    const history=await repo.all('sportsApplicationHistory');
    const applications=(await repo.all('sportsApplication')).filter(a=>a.ownerId===actor.id && (!input.enrollmentId || a.data.enrollmentId===input.enrollmentId) && (!certificationsOnly || a.data.applicationType==='CERTIFICATION'));
    const result=page(applications,{limit:input.limit ?? 100,cursor:input.cursor});
    return {data:result.items.map(a=>{
      const projection=applicationProjection(a,history);
      if(!certificationsOnly) return projection;
      const certificate=a.data.certification as Fields|undefined;
      return {...projection,certificationType:certificate?.certificationKind ?? null,validFrom:certificate?.validFrom ?? null,validTo:certificate?.validTo ?? null,currentDecisionReason:projection.publicComment};
    }),meta:{pagination:{total:result.total,limit:result.limit,nextCursor:result.nextCursor,hasMore:result.nextCursor!==null}}};
  });
}

export async function postgresStudentRecognitionHistory(db:PostgresDatabase,token:string,id:string,input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    const app=await repo.get(id,'sportsApplication');demand(app.ownerId===actor.id,'申请不存在。',404);demand(app.data.applicationType==='CERTIFICATION','此申请不是组织认证。',409);
    return recognitionHistoryProjection(await repo.all('sportsCertificationHistory'),app.id,input);
  });
}
