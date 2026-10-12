import { randomUUID } from "node:crypto";
import { initialV2State } from "../../shared/v2/model";
import {
  correctActivityMail,
  importActivityMail,
  setMailActivityVisibility,
  type MailActivityRecord,
} from "../../shared/v2/mailActivityPolicy";
import {
  mailFieldLabels,
  normalizeMailTime,
  type MailActivityFields,
} from "../../shared/v2/mailActivityAdapter";
import { demand, type Account } from "./auth";
import { operator, owner, student } from "./community";
import {
  integerField,
  Repository,
  textField,
  type Entity,
  type Fields,
} from "./repository";

export function activityCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  const certified = () =>
    repo
      .all("certification")
      .some(
        (c) => c.ownerId === actor.id && c.data.kind === "club" &&
          c.data.status === "approved",
      );
  if (action === "activity.create") {
    student(actor);
    demand(certified(), "仅已认证的学生社团成员可以发起活动。", 403);
    const startAt = textField(input, "startAt", 40);
    demand(
      Number.isFinite(Date.parse(startAt)) && Date.parse(startAt) > Date.now(),
      "活动开始时间须为未来有效时间。",
    );
    return repo.create("activity", actor.id, {
      title: textField(input, "title", 80),
      description: textField(input, "description", 5000),
      startAt,
      location: textField(input, "location", 120),
      capacity: integerField(input, "capacity"),
      host: actor.name,
      status: "published",
      source: "member",
    });
  }
  if (action === "activity.visibility") {
    student(actor);
    const event = repo.get(input.id, "activity");
    owner(actor, event);
    demand(event.data.source === "member", "不能处理学校邮件活动。");
    if (input.publish === true)
      demand(certified(), "当前身份没有恢复活动的资格。", 403);
    return repo.save(event, {
      status: input.publish === true ? "published" : "draft",
    });
  }
  if (!action.startsWith("mail.")) return undefined;
  operator(actor);
  if (action === "mail.split" || action === "mail.revise") {
    const source = repo.get(input.id, "mail");
    const original = source.data.record as unknown as MailActivityRecord;
    demand(input.confirmed === true, "请确认已核对原邮件及活动信息。");
    demand(input.expectedVersion === source.version, "邮件已变化，请重新核对。", 409);
    demand(original.status === "pending" && !source.data.resolvedAs && !source.data.parentMailId,
      "仅未处理的待核实原邮件可以拆分或关联更正。", 409);
    const reason = textField(input, "reason", 1000);
    if (action === "mail.split") {
      demand(source.data.purpose !== "revision", "更正邮件请关联原活动，不能另行发布。", 409);
      demand(Array.isArray(input.activities) && input.activities.length >= 2 && input.activities.length <= 50,
        "请核对并提供 2–50 场活动。");
      const children: string[] = [];
      for (const fields of input.activities) {
        demand(fields && typeof fields === "object" && !Array.isArray(fields), "活动信息格式无效。");
        const record = { ...original, id: randomUUID(), eventId: randomUUID(), history: [...original.history] };
        const child = repo.create("mail", actor.id, {record, parentMailId: source.id});
        activityCommand(repo, actor, "mail.correct", {...fields as Fields, id: child.id, reason});
        children.push(child.id);
      }
      return repo.save(source, {resolvedAs: "split", childMailIds: children, resolutionReason: reason, resolvedBy: actor.id});
    }
    const target = repo.get(input.targetMailId, "mail");
    demand(target.id !== source.id && !target.data.resolvedAs, "请选择原活动对应的邮件。");
    demand(input.targetVersion === target.version, "原活动已变化，请重新核对。", 409);
    const targetRecord = target.data.record as unknown as MailActivityRecord;
    demand(targetRecord.status !== "pending", "原活动须已核实发布或下架。");
    activityCommand(repo, actor, "mail.correct", {...input, id: target.id, reason});
    repo.create("mailRevision", actor.id, {
      sourceMailId: source.id, targetMailId: target.id, sourceVersion: source.version,
      targetVersion: target.version, resultingVersion: repo.get(target.id).version, reason,
    });
    return repo.save(source, {resolvedAs: "revision", targetMailId: target.id, resolutionReason: reason, resolvedBy: actor.id});
  }
  const records = repo
    .all("mail")
    .map((e) => e.data.record as unknown as MailActivityRecord);
  const state = {
    ...initialV2State,
    role: "admin" as const,
    localEvents: [],
    mailActivities: records,
  };
  let next = state as typeof initialV2State;
  if (action === "mail.import") {
    const source = {
      messageId: textField(input, "messageId", 255),
      subject: textField(input, "subject", 500),
      sender: textField(input, "sender", 255),
      body: textField(input, "body", 50000),
      ...(input.cover
        ? {
            cover: {
              name: textField(input, "coverName", 255),
              data: textField(input, "cover", 1500000),
            },
          }
        : {}),
    };
    const duplicate = repo.all("mail").filter(e => !e.data.parentMailId)
      .map(e => e.data.record as unknown as MailActivityRecord).find(
      (r) =>
        r.source.messageId === source.messageId ||
        (r.source.subject.trim() === source.subject &&
          r.source.body.trim() === source.body),
    );
    if (duplicate) {
      demand(
        duplicate.source.subject.trim() === source.subject &&
          duplicate.source.body.trim() === source.body,
        "同一邮件标识的内容已变化，请核实修订关系，原活动未覆盖。",
        409,
      );
      demand(
        JSON.stringify(duplicate.source.cover ?? null) ===
          JSON.stringify(source.cover ?? null),
        "附件发生变化，修订关联规则待确认，请核实原记录。",
        409,
      );
      return repo
        .all("mail")
        .find(
          (e) =>
            (e.data.record as unknown as MailActivityRecord).id ===
            duplicate.id,
        )!;
    }
    next = importActivityMail(state, source);
    if (input.revision === true) {
      const record = next.mailActivities![0];
      record.status = "pending";
      record.extraction.issues.push("更正邮件：等待管理员关联原活动并核对");
      record.history[0].action = "更正邮件待核实";
      record.history[0].reason = "管理员选择作为更正邮件导入";
      next.localEvents = [];
    }
  } else {
    const stored = repo.get(input.id, "mail"),
      record = stored.data.record as unknown as MailActivityRecord;
    demand(!stored.data.resolvedAs, "该原邮件已完成拆分或关联，请操作对应活动。", 409);
    if (action === "mail.cover") {
      const cover = textField(input, "cover", 1500000),
        reason = textField(input, "reason", 1000);
      demand(
        /^data:image\/(png|jpeg|webp);base64,/.test(cover),
        "封面须为 JPG、PNG 或 WebP。",
      );
      const changed: MailActivityRecord = {
        ...record,
        source: {
          ...record.source,
          cover: { name: textField(input, "coverName", 255), data: cover },
        },
        history: [
          ...record.history,
          {
            at: new Date().toISOString(),
            actor: actor.id,
            action: "替换活动附件封面",
            reason,
            before: record.fields,
            after: record.fields,
          },
        ],
      };
      const event = repo
        .all("activity")
        .find((e) => e.data.mailId === stored.id);
      if (event) repo.save(event, { image: cover });
      return repo.save(stored, { record: changed });
    } else if (action === "mail.correct") {
      demand(stored.data.purpose !== "revision", "更正邮件请关联原活动，不能另行发布。", 409);
      const fields = Object.fromEntries(
        Object.keys(mailFieldLabels).map((key) => [
          key,
          textField(
            input,
            key,
            key === "description" ? 5000 : 500,
            key === "host" || key === "conditions",
          ),
        ]),
      ) as unknown as MailActivityFields;
      fields.startAt = normalizeMailTime(fields.startAt);
      fields.endAt = normalizeMailTime(fields.endAt);
      next = correctActivityMail(
        state,
        record.id,
        fields,
        textField(input, "reason", 1000),
      );
    } else if (action === "mail.visibility") {
      next = setMailActivityVisibility(
        state,
        record.id,
        input.publish === true,
        textField(input, "reason", 1000),
      );
      // An unchanged visibility request must return this mail, not the first
      // unrelated record in the shared collection, and must not bump versions.
      if (next === state) return stored;
    } else return undefined;
  }
  const record = next.mailActivities![0];
  record.history = record.history.map((h) =>
    h.actor.startsWith("管理员") ? { ...h, actor: actor.id } : h,
  );
  let stored = repo
    .all("mail")
    .find(
      (e) => (e.data.record as unknown as MailActivityRecord).id === record.id,
    );
  stored = stored
    ? repo.save(stored, { record })
    : repo.create("mail", actor.id, { record, purpose: input.revision === true ? "revision" : "activity" });
  const projected = next.localEvents.find((e) => e.id === record.eventId);
  if (projected) {
    const old = repo.all("activity").find((e) => e.data.mailId === stored.id);
    const data = { ...projected, image: projected.image || "/activity-default-cover.svg", source: "mail", mailId: stored.id };
    if (old) {
      repo.save(old, data);
      if (action === "mail.correct" && old.data.status === "published" &&
        (Date.parse(String(old.data.startAt)) !== Date.parse(data.startAt) ||
         Date.parse(String(old.data.endAt)) !== Date.parse(data.endAt!) ||
         old.data.location !== data.location)) {
        const recipients = repo.db.prepare(
          "SELECT DISTINCT account_id FROM relations WHERE entity_id=? AND kind IN ('participate','save')",
        ).all(old.id).map(row => String(row.account_id));
        repo.notify(recipients, old.id, "activity.changed",
          `活动“${data.title}”的时间或地点已更新，请查看最新安排。`);
      }
    }
    else repo.create("activity", null, data);
  }
  return stored;
}
