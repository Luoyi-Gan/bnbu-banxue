import { describe, expect, it } from 'vitest';
import { rankDiscoverHot, type DiscoverCandidate, type DiscoverEngagement } from './discover-hot';

const candidate = (id: string, kind: 'activity' | 'post', status = kind === 'post' ? 'visible' : 'published'): DiscoverCandidate =>
  ({ id, kind, title: id, subtitle: '校园', status, createdAt: '2026-10-17T00:00:00.000Z' });
const engagement = (values: Partial<DiscoverEngagement> = {}): DiscoverEngagement => ({
  views: new Map(), likes: new Map(), comments: new Map(), saves: new Map(), participates: new Map(), ...values,
});

describe('discover hot ranking', () => {
  it('mixes current activity interactions with eligible community posts using the shared score and tie order', () => {
    const posts = Array.from({ length: 76 }, (_, index) => candidate(`post-${index}`, 'post'));
    const result = rankDiscoverHot([...posts, candidate('activity-1', 'activity'), candidate('activity-hidden', 'activity', 'draft')], engagement({
      views: new Map([['post-0', 11]]), comments: new Map([['post-0', 1]]),
      likes: new Map([['activity-1', 1], ['activity-hidden', 50]]), saves: new Map([['activity-1', 1]]), participates: new Map([['activity-1', 1]]),
    }));
    expect(result.publicPostCount).toBe(76);
    expect(result.items.map(item => item.id)).toEqual(['post-0', 'activity-1']);
    expect(result.items[1]).toEqual({ id: 'activity-1', kind: 'activity', title: 'activity-1', subtitle: '校园' });
  });

  it('keeps the community threshold while allowing public activities with real interactions', () => {
    const posts = Array.from({ length: 75 }, (_, index) => candidate(`post-${index}`, 'post'));
    const result = rankDiscoverHot([...posts, candidate('activity-1', 'activity')], engagement({
      views: new Map([['post-0', 100]]), participates: new Map([['activity-1', 1]]),
    }));
    expect(result.publicPostCount).toBe(75);
    expect(result.items.map(item => item.id)).toEqual(['activity-1']);
  });
});
