import { demand, type Account } from "../auth";
import {
  Repository,
  enumField,
  textField,
  type Entity,
  type Fields,
} from "../repository";
import { sportsRole } from "./courses";
import { administratorAccess } from "./permissions";
import { expireSupplements, supplementClock } from "./supplements";

export function canManageMode(repo: Repository, actor: Account) {
  return administratorAccess(repo, actor).permissions.includes("SYSTEM_MODE");
}
export function currentSystem(repo: Repository) {
  return repo.all("sportsSystem")[0];
}
export function sportsWriteGate(repo: Repository, action: string) {
  if (
    action.startsWith("sports.") &&
    ![
      "sports.system.mode",
      "sports.password.change",
      "sports.ai.manual",
      "sports.ai.stop",
      "sports.ai.retry",
    ].includes(action)
  ) {
    demand(
      !currentSystem(repo) || currentSystem(repo)!.data.mode === "NORMAL",
      "体育服务维护中，普通业务暂停。",
      503,
    );
  }
}
export function sportsSystemCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action !== "sports.system.mode") return undefined;
  sportsRole(repo, actor, "admin");
  demand(canManageMode(repo, actor), "没有系统模式管理权限。", 403);
  const current = currentSystem(repo),
    before = current?.data.mode ?? "NORMAL";
  demand(
    input.version === (current?.version ?? 0),
    "系统模式版本已变化，请刷新。",
    409,
  );
  const mode = enumField(input, "mode", ["NORMAL", "MAINTENANCE"] as const);
  demand(mode !== before, "请选择与当前不同的模式。", 409);
  const reason = textField(input, "reason", 1000),
    now = Date.now();
  let announcement: Fields | null = null;
  if (mode === "MAINTENANCE") {
    const estimatedRecoveryAt = Date.parse(
      textField(input, "estimatedRecoveryAt", 80),
    );
    demand(
      Number.isFinite(estimatedRecoveryAt) && estimatedRecoveryAt > now,
      "预计恢复时间须晚于当前时刻。",
    );
    announcement = {
      titleZh: textField(input, "titleZh", 200),
      titleEn: textField(input, "titleEn", 200),
      bodyZh: textField(input, "bodyZh", 4000),
      bodyEn: textField(input, "bodyEn", 4000),
      estimatedRecoveryAt,
    };
    // Resolve genuine expiry before the pause begins, so maintenance never revives lost time.
    expireSupplements(repo);
  }
  const fields = {
    mode,
    reason,
    announcement,
    changedAt: now,
    changedBy: actor.id,
    policyVersion: "V8.1",
  };
  const saved = current
    ? repo.save(current, fields)
    : repo.create("sportsSystem", null, fields);
  if (mode === "MAINTENANCE") {
    const pause = repo.create("sportsPause", actor.id, {
      status: "CONFIRMED",
      source: "MAINTENANCE",
      startAt: now,
      endAt: null,
      systemVersion: saved.version,
    });
    repo.save(saved, { pauseId: pause.id });
  } else {
    demand(current?.data.pauseId, "维护暂停记录缺失，不能猜测恢复时间。", 409);
    const pause = repo.get(current.data.pauseId, "sportsPause");
    demand(pause.data.endAt == null, "维护暂停已经结束。", 409);
    repo.save(pause, { endAt: now, endedBy: actor.id });
    repo.save(saved, { pauseId: null });
  }
  repo.create("sportsSystemHistory", actor.id, {
    before,
    after: mode,
    reason,
    at: now,
    announcement,
    announcementPublished: mode === "MAINTENANCE",
    systemVersion: repo.get(saved.id).version,
  });
  const recipients = [
    ...new Set(
      repo
        .all("sportsIdentity")
        .filter((i) => i.data.status === "verified" && i.ownerId)
        .map((i) => i.ownerId!),
    ),
  ];
  repo.notify(
    recipients,
    saved.id,
    action,
    mode === "NORMAL"
      ? "体育系统已恢复 / Sports service restored"
      : `体育系统维护 / Sports maintenance：${announcement!.titleZh} / ${announcement!.titleEn}`,
  );
  return repo.get(saved.id);
}
export function systemWorkspace(repo: Repository, actor: Account) {
  const current = currentSystem(repo),
    canManage = canManageMode(repo, actor);
  const identity = repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === actor.id && i.data.status === "verified");
  demand(identity, "没有有效体育身份。", 403);
  return {
    system: {
      id: current?.id ?? null,
      version: current?.version ?? 0,
      mode: current?.data.mode ?? "NORMAL",
      policyVersion: "V8.1",
      changedAt: current?.data.changedAt ?? null,
      announcement: current?.data.announcement ?? null,
      canManage,
      history: canManage ? repo.all("sportsSystemHistory") : [],
      supplements:
        identity.data.role === "student"
          ? repo
              .all("sportsRecord")
              .filter(
                (r) =>
                  r.ownerId === actor.id &&
                  r.data.status === "SUPPLEMENT_REQUIRED",
              )
              .map((r) => ({ id: r.id, ...supplementClock(repo, r) }))
          : [],
    },
    identity,
  };
}
