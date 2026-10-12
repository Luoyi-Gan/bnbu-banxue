import { authenticate, demand, type Account } from "../auth";
import { execute } from "../commands";
import type { Database } from "../database";
import {
  integerField,
  Repository,
  strings,
  textField,
  type Fields,
  type Entity,
} from "../repository";
import { ownedCourse, sportsRole } from "./courses";
import { sportsWriteGate } from "./system";

export function portalApplicationReview(
  db: Database,
  token: string,
  id: string,
  input: Fields,
  key: string,
) {
  demand(
    Object.keys(input).every((field) =>
      [
        "decision",
        "expectedVersion",
        "publicComment",
        "courseMinutes",
        "generalMinutes",
        "internalNote",
      ].includes(field),
    ),
    "申请审核参数无效。",
  );
  demand(
    input.internalNote === undefined ||
      input.internalNote === null ||
      input.internalNote === "",
    "当前审核只接收学生可见的意见。",
  );
  const repo = new Repository(db),
    actor = authenticate(db, token),
    app = repo.get(id, "sportsApplication");
  ownedCourse(repo, actor, app.data.courseId);
  demand(
    (app.data.applicationType === "CERTIFICATION" &&
      input.decision === "APPROVE") ||
      (input.courseMinutes === undefined && input.generalMinutes === undefined),
    "只有批准组织认证时可填写认可分钟。",
  );
  execute(
    db,
    token,
    "sports.application.decide",
    {
      id,
      version: input.expectedVersion,
      decision: input.decision,
      reason: input.publicComment,
      ...(input.courseMinutes === undefined
        ? {}
        : { relatedMinutes: input.courseMinutes }),
      ...(input.generalMinutes === undefined
        ? {}
        : { otherMinutes: input.generalMinutes }),
    },
    key,
  );
  return applicationProjection(
    repo.get(id, "sportsApplication"),
    repo.all("sportsApplicationHistory"),
  );
}

export function portalApplications(
  repo: Pick<Repository, 'all' | 'get'>,
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
  const data = rows
    .slice(index + 1, index + 1 + limit)
    .map((app) => applicationProjection(app, histories));
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

export function applicationProjection(app: Entity, histories: Entity[]) {
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
    status:
      app.data.applicationType === "CERTIFICATION" &&
      app.data.creditStatus === "REVOKED"
        ? "REVOKED"
        : app.data.status,
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
}

export function portalCertificationChange(
  db: Database,
  token: string,
  id: string,
  revoke: boolean,
  input: Fields,
  key: string,
) {
  demand(
    Object.keys(input).every((field) =>
      [
        "expectedVersion",
        "reason",
        ...(revoke ? [] : ["courseMinutes", "generalMinutes"]),
      ].includes(field),
    ),
    "认证变更参数无效。",
  );
  const repo = new Repository(db),
    actor = authenticate(db, token),
    app = repo.get(id, "sportsApplication");
  ownedCourse(repo, actor, app.data.courseId);
  execute(
    db,
    token,
    revoke ? "sports.certification.revoke" : "sports.certification.adjust",
    {
      id,
      version: input.expectedVersion,
      reason: input.reason,
      ...(revoke
        ? {}
        : {
            relatedMinutes: input.courseMinutes,
            otherMinutes: input.generalMinutes,
          }),
    },
    key,
  );
  return applicationProjection(
    repo.get(id, "sportsApplication"),
    repo.all("sportsApplicationHistory"),
  );
}

export function portalRecognitionHistory(
  repo: Repository,
  actor: Account,
  id: string,
  input: Fields,
) {
  const app = repo.get(id, "sportsApplication");
  ownedCourse(repo, actor, app.data.courseId);
  sportsWriteGate(repo, "sports.course.read");
  demand(
    app.data.applicationType === "CERTIFICATION",
    "此申请不是组织认证。",
    409,
  );
  return recognitionHistoryProjection(repo.all("sportsCertificationHistory"),id,input);
}
export function recognitionHistoryProjection(rows:Entity[],id:string,input:Fields) {
  demand(
    Object.keys(input).every((key) => ["limit", "cursor"].includes(key)),
    "认可历史查询参数无效。",
  );
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const histories = rows.filter(row=>row.data.applicationId===id);
  const versions = [
    ...new Set(histories.map((row) => Number(row.data.creditVersion))),
  ].sort((a, b) => b - a);
  const cursor = textField(input, "cursor", 100, true),
    index = cursor ? versions.indexOf(Number(cursor)) : -1;
  demand(!cursor || index >= 0, "分页基准已变化，请刷新。", 409);
  const data = versions.slice(index + 1, index + 1 + limit).map((revision) => {
    const pair = histories.filter((row) => row.data.creditVersion === revision);
    const related = pair.find((row) => row.data.category === "RELATED"),
      other = pair.find((row) => row.data.category === "OTHER");
    demand(
      pair.length === 2 &&
        related &&
        other &&
        related.data.status === other.data.status &&
        related.data.reason === other.data.reason,
      "认可历史不完整，须先核对。",
      409,
    );
    return {
      id: `${id}:${revision}`,
      applicationId: id,
      revisionNumber: revision,
      courseSeconds: Number(related.data.minutes) * 60,
      generalSeconds: Number(other.data.minutes) * 60,
      reason: related.data.reason,
      active: related.data.status === "VALID",
      createdAt: related.createdAt,
    };
  });
  const nextCursor =
    index + 1 + limit < versions.length
      ? String(data.at(-1)!.revisionNumber)
      : null;
  return {
    data,
    meta: {
      pagination: {
        total: versions.length,
        limit,
        nextCursor,
        hasMore: nextCursor !== null,
      },
    },
  };
}
