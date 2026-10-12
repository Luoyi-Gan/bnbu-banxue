import { randomUUID } from 'node:crypto';
import { demand, digest, ServiceError, timestamp } from '../auth';
import { communityPolicy } from '../community';
import { coffeePolicy } from '../coffee';
import { governancePolicy } from '../governance';
import { activityPolicy } from '../activities';
import { alumniPolicy } from '../alumni';
import { relationPolicy } from '../relation-policy';
import { notificationPolicy } from '../notification-policy';
import type { Fields } from '../repository';
import { passwordChangeRequired } from '../sports/account-gate';
import { runAsync } from './effects';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import { postgresPassword } from './postgres-password';
import { postgresAdministratorState, postgresAdministratorCreate, postgresAdministratorEdit, requirePostgresSuperAdmin } from './postgres-administrators';
import { postgresAdministratorDelete } from './postgres-admin-deletion';
import { sportsHelpPolicy } from '../sports/help';
import { requireSportsPermission } from '../sports/permissions';
import { sportsAvailable } from '../sports/materials';
import { projectSportsNotification } from '../sports/portal-notifications';
import { sportsSessionPolicy } from '../sports/sessions';
import { saveSportsPreferences, sportsPreferencesGate } from './postgres-sports-preferences';
import { studentSessionProjection } from './postgres-sports-session';
import { sportsRole } from '../sports/courses';

export async function executePostgres(db: PostgresDatabase, token: string, action: string, input: Fields, requestId: string) {
  demand(/^[a-z]+(?:\.[a-z]+)+$/.test(action) && requestId.length>=8 && requestId.length<=100,'请求格式无效。');
  return db.transaction(async client => {
    // Preserve SQLite's serialized business-command boundary while policies are migrated.
    // All API instances share this lock; external I/O must remain outside this transaction.
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const actor = await new PostgresAuth(db).authenticate(token,client);
    demand(actor.status!=='banned','账号已封禁，不能进行业务写入。',403);
    const repo = new PostgresRepository(client);
    if(action!=='sports.password.change' && passwordChangeRequired(await repo.all('sportsIdentity'),actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
    for(const [name,key] of [['room.decide','accept'],['report.decide','upheld'],['coffee.answer','accept'],['coffee.slot.update','closed'],['certification.review','approve'],['organization.review','approve'],['activity.visibility','publish'],['mail.visibility','publish'],['alumni.review','approve'],['alumni.decide','accept'],['alumni.profile','accepting']] as const) {
      if(action===name) demand(typeof input[key]==='boolean',`${key} 必须明确为 true 或 false。`);
    }
    const hash = digest(JSON.stringify({action,input}));
    if(action.startsWith('sports.exercise.')) {
      const identities=await repo.all('sportsIdentity'),systems=await repo.all('sportsSystem');
      sportsRole({all:()=>identities},actor,'student');
      sportsAvailable({all:()=>systems});
    }
    if(action==='sports.preferences.save') await sportsPreferencesGate(repo,actor);
    if(action==='sports.notification.read') {
      const identities=await repo.all('sportsIdentity');
      demand(identities.filter(i=>i.ownerId===actor.id && i.data.status==='verified' && ['student','teacher','admin'].includes(String(i.data.role))).length===1,'没有有效体育身份。',403);
      const systems=await repo.all('sportsSystem');
      sportsAvailable({all:()=>systems});
      demand(typeof input.id==='string' && (await client.query("SELECT 1 FROM notifications WHERE id=$1 AND recipient_id=$2 AND event LIKE 'sports.%'",[input.id,actor.id])).rows.length===1,'通知不存在。',404);
    }
    if(action.startsWith('sports.admins.')) await requirePostgresSuperAdmin(repo,actor);
    if(action.startsWith('sports.help.')) {
      const identities=await repo.all('sportsIdentity'),system=await repo.all('sportsSystem');
      requireSportsPermission({all:()=>identities},actor,'HELP');
      sportsAvailable({all:()=>system});
    }
    const previous = (await client.query<{request_hash:string;result:string}>('SELECT request_hash,result FROM command_receipts WHERE actor_id=$1 AND request_id=$2',[actor.id,requestId])).rows[0];
    if(previous) {
      demand(previous.request_hash===hash,'该请求标识已用于不同操作。',409);
      return JSON.parse(previous.result) as Fields;
    }
    let result:Fields|undefined;
    if(action==='sports.password.change') result=await postgresPassword(client,repo,actor,token,input);
    else if(action.startsWith('sports.exercise.')) {
      const operation=action.split('.')[2];
      demand(['start','pause','resume','finish'].includes(operation),'未知运动动作。');
      const allowed=operation==='start'?['enrollmentId','clientObservedAt']:['id','expectedVersion','clientObservedAt'];
      demand(Object.keys(input).every(k=>allowed.includes(k)),'运动请求参数无效。');
      demand(typeof input.clientObservedAt==='string' && Number.isFinite(Date.parse(input.clientObservedAt)),'客户端时间格式无效。');
      let fields:Fields;
      if(operation==='start') {
        const enrollment=await repo.get(input.enrollmentId,'sportsEnrollment');
        demand(enrollment.ownerId===actor.id && enrollment.data.status==='ACTIVE','须使用本人有效成员关系。',403);
        fields={courseId:enrollment.data.courseId};
      } else fields={id:input.id,version:input.expectedVersion};
      const session=await runAsync(sportsSessionPolicy(repo,actor,`sports.session.${operation==='finish'?'end':operation}`,fields));
      demand(session,'运动会话操作失败。',500);
      result=studentSessionProjection(session);
    }
    else if(action==='sports.preferences.save') result=await saveSportsPreferences(repo,actor,input);
    else if(action.startsWith('sports.session.')) {
      const session=await runAsync(sportsSessionPolicy(repo,actor,action,input));
      if(session) result={id:session.id};
    }
    else if(action==='sports.notification.read') {
      await runAsync(notificationPolicy(repo,actor,'notification.read',input));
      const row=(await client.query<Fields>('SELECT n.*,e.kind AS target_kind,e.owner_id AS target_owner FROM notifications n LEFT JOIN entities e ON e.id=n.entity_id WHERE n.id=$1 AND n.recipient_id=$2',[input.id,actor.id])).rows[0];
      result=projectSportsNotification(row,row.target_kind ? {kind:row.target_kind,owner_id:row.target_owner} : undefined);
    }
    else if(action.startsWith('sports.help.')) {
      const article=await runAsync(sportsHelpPolicy(repo,actor,action,input));
      if(article) result={id:article.id};
    }
    else if(action==='sports.admins.state') result=await postgresAdministratorState(repo,actor,input);
    else if(action==='sports.admins.create') result=await postgresAdministratorCreate(repo,actor,input);
    else if(action==='sports.admins.edit') result=await postgresAdministratorEdit(repo,actor,input);
    else if(action==='sports.admins.delete' || action==='sports.account.close') result=await postgresAdministratorDelete(repo,actor,action,input);
    else if(action.startsWith('notification.')) result=await runAsync(notificationPolicy(repo,actor,action,input));
    else {
      const entity = action==='relation.set' ? await runAsync(relationPolicy(repo,actor,input)) : await runAsync(communityPolicy(repo,actor,action,input)) ?? await runAsync(coffeePolicy(repo,actor,action,input)) ?? await runAsync(governancePolicy(repo,actor,action,input)) ?? await runAsync(activityPolicy(repo,actor,action,input)) ?? await runAsync(alumniPolicy(repo,actor,action,input));
      if(entity) result={id:entity.id};
    }
    demand(result,'该业务操作的 PostgreSQL 迁移尚未完成。',503);
    const auditData = {result,...(action==='coffee.answer' ? {accepted:input.accept} : {}),...(action==='relation.set' ? {relation:{kind:input.kind,enabled:input.enabled===true}} : {}),...(['room.create','room.decide','room.finish','room.moderate'].includes(action) ? {teamResult:await repo.get(result.id)} : {})};
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,actor.roles.join(','),action,typeof input.id==='string'?input.id:result.id ?? null,typeof input.reason==='string'?input.reason:'',JSON.stringify(auditData),timestamp()]);
    await client.query('INSERT INTO command_receipts(actor_id,request_id,request_hash,result,created_at) VALUES($1,$2,$3,$4,$5)',[actor.id,requestId,hash,JSON.stringify(result),timestamp()]);
    return result;
  });
}
