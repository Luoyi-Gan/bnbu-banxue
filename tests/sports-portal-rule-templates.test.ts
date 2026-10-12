import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { createApiServer } from "../server/main";

it("原版规则模板按持久发布序号分页，教师可读固定目标但学生不能访问", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (role: string) => {
      const email = role + "@example.test",
        password = "Password-123";
      const id = createAccount(db, {
        name: role,
        email,
        password,
        roles: role === "admin" ? ["superadmin"] : [],
      });
      repo.create("sportsIdentity", id, { role, status: "verified" });
      return login(db, email, password);
    };
    const admin = make("admin"),
      teacher = make("teacher"),
      student = make("student");
    for (let i = 0; i < 103; i++)
      execute(
        db,
        admin.token,
        "sports.template.publish",
        { name: "模板" + i },
        "publish-" + i,
      );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const get = (path: string, token = teacher.token) =>
      fetch(`http://127.0.0.1:${address.port}/api/v1${path}`, {
        headers: { Cookie: `bnbu_session=${token}` },
      });
    const first = (await (await get("/rule-templates?limit=100")).json()).data;
    expect(first.items).toHaveLength(100);
    expect(first.nextBeforeVersion).toBe(4);
    expect(first.items[0]).toMatchObject({
      version: 103,
      displayName: "模板102",
      rules: {
        totalTargetMinutes: 1200,
        minimumMinutesOptions: [30, 45, 60],
        weeklyLimitOptions: [2, 3, 4],
      },
    });
    execute(
      db,
      admin.token,
      "sports.template.publish",
      { name: "翻页期间发布" },
      "new-publication",
    );
    const last = (
      await (await get("/rule-templates?limit=100&beforeVersion=4")).json()
    ).data;
    expect(last.items.map((item: { version: number }) => item.version)).toEqual(
      [3, 2, 1],
    );
    expect(last.nextBeforeVersion).toBeNull();
    expect(
      new Set([...first.items, ...last.items].map((item) => item.id)).size,
    ).toBe(103);
    expect((await (await get("/admin/exercise-goal")).json()).data).toEqual({
      totalTargetMinutes: 1200,
      version: 1,
    });
    expect((await get("/rule-templates", student.token)).status).toBe(403);
    expect((await get("/admin/exercise-goal", student.token)).status).toBe(403);
    expect((await get("/rule-templates?beforeVersion=NaN")).status).toBe(400);
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await get("/rule-templates")).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("旧模板迁移只补充发布序号，重复打开不改课程引用或模板版本", () => {
  const dir = mkdtempSync(join(tmpdir(), "bnbu-template-migration-")),
    file = join(dir, "data.sqlite");
  let db = openDatabase(file);
  try {
    const repo = new Repository(db);
    const template = repo.create("sportsTemplate", null, {
      name: "旧模板",
      status: "published",
      totalTarget: 1200,
    });
    const course = repo.create("sportsCourse", null, {
      templateId: template.id,
      templateVersion: template.version,
    });
    db.close();
    db = openDatabase(file);
    const row = db
      .prepare("SELECT * FROM sports_template_publications WHERE template_id=?")
      .get(template.id);
    expect(row?.sequence).toBe(1);
    expect(new Repository(db).get(template.id)).toEqual(template);
    expect(new Repository(db).get(course.id)).toEqual(course);
    db.close();
    db = openDatabase(file);
    expect(
      db.prepare("SELECT * FROM sports_template_publications").all(),
    ).toEqual([row]);
    expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
