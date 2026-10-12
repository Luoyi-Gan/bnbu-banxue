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

export async function postgresSemesterSwitchCheck(db:PostgresDatabase,token:string,id:string,query:Record<string,string>) {
  demand(Object.keys(query).every(k=>['after','limit'].includes(k)),'学期切换查询参数无效。');
  const limit=Number(query.limit ?? 100);demand(Number.isSafeInteger(limit) && limit>=1 && limit<=100,'分页数量无效。');
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities:Entity[]=[];
    for(const kind of ['sportsIdentity','sportsSystem','sportsSemester','sportsCourse','sportsSettlementReport'])entities.push(...await repo.all(kind));
    const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind)};
    sportsAccountGate(reader,actor);requireSportsPermission(reader,actor,'SEMESTERS');sportsAvailable(reader);
    const target=reader.all('sportsSemester').find(s=>s.id===id);demand(target,'学期不存在。',404);
    const current=reader.all('sportsSemester').filter(s=>s.data.status==='CURRENT');
    demand(current.length<=1,'当前学期不唯一，请核对数据。',409);
    const checkedAt=new Date().toISOString(),businessDate=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});
    const courses=reader.all('sportsCourse').filter(c=>c.data.semesterId===current[0]?.id).sort((a,b)=>a.id.localeCompare(b.id));
    const source=courses.map(course=>{
      const ready=course.data.settlementStatus==='SETTLED' && reader.all('sportsSettlementReport').some(r=>r.id===course.data.settlementReportId && r.data.courseId===course.id && r.data.semesterId===current[0]?.id);
      return {classSectionId:course.id,ready,checkedAt,checks:[{code:'COURSE_SETTLED_REPORT',status:ready?'CLEAR':'BLOCKED',count:ready?0:1}]};
    });
    const index=query.after?source.findIndex(c=>c.classSectionId===query.after):-1;demand(!query.after || index>=0,'分页基准已变化，请刷新。',409);
    const checks=[{code:'TARGET_UPCOMING',status:target.data.status==='UPCOMING'?'CLEAR':'BLOCKED',count:target.data.status==='UPCOMING'?0:1},{code:'TARGET_STARTED',status:String(target.data.startDate)<=businessDate?'CLEAR':'BLOCKED',count:String(target.data.startDate)<=businessDate?0:1},{code:'COURSES_SETTLED',status:source.every(c=>c.ready)?'CLEAR':'BLOCKED',count:source.filter(c=>!c.ready).length}];
    const page=source.slice(index+1,index+1+limit);
    return {target:semesterRow(target),current:current[0]?semesterRow(current[0]):null,ready:checks.every(c=>c.status==='CLEAR'),checks,totalCourseCount:source.length,checkedAt,businessDate,timezone:'Asia/Shanghai',courses:page,nextCursor:index+1+limit<source.length?page.at(-1)!.classSectionId:null};
  });
}
