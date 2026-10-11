import { afterEach, describe, expect, it } from "vitest";
import { openDatabase, transaction, type Database } from "../server/database";
import {
  authenticate,
  createAccount,
  issueCode,
  login,
  register,
} from "../server/auth";
import { Repository } from "../server/repository";
import { communityCommand } from "../server/community";
import { coffeeCommand, occupied } from "../server/coffee";

const databases: Database[] = [];
afterEach(() => {
  databases.splice(0).forEach((db) => db.close());
});
function setup() {
  const db = openDatabase(":memory:");
  databases.push(db);
  const repo = new Repository(db);
  const make = (name: string, roles: string[]) =>
    repo.person(
      createAccount(db, {
        email: `${name}@example.test`,
        password: "Test-password-123",
        name,
        roles,
      }),
    );
  return {
    db,
    repo,
    a: make("a", ["student"]),
    b: make("b", ["student"]),
    teacher: make("teacher", ["teacher"]),
    reviewer: make("reviewer", ["reviewer"]),
  };
}
const period = (hours: number) => ({
  startAt: new Date(Date.now() + hours * 3600000).toISOString(),
  endAt: new Date(Date.now() + (hours + 1) * 3600000).toISOString(),
  capacity: 1,
  location: "交流室",
});
describe("数据库与真实账号边界", () => {
  it("密码哈希、会话校验和注销后的失效", () => {
    const { db, a } = setup();
    expect(
      String(
        db.prepare("SELECT password_hash FROM accounts WHERE id=?").get(a.id)
          ?.password_hash,
      ),
    ).not.toContain("Test-password");
    expect(() => login(db, a.email, "wrong")).toThrow("邮箱或密码错误");
    const session = login(db, a.email, "Test-password-123");
    expect(authenticate(db, session.token).id).toBe(a.id);
    db.exec("DELETE FROM sessions");
    expect(() => authenticate(db, session.token)).toThrow("登录已过期");
  });
  it("验证码单次使用，注册不自动赋予学校角色", () => {
    const { db } = setup();
    issueCode(db, "new@example.test");
    const code = String(
      db
        .prepare("SELECT body FROM mail_outbox WHERE recipient=?")
        .get("new@example.test")?.body,
    ).match(/\d{6}/)![0];
    register(db, {
      email: "new@example.test",
      code,
      password: "Test-password-123",
    });
    expect(
      login(db, "new@example.test", "Test-password-123").account.roles,
    ).toEqual([]);
    expect(() =>
      register(db, {
        email: "new@example.test",
        code,
        password: "Test-password-123",
      }),
    ).toThrow("验证码已失效");
  });
  it("失败事务不留下业务对象和通知", () => {
    const { db, repo, a } = setup();
    expect(() =>
      transaction(db, () => {
        repo.create("post", a.id, {});
        repo.notify([a.id], null, "test", "test");
        throw new Error("stop");
      }),
    ).toThrow("stop");
    expect(repo.all("post")).toEqual([]);
    expect(
      db.prepare("SELECT count(*) AS count FROM notifications").get()?.count,
    ).toBe(0);
  });
});
describe("跨账号完整状态操作", () => {
  it("帖子须审核，禁言不能发帖，学生不能审核", () => {
    const { repo, a, reviewer } = setup();
    const post = communityCommand(repo, a, "post.create", {
      title: "测试",
      body: "正文",
      board: "校园",
    })!;
    expect(post.data.status).toBe("pending");
    expect(() =>
      communityCommand(repo, a, "content.review", {
        id: post.id,
        status: "visible",
        reason: "核对",
      }),
    ).toThrow("审核职责");
    expect(
      communityCommand(repo, reviewer, "content.review", {
        id: post.id,
        status: "visible",
        reason: "核对通过",
      })?.data.status,
    ).toBe("visible");
    expect(() =>
      communityCommand(repo, { ...a, status: "muted" }, "post.create", {
        title: "test",
        body: "test",
        board: "校园",
      }),
    ).toThrow("不能发帖");
  });
  it("同意时重新复核容量，重复处理不增加成员，结束队伍禁止发消息", () => {
    const { repo, a, b, reviewer } = setup();
    const c = repo.person(
      createAccount(repo.db, {
        email: "c@example.test",
        password: "Test-password-123",
        name: "c",
        roles: ["student"],
      }),
    );
    const room = communityCommand(repo, a, "room.create", {
      type: "study",
      title: "读书",
      body: "讨论",
      time: "周六",
      place: "图书馆",
      capacity: 2,
    })!;
    const first = communityCommand(repo, b, "room.apply", { id: room.id })!;
    const second = communityCommand(repo, c, "room.apply", { id: room.id })!;
    communityCommand(repo, a, "room.decide", { id: first.id, accept: true });
    expect(() =>
      communityCommand(repo, a, "room.decide", { id: second.id, accept: true }),
    ).toThrow("队伍已满");
    expect(() =>
      communityCommand(repo, a, "room.decide", { id: first.id, accept: true }),
    ).toThrow("申请已处理");
    expect(() =>
      communityCommand(repo, reviewer, "message.send", {
        roomId: room.id,
        body: "私聊",
      }),
    ).toThrow();
    communityCommand(repo, a, "room.finish", { id: room.id });
    expect(() =>
      communityCommand(repo, b, "message.send", {
        roomId: room.id,
        body: "你好",
      }),
    ).toThrow("聊天权限");
  });
  it("预约竞争、改期双占用、仅学生确认以及取消释放", () => {
    const { repo, a, b, teacher } = setup();
    const old = coffeeCommand(repo, teacher, "coffee.slot.create", period(24))!;
    const next = coffeeCommand(
      repo,
      teacher,
      "coffee.slot.create",
      period(26),
    )!;
    const booking = coffeeCommand(repo, a, "coffee.book", {
      slotId: old.id,
      topic: "选课交流",
    })!;
    expect(() =>
      coffeeCommand(repo, b, "coffee.book", { slotId: old.id, topic: "问题" }),
    ).toThrow("时段已满");
    coffeeCommand(repo, teacher, "coffee.move", {
      id: booking.id,
      slotId: next.id,
      reason: "会议冲突",
    });
    expect([occupied(repo, old.id), occupied(repo, next.id)]).toEqual([1, 1]);
    expect(() =>
      coffeeCommand(repo, teacher, "coffee.answer", {
        id: booking.id,
        accept: true,
      }),
    ).toThrow("学生身份");
    expect(() =>
      coffeeCommand(repo, b, "coffee.answer", { id: booking.id, accept: true }),
    ).toThrow("本人记录");
    coffeeCommand(repo, a, "coffee.answer", { id: booking.id, accept: true });
    expect([occupied(repo, old.id), occupied(repo, next.id)]).toEqual([0, 1]);
    coffeeCommand(repo, a, "coffee.cancel", { id: booking.id });
    expect(occupied(repo, next.id)).toBe(0);
    expect(() =>
      coffeeCommand(repo, a, "coffee.cancel", { id: booking.id }),
    ).toThrow("已取消");
  });
});
