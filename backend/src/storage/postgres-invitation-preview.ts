import { demand, ServiceError } from '../auth';
import { sportsAvailable } from '../sports/materials';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

/** Possession of the opaque invite permits course preview, never student or roster access. */
export async function postgresInvitationPreview(db:PostgresDatabase,code:string) {
  demand(/^[A-Za-z0-9._~-]{16,200}$/.test(code),'邀请码格式无效。');
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const repo=new PostgresRepository(client),systems=await repo.all('sportsSystem');
    sportsAvailable({all:()=>systems});
    const invite=(await repo.all('sportsInvitation')).find(i=>i.data.code===code);
    if(!invite)throw new ServiceError(404,'COURSE_INVITE_INVALID','邀请码无效，请向教师确认。');
    if(invite.data.status!=='ACTIVE')throw new ServiceError(410,'COURSE_INVITE_REVOKED','邀请已撤销。');
    const expiresAt=Number(invite.data.expiresAt),now=Date.now();
    if(!Number.isFinite(expiresAt) || now>=expiresAt)throw new ServiceError(410,'COURSE_INVITE_EXPIRED','邀请已过期。');
    const course=await repo.get(invite.data.courseId,'sportsCourse'),semester=await repo.get(course.data.semesterId,'sportsSemester');
    const enrollmentOpen=semester.data.status==='CURRENT' && course.data.status==='PUBLISHED' && course.data.enrollmentOpen===true;
    const teacher=(await client.query<{name:string}>('SELECT name FROM accounts WHERE id=$1',[course.ownerId])).rows[0];
    return {data:{classSectionId:course.id,courseName:course.data.name,courseCode:course.id,displayName:course.data.name,teacherDisplayName:teacher?.name ?? '责任教师',semesterDisplayName:semester.data.name,enrollmentOpen,expiresAt:new Date(expiresAt).toISOString(),joinStartAllowed:enrollmentOpen,inGrace:false,graceExpiresAt:null}};
  });
}
