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
    const row=(await client.query<AccountRow>("SELECT * FROM accounts WHERE email=$1 AND login_kind='PERSONAL'",[query.trim().toLowerCase()+'@bnbu.edu.cn'])).rows[0];
    if(!row) return {students:[]};
    const repo=new PostgresRepository(client);
    const preferences=(await repo.all('preferences')).find(p=>p.ownerId===row.id)?.data;
    return studentSearchResult(account(row),preferences,await repo.all('verifiedEmail'));
  });
}
