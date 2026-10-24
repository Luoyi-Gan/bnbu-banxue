import {profileCoverChoices} from '../../shared/v2/profileCover';
import {validSemesterStart} from '../../shared/v2/schedulePreferences';
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
import { parseSidebarItems } from "../../shared/v2/sidebarLayout";
import clubDirectory from '../../data/campus-clubs.json';

export function* governancePolicy(
  repo: BusinessRepository,
  actor: Account,
  action: string,
  input: Fields,
): Generator<unknown,Entity | undefined,unknown> {
  if(action==='organization.images'){
    operator(actor);
    const existing=yield* effect(repo.get(input.id,'organization'));
    demand(existing.version===input.version,'社团资料已变化，请刷新后重试。',409);
    const entry=clubDirectory.clubs.find(item=>item.name===existing.data.name);
    demand(existing.data.directoryOnly===true&&entry?.image&&entry.imageSource,'没有可核对的社团配图。');
    // Keep an independently maintained cover unless it was imported from this catalogue.
    if(existing.data.image&&!existing.data.imageSource)return existing;
    if(existing.data.image===entry.image&&JSON.stringify(existing.data.imageSource)===JSON.stringify(entry.imageSource))return existing;
    return yield* effect(repo.save(existing,{image:entry.image,imageSource:entry.imageSource}));
  }
  if(action==='organization.import'){
    operator(actor);
    const name=textField(input,'name',80),entry=clubDirectory.clubs.find(item=>item.name===name);
    demand(entry,'该社团未在已核实公开名录中。',404);
    const existing=(yield* effect(repo.all('organization'))).find(item=>item.data.name===name);
    if(existing)return existing;
    return yield* effect(repo.create('organization',null,{...entry}));
  }
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
      organization.ownerId?[organization.ownerId]:[],
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
      organization.ownerId?[organization.ownerId]:[],
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
  if (action === 'preferences.schedule') {
    student(actor);
    const patch:Record<string,unknown>={};
    if(input.hiddenDailyCourses!==undefined){
      demand(Array.isArray(input.hiddenDailyCourses)&&input.hiddenDailyCourses.length<=300&&input.hiddenDailyCourses.every(key=>typeof key==='string'&&key.length>0&&key.length<=300),'请选择有效的课程。');
      patch.hiddenDailyCourses=[...new Set(input.hiddenDailyCourses as string[])];
    }
    if(input.academicCalendar!==undefined){patch.academicCalendar=enumField(input,'academicCalendar',['bnbu-2026-s1','custom']);}
    if(input.homeScheduleCount!==undefined){
      demand(typeof input.homeScheduleCount==='number'&&Number.isInteger(input.homeScheduleCount)&&input.homeScheduleCount>=1&&input.homeScheduleCount<=6,'首页安排须展示1–6项。');
      patch.homeScheduleCount=input.homeScheduleCount;
    }
    if(input.semesterStartDate!==undefined){
      demand(input.semesterStartDate===''||validSemesterStart(input.semesterStartDate),'学期第一周日期须为有效的周一。');
      patch.semesterStartDate=input.semesterStartDate;
      if(input.academicCalendar===undefined)patch.academicCalendar='custom';
    }
    demand(Object.keys(patch).length>0,'请选择要保存的日程设置。');
    const previous=(yield* effect(repo.all('preferences'))).find(p=>p.ownerId===actor.id);
    return previous?(yield* effect(repo.save(previous,patch))):(yield* effect(repo.create('preferences',actor.id,patch)));
  }
  if (action === "preferences.profilebackground") {
    student(actor);
    const profileBackground = enumField(input, "choice", [...profileCoverChoices]);
    const profile=(yield* effect(repo.all('profile'))).find(p=>p.ownerId===actor.id);
    if(profile)yield* effect(repo.save(profile,{cover:profileBackground}));
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {profileBackground}))) : (yield* effect(repo.create("preferences", actor.id, {profileBackground})));
  }
  if (action === "preferences.sidebarnav") {
    student(actor);
    const sidebarItems = parseSidebarItems(input.items);
    demand(sidebarItems !== null, "侧栏必须保留五个主入口，且不能包含重复或未知功能。");
    const previous = (yield* effect(repo.all("preferences"))).find(p => p.ownerId === actor.id);
    return previous ? (yield* effect(repo.save(previous, {sidebarItems}))) : (yield* effect(repo.create("preferences", actor.id, {sidebarItems})));
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
    const cover=input.cover===undefined?undefined:textField(input,'cover',7_000_000,true);
    demand(cover===undefined||profileCoverChoices.some(choice=>choice===cover)||!!cover&&/^data:image\/(jpeg|png|webp);base64,/.test(cover)&&Buffer.from(cover.split(',')[1],'base64').length<=5*1024*1024,'背景须为校园预设或不超过 5MB 的 JPG、PNG、WebP。');
    const avatar = textField(input, "avatar", 7_000_000, true);
    demand(
      !avatar ||
        (/^data:image\/(jpeg|png|webp);base64,/.test(avatar) &&
          Buffer.from(avatar.split(",")[1], "base64").length <=
            5 * 1024 * 1024),
      "头像须为不超过 5MB 的 JPG、PNG、WebP。",
    );
    const profile = (yield* effect(repo.all("profile"))).find((p) => p.ownerId === actor.id),
      data = { nickname: textField(input, "nickname", 20), avatar,...(input.bio!==undefined?{bio:textField(input,"bio",100,true)}:{}),...(cover===undefined?{}:{cover}) };
    return profile
      ? (yield* effect(repo.save(profile, data)))
      : (yield* effect(repo.create("profile", actor.id, data)));
  }
  if (action === "timetable.save") {
    student(actor);
    const table = (yield* effect(repo.all("timetable"))).find((t) => t.ownerId === actor.id);
    if (input.source === 'photo' || input.expectedTableId !== undefined || input.expectedVersion !== undefined) {
      demand(typeof input.expectedTableId === 'string' && typeof input.expectedVersion === 'number' && Number.isInteger(input.expectedVersion), '请重新打开课表后导入。');
      demand(input.expectedTableId === (table?.id ?? '') && input.expectedVersion === (table?.version ?? 0), '课表已被更新，请重新识别并核对后再导入。', 409);
    }
    const lessons = parseTimetableResponse({ lessons: input.lessons });
    const data = { lessons, fileName: textField(input, "fileName", 255, true), importedAt: timestamp(), source: input.source === 'photo' ? 'photo' : 'manual' };
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
