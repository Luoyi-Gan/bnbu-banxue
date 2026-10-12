import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { createApiServer } from "../server/main";
import { execute, snapshot } from "../server/commands";
import { Repository } from "../server/repository";

const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  vi.useRealTimers();
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

it("邮件拆分与更正通过真实 HTTP 事务接通学生公开视图", async () => {
  const { db, a, admin } = fixture();
  const repo = new Repository(db);
  const server = createApiServer(db);
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  cleanup.push(() => new Promise<void>(done => {server.closeAllConnections(); server.close(() => done());}));
  const base = `http://127.0.0.1:${(server.address() as {port: number}).port}`;
  async function post(who: typeof a, action: string, input: Record<string, unknown>) {
    const response = await fetch(base + "/api/commands", {method: "POST", headers: {
      Cookie: `bnbu_session=${who.token}`, "Content-Type": "application/json",
    }, body: JSON.stringify({action, input, requestId: randomUUID()})});
    return {status: response.status, body: await response.json()};
  }
  const source = await post(admin, "mail.import", {messageId: "http-multi", subject: "两场活动", sender: "internal@example.test", body: "活动名称：讲座\n活动名称：比赛"});
  expect(source.status).toBe(200);
  const id = repo.all("mail")[0].id;
  const fields = {title: "讲座", description: "介绍", startAt: "2027-01-01 10:00", endAt: "2027-01-01 11:00", location: "图书馆", host: "学院", conditions: ""};
  const input = {id, expectedVersion: 1, confirmed: true, reason: "人工核实", activities: [fields, {...fields, title: "比赛"}]};
  expect((await post(a, "mail.split", input)).status).toBe(403);
  expect((await post(admin, "mail.split", input)).status).toBe(200);
  const event = repo.all("activity")[0];
  expect((await post(a, "relation.set", {id: event.id, kind: "save", enabled: true})).status).toBe(200);
  expect((await post(admin, "mail.import", {messageId: "http-revision", subject: "地点更正", sender: "internal@example.test", body: "改在T2", revision: true})).status).toBe(200);
  const revision = repo.all("mail").find(item => item.data.purpose === "revision")!;
  const target = repo.get(event.data.mailId);
  expect((await post(admin, "mail.revise", {...fields, title: event.data.title, location: "T2", id: revision.id, expectedVersion: revision.version, targetMailId: target.id, targetVersion: target.version, confirmed: true, reason: "学校更正"})).status).toBe(200);
  const response = await fetch(base + "/api/workspace", {headers: {Cookie: `bnbu_session=${a.token}`}});
  expect(response.status).toBe(200);
  const view = await response.json();
  expect(view.entities.find((item: {id: string}) => item.id === event.id).data.location).toBe("T2");
  expect(view.entities.filter((item: {kind: string}) => item.kind === "activity")).toHaveLength(2);
  expect(view.notifications.filter((item: {event: string}) => item.event === "activity.changed")).toHaveLength(1);
  expect(JSON.stringify(view)).not.toContain("internal@example.test");
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

it("管理员核对拆分和关联更正保持原来源、活动标识、订阅及事务", () => {
  const { db, a, admin, run } = fixture();
  const repo = new Repository(db);
  const source = {messageId: "multi", subject: "两场活动", sender: "school@example.test",
    body: "活动名称：上午讲座\n活动名称：下午比赛"};
  const mail = run(admin, "mail.import", source);
  const fields = {title: "上午讲座", description: "活动介绍", startAt: "2027-01-01T10:00:00+08:00",
    endAt: "2027-01-01T11:00:00+08:00", location: "图书馆", host: "学院", conditions: ""};
  const split = {id: mail.id, expectedVersion: 1, confirmed: true, reason: "核对两场活动",
    activities: [fields, {...fields, title: "下午比赛", startAt: "2027-01-01T14:00:00+08:00", endAt: "2027-01-01T15:00:00+08:00"}]};
  expect(() => run(a, "mail.split", split)).toThrow("运营");
  expect(() => run(admin, "mail.split", {...split, activities: [fields, {...fields, location: ""}]})).toThrow();
  expect(repo.all("activity")).toHaveLength(0);
  expect(repo.all("mail")).toHaveLength(1);
  run(admin, "mail.split", split);
  expect(repo.all("activity")).toHaveLength(2);
  expect(run(admin, "mail.import", source).id).toBe(mail.id);
  expect(() => run(admin, "mail.split", {...split, expectedVersion: repo.get(mail.id).version})).toThrow("未处理");
  const childId = (repo.get(mail.id).data.childMailIds as string[])[0];
  const event = repo.all("activity").find(e => e.data.mailId === childId)!;
  run(a, "relation.set", {id: event.id, kind: "save", enabled: true});
  const revision = run(admin, "mail.import", {...source, messageId: "correction", subject: "地点更正",
    body: "活动地点：T2", revision: true});
  const update = {...fields, id: revision.id, targetMailId: childId, expectedVersion: 1,
    targetVersion: repo.get(childId).version, confirmed: true, reason: "学校更正地点", location: "T2"};
  expect(repo.get(revision.id).data.purpose).toBe("revision");
  expect(() => run(admin, "mail.correct", {...fields, id: revision.id, reason: "直接发布"})).toThrow("关联原活动");
  expect(() => run(admin, "mail.split", {...split, id: revision.id})).toThrow("关联原活动");
  expect(repo.all("activity")).toHaveLength(2);
  expect(() => run(admin, "mail.revise", {...update, targetVersion: 0})).toThrow("已变化");
  const key = randomUUID();
  execute(db, admin.token, "mail.revise", update, key);
  execute(db, admin.token, "mail.revise", update, key);
  expect(repo.all("activity")).toHaveLength(2);
  expect(repo.get(event.id).data.location).toBe("T2");
  expect(repo.related(a.account.id, event.id, "save")).toBe(true);
  expect(repo.all("mailRevision")).toHaveLength(1);
  expect(db.prepare("SELECT * FROM notifications WHERE event='activity.changed'").all()).toHaveLength(1);
  expect(repo.get(revision.id).data).toMatchObject({resolvedAs: "revision", targetMailId: childId});
  expect((repo.get(revision.id).data.record as {source: {body: string}}).source.body).toBe("活动地点：T2");
  expect(JSON.stringify(snapshot(db, a.account))).not.toContain("school@example.test");
});

it("课表重导入记录新来源时间，手动修正及无效导入保留原来源", () => {
  const { db, a, run } = fixture();
  const repo = new Repository(db);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-12T01:00:00Z"));
  const input = { fileName: "first.png", lessons: [{name: "课程", weekday: 1}] };
  const table = run(a, "timetable.save", input);
  const first = repo.get(table.id);
  expect(first.data.importedAt).toBe("2026-10-12T01:00:00.000Z");
  vi.setSystemTime(new Date("2026-10-12T02:00:00Z"));
  run(a, "timetable.correct", {lessonId: "lesson-0", name: "修正课程", weekday: 2});
  expect(repo.get(table.id).data.importedAt).toBe(first.data.importedAt);
  expect(repo.get(table.id).updatedAt).not.toBe(first.updatedAt);
  run(a, "timetable.save", {...input, fileName: "second.png"});
  const second = repo.get(table.id);
  expect(second.data).toMatchObject({importedAt: "2026-10-12T02:00:00.000Z", fileName: "second.png"});
  expect(second.createdAt).toBe(first.createdAt);
  expect(() => run(a, "timetable.save", {fileName: "bad.png", lessons: []})).toThrow();
  expect(repo.get(table.id)).toEqual(second);
});
