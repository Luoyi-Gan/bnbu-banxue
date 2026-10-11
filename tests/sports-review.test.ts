import { afterEach, expect, it, vi } from "vitest";
import { supplementClock } from "../server/sports/supplements";
import { createServer, type ServerResponse } from "node:http";
import { randomUUID, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository, type Fields } from "../server/repository";
import { execute } from "../server/commands";
import { uploadMaterial, materialWorkspace } from "../server/sports/materials";
import { processSportsReview } from "../server/sports/review-worker";
import { createApiServer } from "../server/main";
import { systemWorkspace } from "../server/sports/system";
import { reviewClock } from "../server/sports/calendar";
import { incidentWorkspace } from "../server/sports/incidents";
const closes: (() => void | Promise<void>)[] = [];
const calendarInput = () => ({
  name: "隔离测试日历",
  source: "自动化测试夹具，非学校日历",
  confirmed: true,
  daysText: Array.from(
    { length: 10 },
    (_, i) => `2026-10-${String(9 + i).padStart(2, "0")},WORKDAY`,
  ).join("\n"),
});
const maintenanceInput = () => ({
  version: 0,
  mode: "MAINTENANCE",
  reason: "隔离维护验收",
  titleZh: "测试维护",
  titleEn: "Test maintenance",
  bodyZh: "仅隔离测试",
  bodyEn: "Isolated test only",
  estimatedRecoveryAt: new Date(Date.now() + 3600000).toISOString(),
});
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of closes.splice(0).reverse()) await close();
});

it("晚确认事故纠正错误逾期，排除错误锁定且只恢复原剩余时间，原终局永久保留", async () => {
  const f = await fixture();
  f.manual();
  const original = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
    publicExplanation: "请补原材料",
  });
  const start = Number(original.data.supplementStartedAt),
    hour = 3600000;
  const timer = vi.spyOn(Date, "now").mockReturnValue(start + 24 * hour);
  await processSportsReview(f.db, {});
  const terminal = f.repo
    .all("sportsReviewEvent")
    .find((e) => e.data.action === "SUPPLEMENT_EXPIRED")!;
  timer.mockReturnValue(start + 30 * hour);
  const admin = login(f.db, "admin@example.test", "Review-test-123");
  const incident = f.run(admin, "sports.incident.confirm", {
    reference: "TEST-FAULT-1",
    evidenceRef: "隔离故障测试证据",
    reason: "平台不可用测试",
    recordIdsText: original.id,
    startAt: new Date(start + 20 * hour).toISOString(),
    endAt: new Date(start + 23 * hour).toISOString(),
  });
  expect(f.repo.get(original.id).data.status).toBe("INVALID");
  const candidate = incidentWorkspace(f.repo, admin.account)
      .expiryCandidates[0],
    key = randomUUID();
  const input = {
    ...candidate,
    incidentId: incident.id,
    reason: "排除事故及错误锁定恢复原机会",
  };
  const restored = f.run(admin, "sports.incident.restore", input, key);
  f.run(admin, "sports.incident.restore", input, key);
  expect(restored.data).toMatchObject({
    status: "SUPPLEMENT_REQUIRED",
    supplementUsed: true,
    supplementStartedAt: start,
    supplementWindowMilliseconds: 24 * hour,
    publicExplanation: "请补原材料",
  });
  expect(supplementClock(f.repo, restored)).toMatchObject({
    remaining: 3 * hour,
    deadline: start + 33 * hour,
  });
  expect(f.repo.get(terminal.id)).toEqual(terminal);
  expect(f.repo.all("sportsCorrection")).toHaveLength(1);
  expect(f.repo.all("sportsReviewRound")).toHaveLength(1);
  expect(() =>
    f.run(admin, "sports.incident.restore", {
      ...input,
      version: restored.version,
    }),
  ).toThrow(/合法后继/);
  timer.mockReturnValue(start + 32 * hour);
  const student = login(f.db, "student@example.test", "Review-test-123"),
    material = f.repo.all("sportsMaterial")[0];
  const draft = f.run(student, "sports.supplement.prepare", {
    id: restored.id,
    version: restored.version,
    reuseIds: [material.id],
    files: [],
  });
  f.run(student, "sports.supplement.submit", {
    id: draft.id,
    version: draft.version,
  });
  expect(f.repo.get(original.id).data.status).toBe("TEACHER_PENDING");
});

it("事故补偿仍采用并集，重复事故引用拒绝，真实逾期不能恢复", async () => {
  const f = await fixture();
  f.manual();
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const start = Number(record.data.supplementStartedAt),
    hour = 3600000;
  vi.spyOn(Date, "now").mockReturnValue(start + 30 * hour);
  await processSportsReview(f.db, {});
  const admin = login(f.db, "admin@example.test", "Review-test-123");
  const input = {
    reference: "TEST-FAULT-2",
    evidenceRef: "隔离测试",
    reason: "实际影响不足以恢复",
    recordIdsText: record.id,
    startAt: new Date(start + hour).toISOString(),
    endAt: new Date(start + 3 * hour).toISOString(),
  };
  const incident = f.run(admin, "sports.incident.confirm", input);
  expect(() => f.run(admin, "sports.incident.confirm", input)).toThrow(
    /事故引用已确认/,
  );
  f.run(admin, "sports.incident.confirm", {
    ...input,
    reference: "TEST-FAULT-3",
    startAt: new Date(start + 2 * hour).toISOString(),
    endAt: new Date(start + 4 * hour).toISOString(),
  });
  const candidate = incidentWorkspace(f.repo, admin.account)
    .expiryCandidates[0];
  expect(() =>
    f.run(admin, "sports.incident.restore", {
      ...candidate,
      incidentId: incident.id,
      reason: "不应恢复",
    }),
  ).toThrow(/真实逾期/);
  expect(f.repo.all("sportsCorrection")).toHaveLength(0);
  expect(f.repo.get(record.id).data.status).toBe("INVALID");
  expect(supplementClock(f.repo, f.repo.get(record.id)).deadline).toBe(
    start + 27 * hour,
  );
});

it("平台故障证据仅总管理员可治理，学生只读取本人公开期限调整", async () => {
  const f=await fixture();f.manual();const record=f.decide("RETURN",{reason:"UNCLEAR",hours:24,canSupplementOriginal:true});
  const start=Number(record.data.supplementStartedAt);
  vi.spyOn(Date,"now").mockReturnValue(start+3600000);
  const input={reference:"PRIVATE-TECH-REF",evidenceRef:"只供治理核对的技术依据",reason:"公开平台影响说明",recordIdsText:record.id,startAt:new Date(start).toISOString(),endAt:new Date(start+1800000).toISOString()};
  expect(()=>f.run(f.student,"sports.incident.confirm",input)).toThrow(/体育身份/);
  expect(()=>f.run(f.teacher,"sports.incident.confirm",input)).toThrow(/体育身份/);
  expect(()=>f.run(f.admin,"sports.incident.confirm",{...input,endAt:new Date(start+7200000).toISOString()})).toThrow(/未来时间/);
  f.run(f.admin,"sports.incident.confirm",input);
  expect(incidentWorkspace(f.repo,f.student.account).incidents).toEqual([]);
  const view=materialWorkspace(f.repo,f.student.account);
  expect(view.deadlineAdjustments).toHaveLength(1);
  expect(JSON.stringify(view)).not.toContain("只供治理核对");
  expect(view.deadlineAdjustments[0].data.reason).toBe("公开平台影响说明");
  expect(materialWorkspace(f.repo,f.other.account).deadlineAdjustments).toEqual([]);
});

it("P04核对原轮次、当前记录及结算后继版本，冲突不产生部分修复", async () => {
  const f = await fixture();
  f.manual();
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const start = Number(record.data.supplementStartedAt),
    hour = 3600000;
  vi.spyOn(Date, "now").mockReturnValue(start + 24 * hour);
  await processSportsReview(f.db, {});
  const admin = login(f.db, "admin@example.test", "Review-test-123");
  const incident = f.run(admin, "sports.incident.confirm", {
    reference: "TEST-CONFLICT",
    evidenceRef: "隔离测试",
    reason: "版本冲突测试",
    recordIdsText: record.id,
    startAt: new Date(start + hour).toISOString(),
    endAt: new Date(start + 3 * hour).toISOString(),
  });
  const candidate = incidentWorkspace(f.repo, admin.account)
      .expiryCandidates[0],
    input = { ...candidate, incidentId: incident.id, reason: "恢复" };
  expect(() =>
    f.run(admin, "sports.incident.restore", {
      ...input,
      roundVersion: candidate.roundVersion + 1,
    }),
  ).toThrow(/轮次版本/);
  f.repo.save(f.repo.get(f.course.id), { settlementStatus: "SETTLED" });
  expect(() => f.run(admin, "sports.incident.restore", input)).toThrow(/结算/);
  f.repo.save(f.repo.get(f.course.id), { settlementStatus: null });
  const changed = f.repo.save(f.repo.get(record.id), {
    publicExplanation: "已存在后继处理",
  });
  expect(() => f.run(admin, "sports.incident.restore", input)).toThrow(
    /记录已变化/,
  );
  expect(() =>
    f.run(admin, "sports.incident.restore", {
      ...input,
      version: changed.version,
    }),
  ).toThrow(/合法后继/);
  expect(f.repo.all("sportsCorrection")).toHaveLength(0);
  expect(
    f.repo
      .all("sportsPause")
      .filter((p) => p.data.source === "WRONG_TERMINAL_LOCK"),
  ).toHaveLength(0);
});

it("日历发布严格校验且只用于新轮次，已有轮次显式迁移保留原起点及历史", async () => {
  vi.spyOn(Date, "now").mockReturnValue(
    Date.parse("2026-10-12T10:00:00+08:00"),
  );
  const f = await fixture();
  f.manual();
  const original = f.repo.all("sportsReviewRound")[0];
  expect(() =>
    f.run(f.teacher, "sports.calendar.publish", calendarInput()),
  ).toThrow(/体育身份/);
  expect(() =>
    f.run(f.admin, "sports.calendar.publish", {
      ...calendarInput(),
      daysText: "2026-10-09,WORKDAY\n2026-10-11,REST",
    }),
  ).toThrow(/连续/);
  expect(() =>
    f.run(f.admin, "sports.calendar.publish", {
      ...calendarInput(),
      confirmed: false,
    }),
  ).toThrow(/确认/);
  const calendar = f.run(f.admin, "sports.calendar.publish", calendarInput());
  expect(f.repo.get(original.id)).toEqual(original);
  const bound = f.run(f.admin, "sports.calendar.bind", {
    id: original.id,
    version: original.version,
    calendarId: calendar.id,
    reason: "隔离测试明确补充日历",
  });
  expect(bound.data.startedAt).toBe(original.data.startedAt);
  expect(reviewClock(f.repo, bound).calculationStatus).toBe("CALCULABLE");
  expect(f.repo.all("sportsCalendarBinding")).toHaveLength(1);
  const next = f.run(f.admin, "sports.calendar.publish", {
    ...calendarInput(),
    name: "第二测试版",
  });
  expect(f.repo.get(bound.id).data.calendarId).toBe(calendar.id);
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const oldClock = reviewClock(f.repo, f.repo.get(bound.id));
  const originalMaterial = f.repo.all("sportsMaterial")[0];
  const draft = f.run(f.student, "sports.supplement.prepare", {
    id: record.id,
    version: record.version,
    reuseIds: [originalMaterial.id],
    files: [],
  });
  f.run(f.student, "sports.supplement.submit", {
    id: draft.id,
    version: draft.version,
  });
  const newRound = f.repo
    .all("sportsReviewRound")
    .find((r) => r.data.status === "OPEN")!;
  expect(newRound.data.calendarId).toBe(next.id);
  expect(() =>
    f.run(f.admin, "sports.calendar.bind", {
      id: bound.id,
      version: f.repo.get(bound.id).version,
      calendarId: next.id,
      reason: "不允许改写已结束轮次",
    }),
  ).toThrow(/已结束/);
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    startAt: Date.now() - 10000,
    endAt: Date.now() + 10000,
  });
  expect(reviewClock(f.repo, f.repo.get(bound.id))).toEqual(oldClock);
});

it("维护权限、完整公告与模式版本由服务端强制，失败与重复不会追加成功历史", async () => {
  const f = await fixture(),
    input = maintenanceInput();
  expect(systemWorkspace(f.repo, f.admin.account).system.version).toBe(0);
  expect(f.repo.all("sportsSystem")).toHaveLength(0);
  expect(() => f.run(f.student, "sports.system.mode", input)).toThrow(
    /体育身份/,
  );
  expect(() => f.run(f.teacher, "sports.system.mode", input)).toThrow(
    /体育身份/,
  );
  expect(() =>
    f.run(f.admin, "sports.system.mode", { ...input, titleEn: "" }),
  ).toThrow(/titleEn/);
  expect(f.repo.all("sportsSystemHistory")).toHaveLength(0);
  const key = randomUUID(),
    entered = f.run(f.admin, "sports.system.mode", input, key);
  f.run(f.admin, "sports.system.mode", input, key);
  expect(f.repo.all("sportsSystemHistory")).toHaveLength(1);
  expect(f.repo.all("sportsPause")).toHaveLength(1);
  expect(() =>
    f.run(f.admin, "sports.system.mode", {
      version: 0,
      mode: "NORMAL",
      reason: "restore",
    }),
  ).toThrow(/版本/);
  expect(() =>
    f.run(f.admin, "sports.semester.create", { name: "禁止维护写入" }),
  ).toThrow(/维护中/);
  expect(() =>
    f.run(f.student, "sports.session.start", { courseId: f.course.id }),
  ).toThrow(/维护中/);
  // Recovery governance is available to the super-admin, while teaching remains paused.
  f.manual();
  expect(f.repo.get(f.record.id).data.status).toBe("TEACHER_PENDING");
  expect(() => f.decide("PASS")).toThrow(/维护中/);
  const original = f.repo.all("sportsMaterial")[0];
  await expect(
    uploadMaterial(
      f.repo,
      f.student.account,
      original.id,
      await readFile("artifacts/fixtures/sports-evidence-test.png"),
    ),
  ).rejects.toThrow(/维护/);
  const resumed = f.run(f.admin, "sports.system.mode", {
    version: entered.version,
    mode: "NORMAL",
    reason: "恢复条件已满足",
  });
  expect(resumed.data.mode).toBe("NORMAL");
  expect(f.repo.all("sportsPause")[0].data.endAt).not.toBeNull();
  expect(f.repo.all("sportsSystemHistory")).toHaveLength(2);
});

it("维护跨越原补证截止仍冻结剩余时间，显式恢复后只顺延实际暂停并支持再次维护", async () => {
  const f = await fixture();
  f.manual();
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const start = Number(record.data.supplementStartedAt),
    hour = 3600000;
  const clock = vi.spyOn(Date, "now").mockReturnValue(start + hour);
  let mode = f.run(f.admin, "sports.system.mode", maintenanceInput());
  clock.mockReturnValue(start + 30 * hour);
  await processSportsReview(f.db, {});
  expect(f.repo.get(record.id).data.status).toBe("SUPPLEMENT_REQUIRED");
  expect(
    systemWorkspace(f.repo, f.student.account).system.supplements[0],
  ).toMatchObject({ paused: true, remaining: 23 * hour });
  const renewed = login(f.db, "admin@example.test", "Review-test-123");
  mode = f.run(renewed, "sports.system.mode", {
    version: mode.version,
    mode: "NORMAL",
    reason: "恢复",
  });
  expect(supplementClock(f.repo, f.repo.get(record.id))).toMatchObject({
    paused: false,
    remaining: 23 * hour,
    deadline: start + 53 * hour,
  });
  clock.mockReturnValue(start + 31 * hour);
  mode = f.run(renewed, "sports.system.mode", {
    ...maintenanceInput(),
    version: mode.version,
  });
  clock.mockReturnValue(start + 32 * hour);
  f.run(renewed, "sports.system.mode", {
    version: mode.version,
    mode: "NORMAL",
    reason: "再次恢复",
  });
  expect(supplementClock(f.repo, f.repo.get(record.id))).toMatchObject({
    remaining: 22 * hour,
    deadline: start + 54 * hour,
  });
  expect(f.repo.get(record.id).data.supplementUsed).toBe(true);
});

it("维护开始前真实逾期的待补证先终结，维护和恢复不会恢复机会", async () => {
  const f = await fixture();
  f.manual();
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  vi.spyOn(Date, "now").mockReturnValue(
    Number(record.data.supplementStartedAt) + 24 * 3600000,
  );
  const admin = login(f.db, "admin@example.test", "Review-test-123");
  const mode = f.run(admin, "sports.system.mode", maintenanceInput());
  expect(f.repo.get(record.id).data.status).toBe("INVALID");
  f.run(admin, "sports.system.mode", {
    version: mode.version,
    mode: "NORMAL",
    reason: "恢复",
  });
  expect(f.repo.get(record.id).data.status).toBe("INVALID");
  expect(
    f.repo
      .all("sportsReviewEvent")
      .filter((e) => e.data.action === "SUPPLEMENT_EXPIRED"),
  ).toHaveLength(1);
});

it("分管理员须有系统模式权限，维护读取只提供公告与本人暂停摘要", async () => {
  const f = await fixture();
  const subId = createAccount(f.db, {
    email: "mode@example.test",
    name: "模式管理员",
    password: "Mode-test-123",
    roles: ["reviewer"],
  });
  const identity = f.repo.create("sportsIdentity", subId, {
    role: "admin",
    status: "verified",
    permissions: [],
  });
  const sub = login(f.db, "mode@example.test", "Mode-test-123");
  expect(() => f.run(sub, "sports.system.mode", maintenanceInput())).toThrow(
    /模式管理权限/,
  );
  f.repo.save(identity, { permissions: ["SYSTEM_MODE"] });
  const mode = f.run(sub, "sports.system.mode", maintenanceInput());
  const server = createApiServer(f.db);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  closes.push(
    () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  );
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  for (const actor of [f.student, f.teacher, f.admin]) {
    const response = await fetch(`${base}/api/sports/workspace`, {
      headers: { Cookie: `bnbu_session=${actor.token}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.courses).toEqual([]);
    expect(data.records).toEqual([]);
    expect(data.materials).toEqual([]);
    expect(data.system.mode).toBe("MAINTENANCE");
    expect(data.system.announcement.titleEn).toBe("Test maintenance");
  }
  const media = f.repo.all("sportsMaterial")[0];
  const response = await fetch(`${base}/api/sports/materials/${media.id}`, {
    headers: { Cookie: `bnbu_session=${f.student.token}` },
  });
  expect(response.status).toBe(503);
  f.repo.save(f.repo.get(identity.id), { permissions: [] });
  expect(() =>
    f.run(sub, "sports.system.mode", {
      version: mode.version,
      mode: "NORMAL",
      reason: "无权恢复",
    }),
  ).toThrow(/模式管理权限/);
  f.run(f.admin, "sports.system.mode", {
    version: mode.version,
    mode: "NORMAL",
    reason: "总管理员恢复",
  });
});

it("一次补证可复用原素材且不复制字节，正式受理后只进入新教师轮次", async () => {
  const f = await fixture();
  f.manual();
  f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const original = f.repo.all("sportsMaterial")[0];
  const current = f.repo.get(f.record.id);
  const draft = f.run(f.student, "sports.supplement.prepare", {
    id: current.id,
    version: current.version,
    reuseIds: [original.id],
    files: [],
  });
  expect(draft.data.status).toBe("SUPPLEMENT_REQUIRED");
  expect(f.repo.get(draft.data.supplementBatchId).data.status).toBe("READY");
  expect(
    f.db.prepare("SELECT COUNT(*) AS n FROM sports_media_blobs").get()?.n,
  ).toBe(1);
  const accepted = f.run(f.student, "sports.supplement.submit", {
    id: draft.id,
    version: draft.version,
  });
  expect(accepted.data.status).toBe("TEACHER_PENDING");
  expect(f.repo.all("sportsReviewRound")).toHaveLength(2);
  expect(f.repo.get(original.id)).toEqual(original);
  expect(() =>
    f.decide("RETURN", {
      reason: "UNCLEAR",
      hours: 72,
      canSupplementOriginal: true,
    }),
  ).toThrow(/一次补证/);
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 100 * 3600000);
  await processSportsReview(f.db, {});
  expect(f.repo.get(f.record.id).data.status).toBe("TEACHER_PENDING");
  vi.restoreAllMocks();
  f.decide("PASS");
  expect(f.repo.all("sportsProgress").some((p) => p.data.total === 35)).toBe(
    true,
  );
});

it("补证包未到账不能提交，到账前不停止计时，严格截止时刻不能正式受理", async () => {
  const f = await fixture();
  f.manual();
  const returned = f.decide("RETURN", {
    reason: "MISSING",
    hours: 24,
    canSupplementOriginal: true,
  });
  const bytes = await readFile("artifacts/fixtures/sports-test-audio.mp4");
  const draft = f.run(f.student, "sports.supplement.prepare", {
    id: returned.id,
    version: returned.version,
    reuseIds: [],
    files: [
      {
        clientId: "video",
        mime: "video/mp4",
        size: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      },
    ],
  });
  expect(() =>
    f.run(f.student, "sports.supplement.submit", {
      id: draft.id,
      version: draft.version,
    }),
  ).toThrow(/尚未全部到账/);
  const material = f.repo
    .all("sportsMaterial")
    .find((m) => m.data.batchId === draft.data.supplementBatchId)!;
  await uploadMaterial(f.repo, f.student.account, material.id, bytes);
  expect(f.repo.get(f.record.id).data.status).toBe("SUPPLEMENT_REQUIRED");
  vi.spyOn(Date, "now").mockReturnValue(
    Number(returned.data.supplementStartedAt) + 24 * 3600000,
  );
  const renewed = login(f.db, "student@example.test", "Review-test-123");
  expect(() =>
    f.run(renewed, "sports.supplement.submit", {
      id: draft.id,
      version: draft.version,
    }),
  ).toThrow(/期限已结束/);
  await processSportsReview(f.db, {});
  expect(f.repo.get(f.record.id).data.publicReason).toMatchObject({
    code: "SUPPLEMENT_EXPIRED",
  });
  expect(f.repo.all("sportsReviewRound")).toHaveLength(1);
  await processSportsReview(f.db, {});
  expect(
    f.repo
      .all("sportsReviewEvent")
      .filter((e) => e.data.action === "SUPPLEMENT_EXPIRED"),
  ).toHaveLength(1);
});

it("确认暂停与故障区间取并集，维护期间不会自动判逾期，恢复仅延续剩余窗口", async () => {
  const f = await fixture();
  f.manual();
  const record = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const start = Number(record.data.supplementStartedAt),
    hour = 3600000;
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    startAt: start + hour,
    endAt: start + 3 * hour,
  });
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    recordId: record.id,
    startAt: start + 2 * hour,
    endAt: start + 4 * hour,
  });
  f.repo.create("sportsPause", null, {
    status: "CONFIRMED",
    recordId: "another-record",
    startAt: start,
    endAt: start + 100 * hour,
  });
  expect(supplementClock(f.repo, record, start + 25 * hour)).toMatchObject({
    remaining: 2 * hour,
    deadline: start + 27 * hour,
  });
  const mode = f.repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  vi.spyOn(Date, "now").mockReturnValue(start + 26 * hour);
  await processSportsReview(f.db, {});
  expect(f.repo.get(record.id).data.status).toBe("SUPPLEMENT_REQUIRED");
  f.repo.save(mode, { mode: "NORMAL" });
  await processSportsReview(f.db, {});
  expect(f.repo.get(record.id).data.status).toBe("SUPPLEMENT_REQUIRED");
});

it("补证原材料引用限定本人本记录，不能以另一次准备变更已锁清单", async () => {
  const f = await fixture();
  f.manual();
  const r = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const original = f.repo.all("sportsMaterial")[0];
  const foreign = f.repo.create("sportsMaterial", f.student.account.id, {
    ...original.data,
    recordId: "other-record",
  });
  expect(() =>
    f.run(f.student, "sports.supplement.prepare", {
      id: r.id,
      version: r.version,
      reuseIds: [foreign.id],
      files: [],
    }),
  ).toThrow(/只能引用/);
  const draft = f.run(f.student, "sports.supplement.prepare", {
    id: r.id,
    version: r.version,
    reuseIds: [original.id],
    files: [],
  });
  expect(() =>
    f.run(f.student, "sports.supplement.prepare", {
      id: draft.id,
      version: draft.version,
      reuseIds: [original.id],
      files: [],
    }),
  ).toThrow(/已有补证包/);
  const reset = f.run(f.student, "sports.supplement.reset", {
    id: draft.id,
    version: draft.version,
  });
  expect(f.repo.get(draft.data.supplementBatchId).data.status).toBe(
    "ABANDONED",
  );
  expect(reset.data.supplementStartedAt).toBe(r.data.supplementStartedAt);
  const second = f.run(f.student, "sports.supplement.prepare", {
    id: reset.id,
    version: reset.version,
    reuseIds: [original.id],
    files: [],
  });
  const accepted = f.run(f.student, "sports.supplement.submit", {
    id: second.id,
    version: second.version,
  });
  expect(() =>
    f.run(f.student, "sports.supplement.reset", {
      id: accepted.id,
      version: accepted.version,
    }),
  ).toThrow(/不在补证阶段/);
});

it("真实HTTP命令与读取返回补证状态，教师判定后学生看到相同公开结果", async () => {
  const f = await fixture();
  f.manual();
  const server = createApiServer(f.db);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  closes.push(
    () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  );
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const post = async (token: string, action: string, input: Fields) => {
    const response = await fetch(`${url}/api/commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `bnbu_session=${token}`,
        Origin: "http://127.0.0.1:4174",
      },
      body: JSON.stringify({ action, input, requestId: randomUUID() }),
    });
    expect(response.status).toBe(200);
    return response.json();
  };
  const current = f.repo.get(f.record.id);
  await post(f.teacher.token, "sports.review.decide", {
    id: current.id,
    version: current.version,
    batchId: current.data.batchId,
    checksCompleted: true,
    decision: "RETURN",
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
  });
  const read = async () => {
    const response = await fetch(`${url}/api/sports/workspace`, {
      headers: { Cookie: `bnbu_session=${f.student.token}` },
    });
    expect(response.status).toBe(200);
    return response.json();
  };
  const workspace = await read(),
    record = workspace.records[0];
  expect(record.data.supplementClock.canSubmit).toBe(true);
  await post(f.student.token, "sports.supplement.prepare", {
    id: record.id,
    version: record.version,
    reuseIds: [workspace.materials[0].id],
    files: [],
  });
  const prepared = (await read()).records[0];
  await post(f.student.token, "sports.supplement.submit", {
    id: prepared.id,
    version: prepared.version,
  });
  const queued = f.repo.get(record.id);
  await post(f.teacher.token, "sports.review.decide", {
    id: queued.id,
    version: queued.version,
    batchId: queued.data.batchId,
    checksCompleted: true,
    decision: "INVALID",
    reason: "MISMATCH",
    publicExplanation: "隔离测试素材，不证明真实运动",
  });
  const final = await read();
  expect(final.records[0].data).toMatchObject({
    status: "INVALID",
    publicReason: { code: "MISMATCH" },
    publicExplanation: "隔离测试素材，不证明真实运动",
  });
  expect(final.progress[0].data.total).toBe(0);
  expect(final.reviewRounds).toHaveLength(2);
});

it("未验证AI不发送材料，技术重试复用任务并保留尝试历史", async () => {
  const f = await fixture();
  let calls = 0;
  const url = await upstream((input, response) => {
    calls++;
    answer(input, response);
  });
  await processSportsReview(f.db, { url });
  expect(calls).toBe(0);
  expect(f.repo.get(f.record.id).data.technicalCode).toBe("AI_NOT_VALIDATED");
  const task = f.repo.all("sportsAiTask")[0],
    record = f.repo.get(f.record.id);
  f.run(f.admin, "sports.ai.retry", { id: record.id, version: record.version });
  await processSportsReview(f.db, { url, validationRef: "ISOLATED-TEST-ONLY" });
  expect(calls).toBe(1);
  expect(f.repo.all("sportsAiTask")).toHaveLength(1);
  expect(f.repo.get(task.id).data.attempt).toBe(2);
  expect(f.repo.all("sportsAiAttempt")).toHaveLength(2);
});
async function fixture() {
  const db = openDatabase(":memory:");
  closes.push(() => db.close());
  const repo = new Repository(db);
  const account = (name: string, role: string) => {
    const id = createAccount(db, {
      email: `${name}@example.test`,
      name,
      password: "Review-test-123",
      roles: role === "admin" ? ["superadmin"] : [role],
    });
    repo.create("sportsIdentity", id, { role, status: "verified" });
    return login(db, `${name}@example.test`, "Review-test-123");
  };
  const student = account("student", "student"),
    teacher = account("teacher", "teacher"),
    other = account("other", "teacher"),
    admin = account("admin", "admin");
  const semester = repo.create("sportsSemester", null, { status: "CURRENT" });
  const course = repo.create("sportsCourse", teacher.account.id, {
    name: "隔离审核测试",
    status: "PUBLISHED",
    semesterId: semester.id,
    threshold: 30,
    weeklyLimit: 3,
    relatedTarget: 600,
    otherTarget: 600,
  });
  const now = Date.now();
  const session = repo.create("sportsSession", student.account.id, {
    courseId: course.id,
    semesterId: semester.id,
    clock: {
      state: "ENDED",
      startedAt: now - 35 * 60000,
      changedAt: now,
      endedAt: now,
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
  const bytes = await readFile("artifacts/fixtures/sports-evidence-test.png");
  const run = (
    actor: typeof student,
    action: string,
    input: Fields,
    key = randomUUID(),
  ) => {
    const result = execute(db, actor.token, action, input, key) as {
      id: string;
    };
    return repo.get(result.id);
  };
  const record = run(student, "sports.record.accept", {
    sessionId: session.id,
    version: session.version,
    category: "RELATED",
    description: "隔离测试，非真实运动",
    activityType: "EXERCISE",
    files: [
      {
        clientId: "one",
        sha256: createHash("sha256").update(bytes).digest("hex"),
        mime: "image/png",
        size: bytes.length,
      },
    ],
  });
  await uploadMaterial(
    repo,
    student.account,
    repo.all("sportsMaterial")[0].id,
    bytes,
  );
  const manual = () =>
    run(admin, "sports.ai.manual", {
      courseId: course.id,
      endAt: new Date(Date.now() + 3600000).toISOString(),
      reason: "独立测试，已配置一小时课程范围",
    });
  const decide = (decision: string, extra: Fields = {}, actor = teacher) => {
    const current = repo.get(record.id);
    return run(actor, "sports.review.decide", {
      id: current.id,
      version: current.version,
      batchId: current.data.batchId,
      decision,
      checksCompleted: true,
      ...extra,
    });
  };
  return {
    db,
    repo,
    student,
    teacher,
    other,
    admin,
    course,
    record,
    run,
    manual,
    decide,
  };
}
async function upstream(
  handler: (input: Fields, response: ServerResponse) => void,
) {
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    handler(JSON.parse(Buffer.concat(chunks).toString()), res);
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  closes.push(
    () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  );
  return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}
function answer(input: Fields, response: ServerResponse, outcome = "NORMAL") {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      requestId: input.requestId,
      recordId: input.recordId,
      recordVersion: input.recordVersion,
      batchId: input.batchId,
      batchVersion: input.batchVersion,
      outcome,
      checksCompleted: true,
      modelVersion: "LOCAL-TEST-NOT-A-REAL-MODEL",
    }),
  );
}
it("AI缺失进入技术队列，限定人工模式只授原教师审核，结果联动35分钟", async () => {
  const f = await fixture();
  await processSportsReview(f.db, {});
  expect(f.repo.get(f.record.id).data.status).toBe("TECHNICAL");
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
  expect(() => f.decide("PASS")).toThrow("不在教师待办");
  f.manual();
  expect(f.repo.all("sportsReviewRound")[0].data.calculationStatus).toBe(
    "CALENDAR_REQUIRED",
  );
  expect(() => f.decide("PASS", {}, f.other)).toThrow("本人负责");
  expect(() => f.decide("PASS", {}, f.admin)).toThrow("体育身份");
  expect(() => f.decide("PASS", { checksCompleted: false })).toThrow(
    "必要复核",
  );
  f.decide("PASS");
  expect(f.repo.get(f.record.id).data.status).toBe("VALID");
  expect(f.repo.all("sportsProgress")[0].data).toMatchObject({
    total: 35,
    categoryTotals: [35, 0],
  });
  expect(f.repo.all("sportsReviewRound")[0].data.status).toBe("CLOSED");
  await processSportsReview(f.db, {});
  expect(f.repo.all("sportsProgress")).toHaveLength(1);
});
it("固定原因动作约束、一次退回与公开说明，不保存隐藏备注", async () => {
  const f = await fixture();
  f.manual();
  expect(() => f.decide("INVALID", { reason: "AUTHENTICITY" })).toThrow(
    "固定公开原因",
  );
  expect(() =>
    f.decide("RETURN", {
      reason: "CONFIRMED_MISUSE",
      hours: 24,
      canSupplementOriginal: true,
    }),
  ).toThrow("固定公开原因");
  const r = f.decide("RETURN", {
    reason: "UNCLEAR",
    hours: 24,
    canSupplementOriginal: true,
    publicExplanation: "请补充原次运动的清晰材料",
    internalNote: "must-not-save",
  });
  expect(r.data).toMatchObject({
    status: "SUPPLEMENT_REQUIRED",
    supplementUsed: true,
    supplementWindowMilliseconds: 24 * 3600000,
  });
  expect(r.data.internalNote).toBeUndefined();
  expect(f.repo.all("sportsProgress")[0].data.total).toBe(0);
  expect(() =>
    f.decide("RETURN", {
      reason: "UNCLEAR",
      hours: 72,
      canSupplementOriginal: true,
    }),
  ).toThrow("不在教师待办");
});
it("受控本地AI正常响应绑定材料版本并重算，不替代真实模型验收", async () => {
  const f = await fixture();
  let sent: Fields | undefined;
  const url = await upstream((input, response) => {
    sent = input;
    answer(input, response);
  });
  await processSportsReview(f.db, { url, validationRef: "ISOLATED-TEST-ONLY" });
  expect(f.repo.get(f.record.id).data.status).toBe("VALID");
  expect(f.repo.all("sportsProgress")[0].data.total).toBe(35);
  expect((sent?.materials as unknown[]).length).toBe(1);
  expect(sent).not.toHaveProperty("email");
  expect(f.repo.all("sportsAiTask")[0].data.status).toBe("COMPLETE");
});
it("错误版本的AI响应进入技术状态，不能自动通过", async () => {
  const f = await fixture();
  const url = await upstream((input, response) =>
    answer({ ...input, batchId: "different" }, response),
  );
  await processSportsReview(f.db, { url, validationRef: "ISOLATED-TEST-ONLY" });
  expect(f.repo.get(f.record.id).data.status).toBe("TECHNICAL");
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
});
it("迟到AI结果不能覆盖人工结论和已有进度版本", async () => {
  const f = await fixture();
  let release!: () => void, started!: () => void;
  const ready = new Promise<void>((done) => {
    started = done;
  });
  const url = await upstream((input, response) => {
    release = () => answer(input, response);
    started();
  });
  const job = processSportsReview(f.db, {
    url,
    validationRef: "ISOLATED-TEST-ONLY",
  });
  await ready;
  f.manual();
  f.decide("INVALID", {
    reason: "MISMATCH",
    publicExplanation: "隔离测试文件并非运动凭证",
  });
  release();
  await job;
  expect(f.repo.get(f.record.id).data.status).toBe("INVALID");
  expect(f.repo.all("sportsProgress")[0].data.total).toBe(0);
  expect(f.repo.all("sportsAiTask")[0].data.status).toBe("DISCARDED");
});
