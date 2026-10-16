import {randomInt,randomUUID} from 'node:crypto';
import {demand,digest,hashPassword,ServiceError,timestamp} from './auth';
import {transaction,type Database} from './database';
import {deliverOutbox} from './mail-delivery';
import {takeEmailSend} from './security-rate';

const response={sent:true,message:'如果账号存在且邮箱已验证，找回验证码已发送。'};
function identifier(value:unknown) {
  demand(typeof value==='string' && value.trim().length>0 && value.trim().length<=254,'请填写邮箱或管理登录账号。');
  return value.trim().toLowerCase();
}
function rowFor(db:Database,key:string) {
  return db.prepare("SELECT id,email,login_kind,status FROM accounts WHERE (login_kind='PERSONAL' AND email=?) OR (login_kind='ADMIN' AND login_name=?) LIMIT 1").get(key,key) as {id:string;email:string;login_kind:string;status:string}|undefined;
}
function verified(db:Database,row:{id:string;email:string;login_kind:string}) {
  if(row.login_kind==='PERSONAL') return !!db.prepare("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=? AND json_extract(data,'$.email')=? LIMIT 1").get(row.id,row.email);
  return !!db.prepare("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=? AND json_extract(data,'$.role')='admin' AND json_extract(data,'$.status')='verified' AND json_extract(data,'$.schoolEmailVerified')=1 AND json_extract(data,'$.schoolEmail')=? LIMIT 1").get(row.id,row.email);
}
export async function requestPasswordReset(db:Database,value:unknown,origin:string,localOutbox:boolean) {
  demand(localOutbox||process.env.BNBU_EMAIL_DELIVERY_URL,'尚未配置验证码邮件服务。',503);
  const key=identifier(value),account=rowFor(db,key);
  const email=account?.email ?? (key.includes('@')?key:`unknown:${key}`);
  try {takeEmailSend(db,email,origin)} catch(error) {if(error instanceof ServiceError && error.status===429) return response;throw error}
  if(!account || !verified(db,account)) return response;
  const now=Date.now();
  const previous=db.prepare('SELECT sent_at FROM password_reset_challenges WHERE account_id=? ORDER BY sent_at DESC LIMIT 1').get(account.id) as {sent_at:number}|undefined;
  if(previous && now-previous.sent_at<60_000) return response;
  const id=randomUUID(),mailId=randomUUID(),code=String(randomInt(100000,1000000));
  transaction(db,()=>{
    db.prepare('UPDATE password_reset_challenges SET consumed_at=? WHERE account_id=? AND consumed_at IS NULL').run(now,account.id);
    db.prepare('INSERT INTO password_reset_challenges(id,account_id,identifier,email,code_hash,expires_at,sent_at) VALUES(?,?,?,?,?,?,?)').run(id,account.id,key,account.email,digest(id+':'+code),now+600_000,now);
    db.prepare('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)').run(mailId,account.email,'伴学找回密码',`验证码：${code}，10 分钟内有效。`,timestamp());
    db.prepare('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),account.id,'','auth.password.reset.request',account.id,'',JSON.stringify({challengeId:id}),timestamp());
  });
  try {await deliverOutbox(db,mailId,localOutbox)} catch(error) {console.error('Password reset mail delivery unconfirmed:',error)}
  return response;
}
export function completePasswordReset(db:Database,input:Record<string,unknown>) {
  const key=identifier(input.identifier);
  demand(typeof input.code==='string' && /^\d{6}$/.test(input.code),'请填写六位验证码。');
  const passwordHash=hashPassword(input.password);
  const result=transaction(db,()=>{
    const row=db.prepare('SELECT * FROM password_reset_challenges WHERE identifier=? ORDER BY sent_at DESC LIMIT 1').get(key) as {id:string;account_id:string;email:string;code_hash:string;expires_at:number;attempts:number;consumed_at:number|null}|undefined;
    if(!row || row.consumed_at!==null || row.expires_at<=Date.now() || row.attempts>=5) return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    db.prepare('UPDATE password_reset_challenges SET attempts=attempts+1 WHERE id=?').run(row.id);
    if(row.code_hash!==digest(row.id+':'+input.code)) return new ServiceError(400,'INVALID_CHALLENGE',`验证码错误，剩余 ${Math.max(0,4-row.attempts)} 次。`);
    const account=db.prepare('SELECT id,email FROM accounts WHERE id=?').get(row.account_id) as {id:string;email:string}|undefined;
    if(!account || account.email!==row.email) return new ServiceError(409,'ACCOUNT_CHANGED','账号邮箱已变化，请重新申请。');
    db.prepare('UPDATE accounts SET password_hash=? WHERE id=?').run(passwordHash,row.account_id);
    db.prepare('DELETE FROM sessions WHERE account_id=?').run(row.account_id);
    db.prepare('UPDATE password_reset_challenges SET consumed_at=? WHERE account_id=? AND consumed_at IS NULL').run(Date.now(),row.account_id);
    db.prepare('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),row.account_id,'','auth.password.reset.complete',row.account_id,'',JSON.stringify({challengeId:row.id,sessionsRevoked:true}),timestamp());
    return {reset:true};
  });
  if(result instanceof ServiceError) throw result;
  return result;
}
