import { expect, it } from "vitest";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { createApiServer } from "../server/main";

it("原版维护切换、公告及历史使用共享暂停事实，重复请求不重复通知", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const id = createAccount(db, {
      name: "系统管理员",
      email: "mode-portal@example.test",
      password: "Password-123",
      roles: [],
    });
    const identity = repo.create("sportsIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: ["SYSTEM_MODE", "GLOBAL_RULES"],
    });
    const token = login(db, "mode-portal@example.test", "Password-123").token;
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    const headers = { Cookie: `bnbu_session=${token}` };
    const read = (path: string) => fetch(base + path, { headers });
    const change = (body: unknown, key: string) =>
      fetch(base + "/system-mode/changes", {
        method: "POST",
        headers: {
          ...headers,
          Origin: "http://127.0.0.1:4186",
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(body),
      });
    expect(await (await read("/system-mode")).json()).toMatchObject({
      data: { mode: "NORMAL", policyVersion: 0 },
    });
    const input = {
      mode: "MAINTENANCE",
      reason: "升级",
      expectedVersion: 0,
      titleZh: "维护",
      titleEn: "Maintenance",
      bodyZh: "稍后恢复",
      bodyEn: "Back soon",
      estimatedRecoveryAt: new Date(Date.now() + 600000).toISOString(),
    };
    expect(
      (await change({ ...input, bodyEn: "" }, "missing-english")).status,
    ).toBe(400);
    expect(repo.all("sportsPause")).toHaveLength(0);
    const response = await change(input, "maintenance-once");
    expect(response.status).toBe(200);
    const maintained = (await response.json()).data;
    expect(maintained).toMatchObject({
      mode: "MAINTENANCE",
      announcement: { titleEn: "Maintenance" },
    });
    expect((await change(input, "maintenance-once")).status).toBe(200);
    expect(repo.all("sportsPause")).toHaveLength(1);
    expect(db.prepare("SELECT count(*) AS n FROM notifications").get()?.n).toBe(
      1,
    );
    expect((await read("/admin/endurance-tables")).status).toBe(503);
    const history = (await (await read("/system-mode/history")).json()).data;
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      version: maintained.policyVersion,
      facts: { from: "NORMAL", to: "MAINTENANCE", announcementPublished: true },
    });
    expect(
      (
        await (
          await read(
            "/system-mode/history?beforeVersion=" + maintained.policyVersion,
          )
        ).json()
      ).data,
    ).toEqual([]);
    const restored = await change(
      {
        mode: "NORMAL",
        reason: "完成",
        expectedVersion: maintained.policyVersion,
      },
      "restore-once",
    );
    expect(restored.status).toBe(200);
    expect((await restored.json()).data).toMatchObject({
      mode: "NORMAL",
      announcement: null,
    });
    expect(repo.all("sportsPause")[0].data.endAt).not.toBeNull();
    expect((await read("/admin/endurance-tables")).status).toBe(200);
    repo.save(identity, { permissions: [] });
    expect((await read("/system-mode/history")).status).toBe(403);
    expect((await change(input, "maintenance-once")).status).toBe(403);
    expect((await fetch(base + "/system-mode/announcement")).status).toBe(200);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
