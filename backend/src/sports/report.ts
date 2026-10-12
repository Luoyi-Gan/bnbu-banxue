import { type Account } from "../auth";
import { Repository, type Entity, type Fields } from "../repository";
import { ownedCourse } from "./courses";
import { calculateProgress } from "./progress";
import { reconcileRosterData } from "./roster";
import { sportsWriteGate } from "./system";
import type { SportsClock } from "./session-clock";
import { approvedExemption } from "./applications";
import type { CourseReport } from '../../../shared/live/courseReport';
export type { CourseReport } from '../../../shared/live/courseReport';

/** Current teaching report, never a settlement publication or student-facing grade export. */
export function courseReport(
  repo: Repository,
  actor: Account,
  courseId: string,
) {
  sportsWriteGate(repo, "sports.report.read");
  const course = ownedCourse(repo, actor, courseId);
  return buildCourseReport(repo, course);
}
/** Shared read-only source projection for authorized readers and server reminders. */
export function buildCourseReport(repo: Repository, course: Entity): CourseReport {
  return buildCourseReportData(repo, course, id => repo.db.prepare("SELECT name,email FROM accounts WHERE id=?").get(id));
}
export function buildCourseReportData(
  repo: Pick<Repository, "all" | "get">,
  course: Entity,
  personById: (id: string) => Fields | undefined,
): CourseReport {
  const courseId = course.id;
  const now = Date.now();
  const cache = new Map<string, Entity[]>();
  const inCourse = (kind: string) => {
    if (!cache.has(kind))
      cache.set(
        kind,
        repo.all(kind).filter((e) => e.data.courseId === courseId),
      );
    return cache.get(kind)!;
  };
  const members = inCourse("sportsEnrollment"),
    records = inCourse("sportsRecord"),
    sessions = inCourse("sportsSession");
  const basis = inCourse("sportsRosterBasis")[0];
  const snapshot = basis
    ? repo.get(basis.data.snapshotId, "sportsRosterSnapshot")
    : undefined;
  const check = snapshot ? reconcileRosterData(repo, snapshot, personById) : undefined;
  const identities = repo
    .all("sportsIdentity")
    .filter((i) => i.data.role === "student" && i.data.status === "verified");
  const unresolved: { code: string; count: number }[] = [];
  const add = (code: string, count: number) => {
    if (count) unresolved.push({ code, count });
  };
  if (!snapshot) add("NO_CONFIRMED_ROSTER", 1);
  add("ROSTER_INCOMPLETE", check?.incompleteCount ?? 0);
  add("ROSTER_OUTSIDE", check?.outside.length ?? 0);
  add(
    "APPLICATION_PENDING",
    inCourse("sportsApplication").filter((a) =>
      ["SUBMITTED", "SUPPLEMENT_REQUIRED"].includes(String(a.data.status)),
    ).length,
  );
  add(
    "ROSTER_DRAFT",
    inCourse("sportsRosterDraft").filter((e) => e.data.status === "DRAFT")
      .length,
  );
  add(
    "ROSTER_SOURCE",
    inCourse("sportsRosterSource").filter(
      (s) =>
        !inCourse("sportsRosterDraft").some((d) => d.data.sourceId === s.id),
    ).length,
  );
  add(
    "ENDURANCE_IMPORT",
    inCourse("sportsEnduranceImport").filter(
      (e) => e.data.status !== "COMPLETE",
    ).length,
  );
  add(
    "ENDURANCE_SOURCE",
    inCourse("sportsEnduranceSource").filter(
      (s) =>
        !inCourse("sportsEnduranceImport").some(
          (d) => d.data.sourceId === s.id,
        ),
    ).length,
  );
  const facts = (ownerId: string | null) => {
    if (!ownerId) return null;
    const ownRecords = records.filter((r) => r.ownerId === ownerId),
      ownSessions = sessions.filter((s) => s.ownerId === ownerId);
    const pendingRecords = ownRecords.filter(
      (r) => !["VALID", "INVALID"].includes(String(r.data.status)),
    );
    const openSessions = ownSessions.filter(
      (s) => (s.data.clock as unknown as SportsClock).state !== "ENDED",
    );
    const awaitingMaterials = ownSessions.filter(
      (s) =>
        (s.data.clock as unknown as SportsClock).state === "ENDED" &&
        !ownRecords.some((r) => r.data.sessionId === s.id) &&
        now <
          Number((s.data.clock as unknown as SportsClock).endedAt) + 86400000,
    );
    const progress = calculateProgress(repo, courseId, ownerId);
    const exempt = approvedExemption(repo, ownerId, courseId);
    const endurance = exempt
      ? undefined
      : inCourse("sportsEndurance").find((e) => e.ownerId === ownerId);
    const actualMinutes = ownSessions
      .filter((s) => (s.data.clock as unknown as SportsClock).state === "ENDED")
      .reduce(
        (n, s) =>
          n +
          Math.floor(
            (s.data.clock as unknown as SportsClock).activeMilliseconds / 60000,
          ),
        0,
      );
    return {
      enduranceStatus: exempt
        ? "EXEMPT"
        : endurance
          ? "RECORDED"
          : "NOT_RECORDED",
      endurance: endurance
        ? {
            event: endurance.data.event,
            seconds: endurance.data.seconds,
            testDate: endurance.data.testDate,
          }
        : null,
      actualMinutes,
      invalidMinutes: ownRecords
        .filter((r) => r.data.status === "INVALID")
        .reduce(
          (n, r) => n + Math.floor(Number(r.data.activeMilliseconds) / 60000),
          0,
        ),
      validUncountedMinutes: progress.details
        .filter((d) => d.status === "VALID")
        .reduce((n, d) => n + d.eligible - d.actual, 0),
      categoryTotals: progress.categoryTotals,
      targets: [
        Number(course.data.relatedTarget),
        Number(course.data.otherTarget),
      ],
      remaining: [
        Math.max(
          0,
          Number(course.data.relatedTarget) - progress.categoryTotals[0],
        ),
        Math.max(
          0,
          Number(course.data.otherTarget) - progress.categoryTotals[1],
        ),
      ],
      total: progress.total,
      met:
        progress.total >=
        Number(course.data.relatedTarget) + Number(course.data.otherTarget),
      pendingRecords: pendingRecords.length,
      openSessions: openSessions.length,
      awaitingMaterials: awaitingMaterials.length,
      expiredWithoutMaterials: ownSessions.filter(
        (s) =>
          (s.data.clock as unknown as SportsClock).state === "ENDED" &&
          !ownRecords.some((r) => r.data.sessionId === s.id) &&
          now >=
            Number((s.data.clock as unknown as SportsClock).endedAt) + 86400000,
      ).length,
      pendingStatuses: [
        ...new Set(pendingRecords.map((r) => String(r.data.status))),
      ],
    };
  };
  const represented = new Set<string>();
  const rows = (check?.rows ?? []).map((row) => {
    const candidates = identities.filter(
      (i) => i.data.studentNumber === row.studentNumber,
    );
    const ownerId =
      row.status !== "CONFLICT" && candidates.length === 1
        ? candidates[0].ownerId
        : null;
    if (ownerId) represented.add(ownerId);
    const member = ownerId
      ? members.find((m) => m.ownerId === ownerId)
      : undefined;
    return {
      source: "SCHOOL",
      enrollmentId: member?.id ?? null,
      studentId: member?.ownerId ?? null,
      sourceRow: row.row,
      studentNumber: row.studentNumber,
      name: row.name,
      registration: row.status,
      reason: row.reason,
      membership: String(member?.data.status ?? "NOT_JOINED"),
      facts: member ? facts(ownerId) : null,
    };
  });
  for (const member of members) {
    if (member.ownerId && represented.has(member.ownerId)) continue;
    const identity = identities.filter((i) => i.ownerId === member.ownerId);
    const person = personById(member.ownerId ?? "");
    rows.push({
      source: "MEMBER",
      enrollmentId: member.id,
      studentId: member.ownerId,
      sourceRow: 0,
      studentNumber:
        identity.length === 1
          ? String(identity[0].data.studentNumber ?? "")
          : "",
      name: String(person?.name ?? ""),
      registration: snapshot ? "SEPARATE_MEMBER" : "NO_ROSTER",
      reason: "成员独立列示；不计入学校名单分母，不合并冲突身份",
      membership: String(member.data.status),
      facts: facts(member.ownerId),
    });
  }
  add(
    "OPEN_SESSION",
    sessions.filter(
      (s) => (s.data.clock as unknown as SportsClock).state !== "ENDED",
    ).length,
  );
  add(
    "AWAITING_MATERIALS",
    sessions.filter(
      (s) =>
        (s.data.clock as unknown as SportsClock).state === "ENDED" &&
        !records.some((r) => r.data.sessionId === s.id) &&
        now <
          Number((s.data.clock as unknown as SportsClock).endedAt) + 86400000,
    ).length,
  );
  add(
    "PENDING_RECORD",
    records.filter((r) => !["VALID", "INVALID"].includes(String(r.data.status)))
      .length,
  );
  add(
    "ENDURANCE_NOT_RECORDED",
    members.filter(
      (m) =>
        m.data.status === "ACTIVE" &&
        !approvedExemption(repo, m.ownerId, courseId) &&
        !inCourse("sportsEndurance").some((e) => e.ownerId === m.ownerId),
    ).length,
  );
  return {
    reportType: "CURRENT_TEACHING_REPORT",
    course: {
      id: course.id,
      name: String(course.data.name),
      version: course.version,
    },
    snapshotId: snapshot?.id ?? null,
    basisVersion: basis?.version ?? null,
    generatedAt: new Date().toISOString(),
    ruleVersion: "V8.1",
    settlementStatus: String(course.data.settlementStatus ?? "UNSETTLED"),
    denominator: check?.denominator ?? null,
    rawRowCount: check?.rawRowCount ?? 0,
    excludedCount: check?.excludedCount ?? 0,
    unresolved,
    rows,
    limitations: ["当前教学报告不是冻结结算版本"],
  };
}
/** Formula-looking text is escaped for spreadsheet readers; source facts remain untouched. */
export function reportRows(report: CourseReport) {
  const data: unknown[][] = [
    ["报告类型", report.reportType],
    ["课程", report.course.name],
    ["课程ID", report.course.id],
    ["名单快照", report.snapshotId ?? "未确认"],
    ["生成时间", report.generatedAt],
    ["规则版本", report.ruleVersion],
    ["结算状态", report.settlementStatus],
    ["名单分母", report.denominator ?? "核对中"],
    ["原始行数", report.rawRowCount],
    ["排除行数", report.excludedCount],
    ...report.limitations.map((v) => ["说明", v]),
    ...report.unresolved.map((v) => ["未解决事项", v.code, v.count]),
    [],
    [
      "来源",
      "名单行",
      "学号",
      "姓名",
      "注册核对",
      "成员状态",
      "体测录入",
      "体测项目",
      "原始秒",
      "日期",
      "实际运动分钟",
      "无效记录实际分钟",
      "有效可计未计分钟",
      "相关计入",
      "相关目标",
      "其他计入",
      "其他目标",
      "打卡达标",
      "异常待办",
      "未结束会话",
      "待首版材料",
      "首次窗口已过且未提交",
      "结算状态",
      "核对说明",
    ],
    ...report.rows.map((r) => {
      const f = r.facts;
      return [
        r.source,
        r.sourceRow || "",
        r.studentNumber,
        r.name,
        r.registration,
        r.membership,
        f?.enduranceStatus ?? "无法唯一关联",
        f?.endurance?.event ?? "",
        f?.endurance?.seconds ?? "",
        f?.endurance?.testDate ?? "",
        f?.actualMinutes ?? "",
        f?.invalidMinutes ?? "",
        f?.validUncountedMinutes ?? "",
        f?.categoryTotals[0] ?? "",
        f?.targets[0] ?? "",
        f?.categoryTotals[1] ?? "",
        f?.targets[1] ?? "",
        f ? (f.met ? "是" : "否") : "未知",
        f?.pendingRecords ?? "",
        f?.openSessions ?? "",
        f?.awaitingMaterials ?? "",
        f?.expiredWithoutMaterials ?? "",
        report.settlementStatus,
        r.reason,
      ];
    }),
  ];
  return data;
}
export function reportCsv(report: CourseReport) {
  const data = reportRows(report);
  return (
    "\uFEFF" +
    data
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? "");
            if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
              text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
