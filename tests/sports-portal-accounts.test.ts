import { expect, it, vi } from "vitest";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { createApiServer } from "../server/main";
import {
  portalAccountPage,
  portalSubadmins,
  portalSubadminWrite,
} from "../server/sports/portal-accounts";

it("原版建号、编辑和启停复用独立管理命令，身份声明不能替代实际核验", () => {
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", "example.test");
  const db = openDatabase(":memory:"),
    repo = new Repository(db);
  try {
    const id = createAccount(db, {
      name: "总管",
      email: "owner@example.test",
      password: "Password-123",
      roles: ["superadmin"],
    });
    repo.create("sportsIdentity", id, { role: "admin", status: "verified" });
    const actor = login(db, "owner@example.test", "Password-123");
    const person = createAccount(db, {
      name: "老师",
      email: "person@example.test",
      password: "Personal-password",
      roles: [],
    });
    const input = {
      account: "independent.account",
      name: "老师",
      email: "person@example.test",
      department: "体育",
      permissions: ["USER_ACCOUNTS"],
      initialPassword: "Admin-password",
      confirmPassword: "Admin-password",
      identityVerifiedByAdmin: true,
    };
    const write = (
      target: string | undefined,
      op: "create" | "profile" | "status",
      value: Record<string, unknown>,
      key: string,
    ) => portalSubadminWrite(db, actor.token, target, op, value, key);
    expect(() =>
      write(undefined, "create", input, "portal-create-one"),
    ).toThrow(/已核验/);
    repo.create("sportsIdentity", person, {
      role: "teacher",
      status: "verified",
    });
    const created = write(undefined, "create", input, "portal-create-one");
    expect(created.id).not.toBe(person);
    expect(created.permissions).toEqual(["USER_ACCOUNTS"]);
    expect(write(undefined, "create", input, "portal-create-one").id).toBe(
      created.id,
    );
    const edited = write(
      String(created.id),
      "profile",
      {
        expectedVersion: created.version,
        name: "老师",
        email: input.email,
        department: "新部门",
        permissions: ["HELP_CENTER"],
      },
      "portal-edit-one",
    );
    expect(edited.department).toBe("新部门");
    expect(edited.permissions).toEqual(["HELP_CENTER"]);
    const status = { expectedVersion: edited.version, status: "DISABLED" };
    expect(() =>
      write(String(created.id), "status", status, "portal-disable-one"),
    ).toThrow(/移交/);
    const disabled = write(
      String(created.id),
      "status",
      { ...status, handoverCompleted: true },
      "portal-disable-one",
    );
    expect(disabled.status).toBe("DISABLED");
    expect(login(db, input.email, "Personal-password").account.id).toBe(person);
    expect(
      write(
        String(created.id),
        "status",
        { expectedVersion: disabled.version, status: "ACTIVE" },
        "portal-enable-one",
      ).status,
    ).toBe("ACTIVE");
  } finally {
    db.close();
    vi.unstubAllEnvs();
  }
});

it("原版目录协议分页、详情和当前权限均使用共享后端，隐藏私密字段", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (name: string, role: string) => {
      const id = createAccount(db, {
        name,
        email: name + "@example.test",
        password: "Password-123",
        roles: name === "super" ? ["superadmin"] : [],
      });
      const identity = repo.create("sportsIdentity", id, {
        role,
        status: "verified",
        permissions: ["ACCOUNTS"],
        studentNumber: name,
        employeeId: name,
        privateNote: "SECRET",
      });
      return { ...login(db, name + "@example.test", "Password-123"), identity };
    };
    const admin = make("super", "admin"),
      student = make("student", "student"),
      teacher = make("teacher", "teacher");
    make("student2", "student");
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    const get = (path: string, token = admin.token) =>
      fetch(base + path, { headers: { Cookie: `bnbu_session=${token}` } });
    const first = await (await get("/students?limit=1")).json();
    expect(first.data).toHaveLength(1);
    expect(first.meta.pagination).toMatchObject({
      hasMore: true,
      total: 2,
      limit: 1,
    });
    const next = await (
      await get("/students?limit=1&cursor=" + first.meta.pagination.nextCursor)
    ).json();
    expect(next.data[0].id).not.toBe(first.data[0].id);
    expect(next.meta.pagination.hasMore).toBe(false);
    const detail = await (await get("/students/" + student.account.id)).json();
    expect(detail.data).toMatchObject({
      id: student.account.id,
      fullName: "student",
      status: "PENDING",
      emailVerified: false,
    });
    expect(JSON.stringify(detail)).not.toMatch(/SECRET|password|hash/);
    const teachers = await (await get("/admin/teacher-accounts")).json();
    expect(teachers.data.items[0]).toMatchObject({
      id: teacher.account.id,
      employeeNumber: "teacher",
    });
    expect((await get("/students", teacher.token)).status).toBe(403);
    expect((await get("/students/absent")).status).toBe(404);
    repo.save(admin.identity, { mustChangePassword: true });
    expect((await get("/admin/teacher-accounts")).status).toBe(403);
    expect(() =>
      portalAccountPage(repo, student.account, "student", {}),
    ).toThrow();
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("分管理员目录仅超级管理员可见，独立管理账号才进入列表", () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db);
  try {
    const id = createAccount(db, {
      name: "super",
      email: "super@example.test",
      password: "Password-123",
      roles: ["superadmin"],
    });
    repo.create("sportsIdentity", id, { role: "admin", status: "verified" });
    const actor = login(db, "super@example.test", "Password-123").account;
    const sub = createAccount(db, {
      name: "sub",
      email: "sub@example.test",
      password: "Password-123",
      roles: [],
    });
    repo.create("sportsIdentity", sub, {
      role: "admin",
      status: "verified",
      permissions: ["HELP"],
    });
    expect(portalSubadmins(repo, actor).items).toHaveLength(0);
    db.prepare(
      "UPDATE accounts SET login_kind='ADMIN',login_name='sub.admin' WHERE id=?",
    ).run(sub);
    expect(portalSubadmins(repo, actor).items[0]).toMatchObject({
      id: sub,
      account: "sub.admin",
      permissions: ["HELP_CENTER"],
    });
    expect(() => portalSubadmins(repo, { ...actor, roles: [] })).toThrow();
    expect(() => portalSubadmins(repo, actor, "absent")).toThrow();
  } finally {
    db.close();
  }
});
