import { demand, type Account } from "../auth";
import { Repository, textField, type Entity, type Fields } from "../repository";
import { sportsRole, version } from "./courses";
import { supplementClock } from "./supplements";
import { recalculateProgress } from "./progress";

function governor(repo: Repository, actor: Account) {
  sportsRole(repo, actor, "admin");
  demand(
    actor.roles.includes("superadmin"),
    "仅总管理员可确认平台事故和技术纠错。",
    403,
  );
}
export function sportsIncidentCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (!["sports.incident.confirm", "sports.incident.restore"].includes(action))
    return undefined;
  governor(repo, actor);
  if (action === "sports.incident.confirm") {
    const reference = textField(input, "reference", 200),
      evidenceRef = textField(input, "evidenceRef", 2000),
      reason = textField(input, "reason", 1000);
    demand(
      !repo.all("sportsIncident").some((i) => i.data.reference === reference),
      "此事故引用已确认，请使用原事故，不能重复补偿。",
      409,
    );
    const startAt = Date.parse(textField(input, "startAt", 80)),
      endAt = Date.parse(textField(input, "endAt", 80));
    demand(
      Number.isFinite(startAt) &&
        Number.isFinite(endAt) &&
        startAt < endAt &&
        endAt <= Date.now(),
      "须填写已经确认的实际不可用起止时刻，不能预补偿未来时间。",
    );
    const ids = textField(input, "recordIdsText", 40000)
      .split(/[\s,]+/)
      .filter(Boolean);
    demand(
      ids.length > 0 && ids.length <= 500 && new Set(ids).size === ids.length,
      "须明确1–500条受影响记录，不能重复。",
    );
    const records = ids.map((id) => repo.get(id, "sportsRecord"));
    const incident = repo.create("sportsIncident", actor.id, {
      reference,
      evidenceRef,
      reason,
      startAt,
      endAt,
      recordIds: ids,
      status: "CONFIRMED",
      confirmedAt: Date.now(),
    });
    for (const record of records) {
      const before = record.data.supplementStartedAt
        ? supplementClock(repo, record)
        : null;
      repo.create("sportsPause", actor.id, {
        status: "CONFIRMED",
        source: "INCIDENT",
        incidentId: incident.id,
        recordId: record.id,
        startAt,
        endAt,
      });
      const after = record.data.supplementStartedAt
        ? supplementClock(repo, record)
        : null;
      repo.create("sportsDeadlineAdjustment", actor.id, {
        recordId: record.id,
        incidentId: incident.id,
        reason,
        before,
        after,
        at: Date.now(),
      });
      repo.notify(
        [
          record.ownerId!,
          repo.get(record.data.courseId, "sportsCourse").ownerId!,
        ],
        record.id,
        action,
        `已确认平台不可用区间，计时按重叠时段去重调整。事故引用：${reference}。已有教学结果保持原状；错误逾期须另行核对纠错。`,
      );
    }
    return incident;
  }
  const record = repo.get(input.id, "sportsRecord");
  version(record, input);
  const incident = repo.get(input.incidentId, "sportsIncident"),
    terminal = repo.get(input.terminalEventId, "sportsReviewEvent");
  demand(
    incident.data.status === "CONFIRMED" &&
      (incident.data.recordIds as string[]).includes(record.id),
    "事故未确认或不包含本记录。",
    409,
  );
  demand(
    terminal.data.recordId === record.id &&
      terminal.data.action === "SUPPLEMENT_EXPIRED" &&
      terminal.data.resultRecordVersion === record.version &&
      record.data.status === "INVALID" &&
      record.data.lastDecisionAt === terminal.data.at,
    "原错误终局版本不再是当前状态，须定向复核，不能覆盖合法后继。",
    409,
  );
  const course = repo.get(record.data.courseId, "sportsCourse"),
    semester = repo.get(record.data.semesterId, "sportsSemester");
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      semester.data.status !== "ARCHIVED",
    "已有结算或归档后继，须定向复核，不能直接恢复入口。",
    409,
  );
  const round = repo.get(input.roundId, "sportsReviewRound");
  demand(
    round.version === input.roundVersion &&
      round.data.recordId === record.id &&
      round.data.status === "CLOSED" &&
      round.data.decision === "RETURN",
    "原退回轮次版本已变化，须定向复核。",
    409,
  );
  demand(
    record.data.supplementUsed === true && !record.data.supplementAcceptedAt,
    "原补证机会状态不符，不能另发机会。",
    409,
  );
  const terminalAt = Number(terminal.data.at),
    start = Number(record.data.supplementStartedAt);
  demand(
    Number(incident.data.startAt) < terminalAt &&
      Number(incident.data.endAt) > start,
    "所选事故不影响本次补证计时。",
    409,
  );
  const owed = supplementClock(repo, record, terminalAt);
  demand(owed.remaining > 0, "核对后属于真实逾期，没有可恢复的剩余时间。", 409);
  const key = `SUPPLEMENT_EXPIRY:${terminal.id}`;
  demand(
    !repo.all("sportsCorrection").some((c) => c.data.businessKey === key),
    "此终局已执行纠错，请查看后继事实。",
    409,
  );
  const reason = textField(input, "reason", 1000),
    now = Date.now();
  repo.create("sportsPause", actor.id, {
    status: "CONFIRMED",
    source: "WRONG_TERMINAL_LOCK",
    incidentId: incident.id,
    recordId: record.id,
    terminalEventId: terminal.id,
    startAt: terminalAt,
    endAt: now,
  });
  const restored = repo.save(record, {
    status: "SUPPLEMENT_REQUIRED",
    publicReason: terminal.data.previousPublicReason ?? null,
    publicExplanation: terminal.data.previousPublicExplanation ?? "",
    restoredAt: now,
  });
  const after = supplementClock(repo, restored, now);
  repo.create("sportsDeadlineAdjustment", actor.id, {
    recordId: record.id,
    incidentId: incident.id,
    reason,
    before: { deadline: terminal.data.deadline },
    after,
    at: now,
    source: "WRONG_TERMINAL_LOCK",
  });
  const correction = repo.create("sportsCorrection", actor.id, {
    businessKey: key,
    recordId: record.id,
    incidentId: incident.id,
    terminalEventId: terminal.id,
    roundId: round.id,
    roundVersion: round.version,
    previousRecordVersion: record.version,
    resultRecordVersion: restored.version,
    reason,
    at: now,
    remainingMilliseconds: after.remaining,
    deadline: after.deadline,
  });
  repo.create("sportsReviewEvent", actor.id, {
    recordId: record.id,
    action: "PLATFORM_EXPIRY_CORRECTED",
    incidentId: incident.id,
    correctionId: correction.id,
    terminalEventId: terminal.id,
    reason,
    at: now,
    remainingMilliseconds: after.remaining,
  });
  recalculateProgress(repo, restored, "PLATFORM_EXPIRY_CORRECTED");
  repo.notify(
    [record.ownerId!, course.ownerId!],
    record.id,
    action,
    `平台事故错误逾期已纠正，仅恢复原补证剩余${Math.ceil(after.remaining / 60000)}分钟；一次补证标记及原历史保留。原因：${reason}`,
  );
  return restored;
}
export function incidentWorkspace(repo: Repository, actor: Account) {
  const canManageIncidents =
    actor.status !== "banned" &&
    actor.roles.includes("superadmin") &&
    repo
      .all("sportsIdentity")
      .some(
        (i) =>
          i.ownerId === actor.id &&
          i.data.role === "admin" &&
          i.data.status === "verified",
      );
  return {
    canManageIncidents,
    incidents: canManageIncidents ? repo.all("sportsIncident") : [],
    corrections: canManageIncidents ? repo.all("sportsCorrection") : [],
    expiryCandidates: canManageIncidents
      ? repo
          .all("sportsReviewEvent")
          .filter((e) => e.data.action === "SUPPLEMENT_EXPIRED")
          .flatMap((e) => {
            const record = repo.get(e.data.recordId, "sportsRecord");
            if (
              record.data.status !== "INVALID" ||
              record.version !== e.data.resultRecordVersion
            )
              return [];
            const round = repo
              .all("sportsReviewRound")
              .filter(
                (r) =>
                  r.data.recordId === record.id && r.data.decision === "RETURN",
              )
              .sort(
                (a, b) => Number(b.data.sequence) - Number(a.data.sequence),
              )[0];
            return round
              ? [
                  {
                    id: record.id,
                    version: record.version,
                    courseId: record.data.courseId,
                    terminalEventId: e.id,
                    terminalAt: e.data.at,
                    roundId: round.id,
                    roundVersion: round.version,
                  },
                ]
              : [];
          })
      : [],
  };
}
