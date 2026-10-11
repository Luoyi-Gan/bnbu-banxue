import { randomUUID } from "node:crypto";
import { demand, type Account } from "../auth";
import { transaction } from "../database";
import { Repository, textField, type Fields } from "../repository";
import { sportsRole } from "./courses";
import { sportsWriteGate } from "./system";
/** A separate audited allowlist: a historical remark grants no grade or media access. */
export function historicalRemarks(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  return transaction(repo.db, () => {
    sportsRole(repo, actor, "teacher");
    sportsWriteGate(repo, "sports.grade.remarks.read");
    demand(
      Object.keys(input).every((k) =>
        ["purpose", "publicationId", "cursor"].includes(k),
      ),
      "历史备注只接受用途、发布对象筛选和分页凭据。",
    );
    const purpose = textField(input, "purpose", 500),
      publicationId = input.publicationId
        ? textField(input, "publicationId", 100)
        : null;
    let after = "";
    if (input.cursor) {
      const cursor = repo.get(input.cursor, "sportsRemarkReadCursor");
      demand(
        cursor.ownerId === actor.id &&
          cursor.data.purpose === purpose &&
          cursor.data.publicationId === publicationId &&
          Number(cursor.data.expiresAt) > Date.now(),
        "分页凭据已失效或不属于本次读取用途。",
        409,
      );
      after = String(cursor.data.after);
    }
    const matching = repo
      .all("sportsGradePublication")
      .filter(
        (p) =>
          Object.hasOwn(p.data, "remark") &&
          (!publicationId || p.id === publicationId) &&
          p.id > after,
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    const entries = matching.slice(0, 50),
      readAt = new Date().toISOString();
    demand(
      entries.every(
        (p) => p.data.remark === null || typeof p.data.remark === "string",
      ),
      "历史备注格式不可读取，须核对原数据。",
      409,
    );
    const items = entries.map((p) => ({
      publicationId: p.id,
      courseId: p.data.courseId,
      enrollmentId: p.data.enrollmentId,
      remark: p.data.remark ?? null,
      publishedAt: p.data.publishedAt ?? null,
    }));
    repo.db
      .prepare(
        "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)",
      )
      .run(
        randomUUID(),
        actor.id,
        "teacher",
        "sports.grade.remarks.read",
        publicationId,
        purpose,
        JSON.stringify({
          publicationIds: entries.map((p) => p.id),
          serverReadAt: readAt,
        }),
        readAt,
      );
    const nextCursor =
      matching.length > 50
        ? repo.create("sportsRemarkReadCursor", actor.id, {
            purpose,
            publicationId,
            after: entries.at(-1)!.id,
            expiresAt: Date.now() + 15 * 60000,
          }).id
        : null;
    return { items, nextCursor, readAt };
  });
}
