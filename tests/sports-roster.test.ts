import { afterEach, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { reconcileRoster, rosterWorkspace } from "../server/sports/roster";
const dbs: Database[] = [];
afterEach(() => dbs.splice(0).forEach((d) => d.close()));
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const id = createAccount(db, {
      name,
      email: name + "@example.test",
      password: "Test-password-123",
      roles: role === "admin" ? ["superadmin"] : [],
    });
    repo.create("sportsIdentity", id, {
      role,
      status: "verified",
      studentNumber:
        role === "student" ? (name === "student" ? "S001" : "OUT") : undefined,
    });
    return login(db, name + "@example.test", "Test-password-123");
  };
  const teacher = make("teacher", "teacher"),
    student = make("student", "student"),
    other = make("outsider", "student"),
    admin = make("admin", "admin"),
    semester = repo.create("sportsSemester", teacher.account.id, {
      status: "CURRENT",
    });
  const course = repo.create("sportsCourse", teacher.account.id, {
    semesterId: semester.id,
    status: "PUBLISHED",
  });
  repo.create("sportsEnrollment", student.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  repo.create("sportsEnrollment", other.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  const run = (
    who: typeof teacher,
    action: string,
    input: Record<string, unknown>,
  ) =>
    repo.get(
      (execute(db, who.token, action, input, randomUUID()) as { id: string })
        .id,
    );
  const preview = (csv: string) =>
    run(teacher, "sports.roster.preview", { courseId: course.id, csv });
  const confirm = (draft: ReturnType<typeof preview>, basisVersion = 0) =>
    run(teacher, "sports.roster.confirm", {
      id: draft.id,
      version: draft.version,
      basisVersion,
      confirmed: true,
    });
  return {
    db,
    repo,
    teacher,
    student,
    other,
    admin,
    course,
    semester,
    run,
    preview,
    confirm,
  };
}
it("名单不创建账号或成员，学校邮箱验证与当前邮箱绑定后才匹配完成", () => {
  const f = setup();
  const snapshot = f.confirm(
    f.preview("student_number,name\nS001,student\nS002,未注册学生"),
  );
  let check = reconcileRoster(f.repo, snapshot);
  expect(check).toMatchObject({
    completeCount: 0,
    incompleteCount: 2,
    denominator: 2,
    registrationPercent: 0,
  });
  expect(check.outside).toHaveLength(1);
  const identity = f.repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === f.student.account.id)!;
  f.repo.save(identity, {
    schoolEmailVerified: true,
    schoolEmail: f.student.account.email,
    source: "explicit-local-test-only",
  });
  check = reconcileRoster(f.repo, snapshot);
  expect(check).toMatchObject({
    completeCount: 1,
    incompleteCount: 1,
    registrationPercent: 50,
  });
  f.db
    .prepare("UPDATE accounts SET email=? WHERE id=?")
    .run("changed@example.test", f.student.account.id);
  expect(reconcileRoster(f.repo, snapshot).completeCount).toBe(0);
  expect(f.repo.all("sportsEnrollment")).toHaveLength(2);
  expect(f.db.prepare("SELECT count(*) n FROM accounts").get()?.n).toBe(4);
});
it("重复名单保留不假报分母；新快照明确排除和回退不改变原历史或教学事实", () => {
  const f = setup(),
    csv = "学号,姓名\nS001,student\nS001,student";
  const first = f.confirm(f.preview(csv));
  expect(reconcileRoster(f.repo, first)).toMatchObject({
    rawRowCount: 2,
    conflictCount: 2,
    denominator: null,
    registrationPercent: null,
  });
  let draft = f.preview(csv);
  draft = f.run(f.teacher, "sports.roster.row", {
    id: draft.id,
    version: draft.version,
    row: 3,
    exclude: true,
    reason: "对照学校原件确认重复抄录",
  });
  const second = f.confirm(draft, 1);
  expect(reconcileRoster(f.repo, second)).toMatchObject({
    rawRowCount: 2,
    excludedCount: 1,
    denominator: 1,
  });
  const members = f.repo.all("sportsEnrollment");
  const progress = f.repo.create("sportsProgress", f.student.account.id, {
    courseId: f.course.id,
    minutes: 300,
  });
  f.run(f.teacher, "sports.roster.restore", {
    id: first.id,
    basisVersion: 2,
    confirmed: true,
    reason: "重新以原学校名单核对歧义",
  });
  expect(f.repo.all("sportsRosterBasis")[0].data.snapshotId).toBe(first.id);
  expect(f.repo.all("sportsEnrollment")).toEqual(members);
  expect(f.repo.get(progress.id)).toEqual(progress);
  expect(f.repo.all("sportsRosterSnapshot")).toHaveLength(2);
  expect(f.repo.get(first.id)).toEqual(first);
  expect(f.repo.all("sportsRosterHistory")).toHaveLength(3);
  expect(f.repo.all("sportsRosterRowHistory")).toHaveLength(1);
});
it("教师名单私有，学生仅本人状态，管理员仅当前课程治理摘要", () => {
  const f = setup();
  f.confirm(f.preview("学号,姓名\nS001,错误姓名"));
  const student = rosterWorkspace(f.repo, f.student.account);
  expect(student.rosterDrafts).toEqual([]);
  expect(student.rosterSnapshots).toEqual([]);
  expect(student.rosterChecks).toEqual([]);
  expect(student.studentRosterChecks).toEqual([
    { courseId: f.course.id, status: "CONFLICT" },
  ]);
  const admin = rosterWorkspace(f.repo, f.admin.account);
  expect(admin.rosterSummaries[0]).toMatchObject({
    denominator: null,
    conflictCount: 1,
    outsideCount: 1,
  });
  expect(admin.rosterDrafts).toEqual([]);
  expect(JSON.stringify(admin)).not.toMatch(/错误姓名|S001|student@example/);
  f.repo.save(f.semester, { status: "ARCHIVED" });
  expect(rosterWorkspace(f.repo, f.admin.account).rosterSummaries).toEqual([]);
});
it("正式快照拒绝结构错误、陈旧基准、越权和结算覆盖；关闭前草稿仍可确认", () => {
  const f = setup();
  expect(() =>
    f.run(f.admin, "sports.roster.preview", {
      courseId: f.course.id,
      csv: "学号,姓名\nS001,student",
    }),
  ).toThrow("体育身份");
  expect(() => f.preview("姓名\nstudent")).toThrow("两列");
  expect(() =>
    f.preview("学号,姓名\n" + Array(501).fill("S001,student").join("\n")),
  ).toThrow("500");
  const invalid = f.preview("学号,姓名\n,student");
  expect(() => f.confirm(invalid)).toThrow("错误字段");
  const draft = f.preview("学号,姓名\nS001,student");
  expect(() => f.confirm(draft, 1)).toThrow("基准已变化");
  expect(f.repo.all("sportsRosterSnapshot")).toHaveLength(0);
  f.repo.save(f.course, { status: "CLOSED" });
  const snapshot = f.confirm(draft);
  expect(snapshot.data.rawRowCount).toBe(1);
  expect(() => f.preview("学号,姓名\nS001,student")).toThrow("已关闭");
  f.repo.save(f.repo.get(f.course.id), { settlementStatus: "SETTLED" });
  expect(() =>
    f.run(f.teacher, "sports.roster.restore", {
      id: snapshot.id,
      basisVersion: 1,
      confirmed: true,
      reason: "禁止直接改历史报告",
    }),
  ).toThrow("历史报告更正");
});

it("学校名单CSV文件原件保留、同源去重、关闭后受理链可继续，管理员不读取源", async () => {
  const f = setup();
  const { uploadRosterFile } = await import("../server/sports/roster-files");
  const bytes = Buffer.from("\uFEFF学号,姓名\r\n S001 , student \r\n");
  const source = await uploadRosterFile(
    f.repo,
    f.teacher.token,
    f.course.id,
    "CSV",
    bytes,
  );
  expect(
    (await uploadRosterFile(f.repo, f.teacher.token, f.course.id, "CSV", bytes))
      .id,
  ).toBe(source.id);
  expect(
    Buffer.from(
      f.db
        .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
        .get(String(source.data.sha256))!.bytes as Uint8Array,
    ),
  ).toEqual(bytes);
  f.repo.save(f.course, { status: "CLOSED" });
  const draft = f.run(f.teacher, "sports.roster.source.import", {
    id: source.id,
    sheet: 0,
  });
  expect(
    f.run(f.teacher, "sports.roster.source.import", { id: source.id, sheet: 0 })
      .id,
  ).toBe(draft.id);
  const snapshot = f.confirm(draft);
  expect(
    (snapshot.data.rows as { studentNumber: string }[])[0].studentNumber,
  ).toBe("S001");
  expect(rosterWorkspace(f.repo, f.admin.account).rosterSources).toEqual([]);
  await expect(
    uploadRosterFile(f.repo, f.teacher.token, f.course.id, "CSV", bytes),
  ).rejects.toThrow("不接受新体测");
});
it("名单XLSX两列保留实际行号，公式缓存不能直接成为正式名单", async () => {
  const f = setup();
  const { uploadRosterFile } = await import("../server/sports/roster-files");
  const Excel = (await import("exceljs")).default;
  const book = new Excel.Workbook(),
    sheet = book.addWorksheet("学校名单");
  sheet.getRow(3).values = ["学院", "学号", "姓名"];
  sheet.getRow(8).values = [
    "测试学院",
    "S001",
    { formula: '"student"', result: "student" },
  ];
  sheet.getRow(9).values=["仅学院，没有身份字段"];
  const bytes = Buffer.from(await book.xlsx.writeBuffer());
  const source = await uploadRosterFile(
    f.repo,
    f.teacher.token,
    f.course.id,
    "XLSX",
    bytes,
  );
  let draft = f.run(f.teacher, "sports.roster.source.import", {
    id: source.id,
    sheet: 0,
  });
  expect(
    (draft.data.rows as { sourceRow: number; columnError: boolean }[])[0],
  ).toMatchObject({ sourceRow: 8, columnError: true });
  expect(() => f.confirm(draft)).toThrow("错误字段");
  draft = f.run(f.teacher, "sports.roster.row", {
    id: draft.id,
    version: draft.version,
    row: 2,
    studentNumber: "S001",
    name: "student",
    reason: "对照学校原件确认姓名原文",
  });
  expect((draft.data.rows as unknown[])).toHaveLength(2);
  expect(()=>f.confirm(draft)).toThrow("错误字段");
  draft=f.run(f.teacher,"sports.roster.row",{id:draft.id,version:draft.version,row:3,exclude:true,reason:"对照学校原件确认非人员说明行"});
  expect(f.confirm(draft).data.rawRowCount).toBe(2);
});
it("名单文件真实HTTP上传/下载隔离，编码、行数和100MB上限在服务端拒绝", async () => {
  const f = setup();
  const { uploadRosterFile } = await import("../server/sports/roster-files");
  const { createApiServer } = await import("../server/main");
  await expect(
    uploadRosterFile(
      f.repo,
      f.teacher.token,
      f.course.id,
      "CSV",
      Buffer.from([255, 254, 0]),
    ),
  ).rejects.toThrow("UTF-8");
  await expect(
    uploadRosterFile(
      f.repo,
      f.teacher.token,
      f.course.id,
      "CSV",
      Buffer.from("学号,姓名\n" + Array(501).fill("S001,student").join("\n")),
    ),
  ).rejects.toThrow("500");
  await expect(
    uploadRosterFile(
      f.repo,
      f.teacher.token,
      f.course.id,
      "CSV",
      Buffer.alloc(100 * 1024 * 1024 + 1),
    ),
  ).rejects.toThrow("100MB");
  const server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`,
    bytes = Buffer.from("学号,姓名\nS001,student"),
    cookie = { Cookie: `bnbu_session=${f.teacher.token}` };
  try {
    const response = await fetch(
      `${base}/api/sports/roster-files/${f.course.id}/csv`,
      {
        method: "POST",
        headers: { ...cookie, "Content-Type": "application/octet-stream" },
        body: bytes,
      },
    );
    expect(response.status).toBe(200);
    const { id } = await response.json();
    const raw = await fetch(`${base}/api/sports/roster-sources/${id}`, {
      headers: cookie,
    });
    expect(raw.status).toBe(200);
    expect(Buffer.from(await raw.arrayBuffer())).toEqual(bytes);
    for (const who of [f.student, f.admin])
      expect(
        (
          await fetch(`${base}/api/sports/roster-sources/${id}`, {
            headers: { Cookie: `bnbu_session=${who.token}` },
          })
        ).status,
      ).toBe(403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
