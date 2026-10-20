export type DiscoverCandidate = {
  id: string;
  kind: 'activity' | 'post';
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
};

export type DiscoverEngagement = {
  views: ReadonlyMap<string, number>;
  likes: ReadonlyMap<string, number>;
  comments: ReadonlyMap<string, number>;
  saves: ReadonlyMap<string, number>;
  participates: ReadonlyMap<string, number>;
};

export function rankDiscoverHot(candidates: DiscoverCandidate[], engagement: DiscoverEngagement) {
  const publicPostCount = candidates.filter(item => item.kind === 'post' && item.status === 'visible').length;
  const ranked = candidates.filter(item => item.kind === 'activity' ? item.status === 'published' : item.status === 'visible')
    .map(item => {
      const views = item.kind === 'post' ? engagement.views.get(item.id) ?? 0 : 0;
      const likes = engagement.likes.get(item.id) ?? 0;
      const comments = item.kind === 'post' ? engagement.comments.get(item.id) ?? 0 : engagement.participates.get(item.id) ?? 0;
      const saves = item.kind === 'activity' ? engagement.saves.get(item.id) ?? 0 : 0;
      return { ...item, views, likes: likes + saves, comments, score: views + 5 * (likes + saves) + 10 * comments };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.comments - a.comments || b.likes - a.likes || b.views - a.views || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  return { publicPostCount, items: ranked.slice(0, 10).map(({ id, kind, title, subtitle }) => ({ id, kind, title, subtitle })) };
}
