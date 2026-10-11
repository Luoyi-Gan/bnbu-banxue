import { demand, ServiceError, type Account } from "../auth";
import {
  Repository,
  integerField,
  textField,
  type Fields,
} from "../repository";
import { ownedCourse } from "./courses";
import { businessWeek } from "./credit";
import { convertEndurance } from "./conversion";

export function sportsEnduranceCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (action !== "sports.endurance.confirm") return undefined;
  demand(
    Object.keys(input).every((k) =>
      [
        "enrollmentId",
        "version",
        "event",
        "seconds",
        "testDate",
        "confirmed",
      ].includes(k),
    ),
    "只接受原始测试事实，不接受指定换算表或分数。",
  );
  demand(input.confirmed === true, "请对照真实测试记录确认项目、用时和日期。");
  const member = repo.get(input.enrollmentId, "sportsEnrollment");
  const course = ownedCourse(repo, actor, member.data.courseId);
  const semester = repo.get(course.data.semesterId, "sportsSemester");
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      semester.data.status !== "ARCHIVED",
    "已结算或归档体测须通过历史报告更正流程。",
    409,
  );
  const old = repo
    .all("sportsEndurance")
    .find((r) => r.data.enrollmentId === member.id);
  demand(
    old ||
      (course.data.status === "PUBLISHED" && member.data.status === "ACTIVE"),
    "关闭课程或移出成员只能更正已有体测事实。",
    409,
  );
  demand(
    input.version === (old?.version ?? 0),
    "体测记录已变化，请刷新后重新核对。",
    409,
  );
  const event = integerField(input, "event", 800, 1000);
  demand(event === 800 || event === 1000, "项目只能为800米或1000米。");
  const seconds = integerField(input, "seconds", 0, 2147483647);
  const testDate = textField(input, "testDate", 10);
  businessWeek(testDate);
  demand(
    Date.parse(`${testDate}T00:00:00+08:00`) <= Date.now(),
    "不能确认未来的测试事实。",
  );
  demand(
    !old ||
      old.data.event !== event ||
      old.data.seconds !== seconds ||
      old.data.testDate !== testDate,
    "原始事实未变化，不重新换算历史结果。",
    409,
  );
  const identities = repo
    .all("sportsIdentity")
    .filter(
      (i) =>
        i.ownerId === member.ownerId &&
        i.data.role === "student" &&
        i.data.status === "verified",
    );
  const identity = identities.length === 1 ? identities[0] : undefined;
  const sex = identity?.data.sex,
    year = identity?.data.year;
  if (sex === "MALE" || sex === "FEMALE")
    demand(
      event === (sex === "MALE" ? 1000 : 800),
      "项目与学生已登记性别不符，请核对原始事实。",
    );
  let conversion: Fields = {
    status: "UNAVAILABLE",
    reason: "学生性别或当前年级资料不完整，不能唯一匹配换算表。",
  };
  if (
    (sex === "MALE" || sex === "FEMALE") &&
    typeof year === "number" &&
    Number.isInteger(year) &&
    year >= 1 &&
    year <= 4
  ) {
    try {
      conversion = {
        status: "AVAILABLE",
        ...convertEndurance(
          repo,
          sex,
          year <= 2 ? "JUNIOR" : "SENIOR",
          event,
          seconds,
        ),
      };
    } catch (e) {
      if (!(e instanceof ServiceError)) throw e;
      conversion = { status: "UNAVAILABLE", reason: e.message };
    }
  }
  const data = {
    enrollmentId: member.id,
    courseId: course.id,
    semesterId: semester.id,
    event,
    seconds,
    testDate,
    conversion,
    confirmedBy: actor.id,
    confirmedAt: Date.now(),
  };
  const saved = old
    ? repo.save(old, data)
    : repo.create("sportsEndurance", member.ownerId, data);
  repo.create("sportsEnduranceRevision", member.ownerId, {
    ...data,
    recordId: saved.id,
    recordVersion: saved.version,
    previousVersion: old?.version ?? null,
  });
  if (member.ownerId)
    repo.notify(
      [member.ownerId],
      saved.id,
      action,
      `耐力跑原始记录已${old ? "更正" : "确认"}：${event}米，${seconds}秒，${testDate}。`,
    );
  return saved;
}

export function enduranceWorkspace(repo: Repository, actor: Account) {
  const roles = repo
    .all("sportsIdentity")
    .filter((i) => i.ownerId === actor.id && i.data.status === "verified")
    .map((i) => i.data.role);
  const courseIds = new Set(
    roles.includes("teacher")
      ? repo
          .all("sportsCourse")
          .filter((c) => c.ownerId === actor.id)
          .map((c) => c.id)
      : [],
  );
  const project = (kind: string) =>
    repo
      .all(kind)
      .filter(
        (r) =>
          courseIds.has(String(r.data.courseId)) ||
          (roles.includes("student") && r.ownerId === actor.id),
      )
      .map((r) => {
        if (courseIds.has(String(r.data.courseId))) return r;
        return {
          ...r,
          data: {
            courseId: r.data.courseId,
            event: r.data.event,
            seconds: r.data.seconds,
            testDate: r.data.testDate,
            recordId: r.data.recordId ?? r.id,
            recordVersion: r.data.recordVersion ?? r.version,
          },
        };
      });
  return {
    enduranceRecords: project("sportsEndurance"),
    enduranceHistory: project("sportsEnduranceRevision"),
  };
}
