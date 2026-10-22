import {movementNative} from './movement-native';
import {movementRequest} from './movement';
import {LearningAuth} from './learning-auth';
import {LearningService} from './learning';
import {CampusAI} from './campus-ai';
import {postgresLearningStore} from './learning-store';
import {shopRead} from './shops';
import {runAsync as runShopRead} from './storage/effects';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { demand, ServiceError } from './auth';
import { body, cookieToken as readCookieToken, send } from './http';

import { PostgresAuth } from './storage/postgres-auth';
import { PostgresEmail } from './storage/postgres-email';
import type { PostgresDatabase } from './storage/postgres';
import { executePostgres } from './storage/postgres-commands';
import {postgresCommunityFeed,postgresCommunityPostDetail,postgresCommunitySocial} from './storage/postgres-community-page';
import {postgresDiscoverHotPage} from './storage/postgres-discover-hot-page';
import {postgresModerationPage} from './storage/postgres-community-moderation-page';
import { searchPostgresRooms, postgresRoomDetail } from './room-search';
import { postgresWorkspace } from './storage/postgres-workspace';
import { postgresStudentSearch } from './storage/postgres-student-search';
import { postgresPersonHover } from './storage/postgres-person-hover';
import { checkSchoolIdentity } from './identity';
import { recognize } from './timetable';
import { student } from './community';
import {postgresOwnStudentIdentity,postgresRequestStudentIdentity,postgresListStudentIdentityRequests,postgresReviewStudentIdentity} from './storage/postgres-student-identity';
import {postgresRequestPasswordReset,postgresCompletePasswordReset} from './storage/postgres-password-reset';
import { passwordChangeRequired } from './accounts/account-gate';
import { PostgresRepository } from './storage/postgres-repository';
import { postgresAdministratorDirectory } from './storage/postgres-administrators';
import { postgresAdministratorSelf } from './storage/postgres-admin-deletion';
import { postgresAccountDirectory } from './storage/postgres-account-directory';

import { postgresAdminEmailStatus, postgresAdminEmailRequest, postgresAdminEmailConfirm } from './storage/postgres-admin-email';
import { recognizeActivityScreenshot, type ScreenshotRecognizer } from './activity-screenshot-ocr';

export function createPostgresApiServer(db: PostgresDatabase, options: {localOutbox?:boolean; origins?:string[]; secureCookies?:boolean; surface?:'companion'|'sports'; screenshotRecognizer?:ScreenshotRecognizer} = {}) {
  demand(options.surface!=='sports','伴学不提供独立体育服务。',404);
  const auth = new PostgresAuth(db), mail = new PostgresEmail(db);
  const learningAuth=new LearningAuth(postgresLearningStore(db)),learning=new LearningService(learningAuth),ai=new CampusAI(postgresLearningStore(db));
  const origins = new Set(options.origins ?? ['http://127.0.0.1:4174','http://localhost:4174']);
  const cookieName='bnbu_session';
  const cookieToken=(request:Parameters<typeof readCookieToken>[0])=>readCookieToken(request,cookieName);
  const cookie = (token: string, age: number) => `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${options.secureCookies ? '; Secure' : ''}`;
  return createServer(async (request,response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://localhost');
      const pathname = requestUrl.pathname;
      if(request.method==='GET'&&pathname==='/api/learning'){
        const token=cookieToken(request)??'',actor=await auth.authenticate(token);
        const blocked=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('companionIdentity'),actor));
        demand(!blocked,'请先修改本人初始密码。',403);
        return send(response,200,await learning.overview(actor,token));
      }
      const sportsPath=pathname.startsWith('/api/v1/') || pathname.startsWith('/api/sports/');
      demand(!sportsPath,'接口不存在。',404);
      if(request.method==='GET' && (pathname==='/api/rooms' || /^\/api\/rooms\/[^/]+$/.test(pathname))) {
        const actor=await auth.authenticate(cookieToken(request));
        student(actor);
        demand(actor.status!=='banned','账号已封禁。',403);
        const mustChange=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('companionIdentity'),actor));
        if(mustChange) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再继续操作。');
        const id=pathname==='/api/rooms' ? null : decodeURIComponent(pathname.slice('/api/rooms/'.length));
        return send(response,200,id===null ? await searchPostgresRooms(db,actor,requestUrl.searchParams) : await postgresRoomDetail(db,actor,id));
      }
      const accountDirectory=/^\/api\/accounts\/(students|teachers)$/.exec(pathname);
      if(request.method==='GET' && accountDirectory) return send(response,200,await postgresAccountDirectory(db,cookieToken(request) ?? '',accountDirectory[1]==='students'?'student':'teacher',Object.fromEntries(new URL(request.url!,'http://localhost').searchParams)));
      if(request.method==='GET' && pathname==='/api/accounts/administrator-self') return send(response,200,await postgresAdministratorSelf(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && pathname==='/api/accounts/admin-email') return send(response,200,await postgresAdminEmailStatus(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && pathname==='/api/accounts/administrators') return send(response,200,await postgresAdministratorDirectory(db,cookieToken(request) ?? ''));
      if (request.method==='GET' && pathname==='/api/students/search') return send(response,200,await postgresStudentSearch(db,cookieToken(request) ?? '',new URL(request.url!,'http://localhost').searchParams.get('number') ?? '',request.socket.remoteAddress ?? 'unknown'));
      const hoverMatch=request.method==='GET' && /^\/api\/people\/([^/]+)\/hover$/.exec(pathname);
      if(hoverMatch) return send(response,200,await postgresPersonHover(db,cookieToken(request) ?? '',decodeURIComponent(hoverMatch[1]),new URL(request.url!,'http://localhost').searchParams.get('number') ?? undefined));
      if(request.method==='GET' && pathname==='/api/shops')return send(response,200,await db.transaction(async client=>{
        const actor=await auth.authenticate(cookieToken(request),client),repo=new PostgresRepository(client);
        demand(!passwordChangeRequired(await repo.all('companionIdentity'),actor),'请先修改本人初始密码。',403);
        return runShopRead(shopRead(repo,actor,new URL(request.url!,'http://localhost').searchParams));
      }));
      if((request.method==='GET'&&pathname==='/api/movement')){
        const actor=await auth.authenticate(cookieToken(request));
        const verified=await db.transaction(async client=>{
          const repo=new PostgresRepository(client);demand(!passwordChangeRequired(await repo.all('companionIdentity'),actor),'请先修改本人初始密码。',403);
          return (await repo.all('verifiedEmail')).some(item=>item.ownerId===actor.id&&item.data.email===actor.email);
        });
        return send(response,200,await movementRequest(actor,verified,'resolve'));
      }
      if (request.method === 'GET' && pathname === '/api/workspace') return send(response,200,await postgresWorkspace(db,cookieToken(request) ?? ''));
      if (request.method === 'GET' && pathname === '/api/identity/me') return send(response,200,await postgresOwnStudentIdentity(db,await auth.authenticate(cookieToken(request))));
      if (request.method === 'GET' && pathname === '/api/identity/requests') return send(response,200,await postgresListStudentIdentityRequests(db,await auth.authenticate(cookieToken(request)),new URL(request.url!,'http://localhost').searchParams));
      if (request.method === 'GET' && pathname === '/api/community') return send(response,200,await postgresCommunityFeed(db,cookieToken(request) ?? '',requestUrl.searchParams));
      if (request.method === 'GET' && pathname === '/api/discover/hot') return send(response,200,await postgresDiscoverHotPage(db,cookieToken(request) ?? ''));
      if(request.method==='GET' && pathname==='/api/community/social') return send(response,200,await postgresCommunitySocial(db,cookieToken(request)??'',requestUrl.searchParams));
      if(request.method==='GET' && pathname==='/api/community/feed') return send(response,200,await postgresCommunityFeed(db,cookieToken(request)??'',requestUrl.searchParams));
      if(request.method==='GET' && pathname==='/api/admin/community/moderation') return send(response,200,await postgresModerationPage(db,await auth.authenticate(cookieToken(request)),requestUrl.searchParams));
      const communityDetail=request.method==='GET' && /^\/api\/community\/posts\/([^/]+)$/.exec(pathname);
      if(communityDetail) return send(response,200,await postgresCommunityPostDetail(db,cookieToken(request)??'',decodeURIComponent(communityDetail[1]),Number(requestUrl.searchParams.get('page'))||1));
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
          const mustChange=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('companionIdentity'),actor));
          if(mustChange) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再继续操作。');
          return send(response,200,await recognize(request));
        }
        if(pathname==='/api/activity/screenshot/import') {
          const token=cookieToken(request) ?? '';
          const actor=await auth.authenticate(token);
          demand(actor.status==='active' && actor.roles.some(role=>role==='operator'||role==='superadmin'),'需要运营职责。',403);
          const mustChange=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('companionIdentity'),actor));
          if(mustChange) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再继续操作。');
          const image=await recognizeActivityScreenshot(request,options.screenshotRecognizer);
          return send(response,200,{data:await executePostgres(db,token,'screenshot.import',{image:image.image,recognizedText:image.text,ocrRequestId:image.requestId},randomUUID())});
        }
        const input = await body(request);
        if(pathname==='/api/auth/email-login/request')return send(response,200,await learningAuth.requestCode(input.email,request.socket.remoteAddress??'unknown',options.localOutbox===true));
        if(pathname==='/api/auth/email-login'||pathname==='/api/auth/school-login'){
          const result=pathname.endsWith('/school-login')?await learningAuth.schoolLogin(input.identifier,input.password,request.socket.remoteAddress??'unknown'):await learningAuth.emailLogin(input.email,input.code,request.socket.remoteAddress??'unknown');
          if('token'in result){response.setHeader('Set-Cookie',cookie(result.token,43200));return send(response,200,{authenticated:true,account:result.account});}
          return send(response,200,result);
        }
        if(pathname==='/api/ai/chat'||pathname==='/api/ai/knowledge'){
          const token=cookieToken(request)??'',actor=await auth.authenticate(token);
          const workspace=await postgresWorkspace(db,token);demand(!workspace.firstLoginOnly,'请先修改本人初始密码。',403);
          const read=async()=>({...workspace,learning:await learning.overview(actor,token)});
          if(pathname==='/api/ai/knowledge'){const result=await ai.retrieve(actor,await read(),await ai.shops(),'校园平台全部资料总目录');return send(response,200,result.coverage)}
          return send(response,200,await ai.ask(actor,input,read,()=>ai.shops()));
        }
        if(pathname==='/api/learning/command'){
          const token=cookieToken(request)??'',actor=await auth.authenticate(token);
          const blocked=await db.transaction(async client=>passwordChangeRequired(await new PostgresRepository(client).all('companionIdentity'),actor));
          demand(!blocked,'请先修改本人初始密码。',403);
          return send(response,200,await learning.operation(actor,token,String(input.operation),input.input&&typeof input.input==='object'&&!Array.isArray(input.input)?input.input as Record<string,unknown>:{}));
        }
        if(pathname==='/api/movement/command'){
          const actor=await auth.authenticate(cookieToken(request));
          const verified=await db.transaction(async client=>{
            const repo=new PostgresRepository(client);demand(!passwordChangeRequired(await repo.all('companionIdentity'),actor),'请先修改本人初始密码。',403);
            return (await repo.all('verifiedEmail')).some(item=>item.ownerId===actor.id&&item.data.email===actor.email);
          });
          demand(['launch','sports.dashboard','sports.records','personal.list','personal.start','personal.pause','personal.resume','personal.finish'].includes(String(input.operation)),'无效运动操作。');
          return send(response,200,await (String(input.operation).startsWith('sports.')?movementNative:movementRequest)(actor,verified,String(input.operation),input.input&&typeof input.input==='object'&&!Array.isArray(input.input)?input.input as Record<string,unknown>:{}));
        }

        if(pathname==='/api/accounts/admin-email/request') {
          demand(Object.keys(input).length===0,'邮箱验证只能使用本人当前邮箱。');
          return send(response,200,await postgresAdminEmailRequest(db,cookieToken(request) ?? '',options.localOutbox===true));
        }
        if(pathname==='/api/accounts/admin-email/confirm') return send(response,200,await postgresAdminEmailConfirm(db,cookieToken(request) ?? '',input));
        if(pathname==='/api/identity/check') return send(response,200,await checkSchoolIdentity(await auth.authenticate(cookieToken(request))));
        if(pathname==='/api/identity/request') return send(response,200,await postgresRequestStudentIdentity(db,await auth.authenticate(cookieToken(request)),input));
        if(pathname==='/api/identity/review') return send(response,200,await postgresReviewStudentIdentity(db,await auth.authenticate(cookieToken(request)),input));
        if (pathname === '/api/commands') {
          demand(input.action !== 'screenshot.import','请通过截图上传入口识别活动。',403);
          const key = input.requestId;
          demand(typeof key==='string','缺少操作幂等标识。');
          demand(typeof input.action==='string' && input.input && typeof input.input==='object' && !Array.isArray(input.input),'请求格式无效。');
          demand(!input.action.startsWith('sports.'),'该操作不属于伴学系统。',403);
          return send(response,200,{data:await executePostgres(db,cookieToken(request) ?? '',input.action,input.input as Record<string,unknown>,key)});
        }
        if (pathname === '/api/auth/sign-in' || pathname === '/api/auth/login' || pathname === '/api/auth/admin-login') {
          const kind = pathname.endsWith('/admin-login') ? 'ADMIN' : pathname.endsWith('/login') ? 'PERSONAL' : undefined;
          const result = await auth.login(kind==='ADMIN' ? input.loginName : kind==='PERSONAL' ? input.email : input.identifier,input.password,kind,undefined,request.socket.remoteAddress ?? 'unknown');
          response.setHeader('Set-Cookie',cookie(result.token,43200));
          return send(response,200,{authenticated:true,account:result.account});
        }
        if (pathname === '/api/auth/verification-codes') return send(response,200,await mail.sendVerification(input.email,options.localOutbox===true,request.socket.remoteAddress ?? 'unknown'));
        if (pathname === '/api/auth/register') return send(response,201,await mail.register(input));
        if (pathname === '/api/auth/password-reset/request') return send(response,200,await postgresRequestPasswordReset(db,input.identifier,request.socket.remoteAddress ?? 'unknown',options.localOutbox===true));
        if (pathname === '/api/auth/password-reset/complete') return send(response,200,await postgresCompletePasswordReset(db,input));
        if (pathname === '/api/auth/logout') {
          learningAuth.forget(cookieToken(request)??'');
          await auth.logout(cookieToken(request));
          response.setHeader('Set-Cookie',cookie('',0));
          return send(response,200,{loggedOut:true});
        }
        if (pathname === '/api/auth/email/request' || pathname === '/api/auth/email/confirm') {
          const actor = await auth.authenticate(cookieToken(request));
          demand(actor.status!=='banned','账号已封禁。',403);
          return send(response,200,pathname.endsWith('/request') ? await mail.sendVerification(actor.email,options.localOutbox===true,request.socket.remoteAddress ?? 'unknown') : await mail.verifyOwnEmail(actor,input.code));
        }
      }
      return send(response,404,{code:'NOT_FOUND',message:'接口不存在。'});
    } catch (error) {
      if (error instanceof ServiceError) return send(response,error.status,{code:error.code,message:error.message});
      console.error('PostgreSQL API request failed');
      return send(response,500,{code:'INTERNAL_ERROR',message:'操作失败，请重试。'});
    }
  });
}
