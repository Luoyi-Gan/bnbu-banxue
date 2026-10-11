import { randomUUID } from "node:crypto";
import { demand, type Account } from "../auth";
import {
  Repository,
  integerField,
  enumField,
  textField,
  type Fields,
} from "../repository";
import { version } from "./courses";
import { administratorAccess, requireSportsPermission } from "./permissions";
import { conversionGrade, type ConversionRow } from "./conversion-seed";
export function validateConversion(rows: ConversionRow[]) {
  demand(rows.length > 0, "换算表不能为空。");
  const sorted = [...rows].sort((a, b) => a.min - b.min);
  demand(sorted[0].min === 0, "换算表必须从0秒起连续覆盖。");
  for (const [index, row] of sorted.entries()) {
    demand(
      Number.isSafeInteger(row.min) &&
        Number.isSafeInteger(row.max) &&
        row.min >= 0 &&
        row.max >= row.min &&
        Number.isInteger(row.score) &&
        row.score >= 0 &&
        row.score <= 100,
      "换算行范围或分数无效。",
    );
    demand(row.grade === conversionGrade(row.score), "等级必须与分数档一致。");
    if (index) {
      const previous = sorted[index - 1];
      demand(previous.max + 1 === row.min, "换算区间不能间断、重叠或重复。");
      demand(previous.score >= row.score, "较慢用时不能取得更高分数。");
    }
  }
  return sorted;
}
export function sportsConversionCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (
    ![
      "sports.conversion.add",
      "sports.conversion.edit",
      "sports.conversion.remove",
    ].includes(action)
  )
    return undefined;
  requireSportsPermission(repo, actor, "GLOBAL_RULES");
  const table = repo.get(input.id, "sportsConversionTable");
  version(table, input);
  const old = table.data.rows as ConversionRow[];
  let rows = old;
  if (action !== "sports.conversion.add")
    demand(
      old.some((r) => r.id === input.rowId),
      "换算行不存在。",
      404,
    );
  if (action === "sports.conversion.remove") {
    demand(input.confirmed === true, "请核对区间、分数和等级后确认删除。");
    rows = old.filter((r) => r.id !== input.rowId);
  } else {
    const row = {
      id:
        action === "sports.conversion.add" ? randomUUID() : String(input.rowId),
      min: integerField(input, "min", 0, 2147483647),
      max: integerField(input, "max", 0, 2147483647),
      score: integerField(input, "score", 0, 100),
      grade: enumField(input, "grade", [
        "EXCELLENT",
        "GOOD",
        "PASS",
        "FAIL",
      ] as const),
      note: textField(input, "note", 1000, true),
    };
    rows =
      action === "sports.conversion.add"
        ? [...old, row]
        : old.map((r) => (r.id === input.rowId ? row : r));
  }
  const saved = repo.save(table, { rows: validateConversion(rows) });
  repo.create("sportsConversionHistory", actor.id, {
    tableId: table.id,
    action,
    at: Date.now(),
    previousVersion: table.version,
    resultVersion: saved.version,
    before: old,
    after: saved.data.rows,
  });
  return saved;
}
export function conversionWorkspace(repo: Repository, actor: Account) {
  return {
    conversionTables: administratorAccess(repo, actor).permissions.includes(
      "GLOBAL_RULES",
    )
      ? repo.all("sportsConversionTable")
      : [],
  };
}
export function convertEndurance(
  repo: Repository,
  sex: string,
  group: string,
  event: number,
  seconds: number,
) {
  demand(
    Number.isSafeInteger(seconds) && seconds >= 0,
    "原始用时须为非负整数秒。",
  );
  const tables = repo
    .all("sportsConversionTable")
    .filter(
      (t) =>
        t.data.sex === sex && t.data.group === group && t.data.event === event,
    );
  demand(tables.length === 1, "无法唯一选择耐力跑换算表。", 409);
  const table = tables[0],
    rows = validateConversion(table.data.rows as ConversionRow[]).filter(
      (r) => r.min <= seconds && seconds <= r.max,
    );
  demand(rows.length === 1, "用时无法唯一匹配换算区间，请先修正规则。", 409);
  return {
    tableId: table.id,
    tableVersion: table.version,
    row: rows[0],
    score: rows[0].score,
    grade: rows[0].grade,
  };
}
