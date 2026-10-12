import { expect, it, vi } from "vitest";
import { createAccount, login } from "../backend/src/auth";
import { openDatabase } from "../backend/src/database";
import { Repository } from "../backend/src/repository";
import { createApiServer } from "../backend/src/main";
import {
  portalAccountPage,
  portalSubadmins,
  portalSubadminWrite,
  portalSubadminDelete,
} from "../backend/src/sports/portal-accounts";

it("本人注销仅允许独立分管理员，核对资料后清除会话且不影响个人账号", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const personalId = createAccount(db, {
      name: "个人",
      email: "closure-person@example.test",
      password: "Password-123",
      roles: [],
    });
    repo.create("sportsIdentity", personalId, {
      role: "admin",
      status: "verified",
    });
    const personal = login(db, "closure-person@example.test", "Password-123");
    const id = createAccount(db, {
      name: "分管",
      email: "closure-admin@example.test",
      password: "Password-123",
      roles: [],
    });
    const session = login(db, "closure-admin@example.test", "Password-123");
    db.prepare(
      "UPDATE accounts SET login_kind='ADMIN',login_name='closure.admin' WHERE id=?",
    ).run(id);
    repo.create("sportsIdentity", id, { role: "admin", status: "verified" });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    const get = (path: string, token: string) =>
      fetch(base + path, { headers: { Cookie: `bnbu_session=${token}` } });
    expect(
      (await (await get("/auth/account-security", personal.token)).json()).data
        .canDeleteOwnAccount,
    ).toBe(false);
    expect((await get("/me/administrator", personal.token)).status).toBe(403);
    expect(
      (await (await get("/auth/account-security", session.token)).json()).data
        .canDeleteOwnAccount,
    ).toBe(true);
    const own = (await (await get("/me/administrator", session.token)).json())
      .data;
    const input = {
      expectedVersion: own.version,
      account: own.loginName,
      name: own.name,
      email: own.email,
      confirmed: true,
      handoverCompleted: true,
    };
    const post = (body: unknown) =>
      fetch(base + "/me/account-deletion", {
        method: "POST",
        headers: {
          Cookie: `bnbu_session=${session.token}`,
          Origin: "http://127.0.0.1:4186",
          "Content-Type": "application/json",
          "Idempotency-Key": "close-own-account",
        },
        body: JSON.stringify(body),
      });
    expect((await post({ ...input, email: "wrong@example.test" })).status).toBe(
      409,
    );
    expect((await post({ ...input, handoverCompleted: false })).status).toBe(
      400,
    );
    const closed = await post(input);
    expect(closed.status).toBe(200);
    expect(await closed.json()).toEqual({
      data: { deleted: true, userId: id },
    });
    expect(closed.headers.get("set-cookie")).toContain("Max-Age=0");
    expect((await get("/me", session.token)).status).toBe(401);
    expect((await get("/me", personal.token)).status).toBe(200);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("原版删除核对版本并支持重试，保留个人账号和业务历史，重新检查操作者权限", () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db);
  try {
    const owner = createAccount(db, {
      name: "owner",
      email: "delete-owner@example.test",
      password: "Password-123",
      roles: ["superadmin"],
    });
    const ownerIdentity = repo.create("sportsIdentity", owner, {
      role: "admin",
      status: "verified",
    });
    const token = login(db, "delete-owner@example.test", "Password-123").token;
    const person = createAccount(db, {
      name: "person",
      email: "delete-person@example.test",
      password: "Password-123",
      roles: [],
    });
    const target = createAccount(db, {
      name: "target",
      email: "delete-target@example.test",
      password: "Password-123",
      roles: [],
    });
    db.prepare(
      "UPDATE accounts SET login_kind='ADMIN',login_name='delete.target',email='delete-person@example.test' WHERE id=?",
    ).run(target);
    const identity = repo.create("sportsIdentity", target, {
      role: "admin",
      status: "verified",
    });
    const fact = repo.create("sportsAuditFact", target, { retained: true });
    const remove = (version: number, key: string, handoverCompleted = true) =>
      portalSubadminDelete(
        db,
        token,
        target,
        { expectedVersion: version, handoverCompleted },
        key,
      );
    expect(() => remove(identity.version, "delete-no-handover", false)).toThrow(
      /移交/,
    );
    expect(() => remove(identity.version + 1, "delete-stale-version")).toThrow(
      /变化/,
    );
    const result = remove(identity.version, "delete-idempotent");
    expect(result).toMatchObject({ id: target, deleted: true, version: 2 });
    expect(remove(identity.version, "delete-idempotent")).toEqual(result);
    expect(
      db
        .prepare(
          "SELECT login_kind,email,password_hash FROM accounts WHERE id=?",
        )
        .get(target),
    ).toMatchObject({
      login_kind: "HISTORY",
      email: null,
      password_hash: null,
    });
    expect(repo.get(fact.id, "sportsAuditFact").data.retained).toBe(true);
    expect(
      login(db, "delete-person@example.test", "Password-123").account.id,
    ).toBe(person);
    repo.save(ownerIdentity, { status: "revoked" });
    expect(() => remove(identity.version, "delete-idempotent")).toThrow();
  } finally {
    db.close();
  }
});

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
