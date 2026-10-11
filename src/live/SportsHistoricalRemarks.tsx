import { useState } from "react";
import { api } from "./api";
type Page = {
  items: {
    publicationId: string;
    courseId: string;
    enrollmentId: string;
    remark: string | null;
    publishedAt: number | null;
  }[];
  nextCursor: string | null;
  readAt: string;
};
export function SportsHistoricalRemarks() {
  const [purpose, setPurpose] = useState(""),
    [publicationId, setPublicationId] = useState(""),
    [page, setPage] = useState<Page | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function read(cursor?: string) {
    setBusy(true);
    setError("");
    setPage(null);
    try {
      const query = new URLSearchParams({
        purpose,
        ...(publicationId ? { publicationId } : {}),
        ...(cursor ? { cursor } : {}),
      });
      setPage(
        await api<Page>("/api/sports/historical-final-grade-remarks?" + query),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "读取失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="v2-panel live-card">
      <summary>旧成绩备注（审计读取）</summary>
      <p>
        填写教学读取用途。此入口仅显示保留的旧备注；每页读取记录用途、对象及服务器时间。
      </p>
      <label>
        用途
        <input
          value={purpose}
          maxLength={500}
          disabled={busy}
          onChange={(e) => {
            setPurpose(e.target.value);
            setPage(null);
          }}
        />
      </label>
      <label>
        发布记录ID（可留空）
        <input
          value={publicationId}
          disabled={busy}
          onChange={(e) => {
            setPublicationId(e.target.value);
            setPage(null);
          }}
        />
      </label>
      <button disabled={busy || !purpose.trim()} onClick={() => void read()}>
        读取旧备注
      </button>
      {error && <p role="alert">{error}</p>}
      {page && (
        <>
          <p>
            服务器读取时间：{page.readAt}；本页{page.items.length}条
          </p>
          {page.items.map((r) => (
            <p key={r.publicationId}>
              发布记录：{r.publicationId} · 课程：{r.courseId} · 旧备注：
              {r.remark ?? "无"}
            </p>
          ))}
          {page.nextCursor && (
            <button disabled={busy} onClick={() => void read(page.nextCursor!)}>
              下一页
            </button>
          )}
        </>
      )}
    </details>
  );
}
