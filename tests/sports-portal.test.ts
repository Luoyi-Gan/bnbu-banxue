import { expect, it } from "vitest";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { portalMe, portalSecurity } from "../server/sports/portal";
import { createApiServer } from "../server/main";

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
