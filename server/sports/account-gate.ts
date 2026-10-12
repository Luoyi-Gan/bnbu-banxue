import { ServiceError, type Account } from "../auth";
import { Repository } from "../repository";

export function requiresPasswordChange(repo: Repository, actor: Account) {
  return repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.status === "verified" &&
        ["teacher", "admin"].includes(String(i.data.role)) &&
        i.data.mustChangePassword === true,
    );
}
export function sportsAccountGate(repo: Repository, actor: Account) {
  if (requiresPasswordChange(repo, actor))
    throw new ServiceError(
      403,
      "PASSWORD_CHANGE_REQUIRED",
      "请先修改本人初始密码，再进入体育业务。",
    );
}
