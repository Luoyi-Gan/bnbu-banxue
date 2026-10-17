import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { demand } from '../auth';
import { rankDiscoverHot, type DiscoverCandidate, type DiscoverEngagement } from '../discover-hot';

type CountRow = { id: string; count: string };
const asMap = (rows: CountRow[]) => new Map(rows.map(row => [row.id, Number(row.count)]));

export async function postgresDiscoverHotPage(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor = await new PostgresAuth(db).authenticate(token, client);
    demand(actor.roles.includes('student') && actor.status !== 'banned', '请先完成学生身份核验。', 403);
    const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [rows, views, likes, comments, saves, participates] = await Promise.all([
      client.query<{ id: string; kind: 'activity' | 'post'; createdAt: string; title: string; subtitle: string; status: string }>("SELECT id,kind,created_at AS \"createdAt\",COALESCE(data::jsonb->>'title','') AS title,CASE WHEN kind='activity' THEN COALESCE(data::jsonb->>'location','校园活动') ELSE COALESCE(data::jsonb->>'board','校园社区') END AS subtitle,COALESCE(data::jsonb->>'status','') AS status FROM entities WHERE (kind='activity' AND data::jsonb->>'status'='published') OR (kind='post' AND data::jsonb->>'status'='visible')"),
      client.query<CountRow>('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=$1 GROUP BY post_id', [cutoff]),
      client.query<CountRow>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
      client.query<CountRow>("SELECT data::jsonb->>'postId' AS id,count(*) AS count FROM entities WHERE kind='comment' AND data::jsonb->>'status'='visible' AND created_at>=$1 GROUP BY data::jsonb->>'postId'", [cutoff]),
      client.query<CountRow>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='save' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
      client.query<CountRow>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='participate' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
    ]);
    const engagement: DiscoverEngagement = { views: asMap(views.rows), likes: asMap(likes.rows), comments: asMap(comments.rows), saves: asMap(saves.rows), participates: asMap(participates.rows) };
    return rankDiscoverHot(rows.rows as DiscoverCandidate[], engagement);
  });
}
