import { demand } from '../auth';
import type { Fields } from '../repository';
import { page } from '../sports/portal-courses';
import { recordDraftGate } from './postgres-record-drafts';
import { PostgresAuth } from './postgres-auth';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentProgress(db:PostgresDatabase,token:string,input:Fields,courseId?:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);await recordDraftGate(repo,actor);
    demand(Object.keys(input).every(k=>['limit','cursor','enrollmentId'].includes(k)),'进度查询参数无效。');
    const memberships=(await repo.all('sportsEnrollment')).filter(e=>e.ownerId===actor.id);
    const courses=await repo.all('sportsCourse');
    const targets=(id:unknown)=>{
      const course=courses.find(c=>c.id===id);demand(course && course.data.status!=='DRAFT','课程目标尚未发布。',404);
      const related=Number(course.data.relatedTarget),other=Number(course.data.otherTarget);
      demand(Number.isFinite(related) && related>=0 && Number.isFinite(other) && other>=0,'课程目标尚不完整。',409);
      return {course,related,other};
    };
    if(courseId) {
      demand(memberships.some(e=>e.data.courseId===courseId),'课程不存在。',404);
      const {course,related,other}=targets(courseId);
      return {data:{id:course.id,classSectionId:course.id,courseTargetSeconds:related*60,generalTargetSeconds:other*60,totalTargetSeconds:(related+other)*60,effectiveFrom:course.data.publishedAt ?? null,version:course.version}};
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
