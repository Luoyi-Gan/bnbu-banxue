import { searchStudents } from './student-search';
import {
  createServer,
} from "node:http";
import { resolve } from "node:path";
import {
  authenticate,
  verifyOwnEmail,
  demand,
  digest,
  login,
  loginAdministrator,
  loginUnified,
  register,
  ServiceError,
} from "./auth";
import { openDatabase, type Database } from "./database";
import { execute, snapshot } from "./commands";
import { communityView } from "./community-view";
import { Repository, type Fields } from "./repository";










import { accountDirectory } from "./accounts/account-directory";
import { administratorDirectory } from "./accounts/administrators";






import { administratorSelf } from "./accounts/administrator-deletion";
import {
  adminEmailStatus,
  requestAdminEmail,
  confirmAdminEmail,
} from "./accounts/admin-email";

















import { accountSecurityGate } from "./accounts/account-gate";






import { recognize } from "./timetable";
import { student } from "./community";
import { sendVerification } from "./mail-delivery";
import { checkSchoolIdentity } from "./identity";

import { cookieToken, send, body } from "./http";
export function createApiServer(
  db: Database,
  options: { localOutbox?: boolean } = {},
) {
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      if (request.method === "GET" && pathname === "/api/community")
        return send(
          response,
          200,
          communityView(db, cookieToken(request) ?? ""),
        );
      if (request.method === "GET" && pathname === "/api/health")
        return send(response, 200, {
          ok: true,
          storage: "sqlite",
          schemaVersion: Number(
            db
              .prepare("SELECT MAX(version) AS version FROM schema_migrations")
              .get()?.version ?? 0,
          ),
        });
      // Same-origin mutations; media has an explicit non-simple binary content type.
      if (request.method === "POST") {
        const origin = request.headers.origin;
        if (origin) {
          const parsed = new URL(origin);
          demand(
            ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) &&
              ["4174", "4175", "4186"].includes(parsed.port),
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
          accountSecurityGate(new Repository(db), actor);
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
        if (pathname === "/api/auth/email/confirm") return send(response,200,verifyOwnEmail(db,authenticate(db,cookieToken(request)),input.code));
        if (pathname === "/api/auth/email/request") {
          const actor=authenticate(db,cookieToken(request));
          demand(actor.status!=="banned","账号已封禁。",403);
          return send(response,200,await sendVerification(db,actor.email,options.localOutbox===true));
        }
        if (pathname === "/api/auth/register")
          return send(response, 201, register(db, input));
        if (
          pathname === "/api/auth/login" ||
          pathname === "/api/auth/admin-login" || pathname === "/api/auth/sign-in"
        ) {
          const result =
            pathname === "/api/auth/sign-in" ? loginUnified(db,input.identifier,input.password) : pathname === "/api/auth/admin-login"
              ? loginAdministrator(db, input.loginName, input.password)
              : login(db, input.email, input.password);
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
        if (pathname === "/api/accounts/admin-email/request") {
          demand(
            Object.keys(input).length === 0,
            "邮箱验证只能使用本人当前邮箱。",
          );
          return send(
            response,
            200,
            await requestAdminEmail(
              db,
              authenticate(db, token),
              options.localOutbox === true,
            ),
          );
        }
        if (pathname === "/api/accounts/admin-email/confirm")
          return send(
            response,
            200,
            confirmAdminEmail(db, authenticate(db, token), input),
          );
        if (pathname === "/api/identity/check") {
          accountSecurityGate(new Repository(db), authenticate(db, token));
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
        if (
          pathname === "/api/auth/logout" ||
          pathname === "/api/v1/auth/logout"
        ) {
          db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
            digest(token!),
          );
          response.setHeader(
            "Set-Cookie",
            "bnbu_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
          );
          return send(
            response,
            200,
            pathname === "/api/v1/auth/logout"
              ? { data: null }
              : { loggedOut: true },
          );
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
      if (request.method === "GET" && pathname === "/api/accounts/administrators")
        return send(
          response,
          200,
          administratorDirectory(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        );
      if (
        request.method === "GET" &&
        pathname === "/api/accounts/administrator-self"
      )
        return send(
          response,
          200,
          administratorSelf(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        );
      if (request.method === "GET" && pathname === "/api/accounts/admin-email")
        return send(
          response,
          200,
          adminEmailStatus(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        );
      const directory = /^\/api\/accounts\/(students|teachers)$/.exec(
        pathname,
      );
      if (request.method === "GET" && directory) {
        const params = new URL(request.url!, "http://localhost").searchParams;
        return send(
          response,
          200,
          accountDirectory(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            directory[1] === "students" ? "student" : "teacher",
            Object.fromEntries(params),
          ),
        );
      }
      if (request.method === "GET" && pathname === "/api/students/search") return send(response,200,searchStudents(db,authenticate(db,cookieToken(request)),new URL(request.url!,"http://localhost").searchParams.get("number") ?? ""));
      if (request.method === "GET" && pathname === "/api/workspace")
        return send(
          response,
          200,
          snapshot(db, authenticate(db, cookieToken(request))),
        );
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
  const host = process.env.BNBU_API_HOST ?? "127.0.0.1";
  const port = Number(process.env.BNBU_API_PORT ?? "4175");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("BNBU_API_PORT must be an integer between 1 and 65535");
  const db = openDatabase(
    process.env.BNBU_DATABASE ?? resolve("data/bnbu.sqlite"),
  );
  const server = createApiServer(db, {
    localOutbox: process.env.BNBU_LOCAL_OUTBOX === "1",
  });
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(port, host, done);
  });
  console.log(`BNBU API: http://${host}:${port} (SQLite)`);
  server.on("close", () => {
    db.close();
  });
  return server;
}
