import type { RelationshipEntity } from './relationshipAdapter'
/** Isolated fixture, never merged into business state. */
export function relationshipDemo(count = 4): RelationshipEntity[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `demo:${i}`, sourceId: `demo:${i}`, title: ['羽毛球队', 'AI 工作坊', '学生组织', '校园分享会'][i % 4] + (i >= 4 ? ` ${i + 1}` : ''),
    kind: i % 4 === 0 ? 'team' : i % 4 === 2 ? 'organization' : 'activity',
    relation: i % 4 === 0 || i % 4 === 2 ? 'joined' : i % 4 === 1 ? 'registered' : 'confirmed',
    status: i % 4 === 1 ? '示例：报名成功，未核实出席' : i % 4 === 3 ? '示例：已确认参与，未核实出席' : '示例：已加入',
    active: true, path: '', establishedAt: '2026-10-09T08:00:00+08:00', memberAccess: '虚构成员，用于演示有查看授权的间接关系。',
    members: [0, 1, 2, 3, 4, 5, 6].map(n => ({ id: `demo-person:${(i + n) % 9}`, name: `同学 ${String.fromCharCode(65 + (i + n) % 9)}`, canView: n !== 6, relation: '示例共同成员 · 不代表好友或实际到场' })),
  }))
}
