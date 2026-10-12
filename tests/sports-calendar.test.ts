import { afterEach, expect, it, vi } from "vitest";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { reviewClock, checkReviewReminders } from "../server/sports/calendar";
import { createAccount } from "../server/auth";
const closes: (() => void)[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const close of closes.splice(0)) close();
});
const at = (value: string) => Date.parse(`${value}+08:00`),
  HOUR = 3600000;
function fixture() {
  const db = openDatabase(":memory:");
  closes.push(() => db.close());
  const repo = new Repository(db);
  const teacher = createAccount(db, {
    email: "calendar@example.test",
    name: "隔离日历测试教师",
    password: "Calendar-test-123",
    roles: ["teacher"],
  });
  // Explicit test calendar: Sunday is a school working day, Saturday is a rest day.
  const calendar = repo.create("sportsCalendar", null, {
    sequence: 1,
    days: [
      { date: "2026-10-09", workday: true },
      { date: "2026-10-10", workday: false },
      { date: "2026-10-11", workday: true },
      { date: "2026-10-12", workday: true },
      { date: "2026-10-13", workday: true },
      { date: "2026-10-14", workday: false },
    ],
  });
  const record = repo.create("sportsRecord", null, {
    courseId: "test-course",
    status: "TEACHER_PENDING",
  });
  const round = repo.create("sportsReviewRound", teacher, {
    recordId: record.id,
    startedAt: at("2026-10-09T10:30:00"),
    status: "OPEN",
    calendarId: calendar.id,
    calendarVersion: calendar.version,
  });
  return { db, repo, calendar, record, round };
}
it("按学校确认日历保留入队时刻，补班周日计时且非固定48小时", () => {
  const f = fixture(),
    clock = reviewClock(f.repo, f.round, at("2026-10-11T10:30:00"));
  expect(clock).toMatchObject({
    calculationStatus: "CALCULABLE",
    elapsedMilliseconds: 24 * HOUR,
    remainingMilliseconds: 24 * HOUR,
    deadline: at("2026-10-12T10:30:00"),
    overdue: false,
  });
});
it("暂停仅扣与工作日相交的区间，重叠维护与事故去重，结束点边界精确", () => {
  const f = fixture();
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    startAt: at("2026-10-09T12:00:00"),
    endAt: at("2026-10-11T12:00:00"),
  });
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    recordId: f.record.id,
    startAt: at("2026-10-11T10:00:00"),
    endAt: at("2026-10-11T14:00:00"),
  });
  const deadline = at("2026-10-13T12:30:00");
  expect(reviewClock(f.repo, f.round, deadline - 1)).toMatchObject({
    deadline,
    overdue: false,
    remainingMilliseconds: 1,
  });
  expect(reviewClock(f.repo, f.round, deadline)).toMatchObject({
    deadline,
    overdue: true,
    remainingMilliseconds: 0,
  });
});
it("缺少日历、版本不匹配或覆盖不足均明确不可计算，不推断普通工作周", () => {
  const f = fixture();
  expect(
    reviewClock(f.repo, {
      ...f.round,
      data: { ...f.round.data, calendarId: null },
    }).calculationStatus,
  ).toBe("CALENDAR_REQUIRED");
  expect(
    reviewClock(f.repo, {
      ...f.round,
      data: { ...f.round.data, calendarVersion: 2 },
    }).calculationStatus,
  ).toBe("CALENDAR_VERSION_MISMATCH");
  expect(
    reviewClock(f.repo, f.round, at("2026-10-16T00:00:00")).calculationStatus,
  ).toBe("CALENDAR_COVERAGE_REQUIRED");
});
it("进行中的维护不使用预计恢复时间，冻结剩余工作时间并不预测截止", () => {
  const f = fixture();
  f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    startAt: at("2026-10-09T12:00:00"),
    endAt: null,
  });
  expect(reviewClock(f.repo, f.round, at("2026-10-12T12:00:00"))).toMatchObject(
    {
      paused: true,
      deadline: null,
      elapsedMilliseconds: 1.5 * HOUR,
      remainingMilliseconds: 46.5 * HOUR,
    },
  );
});
it("审核超时只提醒责任教师一次，不修改学生记录或补证机会", () => {
  const f = fixture(),
    before = f.repo.get(f.record.id);
  vi.spyOn(Date, "now").mockReturnValue(at("2026-10-12T12:00:00"));
  checkReviewReminders(f.repo);
  checkReviewReminders(f.repo);
  expect(f.repo.all("sportsSlaReminder")).toHaveLength(1);
  expect(f.repo.get(f.record.id)).toEqual(before);
  expect(f.db.prepare("SELECT COUNT(*) AS n FROM notifications").get()?.n).toBe(
    1,
  );
});
