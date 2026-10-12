import { demand, type Account } from "../auth";
import { integerField, Repository, type Fields, type Entity } from "../repository";
import { sportsRole } from "./courses";
import { administratorAccess, requireSportsPermission } from "./permissions";
import { sportsWriteGate } from "./system";

export function ruleTemplateGate(repo: Pick<Repository,"all">, actor: Account) {
  if (administratorAccess(repo, actor).permissions.length) {
    sportsRole(repo, actor, "admin");
    requireSportsPermission(repo, actor, "GLOBAL_RULES");
  } else sportsRole(repo, actor, "teacher");
  sportsWriteGate(repo, "sports.course.read");
}
export function portalExerciseGoal(repo: Pick<Repository,"all">, actor: Account) {
  ruleTemplateGate(repo, actor);
  // The accepted V8.1 policy has a fixed 1,200-minute goal. This is its
  // immutable local policy revision, not a fabricated editable database row.
  return { totalTargetMinutes: 1200, version: 1 };
}
export function portalRuleTemplates(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  ruleTemplateGate(repo, actor);
  const {limit,before}=ruleTemplateQuery(input);
  const rows = repo.db
    .prepare(
      `SELECT p.sequence,e.id FROM sports_template_publications p JOIN entities e ON e.id=p.template_id WHERE p.sequence < ? AND e.kind='sportsTemplate' AND json_extract(e.data,'$.status')='published' ORDER BY p.sequence DESC LIMIT ?`,
    )
    .all(before, limit + 1);
  const items = rows.slice(0, limit).map(row=>ruleTemplateProjection(repo.get(row.id,"sportsTemplate"),Number(row.sequence)));
  return {items,nextBeforeVersion:rows.length>limit?items.at(-1)!.version:null};
}
export function ruleTemplateQuery(input:Fields) {
  demand(
    Object.keys(input).every((key) => ["limit", "beforeVersion"].includes(key)),
    "模板查询参数无效。",
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
  return {limit,before};
}
export function ruleTemplateProjection(entity:Entity,sequence:number) {
    return {
      id: entity.id,
      version: sequence,
      displayName: entity.data.name,
      rules: {
        totalTargetMinutes: entity.data.totalTarget,
        minimumMinutesOptions: entity.data.thresholds,
        weeklyLimitOptions: entity.data.weeklyLimits,
        defaultMinimumMinutes: 30,
        defaultWeeklyLimit: 3,
      },
      publishedAt: entity.createdAt,
    };
}
