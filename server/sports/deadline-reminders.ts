import { Repository, type Entity, type Fields } from "../repository";
import { buildCourseReport } from "./report";
/** Called under the shared write transaction: reminder marker and notification commit together. */
export function checkDeadlineReminders(
  repo: Repository,
  now = Date.now(),
  onlyCourse?: Entity,
) {
  if (repo.all("sportsSystem").some((s) => s.data.mode !== "NORMAL")) return;
  const markers = repo.all("sportsDeadlineReminder");
  for (const course of onlyCourse ? [onlyCourse] : repo.all("sportsCourse")) {
    if (
      !["PUBLISHED", "CLOSED"].includes(String(course.data.status)) ||
      course.data.settlementStatus === "SETTLED"
    )
      continue;
    const deadline = Date.parse(
        String(course.data.deadlineDate) + "T00:00:00+08:00",
      ),
      dueAt = deadline - 14 * 86400000;
    if (!Number.isFinite(deadline) || now < dueAt) continue;
    const semester = repo.get(course.data.semesterId, "sportsSemester");
    if (semester.data.status !== "CURRENT") continue;
    const report = buildCourseReport(repo, course),
      members = repo
        .all("sportsEnrollment")
        .filter(
          (m) => m.data.courseId === course.id && m.data.status === "ACTIVE",
        );
    const inCourse = (kind: string) =>
      repo.all(kind).filter((e) => e.data.courseId === course.id);
    function send(
      recipient: string | null,
      role: string,
      evidence: Fields,
      body: string,
    ) {
      if (
        !recipient ||
        markers.some(
          (m) =>
            m.ownerId === recipient &&
            m.data.courseId === course.id &&
            m.data.deadlineDate === course.data.deadlineDate &&
            m.data.recipientRole === role,
        )
      )
        return;
      const marker = repo.create("sportsDeadlineReminder", recipient, {
        courseId: course.id,
        deadlineDate: course.data.deadlineDate,
        dueAt,
        sentAt: now,
        recipientRole: role,
        evidence,
      });
      markers.push(marker);
      repo.notify([recipient], course.id, "sports.course.deadline", body);
    }
    for (const member of members) {
      const row = report.rows.find((r) => r.enrollmentId === member.id),
        facts = row?.facts;
      if (!facts) continue;
      const pendingApplications = inCourse("sportsApplication").filter(
        (a) =>
          a.ownerId === member.ownerId &&
          ["SUBMITTED", "SUPPLEMENT_REQUIRED"].includes(String(a.data.status)),
      ).length;
      const pending =
        facts.pendingRecords +
        facts.openSessions +
        facts.awaitingMaterials +
        pendingApplications;
      if (
        facts.remaining.every((v) => v === 0) &&
        pending === 0 &&
        facts.enduranceStatus !== "NOT_RECORDED"
      )
        continue;
      send(
        member.ownerId,
        "student",
        {
          remaining: facts.remaining,
          pending,
          enduranceStatus: facts.enduranceStatus,
        },
        "课程“" +
          String(course.data.name) +
          "”常规打卡截止：" +
          String(course.data.deadlineDate) +
          "；课程相关还差" +
          facts.remaining[0] +
          "分钟，其他运动还差" +
          facts.remaining[1] +
          "分钟，未处理运动/材料/申请" +
          pending +
          "项。" +
          (facts.enduranceStatus === "NOT_RECORDED" ? "体测尚未录入。" : "") +
          "收尾期新运动须有本人补练授权；本提醒不延长期限或开放权限。",
      );
    }
    const gradeDrafts = inCourse("sportsGradeDraft").filter(
      (d) => d.data.status === "DRAFT",
    ).length;
    const missingGrades = members.filter(
      (m) =>
        !inCourse("sportsGradePublication").some(
          (g) => g.data.enrollmentId === m.id,
        ),
    ).length;
    const blockers = [
      ...report.unresolved,
      ...(gradeDrafts
        ? [{ code: "FINAL_GRADE_DRAFT", count: gradeDrafts }]
        : []),
      ...(missingGrades
        ? [{ code: "FINAL_GRADE_MISSING", count: missingGrades }]
        : []),
    ];
    if (blockers.length)
      send(
        course.ownerId,
        "teacher",
        { pending: blockers },
        "课程“" +
          String(course.data.name) +
          "”常规打卡截止：" +
          String(course.data.deadlineDate) +
          "；仍有" +
          blockers.reduce((n, b) => n + b.count, 0) +
          "项待处理教学事项，请核对工作台的名单、体测、材料审核、申请及成绩。提醒不改变任何学生结果或结算状态。",
      );
  }
}
