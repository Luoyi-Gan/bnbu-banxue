import { randomUUID } from "node:crypto";
import { demand, timestamp, type Account } from "./auth";
import type { Database } from "./database";

export type Fields = Record<string, unknown>;
export interface Entity {
  id: string;
  kind: string;
  ownerId: string | null;
  data: Fields;
  version: number;
  createdAt: string;
  updatedAt: string;
}
interface Row {
  id: string;
  kind: string;
  owner_id: string | null;
  data: string;
  version: number;
  created_at: string;
  updated_at: string;
}
const decode = (r: Row): Entity => ({
  id: r.id,
  kind: r.kind,
  ownerId: r.owner_id,
  data: JSON.parse(r.data),
  version: r.version,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});
export function textField(
  data: Fields,
  key: string,
  max = 1000,
  optional = false,
): string {
  const value = data[key] ?? (optional ? "" : undefined);
  demand(
    typeof value === "string" &&
      (optional || value.trim().length > 0) &&
      value.trim().length <= max,
    `${key} 须为${optional ? "0" : "1"}–${max}字。`,
  );
  return value.trim();
}
export function integerField(
  data: Fields,
  key: string,
  min = 1,
  max = 10000,
): number {
  const value = data[key];
  demand(
    typeof value === "number" &&
      Number.isInteger(value) &&
      value >= min &&
      value <= max,
    `${key} 须为 ${min}–${max} 的整数。`,
  );
  return value;
}
export const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
export function enumField<T extends string>(
  data: Fields,
  key: string,
  allowed: readonly T[],
): T {
  demand(allowed.includes(data[key] as T), `${key} 无效。`);
  return data[key] as T;
}
export class Repository {
  constructor(public db: Database) {}
  updateAccount(id: string, status: Account['status'], roles: string[]) {
    this.db.prepare('UPDATE accounts SET status=?,roles=? WHERE id=?').run(status,JSON.stringify([...new Set(roles)]),id);
  }
  ownsNotification(id: string, recipientId: string) {
    return !!this.db.prepare('SELECT 1 FROM notifications WHERE id=? AND recipient_id=?').get(id,recipientId);
  }
  readNotification(id: string, recipientId: string, at: string) {
    this.db.prepare('UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND recipient_id=?').run(at,id,recipientId);
  }
  all(kind: string): Entity[] {
    return (
      this.db
        .prepare(
          "SELECT * FROM entities WHERE kind=? ORDER BY created_at DESC,id",
        )
        .all(kind) as unknown as Row[]
    ).map(decode);
  }
  get(id: unknown, kind?: string): Entity {
    demand(typeof id === "string", "对象标识无效。");
    const row = this.db
      .prepare("SELECT * FROM entities WHERE id=?")
      .get(id) as unknown as Row | undefined;
    demand(row && (!kind || row.kind === kind), "对象不存在。", 404);
    return decode(row);
  }
  create(kind: string, ownerId: string | null, data: Fields): Entity {
    const now = timestamp(),
      id = randomUUID();
    this.db
      .prepare(
        "INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)",
      )
      .run(id, kind, ownerId, JSON.stringify(data), now, now);
    return this.get(id);
  }
  save(entity: Entity, patch: Fields) {
    this.db
      .prepare(
        "UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?",
      )
      .run(
        JSON.stringify({ ...entity.data, ...patch }),
        timestamp(),
        entity.id,
      );
    return this.get(entity.id);
  }
  people(): Omit<Account, "email">[] {
    return this.db
      .prepare(
        "SELECT id,name,organization,status,roles FROM accounts WHERE login_kind<>'HISTORY'",
      )
      .all()
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        organization: String(row.organization),
        status: row.status as Account["status"],
        roles: JSON.parse(String(row.roles)) as string[],
      }));
  }
  person(id: string): Account {
    const row = this.db
      .prepare(
        "SELECT id,COALESCE(email,'') AS email,COALESCE(name,'已注销用户') AS name,COALESCE(organization,'') AS organization,status,roles FROM accounts WHERE id=?",
      )
      .get(id);
    demand(row, "账号不存在。", 404);
    return {
      ...row,
      roles: JSON.parse(String(row.roles)),
    } as unknown as Account;
  }
  notify(
    recipients: string[],
    entityId: string | null,
    event: string,
    body: string,
  ) {
    for (const recipient of new Set(recipients))
      this.db
        .prepare(
          "INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES(?,?,?,?,?,?)",
        )
        .run(randomUUID(), recipient, entityId, event, body, timestamp());
  }
  related(accountId: string, entityId: string, kind: string) {
    return !!this.db
      .prepare(
        "SELECT 1 FROM relations WHERE account_id=? AND entity_id=? AND kind=?",
      )
      .get(accountId, entityId, kind);
  }
  relation(
    accountId: string,
    entityId: string,
    kind: string,
    enabled: boolean,
  ) {
    if (enabled)
      this.db
        .prepare(
          "INSERT OR IGNORE INTO relations(account_id,entity_id,kind,created_at) VALUES(?,?,?,?)",
        )
        .run(accountId, entityId, kind, timestamp());
    else
      this.db
        .prepare(
          "DELETE FROM relations WHERE account_id=? AND entity_id=? AND kind=?",
        )
        .run(accountId, entityId, kind);
  }
}
