import { authenticate, demand, type Account } from "../auth";
import type { Database } from "../database";
import { execute } from "../commands";
import {
  Repository,
  integerField,
  textField,
  type Fields,
} from "../repository";
import { sportsAccountGate } from "./account-gate";
import { sportsWriteGate } from "./system";
import { portalSecurity } from "./portal";

function gate(repo: Repository, actor: Account) {
  portalSecurity(repo, actor);
  sportsAccountGate(repo, actor);
  sportsWriteGate(repo, "sports.notifications.read");
}
function project(repo: Repository, row: Fields) {
  const entity = row.entity_id
    ? repo.db
        .prepare("SELECT kind,owner_id FROM entities WHERE id=?")
        .get(String(row.entity_id))
    : undefined;
  return projectSportsNotification(row,entity);
}
export function projectSportsNotification(row: Fields, entity?: Fields) {
  const kinds: Record<string, string> = {
    sportsCourse: "CLASS_SECTION",
    sportsRecord: "EXERCISE_RECORD",
    sportsFeedback: "FEEDBACK",
    sportsSystem: "SYSTEM_POLICY",
    sportsIdentity: "USER",
    sportsEnrollment: "ENROLLMENT",
  };
  const targetType = entity ? (kinds[String(entity.kind)] ?? null) : null;
  return {
    id: row.id,
    recipientUserId: row.recipient_id,
    notificationType: row.event,
    title: "体育业务通知",
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
    targetType,
    targetId: targetType
      ? targetType === "USER"
        ? entity!.owner_id
        : row.entity_id
      : null,
  };
}

export function portalNotifications(
  repo: Repository,
  actor: Account,
  input: Fields,
) {
  gate(repo, actor);
  demand(
    Object.keys(input).every((key) =>
      ["limit", "cursor", "unreadOnly"].includes(key),
    ),
    "通知查询参数无效。",
  );
  demand(
    input.unreadOnly === undefined ||
      input.unreadOnly === "true" ||
      input.unreadOnly === "false",
    "未读筛选无效。",
  );
  const limit =
    input.limit === undefined
      ? 20
      : integerField({ limit: Number(input.limit) }, "limit", 1, 100);
  const cursor = textField(input, "cursor", 100, true);
  const boundary = cursor
    ? repo.db
        .prepare(
          "SELECT created_at,id FROM notifications WHERE id=? AND recipient_id=? AND event LIKE 'sports.%'",
        )
        .get(cursor, actor.id)
    : undefined;
  demand(!cursor || boundary, "通知分页基准已变化，请刷新。", 409);
  const args: (string | number)[] = [actor.id];
  let where = "recipient_id=? AND event LIKE 'sports.%'";
  if (input.unreadOnly === "true") where += " AND read_at IS NULL";
  if (boundary) {
    where += " AND (created_at < ? OR (created_at = ? AND id < ?))";
    args.push(
      String(boundary.created_at),
      String(boundary.created_at),
      String(boundary.id),
    );
  }
  const rows = repo.db
    .prepare(
      `SELECT * FROM notifications WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT ?`,
    )
    .all(...args, limit + 1);
  const page = rows.slice(0, limit),
    hasMore = rows.length > limit;
  return {
    data: page.map((row) => project(repo, row)),
    meta: {
      pagination: {
        hasMore,
        nextCursor: hasMore ? page.at(-1)!.id : null,
        limit,
      },
    },
  };
}

export function portalNotificationRead(
  db: Database,
  token: string,
  id: string,
  key: string,
) {
  const repo = new Repository(db),
    actor = authenticate(db, token);
  gate(repo, actor);
  const row = db
    .prepare(
      "SELECT id FROM notifications WHERE id=? AND recipient_id=? AND event LIKE 'sports.%'",
    )
    .get(id, actor.id);
  demand(row, "通知不存在。", 404);
  execute(db, token, "notification.read", { id }, key);
  return project(
    repo,
    db
      .prepare("SELECT * FROM notifications WHERE id=? AND recipient_id=?")
      .get(id, actor.id)!,
  );
}
