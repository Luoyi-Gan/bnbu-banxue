import { demand } from '../auth';
import type { Fields } from '../repository';
import { sportsRole } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { gradeHistoryProjection } from '../sports/portal-grades';
import { portalTeacherStudentData } from '../sports/portal-enrollments';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresTeacherStudent(db:PostgresDatabase,token:string,studentId:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities=[...await repo.all('sportsIdentity'),...await repo.all('sportsSystem'),...await repo.all('sportsCourse'),...await repo.all('sportsEnrollment')];
    const person=(await client.query<Fields>("SELECT name,email FROM accounts WHERE id=$1 AND login_kind='PERSONAL'",[studentId])).rows[0];
    return {data:portalTeacherStudentData({all:kind=>entities.filter(e=>e.kind===kind)},actor,studentId,()=>person)};
  });
}

export async function postgresTeacherHistory(db:PostgresDatabase,token:string,id:string,kind:'physical-results'|'final-grades',input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('sportsIdentity'),systems=await repo.all('sportsSystem');
    sportsRole({all:()=>identities},actor,'teacher');sportsAvailable({all:()=>systems});
    const member=await repo.get(id,'sportsEnrollment'),course=await repo.get(member.data.courseId,'sportsCourse');
    demand(course.ownerId===actor.id,'只能查看本人负责课程的历史。',403);
    const revisions=kind==='physical-results'?await repo.all('sportsEnduranceRevision'):[...await repo.all('sportsGradeHistory'),...await repo.all('sportsGradePublication')];
    return {data:gradeHistoryProjection({all:kind=>revisions.filter(r=>r.kind===kind)},id,kind,input)};
  });
}
