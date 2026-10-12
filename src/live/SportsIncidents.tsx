import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export interface IncidentData {
  canManageIncidents: boolean;
  incidents: LiveEntity[];
  corrections: LiveEntity[];
  expiryCandidates: {
    id: string;
    version: number;
    courseId: string;
    terminalEventId: string;
    terminalAt: number;
    roundId: string;
    roundVersion: number;
  }[];
}
export function SportsIncidents({
  data,
  open,
  busy,
}: {
  data: IncidentData;
  open: OpenForm;
  busy: boolean;
}) {
  if (!data.canManageIncidents) return null;
  return (
    <section className="v2-panel live-card">
      <h2>平台事故与错误逾期纠正</h2>
      <p>
        只处理已确认的平台故障。确认影响不会改变教学判断；错误逾期须另行核对，真实逾期不恢复补证。
      </p>
      <button
        disabled={busy}
        onClick={() =>
          open("确认平台不可用的实际影响", "sports.incident.confirm", [
            { key: "reference", label: "唯一事故引用" },
            {
              key: "evidenceRef",
              label: "故障证据与核查依据",
              type: "textarea",
            },
            { key: "reason", label: "公开影响说明", type: "textarea" },
            { key: "startAt", label: "实际不可用开始", type: "datetime-local" },
            { key: "endAt", label: "实际不可用结束", type: "datetime-local" },
            {
              key: "recordIdsText",
              label: "受影响记录编号（每行一个）",
              type: "textarea",
            },
          ])
        }
      >
        确认事故影响
      </button>
      {data.incidents.map((i) => (
        <p key={i.id}>
          {String(i.data.reference)} · {String(i.data.reason)} ·{" "}
          {new Date(Number(i.data.startAt)).toLocaleString()} 至{" "}
          {new Date(Number(i.data.endAt)).toLocaleString()}
        </p>
      ))}
      <h3>系统补证逾期待核对</h3>
      {data.expiryCandidates.length === 0 && <p>暂无当前系统逾期终局。</p>}
      {data.expiryCandidates.map((r) => (
        <article key={r.id}>
          <p>记录编号：{r.id}</p>
          <p>原系统结果时间：{new Date(r.terminalAt).toLocaleString()}</p>
          <button
            disabled={
              busy ||
              !data.incidents.some((i) =>
                (i.data.recordIds as string[]).includes(r.id),
              )
            }
            onClick={() =>
              open(
                "核对并恢复原剩余补证时间",
                "sports.incident.restore",
                [
                  {
                    key: "incidentId",
                    label: "已确认关联事故",
                    type: "select",
                    options: data.incidents
                      .filter((i) =>
                        (i.data.recordIds as string[]).includes(r.id),
                      )
                      .map((i) => ({
                        value: i.id,
                        label: String(i.data.reference),
                      })),
                  },
                  { key: "reason", label: "公开纠错原因", type: "textarea" },
                ],
                {
                  id: r.id,
                  version: r.version,
                  terminalEventId: r.terminalEventId,
                  roundId: r.roundId,
                  roundVersion: r.roundVersion,
                },
              )
            }
          >
            纠正平台造成的错误逾期
          </button>
        </article>
      ))}
      <details>
        <summary>已追加纠错历史（{data.corrections.length}）</summary>
        {data.corrections.map((c) => (
          <p key={c.id}>
            {String(c.data.recordId)} · {String(c.data.reason)} · 恢复时剩余{" "}
            {Math.ceil(Number(c.data.remainingMilliseconds) / 60000)} 分钟
          </p>
        ))}
      </details>
    </section>
  );
}
