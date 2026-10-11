import { initialV2State } from "../src/v2/model";
import {
  correctActivityMail,
  importActivityMail,
  setMailActivityVisibility,
  type MailActivityRecord,
} from "../src/v2/mailActivityPolicy";
import {
  mailFieldLabels,
  type MailActivityFields,
} from "../src/v2/mailActivityAdapter";
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
      .find((c) => c.ownerId === actor.id && c.data.kind === "club")?.data
      .status === "approved";
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
    const duplicate = records.find(
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
    // Coverless automatic publication has not been authorized in BUSINESS_RULES.
    if (!source.cover && next.mailActivities?.[0]?.status === "published") {
      const record = next.mailActivities[0];
      record.status = "pending";
      record.extraction.issues.push("缺少封面，自动发布策略待确认");
      record.history[0].action = "待核实";
      record.history[0].reason = record.extraction.issues.join("；");
      next.localEvents = [];
    }
  } else {
    const stored = repo.get(input.id, "mail"),
      record = stored.data.record as unknown as MailActivityRecord;
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
      demand(
        record.source.cover,
        "无封面发布规则待确认；请提供活动相关封面后处理。",
      );
      next = correctActivityMail(
        state,
        record.id,
        fields,
        textField(input, "reason", 1000),
      );
    } else if (action === "mail.visibility")
      next = setMailActivityVisibility(
        state,
        record.id,
        input.publish === true,
        textField(input, "reason", 1000),
      );
    else return undefined;
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
    : repo.create("mail", actor.id, { record });
  const projected = next.localEvents.find((e) => e.id === record.eventId);
  if (projected) {
    const old = repo.all("activity").find((e) => e.data.mailId === stored.id);
    const data = { ...projected, source: "mail", mailId: stored.id };
    if (old) repo.save(old, data);
    else repo.create("activity", null, data);
  }
  return stored;
}
