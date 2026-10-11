import { useState } from "react";
import { sportsChangedEvent, type LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export function SportsRosterFiles({
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
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function upload() {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const format = file.name.toLowerCase().endsWith(".xlsx")
        ? "xlsx"
        : file.name.toLowerCase().endsWith(".csv")
          ? "csv"
          : "";
      if (!format || file.size > 100 * 1024 * 1024)
        throw Error("请选择不超过100MB的CSV或XLSX学校名单。");
      const response = await fetch(
        `/api/sports/roster-files/${course.id}/${format}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/octet-stream" },
          body: file,
        },
      );
      const value = await response.json();
      if (!response.ok) throw Error(value.message ?? "名单上传失败");
      setFile(null);
      window.dispatchEvent(new Event(sportsChangedEvent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "名单上传失败");
    } finally {
      setPending(false);
    }
  }
  return (
    <details>
      <summary>上传学校名单CSV / XLSX原件</summary>
      <p>
        文件最大100MB，每表最多500个人员行。必需列为学号、姓名（或student_number、name），电子表格直接读取，不经OCR。
      </p>
      {course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <>
            <input
              type="file"
              accept=".csv,.xlsx"
              aria-label="学校名单原件"
              disabled={busy || pending}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              disabled={busy || pending || !file}
              onClick={() => void upload()}
            >
              {pending ? "上传解析中…" : "保存名单原件"}
            </button>
          </>
        )}
      {error && <p role="alert">{error}</p>}
      {sources
        .filter((s) => s.data.courseId === course.id)
        .map((s) => (
          <section key={s.id}>
            <p>
              {String(s.data.format)} · {String(s.data.size)}字节 ·{" "}
              <a href={`/api/sports/roster-sources/${s.id}`} download>
                下载原名单
              </a>
            </p>
            {(
              s.data.sheets as { index: number; name: string; error?: string }[]
            ).map((sheet) => (
              <p key={sheet.index}>
                {sheet.name}{" "}
                {sheet.error ? (
                  `解析失败：${sheet.error}`
                ) : (
                  <button
                    disabled={busy || pending}
                    onClick={() =>
                      open(
                        "打开学校名单核对草稿",
                        "sports.roster.source.import",
                        [],
                        { id: s.id, sheet: sheet.index },
                      )
                    }
                  >
                    建立 / 打开名单草稿
                  </button>
                )}
              </p>
            ))}
          </section>
        ))}
    </details>
  );
}
