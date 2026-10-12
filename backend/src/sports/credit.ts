import { demand } from "../auth";

export type Category = 0 | 1;
/** Only the review module may supply effective candidates; pending is not zero/valid. */
export interface CreditCandidate {
  id: string;
  businessDate: string;
  startedAt: number;
  activeMilliseconds: number;
  category: Category;
}
export interface CreditInput {
  candidates: CreditCandidate[];
  targets: [number, number];
  certification: [number, number];
  threshold: 30 | 45 | 60;
  weeklyLimit: 2 | 3 | 4;
  previousIds: string[];
}
export function eligibleMinutes(milliseconds: number, threshold: number) {
  demand(
    Number.isSafeInteger(milliseconds) &&
      milliseconds >= 0 &&
      [30, 45, 60].includes(threshold),
    "运动分钟输入无效。",
  );
  const minutes = Math.floor(milliseconds / 60000);
  return minutes < threshold ? 0 : Math.min(minutes, 60);
}
export function businessWeek(day: string) {
  demand(/^\d{4}-\d{2}-\d{2}$/.test(day), "业务日期无效。");
  const instant = Date.parse(`${day}T00:00:00Z`);
  demand(
    Number.isFinite(instant) &&
      new Date(instant).toISOString().slice(0, 10) === day,
    "业务日期无效。",
  );
  const date = new Date(instant);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
type Row = CreditCandidate & { q: number; bit: bigint };
type State = { count: number; x: number; y: number; mask: bigint };
const compare = (a: CreditCandidate, b: CreditCandidate) =>
  a.startedAt - b.startedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** Exact joint DP from accepted reference design A-04..A-13; never scalar/greedy. */
export function selectCredit(input: CreditInput) {
  const {
    candidates,
    targets,
    certification,
    threshold,
    weeklyLimit,
    previousIds,
  } = input;
  demand(
    [30, 45, 60].includes(threshold) &&
      [2, 3, 4].includes(weeklyLimit) &&
      targets.length === 2 &&
      targets.every((t) => Number.isSafeInteger(t) && t >= 0) &&
      targets[0] + targets[1] === 1200 &&
      certification.length === 2 &&
      certification.every((c) => Number.isSafeInteger(c) && c >= 0),
    "计入规则无效。",
  );
  demand(
    new Set(candidates.map((r) => r.id)).size === candidates.length,
    "运动候选重复。",
  );
  for (const r of candidates) {
    demand(
      typeof r.id === "string" &&
        r.id.length > 0 &&
        [0, 1].includes(r.category) &&
        Number.isSafeInteger(r.startedAt),
      "运动候选无效。",
    );
    businessWeek(r.businessDate);
  }
  const base = targets.map((t, c) => Math.min(t, certification[c]));
  const room = targets.map((t, c) => t - base[c]);
  const sorted = candidates
    .map((r) => ({ ...r, q: eligibleMinutes(r.activeMilliseconds, threshold) }))
    .sort(compare);
  const positive = sorted.filter((r) => r.q > 0);
  const rows: Row[] = positive.map((r, i) => ({
    ...r,
    bit: 1n << BigInt(positive.length - 1 - i),
  }));
  const byId = new Map(rows.map((r) => [r.id, r]));
  const days = new Map<string, Row[]>();
  for (const r of rows)
    days.set(r.businessDate, [...(days.get(r.businessDate) ?? []), r]);
  let states = new Map<string, State>([
    ["0:0:0", { count: 0, x: 0, y: 0, mask: 0n }],
  ]);
  const keep = (table: Map<string, State>, state: State) => {
    const key = `${state.count}:${state.x}:${state.y}`;
    if (!table.has(key) || table.get(key)!.mask < state.mask)
      table.set(key, state);
  };
  let lastWeek = "";
  for (const day of [...days.keys()].sort()) {
    const week = businessWeek(day);
    if (week !== lastWeek) {
      const reset = new Map<string, State>();
      for (const state of states.values()) keep(reset, { ...state, count: 0 });
      states = reset;
      lastWeek = week;
    }
    const next = new Map(states);
    for (const state of states.values()) {
      if (state.count === weeklyLimit) continue;
      for (const row of days.get(day)!) {
        const x =
          row.category === 0 ? Math.min(room[0], state.x + row.q) : state.x;
        const y =
          row.category === 1 ? Math.min(room[1], state.y + row.q) : state.y;
        if (x === state.x && y === state.y) continue;
        keep(next, {
          count: state.count + 1,
          x,
          y,
          mask: state.mask | row.bit,
        });
      }
    }
    states = next;
  }
  let best: State = { count: 0, x: 0, y: 0, mask: 0n };
  for (const state of states.values())
    if (
      state.x + state.y > best.x + best.y ||
      (state.x + state.y === best.x + best.y && state.mask > best.mask)
    )
      best = state;
  const optimum = base[0] + base[1] + best.x + best.y;
  const allocate = (selected: Row[]) => {
    const remaining = [...room];
    const actual = new Map<string, number>();
    for (const row of [...selected].sort(compare)) {
      const amount = Math.min(row.q, remaining[row.category]);
      actual.set(row.id, amount);
      remaining[row.category] -= amount;
    }
    return { actual, totals: targets.map((t, c) => t - remaining[c]) };
  };
  let selected = rows.filter((r) => (best.mask & r.bit) !== 0n);
  // Retain the entire original optimum, not an invented maximum-overlap preference.
  if (
    new Set(previousIds).size === previousIds.length &&
    previousIds.every((id) => byId.has(id))
  ) {
    const previous = previousIds.map((id) => byId.get(id)!);
    const counts = new Map<string, number>();
    for (const row of previous) {
      const week = businessWeek(row.businessDate);
      counts.set(week, (counts.get(week) ?? 0) + 1);
    }
    if (
      new Set(previous.map((r) => r.businessDate)).size === previous.length &&
      [...counts.values()].every((c) => c <= weeklyLimit)
    ) {
      const old = allocate(previous);
      if (
        old.totals[0] + old.totals[1] === optimum &&
        [...old.actual.values()].every((n) => n > 0)
      )
        selected = previous.sort(compare);
    }
  }
  const result = allocate(selected);
  return {
    selectedIds: selected.map((r) => r.id),
    certificationCounted: base,
    categoryTotals: result.totals,
    total: optimum,
    recordActual: Object.fromEntries(
      sorted.map((r) => [r.id, result.actual.get(r.id) ?? 0]),
    ),
    recordEligible: Object.fromEntries(sorted.map((r) => [r.id, r.q])),
  };
}
