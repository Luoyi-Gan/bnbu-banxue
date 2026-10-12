import { demand, ServiceError } from '../auth';
import { sportsPermissions } from '../sports/permissions';
import { passwordChangeRequired } from '../sports/account-gate';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import type { PostgresDatabase } from './postgres';

export async function postgresAdministratorDirectory(db:PostgresDatabase, token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    const repo=new PostgresRepository(client), identities=await repo.all('sportsIdentity');
    if(passwordChangeRequired(identities,actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
    demand(actor.status!=='banned' && actor.roles.includes('superadmin') && identities.some(i=>i.ownerId===actor.id && i.data.role==='admin' && i.data.status==='verified'),'仅体育总管理员可执行此治理操作。',403);
    const system=(await repo.all('sportsSystem'))[0];
    demand(!system || system.data.mode==='NORMAL','体育服务维护中，普通业务暂停。',503);
    const rows=(await client.query("SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name")).rows;
    return {
      permissions:sportsPermissions,
      items:rows.map(a=>{
        const identity=identities.find(i=>i.ownerId===a.id && i.data.role==='admin');
        return {id:a.id,identityId:identity?.id,loginName:a.login_name,name:a.name,email:a.email,department:a.organization,status:a.status==='active'?'ACTIVE':'DISABLED',permissions:identity?.data.permissions ?? [],version:identity?.version,updatedAt:identity?.updatedAt};
      }),
      candidates:(await client.query("SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='sportsIdentity' AND i.data::jsonb->>'status'='verified' ORDER BY a.name")).rows,
    };
  });
}
