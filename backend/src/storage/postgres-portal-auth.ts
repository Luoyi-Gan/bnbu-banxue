import type {PoolClient} from 'pg';
import {demand,type Account} from '../auth';
import {portalSecurityData} from '../sports/portal';
import {PostgresRepository} from './postgres-repository';
import {PostgresAuth} from './postgres-auth';
import type {PostgresDatabase} from './postgres';

async function security(client:PoolClient,actor:Account) {
  const identities=await new PostgresRepository(client).all('sportsIdentity');
  const independent=(await client.query("SELECT 1 FROM accounts WHERE id=$1 AND login_kind='ADMIN'",[actor.id])).rows.length===1;
  return portalSecurityData({all:()=>identities},actor,independent);
}
export async function postgresPortalSecurity(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    return security(client,await new PostgresAuth(db).authenticate(token,client));
  });
}
export async function postgresPortalLogin(db:PostgresDatabase,identifier:unknown,password:unknown) {
  let user:{id:string;role:'ADMIN'|'TEACHER';status:'ACTIVE';version:number}|undefined;
  const result=await new PostgresAuth(db).login(identifier,password,undefined,async(client,actor)=>{
    const state=await security(client,actor);
    user={id:actor.id,role:state.adminKind?'ADMIN':'TEACHER',status:'ACTIVE',version:state.version};
  });
  demand(user,'体育登录身份不可用。',403);
  return {token:result.token,user};
}
