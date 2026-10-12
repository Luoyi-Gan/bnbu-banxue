import { demand, ServiceError } from '../auth';
import type { Fields } from '../repository';
import { passwordChangeRequired } from '../sports/account-gate';
import { projectAccountDirectory } from '../sports/account-directory';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import {portalAccountProjection} from '../sports/portal-accounts';
import {administratorAccess} from '../sports/permissions';

export async function postgresAdminAccountDetail(db:PostgresDatabase,token:string,kind:'student'|'teacher',id:string) {
  const allowed=await db.transaction(async client=>{
    const actor=await new PostgresAuth(db).authenticate(token,client);
    const identities=await new PostgresRepository(client).all('sportsIdentity');
    return administratorAccess({all:()=>identities},actor).permissions.includes('ACCOUNTS');
  });
  if(!allowed)return null;
  // The directory rechecks authorization and mode in its own consistent snapshot.
  const page=await postgresAccountDirectory(db,token,kind,{id},true);
  demand(page.items.length===1,'账号不存在或身份资料需核对。',404);
  return {data:page.items[0]};
}

export async function postgresAccountDirectory(db:PostgresDatabase,token:string,kind:'student'|'teacher',input:Fields,native=false) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('sportsIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
    const identity=identities.find(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified');
    demand(identity && actor.status!=='banned' && (actor.roles.includes('superadmin') || Array.isArray(identity.data.permissions) && identity.data.permissions.includes('ACCOUNTS')),'没有该体育管理权限。',403);

    const entities=[...identities,...await repo.all('sportsSemester'),...await repo.all('sportsEnrollment'),...await repo.all('sportsCourse')];
    const accounts=(await client.query<Fields>('SELECT id,name,organization,status,email FROM accounts')).rows;
    const page=projectAccountDirectory({all:type=>entities.filter(e=>e.kind===type)},accounts,kind,input);
    return native?portalAccountProjection(page,kind,id=>identities.find(i=>i.id===id)!.createdAt):page;
  });
}
