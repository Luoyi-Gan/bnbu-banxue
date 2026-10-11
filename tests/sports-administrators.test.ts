import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDatabase, type Database } from "../server/database";
import {
  createAccount,
  login,
  loginAdministrator,
  authenticate,
} from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { administratorDirectory } from "../server/sports/administrators";
import { migrateAccountNamespaces } from "../server/account-migration";
import { createApiServer } from "../server/main";
const dbs: Database[] = [];
it("HTTP独立登录发放本人会话且普通邮箱入口不能误登录管理身份", async () => {
  const f = setup(),
    identity = f.create(),
    server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base =
    "http://127.0.0.1:" + (server.address() as { port: number }).port;
  try {
    const request = (path: string, body: unknown) =>
      fetch(base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    const login = await request("/api/auth/admin-login", {
      loginName: "staff.one",
      password: "x",
    });
    expect(login.status).toBe(200);
    expect((await login.json()).account.id).toBe(identity.ownerId);
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    expect(login.headers.get("set-cookie")).toContain("HttpOnly");
    const workspace = await fetch(base + "/api/workspace", {
      headers: { Cookie: cookie },
    });
    expect((await workspace.json()).firstLoginOnly).toBe(true);
    expect(
      (
        await fetch(base + "/api/sports/administrators", {
          headers: { Cookie: cookie },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request("/api/auth/login", {
          email: "teacher@example.test",
          password: "x",
        })
      ).status,
    ).toBe(401);
    const directory = await fetch(base + "/api/sports/administrators", {
      headers: { Cookie: "bnbu_session=" + f.root.token },
    });
    expect(directory.status).toBe(200);
    expect(directory.headers.get("cache-control")).toBe("no-store");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
afterEach(() => {
  dbs.splice(0).forEach((d) => d.close());
  vi.unstubAllEnvs();
});
function setup() {
  vi.stubEnv("BNBU_SCHOOL_EMAIL_DOMAINS", "example.test");
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const rootId = createAccount(db, {
    email: "root@example.test",
    name: "root",
    password: "Password123",
    roles: ["superadmin"],
  });
  repo.create("sportsIdentity", rootId, { role: "admin", status: "verified" });
  const personId = createAccount(db, {
    email: "teacher@example.test",
    name: "teacher",
    password: "Personal123",
    roles: ["teacher"],
  });
  repo.create("sportsIdentity", personId, {
    role: "teacher",
    status: "verified",
  });
  const root = login(db, "root@example.test", "Password123"),
    personal = login(db, "teacher@example.test", "Personal123");
  const input = {
    personId,
    loginName: "Staff.One",
    name: "teacher管理员",
    email: "teacher@example.test",
    department: "体育部",
    permissions: ["ACCOUNTS"],
    initialPassword: "x",
    confirmPassword: "x",
    confirmed: true,
  };
  let n = 0;
  const cmd = (
    action: string,
    input: Record<string, unknown>,
    token = root.token,
  ) => execute(db, token, action, input, "admin-test-" + ++n);
  const create = () => {
    const result = cmd("sports.admins.create", input) as { id: string };
    return repo.get(result.id);
  };
  return { db, repo, root, personal, personId, input, cmd, create };
}
it("同邮箱独立建号、短初始密码、首次本人改密和状态隔离形成真实登录链", () => {
  const f = setup(),
    identity = f.create();
  expect(identity.ownerId).not.toBe(f.personId);
  expect(() => login(f.db, "teacher@example.test", "x")).toThrow();
  expect(() => loginAdministrator(f.db, "teacher@example.test", "x")).toThrow();
  const first = loginAdministrator(f.db, "STAFF.ONE", "x"),
    other = loginAdministrator(f.db, "staff.one", "x");
  expect(first.account.roles).toEqual(["admin"]);
  expect(() =>
    f.cmd("sports.teachers.preview", { csv: "x" }, first.token),
  ).toThrow("初始密码");
  f.cmd(
    "sports.password.change",
    {
      id: identity.id,
      version: identity.version,
      currentPassword: "x",
      newPassword: "y",
      confirmPassword: "y",
    },
    first.token,
  );
  expect(() => authenticate(f.db, other.token)).toThrow();
  expect(authenticate(f.db, first.token).id).toBe(identity.ownerId);
  expect(() => loginAdministrator(f.db, "staff.one", "x")).toThrow();
  expect(loginAdministrator(f.db, "staff.one", "y").account.id).toBe(
    identity.ownerId,
  );
  f.cmd("sports.admins.state", {
    id: identity.id,
    version: f.repo.get(identity.id).version,
    status: "DISABLED",
    confirmed: true,
    handoverConfirmed: true,
  });
  expect(() => authenticate(f.db, first.token)).toThrow();
  expect(() => loginAdministrator(f.db, "staff.one", "y")).toThrow("停用");
  expect(authenticate(f.db, f.personal.token).id).toBe(f.personId);
  expect(login(f.db, "teacher@example.test", "Personal123").account.id).toBe(
    f.personId,
  );
  f.cmd("sports.admins.edit", {
    id: identity.id,
    version: f.repo.get(identity.id).version,
    name: "更新",
    email: "teacher@example.test",
    department: "",
    permissions: ["HELP"],
    confirmed: true,
  });
  f.cmd("sports.admins.state", {
    id: identity.id,
    version: f.repo.get(identity.id).version,
    status: "ACTIVE",
    confirmed: true,
  });
  expect(loginAdministrator(f.db, "staff.one", "y").account.id).toBe(
    identity.ownerId,
  );
  expect(f.repo.get(identity.id).data.permissions).toEqual(["HELP"]);
  expect(() => authenticate(f.db, first.token)).toThrow();
});
it("只有总管理员可建管，禁止改登录名或密码，重复和无权限创建原子失败", () => {
  const f = setup();
  expect(() =>
    f.cmd("sports.admins.create", f.input, f.personal.token),
  ).toThrow("总管理员");
  for (const patch of [
    { permissions: [] },
    { permissions: ["SUPERADMIN"] },
    { confirmPassword: "different" },
    { personId: "missing" },
    { confirmed: false },
  ])
    expect(() =>
      f.cmd("sports.admins.create", { ...f.input, ...patch }),
    ).toThrow();
  expect(
    f.db.prepare("SELECT * FROM accounts WHERE login_kind='ADMIN'").all(),
  ).toHaveLength(0);
  const identity = f.create();
  expect(() =>
    f.cmd("sports.admins.create", { ...f.input, loginName: "another" }),
  ).toThrow("邮箱");
  expect(() =>
    f.cmd("sports.admins.create", {
      ...f.input,
      email: "another@example.test",
    }),
  ).toThrow("已存在");
  const change = {
    id: identity.id,
    version: identity.version,
    name: "新姓名",
    email: f.input.email,
    department: "",
    permissions: ["HELP"],
    confirmed: true,
  };
  for (const patch of [
    { initialPassword: "new" },
    { loginName: "replacement" },
  ])
    expect(() => f.cmd("sports.admins.edit", { ...change, ...patch })).toThrow(
      "不允许",
    );
  expect(() =>
    f.cmd("sports.admins.state", {
      id: identity.id,
      version: identity.version,
      status: "DISABLED",
      confirmed: true,
    }),
  ).toThrow("职责移交");
  const snapshot = administratorDirectory(f.repo, f.root.account);
  expect(snapshot.items).toHaveLength(1);
  expect(JSON.stringify(snapshot)).not.toMatch(
    /password|hash|mustChangePassword/,
  );
  expect(
    f.db
      .prepare("SELECT data FROM audit")
      .all()
      .map((r) => r.data)
      .join(""),
  ).not.toContain("initialPassword");
});
it("旧账号表迁移保留登录及关联且可重复打开，外键继续生效", () => {
  const dir = mkdtempSync(join(tmpdir(), "bnbu-admin-migration-")),
    file = join(dir, "old.sqlite");
  const old = new DatabaseSync(file);
  try {
    old.exec(
      `PRAGMA foreign_keys=ON; CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT NOT NULL);CREATE TABLE accounts(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,name TEXT NOT NULL,organization TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active',roles TEXT NOT NULL DEFAULT '[]',created_at TEXT NOT NULL);INSERT INTO accounts VALUES('person','p@example.test','hash','old','','active','[]','old-time');CREATE TABLE linked(account_id TEXT REFERENCES accounts(id));INSERT INTO linked VALUES('person');`,
    );
    migrateAccountNamespaces(old);
    migrateAccountNamespaces(old);
    expect(old.prepare("SELECT * FROM accounts").get()).toMatchObject({
      id: "person",
      email: "p@example.test",
      password_hash: "hash",
      login_kind: "PERSONAL",
      login_name: null,
    });
    expect(old.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    expect(() =>
      old.prepare("INSERT INTO linked VALUES(?)").run("missing"),
    ).toThrow();
    old.close();
    const reopened = openDatabase(file);
    expect(
      reopened.prepare("SELECT account_id FROM linked").get()?.account_id,
    ).toBe("person");
    reopened.close();
  } finally {
    if (old.isOpen) old.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
