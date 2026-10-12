import { randomUUID } from 'node:crypto';
import { demand, digest, ServiceError, timestamp } from '../auth';
import { communityPolicy } from '../community';
import { coffeePolicy } from '../coffee';
import { relationPolicy } from '../relation-policy';
import type { Fields } from '../repository';
import { passwordChangeRequired } from '../sports/account-gate';
import { runAsync } from './effects';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

export async function executePostgres(db: PostgresDatabase, token: string, action: string, input: Fields, requestId: string) {
  demand(/^[a-z]+(?:\.[a-z]+)+$/.test(action) && requestId.length>=8 && requestId.length<=100,'请求格式无效。');
  return db.transaction(async client => {
    // Preserve SQLite's serialized business-command boundary while policies are migrated.
    // All API instances share this lock; external I/O must remain outside this transaction.
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    const actor = await new PostgresAuth(db).authenticate(token,client);
    demand(actor.status!=='banned','账号已封禁，不能进行业务写入。',403);
    const repo = new PostgresRepository(client);
    if(passwordChangeRequired(await repo.all('sportsIdentity'),actor)) throw new ServiceError(403,'PASSWORD_CHANGE_REQUIRED','请先修改本人初始密码，再进入体育业务。');
    for(const [name,key] of [['room.decide','accept'],['report.decide','upheld'],['coffee.answer','accept'],['coffee.slot.update','closed']] as const) {
      if(action===name) demand(typeof input[key]==='boolean',`${key} 必须明确为 true 或 false。`);
    }
    const hash = digest(JSON.stringify({action,input}));
    const previous = (await client.query<{request_hash:string;result:string}>('SELECT request_hash,result FROM command_receipts WHERE actor_id=$1 AND request_id=$2',[actor.id,requestId])).rows[0];
    if(previous) {
      demand(previous.request_hash===hash,'该请求标识已用于不同操作。',409);
      return JSON.parse(previous.result) as {id:string};
    }
    const entity = action==='relation.set' ? await runAsync(relationPolicy(repo,actor,input)) : await runAsync(communityPolicy(repo,actor,action,input)) ?? await runAsync(coffeePolicy(repo,actor,action,input));
    demand(entity,'该业务操作的 PostgreSQL 迁移尚未完成。',503);
    const result = {id:entity.id};
    const auditData = {result,...(action==='coffee.answer' ? {accepted:input.accept} : {}),...(action==='relation.set' ? {relation:{kind:input.kind,enabled:input.enabled===true}} : {}),...(['room.create','room.decide','room.finish','room.moderate'].includes(action) ? {teamResult:await repo.get(entity.id)} : {})};
    await client.query('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,actor.roles.join(','),action,typeof input.id==='string'?input.id:entity.id,typeof input.reason==='string'?input.reason:'',JSON.stringify(auditData),timestamp()]);
    await client.query('INSERT INTO command_receipts(actor_id,request_id,request_hash,result,created_at) VALUES($1,$2,$3,$4,$5)',[actor.id,requestId,hash,JSON.stringify(result),timestamp()]);
    return result;
  });
}
