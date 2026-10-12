import { createServer } from 'node:http';
import { demand, ServiceError } from './auth';
import { body, cookieToken, send } from './http';
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
import { postgresAdminEmailStatus, postgresAdminEmailRequest, postgresAdminEmailConfirm } from './storage/postgres-admin-email';

export function createPostgresApiServer(db: PostgresDatabase, options: {localOutbox?:boolean; origins?:string[]; secureCookies?:boolean} = {}) {
  const auth = new PostgresAuth(db), mail = new PostgresEmail(db);
  const origins = new Set(options.origins ?? ['http://127.0.0.1:4174','http://localhost:4174']);
  const cookie = (token: string, age: number) => `bnbu_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${options.secureCookies ? '; Secure' : ''}`;
  return createServer(async (request,response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
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
      if (request.method === 'POST') {
        demand(!request.headers.origin || origins.has(request.headers.origin),'来源不允许。',403);
        demand(request.headers['sec-fetch-site'] !== 'cross-site','跨站请求不允许。',403);
        if(pathname==='/api/timetable/recognize') {
          const actor=await auth.authenticate(cookieToken(request));
          student(actor);
          demand(actor.status!=='banned','账号已封禁。',403);
          const mustChange=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('sportsIdentity'),actor));
          if(mustChange) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
          return send(response,200,await recognize(request));
        }
        const input = await body(request);
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
