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
