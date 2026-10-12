import { demand } from "../auth";

/** Server-owned time facts; eligibility and credited minutes belong to course policy. */
export interface SportsClock {
  state: "ACTIVE" | "PAUSED" | "ENDED";
  startedAt: number;
  businessDate: string;
  activeMilliseconds: number;
  changedAt: number;
  endedAt: number | null;
}
function validTime(now: number) {
  demand(
    Number.isSafeInteger(now) && now >= 0 && now <= 8640000000000000,
    "服务端时间无效。",
    503,
  );
}
function shanghaiDate(now: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}
export function startClock(serverNow: number): SportsClock {
  validTime(serverNow);
  return {
    state: "ACTIVE",
    startedAt: serverNow,
    businessDate: shanghaiDate(serverNow),
    activeMilliseconds: 0,
    changedAt: serverNow,
    endedAt: null,
  };
}
export function elapsedMilliseconds(clock: SportsClock, serverNow: number) {
  validTime(serverNow);
  demand(serverNow >= clock.changedAt, "服务端时间回退，请稍后重试。", 503);
  return (
    clock.activeMilliseconds +
    (clock.state === "ACTIVE" ? serverNow - clock.changedAt : 0)
  );
}
export function transitionClock(
  clock: SportsClock,
  action: "pause" | "resume" | "end",
  serverNow: number,
): SportsClock {
  const elapsed = elapsedMilliseconds(clock, serverNow);
  demand(clock.state !== "ENDED", "运动已经结束。", 409);
  if (action === "pause")
    demand(clock.state === "ACTIVE", "运动当前不能暂停。", 409);
  else if (action === "resume")
    demand(clock.state === "PAUSED", "运动当前不能继续。", 409);
  else demand(action === "end", "未知运动动作。");
  return {
    ...clock,
    state:
      action === "pause" ? "PAUSED" : action === "resume" ? "ACTIVE" : "ENDED",
    activeMilliseconds: elapsed,
    changedAt: serverNow,
    endedAt: action === "end" ? serverNow : null,
  };
}
