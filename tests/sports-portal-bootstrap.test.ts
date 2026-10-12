import { expect, it } from "vitest";
import { openDatabase } from "../server/database";
import { createAccount, login } from "../server/auth";
import { Repository } from "../server/repository";
import {
  portalAnnouncement,
  portalEnduranceTables,
  portalHealth,
} from "../server/sports/portal-bootstrap";

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
