import {demand, type Account} from './auth';
import type {Database} from './database';
import {Repository, type Entity, type Fields} from './repository';
export function studentNumber(db: Database, actor: Account): string | null {
  return recordedStudentNumber(actor,new Repository(db).all('companionIdentity'));
}
export function recordedStudentNumber(actor: Account, records: Entity[]): string|null {
  if (!actor.roles.includes('student') || actor.status === 'banned') return null;
  const identities=records.filter(e=>e.ownerId===actor.id && e.data.role==='student' && e.data.status==='verified');
  if(identities.length!==1)return null;
  const number=identities[0].data.studentNumber;
  return typeof number==='string' && number.trim() ? number.trim() : null;
}
export function searchStudents(db: Database, actor: Account, query: string) {
  validateStudentSearch(actor,query);
  const repo = new Repository(db);
  const identities=repo.all('companionIdentity'),preferences=repo.all('preferences');
  const ids=new Set(identities.filter(i=>i.data.studentNumber===query.trim()).map(i=>i.ownerId));
  return {students:[...ids].flatMap(id=>{
    const row=db.prepare("SELECT id,email,name,organization,status,roles FROM accounts WHERE id=? AND login_kind='PERSONAL'").get(id) as (Omit<Account,'roles'>&{roles:string})|undefined;
    if(!row)return [];
    return studentSearchResult({...row,roles:JSON.parse(row.roles)},preferences.find(p=>p.ownerId===id)?.data,identities).students;
  })};
}
export function validateStudentSearch(actor:Account,query:string) {
  demand(actor.roles.includes('student') && actor.status!=='banned','仅学生可按学号查找。',403);
  demand(query.trim().length>0 && query.length<=100,'请填写完整学号。');
}
export function studentSearchResult(person:Account,prefs:Fields|undefined,proofs:Entity[]) {
  if (!recordedStudentNumber(person,proofs) || prefs?.searchable===false) return {students:[]};
  return {students:[{id:person.id,name:person.name,organization:prefs?.profilePreview===false ? '' : person.organization}]};
}
