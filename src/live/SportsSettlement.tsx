import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
import type { CourseReport } from "../../server/sports/report";
const labels: Record<string, string> = {
  COURSE_NOT_PUBLISHED: "课程未发布",
  ALREADY_SETTLED: "已结算，须走历史更正",
  SEMESTER_ARCHIVED: "学期已归档",
  NEW_STARTS_STILL_OPEN: "尚未结束原收尾期且课程未关闭",
  NO_CONFIRMED_ROSTER: "学校名单尚未确认",
  ROSTER_INCOMPLETE: "名单注册或身份核对未完成",
  ROSTER_OUTSIDE: "名单外成员待核对",
  ROSTER_DRAFT: "名单草稿待核对",
  ROSTER_SOURCE: "名单原件尚未建立草稿",
  ENDURANCE_IMPORT: "体测导入待核对",
  ENDURANCE_SOURCE: "体测原件待建立草稿",
  OPEN_SESSION: "运动会话尚未结束",
  FIRST_MATERIAL_PENDING: "合法首次材料窗口仍有效",
  PENDING_RECORD: "运动记录尚未完成审核",
  ENDURANCE_NOT_RECORDED: "有效成员尚无体测或免测",
  APPLICATION_PENDING: "免测或认证待处理",
  FINAL_GRADE_MISSING: "最终成绩尚未发布",
  FINAL_GRADE_DRAFT: "最终成绩仍有未发布草稿",
  MATERIAL_BATCH_PENDING: "材料批次未完成",
  INCIDENT_REVIEW_REQUIRED: "事故影响的逾期结论待复核",
};
export function SportsSettlement({
  course,
  preparations,
  reports,
  open,
  busy,
}: {
  course: LiveEntity;
  preparations: LiveEntity[];
  reports: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  const prep = preparations
    .filter((p) => p.data.courseId === course.id)
    .sort((a, b) => Number(b.data.preparedAt) - Number(a.data.preparedAt))[0];
  const data = prep?.data.report as CourseReport | undefined;
  return (
    <details>
      <summary>考核结算与冻结报告</summary>
      <p>
        先核对全部合法待办和综合名单，再确认固定版本。未达目标本身不会阻止结算；确认后关闭新业务起点，历史不删除。
      </p>
      {course.data.settlementStatus !== "SETTLED" && (
        <button
          disabled={busy}
          onClick={() =>
            open("准备结算并核对待办", "sports.settlement.prepare", [], {
              id: course.id,
              version: course.version,
            })
          }
        >
          准备结算
        </button>
      )}
      {prep && (
        <section>
          <p>
            准备状态：
            {prep.data.status === "READY"
              ? "可核对确认"
              : prep.data.status === "CONFIRMED"
                ? "已确认"
                : "存在待办"}{" "}
            · {new Date(Number(prep.data.preparedAt)).toLocaleString()}
          </p>
          <ul>
            {(
              prep.data.blockers as {
                code: string;
                objectId: string;
                count: number;
              }[]
            ).map((b, i) => (
              <li key={i}>
                {labels[b.code] ?? b.code}：{b.count}（{b.objectId}）
              </li>
            ))}
          </ul>
          {data && (
            <details>
              <summary>本次准备的固定名单（{data.rows.length}行）</summary>
              <p>
                快照：{data.snapshotId ?? "尚无"} · 规则{data.ruleVersion} ·{" "}
                {data.generatedAt}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>学号/姓名</th>
                    <th>注册/成员</th>
                    <th>体测</th>
                    <th>分类计入/目标</th>
                    <th>剩余目标</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={i}>
                      <td>
                        {r.studentNumber} / {r.name}
                      </td>
                      <td>
                        {r.registration} / {r.membership}
                      </td>
                      <td>{r.facts?.enduranceStatus ?? "未知"}</td>
                      <td>
                        {r.facts
                          ? `${r.facts.categoryTotals.join(" / ")} 分钟；目标 ${r.facts.targets.join(" / ")}`
                          : "未知"}
                      </td>
                      <td>{r.facts?.remaining.join(" / ") ?? "未知"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
          {prep.data.status === "READY" &&
            course.data.settlementStatus !== "SETTLED" && (
              <button
                disabled={busy}
                onClick={() =>
                  open(
                    "已核对综合名单，确认结算并关闭课程",
                    "sports.settlement.confirm",
                    [],
                    { id: prep.id, version: prep.version, confirmed: true },
                  )
                }
              >
                核对后确认结算
              </button>
            )}
        </section>
      )}
      {reports
        .filter((r) => r.data.courseId === course.id)
        .map((r) => (
          <p key={r.id}>
            冻结报告第{String(r.data.sequence)}版 ·{" "}
            {new Date(Number(r.data.confirmedAt)).toLocaleString()} ·{" "}
            {r.data.correctionReason
              ? `更正原因：${String(r.data.correctionReason)} · `
              : ""}
            <a href={`/api/sports/settlement-reports/${r.id}.csv`}>
              下载此固定版本
            </a>
          </p>
        ))}
      <p>
        结算后可更正已有成绩、体测、运动审核或调整/撤销认证认可，填写原因后生成新报告，原版保留。免测及名单历史更正尚待接通。
      </p>
    </details>
  );
}
