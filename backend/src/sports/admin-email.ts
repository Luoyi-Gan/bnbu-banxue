import { randomInt, randomUUID } from "node:crypto";
import { demand, digest, ServiceError, timestamp, type Account } from "../auth";
import { Repository, textField, type Fields } from "../repository";
import { transaction, type Database } from "../database";
import { deliverOutbox } from "../mail-delivery";
import { sportsAccountGate } from "./account-gate";

function current(repo: Repository, actor: Account) {
  sportsAccountGate(repo, actor);
  const identity = repo
    .all("sportsIdentity")
    .find(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "admin" &&
        i.data.status === "verified",
    );
  const account = repo.db
    .prepare("SELECT email,status,login_kind,roles FROM accounts WHERE id=?")
    .get(actor.id);
  demand(
    identity &&
      account?.status === "active" &&
      (account.login_kind === "ADMIN" ||
        JSON.parse(String(account.roles)).includes("superadmin")),
    "仅当前有效管理员可验证本人邮箱。",
    403,
  );
  return { identity, email: String(account.email) };
}
export function adminEmailStatus(repo: Repository, actor: Account) {
  const { identity, email } = current(repo, actor);
  return {
    email,
    verified:
      identity.data.schoolEmailVerified === true &&
      identity.data.schoolEmail === email,
  };
}
export function clearAdminChallenges(repo: Repository, accountId: string) {
  const rows = repo.db
    .prepare("SELECT mail_id FROM admin_security_challenges WHERE account_id=?")
    .all(accountId);
  repo.db
    .prepare("DELETE FROM admin_security_challenges WHERE account_id=?")
    .run(accountId);
  for (const row of rows)
    repo.db.prepare("DELETE FROM mail_outbox WHERE id=?").run(row.mail_id!);
}
export async function requestAdminEmail(
  db: Database,
  actor: Account,
  localOutbox: boolean,
) {
  demand(
    localOutbox || process.env.BNBU_EMAIL_DELIVERY_URL,
    "尚未配置验证码邮件服务。",
    503,
  );
  const repo = new Repository(db),
    now = Date.now(),
    id = randomUUID(),
    mailId = randomUUID();
  transaction(db, () => {
    const { identity, email } = current(repo, actor);
    const previous = db
      .prepare(
        "SELECT sent_at FROM admin_security_challenges WHERE account_id=? AND purpose='EMAIL_VERIFY' ORDER BY sent_at DESC LIMIT 1",
      )
      .get(actor.id);
    demand(
      !previous || now - Number(previous.sent_at) >= 60000,
      "请稍后再发送验证码。",
      429,
    );
    const code = String(randomInt(100000, 1000000));
    db.prepare(
      "UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=? WHERE account_id=? AND purpose='EMAIL_VERIFY' AND consumed_at IS NULL",
    ).run(now, actor.id);
    db.prepare(
      "INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES(?,?,'EMAIL_VERIFY',?,?,?,?,?,?)",
    ).run(
      id,
      actor.id,
      email,
      digest(id + ":" + code),
      now + 600000,
      now,
      identity.version,
      mailId,
    );
    db.prepare(
      "INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)",
    ).run(
      mailId,
      email,
      "伴学管理账号邮箱验证",
      `验证码：${code}，10分钟内有效，仅用于验证管理账号邮箱。`,
      timestamp(),
    );
  });
  const delivery = await deliverOutbox(db, mailId, localOutbox);
  return { ...delivery, challengeId: id };
}
export function confirmAdminEmail(db: Database, actor: Account, input: Fields) {
  demand(
    Object.keys(input).every((k) => ["challengeId", "code"].includes(k)),
    "邮箱验证参数无效。",
  );
  const id = textField(input, "challengeId", 100),
    code = textField(input, "code", 20),
    repo = new Repository(db);
  const result = transaction(db, () => {
    const { identity, email } = current(repo, actor),
      now = Date.now();
    const row = db
      .prepare(
        "SELECT * FROM admin_security_challenges WHERE id=? AND account_id=? AND purpose='EMAIL_VERIFY'",
      )
      .get(id, actor.id);
    if (
      !row ||
      row.consumed_at !== null ||
      Number(row.expires_at) <= now ||
      Number(row.attempts) >= 5
    )
      return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    db.prepare(
      "UPDATE admin_security_challenges SET attempts=attempts+1 WHERE id=?",
    ).run(id);
    if (row.code_hash !== digest(id + ":" + code))
      return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    if (
      row.email !== email ||
      Number(row.identity_version) !== identity.version
    )
      return new ServiceError(
        409,
        "VERSION_CONFLICT",
        "账号资料已变化，请重新获取验证码。",
      );
    repo.save(identity, {
      schoolEmail: email,
      schoolEmailVerified: true,
      schoolEmailVerifiedAt: now,
    });
    db.prepare(
      "UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=? WHERE id=?",
    ).run(now, id);
    db.prepare("DELETE FROM mail_outbox WHERE id=?").run(row.mail_id!);
    db.prepare(
      "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      randomUUID(),
      actor.id,
      "admin",
      "sports.account.email.verify",
      identity.id,
      "",
      JSON.stringify({ purpose: "EMAIL_VERIFY", result: "VERIFIED" }),
      timestamp(),
    );
    return { verified: true };
  });
  if (result instanceof ServiceError) throw result;
  return result;
}
