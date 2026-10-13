import { demand, ServiceError } from '../auth';
import type { Fields } from '../repository';
import { passwordChangeRequired } from '../accounts/account-gate';
import { projectAccountDirectory } from '../accounts/account-directory';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresAccountDirectory(db:PostgresDatabase,token:string,kind:'student'|'teacher',input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('companionIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再继续操作。');
    const identity=identities.find(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified');
    demand(identity && actor.status!=='banned' && (actor.roles.includes('superadmin') || Array.isArray(identity.data.permissions) && identity.data.permissions.includes('ACCOUNTS')),'没有该账号管理权限。',403);

    const entities=identities;
    const accounts=(await client.query<Fields>('SELECT id,name,organization,status,email FROM accounts')).rows;
    const page=projectAccountDirectory({all:type=>entities.filter(e=>e.kind===type)},accounts,kind,input);
    return page;
  });
}
