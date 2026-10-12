import { postgresCourseReport } from './storage/postgres-course-report';
import { postgresRuleTemplates } from './storage/postgres-rule-templates';
import { postgresInvitationPreview } from './storage/postgres-invitation-preview';
import { requestStudentJoinEmail, verifyStudentJoinEmail } from './storage/postgres-student-email';
import { requestStudentLogin, verifyStudentLogin } from './storage/postgres-student-login';
import { reportCsv } from './sports/report';
import { courseWindowInput, courseInviteInput, courseInviteProjection } from './sports/portal-courses';
import { postgresStudentApplications, postgresStudentRecognitionHistory } from './storage/postgres-student-applications';
import { postgresStudentProgress } from './storage/postgres-student-progress';
import { postgresStudentRoster } from './storage/postgres-student-roster';
import { postgresStudentPhysical } from './storage/postgres-student-physical';
import { postgresTeacherHistory, postgresTeacherStudent } from './storage/postgres-teacher-history';
import { postgresReviewMaterial } from './storage/postgres-review-material';
import { postgresSportsWorkspace } from './storage/postgres-sports-workspace';
import { postgresMediaRead, postgresMediaPut, postgresEvidenceContext, postgresMediaOriginal } from './storage/postgres-student-media';
import { postgresStudentRecords, postgresStudentWorkflow, postgresProofTodos } from './storage/postgres-student-records';
import { createServer } from 'node:http';
import { demand, ServiceError } from './auth';
import { body, cookieToken, send } from './http';
import { issueMemberJoin, consumeMemberJoin } from './storage/postgres-member-join';
import { PostgresAuth } from './storage/postgres-auth';
import { PostgresEmail } from './storage/postgres-email';
import type { PostgresDatabase } from './storage/postgres';
import { executePostgres } from './storage/postgres-commands';
import { postgresCommunityView } from './storage/postgres-community-view';
import { postgresWorkspace } from './storage/postgres-workspace';
import { postgresStudentSearch } from './storage/postgres-student-search';
import { checkSchoolIdentity } from './identity';
import { recognize } from './timetable';
import { student } from './community';
import { passwordChangeRequired } from './sports/account-gate';
import { PostgresRepository } from './storage/postgres-repository';
import { postgresAdministratorDirectory } from './storage/postgres-administrators';
import { postgresAdministratorSelf } from './storage/postgres-admin-deletion';
import { postgresAccountDirectory } from './storage/postgres-account-directory';
import { postgresSportsHelp } from './storage/postgres-sports-help';
import { portalAnnouncement } from './sports/portal-bootstrap';
import { postgresSportsMe } from './storage/postgres-sports-me';
import { postgresStudentCourses } from './storage/postgres-student-courses';
import { postgresSportsNotifications } from './storage/postgres-sports-notifications';
import { postgresSportsPreferences } from './storage/postgres-sports-preferences';
import { postgresSportsSession } from './storage/postgres-sports-session';
import { postgresAdminEmailStatus, postgresAdminEmailRequest, postgresAdminEmailConfirm } from './storage/postgres-admin-email';

export function createPostgresApiServer(db: PostgresDatabase, options: {localOutbox?:boolean; origins?:string[]; secureCookies?:boolean} = {}) {
  const auth = new PostgresAuth(db), mail = new PostgresEmail(db);
  const origins = new Set(options.origins ?? ['http://127.0.0.1:4174','http://localhost:4174']);
  const cookie = (token: string, age: number) => `bnbu_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${options.secureCookies ? '; Secure' : ''}`;
  return createServer(async (request,response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
      const teacherStudent=/^\/api\/v1\/students\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && teacherStudent) {
        demand([...new URL(request.url ?? '/', 'http://localhost').searchParams.keys()].length===0,'学生资料查询参数无效。');
        return send(response,200,await postgresTeacherStudent(db,cookieToken(request) ?? '',decodeURIComponent(teacherStudent[1])));
      }
      const invitePreview=/^\/api\/v1\/course-invites\/([^/]+)\/preview$/.exec(pathname);
      const contractInvite=/^\/api\/v1\/course-invitations\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && (invitePreview || contractInvite)) return send(response,200,await postgresInvitationPreview(db,decodeURIComponent((invitePreview ?? contractInvite)![1])));
      if(request.method==='GET' && ['/api/v1/rule-templates','/api/v1/admin/exercise-goal'].includes(pathname)) return send(response,200,await postgresRuleTemplates(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams),pathname.endsWith('/exercise-goal')));
      const reportRead=/^\/api\/sports\/course-reports\/([a-f0-9-]+)(\.csv)?$/.exec(pathname);
      if(request.method==='GET' && reportRead) {
        const report=await postgresCourseReport(db,cookieToken(request) ?? '',reportRead[1]);
        if(!reportRead[2]) return send(response,200,report);
        const bytes=Buffer.from(reportCsv(report),'utf8');
        response.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="course-report.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':bytes.length});
        return response.end(bytes);
      }
      const gradeHistory=/^\/api\/v1\/enrollments\/([^/]+)\/(physical-results|final-grades)$/.exec(pathname);
      if(request.method==='GET' && gradeHistory) return send(response,200,await postgresTeacherHistory(db,cookieToken(request) ?? '',decodeURIComponent(gradeHistory[1]),gradeHistory[2] as 'physical-results'|'final-grades',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams)));
      const physicalResult=/^\/api\/v1\/student\/enrollments\/([^/]+)\/physical-result$/.exec(pathname);
      if(request.method==='GET' && physicalResult) return send(response,200,await postgresStudentPhysical(db,cookieToken(request) ?? '',decodeURIComponent(physicalResult[1])));
      const rosterStatus=/^\/api\/v1\/enrollments\/([^/]+)\/roster-status$/.exec(pathname);
      if(request.method==='GET' && rosterStatus) return send(response,200,await postgresStudentRoster(db,cookieToken(request) ?? '',decodeURIComponent(rosterStatus[1])));
      if(request.method==='GET' && pathname==='/api/v1/student/proof-todos') return send(response,200,await postgresProofTodos(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams)));
      if(request.method==='GET' && pathname==='/api/sports/workspace') return send(response,200,await postgresSportsWorkspace(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && ['/api/v1/exemption-application-details','/api/v1/activity-certification-applications'].includes(pathname)) return send(response,200,await postgresStudentApplications(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams),pathname.includes('activity-certification')));
      const recognitionRead=/^\/api\/v1\/activity-certification-applications\/([^/]+)\/recognition-allocation-revisions$/.exec(pathname);
      if(request.method==='GET' && recognitionRead) return send(response,200,await postgresStudentRecognitionHistory(db,cookieToken(request) ?? '',decodeURIComponent(recognitionRead[1]),Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams)));
      const progressTarget=/^\/api\/v1\/class-sections\/([^/]+)\/progress-target$/.exec(pathname);
      if(request.method==='GET' && (pathname==='/api/v1/student-progress' || progressTarget)) return send(response,200,await postgresStudentProgress(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams),progressTarget?decodeURIComponent(progressTarget[1]):undefined));
      const reviewMaterial=/^\/api\/sports\/materials\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && reviewMaterial) {
        const original=await postgresReviewMaterial(db,cookieToken(request) ?? '',decodeURIComponent(reviewMaterial[1]));
        response.writeHead(200,{'Content-Type':original.mime,'Content-Length':original.bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});return response.end(original.bytes);
      }
      const originalRead=/^\/api\/v1\/media-access\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && originalRead) {
        const original=await postgresMediaOriginal(db,cookieToken(request) ?? '',decodeURIComponent(originalRead[1]));
        response.writeHead(200,{'Content-Type':original.mime,'Content-Length':original.bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});return response.end(original.bytes);
      }
      const evidenceRead=/^\/api\/v1\/exercise-records\/([^/]+)\/evidence-context$/.exec(pathname);
      const workflowRead=/^\/api\/v1\/exercise-records\/([^/]+)\/workflow$/.exec(pathname);
      if(request.method==='GET' && workflowRead) return send(response,200,await postgresStudentWorkflow(db,cookieToken(request) ?? '',decodeURIComponent(workflowRead[1])));
      if(request.method==='GET' && evidenceRead) return send(response,200,{data:await postgresEvidenceContext(db,cookieToken(request) ?? '',decodeURIComponent(evidenceRead[1]))});
      const mediaRead=/^\/api\/v1\/media\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && mediaRead) return send(response,200,{data:await postgresMediaRead(db,cookieToken(request) ?? '',decodeURIComponent(mediaRead[1]))});
      const mediaPut=/^\/api\/v1\/media-uploads\/([^/]+)\/object$/.exec(pathname);
      if(request.method==='PUT' && mediaPut) {
        demand(!request.headers.origin || origins.has(request.headers.origin),'来源不允许。',403);
        demand(request.headers['sec-fetch-site']!=='cross-site','跨站请求不允许。',403);
        await auth.authenticate(cookieToken(request));
        let size=0;const chunks:Buffer[]=[];
        for await(const chunk of request) {size+=chunk.length;demand(size<=100*1024*1024,'文件过大。',413);chunks.push(chunk);}
        const etag=await postgresMediaPut(db,cookieToken(request) ?? '',decodeURIComponent(mediaPut[1]),Buffer.concat(chunks),request.headers['content-type'] ?? '');
        response.writeHead(200,{ETag:'"'+etag+'"','Cache-Control':'no-store'});return response.end();
      }
      const recordRead=/^\/api\/v1\/exercise-records(?:\/([^/]+))?$/.exec(pathname);
      if(request.method==='GET' && recordRead) return send(response,200,await postgresStudentRecords(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url ?? '/', 'http://localhost').searchParams),recordRead[1]?decodeURIComponent(recordRead[1]):undefined));
      const sportsSessionRead=/^\/api\/v1\/exercise-sessions\/([^/]+)$/.exec(pathname);
      if(request.method==='GET' && sportsSessionRead) return send(response,200,{data:await postgresSportsSession(db,cookieToken(request) ?? '',decodeURIComponent(sportsSessionRead[1]))});
      if(request.method==='GET' && pathname==='/api/v1/me/preferences') return send(response,200,{data:await postgresSportsPreferences(db,cookieToken(request) ?? '')});
      if(request.method==='GET' && pathname==='/api/v1/notifications') return send(response,200,await postgresSportsNotifications(db,cookieToken(request) ?? '',Object.fromEntries(new URL(request.url!,'http://localhost').searchParams)));
      if(request.method==='GET' && /^\/api\/v1\/teachers\/[^/]+$/.test(pathname)) return send(response,200,await postgresStudentCourses(db,cookieToken(request) ?? '',pathname,Object.fromEntries(new URL(request.url!,'http://localhost').searchParams)));
      if(request.method==='GET' && (['/api/v1/teacher/semesters','/api/v1/semesters/current','/api/v1/enrollments'].includes(pathname) || /^\/api\/v1\/class-sections\/[^/]+\/v81-rules$/.test(pathname) || /^\/api\/v1\/(courses|class-sections)(\/[^/]+)?$/.test(pathname))) return send(response,200,await postgresStudentCourses(db,cookieToken(request) ?? '',pathname,Object.fromEntries(new URL(request.url!,'http://localhost').searchParams)));
      if(request.method==='GET' && pathname==='/api/v1/me') return send(response,200,{data:await postgresSportsMe(db,cookieToken(request) ?? '')});
      if(request.method==='GET' && pathname==='/api/v1/system-mode/announcement') {
        const systems=await db.transaction(client=>new PostgresRepository(client).all('sportsSystem'));
        return send(response,200,{data:portalAnnouncement({all:()=>systems})});
      }
      if(request.method==='GET' && pathname==='/api/sports/help') return send(response,200,await postgresSportsHelp(db,cookieToken(request) ?? '',new URL(request.url!,'http://localhost').searchParams.get('lang') ?? 'zh'));
      const accountDirectory=/^\/api\/sports\/accounts\/(students|teachers)$/.exec(pathname);
      if(request.method==='GET' && accountDirectory) return send(response,200,await postgresAccountDirectory(db,cookieToken(request) ?? '',accountDirectory[1]==='students'?'student':'teacher',Object.fromEntries(new URL(request.url!,'http://localhost').searchParams)));
      if(request.method==='GET' && pathname==='/api/sports/administrator-self') return send(response,200,await postgresAdministratorSelf(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && pathname==='/api/sports/admin-email') return send(response,200,await postgresAdminEmailStatus(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && pathname==='/api/sports/administrators') return send(response,200,await postgresAdministratorDirectory(db,cookieToken(request) ?? ''));
      if (request.method==='GET' && pathname==='/api/students/search') return send(response,200,await postgresStudentSearch(db,cookieToken(request) ?? '',new URL(request.url!,'http://localhost').searchParams.get('number') ?? ''));
      if (request.method === 'GET' && pathname === '/api/workspace') return send(response,200,await postgresWorkspace(db,cookieToken(request) ?? ''));
      if (request.method === 'GET' && pathname === '/api/community') return send(response,200,await postgresCommunityView(db,cookieToken(request) ?? ''));
      if (request.method === 'GET' && pathname === '/api/health') {
        const result = await db.pool.query('SELECT MAX(version) AS version FROM backend_migrations');
        return send(response,200,{ok:true,storage:'postgresql',schemaVersion:result.rows[0].version});
      }
      if (request.method === 'GET' && pathname === '/api/auth/me') return send(response,200,{account:await auth.authenticate(cookieToken(request))});
      if (request.method === 'POST' || request.method==='PATCH') {
        demand(!request.headers.origin || origins.has(request.headers.origin),'来源不允许。',403);
        demand(request.headers['sec-fetch-site'] !== 'cross-site','跨站请求不允许。',403);
        if(request.method==='PATCH') {
          const courseWindow=/^\/api\/v1\/class-sections\/([^/]+)$/.exec(pathname);
          if(courseWindow) {
            const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
            const id=decodeURIComponent(courseWindow[1]),token=cookieToken(request) ?? '';
            await executePostgres(db,token,'sports.course.window',courseWindowInput(id,await body(request)),key);
            return send(response,200,await postgresStudentCourses(db,token,'/api/v1/class-sections/'+id,{}));
          }
          const draftEdit=/^\/api\/v1\/exercise-records\/([^/]+)$/.exec(pathname);
          if(draftEdit) {
            const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
            const input=await body(request);demand(!('id' in input),'记录标识须使用路径。');
            return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '', 'sports.recorddraft.edit',{...input,id:decodeURIComponent(draftEdit[1])},key)});
          }
          demand(pathname==='/api/v1/me/preferences','接口不存在。',404);
          const key=request.headers['idempotency-key'];
          demand(typeof key==='string','缺少操作幂等标识。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '','sports.preferences.save',await body(request),key)});
        }
        if(pathname==='/api/timetable/recognize') {
          const actor=await auth.authenticate(cookieToken(request));
          student(actor);
          demand(actor.status!=='banned','账号已封禁。',403);
          const mustChange=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('sportsIdentity'),actor));
          if(mustChange) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
          return send(response,200,await recognize(request));
        }
        const notificationRead=/^\/api\/v1\/notifications\/([^/]+)\/read$/.exec(pathname);
        if(notificationRead) {
          const key=request.headers['idempotency-key'];
          demand(typeof key==='string','缺少操作幂等标识。');
          if(request.headers['content-length'] && request.headers['content-length']!=='0' || request.headers['transfer-encoding']) demand(Object.keys(await body(request)).length===0,'已读操作不接受额外参数。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '','sports.notification.read',{id:decodeURIComponent(notificationRead[1])},key)});
        }
        const input = await body(request);
        const memberJoin=/^\/api\/v1\/course-invites\/([^/]+)\/(join-capabilities\/member|join)$/.exec(pathname);
        if(memberJoin) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          const code=decodeURIComponent(memberJoin[1]),session=cookieToken(request) ?? '';
          if(memberJoin[2]==='join-capabilities/member')return send(response,200,{data:await issueMemberJoin(db,session,code,input,key)});
          demand(Object.keys(input).length===0,'入班确认不接受额外资料。');
          const capability=request.headers['x-join-capability'];demand(typeof capability==='string','缺少入班凭证。',403);
          return send(response,200,{data:await consumeMemberJoin(db,session,code,capability,key)});
        }
        if(['/api/v1/auth/student-sign-in-codes','/api/v1/auth/student-sign-in-codes/verify'].includes(pathname) && input.joinInviteToken!==undefined) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          const result=pathname.endsWith('/verify')?await verifyStudentJoinEmail(db,input,key):await requestStudentJoinEmail(db,input,key,options.localOutbox);
          return send(response,200,{data:result});
        }
        if(pathname==='/api/v1/auth/student-sign-in-codes') {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          return send(response,200,{data:await requestStudentLogin(db,input,key,options.localOutbox)});
        }
        if(pathname==='/api/v1/auth/student-sign-in-codes/verify') {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          const result=await verifyStudentLogin(db,input,key);
          response.setHeader('Set-Cookie',cookie(result.token,43200));
          return send(response,200,{data:result.authSession});
        }
        const courseInvite=/^\/api\/v1\/class-sections\/([^/]+)\/course-invites(\/revocations)?$/.exec(pathname);
        if(courseInvite) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          const id=decodeURIComponent(courseInvite[1]),token=cookieToken(request) ?? '',revoke=!!courseInvite[2];
          await postgresStudentCourses(db,token,'/api/v1/class-sections/'+id,{});
          const result=await executePostgres(db,token,revoke?'sports.invitation.revoke':'sports.invitation.create',courseInviteInput(id,revoke,input),key);
          const invite=await db.transaction(client=>new PostgresRepository(client).get(result.id,'sportsInvitation'));
          return send(response,200,{data:courseInviteProjection(invite)});
        }
        if(pathname==='/api/v1/teacher/courses') {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          demand(Object.keys(input).every(field=>field==='displayName'),'新建课程参数无效。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '','sports.course.create',{name:input.displayName},key)});
        }
        const courseRulesPublish=/^\/api\/v1\/class-sections\/([^/]+)\/v81-rules$/.exec(pathname);
        if(courseRulesPublish) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('id' in input),'课程标识须来自请求路径。');
          const id=decodeURIComponent(courseRulesPublish[1]),token=cookieToken(request) ?? '';
          await executePostgres(db,token,'sports.course.configurepublish',{...input,id},key);
          return send(response,200,await postgresStudentCourses(db,token,'/api/v1/class-sections/'+id+'/v81-rules',{}));
        }
        const gradeWrite=/^\/api\/v1\/enrollments\/([^/]+)\/final-grades$/.exec(pathname);
        if(gradeWrite) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('enrollmentId' in input),'成员标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '','sports.grade.portal',{...input,enrollmentId:decodeURIComponent(gradeWrite[1])},key)});
        }
        const physicalWrite=/^\/api\/v1\/enrollments\/([^/]+)\/physical-results$/.exec(pathname);
        if(physicalWrite) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('enrollmentId' in input),'成员标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '','sports.physical.confirm',{...input,enrollmentId:decodeURIComponent(physicalWrite[1])},key)});
        }
        const mediaAccess=/^\/api\/v1\/media\/([^/]+)\/access-url$/.exec(pathname);
        if(mediaAccess) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('id' in input),'材料标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '', 'sports.media.access',{...input,id:decodeURIComponent(mediaAccess[1])},key)});
        }
        const recordSubmit=/^\/api\/v1\/exercise-records\/([^/]+)\/(submit|supplements)$/.exec(pathname);
        if(recordSubmit) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('id' in input),'记录标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '', recordSubmit[2]==='supplements'?'sports.record.supplement':'sports.record.submit',{...input,id:decodeURIComponent(recordSubmit[1])},key)});
        }
        const mediaWrite=/^\/api\/v1\/(media-uploads|media)(?:\/([^/]+)\/(confirm|bind))?$/.exec(pathname);
        if(mediaWrite) {
          demand((mediaWrite[1]==='media-uploads' && (!mediaWrite[3] || mediaWrite[3]==='confirm')) || (mediaWrite[1]==='media' && mediaWrite[3]==='bind'),'接口不存在。',404);
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');demand(!('id' in input),'材料标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '', 'sports.media.'+(mediaWrite[3] ?? 'initiate'),mediaWrite[2]?{...input,id:decodeURIComponent(mediaWrite[2])}:input,key)});
        }
        const draftWrite=/^\/api\/v1\/exercise-records(?:\/([^/]+)\/(discard))?$/.exec(pathname);
        if(draftWrite) {
          const key=request.headers['idempotency-key'];demand(typeof key==='string','缺少操作幂等标识。');
          demand(!('id' in input),'记录标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '', 'sports.recorddraft.'+(draftWrite[1]?'discard':'create'),draftWrite[1]?{...input,id:decodeURIComponent(draftWrite[1])}:input,key)});
        }
        const exerciseWrite=/^\/api\/v1\/exercise-sessions(?:\/([^/]+)\/(pause|resume|finish|cancel))?$/.exec(pathname);
        if(exerciseWrite) {
          const key=request.headers['idempotency-key'];
          demand(typeof key==='string','缺少操作幂等标识。');
          demand(!('id' in input),'运动会话标识须使用路径。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '',`sports.exercise.${exerciseWrite[2] ?? 'start'}`,exerciseWrite[1]?{...input,id:decodeURIComponent(exerciseWrite[1])}:input,key)});
        }
        if(pathname==='/api/sports/admin-email/request') {
          demand(Object.keys(input).length===0,'邮箱验证只能使用本人当前邮箱。');
          return send(response,200,await postgresAdminEmailRequest(db,cookieToken(request) ?? '',options.localOutbox===true));
        }
        if(pathname==='/api/sports/admin-email/confirm') return send(response,200,await postgresAdminEmailConfirm(db,cookieToken(request) ?? '',input));
        if(pathname==='/api/identity/check') return send(response,200,await checkSchoolIdentity(await auth.authenticate(cookieToken(request))));
        if (pathname === '/api/commands') {
          const key = input.requestId;
          demand(typeof key==='string','缺少操作幂等标识。');
          demand(typeof input.action==='string' && input.input && typeof input.input==='object' && !Array.isArray(input.input),'请求格式无效。');
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '',input.action,input.input as Record<string,unknown>,key)});
        }
        if (pathname === '/api/auth/sign-in' || pathname === '/api/auth/login' || pathname === '/api/auth/admin-login') {
          const kind = pathname.endsWith('/admin-login') ? 'ADMIN' : pathname.endsWith('/login') ? 'PERSONAL' : undefined;
          const result = await auth.login(kind==='ADMIN' ? input.loginName : kind==='PERSONAL' ? input.email : input.identifier,input.password,kind);
          response.setHeader('Set-Cookie',cookie(result.token,43200));
          return send(response,200,{authenticated:true,account:result.account});
        }
        if (pathname === '/api/auth/verification-codes') return send(response,200,await mail.sendVerification(input.email,options.localOutbox===true));
        if (pathname === '/api/auth/register') return send(response,201,await mail.register(input));
        if (pathname === '/api/auth/logout') {
          await auth.logout(cookieToken(request));
          response.setHeader('Set-Cookie',cookie('',0));
          return send(response,200,{loggedOut:true});
        }
        if (pathname === '/api/auth/email/request' || pathname === '/api/auth/email/confirm') {
          const actor = await auth.authenticate(cookieToken(request));
          demand(actor.status!=='banned','账号已封禁。',403);
          return send(response,200,pathname.endsWith('/request') ? await mail.sendVerification(actor.email,options.localOutbox===true) : await mail.verifyOwnEmail(actor,input.code));
        }
      }
      // No silent SQLite fallback or mock success for routes not migrated yet.
      return send(response,503,{code:'POSTGRES_ROUTE_PENDING',message:'该接口的 PostgreSQL 迁移尚未完成。'});
    } catch (error) {
      if (error instanceof ServiceError) return send(response,error.status,{code:error.code,message:error.message});
      console.error('PostgreSQL API request failed');
      return send(response,500,{code:'INTERNAL_ERROR',message:'操作失败，请重试。'});
    }
  });
}
