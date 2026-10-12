import { authenticate, demand, type Account } from "../auth";
import type { Database } from "../database";
import { execute } from "../commands";
import { Repository, type Fields } from "../repository";
import { sportsAccountGate } from "./account-gate";
import { requireSportsPermission } from "./permissions";
import { currentSystem, sportsWriteGate } from "./system";
import type { ConversionRow } from "./conversion-seed";

export function portalEnduranceWrite(
  db: Database,
  token: string,
  wireRowId: string | undefined,
  deleting: boolean,
  input: Fields,
  key: string,
) {
  const repo = new Repository(db);
  const tables = portalEnduranceTables(repo, authenticate(db, token));
  const table = tables.find(
    (t) =>
      t.gender === input.gender &&
      t.gradeGroup === input.gradeGroup &&
      t.runType === input.runType,
  );
  demand(table, "换算表类型无效。", 404);
  let rowId: string | undefined;
  if (wireRowId !== undefined) {
    demand(wireRowId.startsWith(table.id + ":"), "换算行不属于当前表。", 409);
    rowId = wireRowId.slice(table.id.length + 1);
    demand(rowId.length > 0, "换算行标识无效。");
  }
  demand(!deleting || rowId, "缺少删除行标识。");
  const command: Fields = { id: table.id, version: input.expectedVersion };
  if (rowId) command.rowId = rowId;
  if (deleting) command.confirmed = true;
  else {
    demand(
      typeof input.tier === "string" &&
        ["excellent", "good", "pass", "fail"].includes(input.tier),
      "等级无效。",
    );
    Object.assign(command, {
      min: input.minSeconds,
      max: input.maxSeconds,
      score: input.score,
      grade: input.tier.toUpperCase(),
      note: input.note ?? "",
    });
  }
  execute(
    db,
    token,
    deleting
      ? "sports.conversion.remove"
      : rowId
        ? "sports.conversion.edit"
        : "sports.conversion.add",
    command,
    key,
  );
  return portalEnduranceTables(repo, authenticate(db, token)).find(
    (t) => t.id === table.id,
  )!;
}

export function portalAnnouncement(repo: Pick<Repository, 'all'>) {
  const system = currentSystem(repo);
  const mode = system?.data.mode ?? "NORMAL";
  const announcement = system?.data.announcement as Fields | null | undefined;
  return {
    mode,
    policyVersion: system?.version ?? 0,
    updatedAt: system?.updatedAt ?? null,
    announcement:
      mode === "MAINTENANCE" && announcement
        ? {
            titleZh: announcement.titleZh,
            titleEn: announcement.titleEn,
            bodyZh: announcement.bodyZh,
            bodyEn: announcement.bodyEn,
            estimatedRecoveryAt: new Date(
              Number(announcement.estimatedRecoveryAt),
            ).toISOString(),
          }
        : null,
  };
}

export function portalHealth(repo: Repository, actor: Account) {
  sportsAccountGate(repo, actor);
  const identity = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "admin" &&
        i.data.status === "verified",
    );
  demand(
    identity && actor.status !== "banned",
    "仅有效体育管理员可查看服务状态。",
    403,
  );
  function probe(sql: string) {
    const start = performance.now();
    try {
      repo.db.prepare(sql).get();
      return {
        status: "UP",
        latencyMs: Math.max(0, Math.round(performance.now() - start)),
      };
    } catch {
      return { status: "DOWN", latencyMs: null };
    }
  }
  const database = probe("SELECT 1"),
    media = probe("SELECT sha256 FROM sports_media_blobs LIMIT 1");
  return {
    kind: "ADMIN",
    status:
      database.status === "DOWN" || media.status === "DOWN"
        ? "DOWN"
        : "DEGRADED",
    checkedAt: new Date().toISOString(),
    dependencies: {
      database,
      // Local notifications are inserted synchronously; no external queue is configured.
      notificationQueue: { status: "NOT_CONFIGURED", latencyMs: null },
      objectStorage: { ...media, backend: "sqlite" },
      mediaStorage: { ...media, backend: "sqlite" },
    },
  };
}

export function portalEnduranceTables(repo: Repository, actor: Account) {
  sportsAccountGate(repo, actor);
  requireSportsPermission(repo, actor, "GLOBAL_RULES");
  sportsWriteGate(repo, "sports.conversion.read");
  return repo.all("sportsConversionTable").map((table) => ({
    id: table.id,
    gender: table.data.sex === "MALE" ? "male" : "female",
    gradeGroup:
      table.data.group === "JUNIOR" ? "freshman_sophomore" : "junior_senior",
    runType: `${table.data.event}m`,
    version: table.version,
    updatedAt: table.updatedAt,
    bands: (table.data.rows as ConversionRow[]).map((row) => ({
      id: `${table.id}:${row.id}`,
      minSeconds: row.min,
      maxSeconds: row.max,
      score: row.score,
      tier: row.grade.toLowerCase(),
      note: row.note,
    })),
  }));
}
