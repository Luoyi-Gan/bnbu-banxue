import type { LiveEntity } from "./api";
const labels: Record<string, string> = {
  PASS: "教师审核通过",
  AI_PASS: "AI检查通过",
  INVALID: "教师判为无效",
  RETURN: "退回一次补证",
  CORRECTION: "教师更正原结果",
  SUPPLEMENT_EXPIRED: "系统确认补证逾期",
  PLATFORM_EXPIRY_CORRECTED: "平台错误逾期已纠正",
  SUPPLEMENT_ACCEPTED: "补证正式受理",
};
export function SportsReviewHistory({
  recordId,
  events,
}: {
  recordId: string;
  events: LiveEntity[];
}) {
  const history = events
    .filter(
      (e) => e.data.recordId === recordId && labels[String(e.data.action)],
    )
    .sort(
      (a, b) =>
        Number(a.data.at) - Number(b.data.at) ||
        a.createdAt.localeCompare(b.createdAt),
    );
  if (!history.length) return null;
  return (
    <details>
      <summary>公开处理历史（{history.length}）</summary>
      {history.map((e) => {
        const reason =
          typeof e.data.reason === "string"
            ? e.data.reason
            : e.data.reason && typeof e.data.reason === "object"
              ? String((e.data.reason as { zh?: string }).zh ?? "")
              : "";
        return (
          <p key={e.id}>
            {new Date(Number(e.data.at)).toLocaleString("zh-CN", {
              timeZone: "Asia/Shanghai",
            })}{" "}
            · {labels[String(e.data.action)]}
            {e.data.action === "CORRECTION"
              ? `：${e.data.decision === "PASS" ? "有效" : "无效"}`
              : ""}
            {reason ? ` · ${reason}` : ""}
            {e.data.publicExplanation
              ? ` · ${String(e.data.publicExplanation)}`
              : ""}
          </p>
        );
      })}
    </details>
  );
}
