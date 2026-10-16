import {randomUUID} from 'node:crypto';
import {demand,timestamp,type Account} from './auth';
import {transaction,type Database} from './database';
import {verifyStudentAtSchool} from './identity';
import {Repository,type Entity} from './repository';

export function studentIdentityCandidate(input:Record<string,unknown>) {
  const studentNumber=typeof input.studentNumber==='string' ? input.studentNumber.trim() : '';
  const schoolName=typeof input.schoolName==='string' ? input.schoolName.trim() : '';
  demand(/^[A-Za-z0-9]{5,30}$/.test(studentNumber),'请填写完整学号。');
  demand(schoolName.length>=2 && schoolName.length<=80,'请填写学校登记姓名。');
  return {studentNumber,schoolName};
}
function latest(repo:Repository,id:string) { return repo.all('studentIdentityRequest').find(item=>item.ownerId===id); }
function verifiedEmail(repo:Repository,actor:Account) {
  return repo.all('verifiedEmail').some(item=>item.ownerId===actor.id && item.data.email===actor.email);
}
function ensureNumberFree(repo:Repository,number:string,accountId:string) {
  demand(!repo.all('companionIdentity').some(item=>item.ownerId!==accountId && item.data.role==='student' && item.data.status==='verified' && item.data.studentNumber===number),'该学号已绑定其他账号，请联系审核员核查。',409);
}
function grant(db:Database,repo:Repository,request:Entity,reviewerId:string,source:string,evidenceId:string) {
  const accountId=request.ownerId!;
  const number=String(request.data.studentNumber);
  ensureNumberFree(repo,number,accountId);
  const old=repo.all('companionIdentity').find(item=>item.ownerId===accountId && item.data.role==='student' && item.data.status==='verified');
  demand(!old || old.data.studentNumber===number,'已有不同学号的有效学生身份，请人工复核。',409);
  if(!old) repo.create('companionIdentity',accountId,{role:'student',status:'verified',studentNumber:number,schoolName:request.data.schoolName,schoolEmail:request.data.email,source,evidenceId,verifiedBy:reviewerId,verifiedAt:timestamp()});
  const row=db.prepare('SELECT roles FROM accounts WHERE id=?').get(accountId) as {roles:string};
  db.prepare('UPDATE accounts SET name=?,roles=? WHERE id=?').run(String(request.data.schoolName),JSON.stringify([...new Set([...JSON.parse(row.roles), 'student'])]),accountId);
  repo.notify([accountId],request.id,'student.identity.verified','学生身份已核验，现可使用校园服务。');
}
export function ownStudentIdentity(db:Database,actor:Account) {
  const repo=new Repository(db);
  const request=latest(repo,actor.id);
  return {status:request?.data.status ?? (actor.roles.includes('student') ? 'verified' : 'unrequested'),request:request ? {id:request.id,status:request.data.status,studentNumber:request.data.studentNumber,schoolName:request.data.schoolName,reason:request.data.reason,createdAt:request.createdAt,updatedAt:request.updatedAt}:null,schoolService:process.env.BNBU_IDENTITY_VERIFICATION_URL?'configured':'unconfigured'};
}
export async function requestStudentIdentity(db:Database,actor:Account,input:Record<string,unknown>) {
  demand(actor.status==='active','当前账号状态不能申请学生身份。',403);
  const candidate=studentIdentityCandidate(input),repo=new Repository(db);
  demand(verifiedEmail(repo,actor),'请先验证本人当前邮箱。',403);
  const previous=latest(repo,actor.id);
  demand(!previous || !['pending','verified'].includes(String(previous.data.status)),'当前申请已在处理中或已核验。',409);
  const school=await verifyStudentAtSchool(actor,candidate);
  return transaction(db,()=>{
    const current=new Repository(db);
    demand(verifiedEmail(current,actor),'邮箱验证状态已变化，请重新申请。',409);
    const newest=latest(current,actor.id);
    demand(!newest || !['pending','verified'].includes(String(newest.data.status)),'当前申请已在处理中或已核验。',409);
    const request=current.create('studentIdentityRequest',actor.id,{...candidate,email:actor.email,status:'pending',reason:'等待校方核验结果或审核员核对正式证明。'});
    if(school.verified) {
      grant(db,current,request,'school-service','school-service',school.subject!);
      current.save(request,{status:'verified',reason:'校方在读身份核验通过。',source:'school-service',evidenceId:school.subject,reviewedAt:timestamp()});
    }
    db.prepare('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),actor.id,actor.roles.join(','),'student.identity.request',request.id,'',JSON.stringify({schoolVerified:school.verified}),timestamp());
    return ownStudentIdentity(db,{...actor,roles:school.verified?[...actor.roles,'student']:actor.roles});
  });
}
export function listStudentIdentityRequests(db:Database,actor:Account,params:URLSearchParams) {
  demand(actor.roles.includes('reviewer') || actor.roles.includes('superadmin'),'需要审核职责。',403);
  const status=params.get('status') ?? 'pending',query=(params.get('query') ?? '').trim().toLowerCase();
  demand(['pending','verified','rejected','revoked','all'].includes(status),'状态筛选无效。');
  demand(query.length<=100,'搜索条件过长。');
  const page=Math.max(1,Math.min(100000,Number(params.get('page')) || 1));
  const all=new Repository(db).all('studentIdentityRequest').filter(item=>(status==='all'||item.data.status===status) && (!query || [item.data.studentNumber,item.data.email,item.data.schoolName,item.data.status].some(value=>String(value ?? '').toLowerCase().includes(query))));
  return {items:all.slice((page-1)*50,page*50).map(item=>({id:item.id,ownerId:item.ownerId,studentNumber:item.data.studentNumber,schoolName:item.data.schoolName,email:item.data.email,status:item.data.status,reason:item.data.reason,source:item.data.source,evidenceId:item.data.evidenceId,version:item.version,createdAt:item.createdAt,updatedAt:item.updatedAt})),total:all.length,page,hasMore:page*50<all.length};
}
export function reviewStudentIdentity(db:Database,actor:Account,input:Record<string,unknown>) {
  demand(actor.roles.includes('reviewer') || actor.roles.includes('superadmin'),'需要审核职责。',403);
  const id=typeof input.id==='string'?input.id:'';
  const decision=input.decision;
  demand(['approve','reject','revoke'].includes(String(decision)),'处理决定无效。');
  demand(typeof input.version==='number' && Number.isInteger(input.version),'请刷新申请后重试。',409);
  const reason=typeof input.reason==='string'?input.reason.trim():'';
  const evidenceId=typeof input.evidenceId==='string'?input.evidenceId.trim():'';
  demand(reason.length>0 && reason.length<=500,'请填写处理原因。');
  if(decision==='approve') demand(evidenceId.length>=4 && evidenceId.length<=200,'请填写校方正式查询结果或可核验证明的依据标识。');
  if(decision==='revoke') demand(actor.roles.includes('superadmin'),'只有超级管理员可撤销学生身份。',403);
  return transaction(db,()=>{
    const repo=new Repository(db),request=repo.get(id,'studentIdentityRequest');
    demand(request.version===input.version,'申请已变化，请刷新后重试。',409);
    demand(decision==='revoke'?request.data.status==='verified':request.data.status==='pending','申请状态已变化。',409);
    if(decision==='approve') grant(db,repo,request,actor.id,'manual-school-evidence',evidenceId);
    if(decision==='revoke') {
      for(const identity of repo.all('companionIdentity').filter(item=>item.ownerId===request.ownerId && item.data.role==='student' && item.data.status==='verified')) repo.save(identity,{status:'revoked',revokedBy:actor.id,revokedAt:timestamp(),revokeReason:reason});
      const account=db.prepare('SELECT roles FROM accounts WHERE id=?').get(request.ownerId!) as {roles:string};
      db.prepare('UPDATE accounts SET roles=? WHERE id=?').run(JSON.stringify((JSON.parse(account.roles) as string[]).filter(role=>role!=='student')),request.ownerId);
    }
    const status=decision==='approve'?'verified':decision==='reject'?'rejected':'revoked';
    const changed=repo.save(request,{status,reason,evidenceId:decision==='approve'?evidenceId:request.data.evidenceId,source:decision==='approve'?'manual-school-evidence':request.data.source,reviewedBy:actor.id,reviewedAt:timestamp()});
    repo.notify([request.ownerId!],request.id,'student.identity.'+status,`学生身份${status==='verified'?'核验通过':status==='rejected'?'申请已驳回':'已撤销'}：${reason}`);
    db.prepare('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),actor.id,actor.roles.join(','),'student.identity.'+decision,id,reason,JSON.stringify({status,evidenceId:decision==='approve'?evidenceId:undefined}),timestamp());
    return {id:changed.id,status};
  });
}
