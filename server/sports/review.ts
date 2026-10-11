import { demand, type Account } from "../auth";
import {
  Repository,
  enumField,
  textField,
  type Entity,
  type Fields,
} from "../repository";
import { ownedCourse, sportsRole, version } from "./courses";
import { sportsAvailable, visibleRecords } from "./materials";
import { recalculateProgress } from "./progress";

export const reviewReasons = [
  {
    code: "UNCLEAR",
    zh: "材料不清晰",
    en: "Unclear evidence",
    actions: ["RETURN", "INVALID"],
  },
  {
    code: "MISSING",
    zh: "必需材料缺失（含要求的前后照）",
    en: "Missing required evidence",
    actions: ["RETURN", "INVALID"],
  },
  {
    code: "MISMATCH",
    zh: "材料与本次运动不符",
    en: "Evidence does not match this session",
    actions: ["RETURN", "INVALID"],
  },
  {
    code: "INCONSISTENT",
    zh: "材料信息矛盾",
    en: "Inconsistent evidence",
    actions: ["RETURN", "INVALID"],
  },
  {
    code: "AUTHENTICITY",
    zh: "材料真实性待核实",
    en: "Evidence authenticity requires clarification",
    actions: ["RETURN"],
  },
  {
    code: "CONFIRMED_MISUSE",
    zh: "经核实存在重复使用或冒用材料",
    en: "Confirmed reuse or misuse of evidence",
    actions: ["INVALID"],
  },
] as const;
export function completeBatch(repo: Repository, record: Entity) {
  const batch = repo.get(record.data.batchId, "sportsMaterialBatch");
  const materials = repo
    .all("sportsMaterial")
    .filter((m) => m.data.batchId === batch.id);
  demand(
    batch.data.status === "COMPLETE" &&
      materials.length > 0 &&
      materials.every((m) => m.data.status === "COMPLETE"),
    "材料未完整到账，不能审核。",
    409,
  );
  return batch;
}
export function enqueueTeacher(
  repo: Repository,
  record: Entity,
  source: string,
) {
  completeBatch(repo, record);
  const course = repo.get(record.data.courseId, "sportsCourse");
  const rounds = repo
    .all("sportsReviewRound")
    .filter((r) => r.data.recordId === record.id);
  const active = rounds.find((r) => r.data.status === "OPEN");
  if (!active)
    repo.create("sportsReviewRound", course.ownerId, {
      recordId: record.id,
      batchId: record.data.batchId,
      sequence: rounds.length + 1,
      status: "OPEN",
      startedAt: Date.now(),
      calendarVersion: null,
      calculationStatus: "CALENDAR_REQUIRED",
    });
  const saved = repo.save(record, {
    status: "TEACHER_PENDING",
    queueSource: source,
    technicalCode: null,
  });
  repo.create("sportsReviewEvent", null, {
    recordId: record.id,
    batchId: record.data.batchId,
    action: "TEACHER_QUEUED",
    source,
    at: Date.now(),
  });
  repo.notify(
    [record.ownerId!, course.ownerId!],
    record.id,
    "sports.review.queued",
    "运动记录进入责任教师复核，尚未计入进度。",
  );
  return saved;
}
export function manualMode(repo: Repository, courseId: unknown) {
  const now = Date.now();
  return repo
    .all("sportsManualMode")
    .find(
      (m) =>
        m.data.courseId === courseId &&
        m.data.status === "ACTIVE" &&
        Number(m.data.startAt) <= now &&
        now < Number(m.data.endAt),
    );
}
function superAdmin(repo: Repository, actor: Account) {
  sportsRole(repo, actor, "admin");
  demand(actor.roles.includes("superadmin"), "仅总管理员可治理AI服务。", 403);
}
export function sportsReviewCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action === "sports.ai.manual") {
    superAdmin(repo, actor);
    sportsAvailable(repo);
    const course = repo.get(input.courseId, "sportsCourse");
    const endAt = Date.parse(textField(input, "endAt", 80)),
      now = Date.now();
    demand(
      Number.isFinite(endAt) && endAt > now,
      "人工模式结束时间须晚于当前时刻。",
    );
    const mode = repo.create("sportsManualMode", actor.id, {
      courseId: course.id,
      startAt: now,
      endAt,
      reason: textField(input, "reason", 1000),
      status: "ACTIVE",
    });
    repo.notify(
      [course.ownerId!],
      course.id,
      action,
      `本课程启用有限人工审核至${new Date(endAt).toISOString()}：${mode.data.reason}`,
    );
    for (const r of repo
      .all("sportsRecord")
      .filter(
        (r) =>
          r.data.courseId === course.id &&
          ["PENDING_AI", "TECHNICAL"].includes(String(r.data.status)),
      ))
      enqueueTeacher(repo, r, `MANUAL:${mode.id}`);
    return mode;
  }
  if (action === "sports.ai.stop") {
    superAdmin(repo, actor);
    sportsAvailable(repo);
    const mode = repo.get(input.id, "sportsManualMode");
    version(mode, input);
    return repo.save(mode, {
      status: "STOPPED",
      stoppedAt: Date.now(),
      stopReason: textField(input, "reason", 1000),
    });
  }
  if (action === "sports.ai.retry") {
    superAdmin(repo, actor);
    sportsAvailable(repo);
    const record = repo.get(input.id, "sportsRecord");
    version(record, input);
    demand(
      record.data.status === "TECHNICAL",
      "仅技术失败任务可重试，不能覆盖教学结果。",
      409,
    );
    completeBatch(repo, record);
    return repo.save(record, { status: "PENDING_AI", technicalCode: null });
  }
  if (action !== "sports.review.decide") return undefined;
  sportsAvailable(repo);
  const record = repo.get(input.id, "sportsRecord");
  ownedCourse(repo, actor, record.data.courseId);
  version(record, input);
  demand(
    record.data.status === "TEACHER_PENDING",
    "当前记录不在教师待办，不能覆盖已有判断。",
    409,
  );
  const batch = completeBatch(repo, record);
  demand(input.batchId === batch.id, "审核材料版本已变化。", 409);
  demand(input.checksCompleted === true, "须完成规定检查与必要复核后确认。 ");
  const decision = enumField(input, "decision", [
    "PASS",
    "INVALID",
    "RETURN",
  ] as const);
  const reason =
    decision === "PASS"
      ? undefined
      : reviewReasons.find((r) => r.code === input.reason);
  if (decision !== "PASS")
    demand(
      reason && (reason.actions as readonly string[]).includes(decision),
      "请选择适用于本动作的固定公开原因。",
    );
  const publicExplanation = textField(input, "publicExplanation", 1000, true);
  if (decision === "RETURN") {
    demand(
      record.data.supplementUsed !== true,
      "本记录已使用一次补证机会，不能再次退回。",
      409,
    );
    demand(
      input.canSupplementOriginal === true,
      "只能补充原运动材料，不能要求重新运动或事后补拍运动前证据。",
    );
    demand(
      input.hours === 24 || input.hours === 72,
      "补证窗口只能选择24或72小时。",
    );
  }
  const now = Date.now();
  const saved = repo.save(record, {
    status:
      decision === "PASS"
        ? "VALID"
        : decision === "INVALID"
          ? "INVALID"
          : "SUPPLEMENT_REQUIRED",
    publicReason: reason ?? null,
    publicExplanation,
    lastDecisionAt: now,
    ...(decision === "RETURN"
      ? {
          supplementUsed: true,
          supplementStartedAt: now,
          supplementWindowMilliseconds: Number(input.hours) * 3600000,
        }
      : {}),
  });
  for (const round of repo
    .all("sportsReviewRound")
    .filter((r) => r.data.recordId === record.id && r.data.status === "OPEN"))
    repo.save(round, { status: "CLOSED", endedAt: now, decision });
  repo.create("sportsReviewEvent", actor.id, {
    recordId: record.id,
    batchId: batch.id,
    action: decision,
    reason: reason ?? null,
    publicExplanation,
    at: now,
    previousRecordVersion: record.version,
    resultRecordVersion: saved.version,
  });
  recalculateProgress(repo, saved, `TEACHER_${decision}`);
  repo.notify(
    [record.ownerId!],
    record.id,
    action,
    `${decision === "PASS" ? "运动记录审核通过" : decision === "RETURN" ? "运动记录需一次补证" : "运动记录无效"}${reason ? `：${reason.zh}` : ""}${publicExplanation ? `；${publicExplanation}` : ""}`,
  );
  return saved;
}
export function reviewWorkspace(repo: Repository, actor: Account) {
  const records = visibleRecords(repo, actor),
    ids = new Set(records.map((r) => r.id));
  const admin = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "admin" &&
        i.data.status === "verified",
    );
  const progress = repo
    .all("sportsProgress")
    .filter((p) =>
      records.some(
        (r) => r.ownerId === p.ownerId && r.data.courseId === p.data.courseId,
      ),
    );
  const current = progress.filter(
    (p) =>
      !progress.some(
        (q) =>
          q.ownerId === p.ownerId &&
          q.data.courseId === p.data.courseId &&
          Number(q.data.sequence) > Number(p.data.sequence),
      ),
  );
  return {
    canGovernAi: admin && actor.roles.includes("superadmin"),
    reviewReasons,
    reviewEvents: repo
      .all("sportsReviewEvent")
      .filter((e) => ids.has(String(e.data.recordId))),
    reviewRounds: repo
      .all("sportsReviewRound")
      .filter((e) => ids.has(String(e.data.recordId))),
    progress: current,
    manualModes: repo
      .all("sportsManualMode")
      .filter(
        (m) =>
          admin ||
          repo.get(m.data.courseId, "sportsCourse").ownerId === actor.id,
      ),
    technicalTasks: admin
      ? repo
          .all("sportsRecord")
          .filter((r) => r.data.status === "TECHNICAL")
          .map((r) => ({
            id: r.id,
            version: r.version,
            courseId: r.data.courseId,
            technicalCode: r.data.technicalCode,
          }))
      : [],
  };
}
