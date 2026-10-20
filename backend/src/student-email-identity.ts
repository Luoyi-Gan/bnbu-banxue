import {randomUUID} from 'node:crypto';
import {account,timestamp,type AccountRow} from './auth';
import {transaction,type Database} from './database';
import {Repository,type Entity} from './repository';

export const studentEmail = (email:string) => /^[^\s@]+@mail\.bnbu\.edu\.cn$/i.test(email);
export const emailIdentityReason = '学校邮箱已验证，自动获得学生身份。';
export function emailIdentityData(email:string, request:Entity|undefined, numberFree:boolean) {
  return {role:'student',status:'verified',schoolEmail:email,source:'verified-student-email',verifiedAt:timestamp(),
    ...(request && numberFree ? {studentNumber:request.data.studentNumber,schoolName:request.data.schoolName} : {})};
}

/** Called only with a server-loaded account; email ownership is required. */
export function ensureStudentEmailIdentity(db:Database,row:AccountRow) {
  if(row.login_kind!=='PERSONAL' || row.status==='banned' || !studentEmail(row.email) || JSON.parse(row.roles).includes('student')) return row;
  const apply=()=>{
    const repo=new Repository(db);
    if(!repo.all('verifiedEmail').some(item=>item.ownerId===row.id && item.data.email===row.email)) return row;
    const identities=repo.all('companionIdentity').filter(item=>item.ownerId===row.id && item.data.role==='student');
    const request=repo.all('studentIdentityRequest').filter(item=>item.ownerId===row.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id))[0];
    if(identities.some(item=>item.data.status==='revoked') || request?.data.status==='revoked') return row;
    const numberFree=!repo.all('companionIdentity').some(item=>item.ownerId!==row.id && item.data.role==='student' && item.data.status==='verified' && item.data.studentNumber===request?.data.studentNumber);
    const identity=identities.find(item=>item.data.status==='verified') ?? repo.create('companionIdentity',row.id,emailIdentityData(row.email,request,numberFree));
    const updated={...row,roles:JSON.stringify([...new Set([...account(row).roles,'student'])])};
    db.prepare('UPDATE accounts SET roles=? WHERE id=?').run(updated.roles,row.id);
    if(request && ['pending','rejected'].includes(String(request.data.status))) repo.save(request,{status:'verified',source:'verified-student-email',reason:emailIdentityReason,reviewedAt:timestamp()});
    repo.notify([row.id],identity.id,'student.identity.verified',emailIdentityReason);
    db.prepare('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),row.id,'student','student.identity.email-grant',identity.id,emailIdentityReason,JSON.stringify({source:'verified-student-email'}),timestamp());
    return updated;
  };
  return db.isTransaction ? apply() : transaction(db,apply);
}
