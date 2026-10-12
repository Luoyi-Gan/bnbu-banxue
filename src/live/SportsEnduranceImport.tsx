import { useState } from "react";
import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
type Row = {
  row: number;
  sourceRow?: number;
  sourceImageId?: string;
  studentNumber: string;
  name: string;
  event: string;
  time: string;
  testDate: string;
  state: string;
  errors: string[];
  reason?: string;
};
function Batch({
  batch,
  open,
  busy,
}: {
  batch: LiveEntity;
  open: OpenForm;
  busy: boolean;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const rows = batch.data.rows as Row[];
  return (
    <details>
      <summary>
        {batch.data.status === "COMPLETE" ? "已处理全部行" : "仍有待处理行"} ·{" "}
        {batch.id}
      </summary>
      <details>
        <summary>原始CSV（保留核对依据）</summary>
        <pre>{String(batch.data.csv)}</pre>
      </details>
      <table>
        <thead>
          <tr>
            <th>选择</th>
            <th>行 / 学号 / 姓名</th>
            <th>项目 / 用时 / 日期</th>
            <th>核对情况</th>
            <th>处理</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.row}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`选择第${row.row}行`}
                  disabled={busy || row.state !== "PENDING"}
                  checked={selected.includes(row.row)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, row.row]
                        : selected.filter((r) => r !== row.row),
                    )
                  }
                />
              </td>
              <td>
                {row.sourceRow ?? row.row}{" "}
                {row.sourceImageId && (
                  <a
                    href={`/api/sports/ocr-sources/${batch.data.sourceId}/images/${row.sourceImageId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    对应原图
                  </a>
                )}{" "}
                · {row.studentNumber} · {row.name}
              </td>
              <td>
                {row.event}米 · {row.time} · {row.testDate}
              </td>
              <td>
                {row.state === "CONFIRMED"
                  ? "已确认"
                  : row.state === "EXCLUDED"
                    ? `已明确排除：${row.reason}`
                    : row.errors.join("；") || "匹配通过，仍须对照成绩单确认"}
              </td>
              <td>
                {row.state !== "CONFIRMED" && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        open(
                          "核对并修正导入行",
                          "sports.endurance.row",
                          [
                            {
                              key: "studentNumber",
                              label: "学号",
                              value: row.studentNumber,
                            },
                            { key: "name", label: "姓名", value: row.name },
                            {
                              key: "event",
                              label: "项目（800或1000）",
                              value: row.event,
                            },
                            {
                              key: "time",
                              label: "整数秒或分:秒",
                              value: row.time,
                            },
                            {
                              key: "testDate",
                              label: "测试日期",
                              type: "date",
                              value: row.testDate,
                            },
                            { key: "reason", label: "核对依据 / 修正原因" },
                          ],
                          {
                            id: batch.id,
                            version: batch.version,
                            row: row.row,
                          },
                        )
                      }
                    >
                      核对 / 修正
                    </button>
                    {row.state !== "EXCLUDED" && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          open(
                            "明确排除此行（保留原始行）",
                            "sports.endurance.row",
                            [
                              {
                                key: "reason",
                                label: "排除原因，须对照原成绩单说明",
                              },
                            ],
                            {
                              id: batch.id,
                              version: batch.version,
                              row: row.row,
                              exclude: true,
                            },
                          )
                        }
                      >
                        排除此行
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        disabled={busy || !selected.length}
        onClick={() =>
          open(
            `确认所选${selected.length}行（任一未解决则全部不写）`,
            "sports.endurance.batch.confirm",
            [
              {
                key: "confirmed",
                type: "checkbox",
                label: "已逐行对照原成绩单核对，确认所选原始事实",
              },
            ],
            { id: batch.id, version: batch.version, rows: selected },
          )
        }
      >
        确认所选行
      </button>
    </details>
  );
}
export function SportsEnduranceImport({
  course,
  imports,
  open,
  busy,
}: {
  course: LiveEntity;
  imports: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  const [csv, setCsv] = useState("student_number,name,event,time,test_date\n"),
    [error, setError] = useState("");
  return (
    <details>
      <summary>电子成绩单CSV导入</summary>
      <p>
        UTF-8
        CSV直接读取，最多500行、200,000字符。用时填写整数秒或分:秒；4.30须人工核对。XLSX使用独立上传入口；图片请使用纸质成绩单入口。
      </p>
      {course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <>
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="选择UTF-8成绩单CSV"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 800000)
                    throw new Error("CSV过大，请分批核对。");
                  const text = new TextDecoder("utf-8", { fatal: true }).decode(
                    await file.arrayBuffer(),
                  );
                  if (text.length > 200000)
                    throw new Error("CSV最多200,000字符。");
                  setCsv(text);
                  setError("");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "无法读取CSV");
                }
              }}
            />
            {error && <p role="alert">{error}</p>}
            <button
              disabled={busy}
              onClick={() =>
                open(
                  "预览电子成绩单草稿",
                  "sports.endurance.import",
                  [
                    {
                      key: "csv",
                      label: "CSV原始内容（可粘贴）",
                      type: "textarea",
                      value: csv,
                    },
                  ],
                  { courseId: course.id },
                )
              }
            >
              读取并核对草稿
            </button>
          </>
        )}
      {imports
        .filter((b) => b.data.courseId === course.id)
        .map((batch) => (
          <Batch
            key={`${batch.id}:${batch.version}`}
            batch={batch}
            open={open}
            busy={busy}
          />
        ))}
    </details>
  );
}
