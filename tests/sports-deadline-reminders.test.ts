import { afterEach, expect, it, vi } from "vitest";
import { openDatabase, type Database, transaction } from "../server/database";
import { createAccount } from "../server/auth";
import { Repository } from "../server/repository";
import { checkDeadlineReminders } from "../server/sports/deadline-reminders";
import { processSportsReview } from "../server/sports/review-worker";
const dbs: Database[] = [];
afterEach(() => {
  vi.useRealTimers();
  dbs.splice(0).forEach((d) => d.close());
});
const due = Date.parse("2030-01-17T00:00:00+08:00");
function setup() {
  vi.useFakeTimers();
  vi.setSystemTime(due - 1);
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const teacher = createAccount(db, {
    email: "teacher@example.test",
    name: "teacher",
    password: "Password123",
    roles: [],
  });
  const semester = repo.create("sportsSemester", teacher, {
    status: "CURRENT",
  });
  const course = repo.create("sportsCourse", teacher, {
    name: "测试课程",
    semesterId: semester.id,
    status: "PUBLISHED",
    deadlineDate: "2030-01-31",
    relatedTarget: 600,
    otherTarget: 600,
    threshold: 30,
    weeklyLimit: 2,
  });
  const students = ["unfinished", "completed"].map((name, i) => {
    const id = createAccount(db, {
      email: name + "@example.test",
      name,
      password: "Password123",
      roles: [],
    });
    repo.create("sportsIdentity", id, {
      role: "student",
      status: "verified",
      studentNumber: "S" + i,
      schoolEmail: name + "@example.test",
      schoolEmailVerified: true,
    });
    const member = repo.create("sportsEnrollment", id, {
      courseId: course.id,
      status: "ACTIVE",
    });
    repo.create("sportsExemption", id, {
      courseId: course.id,
      enrollmentId: member.id,
      status: "APPROVED",
    });
    repo.create("sportsGradePublication", id, {
      courseId: course.id,
      enrollmentId: member.id,
      score: 987654,
    });
    if (i === 1)
      for (const category of ["RELATED", "OTHER"])
        repo.create("sportsCertification", id, {
          courseId: course.id,
          category,
          minutes: 600,
          status: "VALID",
        });
    return { id, member };
  });
  const snapshot = repo.create("sportsRosterSnapshot", teacher, {
    courseId: course.id,
    rows: [
      {
        row: 2,
        studentNumber: "S0",
        name: "unfinished",
        excluded: false,
        columnError: false,
      },
      {
        row: 3,
        studentNumber: "S1",
        name: "completed",
        excluded: false,
        columnError: false,
      },
    ],
  });
  repo.create("sportsRosterBasis", teacher, {
    courseId: course.id,
    snapshotId: snapshot.id,
  });
  return {
    db,
    repo,
    teacher,
    semester,
    course,
    students,
    check: () => transaction(db, () => checkDeadlineReminders(repo)),
  };
}
it("截止前14天上海零点触发，仅提醒未完成学生；重复扫描/已读不重发且不披露分数", () => {
  const f = setup();
  f.check();
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(0);
  vi.setSystemTime(due);
  f.check();
  const markers = f.repo.all("sportsDeadlineReminder");
  expect(markers).toHaveLength(1);
  expect(markers[0].ownerId).toBe(f.students[0].id);
  expect(markers[0].data).toMatchObject({
    dueAt: due,
    sentAt: due,
    recipientRole: "student",
  });
  const notices = f.db.prepare("SELECT * FROM notifications").all();
  expect(notices).toHaveLength(1);
  expect(String(notices[0].body)).toContain("课程相关还差600分钟");
  expect(JSON.stringify(notices)).not.toContain("987654");
  f.db
    .prepare("UPDATE notifications SET read_at=?")
    .run(new Date().toISOString());
  f.check();
  expect(f.db.prepare("SELECT COUNT(*) n FROM notifications").get()?.n).toBe(1);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
});
it("教师有待办才提醒，晚进入提醒窗口使用真实发送时间，课程结束/移出不开放运动权限", () => {
  const f = setup();
  f.repo.save(f.course, { status: "CLOSED" });
  f.repo.save(f.students[0].member, { status: "REMOVED" });
  f.repo.create("sportsApplication", f.students[0].id, {
    courseId: f.course.id,
    status: "SUBMITTED",
  });
  vi.setSystemTime(due + 5 * 86400000);
  f.check();
  const markers = f.repo.all("sportsDeadlineReminder");
  expect(markers).toHaveLength(1);
  expect(markers[0].ownerId).toBe(f.teacher);
  expect(markers[0].data.sentAt).toBe(due + 5 * 86400000);
  expect(markers[0].data.dueAt).toBe(due);
  expect(f.repo.get(f.course.id).data.status).toBe("CLOSED");
  expect(f.repo.get(f.students[0].member.id).data.status).toBe("REMOVED");
  expect(f.repo.all("sportsMakeup")).toHaveLength(0);
});
it("实际worker在维护恢复后补发当前提醒，不回填过去；归档/结算不生成新提醒", async () => {
  const f = setup();
  const mode = f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  vi.setSystemTime(due);
  await processSportsReview(f.db, {});
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(0);
  vi.setSystemTime(due + 10000);
  f.repo.save(mode, { mode: "NORMAL" });
  await processSportsReview(f.db, {});
  expect(f.repo.all("sportsDeadlineReminder")[0].data.sentAt).toBe(due + 10000);
  const second = f.repo.create("sportsCourse", f.teacher, {
    ...f.course.data,
    status: "PUBLISHED",
    settlementStatus: "SETTLED",
  });
  checkDeadlineReminders(f.repo, Date.now(), second);
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(1);
  f.repo.save(f.semester, { status: "ARCHIVED" });
  f.repo.save(second, { settlementStatus: "PENDING" });
  checkDeadlineReminders(f.repo, Date.now(), f.repo.get(second.id));
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(1);
});
it("通知保存失败会回滚提醒标记，后续可重试而不吞掉提醒", () => {
  const f = setup();
  vi.setSystemTime(due);
  f.db.exec(
    "CREATE TRIGGER reject_notice BEFORE INSERT ON notifications BEGIN SELECT RAISE(ABORT,'notification unavailable'); END;",
  );
  expect(() => f.check()).toThrow("notification unavailable");
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(0);
  f.db.exec("DROP TRIGGER reject_notice");
  f.check();
  expect(f.repo.all("sportsDeadlineReminder")).toHaveLength(1);
});
