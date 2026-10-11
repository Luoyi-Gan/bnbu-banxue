import { demand, type Account } from "../auth";
import { Repository, type Entity, type Fields } from "../repository";
import { sportsRole, version } from "./courses";
import { sportsAvailable, validateFiles } from "./materials";
import { enqueueTeacher } from "./review";
import { recalculateProgress } from "./progress";

/** Confirmed exclusions use interval union, never additive overlapping compensation. */
export function supplementClock(
  repo: Repository,
  record: Entity,
  now = Date.now(),
) {
  const start = Number(record.data.supplementStartedAt);
  const window = Number(record.data.supplementWindowMilliseconds);
  const pauses = repo
    .all("sportsPause")
    .filter(
      (p) =>
        p.data.status === "CONFIRMED" &&
        (!p.data.recordId || p.data.recordId === record.id) &&
        (!p.data.courseId || p.data.courseId === record.data.courseId),
    );
  const intervals = pauses
    .map((p) => [
      Math.max(start, Number(p.data.startAt)),
      Math.min(now, p.data.endAt == null ? now : Number(p.data.endAt)),
    ])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .sort((a, b) => a[0] - b[0]);
  let excluded = 0,
    end = start;
  for (const [a, b] of intervals) {
    excluded += Math.max(0, b - Math.max(a, end));
    end = Math.max(end, b);
  }
  const paused =
    repo.all("sportsSystem").some((s) => s.data.mode !== "NORMAL") ||
    pauses.some(
      (p) =>
        Number(p.data.startAt) <= now &&
        (p.data.endAt == null || now < Number(p.data.endAt)),
    );
  const remaining = Math.max(0, window - Math.max(0, now - start - excluded));
  return {
    paused,
    remaining,
    deadline: start + window + excluded,
    canSubmit: !paused && remaining > 0,
  };
}
export function supplementOpen(repo: Repository, record: Entity) {
  demand(
    record.data.status === "SUPPLEMENT_REQUIRED",
    "本记录不在补证阶段。",
    409,
  );
  demand(
    supplementClock(repo, record).canSubmit,
    "补证计时已暂停或期限已结束。",
    409,
  );
  const course = repo.get(record.data.courseId, "sportsCourse");
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      repo.get(record.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "课程已结算或学期已归档。",
    409,
  );
}
export function sportsSupplementCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (
    ![
      "sports.supplement.prepare",
      "sports.supplement.submit",
      "sports.supplement.reset",
    ].includes(action)
  )
    return undefined;
  sportsRole(repo, actor, "student");
  sportsAvailable(repo);
  const record = repo.get(input.id, "sportsRecord");
  demand(record.ownerId === actor.id, "只能补充本人运动材料。", 403);
  version(record, input);
  supplementOpen(repo, record);
  if (action === "sports.supplement.reset") {
    const batch = repo.get(
      record.data.supplementBatchId,
      "sportsMaterialBatch",
    );
    demand(
      ["UPLOADING", "READY"].includes(String(batch.data.status)),
      "正式受理的补证不可撤回或覆盖。",
      409,
    );
    repo.save(batch, { status: "ABANDONED", abandonedAt: Date.now() });
    return repo.save(record, { supplementBatchId: null });
  }
  if (action === "sports.supplement.submit") {
    const batch = repo.get(
      record.data.supplementBatchId,
      "sportsMaterialBatch",
    );
    const files = repo
      .all("sportsMaterial")
      .filter((m) => m.data.batchId === batch.id);
    demand(
      batch.data.status === "READY" &&
        files.length > 0 &&
        files.every((m) => m.data.status === "COMPLETE"),
      "补证材料尚未全部到账，不能正式提交。",
      409,
    );
    const now = Date.now();
    repo.save(batch, { status: "COMPLETE", acceptedAt: now });
    const saved = repo.save(record, {
      batchId: batch.id,
      supplementAcceptedAt: now,
    });
    repo.create("sportsReviewEvent", actor.id, {
      recordId: record.id,
      batchId: batch.id,
      action: "SUPPLEMENT_ACCEPTED",
      at: now,
    });
    return enqueueTeacher(repo, saved, "SUPPLEMENT");
  }
  demand(
    !record.data.supplementBatchId,
    "已有补证包，请续传并提交原补证包。",
    409,
  );
  demand(Array.isArray(input.reuseIds), "请选择需要沿用的原材料。");
  const reuseIds = input.reuseIds as unknown[];
  demand(new Set(reuseIds).size === reuseIds.length, "不能重复引用原材料。");
  const reused = reuseIds.map((id) => {
    const material = repo.get(id, "sportsMaterial");
    demand(
      material.ownerId === actor.id &&
        material.data.recordId === record.id &&
        material.data.batchId === record.data.batchId &&
        material.data.status === "COMPLETE",
      "只能引用本记录已到账原材料。",
      403,
    );
    return material;
  });
  demand(Array.isArray(input.files), "补证文件清单无效。");
  const files = validateFiles([
    ...reused.map((m) => ({
      clientId: `reuse:${m.id}`,
      mime: m.data.mime,
      size: m.data.size,
      sha256: m.data.sha256,
    })),
    ...input.files,
  ]);
  const batch = repo.create("sportsMaterialBatch", actor.id, {
    recordId: record.id,
    sessionId: record.data.sessionId,
    sequence: 2,
    status: files.length === reused.length ? "READY" : "UPLOADING",
    preparedAt: Date.now(),
  });
  for (const [index, file] of files.entries()) {
    const source = reused[index];
    repo.create("sportsMaterial", actor.id, {
      ...file,
      recordId: record.id,
      batchId: batch.id,
      sessionId: record.data.sessionId,
      status: source ? "COMPLETE" : "PENDING",
      ...(source
        ? {
            sourceMaterialId: source.id,
            metadata: source.data.metadata,
            completedAt: source.data.completedAt,
          }
        : {}),
    });
  }
  return repo.save(record, { supplementBatchId: batch.id });
}
export function expireSupplements(repo: Repository) {
  for (const record of repo
    .all("sportsRecord")
    .filter((r) => r.data.status === "SUPPLEMENT_REQUIRED")) {
    const clock = supplementClock(repo, record);
    if (clock.paused || clock.remaining > 0) continue;
    const reason = {
      code: "SUPPLEMENT_EXPIRED",
      zh: "补证逾期",
      en: "Supplementary evidence deadline missed",
    };
    const saved = repo.save(record, {
      status: "INVALID",
      publicReason: reason,
      publicExplanation: "",
      lastDecisionAt: Date.now(),
      supplementFinalDeadline: clock.deadline,
    });
    repo.create("sportsReviewEvent", null, {
      recordId: record.id,
      action: "SUPPLEMENT_EXPIRED",
      at: Date.now(),
      reason,
      deadline: clock.deadline,
    });
    recalculateProgress(repo, saved, "SUPPLEMENT_EXPIRED");
    repo.notify(
      [record.ownerId!],
      record.id,
      "sports.supplement.expired",
      "补证逾期：最终截止前未正式提交完整补证包，本记录无效。",
    );
  }
}
