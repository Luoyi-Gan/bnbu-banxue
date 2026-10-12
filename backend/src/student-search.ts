import {demand, type Account} from './auth';
import type {Database} from './database';
import {Repository} from './repository';
export function studentNumber(db: Database, actor: Account): string | null {
  if (!actor.roles.includes('student') || actor.status === 'banned') return null;
  const [prefix,domain] = actor.email.toLowerCase().split('@');
  if (domain !== 'bnbu.edu.cn') return null;
  const verified = new Repository(db).all('verifiedEmail').some(e=>e.ownerId===actor.id && e.data.email===actor.email);
  return verified ? prefix : null;
}
export function searchStudents(db: Database, actor: Account, query: string) {
  demand(actor.roles.includes('student') && actor.status!=='banned','仅学生可按学号查找。',403);
  demand(query.trim().length>0 && query.length<=100,'请填写完整学号。');
  const repo = new Repository(db);
  const row = db.prepare("SELECT id,email,name,organization,status,roles FROM accounts WHERE email=? AND login_kind='PERSONAL'").get(query.trim().toLowerCase()+'@bnbu.edu.cn') as {id:string;email:string;name:string;organization:string;status:Account['status'];roles:string}|undefined;
  if (!row) return {students:[]};
  const person={...row,roles:JSON.parse(row.roles)} as Account;
  const prefs=repo.all('preferences').find(p=>p.ownerId===row.id)?.data;
  if (!studentNumber(db,person) || prefs?.searchable===false) return {students:[]};
  return {students:[{id:person.id,name:person.name,organization:prefs?.profilePreview===false ? '' : person.organization}]};
}
