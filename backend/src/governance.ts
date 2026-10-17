import { effect, runSync, type BusinessRepository } from "./storage/effects";
import { demand, timestamp, type Account } from "./auth";
import { has, operator, owner, reviewer, student } from "./community";
import {
  enumField,
  Repository,
  strings,
  textField,
  type Entity,
  type Fields,
} from "./repository";
import {
  correctTimetableLesson,
  parseTimetableResponse,
  type StudentTimetable,
  type TimetableLesson,
} from "../../shared/v2/timetableModel";

export function* governancePolicy(
  repo: BusinessRepository,
  actor: Account,
  action: string,
  input: Fields,
): Generator<unknown,Entity | undefined,unknown> {
  if (action === "certification.apply") {
    student(actor);
    const kind = enumField(input, "kind", ["student", "club", "official"]),
      organization = textField(input, "organization", 120);
    demand(
      !(yield* effect(repo
        .all("certification")))
        .some(
          (c) =>
            c.ownerId === actor.id &&
            c.data.kind === kind &&
            c.data.organization === organization &&
            c.data.status === "pending",
        ),
      "已有相同待审认证。",
      409,
    );
    return (yield* effect(repo.create("certification", actor.id, {
      kind,
      organization,
      note: textField(input, "note", 1000),
      status: "pending",
    })));
  }
  if (action === "certification.review") {
    reviewer(actor);
    const certification = (yield* effect(repo.get(input.id, "certification"))),
      approve = input.approve === true;
    demand(
      certification.data.status === "pending" ||
        (certification.data.status === "approved" && !approve),
      "认证当前不能进行该操作。",
      409,
    );
    const reason = textField(input, "reason", 1000, approve);
    (yield* effect(repo.notify(
      [certification.ownerId!],
      certification.id,
      action,
      `认证${approve ? "已通过" : "未通过或已撤销"}${reason ? `：${reason}` : ""}`,
    )));
    return (yield* effect(repo.save(certification, {
      status: approve ? "approved" : "rejected",
      reviewNote: reason,
    })));
  }
  if (action === "organization.apply") {
    student(actor);
    const name = textField(input, "name", 80);
    demand(
      !(yield* effect(repo
        .all("organization")))
        .some(
          (o) =>
            o.data.name === name &&
            ["pending", "approved"].includes(String(o.data.status)),
        ),
      "已有同名待审或已入驻社团。",
      409,
    );
    return (yield* effect(repo.create("organization", actor.id, {
      name,
      description: textField(input, "description", 1000),
      category: textField(input, "category", 80),
      contact: textField(input, "contact", 200),
      status: "pending",
      visibility: "hidden",
    })));
  }
  if (action === "organization.review") {
    reviewer(actor);
    const organization = (yield* effect(repo.get(input.id, "organization"))),
      approve = input.approve === true;
    demand(organization.data.status === "pending", "申请已处理。", 409);
    const reason = textField(input, "reason", 1000, approve);
    (yield* effect(repo.notify(
      [organization.ownerId!],
      organization.id,
      action,
      `入驻${approve ? "通过" : "驳回"}：${reason}`,
    )));
    return (yield* effect(repo.save(organization, {
      status: approve ? "approved" : "rejected",
      visibility: approve ? "visible" : "hidden",
      reviewNote: reason,
    })));
  }
  if (action === "organization.update") {
    operator(actor);
    const organization = (yield* effect(repo.get(input.id, "organization")));
    demand(organization.data.status === "approved", "仅可维护已入驻社团。");
    const visibility = enumField(input, "visibility", ["visible", "hidden"]),
      reason = textField(input, "reason", 1000);
    (yield* effect(repo.notify(
      [organization.ownerId!],
      organization.id,
      action,
      `社团资料或公开状态更新：${reason}`,
    )));
    return (yield* effect(repo.save(organization, {
      description: textField(input, "description", 1000),
      contact: textField(input, "contact", 200),
      visibility,
    })));
  }
  if (action === "knowledge.save") {
    operator(actor);
    const data = {
      title: textField(input, "title", 80),
      body: textField(input, "body", 10000),
      keywords: textField(input, "keywords", 500),
      source: textField(input, "source", 2000),
      status: enumField(input, "status", ["draft", "published"]),
    };
    return input.id
      ? (yield* effect(repo.save((yield* effect(repo.get(input.id, "knowledge"))), data)))
      : (yield* effect(repo.create("knowledge", actor.id, data)));
  }
  if (action === "knowledge.ask") {
    student(actor);
    const question = textField(input, "question", 500);
    const matches = (yield* effect(repo.all("knowledge"))).filter(
      (k) =>
        k.data.status === "published" &&
        String(k.data.keywords)
          .split(/[,，\s]+/)
          .filter(Boolean)
          .some((word) => question.includes(word)),
    );
    return (yield* effect(repo.create("answer", actor.id, {
      question,
      body: matches.length
        ? matches.map((k) => `${k.data.title}：${k.data.body}`).join("\n")
        : "暂无已发布知识能够回答这个问题。",
      sources: matches.map((k) => ({
        id: k.id,
        title: k.data.title,
        source: k.data.source,
      })),
    })));
  }
  if (action === "feedback.create") {
    student(actor);
    const answer = (yield* effect(repo.get(input.answerId, "answer")));
    owner(actor, answer);
    demand(
      !(yield* effect(repo
        .all("feedback")))
        .some(
          (f) =>
            f.ownerId === actor.id &&
            f.data.answerId === answer.id &&
            f.data.status === "pending",
        ),
      "已有待处理反馈。",
      409,
    );
    return (yield* effect(repo.create("feedback", actor.id, {
      answerId: answer.id,
      snapshot: answer.data,
      reason: textField(input, "reason", 1000),
      status: "pending",
    })));
  }
  if (action === "feedback.resolve") {
    operator(actor);
    const feedback = (yield* effect(repo.get(input.id, "feedback"))),
      reason = textField(input, "reason", 1000);
    demand(feedback.data.status === "pending", "反馈已处理。", 409);
    (yield* effect(repo.notify(
      [feedback.ownerId!],
      feedback.id,
      action,
      `回答反馈已处理：${reason}`,
    )));
    return (yield* effect(repo.save(feedback, { status: "resolved", resolution: reason })));
  }
  if (action === "preferences.aiicon") {
    student(actor);
    const aiIconChoice = enumField(input, "choice", ["yellow", "kitty", "custom"]);
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    const aiCustomIcon = input.image === undefined ? String(previous?.data.aiCustomIcon ?? "") : textField(input, "image", 1_500_000, true);
    demand(!aiCustomIcon || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(aiCustomIcon), "请上传 JPG、PNG 或 WebP 图片。");
    demand(aiIconChoice !== "custom" || !!aiCustomIcon, "请先上传自己的图片。");
    const data = {aiIconChoice, aiCustomIcon};
    return previous ? (yield* effect(repo.save(previous, data))) : (yield* effect(repo.create("preferences", actor.id, data)));
  }
  if (action === "preferences.profilebackground") {
    student(actor);
    const profileBackground = enumField(input, "choice", ["campus", "evening", "walkway", "services"]);
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {profileBackground}))) : (yield* effect(repo.create("preferences", actor.id, {profileBackground})));
  }
  if (action === "preferences.searchable") {
    student(actor);
    demand(typeof input.enabled === "boolean", "搜索开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {searchable:input.enabled}))) : (yield* effect(repo.create("preferences", actor.id, {searchable:input.enabled})));
  }
  if (action === "preferences.reminders") {
    student(actor);
    const key = enumField(input, "key", ["messages", "teams"]);
    demand(typeof input.enabled === "boolean", "提醒开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {[key]: input.enabled}))) : (yield* effect(repo.create("preferences", actor.id, {[key]: input.enabled})));
  }
  if (action === "preferences.preview") {
    student(actor);
    demand(typeof input.enabled === "boolean", "资料预览开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {profilePreview: input.enabled}))) : (yield* effect(repo.create("preferences", actor.id, {profilePreview: input.enabled})));
  }
  if (action === "preferences.hover") {
    student(actor);
    const key = enumField(input, "key", ["hoverRecentTeams", "hoverActiveTeams", "hoverActivities"]);
    demand(typeof input.enabled === "boolean", "悬浮资料开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {[key]: input.enabled}))) : (yield* effect(repo.create("preferences", actor.id, {[key]: input.enabled})));
  }
  if (action === "profile.save") {
    const avatar = textField(input, "avatar", 7_000_000, true);
    demand(
      !avatar ||
        (/^data:image\/(jpeg|png|webp);base64,/.test(avatar) &&
          Buffer.from(avatar.split(",")[1], "base64").length <=
            5 * 1024 * 1024),
      "头像须为不超过 5MB 的 JPG、PNG、WebP。",
    );
    const profile = (yield* effect(repo.all("profile"))).find((p) => p.ownerId === actor.id),
      data = { nickname: textField(input, "nickname", 20), avatar };
    return profile
      ? (yield* effect(repo.save(profile, data)))
      : (yield* effect(repo.create("profile", actor.id, data)));
  }
  if (action === "timetable.save") {
    student(actor);
    const table = (yield* effect(repo.all("timetable"))).find((t) => t.ownerId === actor.id);
    const lessons = parseTimetableResponse({ lessons: input.lessons });
    const data = { lessons, fileName: textField(input, "fileName", 255, true), importedAt: timestamp() };
    return table
      ? (yield* effect(repo.save(table, data)))
      : (yield* effect(repo.create("timetable", actor.id, data)));
  }
  if (action === "timetable.correct") {
    student(actor);
    const table = (yield* effect(repo.all("timetable"))).find((t) => t.ownerId === actor.id);
    demand(table, "尚未保存课表。");
    const next = correctTimetableLesson(
      {
        ...table.data,
        importedAt: String(table.data.importedAt ?? table.createdAt),
        updatedAt: table.updatedAt,
      } as unknown as StudentTimetable,
      textField(input, "lessonId", 100),
      input as unknown as TimetableLesson,
    );
    return (yield* effect(repo.save(table, { lessons: next.lessons })));
  }
  if (action === "account.update") {
    demand(has(actor, "superadmin"), "需要超级管理员职责。", 403);
    const id = textField(input, "id", 100),
      target = (yield* effect(repo.person(id))),
      reason = textField(input, "reason", 1000);
    const status = enumField(input, "status", ["active", "muted", "banned"]);
    const roles = strings(input.roles);
    demand(
      Array.isArray(input.roles) &&
        roles.length === input.roles.length &&
        roles.every((r) =>
          ["student", "teacher", "operator", "reviewer", "superadmin"].includes(
            r,
          ),
        ),
      "角色配置无效；体育资格须沿用原系统。",
    );
    if (
      target.roles.includes("superadmin") &&
      (status !== "active" || !roles.includes("superadmin"))
    ) {
      demand(
        (yield* effect(repo
          .people()))
          .some(
            (p) =>
              p.id !== id &&
              p.status === "active" &&
              p.roles.includes("superadmin"),
          ),
        "唯一有效超级管理员不可停用或降级。",
      );
    }
    (yield* effect(repo.updateAccount(id,status,roles)));
    (yield* effect(repo.notify([id], null, action, `账号权限或状态已更新：${reason}`)));
    // The audit dispatcher records the target account; no second mutable account copy.
    return {
      id,
      kind: "account",
      ownerId: id,
      data: { status, roles },
      version: 0,
      createdAt: "",
      updatedAt: "",
    };
  }
  return undefined;
}

export function governanceCommand(repo: Repository,actor:Account,action:string,input:Fields) { return runSync(governancePolicy(repo,actor,action,input)); }
