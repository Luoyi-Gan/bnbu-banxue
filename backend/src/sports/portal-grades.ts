import { authenticate, demand, type Account } from "../auth";
import { execute } from "../commands";
import type { Database } from "../database";
import { integerField, Repository, type Fields } from "../repository";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";

export function portalPhysicalCorrection(
  db: Database,
  token: string,
  enrollmentId: string,
  input: Fields,
  key: string,
) {
  demand(
    Object.keys(input).every((field) =>
      [
        "expectedVersion",
        "runType",
        "elapsedSeconds",
        "testedOn",
        "correctionReason",
      ].includes(field),
    ),
    "体测更正参数无效。",
  );
  const repo = new Repository(db),
    member = repo.get(enrollmentId, "sportsEnrollment");
  ownedCourse(repo, authenticate(db, token), member.data.courseId);
  const result = execute(
    db,
    token,
    "sports.physical.correct",
    { ...input, enrollmentId },
    key,
  ) as { id: string };
  const report = repo.get(result.id, "sportsSettlementReport");
  const correction = repo.get(
    report.data.correctionId,
    "sportsHistoricalCorrection",
  );
  const history = repo
    .all("sportsEnduranceRevision")
    .find(
      (row) =>
        row.data.recordId === correction.data.resultId &&
        row.data.recordVersion === correction.data.resultVersion,
    );
  demand(history, "体测更正历史不完整。", 409);
  return {
    version: history.data.recordVersion,
    runType: history.data.event === 800 ? "800m" : "1000m",
    elapsedSeconds: history.data.seconds,
    testedOn: history.data.testDate,
    createdAt: history.createdAt,
  };
}

export function portalPhysicalWrite(
  db: Database,
  token: string,
  enrollmentId: string,
  input: Fields,
  key: string,
) {
  demand(
    Object.keys(input).every((field) =>
      ["expectedVersion", "runType", "elapsedSeconds", "testedOn"].includes(
        field,
      ),
    ),
    "体测录入只接受实际项目、用时和测试日期。",
  );
  demand(
    input.runType === "800m" || input.runType === "1000m",
    "体测项目无效。",
  );
  const repo = new Repository(db),
    actor = authenticate(db, token),
    member = repo.get(enrollmentId, "sportsEnrollment");
  ownedCourse(repo, actor, member.data.courseId);
  const result = execute(
    db,
    token,
    "sports.endurance.confirm",
    {
      enrollmentId,
      version: input.expectedVersion,
      event: input.runType === "800m" ? 800 : 1000,
      seconds: input.elapsedSeconds,
      testDate: input.testedOn,
      confirmed: true,
    },
    key,
  ) as { id: string };
  const revision = repo
    .all("sportsEnduranceRevision")
    .find(
      (row) =>
        row.data.recordId === result.id &&
        row.data.recordVersion === Number(input.expectedVersion) + 1,
    );
  demand(revision, "原始体测保存历史不完整。", 409);
  return {
    version: revision.data.recordVersion,
    runType: revision.data.event === 800 ? "800m" : "1000m",
    elapsedSeconds: revision.data.seconds,
    testedOn: revision.data.testDate,
    createdAt: revision.createdAt,
  };
}

export function portalSettlementReports(
  repo: Pick<Repository, 'all' | 'get'>,
  actor: Account,
  courseId: string,
  input: Fields,
) {
  const course = ownedCourse(repo, actor, courseId);
  sportsWriteGate(repo, "sports.report.read");
  demand(
    Object.keys(input).every((key) => ["limit", "beforeVersion"].includes(key)),
    "结算报告查询参数无效。",
  );
  const limit =
    input.limit === undefined
      ? 20
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const before =
    input.beforeVersion === undefined
      ? Number.MAX_SAFE_INTEGER
      : integerField(
          { value: Number(input.beforeVersion) },
          "value",
          1,
          Number.MAX_SAFE_INTEGER,
        );
  const reports = repo
    .all("sportsSettlementReport")
    .filter((report) => report.data.courseId === course.id)
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence));
  demand(
    course.data.settlementStatus !== "SETTLED" ||
      (reports.length > 0 && reports[0].id === course.data.settlementReportId),
    "课程已结算，但报告记录不完整，须先核对。",
    409,
  );
  demand(
    reports.every(
      (report) =>
        Number.isSafeInteger(report.data.sequence) &&
        Number(report.data.sequence) > 0,
    ) &&
      new Set(reports.map((report) => report.data.sequence)).size ===
        reports.length,
    "结算报告版本不完整，须先核对。",
    409,
  );
  const remaining = reports.filter(
    (report) => Number(report.data.sequence) < before,
  );
  const items = remaining.slice(0, limit).map((report) => ({
    id: report.id,
    version: Number(report.data.sequence),
    kind: report.data.previousId ? "CORRECTION" : "INITIAL",
    createdAt: report.createdAt,
    correctionReason: report.data.correctionReason ?? null,
  }));
  return {
    items,
    nextBeforeVersion: remaining.length > limit ? items.at(-1)!.version : null,
  };
}

export function portalFinalGradeWrite(
  db: Database,
  token: string,
  enrollmentId: string,
  input: Fields,
  key: string,
  correction = false,
) {
  demand(
    Object.keys(input).every((field) =>
      [
        "finalGrade",
        "published",
        "expectedVersion",
        ...(correction ? ["correctionReason"] : []),
      ].includes(field),
    ),
    "最终成绩不接受备注或其他附加字段。",
  );
  const repo = new Repository(db),
    actor = authenticate(db, token),
    member = repo.get(enrollmentId, "sportsEnrollment");
  ownedCourse(repo, actor, member.data.courseId);
  const result = execute(
    db,
    token,
    correction ? "sports.grade.correct" : "sports.grade.append",
    correction
      ? { ...input, enrollmentId }
      : {
          enrollmentId,
          version: input.expectedVersion,
          score: input.finalGrade,
          published: input.published,
        },
    key,
  ) as { id: string };
  let saved = repo.get(result.id);
  if (saved.kind === "sportsSettlementReport") {
    const change = repo.get(
      saved.data.correctionId,
      "sportsHistoricalCorrection",
    );
    saved = repo.get(change.data.resultId, "sportsGradePublication");
  }
  const published = saved.kind === "sportsGradePublication";
  demand(
    published || saved.kind === "sportsGradeHistory",
    "成绩提交回执无效。",
    409,
  );
  return {
    enrollmentId,
    version: published
      ? Number(saved.data.draftVersion) + 1
      : Number(saved.data.resultVersion),
    finalGrade: saved.data.score,
    published,
    createdAt: saved.createdAt,
  };
}

export function portalGradeHistory(
  repo: Repository,
  actor: Account,
  enrollmentId: string,
  kind: "physical-results" | "final-grades",
  input: Fields,
) {
  const member = repo.get(enrollmentId, "sportsEnrollment");
  ownedCourse(repo, actor, member.data.courseId);
  sportsWriteGate(repo, "sports.course.read");
  return gradeHistoryProjection(repo,enrollmentId,kind,input);
}
export function gradeHistoryProjection(repo:Pick<Repository,"all">,enrollmentId:string,kind:"physical-results"|"final-grades",input:Fields) {
  demand(
    Object.keys(input).every((key) => ["limit", "beforeVersion"].includes(key)),
    "成绩历史查询参数无效。",
  );
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const before =
    input.beforeVersion === undefined
      ? Number.MAX_SAFE_INTEGER
      : integerField(
          { value: Number(input.beforeVersion) },
          "value",
          1,
          Number.MAX_SAFE_INTEGER,
        );
  const select = (entityKind: string) =>
    repo.all(entityKind).filter((row) => row.data.enrollmentId === enrollmentId);
  const rows =
    kind === "physical-results"
      ? select("sportsEnduranceRevision").map((row) => ({
          version: Number(row.data.recordVersion),
          runType: row.data.event === 800 ? "800m" : "1000m",
          elapsedSeconds: row.data.seconds,
          testedOn: row.data.testDate,
          createdAt: row.createdAt,
        }))
      : [
          ...select("sportsGradeHistory").map((row) => ({
            enrollmentId,
            version: Number(row.data.resultVersion),
            finalGrade: row.data.score,
            published: false,
            createdAt: row.createdAt,
          })),
          ...select("sportsGradePublication").map((row) => ({
            enrollmentId,
            version: Number(row.data.draftVersion) + 1,
            finalGrade: row.data.score,
            published: true,
            createdAt: row.createdAt,
          })),
        ];
  demand(
    rows.every((row) => Number.isSafeInteger(row.version) && row.version > 0) &&
      new Set(rows.map((row) => row.version)).size === rows.length,
    "成绩历史版本不完整，须先核对。",
    409,
  );
  rows.sort((a, b) => b.version - a.version);
  const page = rows.filter((row) => row.version < before),
    items = page.slice(0, limit);
  return {
    items,
    nextBeforeVersion: page.length > limit ? items.at(-1)!.version : null,
  };
}
