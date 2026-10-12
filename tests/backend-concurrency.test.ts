import { afterEach, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { createApiServer } from "../server/main";
import { execute, snapshot } from "../server/commands";
import { Repository } from "../server/repository";

const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
function fixture() {
  const db = openDatabase(":memory:");
  cleanup.push(() => db.close());
  const make = (name: string, roles: string[]) => {
    createAccount(db, {
      email: `${name}@example.test`,
      password: "Test-password-123",
      name,
      roles,
    });
    return login(db, `${name}@example.test`, "Test-password-123");
  };
  const a = make("a", ["student"]),
    b = make("b", ["student"]),
    teacher = make("teacher", ["teacher"]),
    admin = make("admin", ["superadmin"]);
  const run = (who: typeof a, action: string, input: Record<string, unknown>) =>
    execute(db, who.token, action, input, randomUUID()) as { id: string };
  return { db, a, b, teacher, admin, run };
}

it("两位学生同时从 HTTP 竞争最后一个名额只成功一笔", async () => {
  const { db, a, b, teacher, run } = fixture();
  const slot = run(teacher, "coffee.slot.create", {
    startAt: new Date(Date.now() + 86400000).toISOString(),
    endAt: new Date(Date.now() + 90000000).toISOString(),
    location: "学校",
    capacity: 1,
  });
  const server = createApiServer(db);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  cleanup.push(
    () =>
      new Promise<void>((done) => {
        server.closeAllConnections();
        server.close(() => done());
      }),
  );
  const port = (server.address() as { port: number }).port;
  const responses = await Promise.all(
    [a, b].map((who) =>
      fetch(`http://127.0.0.1:${port}/api/commands`, {
        method: "POST",
        headers: {
          Cookie: `bnbu_session=${who.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: randomUUID(),
          action: "coffee.book",
          input: { slotId: slot.id, topic: "咨询" },
        }),
      }),
    ),
  );
  expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
  expect(new Repository(db).all("coffeeBooking")).toHaveLength(1);
});

it("群体通知按实际接收记录计算阅读率，不能代他人已读", () => {
  const { db, a, b, admin, run } = fixture();
  run(admin, "notification.send", {
    recipients: [a.account.id, b.account.id, a.account.id],
    body: "集合通知",
  });
  expect(snapshot(db, admin.account).notificationBatches[0]).toMatchObject({
    total: 2,
    read: 0,
    readRate: 0,
  });
  const first = snapshot(db, a.account).notifications[0];
  run(a, "notification.read", { id: first.id });
  run(a, "notification.read", { id: first.id });
  expect(snapshot(db, admin.account).notificationBatches[0]).toMatchObject({
    total: 2,
    read: 1,
    readRate: 0.5,
  });
  expect(() => run(admin, "notification.read", { id: first.id })).toThrow(
    "通知不存在",
  );
});

it("邮件来源去重、人工修正保留及内部原文隔离", () => {
  const { db, a, admin, run } = fixture();
  const source = {
    messageId: "mail-test-1",
    subject: "校园活动",
    sender: "school@example.test",
    body: "活动名称：公开讲座\n活动介绍：介绍\n活动开始时间：2027-01-01 10:00\n活动结束时间：2027-01-01 11:00\n活动地点：图书馆\n主办方：学院",
    coverName: "fixture.png",
    cover:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY8kAAAAASUVORK5CYII=",
  };
  const mail = run(admin, "mail.import", source);
  run(admin, "mail.import", { ...source, messageId: "duplicate-body" });
  const repo = new Repository(db);
  expect(repo.all("activity")).toHaveLength(1);
  run(admin, "mail.correct", {
    id: mail.id,
    title: "修正后的名称",
    description: "学校核实说明",
    startAt: "2027-01-01T10:00:00+08:00",
    endAt: "2027-01-01T11:00:00+08:00",
    location: "T2",
    host: "学院",
    conditions: "",
    reason: "原邮件核实更正地点",
  });
  run(admin, "mail.import", source);
  expect(repo.all("activity")[0].data.title).toBe("修正后的名称");
  const studentView = JSON.stringify(snapshot(db, a.account));
  expect(studentView).not.toContain("school@example.test");
  expect(studentView).not.toContain("mail-test-1");
  expect(() =>
    run(admin, "mail.import", { ...source, body: source.body + "\n修订内容" }),
  ).toThrow("内容已变化");
  run(admin, "mail.visibility", {
    id: mail.id,
    publish: false,
    reason: "暂时隐藏",
  });
  expect(
    snapshot(db, a.account).entities.some((e) => e.kind === "activity"),
  ).toBe(false);
  const second = run(admin, "mail.import", {
    ...source, messageId: "mail-test-2", subject: "另一活动",
    body: source.body.replace("公开讲座", "另一讲座"),
  });
  // Whichever order the repository returns, address a non-first record.
  const target = repo.all("mail")[1];
  const record = target.data.record as { status: string };
  const beforeMails = repo.all("mail");
  const beforeEvents = repo.all("activity");
  const result = run(admin, "mail.visibility", {
    id: target.id, publish: record.status === "published", reason: "核对当前状态",
  });
  expect(result.id).toBe(target.id);
  expect(repo.all("mail")).toEqual(beforeMails);
  expect(repo.all("activity")).toEqual(beforeEvents);
  run(admin, "mail.visibility", { id: mail.id, publish: true, reason: "恢复原活动" });
  expect(repo.all("activity").find(e => e.data.mailId === mail.id)?.data)
    .toMatchObject({ title: "修正后的名称", status: "published" });
  expect(repo.get(second.id)).toEqual(beforeMails.find(e => e.id === second.id));
});

it("无海报邮件用默认封面，修改时间地点通知参与或收藏者且去重", () => {
  const { db, a, b, admin, run } = fixture();
  const repo = new Repository(db);
  const mail = run(admin, "mail.import", {
    messageId: "coverless", subject: "校园活动", sender: "school@example.test",
    body: "活动名称：公开讲座\n活动介绍：介绍\n活动开始时间：2027-01-01 10:00\n活动结束时间：2027-01-01 11:00\n活动地点：图书馆\n主办方：学院",
  });
  const event = repo.all("activity")[0];
  expect(event.data).toMatchObject({status: "published", image: "/activity-default-cover.svg"});
  expect((repo.get(mail.id).data.record as {source: object}).source).not.toHaveProperty("cover");
  run(a, "relation.set", {id: event.id, kind: "save", enabled: true});
  run(a, "relation.set", {id: event.id, kind: "participate", enabled: true});
  run(b, "relation.set", {id: event.id, kind: "like", enabled: true});
  const correction = {id: mail.id, title: "公开讲座", description: "核实说明",
    startAt: "2027-01-01T10:00:00+08:00", endAt: "2027-01-01T11:00:00+08:00",
    location: "T2", host: "学院", conditions: "", reason: "地点调整"};
  const beforeMail = repo.get(mail.id);
  const beforeEvent = repo.get(event.id);
  const retryKey = randomUUID();
  db.exec("CREATE TRIGGER fail_activity_notice BEFORE INSERT ON notifications WHEN NEW.event='activity.changed' BEGIN SELECT RAISE(ABORT,'notice failed'); END;");
  expect(() => execute(db, admin.token, "mail.correct", correction, retryKey)).toThrow("notice failed");
  expect(repo.get(mail.id)).toEqual(beforeMail);
  expect(repo.get(event.id)).toEqual(beforeEvent);
  expect(db.prepare("SELECT * FROM command_receipts WHERE request_id=?").get(retryKey)).toBeUndefined();
  db.exec("DROP TRIGGER fail_activity_notice");
  execute(db, admin.token, "mail.correct", correction, retryKey);
  const corrected = repo.get(mail.id);
  execute(db, admin.token, "mail.correct", correction, retryKey);
  expect(repo.get(mail.id)).toEqual(corrected);
  const notices = () => db.prepare("SELECT recipient_id FROM notifications WHERE event='activity.changed'").all();
  expect(notices()).toEqual([{recipient_id: a.account.id}]);
  run(admin, "mail.correct", {...correction, description: "仅更新介绍"});
  expect(notices()).toHaveLength(1);
  run(a, "relation.set", {id: event.id, kind: "save", enabled: false});
  run(a, "relation.set", {id: event.id, kind: "participate", enabled: false});
  run(b, "relation.set", {id: event.id, kind: "save", enabled: true});
  run(admin, "mail.correct", {...correction, endAt: "2027-01-01T12:00:00+08:00"});
  expect(notices()).toEqual([{recipient_id: a.account.id}, {recipient_id: b.account.id}]);
  run(admin, "mail.cover", {id: mail.id, cover: "data:image/png;base64,aGVsbG8=", coverName: "poster.png", reason: "补充海报"});
  expect(repo.get(event.id).data.image).toBe("data:image/png;base64,aGVsbG8=");
  expect(notices()).toHaveLength(2);
});

it("无效课表不能覆盖本人数据，也不能被其他账号读取", () => {
  const { db, a, b, run } = fixture();
  run(a, "timetable.save", {
    fileName: "fixture.png",
    lessons: [
      { name: "测试课程", weekday: 1, startTime: "09:00", endTime: "10:00" },
    ],
  });
  expect(() =>
    run(a, "timetable.save", { lessons: [{ name: "错误星期", weekday: 9 }] }),
  ).toThrow();
  expect(
    snapshot(db, a.account).entities.find((e) => e.kind === "timetable")?.data
      .lessons,
  ).toMatchObject([{ name: "测试课程" }]);
  expect(
    snapshot(db, b.account).entities.some((e) => e.kind === "timetable"),
  ).toBe(false);
});
