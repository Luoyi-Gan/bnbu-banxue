import { createHmac, randomUUID } from 'node:crypto';
import { demand, digest, timestamp } from '../auth';
import type { Fields } from '../repository';
import { sportsEnrollmentPolicy } from '../sports/courses';
import { runAsync } from './effects';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { recordDraftGate } from './postgres-record-drafts';

type Capability={token_hash:string;account_id:string;session_hash:string;invitation_id:string;flow_id:string;profile_hash:string;source_hash:string;expires_at:string;consume_key:string|null;result:string|null};
const validKey=(key:string)=>demand(key.length>=8 && key.length<=100,'缺少有效操作幂等标识。');
const mint=(session:string,code:string,key:string)=>createHmac('sha256',session).update(JSON.stringify(['MEMBER_JOIN',code,key])).digest('base64url');

/** Existing members authenticate with their existing HttpOnly session; no credential is copied to business storage. */
export async function issueMemberJoin(db:PostgresDatabase,session:string,code:string,input:Fields,key:string) {
  validKey(key);
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const actor=await new PostgresAuth(db).authenticate(session,client),repo=new PostgresRepository(client);
    await recordDraftGate(repo,actor);
    demand(actor.roles.includes('student') && (await client.query("SELECT 1 FROM accounts WHERE id=$1 AND login_kind='PERSONAL'",[actor.id])).rows.length===1,'需要学生个人账号。',403);
    const identities=(await repo.all('sportsIdentity')).filter(i=>i.ownerId===actor.id && i.data.role==='student' && i.data.status==='verified');
    demand(identities.length===1,'需要唯一学生身份。',403);
    const data=identities[0].data;
    demand(data.schoolEmailVerified===true && data.schoolEmail===actor.email,'请先验证本人学校邮箱。',403);
    const profile:Fields={fullName:actor.name,studentNumber:data.studentNumber,gender:data.sex,gradeYear:data.year,collegeName:data.collegeName,majorName:data.majorName,dateOfBirth:data.dateOfBirth,regionCode:data.regionCode,otherRegionName:data.otherRegionName};
    demand(Object.keys(input).every(k=>k in profile),'入班资料参数无效。');
    for(const [field,value] of Object.entries(profile)) {
      if(field==='otherRegionName' && data.regionCode!=='OTHER')continue;
      demand(value!==undefined && value!==null && input[field]===value,'入班资料须与本人已保存资料一致，请先完成资料更正。',409);
    }
    const token=mint(session,code,key),hash=digest(JSON.stringify(Object.entries(input).sort(([a],[b])=>a.localeCompare(b))));
    const prior=(await client.query<Capability>('SELECT * FROM member_join_capabilities WHERE account_id=$1 AND session_hash=$2 AND issue_key=$3',[actor.id,digest(session),key])).rows[0];
    if(prior){
      demand(prior.token_hash===digest(token) && prior.profile_hash===hash,'同一操作标识不能用于不同入班请求。',409);
      const invitation=await repo.get(prior.invitation_id,'sportsInvitation');
      demand(invitation.data.status==='ACTIVE','邀请已撤销。',410);
      demand(Number(prior.expires_at)>Date.now(),'入班凭证已过期。',410);
      return {joinCapability:token,expiresAt:new Date(Number(prior.expires_at)).toISOString()};
    }
    const flow=await runAsync(sportsEnrollmentPolicy(repo,actor,'sports.enrollment.begin',{code},async id=>(await repo.person(id)).name));
    demand(flow,'未能建立入班流程。',409);
    const expiresAt=Math.min(Date.now()+600000,Number(flow.data.deadline));
    await client.query('INSERT INTO member_join_capabilities(token_hash,account_id,session_hash,invitation_id,flow_id,issue_key,profile_hash,source_hash,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[digest(token),actor.id,digest(session),flow.data.invitationId,flow.id,key,hash,digest(JSON.stringify([actor.name,actor.email,identities[0].version])),expiresAt]);
    return {joinCapability:token,expiresAt:new Date(expiresAt).toISOString()};
  });
}

export async function consumeMemberJoin(db:PostgresDatabase,session:string,code:string,capability:string,key:string) {
  validKey(key);demand(capability.length>0 && capability.length<=200,'入班凭证无效。',403);
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const actor=await new PostgresAuth(db).authenticate(session,client),repo=new PostgresRepository(client);
    await recordDraftGate(repo,actor);
    demand(actor.roles.includes('student') && (await client.query("SELECT 1 FROM accounts WHERE id=$1 AND login_kind='PERSONAL'",[actor.id])).rows.length===1,'需要学生个人账号。',403);
    const identities=(await repo.all('sportsIdentity')).filter(i=>i.ownerId===actor.id && i.data.role==='student' && i.data.status==='verified');
    demand(identities.length===1 && identities[0].data.schoolEmailVerified===true && identities[0].data.schoolEmail===actor.email,'学生身份或邮箱验证已变化。',403);
    const row=(await client.query<Capability>('SELECT * FROM member_join_capabilities WHERE token_hash=$1',[digest(capability)])).rows[0];
    demand(row && row.account_id===actor.id && row.session_hash===digest(session),'入班凭证不属于当前登录。',403);
    const invite=await repo.get(row.invitation_id,'sportsInvitation');
    demand(invite.data.code===code,'入班凭证与邀请不匹配。',403);
    if(row.consume_key){demand(row.consume_key===key,'入班凭证已使用。',409);return JSON.parse(row.result!) as Fields;}
    demand(row.source_hash===digest(JSON.stringify([actor.name,actor.email,identities[0].version])),'身份资料已变化，请重新确认入班。',409);
    demand(Number(row.expires_at)>Date.now(),'入班凭证已过期。',410);
    const member=await runAsync(sportsEnrollmentPolicy(repo,actor,'sports.enrollment.join',{flowId:row.flow_id},async id=>(await repo.person(id)).name));
    demand(member,'入班失败。',409);
    const result={enrollment:{id:member.id,classSectionId:member.data.courseId,studentId:actor.id,status:'ACTIVE'},authSession:{kind:'COMPANION',user:{id:actor.id,role:'STUDENT'}}};
    await client.query('UPDATE member_join_capabilities SET consume_key=$1,result=$2 WHERE token_hash=$3',[key,JSON.stringify(result),row.token_hash]);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,'student','sports.enrollment.join',member.id,'',JSON.stringify({result:{id:member.id}}),timestamp()]);
    return result;
  });
}
