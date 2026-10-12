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
import ExcelJS from "exceljs";
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
it("原版结算预检只读，保留阻塞和未知分母，按课程隔离", async () => {
  const f = setup();
  const server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/class-sections/${f.course.id}/settlement-`;
  const get = (suffix: string, who = f.teacher) =>
    fetch(url + suffix, { headers: { Cookie: `bnbu_session=${who.token}` } });
  try {
    const first = await get("preview");
    expect(first.status).toBe(200);
    const ready = (await first.json()).data;
    expect(ready).toMatchObject({
      canConfirm: true,
      expectedVersion: 0,
      checks: [],
      preview: { denominator: 1, registrationComplete: true, extras: [] },
    });
    expect(ready.preview.rows[0]).toMatchObject({
      studentNumber: "S001",
      status: "MATCHED",
      pendingCount: 0,
    });
    expect(ready.previewFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect((await (await get("preview")).json()).data.previewFingerprint).toBe(
      ready.previewFingerprint,
    );
    expect(f.repo.all("sportsSettlementPreparation")).toHaveLength(0);
    expect(f.repo.all("sportsSettlementReport")).toHaveLength(0);
    const exportUrl = url.replace(/settlement-$/, "composite-roster/export");
    const exported = await fetch(exportUrl, {
      headers: { Cookie: `bnbu_session=${f.teacher.token}` },
    });
    expect(exported.status).toBe(200);
    const file = (await exported.json()).data;
    expect(file.fileName).toBe("composite-roster.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(file.fileBase64, "base64"));
    const exportedRows: unknown[][] = [];
    workbook.worksheets[0].eachRow((row) =>
      exportedRows.push(row.values as unknown[]),
    );
    expect(exportedRows.find((row) => row[1] === "报告类型")?.[2]).toBe(
      "CURRENT_TEACHING_REPORT",
    );
    expect(exportedRows.find((row) => row[1] === "名单分母")?.[2]).toBe(1);
    expect(exportedRows.find((row) => row[1] === "SCHOOL")?.[4]).toBe(
      "student",
    );
    expect(JSON.stringify(exportedRows)).not.toContain("97531");
    for (const who of [f.student, f.other, f.admin])
      expect(
        (
          await fetch(exportUrl, {
            headers: { Cookie: `bnbu_session=${who.token}` },
          })
        ).status,
      ).toBe(403);
    f.repo.create("sportsGradeDraft", f.teacher.account.id, {
      courseId: f.course.id,
      enrollmentId: f.member.id,
      status: "DRAFT",
    });
    const blocked = (await (await get("preview")).json()).data;
    expect(blocked.canConfirm).toBe(false);
    expect(blocked.previewFingerprint).not.toBe(ready.previewFingerprint);
    expect(blocked.checks).toContainEqual({
      code: "FINAL_GRADE_DRAFT",
      status: "BLOCKED",
      count: 1,
    });
    expect(blocked.preview.rows[0].pendingCount).toBeNull();
    expect((await (await get("check")).json()).data).toEqual({
      checks: blocked.checks,
    });
    f.repo.save(f.snapshot, {
      rows: [
        {
          row: 2,
          studentNumber: "S001",
          name: "student",
          columnError: false,
          excluded: false,
        },
        {
          row: 3,
          studentNumber: "S001",
          name: "student",
          columnError: false,
          excluded: false,
        },
      ],
    });
    const conflict = (await (await get("preview")).json()).data;
    expect(conflict.preview.denominator).toBeNull();
    expect(conflict.preview.registrationComplete).toBe(false);
    expect(
      conflict.preview.rows.map((row: { status: string }) => row.status),
    ).toEqual(["IDENTITY_CONFLICT", "IDENTITY_CONFLICT"]);
    expect(conflict.preview.extras).toHaveLength(1);
    for (const who of [f.student, f.other, f.admin])
      for (const suffix of ["preview", "check"])
        expect((await get(suffix, who)).status).toBe(403);
    f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await get("preview")).status).toBe(503);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
it("原版结算确认拒绝过期预览，原子保存且重试返回原报告", async () => {
  const f = setup();
  const server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/class-sections/${f.course.id}/settlement-reports`;
  const post = (body: unknown, key = randomUUID(), who = f.teacher) =>
    fetch(url, {
      method: "POST",
      headers: {
        Cookie: `bnbu_session=${who.token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": key,
      },
      body: JSON.stringify(body),
    });
  try {
    const old = {
      expectedVersion: 0,
      previewFingerprint: settlementCheck(
        f.repo,
        f.teacher.account,
        f.course.id,
      ).manifest.hash,
    };
    f.repo.save(f.course, { name: "改名后须重新核对" });
    expect((await post(old)).status).toBe(409);
    expect(f.repo.all("sportsSettlementPreparation")).toHaveLength(0);
    const body = {
      ...old,
      previewFingerprint: settlementCheck(
        f.repo,
        f.teacher.account,
        f.course.id,
      ).manifest.hash,
    };
    for (const who of [f.student, f.other, f.admin])
      expect((await post(body, randomUUID(), who)).status).toBe(403);
    expect((await post({ ...body, canConfirm: true })).status).toBe(400);
    const key = randomUUID();
    const response = await post(body, key);
    expect(response.status).toBe(200);
    const saved = (await response.json()).data;
    expect(saved).toMatchObject({
      version: 1,
      kind: "INITIAL",
      correctionReason: null,
    });
    expect((await (await post(body, key)).json()).data).toEqual(saved);
    expect(f.repo.all("sportsSettlementReport")).toHaveLength(1);
    expect(f.repo.all("sportsSettlementPreparation")).toHaveLength(1);
    expect(f.repo.get(f.course.id).data.settlementReportId).toBe(saved.id);
    expect((await post(body)).status).toBe(409);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
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
    const frozenName = (report.data.report as { course: { name: string } })
      .course.name;
    f.repo.save(f.repo.get(f.course.id), { name: "当前名称已变化" });
    const exportUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/class-sections/${f.course.id}/settlement-reports/1/export`;
    const exported = await fetch(exportUrl, {
      headers: { Cookie: `bnbu_session=${f.teacher.token}` },
    });
    expect(exported.status).toBe(200);
    const file = (await exported.json()).data;
    expect(file.fileName).toBe("settlement-report-v1.xlsx");
    expect(file.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(file.fileBase64, "base64"));
    const values: unknown[][] = [];
    workbook.worksheets[0].eachRow((row) =>
      values.push(row.values as unknown[]),
    );
    expect(values.find((row) => row[1] === "冻结报告ID")?.[2]).toBe(report.id);
    expect(values.find((row) => row[1] === "课程")?.[2]).toBe(frozenName);
    expect(JSON.stringify(values)).not.toContain("当前名称已变化");
    for (const who of [f.student, f.admin, f.other])
      expect(
        (
          await fetch(exportUrl, {
            headers: { Cookie: `bnbu_session=${who.token}` },
          })
        ).status,
      ).toBe(403);
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
it("原版体测历史更正保留旧报告，重放返回旧修订，缺测不可补造", async () => {
  const f = setup();
  f.repo.save(f.repo.all("sportsExemption")[0], { status: "REVOKED" });
  f.repo.save(f.course, { status: "PUBLISHED" });
  f.run(f.teacher, "sports.endurance.confirm", {
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
  const original = JSON.stringify(first);
  const server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/enrollments/${f.member.id}/physical-results/corrections`;
  const post = (body: unknown, key = randomUUID(), who = f.teacher) =>
    fetch(url, {
      method: "POST",
      headers: {
        Cookie: `bnbu_session=${who.token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": key,
      },
      body: JSON.stringify(body),
    });
  try {
    const body = {
      expectedVersion: 1,
      runType: "1000m",
      elapsedSeconds: 290,
      testedOn: "2026-01-01",
      correctionReason: "核对原计时单",
    };
    for (const who of [f.student, f.other, f.admin])
      expect((await post(body, randomUUID(), who)).status).toBe(403);
    const key = randomUUID(),
      response = await post(body, key);
    expect(response.status).toBe(200);
    const saved = (await response.json()).data;
    expect(saved).toMatchObject({ version: 2, elapsedSeconds: 290 });
    expect(
      (await post({ ...body, expectedVersion: 2, elapsedSeconds: 280 })).status,
    ).toBe(200);
    expect((await (await post(body, key)).json()).data).toEqual(saved);
    expect(JSON.stringify(f.repo.get(first.id))).toBe(original);
    expect(f.repo.all("sportsSettlementReport")).toHaveLength(3);
    expect((await post(body)).status).toBe(409);
    const missing = setup(),
      missingPrep = missing.prepare();
    missing.run(missing.teacher, "sports.settlement.confirm", {
      id: missingPrep.id,
      version: missingPrep.version,
      confirmed: true,
    });
    expect(() =>
      missing.run(missing.teacher, "sports.physical.correct", {
        ...body,
        enrollmentId: missing.member.id,
        expectedVersion: 0,
      }),
    ).toThrow("缺测记录保留");
    expect(missing.repo.all("sportsEndurance")).toHaveLength(0);
    expect(missing.repo.all("sportsSettlementReport")).toHaveLength(1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
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

function settledExerciseFixture() {
  const f = setup();
  const records = [35, 45].map((minutes, i) => {
    const session = f.repo.create("sportsSession", f.student.account.id, {
      courseId: f.course.id,
      clock: {
        state: "ENDED",
        startedAt: Date.parse("2026-01-02T00:00:00Z") + i * 3600000,
        endedAt:
          Date.parse("2026-01-02T00:00:00Z") + i * 3600000 + minutes * 60000,
        activeMilliseconds: minutes * 60000,
        businessDate: "2026-01-02",
      },
    });
    const record = f.repo.create("sportsRecord", f.student.account.id, {
      courseId: f.course.id,
      semesterId: f.semester.id,
      sessionId: session.id,
      category: "RELATED",
      status: "VALID",
      activeMilliseconds: minutes * 60000,
      supplementUsed: true,
    });
    const batch = f.repo.create("sportsMaterialBatch", f.student.account.id, {
      recordId: record.id,
      status: "COMPLETE",
    });
    f.repo.create("sportsMaterial", f.student.account.id, {
      recordId: record.id,
      batchId: batch.id,
      status: "COMPLETE",
    });
    return f.repo.save(record, { batchId: batch.id });
  });
  const prep = f.prepare(),
    first = f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  f.repo.save(f.semester, { status: "ARCHIVED" });
  return { ...f, records, first };
}
it("归档审核更正沿用原材料和一次补证限制，重新选择其他有效记录并追加报告", () => {
  const f = settledExerciseFixture(),
    r = f.records[1];
  const original = JSON.stringify(f.first),
    sessions = JSON.stringify(f.repo.all("sportsSession")),
    materials = JSON.stringify(f.repo.all("sportsMaterial"));
  const input = {
    kind: "REVIEW",
    id: r.id,
    version: r.version,
    previousReportId: f.first.id,
    decision: "INVALID",
    reviewReason: "MISMATCH",
    batchId: r.data.batchId,
    checksCompleted: true,
    reason: "核对原材料确认不属于本次运动",
    confirmed: true,
  };
  for (const who of [f.admin, f.student, f.other])
    expect(() => f.run(who, "sports.correction.apply", input)).toThrow();
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", {
      ...input,
      checksCompleted: false,
    }),
  ).toThrow("规定检查");
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", {
      ...input,
      decision: "RETURN",
    }),
  ).toThrow();
  const key = randomUUID(),
    result = f.run(f.teacher, "sports.correction.apply", input, key);
  expect(f.run(f.teacher, "sports.correction.apply", input, key).id).toBe(
    result.id,
  );
  const facts = (
    result.data.report as {
      rows: {
        facts: { total: number; invalidMinutes: number; actualMinutes: number };
      }[];
    }
  ).rows[0].facts;
  expect(facts).toMatchObject({
    total: 35,
    invalidMinutes: 45,
    actualMinutes: 80,
  });
  expect(f.repo.get(r.id).data.supplementUsed).toBe(true);
  expect(JSON.stringify(f.repo.get(f.first.id))).toBe(original);
  expect(JSON.stringify(f.repo.all("sportsSession"))).toBe(sessions);
  expect(JSON.stringify(f.repo.all("sportsMaterial"))).toBe(materials);
  expect(f.repo.all("sportsReviewEvent")).toHaveLength(1);
  expect(f.repo.all("sportsReviewEvent")[0].data).toMatchObject({
    action: "CORRECTION",
    previousStatus: "VALID",
    decision: "INVALID",
  });
  expect(() =>
    f.run(f.teacher, "sports.review.correct", {
      ...input,
      version: f.repo.get(r.id).version,
      publicExplanation: "尝试普通入口",
      historicalCorrection: true,
    }),
  ).toThrow("历史报告更正");
});
it("归档认证调整撤销重算个人进度，保留认可历史和冻结统计原版，不重开新业务", () => {
  const f = setup();
  const app = f.repo.create("sportsApplication", f.student.account.id, {
    courseId: f.course.id,
    enrollmentId: f.member.id,
    applicationType: "CERTIFICATION",
    status: "APPROVED",
  });
  for (const [category, minutes] of [
    ["RELATED", 100],
    ["OTHER", 200],
  ])
    f.repo.create("sportsCertification", f.student.account.id, {
      courseId: f.course.id,
      enrollmentId: f.member.id,
      applicationId: app.id,
      category,
      minutes,
      status: "VALID",
    });
  const prep = f.prepare(),
    first = f.run(f.teacher, "sports.settlement.confirm", {
      id: prep.id,
      version: prep.version,
      confirmed: true,
    });
  f.repo.save(f.semester, { status: "ARCHIVED" });
  const original = JSON.stringify(first),
    input = {
      kind: "CERTIFICATION",
      id: app.id,
      version: app.version,
      previousReportId: first.id,
      decision: "ADJUST",
      relatedMinutes: 50,
      otherMinutes: 60,
      reason: "根据原认证依据更正额度",
      confirmed: true,
    };
  expect(() =>
    f.run(f.teacher, "sports.correction.apply", {
      ...input,
      relatedMinutes: 601,
    }),
  ).toThrow();
  expect(f.repo.get(app.id).version).toBe(app.version);
  expect(f.repo.all("sportsCertificationHistory")).toHaveLength(0);
  const next = f.run(f.teacher, "sports.correction.apply", input);
  expect(
    (next.data.report as { rows: { facts: { total: number } }[] }).rows[0].facts
      .total,
  ).toBe(110);
  const last = f.run(f.teacher, "sports.correction.apply", {
    ...input,
    version: f.repo.get(app.id).version,
    previousReportId: next.id,
    decision: "REVOKE",
    reason: "核对后撤销原错误认可",
  });
  expect(
    (last.data.report as { rows: { facts: { total: number } }[] }).rows[0].facts
      .total,
  ).toBe(0);
  expect(JSON.stringify(f.repo.get(first.id))).toBe(original);
  expect(f.repo.all("sportsCertificationHistory")).toHaveLength(4);
  expect(f.repo.all("sportsSettlementReport")).toHaveLength(3);
  expect(
    f.repo.all("sportsCertification").every((c) => c.data.status === "REVOKED"),
  ).toBe(true);
  expect(() =>
    f.run(f.teacher, "sports.certification.adjust", {
      id: app.id,
      version: f.repo.get(app.id).version,
      relatedMinutes: 1,
      otherMinutes: 1,
      reason: "普通入口",
      historicalCorrection: true,
    }),
  ).toThrow("历史报告更正");
});

it.each([false, true])(
  "归档撤销误批免测保留结算与原事实（存在旧体测=%s）",
  (hasRaw) => {
    const f = setup();
    const app = f.repo.create("sportsApplication", f.student.account.id, {
      courseId: f.course.id,
      enrollmentId: f.member.id,
      applicationType: "EXEMPTION",
      status: "APPROVED",
      assetIds: ["原证明ID"],
    });
    const exemption = f.repo.save(f.repo.all("sportsExemption")[0], {
      applicationId: app.id,
    });
    const raw = hasRaw
      ? f.repo.create("sportsEndurance", f.student.account.id, {
          courseId: f.course.id,
          enrollmentId: f.member.id,
          event: 1000,
          seconds: 305,
          testDate: "2026-01-01",
          conversion: { status: "UNAVAILABLE" },
        })
      : null;
    const prep = f.prepare(),
      first = f.run(f.teacher, "sports.settlement.confirm", {
        id: prep.id,
        version: prep.version,
        confirmed: true,
      });
    f.repo.save(f.semester, { status: "ARCHIVED" });
    const old = JSON.stringify(first),
      input = {
        kind: "EXEMPTION",
        id: exemption.id,
        version: exemption.version,
        previousReportId: first.id,
        reason: "核对原证明，先前免测批准错误",
        confirmed: true,
      };
    for (const who of [f.student, f.admin, f.other])
      expect(() => f.run(who, "sports.correction.apply", input)).toThrow();
    const key = randomUUID(),
      next = f.run(f.teacher, "sports.correction.apply", input, key);
    expect(f.run(f.teacher, "sports.correction.apply", input, key).id).toBe(
      next.id,
    );
    const report = next.data.report as {
      rows: {
        facts: { enduranceStatus: string; endurance: unknown; total: number };
      }[];
      unresolved: { code: string; count: number }[];
    };
    expect(report.rows[0].facts).toMatchObject({
      enduranceStatus: hasRaw ? "RECORDED" : "NOT_RECORDED",
      total: 0,
      endurance: hasRaw
        ? { event: 1000, seconds: 305, testDate: "2026-01-01" }
        : null,
    });
    expect(report.unresolved).toEqual(
      hasRaw ? [] : [{ code: "ENDURANCE_NOT_RECORDED", count: 1 }],
    );
    expect(JSON.stringify(f.repo.get(first.id))).toBe(old);
    expect(f.repo.get(f.course.id).data.settlementStatus).toBe("SETTLED");
    expect(f.repo.get(f.semester.id).data.status).toBe("ARCHIVED");
    expect(f.repo.get(exemption.id).data.status).toBe("REVOKED");
    expect(f.repo.get(app.id).data.assetIds).toEqual(["原证明ID"]);
    expect(f.repo.all("sportsApplicationHistory")).toHaveLength(1);
    expect(f.repo.all("sportsEndurance")).toHaveLength(hasRaw ? 1 : 0);
    if (raw) expect(f.repo.get(raw.id)).toEqual(raw);
    expect(() =>
      f.run(f.teacher, "sports.endurance.confirm", {
        enrollmentId: f.member.id,
        version: raw?.version ?? 0,
        event: 1000,
        seconds: 300,
        testDate: "2026-01-01",
        confirmed: true,
      }),
    ).toThrow("历史报告更正");
    expect(() =>
      f.run(f.teacher, "sports.exemption.revoke", {
        id: exemption.id,
        version: 2,
        reason: "普通入口",
      }),
    ).toThrow("历史报告更正");
  },
);

it("已关闭但尚未结算课程撤销免测后保留缺测，服务端拒绝新增补测事实", () => {
  const f = setup();
  const app = f.repo.create("sportsApplication", f.student.account.id, {
    courseId: f.course.id,
    enrollmentId: f.member.id,
    applicationType: "EXEMPTION",
    status: "APPROVED",
  });
  const exemption = f.repo.save(f.repo.all("sportsExemption")[0], {
    applicationId: app.id,
  });
  f.run(f.teacher, "sports.exemption.revoke", {
    id: exemption.id,
    version: exemption.version,
    reason: "误批撤销",
  });
  expect(() =>
    f.run(f.teacher, "sports.endurance.confirm", {
      enrollmentId: f.member.id,
      version: 0,
      event: 1000,
      seconds: 300,
      testDate: "2026-01-01",
      confirmed: true,
    }),
  ).toThrow("关闭课程");
  expect(f.repo.all("sportsEndurance")).toHaveLength(0);
  expect(f.repo.get(f.course.id).data.status).toBe("CLOSED");
  expect(f.prepare().data.status).toBe("BLOCKED");
});
