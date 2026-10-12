import {demand} from '../auth';
import type {Fields} from '../repository';
import {portalEnduranceTables} from '../sports/portal-bootstrap';
import type {PostgresDatabase} from './postgres';
import {PostgresAuth} from './postgres-auth';
import {PostgresRepository} from './postgres-repository';
import {executePostgres} from './postgres-commands';

export async function postgresEnduranceTables(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities=[...await repo.all('sportsIdentity'),...await repo.all('sportsSystem'),...await repo.all('sportsConversionTable')];
    return portalEnduranceTables({all:kind=>entities.filter(e=>e.kind===kind)},actor);
  });
}
export async function postgresEnduranceWrite(db:PostgresDatabase,token:string,id:string|undefined,deleting:boolean,input:Fields,key:string) {
  const allowed=['gender','gradeGroup','runType','expectedVersion',...(deleting?[]:['minSeconds','maxSeconds','score','tier','note'])];
  demand(Object.keys(input).every(k=>allowed.includes(k)),'换算表参数无效。');
  const table=(await postgresEnduranceTables(db,token)).find(t=>t.gender===input.gender && t.gradeGroup===input.gradeGroup && t.runType===input.runType);
  demand(table,'换算表类型无效。',404);
  let rowId:string|undefined;
  if(id!==undefined){demand(id.startsWith(table.id+':'),'换算行不属于当前表。',409);rowId=id.slice(table.id.length+1);demand(rowId.length>0,'换算行标识无效。');}
  demand(!deleting || rowId,'缺少删除行标识。');
  const command:Fields={id:table.id,version:input.expectedVersion,...(rowId?{rowId}:{})};
  if(deleting)command.confirmed=true;
  else {
    demand(typeof input.tier==='string' && ['excellent','good','pass','fail'].includes(input.tier),'等级无效。');
    Object.assign(command,{min:input.minSeconds,max:input.maxSeconds,score:input.score,grade:input.tier.toUpperCase(),note:input.note ?? ''});
  }
  await executePostgres(db,token,deleting?'sports.conversion.remove':rowId?'sports.conversion.edit':'sports.conversion.add',command,key);
  return (await postgresEnduranceTables(db,token)).find(t=>t.id===table.id)!;
}
