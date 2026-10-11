import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";

export function SportsEndurance({
  course,
  members,
  records,
  history,
  exemptions,
  teacher,
  open,
  busy,
}: {
  course: LiveEntity;
  members: LiveEntity[];
  records: LiveEntity[];
  history: LiveEntity[];
  exemptions: LiveEntity[];
  teacher: boolean;
  open: OpenForm;
  busy: boolean;
}) {
  const rows = records.filter((r) => r.data.courseId === course.id);
  const people = teacher
    ? members.filter((m) => m.data.courseId === course.id)
    : rows;
  return (
    <details>
      <summary>耐力跑原始测试记录</summary>
      <p>
        {teacher
          ? "对照真实测试记录逐人核对。用时填写整数秒（例如4分30秒填270），不能填写4.30。换算由系统选择，学生只看到原始事实。"
          : "这里只显示老师确认的项目、原始用时和测试日期。"}
      </p>
      {!people.length && <p>未录入体测。</p>}
      {people.map((person) => {
        const exempt = !!exemptions.find(
          (e) =>
            e.data.courseId === course.id &&
            e.ownerId === person.ownerId &&
            e.data.status === "APPROVED",
        );
        const row = teacher
          ? rows.find((r) => r.data.enrollmentId === person.id)
          : person;
        const versions = history
          .filter((h) => h.data.recordId === row?.id)
          .sort(
            (a, b) =>
              Number(b.data.recordVersion) - Number(a.data.recordVersion),
          );
        const conversion = row?.data.conversion as
          | { status?: string; score?: number; grade?: string; reason?: string }
          | undefined;
        return (
          <section key={person.id}>
            {teacher && (
              <h4>{String(person.data.studentName ?? person.ownerId)}</h4>
            )}
            <p>
              {exempt
                ? "耐力跑已批准免测（原始历史仍保留）"
                : row
                  ? row.data.exempt
                    ? "耐力跑已批准免测"
                    : `${row.data.event}米 · ${row.data.seconds}秒 · ${row.data.testDate}`
                  : "未录入体测"}
            </p>
            {teacher && conversion && (
              <p>
                内部换算：
                {conversion.status === "AVAILABLE"
                  ? `${conversion.score}分 · ${conversion.grade}`
                  : `不可用：${conversion.reason}`}
              </p>
            )}
            {teacher &&
              !exempt &&
              course.data.settlementStatus !== "SETTLED" &&
              (row ||
                (course.data.status === "PUBLISHED" &&
                  person.data.status === "ACTIVE")) && (
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      "核对并确认原始测试事实",
                      "sports.endurance.confirm",
                      [
                        {
                          key: "event",
                          label: "原始项目（800或1000米）",
                          type: "number",
                          value: row ? Number(row.data.event) : undefined,
                        },
                        {
                          key: "seconds",
                          label: "真实用时（整数秒）",
                          type: "number",
                          value: row ? Number(row.data.seconds) : undefined,
                        },
                        {
                          key: "testDate",
                          label: "实际测试日期 YYYY-MM-DD",
                          value: row ? String(row.data.testDate) : "",
                        },
                      ],
                      {
                        enrollmentId: person.id,
                        version: row?.version ?? 0,
                        confirmed: true,
                      },
                    )
                  }
                >
                  {row ? "更正原始事实" : "手动录入体测／补测结果"}
                </button>
              )}
            {teacher &&
              !exempt &&
              row &&
              course.data.settlementStatus === "SETTLED" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    open(
                      "核对旧体测事实并生成报告更正版",
                      "sports.correction.apply",
                      [
                        {
                          key: "event",
                          label: "原始项目（800或1000米）",
                          type: "number",
                          value: Number(row.data.event),
                        },
                        {
                          key: "seconds",
                          label: "真实用时（整数秒）",
                          type: "number",
                          value: Number(row.data.seconds),
                        },
                        {
                          key: "testDate",
                          label: "实际测试日期 YYYY-MM-DD",
                          value: String(row.data.testDate),
                        },
                        { key: "reason", label: "原始依据与更正原因" },
                      ],
                      {
                        kind: "ENDURANCE",
                        id: row.id,
                        version: row.version,
                        previousReportId: course.data.settlementReportId,
                        confirmed: true,
                      },
                    )
                  }
                >
                  更正旧事实并出新报告
                </button>
              )}
            {teacher &&
              !exempt &&
              !row &&
              (course.data.status === "CLOSED" ||
                course.data.settlementStatus === "SETTLED") && (
                <button
                  disabled={busy}
                  onClick={() =>
                    window.alert(
                      "课程已结课，不能新增体测或补测结果。缺测记录继续保留，请联系责任教师按人工流程处理；此操作不会补入成绩或重开课程。",
                    )
                  }
                >
                  手动录入补测结果
                </button>
              )}
            {!!versions.length && (
              <details>
                <summary>确认历史（{versions.length}）</summary>
                {versions.map((v) => (
                  <p key={v.id}>
                    第{String(v.data.recordVersion)}版：{String(v.data.event)}米
                    · {String(v.data.seconds)}秒 · {String(v.data.testDate)}
                  </p>
                ))}
              </details>
            )}
          </section>
        );
      })}
    </details>
  );
}
