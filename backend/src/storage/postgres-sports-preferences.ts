import { demand, ServiceError, type Account } from '../auth';
import type { Entity, Fields } from '../repository';
import { sportsAccountGate } from '../sports/account-gate';
import { sportsAvailable } from '../sports/materials';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export function sportsPreferencesProjection(entity?:Entity) {
  return {locale:entity?.data.sportsLocale ?? 'zh-CN',pushEnabled:entity?.data.sportsPushEnabled===true,emailEnabled:entity?.data.sportsEmailEnabled===true,version:entity?.version ?? 0};
}
export async function sportsPreferencesGate(repo:PostgresRepository,actor:Account) {
  const identities=await repo.all('sportsIdentity');
  sportsAccountGate({all:()=>identities},actor);
  demand(actor.status!=='banned' && identities.filter(i=>i.ownerId===actor.id && i.data.status==='verified').length===1,'没有有效体育身份。',403);
  const systems=await repo.all('sportsSystem');
  sportsAvailable({all:()=>systems});
}
export async function postgresSportsPreferences(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    await sportsPreferencesGate(repo,actor);
    return sportsPreferencesProjection((await repo.all('preferences')).find(e=>e.ownerId===actor.id));
  });
}
export async function saveSportsPreferences(repo:PostgresRepository,actor:Account,input:Fields) {
  demand(Object.keys(input).every(k=>['locale','pushEnabled','emailEnabled','expectedVersion'].includes(k)),'设置参数无效。');
  demand(['zh-CN','en'].includes(String(input.locale)) && typeof input.pushEnabled==='boolean' && typeof input.emailEnabled==='boolean','语言或提醒设置无效。');
  // Delivery adapters are not connected yet; do not imply subscriptions can send.
  demand(input.pushEnabled===false && input.emailEnabled===false,'推送和邮件服务尚未接通，暂不能开启。',503);
  const old=(await repo.all('preferences')).find(e=>e.ownerId===actor.id);
  if(input.expectedVersion!==(old?.version ?? 0)) throw new ServiceError(409,'CONFLICT_VERSION_MISMATCH','设置已更新，请刷新后重试。');
  const data={sportsLocale:input.locale,sportsPushEnabled:false,sportsEmailEnabled:false};
  const saved=old ? await repo.save(old,data) : await repo.create('preferences',actor.id,data);
  return sportsPreferencesProjection(saved);
}
