import { demand, type Account } from "../auth";
import { integerField, Repository, type Fields } from "../repository";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";

export function portalGradeHistory(
  repo: Repository,
  actor: Account,
  enrollmentId: string,
  kind: "physical-results" | "final-grades",
  input: Fields,
) {
  const member = repo.get(enrollmentId, "sportsEnrollment");
  ownedCourse(repo, actor, member.data.courseId);
  sportsWriteGate(repo, "sports.course.read");
  demand(
    Object.keys(input).every((key) => ["limit", "beforeVersion"].includes(key)),
    "成绩历史查询参数无效。",
  );
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const before =
    input.beforeVersion === undefined
      ? Number.MAX_SAFE_INTEGER
      : integerField(
          { value: Number(input.beforeVersion) },
          "value",
          1,
          Number.MAX_SAFE_INTEGER,
        );
  const select = (entityKind: string) =>
    repo.all(entityKind).filter((row) => row.data.enrollmentId === member.id);
  const rows =
    kind === "physical-results"
      ? select("sportsEnduranceRevision").map((row) => ({
          version: Number(row.data.recordVersion),
          runType: row.data.event === 800 ? "800m" : "1000m",
          elapsedSeconds: row.data.seconds,
          testedOn: row.data.testDate,
          createdAt: row.createdAt,
        }))
      : [
          ...select("sportsGradeHistory").map((row) => ({
            enrollmentId,
            version: Number(row.data.resultVersion),
            finalGrade: row.data.score,
            published: false,
            createdAt: row.createdAt,
          })),
          ...select("sportsGradePublication").map((row) => ({
            enrollmentId,
            version: Number(row.data.draftVersion) + 1,
            finalGrade: row.data.score,
            published: true,
            createdAt: row.createdAt,
          })),
        ];
  demand(
    rows.every((row) => Number.isSafeInteger(row.version) && row.version > 0) &&
      new Set(rows.map((row) => row.version)).size === rows.length,
    "成绩历史版本不完整，须先核对。",
    409,
  );
  rows.sort((a, b) => b.version - a.version);
  const page = rows.filter((row) => row.version < before),
    items = page.slice(0, limit);
  return {
    items,
    nextBeforeVersion: page.length > limit ? items.at(-1)!.version : null,
  };
}
