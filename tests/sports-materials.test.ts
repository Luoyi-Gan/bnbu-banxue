import { afterEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { openDatabase, type Database } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { execute } from "../backend/src/commands";
import {
  uploadMaterial,
  readMaterial,
  materialWorkspace,
} from "../backend/src/sports/materials";
import { createApiServer } from "../backend/src/main";
const resources: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of resources.splice(0).reverse()) await close();
});
async function setup(db: Database = openDatabase(":memory:")) {
  resources.push(() => db.close());
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const id = createAccount(db, {
      email: `${name}@example.test`,
      name,
      password: "Materials-test-123",
      roles: [role],
    });
    repo.create("sportsIdentity", id, { role, status: "verified" });
    return login(db, `${name}@example.test`, "Materials-test-123");
  };
  const a = make("a", "student"),
    b = make("b", "student"),
    teacher = make("teacher", "teacher"),
    admin = make("admin", "admin");
  const semester = repo.create("sportsSemester", null, { status: "CURRENT" });
  const course = repo.create("sportsCourse", teacher.account.id, {
    status: "CLOSED",
    semesterId: semester.id,
  });
  const endedAt = Date.now();
  const session = repo.create("sportsSession", a.account.id, {
    courseId: course.id,
    semesterId: semester.id,
    clock: {
      state: "ENDED",
      endedAt,
      changedAt: endedAt,
      startedAt: endedAt - 35 * 60000,
      activeMilliseconds: 35 * 60000,
      businessDate: "2026-10-11",
    },
    ruleSnapshot: {
      threshold: 30,
      weeklyLimit: 3,
      relatedTarget: 600,
      otherTarget: 600,
    },
  });
  const image = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "blue" },
  })
    .png()
    .toBuffer();
  const file = (bytes: Buffer, clientId = "file1", mime = "image/png") => ({
    clientId,
    mime,
    size: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  const input = {
    sessionId: session.id,
    version: session.version,
    category: "RELATED",
    description: "隔离测试凭证，不证明真实运动",
    activityType: "EXERCISE",
    files: [file(image)],
  };
  const accept = (body = input, token = a.token, key = randomUUID()) => {
    const result = execute(db, token, "sports.record.accept", body, key) as {
      id: string;
    };
    return repo.get(result.id);
  };
  return {
    db,
    repo,
    a,
    b,
    teacher,
    admin,
    semester,
    course,
    session,
    endedAt,
    image,
    file,
    input,
    accept,
  };
}
it("关闭课程原链锁批、真实解码、并发重复传输仅推进一次且不直接有效", async () => {
  const f = await setup(),
    key = randomUUID();
  const record = f.accept(f.input, f.a.token, key);
  expect(f.accept(f.input, f.a.token, key).id).toBe(record.id);
  expect(() => f.accept()).toThrow("已有材料批次");
  const material = f.repo.all("sportsMaterial")[0];
  await Promise.all([
    uploadMaterial(f.repo, f.a.account, material.id, f.image),
    uploadMaterial(f.repo, f.a.account, material.id, f.image),
  ]);
  expect(f.repo.get(record.id).data.status).toBe("PENDING_AI");
  expect(f.repo.all("sportsReviewEvent")).toHaveLength(1);
  expect(
    f.db.prepare("SELECT count(*) n FROM sports_media_blobs").get()?.n,
  ).toBe(1);
  expect(readMaterial(f.repo, f.teacher.account, material.id).bytes).toEqual(
    f.image,
  );
  expect(materialWorkspace(f.repo, f.b.account).records).toHaveLength(0);
  expect(materialWorkspace(f.repo, f.admin.account).materials).toHaveLength(0);
  expect(() => readMaterial(f.repo, f.admin.account, material.id)).toThrow(
    "无权",
  );
});
it("首次受理24小时和传输30分钟均为严格端点，客户端时长不会改变原事实", async () => {
  const f = await setup();
  const now = vi.spyOn(Date, "now").mockReturnValue(f.endedAt + 24 * 3600000);
  const relogin = () => login(f.db, f.a.account.email, "Materials-test-123");
  expect(() => f.accept(f.input, relogin().token)).toThrow("严格早于");
  now.mockReturnValue(f.endedAt + 24 * 3600000 - 1);
  const record = f.accept(f.input, relogin().token),
    material = f.repo.all("sportsMaterial")[0];
  const batch = f.repo.get(record.data.batchId);
  now.mockReturnValue(Number(batch.data.uploadDeadline));
  await expect(
    uploadMaterial(f.repo, f.a.account, material.id, f.image),
  ).rejects.toThrow("窗口已结束");
  expect(
    f.db.prepare("SELECT count(*) n FROM sports_media_blobs").get()?.n,
  ).toBe(0);
  expect(f.repo.get(record.id).data).toMatchObject({
    activeMilliseconds: 35 * 60000,
    status: "UPLOADING",
  });
});
it("锁定内容不可替换，伪造图片不落库，未完成批次不能进入检查", async () => {
  const f = await setup();
  const bad = Buffer.from("not-an-image");
  f.accept({ ...f.input, files: [f.file(f.image), f.file(bad, "file2")] });
  const materials = f.repo.all("sportsMaterial"),
    first = materials.find((m) => m.data.clientId === "file1")!,
    second = materials.find((m) => m.data.clientId === "file2")!;
  await expect(
    uploadMaterial(f.repo, f.b.account, first.id, f.image),
  ).rejects.toThrow("本人");
  await expect(
    uploadMaterial(f.repo, f.a.account, first.id, bad),
  ).rejects.toThrow("清单不一致");
  await uploadMaterial(f.repo, f.a.account, first.id, f.image);
  await expect(
    uploadMaterial(f.repo, f.a.account, second.id, bad),
  ).rejects.toThrow("无法完整解码");
  expect(f.repo.all("sportsRecord")[0].data.status).toBe("UPLOADING");
  expect(f.repo.all("sportsReviewEvent")).toHaveLength(0);
});
it("非法类型、份数、大小、空说明和维护期间受理均被拒绝", async () => {
  const f = await setup();
  expect(() => f.accept({ ...f.input, description: "  " })).toThrow(
    "description",
  );
  expect(() =>
    f.accept({
      ...f.input,
      files: [{ ...f.input.files[0], size: 10 * 1024 * 1024 + 1 }],
    }),
  ).toThrow("size");
  expect(() =>
    f.accept({ ...f.input, files: [f.file(f.image, "one", "image/webp")] }),
  ).toThrow("mime");
  expect(() => f.accept({ ...f.input, files: [] })).toThrow("每版");
  expect(() => f.accept({ ...f.input, activityType: "SWIMMING" })).toThrow(
    "activityType",
  );
  f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  expect(() => f.accept()).toThrow("维护");
  expect(f.repo.all("sportsRecord")).toHaveLength(0);
});
it("实际HTTP二进制上传、重读、跨账号和来源边界", async () => {
  const f = await setup();
  f.accept();
  const material = f.repo.all("sportsMaterial")[0],
    server = createApiServer(f.db);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  resources.push(
    () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  );
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`,
    url = `${base}/api/sports/materials/${material.id}`;
  const headers = {
    Cookie: `bnbu_session=${f.a.token}`,
    "Content-Type": "application/octet-stream",
  };
  expect(
    (
      await fetch(url, {
        method: "POST",
        headers: { ...headers, Origin: "https://evil.example" },
        body: f.image,
      })
    ).status,
  ).toBe(403);
  expect(
    (await fetch(url, { method: "POST", headers, body: f.image })).status,
  ).toBe(200);
  const read = await fetch(url, { headers });
  expect(read.headers.get("content-type")).toBe("image/png");
  expect(Buffer.from(await read.arrayBuffer())).toEqual(f.image);
  expect(
    (await fetch(url, { headers: { Cookie: `bnbu_session=${f.b.token}` } }))
      .status,
  ).toBe(403);
  expect((await fetch(url)).status).toBe(401);
});

it("解析期间跨过传输截止不会落库，解析期间封禁同样拒绝提交", async () => {
  const f = await setup();
  const record = f.accept(),
    material = f.repo.all("sportsMaterial")[0];
  const pending = uploadMaterial(f.repo, f.a.account, material.id, f.image);
  const clock = vi
    .spyOn(Date, "now")
    .mockReturnValue(
      Number(f.repo.get(record.data.batchId).data.uploadDeadline),
    );
  await expect(pending).rejects.toThrow("窗口已结束");
  clock.mockRestore();
  const second = uploadMaterial(f.repo, f.a.account, material.id, f.image);
  f.db
    .prepare("UPDATE accounts SET status='banned' WHERE id=?")
    .run(f.a.account.id);
  await expect(second).rejects.toMatchObject({ status: 403 });
  expect(
    f.db.prepare("SELECT count(*) n FROM sports_media_blobs").get()?.n,
  ).toBe(0);
});
