import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { sportsWorkspace } from "../server/sports/courses";

const databases: Database[] = [];
afterEach(() => {
  databases.splice(0).forEach((db) => db.close());
  vi.useRealTimers();
});
function setup() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T12:00:00+08:00"));
  const db = openDatabase(":memory:");
  databases.push(db);
  const repo = new Repository(db);
  const make = (role: string) => {
    const email = `${role}@example.test`,
      password = "Sports-test-123";
    const id = createAccount(db, {
      email,
      password,
      name: role,
      roles: role === "ordinary" ? ["superadmin"] : [],
    });
    if (role !== "ordinary")
      repo.create("sportsIdentity", id, {
        role,
        status: "verified",
        source: "test-fixture",
      });
    return login(db, email, password);
  };
  const admin = make("admin"),
    teacher = make("teacher"),
    student = make("student"),
    ordinary = make("ordinary");
  const run = (
    who: typeof admin,
    action: string,
    input: Record<string, unknown>,
  ) => {
    const result = execute(db, who.token, action, input, randomUUID()) as {
      id: string;
    };
    return repo.get(result.id);
  };
  const semesterInput = {
    name: "2026秋",
    academicYear: "2026-2027",
    type: "FIRST",
    startDate: "2026-09-01",
    endDate: "2027-02-01",
  };
  const semester = run(admin, "sports.semester.create", semesterInput);
  run(admin, "sports.semester.activate", {
    id: semester.id,
    version: semester.version,
  });
  const template = run(admin, "sports.template.publish", {
    name: "V8.1基础模板",
  });
  const courseInput = {
    semesterId: semester.id,
    templateId: template.id,
    name: "羽毛球",
    description: "本地测试课程",
    threshold: 30,
    weeklyLimit: 3,
    relatedTarget: 600,
    otherTarget: 600,
    startDate: "2026-10-12",
    deadlineDate: "2026-12-31",
    settlementDate: "2027-01-08",
    startTime: "06:00",
    endTime: "22:00",
  };
  return {
    db,
    repo,
    admin,
    teacher,
    student,
    ordinary,
    run,
    semester,
    semesterInput,
    courseInput,
  };
}
it("学期、模板、课程发布、邀请码、直接入班共享同一持久业务记录", () => {
  const f = setup();
  const draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  const invite = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
  });
  const member = f.run(f.student, "sports.enrollment.join", {
    code: invite.data.code,
  });
  expect(member.data.status).toBe("ACTIVE");
  expect(sportsWorkspace(f.repo, f.student.account).courses[0].id).toBe(
    course.id,
  );
  expect(sportsWorkspace(f.repo, f.student.account).invitations).toEqual([]);
  expect(sportsWorkspace(f.repo, f.teacher.account).enrollments[0].id).toBe(
    member.id,
  );
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { code: invite.data.code }),
  ).toThrow("已有有效");
});
it("普通伴学管理员不取得体育身份，体育管理员不能代教师开课", () => {
  const f = setup();
  expect(() =>
    f.run(f.ordinary, "sports.template.publish", { name: "越权" }),
  ).toThrow("体育身份");
  expect(() => f.run(f.admin, "sports.course.save", f.courseInput)).toThrow(
    "体育身份",
  );
});
it("不可完成计划拒绝发布，不能用分类总量相等代替类别可完成性", () => {
  const f = setup();
  // 2026-10-12..11-15: five full weeks * four dates = 20 dates.
  // 610/590 needs 11+10 dates, so total capacity 1200 alone is insufficient.
  const course = f.run(f.teacher, "sports.course.save", {
    ...f.courseInput,
    weeklyLimit: 4,
    relatedTarget: 610,
    otherTarget: 590,
    deadlineDate: "2026-11-15",
  });
  expect(() =>
    f.run(f.teacher, "sports.course.publish", {
      id: course.id,
      version: course.version,
    }),
  ).toThrow("无法完成");
  expect(f.repo.get(course.id).data.status).toBe("DRAFT");
});
it("课程发布锁定规则，过期版本不能修改，旧学期未结算不能切换", () => {
  const f = setup();
  const draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  expect(() =>
    f.run(f.teacher, "sports.course.close", {
      id: course.id,
      version: draft.version,
      reason: "关闭",
    }),
  ).toThrow("记录已变化");
  expect(() =>
    f.run(f.teacher, "sports.course.save", {
      ...f.courseInput,
      id: course.id,
      version: course.version,
    }),
  ).toThrow("已锁定");
  const semester = f.run(f.admin, "sports.semester.create", {
    ...f.semesterInput,
    type: "SECOND",
  });
  expect(() =>
    f.run(f.admin, "sports.semester.activate", {
      id: semester.id,
      version: semester.version,
    }),
  ).toThrow("未完成收尾结算");
});
it("邀请到期、撤销和课程关闭均阻止新入班，保留历史", () => {
  const f = setup();
  const draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  const invite = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
    minutes: 5,
  });
  vi.advanceTimersByTime(5 * 60000);
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { code: invite.data.code }),
  ).toThrow("已过期");
  const next = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
  });
  f.run(f.teacher, "sports.course.close", {
    id: course.id,
    version: course.version,
    reason: "停止新增",
  });
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { code: next.data.code }),
  ).toThrow("未开放");
  expect(f.repo.all("sportsInvitation")).toHaveLength(2);
});

function managementFixture() {
  const f = setup();
  const draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  const invite = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
  });
  const member = f.run(f.student, "sports.enrollment.join", {
    code: invite.data.code,
  });
  return { ...f, course, invite, member };
}
it("移出保留旧会话并阻止新起点，恢复同一成员而不复制历史", () => {
  const f = managementFixture();
  vi.setSystemTime(new Date("2026-10-12T10:00:00+08:00"));
  const student = login(f.db, f.student.account.email, "Sports-test-123"),
    teacher = login(f.db, f.teacher.account.email, "Sports-test-123");
  const session = f.run(student, "sports.session.start", {
    courseId: f.course.id,
  });
  const removed = f.run(teacher, "sports.enrollment.remove", {
    id: f.member.id,
    version: f.member.version,
    reason: "隔离测试转班",
  });
  expect(sportsWorkspace(f.repo, student.account).studentStatus).toBe(
    "PENDING",
  );
  const ended = f.run(student, "sports.session.end", {
    id: session.id,
    version: session.version,
  });
  expect((ended.data.clock as { state: string }).state).toBe("ENDED");
  expect(() =>
    f.run(student, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("有效成员");
  expect(() =>
    f.run(student, "sports.enrollment.join", { code: f.invite.data.code }),
  ).toThrow();
  const restored = f.run(teacher, "sports.enrollment.restore", {
    id: removed.id,
    version: removed.version,
    reason: "恢复原班",
  });
  expect(restored.id).toBe(f.member.id);
  expect(sportsWorkspace(f.repo, student.account).studentStatus).toBe("ACTIVE");
  expect(f.repo.all("sportsEnrollment")).toHaveLength(1);
  expect(f.repo.get(ended.id)).toEqual(ended);
  expect(f.repo.all("sportsCourseHistory")).toHaveLength(2);
});
it("恢复不覆盖已加入的新班，跨教师、原因缺失及陈旧版本均拒绝", () => {
  const f = managementFixture();
  expect(() =>
    f.run(f.student, "sports.enrollment.remove", {
      id: f.member.id,
      version: f.member.version,
      reason: "越权",
    }),
  ).toThrow("体育身份");
  expect(() =>
    f.run(f.teacher, "sports.enrollment.remove", {
      id: f.member.id,
      version: f.member.version,
      reason: " ",
    }),
  ).toThrow("reason");
  const removed = f.run(f.teacher, "sports.enrollment.remove", {
    id: f.member.id,
    version: f.member.version,
    reason: "转班",
  });
  const second = f.repo.create("sportsCourse", f.teacher.account.id, {
    ...f.course.data,
    name: "新班",
  });
  const invitation = f.run(f.teacher, "sports.invitation.create", {
    courseId: second.id,
  });
  f.run(f.student, "sports.enrollment.join", { code: invitation.data.code });
  expect(() =>
    f.run(f.teacher, "sports.enrollment.restore", {
      id: removed.id,
      version: removed.version,
      reason: "恢复",
    }),
  ).toThrow("另一个有效");
  expect(f.repo.get(removed.id)).toEqual(removed);
  expect(() =>
    f.run(f.teacher, "sports.enrollment.restore", {
      id: removed.id,
      version: 1,
      reason: "旧请求",
    }),
  ).toThrow("已变化");
  const outsider = createAccount(f.db, {
    email: "outsider@example.test",
    name: "其他教师",
    password: "Sports-test-123",
    roles: [],
  });
  f.repo.create("sportsIdentity", outsider, {
    role: "teacher",
    status: "verified",
  });
  const other = login(f.db, "outsider@example.test", "Sports-test-123");
  expect(() =>
    f.run(other, "sports.enrollment.restore", {
      id: removed.id,
      version: removed.version,
      reason: "接管",
    }),
  ).toThrow("本人负责");
});
it("入班关闭撤销原邀请，重开不复活；名称修正保留锁定规则", () => {
  const f = managementFixture();
  let course = f.run(f.teacher, "sports.course.enrollment", {
    id: f.course.id,
    version: f.course.version,
    open: false,
    reason: "停止新增成员",
  });
  expect(f.repo.get(f.invite.id).data.status).toBe("REVOKED");
  course = f.run(f.teacher, "sports.course.enrollment", {
    id: course.id,
    version: course.version,
    open: true,
    reason: "重新开放",
  });
  expect(f.repo.get(f.invite.id).data.status).toBe("REVOKED");
  expect(() =>
    f.run(f.teacher, "sports.course.describe", {
      id: course.id,
      version: course.version,
      name: "新名称",
      description: "新说明",
      reason: "勘误",
    }),
  ).toThrow("确认");
  const changed = f.run(f.teacher, "sports.course.describe", {
    id: course.id,
    version: course.version,
    name: "新名称",
    description: "新说明",
    reason: "勘误",
    confirmed: true,
    threshold: 60,
  });
  expect(changed.data.threshold).toBe(30);
  expect(changed.data.name).toBe("新名称");
  expect(f.repo.all("sportsCourseHistory").find(event => event.data.action === "sports.course.describe")?.data.before).toEqual(course.data);
});
it("指定补练仅允许七天收尾和有效成员，撤销阻止新开始但不截断原会话", () => {
  const f = managementFixture();
  const base = {
    courseId: f.course.id,
    version: f.course.version,
    enrollmentId: f.member.id,
    reason: "指定补练",
  };
  expect(() =>
    f.run(f.teacher, "sports.makeup.create", {
      ...base,
      startAt: "2026-12-31T08:00:00+08:00",
      endAt: "2027-01-01T18:00:00+08:00",
    }),
  ).toThrow("七天收尾");
  expect(() =>
    f.run(f.teacher, "sports.makeup.create", {
      ...base,
      startAt: "2027-01-07T08:00:00+08:00",
      endAt: "2027-01-08T00:00:01+08:00",
    }),
  ).toThrow("七天收尾");
  const window = f.run(f.teacher, "sports.makeup.create", {
    ...base,
    startAt: "2027-01-01T08:00:00+08:00",
    endAt: "2027-01-01T18:00:00+08:00",
  });
  vi.setSystemTime(new Date("2027-01-01T09:00:00+08:00"));
  const student = login(f.db, f.student.account.email, "Sports-test-123"),
    teacher = login(f.db, f.teacher.account.email, "Sports-test-123");
  const session = f.run(student, "sports.session.start", {
    courseId: f.course.id,
  });
  expect((session.data.clock as { businessDate: string }).businessDate).toBe(
    "2027-01-01",
  );
  f.run(teacher, "sports.makeup.revoke", {
    id: window.id,
    version: window.version,
    reason: "关闭余下窗口",
  });
  const ended = f.run(student, "sports.session.end", {
    id: session.id,
    version: session.version,
  });
  expect((ended.data.clock as { state: string }).state).toBe("ENDED");
  expect(() =>
    f.run(student, "sports.session.start", { courseId: f.course.id }),
  ).toThrow("补练窗口");
  expect(f.repo.get(f.course.id).data.deadlineDate).toBe("2026-12-31");
});
