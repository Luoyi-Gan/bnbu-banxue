import { demand, type Account } from "../auth";
import { Repository } from "../repository";
import { requiresPasswordChange, sportsAccountGate } from "./account-gate";
import { administratorAccess } from "./permissions";

const permissionNames = {
  COURSES_VIEW: "COURSE_VIEW",
  SEMESTERS: "SEMESTER_MANAGE",
  ACCOUNTS: "USER_ACCOUNTS",
  FEEDBACK: "STUDENT_FEEDBACK",
  GLOBAL_RULES: "GLOBAL_RULES",
  SYSTEM_MODE: "SYSTEM_MODE",
  HELP: "HELP_CENTER",
  AUDIT: "AUDIT_QUERY",
} as const;

function portalIdentity(repo: Repository, actor: Account) {
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
  };
}

export function portalMe(repo: Repository, actor: Account) {
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
