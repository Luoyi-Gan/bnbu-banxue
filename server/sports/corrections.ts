import { createHash } from "node:crypto";
import { demand, type Account } from "../auth";
import {
  Repository,
  textField,
  integerField,
  enumField,
  type Fields,
} from "../repository";
import { ownedCourse, version } from "./courses";
import { sportsGradeCommand } from "./grades";
import { sportsEnduranceCommand } from "./endurance";
import { sourceManifest } from "./settlement";
import type { CourseReport } from "./report";
/** Only this command grants the internal historical-write path, under execute's transaction. */
export function sportsCorrectionCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (action !== "sports.correction.apply") return undefined;
  const kind = enumField(input, "kind", ["GRADE", "ENDURANCE"] as const);
  demand(
    Object.keys(input).every((k) =>
      [
        "kind",
        "id",
        "version",
        "previousReportId",
        "reason",
        "confirmed",
        ...(kind === "GRADE" ? ["score"] : ["event", "seconds", "testDate"]),
      ].includes(k),
    ),
    "更正只接受指定旧事实字段，不接受新成员、统计或备注。",
  );
  demand(input.confirmed === true, "请确认原始依据和历史更正原因。");
  const original = repo.get(
    input.id,
    kind === "GRADE" ? "sportsGradePublication" : "sportsEndurance",
  );
  version(original, input);
  const course = ownedCourse(repo, actor, original.data.courseId);
  demand(
    course.data.settlementStatus === "SETTLED",
    "未结算事实请使用原核对流程。",
    409,
  );
  demand(
    course.data.settlementReportId === input.previousReportId,
    "当前报告已有后继，请重新核对。",
    409,
  );
  const previous = repo.get(input.previousReportId, "sportsSettlementReport");
  demand(previous.data.courseId === course.id, "报告不属于原课程。", 403);
  const oldManifest = previous.data.sourceManifest as {
    membershipIds: string[];
  };
  const manifest = sourceManifest(repo, course);
  demand(
    JSON.stringify(oldManifest.membershipIds) ===
      JSON.stringify(manifest.membershipIds),
    "原结算成员集合已变化，须定向复核，不能扩大更正范围。",
    409,
  );
  demand(
    oldManifest.membershipIds.includes(String(original.data.enrollmentId)),
    "原事实不属于冻结报告成员范围。",
    409,
  );
  const reason = textField(input, "reason", 1000);
  demand(
    (previous.data.report as CourseReport).rows.some(
      (r) => r.enrollmentId === original.data.enrollmentId,
    ),
    "冻结报告没有对应成员行，须定向复核。",
    409,
  );
  let result;
  if (kind === "GRADE") {
    const latest = repo
      .all("sportsGradePublication")
      .filter((p) => p.data.enrollmentId === original.data.enrollmentId)
      .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence))[0];
    demand(
      latest?.id === original.id,
      "成绩已有合法后继，不能覆盖旧版本。",
      409,
    );
    const score = integerField(input, "score", -2147483648, 2147483647);
    demand(score !== original.data.score, "成绩事实未变化。", 409);
    const draft = repo
      .all("sportsGradeDraft")
      .find((d) => d.data.enrollmentId === original.data.enrollmentId);
    demand(
      !draft || draft.data.status !== "DRAFT",
      "已有未发布成绩更正，须先处理冲突。",
      409,
    );
    const saved = sportsGradeCommand(
      repo,
      actor,
      "sports.grade.save",
      {
        enrollmentId: original.data.enrollmentId,
        version: draft?.version ?? 0,
        score,
      },
      true,
    )!;
    result = sportsGradeCommand(
      repo,
      actor,
      "sports.grade.publish",
      { id: saved.id, version: saved.version },
      true,
    )!;
  } else
    result = sportsEnduranceCommand(
      repo,
      actor,
      "sports.endurance.confirm",
      {
        enrollmentId: original.data.enrollmentId,
        version: original.version,
        event: input.event,
        seconds: input.seconds,
        testDate: input.testDate,
        confirmed: true,
      },
      [],
      true,
    )!;
  const oldReport = previous.data.report as CourseReport;
  const rows = oldReport.rows.map((row) => {
    if (kind !== "ENDURANCE" || row.enrollmentId !== original.data.enrollmentId)
      return row;
    demand(row.facts, "冻结行缺少原始统计，不能补造。", 409);
    return {
      ...row,
      facts: {
        ...row.facts,
        enduranceStatus: "RECORDED",
        endurance: {
          event: result.data.event,
          seconds: result.data.seconds,
          testDate: result.data.testDate,
        },
      },
    };
  });
  const report = { ...oldReport, generatedAt: new Date().toISOString(), rows };
  const correction = repo.create("sportsHistoricalCorrection", actor.id, {
    courseId: course.id,
    kind,
    originalId: original.id,
    originalVersion: original.version,
    resultId: result.id,
    resultVersion: result.version,
    previousReportId: previous.id,
    reason,
    at: Date.now(),
  });
  const saved = repo.create("sportsSettlementReport", actor.id, {
    courseId: course.id,
    semesterId: course.data.semesterId,
    sequence: Number(previous.data.sequence) + 1,
    previousId: previous.id,
    correctionId: correction.id,
    correctionReason: reason,
    sourceManifest: sourceManifest(repo, course),
    report,
    contentHash: createHash("sha256")
      .update(JSON.stringify(report))
      .digest("hex"),
    confirmedAt: Date.now(),
  });
  repo.save(course, { settlementReportId: saved.id });
  // No score, conversion, free-form correction reason or internal grade object enters a student notice.
  repo.notify(
    [original.ownerId!],
    saved.id,
    action,
    "本人相关历史事实已更正，结算报告新增版本；原报告继续保留。",
  );
  return saved;
}
