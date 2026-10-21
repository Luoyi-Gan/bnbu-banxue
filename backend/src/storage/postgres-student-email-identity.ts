import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {timestamp,type AccountRow} from '../auth';
import {studentEmail,emailIdentityData,emailIdentityReason} from '../student-email-identity';
import {PostgresRepository,decodePostgresEntity} from './postgres-repository';

/** Caller owns a transaction. The account lock serializes concurrent logins. */
export async function ensurePostgresStudentEmailIdentity(client:PoolClient,initial:AccountRow) {
  if(initial.login_kind!=='PERSONAL' || initial.status==='banned' || !studentEmail(initial.email) || JSON.parse(initial.roles).includes('student')) return initial;
  const row=(await client.query<AccountRow>('SELECT * FROM accounts WHERE id=$1 FOR UPDATE',[initial.id])).rows[0];
  if(row.login_kind!=='PERSONAL' || row.status==='banned' || !studentEmail(row.email) || JSON.parse(row.roles).includes('student')) return row;
  if(!(await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1",[row.id,row.email])).rows.length) return row;
  const records=await Promise.all((await client.query("SELECT * FROM entities WHERE owner_id=$1 AND kind IN ('studentIdentityRequest','companionIdentity') ORDER BY created_at DESC,id DESC",[row.id])).rows.map(decodePostgresEntity));
  const identities=records.filter(item=>item.kind==='companionIdentity' && item.data.role==='student');
  const request=records.find(item=>item.kind==='studentIdentityRequest');
  if(identities.some(item=>item.data.status==='revoked') || request?.data.status==='revoked') return row;
  const numberFree=!(await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id<>$1 AND data::jsonb->>'role'='student' AND data::jsonb->>'status'='verified' AND data::jsonb->>'studentNumber'=$2 LIMIT 1",[row.id,request?.data.studentNumber ?? null])).rows.length;
  const repo=new PostgresRepository(client);
  const identity=identities.find(item=>item.data.status==='verified') ?? await repo.create('companionIdentity',row.id,emailIdentityData(row.email,request,numberFree));
  const updated={...row,roles:JSON.stringify([...new Set([...JSON.parse(row.roles),'student'])])};
  await client.query('UPDATE accounts SET roles=$1 WHERE id=$2',[updated.roles,row.id]);
  if(request && ['pending','rejected'].includes(String(request.data.status))) await repo.save(request,{status:'verified',source:'verified-student-email',reason:emailIdentityReason,reviewedAt:timestamp()});
  await repo.notify([row.id],identity.id,'student.identity.verified',emailIdentityReason);
  await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),row.id,'student','student.identity.email-grant',identity.id,emailIdentityReason,JSON.stringify({source:'verified-student-email'}),timestamp()]);
  return updated;
}
