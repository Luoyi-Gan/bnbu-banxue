import { createHash } from "node:crypto";
import { demand, type Account } from "../auth";
import { Repository, type Fields, type Entity } from "../repository";
import { ownedCourse, version } from "./courses";
import { courseReport, type CourseReport } from "./report";
import { sportsWriteGate } from "./system";
import { supplementClock } from "./supplements";
import type { SportsClock } from "./session-clock";
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
/** Local SQLite is the shared authoritative source; reads are complete, never paginated. */
export function sourceManifest(repo: Repository, course: Entity) {
  const all = (
    repo.db
      .prepare("SELECT id,kind,owner_id,data,version FROM entities ORDER BY id")
      .all() as {
      id: string;
      kind: string;
      owner_id: string | null;
      data: string;
      version: number;
    }[]
  ).map((e) => ({ ...e, data: JSON.parse(e.data) as Fields }));
  const accounts = repo.db.prepare("SELECT id,name,email,status,roles FROM accounts ORDER BY id").all();
  return settlementManifestData(all,accounts,course);
}
export function settlementManifestData(all:{id:string;kind:string;owner_id:string|null;data:Fields;version:number}[],allAccounts:Fields[],course:Entity) {
  const excluded = new Set([
    "sportsSettlementPreparation",
    "sportsSettlementReport",
  ]);
  const selected = new Set(
    all
      .filter(
        (e) =>
          !excluded.has(e.kind) &&
          (e.id === course.id ||
            e.id === course.data.semesterId ||
            e.data.courseId === course.id ||
            e.kind === "sportsSystem"),
      )
      .map((e) => e.id),
  );
  const members = all.filter(
    (e) => e.kind === "sportsEnrollment" && e.data.courseId === course.id,
  );
  const owners = new Set(members.map((e) => e.owner_id));
  owners.add(course.ownerId);
  const studentNumbers = new Set(
    all
      .filter(
        (e) =>
          e.kind === "sportsRosterSnapshot" && e.data.courseId === course.id,
      )
      .flatMap((e) =>
        (e.data.rows as { studentNumber: string }[]).map(
          (r) => r.studentNumber,
        ),
      ),
  );
  for (const e of all)
    if (
      e.kind === "sportsIdentity" &&
      (owners.has(e.owner_id) ||
        studentNumbers.has(String(e.data.studentNumber)))
    ) {
      selected.add(e.id);
      owners.add(e.owner_id);
    }
  // Include complete dependent materials/events/incidents, including objects without courseId.
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of all) {
      if (selected.has(e.id) || excluded.has(e.kind)) continue;
      const linked =
        [
          e.data.recordId,
          e.data.batchId,
          e.data.applicationId,
          e.data.sourceId,
        ].some((id) => typeof id === "string" && selected.has(id)) ||
        (Array.isArray(e.data.recordIds) &&
          e.data.recordIds.some(
            (id) => typeof id === "string" && selected.has(id),
          ));
      if (linked) {
        selected.add(e.id);
        changed = true;
      }
    }
  }
  const entities = all.filter((e) => selected.has(e.id));
  const accounts = allAccounts.filter(a => owners.has(String(a.id)));
  return {
    hash: hash({ entities, accounts }),
    entityCount: entities.length,
    accountCount: accounts.length,
    membershipIds: members.map((e) => e.id).sort(),
  };
}
export function settlementCheck(
  repo: Repository,
  actor: Account,
  courseId: string,
) {
  sportsWriteGate(repo, "sports.settlement.prepare");
  const course = ownedCourse(repo, actor, courseId),
    report = courseReport(repo, actor, courseId);
  return settlementCheckData(repo,actor,courseId,report,sourceManifest(repo,course));
}
export function settlementCheckData(repo:Pick<Repository,'all'|'get'>,actor:Account,courseId:string,report:CourseReport,manifest:ReturnType<typeof settlementManifestData>) {
  sportsWriteGate(repo,"sports.settlement.prepare");
  const course=ownedCourse(repo,actor,courseId);
  const blockers: { code: string; objectId: string; count: number }[] = [];
  const add = (code: string, objectId: string, count = 1) =>
    blockers.push({ code, objectId, count });
  const now = Date.now(),
    scope = (kind: string) =>
      repo.all(kind).filter((e) => e.data.courseId === courseId);
  if (course.data.status === "DRAFT") add("COURSE_NOT_PUBLISHED", courseId);
  if (course.data.settlementStatus === "SETTLED")
    add("ALREADY_SETTLED", courseId);
  if (
    repo.get(course.data.semesterId, "sportsSemester").data.status ===
    "ARCHIVED"
  )
    add("SEMESTER_ARCHIVED", courseId);
  const closeoutEnd =
    Date.parse(`${String(course.data.closingDate)}T00:00:00+08:00`) + 86400000;
  if (
    course.data.status !== "CLOSED" &&
    (!Number.isFinite(closeoutEnd) || now < closeoutEnd)
  )
    add("NEW_STARTS_STILL_OPEN", courseId);
  // Current report lists all missing material submissions; only a still-lawful initial window blocks settlement.
  for (const issue of report.unresolved)
    if (issue.code !== "AWAITING_MATERIALS")
      add(issue.code, courseId, issue.count);
  const records = scope("sportsRecord");
  for (const session of scope("sportsSession")) {
    const clock = session.data.clock as unknown as SportsClock;
    if (
      clock.state === "ENDED" &&
      !records.some((r) => r.data.sessionId === session.id) &&
      clock.endedAt !== null &&
      now < clock.endedAt + 86400000
    )
      add("FIRST_MATERIAL_PENDING", session.id);
  }
  for (const record of records) {
    if (
      record.data.status === "INVALID" &&
      record.data.supplementStartedAt &&
      (record.data.publicReason as { code?: string } | undefined)?.code ===
        "SUPPLEMENT_EXPIRED" &&
      supplementClock(repo, record).remaining > 0
    )
      add("INCIDENT_REVIEW_REQUIRED", record.id);
  }
  for (const member of scope("sportsEnrollment").filter(
    (m) => m.data.status === "ACTIVE",
  )) {
    const publications = scope("sportsGradePublication").filter(
      (p) => p.data.enrollmentId === member.id,
    );
    if (!publications.length) add("FINAL_GRADE_MISSING", member.id);
  }
  for (const draft of scope("sportsGradeDraft").filter(
    (d) => d.data.status === "DRAFT",
  ))
    add("FINAL_GRADE_DRAFT", draft.id);
  for (const batch of repo
    .all("sportsMaterialBatch")
    .filter(
      (b) =>
        records.some((r) => r.id === b.data.recordId) &&
        ["UPLOADING", "READY"].includes(String(b.data.status)),
    )) {
    const record = records.find((r) => r.id === batch.data.recordId)!;
    if (!["VALID", "INVALID"].includes(String(record.data.status)))
      add("MATERIAL_BATCH_PENDING", batch.id);
  }
  return { course, report, manifest, blockers, checkedAt: now };
}
export function sportsSettlementCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action === "sports.settlement.finalize") {
    demand(
      Object.keys(input).every((k) =>
        ["id", "expectedVersion", "previewFingerprint"].includes(k),
      ),
      "结算确认不接受客户端报告内容。",
    );
    demand(input.expectedVersion === 0, "首次结算版本必须为零。", 409);
    demand(
      typeof input.previewFingerprint === "string" &&
        /^[a-f0-9]{64}$/.test(input.previewFingerprint),
      "请先核对结算预览。",
    );
    const check = settlementCheck(repo, actor, String(input.id));
    demand(
      check.manifest.hash === input.previewFingerprint,
      "结算来源已变化，请重新检查并核对。",
      409,
    );
    demand(!check.blockers.length, "仍有合法待办或教学事项，不能结算。", 409);
    const prep = sportsSettlementCommand(
      repo,
      actor,
      "sports.settlement.prepare",
      { id: check.course.id, version: check.course.version },
    )!;
    return sportsSettlementCommand(repo, actor, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  }
  if (
    action !== "sports.settlement.prepare" &&
    action !== "sports.settlement.confirm"
  )
    return undefined;
  if (action.endsWith("prepare")) {
    demand(
      Object.keys(input).every((k) => ["id", "version"].includes(k)),
      "结算数据须由服务端读取，不能提交统计或阻塞标记。",
    );
    const check = settlementCheck(repo, actor, String(input.id));
    version(check.course, input);
    return repo.create("sportsSettlementPreparation", actor.id, {
      courseId: check.course.id,
      courseVersion: check.course.version,
      status: check.blockers.length ? "BLOCKED" : "READY",
      manifest: check.manifest,
      blockers: check.blockers,
      report: check.report,
      preparedAt: check.checkedAt,
    });
  }
  demand(
    Object.keys(input).every((k) => ["id", "version", "confirmed"].includes(k)),
    "结算确认不接受客户端报告内容。",
  );
  const prep = repo.get(input.id, "sportsSettlementPreparation");
  version(prep, input);
  demand(prep.ownerId === actor.id, "只能确认本人准备的结算。", 403);
  demand(input.confirmed === true, "请核对综合名单后明确确认结算。");
  const check = settlementCheck(repo, actor, String(prep.data.courseId));
  demand(
    prep.data.status === "READY" && !check.blockers.length,
    "仍有合法待办或教学事项，不能结算。",
    409,
  );
  demand(
    (prep.data.manifest as { hash: string }).hash === check.manifest.hash,
    "结算来源已变化，请重新准备并核对。",
    409,
  );
  demand(
    !repo
      .all("sportsSettlementReport")
      .some((r) => r.data.courseId === check.course.id),
    "已有正式结算，旧事实更正须另出报告版本。",
    409,
  );
  const report = {
    ...(prep.data.report as CourseReport),
    reportType: "SETTLEMENT_REPORT",
    settlementStatus: "SETTLED",
    unresolved: [],
    limitations: [],
  };
  const saved = repo.create("sportsSettlementReport", actor.id, {
    courseId: check.course.id,
    semesterId: check.course.data.semesterId,
    sequence: 1,
    previousId: null,
    sourceManifest: check.manifest,
    report,
    contentHash: hash(report),
    confirmedAt: Date.now(),
  });
  repo.save(check.course, {
    status: "CLOSED",
    enrollmentOpen: false,
    settlementStatus: "SETTLED",
    settlementReportId: saved.id,
    settledAt: Date.now(),
  });
  repo.save(prep, { status: "CONFIRMED", reportId: saved.id });
  const recipients = repo
    .all("sportsEnrollment")
    .filter((m) => m.data.courseId === check.course.id)
    .map((m) => m.ownerId!)
    .filter(Boolean);
  repo.notify(
    recipients,
    saved.id,
    action,
    "课程已完成考核结算，原始记录和分类进度保留；内部成绩不在站内公开。",
  );
  return saved;
}
export function settlementWorkspace(repo: Repository, actor: Account) {
  const teacher = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "teacher" &&
        i.data.status === "verified",
    );
  const courseIds = new Set(
    teacher
      ? repo
          .all("sportsCourse")
          .filter((c) => c.ownerId === actor.id)
          .map((c) => c.id)
      : [],
  );
  return {
    settlementPreparations: repo
      .all("sportsSettlementPreparation")
      .filter((p) => courseIds.has(String(p.data.courseId))),
    settlementReports: repo
      .all("sportsSettlementReport")
      .filter((p) => courseIds.has(String(p.data.courseId))),
  };
}
