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
      roles: role === "ordinary" || role === "admin" ? ["superadmin"] : [],
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
  expect(
    f.repo
      .all("sportsCourseHistory")
      .find((event) => event.data.action === "sports.course.describe")?.data
      .before,
  ).toEqual(course.data);
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

it("服务器登记流程仅获得固定十分钟自然到期宽限，重复登记不续期", () => {
  const f = setup(),
    draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  const invite = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
    minutes: 5,
  });
  const flow = f.run(f.student, "sports.enrollment.begin", {
    code: invite.data.code,
  });
  expect(
    f.run(f.student, "sports.enrollment.begin", { code: invite.data.code }),
  ).toEqual(flow);
  vi.setSystemTime(Number(invite.data.expiresAt));
  expect(() =>
    f.run(f.student, "sports.enrollment.begin", { code: invite.data.code }),
  ).toThrow("过期");
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { code: invite.data.code }),
  ).toThrow("过期");
  vi.setSystemTime(Number(flow.data.deadline) - 1);
  const member = f.run(f.student, "sports.enrollment.join", {
    flowId: flow.id,
  });
  expect(member.data.status).toBe("ACTIVE");
  expect(f.repo.get(flow.id).data.status).toBe("COMPLETED");
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { flowId: flow.id }),
  ).toThrow("已结束");
});
it("流程严格截止且撤销立即终止宽限，不能伪造登记时间", () => {
  const f = setup(),
    draft = f.run(f.teacher, "sports.course.save", f.courseInput);
  const course = f.run(f.teacher, "sports.course.publish", {
    id: draft.id,
    version: draft.version,
  });
  const invite = f.run(f.teacher, "sports.invitation.create", {
    courseId: course.id,
    minutes: 5,
  });
  const flow = f.run(f.student, "sports.enrollment.begin", {
    code: invite.data.code,
    deadline: Date.now() + 999999999,
  });
  expect(flow.data.deadline).toBe(Number(invite.data.expiresAt) + 600000);
  vi.setSystemTime(Number(flow.data.deadline));
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { flowId: flow.id }),
  ).toThrow("过期");
  vi.setSystemTime(Number(invite.data.expiresAt) + 1);
  f.run(f.teacher, "sports.invitation.revoke", {
    id: invite.id,
    version: invite.version,
  });
  expect(() =>
    f.run(f.student, "sports.enrollment.join", { flowId: flow.id }),
  ).toThrow("过期");
  expect(
    sportsWorkspace(f.repo, f.student.account).enrollmentFlows[0].data
      .canComplete,
  ).toBe(false);
  expect(f.repo.all("sportsEnrollment")).toHaveLength(0);
});

it("分管理员按固定权限管理学期，规则权限不能发布模板，撤权立即生效", () => {
  const f = setup();
  f.db
    .prepare("UPDATE accounts SET roles=? WHERE id=?")
    .run(JSON.stringify([]), f.admin.account.id);
  const identity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.admin.account.id)!;
  expect(() =>
    f.run(f.admin, "sports.semester.create", {
      ...f.semesterInput,
      type: "SECOND",
    }),
  ).toThrow("管理权限");
  f.repo.save(identity, { permissions: ["SEMESTERS", "GLOBAL_RULES"] });
  const semester = f.run(f.admin, "sports.semester.create", {
    ...f.semesterInput,
    type: "SECOND",
  });
  expect(semester.data.status).toBe("UPCOMING");
  expect(() =>
    f.run(f.admin, "sports.template.publish", { name: "不允许下放" }),
  ).toThrow("总管理员");
  f.repo.save(f.repo.get(identity.id), { permissions: [] });
  expect(() =>
    f.run(f.admin, "sports.semester.update", {
      ...f.semesterInput,
      type: "SECOND",
      id: semester.id,
      version: semester.version,
    }),
  ).toThrow("管理权限");
  const account = login(f.db, f.admin.account.email, "Sports-test-123").account;
  expect(
    sportsWorkspace(f.repo, account).administratorAccess.permissions,
  ).toEqual([]);
});

it("体育本人改密接受短个人密码并注销其他登录，审计不保存密码", () => {
  const f = setup();
  const other = login(f.db, f.teacher.account.email, "Sports-test-123");
  const identity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.teacher.account.id)!;
  const changed = f.run(f.teacher, "sports.password.change", {
    version: identity.version,
    currentPassword: "Sports-test-123",
    newPassword: "短",
    confirmPassword: "短",
  });
  expect(changed.data.mustChangePassword).toBe(false);
  expect(() => f.run(other, "sports.course.save", f.courseInput)).toThrow(
    "登录已过期",
  );
  expect(() => login(f.db, f.teacher.account.email, "Sports-test-123")).toThrow(
    "邮箱或密码错误",
  );
  expect(login(f.db, f.teacher.account.email, "短").account.id).toBe(
    f.teacher.account.id,
  );
  expect(() =>
    f.run(f.teacher, "sports.course.save", f.courseInput),
  ).not.toThrow();
  const audit = JSON.stringify(
    f.db
      .prepare("SELECT * FROM audit WHERE action='sports.password.change'")
      .all(),
  );
  expect(audit).not.toContain("Sports-test-123");
  expect(audit).not.toContain("短");
});
it("教师维护中不能改密，管理员允许；错误原密码或不一致确认不改变凭据", () => {
  const f = setup();
  const teacherIdentity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.teacher.account.id)!;
  const base = {
    version: teacherIdentity.version,
    currentPassword: "错误",
    newPassword: "n",
    confirmPassword: "n",
  };
  expect(() => f.run(f.teacher, "sports.password.change", base)).toThrow(
    "当前密码不正确",
  );
  expect(() =>
    f.run(f.teacher, "sports.password.change", {
      ...base,
      currentPassword: "Sports-test-123",
      confirmPassword: "different",
    }),
  ).toThrow("不一致");
  f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  expect(() =>
    f.run(f.teacher, "sports.password.change", {
      ...base,
      currentPassword: "Sports-test-123",
    }),
  ).toThrow("维护");
  const adminIdentity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.admin.account.id)!;
  expect(
    f.run(f.admin, "sports.password.change", {
      ...base,
      version: adminIdentity.version,
      currentPassword: "Sports-test-123",
    }).data.mustChangePassword,
  ).toBe(false);
  expect(
    login(f.db, f.teacher.account.email, "Sports-test-123").account.id,
  ).toBe(f.teacher.account.id);
});

it("首次改密拦截体育命令及既有幂等回执，改密后才恢复", () => {
  const f = setup(),
    key = randomUUID();
  execute(f.db, f.teacher.token, "sports.course.save", f.courseInput, key);
  const identity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.teacher.account.id)!;
  const gated = f.repo.save(identity, { mustChangePassword: true });
  expect(() =>
    execute(f.db, f.teacher.token, "sports.course.save", f.courseInput, key),
  ).toThrow("初始密码");
  expect(() => sportsWorkspace(f.repo, f.teacher.account)).toThrow("初始密码");
  f.run(f.teacher, "sports.password.change", {
    version: gated.version,
    currentPassword: "Sports-test-123",
    newPassword: "personal",
    confirmPassword: "personal",
  });
  expect(() =>
    execute(f.db, f.teacher.token, "sports.course.save", f.courseInput, key),
  ).not.toThrow();
});
it("首次改密HTTP只返回必要状态，媒体请求被阻断且管理员维护门禁不能绕过", async () => {
  vi.useRealTimers();
  const f = setup();
  vi.useRealTimers();
  // Renew the test login against the real clock for HTTP I/O.
  const teacher = login(f.db, f.teacher.account.email, "Sports-test-123");
  const identity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === teacher.account.id)!;
  f.repo.save(identity, { mustChangePassword: true });
  const { createApiServer } = await import("../server/main");
  const server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = (server.address() as { port: number }).port;
    const headers = { Cookie: `bnbu_session=${teacher.token}` };
    const response = await fetch(
      `http://127.0.0.1:${port}/api/sports/workspace`,
      { headers },
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.firstLoginOnly).toBe(true);
    expect(body.courses).toBeUndefined();
    expect(body.system.canManage).toBe(false);
    expect(body.system.history).toEqual([]);
    const general = await fetch(`http://127.0.0.1:${port}/api/workspace`, {
      headers,
    });
    const generalBody = await general.json();
    expect(generalBody.firstLoginOnly).toBe(true);
    expect(generalBody.audit).toEqual([]);
    expect(generalBody.entities).toEqual([]);
    expect(() =>
      f.run(teacher, "notification.read", { id: "blocked" }),
    ).toThrow("初始密码");
    const media = await fetch(
      `http://127.0.0.1:${port}/api/sports/materials/00000000-0000-0000-0000-000000000000`,
      { headers },
    );
    expect(media.status).toBe(403);
    expect((await media.json()).code).toBe("PASSWORD_CHANGE_REQUIRED");
    const admin = login(f.db, f.admin.account.email, "Sports-test-123");
    const adminIdentity = f.repo
      .all("sportsIdentity")
      .find((i) => i.ownerId === admin.account.id)!;
    f.repo.save(adminIdentity, { mustChangePassword: true });
    f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect(() =>
      f.run(admin, "sports.ai.manual", { courseId: "irrelevant" }),
    ).toThrow("初始密码");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
