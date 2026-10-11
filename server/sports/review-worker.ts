import { randomUUID } from "node:crypto";
import { demand } from "../auth";
import { transaction, type Database } from "../database";
import { Repository, type Fields } from "../repository";
import { completeBatch, enqueueTeacher, manualMode } from "./review";
import { recalculateProgress } from "./progress";
import { expireSupplements } from "./supplements";
import { checkReviewReminders } from "./calendar";

const running = new WeakSet<Database>();
export interface AiConnection {
  url?: string;
  token?: string;
  validationRef?: string;
}
/** One task per pass, explicit retries only. Raw responses, keys and student media never enter logs. */
export async function processSportsReview(
  db: Database,
  connection: AiConnection = {
    url: process.env.BNBU_SPORTS_AI_URL,
    token: process.env.BNBU_SPORTS_AI_TOKEN,
    validationRef: process.env.BNBU_SPORTS_AI_VALIDATION_REF,
  },
) {
  if (running.has(db)) return;
  running.add(db);
  try {
    const repo = new Repository(db);
    if (repo.all("sportsSystem").some((s) => s.data.mode !== "NORMAL")) return;
    transaction(db, () => expireSupplements(repo));
    transaction(db, () => checkReviewReminders(repo));
    const record = repo
      .all("sportsRecord")
      .find((r) => r.data.status === "PENDING_AI");
    if (!record) return;
    const batch = completeBatch(repo, record);
    const mode = manualMode(repo, record.data.courseId);
    if (mode) {
      transaction(db, () => enqueueTeacher(repo, record, `MANUAL:${mode.id}`));
      return;
    }
    const task = transaction(db, () => {
      const old = repo
        .all("sportsAiTask")
        .find(
          (t) => t.data.recordId === record.id && t.data.batchId === batch.id,
        );
      const fields = {
        recordId: record.id,
        batchId: batch.id,
        recordVersion: record.version,
        batchVersion: batch.version,
        requestId: randomUUID(),
        startedAt: Date.now(),
        status: "PROCESSING",
        attempt: Number(old?.data.attempt ?? 0) + 1,
      };
      return old
        ? repo.save(old, fields)
        : repo.create("sportsAiTask", null, fields);
    });
    let result: Fields | undefined, technicalCode: string | undefined;
    if (!connection.url) technicalCode = "AI_NOT_CONFIGURED";
    else if (!connection.validationRef) technicalCode = "AI_NOT_VALIDATED";
    else {
      try {
        const url = new URL(connection.url);
        demand(
          url.protocol === "https:" ||
            (url.protocol === "http:" &&
              ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)),
          "AI地址须为HTTPS或本地测试服务。",
        );
        const materials = repo
          .all("sportsMaterial")
          .filter((m) => m.data.batchId === batch.id)
          .map((m) => {
            const blob = db
              .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
              .get(String(m.data.sha256));
            demand(blob, "原始材料不可用。");
            return {
              id: m.id,
              mime: m.data.mime,
              phase: m.data.phase ?? "AUXILIARY",
              sha256: m.data.sha256,
              contentBase64: Buffer.from(blob.bytes as Uint8Array).toString(
                "base64",
              ),
            };
          });
        const response = await fetch(url, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(20000),
          headers: {
            "Content-Type": "application/json",
            ...(connection.token
              ? { Authorization: `Bearer ${connection.token}` }
              : {}),
          },
          body: JSON.stringify({
            requestId: task.data.requestId,
            recordId: record.id,
            recordVersion: record.version,
            batchId: batch.id,
            batchVersion: batch.version,
            validationRef: connection.validationRef,
            description: record.data.description,
            category: record.data.category,
            activityType: record.data.activityType,
            ruleSnapshot: record.data.ruleSnapshot,
            materials,
          }),
        });
        demand(
          response.ok &&
            response.headers.get("content-type")?.includes("application/json"),
          "AI响应无效。",
        );
        // Stream-bound the response; never read an unbounded upstream body into memory.
        const reader = response.body?.getReader();
        demand(reader, "AI响应为空。");
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.length;
          if (size > 65536) {
            await reader.cancel();
            throw new Error("AI response too large");
          }
          chunks.push(next.value);
        }
        const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        demand(
          value &&
            typeof value === "object" &&
            value.requestId === task.data.requestId &&
            value.recordId === record.id &&
            value.recordVersion === record.version &&
            value.batchId === batch.id &&
            value.batchVersion === batch.version,
          "AI对象或版本不匹配。",
        );
        demand(
          value.checksCompleted === true &&
            ["NORMAL", "EXCEPTION"].includes(value.outcome) &&
            typeof value.modelVersion === "string" &&
            value.modelVersion.length > 0 &&
            value.modelVersion.length <= 100,
          "AI未完成必要检查。",
        );
        result = {
          outcome: value.outcome,
          modelVersion: value.modelVersion,
          validationRef: connection.validationRef,
        };
      } catch {
        technicalCode = "AI_UNAVAILABLE_OR_INVALID_RESPONSE";
      }
    }
    transaction(db, () => {
      const latest = repo.get(record.id, "sportsRecord");
      const same =
        latest.version === record.version &&
        latest.data.status === "PENDING_AI" &&
        latest.data.batchId === batch.id &&
        repo.get(batch.id).version === batch.version;
      if (
        !same ||
        repo.all("sportsSystem").some((s) => s.data.mode !== "NORMAL")
      ) {
        repo.create("sportsAiAttempt", null, {
          taskId: task.id,
          ...task.data,
          status: "DISCARDED",
          endedAt: Date.now(),
          reason: "STATE_OR_VERSION_CHANGED",
        });
        repo.save(task, {
          status: "DISCARDED",
          endedAt: Date.now(),
          reason: "STATE_OR_VERSION_CHANGED",
        });
        return;
      }
      repo.create("sportsAiAttempt", null, {
        taskId: task.id,
        ...task.data,
        status: technicalCode ? "FAILED" : "COMPLETE",
        endedAt: Date.now(),
        technicalCode: technicalCode ?? null,
        result: result ?? null,
      });
      repo.save(task, {
        status: technicalCode ? "FAILED" : "COMPLETE",
        endedAt: Date.now(),
        technicalCode: technicalCode ?? null,
        result: result ?? null,
      });
      if (technicalCode) {
        repo.save(latest, { status: "TECHNICAL", technicalCode });
        repo.create("sportsReviewEvent", null, {
          recordId: record.id,
          batchId: batch.id,
          taskId: task.id,
          action: "TECHNICAL_FAILURE",
          technicalCode,
          at: Date.now(),
        });
        repo.notify(
          [record.ownerId!],
          record.id,
          "sports.ai.technical",
          "运动材料已保存，检查服务暂不可用，正在技术处理中；不会因此判为无效。",
        );
      } else if (result?.outcome === "EXCEPTION")
        enqueueTeacher(repo, latest, `AI:${task.id}`);
      else {
        const saved = repo.save(latest, {
          status: "VALID",
          lastDecisionAt: Date.now(),
          aiTaskId: task.id,
          technicalCode: null,
        });
        repo.create("sportsReviewEvent", null, {
          recordId: record.id,
          batchId: batch.id,
          taskId: task.id,
          action: "AI_PASS",
          at: Date.now(),
        });
        recalculateProgress(repo, saved, "AI_PASS");
        repo.notify(
          [record.ownerId!],
          record.id,
          "sports.ai.pass",
          "运动记录已通过检查，进度已按课程规则重新计算。",
        );
      }
    });
  } finally {
    running.delete(db);
  }
}
