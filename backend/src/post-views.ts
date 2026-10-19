import {requireSocialAccess} from './community-social';
import {runSync,runAsync} from './storage/effects';
import { demand, timestamp, type Account } from './auth';
import type { Database } from './database';
import { Repository, type Fields } from './repository';
import type { PostgresRepository } from './storage/postgres-repository';

function viewInput(input: Fields) {
  demand(typeof input.id === 'string' && input.id.length > 0, '帖子标识无效。');
  demand(typeof input.openId === 'string' && /^[a-zA-Z0-9-]{8,100}$/.test(input.openId), '打开记录标识无效。');
  return { postId: input.id, openId: input.openId };
}

export function recordPostView(db: Database, repo: Repository, actor: Account, input: Fields) {
  demand(actor.roles.length>0,'请先完成校园身份核验。',403);
  const { postId, openId } = viewInput(input);
  const post = repo.get(postId, 'post');
  runSync(requireSocialAccess(repo,actor,post.ownerId));
  demand(post.data.status === 'visible', '帖子当前不可查看。', 403);
  const previous = db.prepare('SELECT post_id FROM post_views WHERE viewer_id=? AND open_id=?').get(actor.id, openId);
  demand(!previous || previous.post_id === postId, '打开记录标识已用于其他帖子。', 409);
  if (!previous) db.prepare('INSERT INTO post_views(post_id,viewer_id,open_id,viewed_at) VALUES(?,?,?,?)').run(postId, actor.id, openId, timestamp());
  return { id: postId };
}

export async function recordPostgresPostView(repo: PostgresRepository, actor: Account, input: Fields) {
  demand(actor.roles.length>0,'请先完成校园身份核验。',403);
  const { postId, openId } = viewInput(input);
  const post = await repo.get(postId, 'post');
  await runAsync(requireSocialAccess(repo,actor,post.ownerId));
  demand(post.data.status === 'visible', '帖子当前不可查看。', 403);
  const { rows } = await repo.client.query<{post_id:string}>('SELECT post_id FROM post_views WHERE viewer_id=$1 AND open_id=$2', [actor.id, openId]);
  demand(!rows[0] || rows[0].post_id === postId, '打开记录标识已用于其他帖子。', 409);
  if (!rows[0]) {
    const inserted = await repo.client.query<{post_id:string}>('INSERT INTO post_views(post_id,viewer_id,open_id,viewed_at) VALUES($1,$2,$3,$4) ON CONFLICT(viewer_id,open_id) DO NOTHING RETURNING post_id', [postId, actor.id, openId, timestamp()]);
    if (!inserted.rows[0]) {
      const concurrent = await repo.client.query<{post_id:string}>('SELECT post_id FROM post_views WHERE viewer_id=$1 AND open_id=$2', [actor.id, openId]);
      demand(concurrent.rows[0]?.post_id === postId, '打开记录标识已用于其他帖子。', 409);
    }
  }
  return { id: postId };
}
