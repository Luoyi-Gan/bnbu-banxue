import { randomUUID, createHash, randomInt, scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
function migrateCompanionIdentity(db) {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT 1 FROM schema_migrations WHERE version=8").get()) {
      db.exec(`UPDATE entities SET kind='companionIdentity'
        WHERE kind='sportsIdentity' AND EXISTS (
          SELECT 1 FROM accounts a WHERE a.id=entities.owner_id AND (
            (json_extract(entities.data,'$.role')='admin' AND (a.login_kind='ADMIN' OR EXISTS(SELECT 1 FROM json_each(a.roles) WHERE value='superadmin')))
            OR (json_extract(entities.data,'$.role') IN ('student','teacher') AND EXISTS(SELECT 1 FROM json_each(a.roles) WHERE value=json_extract(entities.data,'$.role')))
          )
        );
        INSERT INTO schema_migrations VALUES(8,strftime('%Y-%m-%dT%H:%M:%fZ','now'));`);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function migrateHistoricalSubjects(db) {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version=5").get())
    return;
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
  try {
    db.exec(`CREATE TABLE accounts_v5 (
      id TEXT PRIMARY KEY, email TEXT, password_hash TEXT, name TEXT,
      organization TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
      roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
      login_kind TEXT NOT NULL DEFAULT 'PERSONAL' CHECK(login_kind IN ('PERSONAL','ADMIN','HISTORY')),
      login_name TEXT UNIQUE, UNIQUE(email,login_kind),
      CHECK((login_kind='PERSONAL' AND login_name IS NULL AND email IS NOT NULL AND password_hash IS NOT NULL AND name IS NOT NULL)
        OR (login_kind='ADMIN' AND login_name IS NOT NULL AND length(login_name)>0 AND email IS NOT NULL AND password_hash IS NOT NULL AND name IS NOT NULL)
        OR (login_kind='HISTORY' AND login_name IS NULL AND email IS NULL AND password_hash IS NULL AND name IS NULL AND organization IS NULL AND status='banned' AND roles='[]'))
    );
    INSERT INTO accounts_v5 SELECT id,email,password_hash,name,organization,status,roles,created_at,login_kind,login_name FROM accounts;
    DROP TABLE accounts; ALTER TABLE accounts_v5 RENAME TO accounts;
    CREATE TRIGGER accounts_history_no_login BEFORE UPDATE ON accounts WHEN OLD.login_kind='HISTORY' AND NEW.login_kind<>'HISTORY' BEGIN SELECT RAISE(ABORT,'Historical subjects cannot regain login'); END;
    INSERT INTO schema_migrations VALUES(5,strftime('%Y-%m-%dT%H:%M:%fZ','now'));`);
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("历史主体迁移外键检查失败");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }
}
function migrateAccountNamespaces(db) {
  if (db.prepare("PRAGMA table_info(accounts)").all().some((c) => c.name === "login_kind"))
    return;
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
  try {
    db.exec(`
      CREATE TABLE accounts_v4 (
        id TEXT PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL,
        name TEXT NOT NULL, organization TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
        roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
        login_kind TEXT NOT NULL DEFAULT 'PERSONAL' CHECK(login_kind IN ('PERSONAL','ADMIN')),
        login_name TEXT UNIQUE,
        UNIQUE(email, login_kind),
        CHECK((login_kind='PERSONAL' AND login_name IS NULL) OR (login_kind='ADMIN' AND length(login_name)>0))
      );
      INSERT INTO accounts_v4(id,email,password_hash,name,organization,status,roles,created_at)
        SELECT id,email,password_hash,name,organization,status,roles,created_at FROM accounts;
      DROP TABLE accounts;
      ALTER TABLE accounts_v4 RENAME TO accounts;
      INSERT INTO schema_migrations VALUES(4,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    `);
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("账号迁移外键检查失败");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }
}
function openDatabase(filename) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;"
  );
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      name TEXT NOT NULL, organization TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
      roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id),
      expires_at INTEGER NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_challenges (
      email TEXT PRIMARY KEY, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_reset_challenges (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id),
      identifier TEXT NOT NULL, email TEXT NOT NULL, code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      sent_at INTEGER NOT NULL, consumed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS password_reset_account ON password_reset_challenges(account_id,sent_at);
    CREATE TABLE IF NOT EXISTS security_rate_events (
      category TEXT NOT NULL, subject TEXT NOT NULL, origin TEXT NOT NULL,
      occurred_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS security_rate_window ON security_rate_events(category,occurred_at,subject,origin);
    CREATE TABLE IF NOT EXISTS mail_outbox (
      id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL,
      body TEXT NOT NULL, created_at TEXT NOT NULL, delivered_at TEXT
    );
    CREATE TABLE IF NOT EXISTS admin_security_challenges (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id),
      purpose TEXT NOT NULL CHECK(purpose IN ('EMAIL_VERIFY','PASSWORD_RESET')),
      email TEXT NOT NULL, code_hash TEXT, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL,
      identity_version INTEGER NOT NULL, mail_id TEXT NOT NULL,
      consumed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS admin_challenge_account ON admin_security_challenges(account_id,purpose,sent_at);
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL,
      owner_id TEXT REFERENCES accounts(id), data TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS entities_kind_owner ON entities(kind, owner_id);
    CREATE TABLE IF NOT EXISTS relations (
      account_id TEXT NOT NULL REFERENCES accounts(id),
      entity_id TEXT NOT NULL REFERENCES entities(id), kind TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL,
      PRIMARY KEY (account_id, entity_id, kind)
    );
    CREATE TABLE IF NOT EXISTS post_views (
      post_id TEXT NOT NULL REFERENCES entities(id),
      viewer_id TEXT NOT NULL REFERENCES accounts(id),
      open_id TEXT NOT NULL,
      viewed_at TEXT NOT NULL,
      PRIMARY KEY (viewer_id, open_id)
    );
    CREATE INDEX IF NOT EXISTS post_views_post_time ON post_views(post_id, viewed_at);
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, recipient_id TEXT NOT NULL REFERENCES accounts(id),
      entity_id TEXT, event TEXT NOT NULL, body TEXT NOT NULL,
      created_at TEXT NOT NULL, read_at TEXT
    );
    CREATE INDEX IF NOT EXISTS notifications_recipient ON notifications(recipient_id, created_at);
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES accounts(id),
      role TEXT NOT NULL, action TEXT NOT NULL, entity_id TEXT,
      reason TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS command_receipts (
      actor_id TEXT NOT NULL REFERENCES accounts(id), request_id TEXT NOT NULL,
      request_hash TEXT NOT NULL, result TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (actor_id, request_id)
    );
    INSERT OR IGNORE INTO schema_migrations VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    INSERT OR IGNORE INTO schema_migrations VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
  `);
  migrateAccountNamespaces(db);
  migrateHistoricalSubjects(db);
  db.exec(
    "INSERT OR IGNORE INTO schema_migrations VALUES(6,strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
  );
  migrateCompanionIdentity(db);
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS verified_student_number_unique ON entities(json_extract(data,'$.studentNumber')) WHERE kind='companionIdentity' AND json_extract(data,'$.role')='student' AND json_extract(data,'$.status')='verified' AND json_extract(data,'$.studentNumber') IS NOT NULL");
  db.exec("INSERT OR IGNORE INTO schema_migrations VALUES(10,strftime('%Y-%m-%dT%H:%M:%fZ','now'))");
  return db;
}
function transaction(db, operation) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result2 = operation();
    db.exec("COMMIT");
    return result2;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
const exceeded = () => {
  throw new ServiceError(429, "RATE_LIMITED", "请求过于频繁，请稍后再试。");
};
function normalizedOrigin(value) {
  return digest((value || "unknown").slice(0, 200));
}
function count(db, category, field, value, since, distinct = false) {
  const expression = distinct ? "count(DISTINCT subject)" : "count(*)";
  return Number(db.prepare(`SELECT ${expression} AS count FROM security_rate_events WHERE category=? AND ${field}=? AND occurred_at>=?`).get(category, value, since).count);
}
function write(db, category, subject, origin, now) {
  db.prepare("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)").run(category, subject, origin, now);
  if (Math.random() < 0.01) db.prepare("DELETE FROM security_rate_events WHERE occurred_at<?").run(now - 864e5);
}
function takeEmailSend(db, email, origin) {
  const now = Date.now(), subject = digest(email), source = normalizedOrigin(origin);
  if (count(db, "email-send", "subject", subject, now - 36e5) >= 5 || count(db, "email-send", "subject", subject, now - 864e5) >= 10 || count(db, "email-send", "origin", source, now - 36e5, true) >= 20 || Number(db.prepare("SELECT count(*) AS count FROM security_rate_events WHERE category='email-send' AND occurred_at>=?").get(now - 36e5).count) >= 1e3) exceeded();
  write(db, "email-send", subject, source, now);
}
function takeStudentSearch(db, accountId, origin) {
  const now = Date.now(), source = normalizedOrigin(origin), subject = digest(accountId);
  if (count(db, "student-search", "subject", subject, now - 6e4) >= 10 || count(db, "student-search", "subject", subject, now - 864e5) >= 100 || count(db, "student-search", "origin", source, now - 6e4) >= 30) exceeded();
  write(db, "student-search", subject, source, now);
}
function takeLoginAttempt(db, identifier, origin) {
  const now = Date.now(), source = normalizedOrigin(origin), subject = digest(identifier);
  if (count(db, "login", "origin", source, now - 6e4) >= 60 || Number(db.prepare("SELECT count(*) AS count FROM security_rate_events WHERE category='login' AND subject=? AND origin=? AND occurred_at>=?").get(subject, source, now - 6e4).count) >= 12) exceeded();
  write(db, "login", subject, source, now);
}
const decode = (r) => ({
  id: r.id,
  kind: r.kind,
  ownerId: r.owner_id,
  data: JSON.parse(r.data),
  version: r.version,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});
function textField(data, key, max = 1e3, optional = false) {
  const value = data[key] ?? (optional ? "" : void 0);
  demand$1(
    typeof value === "string" && (optional || value.trim().length > 0) && value.trim().length <= max,
    `${key} 须为${optional ? "0" : "1"}–${max}字。`
  );
  return value.trim();
}
function integerField(data, key, min = 1, max = 1e4) {
  const value = data[key];
  demand$1(
    typeof value === "number" && Number.isInteger(value) && value >= min && value <= max,
    `${key} 须为 ${min}–${max} 的整数。`
  );
  return value;
}
const strings = (value) => Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
function enumField(data, key, allowed2) {
  demand$1(allowed2.includes(data[key]), `${key} 无效。`);
  return data[key];
}
class Repository {
  constructor(db) {
    this.db = db;
  }
  communityPostIndex() {
    return this.db.prepare("SELECT id,kind,owner_id,json_remove(data,'$.images','$.body') AS data,version,created_at,updated_at FROM entities WHERE kind='post' ORDER BY created_at DESC,id").all().map(decode);
  }
  communityCommentIndex() {
    return this.db.prepare("SELECT id,kind,owner_id,json_remove(data,'$.body') AS data,version,created_at,updated_at FROM entities WHERE kind='comment'").all().map(decode);
  }
  communityRelations() {
    return this.db.prepare("SELECT account_id AS accountId,entity_id AS entityId,kind FROM relations WHERE kind IN ('like','save','commentlike')").all();
  }
  activitySubscribers(id) {
    return this.db.prepare("SELECT DISTINCT account_id FROM relations WHERE entity_id=? AND kind IN ('participate','save')").all(id).map((row) => String(row.account_id));
  }
  updateAccount(id, status, roles) {
    this.db.prepare("UPDATE accounts SET status=?,roles=? WHERE id=?").run(status, JSON.stringify([...new Set(roles)]), id);
  }
  ownsNotification(id, recipientId) {
    return !!this.db.prepare("SELECT 1 FROM notifications WHERE id=? AND recipient_id=?").get(id, recipientId);
  }
  readNotification(id, recipientId, at) {
    this.db.prepare("UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND recipient_id=?").run(at, id, recipientId);
  }
  all(kind) {
    return this.db.prepare(
      "SELECT * FROM entities WHERE kind=? ORDER BY created_at DESC,id"
    ).all(kind).map(decode);
  }
  get(id, kind) {
    demand$1(typeof id === "string", "对象标识无效。");
    const row = this.db.prepare("SELECT * FROM entities WHERE id=?").get(id);
    demand$1(row && (!kind || row.kind === kind), "对象不存在。", 404);
    return decode(row);
  }
  create(kind, ownerId, data) {
    const now = timestamp(), id = randomUUID();
    this.db.prepare(
      "INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)"
    ).run(id, kind, ownerId, JSON.stringify(data), now, now);
    return this.get(id);
  }
  save(entity, patch) {
    this.db.prepare(
      "UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?"
    ).run(
      JSON.stringify({ ...entity.data, ...patch }),
      timestamp(),
      entity.id
    );
    return this.get(entity.id);
  }
  people() {
    return this.db.prepare(
      "SELECT id,name,organization,status,roles FROM accounts WHERE login_kind<>'HISTORY'"
    ).all().map((row) => ({
      id: String(row.id),
      name: String(row.name),
      organization: String(row.organization),
      status: row.status,
      roles: JSON.parse(String(row.roles))
    }));
  }
  person(id) {
    const row = this.db.prepare(
      "SELECT id,COALESCE(email,'') AS email,COALESCE(name,'已注销用户') AS name,COALESCE(organization,'') AS organization,status,roles FROM accounts WHERE id=?"
    ).get(id);
    demand$1(row, "账号不存在。", 404);
    return {
      ...row,
      roles: JSON.parse(String(row.roles))
    };
  }
  notify(recipients, entityId, event, body2) {
    for (const recipient of new Set(recipients))
      this.db.prepare(
        "INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES(?,?,?,?,?,?)"
      ).run(randomUUID(), recipient, entityId, event, body2, timestamp());
  }
  related(accountId, entityId, kind) {
    return !!this.db.prepare(
      "SELECT 1 FROM relations WHERE account_id=? AND entity_id=? AND kind=?"
    ).get(accountId, entityId, kind);
  }
  relation(accountId, entityId, kind, enabled) {
    if (enabled)
      this.db.prepare(
        "INSERT OR IGNORE INTO relations(account_id,entity_id,kind,created_at) VALUES(?,?,?,?)"
      ).run(accountId, entityId, kind, timestamp());
    else
      this.db.prepare(
        "DELETE FROM relations WHERE account_id=? AND entity_id=? AND kind=?"
      ).run(accountId, entityId, kind);
  }
}
const studentEmail = (email) => /^[^\s@]+@mail\.bnbu\.edu\.cn$/i.test(email);
const emailIdentityReason = "学校邮箱已验证，自动获得学生身份。";
function emailIdentityData(email, request, numberFree) {
  return {
    role: "student",
    status: "verified",
    schoolEmail: email,
    source: "verified-student-email",
    verifiedAt: timestamp(),
    ...request && numberFree ? { studentNumber: request.data.studentNumber, schoolName: request.data.schoolName } : {}
  };
}
function ensureStudentEmailIdentity(db, row) {
  if (row.login_kind !== "PERSONAL" || row.status === "banned" || !studentEmail(row.email) || JSON.parse(row.roles).includes("student")) return row;
  const apply = () => {
    const repo = new Repository(db);
    if (!repo.all("verifiedEmail").some((item) => item.ownerId === row.id && item.data.email === row.email)) return row;
    const identities = repo.all("companionIdentity").filter((item) => item.ownerId === row.id && item.data.role === "student");
    const request = repo.all("studentIdentityRequest").filter((item) => item.ownerId === row.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))[0];
    if (identities.some((item) => item.data.status === "revoked") || request?.data.status === "revoked") return row;
    const numberFree = !repo.all("companionIdentity").some((item) => item.ownerId !== row.id && item.data.role === "student" && item.data.status === "verified" && item.data.studentNumber === request?.data.studentNumber);
    const identity = identities.find((item) => item.data.status === "verified") ?? repo.create("companionIdentity", row.id, emailIdentityData(row.email, request, numberFree));
    const updated = { ...row, roles: JSON.stringify([.../* @__PURE__ */ new Set([...account(row).roles, "student"])]) };
    db.prepare("UPDATE accounts SET roles=? WHERE id=?").run(updated.roles, row.id);
    if (request && ["pending", "rejected"].includes(String(request.data.status))) repo.save(request, { status: "verified", source: "verified-student-email", reason: emailIdentityReason, reviewedAt: timestamp() });
    repo.notify([row.id], identity.id, "student.identity.verified", emailIdentityReason);
    db.prepare("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), row.id, "student", "student.identity.email-grant", identity.id, emailIdentityReason, JSON.stringify({ source: "verified-student-email" }), timestamp());
    return updated;
  };
  return db.isTransaction ? apply() : transaction(db, apply);
}
class ServiceError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
function demand$1(condition, message, status = 400) {
  if (!condition)
    throw new ServiceError(
      status,
      status === 403 ? "FORBIDDEN" : "INVALID_REQUEST",
      message
    );
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
const timestamp = () => (/* @__PURE__ */ new Date()).toISOString();
const account = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  organization: row.organization,
  status: row.status,
  roles: JSON.parse(row.roles)
});
function normalizeEmail(value) {
  demand$1(typeof value === "string" && value.length <= 254, "请填写有效邮箱。");
  const email = value.trim().toLowerCase();
  demand$1(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "请填写有效邮箱。");
  return email;
}
function hashPassword(value) {
  demand$1(
    typeof value === "string" && value.length >= 8 && value.length <= 128,
    "密码须为 8–128 个字符。"
  );
  return encodePassword(value);
}
function encodePassword(value) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
function matchesPassword(value, encoded) {
  const [salt, hash] = encoded.split(":");
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function issueCode(db, rawEmail, origin = "local") {
  const email = normalizeEmail(rawEmail), now = Date.now();
  const code = String(randomInt(1e5, 1e6)), id = randomUUID();
  transaction(db, () => {
    const previous = db.prepare("SELECT sent_at FROM email_challenges WHERE email=?").get(email);
    demand$1(!previous || now - previous.sent_at >= 6e4, "请稍后再发送验证码。", 429);
    takeEmailSend(db, email, origin);
    db.prepare(
      "INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES(?,?,?,0,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at"
    ).run(email, digest(`${email}:${code}`), now + 6e5, now);
    db.prepare(
      "INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)"
    ).run(
      id,
      email,
      "伴学注册验证码",
      `验证码：${code}，10 分钟内有效。`,
      timestamp()
    );
  });
  return {
    sent: true,
    delivery: "local-outbox",
    message: "验证码已写入本地开发收件箱，未发送至真实邮箱。"
  };
}
function register(db, input) {
  const email = normalizeEmail(input.email);
  demand$1(typeof input.code === "string" && /^\d{6}$/.test(input.code), "请填写六位验证码。");
  const challenge = db.prepare("SELECT * FROM email_challenges WHERE email=?").get(email);
  demand$1(
    challenge && challenge.expires_at > Date.now() && challenge.attempts < 5,
    "验证码已失效，请重新获取。"
  );
  db.prepare(
    "UPDATE email_challenges SET attempts=attempts+1 WHERE email=?"
  ).run(email);
  demand$1(
    digest(`${email}:${input.code}`) === challenge.code_hash,
    "验证码错误。"
  );
  demand$1(
    !db.prepare(
      "SELECT id FROM accounts WHERE email=? AND login_kind='PERSONAL'"
    ).get(email),
    "该邮箱已注册。",
    409
  );
  const passwordHash = hashPassword(input.password);
  const registeredId = randomUUID();
  transaction(db, () => {
    db.prepare(
      "INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES(?,?,?,?,?)"
    ).run(
      registeredId,
      email,
      passwordHash,
      email.split("@")[0].slice(0, 20),
      timestamp()
    );
    db.prepare("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(randomUUID(), "verifiedEmail", registeredId, JSON.stringify({ email, source: "registration-code" }), timestamp(), timestamp());
    db.prepare("DELETE FROM email_challenges WHERE email=?").run(email);
    ensureStudentEmailIdentity(db, db.prepare("SELECT * FROM accounts WHERE id=?").get(registeredId));
  });
  return { registered: true };
}
function login(db, rawEmail, rawPassword, origin = "local") {
  const email = normalizeEmail(rawEmail);
  return credentialLogin(db, email, rawPassword, "PERSONAL", origin);
}
function loginAdministrator(db, rawName, rawPassword, origin = "local") {
  demand$1(
    typeof rawName === "string" && rawName.trim().length > 0 && rawName.trim().length <= 100,
    "请填写管理登录账号。"
  );
  return credentialLogin(
    db,
    rawName.trim().toLowerCase(),
    rawPassword,
    "ADMIN",
    origin
  );
}
function credentialLogin(db, identifier, rawPassword, kind, origin = "local", rated = false) {
  demand$1(typeof rawPassword === "string", "邮箱或密码错误。", 401);
  if (!rated) takeLoginAttempt(db, identifier, origin);
  const now = Date.now();
  const row = db.prepare(
    kind === "PERSONAL" ? "SELECT * FROM accounts WHERE email=? AND login_kind='PERSONAL'" : "SELECT * FROM accounts WHERE login_name=? AND login_kind='ADMIN'"
  ).get(identifier);
  const fallback = "00000000000000000000000000000000:" + "00".repeat(64);
  const valid = matchesPassword(rawPassword, row?.password_hash ?? fallback);
  if (!row || !valid) {
    throw new ServiceError(401, "INVALID_CREDENTIALS", "邮箱或密码错误。");
  }
  if (kind === "ADMIN") {
    if (row.status !== "active")
      throw new ServiceError(403, "ACCOUNT_DISABLED", "管理账号已停用。");
    demand$1(
      db.prepare(
        "SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=? AND json_extract(data,'$.role')='admin' AND json_extract(data,'$.status')='verified'"
      ).get(row.id),
      "管理账号身份不可用。",
      403
    );
  }
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions VALUES(?,?,?,?)").run(
    digest(token),
    row.id,
    now + 432e5,
    timestamp()
  );
  return { token, account: account(ensureStudentEmailIdentity(db, row)) };
}
function authenticate(db, token) {
  if (!token) throw new ServiceError(401, "UNAUTHENTICATED", "请先登录。");
  const row = db.prepare(
    "SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?"
  ).get(digest(token), Date.now());
  if (!row)
    throw new ServiceError(401, "UNAUTHENTICATED", "登录已过期，请重新登录。");
  if (row.login_kind === "HISTORY")
    throw new ServiceError(401, "UNAUTHENTICATED", "登录已失效。");
  if (row.login_kind === "ADMIN" && row.status !== "active")
    throw new ServiceError(403, "ACCOUNT_DISABLED", "管理账号已停用。");
  return account(ensureStudentEmailIdentity(db, row));
}
function verifyOwnEmail(db, actor, code) {
  demand$1(actor.status !== "banned", "账号已封禁。", 403);
  const row = db.prepare("SELECT * FROM email_challenges WHERE email=?").get(actor.email);
  demand$1(row && row.expires_at > Date.now() && row.attempts < 5, "验证码已失效，请重新获取。");
  db.prepare("UPDATE email_challenges SET attempts=attempts+1 WHERE email=?").run(actor.email);
  demand$1(typeof code === "string" && digest(actor.email + ":" + code) === row.code_hash, "验证码不正确。");
  transaction(db, () => {
    db.prepare("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(randomUUID(), "verifiedEmail", actor.id, JSON.stringify({ email: actor.email, source: "own-email-code" }), timestamp(), timestamp());
    db.prepare("DELETE FROM email_challenges WHERE email=?").run(actor.email);
    ensureStudentEmailIdentity(db, db.prepare("SELECT * FROM accounts WHERE id=?").get(actor.id));
  });
  return { verified: true };
}
function loginUnified(db, rawIdentifier, password, origin = "local") {
  demand$1(typeof rawIdentifier === "string" && rawIdentifier.trim().length > 0 && rawIdentifier.trim().length <= 254, "请填写邮箱或管理账号。");
  const identifier = rawIdentifier.trim().toLowerCase();
  takeLoginAttempt(db, identifier, origin);
  const candidates = db.prepare("SELECT login_kind,password_hash FROM accounts WHERE (login_kind='PERSONAL' AND email=?) OR (login_kind='ADMIN' AND login_name=?)").all(identifier, identifier);
  const matching = typeof password === "string" ? candidates.filter((row) => matchesPassword(password, row.password_hash)) : [];
  demand$1(matching.length <= 1, "账号标识重复，请联系管理员调整管理登录账号。", 409);
  return credentialLogin(db, identifier, password, matching[0]?.login_kind ?? candidates[0]?.login_kind ?? "PERSONAL", origin, true);
}
function studentNumber(db, actor) {
  return recordedStudentNumber(actor, new Repository(db).all("companionIdentity"));
}
function recordedStudentNumber(actor, records) {
  if (!actor.roles.includes("student") || actor.status === "banned") return null;
  const identities = records.filter((e) => e.ownerId === actor.id && e.data.role === "student" && e.data.status === "verified");
  if (identities.length !== 1) return null;
  const number = identities[0].data.studentNumber;
  return typeof number === "string" && number.trim() ? number.trim() : null;
}
function searchStudents(db, actor, query, origin = "local") {
  validateStudentSearch(actor, query);
  const repo = new Repository(db);
  const identities = repo.all("companionIdentity"), preferences = repo.all("preferences"), profiles = repo.all("profile");
  demand$1(recordedStudentNumber(actor, identities), "仅已核验学生可按学号查找。", 403);
  takeStudentSearch(db, actor.id, origin);
  const ids = new Set(identities.filter((i) => i.data.studentNumber === query.trim()).map((i) => i.ownerId));
  return { students: [...ids].flatMap((id) => {
    const row = db.prepare("SELECT id,email,name,organization,status,roles FROM accounts WHERE id=? AND login_kind='PERSONAL'").get(id);
    if (!row) return [];
    return studentSearchResult({ ...row, roles: JSON.parse(row.roles) }, preferences.find((p) => p.ownerId === id)?.data, identities, profiles.find((p) => p.ownerId === id)?.data).students;
  }) };
}
function validateStudentSearch(actor, query) {
  demand$1(actor.roles.includes("student") && actor.status !== "banned", "仅学生可按学号查找。", 403);
  demand$1(query.trim().length > 0 && query.length <= 100, "请填写完整学号。");
}
function studentSearchResult(person, prefs, proofs, profile) {
  if (!recordedStudentNumber(person, proofs) || prefs?.searchable === false) return { students: [] };
  const shown = prefs?.profilePreview === false ? void 0 : profile;
  return { students: [{
    id: person.id,
    name: person.name,
    organization: prefs?.profilePreview === false ? "" : person.organization,
    ...typeof shown?.nickname === "string" ? { nickname: shown.nickname } : {},
    ...typeof shown?.avatar === "string" ? { avatar: shown.avatar } : {}
  }] };
}
function* effect(value) {
  return yield value;
}
function runSync(policy) {
  let step = policy.next();
  while (!step.done) {
    if (step.value instanceof Promise) throw new Error("Async storage requires runAsync");
    step = policy.next(step.value);
  }
  return step.value;
}
async function runAsync(policy) {
  let step = policy.next();
  while (!step.done) {
    let value;
    try {
      value = await step.value;
    } catch (error) {
      step = policy.throw(error);
      continue;
    }
    step = policy.next(value);
  }
  return step.value;
}
const normalized = (value) => value.normalize("NFKC").toLowerCase();
const canManage = (actor) => demand$1(actor.roles.some((role) => ["superadmin", "reviewer", "operator"].includes(role)), "需要管理员职责。", 403);
function* communityKeywordPolicy(repo, actor, action, input) {
  if (!["keyword.save", "keyword.set", "keyword.delete"].includes(action)) return void 0;
  canManage(actor);
  if (action === "keyword.delete") {
    const keyword = yield* effect(repo.get(input.id, "communityKeyword"));
    demand$1(keyword.data.deleted !== true, "词汇已删除。", 409);
    return yield* effect(repo.save(keyword, { enabled: false, deleted: true }));
  }
  if (action === "keyword.set") {
    demand$1(typeof input.enabled === "boolean", "enabled 必须为布尔值。");
    const keyword = yield* effect(repo.get(input.id, "communityKeyword"));
    demand$1(keyword.data.deleted !== true, "词汇已删除。", 409);
    demand$1(keyword.data.enabled !== input.enabled, "词汇已处于该状态。", 409);
    return yield* effect(repo.save(keyword, { enabled: input.enabled }));
  }
  const word = textField(input, "word", 80);
  demand$1(!/[\r\n]/.test(word), "词汇不能包含换行。");
  const current = typeof input.id === "string" ? yield* effect(repo.get(input.id, "communityKeyword")) : void 0;
  demand$1(!current || current.data.deleted !== true, "词汇已删除。", 409);
  const duplicate = (yield* effect(repo.all("communityKeyword"))).some((item) => item.data.deleted !== true && item.id !== current?.id && normalized(String(item.data.word)) === normalized(word));
  demand$1(!duplicate, "词汇已存在。", 409);
  return current ? yield* effect(repo.save(current, { word })) : yield* effect(repo.create("communityKeyword", actor.id, { word, enabled: true }));
}
function* checkCommunityKeywords(repo, ...contents) {
  const keywords = yield* effect(repo.all("communityKeyword"));
  const text2 = normalized(contents.join("\n"));
  demand$1(
    !keywords.some((item) => item.data.deleted !== true && item.data.enabled === true && text2.includes(normalized(String(item.data.word)))),
    "内容包含屏蔽词，请修改后再发布。"
  );
}
const normal = (value) => value.normalize("NFKC").toLocaleLowerCase("zh-CN");
function recommendationScore(post, signals, metrics, now = Date.now()) {
  const ageDays = Math.max(0, (now - Date.parse(post.createdAt)) / 864e5);
  const fresh = 14 * Math.exp(-ageDays / 7);
  const affinity = Math.min(40, (signals.board.get(post.board) ?? 0) * 4);
  const activity = Math.min(10, (metrics.views.get(post.id) ?? 0) * 0.2) + Math.min(20, (metrics.likes.get(post.id) ?? 0) * 2) + Math.min(24, (metrics.comments.get(post.id) ?? 0) * 3);
  return fresh + affinity + activity - (signals.viewed.has(post.id) ? 2 : 0);
}
function searchRelevance(post, query) {
  const words = normal(query).trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length) return 0;
  const title = normal(post.title), body2 = normal(post.body), board = normal(post.board), author = normal(post.author);
  let score = 0;
  for (const word of words) {
    if (title.includes(word)) score += title === word ? 12 : 8;
    else if (board.includes(word)) score += 6;
    else if (author.includes(word)) score += 4;
    else if (body2.includes(word)) score += 2;
    else return -1;
  }
  return score;
}
function rankCommunity(candidates, options2, signals, metrics, now = Date.now()) {
  const query = (options2.query ?? "").trim();
  return candidates.filter((item) => (!options2.board || options2.board === "全部" || item.board === options2.board) && (item.status === "visible" || item.status === "pending")).map((item) => ({ item, relevance: searchRelevance(item, query), recommendation: recommendationScore(item, signals, metrics, now) })).filter((row) => row.relevance >= 0).sort((a, b) => query ? b.relevance - a.relevance || b.recommendation - a.recommendation || b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id) : options2.sort === "newest" ? b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id) : b.recommendation - a.recommendation || b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id)).map((row) => row.item);
}
function rankHotSummaries(candidates, metrics) {
  const publicPosts = candidates.filter((item) => item.status === "visible");
  const eligiblePostCount = publicPosts.length, byBoard = {};
  if (eligiblePostCount <= 75) return { eligiblePostCount, overall: [], byBoard };
  const ranked = publicPosts.map((item) => {
    const views = metrics.views.get(item.id) ?? 0, likes = metrics.likes.get(item.id) ?? 0, comments = metrics.comments.get(item.id) ?? 0;
    return { ...item, views, likes, comments, score: views + 5 * likes + 10 * comments };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || b.comments - a.comments || b.likes - a.likes || b.views - a.views || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  for (const item of ranked) {
    const bucket = byBoard[item.board] ??= [];
    if (bucket.length < 10) bucket.push(item.id);
  }
  return { eligiblePostCount, overall: ranked.slice(0, 10).map((item) => item.id), byBoard };
}
const socialBlocked = (edges, a, b) => edges.some((e) => e.data.kind === "block" && e.data.enabled === true && (e.ownerId === a && e.data.targetId === b || e.ownerId === b && e.data.targetId === a));
function* requireSocialAccess(repo, actor, ownerId) {
  demand$1(!socialBlocked(yield* effect(repo.all("socialEdge")), actor.id, ownerId), "当前无法与该用户互动。", 403);
}
function validPostImages(value, original = []) {
  demand$1(Array.isArray(value), "图片列表无效。");
  const allowed2 = strings(original).map((src) => src.split("?")[0]);
  const images = strings(value);
  demand$1(images.length === value.length && images.length <= 9 && images.every((src) => /^data:image\/(jpeg|png|webp);base64,/.test(src) && src.length <= 7e6 || allowed2.includes(src.split("?")[0])), "最多九张有效 JPG、PNG、WebP 图片。");
  return images;
}
function* communitySocialPolicy(repo, actor, action, input) {
  if (action === "direct.send") {
    demand$1(actor.roles.includes("student") && actor.status === "active", "账号当前不能发送私信。", 403);
    const targetId = textField(input, "targetId", 100);
    demand$1(targetId !== actor.id, "不能给自己发送私信。");
    const target = yield* effect(repo.person(targetId));
    demand$1(target.roles.includes("student") && target.status === "active", "用户当前不可私信。", 403);
    yield* requireSocialAccess(repo, actor, targetId);
    yield* communitySocialRead(repo, actor, new URLSearchParams({ person: targetId }));
    const messages = yield* effect(repo.all("directMessage"));
    demand$1(messages.filter((m) => m.ownerId === actor.id && Date.parse(m.createdAt) > Date.now() - 6e4).length < 20, "发送过于频繁，请稍后再试。", 429);
    const message = yield* effect(repo.create("directMessage", actor.id, { targetId, body: textField(input, "body", 500) }));
    yield* effect(repo.notify([targetId], null, "community.direct", "你收到了一条校园私信。"));
    return message;
  }
  if (!["social.follow", "social.block", "social.dismiss", "draft.save", "draft.delete", "post.update", "comment.delete", "comment.like"].includes(action)) return;
  demand$1(actor.roles.includes("student"), "需要已授权学生身份。", 403);
  if (["post.update", "comment.like", "social.follow"].includes(action)) demand$1(actor.status === "active", "账号当前不能发帖、评论或互动。", 403);
  if (action === "social.follow" || action === "social.block") {
    const targetId = textField(input, "targetId", 100), kind = action === "social.follow" ? "follow" : "block";
    demand$1(targetId !== actor.id, "不能对自己执行此操作。");
    const target = yield* effect(repo.person(targetId));
    demand$1(target.roles.includes("student") && target.status !== "banned", "用户当前不可访问。", 404);
    demand$1(typeof input.enabled === "boolean", "请明确操作状态。");
    const edges = yield* effect(repo.all("socialEdge"));
    if (kind === "follow" && input.enabled) {
      demand$1(!socialBlocked(edges, actor.id, targetId), "请先解除屏蔽。", 403);
      const publicPosts = (yield* effect(repo.communityPostIndex())).filter((p) => p.data.status === "visible");
      const publicAuthor = publicPosts.some((p) => p.ownerId === targetId) || (yield* effect(repo.communityCommentIndex())).some((c) => c.ownerId === targetId && c.data.status === "visible" && publicPosts.some((p) => p.id === c.data.postId));
      demand$1(publicAuthor || edges.some((e) => e.ownerId === actor.id && e.data.targetId === targetId), "请从公开内容访问作者。", 403);
    }
    const old = edges.find((e) => e.ownerId === actor.id && e.data.targetId === targetId && e.data.kind === kind);
    if (kind === "block" && input.enabled) for (const edge of edges.filter((e) => e.data.kind === "follow" && (e.ownerId === actor.id && e.data.targetId === targetId || e.ownerId === targetId && e.data.targetId === actor.id))) yield* effect(repo.save(edge, { enabled: false }));
    if (kind === "follow" && input.enabled && old?.data.enabled !== true) yield* effect(repo.notify([targetId], null, "community.follow", "有同学关注了你。"));
    return old ? yield* effect(repo.save(old, { enabled: input.enabled })) : yield* effect(repo.create("socialEdge", actor.id, { targetId, kind, enabled: input.enabled }));
  }
  if (action === "social.dismiss") {
    const post2 = yield* effect(repo.get(input.id, "post"));
    demand$1(post2.data.status === "visible", "帖子当前不可查看。", 403);
    const old = (yield* effect(repo.all("socialEdge"))).find((e) => e.ownerId === actor.id && e.data.targetId === post2.id && e.data.kind === "dismiss");
    return old ? yield* effect(repo.save(old, { enabled: input.enabled !== false })) : yield* effect(repo.create("socialEdge", actor.id, { targetId: post2.id, kind: "dismiss", enabled: true }));
  }
  if (action === "draft.save" || action === "draft.delete") {
    const draft = input.id ? yield* effect(repo.get(input.id, "postDraft")) : null;
    if (draft) demand$1(draft.ownerId === actor.id && draft.data.status === "draft", "只能处理本人的有效草稿。", 403);
    if (action === "draft.delete") {
      demand$1(draft, "草稿不存在。", 404);
      return yield* effect(repo.save(draft, { status: "deleted", images: [], body: "", title: "" }));
    }
    if (draft) demand$1(input.version === draft.version, "草稿已更新，请重新打开。", 409);
    else demand$1((yield* effect(repo.all("postDraft"))).filter((d) => d.ownerId === actor.id && d.data.status === "draft").length < 50, "草稿箱已满，请先处理已有草稿。", 409);
    const source = input.sourcePostId ? yield* effect(repo.get(input.sourcePostId, "post")) : null;
    if (source) demand$1(source.ownerId === actor.id, "只能编辑本人帖子。", 403);
    const patch = { title: textField(input, "title", 80, true), body: textField(input, "body", 1e3, true), board: textField(input, "board", 40), images: validPostImages(input.images ?? [], draft?.data.images ?? source?.data.images), status: "draft", ...source ? { sourcePostId: source.id, sourceVersion: input.sourceVersion } : {} };
    return draft ? yield* effect(repo.save(draft, patch)) : yield* effect(repo.create("postDraft", actor.id, patch));
  }
  if (action === "post.update") {
    const post2 = yield* effect(repo.get(input.id, "post"));
    demand$1(post2.ownerId === actor.id, "只能编辑本人帖子。", 403);
    demand$1(post2.data.status === "visible" || post2.data.status === "pending", "此帖子当前不能编辑。", 409);
    demand$1(input.version === post2.version, "内容已更新，请刷新后重试。", 409);
    const title = textField(input, "title", 80), body2 = textField(input, "body", 1e3);
    yield* checkCommunityKeywords(repo, title, body2);
    const draft = input.draftId ? yield* effect(repo.get(input.draftId, "postDraft")) : null;
    if (draft) demand$1(draft.ownerId === actor.id && draft.data.status === "draft" && draft.data.sourcePostId === post2.id, "草稿已失效。", 409);
    const result2 = yield* effect(repo.save(post2, { title, body: body2, board: textField(input, "board", 40), images: validPostImages(input.images, [...strings(post2.data.images), ...strings(draft?.data.images)]), editedAt: (/* @__PURE__ */ new Date()).toISOString() }));
    if (draft) yield* effect(repo.save(draft, { status: "published", postId: post2.id, images: [], body: "" }));
    return result2;
  }
  const comment = yield* effect(repo.get(input.id, "comment")), post = yield* effect(repo.get(comment.data.postId, "post"));
  demand$1(post.data.status === "visible", "帖子当前不可查看。", 403);
  if (action === "comment.delete") {
    demand$1(comment.ownerId === actor.id, "只能删除本人评论。", 403);
    demand$1(comment.data.status !== "deleted", "评论已删除。", 409);
    return yield* effect(repo.save(comment, { status: "deleted" }));
  }
  demand$1(comment.data.status === "visible", "评论当前不可查看。", 403);
  yield* requireSocialAccess(repo, actor, comment.ownerId);
  demand$1(typeof input.enabled === "boolean", "请明确点赞状态。");
  const before = yield* effect(repo.related(actor.id, comment.id, "commentlike"));
  yield* effect(repo.relation(actor.id, comment.id, "commentlike", input.enabled));
  if (input.enabled && !before && comment.ownerId !== actor.id) yield* effect(repo.notify([comment.ownerId], post.id, "community.commentlike", "你的评论收到一个赞。"));
  return comment;
}
function* filterCommunityCandidates(repo, actor, all, params) {
  const edges = yield* effect(repo.all("socialEdge")), own = edges.filter((e) => e.ownerId === actor.id && e.data.enabled === true);
  const author = params.get("author"), view = params.get("view"), alumni = params.get("alumni");
  const alumniState = params.get("alumniFollowing") === "1" ? (yield* effect(repo.all("alumniState")))[0]?.data.value : void 0;
  demand$1(!["saved", "liked"].includes(view ?? "") || !author || author === actor.id, "赞过和收藏只对本人展示。", 403);
  const relations = ["saved", "liked"].includes(view ?? "") ? yield* effect(repo.communityRelations()) : [];
  return all.filter((p) => (!alumni || Boolean(p.alumniId) && (alumni === "all" || p.alumniId === alumni)) && (params.get("alumniFollowing") !== "1" || alumniState?.follows.some((f) => f.student === actor.id && f.alumniId === p.alumniId)) && !socialBlocked(edges, actor.id, p.ownerId) && (!author || ["saved", "liked"].includes(view ?? "") || p.ownerId === author) && (view !== "following" || own.some((e) => e.data.kind === "follow" && e.data.targetId === p.ownerId)) && (view !== "mine" || p.ownerId === actor.id) && (!["saved", "liked"].includes(view ?? "") || relations.some((r) => r.accountId === actor.id && r.entityId === p.id && r.kind === (view === "saved" ? "save" : "like"))) && (view === "mine" || author === actor.id || !own.some((e) => e.data.kind === "dismiss" && e.data.targetId === p.id)));
}
function* communitySocialRead(repo, actor, params) {
  demand$1(actor.roles.length > 0 && actor.status !== "banned", "请先完成校园身份核验。", 403);
  const edges = yield* effect(repo.all("socialEdge")), posts = yield* effect(repo.communityPostIndex()), relations = yield* effect(repo.communityRelations());
  const privateMessages = (yield* effect(repo.all("directMessage"))).filter((m) => m.ownerId === actor.id || m.data.targetId === actor.id);
  const id = params.get("person") || actor.id, self = id === actor.id;
  const publicPosts = posts.filter((p) => p.data.status === "visible");
  const publicComments = (yield* effect(repo.communityCommentIndex())).filter((c) => c.data.status === "visible" && publicPosts.some((p) => p.id === c.data.postId));
  const canVisit = (personId) => personId === actor.id || privateMessages.some((m) => m.ownerId === personId || m.data.targetId === personId) || publicPosts.some((p) => p.ownerId === personId) || publicComments.some((c) => c.ownerId === personId) || edges.some((e) => ["follow", "block"].includes(String(e.data.kind)) && e.data.enabled === true && (e.ownerId === actor.id && e.data.targetId === personId || e.ownerId === personId && e.data.targetId === actor.id));
  demand$1(canVisit(id), "用户当前不可访问。", 404);
  const account2 = yield* effect(repo.person(id));
  demand$1(account2.roles.includes("student") && account2.status !== "banned", "用户当前不可访问。", 404);
  const profiles = yield* effect(repo.all("profile")), preferences = yield* effect(repo.all("preferences"));
  const projection = (person2) => projectDisplayPeople(actor, [person2], /* @__PURE__ */ new Set([person2.id]), preferences, profiles)[0];
  const person = projection(account2), blocked = socialBlocked(edges, actor.id, id);
  const active = edges.filter((e) => e.data.kind === "follow" && e.data.enabled === true);
  const followers = active.filter((e) => e.data.targetId === id), following = active.filter((e) => e.ownerId === id);
  const mine = publicPosts.filter((p) => p.ownerId === id), postIds = new Set(mine.map((p) => p.id));
  const profile = { id, name: person?.nickname || person?.name || account2.name, avatar: person?.avatar ?? "", cover: self || person?.nickname !== void 0 ? String(profiles.find((p) => p.ownerId === id)?.data.cover ?? preferences.find((p) => p.ownerId === id)?.data.profileBackground ?? "lakeside") : "lakeside", bio: self || person?.nickname !== void 0 ? String(profiles.find((p) => p.ownerId === id)?.data.bio ?? "") : "", following: following.length, followers: followers.length, appreciations: relations.filter((r) => postIds.has(r.entityId) && (r.kind === "like" || r.kind === "save")).length, posts: mine.length, isFollowing: active.some((e) => e.ownerId === actor.id && e.data.targetId === id), blocked, blockedByMe: edges.some((e) => e.ownerId === actor.id && e.data.kind === "block" && e.data.enabled === true && e.data.targetId === id), self };
  const tab = params.get("list"), page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  let list = [];
  if (self && tab === "blocked") list = edges.filter((e) => e.ownerId === id && e.data.kind === "block" && e.data.enabled === true);
  if (tab === "followers") list = followers;
  if (tab === "following") list = following;
  const people = [];
  if (!blocked || self) for (const edge of list.slice((page - 1) * 20, page * 20)) {
    const personId = tab === "followers" ? edge.ownerId : String(edge.data.targetId);
    if (!canVisit(personId) || socialBlocked(edges, actor.id, personId) && tab !== "blocked") continue;
    const target = yield* effect(repo.person(personId));
    if (target.status === "banned") continue;
    const display = projection(target);
    people.push({ id: personId, name: display?.nickname || display?.name || target.name, avatar: display?.avatar ?? "", self: personId === actor.id, isFollowing: active.some((e) => e.ownerId === actor.id && e.data.targetId === personId) });
  }
  const messages = tab === "chat" && !self ? privateMessages.filter((m) => m.ownerId === id || m.data.targetId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)) : [];
  const conversations = [];
  if (self && tab === "inbox") for (const targetId of [...new Set(privateMessages.map((m) => m.ownerId === actor.id ? String(m.data.targetId) : m.ownerId))]) {
    const target = yield* effect(repo.person(targetId));
    if (target.status === "banned" || socialBlocked(edges, actor.id, targetId)) continue;
    const display = projection(target), last = privateMessages.filter((m) => m.ownerId === targetId || m.data.targetId === targetId).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))[0];
    conversations.push({ id: targetId, name: display?.nickname || display?.name || target.name, avatar: display?.avatar ?? "", body: String(last.data.body), createdAt: last.createdAt });
  }
  const drafts = self ? (yield* effect(repo.all("postDraft"))).filter((d) => d.ownerId === actor.id && d.data.status === "draft").map((d) => ({ id: d.id, title: d.data.title, updatedAt: d.updatedAt })) : [];
  const dismissed = self ? edges.filter((e) => e.ownerId === actor.id && e.data.kind === "dismiss" && e.data.enabled === true).flatMap((edge) => {
    const post = publicPosts.find((p) => p.id === edge.data.targetId && !socialBlocked(edges, actor.id, p.ownerId));
    return post ? [{ id: post.id, title: String(post.data.title) }] : [];
  }) : [];
  const reports = self && tab === "reports" ? (yield* effect(repo.all("report"))).filter((r) => r.ownerId === actor.id) : [];
  return { profile, people, messages: messages.slice(-page * 50).map((m) => ({ id: m.id, body: m.data.body, mine: m.ownerId === actor.id, createdAt: m.createdAt })), messagesHasMore: messages.length > page * 50, conversations: conversations.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), dismissed, reports: reports.slice((page - 1) * 20, page * 20).map((r) => ({ id: r.id, title: String(r.data.snapshot?.title ?? "评论"), reason: r.data.reason, status: r.data.status, resolution: r.data.resolution, createdAt: r.createdAt })), hasMore: page * 20 < (tab === "reports" ? reports.length : list.length), drafts: drafts.slice(0, 50), draftCount: drafts.length, followingIds: edges.filter((e) => e.ownerId === actor.id && e.data.kind === "follow" && e.data.enabled === true).map((e) => e.data.targetId), ...self && params.get("draft") ? { draft: (yield* effect(repo.all("postDraft"))).find((d) => d.id === params.get("draft") && d.ownerId === id && d.data.status === "draft") ?? null } : {} };
}
function* communityCounts(repo, ids) {
  const relations = yield* effect(repo.communityRelations()), comments = yield* effect(repo.communityCommentIndex());
  const count2 = (values) => {
    const result2 = /* @__PURE__ */ new Map();
    for (const id of values) result2.set(id, (result2.get(id) ?? 0) + 1);
    return result2;
  };
  return { saves: count2(relations.filter((r) => r.kind === "save" && ids.includes(r.entityId)).map((r) => r.entityId)), comments: count2(comments.filter((c) => c.data.status === "visible" && ids.includes(String(c.data.postId))).map((c) => String(c.data.postId))), commentLikes: count2(relations.filter((r) => r.kind === "commentlike").map((r) => r.entityId)), likedComments: /* @__PURE__ */ new Set() };
}
function* communityHotForViewer(repo, actor, all, metrics) {
  const edges = yield* effect(repo.all("socialEdge"));
  const allowed2 = new Set(all.filter((p) => !socialBlocked(edges, actor.id, p.ownerId) && !edges.some((e) => e.ownerId === actor.id && e.data.kind === "dismiss" && e.data.enabled === true && e.data.targetId === p.id)).map((p) => p.id));
  const hot = rankHotSummaries(all, metrics);
  return { ...hot, overall: hot.overall.filter((id) => allowed2.has(id)), byBoard: Object.fromEntries(Object.entries(hot.byBoard).map(([board, ids]) => [board, ids.filter((id) => allowed2.has(id))])) };
}
const has = (actor, ...roles) => roles.some((role) => actor.roles.includes(role));
const student = (actor) => demand$1(has(actor, "student"), "需要已授权学生身份。", 403);
const reviewer = (actor) => demand$1(has(actor, "reviewer", "superadmin"), "需要审核职责。", 403);
const operator = (actor) => demand$1(has(actor, "operator", "superadmin"), "需要运营职责。", 403);
const owner = (actor, entity) => demand$1(entity.ownerId === actor.id, "只能处理本人记录。", 403);
const canSpeak = (actor) => demand$1(actor.status === "active", "账号当前不能发帖、评论或聊天。", 403);
const publicEntity = (entity) => entity.data.visibility !== "hidden" && (entity.data.status === "visible" || entity.data.status === "published" || entity.kind === "room");
function roomDetails(value, type) {
  if (value === void 0 && type !== "sport") return {};
  demand$1(value && typeof value === "object" && !Array.isArray(value), "组队筛选条件无效。");
  const input = value;
  const details = {};
  const optionalText = (key, max = 120) => {
    if (input[key] === void 0 || input[key] === "") return;
    details[key] = textField(input, key, max);
  };
  const coordinates = (key) => {
    if (input[key] === void 0) return;
    const point2 = input[key];
    demand$1(Array.isArray(point2) && point2.length === 2 && typeof point2[0] === "number" && typeof point2[1] === "number" && Number.isFinite(point2[0]) && Number.isFinite(point2[1]) && point2[0] >= -180 && point2[0] <= 180 && point2[1] >= -90 && point2[1] <= 90, "地点坐标无效。");
    details[key] = point2;
  };
  optionalText("startsAt", 40);
  if (details.startsAt) demand$1(Number.isFinite(Date.parse(String(details.startsAt))), "约定时间无效。");
  if (type === "carpool") {
    details.departurePlace = textField(input, "departurePlace", 120);
    details.destinationPlace = textField(input, "destinationPlace", 120);
    demand$1(typeof details.startsAt === "string", "请填写出发时间。");
    optionalText("departureAddress", 240);
    optionalText("destinationAddress", 240);
    coordinates("departureCoordinates");
    coordinates("destinationCoordinates");
  }
  if (type === "entertainment") {
    details.activityType = textField(input, "activityType", 40);
    demand$1(typeof details.startsAt === "string", "请填写活动时间。");
  }
  if (type === "study") {
    const min = input.gpaMin, max = input.gpaMax;
    demand$1(min === void 0 && max === void 0 || typeof min === "number" && typeof max === "number" && Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min, "绩点区间无效。");
    if (typeof min === "number" && typeof max === "number") {
      details.gpaMin = min;
      details.gpaMax = max;
    }
  }
  if (type === "sport") {
    details.sportType = textField(input, "sportType", 40);
    details.locationScope = enumField(input, "locationScope", ["campus", "outside"]);
    demand$1(typeof input.extraCost === "boolean", "请明确额外支出。");
    details.extraCost = input.extraCost;
    details.genderPreference = enumField(input, "genderPreference", ["any", "male", "female"]);
    if (input.extraCost) details.costDescription = textField(input, "costDescription", 120);
    demand$1(typeof details.startsAt === "string", "请填写运动时间。");
  }
  if (type === "entertainment" || type === "study" || type === "sport") {
    optionalText("placeAddress", 240);
    coordinates("coordinates");
  }
  if (type === "entertainment" && input.locationScope !== void 0) details.locationScope = enumField(input, "locationScope", ["campus", "outside"]);
  return details;
}
function* communityPolicy(repo, actor, action, input) {
  const social = yield* communitySocialPolicy(repo, actor, action, input);
  if (social) return social;
  if (action.startsWith("keyword.")) return yield* communityKeywordPolicy(repo, actor, action, input);
  if (action === "post.create") {
    student(actor);
    canSpeak(actor);
    const draft = input.draftId ? yield* effect(repo.get(input.draftId, "postDraft")) : null;
    if (draft) demand$1(draft.ownerId === actor.id && draft.data.status === "draft", "草稿已发布或不可访问。", 409);
    if (draft) demand$1(!draft.data.sourcePostId, "编辑草稿须保存到原帖子。", 409);
    const images = validPostImages(input.images ?? [], draft?.data.images);
    const title = textField(input, "title", 80);
    const body2 = textField(input, "body", 1e3);
    const board = textField(input, "board", 40);
    yield* checkCommunityKeywords(repo, title, body2);
    const post = yield* effect(repo.create("post", actor.id, {
      title,
      body: body2,
      board,
      images,
      status: "visible"
    }));
    if (draft) yield* effect(repo.save(draft, { status: "published", postId: post.id, images: [], body: "" }));
    return post;
  }
  if (action === "comment.create") {
    student(actor);
    canSpeak(actor);
    const post = yield* effect(repo.get(input.postId, "post"));
    demand$1(post.data.status === "visible", "帖子尚未公开。");
    yield* requireSocialAccess(repo, actor, post.ownerId);
    const reply = input.replyToId ? yield* effect(repo.get(input.replyToId, "comment")) : null;
    if (reply) {
      demand$1(reply.data.postId === post.id && reply.data.status === "visible", "回复对象当前不可查看。", 409);
      yield* requireSocialAccess(repo, actor, reply.ownerId);
    }
    const body2 = textField(input, "body", 300);
    yield* checkCommunityKeywords(repo, body2);
    const comment = yield* effect(repo.create("comment", actor.id, {
      postId: post.id,
      body: body2,
      status: "visible",
      ...reply ? { replyToId: reply.id, parentId: reply.data.parentId || reply.id } : {}
    }));
    const recipients = [...new Set([post.ownerId, reply?.ownerId].filter((id) => !!id && id !== actor.id))];
    if (recipients.length) yield* effect(repo.notify(recipients, post.id, reply ? "community.reply" : "community.comment", reply ? "你的内容收到一条回复。" : "你的帖子收到一条评论。"));
    return comment;
  }
  if (action === "post.delete") {
    const post = yield* effect(repo.get(input.id, "post"));
    const isAuthor = post.ownerId === actor.id;
    demand$1(isAuthor || has(actor, "reviewer", "superadmin"), "只能删除本人帖子，或由审核职责处理。", 403);
    demand$1(post.data.status !== "deleted", "帖子已删除。", 409);
    const reason = isAuthor ? "" : textField(input, "reason", 1e3);
    if (!isAuthor) {
      yield* effect(repo.notify([post.ownerId], post.id, action, `帖子已删除：${reason}`));
    }
    return yield* effect(repo.save(post, { status: "deleted", deleteReason: reason }));
  }
  if (action === "content.review") {
    reviewer(actor);
    const entity = yield* effect(repo.get(input.id));
    demand$1(["post", "comment"].includes(entity.kind), "对象类型无效。");
    demand$1(entity.data.status !== "deleted", "已删除帖子不能恢复或下架。", 409);
    const status = enumField(input, "status", ["visible", "hidden"]);
    const reason = textField(input, "reason", 1e3, entity.data.status === "pending" && status === "visible");
    demand$1(entity.data.status !== status, "内容已处于该状态。", 409);
    yield* effect(repo.notify(
      [entity.ownerId],
      entity.id,
      action,
      `内容${status === "visible" ? "已公开" : "已隐藏"}${reason ? `：${reason}` : ""}`
    ));
    return yield* effect(repo.save(entity, { status, reviewNote: reason }));
  }
  if (action === "room.create") {
    student(actor);
    const type = enumField(input, "type", ["study", "entertainment", "carpool", "sport"]);
    return yield* effect(repo.create("room", actor.id, {
      type,
      title: textField(input, "title", 80),
      body: textField(input, "body", 1e3),
      time: textField(input, "time", 120),
      place: textField(input, "place", 120),
      details: roomDetails(input.details, type),
      capacity: integerField(input, "capacity", 2, 1e3),
      members: [actor.id],
      status: "open",
      visibility: "visible"
    }));
  }
  if (action === "room.apply") {
    student(actor);
    const room = yield* effect(repo.get(input.id, "room")), members = strings(room.data.members);
    demand$1(
      room.data.status === "open" && room.data.visibility === "visible" && members.length < Number(room.data.capacity),
      "队伍已结束、下架或满员。"
    );
    demand$1(
      !members.includes(actor.id) && !(yield* effect(repo.all("roomApplication"))).some(
        (a) => a.ownerId === actor.id && a.data.roomId === room.id && a.data.status === "pending"
      ),
      "已加入或已有待处理申请。",
      409
    );
    const application = yield* effect(repo.create("roomApplication", actor.id, {
      roomId: room.id,
      status: "pending"
    }));
    yield* effect(repo.notify(
      [room.ownerId],
      room.id,
      action,
      `${actor.name}申请加入队伍。`
    ));
    return application;
  }
  if (action === "room.decide") {
    student(actor);
    const application = yield* effect(repo.get(input.id, "roomApplication")), room = yield* effect(repo.get(application.data.roomId, "room"));
    owner(actor, room);
    demand$1(application.data.status === "pending", "申请已处理。", 409);
    const accept = input.accept === true;
    const members = strings(room.data.members);
    demand$1(
      room.data.status === "open" && room.data.visibility === "visible",
      "队伍已结束或下架。"
    );
    if (accept) {
      demand$1(
        (yield* effect(repo.person(application.ownerId))).status !== "banned",
        "申请人已被封禁。"
      );
      demand$1(
        members.length < Number(room.data.capacity) && !members.includes(application.ownerId),
        "队伍已满或申请人已加入。",
        409
      );
      yield* effect(repo.save(room, { members: [...members, application.ownerId] }));
    }
    yield* effect(repo.notify(
      [application.ownerId],
      room.id,
      action,
      accept ? "入队申请已通过。" : "入队申请已拒绝。"
    ));
    return yield* effect(repo.save(application, { status: accept ? "approved" : "rejected" }));
  }
  if (action === "room.finish" || action === "room.moderate") {
    const room = yield* effect(repo.get(input.id, "room"));
    let patch, reason = "";
    if (action === "room.finish") {
      student(actor);
      owner(actor, room);
      demand$1(room.data.status === "open", "队伍已结束。", 409);
      patch = { status: "finished" };
    } else {
      reviewer(actor);
      reason = textField(input, "reason", 1e3);
      const decision = enumField(input, "decision", [
        "hide",
        "restore",
        "finish",
        "remove"
      ]);
      if (decision === "remove") {
        const memberId = textField(input, "memberId", 100);
        demand$1(
          memberId !== room.ownerId && strings(room.data.members).includes(memberId),
          "只能移除非队长成员。"
        );
        patch = {
          members: strings(room.data.members).filter((id) => id !== memberId)
        };
      } else
        patch = decision === "finish" ? { status: "finished" } : { visibility: decision === "hide" ? "hidden" : "visible" };
    }
    yield* effect(repo.notify(
      strings(room.data.members),
      room.id,
      action,
      `队伍状态更新${reason ? `：${reason}` : ""}`
    ));
    return yield* effect(repo.save(room, patch));
  }
  if (action === "room.review") {
    student(actor);
    const room = yield* effect(repo.get(input.id, "room")), target = textField(input, "targetId", 100);
    demand$1(
      room.data.status === "finished" && strings(room.data.members).includes(actor.id) && strings(room.data.members).includes(target) && target !== actor.id,
      "仅已结束队伍的成员可互评，不能评价自己。"
    );
    demand$1(
      !(yield* effect(repo.all("roomReview"))).some(
        (r) => r.ownerId === actor.id && r.data.roomId === room.id && r.data.targetId === target
      ),
      "已经评价过该成员。",
      409
    );
    return yield* effect(repo.create("roomReview", actor.id, {
      roomId: room.id,
      targetId: target,
      stars: integerField(input, "stars", 1, 5),
      comment: textField(input, "comment", 1e3, true),
      tags: strings(input.tags).slice(0, 10)
    }));
  }
  if (action === "message.read") {
    student(actor);
    const room = yield* effect(repo.get(input.roomId, "room"));
    demand$1(room.data.status === "open" && room.data.visibility === "visible" && strings(room.data.members).includes(actor.id), "当前没有此队伍的聊天权限。", 403);
    demand$1(Array.isArray(input.ids) && input.ids.length > 0 && input.ids.every((id) => typeof id === "string"), "请选择已读取的消息。");
    const ids = [...new Set(input.ids)];
    for (const id of ids) demand$1((yield* effect(repo.get(id, "message"))).data.roomId === room.id, "消息不属于当前会话。", 403);
    for (const id of ids) yield* effect(repo.relation(actor.id, id, "message.read", true));
    return room;
  }
  if (action === "message.send") {
    student(actor);
    canSpeak(actor);
    const room = yield* effect(repo.get(input.roomId, "room"));
    demand$1(
      room.data.status === "open" && room.data.visibility === "visible" && strings(room.data.members).includes(actor.id),
      "当前没有此队伍的聊天权限。",
      403
    );
    return yield* effect(repo.create("message", actor.id, {
      roomId: room.id,
      body: textField(input, "body", 500)
    }));
  }
  if (action === "report.create") {
    student(actor);
    const target = yield* effect(repo.get(input.id));
    demand$1(
      ["post", "comment", "room"].includes(target.kind) && publicEntity(target),
      "只能举报当前公开内容。"
    );
    if (target.kind === "comment")
      demand$1(
        (yield* effect(repo.get(target.data.postId, "post"))).data.status === "visible",
        "帖子未公开。"
      );
    demand$1(
      !(yield* effect(repo.all("report"))).some(
        (r) => r.ownerId === actor.id && r.data.targetId === target.id && r.data.status === "pending"
      ),
      "该对象已有待处理举报。",
      409
    );
    return yield* effect(repo.create("report", actor.id, {
      targetId: target.id,
      snapshot: target.data,
      reason: textField(input, "reason", 1e3),
      status: "pending"
    }));
  }
  if (action === "report.decide") {
    reviewer(actor);
    const report = yield* effect(repo.get(input.id, "report")), reason = textField(input, "reason", 1e3);
    demand$1(report.data.status === "pending", "举报已处理。", 409);
    const target = yield* effect(repo.get(report.data.targetId)), upheld = input.upheld === true;
    if (upheld && publicEntity(target)) {
      yield* effect(repo.save(
        target,
        target.kind === "room" ? { visibility: "hidden" } : { status: "hidden" }
      ));
      yield* effect(repo.notify(
        target.kind === "room" ? strings(target.data.members) : [target.ownerId],
        target.id,
        action,
        `举报成立，内容已下架：${reason}`
      ));
    }
    yield* effect(repo.notify(
      [report.ownerId],
      target.id,
      action,
      `举报${upheld ? "成立" : "驳回"}：${reason}`
    ));
    return yield* effect(repo.save(report, {
      status: upheld ? "upheld" : "rejected",
      resolution: reason
    }));
  }
  return void 0;
}
function communityCommand(repo, actor, action, input) {
  return runSync(communityPolicy(repo, actor, action, input));
}
function projectDisplayPeople(actor, people, visibleIds, preferences, profiles) {
  const hidden = new Set(preferences.filter((item) => item.data.profilePreview === false).map((item) => item.ownerId));
  const current = new Map(profiles.map((item) => [item.ownerId, item.data]));
  return people.filter((person) => visibleIds.has(person.id)).map((person) => {
    const preview = person.id === actor.id || !hidden.has(person.id) || has(actor, "teacher", "reviewer", "operator", "superadmin");
    const profile = preview ? current.get(person.id) : void 0;
    const display = {
      nickname: typeof profile?.nickname === "string" ? profile.nickname : void 0,
      avatar: typeof profile?.avatar === "string" ? profile.avatar : void 0
    };
    return has(actor, "superadmin") ? { ...person, ...display } : { id: person.id, name: person.name, organization: person.id === actor.id ? person.organization : "", ...display };
  });
}
function projectPersonHover(viewer, personId, person, prefs, rooms, activities, marks) {
  const own = viewer.id === personId;
  const preview = own || prefs?.profilePreview !== false || viewer.roles.some((role) => ["teacher", "reviewer", "operator", "superadmin"].includes(role));
  const identity = { id: personId, name: preview ? person.nickname || person.name : person.name, avatar: preview ? person.avatar ?? "" : "" };
  const visibleSections = { recentTeams: prefs?.hoverRecentTeams !== false, activeTeams: prefs?.hoverActiveTeams !== false, activities: prefs?.hoverActivities !== false };
  if (!own && prefs?.profilePreview === false)
    return { ...identity, visibleSections: { recentTeams: false, activeTeams: false, activities: false }, recentTeams: [], activeTeams: [], activities: [] };
  const publicRooms = rooms.filter((room) => room.data.visibility === "visible" && (room.ownerId === personId || strings(room.data.members).includes(personId)));
  const summaries = (items) => items.slice(0, 3).map((room) => ({ id: room.id, title: String(room.data.title ?? ""), path: `/v2/partners?item=${encodeURIComponent(room.id)}` }));
  const recentTeams = visibleSections.recentTeams ? summaries(publicRooms.filter((room) => room.data.status === "finished").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) : [];
  const activeTeams = visibleSections.activeTeams ? summaries(publicRooms.filter((room) => room.data.status === "open").sort((a, b) => b.createdAt.localeCompare(a.createdAt))) : [];
  const published = new Map(activities.filter((item) => item.data.status === "published").map((item) => [item.id, item]));
  const shownActivities = visibleSections.activities ? marks.flatMap((mark) => {
    const item = published.get(mark.id);
    return item ? [{ id: item.id, title: String(item.data.title ?? ""), path: `/v2/activities/${encodeURIComponent(item.id)}` }] : [];
  }).slice(0, 3) : [];
  return { ...identity, visibleSections, recentTeams, activeTeams, activities: shownActivities };
}
function personHover(db, viewer, personId, studentNumber2) {
  demand$1(viewer.roles.length > 0 && viewer.status !== "banned", "请先完成校园身份核验。", 403);
  const business = personId === viewer.id || !!db.prepare("SELECT 1 FROM entities WHERE (kind='post' AND owner_id=? AND json_extract(data,'$.status')='visible') OR (kind='room' AND json_extract(data,'$.visibility')='visible' AND (owner_id=? OR EXISTS(SELECT 1 FROM json_each(entities.data,'$.members') WHERE value=?))) OR (kind='activity' AND owner_id=? AND json_extract(data,'$.status')='published') LIMIT 1").get(personId, personId, personId, personId);
  const repo = new Repository(db);
  const visible = business ? projectDisplayPeople(viewer, repo.people(), /* @__PURE__ */ new Set([personId]), repo.all("preferences"), repo.all("profile"))[0] : void 0;
  const searched = !visible && studentNumber2 ? searchStudents(db, viewer, studentNumber2).students.find((person2) => person2.id === personId) : void 0;
  const person = visible ?? searched;
  demand$1(person, "用户当前不可查看。", 404);
  const prefs = repo.all("preferences").find((item) => item.ownerId === personId)?.data;
  const marks = db.prepare("SELECT entity_id AS id,created_at AS createdAt FROM relations WHERE account_id=? AND kind='participate' ORDER BY created_at DESC").all(personId);
  return projectPersonHover(viewer, personId, person, prefs, repo.all("room"), repo.all("activity"), marks);
}
function* notificationPolicy(repo, actor, action, input) {
  if (action === "notification.read" || action === "notification.readmany") {
    let ids;
    if (action === "notification.read") ids = [textField(input, "id", 100)];
    else {
      demand$1(Array.isArray(input.ids) && input.ids.length > 0 && input.ids.every((id) => typeof id === "string" && id.length > 0 && id.length <= 100), "请选择要标为已读的通知。");
      ids = [...new Set(input.ids)];
    }
    for (const id of ids) demand$1(yield* effect(repo.ownsNotification(id, actor.id)), "通知不存在。", 404);
    const at = timestamp();
    for (const id of ids) yield* effect(repo.readNotification(id, actor.id, at));
    return action === "notification.read" ? { id: ids[0] } : { ids };
  }
  if (action === "notification.send") {
    operator(actor);
    const recipients = strings(input.recipients);
    demand$1(recipients.length > 0 && recipients.length <= 1e3, "请选择 1–1000 位接收人。");
    for (const id of recipients) yield* effect(repo.person(id));
    const batch = randomUUID();
    yield* effect(repo.notify(recipients, batch, "broadcast", textField(input, "body", 2e3)));
    return { id: batch, recipients: [...new Set(recipients)].length };
  }
  return void 0;
}
const alumniSeed = {
  profiles: [
    { id: "alumni-lin", owner: "alumni-account-lin", name: "林知夏", major: "金融学", graduationYear: 2023, city: "香港", direction: "升学", experience: "商科硕士毕业 · 申请经验分享", topics: "选校定位、申请材料、跨专业申请", bio: "愿意聊聊从准备申请到适应研究生生活的经历，也欢迎带着具体问题来交流。", evidence: "演示校友资料", status: "approved", reviewNote: "演示认证", accepting: true },
    { id: "alumni-zhou", owner: "alumni-account-zhou", name: "周远", major: "计算机科学与技术", graduationYear: 2022, city: "深圳", direction: "就业", experience: "软件工程师 · 互联网行业", topics: "实习准备、技术面试、第一份工作", bio: "从校园项目到实际工作，分享自己走过的弯路。欢迎一起讨论如何准备第一份实习。", evidence: "演示校友资料", status: "approved", reviewNote: "演示认证", accepting: true }
  ],
  follows: [],
  bookings: [],
  notices: [],
  history: [],
  slots: [
    { id: "alumni-slot-lin", alumniId: "alumni-lin", startAt: "2026-10-18T14:00:00+08:00", endAt: "2026-10-18T14:30:00+08:00", location: "线上交流，确认后双方商定会议方式", open: true },
    { id: "alumni-slot-zhou", alumniId: "alumni-zhou", startAt: "2026-10-19T19:00:00+08:00", endAt: "2026-10-19T19:30:00+08:00", location: "BNBU 资源中心", open: true }
  ]
};
const alumniSeedPosts = [
  { id: "alumni-post-application", alumniId: "alumni-lin", title: "申请季开始前，先整理自己的经历", body: "这是一篇演示经验分享。建议先把课程项目、实习和感兴趣的研究问题整理成清单，再逐个查阅学校的官方申请要求。个人经历只能作为参考，具体要求以院校发布的信息为准。", board: "校友升学", author: "林知夏", date: "10月9日", status: "visible", comments: [], likes: 0 },
  { id: "alumni-post-career", alumniId: "alumni-zhou", title: "第一次找实习，如何讲清楚校园项目？", body: "这是一篇演示经验分享。可以从问题、本人负责的工作、做出的取舍和结果四个方面准备项目介绍。简历里保留真实经历，遇到不了解的面试问题也可以坦诚说明自己的思考过程。", board: "校友就业", author: "周远", date: "10月8日", status: "visible", comments: [], likes: 0 }
];
const studentName = "陈雨晴";
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const initialV2State = {
  role: "student",
  alumni: alumniSeed,
  announcements: [],
  posts: [
    ...alumniSeedPosts,
    { id: "post-study", title: "你最喜欢哪处学习空间？", body: "想找一个适合小组讨论的地方，欢迎分享你的推荐。", board: "校园", author: "林同学", date: "10月8日", likes: 12, status: "visible", comments: [{ id: "comment-seed", author: "李明", body: "资源中心靠窗的位置很舒服。", date: "10月8日", status: "visible" }] },
    { id: "post-english", title: "周末英语口语练习", body: "计划周六下午练习一小时，话题可以一起商量。", board: "学习", author: "王嘉", date: "10月7日", likes: 7, status: "visible", comments: [] },
    { id: "post-run", title: "推荐的校园夜跑路线？", body: "想从体育场出发跑 3 公里，欢迎分享路线。", board: "生活", author: "周然", date: "10月6日", likes: 5, status: "visible", comments: [] }
  ],
  rooms: [
    { id: "room-car", type: "carpool", title: "周五去珠海站拼车", body: "从学校南门出发，时间可在群里微调，费用均摊。", time: "周五 17:30", place: "学校南门", capacity: 4, members: ["李明", "周然"], owner: "李明", status: "open", requests: [] },
    { id: "room-ball", type: "entertainment", title: "周末羽毛球双打", body: "轻松打球，水平不限，记得带球拍。", time: "周六 19:00", place: "体育馆 3 号场", capacity: 4, members: ["王嘉", "林同学", studentName], owner: "王嘉", status: "open", requests: [] },
    { id: "room-ai", type: "study", title: "AI Agent Workshop 复盘小组", body: "交流 Workshop 笔记和项目想法，一起做出下一个原型。", time: "周日 15:00", place: "资源中心", capacity: 6, members: [studentName, "许宁"], owner: studentName, status: "open", requests: ["李明"] }
  ],
  roomReviews: [],
  conversations: [
    { id: "chat-ball", title: "周末羽毛球双打", messages: [{ id: "m1", from: "王嘉", body: "周末见！场地已经预约好了。", time: "18:42" }], unread: 1 },
    { id: "chat-ai", title: "AI Agent Workshop 复盘小组", messages: [{ id: "m2", from: "许宁", body: "我会带上活动笔记。", time: "17:16" }], unread: 1 }
  ],
  verifications: [{ id: "verify-club", name: "校园摄影社", kind: "club", organization: "校园摄影社", note: "申请社团认证，用于核实社团成员身份。", status: "pending", reviewNote: "", date: "10月8日" }],
  savedPosts: [],
  savedRooms: [],
  likedPosts: [],
  applications: [],
  eventRegistrations: {},
  participatingActivities: [],
  localEvents: [],
  coffeeBookings: [],
  joinedOrganizations: [],
  notifications: [{ id: "n1", title: "新的组队申请", body: "李明申请加入你的 AI Agent 复盘小组", path: "/v2/partners/teams", read: false, date: "今天" }],
  preferences: { messages: true, teams: true, searchable: true, profilePreview: true },
  aiMessages: [{ id: "ai-hello", from: "assistant", body: "你好，我是奶蛙。可以帮你查找活动、校园服务和自己的安排。当前内容为本地演示数据。" }],
  aiPinnedSources: ["/v2/activities", "/v2/campus"],
  aiIconChoice: "yellow",
  aiCustomIcon: ""
};
const buildEvent = (event) => ({
  slug: event.id,
  description: "Meet curious people, share an experience, and let one campus moment lead to the next.",
  tags: [event.category, "Campus Life"],
  startAt: "2026-10-18T19:00:00+08:00",
  endAt: "2026-10-18T21:00:00+08:00",
  capacity: 120,
  registrationMode: "open",
  waitlistEnabled: true,
  visibility: "public",
  featured: false,
  status: "upcoming",
  eventType: "standard",
  agenda: ["Welcome & introductions", "Main experience", "Open connection time"],
  ...event
});
const seededEvents = [
  buildEvent({
    id: "ai-agent-workshop",
    title: "AI Agent Workshop",
    subtitle: "Build Your First AI Agent",
    cover: "cover-ai",
    category: "Workshop",
    dateLabel: "OCT 18",
    timeLabel: "Wed · 7:30 PM",
    location: "T2-202",
    hostId: "ai-club",
    attendeeCount: 86,
    temporal: "This Week",
    featured: true,
    eventType: "workshop",
    description: "A practical studio for turning an idea into a working AI agent. Bring a laptop; no prior agent-building experience is needed.",
    tags: ["AI", "Build Together", "Beginner Friendly"],
    agenda: ["19:30 — Welcome and idea sprint", "19:50 — Agent building lab", "20:45 — Demo circle and connections"]
  }),
  buildEvent({
    id: "campus-night-run",
    title: "Campus Night Run",
    subtitle: "Five kilometers, one campus rhythm",
    cover: "cover-run",
    category: "运动",
    dateLabel: "TODAY",
    timeLabel: "7:00 PM",
    location: "BNBU Sports Field",
    hostId: "running-club",
    attendeeCount: 28,
    temporal: "Today",
    status: "live",
    eventType: "sports",
    description: "An easy-paced 5 km loop for every level. We warm up together, run in small pace groups, and finish with a stretch.",
    tags: ["Running", "5K", "All Levels"],
    agenda: ["18:50 — Meet by the blue track gate", "19:00 — Group warm-up", "19:10 — Pace groups depart", "20:00 — Cool-down"]
  }),
  buildEvent({ id: "english-corner", title: "English Corner", subtitle: "Stories that travel", cover: "cover-english", category: "英语", dateLabel: "TODAY", timeLabel: "8:00 PM", location: "T4-105", hostId: "english-club", attendeeCount: 16, temporal: "Today" }),
  buildEvent({ id: "badminton-night", title: "Badminton Night", subtitle: "Open courts, friendly rallies", cover: "cover-badminton", category: "运动", dateLabel: "OCT 19", timeLabel: "7:00 PM", location: "Sports Center Court 3", hostId: "badminton-team", attendeeCount: 24, capacity: 24, temporal: "Tomorrow", eventType: "sports" }),
  buildEvent({ id: "board-game-night", title: "Board Game Night", subtitle: "Strategy, stories, and new teammates", cover: "cover-games", category: "社团", dateLabel: "TODAY", timeLabel: "8:30 PM", location: "Student Commons", hostId: "student-union", attendeeCount: 32, temporal: "Today" }),
  buildEvent({ id: "startup-meetup", title: "Startup Meetup", subtitle: "From campus problem to first prototype", cover: "cover-startup", category: "创业", dateLabel: "OCT 20", timeLabel: "6:30 PM", location: "Innovation Hub", hostId: "innovation-center", attendeeCount: 64, temporal: "This Week", registrationMode: "approval" }),
  buildEvent({ id: "marketing-case-night", title: "Marketing Case Night", subtitle: "Decode a brand in 90 minutes", cover: "cover-marketing", category: "比赛", dateLabel: "OCT 21", timeLabel: "7:00 PM", location: "T4-105", hostId: "marketing-society", attendeeCount: 18, temporal: "This Week", registrationMode: "approval", eventType: "competition" }),
  buildEvent({ id: "alumni-founder-talk", title: "Founder Stories: From BNBU to Day One", subtitle: "An honest conversation with Lin Hao", cover: "cover-alumni", category: "校友", dateLabel: "OCT 22", timeLabel: "4:00 PM", location: "T2 Auditorium", hostId: "alumni-network", attendeeCount: 112, temporal: "Weekend", eventType: "alumni" }),
  buildEvent({ id: "music-night", title: "Courtyard Music Night", subtitle: "Small stage, big campus voices", cover: "cover-music", category: "社团", dateLabel: "OCT 22", timeLabel: "7:30 PM", location: "South Courtyard", hostId: "student-union", attendeeCount: 148, capacity: null, temporal: "Weekend" }),
  buildEvent({ id: "photography-walk", title: "Golden Hour Photo Walk", subtitle: "Notice the campus differently", cover: "cover-photo", category: "社团", dateLabel: "OCT 23", timeLabel: "5:00 PM", location: "Library Steps", hostId: "student-union", attendeeCount: 21, temporal: "Weekend" }),
  buildEvent({ id: "sustainability-lab", title: "Campus Sustainability Lab", subtitle: "Design a lower-waste week", cover: "cover-green", category: "Workshop", dateLabel: "OCT 24", timeLabel: "2:00 PM", location: "T3-301", hostId: "innovation-center", attendeeCount: 38, temporal: "Weekend", eventType: "workshop" }),
  buildEvent({ id: "product-design-jam", title: "Product Design Jam", subtitle: "Prototype a kinder campus service", cover: "cover-design", category: "Workshop", dateLabel: "OCT 25", timeLabel: "10:00 AM", location: "Innovation Hub", hostId: "ai-club", attendeeCount: 44, temporal: "Next Week", eventType: "workshop" }),
  buildEvent({ id: "basketball-open", title: "3×3 Basketball Open", subtitle: "Build a team on the court", cover: "cover-basketball", category: "比赛", dateLabel: "OCT 25", timeLabel: "4:30 PM", location: "Outdoor Court", hostId: "badminton-team", attendeeCount: 36, capacity: 40, temporal: "Next Week", eventType: "competition" }),
  buildEvent({ id: "debate-night", title: "Campus Debate Night", subtitle: "Technology, trust, and tomorrow", cover: "cover-debate", category: "学术", dateLabel: "OCT 26", timeLabel: "7:00 PM", location: "T5-204", hostId: "english-club", attendeeCount: 55, temporal: "Next Week" }),
  buildEvent({ id: "volunteer-day", title: "Community Volunteer Day", subtitle: "One morning, practical impact", cover: "cover-volunteer", category: "社团", dateLabel: "OCT 27", timeLabel: "9:00 AM", location: "Campus North Gate", hostId: "student-union", attendeeCount: 72, temporal: "Next Week" }),
  buildEvent({ id: "career-stories", title: "Product Career Stories", subtitle: "Paths are made, not found", cover: "cover-career", category: "校友", dateLabel: "OCT 28", timeLabel: "6:00 PM", location: "T4 Coffee Space", hostId: "alumni-network", attendeeCount: 30, temporal: "Next Week", eventType: "alumni" }),
  buildEvent({ id: "makers-market", title: "Student Makers Market", subtitle: "Ideas you can hold", cover: "cover-makers", category: "创业", dateLabel: "OCT 29", timeLabel: "1:00 PM", location: "Central Lawn", hostId: "innovation-center", attendeeCount: 96, capacity: null, temporal: "Next Week" }),
  buildEvent({ id: "language-exchange", title: "Language Exchange Picnic", subtitle: "Bring a phrase, leave with a friend", cover: "cover-language", category: "英语", dateLabel: "OCT 30", timeLabel: "3:30 PM", location: "Lake Lawn", hostId: "english-club", attendeeCount: 47, temporal: "Next Week" })
];
const demoSchedule = {
  "ai-agent-workshop": [2, 19, 30, 90],
  "campus-night-run": [0, 19, 0, 75],
  "english-corner": [-2, 20, 0, 90],
  "badminton-night": [1, 19, 0, 90],
  "board-game-night": [0, 20, 30, 120],
  "startup-meetup": [2, 18, 30, 90],
  "marketing-case-night": [3, 19, 0, 90],
  "alumni-founder-talk": [4, 16, 0, 90],
  "music-night": [4, 19, 30, 120],
  "photography-walk": [5, 17, 0, 90],
  "sustainability-lab": [6, 14, 0, 120],
  "product-design-jam": [7, 10, 0, 120],
  "basketball-open": [7, 16, 30, 90],
  "debate-night": [8, 19, 0, 90],
  "volunteer-day": [9, 9, 0, 180],
  "career-stories": [10, 18, 0, 90],
  "makers-market": [11, 13, 0, 180],
  "language-exchange": [12, 15, 30, 90]
};
seededEvents.map((event) => {
  const [dayOffset, hour, minute, duration] = demoSchedule[event.id];
  const start = /* @__PURE__ */ new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hour, minute, 0, 0);
  return {
    ...event,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + duration * 6e4).toISOString(),
    dateLabel: new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(start),
    timeLabel: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(start)
  };
});
const teachers = [
  { id: "prof-zhang", name: "张老师", englishName: "Professor Zhang", title: "Associate Professor", department: "工商管理学院", bio: "Professor Zhang studies how people make choices and how brands earn trust. Her Coffee Chats are practical, warm, and student-led.", fields: ["Marketing", "Consumer Behavior"], topics: ["市场营销", "学业规划", "创业", "研究方向"], location: "T4 Coffee Space", availability: "Wednesday 15:00–17:00", color: "#d97706" },
  { id: "prof-li", name: "李老师", englishName: "Professor Li", title: "Assistant Professor", department: "理工科技学院", bio: "Works on human-centered AI systems and learning technologies.", fields: ["Computer Science", "AI"], topics: ["AI 研究", "技术职业", "项目建议"], location: "T2 Faculty Lounge", availability: "Friday 14:00–16:00", color: "#2563eb" },
  { id: "prof-wang", name: "王老师", englishName: "Professor Wang", title: "Entrepreneur in Residence", department: "创新创业中心", bio: "Supports founders through early customer discovery and first experiments.", fields: ["Innovation", "Entrepreneurship"], topics: ["创业想法", "市场验证", "团队建设"], location: "Innovation Hub", availability: "Tuesday 16:00–18:00", color: "#059669" },
  { id: "prof-chen", name: "陈老师", englishName: "Professor Chen", title: "Lecturer", department: "人文社科学院", bio: "Helps students communicate with clarity across cultures and contexts.", fields: ["Communication", "Language"], topics: ["英语表达", "演讲", "跨文化交流"], location: "T5 Commons", availability: "Thursday 13:00–15:00", color: "#7c3aed" },
  { id: "prof-zhao", name: "赵老师", englishName: "Professor Zhao", title: "Senior Lecturer", department: "通识教育学院", bio: "Interested in wellbeing, active learning, and sustainable campus life.", fields: ["Wellbeing", "Education"], topics: ["大学适应", "习惯设计", "体育参与"], location: "Library Café", availability: "Monday 10:00–12:00", color: "#ea580c" }
];
const coffeeSlots = [
  { id: "slot-zhang-1500", teacherId: "prof-zhang", startAt: "2026-10-21T15:00:00+08:00", endAt: "2026-10-21T15:30:00+08:00", dateLabel: "Wed · Oct 21", timeLabel: "15:00", capacity: 1, bookingCount: 1, status: "booked" },
  { id: "slot-zhang-1530", teacherId: "prof-zhang", startAt: "2026-10-21T15:30:00+08:00", endAt: "2026-10-21T16:00:00+08:00", dateLabel: "Wed · Oct 21", timeLabel: "15:30", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-zhang-1600", teacherId: "prof-zhang", startAt: "2026-10-21T16:00:00+08:00", endAt: "2026-10-21T16:30:00+08:00", dateLabel: "Wed · Oct 21", timeLabel: "16:00", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-zhang-1630", teacherId: "prof-zhang", startAt: "2026-10-21T16:30:00+08:00", endAt: "2026-10-21T17:00:00+08:00", dateLabel: "Wed · Oct 21", timeLabel: "16:30", capacity: 1, bookingCount: 1, status: "full" },
  { id: "slot-li-1400", teacherId: "prof-li", startAt: "2026-10-23T14:00:00+08:00", endAt: "2026-10-23T14:30:00+08:00", dateLabel: "Fri · Oct 23", timeLabel: "14:00", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-li-1430", teacherId: "prof-li", startAt: "2026-10-23T14:30:00+08:00", endAt: "2026-10-23T15:00:00+08:00", dateLabel: "Fri · Oct 23", timeLabel: "14:30", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-wang-1600", teacherId: "prof-wang", startAt: "2026-10-20T16:00:00+08:00", endAt: "2026-10-20T16:30:00+08:00", dateLabel: "Tue · Oct 20", timeLabel: "16:00", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-wang-1630", teacherId: "prof-wang", startAt: "2026-10-20T16:30:00+08:00", endAt: "2026-10-20T17:00:00+08:00", dateLabel: "Tue · Oct 20", timeLabel: "16:30", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-chen-1300", teacherId: "prof-chen", startAt: "2026-10-22T13:00:00+08:00", endAt: "2026-10-22T13:30:00+08:00", dateLabel: "Thu · Oct 22", timeLabel: "13:00", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-chen-1330", teacherId: "prof-chen", startAt: "2026-10-22T13:30:00+08:00", endAt: "2026-10-22T14:00:00+08:00", dateLabel: "Thu · Oct 22", timeLabel: "13:30", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-zhao-1000", teacherId: "prof-zhao", startAt: "2026-10-26T10:00:00+08:00", endAt: "2026-10-26T10:30:00+08:00", dateLabel: "Mon · Oct 26", timeLabel: "10:00", capacity: 1, bookingCount: 0, status: "available" },
  { id: "slot-zhao-1030", teacherId: "prof-zhao", startAt: "2026-10-26T10:30:00+08:00", endAt: "2026-10-26T11:00:00+08:00", dateLabel: "Mon · Oct 26", timeLabel: "10:30", capacity: 1, bookingCount: 0, status: "available" }
];
const managedSlots = (state) => (state.teacherCoffee?.slots ?? coffeeSlots).map((s) => ({ ...s, location: s.location ?? teachers.find((t) => t.id === s.teacherId)?.location }));
function coffeeData(state) {
  const data = { ...state.teacherCoffee ?? { bookings: [], notices: [], profiles: {} }, slots: managedSlots(state) };
  const legacy = state.coffeeBookings.filter((id) => !data.bookings.some((b) => b.slotId === id && b.student === studentName && b.status === "confirmed")).map((id) => ({ id: `legacy:${id}`, slotId: id, student: studentName, topic: "旧预约未提供交流问题", status: "confirmed", createdAt: null, history: [] }));
  return { ...data, bookings: [...data.bookings, ...legacy] };
}
const alumniData = (state) => state.alumni ?? alumniSeed;
const demand = (condition, message) => {
  if (!condition) throw new Error(message);
};
const overlap = (a, b) => Date.parse(a.startAt) < Date.parse(b.endAt) && Date.parse(b.startAt) < Date.parse(a.endAt);
function bookingStatus(data, booking, now = Date.now()) {
  const slot = data.slots.find((item) => item.id === booking.slotId);
  return booking.status === "pending" && (!slot || Date.parse(slot.startAt) <= now) ? "expired" : booking.status;
}
function record(data, actor, objectId, action, reason, recipients, now) {
  const at = new Date(now).toISOString();
  return { ...data, history: [{ id: makeId(), actor: actor.id, objectId, action, reason, at }, ...data.history], notices: [...new Set(recipients)].map((recipient) => ({ id: makeId(), recipient, body: `${action}${reason ? `：${reason}` : ""}`, read: false, at })).concat(data.notices) };
}
function owned(state, actor) {
  const profile = alumniData(state).profiles.find((item) => item.owner === actor.id);
  demand(actor.role === "student" && profile?.status === "approved", "需要本人已通过校友认证。");
  return profile;
}
function followAlumni(state, actor, id) {
  const data = alumniData(state), person = data.profiles.find((item) => item.id === id);
  demand(actor.role === "student" && person?.status === "approved" && person.owner !== actor.id, "无法关注此校友。");
  const exists = data.follows.some((item) => item.student === actor.id && item.alumniId === id);
  return { ...state, alumni: { ...data, follows: exists ? data.follows.filter((item) => item.student !== actor.id || item.alumniId !== id) : [...data.follows, { student: actor.id, alumniId: id }] } };
}
function editAlumniProfile(state, actor, input) {
  const person = owned(state, actor), data = alumniData(state);
  demand(input.city.trim() && input.experience.trim() && input.topics.trim(), "请填写城市、经历与交流话题。");
  demand(input.city.length <= 40 && input.experience.length <= 120 && input.topics.length <= 120 && input.bio.length <= 500, "资料内容过长。");
  return { ...state, alumni: { ...data, profiles: data.profiles.map((item) => item.id === person.id ? { ...item, ...input } : item) } };
}
function addAlumniSlot(state, actor, input, now = Date.now()) {
  const person = owned(state, actor), data = alumniData(state);
  demand(person.accepting, "请先开启接受交流申请。");
  demand(Number.isFinite(Date.parse(input.startAt)) && Number.isFinite(Date.parse(input.endAt)) && Date.parse(input.startAt) > now && Date.parse(input.endAt) > Date.parse(input.startAt), "请设置未来的有效起止时间。");
  demand(input.location.trim() && input.location.length <= 120, "请填写交流地点或方式，最多 120 字。");
  const slot = { ...input, id: makeId(), alumniId: person.id, open: true };
  demand(!data.slots.some((item) => item.alumniId === person.id && item.open && overlap(item, slot)), "该时段与已开放时段重叠。");
  return { ...state, alumni: { ...data, slots: [...data.slots, slot] } };
}
function closeAlumniSlot(state, actor, id, now = Date.now()) {
  const person = owned(state, actor), data = alumniData(state), slot = data.slots.find((item) => item.id === id);
  demand(slot?.alumniId === person.id && slot.open, "只能关闭本人开放的时段。");
  demand(!data.bookings.some((item) => item.slotId === id && ["pending", "confirmed"].includes(bookingStatus(data, item, now))), "该时段存在有效申请或预约，请先处理。");
  return { ...state, alumni: { ...data, slots: data.slots.map((item) => item.id === id ? { ...item, open: false } : item) } };
}
function cancelAlumniBooking(state, actor, id, reason, now = Date.now()) {
  const data = alumniData(state), booking = data.bookings.find((item) => item.id === id), slot = data.slots.find((item) => item.id === booking?.slotId), person = data.profiles.find((item) => item.id === slot?.alumniId);
  demand(actor.role === "student" && booking && (booking.student === actor.id || person?.owner === actor.id), "只能处理自己的预约。");
  const status = bookingStatus(data, booking, now);
  demand(status === "pending" && booking.student === actor.id || status === "confirmed", "当前预约不能取消。");
  demand(slot && Date.parse(slot.endAt) > now, "该交流时间已结束。");
  demand(status === "pending" || reason.trim(), "取消已确认预约需要填写原因。");
  const next = { ...data, bookings: data.bookings.map((item) => item.id === id ? { ...item, status: status === "pending" ? "withdrawn" : "cancelled", reason: reason.trim() } : item) };
  return { ...state, alumni: record(next, actor, id, status === "pending" ? "校友交流申请已撤回" : "校友交流预约已取消", reason.trim(), [booking.student, person.owner], now) };
}
function submitAlumniCertification(state, actor, input, now = Date.now()) {
  const data = alumniData(state), previous = data.profiles.find((p) => p.owner === actor.id);
  demand(actor.role === "student" && (!previous || previous.status === "rejected"), "已有待审或通过的校友认证。");
  demand(input.name.trim() && input.major.trim() && input.evidence.trim() && input.city.trim() && input.experience.trim() && input.topics.trim(), "请补充必填资料与核验说明。");
  demand(Number.isInteger(input.graduationYear) && input.graduationYear >= 2005 && input.graduationYear <= new Date(now).getFullYear(), "请填写有效的毕业年份。");
  demand(input.name.length <= 40 && input.major.length <= 80 && input.city.length <= 40 && input.experience.length <= 120 && input.topics.length <= 120 && input.bio.length <= 500 && input.evidence.length <= 1e3, "资料超过长度限制。");
  const profile = { ...input, owner: actor.id, id: previous?.id ?? makeId(), status: "pending", accepting: true, reviewNote: "" };
  return { ...state, alumni: record({ ...data, profiles: [...data.profiles.filter((p) => p.owner !== actor.id), profile] }, actor, profile.id, "校友认证已提交", "", [actor.id], now) };
}
function reviewAlumni(state, actor, id, approve, reason, now = Date.now()) {
  const data = alumniData(state), profile = data.profiles.find((p) => p.id === id);
  demand(actor.role === "admin" && profile && (profile.status === "pending" || profile.status === "approved" && !approve), "当前认证不能进行该操作。");
  demand(approve || reason.trim(), "驳回或撤销认证必须填写原因。");
  const affected = !approve ? data.bookings.filter((b) => {
    const slot = data.slots.find((s) => s.id === b.slotId);
    return slot?.alumniId === id && Date.parse(slot.endAt) > now && ["pending", "confirmed"].includes(bookingStatus(data, b, now));
  }) : [];
  const next = { ...data, profiles: data.profiles.map((p) => p.id === id ? { ...p, status: approve ? "approved" : "rejected", reviewNote: reason.trim() } : p), slots: !approve ? data.slots.map((s) => s.alumniId === id ? { ...s, open: false } : s) : data.slots, bookings: data.bookings.map((b) => affected.some((a) => a.id === b.id) ? { ...b, status: "cancelled", reason: "校友认证已撤销，预约取消" } : b) };
  return { ...state, alumni: record(next, actor, id, approve ? "校友认证已通过" : "校友认证未通过或已撤销，相关预约已取消", reason.trim(), [profile.owner, ...affected.map((b) => b.student)], now) };
}
function hasConflict(state, student2, slot, except) {
  const data = alumniData(state);
  return managedSlots(state).some((s) => (student2 === studentName && state.coffeeBookings.includes(s.id) || coffeeData(state).bookings.some((b) => b.student === student2 && b.status === "confirmed" && (b.slotId === s.id || b.proposedSlotId === s.id))) && overlap(s, slot)) || data.bookings.some((b) => b.id !== except && b.status === "confirmed" && (b.student === student2 || data.profiles.some((p) => p.owner === student2 && data.slots.some((s) => s.id === b.slotId && s.alumniId === p.id))) && data.slots.some((s) => s.id === b.slotId && overlap(s, slot)));
}
function requestAlumniChat(state, actor, slotId, question, now = Date.now()) {
  const data = alumniData(state), slot = data.slots.find((s) => s.id === slotId), person = data.profiles.find((p) => p.id === slot?.alumniId);
  demand(actor.role === "student" && person?.status === "approved" && person.accepting && person.owner !== actor.id && slot?.open && Date.parse(slot.startAt) > now, "此时段不能申请。");
  demand(question.trim() && question.trim().length <= 500, "请填写 1–500 字的交流问题。");
  demand(!data.bookings.some((b) => b.slotId === slotId && (b.status === "confirmed" || b.student === actor.id && bookingStatus(data, b, now) === "pending")), "已有申请或该时段已确认预约。");
  demand(!hasConflict(state, actor.id, slot), "与本人已确认的交流时间冲突。");
  const booking = { id: makeId(), slotId, student: actor.id, question: question.trim(), status: "pending", reason: "", createdAt: new Date(now).toISOString() };
  return { ...state, alumni: record({ ...data, bookings: [...data.bookings, booking] }, actor, booking.id, "收到校友交流申请，等待校友确认", "", [actor.id, person.owner], now) };
}
function decideAlumniChat(state, actor, id, accept, reason, now = Date.now()) {
  const person = owned(state, actor), data = alumniData(state), booking = data.bookings.find((b) => b.id === id), slot = data.slots.find((s) => s.id === booking?.slotId);
  demand(booking && slot?.alumniId === person.id && bookingStatus(data, booking, now) === "pending" && slot.open, "该申请已变化或不属于本人。");
  demand(accept || reason.trim(), "拒绝申请需要说明原因。");
  if (accept) {
    demand(!data.bookings.some((b) => b.status === "confirmed" && data.slots.some((s) => s.id === b.slotId && s.alumniId === person.id && overlap(s, slot))), "该时段已有确认预约。");
    demand(!hasConflict(state, booking.student, slot, id), "学生已有冲突的预约。");
    demand(!hasConflict(state, actor.id, slot, id), "校友本人已有冲突的交流。");
  }
  const others = accept ? data.bookings.filter((b) => b.id !== id && b.slotId === slot.id && bookingStatus(data, b, now) === "pending") : [];
  let next = { ...data, bookings: data.bookings.map((b) => b.id === id ? { ...b, status: accept ? "confirmed" : "rejected", reason: reason.trim() } : others.some((o) => o.id === b.id) ? { ...b, status: "unavailable", reason: "校友已确认另一位学生的申请" } : b) };
  next = record(next, actor, id, accept ? "校友交流预约已确认" : "校友交流申请已拒绝", reason.trim(), [booking.student, person.owner], now);
  if (others.length) next = record(next, actor, slot.id, "校友交流时段已被预约，请选择其他时段", "", others.map((b) => b.student), now);
  return { ...state, alumni: next };
}
const emptyAlumni = () => ({
  profiles: [],
  follows: [],
  slots: [],
  bookings: [],
  notices: [],
  history: []
});
function readAlumni(repo) {
  return repo.all("alumniState")[0]?.data.value ?? emptyAlumni();
}
function* alumniPolicy(repo, actor, action, input) {
  if (!action.startsWith("alumni.")) return void 0;
  if (action === "alumni.review") reviewer(actor);
  else student(actor);
  const before = (yield* effect(repo.all("alumniState")))[0]?.data.value ?? emptyAlumni();
  const enrolledNumber = recordedStudentNumber(actor, yield* effect(repo.all("companionIdentity")));
  if (action === "alumni.post") {
    canSpeak(actor);
    const profile = before.profiles.find(
      (p) => p.owner === actor.id && p.status === "approved"
    );
    demand$1(profile, "需要本人已通过校友认证。", 403);
    const direction = enumField(input, "direction", ["升学", "就业"]);
    const title = textField(input, "title", 80);
    const body2 = textField(input, "body", 1e3);
    yield* checkCommunityKeywords(repo, title, body2);
    return yield* effect(repo.create("post", actor.id, {
      alumniId: profile.id,
      title,
      body: body2,
      board: `校友${direction}`,
      images: [],
      status: "visible"
    }));
  }
  const state = {
    ...initialV2State,
    posts: [],
    role: action === "alumni.review" ? "admin" : "student",
    alumni: before,
    coffeeBookings: [],
    teacherCoffee: {
      profiles: {},
      notices: [],
      slots: (yield* effect(repo.all("coffeeSlot"))).map((s) => ({
        id: s.id,
        teacherId: s.ownerId,
        startAt: String(s.data.startAt),
        endAt: String(s.data.endAt),
        location: String(s.data.location),
        capacity: Number(s.data.capacity),
        closed: s.data.closed === true,
        bookingCount: 0,
        status: "available",
        dateLabel: "",
        timeLabel: ""
      })),
      bookings: (yield* effect(repo.all("coffeeBooking"))).map((b) => ({
        id: b.id,
        student: b.ownerId,
        slotId: String(b.data.slotId),
        proposedSlotId: typeof b.data.proposedSlotId === "string" ? b.data.proposedSlotId : void 0,
        topic: String(b.data.topic),
        status: b.data.status === "confirmed" ? "confirmed" : "cancelled",
        createdAt: b.createdAt,
        history: []
      }))
    }
  };
  const policyActor = { id: actor.id, role: state.role };
  let next;
  const profileInput = () => ({
    city: textField(input, "city", 40),
    direction: enumField(input, "direction", ["升学", "就业"]),
    experience: textField(input, "experience", 120),
    topics: textField(input, "topics", 120),
    bio: textField(input, "bio", 500, true),
    accepting: input.accepting !== false
  });
  switch (action) {
    case "alumni.apply":
      next = submitAlumniCertification(state, policyActor, {
        ...profileInput(),
        name: actor.name,
        studentNumber: enrolledNumber ?? textField(input, "studentNumber", 100),
        studentNumberSource: enrolledNumber ? "enrollment" : "applicant",
        major: textField(input, "major", 80),
        graduationYear: integerField(
          input,
          "graduationYear",
          2005,
          (/* @__PURE__ */ new Date()).getFullYear()
        ),
        evidence: textField(input, "evidence", 1e3)
      });
      break;
    case "alumni.profile":
      next = editAlumniProfile(state, policyActor, profileInput());
      break;
    case "alumni.review":
      next = reviewAlumni(
        state,
        policyActor,
        textField(input, "id", 100),
        input.approve === true,
        textField(input, "reason", 1e3, input.approve === true)
      );
      break;
    case "alumni.follow":
      next = followAlumni(state, policyActor, textField(input, "id", 100));
      break;
    case "alumni.slot.create":
      next = addAlumniSlot(state, policyActor, {
        startAt: textField(input, "startAt", 40),
        endAt: textField(input, "endAt", 40),
        location: textField(input, "location", 120)
      });
      break;
    case "alumni.slot.close":
      next = closeAlumniSlot(state, policyActor, textField(input, "id", 100));
      break;
    case "alumni.request": {
      const slot = before.slots.find((s) => s.id === input.slotId), profile = before.profiles.find((p) => p.id === slot?.alumniId);
      demand$1(
        profile && (yield* effect(repo.person(profile.owner))).status !== "banned",
        "校友当前无法接受申请。"
      );
      next = requestAlumniChat(
        state,
        policyActor,
        textField(input, "slotId", 100),
        textField(input, "question", 500)
      );
      break;
    }
    case "alumni.decide": {
      const booking = before.bookings.find((b) => b.id === input.id);
      demand$1(
        booking && (input.accept !== true || (yield* effect(repo.person(booking.student))).status !== "banned"),
        "申请人当前无法预约。"
      );
      next = decideAlumniChat(
        state,
        policyActor,
        textField(input, "id", 100),
        input.accept === true,
        textField(input, "reason", 1e3, input.accept === true)
      );
      break;
    }
    case "alumni.cancel":
      next = cancelAlumniBooking(
        state,
        policyActor,
        textField(input, "id", 100),
        textField(input, "reason", 1e3, true)
      );
      break;
    default:
      return void 0;
  }
  const data = next.alumni;
  for (const notice of data.notices.filter(
    (n) => !before.notices.some((old) => old.id === n.id)
  ))
    yield* effect(repo.notify(
      [notice.recipient],
      typeof input.id === "string" ? input.id : null,
      action,
      notice.body
    ));
  data.notices = [];
  const stored = (yield* effect(repo.all("alumniState")))[0];
  return stored ? yield* effect(repo.save(stored, { value: data })) : yield* effect(repo.create("alumniState", null, { value: data }));
}
function alumniCommand(repo, actor, action, input) {
  return runSync(alumniPolicy(repo, actor, action, input));
}
function activityMailboxConfigured() {
  return Boolean(process.env.BNBU_ACTIVITY_MAIL_HOST && process.env.BNBU_ACTIVITY_MAIL_USER && process.env.BNBU_ACTIVITY_MAIL_PASSWORD && process.env.BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS && process.env.BNBU_ACTIVITY_MAIL_OPERATOR_ID);
}
function config() {
  if (!activityMailboxConfigured()) return null;
  const port = Number(process.env.BNBU_ACTIVITY_MAIL_PORT || 993);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("BNBU_ACTIVITY_MAIL_PORT 无效");
  const allowedSenders = process.env.BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!allowedSenders.length || allowedSenders.some((value) => !/^(@[a-z0-9.-]+|[a-z0-9._%+-]+@[a-z0-9.-]+)$/.test(value))) throw new Error("BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS 无效");
  return {
    host: process.env.BNBU_ACTIVITY_MAIL_HOST,
    port,
    user: process.env.BNBU_ACTIVITY_MAIL_USER,
    password: process.env.BNBU_ACTIVITY_MAIL_PASSWORD,
    mailbox: process.env.BNBU_ACTIVITY_MAIL_MAILBOX || "INBOX",
    allowedSenders,
    operatorId: process.env.BNBU_ACTIVITY_MAIL_OPERATOR_ID,
    intervalMs: Math.max(15e3, Number(process.env.BNBU_ACTIVITY_MAIL_POLL_MS) || 6e4)
  };
}
function allowedActivitySender(address, allowed2) {
  const sender = address.trim().toLowerCase();
  return allowed2.some((value) => value.startsWith("@") ? sender.endsWith(value) : sender === value);
}
function startActivityMailbox(importMail) {
  const settings = config();
  if (!settings) return null;
  let stopped = false;
  let running = false;
  const poll = async () => {
    if (stopped || running) return;
    running = true;
    const client = new ImapFlow({ host: settings.host, port: settings.port, secure: true, auth: { user: settings.user, pass: settings.password }, logger: false });
    try {
      await client.connect();
      const lock = await client.getMailboxLock(settings.mailbox);
      try {
        const unseen = await client.search({ seen: false }, { uid: true });
        let imported = 0;
        for (const uid of Array.isArray(unseen) ? unseen : []) {
          if (stopped) break;
          try {
            const message = await client.fetchOne(String(uid), { source: { start: 0, maxLength: 2 * 1024 * 1024 + 1 }, size: true }, { uid: true });
            if (!message || !message.source || (message.size ?? message.source.length) > 2 * 1024 * 1024) continue;
            const parsed = await simpleParser(message.source, { skipImageLinks: true, skipHtmlToText: false });
            const sender = parsed.from?.value[0]?.address?.toLowerCase() ?? "";
            if (!allowedActivitySender(sender, settings.allowedSenders)) continue;
            const body2 = (parsed.text || "").trim().slice(0, 5e4);
            if (!body2) continue;
            const digest2 = createHash("sha256").update(message.source).digest("hex");
            const messageId = (parsed.messageId || `imap:${digest2}`).trim().slice(0, 255);
            const input = { messageId, sender, subject: (parsed.subject || "学校活动通知").slice(0, 500), body: body2 };
            await importMail(settings.operatorId, input, `imap:${digest2}`);
            await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
            imported += 1;
            if (imported >= 20) break;
          } catch {
            console.error("活动邮件导入失败；邮件保留未读，稍后重试。");
          }
        }
      } finally {
        lock.release();
      }
    } catch {
      console.error("活动收件邮箱连接或读取失败，稍后重试。");
    } finally {
      try {
        await client.logout();
      } catch {
      }
      running = false;
    }
  };
  void poll();
  const timer = setInterval(() => void poll(), settings.intervalMs);
  return { stop() {
    stopped = true;
    clearInterval(timer);
  } };
}
const activityOcrConfigured = () => Boolean(process.env.BNBU_ACTIVITY_OCR_SECRET_ID && process.env.BNBU_ACTIVITY_OCR_SECRET_KEY);
async function recognizeWithTencent(bytes) {
  demand$1(activityOcrConfigured(), "尚未配置活动截图 OCR 服务。", 503);
  try {
    const { ocr } = await import("tencentcloud-sdk-nodejs-ocr");
    const client = new ocr.v20181119.Client({
      credential: { secretId: process.env.BNBU_ACTIVITY_OCR_SECRET_ID, secretKey: process.env.BNBU_ACTIVITY_OCR_SECRET_KEY },
      region: process.env.BNBU_ACTIVITY_OCR_REGION || "ap-guangzhou",
      profile: { httpProfile: { endpoint: "ocr.tencentcloudapi.com", reqTimeout: 20 } }
    });
    const result2 = await client.GeneralAccurateOCR({ ImageBase64: bytes.toString("base64") });
    return {
      text: (result2.TextDetections ?? []).map((item) => item.DetectedText?.trim()).filter(Boolean).join("\n").slice(0, 2e4),
      requestId: result2.RequestId ?? ""
    };
  } catch {
    throw new ServiceError(502, "ACTIVITY_OCR_UNAVAILABLE", "活动截图识别暂不可用，未保存或发布活动。");
  }
}
async function recognizeActivityScreenshot(request, recognizer = recognizeWithTencent) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    demand$1(size <= 6 * 1024 * 1024, "活动截图不能超过 5 MB。", 413);
    chunks.push(chunk);
  }
  const envelope = new Request("http://127.0.0.1/upload", {
    method: "POST",
    headers: { "Content-Type": request.headers["content-type"] ?? "" },
    body: new Blob([Uint8Array.from(Buffer.concat(chunks))])
  });
  let file;
  try {
    file = (await envelope.formData()).get("image");
  } catch {
    throw new ServiceError(400, "INVALID_IMAGE_UPLOAD", "请上传 PNG 或 JPG 活动截图。");
  }
  demand$1(file instanceof File && file.size > 0 && file.size <= 5 * 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpeg"), "请上传不超过 5 MB 的 PNG 或 JPG 活动截图。");
  const bytes = Buffer.from(await file.arrayBuffer());
  demand$1(file.type === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) : bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex")), "活动截图格式无效。");
  const result2 = await recognizer(bytes, file.type);
  demand$1(result2.text.trim(), "截图未识别出文字，请换一张清晰图片。", 422);
  return { ...result2, image: `data:${file.type};base64,${bytes.toString("base64")}` };
}
function projectWorkspace(source, actor) {
  const repo = source.repo;
  if (source.firstLoginOnly)
    return {
      firstLoginOnly: true,
      account: { ...actor, studentNumber: source.studentNumber },
      entities: [],
      people: [],
      notifications: [],
      relations: [],
      audit: [],
      notificationBatches: [],
      alumni: {
        profiles: [],
        follows: [],
        slots: [],
        bookings: [],
        notices: [],
        history: []
      },
      capabilities: {}
    };
  if (actor.roles.length === 0) {
    const ownEntities = ["profile", "preferences", "verifiedEmail", "companionIdentity", "studentIdentityRequest"].flatMap((kind) => repo.all(kind).filter((entity) => entity.ownerId === actor.id));
    return {
      account: { ...actor, studentNumber: null },
      sports: null,
      sportsStatus: "unavailable",
      entities: ownEntities,
      people: projectDisplayPeople(actor, repo.people(), /* @__PURE__ */ new Set([actor.id]), repo.all("preferences"), repo.all("profile")),
      notifications: source.notifications,
      relations: [],
      audit: [],
      notificationBatches: [],
      relationshipHistory: [],
      alumni: { profiles: [], follows: [], slots: [], bookings: [], notices: [], history: [] },
      capabilities: { schoolIdentity: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "external-service-required" }
    };
  }
  const review = has(actor, "reviewer", "superadmin"), operate = has(actor, "operator", "superadmin"), manageKeywords = has(actor, "reviewer", "operator", "superadmin");
  const own = (ownerId) => ownerId === actor.id;
  const savedIds = new Set(source.relations.filter((row) => row.kind === "save").map((row) => String(row.entityId)));
  const socialEdges = repo.all("socialEdge");
  const posts = repo.all("post").filter((p) => !socialBlocked(socialEdges, actor.id, p.ownerId) && (own(p.ownerId) || savedIds.has(p.id) && p.data.status === "visible")).slice(0, 50);
  const rooms = repo.all("room").filter((r) => own(r.ownerId) || savedIds.has(r.id) && r.data.visibility === "visible" || strings(r.data.members).includes(actor.id)).slice(0, 50);
  const memberRooms = repo.all("room").filter(
    (r) => r.data.status === "open" && r.data.visibility === "visible" && strings(r.data.members).includes(actor.id)
  );
  const alumni = readAlumni(repo);
  const myAlumniIds = alumni.profiles.filter((p) => p.owner === actor.id).map((p) => p.id);
  const bookings = alumni.bookings.filter(
    (b) => b.student === actor.id || alumni.slots.some(
      (s) => s.id === b.slotId && myAlumniIds.includes(s.alumniId)
    )
  ).map((b) => ({ ...b, status: bookingStatus(alumni, b) }));
  const scopedAlumni = {
    profiles: alumni.profiles.filter((p) => p.status === "approved" || p.owner === actor.id || review || alumni.slots.some((s) => s.alumniId === p.id && bookings.some((b) => b.slotId === s.id))).map(
      (p) => p.owner === actor.id || review ? p : { ...p, studentNumber: void 0, studentNumberSource: void 0, evidence: "", reviewNote: "" }
    ),
    slots: alumni.slots.filter(
      (s) => bookings.some((b) => b.slotId === s.id) || alumni.profiles.some(
        (p) => p.id === s.alumniId && (p.status === "approved" || p.owner === actor.id)
      )
    ).map((s) => ({ ...s, occupied: alumni.bookings.some((b) => b.slotId === s.id && bookingStatus(alumni, b) === "confirmed") })),
    bookings,
    follows: alumni.follows.filter((f) => f.student === actor.id),
    history: alumni.history.filter(
      (h) => h.actor === actor.id || myAlumniIds.includes(h.objectId) || bookings.some((b) => b.id === h.objectId)
    ),
    notices: []
  };
  const notifications = source.notifications;
  const eligibleTeachers = new Set(repo.people().filter((p) => p.status !== "banned" && p.roles.includes("teacher")).map((p) => p.id));
  const visibleCoffeeBookings = repo.all("coffeeBooking").filter((b) => own(b.ownerId) || b.data.teacherId === actor.id && has(actor, "teacher") || operate);
  const readableTeacher = (id) => !!id && (eligibleTeachers.has(id) || own(id) || operate || visibleCoffeeBookings.some((b) => b.data.teacherId === id));
  const entities = [
    ...posts,
    ...manageKeywords ? repo.all("communityKeyword").filter((keyword) => keyword.data.deleted !== true) : [],
    ...repo.all("comment").filter(
      (c) => posts.some(
        (p) => p.id === c.data.postId && (p.data.status === "visible" || review || own(p.ownerId))
      ) && (c.data.status === "visible" || own(c.ownerId) || review)
    ).slice(0, 50),
    ...rooms.map((r) => ({
      ...r,
      data: {
        ...r.data,
        memberCount: strings(r.data.members).length,
        members: strings(r.data.members).includes(actor.id) || review || own(r.ownerId) ? r.data.members : [],
        isMember: strings(r.data.members).includes(actor.id)
      }
    })),
    ...repo.all("roomApplication").filter(
      (a) => own(a.ownerId) || rooms.some((r) => r.id === a.data.roomId && own(r.ownerId))
    ).map((application) => {
      const room = repo.get(application.data.roomId, "room");
      return { ...application, data: { ...application.data, roomSummary: {
        id: room.id,
        title: room.data.title,
        status: room.data.status,
        visibility: room.data.visibility
      } } };
    }),
    ...repo.all("roomReview").filter((r) => rooms.some((room) => room.id === r.data.roomId)),
    ...repo.all("message").filter((m) => memberRooms.some((r) => r.id === m.data.roomId)),
    ...repo.all("certification").filter((c) => own(c.ownerId) || review),
    ...repo.all("report").filter((c) => own(c.ownerId) || review).map((report) => {
      if (review) return report;
      const evidence = report.data.snapshot;
      const publicEvidence = { ...evidence };
      delete publicEvidence.members;
      return { ...report, data: { ...report.data, snapshot: publicEvidence } };
    }),
    ...repo.all("organization").filter(
      (o) => o.data.status === "approved" && o.data.visibility === "visible" || own(o.ownerId) || review || operate
    ),
    ...repo.all("knowledge").filter((k) => k.data.status === "published" || operate),
    ...repo.all("answer").filter((a) => own(a.ownerId)),
    ...repo.all("feedback").filter((f) => own(f.ownerId) || operate),
    ...repo.all("profile").filter((p) => own(p.ownerId)),
    ...repo.all("preferences").filter((p) => own(p.ownerId)),
    ...repo.all("timetable").filter((t) => own(t.ownerId)),
    ...repo.all("teacherProfile").filter((p) => readableTeacher(p.ownerId)).map((p) => ({ ...p, data: { ...p.data, enabled: eligibleTeachers.has(p.ownerId) && p.data.enabled !== false } })),
    ...repo.all("coffeeSlot").filter((s) => readableTeacher(s.ownerId)).map((s) => ({
      ...s,
      data: {
        ...s.data,
        closed: s.data.closed === true || !eligibleTeachers.has(s.ownerId),
        occupied: repo.all("coffeeBooking").filter(
          (b) => b.data.status === "confirmed" && (b.data.slotId === s.id || b.data.proposedSlotId === s.id)
        ).length
      }
    })),
    ...visibleCoffeeBookings.map((booking) => ({ ...booking, data: { ...booking.data, history: source.coffeeHistory(booking.id) } })),
    ...repo.all("activity").filter(
      (a) => a.data.status === "published" || own(a.ownerId) || operate
    ),
    ...operate ? repo.all("mail") : []
  ];
  const visiblePeople = new Set([
    actor.id,
    ...entities.map((e) => e.ownerId),
    ...memberRooms.flatMap((r) => strings(r.data.members)),
    ...scopedAlumni.profiles.map((profile) => profile.owner)
  ].filter((id) => typeof id === "string"));
  const people = projectDisplayPeople(actor, repo.people(), visiblePeople, repo.all("preferences"), repo.all("profile"));
  return {
    account: { ...actor, studentNumber: source.studentNumber },
    sports: source.sports,
    sportsStatus: source.sportsStatus ?? "unavailable",
    entities,
    alumni: scopedAlumni,
    relationshipHistory: source.relationshipHistory(entities),
    notifications,
    people,
    notificationBatches: operate ? source.notificationBatches : [],
    relations: source.relations,
    audit: has(actor, "superadmin") ? source.audit : [],
    capabilities: {
      schoolIdentity: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "external-service-required",
      sports: source.sportsStatus === "available" || source.sportsStatus === "not-enrolled" ? "configured" : "external-service-required",
      mail: "explicit-field-extraction",
      activityMailbox: activityMailboxConfigured() ? "configured" : "unconfigured",
      activityScreenshotOcr: activityOcrConfigured() ? "configured" : "unconfigured",
      email: process.env.BNBU_EMAIL_DELIVERY_URL ? "configured" : process.env.BNBU_LOCAL_OUTBOX === "1" ? "local-outbox" : "unconfigured",
      timetableRecognition: process.env.BNBU_TIMETABLE_UPSTREAM ? "configured" : "external-service-required"
    }
  };
}
function* relationPolicy(repo, actor, input) {
  student(actor);
  demand$1(typeof input.enabled === "boolean", "enabled 必须明确为 true 或 false。");
  const entity = yield* effect(repo.get(input.id));
  const kind = textField(input, "kind", 40);
  const allowed2 = { post: ["like", "save"], activity: ["like", "save", "participate"], room: ["save"], organization: ["follow"] };
  demand$1(allowed2[entity.kind]?.includes(kind), "此对象不支持该操作。");
  if (input.enabled) {
    if (entity.kind === "post") yield* requireSocialAccess(repo, actor, entity.ownerId);
    demand$1(entity.kind === "organization" ? entity.data.status === "approved" && entity.data.visibility === "visible" : publicEntity(entity), "对象当前未公开。");
    if (kind === "participate") demand$1(Date.parse(String(entity.data.endAt || entity.data.startAt)) > Date.now(), "已结束活动不能标记参与。");
  }
  const before = yield* effect(repo.related(actor.id, entity.id, kind));
  yield* effect(repo.relation(actor.id, entity.id, kind, input.enabled));
  if (entity.kind === "post" && input.enabled && !before && entity.ownerId !== actor.id) yield* effect(repo.notify([entity.ownerId], entity.id, kind === "like" ? "community.like" : "community.save", kind === "like" ? "你的帖子收到一个赞。" : "你的帖子被收藏了。"));
  return { id: entity.id };
}
function viewInput(input) {
  demand$1(typeof input.id === "string" && input.id.length > 0, "帖子标识无效。");
  demand$1(typeof input.openId === "string" && /^[a-zA-Z0-9-]{8,100}$/.test(input.openId), "打开记录标识无效。");
  return { postId: input.id, openId: input.openId };
}
function recordPostView(db, repo, actor, input) {
  demand$1(actor.roles.length > 0, "请先完成校园身份核验。", 403);
  const { postId, openId } = viewInput(input);
  const post = repo.get(postId, "post");
  runSync(requireSocialAccess(repo, actor, post.ownerId));
  demand$1(post.data.status === "visible", "帖子当前不可查看。", 403);
  const previous = db.prepare("SELECT post_id FROM post_views WHERE viewer_id=? AND open_id=?").get(actor.id, openId);
  demand$1(!previous || previous.post_id === postId, "打开记录标识已用于其他帖子。", 409);
  if (!previous) db.prepare("INSERT INTO post_views(post_id,viewer_id,open_id,viewed_at) VALUES(?,?,?,?)").run(postId, actor.id, openId, timestamp());
  return { id: postId };
}
async function recordPostgresPostView(repo, actor, input) {
  demand$1(actor.roles.length > 0, "请先完成校园身份核验。", 403);
  const { postId, openId } = viewInput(input);
  const post = await repo.get(postId, "post");
  await runAsync(requireSocialAccess(repo, actor, post.ownerId));
  demand$1(post.data.status === "visible", "帖子当前不可查看。", 403);
  const { rows } = await repo.client.query("SELECT post_id FROM post_views WHERE viewer_id=$1 AND open_id=$2", [actor.id, openId]);
  demand$1(!rows[0] || rows[0].post_id === postId, "打开记录标识已用于其他帖子。", 409);
  if (!rows[0]) {
    const inserted = await repo.client.query("INSERT INTO post_views(post_id,viewer_id,open_id,viewed_at) VALUES($1,$2,$3,$4) ON CONFLICT(viewer_id,open_id) DO NOTHING RETURNING post_id", [postId, actor.id, openId, timestamp()]);
    if (!inserted.rows[0]) {
      const concurrent = await repo.client.query("SELECT post_id FROM post_views WHERE viewer_id=$1 AND open_id=$2", [actor.id, openId]);
      demand$1(concurrent.rows[0]?.post_id === postId, "打开记录标识已用于其他帖子。", 409);
    }
  }
  return { id: postId };
}
function relationshipHistory(db, actorId, visible) {
  const rows = db.prepare("SELECT entity_id AS entityId, data, created_at AS at FROM audit WHERE actor_id=? AND action='relation.set' ORDER BY created_at,rowid").all(actorId);
  const teamRows = db.prepare("SELECT action,data,created_at AS at FROM audit WHERE action IN ('room.create','room.decide','room.finish','room.moderate') ORDER BY created_at,rowid").all();
  return projectRelationshipHistory(actorId, visible, rows, teamRows);
}
function projectRelationshipHistory(actorId, visible, rows, teamRows) {
  const grouped = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const payload = JSON.parse(row.data);
    const relation = payload.relation;
    if (!relation || !["participate", "follow"].includes(relation.kind ?? "") || typeof relation.enabled !== "boolean") continue;
    const source = visible.find((e) => e.id === row.entityId);
    const activity = relation.kind === "participate";
    if (source && source.kind !== (activity ? "activity" : "organization")) continue;
    const isPublic = source && (activity ? source.data.status === "published" : source.data.status === "approved" && source.data.visibility !== "hidden");
    const id = (activity ? "activity:" : "organization:") + row.entityId;
    const status = relation.enabled ? activity ? "已标记参与 · 非到场记录" : "已关注 · 非正式入会" : activity ? "已取消参与标记" : "已取消关注";
    let entry = grouped.get(id);
    if (!entry) {
      entry = { entity: { id, sourceId: row.entityId, title: isPublic ? String(source.data[activity ? "title" : "name"]) : "原对象当前不可见", kind: activity ? "activity" : "organization", relation: activity ? "marked" : "followed", status, active: relation.enabled && !!isPublic, path: isPublic ? activity ? "/v2/activities/" + row.entityId : "/v2/campus" : "/v2/me", establishedAt: relation.enabled ? row.at : null }, changes: [] };
      grouped.set(id, entry);
    }
    if (entry.changes.at(-1)?.active === relation.enabled) continue;
    entry.changes.push({ at: row.at, status, active: relation.enabled });
    entry.entity.status = isPublic ? status : "原对象当前不可见";
    entry.entity.active = relation.enabled && !!isPublic;
    if (relation.enabled && !entry.entity.establishedAt) entry.entity.establishedAt = row.at;
  }
  const membership = /* @__PURE__ */ new Map();
  for (const row of teamRows) {
    const saved = JSON.parse(row.data).teamResult;
    if (!saved?.data) continue;
    let roomId, joined, status, active;
    if (row.action === "room.decide") {
      if (saved.ownerId !== actorId || saved.data.status !== "approved" || typeof saved.data.roomId !== "string") continue;
      roomId = saved.data.roomId;
      joined = true;
      active = true;
      status = "入队申请已通过";
    } else {
      roomId = saved.id;
      joined = Array.isArray(saved.data.members) && saved.data.members.includes(actorId);
      if (!joined && !membership.get(roomId)) continue;
      active = joined && saved.data.status === "open" && saved.data.visibility === "visible";
      status = !joined ? "已被移出队伍" : saved.data.status === "finished" ? "队伍已结束" : saved.data.visibility !== "visible" ? "队伍已下架" : "已加入队伍";
    }
    membership.set(roomId, joined);
    const id = "team:" + roomId, current = visible.find((e) => e.id === roomId && e.kind === "room");
    const isPublic = current?.data.visibility === "visible";
    let entry = grouped.get(id);
    if (!entry) {
      entry = { entity: { id, sourceId: roomId, title: isPublic ? String(current.data.title) : "原队伍当前不可见", kind: "team", relation: "joined", status, active, path: "/v2/partners/teams", establishedAt: row.action === "room.create" || row.action === "room.decide" ? row.at : null }, changes: [] };
      grouped.set(id, entry);
    }
    if (entry.changes.at(-1)?.status !== status) entry.changes.push({ at: row.at, status, active });
    entry.entity.active = active && !!isPublic;
    entry.entity.status = status;
  }
  return [...grouped.values()];
}
function overlaps(a, b) {
  return Date.parse(String(a.startAt)) < Date.parse(String(b.endAt)) && Date.parse(String(b.startAt)) < Date.parse(String(a.endAt));
}
function validPeriod(input) {
  const startAt = textField(input, "startAt", 40), endAt = textField(input, "endAt", 40);
  demand$1(
    Number.isFinite(Date.parse(startAt)) && Date.parse(startAt) > Date.now() && Date.parse(endAt) > Date.parse(startAt),
    "请填写未来有效起止时间。"
  );
  return { startAt, endAt };
}
function* occupiedPolicy(repo, slotId, except) {
  return (yield* effect(repo.all("coffeeBooking"))).filter(
    (b) => b.id !== except && b.data.status === "confirmed" && (b.data.slotId === slotId || b.data.proposedSlotId === slotId)
  ).length;
}
function* hasConflictPolicy(repo, personId, slot, except) {
  const alumni = (yield* effect(repo.all("alumniState")))[0]?.data.value ?? emptyAlumni();
  for (const booking of yield* effect(repo.all("coffeeBooking"))) {
    if (booking.id === except || booking.ownerId !== personId || booking.data.status !== "confirmed") continue;
    for (const id of [booking.data.slotId, booking.data.proposedSlotId].filter(Boolean)) {
      if (overlaps((yield* effect(repo.get(id, "coffeeSlot"))).data, slot.data)) return true;
    }
  }
  return alumni.bookings.some((b) => {
    if (b.id === except || b.status !== "confirmed") return false;
    const other = alumni.slots.find((s) => s.id === b.slotId);
    return !!other && (b.student === personId || alumni.profiles.some((p) => p.id === other.alumniId && p.owner === personId)) && overlaps({ startAt: other.startAt, endAt: other.endAt }, slot.data);
  });
}
function manageTeacher(actor, teacherId) {
  if (actor.id === teacherId && has(actor, "teacher")) return;
  operator(actor);
}
function* availableSlotPolicy(repo, slot) {
  const teacher = yield* effect(repo.person(slot.ownerId));
  return !slot.data.closed && Date.parse(String(slot.data.startAt)) > Date.now() && teacher.status !== "banned" && has(teacher, "teacher") && !(yield* effect(repo.all("teacherProfile"))).some((p) => p.ownerId === slot.ownerId && p.data.enabled === false);
}
function* coffeePolicy(repo, actor, action, input) {
  if (action === "coffee.profile") {
    const teacherId = typeof input.teacherId === "string" ? input.teacherId : actor.id;
    manageTeacher(actor, teacherId);
    demand$1(has(yield* effect(repo.person(teacherId)), "teacher"), "目标账号没有教师身份。");
    const old = (yield* effect(repo.all("teacherProfile"))).find((p) => p.ownerId === teacherId);
    demand$1(input.enabled === void 0 || typeof input.enabled === "boolean", "服务状态必须为是或否。");
    const patch = {
      nickname: textField(input, "nickname", 20),
      bio: textField(input, "bio", 1e3, true),
      topics: textField(input, "topics", 500),
      location: textField(input, "location", 120),
      enabled: input.enabled === void 0 ? old?.data.enabled !== false : input.enabled
    };
    if (!patch.enabled)
      demand$1(
        !(yield* effect(repo.all("coffeeBooking"))).some(
          (b) => b.data.teacherId === teacherId && b.data.status === "confirmed"
        ),
        "仍有有效预约，不能停止交流服务。"
      );
    return old ? yield* effect(repo.save(old, patch)) : yield* effect(repo.create("teacherProfile", teacherId, patch));
  }
  if (action === "coffee.slot.create") {
    const teacherId = typeof input.teacherId === "string" ? input.teacherId : actor.id;
    manageTeacher(actor, teacherId);
    demand$1(has(yield* effect(repo.person(teacherId)), "teacher"), "目标账号没有教师身份。");
    const period = validPeriod(input);
    demand$1(
      !(yield* effect(repo.all("coffeeSlot"))).some(
        (s) => s.ownerId === teacherId && !s.data.closed && overlaps(s.data, period)
      ),
      "与教师其他开放时段重叠。"
    );
    return yield* effect(repo.create("coffeeSlot", teacherId, {
      ...period,
      capacity: integerField(input, "capacity", 1, 1e3),
      location: textField(input, "location", 120),
      closed: false
    }));
  }
  if (action === "coffee.slot.update") {
    const slot = yield* effect(repo.get(input.id, "coffeeSlot"));
    manageTeacher(actor, slot.ownerId);
    const count2 = yield* occupiedPolicy(repo, slot.id), capacity = integerField(input, "capacity", 1, 1e3);
    demand$1(capacity >= count2, "容量不能小于预约和改期预留。");
    const period = validPeriod(input);
    demand$1(
      !count2 || Date.parse(period.startAt) === Date.parse(String(slot.data.startAt)) && Date.parse(period.endAt) === Date.parse(String(slot.data.endAt)) && input.closed !== true,
      "已有预约或改期预留，不能调整时间或关闭。"
    );
    demand$1(
      input.closed === true || !(yield* effect(repo.all("coffeeSlot"))).some(
        (s) => s.id !== slot.id && s.ownerId === slot.ownerId && !s.data.closed && overlaps(s.data, period)
      ),
      "时段重叠。"
    );
    return yield* effect(repo.save(slot, {
      ...period,
      capacity,
      closed: input.closed === true,
      location: textField(input, "location", 120)
    }));
  }
  if (action === "coffee.book") {
    student(actor);
    const slot = yield* effect(repo.get(input.slotId, "coffeeSlot"));
    demand$1(yield* availableSlotPolicy(repo, slot), "该时段不可预约。");
    demand$1(
      (yield* occupiedPolicy(repo, slot.id)) < Number(slot.data.capacity) && !(yield* hasConflictPolicy(repo, actor.id, slot)),
      "时段已满或与本人安排冲突。",
      409
    );
    const booking = yield* effect(repo.create("coffeeBooking", actor.id, {
      slotId: slot.id,
      teacherId: slot.ownerId,
      topic: textField(input, "topic", 500),
      status: "confirmed"
    }));
    yield* effect(repo.notify(
      [actor.id, slot.ownerId],
      booking.id,
      action,
      "Coffee Chat 预约已成立。"
    ));
    return booking;
  }
  if (action === "coffee.cancel") {
    const booking = yield* effect(repo.get(input.id, "coffeeBooking"));
    if (booking.ownerId === actor.id) student(actor);
    else manageTeacher(actor, String(booking.data.teacherId));
    demand$1(booking.data.status === "confirmed", "预约已取消。", 409);
    const reason = textField(
      input,
      "reason",
      1e3,
      booking.ownerId === actor.id
    );
    yield* effect(repo.notify(
      [booking.ownerId, String(booking.data.teacherId)],
      booking.id,
      action,
      `预约已取消${reason ? `：${reason}` : ""}`
    ));
    return yield* effect(repo.save(booking, {
      status: "cancelled",
      proposedSlotId: null,
      reason
    }));
  }
  if (action === "coffee.move") {
    const booking = yield* effect(repo.get(input.id, "coffeeBooking"));
    manageTeacher(actor, String(booking.data.teacherId));
    demand$1(
      booking.data.status === "confirmed" && !booking.data.proposedSlotId,
      "预约当前不能提出改期。",
      409
    );
    const next = yield* effect(repo.get(input.slotId, "coffeeSlot")), reason = textField(input, "reason", 1e3);
    demand$1(
      next.id !== booking.data.slotId && next.ownerId === booking.data.teacherId && (yield* availableSlotPolicy(repo, next)),
      "请选择同一教师的其他未来开放时段。"
    );
    demand$1(
      (yield* occupiedPolicy(repo, next.id)) < Number(next.data.capacity) && !(yield* hasConflictPolicy(repo, booking.ownerId, next, booking.id)),
      "新时段已满或学生安排冲突。",
      409
    );
    yield* effect(repo.notify(
      [booking.ownerId],
      booking.id,
      action,
      `老师提出改期，请接受或拒绝：${reason}`
    ));
    return yield* effect(repo.save(booking, { proposedSlotId: next.id, reason }));
  }
  if (action === "coffee.answer") {
    student(actor);
    const booking = yield* effect(repo.get(input.id, "coffeeBooking"));
    owner(actor, booking);
    demand$1(
      booking.data.status === "confirmed" && booking.data.proposedSlotId,
      "当前没有待处理改期。",
      409
    );
    const next = yield* effect(repo.get(booking.data.proposedSlotId, "coffeeSlot")), accept = input.accept === true;
    if (accept)
      demand$1(
        (yield* availableSlotPolicy(repo, next)) && (yield* occupiedPolicy(repo, next.id)) <= Number(next.data.capacity) && !(yield* hasConflictPolicy(repo, actor.id, next, booking.id)),
        "新时段已经失效或冲突，请拒绝后重新协调。",
        409
      );
    yield* effect(repo.notify(
      [actor.id, String(booking.data.teacherId)],
      booking.id,
      action,
      `学生已${accept ? "接受" : "拒绝"}改期。`
    ));
    return yield* effect(repo.save(booking, {
      slotId: accept ? next.id : booking.data.slotId,
      proposedSlotId: null
    }));
  }
  return void 0;
}
function coffeeCommand(repo, actor, action, input) {
  return runSync(coffeePolicy(repo, actor, action, input));
}
const profileCoverChoices = ["campus", "evening", "walkway", "services", "lakeside", "flowers"];
const text = (value, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
function parseTimetableResponse(value) {
  if (!value || typeof value !== "object" || !("lessons" in value) || !Array.isArray(value.lessons) || !value.lessons.length || value.lessons.length > 100) throw new Error("未识别到有效课程，请换一张清晰、完整的课表照片重试。");
  const unique = /* @__PURE__ */ new Map();
  for (const [index, entry] of value.lessons.entries()) {
    if (!entry || typeof entry !== "object") throw new Error("识别结果格式异常，请重试。");
    const row = entry;
    const name = text(row.name, 100), weekday = row.weekday;
    if (!name || typeof weekday !== "number" || !Number.isInteger(weekday) || weekday < 1 || weekday > 7) throw new Error("部分课程缺少名称或星期，请重新识别，原课表已保留。");
    const startTime = text(row.startTime), endTime = text(row.endTime);
    if (startTime && !isTime(startTime) || endTime && !isTime(endTime) || startTime && endTime && endTime <= startTime) throw new Error("识别出的课程时间无效，请重新识别，原课表已保留。");
    const lesson = { id: `lesson-${index}`, name, weekday, startTime, endTime, period: text(row.period, 60), location: text(row.location, 100), teacher: text(row.teacher, 80), weeks: text(row.weeks, 100), note: text(row.note), needsReview: row.needsReview !== false || !startTime || !endTime };
    const key = JSON.stringify([weekday, name, startTime, endTime, lesson.period, lesson.location, lesson.teacher, lesson.weeks]);
    if (!unique.has(key)) unique.set(key, lesson);
  }
  return [...unique.values()];
}
function correctTimetableLesson(table, id, input) {
  if (!table.lessons.some((item) => item.id === id)) throw new Error("课程已变更，请重新打开。");
  const clean = parseTimetableResponse({ lessons: [input] })[0];
  return { ...table, updatedAt: (/* @__PURE__ */ new Date()).toISOString(), lessons: table.lessons.map((item) => item.id === id ? { ...clean, id } : item) };
}
const sidebarCoreIds = ["home", "discover", "campus", "conversations", "me"];
const sidebarCampusIds = ["community", "partners", "alumni", "explore", "ai", "organizations", "coffee", "sports", "teaching", "academic"];
const sidebarAllIds = [...sidebarCoreIds, ...sidebarCampusIds];
const allowed = new Set(sidebarAllIds);
function parseSidebarItems(value) {
  if (!Array.isArray(value) || value.length < sidebarCoreIds.length || value.length > sidebarAllIds.length) return null;
  if (!value.every((item) => typeof item === "string" && allowed.has(item))) return null;
  if (new Set(value).size !== value.length) return null;
  if (!sidebarCoreIds.every((item) => value.includes(item))) return null;
  return value;
}
function* governancePolicy(repo, actor, action, input) {
  if (action === "certification.apply") {
    student(actor);
    const kind = enumField(input, "kind", ["student", "club", "official"]), organization = textField(input, "organization", 120);
    demand$1(
      !(yield* effect(repo.all("certification"))).some(
        (c) => c.ownerId === actor.id && c.data.kind === kind && c.data.organization === organization && c.data.status === "pending"
      ),
      "已有相同待审认证。",
      409
    );
    return yield* effect(repo.create("certification", actor.id, {
      kind,
      organization,
      note: textField(input, "note", 1e3),
      status: "pending"
    }));
  }
  if (action === "certification.review") {
    reviewer(actor);
    const certification = yield* effect(repo.get(input.id, "certification")), approve = input.approve === true;
    demand$1(
      certification.data.status === "pending" || certification.data.status === "approved" && !approve,
      "认证当前不能进行该操作。",
      409
    );
    const reason = textField(input, "reason", 1e3, approve);
    yield* effect(repo.notify(
      [certification.ownerId],
      certification.id,
      action,
      `认证${approve ? "已通过" : "未通过或已撤销"}${reason ? `：${reason}` : ""}`
    ));
    return yield* effect(repo.save(certification, {
      status: approve ? "approved" : "rejected",
      reviewNote: reason
    }));
  }
  if (action === "organization.apply") {
    student(actor);
    const name = textField(input, "name", 80);
    demand$1(
      !(yield* effect(repo.all("organization"))).some(
        (o) => o.data.name === name && ["pending", "approved"].includes(String(o.data.status))
      ),
      "已有同名待审或已入驻社团。",
      409
    );
    return yield* effect(repo.create("organization", actor.id, {
      name,
      description: textField(input, "description", 1e3),
      category: textField(input, "category", 80),
      contact: textField(input, "contact", 200),
      status: "pending",
      visibility: "hidden"
    }));
  }
  if (action === "organization.review") {
    reviewer(actor);
    const organization = yield* effect(repo.get(input.id, "organization")), approve = input.approve === true;
    demand$1(organization.data.status === "pending", "申请已处理。", 409);
    const reason = textField(input, "reason", 1e3, approve);
    yield* effect(repo.notify(
      [organization.ownerId],
      organization.id,
      action,
      `入驻${approve ? "通过" : "驳回"}：${reason}`
    ));
    return yield* effect(repo.save(organization, {
      status: approve ? "approved" : "rejected",
      visibility: approve ? "visible" : "hidden",
      reviewNote: reason
    }));
  }
  if (action === "organization.update") {
    operator(actor);
    const organization = yield* effect(repo.get(input.id, "organization"));
    demand$1(organization.data.status === "approved", "仅可维护已入驻社团。");
    const visibility = enumField(input, "visibility", ["visible", "hidden"]), reason = textField(input, "reason", 1e3);
    yield* effect(repo.notify(
      [organization.ownerId],
      organization.id,
      action,
      `社团资料或公开状态更新：${reason}`
    ));
    return yield* effect(repo.save(organization, {
      description: textField(input, "description", 1e3),
      contact: textField(input, "contact", 200),
      visibility
    }));
  }
  if (action === "knowledge.save") {
    operator(actor);
    const data = {
      title: textField(input, "title", 80),
      body: textField(input, "body", 1e4),
      keywords: textField(input, "keywords", 500),
      source: textField(input, "source", 2e3),
      status: enumField(input, "status", ["draft", "published"])
    };
    return input.id ? yield* effect(repo.save(yield* effect(repo.get(input.id, "knowledge")), data)) : yield* effect(repo.create("knowledge", actor.id, data));
  }
  if (action === "knowledge.ask") {
    student(actor);
    const question = textField(input, "question", 500);
    const matches = (yield* effect(repo.all("knowledge"))).filter(
      (k) => k.data.status === "published" && String(k.data.keywords).split(/[,，\s]+/).filter(Boolean).some((word) => question.includes(word))
    );
    return yield* effect(repo.create("answer", actor.id, {
      question,
      body: matches.length ? matches.map((k) => `${k.data.title}：${k.data.body}`).join("\n") : "暂无已发布知识能够回答这个问题。",
      sources: matches.map((k) => ({
        id: k.id,
        title: k.data.title,
        source: k.data.source
      }))
    }));
  }
  if (action === "feedback.create") {
    student(actor);
    const answer = yield* effect(repo.get(input.answerId, "answer"));
    owner(actor, answer);
    demand$1(
      !(yield* effect(repo.all("feedback"))).some(
        (f) => f.ownerId === actor.id && f.data.answerId === answer.id && f.data.status === "pending"
      ),
      "已有待处理反馈。",
      409
    );
    return yield* effect(repo.create("feedback", actor.id, {
      answerId: answer.id,
      snapshot: answer.data,
      reason: textField(input, "reason", 1e3),
      status: "pending"
    }));
  }
  if (action === "feedback.resolve") {
    operator(actor);
    const feedback = yield* effect(repo.get(input.id, "feedback")), reason = textField(input, "reason", 1e3);
    demand$1(feedback.data.status === "pending", "反馈已处理。", 409);
    yield* effect(repo.notify(
      [feedback.ownerId],
      feedback.id,
      action,
      `回答反馈已处理：${reason}`
    ));
    return yield* effect(repo.save(feedback, { status: "resolved", resolution: reason }));
  }
  if (action === "preferences.aiicon") {
    student(actor);
    const aiIconChoice = enumField(input, "choice", ["yellow", "kitty", "custom"]);
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    const aiCustomIcon = input.image === void 0 ? String(previous?.data.aiCustomIcon ?? "") : textField(input, "image", 15e5, true);
    demand$1(!aiCustomIcon || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(aiCustomIcon), "请上传 JPG、PNG 或 WebP 图片。");
    demand$1(aiIconChoice !== "custom" || !!aiCustomIcon, "请先上传自己的图片。");
    const data = { aiIconChoice, aiCustomIcon };
    return previous ? yield* effect(repo.save(previous, data)) : yield* effect(repo.create("preferences", actor.id, data));
  }
  if (action === "preferences.profilebackground") {
    student(actor);
    const profileBackground = enumField(input, "choice", [...profileCoverChoices]);
    const profile = (yield* effect(repo.all("profile"))).find((p) => p.ownerId === actor.id);
    if (profile) yield* effect(repo.save(profile, { cover: profileBackground }));
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { profileBackground })) : yield* effect(repo.create("preferences", actor.id, { profileBackground }));
  }
  if (action === "preferences.sidebarnav") {
    student(actor);
    const sidebarItems = parseSidebarItems(input.items);
    demand$1(sidebarItems !== null, "侧栏必须保留五个主入口，且不能包含重复或未知功能。");
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { sidebarItems })) : yield* effect(repo.create("preferences", actor.id, { sidebarItems }));
  }
  if (action === "preferences.searchable") {
    student(actor);
    demand$1(typeof input.enabled === "boolean", "搜索开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { searchable: input.enabled })) : yield* effect(repo.create("preferences", actor.id, { searchable: input.enabled }));
  }
  if (action === "preferences.reminders") {
    student(actor);
    const key = enumField(input, "key", ["messages", "teams"]);
    demand$1(typeof input.enabled === "boolean", "提醒开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { [key]: input.enabled })) : yield* effect(repo.create("preferences", actor.id, { [key]: input.enabled }));
  }
  if (action === "preferences.preview") {
    student(actor);
    demand$1(typeof input.enabled === "boolean", "资料预览开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { profilePreview: input.enabled })) : yield* effect(repo.create("preferences", actor.id, { profilePreview: input.enabled }));
  }
  if (action === "preferences.hover") {
    student(actor);
    const key = enumField(input, "key", ["hoverRecentTeams", "hoverActiveTeams", "hoverActivities"]);
    demand$1(typeof input.enabled === "boolean", "悬浮资料开关必须为布尔值。");
    const previous = (yield* effect(repo.all("preferences"))).find((p) => p.ownerId === actor.id);
    return previous ? yield* effect(repo.save(previous, { [key]: input.enabled })) : yield* effect(repo.create("preferences", actor.id, { [key]: input.enabled }));
  }
  if (action === "profile.save") {
    const cover = input.cover === void 0 ? void 0 : textField(input, "cover", 7e6, true);
    demand$1(cover === void 0 || profileCoverChoices.some((choice) => choice === cover) || !!cover && /^data:image\/(jpeg|png|webp);base64,/.test(cover) && Buffer.from(cover.split(",")[1], "base64").length <= 5 * 1024 * 1024, "背景须为校园预设或不超过 5MB 的 JPG、PNG、WebP。");
    const avatar = textField(input, "avatar", 7e6, true);
    demand$1(
      !avatar || /^data:image\/(jpeg|png|webp);base64,/.test(avatar) && Buffer.from(avatar.split(",")[1], "base64").length <= 5 * 1024 * 1024,
      "头像须为不超过 5MB 的 JPG、PNG、WebP。"
    );
    const profile = (yield* effect(repo.all("profile"))).find((p) => p.ownerId === actor.id), data = { nickname: textField(input, "nickname", 20), avatar, ...input.bio !== void 0 ? { bio: textField(input, "bio", 100, true) } : {}, ...cover === void 0 ? {} : { cover } };
    return profile ? yield* effect(repo.save(profile, data)) : yield* effect(repo.create("profile", actor.id, data));
  }
  if (action === "timetable.save") {
    student(actor);
    const table = (yield* effect(repo.all("timetable"))).find((t) => t.ownerId === actor.id);
    const lessons = parseTimetableResponse({ lessons: input.lessons });
    const data = { lessons, fileName: textField(input, "fileName", 255, true), importedAt: timestamp() };
    return table ? yield* effect(repo.save(table, data)) : yield* effect(repo.create("timetable", actor.id, data));
  }
  if (action === "timetable.correct") {
    student(actor);
    const table = (yield* effect(repo.all("timetable"))).find((t) => t.ownerId === actor.id);
    demand$1(table, "尚未保存课表。");
    const next = correctTimetableLesson(
      {
        ...table.data,
        importedAt: String(table.data.importedAt ?? table.createdAt),
        updatedAt: table.updatedAt
      },
      textField(input, "lessonId", 100),
      input
    );
    return yield* effect(repo.save(table, { lessons: next.lessons }));
  }
  if (action === "account.update") {
    demand$1(has(actor, "superadmin"), "需要超级管理员职责。", 403);
    const id = textField(input, "id", 100), target = yield* effect(repo.person(id)), reason = textField(input, "reason", 1e3);
    const status = enumField(input, "status", ["active", "muted", "banned"]);
    const roles = strings(input.roles);
    demand$1(
      Array.isArray(input.roles) && roles.length === input.roles.length && roles.every(
        (r) => ["student", "teacher", "operator", "reviewer", "superadmin"].includes(
          r
        )
      ),
      "角色配置无效；体育资格须沿用原系统。"
    );
    if (target.roles.includes("superadmin") && (status !== "active" || !roles.includes("superadmin"))) {
      demand$1(
        (yield* effect(repo.people())).some(
          (p) => p.id !== id && p.status === "active" && p.roles.includes("superadmin")
        ),
        "唯一有效超级管理员不可停用或降级。"
      );
    }
    yield* effect(repo.updateAccount(id, status, roles));
    yield* effect(repo.notify([id], null, action, `账号权限或状态已更新：${reason}`));
    return {
      id,
      kind: "account",
      ownerId: id,
      data: { status, roles },
      version: 0,
      createdAt: "",
      updatedAt: ""
    };
  }
  return void 0;
}
function governanceCommand(repo, actor, action, input) {
  return runSync(governancePolicy(repo, actor, action, input));
}
const mailFieldLabels = { title: "活动名称", description: "活动介绍", startAt: "活动开始时间", endAt: "活动结束时间", location: "活动地点", host: "主办方", conditions: "参与条件" };
function extractMailLocally(source) {
  const fields = { title: "", description: "", startAt: "", endAt: "", location: "", host: "", conditions: "" };
  const evidence = {}, issues = [];
  for (const [key, label] of Object.entries(mailFieldLabels)) {
    const matches = source.body.split(/\r?\n/).map((line) => line.trim()).filter((line) => new RegExp(`^${label}\\s*[:：]`).test(line));
    if (matches.length > 1) {
      issues.push(`${label}存在多条信息，请核实是否包含多个活动`);
      continue;
    }
    if (matches.length === 1) {
      fields[key] = matches[0].replace(new RegExp(`^${label}\\s*[:：]\\s*`), "").trim();
      evidence[key] = matches[0];
    }
  }
  fields.startAt = normalizeMailTime(fields.startAt);
  fields.endAt = normalizeMailTime(fields.endAt);
  return { fields, evidence, issues: [...issues, ...validateMailFields(fields)], adapter: "local-rules" };
}
function normalizeMailTime(value) {
  const match2 = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::00)?(?:\+08:00)?$/);
  if (!match2) return "";
  const [, y, m, d, h, min] = match2;
  const date = new Date(Date.UTC(+y, +m - 1, +d, +h, +min));
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d || +h > 23 || +min > 59) return "";
  return `${y}-${m}-${d}T${h}:${min}:00+08:00`;
}
function validateMailFields(fields) {
  const issues = [];
  for (const key of ["title", "description", "startAt", "endAt", "location"]) if (!fields[key].trim()) issues.push(`缺少${mailFieldLabels[key]}`);
  if (fields.startAt && !normalizeMailTime(fields.startAt)) issues.push("开始时间无效，需明确年月日和时间（北京时间）");
  if (fields.endAt && !normalizeMailTime(fields.endAt)) issues.push("结束时间无效，需明确年月日和时间（北京时间）");
  if (fields.startAt && fields.endAt && Date.parse(fields.endAt) <= Date.parse(fields.startAt)) issues.push("结束时间必须晚于开始时间");
  if (/待定|待通知|另行通知|TBD/i.test(fields.location)) issues.push("地点尚未确定");
  return issues;
}
function adminOnly(state) {
  if (state.role !== "admin") throw new Error("仅管理员可处理学校邮件活动。");
}
function project$1(record2) {
  const f = record2.fields;
  return { id: record2.eventId, ownerId: "school-mail", mailSourceId: record2.id, title: f.title, description: f.description, startAt: f.startAt, endAt: f.endAt, location: f.location, host: f.host || "主办方未提供", conditions: f.conditions, capacity: null, image: record2.source.cover?.data, status: record2.status === "published" ? "published" : "draft", registrations: 0 };
}
function store(state, record2) {
  const mailActivities = [record2, ...(state.mailActivities ?? []).filter((m) => m.id !== record2.id)];
  const localEvents = state.localEvents.filter((e) => e.id !== record2.eventId);
  return { ...state, mailActivities, localEvents: record2.status === "pending" ? localEvents : [project$1(record2), ...localEvents] };
}
function importActivityMail(state, source) {
  adminOnly(state);
  if (!source.messageId.trim() || !source.subject.trim() || !source.body.trim()) throw new Error("请填写邮件标识、主题和原文。");
  if ((state.mailActivities ?? []).some((m) => m.source.messageId === source.messageId.trim())) return state;
  if (source.cover && (!/^data:image\/(png|jpeg|webp);base64,/.test(source.cover.data) || source.cover.data.length > 15e5)) throw new Error("封面须为处理后的 JPG、PNG 或 WebP 图片。");
  const extraction = extractMailLocally(source), at = (/* @__PURE__ */ new Date()).toISOString(), published = !extraction.issues.length;
  const record2 = { id: makeId(), source: { ...source, messageId: source.messageId.trim() }, extraction, fields: extraction.fields, status: published ? "published" : "pending", eventId: makeId(), importedAt: at, history: [{ at, actor: "本地规则识别演示", action: published ? "信息完整，自动发布" : "信息不完整，待核实", reason: extraction.issues.join("；"), before: null, after: extraction.fields }] };
  return store(state, record2);
}
function correctActivityMail(state, id, fields, reason) {
  adminOnly(state);
  const record2 = state.mailActivities?.find((m) => m.id === id);
  if (!record2 || !reason.trim()) throw new Error("请填写修正原因。");
  const clean = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim()]));
  const issues = validateMailFields(clean);
  if (issues.length) throw new Error(issues.join("；"));
  return store(state, { ...record2, fields: clean, status: record2.status === "hidden" ? "hidden" : "published", history: [...record2.history, { at: (/* @__PURE__ */ new Date()).toISOString(), actor: "管理员（本地演示）", action: record2.status === "pending" ? "核实修正后发布" : "修正活动信息", reason: reason.trim(), before: record2.fields, after: clean }] });
}
function setMailActivityVisibility(state, id, publish, reason) {
  adminOnly(state);
  const record2 = state.mailActivities?.find((m) => m.id === id);
  if (!record2 || record2.status === "pending" || !reason.trim()) throw new Error("请先完成信息核实，并填写下架或恢复原因。");
  if (publish && validateMailFields(record2.fields).length) throw new Error("活动信息未完整，不能恢复。");
  if (record2.status === "published" === publish) return state;
  return store(state, { ...record2, status: publish ? "published" : "hidden", history: [...record2.history, { at: (/* @__PURE__ */ new Date()).toISOString(), actor: "管理员（本地演示）", action: publish ? "重新核对并恢复展示" : "下架活动", reason: reason.trim(), before: record2.fields, after: record2.fields }] });
}
const aliases = {
  title: ["活动名称", "活动主题", "主题", "标题"],
  description: ["活动介绍", "活动内容", "内容简介"],
  startAt: ["活动开始时间", "开始时间"],
  endAt: ["活动结束时间", "结束时间"],
  location: ["活动地点", "举办地点", "地点", "会场"],
  host: ["主办方", "主办单位", "主办"],
  conditions: ["参与条件", "参与对象", "面向对象"]
};
const dateTime = /(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})日?\s*(?:[（(][^）)]{0,8}[）)]\s*)?(\d{1,2}):(\d{2})/;
const pad = (value) => value.padStart(2, "0");
function point(value) {
  const match2 = dateTime.exec(value);
  if (!match2) return "";
  return normalizeMailTime(`${match2[1]}-${pad(match2[2])}-${pad(match2[3])} ${pad(match2[4])}:${match2[5]}`);
}
function extractActivityScreenshot(text2) {
  const lines = text2.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fields = { title: "", description: "", startAt: "", endAt: "", location: "", host: "", conditions: "" };
  const evidence = {};
  for (const key of Object.keys(aliases)) {
    const match2 = lines.find((line) => aliases[key].some((label) => new RegExp(`^${label}\\s*[:：]`).test(line)));
    if (!match2) continue;
    fields[key] = match2.replace(/^[^:：]+[:：]\s*/, "").trim();
    evidence[key] = match2;
  }
  if (!fields.title) {
    const first = lines.find((line) => line.length <= 80 && !/[:：]|\d{4}[年/.-]\d/.test(line));
    if (first) {
      fields.title = first;
      evidence.title = first;
    }
  }
  if (!fields.description) {
    fields.description = lines.join("\n").slice(0, 5e3);
    if (fields.description) evidence.description = "识别文字全文，待管理员核对";
  }
  fields.startAt = point(fields.startAt);
  fields.endAt = point(fields.endAt);
  if (!fields.startAt || !fields.endAt) {
    const line = lines.find((item) => dateTime.test(item));
    if (line) {
      const start = point(line);
      if (!fields.startAt && start) {
        fields.startAt = start;
        evidence.startAt = line;
      }
      if (!fields.endAt && start) {
        const rest = line.slice((dateTime.exec(line)?.index ?? 0) + (dateTime.exec(line)?.[0].length ?? 0));
        const endTime = /^[\s]*(?:至|到|－|—|–|~|～|-)[\s]*(\d{1,2}):(\d{2})/.exec(rest);
        if (endTime) {
          fields.endAt = normalizeMailTime(`${start.slice(0, 10)} ${pad(endTime[1])}:${endTime[2]}`);
          evidence.endAt = line;
        }
      }
    }
  }
  return { fields, evidence, issues: validateMailFields(fields), adapter: "screenshot-ocr" };
}
function* activityPolicy(repo, actor, action, input) {
  const certified = function* () {
    return (yield* effect(repo.all("certification"))).some(
      (c) => c.ownerId === actor.id && c.data.kind === "club" && c.data.status === "approved"
    );
  };
  if (action === "activity.create") {
    student(actor);
    demand$1(yield* certified(), "仅已认证的学生社团成员可以发起活动。", 403);
    const startAt = textField(input, "startAt", 40);
    demand$1(
      Number.isFinite(Date.parse(startAt)) && Date.parse(startAt) > Date.now(),
      "活动开始时间须为未来有效时间。"
    );
    return yield* effect(repo.create("activity", actor.id, {
      title: textField(input, "title", 80),
      description: textField(input, "description", 5e3),
      startAt,
      location: textField(input, "location", 120),
      capacity: integerField(input, "capacity"),
      host: actor.name,
      status: "published",
      source: "member"
    }));
  }
  if (action === "activity.visibility") {
    student(actor);
    const event = yield* effect(repo.get(input.id, "activity"));
    owner(actor, event);
    demand$1(event.data.source === "member", "不能处理学校邮件活动。");
    if (input.publish === true)
      demand$1(yield* certified(), "当前身份没有恢复活动的资格。", 403);
    return yield* effect(repo.save(event, {
      status: input.publish === true ? "published" : "draft"
    }));
  }
  if (action === "screenshot.import") {
    operator(actor);
    const image = textField(input, "image", 7e6);
    const match2 = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    demand$1(match2, "请上传有效的 PNG 或 JPG 活动截图。");
    const bytes = Buffer.from(match2[2], "base64");
    demand$1(bytes.length > 0 && bytes.length <= 5 * 1024 * 1024, "活动截图不能超过 5 MB。");
    demand$1(match2[1] === "png" ? bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) : bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex")), "活动截图格式无效。");
    const screenshotHash = createHash("sha256").update(bytes).digest("hex");
    const previous = (yield* effect(repo.all("mail"))).find((item) => item.data.screenshotHash === screenshotHash);
    if (previous) return previous;
    const recognizedText = textField(input, "recognizedText", 2e4);
    const extraction = extractActivityScreenshot(recognizedText);
    const source = { messageId: `screenshot:${screenshotHash}`, subject: extraction.fields.title || "活动截图", sender: "管理员上传截图", body: recognizedText };
    const state2 = { ...initialV2State, role: "admin", localEvents: [], mailActivities: [] };
    const imported = importActivityMail(state2, source);
    const record22 = imported.mailActivities[0];
    record22.fields = extraction.fields;
    record22.extraction = extraction;
    record22.status = "pending";
    record22.history[0] = { ...record22.history[0], actor: actor.id, action: "截图识别待核实", reason: extraction.issues.join("；") || "截图须由管理员核对后发布", after: extraction.fields };
    return yield* effect(repo.create("mail", actor.id, {
      record: record22,
      purpose: "screenshot",
      screenshot: image,
      screenshotHash,
      ocrRequestId: typeof input.ocrRequestId === "string" ? input.ocrRequestId.slice(0, 100) : ""
    }));
  }
  if (!action.startsWith("mail.")) return void 0;
  operator(actor);
  if (action === "mail.split" || action === "mail.revise") {
    const source = yield* effect(repo.get(input.id, "mail"));
    const original = source.data.record;
    demand$1(input.confirmed === true, "请确认已核对原邮件及活动信息。");
    demand$1(input.expectedVersion === source.version, "邮件已变化，请重新核对。", 409);
    demand$1(
      original.status === "pending" && !source.data.resolvedAs && !source.data.parentMailId,
      "仅未处理的待核实原邮件可以拆分或关联更正。",
      409
    );
    const reason = textField(input, "reason", 1e3);
    if (action === "mail.split") {
      demand$1(source.data.purpose !== "revision", "更正邮件请关联原活动，不能另行发布。", 409);
      demand$1(
        Array.isArray(input.activities) && input.activities.length >= 2 && input.activities.length <= 50,
        "请核对并提供 2–50 场活动。"
      );
      const children = [];
      for (const fields of input.activities) {
        demand$1(fields && typeof fields === "object" && !Array.isArray(fields), "活动信息格式无效。");
        const record22 = { ...original, id: randomUUID(), eventId: randomUUID(), history: [...original.history] };
        const child = yield* effect(repo.create("mail", actor.id, { record: record22, parentMailId: source.id, purpose: source.data.purpose === "screenshot" ? "screenshot" : "activity" }));
        yield* activityPolicy(repo, actor, "mail.correct", { ...fields, id: child.id, reason });
        children.push(child.id);
      }
      return yield* effect(repo.save(source, { resolvedAs: "split", childMailIds: children, resolutionReason: reason, resolvedBy: actor.id }));
    }
    demand$1(source.data.purpose !== "screenshot", "活动截图不能作为更正邮件。");
    const target = yield* effect(repo.get(input.targetMailId, "mail"));
    demand$1(target.id !== source.id && !target.data.resolvedAs, "请选择原活动对应的邮件。");
    demand$1(input.targetVersion === target.version, "原活动已变化，请重新核对。", 409);
    const targetRecord = target.data.record;
    demand$1(targetRecord.status !== "pending", "原活动须已核实发布或下架。");
    yield* activityPolicy(repo, actor, "mail.correct", { ...input, id: target.id, reason });
    yield* effect(repo.create("mailRevision", actor.id, {
      sourceMailId: source.id,
      targetMailId: target.id,
      sourceVersion: source.version,
      targetVersion: target.version,
      resultingVersion: (yield* effect(repo.get(target.id))).version,
      reason
    }));
    return yield* effect(repo.save(source, { resolvedAs: "revision", targetMailId: target.id, resolutionReason: reason, resolvedBy: actor.id }));
  }
  const records = (yield* effect(repo.all("mail"))).map((e) => e.data.record);
  const state = {
    ...initialV2State,
    role: "admin",
    localEvents: [],
    mailActivities: records
  };
  let next = state;
  if (action === "mail.import") {
    const source = {
      messageId: textField(input, "messageId", 255),
      subject: textField(input, "subject", 500),
      sender: textField(input, "sender", 255),
      body: textField(input, "body", 5e4),
      ...input.cover ? {
        cover: {
          name: textField(input, "coverName", 255),
          data: textField(input, "cover", 15e5)
        }
      } : {}
    };
    const duplicate = (yield* effect(repo.all("mail"))).filter((e) => !e.data.parentMailId).map((e) => e.data.record).find(
      (r) => r.source.messageId === source.messageId || r.source.subject.trim() === source.subject && r.source.body.trim() === source.body
    );
    if (duplicate) {
      demand$1(
        duplicate.source.subject.trim() === source.subject && duplicate.source.body.trim() === source.body,
        "同一邮件标识的内容已变化，请核实修订关系，原活动未覆盖。",
        409
      );
      demand$1(
        JSON.stringify(duplicate.source.cover ?? null) === JSON.stringify(source.cover ?? null),
        "附件发生变化，修订关联规则待确认，请核实原记录。",
        409
      );
      return (yield* effect(repo.all("mail"))).find(
        (e) => e.data.record.id === duplicate.id
      );
    }
    next = importActivityMail(state, source);
    next.mailActivities[0].history[0].actor = actor.id;
    if (input.revision === true) {
      const record22 = next.mailActivities[0];
      record22.status = "pending";
      record22.extraction.issues.push("更正邮件：等待管理员关联原活动并核对");
      record22.history[0].action = "更正邮件待核实";
      record22.history[0].reason = "管理员选择作为更正邮件导入";
      next.localEvents = [];
    }
  } else {
    const stored2 = yield* effect(repo.get(input.id, "mail")), record22 = stored2.data.record;
    demand$1(!stored2.data.resolvedAs, "该原邮件已完成拆分或关联，请操作对应活动。", 409);
    if (action === "mail.cover") {
      const cover = textField(input, "cover", 15e5), reason = textField(input, "reason", 1e3);
      demand$1(
        /^data:image\/(png|jpeg|webp);base64,/.test(cover),
        "封面须为 JPG、PNG 或 WebP。"
      );
      const changed = {
        ...record22,
        source: {
          ...record22.source,
          cover: { name: textField(input, "coverName", 255), data: cover }
        },
        history: [
          ...record22.history,
          {
            at: (/* @__PURE__ */ new Date()).toISOString(),
            actor: actor.id,
            action: "替换活动附件封面",
            reason,
            before: record22.fields,
            after: record22.fields
          }
        ]
      };
      const event = (yield* effect(repo.all("activity"))).find((e) => e.data.mailId === stored2.id);
      if (event) yield* effect(repo.save(event, { image: cover }));
      return yield* effect(repo.save(stored2, { record: changed }));
    } else if (action === "mail.correct") {
      demand$1(stored2.data.purpose !== "revision", "更正邮件请关联原活动，不能另行发布。", 409);
      const fields = Object.fromEntries(
        Object.keys(mailFieldLabels).map((key) => [
          key,
          textField(
            input,
            key,
            key === "description" ? 5e3 : 500,
            key === "host" || key === "conditions"
          )
        ])
      );
      fields.startAt = normalizeMailTime(fields.startAt);
      fields.endAt = normalizeMailTime(fields.endAt);
      next = correctActivityMail(
        state,
        record22.id,
        fields,
        textField(input, "reason", 1e3)
      );
    } else if (action === "mail.visibility") {
      next = setMailActivityVisibility(
        state,
        record22.id,
        input.publish === true,
        textField(input, "reason", 1e3)
      );
      if (next === state) return stored2;
    } else return void 0;
  }
  const record2 = next.mailActivities[0];
  record2.history = record2.history.map(
    (h) => h.actor.startsWith("管理员") ? { ...h, actor: actor.id } : h
  );
  let stored = (yield* effect(repo.all("mail"))).find(
    (e) => e.data.record.id === record2.id
  );
  stored = stored ? yield* effect(repo.save(stored, { record: record2 })) : yield* effect(repo.create("mail", actor.id, { record: record2, purpose: input.revision === true ? "revision" : "activity" }));
  const projected = next.localEvents.find((e) => e.id === record2.eventId);
  if (projected) {
    const old = (yield* effect(repo.all("activity"))).find((e) => e.data.mailId === stored.id);
    const data = { ...projected, image: projected.image || "/activity-default-cover.svg", source: stored.data.purpose === "screenshot" ? "screenshot" : "mail", mailId: stored.id };
    if (old) {
      yield* effect(repo.save(old, data));
      if (action === "mail.correct" && old.data.status === "published" && (Date.parse(String(old.data.startAt)) !== Date.parse(data.startAt) || Date.parse(String(old.data.endAt)) !== Date.parse(data.endAt) || old.data.location !== data.location)) {
        const recipients = yield* effect(repo.activitySubscribers(old.id));
        yield* effect(repo.notify(
          recipients,
          old.id,
          "activity.changed",
          `活动“${data.title}”的时间或地点已更新，请查看最新安排。`
        ));
      }
    } else yield* effect(repo.create("activity", null, data));
  }
  return stored;
}
function activityCommand(repo, actor, action, input) {
  return runSync(activityPolicy(repo, actor, action, input));
}
function version(entity, input) {
  demand$1(input.version === entity.version, "记录已变化，请刷新后重试。", 409);
}
const accountPermissions = ["ACCOUNTS"];
function administratorAccess(repo, actor) {
  const identity = repo.all("companionIdentity").find(
    (i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified"
  );
  const valid = !!identity && actor.status !== "banned";
  const superAdmin = valid && actor.roles.includes("superadmin");
  return {
    superAdmin,
    permissions: valid ? accountPermissions.filter(
      (p) => superAdmin || strings(identity.data.permissions).includes(p)
    ) : []
  };
}
function requireAccountPermission(repo, actor, permission) {
  demand$1(
    administratorAccess(repo, actor).permissions.includes(permission),
    "没有该账号管理权限。",
    403
  );
}
function requireSuperAdmin(repo, actor) {
  demand$1(
    administratorAccess(repo, actor).superAdmin,
    "仅总管理员可执行此治理操作。",
    403
  );
}
function requiresPasswordChange(repo, actor) {
  return passwordChangeRequired(repo.all("companionIdentity"), actor);
}
function passwordChangeRequired(identities, actor) {
  return identities.some(
    (i) => i.ownerId === actor.id && i.data.status === "verified" && ["teacher", "admin"].includes(String(i.data.role)) && i.data.mustChangePassword === true
  );
}
function accountSecurityGate(repo, actor) {
  if (requiresPasswordChange(repo, actor))
    throw new ServiceError(
      403,
      "PASSWORD_CHANGE_REQUIRED",
      "请先修改本人初始密码，再继续操作。"
    );
}
async function sendVerification(db, email, localOutbox, origin = "local") {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand$1(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const local = issueCode(db, email, origin);
  if (!endpoint) return local;
  const message = db.prepare(
    "SELECT * FROM mail_outbox WHERE recipient=? ORDER BY created_at DESC LIMIT 1"
  ).get(String(email).trim().toLowerCase());
  return deliverOutbox(db, String(message.id), localOutbox);
}
async function deliverOutbox(db, id, localOutbox) {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand$1(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const message = db.prepare("SELECT * FROM mail_outbox WHERE id=?").get(id);
  demand$1(message, "邮件任务已失效。", 409);
  if (!endpoint)
    return {
      sent: true,
      delivery: "local-outbox",
      message: "验证码已写入本地开发收件箱，未发送至真实邮箱。"
    };
  await deliverMessage({ id: message.id, recipient: message.recipient, subject: message.subject, body: message.body }, endpoint);
  db.prepare("UPDATE mail_outbox SET delivered_at=? WHERE id=?").run(
    timestamp(),
    message.id
  );
  return {
    sent: true,
    delivery: "email",
    message: "验证码已发送，请查看邮箱。"
  };
}
async function deliverMessage(message, endpoint) {
  if (process.env.BNBU_EMAIL_PROVIDER === "aoksend") {
    await deliverAokSend(message, endpoint);
    return;
  }
  const result2 = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...process.env.BNBU_EMAIL_DELIVERY_TOKEN ? { Authorization: `Bearer ${process.env.BNBU_EMAIL_DELIVERY_TOKEN}` } : {}
    },
    body: JSON.stringify({
      to: message.recipient,
      subject: message.subject,
      text: message.body,
      idempotencyKey: message.id
    }),
    signal: AbortSignal.timeout(15e3)
  }).catch(() => {
    throw new ServiceError(
      502,
      "EMAIL_DELIVERY_UNCONFIRMED",
      "邮件服务未确认发送，请稍后重试。"
    );
  });
  const receipt = await result2.json().catch(() => null);
  demand$1(
    result2.ok && receipt?.sent === true,
    "邮件服务未确认发送，请稍后重试。",
    502
  );
}
async function deliverAokSend(message, endpoint) {
  demand$1(endpoint === "https://apiv2.aoksend.com/index/api/send_email", "邮件服务地址配置无效。", 503);
  const key = process.env.BNBU_AOKSEND_APP_KEY;
  const template = process.env.BNBU_AOKSEND_TEMPLATE_ID;
  const variable = process.env.BNBU_AOKSEND_CODE_VARIABLE;
  demand$1(key && template && variable && /^[A-Za-z_][A-Za-z0-9_]*$/.test(variable), "尚未完整配置验证码邮件服务。", 503);
  const codes = String(message.body).match(/(?<!\d)\d{6}(?!\d)/g);
  demand$1(codes?.length === 1, "验证码邮件内容无效。", 500);
  const form = new URLSearchParams({ app_key: key, template_id: template, to: String(message.recipient), data: JSON.stringify({ [variable]: codes[0], minutes: "10" }) });
  const result2 = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(15e3)
  }).catch(() => {
    throw new ServiceError(502, "EMAIL_DELIVERY_UNCONFIRMED", "邮件服务未确认发送，请稍后重试。");
  });
  const receipt = await result2.json().catch(() => null);
  demand$1(result2.ok && receipt?.code === 200, "邮件服务未确认发送，请稍后重试。", 502);
}
const emptyEngagement = { allViews: /* @__PURE__ */ new Map(), recentViews: /* @__PURE__ */ new Map(), recentLikes: /* @__PURE__ */ new Map() };
function hotLists(posts, comments, engagement, now = Date.now()) {
  const publicPosts = posts.filter((post) => post.kind === "post" && post.data.status === "visible");
  const eligiblePostCount = publicPosts.length;
  const byBoard = {};
  if (eligiblePostCount <= 75) return { eligiblePostCount, overall: [], byBoard };
  const cutoff = now - 7 * 24 * 60 * 60 * 1e3;
  const recentComments = /* @__PURE__ */ new Map();
  for (const comment of comments) {
    if (comment.kind !== "comment" || comment.data.status !== "visible" || Date.parse(comment.createdAt) < cutoff) continue;
    const postId = String(comment.data.postId ?? "");
    recentComments.set(postId, (recentComments.get(postId) ?? 0) + 1);
  }
  const ranked = publicPosts.map((post) => {
    const views = engagement.recentViews.get(post.id) ?? 0;
    const likes = engagement.recentLikes.get(post.id) ?? 0;
    const comments2 = recentComments.get(post.id) ?? 0;
    return { id: post.id, board: String(post.data.board ?? ""), createdAt: post.createdAt, views, likes, comments: comments2, score: views + 5 * likes + 10 * comments2 };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || b.comments - a.comments || b.likes - a.likes || b.views - a.views || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  for (const item of ranked) {
    const board = byBoard[item.board] ??= [];
    if (board.length < 10) board.push(item.id);
  }
  return { eligiblePostCount, overall: ranked.slice(0, 10).map((item) => item.id), byBoard };
}
function projectCommunity(workspace, likes, engagement = emptyEngagement, facts) {
  const account2 = workspace.account;
  const content = workspace.entities.filter(
    (entity) => entity.kind === "post" || entity.kind === "comment"
  );
  const person = (id) => workspace.people.find((item) => item.id === id);
  const name = (id) => {
    const author = person(id);
    return author?.nickname || author?.name || "已注销用户";
  };
  const visible = content.filter(
    (entity) => entity.kind === "post" && (entity.data.status === "visible" || entity.ownerId === account2.id && entity.data.status === "pending")
  );
  const posts = visible.map((post) => ({
    id: post.id,
    version: post.version,
    editedAt: post.data.editedAt,
    saves: facts?.saves.get(post.id) ?? 0,
    commentCount: facts?.comments.get(post.id) ?? 0,
    ownerId: post.ownerId,
    alumniId: typeof post.data.alumniId === "string" ? post.data.alumniId : void 0,
    title: String(post.data.title),
    body: String(post.data.body),
    board: String(post.data.board),
    images: Array.isArray(post.data.images) ? post.data.images : [],
    author: name(post.ownerId),
    authorAvatar: person(post.ownerId)?.avatar ?? "",
    date: post.createdAt,
    status: post.data.status,
    likes: likes.get(post.id) ?? 0,
    ...post.ownerId === account2.id ? { viewCount: engagement.allViews.get(post.id) ?? 0 } : {},
    comments: content.filter(
      (comment) => comment.kind === "comment" && comment.data.postId === post.id && (comment.data.status === "visible" || comment.ownerId === account2.id && comment.data.status === "pending")
    ).map((comment) => ({
      id: comment.id,
      parentId: comment.data.parentId,
      replyToId: comment.data.replyToId,
      replyToAuthor: content.some((c) => c.id === comment.data.replyToId && c.data.status === "visible") ? name(content.find((c) => c.id === comment.data.replyToId).ownerId) : void 0,
      likes: facts?.commentLikes.get(comment.id) ?? 0,
      liked: workspace.relations.some((r) => r.entityId === comment.id && r.kind === "commentlike"),
      ownerId: comment.ownerId,
      author: name(comment.ownerId),
      authorAvatar: person(comment.ownerId)?.avatar ?? "",
      body: String(comment.data.body),
      date: comment.createdAt,
      status: comment.data.status
    }))
  }));
  const ids = new Set(posts.map((post) => post.id));
  const relations = workspace.relations;
  return {
    account: { id: account2.id, name: account2.name, nickname: person(account2.id)?.nickname, avatar: person(account2.id)?.avatar },
    alumniProfiles: workspace.alumni.profiles.filter((p) => p.status === "approved").map((p) => ({ id: p.id, name: p.name })),
    posts,
    likedPosts: relations.filter((row) => row.kind === "like" && ids.has(row.entityId)).map((row) => row.entityId),
    savedPosts: relations.filter((row) => row.kind === "save" && ids.has(row.entityId)).map((row) => row.entityId),
    hotLists: hotLists(content.filter((entity) => entity.kind === "post"), content.filter((entity) => entity.kind === "comment"), engagement),
    features: { postViews: true }
  };
}
function rankDiscoverHot(candidates, engagement) {
  const publicPostCount = candidates.filter((item) => item.kind === "post" && item.status === "visible").length;
  const ranked = candidates.filter((item) => item.kind === "activity" ? item.status === "published" : item.status === "visible" && publicPostCount > 75).map((item) => {
    const views = item.kind === "post" ? engagement.views.get(item.id) ?? 0 : 0;
    const likes = engagement.likes.get(item.id) ?? 0;
    const comments = item.kind === "post" ? engagement.comments.get(item.id) ?? 0 : engagement.participates.get(item.id) ?? 0;
    const saves = item.kind === "activity" ? engagement.saves.get(item.id) ?? 0 : 0;
    return { ...item, views, likes: likes + saves, comments, score: views + 5 * (likes + saves) + 10 * comments };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || b.comments - a.comments || b.likes - a.likes || b.views - a.views || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  return { publicPostCount, items: ranked.slice(0, 10).map(({ id, kind, title, subtitle }) => ({ id, kind, title, subtitle })) };
}
const emptyPartnerFilters = { type: "all", query: "", location: "", departureLocation: "", destinationLocation: "", timeFrom: "", timeTo: "", activityType: "", gpaMin: "", gpaMax: "", sportType: "", locationScope: "", extraCost: "", genderPreference: "" };
const match = (value, query) => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
const timeValue = (value) => value ? Date.parse(value) : NaN;
function filterPartnerRooms(rooms, filters) {
  return rooms.filter((room) => {
    if (room.status !== "open" || filters.type !== "all" && room.type !== filters.type) return false;
    const details = room.details;
    if (filters.query && !match([room.title, room.body, room.place].join(" "), filters.query)) return false;
    if (filters.location && !match([room.place, details.departurePlace, details.destinationPlace, details.departureAddress, details.destinationAddress, details.placeAddress].filter(Boolean).join(" "), filters.location)) return false;
    if (filters.departureLocation && (room.type !== "carpool" || !match([details.departurePlace, details.departureAddress].filter(Boolean).join(" "), filters.departureLocation))) return false;
    if (filters.destinationLocation && (room.type !== "carpool" || !match([details.destinationPlace, details.destinationAddress].filter(Boolean).join(" "), filters.destinationLocation))) return false;
    if (filters.timeFrom || filters.timeTo) {
      const actual = timeValue(details.startsAt);
      if (!Number.isFinite(actual)) return false;
      if (filters.timeFrom && actual < timeValue(filters.timeFrom)) return false;
      if (filters.timeTo && actual > timeValue(filters.timeTo)) return false;
    }
    if (filters.activityType && (room.type !== "entertainment" || details.activityType !== filters.activityType)) return false;
    if (filters.gpaMin || filters.gpaMax) {
      if (room.type !== "study" || details.gpaMin === void 0 || details.gpaMax === void 0) return false;
      if (filters.gpaMin && details.gpaMax < Number(filters.gpaMin)) return false;
      if (filters.gpaMax && details.gpaMin > Number(filters.gpaMax)) return false;
    }
    if (filters.sportType && (room.type !== "sport" || details.sportType !== filters.sportType)) return false;
    if (filters.locationScope && (room.type !== "sport" || details.locationScope !== filters.locationScope)) return false;
    if (filters.extraCost && (room.type !== "sport" || details.extraCost !== (filters.extraCost === "yes"))) return false;
    if (filters.genderPreference && (room.type !== "sport" || details.genderPreference !== filters.genderPreference)) return false;
    return true;
  });
}
const pageSize = 24;
function options(params) {
  const filters = { ...emptyPartnerFilters };
  const multiple = /* @__PURE__ */ new Map();
  for (const key of Object.keys(filters)) {
    const values = params.getAll(key);
    if (!values.length) continue;
    demand$1(values.length <= 10 && values.every((value) => value.length <= 120), "筛选条件过长。");
    for (const value of values) validateFilter(key, value);
    if (values.length > 1) {
      multiple.set(key, [...new Set(values)]);
      filters[key] = key === "type" ? "all" : "";
    } else filters[key] = values[0];
  }
  if (filters.gpaMin && filters.gpaMax) demand$1(Number(filters.gpaMin) <= Number(filters.gpaMax), "绩点区间无效。");
  let cursor = null;
  const raw = params.get("cursor");
  if (raw) {
    demand$1(raw.length <= 250, "翻页标识无效。");
    try {
      const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
      demand$1(typeof parsed.createdAt === "string" && Number.isFinite(Date.parse(parsed.createdAt)) && typeof parsed.id === "string" && /^[a-zA-Z0-9-]{8,100}$/.test(parsed.id), "翻页标识无效。");
      cursor = { createdAt: parsed.createdAt, id: parsed.id };
    } catch {
      demand$1(false, "翻页标识无效。");
    }
  }
  return { filters, multiple, cursor };
}
function validateFilter(key, value) {
  const enums = {
    type: ["all", "study", "entertainment", "carpool", "sport"],
    locationScope: ["", "campus", "outside"],
    extraCost: ["", "yes", "no"],
    genderPreference: ["", "any", "male", "female"]
  };
  if (enums[key]) demand$1(enums[key].includes(value), "筛选条件无效。");
  if ((key === "timeFrom" || key === "timeTo") && value) demand$1(Number.isFinite(Date.parse(value)), "时间筛选无效。");
  if ((key === "gpaMin" || key === "gpaMax") && value) demand$1(Number.isFinite(Number(value)) && Number(value) >= 0, "绩点筛选无效。");
}
function roomMatches(room, filters, multiple) {
  if (!filterPartnerRooms([room], filters).length) return false;
  for (const [key, values] of multiple) {
    if (!values.some((value) => filterPartnerRooms([room], { ...emptyPartnerFilters, [key]: value }).length)) return false;
  }
  return true;
}
function project(row, actor) {
  const data = JSON.parse(row.data);
  const members = Array.isArray(data.members) ? data.members.filter((id) => typeof id === "string") : [];
  const visibleMembers = row.owner_id === actor.id || members.includes(actor.id) ? members : [];
  return { createdAt: row.created_at, room: {
    id: row.id,
    owner: row.owner_id ?? "",
    type: data.type,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    time: String(data.time ?? ""),
    place: String(data.place ?? ""),
    capacity: Number(data.capacity),
    memberCount: members.length,
    members: visibleMembers,
    status: data.status,
    requests: [],
    details: data.details && typeof data.details === "object" ? data.details : {}
  } };
}
function result(matches, limit = pageSize) {
  const shown = matches.slice(0, limit);
  const tail = shown.at(-1);
  return { items: shown.map((item) => item.room), nextCursor: matches.length > limit && tail ? Buffer.from(JSON.stringify({ createdAt: tail.createdAt, id: tail.room.id })).toString("base64url") : null };
}
function searchRooms(db, actor, params) {
  const { filters, multiple, cursor } = options(params);
  let after = cursor, exhausted = false;
  const matches = [];
  const sql = `SELECT id,owner_id,data,created_at FROM entities WHERE kind='room'
    AND json_extract(data,'$.visibility')='visible' AND json_extract(data,'$.status')='open'
    AND (? IS NULL OR created_at < ? OR (created_at = ? AND id < ?))
    ORDER BY created_at DESC,id DESC LIMIT 100`;
  while (matches.length <= pageSize && !exhausted) {
    const rows = db.prepare(sql).all(after?.createdAt ?? null, after?.createdAt ?? null, after?.createdAt ?? null, after?.id ?? null);
    exhausted = rows.length < 100;
    for (const row of rows) {
      const item = project(row, actor);
      if (roomMatches(item.room, filters, multiple)) matches.push(item);
      if (matches.length > pageSize) break;
    }
    const last = rows.at(-1);
    if (last) after = { createdAt: last.created_at, id: last.id };
  }
  return result(matches);
}
function roomDetail(db, actor, id) {
  const row = db.prepare("SELECT id,owner_id,data,created_at FROM entities WHERE id=? AND kind='room' AND json_extract(data,'$.visibility')='visible' AND json_extract(data,'$.status')='open'").get(id);
  demand$1(row, "队伍不存在或当前不可查看。", 404);
  return project(row, actor).room;
}
async function searchPostgresRooms(db, actor, params) {
  const { filters, multiple, cursor } = options(params);
  let after = cursor, exhausted = false;
  const matches = [];
  const sql = `SELECT id,owner_id,data,created_at FROM entities WHERE kind='room'
    AND data::jsonb->>'visibility'='visible' AND data::jsonb->>'status'='open'
    AND ($1::text IS NULL OR created_at < $1 OR (created_at = $1 AND id < $2))
    ORDER BY created_at DESC,id DESC LIMIT 100`;
  while (matches.length <= pageSize && !exhausted) {
    const rows = (await db.pool.query(sql, [after?.createdAt ?? null, after?.id ?? null])).rows;
    exhausted = rows.length < 100;
    for (const row of rows) {
      const item = project(row, actor);
      if (roomMatches(item.room, filters, multiple)) matches.push(item);
      if (matches.length > pageSize) break;
    }
    const last = rows.at(-1);
    if (last) after = { createdAt: last.created_at, id: last.id };
  }
  return result(matches);
}
async function postgresRoomDetail(db, actor, id) {
  const { rows } = await db.pool.query("SELECT id,owner_id,data,created_at FROM entities WHERE id=$1 AND kind='room' AND data::jsonb->>'visibility'='visible' AND data::jsonb->>'status'='open'", [id]);
  demand$1(rows[0], "队伍不存在或当前不可查看。", 404);
  return project(rows[0], actor).room;
}
function accountDirectory(repo, actor, kind, input) {
  accountSecurityGate(repo, actor);
  requireAccountPermission(repo, actor, "ACCOUNTS");
  const accounts = repo.db.prepare("SELECT id,name,organization,status,email FROM accounts").all();
  return projectAccountDirectory(repo, accounts, kind, input);
}
function projectAccountDirectory(repo, accounts, kind, input) {
  demand$1(
    Object.keys(input).every(
      (k) => ["q", "status", "college", "cursor", "limit", "id"].includes(k)
    ),
    "只读账号查询参数无效。"
  );
  const q = textField(input, "q", 200, true).toLocaleLowerCase(), college = textField(input, "college", 200, true), status = textField(input, "status", 40, true), id = textField(input, "id", 100, true);
  demand$1(
    !status || (kind === "student" ? ["ACTIVE", "MUTED", "DISABLED"] : ["ACTIVE", "DISABLED", "RECOVERY_REQUIRED"]).includes(status),
    "账号筛选状态无效。"
  );
  const limit = input.limit === void 0 ? 20 : integerField({ limit: Number(input.limit) }, "limit", 1, 100);
  const fields = repo.all("companionIdentity").filter(
    (i) => i.data.role === kind && i.ownerId && i.data.status === "verified"
  ).flatMap((i) => {
    const row = accounts.find((a) => a.id === i.ownerId);
    if (!row) return [];
    return [
      {
        id: i.ownerId,
        identityId: i.id,
        name: String(row.name),
        studentNumber: kind === "student" ? String(i.data.studentNumber ?? "") : null,
        employeeId: kind === "teacher" ? String(i.data.employeeId ?? "") : null,
        organizationId: typeof i.data.organizationId === "string" ? i.data.organizationId : null,
        college: String(i.data.collegeName ?? i.data.college ?? row.organization ?? ""),
        department: String(i.data.department ?? ""),
        major: kind === "student" ? String(i.data.majorName ?? i.data.major ?? "") : null,
        administrativeClass: kind === "student" ? String(i.data.administrativeClassName ?? i.data.administrativeClass ?? "") : null,
        sex: kind === "student" && ["MALE", "FEMALE"].includes(String(i.data.sex)) ? String(i.data.sex) : null,
        year: kind === "student" && typeof i.data.year === "number" && Number.isInteger(i.data.year) ? i.data.year : null,
        title: kind === "teacher" ? String(i.data.title ?? "") : null,
        status: kind === "student" ? row.status === "banned" ? "DISABLED" : row.status === "muted" ? "MUTED" : "ACTIVE" : row.status === "banned" || i.data.accountState === "DISABLED" ? "DISABLED" : i.data.accountState === "RECOVERY_REQUIRED" ? "RECOVERY_REQUIRED" : "ACTIVE",
        verifiedEmail: i.data.schoolEmailVerified === true && i.data.schoolEmail === row.email ? String(row.email) : null,
        updatedAt: i.updatedAt,
        version: i.version
      }
    ];
  });
  const rows = fields.filter(
    (r) => (!id || r.id === id) && (!status || r.status === status) && (!college || r.college === college) && (!q || [
      r.name,
      r.studentNumber,
      r.employeeId,
      r.college,
      r.department,
      r.major,
      r.administrativeClass
    ].some(
      (v) => String(v ?? "").toLocaleLowerCase().includes(q)
    ))
  ).sort((a, b) => a.id.localeCompare(b.id));
  demand$1(
    new Set(rows.map((r) => r.id)).size === rows.length,
    "身份资料存在重复，请先核对，不能合并展示。",
    409
  );
  if (id) {
    demand$1(rows.length === 1, "当前账号不存在或身份资料需核对。", 404);
    return { items: rows, nextCursor: null, total: 1 };
  }
  const cursor = textField(input, "cursor", 100, true);
  const index = cursor ? rows.findIndex((r) => r.id === cursor) : -1;
  demand$1(!cursor || index >= 0, "分页基准已变化，请刷新列表。", 409);
  const items = rows.slice(index + 1, index + 1 + limit);
  return {
    items,
    nextCursor: index + 1 + limit < rows.length ? items.at(-1).id : null,
    total: rows.length
  };
}
async function recognize(request) {
  const endpoint = process.env.BNBU_TIMETABLE_UPSTREAM;
  demand$1(endpoint, "尚未配置真实课表识别服务。", 503);
  demand$1(/^https?:\/\//.test(endpoint), "课表服务配置无效。", 503);
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    demand$1(size <= 11 * 1024 * 1024, "课表照片不能超过 10MB。", 413);
    chunks.push(chunk);
  }
  const envelope = new Request("http://127.0.0.1/upload", {
    method: "POST",
    headers: { "Content-Type": request.headers["content-type"] ?? "" },
    body: new Blob([Uint8Array.from(Buffer.concat(chunks))])
  });
  const incoming = await envelope.formData(), file = incoming.get("image");
  demand$1(
    file instanceof File && file.size > 0 && file.size <= 10 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "请上传有效的 JPG、PNG 或 WebP 课表照片。"
  );
  const data = new FormData();
  data.append("image", file);
  const result2 = await fetch(endpoint, {
    method: "POST",
    body: data,
    headers: process.env.BNBU_TIMETABLE_TOKEN ? { Authorization: `Bearer ${process.env.BNBU_TIMETABLE_TOKEN}` } : {},
    signal: AbortSignal.timeout(5e4)
  }).catch(() => {
    throw new ServiceError(
      502,
      "RECOGNITION_UNAVAILABLE",
      "识别服务暂不可用，原课表保留。"
    );
  });
  demand$1(result2.ok, "识别失败，原课表保留。", 502);
  try {
    return { lessons: parseTimetableResponse(await result2.json()) };
  } catch {
    throw new ServiceError(502, "RECOGNITION_INVALID_RESPONSE", "识别服务返回的课表无效，原课表保留。");
  }
}
async function checkSchoolIdentity(actor) {
  demand$1(actor.status !== "banned", "账号已封禁。", 403);
  const endpoint = process.env.BNBU_IDENTITY_VERIFICATION_URL;
  demand$1(
    endpoint,
    "学校身份核验服务尚未配置；本地测试身份不代表学校核验。",
    503
  );
  const requestId = randomUUID();
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(1e4),
      headers: {
        "Content-Type": "application/json",
        ...process.env.BNBU_IDENTITY_VERIFICATION_TOKEN ? {
          Authorization: `Bearer ${process.env.BNBU_IDENTITY_VERIFICATION_TOKEN}`
        } : {}
      },
      body: JSON.stringify({
        requestId,
        accountId: actor.id,
        email: actor.email
      })
    });
  } catch {
    throw new ServiceError(
      502,
      "IDENTITY_UNAVAILABLE",
      "学校身份核验暂时不可用，请稍后重试。"
    );
  }
  const value = await response.json().catch(() => null);
  demand$1(
    response.ok && value && typeof value === "object" && typeof value.verified === "boolean" && value.requestId === requestId && value.email === actor.email && (!value.verified || typeof value.subject === "string" && value.subject.length > 0 && value.subject.length <= 200),
    "核验服务未返回与当前账号匹配的有效结果。",
    502
  );
  return {
    verified: value.verified,
    subject: value.verified ? value.subject : null,
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    authorizationChanged: false
  };
}
async function verifyStudentAtSchool(actor, candidate) {
  const endpoint = process.env.BNBU_IDENTITY_VERIFICATION_URL;
  if (!endpoint) return { verified: false, subject: null };
  const requestId = randomUUID();
  let response;
  try {
    response = await fetch(endpoint, { method: "POST", redirect: "error", signal: AbortSignal.timeout(1e4), headers: { "Content-Type": "application/json", ...process.env.BNBU_IDENTITY_VERIFICATION_TOKEN ? { Authorization: `Bearer ${process.env.BNBU_IDENTITY_VERIFICATION_TOKEN}` } : {} }, body: JSON.stringify({ requestId, accountId: actor.id, email: actor.email, studentNumber: candidate.studentNumber, schoolName: candidate.schoolName }) });
  } catch {
    return { verified: false, subject: null };
  }
  const value = await response.json().catch(() => null);
  if (!response.ok || !value || value.requestId !== requestId || value.email !== actor.email) return { verified: false, subject: null };
  return value.verified === true && value.currentEnrollment === true && value.studentNumber === candidate.studentNumber && value.schoolName === candidate.schoolName && typeof value.subject === "string" && value.subject.length > 0 && value.subject.length <= 200 ? { verified: true, subject: value.subject } : { verified: false, subject: null };
}
function studentIdentityCandidate(input) {
  const studentNumber2 = typeof input.studentNumber === "string" ? input.studentNumber.trim() : "";
  const schoolName = typeof input.schoolName === "string" ? input.schoolName.trim() : "";
  demand$1(/^[A-Za-z0-9]{5,30}$/.test(studentNumber2), "请填写完整学号。");
  demand$1(schoolName.length >= 2 && schoolName.length <= 80, "请填写学校登记姓名。");
  return { studentNumber: studentNumber2, schoolName };
}
function latest(repo, id) {
  return repo.all("studentIdentityRequest").find((item) => item.ownerId === id);
}
function verifiedEmail(repo, actor) {
  return repo.all("verifiedEmail").some((item) => item.ownerId === actor.id && item.data.email === actor.email);
}
function ensureNumberFree(repo, number, accountId) {
  demand$1(!repo.all("companionIdentity").some((item) => item.ownerId !== accountId && item.data.role === "student" && item.data.status === "verified" && item.data.studentNumber === number), "该学号已绑定其他账号，请联系审核员核查。", 409);
}
function grant(db, repo, request, reviewerId, source, evidenceId) {
  const accountId = request.ownerId;
  const number = String(request.data.studentNumber);
  ensureNumberFree(repo, number, accountId);
  const old = repo.all("companionIdentity").find((item) => item.ownerId === accountId && item.data.role === "student" && item.data.status === "verified");
  demand$1(!old || old.data.studentNumber === number, "已有不同学号的有效学生身份，请人工复核。", 409);
  if (!old) repo.create("companionIdentity", accountId, { role: "student", status: "verified", studentNumber: number, schoolName: request.data.schoolName, schoolEmail: request.data.email, source, evidenceId, verifiedBy: reviewerId, verifiedAt: timestamp() });
  const row = db.prepare("SELECT roles FROM accounts WHERE id=?").get(accountId);
  db.prepare("UPDATE accounts SET name=?,roles=? WHERE id=?").run(String(request.data.schoolName), JSON.stringify([.../* @__PURE__ */ new Set([...JSON.parse(row.roles), "student"])]), accountId);
  repo.notify([accountId], request.id, "student.identity.verified", "学生身份已核验，现可使用校园服务。");
}
function ownStudentIdentity(db, actor) {
  const repo = new Repository(db);
  const request = latest(repo, actor.id);
  return { status: request?.data.status ?? (actor.roles.includes("student") ? "verified" : "unrequested"), request: request ? { id: request.id, status: request.data.status, studentNumber: request.data.studentNumber, schoolName: request.data.schoolName, reason: request.data.reason, createdAt: request.createdAt, updatedAt: request.updatedAt } : null, schoolService: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "unconfigured" };
}
async function requestStudentIdentity(db, actor, input) {
  demand$1(actor.status === "active", "当前账号状态不能申请学生身份。", 403);
  const candidate = studentIdentityCandidate(input), repo = new Repository(db);
  demand$1(verifiedEmail(repo, actor), "请先验证本人当前邮箱。", 403);
  const previous = latest(repo, actor.id);
  demand$1(!previous || !["pending", "verified"].includes(String(previous.data.status)), "当前申请已在处理中或已核验。", 409);
  const school = await verifyStudentAtSchool(actor, candidate);
  return transaction(db, () => {
    const current = new Repository(db);
    demand$1(verifiedEmail(current, actor), "邮箱验证状态已变化，请重新申请。", 409);
    const newest = latest(current, actor.id);
    demand$1(!newest || !["pending", "verified"].includes(String(newest.data.status)), "当前申请已在处理中或已核验。", 409);
    const request = current.create("studentIdentityRequest", actor.id, { ...candidate, email: actor.email, status: "pending", reason: "等待校方核验结果或审核员核对正式证明。" });
    if (school.verified) {
      grant(db, current, request, "school-service", "school-service", school.subject);
      current.save(request, { status: "verified", reason: "校方在读身份核验通过。", source: "school-service", evidenceId: school.subject, reviewedAt: timestamp() });
    }
    db.prepare("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), actor.id, actor.roles.join(","), "student.identity.request", request.id, "", JSON.stringify({ schoolVerified: school.verified }), timestamp());
    return ownStudentIdentity(db, { ...actor, roles: school.verified ? [...actor.roles, "student"] : actor.roles });
  });
}
function listStudentIdentityRequests(db, actor, params) {
  demand$1(actor.roles.includes("reviewer") || actor.roles.includes("superadmin"), "需要审核职责。", 403);
  const status = params.get("status") ?? "pending", query = (params.get("query") ?? "").trim().toLowerCase();
  demand$1(["pending", "verified", "rejected", "revoked", "all"].includes(status), "状态筛选无效。");
  demand$1(query.length <= 100, "搜索条件过长。");
  const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1));
  const all = new Repository(db).all("studentIdentityRequest").filter((item) => (status === "all" || item.data.status === status) && (!query || [item.data.studentNumber, item.data.email, item.data.schoolName, item.data.status].some((value) => String(value ?? "").toLowerCase().includes(query))));
  return { items: all.slice((page - 1) * 50, page * 50).map((item) => ({ id: item.id, ownerId: item.ownerId, studentNumber: item.data.studentNumber, schoolName: item.data.schoolName, email: item.data.email, status: item.data.status, reason: item.data.reason, source: item.data.source, evidenceId: item.data.evidenceId, version: item.version, createdAt: item.createdAt, updatedAt: item.updatedAt })), total: all.length, page, hasMore: page * 50 < all.length };
}
function reviewStudentIdentity(db, actor, input) {
  demand$1(actor.roles.includes("reviewer") || actor.roles.includes("superadmin"), "需要审核职责。", 403);
  const id = typeof input.id === "string" ? input.id : "";
  const decision = input.decision;
  demand$1(["approve", "reject", "revoke"].includes(String(decision)), "处理决定无效。");
  demand$1(typeof input.version === "number" && Number.isInteger(input.version), "请刷新申请后重试。", 409);
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  const evidenceId = typeof input.evidenceId === "string" ? input.evidenceId.trim() : "";
  demand$1(reason.length > 0 && reason.length <= 500, "请填写处理原因。");
  if (decision === "approve") demand$1(evidenceId.length >= 4 && evidenceId.length <= 200, "请填写校方正式查询结果或可核验证明的依据标识。");
  if (decision === "revoke") demand$1(actor.roles.includes("superadmin"), "只有超级管理员可撤销学生身份。", 403);
  return transaction(db, () => {
    const repo = new Repository(db), request = repo.get(id, "studentIdentityRequest");
    demand$1(request.version === input.version, "申请已变化，请刷新后重试。", 409);
    demand$1(decision === "revoke" ? request.data.status === "verified" : request.data.status === "pending", "申请状态已变化。", 409);
    if (decision === "approve") grant(db, repo, request, actor.id, "manual-school-evidence", evidenceId);
    if (decision === "revoke") {
      for (const identity of repo.all("companionIdentity").filter((item) => item.ownerId === request.ownerId && item.data.role === "student" && item.data.status === "verified")) repo.save(identity, { status: "revoked", revokedBy: actor.id, revokedAt: timestamp(), revokeReason: reason });
      const account2 = db.prepare("SELECT roles FROM accounts WHERE id=?").get(request.ownerId);
      db.prepare("UPDATE accounts SET roles=? WHERE id=?").run(JSON.stringify(JSON.parse(account2.roles).filter((role) => role !== "student")), request.ownerId);
    }
    const status = decision === "approve" ? "verified" : decision === "reject" ? "rejected" : "revoked";
    const changed = repo.save(request, { status, reason, evidenceId: decision === "approve" ? evidenceId : request.data.evidenceId, source: decision === "approve" ? "manual-school-evidence" : request.data.source, reviewedBy: actor.id, reviewedAt: timestamp() });
    repo.notify([request.ownerId], request.id, "student.identity." + status, `学生身份${status === "verified" ? "核验通过" : status === "rejected" ? "申请已驳回" : "已撤销"}：${reason}`);
    db.prepare("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), actor.id, actor.roles.join(","), "student.identity." + decision, id, reason, JSON.stringify({ status, evidenceId: decision === "approve" ? evidenceId : void 0 }), timestamp());
    return { id: changed.id, status };
  });
}
const cookieToken = (request, name = "bnbu_session") => request.headers.cookie?.split(";").map((s) => s.trim()).find((s) => s.startsWith(name + "="))?.slice(name.length + 1);
function send(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(data));
}
async function body(request) {
  demand$1(
    request.headers["content-type"]?.startsWith("application/json"),
    "请求必须使用 JSON。",
    415
  );
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    demand$1(size <= 12 * 1024 * 1024, "请求过大。", 413);
    chunks.push(chunk);
  }
  let value;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ServiceError(400, "INVALID_JSON", "JSON 格式无效。");
  }
  demand$1(
    value && typeof value === "object" && !Array.isArray(value),
    "请求须为 JSON 对象。"
  );
  return value;
}
export {
  verifyOwnEmail as $,
  alumniCommand as A,
  relationshipHistory as B,
  filterCommunityCandidates as C,
  rankCommunity as D,
  communityHotForViewer as E,
  communitySocialRead as F,
  requireSocialAccess as G,
  readAlumni as H,
  communityCounts as I,
  projectCommunity as J,
  projectDisplayPeople as K,
  rankDiscoverHot as L,
  takeEmailSend as M,
  hashPassword as N,
  openDatabase as O,
  startActivityMailbox as P,
  cookieToken as Q,
  Repository as R,
  ServiceError as S,
  student as T,
  send as U,
  searchRooms as V,
  roomDetail as W,
  recognize as X,
  recognizeActivityScreenshot as Y,
  body as Z,
  sendVerification as _,
  digest as a,
  register as a0,
  loginUnified as a1,
  loginAdministrator as a2,
  login as a3,
  checkSchoolIdentity as a4,
  requestStudentIdentity as a5,
  reviewStudentIdentity as a6,
  ownStudentIdentity as a7,
  listStudentIdentityRequests as a8,
  accountDirectory as a9,
  searchStudents as aa,
  personHover as ab,
  studentEmail as ac,
  emailIdentityData as ad,
  emailIdentityReason as ae,
  account as af,
  deliverMessage as ag,
  passwordChangeRequired as ah,
  recordPostgresPostView as ai,
  runAsync as aj,
  communityPolicy as ak,
  coffeePolicy as al,
  governancePolicy as am,
  activityPolicy as an,
  alumniPolicy as ao,
  recordedStudentNumber as ap,
  projectRelationshipHistory as aq,
  validateStudentSearch as ar,
  studentSearchResult as as,
  projectPersonHover as at,
  studentIdentityCandidate as au,
  verifyStudentAtSchool as av,
  projectAccountDirectory as aw,
  searchPostgresRooms as ax,
  postgresRoomDetail as ay,
  deliverOutbox as b,
  textField as c,
  demand$1 as d,
  encodePassword as e,
  timestamp as f,
  accountSecurityGate as g,
  accountPermissions as h,
  has as i,
  requiresPasswordChange as j,
  authenticate as k,
  recordPostView as l,
  matchesPassword as m,
  normalizeEmail as n,
  runSync as o,
  projectWorkspace as p,
  notificationPolicy as q,
  requireSuperAdmin as r,
  studentNumber as s,
  transaction as t,
  relationPolicy as u,
  version as v,
  communityCommand as w,
  coffeeCommand as x,
  governanceCommand as y,
  activityCommand as z
};
