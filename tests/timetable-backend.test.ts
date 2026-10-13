import { afterEach, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { createApiServer } from "../backend/src/main";
import { openDatabase } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { execute } from "../backend/src/commands";
import { Repository } from "../backend/src/repository";

const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {for (const close of cleanup.splice(0).reverse()) await close(); vi.unstubAllEnvs();});
async function listen(server: Server) {
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  cleanup.push(() => new Promise<void>(done => {server.closeAllConnections(); server.close(() => done());}));
  return `http://127.0.0.1:${(server.address() as {port: number}).port}`;
}
it("真实课表代理隔离外部错误，识别本身不覆盖原表且未授权不向服务发送照片", async () => {
  const db = openDatabase(":memory:"); cleanup.push(() => db.close());
  createAccount(db, {email: "student@example.test", password: "Test-password-123", name: "学生", roles: ["student"]});
  const session = login(db, "student@example.test", "Test-password-123");
  const table = execute(db, session.token, "timetable.save", {fileName: "old.png", lessons: [{name: "原课程", weekday: 1}]}, "original-table") as {id: string};
  const repo = new Repository(db), original = repo.get(table.id);
  let reply = "not-json", calls = 0;
  const upstream = await listen(createServer(async (req, res) => {
    calls++;
    expect(req.headers.authorization).toBe("Bearer test-provider-key");
    for await (const chunk of req) void chunk;
    res.writeHead(200, {"Content-Type": "application/json"}); res.end(reply);
  }));
  vi.stubEnv("BNBU_TIMETABLE_UPSTREAM", upstream);
  vi.stubEnv("BNBU_TIMETABLE_TOKEN", "test-provider-key");
  const base = await listen(createApiServer(db));
  const upload = (token?: string) => {
    const body = new FormData(); body.append("image", new Blob([new Uint8Array([1,2,3])], {type: "image/png"}), "table.png");
    return fetch(base + "/api/timetable/recognize", {method: "POST", body, headers: token ? {Cookie: `bnbu_session=${token}`} : {}});
  };
  expect((await upload()).status).toBe(401); expect(calls).toBe(0);
  for (const invalid of ["not-json", JSON.stringify({lessons: []}), JSON.stringify({lessons: [{name: "课程", weekday: 9}]})]) {
    reply = invalid;
    const response = await upload(session.token);
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("test-provider-key");
    expect(repo.get(table.id)).toEqual(original);
  }
  reply = JSON.stringify({lessons: [{name: "新课程", weekday: 2}]});
  const response = await upload(session.token);
  expect(response.status).toBe(200);
  expect((await response.json()).lessons[0]).toMatchObject({name: "新课程", weekday: 2, needsReview: true});
  expect(repo.get(table.id)).toEqual(original);
  vi.stubEnv("BNBU_TIMETABLE_UPSTREAM", "");
  expect((await upload(session.token)).status).toBe(503);
  expect(calls).toBe(4);
});
