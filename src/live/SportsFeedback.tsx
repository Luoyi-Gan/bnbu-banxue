import { useState } from "react";
import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
const types: Record<string, string> = {
  BUG: "功能异常",
  SUGGESTION: "功能建议",
  ACCESSIBILITY: "无障碍问题",
  PRIVACY: "隐私问题",
  OTHER: "其他",
};
const states: Record<string, string> = {
  NEW: "待受理",
  PROCESSING: "受理中",
  TECHNICAL: "待技术团队处理",
  RESOLVED: "处理完成",
  CLOSED: "已关闭",
};
const options = (values: Record<string, string>) =>
  Object.entries(values).map(([value, label]) => ({ value, label }));
export function SportsFeedback({
  items,
  replies,
  manage,
  student,
  open,
  busy,
}: {
  items: LiveEntity[];
  replies: LiveEntity[];
  manage: boolean;
  student: boolean;
  open: OpenForm;
  busy: boolean;
}) {
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(0);
  if (!manage && !student) return null;
  const filtered = items.filter(
    (f) =>
      (!type || f.data.type === type) &&
      (!status || f.data.status === status) &&
      [
        f.id,
        f.data.description,
        f.data.studentName,
        f.data.studentNumber,
        f.data.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const current = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / 6) - 1),
  );
  const filterStatus = (value: string) => {
    setStatus(value);
    setPage(0);
  };
  return (
    <section className="v2-panel live-card">
      <h2>{manage ? "学生问题反馈" : "我的体育反馈"}</h2>
      {student && (
        <button
          disabled={busy}
          onClick={() =>
            open("提交体育反馈", "sports.feedback.submit", [
              {
                key: "type",
                label: "问题类型",
                type: "select",
                options: options(types),
              },
              {
                key: "description",
                label: "问题描述（不要填写密码或他人隐私）",
                type: "textarea",
              },
            ])
          }
        >
          提交问题
        </button>
      )}
      {manage && (
        <div>
          <button onClick={() => filterStatus("")}>
            总数 {items.length}（待处理{" "}
            {
              items.filter((f) =>
                ["NEW", "PROCESSING", "TECHNICAL"].includes(
                  String(f.data.status),
                ),
              ).length
            }
            ）
          </button>
          <button onClick={() => filterStatus("TECHNICAL")}>
            待技术处理{" "}
            {items.filter((f) => f.data.status === "TECHNICAL").length}
          </button>
          <button onClick={() => filterStatus("RESOLVED")}>
            处理完成 {items.filter((f) => f.data.status === "RESOLVED").length}
          </button>
        </div>
      )}
      <label>
        搜索反馈
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </label>
      <label>
        问题类型
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
        >
          <option value="">全部</option>
          {options(types).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        状态
        <select value={status} onChange={(e) => filterStatus(e.target.value)}>
          <option value="">全部</option>
          {options(states).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => {
          setQuery("");
          setType("");
          filterStatus("");
        }}
      >
        清除筛选
      </button>
      {!filtered.length && <p>没有符合条件的反馈。</p>}
      {filtered.slice(current * 6, current * 6 + 6).map((f) => (
        <details key={f.id}>
          <summary>
            {types[String(f.data.type)]} · {states[String(f.data.status)]} ·{" "}
            {String(f.data.description).slice(0, 60)}
          </summary>
          <p>
            编号：{f.id} · {new Date(f.createdAt).toLocaleString()}
          </p>
          {manage && (
            <p>
              {String(f.data.studentName)} · 学号{" "}
              {String(f.data.studentNumber) || "未提供"} ·{" "}
              {String(f.data.email)}
            </p>
          )}
          <p style={{ whiteSpace: "pre-wrap" }}>{String(f.data.description)}</p>
          {replies
            .filter((r) => r.data.feedbackId === f.id)
            .sort(
              (a, b) =>
                Number(a.data.sequence) - Number(b.data.sequence),
            )
            .map((r) => (
              <blockquote key={r.id}>
                <p>
                  {String(r.data.actorName)} ·{" "}
                  {new Date(Number(r.data.at)).toLocaleString()} ·{" "}
                  {states[String(r.data.status)]}
                </p>
                <p style={{ whiteSpace: "pre-wrap" }}>{String(r.data.reply)}</p>
              </blockquote>
            ))}
          {manage && (
            <button
              disabled={busy}
              onClick={() =>
                open(
                  "追加公开回复",
                  "sports.feedback.reply",
                  [
                    {
                      key: "status",
                      label: "处理状态",
                      type: "select",
                      value:
                        f.data.status === "NEW"
                          ? "PROCESSING"
                          : String(f.data.status),
                      options: options(
                        Object.fromEntries(
                          Object.entries(states).filter(([k]) => k !== "NEW"),
                        ),
                      ),
                    },
                    {
                      key: "reply",
                      label: "学生可见回复（不提供成绩、密码或他人身份信息）",
                      type: "textarea",
                    },
                  ],
                  { id: f.id, version: f.version },
                )
              }
            >
              处理 / 继续跟进
            </button>
          )}
        </details>
      ))}
      <p>
        <button disabled={current === 0} onClick={() => setPage(current - 1)}>
          上一页
        </button>{" "}
        {current + 1} / {Math.max(1, Math.ceil(filtered.length / 6))}{" "}
        <button
          disabled={(current + 1) * 6 >= filtered.length}
          onClick={() => setPage(current + 1)}
        >
          下一页
        </button>
      </p>
    </section>
  );
}
