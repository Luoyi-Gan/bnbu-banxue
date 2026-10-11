import { afterEach, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { createApiServer } from "../server/main";
import {
  uploadOcrSource,
  recognizeOcrSource,
  ocrSourceAccess,
  type OcrImage,
} from "../server/sports/endurance-ocr";
const databases: Database[] = [];
const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  for (const s of servers.splice(0)) {
    s.closeAllConnections();
    await new Promise<void>((r) => s.close(() => r()));
  }
  databases.splice(0).forEach((d) => d.close());
});
async function listen(s: Server) {
  servers.push(s);
  await new Promise<void>((r) => s.listen(0, "127.0.0.1", r));
  return `http://127.0.0.1:${(s.address() as { port: number }).port}`;
}
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
      role,
      status: "verified",
      studentNumber: role === "student" ? "S001" : undefined,
      sex: "FEMALE",
      year: 1,
    });
    return login(db, role + "@example.test", "Test-password-123");
  };
  const teacher = make("teacher"),
    student = make("student"),
    admin = make("admin"),
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
  const run = (action: string, input: Record<string, unknown>) =>
    repo.get(
      (
        execute(db, teacher.token, action, input, randomUUID()) as {
          id: string;
        }
      ).id,
    );
  return { db, repo, teacher, student, admin, course, run };
}
async function picture() {
  const bytes = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  return new File([Uint8Array.from(bytes)], "TEST_ONLY.png", {
    type: "image/png",
  });
}
async function upstream(mode = "normal") {
  return listen(
    createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c);
      const request = JSON.parse(Buffer.concat(chunks).toString());
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          requestId: request.requestId,
          sourceId: request.sourceId,
          imageHashes:
            mode === "wrong"
              ? ["wrong"]
              : request.images.map((i: OcrImage) => i.sha256),
          rows: [
            {
              row: 5,
              imageId: request.images[0].id,
              studentNumber: "S001",
              name: "student",
              event: "800",
              time: "4:30",
              testDate: "2026-01-02",
              reviewRequired: mode === "low",
              issues: mode === "low" ? ["手写用时需逐字核对"] : [],
            },
          ],
        }),
      );
    }),
  );
}
it("未配置真实OCR时保存解码原图并明确未接通，不制造识别行或正式记录", async () => {
  vi.stubEnv("BNBU_SPORTS_OCR_URL", undefined);
  const f = setup(),
    file = await picture();
  let source = await uploadOcrSource(f.repo, f.teacher.token, f.course.id, [
    file,
  ]);
  source = await recognizeOcrSource(
    f.repo,
    f.teacher.token,
    source.id,
    source.version,
  );
  expect(source.data).toMatchObject({
    status: "FAILED",
    error: "OCR_NOT_CONFIGURED",
    sheets: [],
  });
  expect(f.repo.all("sportsEndurance")).toHaveLength(0);
  expect(f.repo.all("sportsEnduranceImport")).toHaveLength(0);
  expect(
    (await uploadOcrSource(f.repo, f.teacher.token, f.course.id, [file])).id,
  ).toBe(source.id);
  expect(() => ocrSourceAccess(f.repo, f.student.account, source.id)).toThrow(
    "体育身份",
  );
  await expect(
    uploadOcrSource(f.repo, f.teacher.token, f.course.id, [file, file]),
  ).rejects.toThrow("重复");
  await expect(
    uploadOcrSource(f.repo, f.teacher.token, f.course.id, [
      new File(["not png"], "bad.png", { type: "image/png" }),
    ]),
  ).rejects.toThrow("图片内容");
});
it("受控OCR低可信行须修正留痕后才能确认，原图定位保留，关闭后继续受理链", async () => {
  const f = setup();
  vi.stubEnv("BNBU_SPORTS_OCR_URL", await upstream("low"));
  let source = await uploadOcrSource(f.repo, f.teacher.token, f.course.id, [
    await picture(),
  ]);
  f.repo.save(f.course, { status: "CLOSED" });
  source = await recognizeOcrSource(
    f.repo,
    f.teacher.token,
    source.id,
    source.version,
  );
  expect(source.data.status).toBe("READY");
  let batch = f.run("sports.endurance.source.import", {
    id: source.id,
    sheet: 0,
  });
  expect(batch.data.source).toBe("OCR");
  expect(
    (batch.data.rows as { sourceRow: number; sourceImageId: string }[])[0],
  ).toMatchObject({
    sourceRow: 5,
    sourceImageId: (source.data.images as OcrImage[])[0].id,
  });
  expect(() =>
    f.run("sports.endurance.batch.confirm", {
      id: batch.id,
      version: batch.version,
      rows: [2],
      confirmed: true,
    }),
  ).toThrow("整批未保存");
  batch = f.run("sports.endurance.row", {
    id: batch.id,
    version: batch.version,
    row: 2,
    studentNumber: "S001",
    name: "student",
    event: "800",
    time: "270",
    testDate: "2026-01-02",
    reason: "测试：对照受控原图定位核对用时",
  });
  f.run("sports.endurance.batch.confirm", {
    id: batch.id,
    version: batch.version,
    rows: [2],
    confirmed: true,
  });
  expect(f.repo.all("sportsEndurance")[0].data.seconds).toBe(270);
  await expect(
    recognizeOcrSource(f.repo, f.teacher.token, source.id, source.version),
  ).rejects.toThrow("已有成功识别");
});
it("上游错配返回只记技术失败，后续正确重试才产生草稿；旧版本重试拒绝", async () => {
  const f = setup();
  vi.stubEnv("BNBU_SPORTS_OCR_URL", await upstream("wrong"));
  let source = await uploadOcrSource(f.repo, f.teacher.token, f.course.id, [
    await picture(),
  ]);
  const old = source.version;
  source = await recognizeOcrSource(
    f.repo,
    f.teacher.token,
    source.id,
    source.version,
  );
  expect(source.data).toMatchObject({
    status: "FAILED",
    error: "OCR_TECHNICAL_FAILURE",
    sheets: [],
  });
  await expect(
    recognizeOcrSource(f.repo, f.teacher.token, source.id, old),
  ).rejects.toThrow("已变化");
  vi.stubEnv("BNBU_SPORTS_OCR_URL", await upstream());
  source = await recognizeOcrSource(
    f.repo,
    f.teacher.token,
    source.id,
    source.version,
  );
  expect(source.data.status).toBe("READY");
  expect(f.repo.all("sportsEndurance")).toHaveLength(0);
  expect(f.repo.all("sportsOcrHistory").map((h) => h.data.status).sort()).toEqual([
    "FAILED",
    "READY",
    "UPLOADED",
  ]);
});
it("真实HTTP多图上传入口和原图读取隔离，未接通状态可见且字节原样保留", async () => {
  vi.stubEnv("BNBU_SPORTS_OCR_URL", undefined);
  const f = setup(),
    base = await listen(createApiServer(f.db)),
    file = await picture(),
    form = new FormData();
  form.append("images", file);
  const headers = { Cookie: `bnbu_session=${f.teacher.token}` };
  const upload = await fetch(`${base}/api/sports/ocr-sources/${f.course.id}`, {
    method: "POST",
    headers,
    body: form,
  });
  expect(upload.status).toBe(200);
  const result = await upload.json();
  expect(result.error).toBe("OCR_NOT_CONFIGURED");
  const source = f.repo.get(result.id),
    image = (source.data.images as OcrImage[])[0];
  const url = `${base}/api/sports/ocr-sources/${source.id}/images/${image.id}`;
  const response = await fetch(url, { headers });
  expect(response.status).toBe(200);
  expect(Buffer.from(await response.arrayBuffer())).toEqual(
    Buffer.from(await file.arrayBuffer()),
  );
  for (const user of [f.student, f.admin])
    expect(
      (await fetch(url, { headers: { Cookie: `bnbu_session=${user.token}` } }))
        .status,
    ).toBe(403);
});
