import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { sportsWorkspace } from "../server/sports/courses";

const databases: Database[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
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

it("教师CSV预览后整批建立，独立账号携带首次改密门禁且密码不存业务记录", () => {
  const f = setup();
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", "school.example.test");
  const batch = f.run(f.admin, "sports.teachers.preview", {
    csv: 'employee_id,name,email,college\r\n001,"张,老师",one@school.example.test,体育\r\n002,李老师,two@school.example.test,体育',
  });
  expect(batch.data.canCreate).toBe(true);
  const secret = "Batch-Secret-987";
  const created = f.run(f.admin, "sports.teachers.create", {
    id: batch.id,
    version: batch.version,
    confirmed: true,
    initialPassword: secret,
    confirmPassword: secret,
  });
  expect(created.data.status).toBe("CREATED");
  const teacher = login(f.db, "one@school.example.test", secret);
  expect(teacher.account.name).toBe("张,老师");
  expect(() => f.run(teacher, "sports.course.save", f.courseInput)).toThrow(
    "初始密码",
  );
  expect(JSON.stringify(f.repo.all("sportsTeacherImport"))).not.toContain(
    secret,
  );
  expect(
    JSON.stringify(f.db.prepare("SELECT * FROM audit").all()),
  ).not.toContain(secret);
  expect(
    f.repo.all("sportsIdentity").filter((i) => i.data.importId === batch.id),
  ).toHaveLength(2);
});
it("教师CSV错误和预览后冲突整批拒绝，未知学校域名及密码列不会默认放行", () => {
  const f = setup();
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", "");
  const csv =
    "employee_id,name,email\n01,A,a@school.example.test\n02,B,b@school.example.test";
  expect(() => f.run(f.admin, "sports.teachers.preview", { csv })).toThrow(
    "尚未配置",
  );
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", "school.example.test");
  expect(() =>
    f.run(f.admin, "sports.teachers.preview", {
      csv: csv.replace("email\n", "email,password\n"),
    }),
  ).toThrow("不得包含密码");
  const invalid = f.run(f.admin, "sports.teachers.preview", {
    csv: csv.replace("b@school.example.test", "a@school.example.test"),
  });
  expect(invalid.data.canCreate).toBe(false);
  const batch = f.run(f.admin, "sports.teachers.preview", { csv });
  createAccount(f.db, {
    email: "b@school.example.test",
    name: "existing",
    password: "Existing-123",
  });
  expect(() =>
    f.run(f.admin, "sports.teachers.create", {
      id: batch.id,
      version: batch.version,
      confirmed: true,
      initialPassword: "Initial-123",
      confirmPassword: "Initial-123",
    }),
  ).toThrow("整批未建立");
  expect(
    f.db
      .prepare("SELECT id FROM accounts WHERE email=?")
      .get("a@school.example.test"),
  ).toBeUndefined();
  expect(f.repo.get(batch.id).data.status).toBe("PREVIEW");
});

it("学生反馈仅本人和授权管理员可见，回复关闭后可追加跟进且历史不覆盖", async () => {
  const f = setup();
  const { feedbackWorkspace } = await import("../server/sports/feedback");
  const feedback = f.run(f.student, "sports.feedback.submit", {
    type: "ACCESSIBILITY",
    description: "键盘无法操作某按钮",
    status: "CLOSED",
    assignedTo: f.teacher.account.id,
  });
  expect(feedback.data.status).toBe("NEW");
  expect(feedback.data.assignedTo).toBeUndefined();
  expect(feedbackWorkspace(f.repo, f.teacher.account).feedback).toEqual([]);
  f.repo.create("sportsIdentity", f.ordinary.account.id, {
    role: "student",
    status: "verified",
  });
  expect(feedbackWorkspace(f.repo, f.ordinary.account).feedback).toEqual([]);
  expect(() =>
    f.run(f.teacher, "sports.feedback.reply", {
      id: feedback.id,
      version: feedback.version,
      status: "RESOLVED",
      reply: "越权",
    }),
  ).toThrow("管理权限");
  const closed = f.run(f.admin, "sports.feedback.reply", {
    id: feedback.id,
    version: feedback.version,
    status: "CLOSED",
    reply: "已修复，请重新检查",
  });
  f.run(f.admin, "sports.feedback.reply", {
    id: closed.id,
    version: closed.version,
    status: "TECHNICAL",
    reply: "收到复现说明，继续排查",
  });
  const studentView = feedbackWorkspace(f.repo, f.student.account);
  expect(studentView.feedback[0].data.status).toBe("TECHNICAL");
  expect(studentView.feedbackReplies).toHaveLength(2);
  expect(studentView.feedback[0].data.email).toBeUndefined();
  expect(f.repo.all("sportsRecord")).toHaveLength(0);
  expect(f.repo.all("sportsEnrollment")).toHaveLength(0);
  expect(() =>
    f.run(f.admin, "sports.feedback.reply", {
      id: closed.id,
      version: closed.version,
      status: "PROCESSING",
      reply: "旧请求",
    }),
  ).toThrow("已变化");
});
it("反馈状态必须伴随公开回复，不能回待受理，撤销反馈权限立即拒绝", () => {
  const f = setup();
  const feedback = f.run(f.student, "sports.feedback.submit", {
    type: "BUG",
    description: "测试问题",
  });
  const input = {
    id: feedback.id,
    version: feedback.version,
    status: "PROCESSING",
    reply: " ",
  };
  expect(() => f.run(f.admin, "sports.feedback.reply", input)).toThrow("reply");
  expect(() =>
    f.run(f.admin, "sports.feedback.reply", {
      ...input,
      status: "NEW",
      reply: "回退",
    }),
  ).toThrow("status");
  f.db
    .prepare("UPDATE accounts SET roles='[]' WHERE id=?")
    .run(f.admin.account.id);
  expect(() =>
    f.run(f.admin, "sports.feedback.reply", { ...input, reply: "无权限" }),
  ).toThrow("管理权限");
  expect(f.repo.get(feedback.id).data.status).toBe("NEW");
  expect(f.repo.all("sportsFeedbackReply")).toHaveLength(0);
});

it("双语帮助发布校验、单语言公开、下线与重新上线保持同一文章和历史", async () => {
  const f = setup();
  const { helpRead } = await import("../server/sports/help");
  const fields = {
    titleZh: "帮助",
    titleEn: "Help",
    bodyZh: "",
    bodyEn: "",
    keywords: "",
    category: "LOGIN",
    weight: -1.25,
  };
  let article = f.run(f.admin, "sports.help.save", fields);
  expect(helpRead(f.repo, f.student.account, "zh").articles).toEqual([]);
  expect(() =>
    f.run(f.admin, "sports.help.state", {
      id: article.id,
      version: article.version,
      updatedAt: article.updatedAt,
      status: "published",
    }),
  ).toThrow("完整中英文");
  article = f.run(f.admin, "sports.help.save", {
    ...fields,
    id: article.id,
    version: article.version,
    updatedAt: article.updatedAt,
    bodyZh: "中文正文",
    bodyEn: "English body",
    keywords: "验证码， code,验证码, ",
    publish: true,
  });
  const zh = helpRead(f.repo, f.student.account, "zh").articles[0];
  expect(zh.data).toEqual({
    title: "帮助",
    body: "中文正文",
    category: "LOGIN",
  });
  expect(helpRead(f.repo, f.student.account, "en").articles[0].data.body).toBe(
    "English body",
  );
  const first = article.data.firstPublishedAt;
  article = f.run(f.admin, "sports.help.state", {
    id: article.id,
    version: article.version,
    updatedAt: article.updatedAt,
    status: "archived",
  });
  expect(helpRead(f.repo, f.student.account, "en").articles).toEqual([]);
  article = f.run(f.admin, "sports.help.state", {
    id: article.id,
    version: article.version,
    updatedAt: article.updatedAt,
    status: "published",
  });
  expect(article.data.firstPublishedAt).toBe(first);
  expect(f.repo.all("sportsHelpHistory")).toHaveLength(4);
  expect(f.repo.all("sportsHelp")).toHaveLength(1);
});
it("帮助管理权限、并发版本和发布内容完整性不能绕过", async () => {
  const f = setup();
  const { helpRead } = await import("../server/sports/help");
  const fields = {
    titleZh: "标题",
    titleEn: "Title",
    bodyZh: "正文",
    bodyEn: "Body",
    keywords: "test",
    category: "LOGIN",
    weight: 0.5,
    publish: true,
  };
  expect(() => f.run(f.teacher, "sports.help.save", fields)).toThrow(
    "管理权限",
  );
  expect(() => helpRead(f.repo, f.teacher.account, "zh")).toThrow("体育身份");
  const article = f.run(f.admin, "sports.help.save", fields);
  const input = {
    ...fields,
    id: article.id,
    version: article.version,
    updatedAt: article.updatedAt,
  };
  expect(() =>
    f.run(f.admin, "sports.help.save", { ...input, bodyEn: " " }),
  ).toThrow("完整中英文");
  expect(() =>
    f.run(f.admin, "sports.help.save", { ...input, updatedAt: "stale" }),
  ).toThrow("已更新");
  expect(() =>
    f.run(f.admin, "sports.help.state", { ...input, status: "draft" }),
  ).toThrow("status");
  expect(f.repo.get(article.id)).toEqual(article);
  expect(f.repo.all("sportsHelpHistory")).toHaveLength(1);
});

it("用户确认的正式教师邮箱默认域名为bnbu.edu.cn，测试域名不会混入正式默认", () => {
  const f = setup();
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", undefined);
  const batch = f.run(f.admin, "sports.teachers.preview", {
    csv: "employee_id,name,email\nT001,教师,t001@bnbu.edu.cn",
  });
  expect(batch.data.canCreate).toBe(true);
  const wrong = f.run(f.admin, "sports.teachers.preview", {
    csv: "employee_id,name,email\nT002,测试,t002@example.test",
  });
  expect(wrong.data.canCreate).toBe(false);
});

it("耐力跑四表初始化404行，闭区间边界与等级精确且学生不取得规则", async () => {
  const f = setup();
  const { convertEndurance, conversionWorkspace } =
    await import("../server/sports/conversion");
  expect(f.repo.all("sportsConversionTable")).toHaveLength(4);
  expect(
    f.repo
      .all("sportsConversionTable")
      .reduce((sum, t) => sum + (t.data.rows as unknown[]).length, 0),
  ).toBe(404);
  expect(convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 239).score).toBe(100);
  expect(convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 240).score).toBe(99);
  expect(convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 536).score).toBe(1);
  expect(convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 537).score).toBe(0);
  expect(convertEndurance(f.repo, "FEMALE", "JUNIOR", 800, 230).score).toBe(99);
  expect(() => convertEndurance(f.repo, "MALE", "JUNIOR", 800, 240)).toThrow(
    "无法唯一选择",
  );
  expect(() => convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 601)).toThrow(
    "无法唯一匹配",
  );
  expect(
    conversionWorkspace(f.repo, f.student.account).conversionTables,
  ).toEqual([]);
});
it("换算表编辑整表验证及版本冲突，历史结果不被修改", async () => {
  const f = setup();
  const { convertEndurance } = await import("../server/sports/conversion");
  let table = f.repo
    .all("sportsConversionTable")
    .find((t) => t.data.key === "MALE_JUNIOR")!;
  const original = convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 240);
  const row = (
    table.data.rows as {
      id: string;
      min: number;
      max: number;
      score: number;
      grade: string;
      note: string;
    }[]
  )[1];
  const input = { ...row, id: table.id, version: table.version, rowId: row.id };
  expect(() =>
    f.run(f.admin, "sports.conversion.edit", { ...input, min: 241 }),
  ).toThrow("不能间断");
  expect(() =>
    f.run(f.admin, "sports.conversion.edit", { ...input, grade: "FAIL" }),
  ).toThrow("等级");
  expect(() =>
    f.run(f.admin, "sports.conversion.remove", { ...input, confirmed: true }),
  ).toThrow("不能间断");
  expect(() => f.run(f.teacher, "sports.conversion.edit", input)).toThrow(
    "管理权限",
  );
  table = f.run(f.admin, "sports.conversion.edit", {
    ...input,
    score: 100,
    note: "确认调整",
  });
  expect(convertEndurance(f.repo, "MALE", "JUNIOR", 1000, 240).score).toBe(100);
  expect(original.score).toBe(99);
  expect(f.repo.all("sportsConversionHistory")).toHaveLength(1);
  expect(() => f.run(f.admin, "sports.conversion.edit", input)).toThrow(
    "已变化",
  );
  expect(table.version).toBe(2);
});

it("教师内部成绩接受完整INT而非0到100，发布历史保留且学生无分数或通知", async () => {
  const f = managementFixture();
  const { gradeWorkspace } = await import("../server/sports/grades");
  const count = Number(
    f.db.prepare("SELECT count(*) n FROM notifications").get()?.n,
  );
  let draft = f.run(f.teacher, "sports.grade.save", {
    enrollmentId: f.member.id,
    version: 0,
    score: 120,
  });
  const first = f.run(f.teacher, "sports.grade.publish", {
    id: draft.id,
    version: draft.version,
  });
  draft = f.repo.get(draft.id);
  draft = f.run(f.teacher, "sports.grade.save", {
    enrollmentId: f.member.id,
    version: draft.version,
    score: -5,
  });
  const second = f.run(f.teacher, "sports.grade.publish", {
    id: draft.id,
    version: draft.version,
  });
  expect(second.data).toMatchObject({
    score: -5,
    sequence: 2,
    previousId: first.id,
  });
  expect(f.repo.get(first.id).data.score).toBe(120);
  expect(gradeWorkspace(f.repo, f.student.account)).toEqual({
    gradeDrafts: [],
    gradePublications: [],
  });
  expect(gradeWorkspace(f.repo, f.admin.account)).toEqual({
    gradeDrafts: [],
    gradePublications: [],
  });
  expect(
    gradeWorkspace(f.repo, f.teacher.account).gradePublications,
  ).toHaveLength(2);
  expect(
    Number(f.db.prepare("SELECT count(*) n FROM notifications").get()?.n),
  ).toBe(count);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
});
it("最终成绩拒绝备注、非整数、越权、陈旧版本和结算后直接覆盖", () => {
  const f = managementFixture(),
    input = { enrollmentId: f.member.id, version: 0, score: 1 };
  expect(() => f.run(f.admin, "sports.grade.save", input)).toThrow("体育身份");
  expect(() =>
    f.run(f.teacher, "sports.grade.save", { ...input, note: "隐藏成绩备注" }),
  ).toThrow("不接受备注");
  expect(() =>
    f.run(f.teacher, "sports.grade.save", { ...input, score: 1.5 }),
  ).toThrow("score");
  expect(() =>
    f.run(f.teacher, "sports.grade.save", { ...input, score: 2147483648 }),
  ).toThrow("score");
  const draft = f.run(f.teacher, "sports.grade.save", input);
  expect(() => f.run(f.teacher, "sports.grade.save", input)).toThrow("已变化");
  f.repo.save(f.course, { settlementStatus: "SETTLED" });
  expect(() =>
    f.run(f.teacher, "sports.grade.publish", {
      id: draft.id,
      version: draft.version,
    }),
  ).toThrow("历史报告更正");
  expect(f.repo.all("sportsGradePublication")).toHaveLength(0);
});
