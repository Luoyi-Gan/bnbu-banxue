import { demand, type Account } from "../auth";
import {
  Repository,
  integerField,
  type Fields,
  type Entity,
} from "../repository";
import { ownedCourse, version } from "./courses";
export function sportsGradeCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
  historicalCorrection = false,
) {
  if (action !== "sports.grade.save" && action !== "sports.grade.publish")
    return undefined;
  const allowed = action.endsWith("save")
    ? ["enrollmentId", "version", "score"]
    : ["id", "version"];
  demand(
    Object.keys(input).every((k) => allowed.includes(k)),
    "最终成绩不接受备注或其他附加字段。",
  );
  const draft = action.endsWith("publish")
    ? repo.get(input.id, "sportsGradeDraft")
    : null;
  const member = repo.get(
    draft?.data.enrollmentId ?? input.enrollmentId,
    "sportsEnrollment",
  );
  const course = ownedCourse(repo, actor, member.data.courseId);
  demand(
    historicalCorrection ||
      (course.data.settlementStatus !== "SETTLED" &&
        repo.get(course.data.semesterId, "sportsSemester").data.status !==
          "ARCHIVED"),
    "已结算或归档成绩须通过历史报告更正流程。",
    409,
  );
  if (draft) {
    version(draft, input);
    demand(draft.data.status === "DRAFT", "此成绩草稿已经发布。", 409);
    const previous = repo
      .all("sportsGradePublication")
      .filter((g) => g.data.enrollmentId === member.id)
      .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence))[0];
    const publication = repo.create("sportsGradePublication", member.ownerId, {
      courseId: course.id,
      enrollmentId: member.id,
      semesterId: course.data.semesterId,
      score: draft.data.score,
      teacherId: actor.id,
      publishedAt: Date.now(),
      sequence: previous ? Number(previous.data.sequence) + 1 : 1,
      previousId: previous?.id ?? null,
      draftId: draft.id,
      draftVersion: draft.version,
    });
    repo.save(draft, { status: "PUBLISHED", publicationId: publication.id });
    return publication;
  }
  const old = repo
    .all("sportsGradeDraft")
    .find((g) => g.data.enrollmentId === member.id);
  demand(
    input.version === (old?.version ?? 0),
    "成绩已变化，请刷新后重新核对。",
    409,
  );
  const score = integerField(input, "score", -2147483648, 2147483647);
  const data = {
    enrollmentId: member.id,
    courseId: course.id,
    semesterId: course.data.semesterId,
    score,
    status: "DRAFT",
    teacherId: actor.id,
    publicationId: null,
  };
  const saved = old
    ? repo.save(old, data)
    : repo.create("sportsGradeDraft", member.ownerId, data);
  repo.create("sportsGradeHistory", actor.id, {
    enrollmentId: member.id,
    courseId: course.id,
    previousScore: old?.data.score ?? null,
    score,
    at: Date.now(),
    draftId: saved.id,
    resultVersion: saved.version,
  });
  return saved;
}
export function gradeWorkspace(repo: Repository, actor: Account) {
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
  const project = (entity: Entity) => ({
    ...entity,
    data: Object.fromEntries(
      [
        "courseId",
        "enrollmentId",
        "semesterId",
        "score",
        "teacherId",
        "publishedAt",
        "sequence",
        "previousId",
        "draftId",
        "draftVersion",
        "status",
        "publicationId",
      ]
        .filter((k) => Object.hasOwn(entity.data, k))
        .map((k) => [k, entity.data[k]]),
    ),
  });
  return {
    gradeDrafts: repo
      .all("sportsGradeDraft")
      .filter((g) => ids.has(String(g.data.courseId)))
      .map(project),
    gradePublications: repo
      .all("sportsGradePublication")
      .filter((g) => ids.has(String(g.data.courseId)))
      .map(project),
  };
}
