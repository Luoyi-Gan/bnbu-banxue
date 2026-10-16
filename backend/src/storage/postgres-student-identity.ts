import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {demand,timestamp,type Account} from '../auth';
import {verifyStudentAtSchool} from '../identity';
import {studentIdentityCandidate} from '../student-identity-workflow';
import type {PostgresDatabase} from './postgres';
import {PostgresRepository,decodePostgresEntity} from './postgres-repository';

type Row={id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string};
const canReview=(actor:Account)=>actor.roles.includes('reviewer')||actor.roles.includes('superadmin');
async function current(client:PoolClient,accountId:string) {
  const row=(await client.query<Row>("SELECT * FROM entities WHERE kind='studentIdentityRequest' AND owner_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1",[accountId])).rows[0];
  return row?decodePostgresEntity(row):null;
}
async function confirmedEmail(client:PoolClient,actor:Account) {
  return (await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1",[actor.id,actor.email])).rows.length>0;
}
async function grant(client:PoolClient,repo:PostgresRepository,request:Awaited<ReturnType<typeof current>> & {},reviewerId:string,source:string,evidenceId:string) {
  const accountId=request.ownerId!,number=String(request.data.studentNumber);
  const conflict=await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id<>$1 AND data::jsonb->>'role'='student' AND data::jsonb->>'status'='verified' AND data::jsonb->>'studentNumber'=$2 LIMIT 1",[accountId,number]);
  demand(!conflict.rows.length,'该学号已绑定其他账号，请联系审核员核查。',409);
  const existing=(await repo.all('companionIdentity')).find(item=>item.ownerId===accountId && item.data.role==='student' && item.data.status==='verified');
  demand(!existing || existing.data.studentNumber===number,'已有不同学号的有效学生身份，请人工复核。',409);
  if(!existing) await repo.create('companionIdentity',accountId,{role:'student',status:'verified',studentNumber:number,schoolName:request.data.schoolName,schoolEmail:request.data.email,source,evidenceId,verifiedBy:reviewerId,verifiedAt:timestamp()});
  const account=(await client.query<{roles:string}>('SELECT roles FROM accounts WHERE id=$1 FOR UPDATE',[accountId])).rows[0];
  await client.query('UPDATE accounts SET name=$1,roles=$2 WHERE id=$3',[request.data.schoolName,JSON.stringify([...new Set([...JSON.parse(account.roles),'student'])]),accountId]);
  await repo.notify([accountId],request.id,'student.identity.verified','学生身份已核验，现可使用校园服务。');
}
export async function postgresOwnStudentIdentity(db:PostgresDatabase,actor:Account) {
  return db.transaction(async client=>{
    const request=await current(client,actor.id);
    return {status:request?.data.status ?? (actor.roles.includes('student')?'verified':'unrequested'),request:request?{id:request.id,status:request.data.status,studentNumber:request.data.studentNumber,schoolName:request.data.schoolName,reason:request.data.reason,createdAt:request.createdAt,updatedAt:request.updatedAt}:null,schoolService:process.env.BNBU_IDENTITY_VERIFICATION_URL?'configured':'unconfigured'};
  });
}
export async function postgresRequestStudentIdentity(db:PostgresDatabase,actor:Account,input:Record<string,unknown>) {
  demand(actor.status==='active','当前账号状态不能申请学生身份。',403);
  const candidate=studentIdentityCandidate(input);
  await db.transaction(async client=>{
    demand(await confirmedEmail(client,actor),'请先验证本人当前邮箱。',403);
    const previous=await current(client,actor.id);
    demand(!previous || !['pending','verified'].includes(String(previous.data.status)),'当前申请已在处理中或已核验。',409);
  });
  const school=await verifyStudentAtSchool(actor,candidate);
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`student-identity:${actor.id}`]);
    demand(await confirmedEmail(client,actor),'请先验证本人当前邮箱。',403);
    const previous=await current(client,actor.id);
    demand(!previous || !['pending','verified'].includes(String(previous.data.status)),'当前申请已在处理中或已核验。',409);
    const repo=new PostgresRepository(client);
    const request=await repo.create('studentIdentityRequest',actor.id,{...candidate,email:actor.email,status:'pending',reason:'等待校方核验结果或审核员核对正式证明。'});
    if(school.verified) {
      await grant(client,repo,request,'school-service','school-service',school.subject!);
      await repo.save(request,{status:'verified',reason:'校方在读身份核验通过。',source:'school-service',evidenceId:school.subject,reviewedAt:timestamp()});
    }
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,actor.roles.join(','),'student.identity.request',request.id,'',JSON.stringify({schoolVerified:school.verified}),timestamp()]);
    return {status:school.verified?'verified':'pending',request:{id:request.id,status:school.verified?'verified':'pending',studentNumber:candidate.studentNumber,schoolName:candidate.schoolName,reason:school.verified?'校方在读身份核验通过。':'等待校方核验结果或审核员核对正式证明。'},schoolService:process.env.BNBU_IDENTITY_VERIFICATION_URL?'configured':'unconfigured'};
  });
}
export async function postgresListStudentIdentityRequests(db:PostgresDatabase,actor:Account,params:URLSearchParams) {
  demand(canReview(actor),'需要审核职责。',403);
  const status=params.get('status') ?? 'pending',query=(params.get('query') ?? '').trim().toLowerCase();
  demand(['pending','verified','rejected','revoked','all'].includes(status),'状态筛选无效。');
  demand(query.length<=100,'搜索条件过长。');
  const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1));
  return db.transaction(async client=>{
    const predicate="kind='studentIdentityRequest' AND ($1='all' OR data::jsonb->>'status'=$1) AND ($2='' OR lower(concat_ws(' ',data::jsonb->>'studentNumber',data::jsonb->>'schoolName',data::jsonb->>'email')) LIKE '%'||$2||'%')";
    const total=Number((await client.query<{count:string}>(`SELECT count(*) AS count FROM entities WHERE ${predicate}`,[status,query])).rows[0].count);
    const rows=(await client.query<Row>(`SELECT * FROM entities WHERE ${predicate} ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET $3`,[status,query,(page-1)*50])).rows;
    const items=await Promise.all(rows.map(decodePostgresEntity));
    return {items:items.map(item=>({id:item.id,ownerId:item.ownerId,studentNumber:item.data.studentNumber,schoolName:item.data.schoolName,email:item.data.email,status:item.data.status,reason:item.data.reason,source:item.data.source,evidenceId:item.data.evidenceId,version:item.version,createdAt:item.createdAt,updatedAt:item.updatedAt})),total,page,hasMore:page*50<total};
  });
}
export async function postgresReviewStudentIdentity(db:PostgresDatabase,actor:Account,input:Record<string,unknown>) {
  demand(canReview(actor),'需要审核职责。',403);
  const id=typeof input.id==='string'?input.id:'',decision=input.decision;
  demand(['approve','reject','revoke'].includes(String(decision)),'处理决定无效。');
  demand(typeof input.version==='number' && Number.isInteger(input.version),'请刷新申请后重试。',409);
  const reason=typeof input.reason==='string'?input.reason.trim():'',evidenceId=typeof input.evidenceId==='string'?input.evidenceId.trim():'';
  demand(reason.length>0 && reason.length<=500,'请填写处理原因。');
  if(decision==='approve') demand(evidenceId.length>=4 && evidenceId.length<=200,'请填写校方正式查询结果或可核验证明的依据标识。');
  if(decision==='revoke') demand(actor.roles.includes('superadmin'),'只有超级管理员可撤销学生身份。',403);
  return db.transaction(async client=>{
    const row=(await client.query<Row>("SELECT * FROM entities WHERE id=$1 AND kind='studentIdentityRequest' FOR UPDATE",[id])).rows[0];
    demand(row,'申请不存在。',404);
    const request=await decodePostgresEntity(row),repo=new PostgresRepository(client);
    demand(request.version===input.version,'申请已变化，请刷新后重试。',409);
    demand(decision==='revoke'?request.data.status==='verified':request.data.status==='pending','申请状态已变化。',409);
    if(decision==='approve') await grant(client,repo,request,actor.id,'manual-school-evidence',evidenceId);
    if(decision==='revoke') {
      for(const identity of (await repo.all('companionIdentity')).filter(item=>item.ownerId===request.ownerId && item.data.role==='student' && item.data.status==='verified')) await repo.save(identity,{status:'revoked',revokedBy:actor.id,revokedAt:timestamp(),revokeReason:reason});
      const account=(await client.query<{roles:string}>('SELECT roles FROM accounts WHERE id=$1 FOR UPDATE',[request.ownerId])).rows[0];
      await client.query('UPDATE accounts SET roles=$1 WHERE id=$2',[JSON.stringify((JSON.parse(account.roles) as string[]).filter(role=>role!=='student')),request.ownerId]);
    }
    const status=decision==='approve'?'verified':decision==='reject'?'rejected':'revoked';
    await repo.save(request,{status,reason,evidenceId:decision==='approve'?evidenceId:request.data.evidenceId,source:decision==='approve'?'manual-school-evidence':request.data.source,reviewedBy:actor.id,reviewedAt:timestamp()});
    await repo.notify([request.ownerId!],request.id,'student.identity.'+status,`学生身份${status==='verified'?'核验通过':status==='rejected'?'申请已驳回':'已撤销'}：${reason}`);
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,actor.roles.join(','),'student.identity.'+decision,id,reason,JSON.stringify({status,evidenceId:decision==='approve'?evidenceId:undefined}),timestamp()]);
    return {id,status};
  });
}
