import {createHmac,randomBytes,randomUUID} from 'node:crypto';
import {demand,digest,hashPassword,timestamp,type Account} from '../auth';
import {textField,type Fields} from '../repository';
import {sportsAvailable} from '../sports/materials';
import {sportsEnrollmentPolicy} from '../sports/courses';
import {studentProfileInput} from '../sports/student-profile-input';
import {runAsync} from './effects';
import {PostgresAuth} from './postgres-auth';
import type {PostgresDatabase} from './postgres';
import {PostgresRepository} from './postgres-repository';
import {readStudentJoinEmailProof} from './postgres-student-email';
import {recordDraftGate} from './postgres-record-drafts';

type Capability={token_hash:string;challenge_id:string;invitation_id:string;email:string;profile:string;issue_key:string;request_hash:string;started_at:string;expires_at:string;session_secret:string;consume_key:string|null;result:string|null;account_id:string|null};
const validKey=(key:string)=>demand(key.length>=8 && key.length<=100,'缺少有效操作幂等标识。');
const sessionToken=(row:Capability)=>createHmac('sha256',Buffer.from(row.session_secret,'hex')).update('NEW_STUDENT_SESSION:'+row.token_hash).digest('base64url');

export async function issueNewStudentJoin(db:PostgresDatabase,code:string,input:Fields,key:string) {
  validKey(key);const profile=studentProfileInput(input),proof=textField(input,'joinEmailProof',200);
  const token=createHmac('sha256',proof).update(JSON.stringify(['NEW_STUDENT_JOIN',code,key])).digest('base64url');
  const hash=digest(JSON.stringify(profile));
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const repo=new PostgresRepository(client),systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
    const invite=(await repo.all('sportsInvitation')).find(i=>i.data.code===code);
    demand(invite && invite.data.status==='ACTIVE','邀请无效或已撤销。',410);
    const verified=await readStudentJoinEmailProof(client,proof,invite.id);
    const prior=(await client.query<Capability>('SELECT * FROM new_student_join_capabilities WHERE challenge_id=$1',[verified.challengeId])).rows[0];
    if(prior){
      demand(prior.token_hash===digest(token) && prior.issue_key===key && prior.request_hash===hash,'本次邮箱证明已用于另一份入班资料。',409);
      demand(Number(prior.expires_at)>Date.now(),'入班凭证已过期。',410);
      return {joinCapability:token,expiresAt:new Date(Number(prior.expires_at)).toISOString()};
    }
    demand(Number(invite.data.expiresAt)>Date.now(),'邀请已过期。',410);
    const course=await repo.get(invite.data.courseId,'sportsCourse'),semester=await repo.get(course.data.semesterId,'sportsSemester');
    demand(course.data.status==='PUBLISHED' && course.data.enrollmentOpen===true && semester.data.status==='CURRENT','课程未开放入班。',409);
    demand(!(await client.query("SELECT 1 FROM accounts WHERE email=$1 AND login_kind='PERSONAL'",[verified.email])).rows.length,'此邮箱已有账号，不能重复创建。',409);
    const now=Date.now(),expiresAt=Math.min(now+600000,Number(invite.data.expiresAt)+600000);
    await client.query('INSERT INTO new_student_join_capabilities(token_hash,challenge_id,invitation_id,email,profile,issue_key,request_hash,started_at,expires_at,session_secret) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[digest(token),verified.challengeId,invite.id,verified.email,JSON.stringify(profile),key,hash,now,expiresAt,randomBytes(32).toString('hex')]);
    return {joinCapability:token,expiresAt:new Date(expiresAt).toISOString()};
  });
}

export async function consumeNewStudentJoin(db:PostgresDatabase,code:string,token:string,key:string) {
  validKey(key);demand(token.length>0 && token.length<=200,'入班凭证无效。',403);
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const row=(await client.query<Capability>('SELECT * FROM new_student_join_capabilities WHERE token_hash=$1',[digest(token)])).rows[0];
    if(!row)return null;
    const repo=new PostgresRepository(client),systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
    const invite=await repo.get(row.invitation_id,'sportsInvitation');
    demand(invite.data.code===code,'入班凭证与邀请不匹配。',403);
    const session=sessionToken(row);
    if(row.consume_key){
      demand(row.consume_key===key,'入班凭证已使用。',409);
      const actor=await new PostgresAuth(db).authenticate(session,client);await recordDraftGate(repo,actor);
      return {token:session,result:JSON.parse(row.result!) as Fields};
    }
    demand(Number(row.expires_at)>Date.now(),'入班凭证已过期。',410);
    demand(invite.data.status==='ACTIVE','邀请已撤销。',410);
    demand(!(await client.query("SELECT 1 FROM accounts WHERE email=$1 AND login_kind='PERSONAL'",[row.email])).rows.length,'该邮箱已有账号，不能覆盖原账号。',409);
    const profile=JSON.parse(row.profile) as ReturnType<typeof studentProfileInput>,id=randomUUID();
    // No traditional password is exposed or selected for the email-only student account.
    await client.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)',[id,row.email,hashPassword(randomBytes(32).toString('base64url')),profile.fullName,'["student"]',timestamp()]);
    await repo.create('sportsIdentity',id,{role:'student',status:'verified',studentNumber:profile.studentNumber,sex:profile.gender,year:profile.gradeYear,collegeName:profile.collegeName,majorName:profile.majorName,dateOfBirth:profile.dateOfBirth,regionCode:profile.regionCode,otherRegionName:profile.otherRegionName,schoolEmail:row.email,schoolEmailVerified:true,source:'course-invitation'});
    await repo.create('verifiedEmail',id,{email:row.email,source:'course-invitation-email-code'});
    const actor:Account={id,email:row.email,name:profile.fullName,organization:'',roles:['student'],status:'active'};
    const flow=await repo.create('sportsEnrollmentFlow',id,{invitationId:invite.id,courseId:invite.data.courseId,startedAt:Number(row.started_at),deadline:Number(row.expires_at),status:'OPEN'});
    const member=await runAsync(sportsEnrollmentPolicy(repo,actor,'sports.enrollment.join',{flowId:flow.id},async owner=>(await repo.person(owner)).name));
    demand(member,'入班未完成。',409);
    await client.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)',[digest(session),id,Date.now()+43200000,timestamp()]);
    const result={enrollment:{id:member.id,classSectionId:member.data.courseId,studentId:id,status:'ACTIVE'},authSession:{kind:'COMPANION',user:{id,role:'STUDENT'}}};
    await client.query('UPDATE new_student_join_capabilities SET consume_key=$1,result=$2,account_id=$3 WHERE token_hash=$4',[key,JSON.stringify(result),id,row.token_hash]);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),id,'student','sports.enrollment.join',member.id,'',JSON.stringify({result:{id:member.id},newStudent:true}),timestamp()]);
    return {token:session,result};
  });
}
