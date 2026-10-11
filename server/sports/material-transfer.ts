import { startReviewRound } from "./review";
import { Repository } from "../repository";
/** A missed upload deadline is a pending fact, never a teaching invalidation. */
export function flagExpiredTransfers(repo: Repository, now = Date.now()) {
  for (const batch of repo.all("sportsMaterialBatch")) {
    if (
      batch.data.sequence !== 1 ||
      batch.data.status !== "UPLOADING" ||
      !Number.isFinite(Number(batch.data.uploadDeadline)) ||
      now < Number(batch.data.uploadDeadline)
    )
      continue;
    const record = repo.get(batch.data.recordId, "sportsRecord");
    if (record.data.status !== "UPLOADING" || record.data.batchId !== batch.id)
      continue;
    const materials = repo
      .all("sportsMaterial")
      .filter((m) => m.data.batchId === batch.id);
    const missing = materials
      .filter((m) => m.data.status !== "COMPLETE")
      .map((m) => m.id);
    if (!missing.length) continue;
    const savedBatch = repo.save(batch, {
      status: "TRANSFER_DEADLINE_MISSED",
      detectedAt: now,
      missingMaterialIds: missing,
    });
    const saved = repo.save(record, {
      status: "TRANSFER_PENDING",
      transferDeadlineMissedAt: Number(batch.data.uploadDeadline),
    });
    startReviewRound(repo, saved, now);
    repo.create("sportsReviewEvent", null, {
      recordId: record.id,
      batchId: batch.id,
      action: "TRANSFER_DEADLINE_MISSED",
      at: now,
      missingMaterialIds: missing,
      previousRecordVersion: record.version,
      resultRecordVersion: saved.version,
      batchVersion: savedBatch.version,
    });
    repo.notify(
      [
        record.ownerId!,
        repo.get(record.data.courseId, "sportsCourse").ownerId!,
      ],
      record.id,
      "sports.material.transfer.expired",
      "同批材料传输窗口已结束，仍有材料未到账，待核对原因。此状态不是审核无效，也不代表审核通过；原文件清单和已到账材料继续保留。",
    );
  }
}
