import { expect, it } from "vitest";
import { openDatabase } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { portalLogin, portalMe, portalSecurity } from "../backend/src/sports/portal";
import { createApiServer } from "../backend/src/main";

it("原版登录保留独立管理账号与个人邮箱账号隔离，不猜测冲突身份", () => {
  const db = openDatabase(":memory:");
  try {
    const repo = new Repository(db);
    const personal = createAccount(db, {
      email: "same@example.test",
      password: "Personal-password-123",
      name: "个人",
      roles: [],
    });
    const admin = createAccount(db, {
      email: "admin-temp@example.test",
      password: "Admin-password-123",
      name: "管理",
      roles: [],
    });
    db.prepare(
      "UPDATE accounts SET login_kind='ADMIN',login_name='independent.admin',email='same@example.test' WHERE id=?",
    ).run(admin);
    repo.create("sportsIdentity", personal, {
      role: "teacher",
      status: "verified",
    });
    repo.create("sportsIdentity", admin, {
      role: "admin",
      status: "verified",
      permissions: ["HELP"],
    });
    expect(
      portalLogin(db, "independent.admin", "Admin-password-123").user,
    ).toMatchObject({ id: admin, role: "ADMIN" });
    expect(
      portalLogin(db, "same@example.test", "Personal-password-123").user,
    ).toMatchObject({ id: personal, role: "TEACHER" });
    expect(() =>
      portalLogin(db, "same@example.test", "Admin-password-123"),
    ).toThrow();
    db.prepare(
      "UPDATE accounts SET login_name='same@example.test' WHERE id=?",
    ).run(admin);
    expect(() =>
      portalLogin(db, "same@example.test", "Admin-password-123"),
    ).toThrow(/登录类型/);
  } finally {
    db.close();
  }
});

it("原版登录和首改复用真实密码、幂等命令与会话撤销", async () => {
  const db = openDatabase(":memory:"),
    server = createApiServer(db);
  try {
    const repo = new Repository(db);
    const id = createAccount(db, {
      email: "first-portal@example.test",
      password: "Original-password-123",
      name: "教师",
      roles: [],
    });
    repo.create("sportsIdentity", id, {
      role: "teacher",
      status: "verified",
      mustChangePassword: true,
    });
    const other = login(
      db,
      "first-portal@example.test",
      "Original-password-123",
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    const post = (
      path: string,
      body: unknown,
      cookie = "",
      key = "portal-password-change",
    ) =>
      fetch(base + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://127.0.0.1:4186",
          Cookie: cookie,
          "Idempotency-Key": key,
        },
        body: JSON.stringify(body),
      });
    expect(
      (
        await post("/auth/password-login", {
          account: "first-portal@example.test",
          password: "wrong",
        })
      ).status,
    ).toBe(401);
    const logged = await post("/auth/password-login", {
      account: "first-portal@example.test",
      password: "Original-password-123",
    });
    expect(logged.status).toBe(200);
    expect(await logged.json()).toEqual({
      data: { user: { id, role: "TEACHER", status: "ACTIVE", version: 1 } },
    });
    const cookie = logged.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(
      (await fetch(base + "/me", { headers: { Cookie: cookie } })).status,
    ).toBe(403);
    const input = {
      currentPassword: "Original-password-123",
      newPassword: "Changed-password-123",
      confirmPassword: "Changed-password-123",
      expectedVersion: 1,
    };
    expect(
      (
        await post(
          "/auth/own-password",
          { ...input, currentPassword: "wrong" },
          cookie,
          "wrong-password-attempt",
        )
      ).status,
    ).toBe(403);
    const changed = await post("/auth/own-password", input, cookie);
    expect(changed.status).toBe(200);
    expect(await changed.json()).toMatchObject({
      data: { userId: id, version: 2, mustChangePassword: false },
    });
    expect((await post("/auth/own-password", input, cookie)).status).toBe(200);
    expect(
      (await fetch(base + "/me", { headers: { Cookie: cookie } })).status,
    ).toBe(200);
    expect(
      (
        await fetch(base + "/me", {
          headers: { Cookie: `bnbu_session=${other.token}` },
        })
      ).status,
    ).toBe(401);
    expect(() =>
      login(db, "first-portal@example.test", "Original-password-123"),
    ).toThrow();
    expect(
      login(db, "first-portal@example.test", "Changed-password-123").account.id,
    ).toBe(id);
    const studentId = createAccount(db, {
      email: "not-teacher@example.test",
      password: "Original-password-123",
      name: "学生",
      roles: [],
    });
    expect(
      (
        await post("/auth/password-login", {
          account: "not-teacher@example.test",
          password: "Original-password-123",
        })
      ).status,
    ).toBe(403);
    expect(
      db
        .prepare("SELECT COUNT(*) AS n FROM sessions WHERE account_id=?")
        .get(studentId)?.n,
    ).toBe(0);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("原版接口使用共享 HttpOnly 会话，拒绝匿名并返回 data 协议", async () => {
  const db = openDatabase(":memory:");
  const server = createApiServer(db);
  try {
    const id = createAccount(db, {
      email: "teacher-portal@example.test",
      password: "Test-password-123",
      name: "教师",
      roles: [],
    });
    new Repository(db).create("sportsIdentity", id, {
      role: "teacher",
      status: "verified",
    });
    const session = login(
      db,
      "teacher-portal@example.test",
      "Test-password-123",
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    expect((await fetch(`${base}/me`)).status).toBe(401);
    const headers = { Cookie: `bnbu_session=${session.token}` };
    const me = await fetch(`${base}/me`, { headers });
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({
      data: { user: { id, role: "TEACHER" }, adminProfile: null },
    });
    const security = await fetch(`${base}/auth/account-security`, { headers });
    expect(await security.json()).toMatchObject({
      data: { userId: id, adminKind: null, permissions: [] },
    });
    const logout = await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Origin: "http://127.0.0.1:4186",
      },
      body: "{}",
    });
    expect(logout.status).toBe(200);
    expect(await logout.json()).toEqual({ data: null });
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");
    expect((await fetch(`${base}/me`, { headers })).status).toBe(401);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("原版页面权限来自当前身份，首改仅开放安全投影，不泄露内部字段", () => {
  const db = openDatabase(":memory:");
  try {
    const repo = new Repository(db);
    const id = createAccount(db, {
      email: "portal@example.test",
      password: "Test-password-123",
      name: "管理测试",
      roles: [],
    });
    const actor = login(db, "portal@example.test", "Test-password-123").account;
    expect(() => portalSecurity(repo, actor)).toThrow();
    let identity = repo.create("sportsIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: ["ACCOUNTS", "HELP", "INVALID"],
      mustChangePassword: true,
      privateNote: "SECRET",
    });
    expect(portalSecurity(repo, actor)).toMatchObject({
      mustChangePassword: true,
      adminKind: "SUB",
      permissions: ["USER_ACCOUNTS", "HELP_CENTER"],
    });
    expect(() => portalMe(repo, actor)).toThrow(/初始密码/);
    identity = repo.save(identity, { mustChangePassword: false });
    const me = portalMe(repo, actor);
    expect(me.user.role).toBe("ADMIN");
    expect(me.teacherProfile).toBeNull();
    expect(JSON.stringify(me)).not.toMatch(/SECRET|password|permissions/);
    repo.save(identity, { permissions: [] });
    expect(portalSecurity(repo, actor).permissions).toEqual([]);
    expect(() =>
      portalSecurity(repo, { ...actor, status: "banned" }),
    ).toThrow();
  } finally {
    db.close();
  }
});
