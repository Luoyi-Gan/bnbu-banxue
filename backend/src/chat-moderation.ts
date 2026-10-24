import {demand, type Account} from './auth';
import {textField, strings, type Entity, type Fields} from './repository';
import {effect, type BusinessRepository} from './storage/effects';

// A report grants access to the selected evidence, never the surrounding private conversation.
export function* chatModerationPolicy(repo: BusinessRepository, actor: Account, action: string, input: Fields): Generator<unknown, Entity | undefined, unknown> {
  if (action === 'report.create') {
    const message = yield* effect(repo.get(input.id));
    if (!['message', 'directMessage'].includes(message.kind)) return;
    demand(actor.roles.includes('student') && actor.status !== 'banned', '需要已授权学生身份。', 403);
    demand(message.ownerId !== actor.id && message.data.status !== 'hidden', '只能举报收到的有效消息。', 403);
    if (message.kind === 'directMessage') {
      demand(message.data.targetId === actor.id, '无权举报此消息。', 403);
    } else {
      const room = yield* effect(repo.get(message.data.roomId, 'room'));
      demand(room.data.status === 'open' && room.data.visibility === 'visible' && strings(room.data.members).includes(actor.id), '无权举报此消息。', 403);
    }
    demand(!(yield* effect(repo.all('report'))).some(r => r.ownerId === actor.id && r.data.targetId === message.id && r.data.status === 'pending'), '该消息已有待处理举报。', 409);
    return yield* effect(repo.create('report', actor.id, {
      targetId: message.id, targetKind: message.kind, targetOwnerId: message.ownerId, privateMessage: true,
      snapshot: {title: message.kind === 'message' ? '群聊消息' : '私信消息', body: String(message.data.body), createdAt: message.createdAt},
      reason: textField(input, 'reason', 1000), status: 'pending',
    }));
  }
  if (action === 'report.decide') {
    const report = yield* effect(repo.get(input.id, 'report'));
    if (report.data.privateMessage !== true) return;
    demand(actor.roles.some(r => r === 'reviewer' || r === 'superadmin'), '需要审核员或超级管理员职责。', 403);
    demand(report.data.status === 'pending', '举报已处理。', 409);
    demand(typeof input.upheld === 'boolean', '请明确举报处理结果。');
    const reason = textField(input, 'reason', 1000), message = yield* effect(repo.get(report.data.targetId));
    demand(['message', 'directMessage'].includes(message.kind), '举报对象已变化。', 409);
    if (input.upheld) {
      yield* effect(repo.save(message, {status: 'hidden', moderationReason: reason}));
      yield* effect(repo.notify([message.ownerId!], report.id, action, `消息举报成立，该消息已停止展示：${reason}`));
    }
    yield* effect(repo.notify([report.ownerId!], report.id, action, `举报${input.upheld ? '成立' : '驳回'}：${reason}`));
    return yield* effect(repo.save(report, {status: input.upheld ? 'upheld' : 'rejected', resolution: reason}));
  }
}
