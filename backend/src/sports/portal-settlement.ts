import { authenticate, demand, type Account } from "../auth";
import { Repository, type Fields } from "../repository";
import type { Database } from "../database";
import { execute } from "../commands";
import { ownedCourse } from "./courses";
import { settlementCheck } from "./settlement";

export function portalSettlementConfirm(
  db: Database,
  token: string,
  courseId: string,
  input: Fields,
  key: string,
) {
  demand(
    Object.keys(input).every((k) =>
      ["expectedVersion", "previewFingerprint"].includes(k),
    ),
    "结算确认不接受客户端报告内容。",
  );
  const repo = new Repository(db);
  ownedCourse(repo, authenticate(db, token), courseId);
  const result = execute(
    db,
    token,
    "sports.settlement.finalize",
    { id: courseId, ...input },
    key,
  ) as { id: string };
  const report = repo.get(result.id, "sportsSettlementReport");
  return {
    id: report.id,
    version: report.data.sequence,
    kind: "INITIAL",
    createdAt: report.createdAt,
    correctionReason: null,
  };
}

// Translate only equivalent checks; retain other blockers so none disappear.
const codes: Record<string, string> = {
  COURSE_NOT_PUBLISHED: "PUBLISHED_COURSE_RULE",
  NO_CONFIRMED_ROSTER: "CONFIRMED_OFFICIAL_ROSTER",
  ROSTER_INCOMPLETE: "ROSTER_REGISTRATION_INCOMPLETE",
  ROSTER_OUTSIDE: "ROSTER_PENDING_DIFFERENCE",
  APPLICATION_PENDING: "PENDING_APPLICATION",
  OPEN_SESSION: "ACTIVE_SESSION",
  FIRST_MATERIAL_PENDING: "UNSUBMITTED_RECORD",
  ENDURANCE_NOT_RECORDED: "RAW_PHYSICAL_RESULTS",
  ENDURANCE_IMPORT: "PHYSICAL_IMPORT_PENDING",
};

export function portalSettlementPreview(
  repo: Repository,
  actor: Account,
  courseId: string,
) {
  return portalSettlementPreviewData(settlementCheck(repo, actor, courseId));
}
export function portalSettlementPreviewData(check:ReturnType<typeof settlementCheck>) {
  const counts = new Map<string, number>();
  for (const blocker of check.blockers) {
    const code = codes[blocker.code] ?? blocker.code;
    counts.set(code, (counts.get(code) ?? 0) + blocker.count);
  }
  const checks = [...counts].map(([code, count]) => ({
    code,
    status: "BLOCKED",
    count,
  }));
  const rows = check.report.rows.map((row) => ({
    id:
      row.source === "SCHOOL"
        ? `${check.report.snapshotId}:${row.sourceRow}`
        : row.enrollmentId!,
    studentNumber: row.studentNumber || null,
    fullName: row.name || null,
    status:
      row.registration === "COMPLETE"
        ? "MATCHED"
        : row.registration === "CONFLICT"
          ? "IDENTITY_CONFLICT"
          : row.source === "MEMBER"
            ? row.registration === "NO_ROSTER"
              ? "NO_ROSTER"
              : "EXTRA_IN_PLATFORM"
            : "PENDING_REGISTRATION",
    // No complete per-student task projection exists yet. Do not claim zero.
    pendingCount: check.blockers.length ? null : 0,
  }));
  return {
    previewFingerprint: check.manifest.hash,
    expectedVersion: 0,
    canConfirm: check.blockers.length === 0,
    checkedAt: new Date(check.checkedAt).toISOString(),
    checks,
    preview: {
      denominator: check.report.denominator,
      registrationComplete:
        check.report.snapshotId !== null &&
        check.report.denominator !== null &&
        check.report.rows
          .filter((row) => row.source === "SCHOOL")
          .every((row) => row.registration === "COMPLETE"),
      rows: rows.filter(
        (_, index) => check.report.rows[index].source === "SCHOOL",
      ),
      extras: rows.filter(
        (_, index) => check.report.rows[index].source === "MEMBER",
      ),
    },
  };
}
