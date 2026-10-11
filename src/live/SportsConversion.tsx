import { useState } from "react";
import type { LiveEntity } from "./api";
import type { OpenForm, Field } from "./ConnectedApp";
type Row = {
  id: string;
  min: number;
  max: number;
  score: number;
  grade: string;
  note: string;
};
const grades: Record<string, string> = {
  EXCELLENT: "优秀",
  GOOD: "良好",
  PASS: "及格",
  FAIL: "不及格",
};
export function SportsConversion({
  tables,
  open,
  busy,
}: {
  tables: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  const [selected, setSelected] = useState("");
  const table = tables.find((t) => t.id === selected) ?? tables[0];
  if (!table) return null;
  const rows = table.data.rows as Row[],
    fixed = { id: table.id, version: table.version };
  const fields = (row: Row): Field[] => [
    { key: "min", label: "最短整数秒（含）", type: "number", value: row.min },
    { key: "max", label: "最长整数秒（含）", type: "number", value: row.max },
    { key: "score", label: "分数（0–100）", type: "number", value: row.score },
    {
      key: "grade",
      label: "等级",
      type: "select",
      value: row.grade,
      options: Object.entries(grades).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "note",
      label: "规则备注",
      type: "textarea",
      value: row.note,
      optional: true,
    },
  ];
  return (
    <section className="v2-panel live-card">
      <h2>耐力跑换算表</h2>
      <p>仅维护内部用时换算；不改变既有学生结果、打卡分钟或教师最终成绩。</p>
      <label>
        换算表选择
        <select value={table.id} onChange={(e) => setSelected(e.target.value)}>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.data.sex === "MALE" ? "男" : "女"} ·{" "}
              {t.data.group === "JUNIOR" ? "大一/大二" : "大三/大四"} ·{" "}
              {String(t.data.event)}米
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={busy}
        onClick={() => {
          const last = rows[rows.length - 1];
          open(
            "新增末尾连续区间",
            "sports.conversion.add",
            fields({
              id: "",
              min: last.max + 1,
              max: last.max + 3,
              score: 0,
              grade: "FAIL",
              note: "",
            }),
            fixed,
          );
        }}
      >
        添加规则
      </button>
      <table>
        <thead>
          <tr>
            <th>用时闭区间（秒）</th>
            <th>分数</th>
            <th>等级</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.min}–{row.max}
              </td>
              <td>{row.score}</td>
              <td>{grades[row.grade]}</td>
              <td>{row.note}</td>
              <td>
                <button
                  disabled={busy}
                  onClick={() =>
                    open("编辑换算行", "sports.conversion.edit", fields(row), {
                      ...fixed,
                      rowId: row.id,
                    })
                  }
                >
                  编辑
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      `删除 ${row.min}–${row.max}秒 / ${row.score}分 / ${grades[row.grade]}`,
                      "sports.conversion.remove",
                      [
                        {
                          key: "confirmed",
                          label: "确认删除此行；整表不连续时不会保存",
                          type: "checkbox",
                        },
                      ],
                      { ...fixed, rowId: row.id },
                    )
                  }
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
