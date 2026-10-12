import { afterEach, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { openDatabase } from "../backend/src/database";
import { createAccount, login } from "../backend/src/auth";
import { createApiServer } from "../backend/src/main";

const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
  vi.unstubAllEnvs();
});
async function listen(server: Server) {
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  cleanup.push(() => new Promise<void>(resolve => {
    server.closeAllConnections(); server.close(() => resolve());
  }));
  return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}
async function setup() {
  const db = openDatabase(":memory:"); cleanup.push(() => db.close());
  const email = "http-test@example.test", password = "Identity-test-123";
  const id = createAccount(db, { email, password, name: "核验测试", roles: [] });
  const token = login(db, email, password).token;
  const base = await listen(createApiServer(db));
  const call = (body = {}, cookie = `bnbu_session=${token}`) => fetch(`${base}/api/identity/check`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(body),
  });
  return { db, id, email, call };
}

it("经真实 HTTP 拒绝匿名请求、未配置服务及客户端替换核验账号", async () => {
  const { call } = await setup();
  vi.stubEnv("BNBU_IDENTITY_VERIFICATION_URL", "");
  expect((await call({}, "")).status).toBe(401);
  expect((await call()).status).toBe(503);
  expect((await call({ email: "other@example.test" })).status).toBe(400);
  expect((await call({ roles: ["superadmin"] })).status).toBe(400);
});

it("本地受控核验服务器收到当前账号，返回角色不改变数据库权限", async () => {
  const { db, id, email, call } = await setup();
  const received: Record<string, unknown>[] = [];
  const upstream = await listen(createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString()); received.push(input);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ...input, verified: true, subject: "fixture-subject", roles: ["superadmin"] }));
  }));
  vi.stubEnv("BNBU_IDENTITY_VERIFICATION_URL", upstream);
  const response = await call();
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ verified: true, authorizationChanged: false });
  expect(received).toHaveLength(1);
  expect(received[0]).toMatchObject({ accountId: id, email });
  expect(db.prepare("SELECT roles FROM accounts WHERE id=?").get(id)?.roles).toBe("[]");
  db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(id);
  expect((await call()).status).toBe(403);
  expect(received).toHaveLength(1);
});

it("核验服务的 HTML 成功页不能成为已核验结果", async () => {
  const { call } = await setup();
  const upstream = await listen(createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" }); response.end("<html>OK</html>");
  }));
  vi.stubEnv("BNBU_IDENTITY_VERIFICATION_URL", upstream);
  const response = await call();
  expect(response.status).toBe(502);
  expect(await response.json()).not.toHaveProperty("verified");
});
