import { demand } from '../auth';
import type { Fields, Entity } from '../repository';
import { calculateProgress } from '../sports/progress';
import { page } from '../sports/portal-courses';
import { recordDraftGate } from './postgres-record-drafts';
import { sportsRole } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { PostgresAuth } from './postgres-auth';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentProgress(db:PostgresDatabase,token:string,input:Fields,courseId?:string,teacherOnly=false) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('sportsIdentity');
    const teacher=identities.some(i=>i.ownerId===actor.id && i.data.status==='verified' && i.data.role==='teacher');
    demand(!teacherOnly || teacher,'仅教师可读取教学进度。',403);
    if(teacher) {
      sportsRole({all:()=>identities},actor,'teacher');
      const systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
    } else await recordDraftGate(repo,actor);
    demand(Object.keys(input).every(k=>['limit','cursor',teacher?'classSectionId':'enrollmentId'].includes(k)),'进度查询参数无效。');
    const allMemberships=await repo.all('sportsEnrollment'),memberships=allMemberships.filter(e=>e.ownerId===actor.id);
    const courses=await repo.all('sportsCourse');
    const targets=(id:unknown)=>{
      const course=courses.find(c=>c.id===id);demand(course && course.data.status!=='DRAFT','课程目标尚未发布。',404);
      const related=Number(course.data.relatedTarget),other=Number(course.data.otherTarget);
      demand(Number.isFinite(related) && related>=0 && Number.isFinite(other) && other>=0,'课程目标尚不完整。',409);
      return {course,related,other};
    };
    if(courseId) {
      demand(teacher?courses.some(c=>c.id===courseId && c.ownerId===actor.id):memberships.some(e=>e.data.courseId===courseId),'课程不存在。',404);
      const {course,related,other}=targets(courseId);
      return {data:{id:course.id,classSectionId:course.id,courseTargetSeconds:related*60,generalTargetSeconds:other*60,totalTargetSeconds:(related+other)*60,effectiveFrom:course.data.publishedAt ?? null,version:course.version}};
    }
    if(teacher) {
      const owned=new Set(courses.filter(c=>c.ownerId===actor.id).map(c=>c.id));
      if(input.classSectionId!==undefined)demand(typeof input.classSectionId==='string' && owned.has(input.classSectionId),'只能查看本人课程进度。',403);
      const result=page(allMemberships.filter(m=>owned.has(String(m.data.courseId)) && (!input.classSectionId || m.data.courseId===input.classSectionId)),{limit:input.limit ?? 100,cursor:input.cursor});
      const entities:Entity[]=[...courses];
      for(const kind of ['sportsRecord','sportsSession','sportsProgress','sportsCertification'])entities.push(...await repo.all(kind));
      const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind),get:(id:unknown,kind?:string)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,'进度来源不存在。',409);return e;}};
      return {data:result.items.map(member=>{
        const progress=calculateProgress(reader,String(member.data.courseId),member.ownerId);
        return {enrollmentId:member.id,courseRelated:{effectiveSeconds:progress.categoryTotals[0]*60},general:{effectiveSeconds:progress.categoryTotals[1]*60},totalEffectiveSeconds:progress.total*60,status:progress.total===1200?'COMPLETED':'IN_PROGRESS'};
      }),meta:{pagination:{total:result.total,limit:result.limit,nextCursor:result.nextCursor,hasMore:result.nextCursor!==null}}};
    }
    const progress=(await repo.all('sportsProgress')).filter(p=>p.ownerId===actor.id).sort((a,b)=>Number(b.data.sequence)-Number(a.data.sequence));
    const rows=memberships.filter(e=>!input.enrollmentId || e.id===input.enrollmentId).flatMap(e=>{
      const p=progress.find(p=>p.data.courseId===e.data.courseId);if(!p)return [];
      const {course,related,other}=targets(e.data.courseId),totals=p.data.categoryTotals;
      demand(Array.isArray(totals) && totals.length===2 && totals.every(v=>typeof v==='number' && Number.isFinite(v) && v>=0),'已确认进度尚不完整。',409);
      return [{id:p.id,enrollmentId:e.id,classSectionId:course.id,semesterId:course.data.semesterId,studentId:actor.id,
        status:totals[0]>=related && totals[1]>=other?'COMPLETED':'IN_PROGRESS',
        courseRelated:{effectiveSeconds:totals[0]*60,targetSeconds:related*60},general:{effectiveSeconds:totals[1]*60,targetSeconds:other*60},version:p.version,calculatedAt:p.createdAt}];
    });
    const result=page(rows,{limit:input.limit ?? 100,cursor:input.cursor});return {data:result.items,meta:{pagination:{total:result.total,limit:result.limit,nextCursor:result.nextCursor,hasMore:result.nextCursor!==null}}};
  });
}
