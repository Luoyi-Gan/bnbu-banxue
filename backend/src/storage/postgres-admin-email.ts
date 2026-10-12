import { randomInt, randomUUID } from 'node:crypto';
import { demand, digest, ServiceError, timestamp } from '../auth';
import { textField, type Fields } from '../repository';
import { deliverMessage } from '../mail-delivery';
import { passwordChangeRequired } from '../sports/account-gate';
import { PostgresRepository } from './postgres-repository';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import type { PoolClient } from 'pg';

async function current(db:PostgresDatabase,client:PoolClient,token:string) {
  const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
  const identities=await repo.all('companionIdentity');
  if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');

  const identity=identities.find(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified');
  const account=(await client.query('SELECT email,status,login_kind,roles FROM accounts WHERE id=$1',[actor.id])).rows[0];
  demand(identity && account?.status==='active' && (account.login_kind==='ADMIN' || JSON.parse(account.roles).includes('superadmin')),'仅当前有效管理员可验证本人邮箱。',403);
  return {actor,repo,identity,email:String(account.email)};
}

export async function postgresAdminEmailStatus(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const {identity,email}=await current(db,client,token);
    return {email,verified:identity.data.schoolEmailVerified===true && identity.data.schoolEmail===email};
  });
}

export async function postgresAdminEmailRequest(db:PostgresDatabase,token:string,localOutbox:boolean) {
  const endpoint=process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint,'尚未配置验证码邮件服务。',503);
  const message=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const {actor,identity,email}=await current(db,client,token),now=Date.now();
    const previous=(await client.query("SELECT sent_at FROM admin_security_challenges WHERE account_id=$1 AND purpose='EMAIL_VERIFY' ORDER BY sent_at DESC LIMIT 1",[actor.id])).rows[0];
    demand(!previous || now-Number(previous.sent_at)>=60000,'请稍后再发送验证码。',429);
    const id=randomUUID(),mailId=randomUUID(),code=String(randomInt(100000,1000000));
    await client.query("UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=$1 WHERE account_id=$2 AND purpose='EMAIL_VERIFY' AND consumed_at IS NULL",[now,actor.id]);
    await client.query("INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES($1,$2,'EMAIL_VERIFY',$3,$4,$5,$6,$7,$8)",[id,actor.id,email,digest(id+':'+code),now+600000,now,identity.version,mailId]);
    const item={id:mailId,recipient:email,subject:'伴学管理账号邮箱验证',body:`验证码：${code}，10分钟内有效，仅用于验证管理账号邮箱。`};
    await client.query('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)',[item.id,email,item.subject,item.body,timestamp()]);
    return {...item,challengeId:id};
  });
  if(endpoint) {
    await deliverMessage(message,endpoint);
    await db.pool.query('UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2',[timestamp(),message.id]);
  }
  return {sent:true,delivery:endpoint?'email':'local-outbox',message:endpoint?'验证码已发送，请查看邮箱。':'验证码已写入本地开发收件箱，未发送至真实邮箱。',challengeId:message.challengeId};
}

export async function postgresAdminEmailConfirm(db:PostgresDatabase,token:string,input:Fields) {
  demand(Object.keys(input).every(k=>['challengeId','code'].includes(k)),'邮箱验证参数无效。');
  const id=textField(input,'challengeId',100),code=textField(input,'code',20);
  const result=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const {actor,repo,identity,email}=await current(db,client,token),now=Date.now();
    const row=(await client.query("SELECT * FROM admin_security_challenges WHERE id=$1 AND account_id=$2 AND purpose='EMAIL_VERIFY' FOR UPDATE",[id,actor.id])).rows[0];
    if(!row || row.consumed_at!==null || Number(row.expires_at)<=now || Number(row.attempts)>=5) return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    await client.query('UPDATE admin_security_challenges SET attempts=attempts+1 WHERE id=$1',[id]);
    if(row.code_hash!==digest(id+':'+code)) return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    if(row.email!==email || Number(row.identity_version)!==identity.version) return new ServiceError(409,'VERSION_CONFLICT','账号资料已变化，请重新获取验证码。');
    await repo.save(identity,{schoolEmail:email,schoolEmailVerified:true,schoolEmailVerifiedAt:now});
    await client.query('UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=$1 WHERE id=$2',[now,id]);
    await client.query('DELETE FROM mail_outbox WHERE id=$1',[row.mail_id]);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,'admin','sports.account.email.verify',identity.id,'',JSON.stringify({purpose:'EMAIL_VERIFY',result:'VERIFIED'}),timestamp()]);
    return {verified:true};
  });
  if(result instanceof ServiceError) throw result;
  return result;
}
