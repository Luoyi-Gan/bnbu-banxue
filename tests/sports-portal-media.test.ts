import { expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { createApiServer } from "../server/main";

it("原版证明链接绑定账号和截止时间，读取原图仍重查教师归属与维护状态", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (name: string, role: string) => {
      const id = createAccount(db, {
        name,
        email: name + "@example.test",
        password: "Password-123",
        roles: [],
      });
      repo.create("sportsIdentity", id, { role, status: "verified" });
      return login(db, name + "@example.test", "Password-123");
    };
    const teacher = make("proof-teacher", "teacher"),
      other = make("proof-other", "teacher"),
      student = make("proof-student", "student");
    const course = repo.create("sportsCourse", teacher.account.id, {});
    const bytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK9sAAAAASUVORK5CYII=",
      "base64",
    );
    const sha = createHash("sha256").update(bytes).digest("hex");
    db.prepare(
      "INSERT INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
    ).run(sha, bytes, new Date().toISOString());
    const asset = repo.create("sportsApplicationAsset", student.account.id, {
      courseId: course.id,
      boundId: "submitted-proof",
      sha256: sha,
      mime: "image/png",
    });
    const draft = repo.create("sportsApplicationAsset", student.account.id, {
      courseId: course.id,
      sha256: sha,
      mime: "image/png",
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("listener");
    const base = `http://127.0.0.1:${address.port}`;
    const access = (id: string, token = teacher.token) =>
      fetch(base + `/api/v1/media/${id}/access-url`, {
        method: "POST",
        headers: {
          Cookie: `bnbu_session=${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purpose: "VIEW_ORIGINAL" }),
      });
    const read = (url: string, token = teacher.token) =>
      fetch(base + url, { headers: { Cookie: `bnbu_session=${token}` } });
    expect((await access(draft.id)).status).toBe(403);
    expect((await access(asset.id, other.token)).status).toBe(403);
    const response = await access(asset.id);
    expect(response.status).toBe(200);
    const link = (await response.json()).data;
    const content = await read(link.accessUrl);
    expect(content.status).toBe(200);
    expect(content.headers.get("cache-control")).toBe("no-store");
    expect(content.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await content.arrayBuffer())).toEqual(bytes);
    expect((await read(link.accessUrl, other.token)).status).toBe(403);
    expect((await read(link.accessUrl, student.token)).status).toBe(403);
    expect((await access(asset.id, student.token)).status).toBe(200);
    const tampered = link.accessUrl.replace(
      /expires=\d+/,
      `expires=${Date.now() + 3600000}`,
    );
    expect((await read(tampered)).status).toBe(403);
    const clock = vi
      .spyOn(Date, "now")
      .mockReturnValue(Date.parse(link.expiresAt));
    expect((await read(link.accessUrl)).status).toBe(403);
    clock.mockRestore();
    const identity = repo
      .all("sportsIdentity")
      .find((item) => item.ownerId === teacher.account.id)!;
    repo.save(identity, { status: "revoked" });
    expect((await read(link.accessUrl)).status).toBe(403);
    repo.save(repo.get(identity.id), { status: "verified" });
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await read(link.accessUrl)).status).toBe(503);
  } finally {
    vi.restoreAllMocks();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
