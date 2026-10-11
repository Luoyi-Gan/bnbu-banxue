import type { LiveEntity } from "./api";
import type { OpenForm, Field } from "./ConnectedApp";
import type { MaterialData } from "./SportsMaterials";
import { ReviewDeadline, type ReviewClock } from "./SportsCalendar";
import { SportsReviewHistory } from "./SportsReviewHistory";
export interface ReviewData {
  reviewReasons: { code: string; zh: string; en: string; actions: string[] }[];
  reviewEvents: LiveEntity[];
  reviewRounds: LiveEntity[];
  progress: LiveEntity[];
  manualModes: LiveEntity[];
  canGovernAi: boolean;
  technicalTasks: {
    id: string;
    version: number;
    courseId: string;
    technicalCode: string;
  }[];
}
const states: Record<string, string> = {
  PENDING_AI: "待AI检查",
  TECHNICAL: "技术处理中",
  TEACHER_PENDING: "待教师复核",
  SUPPLEMENT_REQUIRED: "待补证",
  VALID: "有效",
  INVALID: "无效",
  UPLOADING: "材料传输中",
};
export function SportsReview({
  data,
  role,
  open,
  run,
  busy,
}: {
  data: ReviewData & MaterialData & { courses: LiveEntity[] };
  role: unknown;
  open: OpenForm;
  run: (action: string, input: Record<string, unknown>) => Promise<void>;
  busy: boolean;
}) {
  const reasonFields = (decision: string): Field[] =>
    decision === "PASS"
      ? []
      : [
          {
            key: "reason",
            label: "公开原因",
            type: "select",
            options: data.reviewReasons
              .filter((r) => r.actions.includes(decision))
              .map((r) => ({ value: r.code, label: r.zh })),
          },
        ];
  function review(record: LiveEntity, decision: string, correction = false) {
    open(
      correction
        ? `确认更正原结果：${decision === "PASS" ? "有效" : "无效"}`
        : decision === "PASS"
          ? "确认审核通过"
          : decision === "INVALID"
            ? "确认记录无效"
            : "退回一次补证",
      correction ? "sports.review.correct" : "sports.review.decide",
      [
        ...reasonFields(decision),
        {
          key: "publicExplanation",
          label: correction
            ? "更正依据与原因（必填，学生可见）"
            : "公开补充说明（学生可见）",
          type: "textarea",
          optional: !correction,
        },
        {
          key: "checksCompleted",
          label: "已完成规定检查与必要复核",
          type: "checkbox",
        },
        ...(decision === "RETURN"
          ? [
              {
                key: "hours",
                label: "补证总窗口（24或72小时）",
                type: "number" as const,
                value: 24,
              },
              {
                key: "canSupplementOriginal",
                label: "可补充原运动材料，不要求重新运动或事后补拍运动前证据",
                type: "checkbox" as const,
              },
            ]
          : []),
      ],
      {
        id: record.id,
        version: record.version,
        batchId: record.data.batchId,
        decision,
      },
    );
  }
  return (
    <>
      {data.canGovernAi && (
        <section className="v2-panel live-card">
          <h2>AI服务治理</h2>
          <p>
            人工模式限定课程和结束时间，只允许原责任教师审核；管理员不查看凭证、不代审。
          </p>
          <button
            disabled={busy || !data.courses.length}
            onClick={() =>
              open("为指定课程启用人工模式", "sports.ai.manual", [
                {
                  key: "courseId",
                  label: "课程范围",
                  type: "select",
                  options: data.courses.map((c) => ({
                    value: c.id,
                    label: String(c.data.name),
                  })),
                },
                { key: "endAt", label: "结束时间", type: "datetime-local" },
                { key: "reason", label: "启用原因", type: "textarea" },
              ])
            }
          >
            启用课程人工模式
          </button>
          {data.manualModes.map((m) => (
            <p key={m.id}>
              {String(
                data.courses.find((c) => c.id === m.data.courseId)?.data.name ??
                  m.data.courseId,
              )}{" "}
              · {String(m.data.reason)} · 截止
              {new Date(Number(m.data.endAt)).toLocaleString("zh-CN")}{" "}
              {m.data.status === "ACTIVE" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      "停止人工模式",
                      "sports.ai.stop",
                      [{ key: "reason", label: "停止原因", type: "textarea" }],
                      { id: m.id, version: m.version },
                    )
                  }
                >
                  停止
                </button>
              )}
            </p>
          ))}
          <h3>技术失败任务：{data.technicalTasks.length}</h3>
          {data.technicalTasks.map((t) => (
            <p key={t.id}>
              课程：
              {String(
                data.courses.find((c) => c.id === t.courseId)?.data.name ??
                  t.courseId,
              )}{" "}
              · {t.technicalCode}
              <button
                disabled={busy}
                onClick={() =>
                  void run("sports.ai.retry", { id: t.id, version: t.version })
                }
              >
                重试检查
              </button>
            </p>
          ))}
        </section>
      )}
      {role === "teacher" && (
        <>
          <h2>课程运动记录</h2>
          <div className="live-cards">
            {data.records.map((r) => (
              <article className="v2-panel live-card" key={r.id}>
                <h3>
                  {states[String(r.data.status)] ?? String(r.data.status)} ·{" "}
                  {String(r.data.businessDate)}
                </h3>
                <p>{String(r.data.description)}</p>
                <p>
                  类别：
                  {r.data.category === "RELATED" ? "课程相关" : "其他运动"} ·
                  实际时长：
                  {Math.floor(Number(r.data.activeMilliseconds) / 60000)}分钟
                </p>
                {data.materials
                  .filter(
                    (m) =>
                      m.data.batchId === r.data.batchId &&
                      m.data.status === "COMPLETE",
                  )
                  .map((m) =>
                    m.data.mime === "video/mp4" ? (
                      <video
                        key={m.id}
                        controls
                        preload="metadata"
                        src={`/api/sports/materials/${m.id}`}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <img
                        key={m.id}
                        alt="运动凭证"
                        src={`/api/sports/materials/${m.id}`}
                        style={{ maxWidth: "100%", maxHeight: 200 }}
                      />
                    ),
                  )}
                {r.data.status === "TEACHER_PENDING" && (
                  <>
                    <ReviewDeadline
                      clock={
                        data.reviewRounds.find(
                          (round) =>
                            round.data.recordId === r.id &&
                            round.data.status === "OPEN",
                        )?.data.clock as ReviewClock | undefined
                      }
                    />
                    <div className="live-actions">
                      <button disabled={busy} onClick={() => review(r, "PASS")}>
                        通过
                      </button>
                      {r.data.supplementUsed !== true && (
                        <button
                          disabled={busy}
                          onClick={() => review(r, "RETURN")}
                        >
                          退回一次补证
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => review(r, "INVALID")}
                      >
                        判为无效
                      </button>
                    </div>
                  </>
                )}
                {!!r.data.publicReason && (
                  <p>
                    公开原因：
                    {String((r.data.publicReason as { zh: string }).zh)}
                  </p>
                )}
                {["VALID", "INVALID"].includes(String(r.data.status)) && (
                  <div className="live-actions">
                    <button
                      disabled={busy}
                      onClick={() => review(r, "PASS", true)}
                    >
                      依据原材料更正为有效
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => review(r, "INVALID", true)}
                    >
                      依据原材料更正为无效
                    </button>
                  </div>
                )}
                {!!r.data.publicExplanation && (
                  <p>{String(r.data.publicExplanation)}</p>
                )}
                <SportsReviewHistory
                  recordId={r.id}
                  events={data.reviewEvents}
                />
              </article>
            ))}
          </div>
        </>
      )}
      {role === "student" &&
        data.progress.map((p) => (
          <section key={p.id} className="v2-panel live-card">
            <h2>已计入进度</h2>
            <p>
              {String(
                data.courses.find((c) => c.id === p.data.courseId)?.data.name ??
                  "体育课程",
              )}{" "}
              · {Number(p.data.total)} / 1200分钟
            </p>
            <p>
              课程相关 {Number((p.data.categoryTotals as number[])[0])} · 其他{" "}
              {Number((p.data.categoryTotals as number[])[1])}
            </p>
            {(
              p.data.details as {
                recordId: string;
                eligible: number;
                actual: number;
                reason: string;
              }[]
            ).map((d) => (
              <p key={d.recordId}>
                {String(
                  data.records.find((r) => r.id === d.recordId)?.data
                    .businessDate,
                )}
                ：可计{d.eligible}分钟，实际计入{d.actual}分钟；{d.reason}
              </p>
            ))}
          </section>
        ))}
    </>
  );
}
