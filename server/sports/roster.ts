import { demand, type Account } from "../auth";
import {
  Repository,
  textField,
  integerField,
  type Fields,
  type Entity,
} from "../repository";
import { ownedCourse, version } from "./courses";
import { parseCsv } from "./csv";
import { administratorAccess } from "./permissions";
interface RosterRow {
  row: number;
  studentNumber: string;
  name: string;
  columnError: boolean;
  excluded: boolean;
  reason?: string;
}
function structural(row: RosterRow) {
  return (
    row.columnError ||
    !row.studentNumber ||
    row.studentNumber.length > 100 ||
    !row.name ||
    row.name.length > 40
  );
}
function usable(repo: Repository, actor: Account, id: unknown) {
  const course = ownedCourse(repo, actor, id);
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "已结算或归档名单须通过历史报告更正流程。",
    409,
  );
  return course;
}
function basis(repo: Repository, courseId: string) {
  return repo
    .all("sportsRosterBasis")
    .find((b) => b.data.courseId === courseId);
}
function setBasis(
  repo: Repository,
  actor: Account,
  snapshot: Entity,
  input: Fields,
  reason: string,
) {
  const old = basis(repo, String(snapshot.data.courseId));
  demand(
    input.basisVersion === (old?.version ?? 0),
    "当前名单基准已变化，请刷新核对。",
    409,
  );
  const data = { courseId: snapshot.data.courseId, snapshotId: snapshot.id };
  const saved = old
    ? repo.save(old, data)
    : repo.create("sportsRosterBasis", actor.id, data);
  repo.create("sportsRosterHistory", actor.id, {
    courseId: snapshot.data.courseId,
    previousSnapshotId: old?.data.snapshotId ?? null,
    snapshotId: snapshot.id,
    reason,
    at: Date.now(),
    basisVersion: saved.version,
  });
  return saved;
}
export function sportsRosterCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (
    ![
      "sports.roster.preview",
      "sports.roster.row",
      "sports.roster.confirm",
      "sports.roster.restore",
    ].includes(action)
  )
    return undefined;
  if (action === "sports.roster.preview") {
    const course = usable(repo, actor, input.courseId);
    demand(
      course.data.status === "PUBLISHED",
      "课程已关闭，不接受新名单。",
      409,
    );
    const csv = textField(input, "csv", 200000),
      cells = parseCsv(csv.replace(/^\uFEFF/, ""));
    const header =
      cells
        .shift()
        ?.map(
          (c) =>
            (
              ({ 学号: "student_number", 姓名: "name" }) as Record<
                string,
                string
              >
            )[c.trim()] ?? c.trim(),
        ) ?? [];
    demand(
      header.length === 2 &&
        header.includes("student_number") &&
        header.includes("name"),
      "名单须包含且仅包含student_number,name或学号,姓名两列。",
    );
    demand(
      cells.length > 0 && cells.length <= 500,
      "学校名单须为1–500个人员行，重复和错误行也计入。",
    );
    const rows: RosterRow[] = cells.map((r, i) => ({
      row: i + 2,
      studentNumber: (r[header.indexOf("student_number")] ?? "").trim(),
      name: (r[header.indexOf("name")] ?? "").trim(),
      columnError: r.length !== 2,
      excluded: false,
    }));
    return repo.create("sportsRosterDraft", actor.id, {
      courseId: course.id,
      csv,
      rows,
      status: "DRAFT",
    });
  }
  if (action === "sports.roster.restore") {
    const snapshot = repo.get(input.id, "sportsRosterSnapshot");
    usable(repo, actor, snapshot.data.courseId);
    demand(
      input.confirmed === true,
      "请确认回退核对基准，不修改成员或教学事实。",
    );
    return setBasis(
      repo,
      actor,
      snapshot,
      input,
      textField(input, "reason", 1000),
    );
  }
  const draft = repo.get(input.id, "sportsRosterDraft");
  usable(repo, actor, draft.data.courseId);
  demand(draft.ownerId === actor.id, "只能处理本人名单草稿。", 403);
  version(draft, input);
  demand(draft.data.status === "DRAFT", "名单草稿已经确认。", 409);
  const rows = draft.data.rows as RosterRow[];
  if (action === "sports.roster.row") {
    const number = integerField(input, "row", 2, 501),
      old = rows.find((r) => r.row === number);
    demand(old, "名单行不存在。", 404);
    const reason = textField(input, "reason", 1000);
    const next =
      input.exclude === true
        ? { ...old, excluded: true, reason }
        : {
            ...old,
            studentNumber: textField(input, "studentNumber", 100),
            name: textField(input, "name", 40),
            columnError: false,
            excluded: false,
            reason,
          };
    repo.create("sportsRosterRowHistory", actor.id, {
      draftId: draft.id,
      courseId: draft.data.courseId,
      row: number,
      before: old,
      after: next,
      at: Date.now(),
    });
    return repo.save(draft, {
      rows: rows.map((r) => (r.row === number ? next : r)),
    });
  }
  demand(
    input.confirmed === true,
    "请确认此名单由学校提供，并已核对所有保留行。",
  );
  const active = rows.filter((r) => !r.excluded);
  demand(
    active.length > 0 && active.every((r) => !structural(r)),
    "名单仍有缺失或错误字段，请修正后确认。",
  );
  const snapshot = repo.create("sportsRosterSnapshot", actor.id, {
    courseId: draft.data.courseId,
    draftId: draft.id,
    rows,
    confirmedAt: Date.now(),
    ruleVersion: "V8.1",
    rawRowCount: rows.length,
  });
  setBasis(repo, actor, snapshot, input, "教师核对学校名单后确认新快照");
  repo.save(draft, { status: "CONFIRMED", snapshotId: snapshot.id });
  return snapshot;
}
export function reconcileRoster(repo: Repository, snapshot: Entity) {
  const rows = snapshot.data.rows as RosterRow[],
    active = rows.filter((r) => !r.excluded),
    identities = repo
      .all("sportsIdentity")
      .filter((i) => i.data.role === "student" && i.data.status === "verified"),
    members = repo
      .all("sportsEnrollment")
      .filter(
        (m) =>
          m.data.courseId === snapshot.data.courseId &&
          m.data.status === "ACTIVE",
      );
  const results = active.map((row) => {
    const candidates = identities.filter(
        (i) => i.data.studentNumber === row.studentNumber,
      ),
      duplicate =
        active.filter((r) => r.studentNumber === row.studentNumber).length > 1;
    if (structural(row) || duplicate || candidates.length > 1)
      return {
        ...row,
        status: "CONFLICT",
        reason: duplicate
          ? "学校名单学号重复"
          : candidates.length > 1
            ? "多个账号关联同一学号"
            : "名单字段无效",
      };
    const identity = candidates[0];
    if (!identity)
      return {
        ...row,
        status: "INCOMPLETE",
        reason: "尚未注册或没有可核对的学生身份",
      };
    const person = repo.db
      .prepare("SELECT name,email FROM accounts WHERE id=?")
      .get(identity.ownerId!);
    if (!person)
      return { ...row, status: "INCOMPLETE", reason: "当前账号不存在" };
    if (person.name !== row.name)
      return {
        ...row,
        status: "CONFLICT",
        reason: "名单姓名与学号对应的当前资料冲突",
      };
    const emailVerified =
      identity.data.schoolEmailVerified === true &&
      identity.data.schoolEmail === person.email;
    const joined = members.some((m) => m.ownerId === identity.ownerId);
    return {
      ...row,
      status: emailVerified && joined ? "COMPLETE" : "INCOMPLETE",
      reason: !emailVerified
        ? "尚无当前学校邮箱验证事实"
        : !joined
          ? "未在本班有效入班"
          : "学校邮箱、学号姓名与入班均匹配",
    };
  });
  const keys = new Set(active.map((r) => r.studentNumber));
  const outside = members
    .filter(
      (m) =>
        !identities.some(
          (i) =>
            i.ownerId === m.ownerId && keys.has(String(i.data.studentNumber)),
        ),
    )
    .map((m) => ({
      enrollmentId: m.id,
      studentName:
        repo.db.prepare("SELECT name FROM accounts WHERE id=?").get(m.ownerId!)
          ?.name ?? "已注销学生",
      studentNumber:
        identities.find((i) => i.ownerId === m.ownerId)?.data.studentNumber ??
        "",
      status: "OUTSIDE",
    }));
  const conflictCount = results.filter((r) => r.status === "CONFLICT").length,
    completeCount = results.filter((r) => r.status === "COMPLETE").length;
  return {
    snapshotId: snapshot.id,
    rawRowCount: rows.length,
    excludedCount: rows.length - active.length,
    rows: results,
    outside,
    completeCount,
    incompleteCount: results.length - completeCount,
    conflictCount,
    denominator: conflictCount ? null : active.length,
    registrationPercent: conflictCount
      ? null
      : Math.floor((completeCount * 100) / active.length),
    status: conflictCount ? "RECONCILING" : "KNOWN",
  };
}
export function rosterWorkspace(repo: Repository, actor: Account) {
  const studentIdentities = repo
    .all("sportsIdentity")
    .filter(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "student" &&
        i.data.status === "verified",
    );
  const studentCourses = new Set(
    studentIdentities.length
      ? repo
          .all("sportsEnrollment")
          .filter((m) => m.ownerId === actor.id)
          .map((m) => String(m.data.courseId))
      : [],
  );
  const allBases = repo.all("sportsRosterBasis");
  const studentRosterChecks = allBases
    .filter((b) => studentCourses.has(String(b.data.courseId)))
    .map((b) => {
      const check = reconcileRoster(
        repo,
        repo.get(b.data.snapshotId, "sportsRosterSnapshot"),
      );
      const own =
        studentIdentities.length === 1
          ? check.rows.filter(
              (r) =>
                r.studentNumber === studentIdentities[0].data.studentNumber,
            )
          : [];
      const status =
        studentIdentities.length !== 1
          ? "CONFLICT"
          : !own.length
            ? "OUTSIDE"
            : own.some((r) => r.status === "CONFLICT")
              ? "CONFLICT"
              : own.every((r) => r.status === "COMPLETE")
                ? "COMPLETE"
                : "INCOMPLETE";
      return { courseId: b.data.courseId, status };
    });
  const rosterSummaries = administratorAccess(repo, actor).permissions.includes(
    "COURSES_VIEW",
  )
    ? allBases
        .filter((b) => {
          const course = repo.get(b.data.courseId, "sportsCourse");
          return (
            course.data.status !== "DRAFT" &&
            repo.get(course.data.semesterId, "sportsSemester").data.status ===
              "CURRENT"
          );
        })
        .map((b) => {
          const c = reconcileRoster(
            repo,
            repo.get(b.data.snapshotId, "sportsRosterSnapshot"),
          );
          return {
            courseId: b.data.courseId,
            denominator: c.denominator,
            completeCount: c.completeCount,
            incompleteCount: c.incompleteCount,
            conflictCount: c.conflictCount,
            outsideCount: c.outside.length,
          };
        })
    : [];
  const teacher = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "teacher" &&
        i.data.status === "verified",
    );
  const ids = new Set(
    teacher
      ? repo
          .all("sportsCourse")
          .filter((c) => c.ownerId === actor.id)
          .map((c) => c.id)
      : [],
  );
  const owned = (kind: string) =>
    repo.all(kind).filter((r) => ids.has(String(r.data.courseId)));
  const snapshots = owned("sportsRosterSnapshot"),
    bases = owned("sportsRosterBasis");
  return {
    studentRosterChecks,
    rosterSummaries,
    rosterDrafts: owned("sportsRosterDraft"),
    rosterSnapshots: snapshots,
    rosterBases: bases,
    rosterChecks: bases.map((b) =>
      reconcileRoster(
        repo,
        repo.get(b.data.snapshotId, "sportsRosterSnapshot"),
      ),
    ),
  };
}
