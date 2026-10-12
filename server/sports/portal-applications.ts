import { demand, type Account } from "../auth";
import {
  integerField,
  Repository,
  strings,
  textField,
  type Fields,
} from "../repository";
import { ownedCourse, sportsRole } from "./courses";
import { sportsWriteGate } from "./system";

export function portalApplications(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  sportsRole(repo, actor, "teacher");
  sportsWriteGate(repo, "sports.course.read");
  demand(
    Object.keys(input).every((key) =>
      ["limit", "cursor", "classSectionId"].includes(key),
    ),
    "申请查询参数无效。",
  );
  const courseId = textField(input, "classSectionId", 100, true);
  if (courseId) ownedCourse(repo, actor, courseId);
  const courses = new Set(
    repo
      .all("sportsCourse")
      .filter((course) => course.ownerId === actor.id)
      .map((course) => course.id),
  );
  const rows = repo
    .all("sportsApplication")
    .filter(
      (app) =>
        courses.has(String(app.data.courseId)) &&
        (!courseId || app.data.courseId === courseId),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const cursor = textField(input, "cursor", 100, true),
    index = cursor ? rows.findIndex((row) => row.id === cursor) : -1;
  demand(!cursor || index >= 0, "分页基准已变化，请刷新。", 409);
  const histories = repo.all("sportsApplicationHistory");
  const data = rows.slice(index + 1, index + 1 + limit).map((app) => {
    const certification = app.data.certification as Fields | null;
    demand(
      ["EXEMPTION", "CERTIFICATION"].includes(String(app.data.applicationType)),
      "申请类型须先核对。",
      409,
    );
    const exemption = app.data.applicationType === "EXEMPTION";
    const history = histories.find(
      (item) =>
        item.data.applicationId === app.id &&
        item.data.version === app.version &&
        ["APPROVE", "REJECT", "REQUEST_SUPPLEMENT", "REVOKE"].includes(
          String(item.data.action),
        ),
    );
    return {
      id: app.id,
      studentId: app.ownerId,
      enrollmentId: app.data.enrollmentId,
      classSectionId: app.data.courseId,
      applicationType: exemption ? "PHYSICAL_TEST" : "EXERCISE_CHECK_IN",
      applicationSubtype: exemption
        ? null
        : (certification?.certificationKind ?? null),
      organizationName: exemption
        ? null
        : (certification?.organizationOrTeamName ?? null),
      reason: typeof app.data.reason === "string" ? app.data.reason : "",
      mediaIds: strings(app.data.assetIds),
      status: app.data.status,
      publicComment: app.data.publicReason ?? null,
      submittedAt:
        typeof app.data.submittedAt === "number"
          ? new Date(app.data.submittedAt).toISOString()
          : null,
      decidedAt:
        history && typeof history.data.at === "number"
          ? new Date(history.data.at).toISOString()
          : null,
      version: app.version,
    };
  });
  const nextCursor = index + 1 + limit < rows.length ? data.at(-1)!.id : null;
  return {
    data,
    meta: {
      pagination: {
        total: rows.length,
        limit,
        nextCursor,
        hasMore: nextCursor !== null,
      },
    },
  };
}
