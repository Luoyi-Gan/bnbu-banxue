import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { execute } from "../server/commands";
import { uploadMaterial } from "../server/sports/materials";
import { afterEach, expect, it, vi } from "vitest";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { flagExpiredTransfers } from "../server/sports/material-transfer";
import { processSportsReview } from "../server/sports/review-worker";
import { writableMaterial } from "../server/sports/materials";
const dbs: Database[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  dbs.splice(0).forEach((d) => d.close());
});
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  function account(name: string, role: string) {
    const id = createAccount(db, {
      email: name + "@example.test",
      password: "Password123",
      name,
      roles: [],
    });
    repo.create("sportsIdentity", id, { role, status: "verified" });
    return login(db, name + "@example.test", "Password123");
  }
  const student = account("student", "student"),
    teacher = account("teacher", "teacher"),
    semester = repo.create("sportsSemester", teacher.account.id, {
      status: "CURRENT",
    }),
    course = repo.create("sportsCourse", teacher.account.id, {
      status: "CLOSED",
      semesterId: semester.id,
      relatedTarget: 600,
      otherTarget: 600,
      threshold: 30,
      weeklyLimit: 2,
    });
  const session = repo.create("sportsSession", student.account.id, {
    courseId: course.id,
    clock: {
      state: "ENDED",
      startedAt: 1000,
      endedAt: 2101000,
      activeMilliseconds: 35 * 60000,
      businessDate: "1970-01-01",
    },
  });
  const record = repo.create("sportsRecord", student.account.id, {
    courseId: course.id,
    semesterId: semester.id,
    sessionId: session.id,
    category: "RELATED",
    status: "UPLOADING",
    supplementUsed: false,
    activeMilliseconds: 35 * 60000,
  });
  const batch = repo.create("sportsMaterialBatch", student.account.id, {
    recordId: record.id,
    sequence: 1,
    status: "UPLOADING",
    acceptedAt: 1000,
    uploadDeadline: 1801000,
  });
  repo.save(record, { batchId: batch.id });
  const complete = repo.create("sportsMaterial", student.account.id, {
      recordId: record.id,
      batchId: batch.id,
      status: "COMPLETE",
      sha256: "1".repeat(64),
      size: 1,
      mime: "image/png",
      phase: "BEFORE",
      beforeEvidenceId: "precommit",
    }),
    missing = repo.create("sportsMaterial", student.account.id, {
      recordId: record.id,
      batchId: batch.id,
      status: "PENDING",
      sha256: createHash("sha256")
        .update(readFileSync("artifacts/fixtures/sports-evidence-test.png"))
        .digest("hex"),
      size: readFileSync("artifacts/fixtures/sports-evidence-test.png").length,
      mime: "image/png",
      phase: "AFTER",
    });
  const run = (
    who: typeof teacher,
    action: string,
    input: Record<string, unknown>,
    key = randomUUID(),
  ) =>
    repo.get((execute(db, who.token, action, input, key) as { id: string }).id);
  return {
    db,
    repo,
    student,
    teacher,
    course,
    record,
    batch,
    complete,
    missing,
    run,
  };
}
it("严格端点才标记首版传输超时，不自动判无效、不改时长材料或补证机会，重复扫描不重复通知", () => {
  const f = setup(),
    materials = JSON.stringify(f.repo.all("sportsMaterial"));
  flagExpiredTransfers(f.repo, 1800999);
  expect(f.repo.get(f.record.id).data.status).toBe("UPLOADING");
  flagExpiredTransfers(f.repo, 1801000);
  expect(f.repo.get(f.record.id).data).toMatchObject({
    status: "TRANSFER_PENDING",
    activeMilliseconds: 35 * 60000,
    supplementUsed: false,
  });
  expect(f.repo.get(f.batch.id).data).toMatchObject({
    status: "TRANSFER_DEADLINE_MISSED",
    missingMaterialIds: [f.missing.id],
    uploadDeadline: 1801000,
  });
  expect(JSON.stringify(f.repo.all("sportsMaterial"))).toBe(materials);
  flagExpiredTransfers(f.repo, 1900000);
  expect(f.repo.all("sportsReviewEvent")).toHaveLength(1);
  expect(f.db.prepare("SELECT COUNT(*) n FROM notifications").get()?.n).toBe(2);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
  expect(() =>
    writableMaterial(f.repo, f.student.account, f.missing.id),
  ).toThrow("传输窗口已结束");
});
it("实际worker接通超时标记，维护时不写判断，不误处理补证包和合法后继", async () => {
  const f = setup();
  vi.spyOn(Date, "now").mockReturnValue(1801000);
  const mode = f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  await processSportsReview(f.db, {});
  expect(f.repo.get(f.record.id).data.status).toBe("UPLOADING");
  f.repo.save(mode, { mode: "NORMAL" });
  await processSportsReview(f.db, {});
  expect(f.repo.get(f.record.id).data.status).toBe("TRANSFER_PENDING");
  const original = f.repo.get(f.record.id);
  f.repo.save(original, { status: "VALID" });
  f.repo.save(f.repo.get(f.batch.id), { status: "UPLOADING" });
  flagExpiredTransfers(f.repo, 2000000);
  expect(f.repo.get(f.record.id).data.status).toBe("VALID");
  f.repo.save(f.repo.get(f.record.id), { status: "SUPPLEMENT_REQUIRED" });
  f.repo.save(f.repo.get(f.batch.id), { sequence: 2 });
  flagExpiredTransfers(f.repo, 2000000);
  expect(f.repo.get(f.record.id).data.status).toBe("SUPPLEMENT_REQUIRED");
});

it.each(["NORMAL", "SWIM"])(
  "首版%s超时可由教师退回唯一补证，全部原文件到账才再送审",
  async (activityType) => {
    const f = setup();
    f.repo.save(f.repo.get(f.record.id), { activityType });
    vi.spyOn(Date, "now").mockReturnValue(1801000);
    flagExpiredTransfers(f.repo);
    let record = f.repo.get(f.record.id);
    const input = {
      id: record.id,
      version: record.version,
      batchId: f.batch.id,
      decision: "RETURN",
      reason: "UNCLEAR",
      checksCompleted: true,
      publicExplanation: "原文件未齐，请补齐已锁清单",
      hours: 24,
      canSupplementOriginal: true,
    };
    expect(() => f.run(f.student, "sports.transfer.decide", input)).toThrow();
    expect(() =>
      f.run(f.teacher, "sports.transfer.decide", {
        ...input,
        decision: "PASS",
      }),
    ).toThrow("不能直接判有效");
    record = f.run(f.teacher, "sports.transfer.decide", input);
    expect(record.data.supplementUsed).toBe(true);
    const files = [
      {
        clientId: "missing-original",
        mime: f.missing.data.mime,
        size: f.missing.data.size,
        sha256: f.missing.data.sha256,
      },
    ];
    expect(() =>
      f.run(f.student, "sports.supplement.prepare", {
        id: record.id,
        version: record.version,
        reuseIds: [],
        files,
      }),
    ).toThrow("全部必需文件");
    expect(() =>
      f.run(f.student, "sports.supplement.prepare", {
        id: record.id,
        version: record.version,
        reuseIds: [f.complete.id],
        files: [{ ...files[0], sha256: "2".repeat(64) }],
      }),
    ).toThrow("不能换批");
    record = f.run(f.student, "sports.supplement.prepare", {
      id: record.id,
      version: record.version,
      reuseIds: [f.complete.id],
      files,
    });
    expect(() =>
      f.run(f.student, "sports.supplement.submit", {
        id: record.id,
        version: record.version,
      }),
    ).toThrow("尚未全部到账");
    const nextMaterial = f.repo
      .all("sportsMaterial")
      .find(
        (m) =>
          m.data.batchId === record.data.supplementBatchId &&
          m.data.status === "PENDING",
      )!;
    if (activityType === "SWIM") expect(nextMaterial.data.phase).toBe("AFTER");
    await uploadMaterial(
      f.repo,
      f.student.account,
      nextMaterial.id,
      readFileSync("artifacts/fixtures/sports-evidence-test.png"),
    );
    record = f.run(f.student, "sports.supplement.submit", {
      id: record.id,
      version: record.version,
    });
    expect(record.data.status).toBe("TEACHER_PENDING");
    expect(() =>
      f.run(f.teacher, "sports.review.decide", {
        ...input,
        id: record.id,
        version: record.version,
        batchId: record.data.batchId,
      }),
    ).toThrow("一次补证");
    record = f.run(f.teacher, "sports.review.decide", {
      id: record.id,
      version: record.version,
      batchId: record.data.batchId,
      decision: "PASS",
      checksCompleted: true,
    });
    expect(record.data.status).toBe("VALID");
    expect(f.repo.get(f.batch.id).data.status).toBe("TRANSFER_DEADLINE_MISSED");
    expect(f.repo.get(f.missing.id).data.status).toBe("PENDING");
    expect(f.repo.all("sportsReviewRound")).toHaveLength(2);
  },
);
it("教师可明确判无效，确认事故影响原窗口时禁止按个人超时裁决", () => {
  const f = setup();
  vi.spyOn(Date, "now").mockReturnValue(1801000);
  flagExpiredTransfers(f.repo);
  const r = f.repo.get(f.record.id),
    input = {
      id: r.id,
      version: r.version,
      batchId: f.batch.id,
      decision: "INVALID",
      reason: "UNCLEAR",
      checksCompleted: true,
      publicExplanation: "核对后确认材料不足以证明本次运动",
    };
  const pause = f.repo.create("sportsPause", null, {
    recordId: r.id,
    status: "CONFIRMED",
    source: "INCIDENT",
    startAt: 2000,
    endAt: 100000,
  });
  expect(() => f.run(f.teacher, "sports.transfer.decide", input)).toThrow(
    "平台事故",
  );
  f.repo.save(pause, { status: "REJECTED" });
  const key = randomUUID(),
    saved = f.run(f.teacher, "sports.transfer.decide", input, key);
  expect(saved.data.status).toBe("INVALID");
  expect(f.run(f.teacher, "sports.transfer.decide", input, key).id).toBe(
    saved.id,
  );
  expect(saved.data.supplementUsed).toBe(false);
});
