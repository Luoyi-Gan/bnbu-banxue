import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
type Row = {
  row: number;
  sourceRow?: number;
  columnError?: boolean;
  studentNumber: string;
  name: string;
  excluded?: boolean;
  status?: string;
  reason?: string;
};
export interface RosterCheck {
  snapshotId: string;
  rawRowCount: number;
  excludedCount: number;
  rows: Row[];
  outside: {
    enrollmentId: string;
    studentName: string;
    studentNumber: string;
  }[];
  completeCount: number;
  incompleteCount: number;
  conflictCount: number;
  denominator: number | null;
  registrationPercent: number | null;
  status: string;
}
const labels: Record<string, string> = {
  COMPLETE: "匹配完成",
  INCOMPLETE: "注册或入班未完成",
  CONFLICT: "身份资料冲突",
};
export function SportsRoster({
  course,
  drafts,
  snapshots,
  bases,
  checks,
  open,
  busy,
}: {
  course: LiveEntity;
  drafts: LiveEntity[];
  snapshots: LiveEntity[];
  bases: LiveEntity[];
  checks: RosterCheck[];
  open: OpenForm;
  busy: boolean;
}) {
  const basis = bases.find((b) => b.data.courseId === course.id),
    check = checks.find((c) => c.snapshotId === basis?.data.snapshotId);
  return (
    <details>
      <summary>学校正式名单与注册核对</summary>
      <p>
        名单只作为核对基准，不创建账号或入班关系。注册匹配完成与体测、运动达标分别统计。
      </p>
      {course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <button
            disabled={busy}
            onClick={() =>
              open(
                "读取学校名单CSV草稿",
                "sports.roster.preview",
                [
                  {
                    key: "csv",
                    label: "学号、姓名两列CSV（当前粘贴入口200,000字符）",
                    type: "textarea",
                    value: "student_number,name\n",
                  },
                ],
                { courseId: course.id },
              )
            }
          >
            新建名单草稿
          </button>
        )}
      {drafts
        .filter(
          (d) => d.data.courseId === course.id && d.data.status === "DRAFT",
        )
        .map((d) => (
          <details key={d.id}>
            <summary>待核对名单 · {d.id}</summary>
            <pre>{String(d.data.csv)}</pre>
            <table>
              <thead>
                <tr>
                  <th>原行</th>
                  <th>学号</th>
                  <th>姓名</th>
                  <th>处理</th>
                </tr>
              </thead>
              <tbody>
                {(d.data.rows as Row[]).map((r) => (
                  <tr key={r.row}>
                    <td>
                      {r.sourceRow ?? r.row}
                      {r.columnError && " · 来源字段有疑点，须修正"}
                    </td>
                    <td>{r.studentNumber}</td>
                    <td>{r.name}</td>
                    <td>
                      {r.excluded && `已排除：${r.reason}`}
                      <button
                        disabled={busy}
                        onClick={() =>
                          open(
                            "核对名单行（不修改学生资料）",
                            "sports.roster.row",
                            [
                              {
                                key: "studentNumber",
                                label: "学校名单学号",
                                value: r.studentNumber,
                              },
                              {
                                key: "name",
                                label: "学校名单姓名",
                                value: r.name,
                              },
                              { key: "reason", label: "对照原名单的修正依据" },
                            ],
                            { id: d.id, version: d.version, row: r.row },
                          )
                        }
                      >
                        修正 / 恢复保留
                      </button>
                      {!r.excluded && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            open(
                              "明确排除错误行并保留依据",
                              "sports.roster.row",
                              [{ key: "reason", label: "排除原因" }],
                              {
                                id: d.id,
                                version: d.version,
                                row: r.row,
                                exclude: true,
                              },
                            )
                          }
                        >
                          排除此行
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              disabled={busy}
              onClick={() =>
                open(
                  "确认学校名单快照",
                  "sports.roster.confirm",
                  [
                    {
                      key: "confirmed",
                      label:
                        "确认由学校提供，并已逐行核对保留内容；重复和身份冲突继续列为待核对",
                      type: "checkbox",
                    },
                  ],
                  {
                    id: d.id,
                    version: d.version,
                    basisVersion: basis?.version ?? 0,
                  },
                )
              }
            >
              确认正式核对基准
            </button>
          </details>
        ))}
      {check ? (
        <section>
          <p>
            原始{check.rawRowCount}行，明确排除{check.excludedCount}行；分母：
            {check.denominator ?? "核对中"}；注册匹配完成{check.completeCount}
            ，未完成（含冲突）{check.incompleteCount}，冲突{check.conflictCount}
            ；注册匹配比例：
            {check.registrationPercent === null
              ? "核对中"
              : `${check.registrationPercent}%`}
            。
          </p>
          <table>
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>当前核对</th>
              </tr>
            </thead>
            <tbody>
              {check.rows.map((r) => (
                <tr key={r.row}>
                  <td>{r.studentNumber}</td>
                  <td>{r.name}</td>
                  <td>
                    {labels[r.status ?? ""]}：{r.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>名单外有效成员（{check.outside.length}，不计分母）</h4>
          {check.outside.map((m) => (
            <p key={m.enrollmentId}>
              {m.studentNumber} · {m.studentName}
            </p>
          ))}
        </section>
      ) : (
        <p>暂无教师确认的学校名单，不生成完成率。</p>
      )}
      <details>
        <summary>已确认快照与回退</summary>
        {snapshots
          .filter((s) => s.data.courseId === course.id)
          .map((s) => (
            <p key={s.id}>
              {s.id} · {new Date(Number(s.data.confirmedAt)).toLocaleString()}{" "}
              {basis?.data.snapshotId === s.id ? (
                "当前基准"
              ) : (
                <button
                  disabled={busy || course.data.settlementStatus === "SETTLED"}
                  onClick={() =>
                    open(
                      "回退名单核对基准",
                      "sports.roster.restore",
                      [
                        { key: "reason", label: "回退原因" },
                        {
                          key: "confirmed",
                          label:
                            "仅更换名单核对基准，不撤销入班、打卡或其他教学事实",
                          type: "checkbox",
                        },
                      ],
                      { id: s.id, basisVersion: basis?.version ?? 0 },
                    )
                  }
                >
                  设为核对基准
                </button>
              )}
            </p>
          ))}
      </details>
    </details>
  );
}
