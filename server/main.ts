import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { resolve } from "node:path";
import {
  authenticate,
  demand,
  digest,
  login,
  register,
  ServiceError,
} from "./auth";
import { openDatabase, type Database } from "./database";
import { execute, snapshot } from "./commands";
import type { Fields } from "./repository";
import { recognize } from "./timetable";
import { student } from "./community";
import { sendVerification } from "./mail-delivery";
import { checkSchoolIdentity } from "./identity";

const cookieToken = (request: IncomingMessage) =>
  request.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("bnbu_session="))
    ?.slice("bnbu_session=".length);
function send(response: ServerResponse, status: number, data: unknown) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}
async function body(request: IncomingMessage): Promise<Fields> {
  demand(
    request.headers["content-type"]?.startsWith("application/json"),
    "请求必须使用 JSON。",
    415,
  );
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    size += chunk.length;
    demand(size <= 12 * 1024 * 1024, "请求过大。", 413);
    chunks.push(chunk);
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ServiceError(400, "INVALID_JSON", "JSON 格式无效。");
  }
  demand(
    value && typeof value === "object" && !Array.isArray(value),
    "请求须为 JSON 对象。",
  );
  return value as Fields;
}
export function createApiServer(
  db: Database,
  options: { localOutbox?: boolean } = {},
) {
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (request.method === "GET" && pathname === "/api/health")
        return send(response, 200, {
          ok: true,
          storage: "sqlite",
          schemaVersion: 1,
        });
      // All browser mutations use same-origin JSON. Cross-origin simple forms cannot invoke them.
      if (request.method === "POST") {
        const origin = request.headers.origin;
        if (origin) {
          const parsed = new URL(origin);
          demand(
            ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) &&
              ["4174", "4175"].includes(parsed.port),
            "来源不允许。",
            403,
          );
        }
        demand(
          request.headers["sec-fetch-site"] !== "cross-site",
          "跨站请求不允许。",
          403,
        );
        if (pathname === "/api/timetable/recognize") {
          const actor = authenticate(db, cookieToken(request));
          student(actor);
          demand(actor.status !== "banned", "账号已封禁。", 403);
          return send(response, 200, await recognize(request));
        }
        const input = await body(request);
        if (pathname === "/api/auth/verification-codes") {
          return send(
            response,
            200,
            await sendVerification(
              db,
              input.email,
              options.localOutbox === true,
            ),
          );
        }
        if (pathname === "/api/auth/register")
          return send(response, 201, register(db, input));
        if (pathname === "/api/auth/login") {
          const result = login(db, input.email, input.password);
          response.setHeader(
            "Set-Cookie",
            `bnbu_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`,
          );
          return send(response, 200, {
            authenticated: true,
            account: result.account,
          });
        }
        const token = cookieToken(request);
        authenticate(db, token);
        if (pathname === "/api/identity/check") {
          demand(
            Object.keys(input).length === 0,
            "核验对象只能来自当前登录账号。",
          );
          return send(
            response,
            200,
            await checkSchoolIdentity(authenticate(db, token)),
          );
        }
        if (pathname === "/api/auth/logout") {
          db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
            digest(token!),
          );
          response.setHeader(
            "Set-Cookie",
            "bnbu_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
          );
          return send(response, 200, { loggedOut: true });
        }
        if (pathname === "/api/commands") {
          demand(
            typeof input.action === "string" &&
              typeof input.requestId === "string" &&
              input.input &&
              typeof input.input === "object" &&
              !Array.isArray(input.input),
            "命令格式无效。",
          );
          const result = execute(
            db,
            token!,
            input.action,
            input.input as Fields,
            input.requestId,
          );
          return send(response, 200, { data: result });
        }
      }
      if (request.method === "GET" && pathname === "/api/auth/me")
        return send(response, 200, {
          account: authenticate(db, cookieToken(request)),
        });
      if (request.method === "GET" && pathname === "/api/workspace")
        return send(
          response,
          200,
          snapshot(db, authenticate(db, cookieToken(request))),
        );
      if (pathname.startsWith("/api/v1/"))
        return send(response, 503, {
          code: "SPORTS_SERVICE_REQUIRED",
          message: "原体育后端未配置，请连接原服务后重试。",
        });
      send(response, 404, { code: "NOT_FOUND", message: "接口不存在。" });
    } catch (error) {
      if (error instanceof ServiceError)
        return send(response, error.status, {
          code: error.code,
          message: error.message,
        });
      if (
        error instanceof Error &&
        !/SQLITE|constraint|database|ENOENT/i.test(error.message)
      )
        return send(response, 400, {
          code: "BUSINESS_RULE",
          message: error.message,
        });
      console.error("Backend request failed:", error);
      send(response, 500, {
        code: "INTERNAL_ERROR",
        message: "保存失败，请重试；业务未报告成功。",
      });
    }
  });
}
export async function startBackend() {
  const db = openDatabase(
    process.env.BNBU_DATABASE ?? resolve("data/bnbu.sqlite"),
  );
  const server = createApiServer(db, {
    localOutbox: process.env.BNBU_LOCAL_OUTBOX === "1",
  });
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(4175, "127.0.0.1", done);
  });
  console.log("BNBU API: http://127.0.0.1:4175 (SQLite)");
  server.on("close", () => db.close());
  return server;
}
