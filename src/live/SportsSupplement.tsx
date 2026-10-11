import { useState } from "react";
import { api, command, sportsChangedEvent, type LiveEntity } from "./api";
import type { MaterialData } from "./SportsMaterials";

export function SportsSupplement({
  record,
  data,
}: {
  record: LiveEntity;
  data: MaterialData;
}) {
  const [reuse, setReuse] = useState<string[]>([]),
    [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const clock = record.data.supplementClock as {
    paused: boolean;
    remaining: number;
    deadline: number;
    canSubmit: boolean;
  };
  const batch = data.materialBatches.find(
    (b) => b.id === record.data.supplementBatchId,
  );
  const originals = data.materials.filter(
    (m) =>
      m.data.batchId === record.data.batchId && m.data.status === "COMPLETE",
  );
  const materials = data.materials.filter((m) => m.data.batchId === batch?.id);
  async function perform(submit: boolean | "reset" = false) {
    setBusy(true);
    setMessage("");
    try {
      if (submit === "reset") {
        await command("sports.supplement.reset", {
          id: record.id,
          version: record.version,
        });
        setFiles([]);
        setReuse([]);
        setMessage(
          "未正式提交的准备包已放弃，请重新选择；补证期限和次数不变。",
        );
      } else if (submit) {
        await command("sports.supplement.submit", {
          id: record.id,
          version: record.version,
        });
        setMessage("补证已正式受理，等待教师复核。");
      } else {
        const prepared = await Promise.all(
          files.map(async (file) => ({
            file,
            mime: file.type,
            size: file.size,
            sha256: Array.from(
              new Uint8Array(
                await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
              ),
              (n) => n.toString(16).padStart(2, "0"),
            ).join(""),
          })),
        );
        if (!batch)
          await command("sports.supplement.prepare", {
            id: record.id,
            version: record.version,
            reuseIds: reuse,
            files: prepared.map(({ mime, size, sha256 }) => ({
              mime,
              size,
              sha256,
              clientId: sha256,
            })),
          });
        const fresh = await api<MaterialData>("/api/sports/workspace");
        const current = fresh.records.find((r) => r.id === record.id)!;
        for (const material of fresh.materials.filter(
          (m) =>
            m.data.batchId === current.data.supplementBatchId &&
            m.data.status !== "COMPLETE",
        )) {
          const file = prepared.find(
            (p) => p.sha256 === material.data.sha256,
          )?.file;
          if (!file) continue;
          const response = await fetch(`/api/sports/materials/${material.id}`, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/octet-stream" },
            body: file,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message ?? "上传失败。");
        }
        setMessage(
          "请核对补证包；全部到账后点击正式提交，上传不等于正式受理。",
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "补证操作失败。");
    } finally {
      setBusy(false);
      window.dispatchEvent(new Event(sportsChangedEvent));
    }
  }
  if (!clock) return null;
  return (
    <section>
      <h4>一次补证</h4>
      <p>
        {clock.paused
          ? "计时已暂停"
          : `最终截止：${new Date(clock.deadline).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`}{" "}
        · 剩余 {Math.ceil(clock.remaining / 60000)} 分钟
      </p>
      <p>
        仅补充原次运动材料，运动时长、日期与分类保持原记录。原材料永久保留。
      </p>
      {!batch &&
        originals.map((m, index) => (
          <label key={m.id}>
            <input
              type="checkbox"
              checked={reuse.includes(m.id)}
              disabled={busy || !clock.canSubmit}
              onChange={(e) =>
                setReuse((old) =>
                  e.target.checked
                    ? [...old, m.id]
                    : old.filter((id) => id !== m.id),
                )
              }
            />
            沿用原材料 {index + 1}{" "}
            {m.data.phase === "BEFORE"
              ? "（运动前）"
              : m.data.phase === "AFTER"
                ? "（运动后）"
                : ""}
          </label>
        ))}
      {materials.map((m, index) => (
        <p key={m.id}>
          补证材料 {index + 1} ·{" "}
          {m.data.status === "COMPLETE" ? "已到账" : "未到账"}
          {m.data.sourceMaterialId ? "（引用原材料）" : ""}
        </p>
      ))}
      {clock.canSubmit && batch?.data.status !== "READY" && (
        <>
          <p>每版最多6张JPEG/PNG及1段含音轨MP4，复用的原材料也计入本版上限。</p>
          <label>
            选择补证文件
            <input
              type="file"
              accept="image/jpeg,image/png,video/mp4"
              multiple
              disabled={busy}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          <button
            disabled={busy || (!files.length && (!reuse.length || !!batch))}
            onClick={() => void perform()}
          >
            {batch ? "续传补证原文件" : "准备并上传补证包"}
          </button>
        </>
      )}
      {clock.canSubmit && batch?.data.status === "READY" && (
        <button disabled={busy} onClick={() => void perform(true)}>
          正式提交一次补证
        </button>
      )}
      {clock.canSubmit && batch && (
        <button disabled={busy} onClick={() => void perform("reset")}>
          放弃未提交包并重新选择
        </button>
      )}
      {!clock.paused && !clock.canSubmit && (
        <p>补证期限已结束，等待服务器确认最终状态。</p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
