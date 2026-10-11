import { useState } from "react";
import { api, command, sportsChangedEvent, type LiveEntity } from "./api";
import { SportsSupplement } from "./SportsSupplement";
import { SportsReviewHistory } from "./SportsReviewHistory";

export interface MaterialData {
  records: LiveEntity[];
  materialBatches: LiveEntity[];
  materials: LiveEntity[];
  deadlineAdjustments?: LiveEntity[];
}
const labels: Record<string, string> = {
  UPLOADING: "等待原批材料传输",
  PENDING_AI: "待AI检查",
  TECHNICAL: "技术处理中",
  TEACHER_PENDING: "待教师复核",
  VALID: "有效",
  INVALID: "无效",
  SUPPLEMENT_REQUIRED: "待补证",
};
export function SportsMaterials({
  session,
  data,
}: {
  session: LiveEntity;
  data: MaterialData & { reviewEvents?: LiveEntity[] };
}) {
  const [files, setFiles] = useState<File[]>([]),
    [category, setCategory] = useState("RELATED"),
    [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const record = data.records.find((r) => r.data.sessionId === session.id);
  const batch = data.materialBatches.find((b) => b.id === record?.data.batchId);
  const materials = data.materials.filter((m) => m.data.batchId === batch?.id);
  const deadline = batch
    ? new Date(Number(batch.data.uploadDeadline)).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      })
    : "";
  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      if (!files.length) throw new Error("请选择原始凭证文件。");
      const prepared = [];
      for (const file of files) {
        if (!["image/jpeg", "image/png", "video/mp4"].includes(file.type))
          throw new Error("仅接受JPEG、PNG和MP4。");
        if (file.size > (file.type === "video/mp4" ? 100 : 10) * 1024 * 1024)
          throw new Error("照片最大10MB，视频最大100MB。");
        const bytes = await file.arrayBuffer();
        const sha256 = Array.from(
          new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          (n) => n.toString(16).padStart(2, "0"),
        ).join("");
        prepared.push({
          file,
          sha256,
          size: file.size,
          mime: file.type,
          clientId: sha256,
        });
      }
      let currentId = record?.id;
      if (!currentId) {
        const accepted = await command("sports.record.accept", {
          sessionId: session.id,
          version: session.version,
          category,
          description,
          activityType: "EXERCISE",
          files: prepared.map(({ sha256, size, mime, clientId }) => ({
            sha256,
            size,
            mime,
            clientId,
          })),
        });
        currentId = accepted.data.id;
      }
      const current = await api<MaterialData>("/api/sports/workspace");
      const locked = current.materials.filter(
        (m) => m.data.recordId === currentId && m.data.status !== "COMPLETE",
      );
      for (const material of locked) {
        const file = prepared.find(
          (p) => p.sha256 === material.data.sha256,
        )?.file;
        if (!file) continue; // Partial same-batch retries may send a subset of missing objects.
        const response = await fetch(`/api/sports/materials/${material.id}`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/octet-stream" },
          body: file,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message ?? "文件传输失败，请续传原文件。");
      }
      setMessage(
        "已发送所选原文件。请核对下方每项传输状态；完整到账后进入检查。",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "提交失败，请重试原文件。");
    } finally {
      setBusy(false);
      window.dispatchEvent(new Event(sportsChangedEvent));
    }
  }
  return (
    <section>
      <h4>
        运动凭证
        {record
          ? ` · ${labels[String(record.data.status)] ?? String(record.data.status)}`
          : ""}
      </h4>
      {!!record?.data.publicReason && (
        <p>
          公开原因：{String((record.data.publicReason as { zh: string }).zh)}
        </p>
      )}
      {!!record?.data.publicExplanation && (
        <p>{String(record.data.publicExplanation)}</p>
      )}
      {record && (
        <p>
          {String(record.data.description)} ·{" "}
          {record.data.category === "RELATED" ? "课程相关" : "其他运动"}
        </p>
      )}
      {batch?.data.sequence === 1 && (
        <p>原批传输截止：{deadline}（截止时刻前须全部到账）</p>
      )}
      {record?.data.status === "SUPPLEMENT_REQUIRED" && (
        <SportsSupplement record={record} data={data} />
      )}
      {materials.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <span>
            {m.data.mime === "video/mp4" ? "视频" : "照片"} ·{" "}
            {m.data.status === "COMPLETE" ? "已到账" : "未到账"}
          </span>
          {m.data.status === "COMPLETE" &&
            (m.data.mime === "video/mp4" ? (
              <video
                controls
                preload="metadata"
                src={`/api/sports/materials/${m.id}`}
                style={{ width: "100%" }}
              />
            ) : (
              <img
                alt="已提交运动凭证"
                src={`/api/sports/materials/${m.id}`}
                style={{ maxWidth: "100%", maxHeight: 240, display: "block" }}
              />
            ))}
        </div>
      ))}
      {record?.data.status === "UPLOADING" &&
        batch &&
        !batch.data.canUpload && (
          <p role="status">
            原批传输窗口已结束，不能继续上传；这不代表已经审核无效。
          </p>
        )}
      {(!record ||
        (record.data.status === "UPLOADING" &&
          batch?.data.canUpload === true)) && (
        <>
          {!record && (
            <>
              <p>
                普通运动凭证。游泳须走运动前后取证专用流程，此入口不受理游泳。
              </p>
              <label>
                运动类别
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={busy}
                >
                  <option value="RELATED">课程相关</option>
                  <option value="OTHER">其他运动</option>
                </select>
              </label>
              <label>
                运动说明
                <textarea
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={busy}
                />
              </label>
            </>
          )}
          <p>
            最多6张JPEG/PNG（每张10MB）、1段含音轨MP4（1–15秒、100MB）。受理后只能续传同批原文件，不能替换。
          </p>
          <label>
            选择运动凭证
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,video/mp4"
              disabled={busy}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          <button
            type="button"
            disabled={busy || !files.length || (!record && !description.trim())}
            onClick={() => void submit()}
          >
            {busy
              ? "正在校验并上传…"
              : record
                ? "续传原批文件"
                : "受理并上传凭证"}
          </button>
        </>
      )}
      {record && <p>记录编号：{record.id}</p>}
      {record && (
        <SportsReviewHistory
          recordId={record.id}
          events={data.reviewEvents ?? []}
        />
      )}
      {record &&
        data.deadlineAdjustments
          ?.filter((a) => a.data.recordId === record.id)
          .map((a) => (
            <p key={a.id}>
              平台故障期限核对：{String(a.data.reason)}
              {!!a.data.before &&
                ` · 原截止 ${new Date(Number((a.data.before as { deadline: number }).deadline)).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`}
              {!!a.data.after &&
                ` · 调整后截止 ${new Date(Number((a.data.after as { deadline: number }).deadline)).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`}
            </p>
          ))}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
