import { demand } from '../auth';
import type { Fields } from '../repository';
import { sportsRole } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { catalog, page, section, semesterRow } from '../sports/portal-courses';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentCourses(db:PostgresDatabase,token:string,path:string,input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),source=new PostgresRepository(client);
    const identities=await source.all('sportsIdentity');
    const own=identities.filter(i=>i.ownerId===actor.id && i.data.status==='verified');
    demand(own.length===1 && ['student','teacher'].includes(String(own[0].data.role)),'需要唯一有效学生或教师体育身份。',403);
    const teacher=own[0].data.role==='teacher';
    sportsRole({all:()=>identities},actor,teacher?'teacher':'student');
    const systems=await source.all('sportsSystem');
    sportsAvailable({all:()=>systems});
    const semesters=await source.all('sportsSemester');
    if(path==='/api/v1/semesters/current') {
      const current=semesters.filter(s=>s.data.status==='CURRENT');
      demand(current.length===1,'当前学期不存在或须核对。',current.length ? 409 : 404);
      return {data:semesterRow(current[0])};
    }
    const enrollments=await source.all('sportsEnrollment');
    const courses=(await source.all('sportsCourse')).filter(c=>teacher ? c.ownerId===actor.id : enrollments.some(e=>e.ownerId===actor.id && e.data.courseId===c.id));
    const projectSection=(course:typeof courses[number])=>section({get:(id,kind)=>{
      const semester=semesters.find(s=>s.id===id && (!kind || s.kind===kind));
      demand(semester,'课程学期不存在。',404);return semester;
    }},course);
    const detail=/^\/api\/v1\/(courses|class-sections)\/([^/]+)$/.exec(path);
    if(detail) {
      const course=courses.find(c=>c.id===detail[2]);
      demand(course,'课程不存在或无权读取。',404);
      return {data:detail[1]==='courses' ? catalog(course) : projectSection(course)};
    }
    const result=path.endsWith('/courses') ? page(courses.map(catalog),input) : page(courses.map(projectSection),input);
    return {data:result.items,meta:{pagination:{nextCursor:result.nextCursor,total:result.total,limit:result.limit,hasMore:result.nextCursor!==null}}};
  });
}
