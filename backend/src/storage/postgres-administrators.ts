import { demand, ServiceError, type Account } from '../auth';
import type { Fields } from '../repository';
import { version } from '../sports/courses';
import { sportsPermissions } from '../sports/permissions';
import { passwordChangeRequired } from '../sports/account-gate';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import type { PostgresDatabase } from './postgres';

export async function requirePostgresSuperAdmin(repo:PostgresRepository,actor:Account) {
  const identities=await repo.all('sportsIdentity');
  demand(actor.status!=='banned' && actor.roles.includes('superadmin') && identities.some(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified'),'仅体育总管理员可执行此治理操作。',403);
  const system=(await repo.all('sportsSystem'))[0];
  demand(!system || system.data.mode==='NORMAL','体育服务维护中，普通业务暂停。',503);
}

export async function postgresAdministratorState(repo:PostgresRepository,actor:Account,input:Fields) {
  await requirePostgresSuperAdmin(repo,actor);
  demand(Object.keys(input).every(k=>['id','version','status','handoverConfirmed','confirmed'].includes(k)),'管理账号操作包含不允许的字段。');
  demand(input.confirmed===true,'须核对账号资料、全部权限及高风险权限后确认。');
  const identity=await repo.get(input.id,'sportsIdentity');
  demand(identity.data.role==='admin' && identity.ownerId!==actor.id,'不能修改本人或非分管理员账号。',403);
  const row=(await repo.client.query('SELECT login_kind,roles,status FROM accounts WHERE id=$1 FOR UPDATE',[identity.ownerId])).rows[0];
  demand(row?.login_kind==='ADMIN' && !JSON.parse(row.roles).includes('superadmin'),'仅可管理独立分管理员账号。',403);
  version(identity,input);
  demand(input.status==='ACTIVE' || input.status==='DISABLED','分管理员状态无效。');
  const next=input.status==='ACTIVE'?'active':'banned';
  demand(row.status!==next,'账号状态已变化，请刷新。',409);
  if(next==='banned') demand(input.handoverConfirmed===true,'停用前须确认已完成职责移交。');
  await repo.client.query('UPDATE accounts SET status=$1 WHERE id=$2',[next,identity.ownerId]);
  if(next==='banned') await repo.client.query('DELETE FROM sessions WHERE account_id=$1',[identity.ownerId]);
  await repo.create('sportsAdminHistory',actor.id,{administratorId:identity.ownerId,action:'sports.admins.state',before:row.status,after:next});
  const saved=await repo.save(identity,{accountState:input.status});
  return {id:saved.id};
}

export async function postgresAdministratorDirectory(db:PostgresDatabase, token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    const repo=new PostgresRepository(client), identities=await repo.all('sportsIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
    await requirePostgresSuperAdmin(repo,actor);
    const rows=(await client.query("SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name")).rows;
    return {
      permissions:sportsPermissions,
      items:rows.map(a=>{
        const identity=identities.find(i=>i.ownerId===a.id && i.data.role==='admin');
        return {id:a.id,identityId:identity?.id,loginName:a.login_name,name:a.name,email:a.email,department:a.organization,status:a.status==='active'?'ACTIVE':'DISABLED',permissions:identity?.data.permissions ?? [],version:identity?.version,updatedAt:identity?.updatedAt};
      }),
      candidates:(await client.query("SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='sportsIdentity' AND i.data::jsonb->>'status'='verified' ORDER BY a.name")).rows,
    };
  });
}
