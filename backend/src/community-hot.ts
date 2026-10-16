import type { Entity } from './repository';

export type Engagement = {
  allViews: ReadonlyMap<string, number>;
  recentViews: ReadonlyMap<string, number>;
  recentLikes: ReadonlyMap<string, number>;
};
export const emptyEngagement: Engagement = { allViews: new Map(), recentViews: new Map(), recentLikes: new Map() };

export function hotLists(posts: Entity[], comments: Entity[], engagement: Engagement, now = Date.now()) {
  const publicPosts = posts.filter(post => post.kind === 'post' && post.data.status === 'visible');
  const eligiblePostCount = publicPosts.length;
  const byBoard: Record<string, string[]> = {};
  if (eligiblePostCount <= 75) return { eligiblePostCount, overall: [], byBoard };
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  const recentComments = new Map<string, number>();
  for (const comment of comments) {
    if (comment.kind !== 'comment' || comment.data.status !== 'visible' || Date.parse(comment.createdAt) < cutoff) continue;
    const postId = String(comment.data.postId ?? '');
    recentComments.set(postId, (recentComments.get(postId) ?? 0) + 1);
  }
  const ranked = publicPosts.map(post => {
    const views = engagement.recentViews.get(post.id) ?? 0;
    const likes = engagement.recentLikes.get(post.id) ?? 0;
    const comments = recentComments.get(post.id) ?? 0;
    return { id: post.id, board: String(post.data.board ?? ''), createdAt: post.createdAt, views, likes, comments, score: views + 5 * likes + 10 * comments };
  }).filter(item => item.score > 0).sort((a, b) =>
    b.score - a.score || b.comments - a.comments || b.likes - a.likes || b.views - a.views ||
    b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  for (const item of ranked) {
    const board = byBoard[item.board] ??= [];
    if (board.length < 10) board.push(item.id);
  }
  return { eligiblePostCount, overall: ranked.slice(0, 10).map(item => item.id), byBoard };
}
