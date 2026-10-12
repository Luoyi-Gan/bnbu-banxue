import { expect, it } from "vitest";
import { openDatabase } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { createApiServer } from "../backend/src/main";
import {
  portalAnnouncement,
  portalEnduranceTables,
  portalHealth,
} from "../backend/src/sports/portal-bootstrap";

it("原版规则增改删实际写入共享表，保护版本、表归属、连续区间与幂等", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const id = createAccount(db, {
      email: "rule-editor@example.test",
      password: "Password-123",
      name: "规则管理员",
      roles: [],
    });
    const identity = repo.create("sportsIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: ["GLOBAL_RULES"],
    });
    const token = login(db, "rule-editor@example.test", "Password-123").token;
    const table = portalEnduranceTables(
      repo,
      login(db, "rule-editor@example.test", "Password-123").account,
    )[0];
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1/admin/endurance-tables/rules`;
    const post = (suffix: string, body: unknown, key: string) =>
      fetch(base + suffix, {
        method: "POST",
        headers: {
          Cookie: `bnbu_session=${token}`,
          Origin: "http://127.0.0.1:4186",
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(body),
      });
    const band = table.bands[0],
      suffix = "/" + encodeURIComponent(band.id);
    const input = {
      gender: table.gender,
      gradeGroup: table.gradeGroup,
      runType: table.runType,
      expectedVersion: table.version,
      minSeconds: band.minSeconds,
      maxSeconds: band.maxSeconds,
      score: band.score,
      tier: band.tier,
      note: "已人工核对",
    };
    expect(
      (await post(suffix, { ...input, minSeconds: 1 }, "invalid-gap")).status,
    ).toBe(400);
    const updated = await post(suffix, input, "edit-rule-once");
    expect(updated.status).toBe(200);
    const saved = (await updated.json()).data;
    expect(saved.bands[0].note).toBe("已人工核对");
    expect(saved.version).toBe(table.version + 1);
    expect((await post(suffix, input, "edit-rule-once")).status).toBe(200);
    expect(repo.all("sportsConversionHistory")).toHaveLength(1);
    expect((await post(suffix, input, "edit-rule-stale")).status).toBe(409);
    expect(
      (
        await post(
          suffix,
          {
            ...input,
            gender: table.gender === "male" ? "female" : "male",
            runType: table.runType === "1000m" ? "800m" : "1000m",
          },
          "wrong-table",
        )
      ).status,
    ).toBe(409);
    const addedResponse = await post(
      "",
      {
        ...input,
        expectedVersion: saved.version,
        minSeconds: 601,
        maxSeconds: 605,
        score: 0,
        tier: "fail",
      },
      "add-last-band",
    );
    expect(addedResponse.status).toBe(200);
    const added = (await addedResponse.json()).data;
    const last = added.bands.at(-1);
    expect(last.minSeconds).toBe(601);
    const removed = await post(
      "/" + encodeURIComponent(last.id) + "/delete",
      { ...input, expectedVersion: added.version },
      "delete-last-band",
    );
    expect(removed.status).toBe(200);
    expect((await removed.json()).data.bands).toHaveLength(table.bands.length);
    repo.save(identity, { permissions: [] });
    expect((await post(suffix, input, "edit-rule-once")).status).toBe(403);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});

it("原版初始化读取共享规则和实际存储状态，受权限与维护限制", () => {
  const db = openDatabase(":memory:");
  try {
    const repo = new Repository(db);
    const id = createAccount(db, {
      email: "bootstrap@example.test",
      password: "Password-123",
      name: "管理员",
      roles: [],
    });
    const actor = login(db, "bootstrap@example.test", "Password-123").account;
    let identity = repo.create("sportsIdentity", id, {
      role: "admin",
      status: "verified",
      permissions: ["GLOBAL_RULES"],
    });
    const tables = portalEnduranceTables(repo, actor);
    expect(tables).toHaveLength(4);
    const bands = tables.flatMap((t) => t.bands);
    expect(bands).toHaveLength(404);
    expect(new Set(bands.map((b) => b.id)).size).toBe(404);
    const original = repo.all("sportsConversionTable")[0];
    repo.save(original, {
      rows: [
        {
          id: "actual",
          min: 0,
          max: 600,
          score: 99,
          grade: "EXCELLENT",
          note: "已修改",
        },
      ],
    });
    expect(
      portalEnduranceTables(repo, actor).find((t) => t.id === original.id)
        ?.bands[0],
    ).toMatchObject({ score: 99, note: "已修改" });
    expect(portalHealth(repo, actor)).toMatchObject({
      status: "DEGRADED",
      dependencies: {
        database: { status: "UP" },
        notificationQueue: { status: "NOT_CONFIGURED" },
        mediaStorage: { status: "UP", backend: "sqlite" },
      },
    });
    db.exec("DROP TABLE sports_media_blobs");
    expect(portalHealth(repo, actor)).toMatchObject({
      status: "DOWN",
      dependencies: { mediaStorage: { status: "DOWN" } },
    });
    identity = repo.save(identity, { permissions: [] });
    expect(() => portalEnduranceTables(repo, actor)).toThrow();
    repo.save(identity, { mustChangePassword: true });
    expect(() => portalHealth(repo, actor)).toThrow(/初始密码/);
  } finally {
    db.close();
  }
});

it("公开维护公告保留双语与恢复时间，不公开操作人和内部原因", () => {
  const db = openDatabase(":memory:");
  try {
    const repo = new Repository(db);
    expect(portalAnnouncement(repo)).toMatchObject({
      mode: "NORMAL",
      announcement: null,
    });
    const recovery = Date.now() + 60000;
    repo.create("sportsSystem", null, {
      mode: "MAINTENANCE",
      reason: "SECRET_REASON",
      changedBy: "SECRET_ACTOR",
      announcement: {
        titleZh: "维护",
        titleEn: "Maintenance",
        bodyZh: "稍后恢复",
        bodyEn: "Back soon",
        estimatedRecoveryAt: recovery,
      },
    });
    expect(portalAnnouncement(repo)).toMatchObject({
      mode: "MAINTENANCE",
      policyVersion: 1,
      announcement: {
        titleZh: "维护",
        estimatedRecoveryAt: new Date(recovery).toISOString(),
      },
    });
    expect(JSON.stringify(portalAnnouncement(repo))).not.toContain("SECRET");
  } finally {
    db.close();
  }
});
