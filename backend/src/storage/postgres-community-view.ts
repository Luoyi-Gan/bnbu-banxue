import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import { projectCommunity } from '../community-view';
import { passwordChangeRequired } from '../sports/account-gate';
import type { AlumniData } from '../../../shared/v2/alumniModel';

export async function postgresCommunityView(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const account = await new PostgresAuth(db).authenticate(token,client);
    const repo = new PostgresRepository(client);
    if(passwordChangeRequired(await repo.all('companionIdentity'),account)) return projectCommunity({account,entities:[],people:[],relations:[],alumni:{profiles:[]}},new Map());
    const entities = [...await repo.all('post'),...await repo.all('comment')];
    const people = await repo.people();
    const relations = (await client.query<{entityId:string;kind:string}>('SELECT entity_id AS "entityId",kind FROM relations WHERE account_id=$1',[account.id])).rows;
    const likes = (await client.query<{id:string;count:string}>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' GROUP BY entity_id")).rows;
    const alumniState = (await repo.all('alumniState'))[0]?.data.value as AlumniData | undefined;
    return projectCommunity({account,entities,people,relations,alumni:{profiles:alumniState?.profiles ?? []}},new Map(likes.map(row=>[row.id,Number(row.count)])));
  });
}
