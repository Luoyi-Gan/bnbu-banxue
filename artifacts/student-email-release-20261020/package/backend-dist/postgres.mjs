import { P as PostgresDatabase, p as postgresMigrations } from "./postgres-schema-C1S6kA9K.js";
import { createServer } from "node:http";
import { randomUUID, createHash, randomBytes, randomInt } from "node:crypto";
import { d as demand, f as timestamp, ac as studentEmail, ad as emailIdentityData, ae as emailIdentityReason, n as normalizeEmail, a as digest, m as matchesPassword, S as ServiceError, af as account, ag as deliverMessage, N as hashPassword, v as version, e as encodePassword, ah as passwordChangeRequired, h as accountPermissions, c as textField, ai as recordPostgresPostView, aj as runAsync, q as notificationPolicy, u as relationPolicy, ak as communityPolicy, al as coffeePolicy, am as governancePolicy, an as activityPolicy, ao as alumniPolicy, C as filterCommunityCandidates, D as rankCommunity, E as communityHotForViewer, F as communitySocialRead, G as requireSocialAccess, K as projectDisplayPeople, I as communityCounts, J as projectCommunity, L as rankDiscoverHot, ap as recordedStudentNumber, p as projectWorkspace, aq as projectRelationshipHistory, ar as validateStudentSearch, as as studentSearchResult, at as projectPersonHover, au as studentIdentityCandidate, av as verifyStudentAtSchool, aw as projectAccountDirectory, T as student, U as send, ax as searchPostgresRooms, ay as postgresRoomDetail, X as recognize, Y as recognizeActivityScreenshot, Z as body, a4 as checkSchoolIdentity, Q as cookieToken, P as startActivityMailbox } from "./http-D5d3Bq8l.js";
import COS from "cos-nodejs-sdk-v5";
import { mkdir, writeFile, link, unlink, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const objectKey = (bytes) => createHash("sha256").update(bytes).digest("hex");
function validateObjectKey(key) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("Invalid object key");
  return key;
}
class LocalObjectStore {
  constructor(directory) {
    this.root = resolve(directory);
  }
  async put(bytes, contentType) {
    if (!contentType) throw new Error("Content type is required");
    const key = objectKey(bytes), path = join(this.root, key);
    await mkdir(this.root, { recursive: true });
    const temporary = join(this.root, `${key}.${randomUUID()}.tmp`);
    await writeFile(temporary, bytes, { flag: "wx", mode: 384 });
    try {
      try {
        await link(temporary, path);
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        await this.get(key);
      }
    } finally {
      await unlink(temporary).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
    return key;
  }
  async get(key) {
    const bytes = await readFile(join(this.root, validateObjectKey(key)));
    if (objectKey(bytes) !== key) throw new Error("Stored object checksum mismatch");
    return bytes;
  }
}
class CosObjectStore {
  constructor(client, bucket, region) {
    this.client = client;
    this.bucket = bucket;
    this.region = region;
  }
  async put(bytes, contentType) {
    const key = objectKey(bytes);
    await this.client.putObject({ Bucket: this.bucket, Region: this.region, Key: `bnbu/${key}`, Body: bytes, ContentType: contentType, ACL: "private" });
    return key;
  }
  async get(key) {
    const response = await this.client.getObject({ Bucket: this.bucket, Region: this.region, Key: `bnbu/${validateObjectKey(key)}` });
    if (!Buffer.isBuffer(response.Body) || objectKey(response.Body) !== key) throw new Error("Stored object checksum mismatch");
    return response.Body;
  }
}
function configuredObjectStore() {
  const provider = process.env.BNBU_OBJECT_STORE ?? "local";
  if (provider === "local") return new LocalObjectStore(process.env.BNBU_OBJECT_DIRECTORY ?? "./data/objects");
  if (provider !== "cos") throw new Error("Unsupported BNBU_OBJECT_STORE");
  const bucket = process.env.BNBU_COS_BUCKET, region = process.env.BNBU_COS_REGION, secretId = process.env.BNBU_COS_SECRET_ID, secretKey = process.env.BNBU_COS_SECRET_KEY;
  if (!bucket || !region || !secretId || !secretKey) throw new Error("COS configuration is incomplete");
  return new CosObjectStore(new COS({ SecretId: secretId, SecretKey: secretKey, SecurityToken: process.env.BNBU_COS_SESSION_TOKEN, Timeout: 15e3 }), bucket, region);
}
const marker = "$bnbuStoredImage";
async function storeImages(value, store = configuredObjectStore()) {
  if (typeof value === "string") {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(value);
    if (!match) return value;
    const bytes = Buffer.from(match[2], "base64");
    return { [marker]: await store.put(bytes, match[1]), contentType: match[1] };
  }
  if (Array.isArray(value)) return Promise.all(value.map((v) => storeImages(v, store)));
  if (value && typeof value === "object") {
    demand(!Object.hasOwn(value, marker), "请求包含内部存储标识。");
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await storeImages(v, store)])));
  }
  return value;
}
async function restoreImages(value, store = configuredObjectStore()) {
  if (Array.isArray(value)) return Promise.all(value.map((v) => restoreImages(v, store)));
  if (value && typeof value === "object") {
    const object = value;
    if (Object.hasOwn(object, marker)) {
      demand(typeof object[marker] === "string" && /^image\/(png|jpeg|webp)$/.test(String(object.contentType)), "图片存储记录无效。", 500);
      return `data:${object.contentType};base64,${(await store.get(object[marker])).toString("base64")}`;
    }
    return Object.fromEntries(await Promise.all(Object.entries(object).map(async ([k, v]) => [k, await restoreImages(v, store)])));
  }
  return value;
}
const decodePostgresEntity = async (row) => ({ id: row.id, kind: row.kind, ownerId: row.owner_id, data: await restoreImages(JSON.parse(row.data)), version: row.version, createdAt: row.created_at, updatedAt: row.updated_at });
class PostgresRepository {
  constructor(client) {
    this.client = client;
  }
  async activitySubscribers(id) {
    return (await this.client.query("SELECT DISTINCT account_id FROM relations WHERE entity_id=$1 AND kind IN ('participate','save')", [id])).rows.map((row) => row.account_id);
  }
  async updateAccount(id, status, roles) {
    await this.client.query("UPDATE accounts SET status=$1,roles=$2 WHERE id=$3", [status, JSON.stringify([...new Set(roles)]), id]);
  }
  async ownsNotification(id, recipientId) {
    return (await this.client.query("SELECT 1 FROM notifications WHERE id=$1 AND recipient_id=$2", [id, recipientId])).rows.length > 0;
  }
  async readNotification(id, recipientId, at) {
    await this.client.query("UPDATE notifications SET read_at=COALESCE(read_at,$1) WHERE id=$2 AND recipient_id=$3", [at, id, recipientId]);
  }
  async communityPostIndex() {
    const rows = (await this.client.query("SELECT id,kind,owner_id,(data::jsonb-'images'-'body')::text AS data,version,created_at,updated_at FROM entities WHERE kind='post' ORDER BY created_at DESC,id")).rows;
    return Promise.all(rows.map(decodePostgresEntity));
  }
  async communityCommentIndex() {
    const rows = (await this.client.query("SELECT id,kind,owner_id,(data::jsonb-'body')::text AS data,version,created_at,updated_at FROM entities WHERE kind='comment'")).rows;
    return Promise.all(rows.map(decodePostgresEntity));
  }
  async communityRelations() {
    return (await this.client.query(`SELECT account_id AS "accountId",entity_id AS "entityId",kind FROM relations WHERE kind IN ('like','save','commentlike')`)).rows;
  }
  async all(kind) {
    const result = await this.client.query("SELECT * FROM entities WHERE kind=$1 ORDER BY created_at DESC,id", [kind]);
    return Promise.all(result.rows.map(decodePostgresEntity));
  }
  async get(id, kind) {
    demand(typeof id === "string", "对象标识无效。");
    const { rows } = await this.client.query("SELECT * FROM entities WHERE id=$1", [id]);
    const row = rows[0];
    demand(row && (!kind || row.kind === kind), "对象不存在。", 404);
    return decodePostgresEntity(row);
  }
  async create(kind, ownerId, data) {
    const now = timestamp();
    const stored = await storeImages(data);
    const { rows } = await this.client.query("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5) RETURNING *", [randomUUID(), kind, ownerId, JSON.stringify(stored), now]);
    return decodePostgresEntity(rows[0]);
  }
  async save(entity, patch) {
    const stored = await storeImages({ ...entity.data, ...patch });
    const { rows } = await this.client.query("UPDATE entities SET data=$1,version=version+1,updated_at=$2 WHERE id=$3 AND version=$4 RETURNING *", [JSON.stringify(stored), timestamp(), entity.id, entity.version]);
    demand(rows[0], "内容已更新，请刷新后重试。", 409);
    return decodePostgresEntity(rows[0]);
  }
  async people() {
    const { rows } = await this.client.query("SELECT id,name,organization,status,roles FROM accounts WHERE login_kind<>'HISTORY'");
    return rows.map((row) => ({ ...row, roles: JSON.parse(row.roles) }));
  }
  async person(id) {
    const { rows } = await this.client.query("SELECT id,COALESCE(email,'') AS email,COALESCE(name,'已注销用户') AS name,COALESCE(organization,'') AS organization,status,roles FROM accounts WHERE id=$1", [id]);
    demand(rows[0], "账号不存在。", 404);
    return { ...rows[0], roles: JSON.parse(rows[0].roles) };
  }
  async notify(recipients, entityId, event, body2) {
    for (const recipient of new Set(recipients)) {
      await this.client.query("INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES($1,$2,$3,$4,$5,$6)", [randomUUID(), recipient, entityId, event, body2, timestamp()]);
    }
  }
  async related(accountId, entityId, kind) {
    const { rows } = await this.client.query("SELECT 1 FROM relations WHERE account_id=$1 AND entity_id=$2 AND kind=$3", [accountId, entityId, kind]);
    return rows.length > 0;
  }
  async relation(accountId, entityId, kind, enabled) {
    if (enabled) {
      await this.client.query("INSERT INTO relations(account_id,entity_id,kind,created_at) VALUES($1,$2,$3,$4) ON CONFLICT(account_id,entity_id,kind) DO NOTHING", [accountId, entityId, kind, timestamp()]);
    } else {
      await this.client.query("DELETE FROM relations WHERE account_id=$1 AND entity_id=$2 AND kind=$3", [accountId, entityId, kind]);
    }
  }
}
async function ensurePostgresStudentEmailIdentity(client, initial) {
  if (initial.login_kind !== "PERSONAL" || initial.status === "banned" || !studentEmail(initial.email) || JSON.parse(initial.roles).includes("student")) return initial;
  const row = (await client.query("SELECT * FROM accounts WHERE id=$1 FOR UPDATE", [initial.id])).rows[0];
  if (row.login_kind !== "PERSONAL" || row.status === "banned" || !studentEmail(row.email) || JSON.parse(row.roles).includes("student")) return row;
  if (!(await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1", [row.id, row.email])).rows.length) return row;
  const records = await Promise.all((await client.query("SELECT * FROM entities WHERE owner_id=$1 AND kind IN ('studentIdentityRequest','companionIdentity') ORDER BY created_at DESC,id DESC", [row.id])).rows.map(decodePostgresEntity));
  const identities = records.filter((item) => item.kind === "companionIdentity" && item.data.role === "student");
  const request = records.find((item) => item.kind === "studentIdentityRequest");
  if (identities.some((item) => item.data.status === "revoked") || request?.data.status === "revoked") return row;
  const numberFree = !(await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id<>$1 AND data::jsonb->>'role'='student' AND data::jsonb->>'status'='verified' AND data::jsonb->>'studentNumber'=$2 LIMIT 1", [row.id, request?.data.studentNumber ?? null])).rows.length;
  const repo = new PostgresRepository(client);
  const identity = identities.find((item) => item.data.status === "verified") ?? await repo.create("companionIdentity", row.id, emailIdentityData(row.email, request, numberFree));
  const updated = { ...row, roles: JSON.stringify([.../* @__PURE__ */ new Set([...JSON.parse(row.roles), "student"])]) };
  await client.query("UPDATE accounts SET roles=$1 WHERE id=$2", [updated.roles, row.id]);
  if (request && ["pending", "rejected"].includes(String(request.data.status))) await repo.save(request, { status: "verified", source: "verified-student-email", reason: emailIdentityReason, reviewedAt: timestamp() });
  await repo.notify([row.id], identity.id, "student.identity.verified", emailIdentityReason);
  await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), row.id, "student", "student.identity.email-grant", identity.id, emailIdentityReason, JSON.stringify({ source: "verified-student-email" }), timestamp()]);
  return updated;
}
class PostgresAuth {
  constructor(db2) {
    this.db = db2;
  }
  async login(identifierInput, password, kind, validate, origin) {
    demand(typeof identifierInput === "string" && identifierInput.trim().length > 0 && identifierInput.trim().length <= (kind === "ADMIN" ? 100 : 254), "请填写邮箱或管理账号。");
    const identifier2 = kind === "PERSONAL" ? normalizeEmail(identifierInput) : identifierInput.trim().toLowerCase();
    demand(typeof password === "string", "邮箱或密码错误。", 401);
    const result = await this.db.transaction(async (client) => {
      const now = Date.now();
      if (origin) {
        const subject = digest(identifier2), source = digest(origin);
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`login-source:${source}`]);
        const limits = (await client.query("SELECT count(*) FILTER (WHERE origin=$2) AS source,count(*) FILTER (WHERE origin=$2 AND subject=$1) AS pair FROM security_rate_events WHERE category='login' AND occurred_at>=$3", [subject, source, now - 6e4])).rows[0];
        demand(Number(limits.source) < 60 && Number(limits.pair) < 12, "请求过于频繁，请稍后再试。", 429);
        await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('login',$1,$2,$3)", [subject, source, now]);
      }
      const rows = (await client.query("SELECT * FROM accounts WHERE ((login_kind='PERSONAL' AND email=$1) OR (login_kind='ADMIN' AND login_name=$1)) AND ($2::text IS NULL OR login_kind=$2)", [identifier2, kind ?? null])).rows;
      const matching = rows.filter((row2) => matchesPassword(password, row2.password_hash));
      if (!rows.length) matchesPassword(password, "00000000000000000000000000000000:" + "00".repeat(64));
      demand(matching.length <= 1, "账号标识重复，请联系管理员调整管理登录账号。", 409);
      if (!matching.length) return null;
      const row = await ensurePostgresStudentEmailIdentity(client, matching[0]);
      if (row.login_kind === "ADMIN") {
        if (row.status !== "active") throw new ServiceError(403, "ACCOUNT_DISABLED", "管理账号已停用。");
        const identity = await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=$1 AND data::jsonb->>'role'='admin' AND data::jsonb->>'status'='verified'", [row.id]);
        demand(identity.rows.length, "管理账号身份不可用。", 403);
      }
      if (validate) await validate(client, account(row));
      const token = randomBytes(32).toString("base64url");
      await client.query("INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)", [digest(token), row.id, now + 432e5, timestamp()]);
      return { token, account: account(row) };
    });
    if (!result) throw new ServiceError(401, "INVALID_CREDENTIALS", "邮箱或密码错误。");
    return result;
  }
  async authenticate(token, client) {
    if (!client) return this.db.transaction((connection) => this.authenticate(token, connection));
    if (!token) throw new ServiceError(401, "UNAUTHENTICATED", "请先登录。");
    const row = (await client.query("SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>$2", [digest(token), Date.now()])).rows[0];
    if (!row || row.login_kind === "HISTORY") throw new ServiceError(401, "UNAUTHENTICATED", "登录已过期，请重新登录。");
    if (row.login_kind === "ADMIN" && row.status !== "active") throw new ServiceError(403, "ACCOUNT_DISABLED", "管理账号已停用。");
    return account(await ensurePostgresStudentEmailIdentity(client, row));
  }
  async logout(token) {
    if (token) await this.db.pool.query("DELETE FROM sessions WHERE token_hash=$1", [digest(token)]);
  }
}
class PostgresEmail {
  constructor(db2) {
    this.db = db2;
  }
  async sendVerification(rawEmail, localOutbox, origin = "local") {
    const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
    demand(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
    const email = normalizeEmail(rawEmail);
    const message = await this.db.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`email-source:${digest(origin)}`]);
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`email:${email}`]);
      const now = Date.now();
      const previous = (await client.query("SELECT sent_at FROM email_challenges WHERE email=$1", [email])).rows[0];
      demand(!previous || now - Number(previous.sent_at) >= 6e4, "请稍后再发送验证码。", 429);
      const subject = digest(email), source = digest(origin);
      const limits = (await client.query("SELECT count(*) FILTER (WHERE subject=$1 AND occurred_at>=$3) AS hour,count(*) FILTER (WHERE subject=$1) AS day,count(DISTINCT subject) FILTER (WHERE origin=$2 AND occurred_at>=$3) AS source,count(*) FILTER (WHERE occurred_at>=$3) AS global FROM security_rate_events WHERE category='email-send' AND occurred_at>=$4", [subject, source, now - 36e5, now - 864e5])).rows[0];
      demand(Number(limits.hour) < 5 && Number(limits.day) < 10 && Number(limits.source) < 20 && Number(limits.global) < 1e3, "请求过于频繁，请稍后再试。", 429);
      await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('email-send',$1,$2,$3)", [subject, source, now]);
      const code = String(randomInt(1e5, 1e6));
      const outbox = { id: randomUUID(), recipient: email, subject: "伴学注册验证码", body: `验证码：${code}，10 分钟内有效。` };
      await client.query("INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES($1,$2,$3,0,$4) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at", [email, digest(`${email}:${code}`), now + 6e5, now]);
      await client.query("INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)", [outbox.id, outbox.recipient, outbox.subject, outbox.body, timestamp()]);
      return outbox;
    });
    if (!endpoint) return { sent: true, delivery: "local-outbox", message: "验证码已写入本地开发收件箱，未发送至真实邮箱。" };
    await deliverMessage(message, endpoint);
    await this.db.pool.query("UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2", [timestamp(), message.id]);
    return { sent: true, delivery: "email", message: "验证码已发送，请查看邮箱。" };
  }
  async consume(email, code, operation) {
    demand(typeof code === "string" && /^\d{6}$/.test(code), "请填写六位验证码。");
    const result = await this.db.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`email:${email}`]);
      const challenge = (await client.query("SELECT * FROM email_challenges WHERE email=$1 FOR UPDATE", [email])).rows[0];
      if (!challenge || Number(challenge.expires_at) <= Date.now() || challenge.attempts >= 5) return { error: new ServiceError(400, "INVALID_REQUEST", "验证码已失效，请重新获取。") };
      await client.query("UPDATE email_challenges SET attempts=attempts+1 WHERE email=$1", [email]);
      if (typeof code !== "string" || digest(`${email}:${code}`) !== challenge.code_hash) return { error: new ServiceError(400, "INVALID_REQUEST", "验证码错误。") };
      const value = await operation(client);
      await client.query("DELETE FROM email_challenges WHERE email=$1", [email]);
      return { value };
    });
    if ("error" in result) throw result.error;
    return result.value;
  }
  async register(input) {
    const email = normalizeEmail(input.email);
    const passwordHash = hashPassword(input.password);
    return this.consume(email, input.code, async (client) => {
      demand(!(await client.query("SELECT 1 FROM accounts WHERE email=$1 AND login_kind='PERSONAL'", [email])).rows.length, "该邮箱已注册。", 409);
      const id = randomUUID();
      await client.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES($1,$2,$3,$4,$5)", [id, email, passwordHash, email.split("@")[0].slice(0, 20), timestamp()]);
      await new PostgresRepository(client).create("verifiedEmail", id, { email, source: "registration-code" });
      await ensurePostgresStudentEmailIdentity(client, (await client.query("SELECT * FROM accounts WHERE id=$1", [id])).rows[0]);
      return { registered: true };
    });
  }
  async verifyOwnEmail(actor, code) {
    demand(actor.status !== "banned", "账号已封禁。", 403);
    return this.consume(actor.email, code, async (client) => {
      const current2 = (await client.query("SELECT email,status FROM accounts WHERE id=$1 FOR UPDATE", [actor.id])).rows[0];
      demand(current2 && current2.email === actor.email && current2.status !== "banned", "账号状态已变化，请重新登录。", 403);
      await new PostgresRepository(client).create("verifiedEmail", actor.id, { email: actor.email, source: "own-email-code" });
      await ensurePostgresStudentEmailIdentity(client, (await client.query("SELECT * FROM accounts WHERE id=$1", [actor.id])).rows[0]);
      return { verified: true };
    });
  }
}
async function postgresPassword(client, repo, actor, token, input) {
  const identity = (await repo.all("companionIdentity")).find((i) => i.ownerId === actor.id && i.data.status === "verified" && ["teacher", "admin"].includes(String(i.data.role)));
  demand(identity && actor.status === "active", "仅有效教师或管理员可修改本人密码。", 403);
  version(identity, input);
  demand(typeof input.currentPassword === "string" && typeof input.newPassword === "string" && input.newPassword.length > 0, "请填写当前密码和非空新密码。");
  demand(input.newPassword === input.confirmPassword, "两次新密码不一致。");
  const row = (await client.query("SELECT password_hash FROM accounts WHERE id=$1 FOR UPDATE", [actor.id])).rows[0];
  demand(row && matchesPassword(input.currentPassword, row.password_hash), "当前密码不正确。", 403);
  await client.query("UPDATE accounts SET password_hash=$1 WHERE id=$2", [encodePassword(input.newPassword), actor.id]);
  await client.query("DELETE FROM sessions WHERE account_id=$1 AND token_hash<>$2", [actor.id, digest(token)]);
  const saved = await repo.save(identity, { mustChangePassword: false, passwordChangedAt: Date.now() });
  await repo.notify([actor.id], identity.id, "accounts.password.change", "本人密码已更新，其他设备的登录状态已失效。");
  return { id: saved.id };
}
async function requirePostgresSuperAdmin(repo, actor) {
  const identities = await repo.all("companionIdentity");
  demand(actor.status !== "banned" && actor.roles.includes("superadmin") && identities.some((i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified"), "仅总管理员可执行此治理操作。", 403);
}
async function postgresAdministratorState(repo, actor, input) {
  await requirePostgresSuperAdmin(repo, actor);
  demand(Object.keys(input).every((k) => ["id", "version", "status", "handoverConfirmed", "confirmed"].includes(k)), "管理账号操作包含不允许的字段。");
  demand(input.confirmed === true, "须核对账号资料、全部权限及高风险权限后确认。");
  const identity = await repo.get(input.id, "companionIdentity");
  demand(identity.data.role === "admin" && identity.ownerId !== actor.id, "不能修改本人或非分管理员账号。", 403);
  const row = (await repo.client.query("SELECT login_kind,roles,status FROM accounts WHERE id=$1 FOR UPDATE", [identity.ownerId])).rows[0];
  demand(row?.login_kind === "ADMIN" && !JSON.parse(row.roles).includes("superadmin"), "仅可管理独立分管理员账号。", 403);
  version(identity, input);
  demand(input.status === "ACTIVE" || input.status === "DISABLED", "分管理员状态无效。");
  const next = input.status === "ACTIVE" ? "active" : "banned";
  demand(row.status !== next, "账号状态已变化，请刷新。", 409);
  if (next === "banned") demand(input.handoverConfirmed === true, "停用前须确认已完成职责移交。");
  await repo.client.query("UPDATE accounts SET status=$1 WHERE id=$2", [next, identity.ownerId]);
  if (next === "banned") await repo.client.query("DELETE FROM sessions WHERE account_id=$1", [identity.ownerId]);
  await repo.create("sportsAdminHistory", actor.id, { administratorId: identity.ownerId, action: "accounts.admins.state", before: row.status, after: next });
  const saved = await repo.save(identity, { accountState: input.status });
  return { id: saved.id };
}
async function postgresAdministratorCreate(repo, actor, input) {
  await requirePostgresSuperAdmin(repo, actor);
  demand(Object.keys(input).every((k) => ["personId", "loginName", "name", "email", "department", "permissions", "initialPassword", "confirmPassword", "confirmed"].includes(k)), "管理账号操作包含不允许的字段。");
  demand(input.confirmed === true, "须核对账号资料、全部权限及高风险权限后确认。");
  const name = textField(input, "name", 40), email = normalizeEmail(input.email), department = textField(input, "department", 200, true);
  const domains = (process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? "bnbu.edu.cn").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  demand(domains.includes(email.split("@")[1]), "请填写已配置学校域名的邮箱。");
  demand(Array.isArray(input.permissions) && input.permissions.length > 0 && input.permissions.every((p) => accountPermissions.includes(p)) && new Set(input.permissions).size === input.permissions.length, "须选择至少一项固定业务权限，不得授予管理账号或教师权限。");
  demand(!(await repo.client.query("SELECT id FROM accounts WHERE email=$1 AND login_kind='ADMIN'", [email])).rows.length, "学校邮箱已被另一分管理员使用。", 409);
  const personId = textField(input, "personId", 100);
  const person = (await repo.client.query("SELECT status,login_kind FROM accounts WHERE id=$1", [personId])).rows[0];
  demand(person?.status === "active" && person.login_kind === "PERSONAL" && (await repo.all("companionIdentity")).some((i) => i.ownerId === personId && i.data.status === "verified"), "请选择当前已完成身份核验的人员。", 409);
  const loginName = textField(input, "loginName", 100).toLowerCase();
  demand(!(await repo.client.query("SELECT id FROM accounts WHERE login_name=$1", [loginName])).rows.length, "管理登录账号已存在。", 409);
  demand(typeof input.initialPassword === "string" && input.initialPassword.length > 0 && input.initialPassword === input.confirmPassword, "须填写初始密码且两次输入一致。");
  const id = randomUUID();
  await repo.client.query("INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at,login_kind,login_name) VALUES($1,$2,$3,$4,$5,$6,$7,'ADMIN',$8)", [id, email, encodePassword(input.initialPassword), name, department, JSON.stringify(["admin"]), timestamp(), loginName]);
  const saved = await repo.create("companionIdentity", id, { role: "admin", status: "verified", permissions: input.permissions, mustChangePassword: true, accountState: "ACTIVE", source: "SUPERADMIN_CONFIRMED_PERSON", verifiedPersonId: personId });
  await repo.create("sportsAdminHistory", actor.id, { administratorId: id, action: "accounts.admins.create", permissions: input.permissions });
  return { id: saved.id };
}
async function postgresAdministratorEdit(repo, actor, input) {
  await requirePostgresSuperAdmin(repo, actor);
  demand(Object.keys(input).every((k) => ["id", "version", "name", "email", "department", "permissions", "confirmed"].includes(k)), "管理账号操作包含不允许的字段。");
  demand(input.confirmed === true, "须核对账号资料、全部权限及高风险权限后确认。");
  const identity = await repo.get(input.id, "companionIdentity");
  demand(identity.data.role === "admin" && identity.ownerId !== actor.id, "不能修改本人或非分管理员账号。", 403);
  const row = (await repo.client.query("SELECT login_kind,roles,name,email,organization FROM accounts WHERE id=$1 FOR UPDATE", [identity.ownerId])).rows[0];
  demand(row?.login_kind === "ADMIN" && !JSON.parse(row.roles).includes("superadmin"), "仅可管理独立分管理员账号。", 403);
  version(identity, input);
  const name = textField(input, "name", 40), email = normalizeEmail(input.email), department = textField(input, "department", 200, true);
  const domains = (process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? "bnbu.edu.cn").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  demand(domains.includes(email.split("@")[1]), "请填写已配置学校域名的邮箱。");
  demand(Array.isArray(input.permissions) && input.permissions.length > 0 && input.permissions.every((p) => accountPermissions.includes(p)) && new Set(input.permissions).size === input.permissions.length, "须选择至少一项固定业务权限，不得授予管理账号或教师权限。");
  demand(!(await repo.client.query("SELECT id FROM accounts WHERE email=$1 AND login_kind='ADMIN' AND id<>$2", [email, identity.ownerId])).rows.length, "学校邮箱已被另一分管理员使用。", 409);
  if (row.email !== email) {
    await repo.client.query("DELETE FROM mail_outbox WHERE id IN (SELECT mail_id FROM admin_security_challenges WHERE account_id=$1)", [identity.ownerId]);
    await repo.client.query("DELETE FROM admin_security_challenges WHERE account_id=$1", [identity.ownerId]);
  }
  await repo.client.query("UPDATE accounts SET name=$1,email=$2,organization=$3 WHERE id=$4", [name, email, department, identity.ownerId]);
  await repo.create("sportsAdminHistory", actor.id, { administratorId: identity.ownerId, action: "accounts.admins.edit", before: { name: row.name, email: row.email, organization: row.organization, permissions: identity.data.permissions }, after: { name, email, organization: department, permissions: input.permissions } });
  const saved = await repo.save(identity, { permissions: input.permissions, ...row.email !== email ? { schoolEmailVerified: false, schoolEmail: null } : {} });
  return { id: saved.id };
}
async function postgresAdministratorDirectory(db2, token) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    const repo = new PostgresRepository(client), identities = await repo.all("companionIdentity");
    if (passwordChangeRequired(identities, actor)) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
    await requirePostgresSuperAdmin(repo, actor);
    const rows = (await client.query("SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name")).rows;
    return {
      permissions: accountPermissions,
      items: rows.map((a) => {
        const identity = identities.find((i) => i.ownerId === a.id && i.data.role === "admin");
        return { id: a.id, identityId: identity?.id, loginName: a.login_name, name: a.name, email: a.email, department: a.organization, status: a.status === "active" ? "ACTIVE" : "DISABLED", permissions: identity?.data.permissions ?? [], version: identity?.version, updatedAt: identity?.updatedAt };
      }),
      candidates: (await client.query("SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='companionIdentity' AND i.data::jsonb->>'status'='verified' ORDER BY a.name")).rows
    };
  });
}
async function postgresAdministratorSelf(db2, token) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client), repo = new PostgresRepository(client), identities = await repo.all("companionIdentity");
    if (passwordChangeRequired(identities, actor)) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
    const row = (await client.query("SELECT login_name,name,email FROM accounts WHERE id=$1 AND login_kind='ADMIN'", [actor.id])).rows[0];
    const identity = identities.find((i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified");
    demand(row && identity && !actor.roles.includes("superadmin"), "该流程仅适用独立分管理员。", 403);
    return { id: identity.id, version: identity.version, loginName: row.login_name, name: row.name, email: row.email };
  });
}
async function postgresAdministratorDelete(repo, actor, action, input) {
  const self = action === "accounts.close";
  if (!self) await requirePostgresSuperAdmin(repo, actor);
  if (!self && input.accountId !== void 0) {
    demand(Object.keys(input).every((k) => ["accountId", "version", "confirmed", "handoverConfirmed"].includes(k)), "账号删除参数无效。");
    const identities = (await repo.all("companionIdentity")).filter((i) => i.ownerId === input.accountId && i.data.role === "admin");
    demand(identities.length === 1, "管理账号不存在或身份资料需核对。", 404);
    const snapshot = (await repo.client.query("SELECT login_name,name,email FROM accounts WHERE id=$1", [input.accountId])).rows[0];
    demand(snapshot, "管理账号不存在。", 404);
    input = { id: identities[0].id, version: input.version, confirmed: input.confirmed, handoverConfirmed: input.handoverConfirmed, loginName: snapshot.login_name, name: snapshot.name, email: snapshot.email };
  }
  demand(Object.keys(input).every((k) => ["id", "version", "confirmed", "handoverConfirmed", "loginName", "name", "email"].includes(k)), "账号删除参数无效。");
  const identity = await repo.get(input.id, "companionIdentity");
  version(identity, input);
  demand(identity.data.role === "admin" && identity.ownerId, "只能删除独立分管理员。");
  demand(self ? identity.ownerId === actor.id : identity.ownerId !== actor.id, "无权删除此账号。", 403);
  if (self) demand(identity.data.status === "verified" && actor.status === "active", "当前管理身份不可用。", 403);
  const row = (await repo.client.query("SELECT * FROM accounts WHERE id=$1 FOR UPDATE", [identity.ownerId])).rows[0];
  demand(row?.login_kind === "ADMIN" && !JSON.parse(row.roles).includes("superadmin"), "该流程不适用总管理员或个人账号。", 403);
  demand(input.confirmed === true && input.handoverConfirmed === true, "须确认已完成全部职责移交。");
  demand(input.loginName === row.login_name && input.name === row.name && input.email === row.email, "账号资料已变化，请重新核对姓名、登录账号和邮箱。", 409);
  for (const history of (await repo.all("sportsAdminHistory")).filter((h) => h.data.administratorId === identity.ownerId)) {
    const data = { ...history.data };
    for (const key of ["before", "after"]) {
      const value = data[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const copy = { ...value };
        delete copy.name;
        delete copy.email;
        delete copy.organization;
        data[key] = copy;
      }
    }
    await repo.client.query("UPDATE entities SET data=$1 WHERE id=$2", [JSON.stringify(data), history.id]);
  }
  for (const [table, column] of [["sessions", "account_id"], ["notifications", "recipient_id"], ["relations", "account_id"], ["command_receipts", "actor_id"]]) await repo.client.query(`DELETE FROM ${table} WHERE ${column}=$1`, [identity.ownerId]);
  await repo.client.query("DELETE FROM mail_outbox WHERE id IN (SELECT mail_id FROM admin_security_challenges WHERE account_id=$1)", [identity.ownerId]);
  await repo.client.query("DELETE FROM admin_security_challenges WHERE account_id=$1", [identity.ownerId]);
  await repo.client.query("DELETE FROM entities WHERE owner_id=$1 AND kind='companionIdentity'", [identity.ownerId]);
  await repo.client.query("UPDATE accounts SET email=NULL,password_hash=NULL,name=NULL,organization=NULL,roles='[]',status='banned',login_name=NULL,login_kind='HISTORY' WHERE id=$1", [identity.ownerId]);
  const deletedAt = Date.now(), deletedVersion = identity.version + 1;
  await repo.create("sportsAdminHistory", actor.id, { administratorId: identity.ownerId, action, handoverConfirmed: true, deletedAt, deletedVersion });
  return { id: identity.ownerId, deleted: true, deletedAt: new Date(deletedAt).toISOString(), version: deletedVersion };
}
async function executePostgres(db2, token, action, input, requestId) {
  return executeWithActor(db2, (client) => new PostgresAuth(db2).authenticate(token, client), token, action, input, requestId);
}
async function executePostgresMailboxImport(db2, actorId, input, requestId) {
  return executeWithActor(db2, async (client) => {
    const actor = await new PostgresRepository(client).person(actorId);
    demand(actor.status === "active" && actor.roles.some((role) => role === "operator" || role === "superadmin"), "邮箱导入操作账号无效。", 403);
    return actor;
  }, "", "mail.import", input, requestId);
}
async function executeWithActor(db2, actorProvider, token, action, input, requestId) {
  demand(/^[a-z]+(?:\.[a-z]+)+$/.test(action) && requestId.length >= 8 && requestId.length <= 100, "请求格式无效。");
  demand(!action.startsWith("sports."), "伴学不提供体育业务写入。", 404);
  return db2.transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(18422,2)");
    const actor = await actorProvider(client);
    demand(actor.status !== "banned", "账号已封禁，不能进行业务写入。", 403);
    const repo = new PostgresRepository(client);
    if (action === "post.view") return recordPostgresPostView(repo, actor, input);
    if (action !== "accounts.password.change" && passwordChangeRequired(await repo.all("companionIdentity"), actor)) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
    for (const [name, key] of [["room.decide", "accept"], ["report.decide", "upheld"], ["coffee.answer", "accept"], ["coffee.slot.update", "closed"], ["certification.review", "approve"], ["organization.review", "approve"], ["activity.visibility", "publish"], ["mail.visibility", "publish"], ["alumni.review", "approve"], ["alumni.decide", "accept"], ["alumni.profile", "accepting"]]) {
      if (action === name) demand(typeof input[key] === "boolean", `${key} 必须明确为 true 或 false。`);
    }
    const hash = digest(JSON.stringify({ action, input }));
    if (action.startsWith("accounts.admins.")) await requirePostgresSuperAdmin(repo, actor);
    const previous = (await client.query("SELECT request_hash,result FROM command_receipts WHERE actor_id=$1 AND request_id=$2", [actor.id, requestId])).rows[0];
    if (previous) {
      demand(previous.request_hash === hash, "该请求标识已用于不同操作。", 409);
      return JSON.parse(previous.result);
    }
    let result;
    if (action === "accounts.password.change") result = await postgresPassword(client, repo, actor, token, input);
    else if (action === "accounts.admins.state") result = await postgresAdministratorState(repo, actor, input);
    else if (action === "accounts.admins.create") result = await postgresAdministratorCreate(repo, actor, input);
    else if (action === "accounts.admins.edit") result = await postgresAdministratorEdit(repo, actor, input);
    else if (action === "accounts.admins.delete" || action === "accounts.close") result = await postgresAdministratorDelete(repo, actor, action, input);
    else if (action.startsWith("notification.")) result = await runAsync(notificationPolicy(repo, actor, action, input));
    else {
      const entity = action === "relation.set" ? await runAsync(relationPolicy(repo, actor, input)) : await runAsync(communityPolicy(repo, actor, action, input)) ?? await runAsync(coffeePolicy(repo, actor, action, input)) ?? await runAsync(governancePolicy(repo, actor, action, input)) ?? await runAsync(activityPolicy(repo, actor, action, input)) ?? await runAsync(alumniPolicy(repo, actor, action, input));
      if (entity) result = { id: entity.id };
    }
    demand(result, "不支持该业务操作。", 404);
    const auditData = { result, ...action === "coffee.answer" ? { accepted: input.accept } : {}, ...action === "relation.set" ? { relation: { kind: input.kind, enabled: input.enabled === true } } : {}, ...action === "keyword.save" ? { keywordChange: { word: input.word } } : {}, ...action === "keyword.set" ? { keywordChange: { enabled: input.enabled } } : {}, ...action === "keyword.delete" ? { keywordChange: { deleted: true } } : {}, ...["room.create", "room.decide", "room.finish", "room.moderate"].includes(action) ? { teamResult: await repo.get(result.id) } : {} };
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), actor.id, actor.roles.join(","), action, typeof input.id === "string" ? input.id : result.id ?? null, typeof input.reason === "string" ? input.reason : "", JSON.stringify(auditData), timestamp()]);
    await client.query("INSERT INTO command_receipts(actor_id,request_id,request_hash,result,created_at) VALUES($1,$2,$3,$4,$5)", [actor.id, requestId, hash, JSON.stringify(result), timestamp()]);
    return result;
  });
}
const map = (rows) => new Map(rows.map((row) => [row.id, Number(row.count)]));
const community = (actor) => demand(actor.roles.length > 0 && actor.status !== "banned", "请先完成校园身份核验。", 403);
async function metrics(client, cutoff) {
  const [views, likes, comments] = await Promise.all([
    client.query("SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=$1 GROUP BY post_id", [cutoff]),
    client.query("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
    client.query("SELECT data::jsonb->>'postId' AS id,count(*) AS count FROM entities WHERE kind='comment' AND data::jsonb->>'status'='visible' AND created_at>=$1 GROUP BY data::jsonb->>'postId'", [cutoff])
  ]);
  return { views: map(views.rows), likes: map(likes.rows), comments: map(comments.rows) };
}
async function signals(client, actorId, cutoff) {
  const board = /* @__PURE__ */ new Map();
  const add = (rows, weight) => {
    for (const row of rows) if (row.board) board.set(row.board, (board.get(row.board) ?? 0) + Number(row.count) * weight);
  };
  const [views, likes, comments, viewed] = await Promise.all([
    client.query("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM post_views v JOIN entities p ON p.id=v.post_id WHERE v.viewer_id=$1 AND v.viewed_at>=$2 GROUP BY board", [actorId, cutoff]),
    client.query("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM relations r JOIN entities p ON p.id=r.entity_id WHERE r.account_id=$1 AND r.kind='like' AND r.created_at>=$2 GROUP BY board", [actorId, cutoff]),
    client.query("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM entities c JOIN entities p ON p.id=c.data::jsonb->>'postId' WHERE c.kind='comment' AND c.owner_id=$1 AND c.created_at>=$2 GROUP BY board", [actorId, cutoff]),
    client.query("SELECT DISTINCT post_id AS id FROM post_views WHERE viewer_id=$1 AND viewed_at>=$2", [actorId, cutoff])
  ]);
  add(views.rows, 1);
  add(likes.rows, 4);
  add(comments.rows, 3);
  return { board, viewed: new Set(viewed.rows.map((row) => row.id)) };
}
async function candidates(client, actor, withBody) {
  const body2 = withBody ? "COALESCE(p.data::jsonb->>'body','')" : "''";
  const result = await client.query(`SELECT p.id,p.data::jsonb->>'alumniId' AS "alumniId",p.owner_id AS "ownerId",p.created_at AS "createdAt",COALESCE(p.data::jsonb->>'title','') AS title,${body2} AS body,COALESCE(p.data::jsonb->>'board','') AS board,p.data::jsonb->>'status' AS status,CASE WHEN (SELECT data::jsonb->>'profilePreview' FROM entities WHERE kind='preferences' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1)='false' THEN COALESCE(a.name,'已注销用户') ELSE COALESCE((SELECT data::jsonb->>'nickname' FROM entities WHERE kind='profile' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1),a.name,'已注销用户') END AS author FROM entities p LEFT JOIN accounts a ON a.id=p.owner_id WHERE p.kind='post' AND (p.data::jsonb->>'status'='visible' OR (p.owner_id=$1 AND p.data::jsonb->>'status'='pending'))`, [actor.id]);
  return result.rows;
}
async function projection(client, actor, entities) {
  const ids = [.../* @__PURE__ */ new Set([actor.id, ...entities.map((item) => item.ownerId).filter((id) => !!id)])];
  const accounts = (await client.query("SELECT id,name,organization,status,roles FROM accounts WHERE id=ANY($1::text[]) AND login_kind<>'HISTORY'", [ids])).rows.map((row) => ({ ...row, roles: JSON.parse(row.roles) }));
  const repo = new PostgresRepository(client);
  const [profiles, preferences] = await Promise.all([repo.all("profile"), repo.all("preferences")]);
  const people = projectDisplayPeople(actor, accounts, new Set(ids), preferences.filter((item) => ids.includes(item.ownerId ?? "")), profiles.filter((item) => ids.includes(item.ownerId ?? "")));
  const postIds = entities.filter((item) => item.kind === "post").map((item) => item.id);
  const [likeRows, viewRows, relations, alumni] = await Promise.all([
    client.query("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND entity_id=ANY($1::text[]) GROUP BY entity_id", [postIds]),
    client.query("SELECT post_id AS id,count(*) AS count FROM post_views WHERE post_id=ANY($1::text[]) GROUP BY post_id", [postIds.filter((id) => entities.find((item) => item.id === id)?.ownerId === actor.id)]),
    client.query(`SELECT entity_id AS "entityId",kind FROM relations WHERE account_id=$1 AND kind IN ('like','save','commentlike')`, [actor.id]),
    repo.all("alumniState")
  ]);
  const alumniState = alumni[0]?.data.value;
  const facts = await runAsync(communityCounts(repo, postIds));
  return projectCommunity({ account: actor, entities, people, relations: relations.rows, alumni: { profiles: alumniState?.profiles ?? [] } }, map(likeRows.rows), { allViews: map(viewRows.rows), recentViews: /* @__PURE__ */ new Map(), recentLikes: /* @__PURE__ */ new Map() }, facts);
}
async function postgresCommunityFeed(db2, token, params) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    community(actor);
    const query = (params.get("q") ?? "").trim(), board = params.get("board") ?? "全部", sort = params.get("sort") === "newest" ? "newest" : "recommended";
    demand(query.length <= 100, "搜索词过长。");
    const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1)), pageSize = Math.max(1, Math.min(50, Number(params.get("limit")) || 20));
    const cutoff7 = new Date(Date.now() - 7 * 864e5).toISOString(), cutoff30 = new Date(Date.now() - 30 * 864e5).toISOString();
    const [candidatesList, engagement, personal] = await Promise.all([candidates(client, actor, Boolean(query)), metrics(client, cutoff7), signals(client, actor.id, cutoff30)]);
    const all = await runAsync(filterCommunityCandidates(new PostgresRepository(client), actor, candidatesList, params));
    const ordered = rankCommunity(all, { board, query, sort }, personal, engagement), selected = ordered.slice((page - 1) * pageSize, page * pageSize);
    const hot = await runAsync(communityHotForViewer(new PostgresRepository(client), actor, candidatesList, engagement)), hotIds = [.../* @__PURE__ */ new Set([...hot.overall, ...Object.values(hot.byBoard).flat()])];
    const hotPosts = hotIds.flatMap((id) => {
      const item = candidatesList.find((post) => post.id === id);
      return item ? [{ id: item.id, title: item.title, board: item.board, author: item.author, status: item.status }] : [];
    });
    const rows = selected.length ? (await client.query("SELECT * FROM entities WHERE id=ANY($1::text[])", [selected.map((item) => item.id)])).rows : [];
    const entityMap = new Map((await Promise.all(rows.map(decodePostgresEntity))).map((item) => [item.id, item]));
    const entities = selected.flatMap((item) => {
      const entity = entityMap.get(item.id);
      return entity ? [entity] : [];
    });
    const result = await projection(client, actor, entities);
    return { ...result, hotLists: hot, hotPosts, page, total: ordered.length, hasMore: page * pageSize < ordered.length, sort, query, board };
  });
}
async function postgresCommunityPostDetail(db2, token, id, page = 1) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    community(actor);
    const repo = new PostgresRepository(client), post = await repo.get(id, "post");
    await runAsync(requireSocialAccess(repo, actor, post.ownerId));
    demand(post.data.status === "visible" || post.ownerId === actor.id && post.data.status === "pending", "帖子当前不可查看。", 403);
    const rows = (await client.query("SELECT * FROM entities WHERE kind='comment' AND data::jsonb->>'postId'=$1 AND (data::jsonb->>'status'='visible' OR (owner_id=$2 AND data::jsonb->>'status'='pending')) ORDER BY created_at,id LIMIT 51 OFFSET $3", [id, actor.id, (Math.max(1, page) - 1) * 50])).rows;
    const entities = [post, ...await Promise.all(rows.slice(0, 50).map(decodePostgresEntity))];
    const view = await projection(client, actor, entities);
    return { post: view.posts[0], features: { postViews: true }, commentsHasMore: rows.length > 50, commentPage: page, liked: view.likedPosts.includes(id), saved: view.savedPosts.includes(id), alumniProfiles: view.alumniProfiles };
  });
}
async function postgresCommunitySocial(db2, token, params) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    return runAsync(communitySocialRead(new PostgresRepository(client), actor, params));
  });
}
const asMap = (rows) => new Map(rows.map((row) => [row.id, Number(row.count)]));
async function postgresDiscoverHotPage(db2, token) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    demand(actor.roles.includes("student") && actor.status !== "banned", "请先完成学生身份核验。", 403);
    const cutoff = new Date(Date.now() - 7 * 864e5).toISOString();
    const [rows, views, likes, comments, saves, participates] = await Promise.all([
      client.query(`SELECT id,kind,created_at AS "createdAt",COALESCE(data::jsonb->>'title','') AS title,CASE WHEN kind='activity' THEN COALESCE(data::jsonb->>'location','校园活动') ELSE COALESCE(data::jsonb->>'board','校园社区') END AS subtitle,COALESCE(data::jsonb->>'status','') AS status FROM entities WHERE (kind='activity' AND data::jsonb->>'status'='published') OR (kind='post' AND data::jsonb->>'status'='visible')`),
      client.query("SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=$1 GROUP BY post_id", [cutoff]),
      client.query("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
      client.query("SELECT data::jsonb->>'postId' AS id,count(*) AS count FROM entities WHERE kind='comment' AND data::jsonb->>'status'='visible' AND created_at>=$1 GROUP BY data::jsonb->>'postId'", [cutoff]),
      client.query("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='save' AND created_at>=$1 GROUP BY entity_id", [cutoff]),
      client.query("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='participate' AND created_at>=$1 GROUP BY entity_id", [cutoff])
    ]);
    const engagement = { views: asMap(views.rows), likes: asMap(likes.rows), comments: asMap(comments.rows), saves: asMap(saves.rows), participates: asMap(participates.rows) };
    return rankDiscoverHot(rows.rows, engagement);
  });
}
async function postgresModerationPage(db2, actor, params) {
  demand(actor.roles.includes("reviewer") || actor.roles.includes("superadmin"), "需要审核职责。", 403);
  const status = params.get("status") ?? "all", kind = params.get("kind") ?? "all", query = (params.get("q") ?? "").trim().toLowerCase(), author = (params.get("author") ?? "").trim().toLowerCase();
  demand(["all", "visible", "pending", "hidden", "deleted"].includes(status), "状态筛选无效。");
  demand(["all", "post", "comment"].includes(kind), "类型筛选无效。");
  demand(query.length <= 100 && author.length <= 100, "搜索条件过长。");
  const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1));
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const where = "e.kind IN ('post','comment') AND ($1='all' OR e.kind=$1) AND ($2='all' OR e.data::jsonb->>'status'=$2) AND ($3='' OR lower(COALESCE(e.data::jsonb->>'title','')||' '||COALESCE(e.data::jsonb->>'body','')) LIKE '%'||$3||'%') AND ($4='' OR lower(COALESCE(a.name,'')) LIKE '%'||$4||'%')";
    const values = [kind, status, query, author];
    const total = Number((await client.query(`SELECT count(*) AS count FROM entities e LEFT JOIN accounts a ON a.id=e.owner_id WHERE ${where}`, values)).rows[0].count);
    const rows = (await client.query(`SELECT e.id,e.kind,e.owner_id AS "ownerId",e.data,e.created_at AS "createdAt",e.version,COALESCE(a.name,'已注销用户') AS author,p.data AS "parentData" FROM entities e LEFT JOIN accounts a ON a.id=e.owner_id LEFT JOIN entities p ON p.id=e.data::jsonb->>'postId' AND p.kind='post' WHERE ${where} ORDER BY e.created_at DESC,e.id DESC LIMIT 50 OFFSET $5`, [...values, (page - 1) * 50])).rows;
    const items = await Promise.all(rows.map(async (row) => {
      const data = JSON.parse(row.data), parentData = row.parentData ? JSON.parse(row.parentData) : null;
      const neighbors = row.kind === "comment" ? (await client.query("SELECT id,data::jsonb->>'body' AS body FROM entities WHERE kind='comment' AND data::jsonb->>'postId'=$1 AND data::jsonb->>'status'='visible' AND id<>$2 ORDER BY abs(extract(epoch FROM (created_at::timestamptz-$3::timestamptz))),created_at LIMIT 2", [data.postId, row.id, row.createdAt])).rows : [];
      return { id: row.id, kind: row.kind, title: row.kind === "post" ? String(data.title ?? "") : `评论 · ${String(parentData?.title ?? "原帖子")}`, body: String(data.body ?? ""), author: row.author, ownerId: row.ownerId, status: String(data.status ?? ""), createdAt: row.createdAt, version: row.version, postTitle: parentData?.title, postExcerpt: parentData ? String(parentData.body ?? "").slice(0, 300) : void 0, neighborComments: neighbors.map((item) => ({ id: item.id, body: item.body })) };
    }));
    return { items, total, page, hasMore: page * 50 < total };
  });
}
async function postgresWorkspace(db2, token) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    if (actor.roles.length === 0) {
      const ownKinds = ["profile", "preferences", "verifiedEmail", "companionIdentity", "studentIdentityRequest"];
      const ownRows = (await client.query("SELECT * FROM entities WHERE owner_id=$1 AND kind=ANY($2::text[]) ORDER BY created_at DESC,id", [actor.id, ownKinds])).rows;
      const ownEntities = await Promise.all(ownRows.map(decodePostgresEntity));
      const notifications2 = (await client.query('SELECT id,entity_id AS "entityId",event,body,created_at AS "createdAt",read_at AS "readAt" FROM notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 50', [actor.id])).rows;
      const people2 = projectDisplayPeople(actor, [{ id: actor.id, name: actor.name, organization: actor.organization, status: actor.status, roles: actor.roles }], /* @__PURE__ */ new Set([actor.id]), ownEntities.filter((e) => e.kind === "preferences"), ownEntities.filter((e) => e.kind === "profile"));
      return { account: { ...actor, studentNumber: null }, sports: null, sportsStatus: "unavailable", entities: ownEntities, people: people2, notifications: notifications2, relations: [], audit: [], notificationBatches: [], relationshipHistory: [], alumni: { profiles: [], follows: [], slots: [], bookings: [], notices: [], history: [] }, capabilities: { schoolIdentity: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "external-service-required" } };
    }
    const rows = (await client.query(`SELECT id,kind,owner_id,data,version,created_at,updated_at FROM (SELECT e.*,row_number() OVER (PARTITION BY e.kind ORDER BY e.created_at DESC,e.id) AS rn FROM entities e WHERE
      e.kind NOT IN ('post','comment','room') OR
      (e.kind='post' AND (e.owner_id=$1 OR (e.data::jsonb->>'status'='visible' AND e.id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save')))) OR
      (e.kind='room' AND (e.owner_id=$1 OR e.data::jsonb->'members' ? $1 OR e.id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save') OR e.id IN (SELECT data::jsonb->>'roomId' FROM entities WHERE kind='roomApplication' AND owner_id=$1))) OR
      (e.kind='comment' AND (e.owner_id=$1 OR e.data::jsonb->>'postId' IN (SELECT id FROM entities WHERE kind='post' AND (owner_id=$1 OR id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save')))))
      ) scoped WHERE scoped.kind NOT IN ('post','comment','room') OR scoped.rn<=50 ORDER BY created_at DESC,id`, [actor.id])).rows;
    const entities = await Promise.all(rows.map(decodePostgresEntity));
    const people = await new PostgresRepository(client).people();
    const repo = {
      all: (kind) => entities.filter((entity) => entity.kind === kind),
      get: (id, kind) => {
        const entity = entities.find((item) => item.id === id);
        demand(entity && (!kind || entity.kind === kind), "对象不存在。", 404);
        return entity;
      },
      people: () => people
    };
    const audit = (await client.query("SELECT id,actor_id,role,action,entity_id,reason,data,created_at FROM audit WHERE actor_id=$1 OR action IN ('room.create','room.decide','room.finish','room.moderate') OR ($2 AND action='notification.send') ORDER BY created_at DESC,sequence DESC LIMIT 2000", [actor.id, actor.roles.includes("superadmin")])).rows;
    const allNotifications = (await client.query('SELECT id,recipient_id,entity_id AS "entityId",event,body,created_at AS "createdAt",read_at AS "readAt" FROM notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 100', [actor.id])).rows;
    const notifications = allNotifications.map((row) => ({ id: row.id, entityId: row.entityId, event: row.event, body: row.body, createdAt: row.createdAt, readAt: row.readAt }));
    const batchIds = audit.filter((row) => row.action === "notification.send").map((row) => String(row.entity_id));
    const batchRows = batchIds.length ? (await client.query("SELECT entity_id AS id,count(*) AS total,count(read_at) AS read FROM notifications WHERE entity_id=ANY($1::text[]) GROUP BY entity_id", [batchIds])).rows : [];
    const batchStats = new Map(batchRows.map((row) => [row.id, { total: Number(row.total), read: Number(row.read) }]));
    const relations = (await client.query('SELECT entity_id AS "entityId",kind,created_at AS "createdAt" FROM relations WHERE account_id=$1', [actor.id])).rows;
    const number = recordedStudentNumber(actor, repo.all("companionIdentity"));
    return projectWorkspace({
      repo,
      firstLoginOnly: passwordChangeRequired(repo.all("companionIdentity"), actor),
      studentNumber: number,
      sports: null,
      notifications,
      relations,
      audit: audit.slice(0, 200),
      coffeeHistory: (id) => audit.filter((row) => row.entity_id === id && ["coffee.book", "coffee.move", "coffee.answer", "coffee.cancel"].includes(String(row.action))).map((row) => {
        const data = JSON.parse(String(row.data));
        return { id: row.id, action: row.action, reason: row.reason, at: row.created_at, ...row.action === "coffee.answer" && typeof data.accepted === "boolean" ? { accepted: data.accepted } : {} };
      }),
      relationshipHistory: (visible) => projectRelationshipHistory(
        actor.id,
        visible,
        audit.filter((row) => row.actor_id === actor.id && row.action === "relation.set").map((row) => ({ entityId: String(row.entity_id), data: String(row.data), at: String(row.created_at) })),
        audit.filter((row) => ["room.create", "room.decide", "room.finish", "room.moderate"].includes(String(row.action))).map((row) => ({ action: String(row.action), data: String(row.data), at: String(row.created_at) }))
      ),
      notificationBatches: audit.filter((row) => row.action === "notification.send" && (row.actor_id === actor.id || actor.roles.includes("superadmin"))).map((row) => {
        const stat = batchStats.get(String(row.entity_id)) ?? { total: 0, read: 0 };
        return { id: row.entity_id, createdAt: row.created_at, total: stat.total, read: stat.read, readRate: stat.total ? stat.read / stat.total : null };
      })
    }, actor);
  });
}
async function postgresStudentSearch(db2, token, query, origin = "unknown") {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
    const actor = await new PostgresAuth(db2).authenticate(token, client);
    validateStudentSearch(actor, query);
    const repo = new PostgresRepository(client);
    const identities = await repo.all("companionIdentity"), preferences = await repo.all("preferences"), profiles = await repo.all("profile");
    demand(identities.some((item) => item.ownerId === actor.id && item.data.role === "student" && item.data.status === "verified" && typeof item.data.studentNumber === "string" && item.data.studentNumber), "仅已核验学生可按学号查找。", 403);
    const now = Date.now(), subject = digest(actor.id), source = digest(origin);
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`student-search-source:${source}`]);
    const limits = (await client.query("SELECT count(*) FILTER (WHERE subject=$1 AND occurred_at>=$3) AS minute,count(*) FILTER (WHERE subject=$1 AND occurred_at>=$4) AS day,count(*) FILTER (WHERE origin=$2 AND occurred_at>=$3) AS source FROM security_rate_events WHERE category='student-search'", [subject, source, now - 6e4, now - 864e5])).rows[0];
    if (Number(limits.minute) >= 10 || Number(limits.day) >= 100 || Number(limits.source) >= 30) throw new ServiceError(429, "RATE_LIMITED", "请求过于频繁，请稍后再试。");
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('student-search',$1,$2,$3)", [subject, source, now]);
    const ids = [...new Set(identities.filter((i) => i.data.studentNumber === query.trim()).map((i) => i.ownerId))];
    const rows = (await client.query("SELECT * FROM accounts WHERE id=ANY($1::text[]) AND login_kind='PERSONAL'", [ids])).rows;
    return { students: rows.flatMap((row) => studentSearchResult(account(row), preferences.find((p) => p.ownerId === row.id)?.data, identities, profiles.find((p) => p.ownerId === row.id)?.data).students) };
  });
}
async function postgresPersonHover(db2, token, personId, studentNumber) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const viewer = await new PostgresAuth(db2).authenticate(token, client);
    demand(viewer.roles.length > 0 && viewer.status !== "banned", "请先完成校园身份核验。", 403);
    const repo = new PostgresRepository(client);
    const business = personId === viewer.id || (await client.query("SELECT 1 FROM entities WHERE (kind='post' AND owner_id=$1 AND data::jsonb->>'status'='visible') OR (kind='room' AND data::jsonb->>'visibility'='visible' AND (owner_id=$1 OR data::jsonb->'members' ? $1)) OR (kind='activity' AND owner_id=$1 AND data::jsonb->>'status'='published') LIMIT 1", [personId])).rows.length > 0;
    const account2 = business ? (await client.query("SELECT id,name,organization,status,roles FROM accounts WHERE id=$1 AND login_kind<>'HISTORY'", [personId])).rows[0] : void 0;
    const [preferences, profiles] = await Promise.all([repo.all("preferences"), repo.all("profile")]);
    const visible = account2 ? projectDisplayPeople(viewer, [{ ...account2, roles: JSON.parse(account2.roles) }], /* @__PURE__ */ new Set([personId]), preferences, profiles)[0] : void 0;
    const searched = !visible && studentNumber ? (await postgresStudentSearch(db2, token, studentNumber)).students.find((person2) => person2.id === personId) : void 0;
    const person = visible ?? searched;
    demand(person, "用户当前不可查看。", 404);
    const prefs = preferences.find((item) => item.ownerId === personId)?.data;
    const [rooms, activities, marks] = await Promise.all([
      repo.all("room"),
      repo.all("activity"),
      client.query(`SELECT entity_id AS id,created_at AS "createdAt" FROM relations WHERE account_id=$1 AND kind='participate' ORDER BY created_at DESC`, [personId])
    ]);
    return projectPersonHover(viewer, personId, person, prefs, rooms, activities, marks.rows);
  });
}
const canReview = (actor) => actor.roles.includes("reviewer") || actor.roles.includes("superadmin");
async function current$1(client, accountId) {
  const row = (await client.query("SELECT * FROM entities WHERE kind='studentIdentityRequest' AND owner_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1", [accountId])).rows[0];
  return row ? decodePostgresEntity(row) : null;
}
async function confirmedEmail(client, actor) {
  return (await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1", [actor.id, actor.email])).rows.length > 0;
}
async function grant(client, repo, request, reviewerId, source, evidenceId) {
  const accountId = request.ownerId, number = String(request.data.studentNumber);
  const conflict = await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id<>$1 AND data::jsonb->>'role'='student' AND data::jsonb->>'status'='verified' AND data::jsonb->>'studentNumber'=$2 LIMIT 1", [accountId, number]);
  demand(!conflict.rows.length, "该学号已绑定其他账号，请联系审核员核查。", 409);
  const existing = (await repo.all("companionIdentity")).find((item) => item.ownerId === accountId && item.data.role === "student" && item.data.status === "verified");
  demand(!existing || existing.data.studentNumber === number, "已有不同学号的有效学生身份，请人工复核。", 409);
  if (!existing) await repo.create("companionIdentity", accountId, { role: "student", status: "verified", studentNumber: number, schoolName: request.data.schoolName, schoolEmail: request.data.email, source, evidenceId, verifiedBy: reviewerId, verifiedAt: timestamp() });
  const account2 = (await client.query("SELECT roles FROM accounts WHERE id=$1 FOR UPDATE", [accountId])).rows[0];
  await client.query("UPDATE accounts SET name=$1,roles=$2 WHERE id=$3", [request.data.schoolName, JSON.stringify([.../* @__PURE__ */ new Set([...JSON.parse(account2.roles), "student"])]), accountId]);
  await repo.notify([accountId], request.id, "student.identity.verified", "学生身份已核验，现可使用校园服务。");
}
async function postgresOwnStudentIdentity(db2, actor) {
  return db2.transaction(async (client) => {
    const request = await current$1(client, actor.id);
    return { status: request?.data.status ?? (actor.roles.includes("student") ? "verified" : "unrequested"), request: request ? { id: request.id, status: request.data.status, studentNumber: request.data.studentNumber, schoolName: request.data.schoolName, reason: request.data.reason, createdAt: request.createdAt, updatedAt: request.updatedAt } : null, schoolService: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "unconfigured" };
  });
}
async function postgresRequestStudentIdentity(db2, actor, input) {
  demand(actor.status === "active", "当前账号状态不能申请学生身份。", 403);
  const candidate = studentIdentityCandidate(input);
  await db2.transaction(async (client) => {
    demand(await confirmedEmail(client, actor), "请先验证本人当前邮箱。", 403);
    const previous = await current$1(client, actor.id);
    demand(!previous || !["pending", "verified"].includes(String(previous.data.status)), "当前申请已在处理中或已核验。", 409);
  });
  const school = await verifyStudentAtSchool(actor, candidate);
  return db2.transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`student-identity:${actor.id}`]);
    demand(await confirmedEmail(client, actor), "请先验证本人当前邮箱。", 403);
    const previous = await current$1(client, actor.id);
    demand(!previous || !["pending", "verified"].includes(String(previous.data.status)), "当前申请已在处理中或已核验。", 409);
    const repo = new PostgresRepository(client);
    const request = await repo.create("studentIdentityRequest", actor.id, { ...candidate, email: actor.email, status: "pending", reason: "等待校方核验结果或审核员核对正式证明。" });
    if (school.verified) {
      await grant(client, repo, request, "school-service", "school-service", school.subject);
      await repo.save(request, { status: "verified", reason: "校方在读身份核验通过。", source: "school-service", evidenceId: school.subject, reviewedAt: timestamp() });
    }
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), actor.id, actor.roles.join(","), "student.identity.request", request.id, "", JSON.stringify({ schoolVerified: school.verified }), timestamp()]);
    return { status: school.verified ? "verified" : "pending", request: { id: request.id, status: school.verified ? "verified" : "pending", studentNumber: candidate.studentNumber, schoolName: candidate.schoolName, reason: school.verified ? "校方在读身份核验通过。" : "等待校方核验结果或审核员核对正式证明。" }, schoolService: process.env.BNBU_IDENTITY_VERIFICATION_URL ? "configured" : "unconfigured" };
  });
}
async function postgresListStudentIdentityRequests(db2, actor, params) {
  demand(canReview(actor), "需要审核职责。", 403);
  const status = params.get("status") ?? "pending", query = (params.get("query") ?? "").trim().toLowerCase();
  demand(["pending", "verified", "rejected", "revoked", "all"].includes(status), "状态筛选无效。");
  demand(query.length <= 100, "搜索条件过长。");
  const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1));
  return db2.transaction(async (client) => {
    const predicate = "kind='studentIdentityRequest' AND ($1='all' OR data::jsonb->>'status'=$1) AND ($2='' OR lower(concat_ws(' ',data::jsonb->>'studentNumber',data::jsonb->>'schoolName',data::jsonb->>'email')) LIKE '%'||$2||'%')";
    const total = Number((await client.query(`SELECT count(*) AS count FROM entities WHERE ${predicate}`, [status, query])).rows[0].count);
    const rows = (await client.query(`SELECT * FROM entities WHERE ${predicate} ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET $3`, [status, query, (page - 1) * 50])).rows;
    const items = await Promise.all(rows.map(decodePostgresEntity));
    return { items: items.map((item) => ({ id: item.id, ownerId: item.ownerId, studentNumber: item.data.studentNumber, schoolName: item.data.schoolName, email: item.data.email, status: item.data.status, reason: item.data.reason, source: item.data.source, evidenceId: item.data.evidenceId, version: item.version, createdAt: item.createdAt, updatedAt: item.updatedAt })), total, page, hasMore: page * 50 < total };
  });
}
async function postgresReviewStudentIdentity(db2, actor, input) {
  demand(canReview(actor), "需要审核职责。", 403);
  const id = typeof input.id === "string" ? input.id : "", decision = input.decision;
  demand(["approve", "reject", "revoke"].includes(String(decision)), "处理决定无效。");
  demand(typeof input.version === "number" && Number.isInteger(input.version), "请刷新申请后重试。", 409);
  const reason = typeof input.reason === "string" ? input.reason.trim() : "", evidenceId = typeof input.evidenceId === "string" ? input.evidenceId.trim() : "";
  demand(reason.length > 0 && reason.length <= 500, "请填写处理原因。");
  if (decision === "approve") demand(evidenceId.length >= 4 && evidenceId.length <= 200, "请填写校方正式查询结果或可核验证明的依据标识。");
  if (decision === "revoke") demand(actor.roles.includes("superadmin"), "只有超级管理员可撤销学生身份。", 403);
  return db2.transaction(async (client) => {
    const row = (await client.query("SELECT * FROM entities WHERE id=$1 AND kind='studentIdentityRequest' FOR UPDATE", [id])).rows[0];
    demand(row, "申请不存在。", 404);
    const request = await decodePostgresEntity(row), repo = new PostgresRepository(client);
    demand(request.version === input.version, "申请已变化，请刷新后重试。", 409);
    demand(decision === "revoke" ? request.data.status === "verified" : request.data.status === "pending", "申请状态已变化。", 409);
    if (decision === "approve") await grant(client, repo, request, actor.id, "manual-school-evidence", evidenceId);
    if (decision === "revoke") {
      for (const identity of (await repo.all("companionIdentity")).filter((item) => item.ownerId === request.ownerId && item.data.role === "student" && item.data.status === "verified")) await repo.save(identity, { status: "revoked", revokedBy: actor.id, revokedAt: timestamp(), revokeReason: reason });
      const account2 = (await client.query("SELECT roles FROM accounts WHERE id=$1 FOR UPDATE", [request.ownerId])).rows[0];
      await client.query("UPDATE accounts SET roles=$1 WHERE id=$2", [JSON.stringify(JSON.parse(account2.roles).filter((role) => role !== "student")), request.ownerId]);
    }
    const status = decision === "approve" ? "verified" : decision === "reject" ? "rejected" : "revoked";
    await repo.save(request, { status, reason, evidenceId: decision === "approve" ? evidenceId : request.data.evidenceId, source: decision === "approve" ? "manual-school-evidence" : request.data.source, reviewedBy: actor.id, reviewedAt: timestamp() });
    await repo.notify([request.ownerId], request.id, "student.identity." + status, `学生身份${status === "verified" ? "核验通过" : status === "rejected" ? "申请已驳回" : "已撤销"}：${reason}`);
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), actor.id, actor.roles.join(","), "student.identity." + decision, id, reason, JSON.stringify({ status, evidenceId: decision === "approve" ? evidenceId : void 0 }), timestamp()]);
    return { id, status };
  });
}
const reply = { sent: true, message: "如果账号存在且邮箱已验证，找回验证码已发送。" };
function identifier(value) {
  demand(typeof value === "string" && value.trim().length > 0 && value.trim().length <= 254, "请填写邮箱或管理登录账号。");
  return value.trim().toLowerCase();
}
async function postgresRequestPasswordReset(db2, value, origin, localOutbox) {
  demand(localOutbox || process.env.BNBU_EMAIL_DELIVERY_URL, "尚未配置验证码邮件服务。", 503);
  const key = identifier(value), now = Date.now(), subject = digest(key), source = digest(origin);
  const message = await db2.transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`email-source:${source}`]);
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [`password-reset:${key}`]);
    const limits = (await client.query("SELECT count(*) FILTER (WHERE category='password-reset' AND subject=$1 AND occurred_at>=$3) AS key_count,count(*) FILTER (WHERE category='password-reset' AND subject=$1) AS day_count,count(DISTINCT subject) FILTER (WHERE category='email-send' AND origin=$2 AND occurred_at>=$3) AS source_count,count(*) FILTER (WHERE category='email-send' AND occurred_at>=$3) AS global_count FROM security_rate_events WHERE occurred_at>=$4", [subject, source, now - 36e5, now - 864e5])).rows[0];
    if (Number(limits.key_count) >= 5 || Number(limits.day_count) >= 10 || Number(limits.source_count) >= 20 || Number(limits.global_count) >= 1e3) return null;
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('password-reset',$1,$2,$3)", [subject, source, now]);
    await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('email-send',$1,$2,$3)", [subject, source, now]);
    const account2 = (await client.query("SELECT id,email,login_kind FROM accounts WHERE (login_kind='PERSONAL' AND email=$1) OR (login_kind='ADMIN' AND login_name=$1) LIMIT 1", [key])).rows[0];
    if (!account2) return null;
    const proof = account2.login_kind === "PERSONAL" ? await client.query("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=$1 AND data::jsonb->>'email'=$2 LIMIT 1", [account2.id, account2.email]) : await client.query("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=$1 AND data::jsonb->>'role'='admin' AND data::jsonb->>'status'='verified' AND data::jsonb->>'schoolEmailVerified'='true' AND data::jsonb->>'schoolEmail'=$2 LIMIT 1", [account2.id, account2.email]);
    if (!proof.rows.length) return null;
    const emailSubject = digest(account2.email);
    const emailLimits = (await client.query("SELECT count(*) FILTER (WHERE occurred_at>=$2) AS hour,count(*) AS day FROM security_rate_events WHERE category='email-send' AND subject=$1 AND occurred_at>=$3", [emailSubject, now - 36e5, now - 864e5])).rows[0];
    const includesCurrent = subject === emailSubject ? 1 : 0;
    if (Number(emailLimits.hour) - includesCurrent >= 5 || Number(emailLimits.day) - includesCurrent >= 10) return null;
    const previous = (await client.query("SELECT sent_at FROM password_reset_challenges WHERE account_id=$1 ORDER BY sent_at DESC LIMIT 1", [account2.id])).rows[0];
    if (previous && now - Number(previous.sent_at) < 6e4) return null;
    const id = randomUUID(), mailId = randomUUID(), code = String(randomInt(1e5, 1e6));
    await client.query("UPDATE password_reset_challenges SET consumed_at=$1 WHERE account_id=$2 AND consumed_at IS NULL", [now, account2.id]);
    await client.query("INSERT INTO password_reset_challenges(id,account_id,identifier,email,code_hash,expires_at,sent_at) VALUES($1,$2,$3,$4,$5,$6,$7)", [id, account2.id, key, account2.email, digest(id + ":" + code), now + 6e5, now]);
    const outbox = { id: mailId, recipient: account2.email, subject: "伴学找回密码", body: `验证码：${code}，10 分钟内有效。` };
    await client.query("INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)", [mailId, outbox.recipient, outbox.subject, outbox.body, timestamp()]);
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), account2.id, "", "auth.password.reset.request", account2.id, "", JSON.stringify({ challengeId: id }), timestamp()]);
    return outbox;
  });
  if (message && process.env.BNBU_EMAIL_DELIVERY_URL) {
    try {
      await deliverMessage(message, process.env.BNBU_EMAIL_DELIVERY_URL);
      await db2.pool.query("UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2", [timestamp(), message.id]);
    } catch (error) {
      console.error("Password reset mail delivery unconfirmed:", error);
    }
  }
  return reply;
}
async function postgresCompletePasswordReset(db2, input) {
  const key = identifier(input.identifier);
  demand(typeof input.code === "string" && /^\d{6}$/.test(input.code), "请填写六位验证码。");
  const passwordHash = hashPassword(input.password);
  const result = await db2.transaction(async (client) => {
    const row = (await client.query("SELECT * FROM password_reset_challenges WHERE identifier=$1 ORDER BY sent_at DESC LIMIT 1 FOR UPDATE", [key])).rows[0];
    if (!row || row.consumed_at !== null || Number(row.expires_at) <= Date.now() || row.attempts >= 5) return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    await client.query("UPDATE password_reset_challenges SET attempts=attempts+1 WHERE id=$1", [row.id]);
    if (row.code_hash !== digest(row.id + ":" + input.code)) return new ServiceError(400, "INVALID_CHALLENGE", `验证码错误，剩余 ${Math.max(0, 4 - row.attempts)} 次。`);
    const account2 = (await client.query("SELECT email FROM accounts WHERE id=$1 FOR UPDATE", [row.account_id])).rows[0];
    if (!account2 || account2.email !== row.email) return new ServiceError(409, "ACCOUNT_CHANGED", "账号邮箱已变化，请重新申请。");
    await client.query("UPDATE accounts SET password_hash=$1 WHERE id=$2", [passwordHash, row.account_id]);
    await client.query("DELETE FROM sessions WHERE account_id=$1", [row.account_id]);
    await client.query("UPDATE password_reset_challenges SET consumed_at=$1 WHERE account_id=$2 AND consumed_at IS NULL", [Date.now(), row.account_id]);
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), row.account_id, "", "auth.password.reset.complete", row.account_id, "", JSON.stringify({ challengeId: row.id, sessionsRevoked: true }), timestamp()]);
    return { reset: true };
  });
  if (result instanceof ServiceError) throw result;
  return result;
}
async function postgresAccountDirectory(db2, token, kind, input) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const actor = await new PostgresAuth(db2).authenticate(token, client), repo = new PostgresRepository(client);
    const identities = await repo.all("companionIdentity");
    if (passwordChangeRequired(identities, actor)) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
    const identity = identities.find((i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified");
    demand(identity && actor.status !== "banned" && (actor.roles.includes("superadmin") || Array.isArray(identity.data.permissions) && identity.data.permissions.includes("ACCOUNTS")), "没有该账号管理权限。", 403);
    const entities = identities;
    const accounts = (await client.query("SELECT id,name,organization,status,email FROM accounts")).rows;
    const page = projectAccountDirectory({ all: (type) => entities.filter((e) => e.kind === type) }, accounts, kind, input);
    return page;
  });
}
async function current(db2, client, token) {
  const actor = await new PostgresAuth(db2).authenticate(token, client), repo = new PostgresRepository(client);
  const identities = await repo.all("companionIdentity");
  if (passwordChangeRequired(identities, actor)) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
  const identity = identities.find((i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified");
  const account2 = (await client.query("SELECT email,status,login_kind,roles FROM accounts WHERE id=$1", [actor.id])).rows[0];
  demand(identity && account2?.status === "active" && (account2.login_kind === "ADMIN" || JSON.parse(account2.roles).includes("superadmin")), "仅当前有效管理员可验证本人邮箱。", 403);
  return { actor, repo, identity, email: String(account2.email) };
}
async function postgresAdminEmailStatus(db2, token) {
  return db2.transaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const { identity, email } = await current(db2, client, token);
    return { email, verified: identity.data.schoolEmailVerified === true && identity.data.schoolEmail === email };
  });
}
async function postgresAdminEmailRequest(db2, token, localOutbox) {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const message = await db2.transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(18422,2)");
    const { actor, identity, email } = await current(db2, client, token), now = Date.now();
    const previous = (await client.query("SELECT sent_at FROM admin_security_challenges WHERE account_id=$1 AND purpose='EMAIL_VERIFY' ORDER BY sent_at DESC LIMIT 1", [actor.id])).rows[0];
    demand(!previous || now - Number(previous.sent_at) >= 6e4, "请稍后再发送验证码。", 429);
    const id = randomUUID(), mailId = randomUUID(), code = String(randomInt(1e5, 1e6));
    await client.query("UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=$1 WHERE account_id=$2 AND purpose='EMAIL_VERIFY' AND consumed_at IS NULL", [now, actor.id]);
    await client.query("INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES($1,$2,'EMAIL_VERIFY',$3,$4,$5,$6,$7,$8)", [id, actor.id, email, digest(id + ":" + code), now + 6e5, now, identity.version, mailId]);
    const item = { id: mailId, recipient: email, subject: "伴学管理账号邮箱验证", body: `验证码：${code}，10分钟内有效，仅用于验证管理账号邮箱。` };
    await client.query("INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)", [item.id, email, item.subject, item.body, timestamp()]);
    return { ...item, challengeId: id };
  });
  if (endpoint) {
    await deliverMessage(message, endpoint);
    await db2.pool.query("UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2", [timestamp(), message.id]);
  }
  return { sent: true, delivery: endpoint ? "email" : "local-outbox", message: endpoint ? "验证码已发送，请查看邮箱。" : "验证码已写入本地开发收件箱，未发送至真实邮箱。", challengeId: message.challengeId };
}
async function postgresAdminEmailConfirm(db2, token, input) {
  demand(Object.keys(input).every((k) => ["challengeId", "code"].includes(k)), "邮箱验证参数无效。");
  const id = textField(input, "challengeId", 100), code = textField(input, "code", 20);
  const result = await db2.transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(18422,2)");
    const { actor, repo, identity, email } = await current(db2, client, token), now = Date.now();
    const row = (await client.query("SELECT * FROM admin_security_challenges WHERE id=$1 AND account_id=$2 AND purpose='EMAIL_VERIFY' FOR UPDATE", [id, actor.id])).rows[0];
    if (!row || row.consumed_at !== null || Number(row.expires_at) <= now || Number(row.attempts) >= 5) return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    await client.query("UPDATE admin_security_challenges SET attempts=attempts+1 WHERE id=$1", [id]);
    if (row.code_hash !== digest(id + ":" + code)) return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    if (row.email !== email || Number(row.identity_version) !== identity.version) return new ServiceError(409, "VERSION_CONFLICT", "账号资料已变化，请重新获取验证码。");
    await repo.save(identity, { schoolEmail: email, schoolEmailVerified: true, schoolEmailVerifiedAt: now });
    await client.query("UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=$1 WHERE id=$2", [now, id]);
    await client.query("DELETE FROM mail_outbox WHERE id=$1", [row.mail_id]);
    await client.query("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [randomUUID(), actor.id, "admin", "accounts.email.verify", identity.id, "", JSON.stringify({ purpose: "EMAIL_VERIFY", result: "VERIFIED" }), timestamp()]);
    return { verified: true };
  });
  if (result instanceof ServiceError) throw result;
  return result;
}
function createPostgresApiServer(db2, options = {}) {
  demand(options.surface !== "sports", "伴学不提供独立体育服务。", 404);
  const auth = new PostgresAuth(db2), mail = new PostgresEmail(db2);
  const origins = new Set(options.origins ?? ["http://127.0.0.1:4174", "http://localhost:4174"]);
  const cookieName = "bnbu_session";
  const cookieToken$1 = (request) => cookieToken(request, cookieName);
  const cookie = (token, age) => `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${options.secureCookies ? "; Secure" : ""}`;
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://localhost");
      const pathname = requestUrl.pathname;
      const sportsPath = pathname.startsWith("/api/v1/") || pathname.startsWith("/api/sports/");
      demand(!sportsPath, "接口不存在。", 404);
      if (request.method === "GET" && (pathname === "/api/rooms" || /^\/api\/rooms\/[^/]+$/.test(pathname))) {
        const actor = await auth.authenticate(cookieToken$1(request));
        student(actor);
        demand(actor.status !== "banned", "账号已封禁。", 403);
        const mustChange = await db2.transaction(async (client) => passwordChangeRequired(await new PostgresRepository(client).all("companionIdentity"), actor));
        if (mustChange) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
        const id = pathname === "/api/rooms" ? null : decodeURIComponent(pathname.slice("/api/rooms/".length));
        return send(response, 200, id === null ? await searchPostgresRooms(db2, actor, requestUrl.searchParams) : await postgresRoomDetail(db2, actor, id));
      }
      const accountDirectory = /^\/api\/accounts\/(students|teachers)$/.exec(pathname);
      if (request.method === "GET" && accountDirectory) return send(response, 200, await postgresAccountDirectory(db2, cookieToken$1(request) ?? "", accountDirectory[1] === "students" ? "student" : "teacher", Object.fromEntries(new URL(request.url, "http://localhost").searchParams)));
      if (request.method === "GET" && pathname === "/api/accounts/administrator-self") return send(response, 200, await postgresAdministratorSelf(db2, cookieToken$1(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/accounts/admin-email") return send(response, 200, await postgresAdminEmailStatus(db2, cookieToken$1(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/accounts/administrators") return send(response, 200, await postgresAdministratorDirectory(db2, cookieToken$1(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/students/search") return send(response, 200, await postgresStudentSearch(db2, cookieToken$1(request) ?? "", new URL(request.url, "http://localhost").searchParams.get("number") ?? "", request.socket.remoteAddress ?? "unknown"));
      const hoverMatch = request.method === "GET" && /^\/api\/people\/([^/]+)\/hover$/.exec(pathname);
      if (hoverMatch) return send(response, 200, await postgresPersonHover(db2, cookieToken$1(request) ?? "", decodeURIComponent(hoverMatch[1]), new URL(request.url, "http://localhost").searchParams.get("number") ?? void 0));
      if (request.method === "GET" && pathname === "/api/workspace") return send(response, 200, await postgresWorkspace(db2, cookieToken$1(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/identity/me") return send(response, 200, await postgresOwnStudentIdentity(db2, await auth.authenticate(cookieToken$1(request))));
      if (request.method === "GET" && pathname === "/api/identity/requests") return send(response, 200, await postgresListStudentIdentityRequests(db2, await auth.authenticate(cookieToken$1(request)), new URL(request.url, "http://localhost").searchParams));
      if (request.method === "GET" && pathname === "/api/community") return send(response, 200, await postgresCommunityFeed(db2, cookieToken$1(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/discover/hot") return send(response, 200, await postgresDiscoverHotPage(db2, cookieToken$1(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/community/social") return send(response, 200, await postgresCommunitySocial(db2, cookieToken$1(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/community/feed") return send(response, 200, await postgresCommunityFeed(db2, cookieToken$1(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/admin/community/moderation") return send(response, 200, await postgresModerationPage(db2, await auth.authenticate(cookieToken$1(request)), requestUrl.searchParams));
      const communityDetail = request.method === "GET" && /^\/api\/community\/posts\/([^/]+)$/.exec(pathname);
      if (communityDetail) return send(response, 200, await postgresCommunityPostDetail(db2, cookieToken$1(request) ?? "", decodeURIComponent(communityDetail[1]), Number(requestUrl.searchParams.get("page")) || 1));
      if (request.method === "GET" && pathname === "/api/health") {
        const result = await db2.pool.query("SELECT MAX(version) AS version FROM backend_migrations");
        return send(response, 200, { ok: true, storage: "postgresql", schemaVersion: result.rows[0].version });
      }
      if (request.method === "GET" && pathname === "/api/auth/me") return send(response, 200, { account: await auth.authenticate(cookieToken$1(request)) });
      if (request.method === "POST") {
        demand(!request.headers.origin || origins.has(request.headers.origin), "来源不允许。", 403);
        demand(request.headers["sec-fetch-site"] !== "cross-site", "跨站请求不允许。", 403);
        if (pathname === "/api/timetable/recognize") {
          const actor = await auth.authenticate(cookieToken$1(request));
          student(actor);
          demand(actor.status !== "banned", "账号已封禁。", 403);
          const mustChange = await db2.transaction(async (client) => passwordChangeRequired(await new PostgresRepository(client).all("companionIdentity"), actor));
          if (mustChange) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
          return send(response, 200, await recognize(request));
        }
        if (pathname === "/api/activity/screenshot/import") {
          const token = cookieToken$1(request) ?? "";
          const actor = await auth.authenticate(token);
          demand(actor.status === "active" && actor.roles.some((role) => role === "operator" || role === "superadmin"), "需要运营职责。", 403);
          const mustChange = await db2.transaction(async (client) => passwordChangeRequired(await new PostgresRepository(client).all("companionIdentity"), actor));
          if (mustChange) throw new ServiceError(403, "PASSWORD_CHANGE_REQUIRED", "请先修改本人初始密码，再继续操作。");
          const image = await recognizeActivityScreenshot(request, options.screenshotRecognizer);
          return send(response, 200, { data: await executePostgres(db2, token, "screenshot.import", { image: image.image, recognizedText: image.text, ocrRequestId: image.requestId }, randomUUID()) });
        }
        const input = await body(request);
        if (pathname === "/api/accounts/admin-email/request") {
          demand(Object.keys(input).length === 0, "邮箱验证只能使用本人当前邮箱。");
          return send(response, 200, await postgresAdminEmailRequest(db2, cookieToken$1(request) ?? "", options.localOutbox === true));
        }
        if (pathname === "/api/accounts/admin-email/confirm") return send(response, 200, await postgresAdminEmailConfirm(db2, cookieToken$1(request) ?? "", input));
        if (pathname === "/api/identity/check") return send(response, 200, await checkSchoolIdentity(await auth.authenticate(cookieToken$1(request))));
        if (pathname === "/api/identity/request") return send(response, 200, await postgresRequestStudentIdentity(db2, await auth.authenticate(cookieToken$1(request)), input));
        if (pathname === "/api/identity/review") return send(response, 200, await postgresReviewStudentIdentity(db2, await auth.authenticate(cookieToken$1(request)), input));
        if (pathname === "/api/commands") {
          demand(input.action !== "screenshot.import", "请通过截图上传入口识别活动。", 403);
          const key = input.requestId;
          demand(typeof key === "string", "缺少操作幂等标识。");
          demand(typeof input.action === "string" && input.input && typeof input.input === "object" && !Array.isArray(input.input), "请求格式无效。");
          demand(!input.action.startsWith("sports."), "该操作不属于伴学系统。", 403);
          return send(response, 200, { data: await executePostgres(db2, cookieToken$1(request) ?? "", input.action, input.input, key) });
        }
        if (pathname === "/api/auth/sign-in" || pathname === "/api/auth/login" || pathname === "/api/auth/admin-login") {
          const kind = pathname.endsWith("/admin-login") ? "ADMIN" : pathname.endsWith("/login") ? "PERSONAL" : void 0;
          const result = await auth.login(kind === "ADMIN" ? input.loginName : kind === "PERSONAL" ? input.email : input.identifier, input.password, kind, void 0, request.socket.remoteAddress ?? "unknown");
          response.setHeader("Set-Cookie", cookie(result.token, 43200));
          return send(response, 200, { authenticated: true, account: result.account });
        }
        if (pathname === "/api/auth/verification-codes") return send(response, 200, await mail.sendVerification(input.email, options.localOutbox === true, request.socket.remoteAddress ?? "unknown"));
        if (pathname === "/api/auth/register") return send(response, 201, await mail.register(input));
        if (pathname === "/api/auth/password-reset/request") return send(response, 200, await postgresRequestPasswordReset(db2, input.identifier, request.socket.remoteAddress ?? "unknown", options.localOutbox === true));
        if (pathname === "/api/auth/password-reset/complete") return send(response, 200, await postgresCompletePasswordReset(db2, input));
        if (pathname === "/api/auth/logout") {
          await auth.logout(cookieToken$1(request));
          response.setHeader("Set-Cookie", cookie("", 0));
          return send(response, 200, { loggedOut: true });
        }
        if (pathname === "/api/auth/email/request" || pathname === "/api/auth/email/confirm") {
          const actor = await auth.authenticate(cookieToken$1(request));
          demand(actor.status !== "banned", "账号已封禁。", 403);
          return send(response, 200, pathname.endsWith("/request") ? await mail.sendVerification(actor.email, options.localOutbox === true, request.socket.remoteAddress ?? "unknown") : await mail.verifyOwnEmail(actor, input.code));
        }
      }
      return send(response, 404, { code: "NOT_FOUND", message: "接口不存在。" });
    } catch (error) {
      if (error instanceof ServiceError) return send(response, error.status, { code: error.code, message: error.message });
      console.error("PostgreSQL API request failed");
      return send(response, 500, { code: "INTERNAL_ERROR", message: "操作失败，请重试。" });
    }
  });
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for PostgreSQL");
configuredObjectStore();
const port = Number(process.env.BNBU_API_PORT ?? "4180");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid BNBU_API_PORT");
const surface = "companion";
if (process.env.BNBU_APP_SURFACE && process.env.BNBU_APP_SURFACE !== "companion") throw new Error("Only the Banxue companion service is supported");
const schema = process.env.BNBU_POSTGRES_SCHEMA ?? "public";
if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error("Invalid PostgreSQL schema");
const db = new PostgresDatabase({ connectionString: process.env.DATABASE_URL, options: `-c search_path=${schema}` });
await db.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
await db.migrate(postgresMigrations);
const server = createPostgresApiServer(db, {
  localOutbox: process.env.BNBU_LOCAL_OUTBOX === "1",
  surface,
  secureCookies: process.env.BNBU_SECURE_COOKIES === "1",
  origins: process.env.BNBU_ALLOWED_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean)
});
try {
  await new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(port, process.env.BNBU_API_HOST ?? "127.0.0.1", resolve2);
  });
} catch (error) {
  await db.close();
  throw error;
}
console.log(`BNBU PostgreSQL API listening on port ${port}; business route migration in progress`);
const mailbox = startActivityMailbox((actorId, input, requestId) => executePostgresMailboxImport(db, actorId, input, requestId));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
  mailbox?.stop();
  server.close(() => void db.close());
});
