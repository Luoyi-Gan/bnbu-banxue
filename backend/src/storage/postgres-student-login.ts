import {createHmac,randomBytes,randomInt,randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {account,demand,digest,normalizeEmail,ServiceError,timestamp,type AccountRow} from '../auth';
import {textField,type Fields} from '../repository';
import {deliverMessage} from '../mail-delivery';
import {recordDraftGate} from './postgres-record-drafts';
import type {PostgresDatabase} from './postgres';
import {PostgresRepository} from './postgres-repository';

type Challenge={id:string;account_id:string;email:string;request_hash:string;code_hash:string|null;session_secret:string;sent_at:string;expires_at:string;attempts:number;verified_at:string|null;verify_key:string|null;verify_hash:string|null;mail_id:string};
const checkKey=(key:string)=>demand(key.length>=8 && key.length<=100,'缺少有效操作幂等标识。');
async function student(client:PoolClient,email:string,id?:string) {
  const row=(await client.query<AccountRow>("SELECT * FROM accounts WHERE email=$1 AND login_kind='PERSONAL'",[email])).rows[0];
  demand(row && (!id || row.id===id),'没有可用的已验证学生账号。',403);
  const actor=account(row),repo=new PostgresRepository(client);
  demand(actor.roles.includes('student'),'没有可用的已验证学生账号。',403);
  await recordDraftGate(repo,actor);
  const identities=(await repo.all('sportsIdentity')).filter(i=>i.ownerId===actor.id && i.data.status==='verified' && i.data.role==='student');
  demand(identities.length===1 && identities[0].data.schoolEmailVerified===true && identities[0].data.schoolEmail===email,'没有可用的已验证学生账号。',403);
  return actor;
}
const loginToken=(row:Challenge)=>createHmac('sha256',Buffer.from(row.session_secret,'hex')).update('STUDENT_LOGIN:'+row.id).digest('base64url');

export async function requestStudentLogin(db:PostgresDatabase,input:Fields,key:string,localOutbox=false) {
  checkKey(key);
  demand(Object.keys(input).every(k=>['organizationCode','account','channel','locale'].includes(k)),'验证码参数无效。');
  demand(input.organizationCode==='BNBU' && input.channel==='EMAIL','仅支持学校邮箱验证码。');
  const email=normalizeEmail(input.account),endpoint=process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(email.endsWith('@bnbu.edu.cn'),'请填写学校邮箱。');
  demand(endpoint || localOutbox,'尚未配置验证码邮件服务。',503);
  const hash=digest(JSON.stringify(input));
  const result=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const actor=await student(client,email),now=Date.now();
    const previous=(await client.query<Challenge>('SELECT * FROM student_login_challenges WHERE account_id=$1 AND request_id=$2',[actor.id,key])).rows[0];
    if(previous){
      demand(previous.request_hash===hash,'同一操作标识不能用于不同请求。',409);
      const message=(await client.query<{id:string;recipient:string;subject:string;body:string}>('SELECT id,recipient,subject,body FROM mail_outbox WHERE id=$1 AND delivered_at IS NULL',[previous.mail_id])).rows[0];
      return {id:previous.id,message:message ?? null};
    }
    const latest=(await client.query<Challenge>('SELECT * FROM student_login_challenges WHERE account_id=$1 ORDER BY sent_at DESC LIMIT 1',[actor.id])).rows[0];
    demand(!latest || now-Number(latest.sent_at)>=60000,'请稍后再发送验证码。',429);
    const id=randomUUID(),mailId=randomUUID(),code=String(randomInt(100000,1000000));
    await client.query('DELETE FROM mail_outbox WHERE id IN (SELECT mail_id FROM student_login_challenges WHERE account_id=$1 AND verified_at IS NULL)',[actor.id]);
    await client.query('UPDATE student_login_challenges SET code_hash=NULL WHERE account_id=$1 AND verified_at IS NULL',[actor.id]);
    await client.query('INSERT INTO student_login_challenges(id,account_id,email,request_id,request_hash,code_hash,session_secret,sent_at,expires_at,mail_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,actor.id,email,key,hash,digest(id+':'+code),randomBytes(32).toString('hex'),now,now+600000,mailId]);
    const message={id:mailId,recipient:email,subject:'伴学体育登录验证码',body:`验证码：${code}。仅用于本人学生账号登录，10分钟内有效。`};
    await client.query('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)',[mailId,email,message.subject,message.body,timestamp()]);
    return {id,message};
  });
  if(endpoint && result.message){await deliverMessage(result.message,endpoint);await db.pool.query('UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2',[timestamp(),result.message.id]);}
  return {challengeId:result.id,delivery:endpoint?'email':'local-outbox',message:endpoint?'验证码已发送。':'验证码已写入本地开发收件箱，未发送至真实邮箱。'};
}

export async function verifyStudentLogin(db:PostgresDatabase,input:Fields,key:string) {
  checkKey(key);demand(Object.keys(input).every(k=>['challengeId','code','deviceId'].includes(k)),'验证码参数无效。');
  const id=textField(input,'challengeId',100),code=textField(input,'code',20),hash=digest(JSON.stringify(input));
  const result=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const row=(await client.query<Challenge>('SELECT * FROM student_login_challenges WHERE id=$1 FOR UPDATE',[id])).rows[0],now=Date.now();
    if(!row || Number(row.expires_at)<=now || (row.verified_at===null && row.attempts>=5))return new ServiceError(400,'AUTH_VERIFICATION_CODE_INVALID','验证码无效或已过期。');
    if(row.verified_at===null){
      await client.query('UPDATE student_login_challenges SET attempts=attempts+1 WHERE id=$1',[id]);
      if(row.code_hash!==digest(id+':'+code))return new ServiceError(400,'AUTH_VERIFICATION_CODE_INVALID','验证码无效或已过期。');
    } else demand(row.verify_key===key && row.verify_hash===hash,'验证码已使用。',409);
    const actor=await student(client,row.email,row.account_id),token=loginToken(row);
    if(row.verified_at===null){
      await client.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)',[digest(token),actor.id,now+43200000,timestamp()]);
      await client.query('UPDATE student_login_challenges SET verified_at=$1,code_hash=NULL,verify_key=$2,verify_hash=$3 WHERE id=$4',[now,key,hash,id]);
      await client.query('DELETE FROM mail_outbox WHERE id=$1',[row.mail_id]);
    } else demand((await client.query('SELECT 1 FROM sessions WHERE token_hash=$1 AND expires_at>$2',[digest(token),now])).rows.length===1,'原登录已退出，请重新获取验证码。',401);
    return {token,authSession:{kind:'COMPANION',user:{id:actor.id,role:'STUDENT'}}};
  });
  if(result instanceof ServiceError)throw result;
  return result;
}
