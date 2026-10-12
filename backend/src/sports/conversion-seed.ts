import type { DatabaseSync } from "node:sqlite";
export type ConversionRow = {
  id: string;
  min: number;
  max: number;
  score: number;
  grade: string;
  note: string;
};
export const conversionGrade = (score: number) =>
  score >= 95
    ? "EXCELLENT"
    : score >= 92
      ? "GOOD"
      : score >= 60
        ? "PASS"
        : "FAIL";
export function seedConversions(db: DatabaseSync) {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version=3").get())
    return;
  db.exec("BEGIN IMMEDIATE");
  try {
    if(db.prepare("SELECT 1 FROM schema_migrations WHERE version=3").get()){db.exec("COMMIT");return;}
    for (const [key, sex, group, event, top] of [
      ["MALE_JUNIOR", "MALE", "JUNIOR", 1000, 239],
      ["MALE_SENIOR", "MALE", "SENIOR", 1000, 249],
      ["FEMALE_JUNIOR", "FEMALE", "JUNIOR", 800, 229],
      ["FEMALE_SENIOR", "FEMALE", "SENIOR", 800, 239],
    ] as const) {
      const rows: ConversionRow[] = [
        {
          id: "score-100",
          min: 0,
          max: top,
          score: 100,
          grade: "EXCELLENT",
          note: "国家学生体质健康标准满分区间",
        },
      ];
      for (let score = 99; score >= 1; score--)
        rows.push({
          id: `score-${score}`,
          min: top + 1 + (99 - score) * 3,
          max: top + 3 + (99 - score) * 3,
          score,
          grade: conversionGrade(score),
          note: "",
        });
      rows.push({
        id: "score-0",
        min: top + 298,
        max: 600,
        score: 0,
        grade: "FAIL",
        note: "",
      });
      const now = new Date().toISOString();
      db.prepare(
        "INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?, 'sportsConversionTable',NULL,?,?,?)",
      ).run(
        `conversion-${key}`,
        JSON.stringify({
          key,
          sex,
          group,
          event,
          rows,
          source: "V8.1_CONFIRMED_DEFAULTS",
        }),
        now,
        now,
      );
    }
    db.prepare("INSERT INTO schema_migrations VALUES(3,?)").run(
      new Date().toISOString(),
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
