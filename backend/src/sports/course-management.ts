import { demand, type Account } from "../auth";
import { Repository, textField, type Entity, type Fields } from "../repository";
import { ownedCourse, version } from "./courses";

export function sportsCourseManagementCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (
    ![
      "sports.course.describe",
      "sports.course.enrollment",
      "sports.enrollment.remove",
      "sports.enrollment.restore",
      "sports.makeup.create",
      "sports.makeup.revoke",
    ].includes(action)
  )
    return undefined;
  const member = action.startsWith("sports.enrollment.")
    ? repo.get(input.id, "sportsEnrollment")
    : null;
  const makeup =
    action === "sports.makeup.revoke"
      ? repo.get(input.id, "sportsMakeup")
      : null;
  const course = ownedCourse(
    repo,
    actor,
    member?.data.courseId ??
      makeup?.data.courseId ??
      input.courseId ??
      input.id,
  );
  const semester = repo.get(course.data.semesterId, "sportsSemester");
  demand(
    semester.data.status === "CURRENT" &&
      course.data.settlementStatus !== "SETTLED",
    "只能管理当前未结算课程。",
    409,
  );
  const before = member ?? makeup ?? course;
  version(before, input);
  const reason = textField(input, "reason", 1000),
    now = Date.now();
  let saved: Entity;
  if (action === "sports.course.describe") {
    demand(
      input.confirmed === true,
      "请确认名称说明变更不改变已发布规则和历史事实。",
    );
    saved = repo.save(course, {
      name: textField(input, "name", 100),
      description: textField(input, "description", 1000),
    });
  } else if (action === "sports.course.enrollment") {
    demand(
      course.data.status === "PUBLISHED",
      "仅已发布且未关闭课程可切换入班。",
      409,
    );
    demand(typeof input.open === "boolean", "入班开关无效。");
    saved = repo.save(course, { enrollmentOpen: input.open });
    // Closing enrollment permanently terminates existing invitation grace; reopening does not revive it.
    if (!input.open)
      for (const invite of repo
        .all("sportsInvitation")
        .filter(
          (i) => i.data.courseId === course.id && i.data.status === "ACTIVE",
        ))
        repo.save(invite, { status: "REVOKED", revokedAt: now, reason });
  } else if (member) {
    const restore = action === "sports.enrollment.restore";
    demand(
      member.data.status === (restore ? "REMOVED" : "ACTIVE"),
      "成员状态已变化。",
      409,
    );
    if (restore) {
      demand(
        course.data.status === "PUBLISHED",
        "已关闭课程不能恢复参与资格。",
        409,
      );
      demand(
        !repo
          .all("sportsEnrollment")
          .some(
            (e) =>
              e.ownerId === member.ownerId &&
              e.data.semesterId === course.data.semesterId &&
              e.data.status === "ACTIVE",
          ),
        "学生当前学期已有另一个有效体育教学班。",
        409,
      );
    }
    saved = repo.save(member, {
      status: restore ? "ACTIVE" : "REMOVED",
      changedAt: now,
      reason,
    });
  } else if (makeup) {
    demand(makeup.data.status === "ACTIVE", "补练窗口已撤销。", 409);
    saved = repo.save(makeup, { status: "REVOKED", revokedAt: now, reason });
  } else {
    demand(
      course.data.status === "PUBLISHED",
      "关闭课程不能新增补练窗口。",
      409,
    );
    const enrollment = repo.get(input.enrollmentId, "sportsEnrollment");
    demand(
      enrollment.data.courseId === course.id &&
        enrollment.data.status === "ACTIVE",
      "补练仅限本人课程有效成员。",
      409,
    );
    const startText = textField(input, "startAt", 80),
      endText = textField(input, "endAt", 80);
    demand(
      [startText, endText].every((value) =>
        /(?:Z|[+-]\d{2}:\d{2})$/.test(value),
      ),
      "补练时间须明确时区，例如+08:00。",
    );
    const startAt = Date.parse(startText),
      endAt = Date.parse(endText);
    const first =
      Date.parse(`${course.data.deadlineDate}T00:00:00+08:00`) + 86400000;
    const last = first + 7 * 86400000;
    demand(
      Number.isFinite(startAt) &&
        Number.isFinite(endAt) &&
        startAt >= Math.max(first, now) &&
        endAt > startAt &&
        endAt <= last,
      "补练须为公布的七天收尾期内、尚未开始的明确窗口，不能追溯或延长学期。",
    );
    saved = repo.create("sportsMakeup", enrollment.ownerId, {
      courseId: course.id,
      semesterId: semester.id,
      enrollmentId: enrollment.id,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      status: "ACTIVE",
      reason,
    });
  }
  repo.create("sportsCourseHistory", actor.id, {
    courseId: course.id,
    objectId: saved.id,
    action,
    reason,
    at: now,
    before: action === "sports.makeup.create" ? null : before.data,
    after: saved.data,
  });
  const recipients =
    member || makeup || action === "sports.makeup.create"
      ? [saved.ownerId!]
      : repo
          .all("sportsEnrollment")
          .filter(
            (e) => e.data.courseId === course.id && e.data.status === "ACTIVE",
          )
          .map((e) => e.ownerId!);
  repo.notify(
    recipients,
    saved.id,
    action,
    `${course.data.name}：${action === "sports.enrollment.remove" ? "已移出教学班，原记录保留" : action === "sports.enrollment.restore" ? "已恢复原教学班参与资格" : action === "sports.makeup.create" ? "已开放指定补练窗口" : action === "sports.makeup.revoke" ? "已撤销补练窗口，已有合法会话保留" : action === "sports.course.describe" ? "课程名称说明已更新" : "入班开放状态已更新"}；${reason}`,
  );
  return saved;
}
