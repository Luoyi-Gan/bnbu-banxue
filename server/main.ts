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
  loginAdministrator,
  register,
  ServiceError,
} from "./auth";
import { openDatabase, type Database } from "./database";
import { execute, snapshot } from "./commands";
import { Repository, type Fields } from "./repository";
import { sportsWorkspace } from "./sports/courses";
import { portalSettlementPreview } from "./sports/portal-settlement";
import { portalFrozenReportExport } from "./sports/portal-report-export";
import {
  portalGradeHistory,
  portalFinalGradeWrite,
  portalSettlementReports,
  portalPhysicalWrite,
} from "./sports/portal-grades";
import {
  portalApplications,
  portalApplicationReview,
  portalCertificationChange,
  portalRecognitionHistory,
} from "./sports/portal-applications";
import { portalProofAccess, portalProofRead } from "./sports/portal-media";
import {
  portalEnrollments,
  portalTeacherStudent,
  portalTeacherProgress,
} from "./sports/portal-enrollments";
import { administratorAccess } from "./sports/permissions";
import {
  portalExerciseGoal,
  portalRuleTemplates,
} from "./sports/portal-rule-templates";
import { accountDirectory } from "./sports/account-directory";
import { administratorDirectory } from "./sports/administrators";
import { portalLogin, portalMe, portalSecurity } from "./sports/portal";
import {
  portalTeacherCourses,
  portalTeacherCourse,
  portalTeacherSemesters,
  portalCourseWindow,
  portalCourseInvite,
} from "./sports/portal-courses";
import {
  portalNotifications,
  portalNotificationRead,
} from "./sports/portal-notifications";
import {
  portalSystemRead,
  portalSystemHistory,
  portalSystemChange,
} from "./sports/portal-system";
import {
  portalAccountPage,
  portalSubadmins,
  portalSubadminWrite,
  portalSubadminDelete,
} from "./sports/portal-accounts";
import {
  portalAnnouncement,
  portalHealth,
  portalEnduranceTables,
  portalEnduranceWrite,
} from "./sports/portal-bootstrap";
import { administratorSelf } from "./sports/administrator-deletion";
import {
  adminEmailStatus,
  requestAdminEmail,
  confirmAdminEmail,
} from "./sports/admin-email";
import { teacherAccountWorkspace } from "./sports/teacher-accounts";
import { feedbackWorkspace } from "./sports/feedback";
import { helpRead } from "./sports/help";
import { conversionWorkspace } from "./sports/conversion";
import { rosterWorkspace } from "./sports/roster";
import { courseReport, reportCsv, type CourseReport } from "./sports/report";
import { settlementWorkspace } from "./sports/settlement";
import {
  applicationWorkspace,
  uploadApplicationAsset,
  readApplicationAsset,
} from "./sports/applications";
import { uploadRosterFile } from "./sports/roster-files";
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
import { historicalRemarks } from "./sports/historical-remarks";
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
      if (
        request.method === "POST" ||
        (request.method === "PATCH" &&
          /^\/api\/v1\/class-sections\/[^/]+$/.test(pathname))
      ) {
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
        if (request.method === "PATCH") {
          const token = cookieToken(request);
          authenticate(db, token);
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalCourseWindow(
              db,
              token!,
              pathname.split("/").at(-1)!,
              await body(request),
              key,
            ),
          });
        }
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
        const proofUpload =
          /^\/api\/sports\/application-assets\/([a-f0-9-]+)(?:\/([a-f0-9-]+))?$/.exec(
            pathname,
          );
        if (proofUpload) {
          const chunks: Buffer[] = [];
          let size = 0;
          authenticate(db, cookieToken(request));
          for await (const chunk of request) {
            size += chunk.length;
            demand(size <= 10 * 1024 * 1024, "单张证明图片超过10MB。", 413);
            chunks.push(chunk);
          }
          const saved = await uploadApplicationAsset(
            new Repository(db),
            cookieToken(request) ?? "",
            proofUpload[1],
            Buffer.concat(chunks),
            request.headers["content-type"] ?? "",
            proofUpload[2],
          );
          return send(response, 200, { id: saved.id });
        }
        const ocrUpload =
          /^\/api\/sports\/(?:ocr-sources|roster-ocr)\/([a-f0-9-]+)$/.exec(
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
            pathname.startsWith("/api/sports/roster-ocr/")
              ? "ROSTER"
              : "ENDURANCE",
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
        const rosterUpload =
          /^\/api\/sports\/roster-files\/([a-f0-9-]+)\/(csv|xlsx)$/.exec(
            pathname,
          );
        if (rosterUpload) {
          const repo = new Repository(db),
            token = cookieToken(request) ?? "";
          workbookAccess(repo, token, rosterUpload[1]);
          demand(
            request.headers["content-type"] === "application/octet-stream",
            "名单文件须为二进制上传。",
            415,
          );
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            demand(size <= 100 * 1024 * 1024, "名单文件超过100MB。", 413);
            chunks.push(chunk);
          }
          const source = await uploadRosterFile(
            repo,
            token,
            rosterUpload[1],
            rosterUpload[2].toUpperCase(),
            Buffer.concat(chunks),
          );
          return send(response, 200, { id: source.id });
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
        if (pathname === "/api/v1/auth/password-login") {
          const result = portalLogin(db, input.account, input.password);
          response.setHeader(
            "Set-Cookie",
            `bnbu_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`,
          );
          return send(response, 200, { data: { user: result.user } });
        }
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
        if (
          pathname === "/api/auth/login" ||
          pathname === "/api/auth/admin-login"
        ) {
          const result =
            pathname === "/api/auth/admin-login"
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
        const physicalWrite =
          /^\/api\/v1\/enrollments\/([^/]+)\/physical-results$/.exec(pathname);
        if (physicalWrite) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalPhysicalWrite(db, token!, physicalWrite[1], input, key),
          });
        }
        const finalGradeWrite =
          /^\/api\/v1\/enrollments\/([^/]+)\/final-grades$/.exec(pathname);
        if (finalGradeWrite) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalFinalGradeWrite(
              db,
              token!,
              finalGradeWrite[1],
              input,
              key,
            ),
          });
        }
        const certificationChange =
          /^\/api\/v1\/activity-certification-applications\/([^/]+)\/(revoke|recognition-allocation-revisions)$/.exec(
            pathname,
          );
        if (certificationChange) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalCertificationChange(
              db,
              token!,
              certificationChange[1],
              certificationChange[2] === "revoke",
              input,
              key,
            ),
          });
        }
        const applicationReview =
          /^\/api\/v1\/exemption-applications\/([^/]+)\/review$/.exec(pathname);
        if (applicationReview) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalApplicationReview(
              db,
              token!,
              applicationReview[1],
              input,
              key,
            ),
          });
        }
        const proofAccess = /^\/api\/v1\/media\/([^/]+)\/access-url$/.exec(
          pathname,
        );
        if (proofAccess)
          return send(response, 200, {
            data: portalProofAccess(
              new Repository(db),
              authenticate(db, token),
              proofAccess[1],
              input,
            ),
          });
        if (pathname === "/api/v1/teacher/courses") {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          demand(
            Object.keys(input).every((field) => field === "displayName"),
            "新建课程参数无效。",
          );
          return send(response, 200, {
            data: execute(
              db,
              token!,
              "sports.course.create",
              { name: input.displayName },
              key,
            ),
          });
        }
        const courseRulesPublish =
          /^\/api\/v1\/class-sections\/([^/]+)\/v81-rules$/.exec(pathname);
        if (courseRulesPublish) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          demand(!("id" in input), "课程标识须来自请求路径。");
          execute(
            db,
            token!,
            "sports.course.configurepublish",
            { ...input, id: courseRulesPublish[1] },
            key,
          );
          return send(response, 200, {
            data: portalTeacherCourse(
              new Repository(db),
              authenticate(db, token),
              courseRulesPublish[1],
              "v81-rules",
            ),
          });
        }
        const courseInvite =
          /^\/api\/v1\/class-sections\/([^/]+)\/course-invites(\/revocations)?$/.exec(
            pathname,
          );
        if (courseInvite) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalCourseInvite(
              db,
              token!,
              courseInvite[1],
              !!courseInvite[2],
              input,
              key,
            ),
          });
        }
        const noticeRead = /^\/api\/v1\/notifications\/([^/]+)\/read$/.exec(
          pathname,
        );
        if (noticeRead) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalNotificationRead(db, token!, noticeRead[1], key),
          });
        }
        if (pathname === "/api/v1/me/account-deletion") {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          const own = administratorSelf(
            new Repository(db),
            authenticate(db, token),
          );
          const result = execute(
            db,
            token!,
            "sports.account.close",
            {
              id: own.id,
              version: input.expectedVersion,
              loginName: input.account,
              name: input.name,
              email: input.email,
              confirmed: input.confirmed,
              handoverConfirmed: input.handoverCompleted,
            },
            key,
          );
          response.setHeader(
            "Set-Cookie",
            "bnbu_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
          );
          return send(response, 200, {
            data: { userId: result.id, deleted: true },
          });
        }
        if (pathname === "/api/v1/system-mode/changes") {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalSystemChange(db, token!, input, key),
          });
        }
        const enduranceWrite =
          /^\/api\/v1\/admin\/endurance-tables\/rules(?:\/([^/]+)(\/delete)?)?$/.exec(
            pathname,
          );
        if (enduranceWrite) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalEnduranceWrite(
              db,
              token!,
              enduranceWrite[1]
                ? decodeURIComponent(enduranceWrite[1])
                : undefined,
              !!enduranceWrite[2],
              input,
              key,
            ),
          });
        }
        const subadminDelete =
          /^\/api\/v1\/admin\/subadmins\/([^/]+)\/delete$/.exec(pathname);
        if (subadminDelete) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalSubadminDelete(
              db,
              token!,
              subadminDelete[1],
              input,
              key,
            ),
          });
        }
        const subadminWrite =
          /^\/api\/v1\/admin\/subadmins(?:\/([^/]+)\/(profile|status))?$/.exec(
            pathname,
          );
        if (subadminWrite) {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          return send(response, 200, {
            data: portalSubadminWrite(
              db,
              token!,
              subadminWrite[1],
              (subadminWrite[2] ?? "create") as "create" | "profile" | "status",
              input,
              key,
            ),
          });
        }
        if (pathname === "/api/v1/auth/own-password") {
          const key = request.headers["idempotency-key"];
          demand(typeof key === "string", "缺少操作幂等标识。");
          portalSecurity(new Repository(db), authenticate(db, token));
          execute(
            db,
            token!,
            "sports.password.change",
            {
              currentPassword: input.currentPassword,
              newPassword: input.newPassword,
              confirmPassword: input.confirmPassword,
              version: input.expectedVersion,
            },
            key,
          );
          const security = portalSecurity(
            new Repository(db),
            authenticate(db, token),
          );
          return send(response, 200, {
            data: {
              userId: security.userId,
              version: security.version,
              mustChangePassword: security.mustChangePassword,
            },
          });
        }
        if (pathname === "/api/sports/admin-email/request") {
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
        if (pathname === "/api/sports/admin-email/confirm")
          return send(
            response,
            200,
            confirmAdminEmail(db, authenticate(db, token), input),
          );
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
      if (
        request.method === "GET" &&
        ["/api/v1/me", "/api/v1/auth/account-security"].includes(pathname)
      ) {
        const actor = authenticate(db, cookieToken(request));
        const repo = new Repository(db);
        return send(response, 200, {
          data:
            pathname === "/api/v1/me"
              ? portalMe(repo, actor)
              : portalSecurity(repo, actor),
        });
      }
      if (
        request.method === "GET" &&
        pathname === "/api/v1/system-mode/announcement"
      )
        return send(response, 200, {
          data: portalAnnouncement(new Repository(db)),
        });
      if (
        request.method === "GET" &&
        ["/api/v1/health/admin", "/api/v1/admin/endurance-tables"].includes(
          pathname,
        )
      ) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request));
        return send(response, 200, {
          data:
            pathname === "/api/v1/health/admin"
              ? portalHealth(repo, actor)
              : portalEnduranceTables(repo, actor),
        });
      }
      if (request.method === "GET" && pathname === "/api/v1/admin/subadmins") {
        const query = new URL(request.url!, "http://localhost").searchParams;
        return send(response, 200, {
          data: portalSubadmins(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            query.get("after") ?? "",
          ),
        });
      }
      if (
        request.method === "GET" &&
        pathname === "/api/v1/exemption-application-details"
      ) {
        return send(
          response,
          200,
          portalApplications(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        );
      }
      if (request.method === "GET" && pathname === "/api/v1/teacher-progress") {
        return send(
          response,
          200,
          portalTeacherProgress(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        );
      }
      if (request.method === "GET" && pathname === "/api/v1/enrollments") {
        return send(
          response,
          200,
          portalEnrollments(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        );
      }
      const settlementPreview =
        /^\/api\/v1\/class-sections\/([^/]+)\/settlement-(preview|check)$/.exec(
          pathname,
        );
      if (request.method === "GET" && settlementPreview) {
        const preview = portalSettlementPreview(
          new Repository(db),
          authenticate(db, cookieToken(request)),
          settlementPreview[1],
        );
        return send(response, 200, {
          data:
            settlementPreview[2] === "preview"
              ? preview
              : { checks: preview.checks },
        });
      }
      const frozenExport =
        /^\/api\/v1\/class-sections\/([^/]+)\/settlement-reports\/(\d+)\/export$/.exec(
          pathname,
        );
      if (request.method === "GET" && frozenExport)
        return send(response, 200, {
          data: await portalFrozenReportExport(
            new Repository(db),
            cookieToken(request) ?? "",
            frozenExport[1],
            Number(frozenExport[2]),
          ),
        });
      const settlementReports =
        /^\/api\/v1\/class-sections\/([^/]+)\/settlement-reports$/.exec(
          pathname,
        );
      if (request.method === "GET" && settlementReports)
        return send(response, 200, {
          data: portalSettlementReports(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            settlementReports[1],
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        });
      const gradeHistory =
        /^\/api\/v1\/enrollments\/([^/]+)\/(physical-results|final-grades)$/.exec(
          pathname,
        );
      if (request.method === "GET" && gradeHistory)
        return send(response, 200, {
          data: portalGradeHistory(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            gradeHistory[1],
            gradeHistory[2] as "physical-results" | "final-grades",
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        });
      const recognitionHistory =
        /^\/api\/v1\/activity-certification-applications\/([^/]+)\/recognition-allocation-revisions$/.exec(
          pathname,
        );
      if (request.method === "GET" && recognitionHistory)
        return send(
          response,
          200,
          portalRecognitionHistory(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            recognitionHistory[1],
            Object.fromEntries(
              new URL(request.url!, "http://localhost").searchParams.entries(),
            ),
          ),
        );
      const portalDirectory =
        /^\/api\/v1\/(students|teachers)(?:\/([^/]+))?$/.exec(pathname);
      if (
        request.method === "GET" &&
        (portalDirectory || pathname === "/api/v1/admin/teacher-accounts")
      ) {
        const query = new URL(request.url!, "http://localhost").searchParams;
        const teacher = !portalDirectory || portalDirectory[1] === "teachers";
        if (!teacher && portalDirectory?.[2]) {
          const repo = new Repository(db),
            actor = authenticate(db, cookieToken(request));
          if (
            !administratorAccess(repo, actor).permissions.includes("ACCOUNTS")
          ) {
            demand([...query.keys()].length === 0, "学生资料查询参数无效。");
            return send(response, 200, {
              data: portalTeacherStudent(
                repo,
                actor,
                decodeURIComponent(portalDirectory[2]),
              ),
            });
          }
        }
        const input = Object.fromEntries(query.entries());
        if (input.after !== undefined) {
          input.cursor = input.after;
          delete input.after;
        }
        if (portalDirectory?.[2])
          input.id = decodeURIComponent(portalDirectory[2]);
        const page = portalAccountPage(
          new Repository(db),
          authenticate(db, cookieToken(request)),
          teacher ? "teacher" : "student",
          input,
        );
        if (portalDirectory?.[2])
          return send(response, 200, { data: page.items[0] });
        if (!portalDirectory)
          return send(response, 200, {
            data: { items: page.items, nextCursor: page.nextCursor },
          });
        return send(response, 200, {
          data: page.items,
          meta: {
            pagination: {
              total: page.total,
              hasMore: page.nextCursor !== null,
              nextCursor: page.nextCursor,
              limit: Number(input.limit ?? 20),
            },
          },
        });
      }
      if (
        request.method === "GET" &&
        ["/api/v1/system-mode", "/api/v1/system-mode/history"].includes(
          pathname,
        )
      ) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request));
        const before =
          new URL(request.url!, "http://localhost").searchParams.get(
            "beforeVersion",
          ) ?? undefined;
        return send(response, 200, {
          data: pathname.endsWith("/history")
            ? portalSystemHistory(repo, actor, before)
            : portalSystemRead(repo, actor),
        });
      }
      if (
        request.method === "GET" &&
        ["/api/v1/rule-templates", "/api/v1/admin/exercise-goal"].includes(
          pathname,
        )
      ) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request));
        return send(response, 200, {
          data: pathname.endsWith("/rule-templates")
            ? portalRuleTemplates(
                repo,
                actor,
                Object.fromEntries(
                  new URL(
                    request.url!,
                    "http://localhost",
                  ).searchParams.entries(),
                ),
              )
            : portalExerciseGoal(repo, actor),
        });
      }
      if (request.method === "GET" && pathname === "/api/v1/me/administrator")
        return send(response, 200, {
          data: administratorSelf(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        });
      if (request.method === "GET" && pathname === "/api/v1/notifications") {
        const input = Object.fromEntries(
          new URL(request.url!, "http://localhost").searchParams.entries(),
        );
        return send(
          response,
          200,
          portalNotifications(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            input,
          ),
        );
      }
      if (
        request.method === "GET" &&
        ["/api/v1/courses", "/api/v1/class-sections"].includes(pathname)
      ) {
        const input = Object.fromEntries(
          new URL(request.url!, "http://localhost").searchParams.entries(),
        );
        const page = portalTeacherCourses(
          new Repository(db),
          authenticate(db, cookieToken(request)),
          pathname.endsWith("/courses") ? "courses" : "class-sections",
          input,
        );
        return send(response, 200, {
          data: page.items,
          meta: {
            pagination: {
              total: page.total,
              limit: page.limit,
              nextCursor: page.nextCursor,
              hasMore: page.nextCursor !== null,
            },
          },
        });
      }
      const teacherCourse =
        /^\/api\/v1\/(courses|class-sections)\/([^/]+)(\/(?:progress-target|v81-rules))?$/.exec(
          pathname,
        );
      if (request.method === "GET" && teacherCourse) {
        demand(
          !teacherCourse[3] || teacherCourse[1] === "class-sections",
          "接口不存在。",
          404,
        );
        return send(response, 200, {
          data: portalTeacherCourse(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            teacherCourse[2],
            teacherCourse[3]
              ? (teacherCourse[3].slice(1) as "progress-target" | "v81-rules")
              : (teacherCourse[1] as "courses" | "class-sections"),
          ),
        });
      }
      if (
        request.method === "GET" &&
        ["/api/v1/semesters/current", "/api/v1/teacher/semesters"].includes(
          pathname,
        )
      ) {
        const input = Object.fromEntries(
          new URL(request.url!, "http://localhost").searchParams.entries(),
        );
        return send(response, 200, {
          data: portalTeacherSemesters(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            pathname.endsWith("/current"),
            input,
          ),
        });
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
          ...applicationWorkspace(repo, actor),
          ...settlementWorkspace(repo, actor),
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
      const proofRead =
        /^\/api\/sports\/application-assets\/([a-f0-9-]+)$/.exec(pathname);
      const portalProof = /^\/api\/v1\/media\/([^/]+)\/content$/.exec(pathname);
      if (request.method === "GET" && (proofRead || portalProof)) {
        const repo = new Repository(db),
          asset = portalProof
            ? portalProofRead(
                repo,
                authenticate(db, cookieToken(request)),
                portalProof[1],
                Object.fromEntries(
                  new URL(
                    request.url!,
                    "http://localhost",
                  ).searchParams.entries(),
                ),
              )
            : readApplicationAsset(
                repo,
                authenticate(db, cookieToken(request)),
                proofRead![1],
              );
        const blob = db
          .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
          .get(String(asset.data.sha256));
        demand(blob, "证明原图不存在。", 404);
        const bytes = Buffer.from(blob.bytes as Uint8Array);
        response.writeHead(200, {
          "Content-Type": String(asset.data.mime),
          "Content-Length": bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        });
        response.end(bytes);
        return;
      }
      if (
        request.method === "GET" &&
        pathname === "/api/sports/historical-final-grade-remarks"
      ) {
        const params = new URL(request.url!, "http://localhost").searchParams;
        return send(
          response,
          200,
          historicalRemarks(
            new Repository(db),
            authenticate(db, cookieToken(request)),
            Object.fromEntries(params),
          ),
        );
      }
      if (request.method === "GET" && pathname === "/api/sports/administrators")
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
        pathname === "/api/sports/administrator-self"
      )
        return send(
          response,
          200,
          administratorSelf(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        );
      if (request.method === "GET" && pathname === "/api/sports/admin-email")
        return send(
          response,
          200,
          adminEmailStatus(
            new Repository(db),
            authenticate(db, cookieToken(request)),
          ),
        );
      const directory = /^\/api\/sports\/accounts\/(students|teachers)$/.exec(
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
      const frozenRead =
        /^\/api\/sports\/settlement-reports\/([a-f0-9-]+)(\.csv)?$/.exec(
          pathname,
        );
      if (request.method === "GET" && frozenRead) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request)),
          entry = repo.get(frozenRead[1], "sportsSettlementReport");
        sportsWriteGate(repo, "sports.settlement.read");
        ownedCourse(repo, actor, entry.data.courseId);
        if (!frozenRead[2]) return send(response, 200, entry);
        const bytes = Buffer.from(
          `\uFEFF"冻结报告ID","${entry.id}"\r\n"报告版本","${Number(entry.data.sequence)}"\r\n"内容摘要","${String(entry.data.contentHash)}"\r\n` +
            reportCsv(entry.data.report as CourseReport).slice(1),
          "utf8",
        );
        response.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="settlement-report.csv"',
          "Content-Length": bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        response.end(bytes);
        return;
      }
      const reportRead =
        /^\/api\/sports\/course-reports\/([a-f0-9-]+)(\.csv)?$/.exec(pathname);
      if (request.method === "GET" && reportRead) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request));
        const report = courseReport(repo, actor, reportRead[1]);
        if (!reportRead[2]) return send(response, 200, report);
        const bytes = Buffer.from(reportCsv(report), "utf8");
        response.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="course-report.csv"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Length": bytes.length,
        });
        response.end(bytes);
        return;
      }
      const rosterRead = /^\/api\/sports\/roster-sources\/([a-f0-9-]+)$/.exec(
        pathname,
      );
      if (request.method === "GET" && rosterRead) {
        const repo = new Repository(db),
          actor = authenticate(db, cookieToken(request)),
          source = repo.get(rosterRead[1], "sportsRosterSource");
        demand(
          source.data.sourceType !== "OCR",
          "纸质原件请通过原图接口读取。",
          404,
        );
        sportsWriteGate(repo, "sports.roster.preview");
        ownedCourse(repo, actor, source.data.courseId);
        demand(
          source.ownerId === actor.id,
          "只能读取本人受理的名单原件。",
          403,
        );
        const blob = db
          .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
          .get(String(source.data.sha256));
        demand(blob, "名单原件不存在。", 404);
        const bytes = Buffer.from(blob.bytes as Uint8Array),
          csv = source.data.format === "CSV";
        response.writeHead(200, {
          "Content-Type": csv
            ? "text/csv; charset=utf-8"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="school-roster.${csv ? "csv" : "xlsx"}"`,
          "Content-Length": bytes.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
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
          message: "该原版页面接口尚未完成本地后端接线。",
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
