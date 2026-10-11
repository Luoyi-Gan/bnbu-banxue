import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export interface ReviewClock {
  calculationStatus: string;
  remainingMilliseconds: number | null;
  deadline: number | null;
  overdue: boolean;
  paused: boolean;
}
export interface CalendarData {
  canManageCalendar: boolean;
  calendars: LiveEntity[];
  calendarRounds: {
    id: string;
    version: number;
    courseId: string;
    startedAt: number;
    clock: ReviewClock;
  }[];
  slaReminders: LiveEntity[];
}
export function ReviewDeadline({ clock }: { clock?: ReviewClock }) {
  if (!clock || clock.calculationStatus !== "CALCULABLE")
    return <p>学校日历未配置或覆盖不足，本轮处理时限无法可靠计算。</p>;
  return (
    <p>
      {clock.paused
        ? "本轮计时暂停"
        : clock.overdue
          ? "本轮审核已超时，请处理"
          : `剩余学校工作时间：${Math.ceil(Number(clock.remainingMilliseconds) / 60000)}分钟`}
      {clock.deadline !== null
        ? ` · 截止 ${new Date(clock.deadline).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`
        : ""}
      。时限提醒不改变学生审核结果。
    </p>
  );
}
export function SportsCalendar({
  data,
  open,
  busy,
}: {
  data: CalendarData;
  open: OpenForm;
  busy: boolean;
}) {
  if (!data.canManageCalendar) return null;
  return (
    <section className="v2-panel live-card">
      <h2>学校工作日日历</h2>
      <p>
        使用学校确认的连续日期表，包含工作日和休息日。新版本仅用于新轮次；已有轮次须明确选择并记录迁移原因。隔离测试日历不能作为正式学校日历。
      </p>
      <button
        disabled={busy}
        onClick={() =>
          open("发布已确认的学校日历版本", "sports.calendar.publish", [
            { key: "name", label: "日历版本名称" },
            {
              key: "source",
              label: "学校权威来源与确认依据",
              type: "textarea",
            },
            {
              key: "daysText",
              label: "连续日期表（每行 YYYY-MM-DD,WORKDAY 或 YYYY-MM-DD,REST）",
              type: "textarea",
            },
            {
              key: "confirmed",
              label: "已核对学校来源及全部日期",
              type: "checkbox",
            },
          ])
        }
      >
        发布新日历版本
      </button>
      {data.calendars.map((c) => (
        <p key={c.id}>
          {String(c.data.name)} · 第{String(c.data.sequence)}版 · 来源：
          {String(c.data.source)}
        </p>
      ))}
      <p>
        当前待处理轮次 {data.calendarRounds.length}；历史超时提醒{" "}
        {data.slaReminders.length}。
      </p>
      {data.calendarRounds.map((r) => (
        <article key={r.id}>
          <p>
            审核轮次 {r.id.slice(0, 8)} · 入队{" "}
            {new Date(r.startedAt).toLocaleString("zh-CN", {
              timeZone: "Asia/Shanghai",
            })}
          </p>
          <ReviewDeadline clock={r.clock} />
          <button
            disabled={busy || !data.calendars.length}
            onClick={() =>
              open(
                "确认本轮日历版本迁移",
                "sports.calendar.bind",
                [
                  {
                    key: "calendarId",
                    label: "已确认日历版本",
                    type: "select",
                    options: data.calendars.map((c) => ({
                      value: c.id,
                      label: String(c.data.name),
                    })),
                  },
                  {
                    key: "reason",
                    label: "迁移原因（保留原审核起点与变更历史）",
                    type: "textarea",
                  },
                ],
                { id: r.id, version: r.version },
              )
            }
          >
            明确更新本轮日历
          </button>
        </article>
      ))}
    </section>
  );
}
