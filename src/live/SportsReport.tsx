import { useState } from "react";
import { api, type LiveEntity } from "./api";
import type { CourseReport } from "../../shared/live/courseReport";
const status: Record<string, string> = {
  EXEMPT: "已免测",
  COMPLETE: "注册匹配完成",
  INCOMPLETE: "注册入班未完成",
  CONFLICT: "身份冲突",
  SEPARATE_MEMBER: "独立成员行",
  NO_ROSTER: "无确认名单",
  ACTIVE: "有效",
  REMOVED: "已移出",
  NOT_JOINED: "未入班",
  RECORDED: "已录入",
  NOT_RECORDED: "未录入",
};
const todo: Record<string, string> = {
  APPLICATION_PENDING: "免测/认证待处理",
  NO_CONFIRMED_ROSTER: "尚无确认名单",
  ROSTER_INCOMPLETE: "名单内注册核对未完成",
  ROSTER_OUTSIDE: "名单外有效成员",
  ROSTER_DRAFT: "名单核对草稿",
  ROSTER_SOURCE: "名单原件待建立草稿",
  ENDURANCE_IMPORT: "体测草稿待核对",
  ENDURANCE_SOURCE: "体测原件待建立草稿",
  OPEN_SESSION: "未结束会话",
  AWAITING_MATERIALS: "结束后未建立材料批次",
  PENDING_RECORD: "尚未得出有效或无效结论的记录",
  ENDURANCE_NOT_RECORDED: "有效成员尚无体测记录",
};
export function SportsReport({ course }: { course: LiveEntity }) {
  const [report, setReport] = useState<CourseReport | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function refresh() {
    setPending(true);
    setError("");
    setReport(null);
    try {
      setReport(await api(`/api/sports/course-reports/${course.id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "报告读取失败");
    } finally {
      setPending(false);
    }
  }
  return (
    <details>
      <summary>综合名单与报告导出</summary>
      <p>
        分别查看注册、体测和运动进度。报告按生成时事实统计，尚不是期末冻结结算版本。
      </p>
      <button disabled={pending} onClick={() => void refresh()}>
        {pending ? "统计中…" : "生成当前综合报告"}
      </button>
      {error && <p role="alert">{error}</p>}
      {report && (
        <>
          <p>
            名单快照：{report.snapshotId ?? "未确认"} · 规则：
            {report.ruleVersion} · 生成时间：{report.generatedAt} · 分母：
            {report.denominator ?? "核对中"}
          </p>
          <p>
            结算：{report.settlementStatus === "SETTLED" ? "已结算" : "未结算"}{" "}
            · 原始{report.rawRowCount}行，排除{report.excludedCount}行
          </p>
          <a href={`/api/sports/course-reports/${course.id}.csv`}>
            导出最新CSV报告（生成时间以文件为准）
          </a>
          {report.limitations.map((v) => (
            <p key={v}>{v}</p>
          ))}
          <ul>
            {report.unresolved.map((v) => (
              <li key={v.code}>
                {todo[v.code] ?? v.code}：{v.count}
              </li>
            ))}
          </ul>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>学号 / 姓名</th>
                  <th>注册核对 / 成员</th>
                  <th>体测</th>
                  <th>相关计入 / 目标</th>
                  <th>其他计入 / 目标</th>
                  <th>打卡达标</th>
                  <th>异常 / 会话 / 待材料</th>
                  <th>实际 / 无效 / 有效可计未计分钟</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => (
                  <tr key={`${r.source}-${i}`}>
                    <td>
                      {r.studentNumber} / {r.name}
                    </td>
                    <td>
                      {status[r.registration] ?? r.registration} /{" "}
                      {status[r.membership] ?? r.membership}
                      <p>{r.reason}</p>
                    </td>
                    <td>
                      {r.facts
                        ? (status[r.facts.enduranceStatus] ??
                          r.facts.enduranceStatus)
                        : "无法唯一关联"}
                    </td>
                    <td>
                      {r.facts
                        ? `${r.facts.categoryTotals[0]} / ${r.facts.targets[0]}`
                        : "未知"}
                    </td>
                    <td>
                      {r.facts
                        ? `${r.facts.categoryTotals[1]} / ${r.facts.targets[1]}`
                        : "未知"}
                    </td>
                    <td>
                      {r.facts ? (r.facts.met ? "已达标" : "未达标") : "未知"}
                    </td>
                    <td>
                      {r.facts
                        ? `${r.facts.pendingRecords} / ${r.facts.openSessions} / ${r.facts.awaitingMaterials}`
                        : "未知"}
                    </td>
                    <td>
                      {r.facts
                        ? `${r.facts.actualMinutes} / ${r.facts.invalidMinutes} / ${r.facts.validUncountedMinutes}`
                        : "未知"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </details>
  );
}
