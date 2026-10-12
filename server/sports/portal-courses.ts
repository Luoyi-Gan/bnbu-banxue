import { authenticate, demand, type Account } from "../auth";
import { execute } from "../commands";
import type { Database } from "../database";
import {
  Repository,
  integerField,
  textField,
  type Entity,
  type Fields,
} from "../repository";
import { ownedCourse, sportsRole } from "./courses";
import { sportsWriteGate } from "./system";

function teacherGate(repo: Repository, actor: Account) {
  sportsRole(repo, actor, "teacher");
  sportsWriteGate(repo, "sports.course.read");
}
export function portalCourseInvite(
  db: Database,
  token: string,
  id: string,
  revoke: boolean,
  input: Fields,
  key: string,
) {
  const repo = new Repository(db),
    actor = authenticate(db, token);
  teacherGate(repo, actor);
  ownedCourse(repo, actor, id);
  demand(
    Object.keys(input).every(
      (field) => field === (revoke ? "inviteToken" : "expiresInMinutes"),
    ),
    "邀请参数无效。",
  );
  const result = execute(
    db,
    token,
    revoke ? "sports.invitation.revoke" : "sports.invitation.create",
    revoke
      ? { courseId: id, code: input.inviteToken }
      : { courseId: id, minutes: input.expiresInMinutes ?? 30 },
    key,
  ) as { id: string };
  const invite = repo.get(result.id, "sportsInvitation");
  return {
    inviteToken: invite.data.code,
    classSectionId: invite.data.courseId,
    expiresAt: new Date(Number(invite.data.expiresAt)).toISOString(),
    status: invite.data.status,
  };
}
export function portalCourseWindow(
  db: Database,
  token: string,
  id: string,
  input: Fields,
  key: string,
) {
  const mapping: Record<string, string> = {
    expectedVersion: "version",
    checkInStartDate: "startDate",
    checkInEndDate: "deadlineDate",
    dailyStartTime: "startTime",
    dailyEndTime: "endTime",
    excludedDates: "excludedDates",
  };
  demand(
    Object.keys(input).every(
      (field) =>
        field in mapping ||
        ["checkInWindowMode", "submissionDeadlineAt"].includes(field),
    ),
    "课程时间窗参数无效。",
  );
  const fields: Fields = { id };
  for (const [source, target] of Object.entries(mapping))
    if (source in input) fields[target] = input[source];
  if ("checkInWindowMode" in input) {
    demand(
      ["AVAILABLE", "UNAVAILABLE"].includes(String(input.checkInWindowMode)),
      "打卡状态无效。",
    );
    fields.checkInAvailable = input.checkInWindowMode === "AVAILABLE";
  }
  if ("submissionDeadlineAt" in input) {
    const deadline = Date.parse(`${input.checkInEndDate}T23:59:59+08:00`);
    demand(
      typeof input.submissionDeadlineAt === "string" &&
        Number.isFinite(deadline) &&
        Date.parse(input.submissionDeadlineAt) === deadline,
      "提交截止须为常规运动截止日的上海时间23:59:59。",
    );
  }
  execute(db, token, "sports.course.window", fields, key);
  return portalTeacherCourse(
    new Repository(db),
    authenticate(db, token),
    id,
    "class-sections",
  );
}
function semesterRow(semester: Entity) {
  return {
    id: semester.id,
    organizationId: "BNBU",
    displayName: semester.data.name,
    academicYear: semester.data.academicYear,
    termCode: semester.data.type,
    status: semester.data.status,
    startDate: semester.data.startDate,
    endDate: semester.data.endDate,
    version: semester.version,
  };
}
function section(repo: Repository, course: Entity) {
  const semester = repo.get(course.data.semesterId, "sportsSemester");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Shanghai",
  });
  return {
    id: course.id,
    organizationId: "BNBU",
    courseId: course.id,
    semesterId: semester.id,
    teacherId: course.ownerId,
    classCode: course.id,
    displayName: course.data.name,
    status:
      semester.data.status === "ARCHIVED"
        ? "ARCHIVED"
        : course.data.status === "CLOSED"
          ? "CLOSED"
          : course.data.status === "PUBLISHED" &&
              String(course.data.startDate) <= today
            ? "ACTIVE"
            : "UPCOMING",
    isEnrollmentOpen:
      course.data.status === "PUBLISHED" && course.data.enrollmentOpen === true,
    checkInWindowMode:
      course.data.startDate && course.data.checkInAvailable !== false
        ? "AVAILABLE"
        : "UNAVAILABLE",
    checkInStartDate: course.data.startDate ?? null,
    checkInEndDate: course.data.deadlineDate ?? null,
    dailyStartTime: course.data.startTime ?? null,
    dailyEndTime: course.data.endTime ?? null,
    submissionDeadlineAt: course.data.deadlineDate
      ? new Date(`${course.data.deadlineDate}T23:59:59+08:00`).toISOString()
      : null,
    excludedDates: course.data.excludedDates ?? [],
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    version: course.version,
  };
}
function catalog(course: Entity) {
  return {
    id: course.id,
    organizationId: "BNBU",
    courseCode: course.id,
    courseName: course.data.name,
    description: course.data.description ?? null,
    status: course.data.status,
    version: course.version,
  };
}
function page<T extends { id: string }>(rows: T[], input: Fields) {
  demand(
    Object.keys(input).every((key) =>
      ["limit", "cursor", "after"].includes(key),
    ),
    "课程查询参数无效。",
  );
  const limit =
    input.limit === undefined
      ? 20
      : integerField({ limit: Number(input.limit) }, "limit", 1, 100);
  const cursor = textField(
    { cursor: input.cursor ?? input.after },
    "cursor",
    100,
    true,
  );
  rows.sort((a, b) => a.id.localeCompare(b.id));
  const index = cursor ? rows.findIndex((row) => row.id === cursor) : -1;
  demand(!cursor || index >= 0, "分页基准已变化，请刷新。", 409);
  const items = rows.slice(index + 1, index + 1 + limit);
  return {
    items,
    nextCursor: index + 1 + limit < rows.length ? items.at(-1)!.id : null,
    total: rows.length,
    limit,
  };
}
export function portalTeacherCourses(
  repo: Repository,
  actor: Account,
  kind: "courses" | "class-sections",
  input: Fields,
) {
  teacherGate(repo, actor);
  return page(
    repo
      .all("sportsCourse")
      .filter((course) => course.ownerId === actor.id)
      .map((course) =>
        kind === "courses" ? catalog(course) : section(repo, course),
      ),
    input,
  );
}
export function portalTeacherCourse(
  repo: Repository,
  actor: Account,
  id: string,
  kind: "courses" | "class-sections" | "progress-target" | "v81-rules",
) {
  teacherGate(repo, actor);
  const course = ownedCourse(repo, actor, id);
  if (kind === "courses") return catalog(course);
  if (kind === "class-sections") return section(repo, course);
  demand(course.data.status !== "DRAFT", "课程目标尚未发布。", 404);
  const published = repo.db
    .prepare(
      "SELECT created_at FROM audit WHERE action='sports.course.publish' AND entity_id=? ORDER BY created_at LIMIT 1",
    )
    .get(id);
  if (kind === "v81-rules") {
    const publishedAt = course.data.publishedAt ?? published?.created_at;
    demand(
      typeof publishedAt === "string",
      "课程发布事实尚不完整，须先核对历史数据。",
      409,
    );
    const at = (field: string, time: string) => {
      const value = Date.parse(`${course.data[field]}T${time}+08:00`);
      demand(
        Number.isFinite(value),
        "课程日期事实尚不完整，须先核对历史数据。",
        409,
      );
      return new Date(value).toISOString();
    };
    return {
      version: course.data.rulesVersion ?? 1,
      template_id: course.data.templateId,
      published_at: publishedAt,
      minimum_minutes: course.data.threshold,
      maximum_minutes: 60,
      global_target_minutes: 1200,
      global_target_version: 1,
      allocation_pending: false,
      weekly_limit: course.data.weeklyLimit,
      daily_limit: 1,
      course_target: course.data.relatedTarget,
      general_target: course.data.otherTarget,
      regular_deadline: at("deadlineDate", "23:59:59"),
      closing_deadline: at("closingDate", "23:59:59"),
      settlement_planned_at: at("settlementDate", "00:00:00"),
    };
  }
  return {
    id: course.id,
    classSectionId: course.id,
    courseTargetSeconds: Number(course.data.relatedTarget) * 60,
    generalTargetSeconds: Number(course.data.otherTarget) * 60,
    totalTargetSeconds:
      (Number(course.data.relatedTarget) + Number(course.data.otherTarget)) *
      60,
    effectiveFrom: course.data.publishedAt ?? published?.created_at ?? null,
    version: course.version,
  };
}
export function portalTeacherSemesters(
  repo: Repository,
  actor: Account,
  currentOnly: boolean,
  input: Fields,
) {
  teacherGate(repo, actor);
  const semesters = repo.all("sportsSemester");
  if (currentOnly) {
    const current = semesters.find((s) => s.data.status === "CURRENT");
    demand(current, "当前尚未启用体育学期。", 404);
    return semesterRow(current);
  }
  const ids = new Set(
    repo
      .all("sportsCourse")
      .filter((c) => c.ownerId === actor.id)
      .map((c) => c.data.semesterId),
  );
  return page(
    semesters
      .filter((s) => s.data.status === "CURRENT" || ids.has(s.id))
      .map(semesterRow),
    input,
  );
}
