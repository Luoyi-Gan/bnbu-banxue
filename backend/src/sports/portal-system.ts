import { authenticate, demand, type Account } from "../auth";
import type { Database } from "../database";
import { execute } from "../commands";
import { Repository, type Fields } from "../repository";
import { sportsAccountGate } from "./account-gate";
import { requireSportsPermission } from "./permissions";
import { portalAnnouncement } from "./portal-bootstrap";

export function portalSystemRead(repo: Repository, actor: Account) {
  sportsAccountGate(repo, actor);
  requireSportsPermission(repo, actor, "SYSTEM_MODE");
  return portalAnnouncement(repo);
}

export function portalSystemHistory(
  repo: Repository,
  actor: Account,
  before?: string,
) {
  portalSystemRead(repo, actor);
  const bound = before === undefined ? Infinity : Number(before);
  demand(
    before === undefined || (Number.isSafeInteger(bound) && bound > 0),
    "历史版本游标无效。",
  );
  return repo
    .all("sportsSystemHistory")
    .filter((row) => Number(row.data.systemVersion) < bound)
    .sort((a, b) => Number(b.data.systemVersion) - Number(a.data.systemVersion))
    .slice(0, 100)
    .map((row) => ({
      id: row.id,
      actor_id: row.ownerId,
      version: row.data.systemVersion,
      occurred_at: new Date(Number(row.data.at)).toISOString(),
      facts: {
        from: row.data.before,
        to: row.data.after,
        reason: row.data.reason,
        announcementPublished: row.data.announcementPublished,
      },
    }));
}

export function portalSystemChange(
  db: Database,
  token: string,
  input: Fields,
  key: string,
) {
  execute(
    db,
    token,
    "sports.system.mode",
    {
      mode: input.mode,
      reason: input.reason,
      version: input.expectedVersion,
      ...(input.mode === "MAINTENANCE"
        ? {
            titleZh: input.titleZh,
            titleEn: input.titleEn,
            bodyZh: input.bodyZh,
            bodyEn: input.bodyEn,
            estimatedRecoveryAt: input.estimatedRecoveryAt,
          }
        : {}),
    },
    key,
  );
  return portalSystemRead(new Repository(db), authenticate(db, token));
}
