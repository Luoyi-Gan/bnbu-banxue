import {chatModerationPolicy} from './chat-moderation';
import {chatMessageVisible} from './chat-visibility';
import { effect, runSync, type BusinessRepository } from "./storage/effects";
import {communitySocialPolicy,requireSocialAccess,validPostImages} from './community-social';
import { demand, type Account } from "./auth";
import { checkCommunityKeywords, communityKeywordPolicy } from './community-keywords';
import {
  enumField,
  integerField,
  Repository,
  strings,
  textField,
  type Entity,
  type Fields,
} from "./repository";

export const has = (actor: Account, ...roles: string[]) =>
  roles.some((role) => actor.roles.includes(role));
export const student = (actor: Account) =>
  demand(has(actor, "student"), "需要已授权学生身份。", 403);
export const reviewer = (actor: Account) =>
  demand(has(actor, "reviewer", "superadmin"), "需要审核职责。", 403);
export const operator = (actor: Account) =>
  demand(has(actor, "operator", "superadmin"), "需要运营职责。", 403);
export const owner = (actor: Account, entity: Entity) =>
  demand(entity.ownerId === actor.id, "只能处理本人记录。", 403);
export const canSpeak = (actor: Account) =>
  demand(actor.status === "active", "账号当前不能发帖、评论或聊天。", 403);
export const publicEntity = (entity: Entity) =>
  entity.data.visibility !== "hidden" &&
  (entity.data.status === "visible" ||
    entity.data.status === "published" ||
    entity.kind === "room");

function roomDetails(value: unknown, type: 'study' | 'entertainment' | 'carpool' | 'sport'): Fields {
  if (value === undefined && type !== 'sport') return {};
  demand(value && typeof value === 'object' && !Array.isArray(value), '组队筛选条件无效。');
  const input = value as Fields;
  const details: Fields = {};
  const optionalText = (key: string, max = 120) => {
    if (input[key] === undefined || input[key] === '') return;
    details[key] = textField(input, key, max);
  };
  const coordinates = (key: string) => {
    if (input[key] === undefined) return;
    const point = input[key];
    demand(Array.isArray(point) && point.length === 2 && typeof point[0] === 'number' && typeof point[1] === 'number' && Number.isFinite(point[0]) && Number.isFinite(point[1]) && point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90, '地点坐标无效。');
    details[key] = point;
  };
  optionalText('startsAt', 40);
  if (details.startsAt) demand(Number.isFinite(Date.parse(String(details.startsAt))), '约定时间无效。');
  if (type === 'carpool') {
    details.departurePlace = textField(input, 'departurePlace', 120);
    details.destinationPlace = textField(input, 'destinationPlace', 120);
    demand(typeof details.startsAt === 'string', '请填写出发时间。');
    optionalText('departureAddress', 240); optionalText('destinationAddress', 240);
    coordinates('departureCoordinates'); coordinates('destinationCoordinates');
  }
  if (type === 'entertainment') {
    details.activityType = textField(input, 'activityType', 40);
    demand(typeof details.startsAt === 'string', '请填写活动时间。');
  }
  if (type === 'study') {
    const min = input.gpaMin, max = input.gpaMax;
    demand((min === undefined && max === undefined) || (typeof min === 'number' && typeof max === 'number' && Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min), '绩点区间无效。');
    if (typeof min === 'number' && typeof max === 'number') { details.gpaMin = min; details.gpaMax = max; }
  }
  if (type === 'sport') {
    details.sportType = textField(input, 'sportType', 40);
    details.locationScope = enumField(input, 'locationScope', ['campus', 'outside']);
    demand(typeof input.extraCost === 'boolean', '请明确额外支出。');
    details.extraCost = input.extraCost;
    details.genderPreference = enumField(input, 'genderPreference', ['any', 'male', 'female']);
    if (input.extraCost) details.costDescription = textField(input, 'costDescription', 120);
    demand(typeof details.startsAt === 'string', '请填写运动时间。');
  }
  if (type === 'entertainment' || type === 'study' || type === 'sport') { optionalText('placeAddress', 240); coordinates('coordinates'); }
  if (type === 'entertainment' && input.locationScope !== undefined) details.locationScope = enumField(input, 'locationScope', ['campus', 'outside']);
  return details;
}

export function* communityPolicy(
  repo: BusinessRepository,
  actor: Account,
  action: string,
  input: Fields,
): Generator<unknown, Entity | undefined, unknown> {
  if (action === 'report.create' || action === 'report.decide') {
    const report = yield* chatModerationPolicy(repo, actor, action, input);
    if (report) return report;
  }
  const social=yield* communitySocialPolicy(repo,actor,action,input);
  if(social)return social;
  if (action.startsWith('keyword.')) return yield* communityKeywordPolicy(repo, actor, action, input);
  if (action === "post.create") {
    student(actor);
    canSpeak(actor);
    const draft=input.draftId?yield* effect(repo.get(input.draftId,'postDraft')):null;
    if(draft)demand(draft.ownerId===actor.id&&draft.data.status==='draft','草稿已发布或不可访问。',409);
    if(draft)demand(!draft.data.sourcePostId,'编辑草稿须保存到原帖子。',409);
    const images=validPostImages(input.images??[],draft?.data.images);
    const title = textField(input, "title", 80);
    const body = textField(input, "body", 1000);
    const board = textField(input, "board", 40);
    yield* checkCommunityKeywords(repo, title, body);
    const post=yield* effect(repo.create("post", actor.id, {
      title,
      body,
      board,
      images,
      status: "visible",
    }));
    if(draft)yield* effect(repo.save(draft,{status:'published',postId:post.id,images:[],body:''}));
    return post;
  }
  if (action === "comment.create") {
    student(actor);
    canSpeak(actor);
    const post = (yield* effect(repo.get(input.postId, "post")));
    demand(post.data.status === "visible", "帖子尚未公开。");
    yield* requireSocialAccess(repo,actor,post.ownerId);
    const reply=input.replyToId?yield* effect(repo.get(input.replyToId,'comment')):null;
    if(reply){
      demand(reply.data.postId===post.id&&reply.data.status==='visible','回复对象当前不可查看。',409);
      yield* requireSocialAccess(repo,actor,reply.ownerId);
    }
    const body = textField(input, "body", 300);
    yield* checkCommunityKeywords(repo, body);
    const comment=yield* effect(repo.create("comment", actor.id, {
      postId: post.id,
      body,
      status: "visible",
      ...(reply?{replyToId:reply.id,parentId:reply.data.parentId||reply.id}:{}),
    }));
    const recipients=[...new Set([post.ownerId,reply?.ownerId].filter((id):id is string=>!!id&&id!==actor.id))];
    if(recipients.length)yield* effect(repo.notify(recipients,post.id,reply?'community.reply':'community.comment',reply?'你的内容收到一条回复。':'你的帖子收到一条评论。'));
    return comment;
  }
  if (action === "post.delete") {
    const post = yield* effect(repo.get(input.id, "post"));
    const isAuthor = post.ownerId === actor.id;
    demand(isAuthor || has(actor, "reviewer", "superadmin"), "只能删除本人帖子，或由审核职责处理。", 403);
    demand(post.data.status !== "deleted", "帖子已删除。", 409);
    const reason = isAuthor ? "" : textField(input, "reason", 1000);
    if (!isAuthor) {
      yield* effect(repo.notify([post.ownerId!], post.id, action, `帖子已删除：${reason}`));
    }
    return yield* effect(repo.save(post, { status: "deleted", deleteReason: reason }));
  }
  if (action === "content.review") {
    reviewer(actor);
    const entity = (yield* effect(repo.get(input.id)));
    demand(["post", "comment"].includes(entity.kind), "对象类型无效。");
    demand(entity.data.status !== "deleted", "已删除帖子不能恢复或下架。", 409);
    const status = enumField(input, "status", ["visible", "hidden"]);
    const reason = textField(input, "reason", 1000, entity.data.status === "pending" && status === "visible");
    demand(entity.data.status !== status, "内容已处于该状态。", 409);
    (yield* effect(repo.notify(
      [entity.ownerId!],
      entity.id,
      action,
      `内容${status === "visible" ? "已公开" : "已隐藏"}${reason ? `：${reason}` : ""}`,
    )));
    return (yield* effect(repo.save(entity, { status, reviewNote: reason })));
  }
  if (action === "room.create") {
    student(actor);
    const type = enumField(input, "type", ["study", "entertainment", "carpool", "sport"]);
    return (yield* effect(repo.create("room", actor.id, {
      type,
      title: textField(input, "title", 80),
      body: textField(input, "body", 1000),
      time: textField(input, "time", 120),
      place: textField(input, "place", 120),
      details: roomDetails(input.details, type),
      capacity: integerField(input, "capacity", 2, 1000),
      members: [actor.id],
      status: "open",
      visibility: "visible",
    })));
  }
  if (action === "room.apply") {
    student(actor);
    const room = (yield* effect(repo.get(input.id, "room"))),
      members = strings(room.data.members);
    demand(
      room.data.status === "open" &&
        room.data.visibility === "visible" &&
        members.length < Number(room.data.capacity),
      "队伍已结束、下架或满员。",
    );
    demand(
      !members.includes(actor.id) &&
        !(yield* effect(repo
          .all("roomApplication")))
          .some(
            (a) =>
              a.ownerId === actor.id &&
              a.data.roomId === room.id &&
              a.data.status === "pending",
          ),
      "已加入或已有待处理申请。",
      409,
    );
    const application = (yield* effect(repo.create("roomApplication", actor.id, {
      roomId: room.id,
      status: "pending",
    })));
    (yield* effect(repo.notify(
      [room.ownerId!],
      room.id,
      action,
      `${actor.name}申请加入队伍。`,
    )));
    return application;
  }
  if (action === "room.decide") {
    student(actor);
    const application = (yield* effect(repo.get(input.id, "roomApplication"))),
      room = (yield* effect(repo.get(application.data.roomId, "room")));
    owner(actor, room);
    demand(application.data.status === "pending", "申请已处理。", 409);
    const accept = input.accept === true;
    const members = strings(room.data.members);
    demand(
      room.data.status === "open" && room.data.visibility === "visible",
      "队伍已结束或下架。",
    );
    if (accept) {
      demand(
        (yield* effect(repo.person(application.ownerId!))).status !== "banned",
        "申请人已被封禁。",
      );
      demand(
        members.length < Number(room.data.capacity) &&
          !members.includes(application.ownerId!),
        "队伍已满或申请人已加入。",
        409,
      );
      (yield* effect(repo.save(room, { members: [...members, application.ownerId!] })));
    }
    (yield* effect(repo.notify(
      [application.ownerId!],
      room.id,
      action,
      accept ? "入队申请已通过。" : "入队申请已拒绝。",
    )));
    return (yield* effect(repo.save(application, { status: accept ? "approved" : "rejected" })));
  }
  if (action === "room.finish" || action === "room.moderate") {
    const room = (yield* effect(repo.get(input.id, "room")));
    let patch: Fields,
      reason = "";
    if (action === "room.finish") {
      student(actor);
      owner(actor, room);
      demand(room.data.status === "open", "队伍已结束。", 409);
      patch = { status: "finished" };
    } else {
      reviewer(actor);
      reason = textField(input, "reason", 1000);
      const decision = enumField(input, "decision", [
        "hide",
        "restore",
        "finish",
        "remove",
      ]);
      if (decision === "remove") {
        const memberId = textField(input, "memberId", 100);
        demand(
          memberId !== room.ownerId &&
            strings(room.data.members).includes(memberId),
          "只能移除非队长成员。",
        );
        patch = {
          members: strings(room.data.members).filter((id) => id !== memberId),
        };
      } else
        patch =
          decision === "finish"
            ? { status: "finished" }
            : { visibility: decision === "hide" ? "hidden" : "visible" };
    }
    (yield* effect(repo.notify(
      strings(room.data.members),
      room.id,
      action,
      `队伍状态更新${reason ? `：${reason}` : ""}`,
    )));
    return (yield* effect(repo.save(room, patch)));
  }
  if (action === "room.review") {
    student(actor);
    const room = (yield* effect(repo.get(input.id, "room"))),
      target = textField(input, "targetId", 100);
    demand(
      room.data.status === "finished" &&
        strings(room.data.members).includes(actor.id) &&
        strings(room.data.members).includes(target) &&
        target !== actor.id,
      "仅已结束队伍的成员可互评，不能评价自己。",
    );
    demand(
      !(yield* effect(repo
        .all("roomReview")))
        .some(
          (r) =>
            r.ownerId === actor.id &&
            r.data.roomId === room.id &&
            r.data.targetId === target,
        ),
      "已经评价过该成员。",
      409,
    );
    return (yield* effect(repo.create("roomReview", actor.id, {
      roomId: room.id,
      targetId: target,
      stars: integerField(input, "stars", 1, 5),
      comment: textField(input, "comment", 1000, true),
      tags: strings(input.tags).slice(0, 10),
    })));
  }
  if (action === "message.read") {
    student(actor);
    const room = (yield* effect(repo.get(input.roomId, "room")));
    demand(room.data.status === "open" && room.data.visibility === "visible" && strings(room.data.members).includes(actor.id), "当前没有此队伍的聊天权限。", 403);
    demand(Array.isArray(input.ids) && input.ids.length > 0 && input.ids.every(id => typeof id === "string"), "请选择已读取的消息。");
    const ids = [...new Set(input.ids as string[])];
    const edges = yield* effect(repo.all('socialEdge'));
    for (const id of ids) {
      const message = yield* effect(repo.get(id, "message"));
      demand(message.data.roomId === room.id && chatMessageVisible(message, actor.id, edges), "消息不属于当前可见会话。", 403);
    }
    for (const id of ids) (yield* effect(repo.relation(actor.id, id, "message.read", true)));
    return room;
  }
  if (action === "message.send") {
    student(actor);
    canSpeak(actor);
    const room = (yield* effect(repo.get(input.roomId, "room")));
    demand(
      room.data.status === "open" &&
        room.data.visibility === "visible" &&
        strings(room.data.members).includes(actor.id),
      "当前没有此队伍的聊天权限。",
      403,
    );
    const body = textField(input, "body", 500);
    yield* checkCommunityKeywords(repo, body);
    return (yield* effect(repo.create("message", actor.id, {
      roomId: room.id,
      body,
    })));
  }
  if (action === "report.create") {
    student(actor);
    const target = (yield* effect(repo.get(input.id)));
    demand(
      ["post", "comment", "room"].includes(target.kind) && publicEntity(target),
      "只能举报当前公开内容。",
    );
    if (target.kind === "comment")
      demand(
        (yield* effect(repo.get(target.data.postId, "post"))).data.status === "visible",
        "帖子未公开。",
      );
    demand(
      !(yield* effect(repo
        .all("report")))
        .some(
          (r) =>
            r.ownerId === actor.id &&
            r.data.targetId === target.id &&
            r.data.status === "pending",
        ),
      "该对象已有待处理举报。",
      409,
    );
    return (yield* effect(repo.create("report", actor.id, {
      targetId: target.id,
      snapshot: target.data,
      reason: textField(input, "reason", 1000),
      status: "pending",
    })));
  }
  if (action === "report.decide") {
    reviewer(actor);
    const report = (yield* effect(repo.get(input.id, "report"))),
      reason = textField(input, "reason", 1000);
    demand(report.data.status === "pending", "举报已处理。", 409);
    const target = (yield* effect(repo.get(report.data.targetId))),
      upheld = input.upheld === true;
    if (upheld && publicEntity(target)) {
      (yield* effect(repo.save(
        target,
        target.kind === "room"
          ? { visibility: "hidden" }
          : { status: "hidden" },
      )));
      (yield* effect(repo.notify(
        target.kind === "room"
          ? strings(target.data.members)
          : [target.ownerId!],
        target.id,
        action,
        `举报成立，内容已下架：${reason}`,
      )));
    }
    (yield* effect(repo.notify(
      [report.ownerId!],
      target.id,
      action,
      `举报${upheld ? "成立" : "驳回"}：${reason}`,
    )));
    return (yield* effect(repo.save(report, {
      status: upheld ? "upheld" : "rejected",
      resolution: reason,
    })));
  }
  return undefined;
}

export function communityCommand(repo: Repository, actor: Account, action: string, input: Fields): Entity | undefined {
  return runSync(communityPolicy(repo, actor, action, input));
}
