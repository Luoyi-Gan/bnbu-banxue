import {randomInt,randomUUID} from 'node:crypto';
import {demand,digest,hashPassword,ServiceError,timestamp} from '../auth';
import {deliverMessage} from '../mail-delivery';
import type {PostgresDatabase} from './postgres';

const reply={sent:true,message:'如果账号存在且邮箱已验证，找回验证码已发送。'};
function identifier(value:unknown) {demand(typeof value==='string' && value.trim().length>0 && value.trim().length<=254,'请填写邮箱或管理登录账号。');return value.trim().toLowerCase()}
export async function postgresRequestPasswordReset(db:PostgresDatabase,value:unknown,origin:string,localOutbox:boolean) {
  demand(localOutbox||process.env.BNBU_EMAIL_DELIVERY_URL,'尚未配置验证码邮件服务。',503);
  const key=identifier(value),now=Date.now(),subject=digest(key),source=digest(origin);
  const message=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`email-source:${source}`]);
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`password-reset:${key}`]);
    const limits=(await client.query<{key_count:string;day_count:string;source_count:string;global_count:string}>("SELECT count(*) FILTER (WHERE category='password-reset' AND subject=$1 AND occurred_at>=$3) AS key_count,count(*) FILTER (WHERE category='password-reset' AND subject=$1) AS day_count,count(DISTINCT subject) FILTER (WHERE category='email-send' AND origin=$2 AND occurred_at>=$3) AS source_count,count(*) FILTER (WHERE category='email-send' AND occurred_at>=$3) AS global_count FROM security_rate_events WHERE occurred_at>=$4",[subject,source,now-3_600_000,now-86_400_000])).rows[0];
    if(Number(limits.key_count)>=5 || Number(limits.day_count)>=10 || Number(limits.source_count)>=20 || Number(limits.global_count)>=1000) return null;
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('password-reset',$1,$2,$3)",[subject,source,now]);
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('email-send',$1,$2,$3)",[subject,source,now]);
    const account=(await client.query<{id:string;email:string;login_kind:string}>("SELECT id,email,login_kind FROM accounts WHERE (login_kind='PERSONAL' AND email=$1) OR (login_kind='ADMIN' AND login_name=$1) LIMIT 1",[key])).rows[0];
    if(!account) return null;
    const proof=account.login_kind==='PERSONAL'
      ? await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1",[account.id,account.email])
      : await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=$1 AND data::jsonb->>'role'='admin' AND data::jsonb->>'status'='verified' AND data::jsonb->>'schoolEmailVerified'='true' AND data::jsonb->>'schoolEmail'=$2 LIMIT 1",[account.id,account.email]);
    if(!proof.rows.length) return null;
    const emailSubject=digest(account.email);
    const emailLimits=(await client.query<{hour:string;day:string}>("SELECT count(*) FILTER (WHERE occurred_at>=$2) AS hour,count(*) AS day FROM security_rate_events WHERE category='email-send' AND subject=$1 AND occurred_at>=$3",[emailSubject,now-3_600_000,now-86_400_000])).rows[0];
    const includesCurrent=subject===emailSubject ? 1 : 0;
    if(Number(emailLimits.hour)-includesCurrent>=5 || Number(emailLimits.day)-includesCurrent>=10) return null;
    const previous=(await client.query<{sent_at:string}>('SELECT sent_at FROM password_reset_challenges WHERE account_id=$1 ORDER BY sent_at DESC LIMIT 1',[account.id])).rows[0];
    if(previous && now-Number(previous.sent_at)<60_000) return null;
    const id=randomUUID(),mailId=randomUUID(),code=String(randomInt(100000,1000000));
    await client.query('UPDATE password_reset_challenges SET consumed_at=$1 WHERE account_id=$2 AND consumed_at IS NULL',[now,account.id]);
    await client.query('INSERT INTO password_reset_challenges(id,account_id,identifier,email,code_hash,expires_at,sent_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[id,account.id,key,account.email,digest(id+':'+code),now+600_000,now]);
    const outbox={id:mailId,recipient:account.email,subject:'伴学找回密码',body:`验证码：${code}，10 分钟内有效。`};
    await client.query('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)',[mailId,outbox.recipient,outbox.subject,outbox.body,timestamp()]);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),account.id,'','auth.password.reset.request',account.id,'',JSON.stringify({challengeId:id}),timestamp()]);
    return outbox;
  });
  if(message && process.env.BNBU_EMAIL_DELIVERY_URL) {
    try {await deliverMessage(message,process.env.BNBU_EMAIL_DELIVERY_URL);await db.pool.query('UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2',[timestamp(),message.id])}
    catch(error) {console.error('Password reset mail delivery unconfirmed:',error)}
  }
  return reply;
}
export async function postgresCompletePasswordReset(db:PostgresDatabase,input:Record<string,unknown>) {
  const key=identifier(input.identifier);
  demand(typeof input.code==='string' && /^\d{6}$/.test(input.code),'请填写六位验证码。');
  const passwordHash=hashPassword(input.password);
  const result=await db.transaction(async client=>{
    const row=(await client.query<{id:string;account_id:string;email:string;code_hash:string;expires_at:string;attempts:number;consumed_at:string|null}>('SELECT * FROM password_reset_challenges WHERE identifier=$1 ORDER BY sent_at DESC LIMIT 1 FOR UPDATE',[key])).rows[0];
    if(!row || row.consumed_at!==null || Number(row.expires_at)<=Date.now() || row.attempts>=5) return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    await client.query('UPDATE password_reset_challenges SET attempts=attempts+1 WHERE id=$1',[row.id]);
    if(row.code_hash!==digest(row.id+':'+input.code)) return new ServiceError(400,'INVALID_CHALLENGE',`验证码错误，剩余 ${Math.max(0,4-row.attempts)} 次。`);
    const account=(await client.query<{email:string}>('SELECT email FROM accounts WHERE id=$1 FOR UPDATE',[row.account_id])).rows[0];
    if(!account || account.email!==row.email) return new ServiceError(409,'ACCOUNT_CHANGED','账号邮箱已变化，请重新申请。');
    await client.query('UPDATE accounts SET password_hash=$1 WHERE id=$2',[passwordHash,row.account_id]);
    await client.query('DELETE FROM sessions WHERE account_id=$1',[row.account_id]);
    await client.query('UPDATE password_reset_challenges SET consumed_at=$1 WHERE account_id=$2 AND consumed_at IS NULL',[Date.now(),row.account_id]);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),row.account_id,'','auth.password.reset.complete',row.account_id,'',JSON.stringify({challengeId:row.id,sessionsRevoked:true}),timestamp()]);
    return {reset:true};
  });
  if(result instanceof ServiceError) throw result;
  return result;
}
