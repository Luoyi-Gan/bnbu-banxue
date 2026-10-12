import { demand, ServiceError, type Account } from '../auth';
import type { Fields } from '../repository';
import { version } from "../version-check";
import { passwordChangeRequired } from '../sports/account-gate';
import { PostgresRepository } from './postgres-repository';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { requirePostgresSuperAdmin } from './postgres-administrators';

export async function postgresAdministratorSelf(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client),identities=await repo.all('companionIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');

    const row=(await client.query("SELECT login_name,name,email FROM accounts WHERE id=$1 AND login_kind='ADMIN'",[actor.id])).rows[0];
    const identity=identities.find(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified');
    demand(row && identity && !actor.roles.includes('superadmin'),'该流程仅适用独立分管理员。',403);
    return {id:identity.id,version:identity.version,loginName:row.login_name,name:row.name,email:row.email};
  });
}

export async function postgresAdministratorDelete(repo:PostgresRepository,actor:Account,action:string,input:Fields) {
  const self=action==='sports.account.close';
  if(!self) await requirePostgresSuperAdmin(repo,actor);

  if(!self && input.accountId!==undefined) {
    demand(Object.keys(input).every(k=>['accountId','version','confirmed','handoverConfirmed'].includes(k)),'账号删除参数无效。');
    const identities=(await repo.all('companionIdentity')).filter(i=>i.ownerId===input.accountId && i.data.role==='admin');
    demand(identities.length===1,'管理账号不存在或身份资料需核对。',404);
    const snapshot=(await repo.client.query('SELECT login_name,name,email FROM accounts WHERE id=$1',[input.accountId])).rows[0];
    demand(snapshot,'管理账号不存在。',404);
    input={id:identities[0].id,version:input.version,confirmed:input.confirmed,handoverConfirmed:input.handoverConfirmed,loginName:snapshot.login_name,name:snapshot.name,email:snapshot.email};
  }
  demand(Object.keys(input).every(k=>['id','version','confirmed','handoverConfirmed','loginName','name','email'].includes(k)),'账号删除参数无效。');
  const identity=await repo.get(input.id,'companionIdentity');
  version(identity,input);
  demand(identity.data.role==='admin' && identity.ownerId,'只能删除独立分管理员。');
  demand(self?identity.ownerId===actor.id:identity.ownerId!==actor.id,'无权删除此账号。',403);
  if(self) demand(identity.data.status==='verified' && actor.status==='active','当前管理身份不可用。',403);
  const row=(await repo.client.query('SELECT * FROM accounts WHERE id=$1 FOR UPDATE',[identity.ownerId])).rows[0];
  demand(row?.login_kind==='ADMIN' && !JSON.parse(row.roles).includes('superadmin'),'该流程不适用总管理员或个人账号。',403);
  demand(input.confirmed===true && input.handoverConfirmed===true,'须确认已完成全部职责移交。');
  demand(input.loginName===row.login_name && input.name===row.name && input.email===row.email,'账号资料已变化，请重新核对姓名、登录账号和邮箱。',409);
  for(const history of (await repo.all('sportsAdminHistory')).filter(h=>h.data.administratorId===identity.ownerId)) {
    const data={...history.data};
    for(const key of ['before','after']) {
      const value=data[key];
      if(value && typeof value==='object' && !Array.isArray(value)) {
        const copy={...value as Fields};delete copy.name;delete copy.email;delete copy.organization;data[key]=copy;
      }
    }
    await repo.client.query('UPDATE entities SET data=$1 WHERE id=$2',[JSON.stringify(data),history.id]);
  }
  for(const [table,column] of [['sessions','account_id'],['notifications','recipient_id'],['relations','account_id'],['command_receipts','actor_id']] as const) await repo.client.query(`DELETE FROM ${table} WHERE ${column}=$1`,[identity.ownerId]);
  await repo.client.query('DELETE FROM mail_outbox WHERE id IN (SELECT mail_id FROM admin_security_challenges WHERE account_id=$1)',[identity.ownerId]);
  await repo.client.query('DELETE FROM admin_security_challenges WHERE account_id=$1',[identity.ownerId]);
  await repo.client.query("DELETE FROM entities WHERE owner_id=$1 AND kind='companionIdentity'",[identity.ownerId]);
  await repo.client.query("UPDATE accounts SET email=NULL,password_hash=NULL,name=NULL,organization=NULL,roles='[]',status='banned',login_name=NULL,login_kind='HISTORY' WHERE id=$1",[identity.ownerId]);
  const deletedAt=Date.now(),deletedVersion=identity.version+1;
  await repo.create('sportsAdminHistory',actor.id,{administratorId:identity.ownerId,action,handoverConfirmed:true,deletedAt,deletedVersion});
  return {id:identity.ownerId,deleted:true,deletedAt:new Date(deletedAt).toISOString(),version:deletedVersion};
}
