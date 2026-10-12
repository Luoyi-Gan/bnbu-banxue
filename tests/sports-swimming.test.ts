import { afterEach, expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { openDatabase } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository, type Fields } from "../backend/src/repository";
import { execute } from "../backend/src/commands";
import { uploadMaterial } from "../backend/src/sports/materials";

const closes: (() => void)[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const close of closes.splice(0).reverse()) close();
});
async function fixture() {
  const clock = vi
    .spyOn(Date, "now")
    .mockReturnValue(Date.parse("2026-10-12T10:00:00+08:00"));
  const db = openDatabase(":memory:");
  closes.push(() => db.close());
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const email = `${name}@example.test`,
      password = "Swimming-test-123";
    const id = createAccount(db, { email, name, password, roles: [role] });
    repo.create("sportsIdentity", id, { role, status: "verified" });
    return login(db, email, password);
  };
  const student = make("student", "student"),
    other = make("other", "student"),
    teacher = make("teacher", "teacher");
  const semester = repo.create("sportsSemester", null, { status: "CURRENT" });
  const course = repo.create("sportsCourse", teacher.account.id, {
    semesterId: semester.id,
    status: "PUBLISHED",
    threshold: 30,
    weeklyLimit: 3,
    relatedTarget: 600,
    otherTarget: 600,
    startDate: "2026-09-01",
    deadlineDate: "2026-12-31",
    startTime: "06:00",
    endTime: "23:00",
  });
  for (const user of [student, other])
    repo.create("sportsEnrollment", user.account.id, {
      courseId: course.id,
      status: "ACTIVE",
    });
  const images = await Promise.all(
    ["blue", "red", "green"].map((background) =>
      sharp({ create: { width: 8, height: 8, channels: 3, background } })
        .png()
        .toBuffer(),
    ),
  );
  const manifest = (index: number, phase: string) => ({
    clientId: `image${index}`,
    phase,
    size: images[index].length,
    mime: "image/png",
    sha256: createHash("sha256").update(images[index]).digest("hex"),
  });
  const run = (action: string, input: Fields, user = student) =>
    repo.get(
      (execute(db, user.token, action, input, randomUUID()) as { id: string })
        .id,
    );
  const evidence = run("sports.swim.before", {
    courseId: course.id,
    file: manifest(0, "BEFORE"),
  });
  const start = () =>
    run("sports.session.start", {
      courseId: course.id,
      activityType: "SWIM",
      beforeEvidenceId: evidence.id,
    });
  const end = () => {
    const session = start();
    clock.mockReturnValue(Date.now() + 35 * 60000);
    return run("sports.session.end", {
      id: session.id,
      version: session.version,
    });
  };
  const input = (session: ReturnType<typeof end>) => ({
    sessionId: session.id,
    version: session.version,
    activityType: "SWIM",
    category: "RELATED",
    description: "隔离测试图片，不代表真实运动",
    files: [manifest(0, "BEFORE"), manifest(1, "AFTER")],
  });
  const upload = async (recordId: string) => {
    for (const material of repo
      .all("sportsMaterial")
      .filter((m) => m.data.recordId === recordId)) {
      await uploadMaterial(
        repo,
        student.account,
        material.id,
        images[Number(String(material.data.clientId).slice(5))],
      );
    }
    return repo.get(recordId);
  };
  return {
    db,
    repo,
    clock,
    student,
    other,
    teacher,
    course,
    evidence,
    manifest,
    run,
    start,
    end,
    input,
    upload,
    images,
  };
}

it("运动前凭证绑定本人课程与唯一会话，结束后不能换普通项目或事后替换原照片", async () => {
  const f = await fixture();
  expect(() =>
    f.run(
      "sports.session.start",
      {
        courseId: f.course.id,
        activityType: "SWIM",
        beforeEvidenceId: f.evidence.id,
      },
      f.other,
    ),
  ).toThrow("本人本课程");
  const session = f.end(),
    input = f.input(session);
  expect(() => f.start()).toThrow("不能事后补造");
  expect(() =>
    f.run("sports.record.accept", { ...input, activityType: "EXERCISE" }),
  ).toThrow("项目须与原会话");
  expect(() =>
    f.run("sports.record.accept", {
      ...input,
      files: [f.manifest(2, "BEFORE"), f.manifest(1, "AFTER")],
    }),
  ).toThrow("不能事后替换");
  expect(() =>
    f.run("sports.record.accept", {
      ...input,
      files: [f.manifest(0, "BEFORE")],
    }),
  ).toThrow("照片各一张");
  expect(() =>
    f.run("sports.record.accept", {
      ...input,
      files: [f.manifest(0, "AUXILIARY"), f.manifest(1, "AFTER")],
    }),
  ).toThrow("照片各一张");
  expect(f.repo.all("sportsRecord")).toHaveLength(0);
});

it("15分钟前受理的同批照片可续传30分钟，课程关闭和移除成员不截短合法窗口", async () => {
  const f = await fixture(),
    session = f.end(),
    endedAt = Date.now();
  f.clock.mockReturnValue(endedAt + 15 * 60000 - 1);
  f.repo.save(f.course, { status: "CLOSED" });
  const enrollment = f.repo
    .all("sportsEnrollment")
    .find((e) => e.ownerId === f.student.account.id)!;
  f.repo.save(enrollment, { status: "REMOVED" });
  const record = f.run("sports.record.accept", f.input(session));
  f.clock.mockReturnValue(Date.now() + 30 * 60000 - 1);
  const result = await f.upload(record.id);
  expect(result.data).toMatchObject({
    status: "PENDING_AI",
    activityType: "SWIM",
    offlineDelay: false,
    activeMilliseconds: 35 * 60000,
    businessDate: "2026-10-12",
  });
  expect(
    f.repo
      .all("sportsMaterial")
      .map((m) => m.data.phase)
      .sort(),
  ).toEqual(["AFTER", "BEFORE"]);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
});

it("15分钟端点必须延迟说明，原始前后照片完整到账后仅进入教师异常且不耗补证", async () => {
  const f = await fixture(),
    session = f.end();
  f.clock.mockReturnValue(Date.now() + 15 * 60000);
  const input = f.input(session);
  expect(() => f.run("sports.record.accept", input)).toThrow("15分钟");
  expect(() =>
    f.run("sports.record.accept", {
      ...input,
      offlineDelay: true,
      delayExplanation: "  ",
    }),
  ).toThrow("delayExplanation");
  const record = f.run("sports.record.accept", {
    ...input,
    offlineDelay: true,
    delayExplanation: "泳馆完全离线，恢复网络后提交",
  });
  const result = await f.upload(record.id);
  expect(result.data).toMatchObject({
    status: "TEACHER_PENDING",
    queueSource: "SWIM_OFFLINE_DELAY",
    supplementUsed: false,
    delayExplanation: "泳馆完全离线，恢复网络后提交",
  });
  expect(f.repo.all("sportsAiTask")).toHaveLength(0);
  expect(f.repo.all("sportsReviewRound")).toHaveLength(1);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
});

it("延迟受理24小时与同批传输30分钟均不包含端点", async () => {
  const f = await fixture(),
    session = f.end(),
    endedAt = Date.now();
  f.clock.mockReturnValue(endedAt + 24 * 3600000);
  const renewed = login(f.db, f.student.account.email, "Swimming-test-123");
  const input = {
    ...f.input(session),
    offlineDelay: true,
    delayExplanation: "隔离测试离线说明",
  };
  expect(() => f.run("sports.record.accept", input, renewed)).toThrow(
    "严格早于",
  );
  f.clock.mockReturnValue(endedAt + 24 * 3600000 - 1);
  const record = f.run("sports.record.accept", input, renewed);
  f.clock.mockReturnValue(
    Number(f.repo.get(record.data.batchId).data.uploadDeadline),
  );
  await expect(f.upload(record.id)).rejects.toThrow("窗口已结束");
  expect(f.repo.get(record.id).data.status).toBe("UPLOADING");
  expect(f.repo.all("sportsReviewRound")).toHaveLength(0);
});

it("游泳补证沿用原前后证据、不重套15分钟、不修改原日期时长且只开一轮新教师审核", async () => {
  const f = await fixture(),
    session = f.end();
  f.clock.mockReturnValue(Date.now() + 3600000);
  let record = f.run("sports.record.accept", {
    ...f.input(session),
    offlineDelay: true,
    delayExplanation: "隔离离线测试",
  });
  record = await f.upload(record.id);
  record = f.run(
    "sports.review.decide",
    {
      id: record.id,
      version: record.version,
      batchId: record.data.batchId,
      checksCompleted: true,
      decision: "RETURN",
      reason: "UNCLEAR",
      hours: 72,
      canSupplementOriginal: true,
    },
    f.teacher,
  );
  const original = f.repo.all("sportsMaterial"),
    before = original.find((m) => m.data.phase === "BEFORE")!;
  f.clock.mockReturnValue(Date.now() + 2 * 3600000);
  const base = { id: record.id, version: record.version, files: [] };
  expect(() =>
    f.run("sports.supplement.prepare", {
      ...base,
      reuseIds: [before.id],
      files: [f.manifest(2, "AFTER")],
    }),
  ).toThrow("须沿用原");
  record = f.run("sports.supplement.prepare", {
    ...base,
    reuseIds: original.map((m) => m.id),
  });
  record = f.run("sports.supplement.submit", {
    id: record.id,
    version: record.version,
  });
  expect(record.data).toMatchObject({
    status: "TEACHER_PENDING",
    queueSource: "SUPPLEMENT",
    supplementUsed: true,
    businessDate: "2026-10-12",
    activeMilliseconds: 35 * 60000,
  });
  expect(
    f.repo
      .all("sportsReviewRound")
      .map((r) => r.data.status)
      .sort(),
  ).toEqual(["CLOSED", "OPEN"]);
  expect(
    f.db.prepare("SELECT COUNT(*) AS n FROM sports_media_blobs").get()?.n,
  ).toBe(2);
  expect(() =>
    f.run(
      "sports.review.decide",
      {
        id: record.id,
        version: record.version,
        batchId: record.data.batchId,
        checksCompleted: true,
        decision: "RETURN",
        reason: "UNCLEAR",
        hours: 24,
        canSupplementOriginal: true,
      },
      f.teacher,
    ),
  ).toThrow("一次补证");
});
