import { demand, type Account } from "../auth";
import { Repository, type Fields } from "../repository";
import { requireSuperAdmin } from "./permissions";
import { version } from "../version-check";
import { accountSecurityGate } from "./account-gate";
import { clearAdminChallenges } from "./admin-email";

export function administratorSelf(repo: Repository, actor: Account) {
  accountSecurityGate(repo, actor);
  const row = repo.db
    .prepare(
      "SELECT login_name,name,email FROM accounts WHERE id=? AND login_kind='ADMIN'",
    )
    .get(actor.id);
  const identity = repo
    .all("companionIdentity")
    .find(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "admin" &&
        i.data.status === "verified",
    );
  demand(
    row && identity && !actor.roles.includes("superadmin"),
    "该流程仅适用独立分管理员。",
    403,
  );
  return {
    id: identity.id,
    version: identity.version,
    loginName: row.login_name,
    name: row.name,
    email: row.email,
  };
}

export function administratorDeletion(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (!["accounts.admins.delete", "accounts.close"].includes(action))
    return undefined;
  const self = action === "accounts.close";
  if (!self) requireSuperAdmin(repo, actor);
  // The original portal confirms the displayed account and immutable version.
  // Resolve that snapshot inside execute's transaction; the receipt hashes the
  // original account ID/version so retries still work after identity removal.
  if (!self && input.accountId !== undefined) {
    demand(
      Object.keys(input).every((key) =>
        ["accountId", "version", "confirmed", "handoverConfirmed"].includes(
          key,
        ),
      ),
      "账号删除参数无效。",
    );
    const identities = repo
      .all("companionIdentity")
      .filter((i) => i.ownerId === input.accountId && i.data.role === "admin");
    demand(identities.length === 1, "管理账号不存在或身份资料需核对。", 404);
    const snapshot = repo.db
      .prepare("SELECT login_name,name,email FROM accounts WHERE id=?")
      .get(String(input.accountId));
    demand(snapshot, "管理账号不存在。", 404);
    input = {
      id: identities[0].id,
      version: input.version,
      confirmed: input.confirmed,
      handoverConfirmed: input.handoverConfirmed,
      loginName: snapshot.login_name,
      name: snapshot.name,
      email: snapshot.email,
    };
  }
  demand(
    Object.keys(input).every((k) =>
      [
        "id",
        "version",
        "confirmed",
        "handoverConfirmed",
        "loginName",
        "name",
        "email",
      ].includes(k),
    ),
    "账号删除参数无效。",
  );
  const identity = repo.get(input.id, "companionIdentity");
  version(identity, input);
  demand(
    identity.data.role === "admin" && identity.ownerId,
    "只能删除独立分管理员。",
  );
  demand(
    self ? identity.ownerId === actor.id : identity.ownerId !== actor.id,
    "无权删除此账号。",
    403,
  );
  if (self)
    demand(
      identity.data.status === "verified" && actor.status === "active",
      "当前管理身份不可用。",
      403,
    );
  const row = repo.db
    .prepare("SELECT * FROM accounts WHERE id=?")
    .get(identity.ownerId)!;
  demand(
    row?.login_kind === "ADMIN" &&
      !JSON.parse(String(row.roles)).includes("superadmin"),
    "该流程不适用总管理员或个人账号。",
    403,
  );
  demand(
    input.confirmed === true && input.handoverConfirmed === true,
    "须确认已完成全部职责移交。",
  );
  demand(
    input.loginName === row.login_name &&
      input.name === row.name &&
      input.email === row.email,
    "账号资料已变化，请重新核对姓名、登录账号和邮箱。",
    409,
  );
  // Known profile copies are erased; free-form historical business content is retained.
  for (const history of repo
    .all("sportsAdminHistory")
    .filter((h) => h.data.administratorId === identity.ownerId)) {
    const data = { ...history.data };
    for (const key of ["before", "after"]) {
      const value = data[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const copy = { ...(value as Fields) };
        delete copy.name;
        delete copy.email;
        delete copy.organization;
        data[key] = copy;
      }
    }
    repo.db
      .prepare("UPDATE entities SET data=? WHERE id=?")
      .run(JSON.stringify(data), history.id);
  }
  repo.db
    .prepare("DELETE FROM sessions WHERE account_id=?")
    .run(identity.ownerId);
  repo.db
    .prepare("DELETE FROM notifications WHERE recipient_id=?")
    .run(identity.ownerId);
  repo.db
    .prepare("DELETE FROM relations WHERE account_id=?")
    .run(identity.ownerId);
  repo.db
    .prepare("DELETE FROM command_receipts WHERE actor_id=?")
    .run(identity.ownerId);
  clearAdminChallenges(repo, identity.ownerId);
  // PERSONAL registration challenges sharing this email are intentionally retained.
  repo.db
    .prepare("DELETE FROM entities WHERE owner_id=? AND kind='companionIdentity'")
    .run(identity.ownerId);
  repo.db
    .prepare(
      "UPDATE accounts SET email=NULL,password_hash=NULL,name=NULL,organization=NULL,roles='[]',status='banned',login_name=NULL,login_kind='HISTORY' WHERE id=?",
    )
    .run(identity.ownerId);
  repo.create("sportsAdminHistory", actor.id, {
    administratorId: identity.ownerId,
    action,
    handoverConfirmed: true,
    deletedAt: Date.now(),
    deletedVersion: identity.version + 1,
  });
  return { id: identity.ownerId };
}
