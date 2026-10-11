import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export function SportsGrades({
  course,
  members,
  drafts,
  publications,
  open,
  busy,
}: {
  course: LiveEntity;
  members: LiveEntity[];
  drafts: LiveEntity[];
  publications: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  return (
    <details>
      <summary>教师内部最终成绩</summary>
      <p>
        发布仅形成内部正式版本，不向学生发送分数。成绩为INT整数，不限0–100，不设置备注。
      </p>
      {members
        .filter((m) => m.data.courseId === course.id)
        .map((member) => {
          const draft = drafts.find((d) => d.data.enrollmentId === member.id),
            history = publications
              .filter((p) => p.data.enrollmentId === member.id)
              .sort(
                (a, b) => Number(b.data.sequence) - Number(a.data.sequence),
              );
          return (
            <section key={member.id}>
              <h4>{String(member.data.studentName ?? member.ownerId)}</h4>
              <p>
                当前草稿：
                {draft?.data.status === "DRAFT"
                  ? String(draft.data.score)
                  : "无未发布草稿"}{" "}
                · 最新内部发布：
                {history.length ? String(history[0].data.score) : "未发布"}
              </p>
              {course.data.settlementStatus === "SETTLED" && history[0] && (
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      "更正原内部成绩并生成报告更正版",
                      "sports.correction.apply",
                      [
                        {
                          key: "score",
                          label: "核对后的INT成绩",
                          type: "number",
                          value: Number(history[0].data.score),
                        },
                        {
                          key: "reason",
                          label: "原始依据与更正原因（不作为成绩备注）",
                        },
                      ],
                      {
                        kind: "GRADE",
                        id: history[0].id,
                        version: history[0].version,
                        previousReportId: course.data.settlementReportId,
                        confirmed: true,
                      },
                    )
                  }
                >
                  更正旧事实并出新报告
                </button>
              )}
              {course.data.settlementStatus !== "SETTLED" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      "保存内部成绩草稿",
                      "sports.grade.save",
                      [
                        {
                          key: "score",
                          label: "整数最终成绩",
                          type: "number",
                          value: draft ? Number(draft.data.score) : undefined,
                        },
                      ],
                      { enrollmentId: member.id, version: draft?.version ?? 0 },
                    )
                  }
                >
                  填写 / 修改
                </button>
              )}
              {draft?.data.status === "DRAFT" &&
                course.data.settlementStatus !== "SETTLED" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      open(
                        `确认发布内部成绩：${String(draft.data.score)}`,
                        "sports.grade.publish",
                        [],
                        { id: draft.id, version: draft.version },
                      )
                    }
                  >
                    发布内部版本
                  </button>
                )}
              <details>
                <summary>历次发布（{history.length}）</summary>
                {history.map((p) => (
                  <p key={p.id}>
                    第{String(p.data.sequence)}版 · {String(p.data.score)} ·{" "}
                    {new Date(Number(p.data.publishedAt)).toLocaleString()}
                  </p>
                ))}
              </details>
            </section>
          );
        })}
    </details>
  );
}
