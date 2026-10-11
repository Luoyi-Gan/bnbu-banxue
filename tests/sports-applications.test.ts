import { afterEach, expect, it } from "vitest";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import {
  uploadApplicationAsset,
  readApplicationAsset,
  applicationWorkspace,
} from "../server/sports/applications";
import { enduranceWorkspace } from "../server/sports/endurance";
import { reviewWorkspace } from "../server/sports/review";
import { courseReport } from "../server/sports/report";
const dbs: Database[] = [];
afterEach(() => dbs.splice(0).forEach((d) => d.close()));
function setup() {
  const db = openDatabase(":memory:");
  dbs.push(db);
  const repo = new Repository(db);
  const make = (name: string, role: string) => {
    const id = createAccount(db, {
      email: name + "@example.test",
      password: "Test-password-123",
      name,
      roles: [],
    });
    repo.create("sportsIdentity", id, { role, status: "verified" });
    return login(db, name + "@example.test", "Test-password-123");
  };
  const student = make("student", "student"),
    teacher = make("teacher", "teacher"),
    other = make("other", "teacher"),
    admin = make("admin", "admin");
  const semester = repo.create("sportsSemester", teacher.account.id, {
    status: "CURRENT",
  });
  const course = repo.create("sportsCourse", teacher.account.id, {
    semesterId: semester.id,
    name: "Test",
    status: "PUBLISHED",
    relatedTarget: 600,
    otherTarget: 600,
    threshold: 30,
    weeklyLimit: 2,
  });
  const member = repo.create("sportsEnrollment", student.account.id, {
    courseId: course.id,
    status: "ACTIVE",
  });
  const run = (
    who: typeof student,
    action: string,
    input: Record<string, unknown>,
    key = randomUUID(),
  ) =>
    repo.get((execute(db, who.token, action, input, key) as { id: string }).id);
  const image = async (applicationId?: string) =>
    uploadApplicationAsset(
      repo,
      student.token,
      course.id,
      await sharp({
        create: { width: 10, height: 10, channels: 3, background: "white" },
      })
        .png()
        .toBuffer(),
      "image/png",
      applicationId,
    );
  const submit = (assetIds: string[], applicationType = "EXEMPTION") =>
    run(student, "sports.application.submit", {
      courseId: course.id,
      applicationType,
      assetIds,
      ...(applicationType === "CERTIFICATION"
        ? {
            certificationKind: "STUDENT_CLUB",
            organizationOrTeamName: "测试社团",
            validFrom: "2026-01-01",
            validTo: "2026-12-31",
          }
        : {}),
    });
  return {
    db,
    repo,
    student,
    teacher,
    other,
    admin,
    course,
    member,
    semester,
    run,
    image,
    submit,
  };
}
it("证明按原字节私有保存，未正式提交不授予教师查看，格式和绑定归属受限", async () => {
  const f = setup(),
    asset = await f.image();
  expect(() =>
    readApplicationAsset(f.repo, f.teacher.account, asset.id),
  ).toThrow("已正式提交");
  const app = f.submit([asset.id]);
  expect(readApplicationAsset(f.repo, f.teacher.account, asset.id).id).toBe(
    asset.id,
  );
  expect(readApplicationAsset(f.repo, f.student.account, asset.id).id).toBe(
    asset.id,
  );
  for (const who of [f.other, f.admin])
    expect(() => readApplicationAsset(f.repo, who.account, asset.id)).toThrow();
  expect(() => f.submit([asset.id])).toThrow("未绑定");
  await expect(
    uploadApplicationAsset(
      f.repo,
      f.student.token,
      f.course.id,
      Buffer.from("bad"),
      "image/png",
    ),
  ).rejects.toThrow("内容或格式");
  await expect(
    uploadApplicationAsset(
      f.repo,
      f.student.token,
      f.course.id,
      Buffer.from("pdf"),
      "application/pdf",
    ),
  ).rejects.toThrow("只接受");
  await expect(
    uploadApplicationAsset(
      f.repo,
      f.student.token,
      f.course.id,
      Buffer.alloc(10 * 1024 * 1024 + 1),
      "image/png",
    ),
  ).rejects.toThrow("10MB");
  expect(
    applicationWorkspace(f.repo, f.admin.account).applications,
  ).toHaveLength(0);
  expect(
    applicationWorkspace(f.repo, f.other.account).applications,
  ).toHaveLength(0);
  expect(app.data.status).toBe("SUBMITTED");
});
it("补充沿用原申请，关闭或移出后合法受理链继续，累计三图不能靠多个补充绕过", async () => {
  const f = setup();
  let app = f.submit([(await f.image()).id]);
  app = f.run(f.teacher, "sports.application.decide", {
    id: app.id,
    version: app.version,
    decision: "REQUEST_SUPPLEMENT",
    reason: "请补充清晰证明",
  });
  f.repo.save(f.course, { status: "CLOSED" });
  f.repo.save(f.member, { status: "REMOVED" });
  await expect(f.image()).rejects.toThrow("关闭");
  const a = await f.image(app.id),
    b = await f.image(app.id),
    c = await f.image(app.id);
  expect(() =>
    f.run(f.student, "sports.application.supplement", {
      id: app.id,
      version: app.version,
      assetIds: [a.id, b.id, c.id],
    }),
  ).toThrow("最多3张");
  app = f.run(f.student, "sports.application.supplement", {
    id: app.id,
    version: app.version,
    assetIds: [a.id, b.id],
  });
  expect(app.data.assetIds).toHaveLength(3);
  app = f.run(f.teacher, "sports.application.decide", {
    id: app.id,
    version: app.version,
    decision: "REQUEST_SUPPLEMENT",
    reason: "需进一步证明",
  });
  expect(() =>
    f.run(f.student, "sports.application.supplement", {
      id: app.id,
      version: app.version,
      assetIds: [c.id],
    }),
  ).toThrow("最多3张");
  expect(f.repo.all("sportsApplicationHistory")).toHaveLength(4);
});
it("免测隐藏学生原用时和换算，不删除教师历史或增加运动分钟/成绩", async () => {
  const f = setup();
  f.repo.create("sportsEndurance", f.student.account.id, {
    courseId: f.course.id,
    enrollmentId: f.member.id,
    event: 800,
    seconds: 270,
    conversion: { score: 99 },
  });
  f.repo.create("sportsEnduranceRevision", f.student.account.id, {
    courseId: f.course.id,
    seconds: 270,
  });
  const app = f.submit([(await f.image()).id]);
  f.run(f.teacher, "sports.application.decide", {
    id: app.id,
    version: app.version,
    decision: "APPROVE",
    reason: "核对证明批准免测",
  });
  const data = enduranceWorkspace(f.repo, f.student.account);
  expect(data.enduranceRecords).toHaveLength(1);
  expect(data.enduranceRecords[0].data).toMatchObject({ exempt: true });
  expect(data.enduranceHistory).toHaveLength(0);
  expect(JSON.stringify(data)).not.toContain('"seconds"');
  expect(
    enduranceWorkspace(f.repo, f.teacher.account).enduranceHistory,
  ).toHaveLength(1);
  expect(f.repo.all("sportsProgress")).toHaveLength(0);
  expect(f.repo.all("sportsGrade")).toHaveLength(0);
  expect(
    courseReport(f.repo, f.teacher.account, f.course.id).rows[0].facts,
  ).toMatchObject({ enduranceStatus: "EXEMPT", endurance: null, total: 0 });
  expect(() =>
    f.run(f.teacher, "sports.endurance.confirm", {
      enrollmentId: f.member.id,
      version: 1,
      event: 800,
      seconds: 280,
      testDate: "2026-01-02",
      confirmed: true,
    }),
  ).toThrow("已获免测");
});
it("组织分类原样保留，两类认可调整/撤销形成历史并重算无运动学生的进度", async () => {
  const f = setup();
  let app = f.submit([(await f.image()).id], "CERTIFICATION");
  expect(app.data.certification).toMatchObject({
    certificationKind: "STUDENT_CLUB",
  });
  expect(() =>
    f.run(f.teacher, "sports.application.decide", {
      id: app.id,
      version: app.version,
      decision: "APPROVE",
      reason: "测试",
      relatedMinutes: 601,
      otherMinutes: 0,
    }),
  ).toThrow();
  expect(f.repo.get(app.id).data.status).toBe("SUBMITTED");
  app = f.run(f.teacher, "sports.application.decide", {
    id: app.id,
    version: app.version,
    decision: "APPROVE",
    reason: "审核证明认可",
    relatedMinutes: 120,
    otherMinutes: 60,
  });
  expect(
    reviewWorkspace(f.repo, f.student.account).progress[0].data.total,
  ).toBe(180);
  expect(
    reviewWorkspace(f.repo, f.teacher.account).progress[0].data.total,
  ).toBe(180);
  expect(reviewWorkspace(f.repo, f.admin.account).progress).toHaveLength(0);
  const oldVersion = app.version;
  app = f.run(f.teacher, "sports.certification.adjust", {
    id: app.id,
    version: app.version,
    relatedMinutes: 0,
    otherMinutes: 100,
    reason: "实际分类更正",
  });
  expect(() =>
    f.run(f.teacher, "sports.certification.revoke", {
      id: app.id,
      version: oldVersion,
      reason: "过期版本",
    }),
  ).toThrow("已变化");
  expect(
    reviewWorkspace(f.repo, f.student.account).progress[0].data.total,
  ).toBe(100);
  app = f.run(f.teacher, "sports.certification.revoke", {
    id: app.id,
    version: app.version,
    reason: "证明失效取消认可",
  });
  expect(
    reviewWorkspace(f.repo, f.student.account).progress[0].data.total,
  ).toBe(0);
  expect(f.repo.all("sportsCertificationHistory")).toHaveLength(6);
  expect(f.repo.all("sportsRecord")).toHaveLength(0);
  expect(() =>
    f.run(f.teacher, "sports.certification.adjust", {
      id: app.id,
      version: app.version,
      relatedMinutes: 5,
      otherMinutes: 5,
      reason: "试图复活",
    }),
  ).toThrow("已经撤销");
});
it("审核幂等且仅原责任教师，结算后拒绝直接变更", async () => {
  const f = setup();
  const app = f.submit([(await f.image()).id]);
  const input = {
    id: app.id,
    version: app.version,
    decision: "REJECT",
    reason: "材料不能证明申请",
  };
  for (const who of [f.other, f.admin, f.student])
    expect(() => f.run(who, "sports.application.decide", input)).toThrow();
  const key = randomUUID();
  const saved = f.run(f.teacher, "sports.application.decide", input, key);
  expect(f.run(f.teacher, "sports.application.decide", input, key).id).toBe(
    saved.id,
  );
  expect(f.repo.all("sportsApplicationHistory")).toHaveLength(2);
  f.repo.save(f.course, { settlementStatus: "SETTLED" });
  await expect(f.image()).rejects.toThrow("已结算");
});
it("申请证明真实HTTP上传/读取，提交后才向责任教师开放，维护和首次改密均拒绝", async () => {
  const f = setup(),
    { createApiServer } = await import("../server/main"),
    server = createApiServer(f.db);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const headers = (token: string) => ({ Cookie: `bnbu_session=${token}` });
  const bytes = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .webp()
    .toBuffer();
  try {
    const upload = await fetch(
      `${base}/api/sports/application-assets/${f.course.id}`,
      {
        method: "POST",
        headers: { ...headers(f.student.token), "Content-Type": "image/webp" },
        body: bytes,
      },
    );
    expect(upload.status).toBe(200);
    const { id } = await upload.json();
    const url = `${base}/api/sports/application-assets/${id}`;
    expect(
      (await fetch(url, { headers: headers(f.teacher.token) })).status,
    ).toBe(403);
    const submit = await fetch(base + "/api/commands", {
      method: "POST",
      headers: {
        ...headers(f.student.token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sports.application.submit",
        input: {
          courseId: f.course.id,
          applicationType: "EXEMPTION",
          assetIds: [id],
        },
        requestId: randomUUID(),
      }),
    });
    expect(submit.status).toBe(200);
    const raw = await fetch(url, { headers: headers(f.teacher.token) });
    expect(raw.status).toBe(200);
    expect(raw.headers.get("cache-control")).toBe("no-store");
    expect(Buffer.from(await raw.arrayBuffer())).toEqual(bytes);
    for (const who of [f.other, f.admin])
      expect((await fetch(url, { headers: headers(who.token) })).status).toBe(
        403,
      );
    const identity = f.repo
      .all("sportsIdentity")
      .find((i) => i.ownerId === f.teacher.account.id)!;
    f.repo.save(identity, { mustChangePassword: true });
    expect(
      (await fetch(url, { headers: headers(f.teacher.token) })).status,
    ).toBe(403);
    f.repo.create("sportsSystem", f.admin.account.id, { mode: "MAINTENANCE" });
    expect(
      (await fetch(url, { headers: headers(f.student.token) })).status,
    ).toBe(503);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
