import type { PostgresDatabase } from './postgres';
import { projectCommunity } from '../community-view';
import { postgresWorkspace } from './postgres-workspace';

export async function postgresCommunityView(db: PostgresDatabase, token: string) {
  const workspace = await postgresWorkspace(db, token);
  const likes = (await db.pool.query<{id:string;count:string}>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' GROUP BY entity_id")).rows;
  return projectCommunity(workspace,new Map(likes.map(row=>[row.id,Number(row.count)])));
}
