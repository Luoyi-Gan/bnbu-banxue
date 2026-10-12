import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export interface SportsSystemData {
  system: {
    version: number;
    mode: string;
    policyVersion: string;
    changedAt: number | null;
    canManage: boolean;
    announcement: {
      titleZh: string;
      titleEn: string;
      bodyZh: string;
      bodyEn: string;
      estimatedRecoveryAt: number;
    } | null;
    history: LiveEntity[];
    supplements: { id: string; remaining: number; paused: boolean }[];
  };
}
const time = (value: number) =>
  new Date(value).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
export function SportsSystem({
  data,
  open,
  busy,
}: {
  data: SportsSystemData;
  open: OpenForm;
  busy: boolean;
}) {
  const system = data.system;
  if (!system) return null;
  const maintenance = system.mode === "MAINTENANCE",
    notice = system.announcement;
  return (
    <section className="v2-panel live-card">
      <h2>体育系统 · {maintenance ? "维护中" : "正常"}</h2>
      <p>
        {system.mode} · 策略 {system.policyVersion}
        {system.changedAt ? ` · 更新于${time(system.changedAt)}` : ""}
      </p>
      {maintenance && notice && (
        <>
          <h3>
            {notice.titleZh} / {notice.titleEn}
          </h3>
          <p>{notice.bodyZh}</p>
          <p>{notice.bodyEn}</p>
          <p>
            预计恢复：{time(notice.estimatedRecoveryAt)}；以管理员实际恢复为准。
          </p>
        </>
      )}
      {maintenance && (
        <>
          <p>体育日常业务已暂停。已有补证计时暂停，恢复后继续剩余时间。</p>
          {system.supplements.map((s) => (
            <p key={s.id}>
              待补证记录 {s.id.slice(0, 8)} · 剩余{" "}
              {Math.ceil(s.remaining / 60000)} 分钟 · 计时已暂停
            </p>
          ))}
        </>
      )}
      {system.canManage && (
        <button
          disabled={busy}
          onClick={() =>
            open(
              maintenance ? "确认切换：维护 → 正常" : "确认切换：正常 → 维护",
              "sports.system.mode",
              [
                {
                  key: "reason",
                  label: "变更原因（影响范围与恢复条件）",
                  type: "textarea",
                },
                ...(!maintenance
                  ? [
                      { key: "titleZh", label: "中文公告标题" },
                      { key: "titleEn", label: "英文公告标题" },
                      {
                        key: "bodyZh",
                        label: "中文公告正文",
                        type: "textarea" as const,
                      },
                      {
                        key: "bodyEn",
                        label: "英文公告正文",
                        type: "textarea" as const,
                      },
                      {
                        key: "estimatedRecoveryAt",
                        label: "预计恢复时间",
                        type: "datetime-local" as const,
                      },
                    ]
                  : []),
              ],
              {
                version: system.version,
                mode: maintenance ? "NORMAL" : "MAINTENANCE",
              },
            )
          }
        >
          {maintenance ? "恢复正常模式" : "进入维护模式"}
        </button>
      )}
      {system.canManage && (
        <details>
          <summary>只读模式变更历史（{system.history.length}）</summary>
          {system.history.map((h) => (
            <p key={h.id}>
              {time(Number(h.data.at))} · {String(h.data.before)} →{" "}
              {String(h.data.after)} · {String(h.data.reason)} · 操作人{" "}
              {h.ownerId} · 公告
              {h.data.announcementPublished ? "已发布" : "未发布"}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
