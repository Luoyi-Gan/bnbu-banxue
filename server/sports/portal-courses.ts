import { demand, type Account } from "../auth";
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
    checkInWindowMode: course.data.startDate ? "DATE_RANGE" : "UNAVAILABLE",
    checkInStartDate: course.data.startDate ?? null,
    checkInEndDate: course.data.deadlineDate ?? null,
    dailyStartTime: course.data.startTime ?? null,
    dailyEndTime: course.data.endTime ?? null,
    submissionDeadlineAt: null,
    excludedDates: [],
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
  kind: "courses" | "class-sections" | "progress-target",
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
  return {
    id: course.id,
    classSectionId: course.id,
    courseTargetSeconds: Number(course.data.relatedTarget) * 60,
    generalTargetSeconds: Number(course.data.otherTarget) * 60,
    totalTargetSeconds:
      (Number(course.data.relatedTarget) + Number(course.data.otherTarget)) *
      60,
    effectiveFrom: published?.created_at ?? null,
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
