import { authenticate, demand } from './auth';
import type { Database } from './database';
import { rankDiscoverHot, type DiscoverCandidate, type DiscoverEngagement } from './discover-hot';

type CountRow = { id: string; count: number };
const asMap = (rows: CountRow[]) => new Map(rows.map(row => [String(row.id), Number(row.count)]));

export function discoverHotPage(db: Database, token: string) {
  const actor = authenticate(db, token);
  demand(actor.roles.includes('student') && actor.status !== 'banned', '请先完成学生身份核验。', 403);
  const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const rows = db.prepare("SELECT id,kind,created_at AS createdAt,data FROM entities WHERE (kind='activity' AND json_extract(data,'$.status')='published') OR (kind='post' AND json_extract(data,'$.status')='visible')").all() as { id: string; kind: 'activity' | 'post'; createdAt: string; data: string }[];
  const candidates: DiscoverCandidate[] = rows.map(row => {
    const data = JSON.parse(row.data) as Record<string, unknown>;
    return { id: row.id, kind: row.kind, title: String(data.title ?? ''), subtitle: row.kind === 'activity' ? String(data.location ?? '校园活动') : String(data.board ?? '校园社区'), status: String(data.status ?? ''), createdAt: row.createdAt };
  });
  const byRelation = (kind: string) => asMap(db.prepare('SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind=? AND created_at>=? GROUP BY entity_id').all(kind, cutoff) as CountRow[]);
  const engagement: DiscoverEngagement = {
    views: asMap(db.prepare('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=? GROUP BY post_id').all(cutoff) as CountRow[]),
    likes: byRelation('like'),
    comments: asMap(db.prepare("SELECT json_extract(data,'$.postId') AS id,count(*) AS count FROM entities WHERE kind='comment' AND json_extract(data,'$.status')='visible' AND created_at>=? GROUP BY json_extract(data,'$.postId')").all(cutoff) as CountRow[]),
    saves: byRelation('save'),
    participates: byRelation('participate'),
  };
  return rankDiscoverHot(candidates, engagement);
}
