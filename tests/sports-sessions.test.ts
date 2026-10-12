import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { execute } from "../backend/src/commands";
import { sessionProjection } from "../backend/src/sports/sessions";
const databases: Database[] = [];
afterEach(() => {
  databases.splice(0).forEach((db) => db.close());
  vi.useRealTimers();
});
function setup() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T10:00:00+08:00"));
  const db = openDatabase(":memory:");
  databases.push(db);
  const repo = new Repository(db);
  const make = (name: string) => {
    const email = `${name}@example.test`,
      password = "Sports-test-123",
      id = createAccount(db, { email, password, name, roles: ["student"] });
    repo.create("sportsIdentity", id, { role: "student", status: "verified" });
    return login(db, email, password);
  };
  const a = make("a"),
    b = make("b");
  const semester = repo.create("sportsSemester", null, { status: "CURRENT" });
  const course = repo.create("sportsCourse", null, {
    status: "PUBLISHED",
    semesterId: semester.id,
    threshold: 30,
    weeklyLimit: 3,
    relatedTarget: 600,
    otherTarget: 600,
    startDate: "2026-09-01",
    deadlineDate: "2026-12-31",
    startTime: "06:00",
    endTime: "23:00",
  });
  repo.create("sportsEnrollment", a.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  const run = (
    who: typeof a,
    action: string,
    input: Record<string, unknown>,
    key = randomUUID(),
  ) => {
    const result = execute(db, who.token, action, input, key) as { id: string };
    return repo.get(result.id);
  };
  return { db, repo, a, b, course, run };
}
it("课程排除日期禁止学生开始普通运动，不生成会话", () => {
  const f = setup();
  f.repo.save(f.course, { excludedDates: ["2026-10-11"] });
  expect(() =>
    f.run(f.a, "sports.session.start", { courseId: f.course.id, category: 0 }),
  ).toThrow("当前不在普通打卡日期");
  expect(f.repo.all("sportsSession")).toHaveLength(0);
});
it("服务器持久运动、幂等开始、暂停排除及客户端时长不可覆盖", () => {
  const f = setup(),
    key = randomUUID();
  const original = f.run(
    f.a,
    "sports.session.start",
    { courseId: f.course.id, duration: 999999999 },
    key,
  );
  expect(
    f.run(
      f.a,
      "sports.session.start",
      { courseId: f.course.id, duration: 999999999 },
      key,
    ).id,
  ).toBe(original.id);
  expect(() =>
    f.run(f.a, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("已有进行中");
  vi.advanceTimersByTime(20 * 60000);
  const paused = f.run(f.a, "sports.session.pause", {
    id: original.id,
    version: original.version,
  });
  vi.advanceTimersByTime(60 * 60000);
  expect(
    sessionProjection(f.repo.get(original.id), Date.now()).data
      .elapsedMilliseconds,
  ).toBe(20 * 60000);
  const resumed = f.run(f.a, "sports.session.resume", {
    id: paused.id,
    version: paused.version,
  });
  vi.advanceTimersByTime(15 * 60000);
  const ended = f.run(f.a, "sports.session.end", {
    id: resumed.id,
    version: resumed.version,
    elapsedMilliseconds: 999999999,
  });
  expect(sessionProjection(ended, Date.now()).data).toMatchObject({
    elapsedMilliseconds: 35 * 60000,
    eligibleMinutes: 35,
  });
  expect(f.repo.all("sportsSessionEvent")).toHaveLength(4);
  expect(() =>
    f.run(f.a, "sports.session.resume", {
      id: ended.id,
      version: ended.version,
    }),
  ).toThrow("已经结束");
});
it("他人、过期版本与无成员的新运动均被拒绝", () => {
  const f = setup();
  expect(() =>
    f.run(f.b, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("成员关系");
  const s = f.run(f.a, "sports.session.start", { courseId: f.course.id });
  expect(() =>
    f.run(f.b, "sports.session.end", { id: s.id, version: s.version }),
  ).toThrow("本人运动");
  expect(() =>
    f.run(f.a, "sports.session.end", { id: s.id, version: 0 }),
  ).toThrow("记录已变化");
});
it("课程关闭保留已有运动结束链，但阻止新运动", () => {
  const f = setup(),
    s = f.run(f.a, "sports.session.start", { courseId: f.course.id });
  f.repo.save(f.course, { status: "CLOSED" });
  vi.advanceTimersByTime(10000);
  const ended = f.run(f.a, "sports.session.end", {
    id: s.id,
    version: s.version,
  });
  expect(sessionProjection(ended, Date.now()).data.elapsedMilliseconds).toBe(
    10000,
  );
  expect(() =>
    f.run(f.a, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("不能开始新运动");
});
it("日时间窗与常规截止不是客户端可改字段", () => {
  const f = setup();
  vi.setSystemTime(new Date("2026-10-11T23:00:00+08:00"));
  const evening = login(f.db, f.a.account.email, "Sports-test-123");
  expect(() =>
    f.run(evening, "sports.session.start", {
      courseId: f.course.id,
      now: "2026-10-11T10:00:00+08:00",
    }),
  ).toThrow("当日运动时间");
  vi.setSystemTime(new Date("2027-01-01T10:00:00+08:00"));
  // Refresh login because sessions expire after twelve hours.
  const next = login(f.db, f.a.account.email, "Sports-test-123");
  expect(() =>
    f.run(next, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("补练窗口");
});
