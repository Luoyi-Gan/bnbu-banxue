import { demand, type Account } from "../auth";
import { Repository, textField, type Entity, type Fields } from "../repository";
import { sportsRole, version } from "./courses";

const DAY = 86400000,
  LIMIT = 2 * DAY;
const midnight = (date: string) => Date.parse(`${date}T00:00:00+08:00`);
type CalendarDay = { date: string; workday: boolean };
export interface SlaClock {
  calculationStatus: string;
  calendarId: unknown;
  elapsedMilliseconds: number | null;
  remainingMilliseconds: number | null;
  deadline: number | null;
  overdue: boolean;
  paused: boolean;
}
function parseDays(text: string): CalendarDay[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  demand(
    lines.length > 0 && lines.length <= 1100,
    "日历须包含1–1100个连续日期。",
  );
  return lines.map((line, index) => {
    const match = /^(\d{4}-\d{2}-\d{2}),(WORKDAY|REST)$/.exec(line);
    demand(match, "日历每行须为 YYYY-MM-DD,WORKDAY 或 YYYY-MM-DD,REST。");
    const date = match[1],
      ms = midnight(date);
    demand(
      Number.isFinite(ms) &&
        new Date(ms + 8 * 3600000).toISOString().slice(0, 10) === date,
      "日历日期无效。",
    );
    if (index)
      demand(
        ms === midnight(lines[index - 1].slice(0, 10)) + DAY,
        "日历须按日期连续排列，不遗漏休息日、不重复日期。",
      );
    return { date, workday: match[2] === "WORKDAY" };
  });
}
export function latestCalendar(repo: Repository) {
  return repo
    .all("sportsCalendar")
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence))[0];
}
export function reviewClock(
  repo: Repository,
  round: Entity,
  now = Date.now(),
): SlaClock {
  if (round.data.status === "CLOSED" && round.data.finalClock)
    return round.data.finalClock as SlaClock;
  const unavailable = (status: string) => ({
    calculationStatus: status,
    calendarId: round.data.calendarId ?? null,
    elapsedMilliseconds: null,
    remainingMilliseconds: null,
    deadline: null,
    overdue: false,
    paused: false,
  });
  if (!round.data.calendarId) return unavailable("CALENDAR_REQUIRED");
  const calendar = repo.get(round.data.calendarId, "sportsCalendar");
  if (calendar.version !== round.data.calendarVersion)
    return unavailable("CALENDAR_VERSION_MISMATCH");
  const days = calendar.data.days as CalendarDay[],
    start = Number(round.data.startedAt),
    end = round.data.status === "CLOSED" ? Number(round.data.endedAt) : now;
  if (
    !days.length ||
    start < midnight(days[0].date) ||
    end > midnight(days[days.length - 1].date) + DAY
  )
    return unavailable("CALENDAR_COVERAGE_REQUIRED");
  const record = repo.get(round.data.recordId, "sportsRecord");
  const pauses = repo
    .all("sportsPause")
    .filter(
      (p) =>
        p.data.status === "CONFIRMED" &&
        (!p.data.recordId || p.data.recordId === record.id) &&
        (!p.data.courseId || p.data.courseId === record.data.courseId),
    );
  const paused =
    round.data.status === "OPEN" &&
    (repo.all("sportsSystem").some((s) => s.data.mode !== "NORMAL") ||
      pauses.some(
        (p) =>
          Number(p.data.startAt) <= now &&
          (p.data.endAt == null || Number(p.data.endAt) > now),
      ));
  // Build eligible working segments by subtracting the union of exclusions per day.
  const segments: number[][] = [];
  for (const day of days.filter((d) => d.workday)) {
    const a = Math.max(start, midnight(day.date)),
      b = midnight(day.date) + DAY;
    if (b <= a) continue;
    const blocks = pauses
      .map((p) => [
        Math.max(a, Number(p.data.startAt)),
        Math.min(b, p.data.endAt == null ? now : Number(p.data.endAt)),
      ])
      .filter(([x, y]) => y > x)
      .sort((x, y) => x[0] - y[0]);
    let cursor = a;
    for (const [x, y] of blocks) {
      if (x > cursor) segments.push([cursor, x]);
      cursor = Math.max(cursor, y);
    }
    if (cursor < b) segments.push([cursor, b]);
  }
  let elapsed = 0,
    accumulated = 0,
    deadline: number | null = null;
  for (const [a, b] of segments) {
    elapsed += Math.max(0, Math.min(b, end) - a);
    if (deadline === null && accumulated + (b - a) >= LIMIT)
      deadline = a + LIMIT - accumulated;
    accumulated += b - a;
  }
  return {
    calculationStatus:
      deadline === null ? "CALENDAR_COVERAGE_REQUIRED" : "CALCULABLE",
    calendarId: calendar.id,
    elapsedMilliseconds: elapsed,
    remainingMilliseconds: Math.max(0, LIMIT - elapsed),
    deadline: paused ? null : deadline,
    overdue: elapsed >= LIMIT,
    paused,
  };
}
export function sportsCalendarCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (!["sports.calendar.publish", "sports.calendar.bind"].includes(action))
    return undefined;
  sportsRole(repo, actor, "admin");
  demand(
    actor.roles.includes("superadmin"),
    "仅总管理员可发布或显式迁移学校日历版本。",
    403,
  );
  if (action === "sports.calendar.publish") {
    demand(
      input.confirmed === true,
      "请确认日历来自学校权威来源，测试日历不能冒充学校日历。",
    );
    const days = parseDays(textField(input, "daysText", 40000));
    return repo.create("sportsCalendar", actor.id, {
      name: textField(input, "name", 200),
      source: textField(input, "source", 1000),
      days,
      sequence: Number(latestCalendar(repo)?.data.sequence ?? 0) + 1,
      publishedAt: Date.now(),
    });
  }
  const round = repo.get(input.id, "sportsReviewRound");
  version(round, input);
  demand(round.data.status === "OPEN", "已结束轮次不能通过日历配置改写。", 409);
  const calendar = repo.get(input.calendarId, "sportsCalendar"),
    reason = textField(input, "reason", 1000);
  demand(
    calendar.id !== round.data.calendarId,
    "该轮次已经使用所选日历。",
    409,
  );
  const before = reviewClock(repo, round),
    saved = repo.save(round, {
      calendarId: calendar.id,
      calendarVersion: calendar.version,
      calculationStatus: "BOUND",
    });
  const after = reviewClock(repo, saved);
  demand(
    after.calculationStatus === "CALCULABLE",
    "新日历尚未覆盖本轮所需工作日期。",
    409,
  );
  repo.create("sportsCalendarBinding", actor.id, {
    roundId: round.id,
    recordId: round.data.recordId,
    at: Date.now(),
    reason,
    before,
    after,
    previousCalendarId: round.data.calendarId ?? null,
    calendarId: calendar.id,
  });
  repo.notify(
    [round.ownerId!],
    round.id,
    action,
    `本轮学校日历版本已明确更新，审核起点不变。原因：${reason}；新截止：${after.deadline === null ? "暂不可计算" : new Date(after.deadline).toISOString()}`,
  );
  return saved;
}
export function checkReviewReminders(repo: Repository) {
  for (const round of repo
    .all("sportsReviewRound")
    .filter((r) => r.data.status === "OPEN")) {
    const clock = reviewClock(repo, round);
    if (
      !clock.overdue ||
      clock.paused ||
      clock.calculationStatus !== "CALCULABLE"
    )
      continue;
    if (repo.all("sportsSlaReminder").some((r) => r.data.roundId === round.id))
      continue;
    const record = repo.get(round.data.recordId, "sportsRecord");
    repo.create("sportsSlaReminder", null, {
      roundId: round.id,
      courseId: record.data.courseId,
      at: Date.now(),
      calendarId: clock.calendarId,
      deadline: clock.deadline,
    });
    repo.notify(
      [round.ownerId!],
      round.id,
      "sports.review.overdue",
      "本轮审核已超过两个学校工作日，请处理；此提醒不改变学生记录结果。",
    );
  }
}
export function calendarWorkspace(repo: Repository, actor: Account) {
  const admin =
    actor.roles.includes("superadmin") &&
    repo
      .all("sportsIdentity")
      .some(
        (i) =>
          i.ownerId === actor.id &&
          i.data.role === "admin" &&
          i.data.status === "verified",
      );
  return {
    canManageCalendar: admin,
    calendars: admin ? repo.all("sportsCalendar") : [],
    calendarRounds: admin
      ? repo
          .all("sportsReviewRound")
          .filter((r) => r.data.status === "OPEN")
          .map((r) => ({
            id: r.id,
            version: r.version,
            courseId: repo.get(r.data.recordId, "sportsRecord").data.courseId,
            startedAt: r.data.startedAt,
            clock: reviewClock(repo, r),
          }))
      : [],
    slaReminders: admin ? repo.all("sportsSlaReminder") : [],
  };
}
