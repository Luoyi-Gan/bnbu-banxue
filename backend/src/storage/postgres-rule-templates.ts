import type { Fields } from '../repository';
import { portalExerciseGoal, ruleTemplateGate, ruleTemplateProjection, ruleTemplateQuery } from '../sports/portal-rule-templates';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresRuleTemplates(db:PostgresDatabase,token:string,input:Fields,goal=false) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities=[...await repo.all('sportsIdentity'),...await repo.all('sportsSystem')],reader={all:(kind:string)=>entities.filter(e=>e.kind===kind)};
    if(goal)return {data:portalExerciseGoal(reader,actor)};
    ruleTemplateGate(reader,actor);
    const {limit,before}=ruleTemplateQuery(input);
    const rows=(await client.query<{sequence:string;id:string}>("SELECT p.sequence,e.id FROM sports_template_publications p JOIN entities e ON e.id=p.template_id WHERE p.sequence < $1 AND e.kind='sportsTemplate' AND e.data::jsonb->>'status'='published' ORDER BY p.sequence DESC LIMIT $2",[before,limit+1])).rows;
    const items=[];
    for(const row of rows.slice(0,limit))items.push(ruleTemplateProjection(await repo.get(row.id,'sportsTemplate'),Number(row.sequence)));
    return {data:{items,nextBeforeVersion:rows.length>limit?items.at(-1)!.version:null}};
  });
}
