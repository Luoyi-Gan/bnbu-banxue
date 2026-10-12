import { callSportsAi } from './ai-adapter';
import { randomUUID } from "node:crypto";
import { demand } from "../auth";
import { transaction, type Database } from "../database";
import { Repository, type Fields } from "../repository";
import { completeBatch, enqueueTeacher, manualMode } from "./review";
import { recalculateProgress } from "./progress";
import { expireSupplements } from "./supplements";
import { flagExpiredTransfers } from "./material-transfer";
import { checkDeadlineReminders } from "./deadline-reminders";
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
    transaction(db, () => flagExpiredTransfers(repo));
    transaction(db, () => expireSupplements(repo));
    transaction(db, () => checkReviewReminders(repo));
    transaction(db, () => checkDeadlineReminders(repo));
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
        result = await callSportsAi(connection,record,batch,task,materials);
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
