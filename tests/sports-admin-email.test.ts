import { afterEach, expect, it, vi } from "vitest";
import { openDatabase, type Database } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import {
  adminEmailStatus,
  requestAdminEmail,
  confirmAdminEmail,
  clearAdminChallenges,
} from "../backend/src/accounts/admin-email";
const dbs: Database[] = [];
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  dbs.splice(0).forEach((d) => d.close());
});
function setup() {
  vi.stubEnv("BNBU_EMAIL_DELIVERY_URL", "");
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const id = createAccount(db, {
      email: name + "@example.test",
      name,
      password: "Password123",
      roles: role === "admin" ? ["superadmin"] : ["student"],
    });
    const identity = repo.create("companionIdentity", id, {
      role,
      status: "verified",
    });
    return { ...login(db, name + "@example.test", "Password123"), identity };
  };
  const admin = make("admin", "admin"),
    other = make("other", "admin"),
    student = make("student", "student");
  const code = (id: string) => {
    const row = db
      .prepare(
        "SELECT body FROM mail_outbox WHERE id=(SELECT mail_id FROM admin_security_challenges WHERE id=?)",
      )
      .get(id)!;
    return String(row.body).match(/\d{6}/)![0];
  };
  return { db, repo, admin, other, student, code };
}
it("本人验证绑定主体用途且一次消费，验证码不进入审计，个人验证码保持", async () => {
  const f = setup();
  f.db
    .prepare("INSERT INTO email_challenges VALUES(?,?,?,0,?)")
    .run(
      f.admin.account.email,
      "personal-hash",
      Date.now() + 999999,
      Date.now(),
    );
  const result = await requestAdminEmail(f.db, f.admin.account, true),
    code = f.code(result.challengeId);
  expect(result.delivery).toBe("local-outbox");
  expect(JSON.stringify(result)).not.toContain(code);
  expect(() =>
    confirmAdminEmail(f.db, f.other.account, {
      challengeId: result.challengeId,
      code,
    }),
  ).toThrow("验证码");
  expect(() =>
    confirmAdminEmail(f.db, f.student.account, {
      challengeId: result.challengeId,
      code,
    }),
  ).toThrow("管理员");
  expect(adminEmailStatus(f.repo, f.admin.account).verified).toBe(false);
  expect(
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: result.challengeId,
      code,
    }),
  ).toEqual({ verified: true });
  expect(adminEmailStatus(f.repo, f.admin.account)).toEqual({
    email: f.admin.account.email,
    verified: true,
  });
  expect(() =>
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: result.challengeId,
      code,
    }),
  ).toThrow("验证码");
  expect(
    f.db
      .prepare("SELECT code_hash FROM admin_security_challenges WHERE id=?")
      .get(result.challengeId)?.code_hash,
  ).toBeNull();
  expect(
    JSON.stringify(f.db.prepare("SELECT * FROM audit").all()),
  ).not.toContain(code);
  expect(
    f.db
      .prepare("SELECT code_hash FROM email_challenges WHERE email=?")
      .get(f.admin.account.email)?.code_hash,
  ).toBe("personal-hash");
});
it("错码尝试持久计数、重发限流、严格过期与新挑战替换旧挑战", async () => {
  const f = setup();
  vi.useFakeTimers();
  vi.setSystemTime(1000000000);
  const first = await requestAdminEmail(f.db, f.admin.account, true),
    correct = f.code(first.challengeId);
  await expect(requestAdminEmail(f.db, f.admin.account, true)).rejects.toThrow(
    "稍后",
  );
  for (let n = 0; n < 5; n++)
    expect(() =>
      confirmAdminEmail(f.db, f.admin.account, {
        challengeId: first.challengeId,
        code: "wrong",
      }),
    ).toThrow();
  expect(
    f.db
      .prepare("SELECT attempts FROM admin_security_challenges WHERE id=?")
      .get(first.challengeId)?.attempts,
  ).toBe(5);
  expect(() =>
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: first.challengeId,
      code: correct,
    }),
  ).toThrow();
  vi.advanceTimersByTime(60000);
  const second = await requestAdminEmail(f.db, f.admin.account, true),
    code = f.code(second.challengeId);
  vi.advanceTimersByTime(600000);
  expect(() =>
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: second.challengeId,
      code,
    }),
  ).toThrow("过期");
  expect(adminEmailStatus(f.repo, f.admin.account).verified).toBe(false);
});
it("资料改变不沿用旧证明，清理管理挑战不会删同邮箱个人邮件，审计失败全部回滚", async () => {
  const f = setup(),
    first = await requestAdminEmail(f.db, f.admin.account, true),
    code = f.code(first.challengeId);
  f.repo.save(f.admin.identity, { permissions: ["HELP"] });
  expect(() =>
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: first.challengeId,
      code,
    }),
  ).toThrow("资料已变化");
  f.db
    .prepare(
      "INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)",
    )
    .run(
      "personal-mail",
      f.admin.account.email,
      "个人",
      "个人验证码",
      new Date().toISOString(),
    );
  clearAdminChallenges(f.repo, f.admin.account.id);
  expect(
    f.db.prepare("SELECT id FROM mail_outbox WHERE id='personal-mail'").get(),
  ).toBeTruthy();
  const second = await requestAdminEmail(f.db, f.admin.account, true),
    secondCode = f.code(second.challengeId);
  f.db.exec(
    "CREATE TRIGGER reject_email_audit BEFORE INSERT ON audit WHEN NEW.action='sports.account.email.verify' BEGIN SELECT RAISE(ABORT,'audit failed'); END;",
  );
  expect(() =>
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: second.challengeId,
      code: secondCode,
    }),
  ).toThrow("audit failed");
  expect(adminEmailStatus(f.repo, f.admin.account).verified).toBe(false);
  expect(f.code(second.challengeId)).toBe(secondCode);
  f.db.exec("DROP TRIGGER reject_email_audit");
  expect(
    confirmAdminEmail(f.db, f.admin.account, {
      challengeId: second.challengeId,
      code: secondCode,
    }).verified,
  ).toBe(true);
});
it("首次改密门禁与缺邮件配置不伪成功；真实适配失败不标记核验", async () => {
  const f = setup();
  f.repo.save(f.admin.identity, { mustChangePassword: true });
  await expect(requestAdminEmail(f.db, f.admin.account, true)).rejects.toThrow(
    "初始密码",
  );
  f.repo.save(f.repo.get(f.admin.identity.id), { mustChangePassword: false });
  await expect(requestAdminEmail(f.db, f.admin.account, false)).rejects.toThrow(
    "未配置",
  );
  vi.stubEnv("BNBU_EMAIL_DELIVERY_URL", "https://mail.example.test/send");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ sent: false }), { status: 502 }),
      ),
  );
  await expect(requestAdminEmail(f.db, f.admin.account, false)).rejects.toThrow(
    "未确认",
  );
  expect(adminEmailStatus(f.repo, f.admin.account).verified).toBe(false);
});
