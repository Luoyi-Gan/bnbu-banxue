import { account, demand, digest, ServiceError, type AccountRow } from '../auth';
import { validateStudentSearch, studentSearchResult } from '../student-search';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentSearch(db:PostgresDatabase,token:string,query:string,origin='unknown') {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    validateStudentSearch(actor,query);
    const repo=new PostgresRepository(client);
    const identities=await repo.all('companionIdentity'),preferences=await repo.all('preferences'),profiles=await repo.all('profile');
    demand(identities.some(item=>item.ownerId===actor.id && item.data.role==='student' && item.data.status==='verified' && typeof item.data.studentNumber==='string' && item.data.studentNumber),'仅已核验学生可按学号查找。',403);
    const now=Date.now(),subject=digest(actor.id),source=digest(origin);
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`student-search-source:${source}`]);
    const limits=(await client.query<{minute:string;day:string;source:string}>("SELECT count(*) FILTER (WHERE subject=$1 AND occurred_at>=$3) AS minute,count(*) FILTER (WHERE subject=$1 AND occurred_at>=$4) AS day,count(*) FILTER (WHERE origin=$2 AND occurred_at>=$3) AS source FROM security_rate_events WHERE category='student-search'",[subject,source,now-60_000,now-86_400_000])).rows[0];
    if(Number(limits.minute)>=10 || Number(limits.day)>=100 || Number(limits.source)>=30) throw new ServiceError(429,'RATE_LIMITED','请求过于频繁，请稍后再试。');
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('student-search',$1,$2,$3)",[subject,source,now]);
    const ids=[...new Set(identities.filter(i=>i.data.studentNumber===query.trim()).map(i=>i.ownerId))];
    const rows=(await client.query<AccountRow>("SELECT * FROM accounts WHERE id=ANY($1::text[]) AND login_kind='PERSONAL'",[ids])).rows;
    return {students:rows.flatMap(row=>studentSearchResult(account(row),preferences.find(p=>p.ownerId===row.id)?.data,identities,profiles.find(p=>p.ownerId===row.id)?.data).students)};
  });
}
