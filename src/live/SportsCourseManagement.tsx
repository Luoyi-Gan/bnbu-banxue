import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";

export function SportsCourseManagement({
  course,
  enrollments,
  makeups,
  open,
  busy,
}: {
  course: LiveEntity;
  enrollments: LiveEntity[];
  makeups: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  const members = enrollments.filter((e) => e.data.courseId === course.id);
  const reason = {
    key: "reason",
    label: "公开原因",
    type: "textarea" as const,
  };
  const fixed = { id: course.id, version: course.version };
  return (
    <details>
      <summary>管理课程与成员</summary>
      <p>
        入班：{course.data.enrollmentOpen ? "开放" : "关闭"}
        。移出或撤销补练不删除历史，也不终止已有合法会话。
      </p>
      <button
        disabled={busy}
        onClick={() =>
          open(
            "修改课程名称与说明",
            "sports.course.describe",
            [
              {
                key: "name",
                label: "课程名称",
                value: String(course.data.name),
              },
              {
                key: "description",
                label: "说明",
                type: "textarea",
                value: String(course.data.description),
              },
              reason,
              {
                key: "confirmed",
                label: "确认只修改名称说明，不改变已发布规则和历史记录",
                type: "checkbox",
              },
            ],
            fixed,
          )
        }
      >
        修改名称说明
      </button>
      {course.data.status === "PUBLISHED" && (
        <button
          disabled={busy}
          onClick={() =>
            open(
              course.data.enrollmentOpen
                ? "关闭入班（现有邀请立即失效）"
                : "开放入班（须生成新邀请）",
              "sports.course.enrollment",
              [reason],
              { ...fixed, open: !course.data.enrollmentOpen },
            )
          }
        >
          {course.data.enrollmentOpen ? "关闭入班" : "开放入班"}
        </button>
      )}
      {members.map((member) => (
        <section key={member.id}>
          <p>
            {String(member.data.studentName ?? member.ownerId)} ·{" "}
            {member.data.status === "ACTIVE" ? "已进班" : "已移出"}
          </p>
          {(member.data.status === "ACTIVE" ||
            course.data.status === "PUBLISHED") && (
            <button
              disabled={busy}
              onClick={() =>
                open(
                  member.data.status === "ACTIVE"
                    ? "移出成员（原记录保留）"
                    : "恢复原成员",
                  member.data.status === "ACTIVE"
                    ? "sports.enrollment.remove"
                    : "sports.enrollment.restore",
                  [reason],
                  { id: member.id, version: member.version },
                )
              }
            >
              {member.data.status === "ACTIVE" ? "移出成员" : "恢复成员"}
            </button>
          )}
          {member.data.status === "ACTIVE" &&
            course.data.status === "PUBLISHED" && (
              <button
                disabled={busy}
                onClick={() =>
                  open(
                    "指定收尾补练窗口",
                    "sports.makeup.create",
                    [
                      {
                        key: "startAt",
                        label: "开始时间（上海，例2027-01-01T08:00:00+08:00）",
                      },
                      {
                        key: "endAt",
                        label: "结束时间（上海，例2027-01-01T18:00:00+08:00）",
                      },
                      reason,
                    ],
                    { ...fixed, courseId: course.id, enrollmentId: member.id },
                  )
                }
              >
                指定补练窗口
              </button>
            )}
          {makeups
            .filter((m) => m.data.enrollmentId === member.id)
            .map((m) => (
              <p key={m.id}>
                {String(m.data.startAt)} 至 {String(m.data.endAt)} ·{" "}
                {m.data.status === "ACTIVE" ? "已设置" : "已撤销"}{" "}
                {m.data.status === "ACTIVE" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      open("撤销补练窗口", "sports.makeup.revoke", [reason], {
                        id: m.id,
                        version: m.version,
                      })
                    }
                  >
                    撤销窗口
                  </button>
                )}
              </p>
            ))}
        </section>
      ))}
    </details>
  );
}
