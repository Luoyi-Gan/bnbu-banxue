import { useState } from "react";
import { sportsChangedEvent, type LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export function SportsWorkbook({
  course,
  sources,
  open,
  busy,
}: {
  course: LiveEntity;
  sources: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  const [file, setFile] = useState<File | null>(null),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  async function upload() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      if (
        !file.name.toLowerCase().endsWith(".xlsx") ||
        file.size > 100 * 1024 * 1024
      )
        throw Error("请选择不超过100MB的XLSX文件。");
      const response = await fetch(`/api/sports/workbooks/${course.id}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.message ?? "工作簿上传失败");
      window.dispatchEvent(new Event(sportsChangedEvent));
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "无法上传工作簿");
    } finally {
      setUploading(false);
    }
  }
  return (
    <details>
      <summary>XLSX成绩单上传与工作表选择</summary>
      <p>
        第一条非空行为学号、姓名、项目、用时、测试日期（或对应CSV英文字段），每张工作表最多500个人员行。保留原始文件，公式和合并单元格须人工核对。
      </p>
      {course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <>
            <input
              type="file"
              accept=".xlsx"
              aria-label="选择XLSX成绩单"
              disabled={busy || uploading}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              disabled={busy || uploading || !file}
              onClick={() => void upload()}
            >
              {uploading ? "上传并解析中…" : "上传原始XLSX"}
            </button>
          </>
        )}
      {error && <p role="alert">{error}</p>}
      {sources
        .filter((s) => s.data.courseId === course.id)
        .map((source) => (
          <section key={source.id}>
            <p>
              原文件 · {Number(source.data.size).toLocaleString()}字节 ·{" "}
              <a href={`/api/sports/workbook-sources/${source.id}`} download>
                下载核对原件
              </a>
            </p>
            {(
              source.data.sheets as {
                index: number;
                name: string;
                error?: string;
              }[]
            ).map((sheet) => (
              <p key={sheet.index}>
                {sheet.name}{" "}
                {sheet.error ? (
                  `：${sheet.error}`
                ) : (
                  <button
                    disabled={busy || uploading}
                    onClick={() =>
                      open(
                        `读取工作表：${sheet.name}`,
                        "sports.endurance.source.import",
                        [],
                        { id: source.id, sheet: sheet.index },
                      )
                    }
                  >
                    建立 / 打开核对草稿
                  </button>
                )}
              </p>
            ))}
          </section>
        ))}
    </details>
  );
}
