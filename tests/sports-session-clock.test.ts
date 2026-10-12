import { describe, expect, it } from "vitest";
import {
  elapsedMilliseconds,
  startClock,
  transitionClock,
} from "../backend/src/sports/session-clock";

describe("体育服务端计时事实", () => {
  const start = Date.parse("2026-10-11T23:50:00+08:00");
  it("累计多段 ACTIVE，排除 PAUSED，跨日不改变原业务日期", () => {
    const clock = startClock(start);
    const paused = transitionClock(clock, "pause", start + 10 * 60000);
    const resumed = transitionClock(paused, "resume", start + 40 * 60000);
    const ended = transitionClock(resumed, "end", start + 95 * 60000);
    expect(ended.businessDate).toBe("2026-10-11");
    expect(ended.activeMilliseconds).toBe(65 * 60000);
    expect(elapsedMilliseconds(ended, start + 120 * 60000)).toBe(65 * 60000);
    expect(clock.state).toBe("ACTIVE"); // The original fact is not overwritten.
  });
  it("暂停时结束不会计入等待时间", () => {
    const paused = transitionClock(startClock(start), "pause", start + 1000);
    expect(
      transitionClock(paused, "end", start + 3600000).activeMilliseconds,
    ).toBe(1000);
  });
  it("重复暂停、错误继续和结束后的动作不能重新计时", () => {
    const clock = startClock(start);
    expect(() => transitionClock(clock, "resume", start + 1)).toThrow(
      "不能继续",
    );
    const paused = transitionClock(clock, "pause", start + 1);
    expect(() => transitionClock(paused, "pause", start + 2)).toThrow(
      "不能暂停",
    );
    const ended = transitionClock(paused, "end", start + 3);
    expect(() => transitionClock(ended, "resume", start + 4)).toThrow(
      "已经结束",
    );
    expect(() => transitionClock(ended, "end", start + 4)).toThrow("已经结束");
  });
  it("服务器时钟异常不增加时长，也不接受非有限时间", () => {
    expect(() => startClock(NaN)).toThrow("服务端时间无效");
    expect(() => startClock(Infinity)).toThrow("服务端时间无效");
    expect(() => transitionClock(startClock(start), "end", start - 1)).toThrow(
      "时间回退",
    );
  });
  it("上海午夜是新运动业务日期边界，时长保留毫秒不提前取整", () => {
    const midnight = Date.parse("2026-10-12T00:00:00+08:00");
    expect(startClock(midnight - 1).businessDate).toBe("2026-10-11");
    expect(startClock(midnight).businessDate).toBe("2026-10-12");
    expect(elapsedMilliseconds(startClock(start), start + 59999)).toBe(59999);
  });
});

it("已结束记录读取固定时长，不受之后服务器时钟调整影响", () => {
  const started=startClock(1000000);
  const ended=transitionClock(started,"end",1060000);
  expect(elapsedMilliseconds(ended,900000)).toBe(60000);
  expect(()=>transitionClock(started,"pause",900000)).toThrow("时间回退");
});
