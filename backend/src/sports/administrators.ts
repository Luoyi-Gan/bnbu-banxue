import { randomUUID } from "node:crypto";
import {
  demand,
  encodePassword,
  normalizeEmail,
  timestamp,
  type Account,
} from "../auth";
import { Repository, textField, type Fields } from "../repository";
import { sportsPermissions, requireSportsSuperAdmin } from "./permissions";
import { sportsAccountGate } from "./account-gate";
import { sportsWriteGate } from "./system";
import { version } from "../version-check";
import { clearAdminChallenges } from "./admin-email";

export function administratorDirectory(repo: Repository, actor: Account) {
  sportsAccountGate(repo, actor);
  requireSportsSuperAdmin(repo, actor);
  sportsWriteGate(repo, "sports.admins.read");
  const accounts = repo.db
    .prepare(
      "SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name",
    )
    .all();
  return {
    permissions: sportsPermissions,
    items: accounts.map((a) => {
      const identity = repo
        .all("sportsIdentity")
        .find((i) => i.ownerId === a.id && i.data.role === "admin");
      return {
        id: a.id,
        identityId: identity?.id,
        loginName: a.login_name,
        name: a.name,
        email: a.email,
        department: a.organization,
        status: a.status === "active" ? "ACTIVE" : "DISABLED",
        permissions: identity?.data.permissions ?? [],
        version: identity?.version,
        updatedAt: identity?.updatedAt,
      };
    }),
    candidates: repo.db
      .prepare(
        "SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='sportsIdentity' AND json_extract(i.data,'$.status')='verified' ORDER BY a.name",
      )
      .all(),
  };
}
export function sportsAdministratorCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (
    ![
      "sports.admins.create",
      "sports.admins.edit",
      "sports.admins.state",
    ].includes(action)
  )
    return undefined;
  requireSportsSuperAdmin(repo, actor);
  const create = action === "sports.admins.create",
    state = action === "sports.admins.state";
  const allowed = create
    ? [
        "personId",
        "loginName",
        "name",
        "email",
        "department",
        "permissions",
        "initialPassword",
        "confirmPassword",
        "confirmed",
      ]
    : state
      ? ["id", "version", "status", "handoverConfirmed", "confirmed"]
      : [
          "id",
          "version",
          "name",
          "email",
          "department",
          "permissions",
          "confirmed",
        ];
  demand(
    Object.keys(input).every((k) => allowed.includes(k)),
    "管理账号操作包含不允许的字段。",
  );
  demand(
    input.confirmed === true,
    "须核对账号资料、全部权限及高风险权限后确认。",
  );
  const identity = create ? undefined : repo.get(input.id, "sportsIdentity");
  if (identity) {
    demand(
      identity.data.role === "admin" && identity.ownerId !== actor.id,
      "不能修改本人或非分管理员账号。",
      403,
    );
    const row = repo.db
      .prepare("SELECT login_kind,roles FROM accounts WHERE id=?")
      .get(identity.ownerId!);
    demand(
      row?.login_kind === "ADMIN" &&
        !JSON.parse(String(row.roles)).includes("superadmin"),
      "仅可管理独立分管理员账号。",
      403,
    );
    version(identity, input);
  }
  if (state) {
    demand(
      input.status === "ACTIVE" || input.status === "DISABLED",
      "分管理员状态无效。",
    );
    const row = repo.db
      .prepare("SELECT status FROM accounts WHERE id=?")
      .get(identity!.ownerId!)!;
    const next = input.status === "ACTIVE" ? "active" : "banned";
    demand(row.status !== next, "账号状态已变化，请刷新。", 409);
    if (next === "banned")
      demand(input.handoverConfirmed === true, "停用前须确认已完成职责移交。");
    repo.db
      .prepare("UPDATE accounts SET status=? WHERE id=?")
      .run(next, identity!.ownerId!);
    if (next === "banned")
      repo.db
        .prepare("DELETE FROM sessions WHERE account_id=?")
        .run(identity!.ownerId!);
    repo.create("sportsAdminHistory", actor.id, {
      administratorId: identity!.ownerId,
      action,
      before: row.status,
      after: next,
    });
    return repo.save(identity!, { accountState: input.status });
  }
  const name = textField(input, "name", 40),
    email = normalizeEmail(input.email),
    department = textField(input, "department", 200, true);
  const domains = (process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? "bnbu.edu.cn")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  demand(domains.includes(email.split("@")[1]), "请填写已配置学校域名的邮箱。");
  demand(
    Array.isArray(input.permissions) &&
      input.permissions.length > 0 &&
      input.permissions.every((p) => sportsPermissions.includes(p)) &&
      new Set(input.permissions).size === input.permissions.length,
    "须选择至少一项固定业务权限，不得授予管理账号或教师权限。",
  );
  demand(
    !repo.db
      .prepare(
        "SELECT id FROM accounts WHERE email=? AND login_kind='ADMIN' AND id<>?",
      )
      .get(email, identity?.ownerId ?? ""),
    "学校邮箱已被另一分管理员使用。",
    409,
  );
  if (create) {
    const personId = textField(input, "personId", 100),
      person = repo.db
        .prepare("SELECT id,email,status,login_kind FROM accounts WHERE id=?")
        .get(personId);
    demand(
      person?.status === "active" &&
        person.login_kind === "PERSONAL" &&
        repo
          .all("sportsIdentity")
          .some((i) => i.ownerId === personId && i.data.status === "verified"),
      "请选择当前已完成身份核验的人员。",
      409,
    );
    const loginName = textField(input, "loginName", 100).toLowerCase();
    demand(
      !repo.db
        .prepare("SELECT id FROM accounts WHERE login_name=?")
        .get(loginName),
      "管理登录账号已存在。",
      409,
    );
    demand(
      typeof input.initialPassword === "string" &&
        input.initialPassword.length > 0 &&
        input.initialPassword === input.confirmPassword,
      "须填写初始密码且两次输入一致。",
    );
    const id = randomUUID();
    repo.db
      .prepare(
        "INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at,login_kind,login_name) VALUES(?,?,?,?,?,?,?,'ADMIN',?)",
      )
      .run(
        id,
        email,
        encodePassword(input.initialPassword),
        name,
        department,
        JSON.stringify(["admin"]),
        timestamp(),
        loginName,
      );
    const saved = repo.create("sportsIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: input.permissions,
      mustChangePassword: true,
      accountState: "ACTIVE",
      source: "SUPERADMIN_CONFIRMED_PERSON",
      verifiedPersonId: personId,
    });
    repo.create("sportsAdminHistory", actor.id, {
      administratorId: id,
      action,
      permissions: input.permissions,
    });
    return saved;
  }
  const before = repo.db
    .prepare("SELECT name,email,organization FROM accounts WHERE id=?")
    .get(identity!.ownerId!)!;
  if (before.email !== email) clearAdminChallenges(repo, identity!.ownerId!);
  repo.db
    .prepare("UPDATE accounts SET name=?,email=?,organization=? WHERE id=?")
    .run(name, email, department, identity!.ownerId!);
  repo.create("sportsAdminHistory", actor.id, {
    administratorId: identity!.ownerId,
    action,
    before: { ...before, permissions: identity!.data.permissions },
    after: {
      name,
      email,
      organization: department,
      permissions: input.permissions,
    },
  });
  return repo.save(identity!, {
    permissions: input.permissions,
    ...(before.email !== email
      ? { schoolEmailVerified: false, schoolEmail: null }
      : {}),
  });
}
