import { demand, type Account } from "../auth";
import { Repository, strings } from "../repository";

export const sportsPermissions = [
  "COURSES_VIEW",
  "SEMESTERS",
  "ACCOUNTS",
  "FEEDBACK",
  "GLOBAL_RULES",
  "SYSTEM_MODE",
  "HELP",
  "AUDIT",
] as const;
export type SportsPermission = (typeof sportsPermissions)[number];
export function administratorAccess(repo: Repository, actor: Account) {
  const identity = repo
    .all("sportsIdentity")
    .find(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "admin" &&
        i.data.status === "verified",
    );
  const valid = !!identity && actor.status !== "banned";
  const superAdmin = valid && actor.roles.includes("superadmin");
  return {
    superAdmin,
    permissions: valid
      ? sportsPermissions.filter(
          (p) => superAdmin || strings(identity!.data.permissions).includes(p),
        )
      : [],
  };
}
export function requireSportsPermission(
  repo: Repository,
  actor: Account,
  permission: SportsPermission,
) {
  demand(
    administratorAccess(repo, actor).permissions.includes(permission),
    "没有该体育管理权限。",
    403,
  );
}
export function requireSportsSuperAdmin(repo: Repository, actor: Account) {
  demand(
    administratorAccess(repo, actor).superAdmin,
    "仅体育总管理员可执行此治理操作。",
    403,
  );
}
