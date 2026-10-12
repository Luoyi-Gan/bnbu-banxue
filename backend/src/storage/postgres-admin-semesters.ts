import {demand} from '../auth';
import type {Fields,Entity} from '../repository';
import {sportsAccountGate} from '../sports/account-gate';
import {requireSportsPermission} from '../sports/permissions';
import {sportsAvailable} from '../sports/materials';
import {semesterRow} from '../sports/portal-courses';
import type {PostgresDatabase} from './postgres';
import {PostgresAuth} from './postgres-auth';
import {PostgresRepository} from './postgres-repository';
import {executePostgres} from './postgres-commands';

async function rows(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities:Entity[]=[];
    for(const kind of ['sportsIdentity','sportsSystem','sportsSemester','sportsCourse','sportsEnrollment'])entities.push(...await repo.all(kind));
    const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind)};
    sportsAccountGate(reader,actor);requireSportsPermission(reader,actor,'SEMESTERS');sportsAvailable(reader);
    return reader.all('sportsSemester').sort((a,b)=>String(b.data.startDate).localeCompare(String(a.data.startDate)) || a.id.localeCompare(b.id)).map(s=>{
      const courses=reader.all('sportsCourse').filter(c=>c.data.semesterId===s.id),ids=new Set(courses.map(c=>c.id));
      const students=new Set(reader.all('sportsEnrollment').filter(e=>ids.has(String(e.data.courseId)) && e.data.status==='ACTIVE').map(e=>e.ownerId));
      return {...semesterRow(s),courseCount:courses.length,studentCount:students.size,updatedAt:s.updatedAt};
    });
  });
}
export async function postgresAdminSemesters(db:PostgresDatabase,token:string,query:Record<string,string>) {
  demand(Object.keys(query).every(k=>['after','limit'].includes(k)),'学期查询参数无效。');
  const limit=Number(query.limit ?? 100);demand(Number.isSafeInteger(limit) && limit>=1 && limit<=100,'分页数量无效。');
  const source=await rows(db,token),index=query.after?source.findIndex(s=>s.id===query.after):-1;
  demand(!query.after || index>=0,'分页基准已变化，请刷新。',409);
  const items=source.slice(index+1,index+1+limit);
  return {items,nextCursor:index+1+limit<source.length?items.at(-1)!.id:null};
}
export async function postgresAdminSemesterSave(db:PostgresDatabase,token:string,id:string|undefined,input:Fields,key:string) {
  demand(Object.keys(input).every(k=>['academicYear','termCode','displayName','startDate','endDate',...(id?['expectedVersion']:[])].includes(k)),'学期保存参数无效。');
  const result=await executePostgres(db,token,id?'sports.semester.update':'sports.semester.create',{...(id?{id,version:input.expectedVersion}:{}),academicYear:input.academicYear,type:input.termCode,name:input.displayName,startDate:input.startDate,endDate:input.endDate},key);
  const saved=(await rows(db,token)).find(s=>s.id===result.id);demand(saved,'学期不存在。',404);return saved;
}
