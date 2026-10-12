import { expect, it } from "vitest";
import {
  businessWeek,
  eligibleMinutes,
  selectCredit,
  type CreditCandidate,
  type CreditInput,
} from "../server/sports/credit";
const row = (
  id: string,
  day: string,
  category: 0 | 1,
  minutes: number,
): CreditCandidate => ({
  id,
  businessDate: day,
  category,
  activeMilliseconds: minutes * 60000,
  startedAt: Date.parse(`${day}T08:00:00+08:00`),
});
const input = (
  candidates: CreditCandidate[],
  patch: Partial<CreditInput> = {},
): CreditInput => ({
  candidates,
  targets: [600, 600],
  certification: [0, 0],
  threshold: 30,
  weeklyLimit: 3,
  previousIds: [],
  ...patch,
});
it("完整ACTIVE分钟门槛与60分钟上限，不逐区间或阶梯计时", () => {
  expect(
    [1799999, 1800000, 2759999, 5400000].map((ms) => eligibleMinutes(ms, 30)),
  ).toEqual([0, 30, 45, 60]);
  expect(eligibleMinutes(44 * 60000, 45)).toBe(0);
  expect(eligibleMinutes(59 * 60000, 60)).toBe(0);
});
it("同日与周名额联合选择，不能逐日取最早或逐类贪心", () => {
  const result = selectCredit(
    input(
      [
        row("first", "2026-10-05", 0, 60),
        row("other", "2026-10-05", 1, 50),
        row("second", "2026-10-06", 0, 60),
        row("third", "2026-10-07", 0, 30),
      ],
      { targets: [60, 1140], weeklyLimit: 2 },
    ),
  );
  expect(result.total).toBe(110);
  expect(result.selectedIds).toEqual(["other", "second"]);
  expect(result.recordActual.first).toBe(0);
});
it("认证优先且分类分别封顶，旧最优完整组合优先保留", () => {
  const candidates = [
    row("earlier", "2026-10-05", 0, 60),
    row("previous", "2026-10-06", 0, 60),
  ];
  const result = selectCredit(
    input(candidates, { certification: [570, 0], previousIds: ["previous"] }),
  );
  expect(result.selectedIds).toEqual(["previous"]);
  expect(result.recordActual).toEqual({ earlier: 0, previous: 30 });
  expect(result.total).toBe(600);
  expect(
    selectCredit(input(candidates, { certification: [570, 0] })).selectedIds,
  ).toEqual(["earlier"]);
});
it("新增较早候选不替换更高分钟，失效旧组合不凭缓存保留", () => {
  const result = selectCredit(
    input([row("a", "2026-10-05", 0, 30), row("b", "2026-10-05", 0, 60)], {
      previousIds: ["a"],
    }),
  );
  expect(result.total).toBe(60);
  expect(result.selectedIds).toEqual(["b"]);
  expect(
    selectCredit(
      input([], { previousIds: ["missing"], certification: [500, 800] }),
    ).total,
  ).toBe(1100);
});
it("周一重新计次数，上海日期有效性和候选完整性校验", () => {
  expect(businessWeek("2026-10-11")).toBe("2026-10-05");
  expect(businessWeek("2026-10-12")).toBe("2026-10-12");
  expect(() => businessWeek("2026-02-30")).toThrow();
  const r = row("same", "2026-10-05", 0, 60);
  expect(() => selectCredit(input([r, r]))).toThrow("重复");
});
it("小规模随机候选与穷举最大值一致，新增有效候选总量不下降", () => {
  let seed = 17;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidates = Array.from({ length: 8 }, (_, i) =>
      row(
        String(i),
        `2026-10-${String(5 + (random() % 9)).padStart(2, "0")}`,
        (random() % 2) as 0 | 1,
        30 + (random() % 31),
      ),
    );
    const params = input(candidates, {
      targets: [60, 1140],
      certification: [random() % 60, 950 + (random() % 100)],
      weeklyLimit: 2,
    });
    let best = 0;
    for (let mask = 0; mask < 256; mask++) {
      const subset = candidates.filter((_, i) => mask & (1 << i));
      if (new Set(subset.map((r) => r.businessDate)).size !== subset.length)
        continue;
      const weeks = subset.map((r) => businessWeek(r.businessDate));
      if (weeks.some((w) => weeks.filter((v) => v === w).length > 2)) continue;
      const totals = [...params.certification];
      for (const r of subset)
        totals[r.category] += eligibleMinutes(r.activeMilliseconds, 30);
      best = Math.max(
        best,
        Math.min(totals[0], 60) + Math.min(totals[1], 1140),
      );
    }
    expect(selectCredit(params).total).toBe(best);
    expect(
      selectCredit({ ...params, candidates: candidates.slice(0, -1) }).total,
    ).toBeLessThanOrEqual(best);
  }
});
