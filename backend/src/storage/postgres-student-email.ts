import { createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { PoolClient } from 'pg';
import { demand, digest, normalizeEmail, ServiceError, timestamp } from '../auth';
import { textField, type Fields } from '../repository';
import { deliverMessage } from '../mail-delivery';
import { sportsAvailable } from '../sports/materials';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

type Challenge={id:string;email:string;invitation_id:string;request_hash:string;code_hash:string|null;proof_secret:string;sent_at:string;expires_at:string;attempts:number;verified_at:string|null;verify_key:string|null;verify_hash:string|null;mail_id:string};
function keyValid(key:string) {demand(key.length>=8 && key.length<=100,'缺少有效操作幂等标识。');}
function schoolEmail(value:unknown) {const email=normalizeEmail(value);demand(/^[a-z][0-9]{9}@bnbu\.edu\.cn$/.test(email),'请填写有效学生学校邮箱。');return email;}
async function invitation(repo:PostgresRepository,code:string) {
  const systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
  const invite=(await repo.all('sportsInvitation')).find(i=>i.data.code===code);
  demand(invite && invite.data.status==='ACTIVE' && Number(invite.data.expiresAt)>Date.now(),'邀请无效、已撤销或已过期。',410);
  const course=await repo.get(invite.data.courseId,'sportsCourse'),semester=await repo.get(course.data.semesterId,'sportsSemester');
  demand(course.data.status==='PUBLISHED' && course.data.enrollmentOpen===true && semester.data.status==='CURRENT','课程未开放入班。',409);
  return invite;
}
const proof=(row:Challenge)=>row.id+'.'+createHmac('sha256',Buffer.from(row.proof_secret,'hex')).update('JOIN_EMAIL:'+row.id).digest('base64url');
export async function readStudentJoinEmailProof(client:PoolClient,token:unknown,invitationId:string) {
  demand(typeof token==='string' && token.length<=200,'邮箱验证证明无效。',403);
  const row=(await client.query<Challenge>('SELECT * FROM student_email_challenges WHERE id=$1',[token.split('.')[0]])).rows[0];
  demand(row && row.verified_at!==null && row.invitation_id===invitationId && Number(row.expires_at)>Date.now() && timingSafeEqual(Buffer.from(digest(token),'hex'),Buffer.from(digest(proof(row)),'hex')),'邮箱验证证明无效或已过期。',403);
  return {challengeId:row.id,email:row.email,expiresAt:Number(row.expires_at)};
}

export async function requestStudentJoinEmail(db:PostgresDatabase,input:Fields,key:string,localOutbox=false) {
  keyValid(key);
  demand(Object.keys(input).every(k=>['organizationCode','account','channel','locale','joinInviteToken'].includes(k)),'验证码参数无效。');
  demand(input.organizationCode==='BNBU' && input.channel==='EMAIL','仅支持学校邮箱验证码。');
  const email=schoolEmail(input.account),code=textField(input,'joinInviteToken',200),hash=digest(JSON.stringify(input)),endpoint=process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint,'尚未配置验证码邮件服务。',503);
  const result=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const repo=new PostgresRepository(client),invite=await invitation(repo,code),now=Date.now();
    const prior=(await client.query<Challenge>('SELECT * FROM student_email_challenges WHERE email=$1 AND request_id=$2',[email,key])).rows[0];
    if(prior){
      demand(prior.request_hash===hash,'同一操作标识不能用于不同请求。',409);
      const message=(await client.query<{id:string;recipient:string;subject:string;body:string}>('SELECT id,recipient,subject,body FROM mail_outbox WHERE id=$1 AND delivered_at IS NULL',[prior.mail_id])).rows[0];
      return {id:prior.id,message:message ?? null};
    }
    const last=(await client.query<Challenge>('SELECT * FROM student_email_challenges WHERE email=$1 ORDER BY sent_at DESC LIMIT 1',[email])).rows[0];
    demand(!last || now-Number(last.sent_at)>=60000,'请稍后再发送验证码。',429);
    const id=randomUUID(),mailId=randomUUID(),otp=String(randomInt(100000,1000000));
    await client.query('UPDATE student_email_challenges SET code_hash=NULL WHERE email=$1 AND verified_at IS NULL',[email]);
    await client.query('INSERT INTO student_email_challenges(id,email,invitation_id,request_id,request_hash,code_hash,proof_secret,sent_at,expires_at,mail_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,email,invite.id,key,hash,digest(id+':'+otp),randomBytes(32).toString('hex'),now,Math.min(now+600000,Number(invite.data.expiresAt)),mailId]);
    const message={id:mailId,recipient:email,subject:'伴学体育入班邮箱验证',body:`验证码：${otp}。仅用于本次课程入班邮箱验证，最长10分钟内有效。`};
    await client.query('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)',[mailId,email,message.subject,message.body,timestamp()]);
    return {id,message};
  });
  if(endpoint && result.message){await deliverMessage(result.message,endpoint);await db.pool.query('UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2',[timestamp(),result.message.id]);}
  return {challengeId:result.id,delivery:endpoint?'email':'local-outbox',message:endpoint?'验证码已发送。':'验证码已写入本地开发收件箱，未发送至真实邮箱。'};
}

export async function verifyStudentJoinEmail(db:PostgresDatabase,input:Fields,key:string) {
  keyValid(key);demand(Object.keys(input).every(k=>['challengeId','code','joinEmail','joinInviteToken','deviceId'].includes(k)),'验证码参数无效。');
  const id=textField(input,'challengeId',100),otp=textField(input,'code',20),email=schoolEmail(input.joinEmail),inviteCode=textField(input,'joinInviteToken',200),hash=digest(JSON.stringify(input));
  const result=await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const repo=new PostgresRepository(client),invite=await invitation(repo,inviteCode),now=Date.now();
    const row=(await client.query<Challenge>('SELECT * FROM student_email_challenges WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(!row || row.email!==email || row.invitation_id!==invite.id || Number(row.expires_at)<=now || row.attempts>=5)return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    if(row.verified_at!==null){demand(row.verify_key===key && row.verify_hash===hash,'验证码已使用。',409);return {joinEmailProof:proof(row),expiresAt:new Date(Number(row.expires_at)).toISOString()};}
    await client.query('UPDATE student_email_challenges SET attempts=attempts+1 WHERE id=$1',[id]);
    if(row.code_hash!==digest(id+':'+otp))return new ServiceError(400,'INVALID_CHALLENGE','验证码无效或已过期。');
    await client.query('UPDATE student_email_challenges SET code_hash=NULL,verified_at=$1,verify_key=$2,verify_hash=$3 WHERE id=$4',[now,key,hash,id]);
    await client.query('DELETE FROM mail_outbox WHERE id=$1',[row.mail_id]);
    return {joinEmailProof:proof(row),expiresAt:new Date(Number(row.expires_at)).toISOString()};
  });
  if(result instanceof ServiceError)throw result;
  return result;
}
