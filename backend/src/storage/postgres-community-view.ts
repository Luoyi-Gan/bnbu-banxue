import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import { projectCommunity } from '../community-view';
import type { Engagement } from '../community-hot';
import { projectDisplayPeople } from '../display-people';
import { passwordChangeRequired } from '../accounts/account-gate';
import type { AlumniData } from '../../../shared/v2/alumniModel';
import { demand } from '../auth';

export async function postgresCommunityView(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const account=await new PostgresAuth(db).authenticate(token,client);
    demand(account.roles.length>0 && account.status!=='banned','请先完成校园身份核验。',403);
    const repo=new PostgresRepository(client);
    if(passwordChangeRequired(await repo.all('companionIdentity'),account))
      return projectCommunity({account,entities:[],people:[],relations:[],alumni:{profiles:[]}},new Map());
    const [posts,comments,profiles,preferences,rawPeople]=await Promise.all([
      repo.all('post'),repo.all('comment'),repo.all('profile'),repo.all('preferences'),repo.people(),
    ]);
    const entities=[...posts,...comments];
    const visibleIds=new Set([account.id,...entities.map(entity=>entity.ownerId).filter((id):id is string=>!!id)]);
    const people=projectDisplayPeople(account,rawPeople,visibleIds,preferences,profiles);
    const relations=(await client.query<{entityId:string;kind:string}>('SELECT entity_id AS "entityId",kind FROM relations WHERE account_id=$1',[account.id])).rows;
    const cutoff=new Date(Date.now()-7*24*60*60*1000).toISOString();
    const [likes,allViews,recentViews,recentLikes]=await Promise.all([
      client.query<{id:string;count:string}>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' GROUP BY entity_id"),
      client.query<{id:string;count:string}>('SELECT post_id AS id,count(*) AS count FROM post_views GROUP BY post_id'),
      client.query<{id:string;count:string}>('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=$1 GROUP BY post_id',[cutoff]),
      client.query<{id:string;count:string}>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=$1 GROUP BY entity_id",[cutoff]),
    ]);
    const countMap=(rows:{id:string;count:string}[])=>new Map(rows.map(row=>[row.id,Number(row.count)]));
    const engagement:Engagement={allViews:countMap(allViews.rows),recentViews:countMap(recentViews.rows),recentLikes:countMap(recentLikes.rows)};
    const alumniState=(await repo.all('alumniState'))[0]?.data.value as AlumniData | undefined;
    return projectCommunity({account,entities,people,relations,alumni:{profiles:alumniState?.profiles ?? []}},countMap(likes.rows),engagement);
  });
}
