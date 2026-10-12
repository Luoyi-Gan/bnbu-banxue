import { expect, it } from "vitest";
import { createAccount, login } from "../backend/src/auth";
import { openDatabase } from "../backend/src/database";
import { Repository } from "../backend/src/repository";
import { createApiServer } from "../backend/src/main";

it("原版通知分页与已读复用共享数据，不能读取或处理他人通知", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (name: string) => {
      const id = createAccount(db, {
        name,
        email: name + "@example.test",
        password: "Password-123",
        roles: [],
      });
      repo.create("sportsIdentity", id, {
        role: "teacher",
        status: "verified",
      });
      return login(db, name + "@example.test", "Password-123");
    };
    const own = make("notice-own"),
      other = make("notice-other");
    const course = repo.create("sportsCourse", own.account.id, {
      privateNote: "SECRET",
    });
    repo.notify(
      [own.account.id],
      course.id,
      "sports.course.deadline",
      "课程提醒一",
    );
    repo.notify(
      [own.account.id],
      course.id,
      "sports.course.deadline",
      "课程提醒二",
    );
    repo.notify([own.account.id], null, "community.post", "伴学社区通知");
    repo.notify(
      [other.account.id],
      course.id,
      "sports.course.deadline",
      "OTHER_SECRET",
    );
    const foreignId = String(
      db
        .prepare("SELECT id FROM notifications WHERE recipient_id=?")
        .get(other.account.id)!.id,
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1/notifications`;
    const headers = { Cookie: `bnbu_session=${own.token}` };
    const get = (query = "") => fetch(base + query, { headers });
    const first = await (await get("?limit=1&unreadOnly=true")).json();
    expect(first.data).toHaveLength(1);
    expect(first.meta.pagination.hasMore).toBe(true);
    expect(first.data[0]).toMatchObject({
      recipientUserId: own.account.id,
      readAt: null,
      targetType: "CLASS_SECTION",
      targetId: course.id,
    });
    expect(JSON.stringify(first)).not.toContain("SECRET");
    const second = await (
      await get("?limit=1&cursor=" + first.meta.pagination.nextCursor)
    ).json();
    expect(second.data[0].id).not.toBe(first.data[0].id);
    expect(second.meta.pagination.hasMore).toBe(false);
    expect((await get("?cursor=" + foreignId)).status).toBe(409);
    expect((await get("?unreadOnly=invalid")).status).toBe(400);
    const mark = (id: string, key: string) =>
      fetch(base + "/" + id + "/read", {
        method: "POST",
        headers: {
          ...headers,
          Origin: "http://127.0.0.1:4186",
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: "{}",
      });
    expect((await mark(foreignId, "foreign-notice")).status).toBe(404);
    const saved = await (await mark(first.data[0].id, "read-my-notice")).json();
    expect(saved.data.readAt).toBeTruthy();
    expect(
      (await (await mark(first.data[0].id, "read-my-notice")).json()).data
        .readAt,
    ).toBe(saved.data.readAt);
    expect((await (await get("?unreadOnly=true")).json()).data).toHaveLength(1);
    expect(
      db.prepare("SELECT read_at FROM notifications WHERE id=?").get(foreignId)
        ?.read_at,
    ).toBeNull();
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await get()).status).toBe(503);
    expect((await mark(first.data[0].id, "read-my-notice")).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
