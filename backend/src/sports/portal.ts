import { demand, login, loginAdministrator, type Account } from "../auth";
import { transaction, type Database } from "../database";
import { Repository } from "../repository";
import { requiresPasswordChange, sportsAccountGate } from "./account-gate";
import { administratorAccess } from "./permissions";

export const permissionNames = {
  COURSES_VIEW: "COURSE_VIEW",
  SEMESTERS: "SEMESTER_MANAGE",
  ACCOUNTS: "USER_ACCOUNTS",
  FEEDBACK: "STUDENT_FEEDBACK",
  GLOBAL_RULES: "GLOBAL_RULES",
  SYSTEM_MODE: "SYSTEM_MODE",
  HELP: "HELP_CENTER",
  AUDIT: "AUDIT_QUERY",
} as const;

export function portalLogin(db: Database, account: unknown, password: unknown) {
  demand(
    typeof account === "string" &&
      account.trim().length > 0 &&
      account.length <= 254,
    "请填写登录账号。",
  );
  const identifier = account.trim().toLowerCase();
  return transaction(db, () => {
    const candidates = db
      .prepare(
        "SELECT login_kind FROM accounts WHERE (login_kind='ADMIN' AND login_name=?) OR (login_kind='PERSONAL' AND email=?)",
      )
      .all(identifier, identifier);
    demand(
      candidates.length <= 1,
      "登录标识对应不同账号，请从伴学入口选择登录类型。",
      409,
    );
    const management =
      candidates[0]?.login_kind === "ADMIN" ||
      (candidates.length === 0 && !identifier.includes("@"));
    const session = management
      ? loginAdministrator(db, identifier, password)
      : login(db, identifier, password);
    const security = portalSecurity(new Repository(db), session.account);
    return {
      token: session.token,
      user: {
        id: session.account.id,
        role: security.adminKind ? ("ADMIN" as const) : ("TEACHER" as const),
        version: security.version,
        status: "ACTIVE",
      },
    };
  });
}

function portalIdentity(repo: Pick<Repository, 'all'>, actor: Account) {
  demand(actor.status !== "banned", "账号已停用。", 403);
  const identities = repo
    .all("sportsIdentity")
    .filter(
      (i) =>
        i.ownerId === actor.id &&
        i.data.status === "verified" &&
        ["admin", "teacher"].includes(String(i.data.role)),
    );
  demand(identities.length === 1, "需要唯一有效的体育教师或管理身份。", 403);
  return identities[0];
}

/** Original portal contract; all authorization remains in the shared domain. */
export function portalSecurity(repo: Repository, actor: Account) {
  return portalSecurityData(repo,actor,repo.db.prepare('SELECT login_kind FROM accounts WHERE id=?').get(actor.id)?.login_kind==='ADMIN');
}
export function portalSecurityData(repo:Pick<Repository,'all'>,actor:Account,independentAdmin:boolean) {
  const identity = portalIdentity(repo, actor);
  const access = administratorAccess(repo, actor);
  return {
    userId: actor.id,
    version: identity.version,
    mustChangePassword: requiresPasswordChange(repo, actor),
    adminKind:
      identity.data.role === "admin"
        ? access.superAdmin
          ? "SUPER"
          : "SUB"
        : null,
    permissions: access.permissions.map((p) => permissionNames[p]),
    canDeleteOwnAccount:
      identity.data.role === "admin" &&
      !access.superAdmin &&
      actor.status === "active" &&
      independentAdmin,
  };
}

export function portalMe(repo: Pick<Repository, 'all'>, actor: Account) {
  sportsAccountGate(repo, actor);
  const identity = portalIdentity(repo, actor);
  const admin = identity.data.role === "admin";
  const profile = {
    id: identity.id,
    organizationId: "BNBU",
    userId: actor.id,
    employeeNumber: String(identity.data.employeeId ?? ""),
    fullName: actor.name,
    departmentName: actor.organization,
    status: "ACTIVE",
  };
  return {
    user: {
      id: actor.id,
      role: admin ? "ADMIN" : "TEACHER",
      status: "ACTIVE",
      version: identity.version,
      primaryEmail: actor.email,
    },
    studentProfile: null,
    teacherProfile: admin
      ? null
      : { ...profile, collegeName: String(identity.data.college ?? "") },
    adminProfile: admin ? profile : null,
  };
}
