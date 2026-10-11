import { createHash } from "node:crypto";
import { demand, timestamp, type Account } from "../auth";
import { transaction } from "../database";
import {
  Repository,
  enumField,
  integerField,
  textField,
  type Entity,
  type Fields,
} from "../repository";
import { sportsRole, version } from "./courses";
import type { SportsClock } from "./session-clock";
import { inspectMedia } from "./media-inspection";

export const mediaLimits = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  batch: 250 * 1024 * 1024,
};
export function sportsAvailable(repo: Repository) {
  const mode = repo.all("sportsSystem")[0];
  demand(
    !mode || mode.data.mode === "NORMAL",
    "体育服务当前处于维护模式。",
    503,
  );
}
function ownSession(repo: Repository, actor: Account, id: unknown) {
  sportsRole(repo, actor, "student");
  sportsAvailable(repo);
  const session = repo.get(id, "sportsSession");
  demand(session.ownerId === actor.id, "只能提交本人运动材料。", 403);
  return session;
}
export function sportsMaterialCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action !== "sports.record.accept") return undefined;
  const session = ownSession(repo, actor, input.sessionId);
  version(session, input);
  const clock = session.data.clock as unknown as SportsClock;
  demand(
    clock.state === "ENDED" && clock.endedAt !== null,
    "请先结束运动。",
    409,
  );
  demand(
    !repo.all("sportsRecord").some((r) => r.data.sessionId === session.id),
    "本次运动已有材料批次，请续传原批次。",
    409,
  );
  // P-02: neither course closure nor removal cancels an existing legal session's window.
  const now = Date.now();
  demand(
    now < clock.endedAt + 24 * 3600000,
    "首次材料受理须严格早于运动结束后24小时。",
    409,
  );
  const course = repo.get(session.data.courseId, "sportsCourse");
  const semester = repo.get(session.data.semesterId, "sportsSemester");
  demand(
    semester.data.status !== "ARCHIVED" &&
      course.data.settlementStatus !== "SETTLED",
    "课程已结算或学期已归档。",
    409,
  );
  const category = enumField(input, "category", ["RELATED", "OTHER"] as const);
  const description = textField(input, "description", 200);
  // Swimming needs server-linked before/after capture; do not silently accept it as ordinary exercise.
  enumField(input, "activityType", ["EXERCISE"] as const);
  demand(
    Array.isArray(input.files) &&
      input.files.length >= 1 &&
      input.files.length <= 7,
    "每版须包含1–6张照片或最多1段视频。 ",
  );
  const files = input.files.map((value: unknown) => {
    demand(
      value && typeof value === "object" && !Array.isArray(value),
      "文件清单无效。",
    );
    const f = value as Fields;
    const mime = enumField(f, "mime", [
      "image/jpeg",
      "image/png",
      "video/mp4",
    ] as const);
    const size = integerField(
      f,
      "size",
      1,
      mime === "video/mp4" ? mediaLimits.video : mediaLimits.image,
    );
    const sha256 = textField(f, "sha256", 64);
    demand(/^[a-f0-9]{64}$/.test(sha256), "文件SHA-256无效。");
    return { clientId: textField(f, "clientId", 100), mime, size, sha256 };
  });
  demand(
    new Set(files.map((f) => f.clientId)).size === files.length &&
      new Set(files.map((f) => f.sha256)).size === files.length,
    "同一批不能重复列出文件。",
  );
  demand(
    files.filter((f) => f.mime !== "video/mp4").length <= 6 &&
      files.filter((f) => f.mime === "video/mp4").length <= 1 &&
      files.reduce((sum, f) => sum + f.size, 0) <= mediaLimits.batch,
    "材料数量或合计大小超过上限。",
  );
  const record = repo.create("sportsRecord", actor.id, {
    sessionId: session.id,
    courseId: course.id,
    semesterId: semester.id,
    category,
    description,
    activityType: "EXERCISE",
    status: "UPLOADING",
    supplementUsed: false,
    businessDate: clock.businessDate,
    activeMilliseconds: clock.activeMilliseconds,
    ruleSnapshot: session.data.ruleSnapshot,
  });
  const batch = repo.create("sportsMaterialBatch", actor.id, {
    recordId: record.id,
    sessionId: session.id,
    sequence: 1,
    status: "UPLOADING",
    acceptedAt: now,
    uploadDeadline: now + 30 * 60000,
  });
  for (const file of files)
    repo.create("sportsMaterial", actor.id, {
      ...file,
      recordId: record.id,
      batchId: batch.id,
      sessionId: session.id,
      status: "PENDING",
    });
  repo.save(record, { batchId: batch.id });
  repo.notify(
    [actor.id],
    record.id,
    action,
    "运动材料批次已受理，请在30分钟内传完原批文件；受理不代表审核通过。",
  );
  return repo.get(record.id);
}
export function writableMaterial(
  repo: Repository,
  actor: Account,
  id: unknown,
) {
  sportsRole(repo, actor, "student");
  sportsAvailable(repo);
  const material = repo.get(id, "sportsMaterial");
  demand(material.ownerId === actor.id, "只能上传本人材料。", 403);
  const batch = repo.get(material.data.batchId, "sportsMaterialBatch");
  if (material.data.status !== "COMPLETE") {
    demand(
      batch.data.status === "UPLOADING" &&
        Date.now() < Number(batch.data.uploadDeadline),
      "同批材料传输窗口已结束。",
      409,
    );
  }
  return material;
}
export async function uploadMaterial(
  repo: Repository,
  actor: Account,
  id: string,
  bytes: Buffer,
) {
  const original = writableMaterial(repo, actor, id);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  demand(
    bytes.length === original.data.size && sha256 === original.data.sha256,
    "内容与锁定文件清单不一致，不能替换材料。",
    409,
  );
  if (original.data.status === "COMPLETE") return original;
  const metadata = await inspectMedia(bytes, String(original.data.mime));
  // Parsing is async: re-read the actor, mode, batch and authoritative completion time before committing.
  return transaction(repo.db, () => {
    const current = writableMaterial(repo, repo.person(actor.id), id);
    if (current.data.status === "COMPLETE") return current;
    const completedAt = Date.now();
    repo.db
      .prepare(
        "INSERT OR IGNORE INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
      )
      .run(sha256, bytes, timestamp());
    const saved = repo.save(current, {
      status: "COMPLETE",
      completedAt,
      metadata,
    });
    const batch = repo.get(saved.data.batchId, "sportsMaterialBatch");
    const all = repo
      .all("sportsMaterial")
      .filter((m) => m.data.batchId === batch.id);
    if (all.every((m) => m.data.status === "COMPLETE")) {
      repo.save(batch, { status: "COMPLETE", completedAt });
      const record = repo.get(batch.data.recordId, "sportsRecord");
      repo.save(record, { status: "PENDING_AI", submittedAt: completedAt });
      repo.create("sportsReviewEvent", null, {
        recordId: record.id,
        batchId: batch.id,
        action: "MATERIALS_COMPLETE",
        at: completedAt,
      });
      repo.notify(
        [record.ownerId!],
        record.id,
        "sports.material.complete",
        "运动凭证传输完成，等待AI检查；尚未计入进度。",
      );
    }
    repo.db
      .prepare(
        "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(lower(hex(randomblob(16))),?,?,?,?,?,?,?)",
      )
      .run(
        actor.id,
        "student",
        "sports.material.upload",
        id,
        "",
        JSON.stringify({ batchId: batch.id, completedAt }),
        timestamp(),
      );
    return saved;
  });
}
export function visibleRecords(repo: Repository, actor: Account) {
  const identity = repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === actor.id && i.data.status === "verified");
  demand(identity, "没有有效体育身份。", 403);
  return repo
    .all("sportsRecord")
    .filter((r) =>
      identity.data.role === "student"
        ? r.ownerId === actor.id
        : identity.data.role === "teacher" &&
          repo.get(r.data.courseId, "sportsCourse").ownerId === actor.id,
    );
}
export function materialWorkspace(repo: Repository, actor: Account) {
  const records = visibleRecords(repo, actor),
    ids = new Set(records.map((r) => r.id));
  return {
    records,
    materialBatches: repo
      .all("sportsMaterialBatch")
      .filter((b) => ids.has(String(b.data.recordId)))
      .map((b) => ({
        ...b,
        data: {
          ...b.data,
          canUpload:
            b.data.status === "UPLOADING" &&
            Date.now() < Number(b.data.uploadDeadline),
        },
      })),
    materials: repo
      .all("sportsMaterial")
      .filter((m) => ids.has(String(m.data.recordId))),
  };
}
export function readMaterial(repo: Repository, actor: Account, id: string) {
  sportsAvailable(repo);
  const material = repo.get(id, "sportsMaterial");
  demand(
    visibleRecords(repo, actor).some((r) => r.id === material.data.recordId),
    "无权读取该材料。",
    403,
  );
  demand(material.data.status === "COMPLETE", "材料尚未完整到账。", 409);
  const row = repo.db
    .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
    .get(String(material.data.sha256));
  demand(row, "材料存储暂不可用。", 503);
  return {
    bytes: Buffer.from(row.bytes as Uint8Array),
    mime: String(material.data.mime),
  };
}
