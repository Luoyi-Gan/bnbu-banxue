import { demand, type Account } from "../auth";
import {
  integerField,
  Repository,
  textField,
  type Fields,
} from "../repository";
import { ownedCourse, sportsRole } from "./courses";
import { sportsWriteGate } from "./system";
import { calculateProgress } from "./progress";

export function portalTeacherProgress(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  const page = portalEnrollments(repo, actor, input);
  return {
    data: page.data.map((member) => {
      const progress = calculateProgress(
        repo,
        String(member.classSectionId),
        member.studentId,
      );
      return {
        enrollmentId: member.id,
        courseRelated: { effectiveSeconds: progress.categoryTotals[0] * 60 },
        general: { effectiveSeconds: progress.categoryTotals[1] * 60 },
        totalEffectiveSeconds: progress.total * 60,
        status: progress.total === 1200 ? "COMPLETED" : "IN_PROGRESS",
      };
    }),
    meta: page.meta,
  };
}

function teacherCourses(repo: Repository, actor: Account) {
  sportsRole(repo, actor, "teacher");
  sportsWriteGate(repo, "sports.course.read");
  return new Map(
    repo
      .all("sportsCourse")
      .filter((course) => course.ownerId === actor.id)
      .map((course) => [course.id, course]),
  );
}
export function portalEnrollments(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  const courses = teacherCourses(repo, actor);
  demand(
    Object.keys(input).every((key) =>
      ["classSectionId", "limit", "cursor"].includes(key),
    ),
    "班级成员查询参数无效。",
  );
  const courseId = textField(input, "classSectionId", 100, true);
  if (courseId) ownedCourse(repo, actor, courseId);
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const rows = repo
    .all("sportsEnrollment")
    .filter(
      (member) =>
        courses.has(String(member.data.courseId)) &&
        (!courseId || member.data.courseId === courseId),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  const cursor = textField(input, "cursor", 100, true);
  const index = cursor ? rows.findIndex((row) => row.id === cursor) : -1;
  demand(!cursor || index >= 0, "分页基准已变化，请刷新。", 409);
  const items = rows.slice(index + 1, index + 1 + limit).map((member) => {
    const join = repo.db
      .prepare(
        "SELECT actor_id FROM audit WHERE entity_id=? AND action='sports.enrollment.join' ORDER BY created_at LIMIT 1",
      )
      .get(member.id);
    return {
      id: member.id,
      organizationId: "BNBU",
      semesterId: courses.get(String(member.data.courseId))!.data.semesterId,
      classSectionId: member.data.courseId,
      studentId: member.ownerId,
      source: member.data.source ?? (join ? "INVITE" : "UNKNOWN"),
      sourceReferenceId: member.data.invitationId ?? null,
      status: member.data.status,
      joinedAt: member.createdAt,
      endedAt:
        member.data.status === "ACTIVE" ||
        typeof member.data.changedAt !== "number"
          ? null
          : new Date(member.data.changedAt).toISOString(),
      endReason:
        member.data.status === "ACTIVE" ? null : (member.data.reason ?? null),
      createdBy: join?.actor_id ?? null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      version: member.version,
    };
  });
  const next = index + 1 + limit < rows.length ? items.at(-1)!.id : null;
  return {
    data: items,
    meta: {
      pagination: {
        total: rows.length,
        limit,
        nextCursor: next,
        hasMore: next !== null,
      },
    },
  };
}
export function portalTeacherStudent(
  repo: Repository,
  actor: Account,
  studentId: string,
) {
  const courses = teacherCourses(repo, actor);
  demand(
    repo
      .all("sportsEnrollment")
      .some(
        (member) =>
          member.ownerId === studentId &&
          member.data.status === "ACTIVE" &&
          courses.has(String(member.data.courseId)),
      ),
    "只能读取本人课程有效成员的当前资料。",
    403,
  );
  const identities = repo
    .all("sportsIdentity")
    .filter(
      (identity) =>
        identity.ownerId === studentId &&
        identity.data.role === "student" &&
        identity.data.status === "verified",
    );
  demand(identities.length === 1, "学生身份资料须先核对。", 409);
  const identity = identities[0],
    account = repo.db
      .prepare(
        "SELECT name,email FROM accounts WHERE id=? AND login_kind='PERSONAL'",
      )
      .get(studentId);
  demand(account, "学生当前资料不存在。", 404);
  return {
    id: studentId,
    fullName: account.name,
    studentNumber: identity.data.studentNumber ?? null,
    gender: ["MALE", "FEMALE"].includes(String(identity.data.sex))
      ? identity.data.sex
      : null,
    gradeYear:
      typeof identity.data.year === "number" &&
      Number.isInteger(identity.data.year)
        ? identity.data.year
        : null,
    primaryEmail:
      identity.data.schoolEmailVerified === true &&
      identity.data.schoolEmail === account.email
        ? account.email
        : null,
  };
}
