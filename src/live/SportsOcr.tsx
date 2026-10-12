import { useState } from "react";
import { api, sportsChangedEvent, type LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
const statusLabels: Record<string, string> = {
  AWAITING_OCR: "等待识别",
  PROCESSING: "正在识别",
  READY: "待教师对照原图核对",
  FAILED: "识别未完成",
};
export function SportsOcr({
  course,
  sources,
  open,
  busy,
  purpose = "ENDURANCE",
}: {
  course: LiveEntity;
  sources: LiveEntity[];
  open: OpenForm;
  busy: boolean;
  purpose?: "ENDURANCE" | "ROSTER";
}) {
  const label = purpose === "ROSTER" ? "纸质学校名单" : "纸质成绩单";
  const [files, setFiles] = useState<File[]>([]),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function act(source?: LiveEntity) {
    setPending(true);
    setError("");
    try {
      if (source)
        await api(`/api/sports/ocr-sources/${source.id}/recognize`, {
          version: source.version,
        });
      else {
        if (
          !files.length ||
          files.length > 20 ||
          files.reduce((n, f) => n + f.size, 0) > 100 * 1024 * 1024
        )
          throw Error("每批须为1–20张原图且合计不超过100MB。");
        const form = new FormData();
        files.forEach((f) => form.append("images", f));
        const response = await fetch(
          `/api/sports/${purpose === "ROSTER" ? "roster-ocr" : "ocr-sources"}/${course.id}`,
          {
            method: "POST",
            credentials: "same-origin",
            body: form,
          },
        );
        const value = await response.json();
        if (!response.ok) throw Error(value.message ?? "原图上传失败");
        setFiles([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "识别暂不可用");
    } finally {
      setPending(false);
      window.dispatchEvent(new Event(sportsChangedEvent));
    }
  }
  return (
    <details>
      <summary>{label}原图与OCR核对</summary>
      <p>
        图片识别只生成草稿，必须对照原图核对。未配置真实识别服务时保留原图并明确提示未接通。
      </p>
      {course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              aria-label={`选择${label}原图`}
              disabled={busy || pending}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <button
              disabled={busy || pending || !files.length}
              onClick={() => void act()}
            >
              {pending ? "处理中…" : "保存原图并尝试识别"}
            </button>
          </>
        )}
      {error && <p role="alert">{error}</p>}
      {sources
        .filter(
          (s) => s.data.courseId === course.id && s.data.sourceType === "OCR",
        )
        .map((s) => (
          <section key={s.id}>
            <p>
              {statusLabels[String(s.data.status)] ?? "待处理"} ·{" "}
              {s.data.error === "OCR_NOT_CONFIGURED"
                ? "真实OCR服务尚未配置"
                : s.data.error
                  ? "识别服务或返回格式异常，原图已保留，可重试"
                  : ""}
            </p>
            {(s.data.images as { id: string }[]).map((image, index) => (
              <details key={image.id}>
                <summary>查看第{index + 1}张原图</summary>
                <a
                  href={`/api/sports/ocr-sources/${s.id}/images/${image.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开原尺寸
                </a>
                <img
                  src={`/api/sports/ocr-sources/${s.id}/images/${image.id}`}
                  alt={`${label}原图${index + 1}`}
                  loading="lazy"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 600,
                    objectFit: "contain",
                  }}
                />
              </details>
            ))}
            {s.data.status === "READY" ? (
              <button
                disabled={busy || pending}
                onClick={() =>
                  open(
                    "打开原图对应识别草稿",
                    purpose === "ROSTER"
                      ? "sports.roster.source.import"
                      : "sports.endurance.source.import",
                    [],
                    { id: s.id, sheet: 0 },
                  )
                }
              >
                打开教师核对草稿
              </button>
            ) : (
              <button
                disabled={
                  busy ||
                  pending ||
                  (s.data.status === "PROCESSING" &&
                    Date.now() - Number(s.data.startedAt) <= 35000)
                }
                onClick={() => void act(s)}
              >
                重试真实识别
              </button>
            )}
          </section>
        ))}
    </details>
  );
}
