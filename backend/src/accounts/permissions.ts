import { demand, type Account } from "../auth";
import { Repository, strings } from "../repository";

export const accountPermissions = ["ACCOUNTS"] as const;
export type AccountPermission = (typeof accountPermissions)[number];
export function administratorAccess(repo: Pick<Repository, "all">, actor: Account) {
  const identity = repo
    .all("companionIdentity")
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
      ? accountPermissions.filter(
          (p) => superAdmin || strings(identity!.data.permissions).includes(p),
        )
      : [],
  };
}
export function requireAccountPermission(
  repo: Pick<Repository, "all">,
  actor: Account,
  permission: AccountPermission,
) {
  demand(
    administratorAccess(repo, actor).permissions.includes(permission),
    "没有该账号管理权限。",
    403,
  );
}
export function requireSuperAdmin(repo: Pick<Repository, "all">, actor: Account) {
  demand(
    administratorAccess(repo, actor).superAdmin,
    "仅总管理员可执行此治理操作。",
    403,
  );
}
