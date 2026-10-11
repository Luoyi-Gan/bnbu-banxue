import { randomBytes } from "node:crypto";
import { demand, type Account } from "../auth";
import {
  enumField,
  integerField,
  Repository,
  textField,
  type Entity,
  type Fields,
} from "../repository";
import { businessWeek, selectCredit, type CreditCandidate } from "./credit";

export function sportsRole(
  repo: Repository,
  actor: Account,
  role: "student" | "teacher" | "admin",
) {
  demand(
    actor.status !== "banned" &&
      repo
        .all("sportsIdentity")
        .some(
          (i) =>
            i.ownerId === actor.id &&
            i.data.status === "verified" &&
            i.data.role === role,
        ),
    "没有有效体育身份。",
    403,
  );
}
export function version(entity: Entity, input: Fields) {
  demand(input.version === entity.version, "记录已变化，请刷新后重试。", 409);
}
export function ownedCourse(repo: Repository, actor: Account, id: unknown) {
  sportsRole(repo, actor, "teacher");
  const course = repo.get(id, "sportsCourse");
  demand(course.ownerId === actor.id, "只能处理本人负责的体育课程。", 403);
  return course;
}
function dateField(input: Fields, key: string) {
  const date = textField(input, key, 10);
  businessWeek(date);
  return date;
}
const instant = (day: string) => Date.parse(`${day}T00:00:00+08:00`);
function currentSemester(repo: Repository, id: unknown) {
  const semester = repo.get(id, "sportsSemester");
  demand(semester.data.status === "CURRENT", "体育学期不是当前学期。", 409);
  return semester;
}
function courseRules(repo: Repository, input: Fields) {
  const semester = currentSemester(repo, input.semesterId);
  const template = repo.get(input.templateId, "sportsTemplate");
  demand(template.data.status === "published", "请选择已发布的体育规则模板。");
  const threshold = integerField(input, "threshold", 30, 60),
    weeklyLimit = integerField(input, "weeklyLimit", 2, 4);
  demand([30, 45, 60].includes(threshold), "门槛只能为30、45或60分钟。");
  const relatedTarget = integerField(input, "relatedTarget", 0, 1200),
    otherTarget = integerField(input, "otherTarget", 0, 1200);
  demand(relatedTarget + otherTarget === 1200, "两类目标合计须为1200分钟。");
  const startDate = dateField(input, "startDate"),
    deadlineDate = dateField(input, "deadlineDate"),
    settlementDate = dateField(input, "settlementDate");
  demand(
    startDate >= String(semester.data.startDate) &&
      deadlineDate >= startDate &&
      instant(settlementDate) >= instant(deadlineDate) + 8 * 86400000 &&
      settlementDate <= String(semester.data.endDate),
    "课程日期必须在学期内，结算须在常规截止后的完整七天收尾之后。",
  );
  const startTime = textField(input, "startTime", 5),
    endTime = textField(input, "endTime", 5);
  demand(
    [startTime, endTime].every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)) &&
      startTime < endTime,
    "请填写有效的当日运动时间窗。",
  );
  return {
    semesterId: semester.id,
    templateId: template.id,
    templateVersion: template.version,
    threshold,
    weeklyLimit,
    relatedTarget,
    otherTarget,
    startDate,
    deadlineDate,
    settlementDate,
    startTime,
    endTime,
    closingDate: new Date(
      instant(deadlineDate) + 7 * 86400000,
    ).toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }),
  };
}
function checkFeasibility(data: Fields) {
  const now = Date.now(),
    today = new Date(now).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
  const from = Math.max(instant(String(data.startDate)), instant(today)),
    until = instant(String(data.deadlineDate));
  const timeMinutes = (value: unknown) => {
    const [h, m] = String(value).split(":").map(Number);
    return h * 60 + m;
  };
  const capacity = Math.min(
    60,
    timeMinutes(data.endTime) - timeMinutes(data.startTime),
  );
  const needed =
    Math.ceil(Number(data.relatedTarget) / capacity) +
    Math.ceil(Number(data.otherTarget) / capacity);
  demand(
    capacity >= Number(data.threshold),
    "每日开放窗口不能达到课程起算门槛。",
  );
  // Same full window every day. This horizon includes enough whole weeks for both
  // targets plus the partial first week/day; never counts dates already elapsed.
  const horizon = 7 * (Math.ceil(needed / Number(data.weeklyLimit)) + 2);
  const candidates: CreditCandidate[] = [];
  for (
    let dayStart = from;
    dayStart <= until && dayStart < from + horizon * 86400000;
    dayStart += 86400000
  ) {
    const day = new Date(dayStart).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
    const begin = Math.max(
      now,
      Date.parse(`${day}T${data.startTime}:00+08:00`),
    );
    const end = Date.parse(`${day}T${data.endTime}:00+08:00`);
    if (end <= begin) continue;
    for (const category of [0, 1] as const)
      candidates.push({
        id: `${day}-${category}`,
        businessDate: day,
        startedAt: begin,
        category,
        activeMilliseconds: end - begin,
      });
  }
  const result = selectCredit({
    candidates,
    targets: [Number(data.relatedTarget), Number(data.otherTarget)],
    certification: [0, 0],
    threshold: Number(data.threshold) as 30 | 45 | 60,
    weeklyLimit: Number(data.weeklyLimit) as 2 | 3 | 4,
    previousIds: [],
  });
  demand(
    result.total === 1200,
    "当前日程、频次和分类目标客观上无法完成1200分钟，不能发布。",
  );
}
export function sportsCourseCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (
    action === "sports.semester.create" ||
    action === "sports.semester.update"
  ) {
    sportsRole(repo, actor, "admin");
    const old = action.endsWith("update")
      ? repo.get(input.id, "sportsSemester")
      : undefined;
    if (old) {
      version(old, input);
      demand(old.data.status === "UPCOMING", "只有即将开始的学期可以编辑。");
    }
    const year = textField(input, "academicYear", 9),
      type = enumField(input, "type", ["FIRST", "SECOND", "SUMMER"]);
    demand(
      /^\d{4}-\d{4}$/.test(year) &&
        Number(year.slice(5)) === Number(year.slice(0, 4)) + 1,
      "学年须为连续YYYY-YYYY。",
    );
    const startDate = dateField(input, "startDate"),
      endDate = dateField(input, "endDate");
    demand(endDate >= startDate, "学期结束不得早于开始。");
    demand(
      !repo
        .all("sportsSemester")
        .some(
          (s) =>
            s.id !== old?.id &&
            s.data.academicYear === year &&
            s.data.type === type,
        ),
      "该学年学期已经存在。",
      409,
    );
    const data = {
      name: textField(input, "name", 100),
      academicYear: year,
      type,
      startDate,
      endDate,
      status: "UPCOMING",
    };
    return old
      ? repo.save(old, data)
      : repo.create("sportsSemester", actor.id, data);
  }
  if (action === "sports.semester.activate") {
    sportsRole(repo, actor, "admin");
    const semester = repo.get(input.id, "sportsSemester");
    version(semester, input);
    demand(
      semester.data.status === "UPCOMING" &&
        instant(String(semester.data.startDate)) <= Date.now(),
      "仅能切换已经开始的待启用学期。",
    );
    const old = repo
      .all("sportsSemester")
      .find((s) => s.data.status === "CURRENT");
    if (old) {
      demand(
        !repo
          .all("sportsCourse")
          .some(
            (c) =>
              c.data.semesterId === old.id &&
              c.data.settlementStatus !== "SETTLED",
          ),
        "旧学期存在未完成收尾结算的课程，不能切换。",
        409,
      );
      repo.save(old, { status: "ARCHIVED" });
    }
    return repo.save(semester, { status: "CURRENT" });
  }
  if (action === "sports.template.publish") {
    sportsRole(repo, actor, "admin");
    return repo.create("sportsTemplate", actor.id, {
      name: textField(input, "name", 100),
      status: "published",
      policy: "V8.1",
      thresholds: [30, 45, 60],
      weeklyLimits: [2, 3, 4],
      totalTarget: 1200,
      singleCap: 60,
      dailyLimit: 1,
    });
  }
  if (action === "sports.course.save") {
    sportsRole(repo, actor, "teacher");
    const old = input.id ? ownedCourse(repo, actor, input.id) : undefined;
    if (old) {
      version(old, input);
      demand(old.data.status === "DRAFT", "已发布课程规则已锁定。");
    }
    const data = {
      ...courseRules(repo, input),
      name: textField(input, "name", 100),
      description: textField(input, "description", 1000),
      status: "DRAFT",
      settlementStatus: "PENDING",
      enrollmentOpen: false,
    };
    return old
      ? repo.save(old, data)
      : repo.create("sportsCourse", actor.id, data);
  }
  if (action === "sports.course.publish") {
    const course = ownedCourse(repo, actor, input.id);
    version(course, input);
    currentSemester(repo, course.data.semesterId);
    demand(course.data.status === "DRAFT", "课程已发布，不能重复发布。", 409);
    checkFeasibility(course.data);
    return repo.save(course, { status: "PUBLISHED", enrollmentOpen: true });
  }
  if (action === "sports.course.close") {
    const course = ownedCourse(repo, actor, input.id);
    version(course, input);
    demand(course.data.status === "PUBLISHED", "课程当前不能关闭。", 409);
    return repo.save(course, {
      status: "CLOSED",
      enrollmentOpen: false,
      closeReason: textField(input, "reason", 1000),
    });
  }
  if (action === "sports.invitation.create") {
    const course = ownedCourse(repo, actor, input.courseId);
    currentSemester(repo, course.data.semesterId);
    demand(
      course.data.status === "PUBLISHED" && course.data.enrollmentOpen,
      "课程未开放入班。",
    );
    const minutes =
      input.minutes === undefined ? 30 : integerField(input, "minutes", 5, 120);
    return repo.create("sportsInvitation", actor.id, {
      courseId: course.id,
      code: randomBytes(12).toString("base64url"),
      expiresAt: Date.now() + minutes * 60000,
      status: "ACTIVE",
    });
  }
  if (action === "sports.invitation.revoke") {
    const invite = repo.get(input.id, "sportsInvitation");
    ownedCourse(repo, actor, invite.data.courseId);
    version(invite, input);
    return repo.save(invite, { status: "REVOKED" });
  }
  if (action === "sports.enrollment.join") {
    sportsRole(repo, actor, "student");
    const code = textField(input, "code", 100),
      invite = repo.all("sportsInvitation").find((i) => i.data.code === code);
    demand(
      invite &&
        invite.data.status === "ACTIVE" &&
        Number(invite.data.expiresAt) > Date.now(),
      "邀请无效或已过期。",
    );
    const course = repo.get(invite.data.courseId, "sportsCourse");
    currentSemester(repo, course.data.semesterId);
    demand(
      course.data.status === "PUBLISHED" && course.data.enrollmentOpen,
      "课程未开放入班。",
    );
    demand(
      !repo
        .all("sportsEnrollment")
        .some(
          (e) =>
            e.ownerId === actor.id &&
            e.data.semesterId === course.data.semesterId &&
            e.data.status === "ACTIVE",
        ),
      "当前学期已有有效体育教学班。",
      409,
    );
    demand(
      !repo
        .all("sportsEnrollment")
        .some(
          (e) =>
            e.ownerId === actor.id &&
            e.data.courseId === course.id &&
            e.data.status === "REMOVED",
        ),
      "已移出的原班成员须由责任教师恢复。",
    );
    const member = repo.create("sportsEnrollment", actor.id, {
      courseId: course.id,
      semesterId: course.data.semesterId,
      status: "ACTIVE",
    });
    repo.notify(
      [actor.id, course.ownerId!],
      member.id,
      action,
      "已加入体育教学班。",
    );
    return member;
  }
  return undefined;
}

export function sportsWorkspace(repo: Repository, actor: Account) {
  const identity = repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === actor.id);
  demand(identity?.data.status === "verified", "没有有效体育身份。", 403);
  const role = identity.data.role;
  const enrollment = repo
    .all("sportsEnrollment")
    .filter((e) => e.ownerId === actor.id);
  const current = repo
    .all("sportsSemester")
    .find((s) => s.data.status === "CURRENT");
  const courses = repo
    .all("sportsCourse")
    .filter((c) =>
      role === "teacher"
        ? c.ownerId === actor.id
        : role === "admin"
          ? c.data.status === "PUBLISHED" && c.data.semesterId === current?.id
          : enrollment.some((e) => e.data.courseId === c.id),
    );
  return {
    identity,
    studentStatus:
      role === "student"
        ? enrollment.some(
            (e) =>
              e.data.semesterId === current?.id && e.data.status === "ACTIVE",
          )
          ? "ACTIVE"
          : "PENDING"
        : null,
    makeups:
      role === "teacher" || role === "student"
        ? repo
            .all("sportsMakeup")
            .filter(
              (m) =>
                courses.some((c) => c.id === m.data.courseId) &&
                (role === "teacher" || m.ownerId === actor.id),
            )
        : [],
    semesters: repo.all("sportsSemester"),
    templates: repo.all("sportsTemplate"),
    courses,
    enrollments:
      role === "teacher"
        ? repo
            .all("sportsEnrollment")
            .filter((e) => courses.some((c) => c.id === e.data.courseId))
            .map((e) => ({
              ...e,
              data: {
                ...e.data,
                studentName:
                  repo.db
                    .prepare("SELECT name FROM accounts WHERE id=?")
                    .get(e.ownerId!)?.name ?? "历史学生",
              },
            }))
        : role === "student"
          ? enrollment
          : [],
    invitations:
      role === "teacher"
        ? repo
            .all("sportsInvitation")
            .filter((i) => courses.some((c) => c.id === i.data.courseId))
        : [],
  };
}
