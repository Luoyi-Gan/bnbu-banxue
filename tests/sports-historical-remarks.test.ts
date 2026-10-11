import { afterEach, expect, it } from "vitest";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { historicalRemarks } from "../server/sports/historical-remarks";
import { gradeWorkspace } from "../server/sports/grades";
import { createApiServer } from "../server/main";
const dbs: Database[] = [];
afterEach(() => dbs.splice(0).forEach((d) => d.close()));
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  function make(name: string, role: string) {
    const id = createAccount(db, {
      email: name + "@example.test",
      name,
      password: "Test-password-123",
      roles: [],
    });
    const identity = repo.create("sportsIdentity", id, {
      role,
      status: "verified",
    });
    return {
      ...login(db, name + "@example.test", "Test-password-123"),
      identity,
    };
  }
  const teacher = make("teacher", "teacher"),
    other = make("other", "teacher"),
    student = make("student", "student"),
    admin = make("admin", "admin");
  const course = repo.create("sportsCourse", teacher.account.id, {
    status: "CLOSED",
  });
  const pub = repo.create("sportsGradePublication", student.account.id, {
    courseId: course.id,
    enrollmentId: "original-member",
    score: 912345,
    remark: "LEGACY_PRIVATE_NOTE",
    publishedAt: 1,
  });
  return { db, repo, teacher, other, student, admin, course, pub };
}
it("有效非任课教师可审计读取旧备注，普通成绩投影不含备注，存储原件保持", () => {
  const f = setup(),
    original = JSON.stringify(f.repo.get(f.pub.id));
  const result = historicalRemarks(f.repo, f.other.account, {
    purpose: "核对历史教学说明",
    publicationId: f.pub.id,
  });
  expect(result.items).toEqual([
    {
      publicationId: f.pub.id,
      courseId: f.course.id,
      enrollmentId: "original-member",
      remark: "LEGACY_PRIVATE_NOTE",
      publishedAt: 1,
    },
  ]);
  expect(JSON.stringify(result)).not.toMatch(/score|912345/);
  expect(
    JSON.stringify(gradeWorkspace(f.repo, f.teacher.account)),
  ).not.toContain("LEGACY_PRIVATE_NOTE");
  expect(
    gradeWorkspace(f.repo, f.other.account).gradePublications,
  ).toHaveLength(0);
  const audit = f.db
    .prepare("SELECT * FROM audit WHERE action='sports.grade.remarks.read'")
    .all();
  expect(audit).toHaveLength(1);
  expect(audit[0]).toMatchObject({
    actor_id: f.other.account.id,
    reason: "核对历史教学说明",
    created_at: result.readAt,
  });
  expect(JSON.stringify(audit)).not.toMatch(/LEGACY_PRIVATE_NOTE|912345/);
  expect(JSON.stringify(f.repo.get(f.pub.id))).toBe(original);
  for (const who of [f.student, f.admin])
    expect(() =>
      historicalRemarks(f.repo, who.account, { purpose: "查看" }),
    ).toThrow("有效体育身份");
  f.repo.save(f.other.identity, { status: "revoked" });
  expect(() =>
    historicalRemarks(f.repo, f.other.account, { purpose: "查看" }),
  ).toThrow();
});
it("分页凭据绑定教师、用途和筛选，审计不可写时读取失败且不生成游标", () => {
  const f = setup();
  for (let i = 0; i < 51; i++)
    f.repo.create("sportsGradePublication", f.student.account.id, {
      courseId: f.course.id,
      enrollmentId: "old-member",
      remark: "旧备注" + i,
      score: 9999,
    });
  const page = historicalRemarks(f.repo, f.other.account, {
    purpose: "教学核对",
  });
  expect(page.items).toHaveLength(50);
  expect(page.nextCursor).toBeTruthy();
  expect(() =>
    historicalRemarks(f.repo, f.teacher.account, {
      purpose: "教学核对",
      cursor: page.nextCursor,
    }),
  ).toThrow("分页凭据");
  expect(() =>
    historicalRemarks(f.repo, f.other.account, {
      purpose: "另一用途",
      cursor: page.nextCursor,
    }),
  ).toThrow("分页凭据");
  expect(() =>
    historicalRemarks(f.repo, f.other.account, {
      purpose: "教学核对",
      publicationId: f.pub.id,
      cursor: page.nextCursor,
    }),
  ).toThrow("分页凭据");
  const next = historicalRemarks(f.repo, f.other.account, {
    purpose: "教学核对",
    cursor: page.nextCursor,
  });
  expect(next.items).toHaveLength(2);
  expect(next.nextCursor).toBeNull();
  expect(
    new Set([...page.items, ...next.items].map((p) => p.publicationId)).size,
  ).toBe(52);
  const before = f.repo.all("sportsRemarkReadCursor").length;
  f.db.exec(
    "CREATE TRIGGER reject_remark_audit BEFORE INSERT ON audit BEGIN SELECT RAISE(ABORT,'audit unavailable'); END;",
  );
  expect(() =>
    historicalRemarks(f.repo, f.other.account, { purpose: "教学核对" }),
  ).toThrow("audit unavailable");
  expect(f.repo.all("sportsRemarkReadCursor")).toHaveLength(before);
});
it("专用HTTP读取拒绝无用途和学生，成功响应禁止缓存；普通工作台无历史备注", async () => {
  const f = setup(),
    server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base =
    "http://127.0.0.1:" + (server.address() as { port: number }).port;
  try {
    const headers = { Cookie: "bnbu_session=" + f.other.token };
    expect(
      (
        await fetch(base + "/api/sports/historical-final-grade-remarks", {
          headers,
        })
      ).status,
    ).toBe(400);
    const good = await fetch(
      base +
        "/api/sports/historical-final-grade-remarks?purpose=" +
        encodeURIComponent("核对教学历史"),
      { headers },
    );
    expect(good.status).toBe(200);
    expect(good.headers.get("cache-control")).toBe("no-store");
    expect(await good.text()).not.toContain("912345");
    expect(
      (
        await fetch(
          base + "/api/sports/historical-final-grade-remarks?purpose=test",
          { headers: { Cookie: "bnbu_session=" + f.student.token } },
        )
      ).status,
    ).toBe(403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
