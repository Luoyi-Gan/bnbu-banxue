import {
  createHash,
  randomBytes,
  randomInt,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { transaction, type Database } from "./database";

export class ServiceError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function demand(
  condition: unknown,
  message: string,
  status = 400,
): asserts condition {
  if (!condition)
    throw new ServiceError(
      status,
      status === 403 ? "FORBIDDEN" : "INVALID_REQUEST",
      message,
    );
}
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const timestamp = () => new Date().toISOString();
export interface Account {
  id: string;
  email: string;
  name: string;
  organization: string;
  status: "active" | "muted" | "banned";
  roles: string[];
}
type AccountRow = Omit<Account, "roles"> & {
  roles: string;
  password_hash: string;
};
const account = (row: AccountRow): Account => ({
  id: row.id,
  email: row.email,
  name: row.name,
  organization: row.organization,
  status: row.status,
  roles: JSON.parse(row.roles),
});
export function normalizeEmail(value: unknown) {
  demand(typeof value === "string" && value.length <= 254, "请填写有效邮箱。");
  const email = value.trim().toLowerCase();
  demand(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "请填写有效邮箱。");
  return email;
}
export function hashPassword(value: unknown) {
  demand(
    typeof value === "string" && value.length >= 8 && value.length <= 128,
    "密码须为 8–128 个字符。",
  );
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
function matchesPassword(value: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAccount(
  db: Database,
  input: {
    email: string;
    password: string;
    name: string;
    roles?: string[];
    organization?: string;
  },
) {
  const email = normalizeEmail(input.email);
  const hash = hashPassword(input.password);
  demand(
    input.name.trim().length > 0 && input.name.trim().length <= 40,
    "姓名须为 1–40 字。",
  );
  const id = randomUUID();
  db.prepare(
    "INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at) VALUES(?,?,?,?,?,?,?)",
  ).run(
    id,
    email,
    hash,
    input.name.trim(),
    input.organization ?? "",
    JSON.stringify(input.roles ?? []),
    timestamp(),
  );
  return id;
}

export function issueCode(db: Database, rawEmail: unknown) {
  const email = normalizeEmail(rawEmail),
    now = Date.now();
  const previous = db
    .prepare("SELECT sent_at FROM email_challenges WHERE email=?")
    .get(email) as { sent_at: number } | undefined;
  demand(
    !previous || now - previous.sent_at >= 60_000,
    "请稍后再发送验证码。",
    429,
  );
  const code = String(randomInt(100000, 1000000)),
    id = randomUUID();
  transaction(db, () => {
    db.prepare(
      "INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES(?,?,?,0,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at",
    ).run(email, digest(`${email}:${code}`), now + 600_000, now);
    db.prepare(
      "INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)",
    ).run(
      id,
      email,
      "伴学注册验证码",
      `验证码：${code}，10 分钟内有效。`,
      timestamp(),
    );
  });
  return {
    sent: true,
    delivery: "local-outbox",
    message: "验证码已写入本地开发收件箱，未发送至真实邮箱。",
  };
}

export function register(
  db: Database,
  input: { email?: unknown; code?: unknown; password?: unknown },
) {
  const email = normalizeEmail(input.email);
  demand(typeof input.code === "string", "请填写验证码。");
  const challenge = db
    .prepare("SELECT * FROM email_challenges WHERE email=?")
    .get(email) as
    { code_hash: string; expires_at: number; attempts: number } | undefined;
  demand(
    challenge && challenge.expires_at > Date.now() && challenge.attempts < 5,
    "验证码已失效，请重新获取。",
  );
  db.prepare(
    "UPDATE email_challenges SET attempts=attempts+1 WHERE email=?",
  ).run(email);
  demand(
    digest(`${email}:${input.code}`) === challenge.code_hash,
    "验证码错误。",
  );
  demand(
    !db.prepare("SELECT id FROM accounts WHERE email=?").get(email),
    "该邮箱已注册。",
    409,
  );
  const passwordHash = hashPassword(input.password);
  transaction(db, () => {
    db.prepare(
      "INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES(?,?,?,?,?)",
    ).run(
      randomUUID(),
      email,
      passwordHash,
      email.split("@")[0].slice(0, 20),
      timestamp(),
    );
    db.prepare("DELETE FROM email_challenges WHERE email=?").run(email);
  });
  return { registered: true };
}

// Rate limiting is shared across sessions; failed logins never issue a cookie.
const failures = new Map<string, { count: number; until: number }>();
export function login(db: Database, rawEmail: unknown, rawPassword: unknown) {
  const email = normalizeEmail(rawEmail);
  demand(
    typeof rawPassword === "string" && rawPassword.length <= 128,
    "邮箱或密码错误。",
    401,
  );
  const previous = failures.get(email),
    now = Date.now();
  demand(
    !previous || previous.until < now || previous.count < 10,
    "登录尝试过多，请十五分钟后重试。",
    429,
  );
  const row = db.prepare("SELECT * FROM accounts WHERE email=?").get(email) as
    AccountRow | undefined;
  const fallback = "00000000000000000000000000000000:" + "00".repeat(64);
  const valid = matchesPassword(rawPassword, row?.password_hash ?? fallback);
  if (!row || !valid) {
    failures.set(email, {
      count: previous && previous.until > now ? previous.count + 1 : 1,
      until: now + 900_000,
    });
    throw new ServiceError(401, "INVALID_CREDENTIALS", "邮箱或密码错误。");
  }
  failures.delete(email);
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions VALUES(?,?,?,?)").run(
    digest(token),
    row.id,
    now + 43_200_000,
    timestamp(),
  );
  return { token, account: account(row) };
}
export function authenticate(db: Database, token: string | undefined) {
  if (!token) throw new ServiceError(401, "UNAUTHENTICATED", "请先登录。");
  const row = db
    .prepare(
      "SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?",
    )
    .get(digest(token), Date.now()) as AccountRow | undefined;
  if (!row)
    throw new ServiceError(401, "UNAUTHENTICATED", "登录已过期，请重新登录。");
  return account(row);
}
