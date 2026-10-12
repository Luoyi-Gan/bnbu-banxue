import { afterEach, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { createApiServer } from "../server/main";
import { parseWorkbook, uploadWorkbook } from "../server/sports/workbook";
import { enduranceImportWorkspace } from "../server/sports/endurance-import";
import { mappedRosterCsv } from "../server/sports/roster-mapping";
import { parseCsv } from "../server/sports/csv";

it("原版列选择工作簿保留自定义表头、跨空列和原行号，公式仍待核对", async () => {
  const book = new ExcelJS.Workbook(),
    sheet = book.addWorksheet("选课表");
  sheet.getCell("B3").value = "注册号";
  sheet.getCell("G3").value = "学生姓名";
  sheet.getCell("B9").value = "0001";
  sheet.getCell("G9").value = "学生甲";
  sheet.getCell("B12").value = { formula: '"0002"', result: "0002" };
  sheet.getCell("G12").value = "学生乙";
  const sheets = await parseWorkbook(
    Buffer.from(await book.xlsx.writeBuffer()),
    "ROSTER_MAPPING",
  );
  expect(sheets[0].error).toBeUndefined();
  expect(sheets[0].rowNumbers).toEqual([3, 9, 12]);
  expect(sheets[0].issues).toEqual([3]);
  const mapped = mappedRosterCsv(sheets[0].csv, {
    studentNumber: "注册号",
    fullName: "学生姓名",
  });
  const rows = parseCsv(mapped.csv);
  expect(rows[0][1]).toBe("student_number");
  expect(rows[0][6]).toBe("name");
  expect(rows[1][1]).toBe("0001");
  expect(rows[1][6]).toBe("学生甲");
});
const databases: Database[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));
async function workbook(formula = false) {
  const book = new ExcelJS.Workbook(),
    sheet = book.addWorksheet("真实成绩单");
  sheet.getRow(3).values = ["学号", "姓名", "项目", "用时", "测试日期"];
  sheet.getRow(9).values = [
    "0001",
    "student",
    800,
    formula ? { formula: "200+70", result: 270 } : "4:30",
    new Date("2026-01-02T00:00:00Z"),
  ];
  book.addWorksheet("说明").getCell("A1").value = "不是成绩单";
  return Buffer.from(await book.xlsx.writeBuffer());
}
it("原版multipart名单上传保留原件与列选择，重试不重复且不建立成员", async () => {
  const f = setup(),
    server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1/class-sections/${f.course.id}/roster-imports`;
  const form = () => {
    const value = new FormData();
    value.set("source", "FILE");
    value.set("fileFormat", "CSV");
    value.set(
      "fieldMappingSnapshot",
      JSON.stringify({ studentNumber: "注册号", fullName: "学生姓名" }),
    );
    value.set(
      "file",
      new Blob(["注册号,学生姓名\n0001,student\n0002,未注册"]),
      "名单.csv",
    );
    return value;
  };
  const post = (key: string, who = f.teacher) =>
    fetch(url, {
      method: "POST",
      headers: { Cookie: `bnbu_session=${who.token}`, "Idempotency-Key": key },
      body: form(),
    });
  try {
    const key = randomUUID(),
      response = await post(key);
    expect(response.status).toBe(200);
    const saved = (await response.json()).data;
    expect(saved).toMatchObject({
      status: "VALIDATED",
      totalRowCount: 2,
      validRowCount: 2,
      versionNumber: 1,
      isCurrent: true,
    });
    expect((await (await post(key)).json()).data).toEqual(saved);
    expect(f.repo.all("sportsPortalRosterImport")).toHaveLength(1);
    expect(f.repo.all("sportsRosterDraft")).toHaveLength(1);
    expect(f.repo.all("sportsRosterSnapshot")).toHaveLength(0);
    expect(f.repo.all("sportsEnrollment")).toHaveLength(1);
    expect(f.repo.all("sportsRosterDraft")[0].data.fieldMapping).toMatchObject({
      studentNumber: "注册号",
      fullName: "学生姓名",
    });
    expect(
      f.db.prepare("SELECT count(*) AS n FROM sports_media_blobs").get()?.n,
    ).toBe(1);
    for (const who of [f.student, f.other, f.admin])
      expect((await post(randomUUID(), who)).status).toBe(403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
function setup() {
  const db = openDatabase(":memory:");
  databases.push(db);
  const repo = new Repository(db);
  const make = (role: string) => {
    const id = createAccount(db, {
      email: role + "@example.test",
      password: "Test-password-123",
      name: role,
      roles: [],
    });
    repo.create("sportsIdentity", id, {
      role: role === "otherteacher" ? "teacher" : role,
      status: "verified",
      studentNumber: role === "student" ? "0001" : undefined,
      sex: "FEMALE",
      year: 1,
    });
    return login(db, role + "@example.test", "Test-password-123");
  };
  const teacher = make("teacher"),
    student = make("student"),
    admin = make("admin"),
    other = make("otherteacher");
  const semester = repo.create("sportsSemester", teacher.account.id, {
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
  const run = (action: string, input: Record<string, unknown>) =>
    repo.get(
      (
        execute(db, teacher.token, action, input, randomUUID()) as {
          id: string;
        }
      ).id,
    );
  return { db, repo, teacher, student, admin, other, course, run };
}
it("XLSX读取中文表头、日期及实际行号，不把公式缓存当作原始事实", async () => {
  const sheets = await parseWorkbook(await workbook());
  expect(sheets[0].rowNumbers).toEqual([3, 9]);
  expect(sheets[0].csv).toContain(
    '"student_number","name","event","time","test_date"',
  );
  expect(sheets[0].csv).toContain('"2026-01-02"');
  expect(sheets[0].issues).toEqual([]);
  expect(sheets[1].error).toContain("没有人员行");
  const formula = await parseWorkbook(await workbook(true));
  expect(formula[0].issues).toEqual([2]);
  await expect(parseWorkbook(Buffer.from("not an xlsx"))).rejects.toThrow(
    "无法解析",
  );
});
it("XLSX受理保留原件，选择工作表复用核对并去重，关闭后合法原批次可继续", async () => {
  const f = setup(),
    bytes = await workbook();
  const source = await uploadWorkbook(
    f.repo,
    f.teacher.token,
    f.course.id,
    bytes,
  );
  expect(
    (await uploadWorkbook(f.repo, f.teacher.token, f.course.id, bytes)).id,
  ).toBe(source.id);
  const stored = f.db
    .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
    .get(String(source.data.sha256));
  expect(Buffer.from(stored!.bytes as Uint8Array)).toEqual(bytes);
  f.repo.save(f.course, { status: "CLOSED" });
  const batch = f.run("sports.endurance.source.import", {
    id: source.id,
    sheet: 0,
  });
  expect(batch.data.source).toBe("XLSX");
  expect((batch.data.rows as { sourceRow: number }[])[0].sourceRow).toBe(9);
  expect(
    f.run("sports.endurance.source.import", { id: source.id, sheet: 0 }).id,
  ).toBe(batch.id);
  f.run("sports.endurance.batch.confirm", {
    id: batch.id,
    version: batch.version,
    rows: [2],
    confirmed: true,
  });
  expect(f.repo.all("sportsEndurance")[0].data.seconds).toBe(270);
  expect(
    enduranceImportWorkspace(f.repo, f.student.account).enduranceSources,
  ).toEqual([]);
  expect(
    enduranceImportWorkspace(f.repo, f.admin.account).enduranceSources,
  ).toEqual([]);
});
it("公式行须核对、解析等待期间关闭课程重新校验、不留孤立文件", async () => {
  const f = setup();
  const source = await uploadWorkbook(
    f.repo,
    f.teacher.token,
    f.course.id,
    await workbook(true),
  );
  const batch = f.run("sports.endurance.source.import", {
    id: source.id,
    sheet: 0,
  });
  expect(() =>
    f.run("sports.endurance.batch.confirm", {
      id: batch.id,
      version: batch.version,
      rows: [2],
      confirmed: true,
    }),
  ).toThrow("整批未保存");
  const count = f.repo.all("sportsEnduranceSource").length;
  const pending = uploadWorkbook(
    f.repo,
    f.teacher.token,
    f.course.id,
    await workbook(),
  );
  f.repo.save(f.course, { status: "CLOSED" });
  await expect(pending).rejects.toThrow("不接受新体测");
  expect(f.repo.all("sportsEnduranceSource")).toHaveLength(count);
  expect(
    f.db.prepare("SELECT count(*) n FROM sports_media_blobs").get()?.n,
  ).toBe(1);
});
it("真实HTTP上传和原件下载校验责任教师、二进制完整性与跨站边界", async () => {
  const f = setup(),
    server = createApiServer(f.db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number },
    base = `http://127.0.0.1:${address.port}`;
  const cookie = (token: string) => ({ Cookie: `bnbu_session=${token}` });
  try {
    const bytes = await workbook();
    const upload = await fetch(base + `/api/sports/workbooks/${f.course.id}`, {
      method: "POST",
      headers: {
        ...cookie(f.teacher.token),
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
    });
    expect(upload.status).toBe(200);
    const { id } = await upload.json();
    const original = await fetch(base + `/api/sports/workbook-sources/${id}`, {
      headers: cookie(f.teacher.token),
    });
    expect(original.status).toBe(200);
    expect(Buffer.from(await original.arrayBuffer())).toEqual(bytes);
    for (const user of [f.student, f.admin, f.other])
      expect(
        (
          await fetch(base + `/api/sports/workbook-sources/${id}`, {
            headers: cookie(user.token),
          })
        ).status,
      ).toBe(403);
    expect(
      (
        await fetch(base + `/api/sports/workbooks/${f.course.id}`, {
          method: "POST",
          headers: {
            ...cookie(f.teacher.token),
            "Content-Type": "application/octet-stream",
            Origin: "https://untrusted.test",
          },
          body: bytes,
        })
      ).status,
    ).toBe(403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
