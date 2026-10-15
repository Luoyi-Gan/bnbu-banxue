import { demand, type Account } from './auth';
import { effect, type BusinessRepository } from './storage/effects';
import { textField, type Entity, type Fields } from './repository';

const normalized = (value: string) => value.normalize('NFKC').toLowerCase();
const canManage = (actor: Account) =>
  demand(actor.roles.some(role => ['superadmin', 'reviewer', 'operator'].includes(role)), '需要管理员职责。', 403);

/** Both SQLite and PostgreSQL run this policy against their shared entity store. */
export function* communityKeywordPolicy(
  repo: BusinessRepository,
  actor: Account,
  action: string,
  input: Fields,
): Generator<unknown, Entity | undefined, unknown> {
  if (!['keyword.save', 'keyword.set', 'keyword.delete'].includes(action)) return undefined;
  canManage(actor);
  if (action === 'keyword.delete') {
    const keyword = yield* effect(repo.get(input.id, 'communityKeyword'));
    demand(keyword.data.deleted !== true, '词汇已删除。', 409);
    return yield* effect(repo.save(keyword, { enabled: false, deleted: true }));
  }
  if (action === 'keyword.set') {
    demand(typeof input.enabled === 'boolean', 'enabled 必须为布尔值。');
    const keyword = yield* effect(repo.get(input.id, 'communityKeyword'));
    demand(keyword.data.deleted !== true, '词汇已删除。', 409);
    demand(keyword.data.enabled !== input.enabled, '词汇已处于该状态。', 409);
    return yield* effect(repo.save(keyword, { enabled: input.enabled }));
  }
  const word = textField(input, 'word', 80);
  demand(!/[\r\n]/.test(word), '词汇不能包含换行。');
  const current = typeof input.id === 'string' ? yield* effect(repo.get(input.id, 'communityKeyword')) : undefined;
  demand(!current || current.data.deleted !== true, '词汇已删除。', 409);
  const duplicate = (yield* effect(repo.all('communityKeyword')))
    .some(item => item.data.deleted !== true && item.id !== current?.id && normalized(String(item.data.word)) === normalized(word));
  demand(!duplicate, '词汇已存在。', 409);
  return current
    ? yield* effect(repo.save(current, { word }))
    : yield* effect(repo.create('communityKeyword', actor.id, { word, enabled: true }));
}

export function* checkCommunityKeywords(
  repo: BusinessRepository,
  ...contents: string[]
): Generator<unknown, void, unknown> {
  const keywords = yield* effect(repo.all('communityKeyword'));
  const text = normalized(contents.join('\n'));
  demand(
    !keywords.some(item => item.data.deleted !== true && item.data.enabled === true && text.includes(normalized(String(item.data.word)))),
    '内容包含屏蔽词，请修改后再发布。',
  );
}
