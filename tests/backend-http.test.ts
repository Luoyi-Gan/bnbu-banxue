import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtempSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase, type Database } from "../server/database";
import { createAccount, login } from "../server/auth";
import { createApiServer } from "../server/main";
import { execute, snapshot } from "../server/commands";
import { Repository } from "../server/repository";
import { communityView } from "../server/community-view";

const resources: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const close of resources.splice(0).reverse()) await close();
});
function setup(db: Database = openDatabase(":memory:")) {
  resources.push(() => db.close());
  const repo = new Repository(db);
  const make = (name: string, roles: string[]) => {
    const id = createAccount(db, {
      email: `${name}@example.test`,
      name,
      password: "Acceptance-123",
      roles,
    });
    return { ...login(db, `${name}@example.test`, "Acceptance-123"), id };
  };
  const a = make("student-a", ["student"]),
    b = make("student-b", ["student"]),
    c = make("student-c", ["student"]),
    teacher = make("teacher", ["teacher"]),
    admin = make("admin", ["superadmin"]),
    reviewer = make("reviewer", ["reviewer"]),
    operator = make("operator", ["operator"]);
  const run = (
    who: typeof a,
    action: string,
    input: Record<string, unknown>,
    key = randomUUID(),
  ) => execute(db, who.token, action, input, key) as { id: string };
  return { db, repo, a, b, c, teacher, admin, reviewer, operator, run };
}
describe("API、持久化和跨角色联动", () => {
  it("关系历史只返回本人操作，下架对象不泄露旧标题", () => {
    const {a,b,run,repo,db} = setup();
    const event = repo.create("activity", b.id, {title:"私有后续标题",status:"published",startAt:new Date(Date.now()+86400000).toISOString()});
    run(a,"relation.set",{id:event.id,kind:"participate",enabled:true});
    run(a,"relation.set",{id:event.id,kind:"participate",enabled:true});
    run(a,"relation.set",{id:event.id,kind:"participate",enabled:false});
    const history = snapshot(db,a.account).relationshipHistory;
    expect(history).toHaveLength(1);
    expect(history[0].changes.map(c=>c.active)).toEqual([true,false]);
    expect(history[0].entity).toMatchObject({active:false,title:"私有后续标题"});
    expect(snapshot(db,b.account).relationshipHistory).toEqual([]);
    repo.save(repo.get(event.id),{status:"hidden"});
    expect(snapshot(db,a.account).relationshipHistory[0].entity).toMatchObject({title:"原对象当前不可见",active:false,path:"/v2/me"});
  });
  it("校友方向只接受升学或就业，非法输入不创建或覆盖业务记录", () => {
    const { a, admin, run, db, repo } = setup();
    const input = { major: "计算机", graduationYear: 2024, city: "珠海",
      direction: "就业", experience: "工作", topics: "实习", bio: "介绍", evidence: "测试核验说明" };
    for (const direction of [undefined, "其他", "", 1]) {
      expect(() => run(a, "alumni.apply", { ...input, direction })).toThrow();
      expect(snapshot(db, admin.account).alumni.profiles).toHaveLength(0);
    }
    run(a, "alumni.apply", input);
    const profile = snapshot(db, admin.account).alumni.profiles[0];
    run(admin, "alumni.review", { id: profile.id, approve: true });
    const before = snapshot(db, a.account).alumni;
    for (const direction of [undefined, "其他", "", 1]) {
      expect(() => run(a, "alumni.profile", { ...input, direction, accepting: true })).toThrow();
      expect(() => run(a, "alumni.post", { direction, title: "经验", body: "分享内容" })).toThrow();
      expect(snapshot(db, a.account).alumni).toEqual(before);
      expect(repo.all("post")).toHaveLength(0);
    }
    run(a, "alumni.profile", { ...input, direction: "升学", accepting: true });
    expect(snapshot(db, a.account).alumni.profiles[0].direction).toBe("升学");
    for (const direction of ["升学", "就业"]) {
      const post = run(a, "alumni.post", { direction, title: "经验", body: "分享内容" });
      expect(repo.get(post.id).data.board).toBe(`校友${direction}`);
      expect(communityView(db, a.token).posts.find(p => p.id === post.id))
        .toMatchObject({ alumniId: profile.id, status: "pending" });
      expect(communityView(db, admin.token).posts.find(p => p.id === post.id)).toBeUndefined();
    }
  });
  it("举报队伍不向非成员泄露历史成员名单，审核证据保持完整", () => {
    const { a, b, c, reviewer, operator, run, db, repo } = setup();
    const room = run(a, "room.create", {
      type: "study", title: "公开队伍", body: "组队学习",
      time: "周末", place: "图书馆", capacity: 3,
    });
    const application = run(b, "room.apply", { id: room.id });
    run(a, "room.decide", { id: application.id, accept: true });
    const report = run(c, "report.create", { id: room.id, reason: "核对信息" });
    const stored = repo.get(report.id);
    expect(stored.data.snapshot).toMatchObject({ members: [a.id, b.id] });
    const read = (who: typeof a) => snapshot(db, who.account).entities
      .find(e => e.id === report.id);
    expect(read(c)?.data.snapshot).not.toHaveProperty("members");
    expect(read(c)?.data.snapshot).toMatchObject({ title: "公开队伍" });
    expect(read(operator)).toBeUndefined();
    expect(read(reviewer)?.data.snapshot).toMatchObject({ members: [a.id, b.id] });
    run(reviewer, "room.moderate", {
      id: room.id, decision: "remove", memberId: b.id, reason: "成员移除",
    });
    expect(read(c)?.data.snapshot).not.toHaveProperty("members");
    expect(repo.get(report.id)).toEqual(stored);
    const history = snapshot(db,b.account).relationshipHistory.find(h=>h.entity.sourceId===room.id);
    expect(history?.changes.map(c=>c.status)).toEqual(["入队申请已通过","已被移出队伍"]);
    expect(history?.entity.active).toBe(false);
    expect(JSON.stringify(history)).not.toContain(a.id);
    expect(snapshot(db,c.account).relationshipHistory).toEqual([]);
  });
  it("活动资格检查所有本人认证，旧驳回和撤销记录不遮挡有效认证", () => {
    const { a, b, admin, run, repo } = setup();
    const rejected = run(a, "certification.apply", {
      kind: "club", organization: "旧社团", note: "申请",
    });
    run(admin, "certification.review", {
      id: rejected.id, approve: false, reason: "材料不符",
    });
    const valid = run(a, "certification.apply", {
      kind: "club", organization: "有效社团", note: "申请",
    });
    run(admin, "certification.review", { id: valid.id, approve: true });
    const input = {
      title: "社团活动", description: "活动说明", location: "图书馆",
      startAt: new Date(Date.now() + 86400000).toISOString(), capacity: 20,
    };
    expect(() => run(b, "activity.create", input)).toThrow("已认证");
    const event = run(a, "activity.create", input);
    run(a, "activity.visibility", { id: event.id, publish: false });
    run(a, "activity.visibility", { id: event.id, publish: true });
    expect(repo.get(event.id).data.status).toBe("published");
    run(admin, "certification.review", {
      id: valid.id, approve: false, reason: "资格撤销",
    });
    expect(() => run(a, "activity.create", input)).toThrow("已认证");
    run(a, "activity.visibility", { id: event.id, publish: false });
    expect(() => run(a, "activity.visibility", { id: event.id, publish: true }))
      .toThrow("恢复活动");
    expect(repo.get(event.id).data.status).toBe("draft");
    const renewed = run(a, "certification.apply", {
      kind: "club", organization: "有效社团", note: "重新核验",
    });
    run(admin, "certification.review", { id: renewed.id, approve: true });
    run(a, "activity.visibility", { id: event.id, publish: true });
    expect(repo.get(event.id).data.status).toBe("published");
    expect(repo.get(valid.id).data.status).toBe("rejected");
  });
  it("申请人被封禁后校友仍可拒绝，但不能确认新预约", () => {
    const { a, b, c, admin, db, run } = setup();
    run(a, "alumni.apply", {
      major: "计算机", graduationYear: 2024, city: "珠海",
      direction: "就业", experience: "工作", topics: "实习",
      bio: "", evidence: "本地验收说明",
    });
    const profile = snapshot(db, admin.account).alumni.profiles[0];
    run(admin, "alumni.review", { id: profile.id, approve: true });
    run(a, "alumni.slot.create", {
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
      location: "图书馆",
    });
    const slot = snapshot(db, a.account).alumni.slots[0];
    run(b, "alumni.request", { slotId: slot.id, question: "就业问题" });
    const booking = snapshot(db, b.account).alumni.bookings[0];
    db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(b.id);
    expect(() => run(a, "alumni.decide", { id: booking.id, accept: true }))
      .toThrow("申请人当前无法预约");
    expect(() => run(c, "alumni.decide", {
      id: booking.id, accept: false, reason: "越权拒绝",
    })).toThrow();
    expect(() => run(a, "alumni.decide", { id: booking.id, accept: false }))
      .toThrow();
    expect(snapshot(db, a.account).alumni.bookings[0].status).toBe("pending");
    const input = { id: booking.id, accept: false, reason: "当前无法安排交流" };
    const key = randomUUID();
    run(a, "alumni.decide", input, key);
    const notices = db.prepare("SELECT COUNT(*) AS n FROM notifications").get()!.n;
    run(a, "alumni.decide", input, key);
    expect(db.prepare("SELECT COUNT(*) AS n FROM notifications").get()!.n).toBe(notices);
    expect(snapshot(db, a.account).alumni.bookings[0]).toMatchObject({
      id: booking.id, status: "rejected", reason: input.reason,
    });
    expect(db.prepare("SELECT body FROM notifications WHERE recipient_id=? AND event=?")
      .all(b.id, "alumni.decide")).toHaveLength(1);
    run(c, "alumni.request", { slotId: slot.id, question: "另一份申请" });
    const next = snapshot(db, c.account).alumni.bookings[0];
    run(a, "alumni.decide", { id: next.id, accept: true });
    expect(snapshot(db, c.account).alumni.bookings[0].status).toBe("confirmed");
  });
  it("原版社区投影用账号隔离同名作者，点赞共享而收藏只归本人", async () => {
    const f = setup();
    f.db
      .prepare("UPDATE accounts SET name=? WHERE id IN (?,?)")
      .run("同名同学", f.a.id, f.b.id);
    const post = f.run(f.a, "post.create", {
      title: "原版社区联调",
      body: "待审核内容",
      board: "校园",
      images: [],
    });
    const server = createApiServer(f.db);
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    resources.push(
      () =>
        new Promise<void>((done) => {
          server.closeAllConnections();
          server.close(() => done());
        }),
    );
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/community`;
    const read = async (who: typeof f.a) => {
      const response = await fetch(url, {
        headers: { Cookie: `bnbu_session=${who.token}` },
      });
      expect(response.status).toBe(200);
      return response.json();
    };
    expect((await fetch(url)).status).toBe(401);
    expect((await read(f.a)).posts[0]).toMatchObject({
      id: post.id,
      ownerId: f.a.id,
      author: "同名同学",
      status: "pending",
      likes: 0,
    });
    expect((await read(f.b)).posts).toEqual([]);
    f.run(f.reviewer, "content.review", {
      id: post.id,
      status: "visible",
      reason: "符合社区要求",
    });
    f.run(f.b, "relation.set", { id: post.id, kind: "like", enabled: true });
    f.run(f.b, "relation.set", { id: post.id, kind: "save", enabled: true });
    f.run(f.b, "comment.create", { postId: post.id, body: "自己的待审核评论" });
    const author = await read(f.a),
      reader = await read(f.b);
    expect(author.posts[0].likes).toBe(1);
    expect(author.posts[0].comments).toEqual([]);
    expect(author.savedPosts).toEqual([]);
    expect(reader.savedPosts).toEqual([post.id]);
    expect(reader.posts[0].comments).toHaveLength(1);
    f.run(f.reviewer, "content.review", {
      id: post.id,
      status: "hidden",
      reason: "下架核对",
    });
    expect((await read(f.b)).posts).toEqual([]);
    expect((await read(f.b)).savedPosts).toEqual([]);
  });
  it("实际 HTTP 登录 cookie、来源校验、错误响应和私有接口认证", async () => {
    const { db, a } = setup(),
      server = createApiServer(db, { localOutbox: true });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    resources.push(
      () =>
        new Promise<void>((done) => {
          server.closeAllConnections();
          server.close(() => done());
        }),
    );
    const address = server.address() as { port: number },
      base = `http://127.0.0.1:${address.port}`;
    expect((await fetch(`${base}/api/workspace`)).status).toBe(401);
    const loggedIn = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: a.account.email,
        password: "Acceptance-123",
      }),
    });
    expect(loggedIn.status).toBe(200);
    const cookie = loggedIn.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    const response = await fetch(`${base}/api/workspace`, {
      headers: { Cookie: cookie },
    });
    expect((await response.json()).account.id).toBe(a.id);
    const rejected = await fetch(`${base}/api/commands`, {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: "https://example.org",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    expect(rejected.status).toBe(403);
    expect(
      (await fetch(`${base}/api/v1/me`, { headers: { Cookie: cookie } }))
        .status,
    ).toBe(403); // A companion account without sports identity cannot enter the original portal.
  });
  it("命令幂等与参数冲突，事务外客户端不能伪造作者或审核状态", () => {
    const { a, b, run, repo } = setup(),
      key = randomUUID();
    const input = {
      title: "真实帖子",
      body: "内容",
      board: "校园",
      ownerId: b.id,
      status: "visible",
    };
    const first = run(a, "post.create", input, key),
      duplicate = run(a, "post.create", input, key);
    expect(duplicate).toEqual(first);
    expect(repo.all("post")).toHaveLength(1);
    expect(repo.get(first.id).ownerId).toBe(a.id);
    expect(repo.get(first.id).data.status).toBe("pending");
    expect(() =>
      run(a, "post.create", { ...input, title: "替换" }, key),
    ).toThrow("不同操作");
  });
  it("审核员不能管理账号；唯一超级管理员受保护；封禁与禁言即时执行", () => {
    const { a, reviewer, admin, run, repo } = setup();
    expect(() =>
      run(reviewer, "account.update", {
        id: a.id,
        status: "banned",
        roles: ["student"],
        reason: "测试",
      }),
    ).toThrow("超级管理员");
    expect(() =>
      run(admin, "account.update", {
        id: admin.id,
        status: "active",
        roles: ["student"],
        reason: "降级",
      }),
    ).toThrow("唯一有效");
    run(admin, "account.update", {
      id: a.id,
      status: "muted",
      roles: ["student"],
      reason: "违规",
    });
    expect(() =>
      run(a, "post.create", { title: "a", body: "a", board: "a" }),
    ).toThrow("不能发帖");
    run(admin, "account.update", {
      id: a.id,
      status: "banned",
      roles: ["student"],
      reason: "严重违规",
    });
    expect(() =>
      run(a, "profile.save", { nickname: "new", avatar: "" }),
    ).toThrow("封禁");
    expect(repo.person(a.id).status).toBe("banned");
  });
  it("待审、隐藏、邮件原文、私人会话和通知按账号过滤", () => {
    const { db, repo, a, b, admin, run } = setup();
    const post = run(a, "post.create", {
      title: "私有待审",
      body: "秘密草稿",
      board: "校园",
    });
    expect(snapshot(db, b.account).entities.some((e) => e.id === post.id)).toBe(
      false,
    );
    run(admin, "content.review", {
      id: post.id,
      status: "visible",
      reason: "通过",
    });
    run(b, "relation.set", { id: post.id, kind: "save", enabled: true });
    run(admin, "content.review", {
      id: post.id,
      status: "hidden",
      reason: "下架",
    });
    expect(snapshot(db, b.account).entities.some((e) => e.id === post.id)).toBe(
      false,
    );
    const room = run(a, "room.create", {
      title: "小组",
      body: "讨论",
      time: "周日",
      place: "学校",
      type: "study",
      capacity: 3,
    });
    run(a, "message.send", { roomId: room.id, body: "仅成员可见" });
    expect(
      snapshot(db, admin.account).entities.filter((e) => e.kind === "message"),
    ).toEqual([]);
    repo.notify([a.id], null, "private", "通知");
    const notification = snapshot(db, a.account).notifications[0];
    expect(() => run(b, "notification.read", { id: notification.id })).toThrow(
      "通知不存在",
    );
    expect(snapshot(db, b.account).notifications).toEqual([]);
  });
  it("社团认证撤销阻止发起和恢复，旧活动保留归属", () => {
    const { a, admin, run, repo } = setup();
    const certification = run(a, "certification.apply", {
      kind: "club",
      organization: "摄影社",
      note: "成员",
    });
    expect(() => run(a, "activity.create", { title: "活动" })).toThrow(
      "已认证",
    );
    run(admin, "certification.review", { id: certification.id, approve: true });
    const event = run(a, "activity.create", {
      title: "摄影",
      description: "拍照交流",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      location: "学校",
      capacity: 10,
    });
    run(admin, "certification.review", {
      id: certification.id,
      approve: false,
      reason: "成员资格结束",
    });
    run(a, "activity.visibility", { id: event.id, publish: false });
    expect(() =>
      run(a, "activity.visibility", { id: event.id, publish: true }),
    ).toThrow("恢复活动");
    expect(repo.get(event.id).ownerId).toBe(a.id);
  });
  it("校友竞争确认、跨教师交流冲突及撤销认证联动", () => {
    const { a, b, c, teacher, admin, db, run } = setup();
    run(a, "alumni.apply", {
      major: "计算机",
      graduationYear: 2024,
      city: "珠海",
      direction: "就业",
      experience: "工作",
      topics: "实习",
      bio: "",
      evidence: "本地验收说明",
    });
    const profile = snapshot(db, admin.account).alumni.profiles[0];
    run(admin, "alumni.review", { id: profile.id, approve: true });
    const period = {
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
      location: "图书馆",
    };
    run(a, "alumni.slot.create", period);
    const slot = snapshot(db, a.account).alumni.slots[0];
    run(b, "alumni.request", { slotId: slot.id, question: "就业问题" });
    run(c, "alumni.request", { slotId: slot.id, question: "升学问题" });
    const first = snapshot(db, b.account).alumni.bookings[0];
    expect(() =>
      run(admin, "alumni.decide", { id: first.id, accept: true }),
    ).toThrow("学生身份");
    run(a, "alumni.decide", { id: first.id, accept: true });
    expect(snapshot(db, c.account).alumni.slots[0].occupied).toBe(true);
    expect(snapshot(db, c.account).alumni.bookings.some(x => x.id === first.id)).toBe(false);
    expect(snapshot(db, c.account).alumni.bookings[0].status).toBe(
      "unavailable",
    );
    const teacherSlot = run(teacher, "coffee.slot.create", {
      ...period,
      capacity: 2,
    });
    expect(() =>
      run(b, "coffee.book", { slotId: teacherSlot.id, topic: "问题" }),
    ).toThrow("冲突");
    run(admin, "alumni.review", {
      id: profile.id,
      approve: false,
      reason: "核验失效",
    });
    expect(snapshot(db, b.account).alumni.bookings[0].status).toBe("cancelled");
    const history = snapshot(db, b.account).alumni;
    expect(history.slots.find(s => s.id === slot.id)).toMatchObject({ open: false, occupied: false });
    expect(history.profiles.find(p => p.id === profile.id)).toMatchObject({ status: "rejected", evidence: "", reviewNote: "" });
    expect(snapshot(db, teacher.account).alumni.profiles.some(p => p.id === profile.id)).toBe(false);
  });
  it("举报处置、社团入驻、知识反馈共享原记录并定向通知", () => {
    const { a, b, admin, operator, run, repo, db } = setup();
    const club = run(a, "organization.apply", {
      name: "新社团",
      description: "介绍",
      category: "艺术",
      contact: "club@example.test",
    });
    run(admin, "organization.review", { id: club.id, approve: true });
    run(b, "relation.set", { id: club.id, kind: "follow", enabled: true });
    expect(repo.related(b.id, club.id, "follow")).toBe(true);
    const post = run(a, "post.create", {
      title: "帖子",
      body: "正文",
      board: "校园",
    });
    run(admin, "content.review", {
      id: post.id,
      status: "visible",
      reason: "通过",
    });
    const report = run(b, "report.create", { id: post.id, reason: "有问题" });
    run(admin, "report.decide", {
      id: report.id,
      upheld: true,
      reason: "确认问题",
    });
    expect(repo.get(post.id).data.status).toBe("hidden");
    run(operator, "knowledge.save", {
      title: "图书馆",
      body: "以官网时间为准",
      keywords: "图书馆",
      source: "学校官网",
      status: "published",
    });
    const answer = run(b, "knowledge.ask", { question: "图书馆几点开？" });
    const feedback = run(b, "feedback.create", {
      answerId: answer.id,
      reason: "希望补充链接",
    });
    run(operator, "feedback.resolve", {
      id: feedback.id,
      reason: "已记录并核对",
    });
    expect(repo.get(feedback.id).data.status).toBe("resolved");
    expect(snapshot(db, b.account).notifications.length).toBeGreaterThan(0);
  });
  it("关闭和重新打开数据库后，账号及业务记录仍存在", () => {
    const directory = mkdtempSync(join(tmpdir(), "bnbu-acceptance-")),
      path = join(directory, "test.sqlite");
    let db = openDatabase(path);
    createAccount(db, {
      email: "persist@example.test",
      password: "Acceptance-123",
      name: "持久账号",
      roles: ["student"],
    });
    const session = login(db, "persist@example.test", "Acceptance-123");
    const post = execute(
      db,
      session.token,
      "post.create",
      { title: "持久帖子", body: "重启后保留", board: "校园" },
      randomUUID(),
    ) as { id: string };
    db.close();
    db = openDatabase(path);
    expect(new Repository(db).get(post.id).data.body).toBe("重启后保留");
    expect(
      login(db, "persist@example.test", "Acceptance-123").account.name,
    ).toBe("持久账号");
    db.close();
    unlinkSync(path);
    rmdirSync(directory);
  });
});
