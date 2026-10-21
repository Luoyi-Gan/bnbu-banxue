import { d as demand, v as version, m as matchesPassword, e as encodePassword, a as digest, t as transaction, b as deliverOutbox, c as textField, S as ServiceError, R as Repository, f as timestamp, g as accountSecurityGate, r as requireSuperAdmin, h as accountPermissions, n as normalizeEmail, i as has, p as projectWorkspace, s as studentNumber, j as requiresPasswordChange, k as authenticate, l as recordPostView, o as runSync, q as notificationPolicy, u as relationPolicy, w as communityCommand, x as coffeeCommand, y as governanceCommand, z as activityCommand, A as alumniCommand, B as relationshipHistory, C as filterCommunityCandidates, D as rankCommunity, E as communityHotForViewer, F as communitySocialRead, G as requireSocialAccess, H as readAlumni, I as communityCounts, J as projectCommunity, K as projectDisplayPeople, L as rankDiscoverHot, M as takeEmailSend, N as hashPassword, O as openDatabase, P as startActivityMailbox, Q as cookieToken, T as student, U as send, V as searchRooms, W as roomDetail, X as recognize, Y as recognizeActivityScreenshot, Z as body, _ as sendVerification, $ as verifyOwnEmail, a0 as register, a1 as loginUnified, a2 as loginAdministrator, a3 as login, a4 as checkSchoolIdentity, a5 as requestStudentIdentity, a6 as reviewStudentIdentity, a7 as ownStudentIdentity, a8 as listStudentIdentityRequests, a9 as accountDirectory, aa as searchStudents, ab as personHover } from "./http-D5d3Bq8l.js";
import { randomUUID, randomInt } from "node:crypto";
import { createServer } from "node:http";
import { resolve } from "node:path";
function passwordCommand(repo, actor, token, action, input) {
  if (action !== "accounts.password.change") return void 0;
  const identity = repo.all("companionIdentity").find(
    (i) => i.ownerId === actor.id && i.data.status === "verified" && ["teacher", "admin"].includes(String(i.data.role))
  );
  demand(
    identity && actor.status === "active",
    "仅有效教师或管理员可修改本人密码。",
    403
  );
  version(identity, input);
  demand(
    typeof input.currentPassword === "string" && typeof input.newPassword === "string" && input.newPassword.length > 0,
    "请填写当前密码和非空新密码。"
  );
  demand(input.newPassword === input.confirmPassword, "两次新密码不一致。");
  const row = repo.db.prepare("SELECT password_hash FROM accounts WHERE id=?").get(actor.id);
  demand(
    matchesPassword(input.currentPassword, String(row.password_hash)),
    "当前密码不正确。",
    403
  );
  repo.db.prepare("UPDATE accounts SET password_hash=? WHERE id=?").run(encodePassword(input.newPassword), actor.id);
  repo.db.prepare("DELETE FROM sessions WHERE account_id=? AND token_hash<>?").run(actor.id, digest(token));
  const saved = repo.save(identity, {
    mustChangePassword: false,
    passwordChangedAt: Date.now()
  });
  repo.notify(
    [actor.id],
    identity.id,
    action,
    "本人密码已更新，其他设备的登录状态已失效。"
  );
  return saved;
}
function current(repo, actor) {
  accountSecurityGate(repo, actor);
  const identity = repo.all("companionIdentity").find(
    (i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified"
  );
  const account = repo.db.prepare("SELECT email,status,login_kind,roles FROM accounts WHERE id=?").get(actor.id);
  demand(
    identity && account?.status === "active" && (account.login_kind === "ADMIN" || JSON.parse(String(account.roles)).includes("superadmin")),
    "仅当前有效管理员可验证本人邮箱。",
    403
  );
  return { identity, email: String(account.email) };
}
function adminEmailStatus(repo, actor) {
  const { identity, email } = current(repo, actor);
  return {
    email,
    verified: identity.data.schoolEmailVerified === true && identity.data.schoolEmail === email
  };
}
function clearAdminChallenges(repo, accountId) {
  const rows = repo.db.prepare("SELECT mail_id FROM admin_security_challenges WHERE account_id=?").all(accountId);
  repo.db.prepare("DELETE FROM admin_security_challenges WHERE account_id=?").run(accountId);
  for (const row of rows)
    repo.db.prepare("DELETE FROM mail_outbox WHERE id=?").run(row.mail_id);
}
async function requestAdminEmail(db, actor, localOutbox) {
  demand(
    localOutbox || process.env.BNBU_EMAIL_DELIVERY_URL,
    "尚未配置验证码邮件服务。",
    503
  );
  const repo = new Repository(db), now = Date.now(), id = randomUUID(), mailId = randomUUID();
  transaction(db, () => {
    const { identity, email } = current(repo, actor);
    const previous = db.prepare(
      "SELECT sent_at FROM admin_security_challenges WHERE account_id=? AND purpose='EMAIL_VERIFY' ORDER BY sent_at DESC LIMIT 1"
    ).get(actor.id);
    demand(
      !previous || now - Number(previous.sent_at) >= 6e4,
      "请稍后再发送验证码。",
      429
    );
    const code = String(randomInt(1e5, 1e6));
    db.prepare(
      "UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=? WHERE account_id=? AND purpose='EMAIL_VERIFY' AND consumed_at IS NULL"
    ).run(now, actor.id);
    db.prepare(
      "INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES(?,?,'EMAIL_VERIFY',?,?,?,?,?,?)"
    ).run(
      id,
      actor.id,
      email,
      digest(id + ":" + code),
      now + 6e5,
      now,
      identity.version,
      mailId
    );
    db.prepare(
      "INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)"
    ).run(
      mailId,
      email,
      "伴学管理账号邮箱验证",
      `验证码：${code}，10分钟内有效，仅用于验证管理账号邮箱。`,
      timestamp()
    );
  });
  const delivery = await deliverOutbox(db, mailId, localOutbox);
  return { ...delivery, challengeId: id };
}
function confirmAdminEmail(db, actor, input) {
  demand(
    Object.keys(input).every((k) => ["challengeId", "code"].includes(k)),
    "邮箱验证参数无效。"
  );
  const id = textField(input, "challengeId", 100), code = textField(input, "code", 20), repo = new Repository(db);
  const result = transaction(db, () => {
    const { identity, email } = current(repo, actor), now = Date.now();
    const row = db.prepare(
      "SELECT * FROM admin_security_challenges WHERE id=? AND account_id=? AND purpose='EMAIL_VERIFY'"
    ).get(id, actor.id);
    if (!row || row.consumed_at !== null || Number(row.expires_at) <= now || Number(row.attempts) >= 5)
      return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    db.prepare(
      "UPDATE admin_security_challenges SET attempts=attempts+1 WHERE id=?"
    ).run(id);
    if (row.code_hash !== digest(id + ":" + code))
      return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    if (row.email !== email || Number(row.identity_version) !== identity.version)
      return new ServiceError(
        409,
        "VERSION_CONFLICT",
        "账号资料已变化，请重新获取验证码。"
      );
    repo.save(identity, {
      schoolEmail: email,
      schoolEmailVerified: true,
      schoolEmailVerifiedAt: now
    });
    db.prepare(
      "UPDATE admin_security_challenges SET code_hash=NULL,consumed_at=? WHERE id=?"
    ).run(now, id);
    db.prepare("DELETE FROM mail_outbox WHERE id=?").run(row.mail_id);
    db.prepare(
      "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)"
    ).run(
      randomUUID(),
      actor.id,
      "admin",
      "accounts.email.verify",
      identity.id,
      "",
      JSON.stringify({ purpose: "EMAIL_VERIFY", result: "VERIFIED" }),
      timestamp()
    );
    return { verified: true };
  });
  if (result instanceof ServiceError) throw result;
  return result;
}
function administratorDirectory(repo, actor) {
  accountSecurityGate(repo, actor);
  requireSuperAdmin(repo, actor);
  const accounts = repo.db.prepare(
    "SELECT id,login_name,name,email,organization,status FROM accounts WHERE login_kind='ADMIN' ORDER BY login_name"
  ).all();
  return {
    permissions: accountPermissions,
    items: accounts.map((a) => {
      const identity = repo.all("companionIdentity").find((i) => i.ownerId === a.id && i.data.role === "admin");
      return {
        id: a.id,
        identityId: identity?.id,
        loginName: a.login_name,
        name: a.name,
        email: a.email,
        department: a.organization,
        status: a.status === "active" ? "ACTIVE" : "DISABLED",
        permissions: identity?.data.permissions ?? [],
        version: identity?.version,
        updatedAt: identity?.updatedAt
      };
    }),
    candidates: repo.db.prepare(
      "SELECT DISTINCT a.id,a.name,a.email FROM accounts a JOIN entities i ON i.owner_id=a.id WHERE a.login_kind='PERSONAL' AND a.status='active' AND i.kind='companionIdentity' AND json_extract(i.data,'$.status')='verified' ORDER BY a.name"
    ).all()
  };
}
function administratorCommand(repo, actor, action, input) {
  if (![
    "accounts.admins.create",
    "accounts.admins.edit",
    "accounts.admins.state"
  ].includes(action))
    return void 0;
  requireSuperAdmin(repo, actor);
  const create = action === "accounts.admins.create", state = action === "accounts.admins.state";
  const allowed = create ? [
    "personId",
    "loginName",
    "name",
    "email",
    "department",
    "permissions",
    "initialPassword",
    "confirmPassword",
    "confirmed"
  ] : state ? ["id", "version", "status", "handoverConfirmed", "confirmed"] : [
    "id",
    "version",
    "name",
    "email",
    "department",
    "permissions",
    "confirmed"
  ];
  demand(
    Object.keys(input).every((k) => allowed.includes(k)),
    "管理账号操作包含不允许的字段。"
  );
  demand(
    input.confirmed === true,
    "须核对账号资料、全部权限及高风险权限后确认。"
  );
  const identity = create ? void 0 : repo.get(input.id, "companionIdentity");
  if (identity) {
    demand(
      identity.data.role === "admin" && identity.ownerId !== actor.id,
      "不能修改本人或非分管理员账号。",
      403
    );
    const row = repo.db.prepare("SELECT login_kind,roles FROM accounts WHERE id=?").get(identity.ownerId);
    demand(
      row?.login_kind === "ADMIN" && !JSON.parse(String(row.roles)).includes("superadmin"),
      "仅可管理独立分管理员账号。",
      403
    );
    version(identity, input);
  }
  if (state) {
    demand(
      input.status === "ACTIVE" || input.status === "DISABLED",
      "分管理员状态无效。"
    );
    const row = repo.db.prepare("SELECT status FROM accounts WHERE id=?").get(identity.ownerId);
    const next = input.status === "ACTIVE" ? "active" : "banned";
    demand(row.status !== next, "账号状态已变化，请刷新。", 409);
    if (next === "banned")
      demand(input.handoverConfirmed === true, "停用前须确认已完成职责移交。");
    repo.db.prepare("UPDATE accounts SET status=? WHERE id=?").run(next, identity.ownerId);
    if (next === "banned")
      repo.db.prepare("DELETE FROM sessions WHERE account_id=?").run(identity.ownerId);
    repo.create("sportsAdminHistory", actor.id, {
      administratorId: identity.ownerId,
      action,
      before: row.status,
      after: next
    });
    return repo.save(identity, { accountState: input.status });
  }
  const name = textField(input, "name", 40), email = normalizeEmail(input.email), department = textField(input, "department", 200, true);
  const domains = (process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? "bnbu.edu.cn").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  demand(domains.includes(email.split("@")[1]), "请填写已配置学校域名的邮箱。");
  demand(
    Array.isArray(input.permissions) && input.permissions.length > 0 && input.permissions.every((p) => accountPermissions.includes(p)) && new Set(input.permissions).size === input.permissions.length,
    "须选择至少一项固定业务权限，不得授予管理账号或教师权限。"
  );
  demand(
    !repo.db.prepare(
      "SELECT id FROM accounts WHERE email=? AND login_kind='ADMIN' AND id<>?"
    ).get(email, identity?.ownerId ?? ""),
    "学校邮箱已被另一分管理员使用。",
    409
  );
  if (create) {
    const personId = textField(input, "personId", 100), person = repo.db.prepare("SELECT id,email,status,login_kind FROM accounts WHERE id=?").get(personId);
    demand(
      person?.status === "active" && person.login_kind === "PERSONAL" && repo.all("companionIdentity").some((i) => i.ownerId === personId && i.data.status === "verified"),
      "请选择当前已完成身份核验的人员。",
      409
    );
    const loginName = textField(input, "loginName", 100).toLowerCase();
    demand(
      !repo.db.prepare("SELECT id FROM accounts WHERE login_name=?").get(loginName),
      "管理登录账号已存在。",
      409
    );
    demand(
      typeof input.initialPassword === "string" && input.initialPassword.length > 0 && input.initialPassword === input.confirmPassword,
      "须填写初始密码且两次输入一致。"
    );
    const id = randomUUID();
    repo.db.prepare(
      "INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at,login_kind,login_name) VALUES(?,?,?,?,?,?,?,'ADMIN',?)"
    ).run(
      id,
      email,
      encodePassword(input.initialPassword),
      name,
      department,
      JSON.stringify(["admin"]),
      timestamp(),
      loginName
    );
    const saved = repo.create("companionIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: input.permissions,
      mustChangePassword: true,
      accountState: "ACTIVE",
      source: "SUPERADMIN_CONFIRMED_PERSON",
      verifiedPersonId: personId
    });
    repo.create("sportsAdminHistory", actor.id, {
      administratorId: id,
      action,
      permissions: input.permissions
    });
    return saved;
  }
  const before = repo.db.prepare("SELECT name,email,organization FROM accounts WHERE id=?").get(identity.ownerId);
  if (before.email !== email) clearAdminChallenges(repo, identity.ownerId);
  repo.db.prepare("UPDATE accounts SET name=?,email=?,organization=? WHERE id=?").run(name, email, department, identity.ownerId);
  repo.create("sportsAdminHistory", actor.id, {
    administratorId: identity.ownerId,
    action,
    before: { ...before, permissions: identity.data.permissions },
    after: {
      name,
      email,
      organization: department,
      permissions: input.permissions
    }
  });
  return repo.save(identity, {
    permissions: input.permissions,
    ...before.email !== email ? { schoolEmailVerified: false, schoolEmail: null } : {}
  });
}
function administratorSelf(repo, actor) {
  accountSecurityGate(repo, actor);
  const row = repo.db.prepare(
    "SELECT login_name,name,email FROM accounts WHERE id=? AND login_kind='ADMIN'"
  ).get(actor.id);
  const identity = repo.all("companionIdentity").find(
    (i) => i.ownerId === actor.id && i.data.role === "admin" && i.data.status === "verified"
  );
  demand(
    row && identity && !actor.roles.includes("superadmin"),
    "该流程仅适用独立分管理员。",
    403
  );
  return {
    id: identity.id,
    version: identity.version,
    loginName: row.login_name,
    name: row.name,
    email: row.email
  };
}
function administratorDeletion(repo, actor, action, input) {
  if (!["accounts.admins.delete", "accounts.close"].includes(action))
    return void 0;
  const self = action === "accounts.close";
  if (!self) requireSuperAdmin(repo, actor);
  if (!self && input.accountId !== void 0) {
    demand(
      Object.keys(input).every(
        (key) => ["accountId", "version", "confirmed", "handoverConfirmed"].includes(
          key
        )
      ),
      "账号删除参数无效。"
    );
    const identities = repo.all("companionIdentity").filter((i) => i.ownerId === input.accountId && i.data.role === "admin");
    demand(identities.length === 1, "管理账号不存在或身份资料需核对。", 404);
    const snapshot2 = repo.db.prepare("SELECT login_name,name,email FROM accounts WHERE id=?").get(String(input.accountId));
    demand(snapshot2, "管理账号不存在。", 404);
    input = {
      id: identities[0].id,
      version: input.version,
      confirmed: input.confirmed,
      handoverConfirmed: input.handoverConfirmed,
      loginName: snapshot2.login_name,
      name: snapshot2.name,
      email: snapshot2.email
    };
  }
  demand(
    Object.keys(input).every(
      (k) => [
        "id",
        "version",
        "confirmed",
        "handoverConfirmed",
        "loginName",
        "name",
        "email"
      ].includes(k)
    ),
    "账号删除参数无效。"
  );
  const identity = repo.get(input.id, "companionIdentity");
  version(identity, input);
  demand(
    identity.data.role === "admin" && identity.ownerId,
    "只能删除独立分管理员。"
  );
  demand(
    self ? identity.ownerId === actor.id : identity.ownerId !== actor.id,
    "无权删除此账号。",
    403
  );
  if (self)
    demand(
      identity.data.status === "verified" && actor.status === "active",
      "当前管理身份不可用。",
      403
    );
  const row = repo.db.prepare("SELECT * FROM accounts WHERE id=?").get(identity.ownerId);
  demand(
    row?.login_kind === "ADMIN" && !JSON.parse(String(row.roles)).includes("superadmin"),
    "该流程不适用总管理员或个人账号。",
    403
  );
  demand(
    input.confirmed === true && input.handoverConfirmed === true,
    "须确认已完成全部职责移交。"
  );
  demand(
    input.loginName === row.login_name && input.name === row.name && input.email === row.email,
    "账号资料已变化，请重新核对姓名、登录账号和邮箱。",
    409
  );
  for (const history of repo.all("sportsAdminHistory").filter((h) => h.data.administratorId === identity.ownerId)) {
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
    repo.db.prepare("UPDATE entities SET data=? WHERE id=?").run(JSON.stringify(data), history.id);
  }
  repo.db.prepare("DELETE FROM sessions WHERE account_id=?").run(identity.ownerId);
  repo.db.prepare("DELETE FROM notifications WHERE recipient_id=?").run(identity.ownerId);
  repo.db.prepare("DELETE FROM relations WHERE account_id=?").run(identity.ownerId);
  repo.db.prepare("DELETE FROM command_receipts WHERE actor_id=?").run(identity.ownerId);
  clearAdminChallenges(repo, identity.ownerId);
  repo.db.prepare("DELETE FROM entities WHERE owner_id=? AND kind='companionIdentity'").run(identity.ownerId);
  repo.db.prepare(
    "UPDATE accounts SET email=NULL,password_hash=NULL,name=NULL,organization=NULL,roles='[]',status='banned',login_name=NULL,login_kind='HISTORY' WHERE id=?"
  ).run(identity.ownerId);
  repo.create("sportsAdminHistory", actor.id, {
    administratorId: identity.ownerId,
    action,
    handoverConfirmed: true,
    deletedAt: Date.now(),
    deletedVersion: identity.version + 1
  });
  return { id: identity.ownerId };
}
function execute(db, token, action, input, requestId) {
  return executeWithActor(db, () => authenticate(db, token), token, action, input, requestId);
}
function executeMailboxImport(db, actorId, input, requestId) {
  return executeWithActor(db, () => {
    const actor = new Repository(db).person(actorId);
    demand(actor.status === "active" && actor.roles.some((role) => role === "operator" || role === "superadmin"), "邮箱导入操作账号无效。", 403);
    return actor;
  }, "", "mail.import", input, requestId);
}
function executeWithActor(db, actorProvider, token, action, input, requestId) {
  demand(
    /^[a-z]+(?:\.[a-z]+)+$/.test(action) && requestId.length >= 8 && requestId.length <= 100,
    "请求格式无效。"
  );
  demand(!action.startsWith("sports."), "伴学不提供体育业务写入。", 404);
  return transaction(db, () => {
    const actor = actorProvider(), repo = new Repository(db);
    demand(actor.status !== "banned", "账号已封禁，不能进行业务写入。", 403);
    if (action !== "accounts.password.change") accountSecurityGate(repo, actor);
    if (action.startsWith("accounts.admins."))
      requireSuperAdmin(repo, actor);
    if (action === "post.view") return recordPostView(db, repo, actor, input);
    const booleanArguments = {
      "content.review": "",
      "room.decide": "accept",
      "report.decide": "upheld",
      "certification.review": "approve",
      "organization.review": "approve",
      "activity.visibility": "publish",
      "relation.set": "enabled",
      "coffee.answer": "accept",
      "coffee.slot.update": "closed",
      "alumni.review": "approve",
      "alumni.decide": "accept",
      "alumni.profile": "accepting",
      "mail.visibility": "publish"
    };
    const flag = booleanArguments[action];
    if (flag)
      demand(
        typeof input[flag] === "boolean",
        `${flag} 必须明确为 true 或 false。`
      );
    const hash = digest(JSON.stringify({ action, input }));
    const old = db.prepare(
      "SELECT request_hash,result FROM command_receipts WHERE actor_id=? AND request_id=?"
    ).get(actor.id, requestId);
    if (old) {
      demand(old.request_hash === hash, "该请求标识已用于不同操作。", 409);
      return JSON.parse(String(old.result));
    }
    let result;
    if (action.startsWith("notification.")) {
      result = runSync(notificationPolicy(repo, actor, action, input));
      demand(result, "不支持该业务操作。", 404);
    } else if (action === "relation.set") {
      result = runSync(relationPolicy(repo, actor, input));
    } else {
      result = passwordCommand(repo, actor, token, action, input) ?? administratorCommand(repo, actor, action, input) ?? administratorDeletion(repo, actor, action, input) ?? communityCommand(repo, actor, action, input) ?? coffeeCommand(repo, actor, action, input) ?? governanceCommand(repo, actor, action, input) ?? activityCommand(repo, actor, action, input) ?? alumniCommand(repo, actor, action, input);
      demand(result, "不支持该业务操作。", 404);
      result = { id: result.id };
    }
    db.prepare(
      "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)"
    ).run(
      randomUUID(),
      actor.id,
      actor.roles.join(","),
      action,
      typeof input.id === "string" ? input.id : result?.id ?? null,
      typeof input.reason === "string" ? input.reason : "",
      JSON.stringify({
        result,
        ...action === "keyword.save" ? { keywordChange: { word: input.word } } : {},
        ...action === "keyword.set" ? { keywordChange: { enabled: input.enabled } } : {},
        ...action === "keyword.delete" ? { keywordChange: { deleted: true } } : {},
        ...["room.create", "room.decide", "room.finish", "room.moderate"].includes(action) ? { teamResult: repo.get(result.id) } : {},
        ...action === "relation.set" ? { relation: { kind: input.kind, enabled: input.enabled === true } } : {},
        ...action === "coffee.answer" ? { accepted: input.accept } : {}
      }),
      timestamp()
    );
    db.prepare("INSERT INTO command_receipts VALUES(?,?,?,?,?)").run(
      actor.id,
      requestId,
      hash,
      JSON.stringify(result),
      timestamp()
    );
    return result;
  });
}
function snapshot(db, actor) {
  const repo = new Repository(db), operate = has(actor, "operator", "superadmin");
  const relations = db.prepare("SELECT entity_id AS entityId,kind,created_at AS createdAt FROM relations WHERE account_id=?").all(actor.id);
  const cached = /* @__PURE__ */ new Map();
  const scopedRepo = {
    all(kind) {
      if (!["post", "room", "comment"].includes(kind)) return repo.all(kind);
      if (cached.has(kind)) return cached.get(kind);
      const ids = kind === "post" ? db.prepare("SELECT id FROM entities WHERE kind='post' AND (owner_id=? OR (json_extract(data,'$.status')='visible' AND id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save'))) ORDER BY created_at DESC,id LIMIT 50").all(actor.id, actor.id) : kind === "room" ? db.prepare("SELECT id FROM entities WHERE kind='room' AND (owner_id=? OR id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save') OR EXISTS(SELECT 1 FROM json_each(entities.data,'$.members') WHERE value=?)) ORDER BY created_at DESC,id LIMIT 50").all(actor.id, actor.id, actor.id) : db.prepare("SELECT id FROM entities WHERE kind='comment' AND (owner_id=? OR json_extract(data,'$.postId') IN (SELECT id FROM entities WHERE kind='post' AND (owner_id=? OR id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save')))) ORDER BY created_at DESC,id LIMIT 50").all(actor.id, actor.id, actor.id);
      const value = ids.map((row) => repo.get(row.id, kind));
      cached.set(kind, value);
      return value;
    },
    get: (id, kind) => repo.get(id, kind),
    people: () => repo.people()
  };
  const notifications = db.prepare(
    "SELECT id,entity_id AS entityId,event,body,created_at AS createdAt,read_at AS readAt FROM notifications WHERE recipient_id=? ORDER BY created_at DESC"
  ).all(actor.id);
  return projectWorkspace({
    repo: scopedRepo,
    firstLoginOnly: requiresPasswordChange(repo, actor),
    studentNumber: studentNumber(db, actor),
    sports: null,
    notifications,
    coffeeHistory: (id) => db.prepare(
      "SELECT id, action, reason, data, created_at AS at FROM audit WHERE entity_id=? AND action IN ('coffee.book','coffee.move','coffee.answer','coffee.cancel') ORDER BY created_at, rowid"
    ).all(id).map((row) => {
      const detail = JSON.parse(String(row.data));
      return {
        id: row.id,
        action: row.action,
        reason: row.reason,
        at: row.at,
        ...row.action === "coffee.answer" && typeof detail.accepted === "boolean" ? { accepted: detail.accepted } : {}
      };
    }),
    relationshipHistory: (visible) => relationshipHistory(db, actor.id, visible),
    notificationBatches: operate ? db.prepare(
      `SELECT a.entity_id AS id, a.created_at AS createdAt,
      count(n.id) AS total, sum(CASE WHEN n.read_at IS NOT NULL THEN 1 ELSE 0 END) AS read,
      CASE WHEN count(n.id)=0 THEN NULL ELSE 1.0*sum(CASE WHEN n.read_at IS NOT NULL THEN 1 ELSE 0 END)/count(n.id) END AS readRate
      FROM audit a LEFT JOIN notifications n ON n.entity_id=a.entity_id
      WHERE a.action='notification.send' AND (a.actor_id=? OR ?=1)
      GROUP BY a.id ORDER BY a.created_at DESC`
    ).all(actor.id, has(actor, "superadmin") ? 1 : 0) : [],
    relations,
    audit: has(actor, "superadmin") ? db.prepare("SELECT * FROM audit ORDER BY created_at DESC LIMIT 200").all() : []
  }, actor);
}
const map = (rows) => new Map(rows.map((row) => [String(row.id), Number(row.count)]));
function requireCommunity(actor) {
  demand(actor.roles.length > 0 && actor.status !== "banned", "请先完成校园身份核验。", 403);
}
function metrics(db, cutoff) {
  return {
    views: map(db.prepare("SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=? GROUP BY post_id").all(cutoff)),
    likes: map(db.prepare("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=? GROUP BY entity_id").all(cutoff)),
    comments: map(db.prepare("SELECT json_extract(data,'$.postId') AS id,count(*) AS count FROM entities WHERE kind='comment' AND json_extract(data,'$.status')='visible' AND created_at>=? GROUP BY json_extract(data,'$.postId')").all(cutoff))
  };
}
function signals(db, actorId, cutoff) {
  const board = /* @__PURE__ */ new Map();
  const add = (rows, weight) => {
    for (const row of rows) if (row.board) board.set(row.board, (board.get(row.board) ?? 0) + Number(row.count) * weight);
  };
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM post_views v JOIN entities p ON p.id=v.post_id WHERE v.viewer_id=? AND v.viewed_at>=? GROUP BY board").all(actorId, cutoff), 1);
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM relations r JOIN entities p ON p.id=r.entity_id WHERE r.account_id=? AND r.kind='like' AND r.created_at>=? GROUP BY board").all(actorId, cutoff), 4);
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM entities c JOIN entities p ON p.id=json_extract(c.data,'$.postId') WHERE c.kind='comment' AND c.owner_id=? AND c.created_at>=? GROUP BY board").all(actorId, cutoff), 3);
  const viewed = new Set(db.prepare("SELECT DISTINCT post_id AS id FROM post_views WHERE viewer_id=? AND viewed_at>=?").all(actorId, cutoff).map((row) => row.id));
  return { board, viewed };
}
function candidates(db, actor, withBody) {
  const body2 = withBody ? "COALESCE(json_extract(p.data,'$.body'),'')" : "''";
  const rows = db.prepare(`SELECT p.id,json_extract(p.data,'$.alumniId') AS alumniId,p.owner_id AS ownerId,p.created_at AS createdAt,COALESCE(json_extract(p.data,'$.title'),'') AS title,${body2} AS body,COALESCE(json_extract(p.data,'$.board'),'') AS board,json_extract(p.data,'$.status') AS status,CASE WHEN (SELECT json_extract(data,'$.profilePreview') FROM entities WHERE kind='preferences' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1)=0 THEN COALESCE(a.name,'已注销用户') ELSE COALESCE((SELECT json_extract(data,'$.nickname') FROM entities WHERE kind='profile' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1),a.name,'已注销用户') END AS author FROM entities p LEFT JOIN accounts a ON a.id=p.owner_id WHERE p.kind='post' AND (json_extract(p.data,'$.status')='visible' OR (p.owner_id=? AND json_extract(p.data,'$.status')='pending'))`).all(actor.id);
  return rows;
}
function relatedPeople(db, actor, entities) {
  const ids = [.../* @__PURE__ */ new Set([actor.id, ...entities.map((item) => item.ownerId).filter((id) => !!id)])];
  const repo = new Repository(db);
  const people = ids.flatMap((id) => {
    const row = db.prepare("SELECT id,name,organization,status,roles FROM accounts WHERE id=? AND login_kind<>'HISTORY'").get(id);
    return row ? [{ ...row, roles: JSON.parse(row.roles) }] : [];
  });
  return projectDisplayPeople(actor, people, new Set(ids), repo.all("preferences").filter((item) => ids.includes(item.ownerId ?? "")), repo.all("profile").filter((item) => ids.includes(item.ownerId ?? "")));
}
function projection(db, actor, entities) {
  const repo = new Repository(db), ids = entities.filter((item) => item.kind === "post").map((item) => item.id);
  const likes = new Map(ids.map((id) => [id, Number(db.prepare("SELECT count(*) AS count FROM relations WHERE kind='like' AND entity_id=?").get(id).count)]));
  const viewCounts = new Map(ids.filter((id) => entities.find((item) => item.id === id)?.ownerId === actor.id).map((id) => [id, Number(db.prepare("SELECT count(*) AS count FROM post_views WHERE post_id=?").get(id).count)]));
  const relations = db.prepare("SELECT entity_id AS entityId,kind FROM relations WHERE account_id=? AND kind IN ('like','save','commentlike')").all(actor.id);
  const alumni = readAlumni(repo);
  const facts = runSync(communityCounts(repo, ids));
  const result = projectCommunity({ account: actor, entities, people: relatedPeople(db, actor, entities), relations, alumni: { profiles: alumni.profiles } }, likes, { allViews: viewCounts, recentViews: /* @__PURE__ */ new Map(), recentLikes: /* @__PURE__ */ new Map() }, facts);
  return result;
}
function communityFeed(db, token, params) {
  const actor = authenticate(db, token);
  requireCommunity(actor);
  const query = (params.get("q") ?? "").trim(), board = params.get("board") ?? "全部", sort = params.get("sort") === "newest" ? "newest" : "recommended";
  demand(query.length <= 100, "搜索词过长。");
  const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1)), pageSize = Math.max(1, Math.min(50, Number(params.get("limit")) || 20));
  const candidatesList = candidates(db, actor, Boolean(query)), all = runSync(filterCommunityCandidates(new Repository(db), actor, candidatesList, params)), cutoff7 = new Date(Date.now() - 7 * 864e5).toISOString(), cutoff30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const engagement = metrics(db, cutoff7), personal = signals(db, actor.id, cutoff30);
  const ordered = rankCommunity(all, { board, query, sort }, personal, engagement), selected = ordered.slice((page - 1) * pageSize, page * pageSize);
  const hot = runSync(communityHotForViewer(new Repository(db), actor, candidatesList, engagement));
  const hotIds = [.../* @__PURE__ */ new Set([...hot.overall, ...Object.values(hot.byBoard).flat()])];
  const hotPosts = hotIds.flatMap((id) => {
    const item = candidatesList.find((post) => post.id === id);
    return item ? [{ id: item.id, title: item.title, board: item.board, author: item.author, status: item.status }] : [];
  });
  const repo = new Repository(db), entities = selected.map((item) => repo.get(item.id, "post"));
  const result = projection(db, actor, entities);
  return { ...result, hotLists: hot, hotPosts, page, total: ordered.length, hasMore: page * pageSize < ordered.length, sort, query, board };
}
function communityPostDetail(db, token, id, page = 1) {
  const actor = authenticate(db, token);
  requireCommunity(actor);
  const repo = new Repository(db), post = repo.get(id, "post");
  runSync(requireSocialAccess(repo, actor, post.ownerId));
  demand(post.data.status === "visible" || post.ownerId === actor.id && post.data.status === "pending", "帖子当前不可查看。", 403);
  const visible = db.prepare("SELECT id FROM entities WHERE kind='comment' AND json_extract(data,'$.postId')=? AND (json_extract(data,'$.status')='visible' OR (owner_id=? AND json_extract(data,'$.status')='pending')) ORDER BY created_at,id LIMIT 51 OFFSET ?").all(id, actor.id, (Math.max(1, page) - 1) * 50);
  const entities = [post, ...visible.slice(0, 50).map((row) => repo.get(row.id, "comment"))];
  const view = projection(db, actor, entities);
  return { post: view.posts[0], features: { postViews: true }, commentsHasMore: visible.length > 50, commentPage: page, liked: view.likedPosts.includes(id), saved: view.savedPosts.includes(id), alumniProfiles: view.alumniProfiles };
}
function communitySocial(db, token, params) {
  const actor = authenticate(db, token);
  return runSync(communitySocialRead(new Repository(db), actor, params));
}
const asMap = (rows) => new Map(rows.map((row) => [String(row.id), Number(row.count)]));
function discoverHotPage(db, token) {
  const actor = authenticate(db, token);
  demand(actor.roles.includes("student") && actor.status !== "banned", "请先完成学生身份核验。", 403);
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString();
  const rows = db.prepare("SELECT id,kind,created_at AS createdAt,data FROM entities WHERE (kind='activity' AND json_extract(data,'$.status')='published') OR (kind='post' AND json_extract(data,'$.status')='visible')").all();
  const candidates2 = rows.map((row) => {
    const data = JSON.parse(row.data);
    return { id: row.id, kind: row.kind, title: String(data.title ?? ""), subtitle: row.kind === "activity" ? String(data.location ?? "校园活动") : String(data.board ?? "校园社区"), status: String(data.status ?? ""), createdAt: row.createdAt };
  });
  const byRelation = (kind) => asMap(db.prepare("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind=? AND created_at>=? GROUP BY entity_id").all(kind, cutoff));
  const engagement = {
    views: asMap(db.prepare("SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=? GROUP BY post_id").all(cutoff)),
    likes: byRelation("like"),
    comments: asMap(db.prepare("SELECT json_extract(data,'$.postId') AS id,count(*) AS count FROM entities WHERE kind='comment' AND json_extract(data,'$.status')='visible' AND created_at>=? GROUP BY json_extract(data,'$.postId')").all(cutoff)),
    saves: byRelation("save"),
    participates: byRelation("participate")
  };
  return rankDiscoverHot(candidates2, engagement);
}
function moderationPage(db, actor, params) {
  demand(actor.roles.includes("reviewer") || actor.roles.includes("superadmin"), "需要审核职责。", 403);
  const status = params.get("status") ?? "all", kind = params.get("kind") ?? "all", query = (params.get("q") ?? "").trim().toLowerCase(), author = (params.get("author") ?? "").trim().toLowerCase();
  demand(["all", "visible", "pending", "hidden", "deleted"].includes(status), "状态筛选无效。");
  demand(["all", "post", "comment"].includes(kind), "类型筛选无效。");
  demand(query.length <= 100 && author.length <= 100, "搜索条件过长。");
  const page = Math.max(1, Math.min(1e5, Number(params.get("page")) || 1));
  const where = "kind IN ('post','comment') AND (?='all' OR kind=?) AND (?='all' OR json_extract(data,'$.status')=?) AND (?='' OR lower(COALESCE(json_extract(data,'$.title'),'')||' '||COALESCE(json_extract(data,'$.body'),'')) LIKE '%'||?||'%') AND (?='' OR lower(COALESCE((SELECT name FROM accounts WHERE id=owner_id),'')) LIKE '%'||?||'%')";
  const args = [kind, kind, status, status, query, query, author, author];
  const total = Number(db.prepare(`SELECT count(*) AS count FROM entities WHERE ${where}`).get(...args).count);
  const rows = db.prepare(`SELECT id,kind,owner_id AS ownerId,data,created_at AS createdAt,version FROM entities WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET ?`).all(...args, (page - 1) * 50);
  const items = rows.map((row) => {
    const data = JSON.parse(row.data);
    const parent = row.kind === "comment" ? db.prepare("SELECT data FROM entities WHERE id=? AND kind='post'").get(String(data.postId)) : void 0;
    const parentData = parent ? JSON.parse(parent.data) : null;
    const name = db.prepare("SELECT name FROM accounts WHERE id=?").get(row.ownerId);
    const neighbors = row.kind === "comment" ? db.prepare("SELECT id,owner_id AS ownerId,json_extract(data,'$.body') AS body FROM entities WHERE kind='comment' AND json_extract(data,'$.postId')=? AND json_extract(data,'$.status')='visible' AND id<>? ORDER BY abs(julianday(created_at)-julianday(?)),created_at LIMIT 2").all(String(data.postId), row.id, row.createdAt) : [];
    return { id: row.id, kind: row.kind, title: row.kind === "post" ? String(data.title ?? "") : `评论 · ${String(parentData?.title ?? "原帖子")}`, body: String(data.body ?? ""), author: name?.name ?? "已注销用户", ownerId: row.ownerId, status: String(data.status ?? ""), createdAt: row.createdAt, version: row.version, postTitle: parentData?.title, postExcerpt: parentData ? String(parentData.body ?? "").slice(0, 300) : void 0, neighborComments: neighbors.map((item) => ({ id: item.id, body: item.body })) };
  });
  return { items, total, page, hasMore: page * 50 < total };
}
const response = { sent: true, message: "如果账号存在且邮箱已验证，找回验证码已发送。" };
function identifier(value) {
  demand(typeof value === "string" && value.trim().length > 0 && value.trim().length <= 254, "请填写邮箱或管理登录账号。");
  return value.trim().toLowerCase();
}
function rowFor(db, key) {
  return db.prepare("SELECT id,email,login_kind,status FROM accounts WHERE (login_kind='PERSONAL' AND email=?) OR (login_kind='ADMIN' AND login_name=?) LIMIT 1").get(key, key);
}
function verified(db, row) {
  if (row.login_kind === "PERSONAL") return !!db.prepare("SELECT 1 FROM entities WHERE kind='verifiedEmail' AND owner_id=? AND json_extract(data,'$.email')=? LIMIT 1").get(row.id, row.email);
  return !!db.prepare("SELECT 1 FROM entities WHERE kind='companionIdentity' AND owner_id=? AND json_extract(data,'$.role')='admin' AND json_extract(data,'$.status')='verified' AND json_extract(data,'$.schoolEmailVerified')=1 AND json_extract(data,'$.schoolEmail')=? LIMIT 1").get(row.id, row.email);
}
async function requestPasswordReset(db, value, origin, localOutbox) {
  demand(localOutbox || process.env.BNBU_EMAIL_DELIVERY_URL, "尚未配置验证码邮件服务。", 503);
  const key = identifier(value), account = rowFor(db, key);
  const email = account?.email ?? (key.includes("@") ? key : `unknown:${key}`);
  try {
    takeEmailSend(db, email, origin);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 429) return response;
    throw error;
  }
  if (!account || !verified(db, account)) return response;
  const now = Date.now();
  const previous = db.prepare("SELECT sent_at FROM password_reset_challenges WHERE account_id=? ORDER BY sent_at DESC LIMIT 1").get(account.id);
  if (previous && now - previous.sent_at < 6e4) return response;
  const id = randomUUID(), mailId = randomUUID(), code = String(randomInt(1e5, 1e6));
  transaction(db, () => {
    db.prepare("UPDATE password_reset_challenges SET consumed_at=? WHERE account_id=? AND consumed_at IS NULL").run(now, account.id);
    db.prepare("INSERT INTO password_reset_challenges(id,account_id,identifier,email,code_hash,expires_at,sent_at) VALUES(?,?,?,?,?,?,?)").run(id, account.id, key, account.email, digest(id + ":" + code), now + 6e5, now);
    db.prepare("INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)").run(mailId, account.email, "伴学找回密码", `验证码：${code}，10 分钟内有效。`, timestamp());
    db.prepare("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), account.id, "", "auth.password.reset.request", account.id, "", JSON.stringify({ challengeId: id }), timestamp());
  });
  try {
    await deliverOutbox(db, mailId, localOutbox);
  } catch (error) {
    console.error("Password reset mail delivery unconfirmed:", error);
  }
  return response;
}
function completePasswordReset(db, input) {
  const key = identifier(input.identifier);
  demand(typeof input.code === "string" && /^\d{6}$/.test(input.code), "请填写六位验证码。");
  const passwordHash = hashPassword(input.password);
  const result = transaction(db, () => {
    const row = db.prepare("SELECT * FROM password_reset_challenges WHERE identifier=? ORDER BY sent_at DESC LIMIT 1").get(key);
    if (!row || row.consumed_at !== null || row.expires_at <= Date.now() || row.attempts >= 5) return new ServiceError(400, "INVALID_CHALLENGE", "验证码无效或已过期。");
    db.prepare("UPDATE password_reset_challenges SET attempts=attempts+1 WHERE id=?").run(row.id);
    if (row.code_hash !== digest(row.id + ":" + input.code)) return new ServiceError(400, "INVALID_CHALLENGE", `验证码错误，剩余 ${Math.max(0, 4 - row.attempts)} 次。`);
    const account = db.prepare("SELECT id,email FROM accounts WHERE id=?").get(row.account_id);
    if (!account || account.email !== row.email) return new ServiceError(409, "ACCOUNT_CHANGED", "账号邮箱已变化，请重新申请。");
    db.prepare("UPDATE accounts SET password_hash=? WHERE id=?").run(passwordHash, row.account_id);
    db.prepare("DELETE FROM sessions WHERE account_id=?").run(row.account_id);
    db.prepare("UPDATE password_reset_challenges SET consumed_at=? WHERE account_id=? AND consumed_at IS NULL").run(Date.now(), row.account_id);
    db.prepare("INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(), row.account_id, "", "auth.password.reset.complete", row.account_id, "", JSON.stringify({ challengeId: row.id, sessionsRevoked: true }), timestamp());
    return { reset: true };
  });
  if (result instanceof ServiceError) throw result;
  return result;
}
function createApiServer(db, options = {}) {
  return createServer(async (request, response2) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = requestUrl.pathname;
      if (request.method === "GET" && (pathname === "/api/rooms" || /^\/api\/rooms\/[^/]+$/.test(pathname))) {
        const actor = authenticate(db, cookieToken(request));
        accountSecurityGate(new Repository(db), actor);
        student(actor);
        demand(actor.status !== "banned", "账号已封禁。", 403);
        const id = pathname === "/api/rooms" ? null : decodeURIComponent(pathname.slice("/api/rooms/".length));
        return send(response2, 200, id === null ? searchRooms(db, actor, requestUrl.searchParams) : roomDetail(db, actor, id));
      }
      if (request.method === "GET" && pathname === "/api/community") return send(response2, 200, communityFeed(db, cookieToken(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/discover/hot") return send(response2, 200, discoverHotPage(db, cookieToken(request) ?? ""));
      if (request.method === "GET" && pathname === "/api/community/social") return send(response2, 200, communitySocial(db, cookieToken(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/community/feed") return send(response2, 200, communityFeed(db, cookieToken(request) ?? "", requestUrl.searchParams));
      if (request.method === "GET" && pathname === "/api/admin/community/moderation") return send(response2, 200, moderationPage(db, authenticate(db, cookieToken(request)), requestUrl.searchParams));
      const communityDetail = request.method === "GET" && /^\/api\/community\/posts\/([^/]+)$/.exec(pathname);
      if (communityDetail) return send(response2, 200, communityPostDetail(db, cookieToken(request) ?? "", decodeURIComponent(communityDetail[1]), Number(requestUrl.searchParams.get("page")) || 1));
      if (request.method === "GET" && pathname === "/api/health")
        return send(response2, 200, {
          ok: true,
          storage: "sqlite",
          schemaVersion: Number(
            db.prepare("SELECT MAX(version) AS version FROM schema_migrations").get()?.version ?? 0
          )
        });
      if (request.method === "POST") {
        const origin = request.headers.origin;
        if (origin) {
          const parsed = new URL(origin);
          demand(
            ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) && ["4174", "4175", "4186"].includes(parsed.port),
            "来源不允许。",
            403
          );
        }
        demand(
          request.headers["sec-fetch-site"] !== "cross-site",
          "跨站请求不允许。",
          403
        );
        if (pathname === "/api/timetable/recognize") {
          const actor = authenticate(db, cookieToken(request));
          accountSecurityGate(new Repository(db), actor);
          student(actor);
          demand(actor.status !== "banned", "账号已封禁。", 403);
          return send(response2, 200, await recognize(request));
        }
        if (pathname === "/api/activity/screenshot/import") {
          const token2 = cookieToken(request) ?? "";
          const actor = authenticate(db, token2);
          accountSecurityGate(new Repository(db), actor);
          demand(actor.status === "active" && actor.roles.some((role) => role === "operator" || role === "superadmin"), "需要运营职责。", 403);
          const image = await recognizeActivityScreenshot(request, options.screenshotRecognizer);
          return send(response2, 200, { data: execute(db, token2, "screenshot.import", { image: image.image, recognizedText: image.text, ocrRequestId: image.requestId }, randomUUID()) });
        }
        const input = await body(request);
        if (pathname === "/api/auth/verification-codes") {
          return send(
            response2,
            200,
            await sendVerification(
              db,
              input.email,
              options.localOutbox === true,
              request.socket.remoteAddress ?? "unknown"
            )
          );
        }
        if (pathname === "/api/auth/email/confirm") return send(response2, 200, verifyOwnEmail(db, authenticate(db, cookieToken(request)), input.code));
        if (pathname === "/api/auth/email/request") {
          const actor = authenticate(db, cookieToken(request));
          demand(actor.status !== "banned", "账号已封禁。", 403);
          return send(response2, 200, await sendVerification(db, actor.email, options.localOutbox === true, request.socket.remoteAddress ?? "unknown"));
        }
        if (pathname === "/api/auth/register")
          return send(response2, 201, register(db, input));
        if (pathname === "/api/auth/password-reset/request") return send(response2, 200, await requestPasswordReset(db, input.identifier, request.socket.remoteAddress ?? "unknown", options.localOutbox === true));
        if (pathname === "/api/auth/password-reset/complete") return send(response2, 200, completePasswordReset(db, input));
        if (pathname === "/api/auth/login" || pathname === "/api/auth/admin-login" || pathname === "/api/auth/sign-in") {
          const result = pathname === "/api/auth/sign-in" ? loginUnified(db, input.identifier, input.password, request.socket.remoteAddress ?? "unknown") : pathname === "/api/auth/admin-login" ? loginAdministrator(db, input.loginName, input.password, request.socket.remoteAddress ?? "unknown") : login(db, input.email, input.password, request.socket.remoteAddress ?? "unknown");
          response2.setHeader(
            "Set-Cookie",
            `bnbu_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`
          );
          return send(response2, 200, {
            authenticated: true,
            account: result.account
          });
        }
        const token = cookieToken(request);
        authenticate(db, token);
        if (pathname === "/api/accounts/admin-email/request") {
          demand(
            Object.keys(input).length === 0,
            "邮箱验证只能使用本人当前邮箱。"
          );
          return send(
            response2,
            200,
            await requestAdminEmail(
              db,
              authenticate(db, token),
              options.localOutbox === true
            )
          );
        }
        if (pathname === "/api/accounts/admin-email/confirm")
          return send(
            response2,
            200,
            confirmAdminEmail(db, authenticate(db, token), input)
          );
        if (pathname === "/api/identity/check") {
          accountSecurityGate(new Repository(db), authenticate(db, token));
          demand(
            Object.keys(input).length === 0,
            "核验对象只能来自当前登录账号。"
          );
          return send(
            response2,
            200,
            await checkSchoolIdentity(authenticate(db, token))
          );
        }
        if (pathname === "/api/identity/request") return send(response2, 200, await requestStudentIdentity(db, authenticate(db, token), input));
        if (pathname === "/api/identity/review") return send(response2, 200, reviewStudentIdentity(db, authenticate(db, token), input));
        if (pathname === "/api/auth/logout") {
          db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
            digest(token)
          );
          response2.setHeader(
            "Set-Cookie",
            "bnbu_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
          );
          return send(
            response2,
            200,
            { loggedOut: true }
          );
        }
        if (pathname === "/api/commands") {
          demand(input.action !== "screenshot.import", "请通过截图上传入口识别活动。", 403);
          demand(
            typeof input.action === "string" && typeof input.requestId === "string" && input.input && typeof input.input === "object" && !Array.isArray(input.input),
            "命令格式无效。"
          );
          const result = execute(
            db,
            token,
            input.action,
            input.input,
            input.requestId
          );
          return send(response2, 200, { data: result });
        }
      }
      if (request.method === "GET" && pathname === "/api/auth/me")
        return send(response2, 200, {
          account: authenticate(db, cookieToken(request))
        });
      if (request.method === "GET" && pathname === "/api/identity/me") return send(response2, 200, ownStudentIdentity(db, authenticate(db, cookieToken(request))));
      if (request.method === "GET" && pathname === "/api/identity/requests") return send(response2, 200, listStudentIdentityRequests(db, authenticate(db, cookieToken(request)), new URL(request.url, "http://localhost").searchParams));
      if (request.method === "GET" && pathname === "/api/accounts/administrators")
        return send(
          response2,
          200,
          administratorDirectory(
            new Repository(db),
            authenticate(db, cookieToken(request))
          )
        );
      if (request.method === "GET" && pathname === "/api/accounts/administrator-self")
        return send(
          response2,
          200,
          administratorSelf(
            new Repository(db),
            authenticate(db, cookieToken(request))
          )
        );
      if (request.method === "GET" && pathname === "/api/accounts/admin-email")
        return send(
          response2,
          200,
          adminEmailStatus(
            new Repository(db),
            authenticate(db, cookieToken(request))
          )
        );
      const directory = /^\/api\/accounts\/(students|teachers)$/.exec(
        pathname
      );
      if (request.method === "GET" && directory) {
        const params = new URL(request.url, "http://localhost").searchParams;
        return send(
          response2,
          200,
          accountDirectory(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            directory[1] === "students" ? "student" : "teacher",
            Object.fromEntries(params)
          )
        );
      }
      if (request.method === "GET" && pathname === "/api/students/search") return send(response2, 200, searchStudents(db, authenticate(db, cookieToken(request)), new URL(request.url, "http://localhost").searchParams.get("number") ?? "", request.socket.remoteAddress ?? "unknown"));
      const hoverMatch = request.method === "GET" && /^\/api\/people\/([^/]+)\/hover$/.exec(pathname);
      if (hoverMatch) {
        const url = new URL(request.url, "http://localhost");
        return send(response2, 200, personHover(db, authenticate(db, cookieToken(request)), decodeURIComponent(hoverMatch[1]), url.searchParams.get("number") ?? void 0));
      }
      if (request.method === "GET" && pathname === "/api/workspace")
        return send(
          response2,
          200,
          snapshot(db, authenticate(db, cookieToken(request)))
        );
      send(response2, 404, { code: "NOT_FOUND", message: "接口不存在。" });
    } catch (error) {
      if (error instanceof ServiceError)
        return send(response2, error.status, {
          code: error.code,
          message: error.message
        });
      if (error instanceof Error && !/SQLITE|constraint|database|ENOENT/i.test(error.message))
        return send(response2, 400, {
          code: "BUSINESS_RULE",
          message: error.message
        });
      console.error("Backend request failed:", error);
      send(response2, 500, {
        code: "INTERNAL_ERROR",
        message: "保存失败，请重试；业务未报告成功。"
      });
    }
  });
}
async function startBackend() {
  const host = process.env.BNBU_API_HOST ?? "127.0.0.1";
  const port = Number(process.env.BNBU_API_PORT ?? "4175");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("BNBU_API_PORT must be an integer between 1 and 65535");
  const db = openDatabase(
    process.env.BNBU_DATABASE ?? resolve("data/bnbu.sqlite")
  );
  const server2 = createApiServer(db, {
    localOutbox: process.env.BNBU_LOCAL_OUTBOX === "1"
  });
  await new Promise((done, reject) => {
    server2.once("error", reject);
    server2.listen(port, host, done);
  });
  console.log(`BNBU API: http://${host}:${port} (SQLite)`);
  const mailbox = startActivityMailbox((actorId, input, requestId) => executeMailboxImport(db, actorId, input, requestId));
  server2.on("close", () => {
    mailbox?.stop();
    db.close();
  });
  return server2;
}
const server = await startBackend();
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close());
}
