import { demand } from '../auth';
import type { Fields } from '../repository';
import { sportsRole } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { catalog, page, section, semesterRow, publishedCourseRules } from '../sports/portal-courses';
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
    const teacherDetail=/^\/api\/v1\/teachers\/([^/]+)$/.exec(path);
    if(teacherDetail) {
      demand(!teacher && Object.keys(input).length===0,'仅学生可通过此入口查看任课老师。',403);
      const teacherId=decodeURIComponent(teacherDetail[1]);
      const current=semesters.filter(s=>s.data.status==='CURRENT');
      demand(current.length===1,'当前学期须核对。',409);
      demand(courses.some(c=>c.ownerId===teacherId && c.data.semesterId===current[0].id && enrollments.some(e=>e.ownerId===actor.id && e.data.courseId===c.id && e.data.status==='ACTIVE')),'老师不存在或不属于本人当前课程。',404);
      const verified=identities.filter(i=>i.ownerId===teacherId && i.data.role==='teacher' && i.data.status==='verified');
      demand(verified.length===1,'老师身份不可用。',404);
      const account=(await client.query<{id:string;name:string;organization:string}>("SELECT id,name,organization FROM accounts WHERE id=$1 AND login_kind='PERSONAL' AND status='active'",[teacherId])).rows[0];
      demand(account,'老师账号不可用。',404);
      return {data:{id:account.id,fullName:account.name,departmentName:account.organization}};
    }
    if(path==='/api/v1/enrollments') {
      demand(Object.keys(input).every(key=>['classSectionId','limit','cursor'].includes(key)),'班级成员查询参数无效。');
      demand(input.classSectionId===undefined || typeof input.classSectionId==='string','班级标识无效。');
      const courseId=String(input.classSectionId ?? '');
      if(courseId) demand(courses.some(c=>c.id===courseId),'课程不存在或无权读取。',404);
      const members=enrollments.filter(e=>(teacher ? courses.some(c=>c.id===e.data.courseId) : e.ownerId===actor.id) && (!courseId || e.data.courseId===courseId));
      const result=page(members,{limit:input.limit ?? 100,cursor:input.cursor});
      const joins=result.items.length ? (await client.query<{entity_id:string;actor_id:string}>("SELECT DISTINCT ON (entity_id) entity_id,actor_id FROM audit WHERE entity_id=ANY($1::text[]) AND action='sports.enrollment.join' ORDER BY entity_id,created_at,sequence",[result.items.map(e=>e.id)])).rows : [];
      return {data:result.items.map(member=>{
        const course=courses.find(c=>c.id===member.data.courseId);
        demand(course,'成员关联课程不存在。',409);
        const join=joins.find(j=>j.entity_id===member.id);
        return {id:member.id,organizationId:'BNBU',semesterId:course.data.semesterId,classSectionId:course.id,studentId:member.ownerId,
          source:member.data.source ?? (join ? 'INVITE' : 'UNKNOWN'),sourceReferenceId:member.data.invitationId ?? null,
          status:member.data.status,joinedAt:member.createdAt,
          endedAt:member.data.status==='ACTIVE' || typeof member.data.changedAt!=='number' ? null : new Date(member.data.changedAt).toISOString(),
          endReason:member.data.status==='ACTIVE' ? null : member.data.reason ?? null,createdBy:join?.actor_id ?? null,
          createdAt:member.createdAt,updatedAt:member.updatedAt,version:member.version};
      }),meta:{pagination:{total:result.total,limit:result.limit,nextCursor:result.nextCursor,hasMore:result.nextCursor!==null}}};
    }
    const projectSection=(course:typeof courses[number])=>section({get:(id,kind)=>{
      const semester=semesters.find(s=>s.id===id && (!kind || s.kind===kind));
      demand(semester,'课程学期不存在。',404);return semester;
    }},course);
    const rules=/^\/api\/v1\/class-sections\/([^/]+)\/v81-rules$/.exec(path);
    if(rules) {
      demand(Object.keys(input).length===0,'规则查询参数无效。');
      const course=courses.find(c=>c.id===decodeURIComponent(rules[1]));demand(course,'课程不存在或无权读取。',404);
      demand(course.data.status!=='DRAFT','课程规则尚未发布。',404);
      const published=(await client.query<{created_at:string}>("SELECT created_at FROM audit WHERE action='sports.course.publish' AND entity_id=$1 ORDER BY created_at LIMIT 1",[course.id])).rows[0];
      return {data:publishedCourseRules(course,published?.created_at)};
    }
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
