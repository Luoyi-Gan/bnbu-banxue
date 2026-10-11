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
import { Repository, type Fields } from "./repository";
import { sportsWorkspace } from "./sports/courses";
import { teacherAccountWorkspace } from "./sports/teacher-accounts";
import { feedbackWorkspace } from "./sports/feedback";
import { helpRead } from "./sports/help";
import { conversionWorkspace } from "./sports/conversion";
import { rosterWorkspace } from "./sports/roster";
import { enduranceImportWorkspace } from "./sports/endurance-import";
import { uploadWorkbook, workbookAccess } from "./sports/workbook";
import {
  uploadOcrSource,
  recognizeOcrSource,
  ocrSourceAccess,
  type OcrImage,
} from "./sports/endurance-ocr";
import { ownedCourse } from "./sports/courses";
import { sportsWriteGate } from "./sports/system";
import { enduranceWorkspace } from "./sports/endurance";
import { gradeWorkspace } from "./sports/grades";
import {
  requiresPasswordChange,
  sportsAccountGate,
} from "./sports/account-gate";
import { sessionProjection } from "./sports/sessions";
import { reviewWorkspace } from "./sports/review";
import { processSportsReview } from "./sports/review-worker";
import { systemWorkspace } from "./sports/system";
import { calendarWorkspace } from "./sports/calendar";
import { incidentWorkspace } from "./sports/incidents";
import {
  materialWorkspace,
  readMaterial,
  uploadMaterial,
  writableMaterial,
} from "./sports/materials";
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
          sportsAccountGate(new Repository(db), actor);
          student(actor);
          demand(actor.status !== "banned", "账号已封禁。", 403);
          return send(response, 200, await recognize(request));
        }
        const mediaUpload = /^\/api\/sports\/materials\/([a-f0-9-]+)$/.exec(
          pathname,
        );
        if (mediaUpload) {
          demand(
            request.headers["content-type"] === "application/octet-stream",
            "材料上传须为二进制文件。",
            415,
          );
          const actor = authenticate(db, cookieToken(request)),
            repo = new Repository(db);
          const material = writableMaterial(repo, actor, mediaUpload[1]);
          const expectedSize = Number(material.data.size),
            chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            demand(size <= expectedSize, "文件超出锁定大小。", 413);
            chunks.push(chunk);
          }
          const saved = await uploadMaterial(
            repo,
            authenticate(db, cookieToken(request)),
            mediaUpload[1],
            Buffer.concat(chunks),
          );
          return send(response, 200, {
            id: saved.id,
            status: saved.data.status,
          });
        }
        const ocrUpload = /^\/api\/sports\/ocr-sources\/([a-f0-9-]+)$/.exec(
          pathname,
        );
        if (ocrUpload) {
          const repo = new Repository(db),
            token = cookieToken(request) ?? "";
          workbookAccess(repo, token, ocrUpload[1]);
          demand(
            request.headers["content-type"]?.startsWith("multipart/form-data"),
            "请上传原图表单。",
            415,
          );
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            demand(size <= 101 * 1024 * 1024, "图片批次超过100MB。", 413);
            chunks.push(chunk);
          }
          const form = await new Request("http://localhost/upload", {
            method: "POST",
            headers: { "Content-Type": request.headers["content-type"]! },
            body: new Blob([Uint8Array.from(Buffer.concat(chunks))]),
          }).formData();
          const images = form.getAll("images");
          demand(
            images.every((f) => f instanceof File),
            "必须上传图片文件。",
          );
          let source = await uploadOcrSource(
            repo,
            token,
            ocrUpload[1],
            images as File[],
          );
          if (source.data.status === "AWAITING_OCR")
            source = await recognizeOcrSource(
              repo,
              token,
              source.id,
              source.version,
            );
          return send(response, 200, {
            id: source.id,
            status: source.data.status,
            error: source.data.error,
          });
        }
        const ocrRetry =
          /^\/api\/sports\/ocr-sources\/([a-f0-9-]+)\/recognize$/.exec(
            pathname,
          );
        if (ocrRetry) {
          const input = await body(request);
          demand(Number.isInteger(input.version), "缺少原图当前版本。");
          const source = await recognizeOcrSource(
            new Repository(db),
            cookieToken(request) ?? "",
            ocrRetry[1],
            Number(input.version),
          );
          return send(response, 200, {
            id: source.id,
            status: source.data.status,
            error: source.data.error,
          });
        }
        const workbookUpload = /^\/api\/sports\/workbooks\/([a-f0-9-]+)$/.exec(
          pathname,
        );
        if (workbookUpload) {
          demand(
            request.headers["content-type"] === "application/octet-stream",
            "工作簿上传须为二进制文件。",
            415,
          );
          const repo = new Repository(db),
            token = cookieToken(request) ?? "";
          workbookAccess(repo, token, workbookUpload[1]);
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            demand(size <= 100 * 1024 * 1024, "XLSX不能超过100MB。", 413);
            chunks.push(chunk);
          }
          const saved = await uploadWorkbook(
            repo,
            token,
            workbookUpload[1],
            Buffer.concat(chunks),
          );
          return send(response, 200, { id: saved.id });
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
          sportsAccountGate(new Repository(db), authenticate(db, token));
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
      if (request.method === "GET" && pathname === "/api/sports/workspace") {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request)),
          serverNow = Date.now();
        const system = systemWorkspace(repo, actor);
        if (requiresPasswordChange(repo, actor))
          return send(response, 200, {
            identity: system.identity,
            firstLoginOnly: true,
            serverNow,
            system: {
              ...system.system,
              canManage: false,
              history: [],
              supplements: [],
            },
          });
        if (system.system.mode === "MAINTENANCE") {
          const canGovernAi =
            system.identity.data.role === "admin" &&
            actor.roles.includes("superadmin") &&
            actor.status !== "banned";
          const recovery = canGovernAi ? reviewWorkspace(repo, actor) : null;
          return send(response, 200, {
            ...system,
            serverNow,
            semesters: [],
            templates: [],
            courses: [],
            enrollments: [],
            invitations: [],
            sessions: [],
            records: [],
            materialBatches: [],
            materials: [],
            reviewReasons: [],
            reviewEvents: [],
            reviewRounds: [],
            progress: [],
            manualModes: recovery?.manualModes ?? [],
            canGovernAi,
            technicalTasks: recovery?.technicalTasks ?? [],
            recoveryCourses: canGovernAi
              ? repo
                  .all("sportsCourse")
                  .filter(
                    (c) =>
                      c.data.status !== "DRAFT" &&
                      c.data.settlementStatus !== "SETTLED",
                  )
                  .map((c) => ({ ...c, data: { name: c.data.name } }))
              : [],
          });
        }
        return send(response, 200, {
          ...system,
          ...sportsWorkspace(repo, actor),
          ...teacherAccountWorkspace(repo, actor),
          ...conversionWorkspace(repo, actor),
          ...gradeWorkspace(repo, actor),
          ...enduranceWorkspace(repo, actor),
          ...enduranceImportWorkspace(repo, actor),
          ...rosterWorkspace(repo, actor),
          ...feedbackWorkspace(repo, actor),
          ...materialWorkspace(repo, actor),
          ...reviewWorkspace(repo, actor),
          ...calendarWorkspace(repo, actor),
          ...incidentWorkspace(repo, actor),
          serverNow,
          sessions: repo
            .all("sportsSession")
            .filter((s) => s.ownerId === actor.id)
            .map((s) => sessionProjection(s, serverNow)),
        });
      }
      if (request.method === "GET" && pathname === "/api/sports/help")
        return send(
          response,
          200,
          helpRead(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            new URL(request.url!, "http://localhost").searchParams.get(
              "lang",
            ) ?? "zh",
          ),
        );
      const mediaRead = /^\/api\/sports\/materials\/([a-f0-9-]+)$/.exec(
        pathname,
      );
      if (request.method === "GET" && mediaRead) {
        sportsAccountGate(
          new Repository(db),
          authenticate(db, cookieToken(request)),
        );
        const media = readMaterial(
          new Repository(db),
          authenticate(db, cookieToken(request)),
          mediaRead[1],
        );
        response.writeHead(200, {
          "Content-Type": media.mime,
          "Content-Length": media.bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        });
        return response.end(media.bytes);
      }
      const ocrRead =
        /^\/api\/sports\/ocr-sources\/([a-f0-9-]+)\/images\/([a-f0-9-]+)$/.exec(
          pathname,
        );
      if (request.method === "GET" && ocrRead) {
        const repo = new Repository(db),
          source = ocrSourceAccess(
            repo,
            authenticate(db, cookieToken(request)),
            ocrRead[1],
          );
        const image = (source.data.images as OcrImage[]).find(
          (i) => i.id === ocrRead[2],
        );
        demand(image, "原图不存在。", 404);
        const blob = db
          .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
          .get(image.sha256);
        demand(blob, "原图不存在。", 404);
        const bytes = Buffer.from(blob.bytes as Uint8Array);
        response.writeHead(200, {
          "Content-Type": image.mime,
          "Content-Length": bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        });
        return response.end(bytes);
      }
      const workbookRead =
        /^\/api\/sports\/workbook-sources\/([a-f0-9-]+)$/.exec(pathname);
      if (request.method === "GET" && workbookRead) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request));
        sportsWriteGate(repo, "sports.endurance.import");
        const source = repo.get(workbookRead[1], "sportsEnduranceSource");
        ownedCourse(repo, actor, source.data.courseId);
        demand(
          source.ownerId === actor.id,
          "只能读取本人受理的原始文件。",
          403,
        );
        const blob = db
          .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
          .get(String(source.data.sha256));
        demand(blob, "原始文件不存在。", 404);
        const bytes = Buffer.from(blob.bytes as Uint8Array);
        response.writeHead(200, {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="endurance-source.xlsx"',
          "Content-Length": bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        return response.end(bytes);
      }
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
  const worker = setInterval(() => {
    void processSportsReview(db).catch(() =>
      console.error(
        "Sports review worker could not complete its current task.",
      ),
    );
  }, 2000);
  worker.unref();
  server.on("close", () => {
    clearInterval(worker);
    db.close();
  });
  return server;
}
