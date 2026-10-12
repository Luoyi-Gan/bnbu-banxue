import {
  demand,
  digest,
  encodePassword,
  matchesPassword,
  type Account,
} from "../auth";
import { Repository, type Fields } from "../repository";
import { version } from "../version-check";

export function passwordCommand(
  repo: Repository,
  actor: Account,
  token: string,
  action: string,
  input: Fields,
) {
  if (action !== "accounts.password.change") return undefined;
  const identity = repo
    .all("companionIdentity")
    .find(
      (i) =>
        i.ownerId === actor.id &&
        i.data.status === "verified" &&
        ["teacher", "admin"].includes(String(i.data.role)),
    );
  demand(
    identity && actor.status === "active",
    "仅有效教师或管理员可修改本人密码。",
    403,
  );
  version(identity, input);
  demand(
    typeof input.currentPassword === "string" &&
      typeof input.newPassword === "string" &&
      input.newPassword.length > 0,
    "请填写当前密码和非空新密码。",
  );
  demand(input.newPassword === input.confirmPassword, "两次新密码不一致。");
  const row = repo.db
    .prepare("SELECT password_hash FROM accounts WHERE id=?")
    .get(actor.id)!;
  demand(
    matchesPassword(input.currentPassword, String(row.password_hash)),
    "当前密码不正确。",
    403,
  );
  repo.db
    .prepare("UPDATE accounts SET password_hash=? WHERE id=?")
    .run(encodePassword(input.newPassword), actor.id);
  repo.db
    .prepare("DELETE FROM sessions WHERE account_id=? AND token_hash<>?")
    .run(actor.id, digest(token));
  const saved = repo.save(identity, {
    mustChangePassword: false,
    passwordChangedAt: Date.now(),
  });
  repo.notify(
    [actor.id],
    identity.id,
    action,
    "本人密码已更新，其他设备的登录状态已失效。",
  );
  return saved;
}
