import { afterEach, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import {
  settlementCheck,
  settlementWorkspace,
} from "../server/sports/settlement";
import { createApiServer } from "../server/main";
const dbs: Database[] = [];
afterEach(() => dbs.splice(0).forEach((d) => d.close()));
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const id = createAccount(db, {
      email: name + "@example.test",
      name,
      password: "Test-password-123",
      roles: role === "admin" ? ["superadmin"] : [],
    });
    repo.create("sportsIdentity", id, {
      role,
      status: "verified",
      studentNumber: role === "student" ? "S001" : undefined,
      schoolEmailVerified: true,
      schoolEmail: name + "@example.test",
    });
    return login(db, name + "@example.test", "Test-password-123");
  };
  const teacher = make("teacher", "teacher"),
    student = make("student", "student"),
    admin = make("admin", "admin"),
    other = make("other", "teacher");
  const semester = repo.create("sportsSemester", admin.account.id, {
      status: "CURRENT",
    }),
    course = repo.create("sportsCourse", teacher.account.id, {
      semesterId: semester.id,
      status: "CLOSED",
      settlementStatus: "PENDING",
      name: "测试结算班",
      closingDate: "2026-01-08",
      relatedTarget: 600,
      otherTarget: 600,
      threshold: 30,
      weeklyLimit: 2,
    });
  const member = repo.create("sportsEnrollment", student.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  const snapshot = repo.create("sportsRosterSnapshot", teacher.account.id, {
    courseId: course.id,
    rows: [
      {
        row: 2,
        studentNumber: "S001",
        name: "student",
        columnError: false,
        excluded: false,
      },
    ],
  });
  repo.create("sportsRosterBasis", teacher.account.id, {
    courseId: course.id,
    snapshotId: snapshot.id,
  });
  repo.create("sportsExemption", student.account.id, {
    courseId: course.id,
    enrollmentId: member.id,
    status: "APPROVED",
  });
  repo.create("sportsGradePublication", student.account.id, {
    courseId: course.id,
    enrollmentId: member.id,
    score: 97531,
    sequence: 1,
  });
  const run = (
    who: typeof teacher,
    action: string,
    input: Record<string, unknown>,
    requestId = randomUUID(),
  ) =>
    repo.get(
      (execute(db, who.token, action, input, requestId) as { id: string }).id,
    );
  const prepare = () =>
    run(teacher, "sports.settlement.prepare", {
      id: course.id,
      version: repo.get(course.id).version,
    });
  return {
    db,
    repo,
    teacher,
    student,
    admin,
    other,
    semester,
    course,
    member,
    snapshot,
    run,
    prepare,
  };
}
it("低于目标不阻止合法结算，冻结内容与来源同事务保存，重放不另建报告", () => {
  const f = setup(),
    prep = f.prepare();
  expect(prep.data.status).toBe("READY");
  const input = { id: prep.id, version: prep.version, confirmed: true },
    key = randomUUID();
  const report = f.run(f.teacher, "sports.settlement.confirm", input, key);
  expect(report.data.sequence).toBe(1);
  expect(f.repo.get(f.course.id).data).toMatchObject({
    status: "CLOSED",
    settlementStatus: "SETTLED",
    settlementReportId: report.id,
  });
  expect(f.run(f.teacher, "sports.settlement.confirm", input, key).id).toBe(
    report.id,
  );
  expect(f.repo.all("sportsSettlementReport")).toHaveLength(1);
  expect(JSON.stringify(report)).not.toContain('"score"');
  expect(
    (report.data.report as { rows: { facts: { remaining: number[] } }[] })
      .rows[0].facts.remaining,
  ).toEqual([600, 600]);
  const original = JSON.stringify(report);
  f.repo.save(f.member, { status: "REMOVED" });
  expect(JSON.stringify(f.repo.get(report.id))).toBe(original);
  for (const who of [f.student, f.admin, f.other])
    expect(
      settlementWorkspace(f.repo, who.account).settlementReports,
    ).toHaveLength(0);
});
it("准备后相关事实变化或成员新增使确认失败，客户端不能伪造统计/清除阻塞", () => {
  const f = setup(),
    prep = f.prepare();
  f.repo.create("sportsCertification", f.student.account.id, {
    courseId: f.course.id,
    status: "VALID",
    category: "RELATED",
    minutes: 30,
  });
  expect(() =>
    f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    }),
  ).toThrow("来源已变化");
  expect(f.repo.all("sportsSettlementReport")).toHaveLength(0);
  expect(f.repo.get(f.course.id).data.settlementStatus).toBe("PENDING");
  expect(() =>
    f.run(f.teacher, "sports.settlement.prepare", {
      id: f.course.id,
      version: f.course.version,
      blockers: [],
    }),
  ).toThrow("服务端读取");
  const fresh = f.prepare();
  f.repo.create("sportsEnrollment", f.other.account.id, {
    courseId: f.course.id,
    status: "ACTIVE",
  });
  expect(() =>
    f.run(f.teacher, "sports.settlement.confirm", {
      id: fresh.id,
      version: fresh.version,
      confirmed: true,
    }),
  ).toThrow("仍有合法待办");
});
it("结束会话合法首次材料窗口即使没有受理回执也阻塞，真实过期只保留未提交事实", () => {
  const f = setup(),
    now = Date.now();
  const session = f.repo.create("sportsSession", f.student.account.id, {
    courseId: f.course.id,
    clock: {
      state: "ENDED",
      startedAt: now - 60000,
      endedAt: now,
      changedAt: now,
      activeMilliseconds: 60000,
      businessDate: "2026-01-05",
    },
  });
  expect(
    settlementCheck(f.repo, f.teacher.account, f.course.id).blockers,
  ).toContainEqual({
    code: "FIRST_MATERIAL_PENDING",
    objectId: session.id,
    count: 1,
  });
  f.repo.save(session, {
    clock: {
      state: "ENDED",
      startedAt: now - 86400000 - 60000,
      endedAt: now - 86400000,
      changedAt: now - 86400000,
      activeMilliseconds: 60000,
      businessDate: "2026-01-05",
    },
  });
  const check = settlementCheck(f.repo, f.teacher.account, f.course.id);
  expect(check.blockers).toEqual([]);
  expect(check.report.rows[0].facts).toMatchObject({
    expiredWithoutMaterials: 1,
    awaitingMaterials: 0,
    total: 0,
    actualMinutes: 1,
  });
  expect(f.repo.all("sportsRecord")).toHaveLength(0);
});
it("会话、技术待办、申请、成绩和未到期收尾不能被结算自动置无效", () => {
  const f = setup();
  f.repo.save(f.course, { status: "PUBLISHED", closingDate: "2099-01-01" });
  f.repo.create("sportsSession", f.student.account.id, {
    courseId: f.course.id,
    clock: { state: "ACTIVE", activeMilliseconds: 0 },
  });
  const record = f.repo.create("sportsRecord", f.student.account.id, {
    courseId: f.course.id,
    status: "TECHNICAL",
    activeMilliseconds: 0,
  });
  f.repo.create("sportsMaterialBatch", f.student.account.id, {
    recordId: record.id,
    status: "UPLOADING",
  });
  f.repo.create("sportsApplication", f.student.account.id, {
    courseId: f.course.id,
    status: "SUPPLEMENT_REQUIRED",
  });
  f.repo.create("sportsGradeDraft", f.student.account.id, {
    courseId: f.course.id,
    status: "DRAFT",
  });
  const prep = f.prepare(),
    codes = (prep.data.blockers as { code: string }[]).map((b) => b.code);
  expect(codes).toEqual(
    expect.arrayContaining([
      "NEW_STARTS_STILL_OPEN",
      "OPEN_SESSION",
      "PENDING_RECORD",
      "MATERIAL_BATCH_PENDING",
      "APPLICATION_PENDING",
      "FINAL_GRADE_DRAFT",
    ]),
  );
  expect(f.repo.get(record.id).data.status).toBe("TECHNICAL");
});
it("结算完成后才能切换学期；历史报告读取和导出始终仅原责任教师", async () => {
  const f = setup();
  const next = f.repo.create("sportsSemester", f.admin.account.id, {
    status: "UPCOMING",
    startDate: "2020-01-01",
  });
  expect(() =>
    f.run(f.admin, "sports.semester.activate", {
      id: next.id,
      version: next.version,
    }),
  ).toThrow("未完成收尾结算");
  const prep = f.prepare(),
    report = f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  f.run(f.admin, "sports.semester.activate", {
    id: next.id,
    version: next.version,
  });
  expect(f.repo.get(f.semester.id).data.status).toBe("ARCHIVED");
  const server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/sports/settlement-reports/${report.id}`;
  try {
    for (const suffix of ["", ".csv"]) {
      const good = await fetch(url + suffix, {
        headers: { Cookie: `bnbu_session=${f.teacher.token}` },
      });
      expect(good.status).toBe(200);
      expect(await good.text()).not.toContain('"score"');
      for (const who of [f.student, f.admin, f.other])
        expect(
          (
            await fetch(url + suffix, {
              headers: { Cookie: `bnbu_session=${who.token}` },
            })
          ).status,
        ).toBe(403);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
it("旧结算标记而没有对应冻结报告不能被当作可归档凭据", () => {
  const f = setup();
  f.repo.save(f.course, {
    settlementStatus: "SETTLED",
    settlementReportId: randomUUID(),
  });
  const next = f.repo.create("sportsSemester", f.admin.account.id, {
    status: "UPCOMING",
    startDate: "2020-01-01",
  });
  expect(() =>
    f.run(f.admin, "sports.semester.activate", {
      id: next.id,
      version: next.version,
    }),
  ).toThrow("未完成收尾结算");
});

it("归档后原内部成绩更正追加报告，保留旧版及冻结身份，幂等且不泄露分数原因", () => {
  const f = setup(),
    prep = f.prepare();
  const first = f.run(f.teacher, "sports.settlement.confirm", {
    id: prep.id,
    version: prep.version,
    confirmed: true,
  });
  const original = f.repo.all("sportsGradePublication")[0],
    old = JSON.stringify(first);
  f.repo.save(f.semester, { status: "ARCHIVED" });
  f.db
    .prepare("UPDATE accounts SET name=? WHERE id=?")
    .run("改名后", f.student.account.id);
  const input = {
      kind: "GRADE",
      id: original.id,
      version: original.version,
      previousReportId: first.id,
      score: 86420,
      reason: "PRIVATE_REASON 原始成绩单核对",
      confirmed: true,
    },
    key = randomUUID();
  for (const who of [f.student, f.admin, f.other])
    expect(() => f.run(who, "sports.correction.apply", input)).toThrow();
  const result = f.run(f.teacher, "sports.correction.apply", input, key);
  expect(result.data).toMatchObject({
    sequence: 2,
    previousId: first.id,
    correctionReason: input.reason,
  });
  expect(JSON.stringify(f.repo.get(first.id))).toBe(old);
  expect((result.data.report as { rows: unknown[] }).rows).toEqual(
    (first.data.report as { rows: unknown[] }).rows,
  );
  expect(f.repo.get(original.id).data.score).toBe(97531);
  expect(f.repo.all("sportsGradePublication")).toHaveLength(2);
  expect(f.repo.get(f.course.id).data).toMatchObject({
    status: "CLOSED",
    settlementStatus: "SETTLED",
    settlementReportId: result.id,
  });
  expect(f.run(f.teacher, "sports.correction.apply", input, key).id).toBe(
    result.id,
  );
  expect(f.repo.all("sportsSettlementReport")).toHaveLength(2);
  const notices = JSON.stringify(
    f.db
      .prepare("SELECT body FROM notifications WHERE recipient_id=?")
      .all(f.student.account.id),
  );
  expect(notices).not.toMatch(/86420|97531|PRIVATE_REASON/);
  expect(() => f.run(f.teacher, "sports.correction.apply", input)).toThrow(
    "已有后继",
  );
  expect(() =>
    f.run(f.teacher, "sports.grade.save", {
      enrollmentId: f.member.id,
      version: 2,
      score: 1,
      historicalCorrection: true,
    }),
  ).toThrow("附加字段");
});
it("结算体测更正仅更新原冻结行体测事实，保留旧历史和其他统计，失败不留下半次更正", () => {
  const f = setup();
  f.repo.save(f.repo.all("sportsExemption")[0], { status: "REVOKED" });
  f.repo.save(f.course, { status: "PUBLISHED" });
  const endurance = f.run(f.teacher, "sports.endurance.confirm", {
    enrollmentId: f.member.id,
    version: 0,
    event: 1000,
    seconds: 300,
    testDate: "2026-01-01",
    confirmed: true,
  });
  f.repo.save(f.repo.get(f.course.id), { status: "CLOSED" });
  const prep = f.prepare(),
    first = f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  f.repo.save(f.semester, { status: "ARCHIVED" });
  const original = JSON.stringify(first),
    revisions = JSON.stringify(f.repo.all("sportsEnduranceRevision"));
  const input = {
    kind: "ENDURANCE",
    id: endurance.id,
    version: endurance.version,
    previousReportId: first.id,
    event: 1000,
    seconds: 290,
    testDate: "2026-01-01",
    reason: "核对原计时单",
    confirmed: true,
  };
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", { ...input, seconds: -1 }),
  ).toThrow();
  expect(f.repo.all("sportsHistoricalCorrection")).toHaveLength(0);
  expect(JSON.stringify(f.repo.all("sportsEnduranceRevision"))).toBe(revisions);
  const next = f.run(f.teacher, "sports.correction.apply", input);
  expect(JSON.stringify(f.repo.get(first.id))).toBe(original);
  expect(f.repo.all("sportsEnduranceRevision")).toHaveLength(2);
  const oldRows = (
    first.data.report as { rows: { facts: Record<string, unknown> }[] }
  ).rows;
  expect((next.data.report as { rows: unknown[] }).rows).toEqual(
    oldRows.map((r) => ({
      ...r,
      facts: {
        ...r.facts,
        enduranceStatus: "RECORDED",
        endurance: { event: 1000, seconds: 290, testDate: "2026-01-01" },
      },
    })),
  );
  expect(f.repo.get(endurance.id).data.seconds).toBe(290);
  expect(() =>
    f.run(f.teacher, "sports.endurance.confirm", {
      enrollmentId: f.member.id,
      version: 2,
      event: 1000,
      seconds: 280,
      testDate: "2026-01-01",
      confirmed: true,
    }),
  ).toThrow("历史报告更正");
});
it("历史更正拒绝无变化、冻结范围外成员和丢失原行，不创建事实或报告", () => {
  const f = setup(),
    prep = f.prepare(),
    first = f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  const grade = f.repo.all("sportsGradePublication")[0],
    input = {
      kind: "GRADE",
      id: grade.id,
      version: grade.version,
      previousReportId: first.id,
      score: 123,
      reason: "核对原件",
      confirmed: true,
    };
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", { ...input, score: 97531 }),
  ).toThrow("未变化");
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", { ...input, reason: "" }),
  ).toThrow();
  f.repo.save(first, {
    report: { ...(first.data.report as object), rows: [] },
  });
  expect(() => f.run(f.teacher, "sports.correction.apply", input)).toThrow(
    "对应成员行",
  );
  f.repo.save(f.repo.get(first.id), { report: first.data.report });
  f.repo.create("sportsEnrollment", f.other.account.id, {
    courseId: f.course.id,
    status: "REMOVED",
  });
  expect(() => f.run(f.teacher, "sports.correction.apply", input)).toThrow(
    "成员集合已变化",
  );
  expect(f.repo.all("sportsGradePublication")).toHaveLength(1);
  expect(f.repo.all("sportsHistoricalCorrection")).toHaveLength(0);
  expect(f.repo.all("sportsSettlementReport")).toHaveLength(1);
});
