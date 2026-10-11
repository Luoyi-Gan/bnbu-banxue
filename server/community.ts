import { demand, type Account } from "./auth";
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

export function communityCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action === "post.create") {
    student(actor);
    canSpeak(actor);
    const images = strings(input.images);
    demand(
      images.length <= 9 &&
        images.every(
          (url) =>
            /^data:image\/(jpeg|png|webp);base64,/.test(url) &&
            url.length <= 7_000_000,
        ),
      "最多九张有效 JPG、PNG、WebP 图片。",
    );
    return repo.create("post", actor.id, {
      title: textField(input, "title", 80),
      body: textField(input, "body", 1000),
      board: textField(input, "board", 40),
      images,
      status: "pending",
    });
  }
  if (action === "comment.create") {
    student(actor);
    canSpeak(actor);
    const post = repo.get(input.postId, "post");
    demand(post.data.status === "visible", "帖子尚未公开。");
    return repo.create("comment", actor.id, {
      postId: post.id,
      body: textField(input, "body", 300),
      status: "pending",
    });
  }
  if (action === "content.review") {
    reviewer(actor);
    const entity = repo.get(input.id);
    demand(["post", "comment"].includes(entity.kind), "对象类型无效。");
    const status = enumField(input, "status", ["visible", "hidden"]);
    const reason = textField(input, "reason", 1000);
    demand(entity.data.status !== status, "内容已处于该状态。", 409);
    repo.notify(
      [entity.ownerId!],
      entity.id,
      action,
      `内容${status === "visible" ? "已公开" : "已隐藏"}：${reason}`,
    );
    return repo.save(entity, { status, reviewNote: reason });
  }
  if (action === "room.create") {
    student(actor);
    return repo.create("room", actor.id, {
      type: enumField(input, "type", ["study", "entertainment", "carpool"]),
      title: textField(input, "title", 80),
      body: textField(input, "body", 1000),
      time: textField(input, "time", 120),
      place: textField(input, "place", 120),
      capacity: integerField(input, "capacity", 2, 1000),
      members: [actor.id],
      status: "open",
      visibility: "visible",
    });
  }
  if (action === "room.apply") {
    student(actor);
    const room = repo.get(input.id, "room"),
      members = strings(room.data.members);
    demand(
      room.data.status === "open" &&
        room.data.visibility === "visible" &&
        members.length < Number(room.data.capacity),
      "队伍已结束、下架或满员。",
    );
    demand(
      !members.includes(actor.id) &&
        !repo
          .all("roomApplication")
          .some(
            (a) =>
              a.ownerId === actor.id &&
              a.data.roomId === room.id &&
              a.data.status === "pending",
          ),
      "已加入或已有待处理申请。",
      409,
    );
    const application = repo.create("roomApplication", actor.id, {
      roomId: room.id,
      status: "pending",
    });
    repo.notify(
      [room.ownerId!],
      room.id,
      action,
      `${actor.name}申请加入队伍。`,
    );
    return application;
  }
  if (action === "room.decide") {
    student(actor);
    const application = repo.get(input.id, "roomApplication"),
      room = repo.get(application.data.roomId, "room");
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
        repo.person(application.ownerId!).status !== "banned",
        "申请人已被封禁。",
      );
      demand(
        members.length < Number(room.data.capacity) &&
          !members.includes(application.ownerId!),
        "队伍已满或申请人已加入。",
        409,
      );
      repo.save(room, { members: [...members, application.ownerId!] });
    }
    repo.notify(
      [application.ownerId!],
      room.id,
      action,
      accept ? "入队申请已通过。" : "入队申请已拒绝。",
    );
    return repo.save(application, { status: accept ? "approved" : "rejected" });
  }
  if (action === "room.finish" || action === "room.moderate") {
    const room = repo.get(input.id, "room");
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
    repo.notify(
      strings(room.data.members),
      room.id,
      action,
      `队伍状态更新${reason ? `：${reason}` : ""}`,
    );
    return repo.save(room, patch);
  }
  if (action === "room.review") {
    student(actor);
    const room = repo.get(input.id, "room"),
      target = textField(input, "targetId", 100);
    demand(
      room.data.status === "finished" &&
        strings(room.data.members).includes(actor.id) &&
        strings(room.data.members).includes(target) &&
        target !== actor.id,
      "仅已结束队伍的成员可互评，不能评价自己。",
    );
    demand(
      !repo
        .all("roomReview")
        .some(
          (r) =>
            r.ownerId === actor.id &&
            r.data.roomId === room.id &&
            r.data.targetId === target,
        ),
      "已经评价过该成员。",
      409,
    );
    return repo.create("roomReview", actor.id, {
      roomId: room.id,
      targetId: target,
      stars: integerField(input, "stars", 1, 5),
      comment: textField(input, "comment", 1000, true),
      tags: strings(input.tags).slice(0, 10),
    });
  }
  if (action === "message.send") {
    student(actor);
    canSpeak(actor);
    const room = repo.get(input.roomId, "room");
    demand(
      room.data.status === "open" &&
        room.data.visibility === "visible" &&
        strings(room.data.members).includes(actor.id),
      "当前没有此队伍的聊天权限。",
      403,
    );
    return repo.create("message", actor.id, {
      roomId: room.id,
      body: textField(input, "body", 500),
    });
  }
  if (action === "report.create") {
    student(actor);
    const target = repo.get(input.id);
    demand(
      ["post", "comment", "room"].includes(target.kind) && publicEntity(target),
      "只能举报当前公开内容。",
    );
    if (target.kind === "comment")
      demand(
        repo.get(target.data.postId, "post").data.status === "visible",
        "帖子未公开。",
      );
    demand(
      !repo
        .all("report")
        .some(
          (r) =>
            r.ownerId === actor.id &&
            r.data.targetId === target.id &&
            r.data.status === "pending",
        ),
      "该对象已有待处理举报。",
      409,
    );
    return repo.create("report", actor.id, {
      targetId: target.id,
      snapshot: target.data,
      reason: textField(input, "reason", 1000),
      status: "pending",
    });
  }
  if (action === "report.decide") {
    reviewer(actor);
    const report = repo.get(input.id, "report"),
      reason = textField(input, "reason", 1000);
    demand(report.data.status === "pending", "举报已处理。", 409);
    const target = repo.get(report.data.targetId),
      upheld = input.upheld === true;
    if (upheld && publicEntity(target)) {
      repo.save(
        target,
        target.kind === "room"
          ? { visibility: "hidden" }
          : { status: "hidden" },
      );
      repo.notify(
        target.kind === "room"
          ? strings(target.data.members)
          : [target.ownerId!],
        target.id,
        action,
        `举报成立，内容已下架：${reason}`,
      );
    }
    repo.notify(
      [report.ownerId!],
      target.id,
      action,
      `举报${upheld ? "成立" : "驳回"}：${reason}`,
    );
    return repo.save(report, {
      status: upheld ? "upheld" : "rejected",
      resolution: reason,
    });
  }
  return undefined;
}
