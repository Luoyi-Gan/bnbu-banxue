import { account, type AccountRow } from '../auth';
import { validateStudentSearch, studentSearchResult } from '../student-search';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

export async function postgresStudentSearch(db:PostgresDatabase,token:string,query:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    validateStudentSearch(actor,query);
    const repo=new PostgresRepository(client);
    const identities=await repo.all('companionIdentity'),preferences=await repo.all('preferences'),profiles=await repo.all('profile');
    const ids=[...new Set(identities.filter(i=>i.data.studentNumber===query.trim()).map(i=>i.ownerId))];
    const rows=(await client.query<AccountRow>("SELECT * FROM accounts WHERE id=ANY($1::text[]) AND login_kind='PERSONAL'",[ids])).rows;
    return {students:rows.flatMap(row=>studentSearchResult(account(row),preferences.find(p=>p.ownerId===row.id)?.data,identities,profiles.find(p=>p.ownerId===row.id)?.data).students)};
  });
}
