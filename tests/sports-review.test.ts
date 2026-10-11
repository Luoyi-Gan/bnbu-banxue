import { afterEach, expect, it, vi } from "vitest";
import { supplementClock } from "../server/sports/supplements";
import { createServer, type ServerResponse } from "node:http";
import { randomUUID, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository, type Fields } from "../server/repository";
import { execute } from "../server/commands";
import { uploadMaterial } from "../server/sports/materials";
import { processSportsReview } from "../server/sports/review-worker";
import { createApiServer } from "../server/main";
const closes: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of closes.splice(0).reverse()) await close();
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
  const reset = f.run(f.student,"sports.supplement.reset",{id:draft.id,version:draft.version});
  expect(f.repo.get(draft.data.supplementBatchId).data.status).toBe("ABANDONED");
  expect(reset.data.supplementStartedAt).toBe(r.data.supplementStartedAt);
  const second = f.run(f.student,"sports.supplement.prepare",{id:reset.id,version:reset.version,reuseIds:[original.id],files:[]});
  const accepted = f.run(f.student,"sports.supplement.submit",{id:second.id,version:second.version});
  expect(()=>f.run(f.student,"sports.supplement.reset",{id:accepted.id,version:accepted.version})).toThrow(/不在补证阶段/);
});

it("真实HTTP命令与读取返回补证状态，教师判定后学生看到相同公开结果", async () => {
  const f = await fixture(); f.manual();
  const server = createApiServer(f.db);
  await new Promise<void>(done=>server.listen(0,"127.0.0.1",done));
  closes.push(()=>new Promise<void>(done=>{server.closeAllConnections();server.close(()=>done());}));
  const url=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
  const post = async (token:string,action:string,input:Fields) => {
    const response=await fetch(`${url}/api/commands`,{method:"POST",headers:{"Content-Type":"application/json",Cookie:`bnbu_session=${token}`,Origin:"http://127.0.0.1:4174"},body:JSON.stringify({action,input,requestId:randomUUID()})});
    expect(response.status).toBe(200); return response.json();
  };
  const current=f.repo.get(f.record.id);
  await post(f.teacher.token,"sports.review.decide",{id:current.id,version:current.version,batchId:current.data.batchId,checksCompleted:true,decision:"RETURN",reason:"UNCLEAR",hours:24,canSupplementOriginal:true});
  const read = async () => {
    const response=await fetch(`${url}/api/sports/workspace`,{headers:{Cookie:`bnbu_session=${f.student.token}`}});
    expect(response.status).toBe(200);return response.json();
  };
  const workspace=await read(), record=workspace.records[0];
  expect(record.data.supplementClock.canSubmit).toBe(true);
  await post(f.student.token,"sports.supplement.prepare",{id:record.id,version:record.version,reuseIds:[workspace.materials[0].id],files:[]});
  const prepared=(await read()).records[0];
  await post(f.student.token,"sports.supplement.submit",{id:prepared.id,version:prepared.version});
  const queued=f.repo.get(record.id);
  await post(f.teacher.token,"sports.review.decide",{id:queued.id,version:queued.version,batchId:queued.data.batchId,checksCompleted:true,decision:"INVALID",reason:"MISMATCH",publicExplanation:"隔离测试素材，不证明真实运动"});
  const final=await read();
  expect(final.records[0].data).toMatchObject({status:"INVALID",publicReason:{code:"MISMATCH"},publicExplanation:"隔离测试素材，不证明真实运动"});
  expect(final.progress[0].data.total).toBe(0);
  expect(final.reviewRounds).toHaveLength(2);
});

it("未验证AI不发送材料，技术重试复用任务并保留尝试历史", async () => {
  const f = await fixture();let calls=0;
  const url=await upstream((input,response)=>{calls++;answer(input,response);});
  await processSportsReview(f.db,{url});
  expect(calls).toBe(0);
  expect(f.repo.get(f.record.id).data.technicalCode).toBe("AI_NOT_VALIDATED");
  const task=f.repo.all("sportsAiTask")[0],record=f.repo.get(f.record.id);
  f.run(f.admin,"sports.ai.retry",{id:record.id,version:record.version});
  await processSportsReview(f.db,{url,validationRef:"ISOLATED-TEST-ONLY"});
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
