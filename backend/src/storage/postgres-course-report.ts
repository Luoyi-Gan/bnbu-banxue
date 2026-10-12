import { demand } from '../auth';
import type { Entity, Fields, Repository } from '../repository';
import { ownedCourse } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { buildCourseReportData } from '../sports/report';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresCourseReport(db:PostgresDatabase,token:string,courseId:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),source=new PostgresRepository(client);
    const {reader,people}=await postgresReportSources(source);
    sportsAvailable(reader);
    const course=ownedCourse(reader,actor,courseId);
    return buildCourseReportData(reader,course,id=>people.get(id));
  });
}
/** Caller supplies the transaction, including its write lock for reminder generation. */
export async function postgresReportSources(source:PostgresRepository) {
    const kinds=['sportsIdentity','sportsSystem','sportsCourse','sportsEnrollment','sportsRecord','sportsSession','sportsRosterBasis','sportsRosterSnapshot','sportsApplication','sportsRosterDraft','sportsRosterSource','sportsEnduranceImport','sportsEnduranceSource','sportsEndurance','sportsProgress','sportsCertification','sportsExemption'];
    const entities:Entity[]=[];
    for(const kind of kinds) entities.push(...await source.all(kind));
    const reader:Pick<Repository,'all'|'get'>={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,'对象不存在。',404);return e;}};
    const people=new Map((await source.client.query<Fields>('SELECT id,name,email FROM accounts')).rows.map(p=>[p.id,p]));
    return {reader,people};
}
