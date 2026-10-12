import { createServer } from 'node:http';
import { demand, ServiceError } from './auth';
import { body, cookieToken, send } from './http';
import { PostgresAuth } from './storage/postgres-auth';
import { PostgresEmail } from './storage/postgres-email';
import type { PostgresDatabase } from './storage/postgres';
import { executePostgres } from './storage/postgres-commands';

export function createPostgresApiServer(db: PostgresDatabase, options: {localOutbox?:boolean; origins?:string[]; secureCookies?:boolean} = {}) {
  const auth = new PostgresAuth(db), mail = new PostgresEmail(db);
  const origins = new Set(options.origins ?? ['http://127.0.0.1:4174','http://localhost:4174']);
  const cookie = (token: string, age: number) => `bnbu_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${options.secureCookies ? '; Secure' : ''}`;
  return createServer(async (request,response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
      if (request.method === 'GET' && pathname === '/api/health') {
        const result = await db.pool.query('SELECT MAX(version) AS version FROM backend_migrations');
        return send(response,200,{ok:true,storage:'postgresql',schemaVersion:result.rows[0].version});
      }
      if (request.method === 'GET' && pathname === '/api/auth/me') return send(response,200,{account:await auth.authenticate(cookieToken(request))});
      if (request.method === 'POST') {
        demand(!request.headers.origin || origins.has(request.headers.origin),'来源不允许。',403);
        demand(request.headers['sec-fetch-site'] !== 'cross-site','跨站请求不允许。',403);
        const input = await body(request);
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
