import { afterEach, expect, it } from "vitest";
import { openDatabase, type Database } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { accountDirectory } from "../backend/src/sports/account-directory";
import { createApiServer } from "../backend/src/main";
const dbs: Database[] = [];
afterEach(() => dbs.splice(0).forEach((d) => d.close()));
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  function make(name: string, role: string) {
    const email = name + "@example.test";
    const id = createAccount(db, {
      email,
      name,
      password: "Test-password-123",
      roles: [],
    });
    const identity = repo.create("sportsIdentity", id, {
      role,
      status: "verified",
      permissions: role === "admin" ? ["ACCOUNTS"] : [],
      college: "理工学院",
      studentNumber: role === "student" ? name : undefined,
      employeeId: role === "teacher" ? "T001" : undefined,
      schoolEmail: email,
      schoolEmailVerified: true,
      privateNote: "DO_NOT_EXPOSE",
      major: "计算机",
      administrativeClass: "一班",
    });
    return { ...login(db, email, "Test-password-123"), identity };
  }
  const admin = make("admin", "admin"),
    teacher = make("teacher", "teacher"),
    student = make("student", "student"),
    pending = make("pending", "student");
  const semester = repo.create("sportsSemester", admin.account.id, {
    status: "CURRENT",
  });
  const course = repo.create("sportsCourse", teacher.account.id, {
    semesterId: semester.id,
  });
  const member = repo.create("sportsEnrollment", student.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  repo.create("sportsGradePublication", student.account.id, {
    score: 987654,
    remark: "SECRET_GRADE",
  });
  return {
    db,
    repo,
    admin,
    teacher,
    student,
    pending,
    semester,
    course,
    member,
  };
}
it("账号只读投影不泄露凭据或教学事实，当前学期关系决定学生状态", () => {
  const f = setup(),
    before = f.db.prepare("SELECT * FROM entities ORDER BY id").all();
  const page = accountDirectory(f.repo, f.admin.account, "student", {});
  expect(page.total).toBe(2);
  expect(page.items.find((r) => r.id === f.student.account.id)).toMatchObject({
    status: "ACTIVE",
    studentNumber: "student",
    verifiedEmail: "student@example.test",
  });
  expect(page.items.find((r) => r.id === f.pending.account.id)?.status).toBe(
    "PENDING",
  );
  expect(JSON.stringify(page)).not.toMatch(
    /password|hash|987654|SECRET_GRADE|DO_NOT_EXPOSE|permissions/,
  );
  expect(f.db.prepare("SELECT * FROM entities ORDER BY id").all()).toEqual(
    before,
  );
  f.repo.save(f.member, { status: "REMOVED" });
  expect(
    accountDirectory(f.repo, f.admin.account, "student", {
      id: f.student.account.id,
    }).items[0].status,
  ).toBe("PENDING");
  f.repo.save(f.repo.get(f.member.id), { status: "ACTIVE" });
  f.repo.save(f.semester, { status: "ARCHIVED" });
  expect(
    accountDirectory(f.repo, f.admin.account, "student", { status: "ACTIVE" })
      .total,
  ).toBe(0);
  f.db
    .prepare("UPDATE accounts SET email=? WHERE id=?")
    .run("changed@example.test", f.student.account.id);
  expect(
    accountDirectory(f.repo, f.admin.account, "student", {
      id: f.student.account.id,
    }).items[0].verifiedEmail,
  ).toBeNull();
});
it("搜索筛选分页可组合，过期游标、重复身份和非法学生状态不静默合并", () => {
  const f = setup(),
    read = (input: Record<string, unknown>) =>
      accountDirectory(f.repo, f.admin.account, "student", input);
  expect(read({ q: "计算机", college: "理工学院" }).total).toBe(2);
  expect(read({ q: "STUDENT", status: "ACTIVE" }).total).toBe(1);
  const first = read({ limit: "1" }),
    second = read({ limit: "1", cursor: first.nextCursor });
  expect(first.nextCursor).toBeTruthy();
  expect(second.nextCursor).toBeNull();
  expect(new Set([...first.items, ...second.items].map((r) => r.id)).size).toBe(
    2,
  );
  expect(() => read({ cursor: "missing" })).toThrow("分页基准");
  expect(() => read({ status: "DISABLED" })).toThrow("筛选状态");
  expect(() => read({ limit: 101 })).toThrow();
  expect(() => read({ password: "x" })).toThrow();
  f.repo.create("sportsIdentity", f.student.account.id, {
    role: "student",
    status: "verified",
  });
  expect(() => read({})).toThrow("重复");
});
it("教师三种状态只读；授权和首次改密即时生效，外部体育维护不影响伴学", () => {
  const f = setup(),
    read = () => accountDirectory(f.repo, f.admin.account, "teacher", {});
  expect(read().items[0]).toMatchObject({
    status: "ACTIVE",
    employeeId: "T001",
  });
  f.repo.save(f.teacher.identity, { accountState: "RECOVERY_REQUIRED" });
  expect(read().items[0].status).toBe("RECOVERY_REQUIRED");
  f.db
    .prepare("UPDATE accounts SET status='banned' WHERE id=?")
    .run(f.teacher.account.id);
  expect(read().items[0].status).toBe("DISABLED");
  for (const actor of [f.student.account, f.teacher.account])
    expect(() => accountDirectory(f.repo, actor, "student", {})).toThrow(
      "管理权限",
    );
  f.repo.save(f.admin.identity, { mustChangePassword: true });
  expect(read).toThrow("初始密码");
  f.repo.save(f.repo.get(f.admin.identity.id), {
    mustChangePassword: false,
    permissions: [],
  });
  expect(read).toThrow("管理权限");
  f.repo.save(f.repo.get(f.admin.identity.id), { permissions: ["ACCOUNTS"] });
  f.repo.create("sportsSystem", f.admin.account.id, { mode: "MAINTENANCE" });
  expect(read().items[0].status).toBe("DISABLED");
});
it("HTTP读取校验当前登录和权限、禁止缓存，不提供修改账号入口", async () => {
  const f = setup(),
    server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base =
    "http://127.0.0.1:" +
    (server.address() as { port: number }).port +
    "/api/sports/accounts/students";
  try {
    expect((await fetch(base)).status).toBe(401);
    expect(
      (
        await fetch(base, {
          headers: { Cookie: "bnbu_session=" + f.student.token },
        })
      ).status,
    ).toBe(403);
    const headers = { Cookie: "bnbu_session=" + f.admin.token };
    const good = await fetch(base, { headers });
    expect(good.status).toBe(200);
    expect(good.headers.get("cache-control")).toBe("no-store");
    expect(await good.text()).not.toContain("DO_NOT_EXPOSE");
    expect((await fetch(base, { method: "POST", headers })).status).not.toBe(
      200,
    );
    f.repo.save(f.admin.identity, { permissions: [] });
    expect((await fetch(base, { headers })).status).toBe(403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
