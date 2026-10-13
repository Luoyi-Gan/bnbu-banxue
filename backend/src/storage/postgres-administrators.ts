import { randomUUID } from 'node:crypto';
import { demand, ServiceError, encodePassword, normalizeEmail, timestamp, type Account } from '../auth';
import { textField, type Fields } from '../repository';
import { version } from "../version-check";
import { accountPermissions } from '../accounts/permissions';
import { passwordChangeRequired } from '../accounts/account-gate';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import type { PostgresDatabase } from './postgres';

export async function requirePostgresSuperAdmin(repo:PostgresRepository,actor:Account) {
  const identities=await repo.all('companionIdentity');
  demand(actor.status!=='banned' && actor.roles.includes('superadmin') && identities.some(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified'),'仅总管理员可执行此治理操作。',403);

}

export async function postgresAdministratorState(repo:PostgresRepository,actor:Account,input:Fields) {
  await requirePostgresSuperAdmin(repo,actor);
  demand(Object.keys(input).every(k=>['id','version','status','handoverConfirmed','confirmed'].includes(k)),'管理账号操作包含不允许的字段。');
  demand(input.confirmed===true,'须核对账号资料、全部权限及高风险权限后确认。');
  const identity=await repo.get(input.id,'companionIdentity');
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
  await repo.create('sportsAdminHistory',actor.id,{administratorId:identity.ownerId,action:'accounts.admins.state',before:row.status,after:next});
  const saved=await repo.save(identity,{accountState:input.status});
  return {id:saved.id};
}

export async function postgresAdministratorCreate(repo:PostgresRepository,actor:Account,input:Fields) {
  await requirePostgresSuperAdmin(repo,actor);
  demand(Object.keys(input).every(k=>['personId','loginName','name','email','department','permissions','initialPassword','confirmPassword','confirmed'].includes(k)),'管理账号操作包含不允许的字段。');
  demand(input.confirmed===true,'须核对账号资料、全部权限及高风险权限后确认。');
  const name=textField(input,'name',40),email=normalizeEmail(input.email),department=textField(input,'department',200,true);
  const domains=(process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? 'bnbu.edu.cn').split(',').map(d=>d.trim().toLowerCase()).filter(Boolean);
  demand(domains.includes(email.split('@')[1]),'请填写已配置学校域名的邮箱。');
  demand(Array.isArray(input.permissions) && input.permissions.length>0 && input.permissions.every(p=>accountPermissions.includes(p)) && new Set(input.permissions).size===input.permissions.length,'须选择至少一项固定业务权限，不得授予管理账号或教师权限。');
  demand(!(await repo.client.query("SELECT id FROM accounts WHERE email=$1 AND login_kind='ADMIN'",[email])).rows.length,'学校邮箱已被另一分管理员使用。',409);
  const personId=textField(input,'personId',100);
  const person=(await repo.client.query('SELECT status,login_kind FROM accounts WHERE id=$1',[personId])).rows[0];
  demand(person?.status==='active' && person.login_kind==='PERSONAL' && (await repo.all('companionIdentity')).some(i=>i.ownerId===personId && i.data.status==='verified'),'请选择当前已完成身份核验的人员。',409);
  const loginName=textField(input,'loginName',100).toLowerCase();
  demand(!(await repo.client.query('SELECT id FROM accounts WHERE login_name=$1',[loginName])).rows.length,'管理登录账号已存在。',409);
  demand(typeof input.initialPassword==='string' && input.initialPassword.length>0 && input.initialPassword===input.confirmPassword,'须填写初始密码且两次输入一致。');
  const id=randomUUID();
  await repo.client.query("INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at,login_kind,login_name) VALUES($1,$2,$3,$4,$5,$6,$7,'ADMIN',$8)",[id,email,encodePassword(input.initialPassword),name,department,JSON.stringify(['admin']),timestamp(),loginName]);
  const saved=await repo.create('companionIdentity',id,{role:'admin',status:'verified',permissions:input.permissions,mustChangePassword:true,accountState:'ACTIVE',source:'SUPERADMIN_CONFIRMED_PERSON',verifiedPersonId:personId});
  await repo.create('sportsAdminHistory',actor.id,{administratorId:id,action:'accounts.admins.create',permissions:input.permissions});
  return {id:saved.id};
}

export async function postgresAdministratorEdit(repo:PostgresRepository,actor:Account,input:Fields) {
  await requirePostgresSuperAdmin(repo,actor);
  demand(Object.keys(input).every(k=>['id','version','name','email','department','permissions','confirmed'].includes(k)),'管理账号操作包含不允许的字段。');
  demand(input.confirmed===true,'须核对账号资料、全部权限及高风险权限后确认。');
  const identity=await repo.get(input.id,'companionIdentity');
  demand(identity.data.role==='admin' && identity.ownerId!==actor.id,'不能修改本人或非分管理员账号。',403);
  const row=(await repo.client.query('SELECT login_kind,roles,name,email,organization FROM accounts WHERE id=$1 FOR UPDATE',[identity.ownerId])).rows[0];
  demand(row?.login_kind==='ADMIN' && !JSON.parse(row.roles).includes('superadmin'),'仅可管理独立分管理员账号。',403);
  version(identity,input);
  const name=textField(input,'name',40),email=normalizeEmail(input.email),department=textField(input,'department',200,true);
  const domains=(process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? 'bnbu.edu.cn').split(',').map(d=>d.trim().toLowerCase()).filter(Boolean);
  demand(domains.includes(email.split('@')[1]),'请填写已配置学校域名的邮箱。');
  demand(Array.isArray(input.permissions) && input.permissions.length>0 && input.permissions.every(p=>accountPermissions.includes(p)) && new Set(input.permissions).size===input.permissions.length,'须选择至少一项固定业务权限，不得授予管理账号或教师权限。');
  demand(!(await repo.client.query("SELECT id FROM accounts WHERE email=$1 AND login_kind='ADMIN' AND id<>$2",[email,identity.ownerId])).rows.length,'学校邮箱已被另一分管理员使用。',409);
  if(row.email!==email) {
    await repo.client.query('DELETE FROM mail_outbox WHERE id IN (SELECT mail_id FROM admin_security_challenges WHERE account_id=$1)',[identity.ownerId]);
    await repo.client.query('DELETE FROM admin_security_challenges WHERE account_id=$1',[identity.ownerId]);
  }
  await repo.client.query('UPDATE accounts SET name=$1,email=$2,organization=$3 WHERE id=$4',[name,email,department,identity.ownerId]);
  await repo.create('sportsAdminHistory',actor.id,{administratorId:identity.ownerId,action:'accounts.admins.edit',before:{name:row.name,email:row.email,organization:row.organization,permissions:identity.data.permissions},after:{name,email,organization:department,permissions:input.permissions}});
  const saved=await repo.save(identity,{permissions:input.permissions,...(row.email!==email?{schoolEmailVerified:false,schoolEmail:null}:{})});
  return {id:saved.id};
}

export async function postgresAdministratorDirectory(db:PostgresDatabase, token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    const repo=new PostgresRepository(client), identities=await repo.all('companionIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再继续操作。');
    await requirePostgresSuperAdmin(repo,actor);
    const rows=(await client.query("SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name")).rows;
    return {
      permissions:accountPermissions,
      items:rows.map(a=>{
        const identity=identities.find(i=>i.ownerId===a.id && i.data.role==='admin');
        return {id:a.id,identityId:identity?.id,loginName:a.login_name,name:a.name,email:a.email,department:a.organization,status:a.status==='active'?'ACTIVE':'DISABLED',permissions:identity?.data.permissions ?? [],version:identity?.version,updatedAt:identity?.updatedAt};
      }),
      candidates:(await client.query("SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='companionIdentity' AND i.data::jsonb->>'status'='verified' ORDER BY a.name")).rows,
    };
  });
}
