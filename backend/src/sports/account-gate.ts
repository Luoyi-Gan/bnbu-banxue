import { ServiceError, type Account } from "../auth";
import { Repository, type Entity } from "../repository";

export function requiresPasswordChange(repo: Pick<Repository, "all">, actor: Account) {
  return passwordChangeRequired(repo.all("companionIdentity"),actor);
}
export function passwordChangeRequired(identities: Entity[], actor: Account) {
  return identities.some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.status === "verified" &&
        ["teacher", "admin"].includes(String(i.data.role)) &&
        i.data.mustChangePassword === true,
    );
}
export function sportsAccountGate(repo: Pick<Repository, "all">, actor: Account) {
  if (requiresPasswordChange(repo, actor))
    throw new ServiceError(
      403,
      "PASSWORD_CHANGE_REQUIRED",
      "请先修改本人初始密码，再进入体育业务。",
    );
}
