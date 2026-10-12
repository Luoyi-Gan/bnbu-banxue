import { effect, runSync, type BusinessRepository } from "../storage/effects";
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
import { checkDeadlineReminders } from "./deadline-reminders";
import { sportsAccountGate } from "./account-gate";
import { courseWindow } from "./course-window";
import {
  administratorAccess,
  requireSportsPermission,
  requireSportsSuperAdmin,
} from "./permissions";

export function sportsRole(
  repo: Pick<Repository, "all">,
  actor: Account,
  role: "student" | "teacher" | "admin",
) {
  sportsAccountGate(repo, actor);
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
export function ownedCourse(repo: Pick<Repository,"all"|"get">, actor: Account, id: unknown) {
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
function currentSemester(repo: Pick<Repository,"all"|"get">, id: unknown) {
  const semester = repo.get(id, "sportsSemester");
  demand(semester.data.status === "CURRENT", "体育学期不是当前学期。", 409);
  return semester;
}
function courseRules(repo: Pick<Repository,"all"|"get">, input: Fields) {
  const semester = currentSemester(repo, input.semesterId);
  const window = courseWindow(input, semester.data);
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
    ...window,
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
  const excluded = new Set((data.excludedDates ?? []) as string[]);
  const horizon =
    7 * (Math.ceil(needed / Number(data.weeklyLimit)) + 2) + excluded.size;
  const candidates: CreditCandidate[] = [];
  for (
    let dayStart = from;
    dayStart <= until && dayStart < from + horizon * 86400000;
    dayStart += 86400000
  ) {
    const day = new Date(dayStart).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
    if (excluded.has(day)) continue;
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
  if(action.startsWith("sports.semester.")) return runSync(sportsSemesterPolicy(repo,actor,action,input));
  if (action === "sports.template.publish") {
    sportsRole(repo, actor, "admin");
    requireSportsSuperAdmin(repo, actor);
    const template = repo.create("sportsTemplate", actor.id, publishedTemplateFields(input));
    repo.db
      .prepare(
        "INSERT INTO sports_template_publications(template_id) VALUES(?)",
      )
      .run(template.id);
    return template;
  }
  if(["sports.course.window","sports.course.create","sports.course.save"].includes(action)) return runSync(sportsCourseDraftPolicy(repo,actor,action,input));
  if(["sports.course.configurepublish","sports.course.publish"].includes(action)) return runSync(sportsCoursePublishPolicy(repo,actor,action,input,course=>checkDeadlineReminders(repo,Date.now(),course)));
  if(["sports.course.close","sports.invitation.create","sports.invitation.revoke"].includes(action)) return runSync(sportsInvitationPolicy(repo,actor,action,input));
  if(["sports.enrollment.join","sports.enrollment.begin"].includes(action)) return runSync(sportsEnrollmentPolicy(repo,actor,action,input,id=>String(repo.db.prepare("SELECT name FROM accounts WHERE id=?").get(id)?.name ?? "责任教师")));
  return undefined;
}

export function sportsWorkspace(repo: Repository, actor: Account) {
  return projectSportsCourses(repo, actor, id => {
    const row = repo.db.prepare("SELECT name FROM accounts WHERE id=?").get(id);
    return row?.name == null ? "历史学生" : String(row.name);
  });
}

/** Shared read projection; account names are supplied by the storage adapter. */
export function projectSportsCourses(
  repo: Pick<Repository, "all" | "get">,
  actor: Account,
  studentName: (id: string) => string,
) {
  sportsAccountGate(repo, actor);
  const identity = repo
    .all("sportsIdentity")
    .find((i) => i.ownerId === actor.id);
  demand(identity?.data.status === "verified", "没有有效体育身份。", 403);
  const role = identity.data.role;
  const access = administratorAccess(repo, actor);
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
          ? access.permissions.includes("COURSES_VIEW") &&
            c.data.status === "PUBLISHED" &&
            c.data.semesterId === current?.id
          : enrollment.some((e) => e.data.courseId === c.id),
    );
  return {
    identity,
    administratorAccess: access,
    enrollmentFlows:
      role === "student"
        ? repo
            .all("sportsEnrollmentFlow")
            .filter((f) => f.ownerId === actor.id)
            .map((f) => {
              const invite = repo.get(f.data.invitationId),
                course = repo.get(f.data.courseId);
              return {
                ...f,
                data: {
                  ...f.data,
                  canComplete:
                    f.data.status === "OPEN" &&
                    Date.now() < Number(f.data.deadline) &&
                    invite.data.status === "ACTIVE" &&
                    course.data.status === "PUBLISHED" &&
                    course.data.enrollmentOpen === true &&
                    course.data.semesterId === current?.id,
                },
              };
            })
        : [],
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
                studentName: studentName(e.ownerId!),
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

export function* sportsSemesterPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields):Generator<unknown,Entity|undefined,unknown> {
  const entities:Entity[]=[];
  for(const kind of ["sportsIdentity","sportsSemester","sportsCourse","sportsSettlementReport"]) entities.push(...(yield* effect(repo.all(kind))));
  const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  if (
    action === "sports.semester.create" ||
    action === "sports.semester.update"
  ) {
    sportsRole(reader, actor, "admin");
    requireSportsPermission(reader, actor, "SEMESTERS");
    const old = action.endsWith("update")
      ? reader.get(input.id, "sportsSemester")
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
      !reader.all("sportsSemester")
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
      ? (yield* effect(repo.save(old, data)))
      : (yield* effect(repo.create("sportsSemester", actor.id, data)));
  }
  if (action === "sports.semester.activate") {
    sportsRole(reader, actor, "admin");
    requireSportsPermission(reader, actor, "SEMESTERS");
    const semester = reader.get(input.id, "sportsSemester");
    version(semester, input);
    demand(
      semester.data.status === "UPCOMING" &&
        instant(String(semester.data.startDate)) <= Date.now(),
      "仅能切换已经开始的待启用学期。",
    );
    const old = reader.all("sportsSemester")
      .find((s) => s.data.status === "CURRENT");
    if (old) {
      demand(
        !reader.all("sportsCourse")
          .some(
            (c) =>
              c.data.semesterId === old.id &&
              (c.data.settlementStatus !== "SETTLED" ||
                !reader.all("sportsSettlementReport")
                  .some(
                    (r) =>
                      r.id === c.data.settlementReportId &&
                      r.data.courseId === c.id &&
                      r.data.semesterId === old.id,
                  )),
          ),
        "旧学期存在未完成收尾结算的课程，不能切换。",
        409,
      );
      yield* effect(repo.save(old, { status: "ARCHIVED" }));
    }
    return yield* effect(repo.save(semester, { status: "CURRENT" }));
  }
}

export function publishedTemplateFields(input:Fields) {
  return {
      name: textField(input, "name", 100),
      status: "published",
      policy: "V8.1",
      thresholds: [30, 45, 60],
      weeklyLimits: [2, 3, 4],
      totalTarget: 1200,
      singleCap: 60,
      dailyLimit: 1,
      };
}

export function* sportsCourseDraftPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields):Generator<unknown,Entity|undefined,unknown> {
 const entities:Entity[]=[];
 for(const kind of ["sportsIdentity","sportsSemester","sportsCourse","sportsTemplate"]) entities.push(...(yield* effect(repo.all(kind))));
 const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  if (action === "sports.course.window") {
    const course = ownedCourse(reader, actor, input.id);
    version(course, input);
    demand(course.data.status === "DRAFT", "已发布课程日程已锁定。", 409);
    const semester = currentSemester(reader, course.data.semesterId);
    demand(
      Object.keys(input).every((key) =>
        [
          "id",
          "version",
          "startDate",
          "deadlineDate",
          "startTime",
          "endTime",
          "excludedDates",
          "checkInAvailable",
        ].includes(key),
      ),
      "课程时间窗参数无效。",
    );
    return yield* effect(repo.save(
      course,
      courseWindow({ ...course.data, ...input }, semester.data),
    ));
  }
  if (action === "sports.course.create") {
    sportsRole(reader, actor, "teacher");
    demand(
      Object.keys(input).every((key) => key === "name"),
      "新建课程仅接受课程名称，规则须另行配置。",
    );
    const semesters = reader.all("sportsSemester")
      .filter((item) => item.data.status === "CURRENT");
    demand(semesters.length === 1, "请先确认唯一的当前体育学期。", 409);
    return yield* effect(repo.create("sportsCourse", actor.id, {
      name: textField(input, "name", 100),
      semesterId: semesters[0].id,
      status: "DRAFT",
      settlementStatus: "PENDING",
      enrollmentOpen: false,
    }));
  }
  if (action === "sports.course.save") {
    sportsRole(reader, actor, "teacher");
    const old = input.id ? ownedCourse(reader, actor, input.id) : undefined;
    if (old) {
      version(old, input);
      demand(old.data.status === "DRAFT", "已发布课程规则已锁定。");
    }
    const data = {
      ...courseRules(reader, input),
      name: textField(input, "name", 100),
      description: textField(input, "description", 1000),
      status: "DRAFT",
      settlementStatus: "PENDING",
      enrollmentOpen: false,
    };
    return old
      ? (yield* effect(repo.save(old, data)))
      : (yield* effect(repo.create("sportsCourse", actor.id, data)));
  }
}

export function* sportsInvitationPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields):Generator<unknown,Entity|undefined,unknown> {
 const entities:Entity[]=[];
 for(const kind of ["sportsIdentity","sportsSemester","sportsCourse","sportsInvitation"]) entities.push(...(yield* effect(repo.all(kind))));
 const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  if (action === "sports.course.close") {
    const course = ownedCourse(reader, actor, input.id);
    version(course, input);
    demand(course.data.status === "PUBLISHED", "课程当前不能关闭。", 409);
    return yield* effect(repo.save(course, {
      status: "CLOSED",
      enrollmentOpen: false,
      closeReason: textField(input, "reason", 1000),
    }));
  }
  if (action === "sports.invitation.create") {
    const course = ownedCourse(reader, actor, input.courseId);
    currentSemester(reader, course.data.semesterId);
    demand(
      course.data.status === "PUBLISHED" && course.data.enrollmentOpen,
      "课程未开放入班。",
    );
    const minutes =
      input.minutes === undefined ? 30 : integerField(input, "minutes", 5, 120);
    return yield* effect(repo.create("sportsInvitation", actor.id, {
      courseId: course.id,
      code: "v1." + randomBytes(12).toString("base64url"),
      expiresAt: Date.now() + minutes * 60000,
      status: "ACTIVE",
    }));
  }
  if (action === "sports.invitation.revoke") {
    if (input.code !== undefined) {
      demand(
        Object.keys(input).every((key) => ["courseId", "code"].includes(key)),
        "撤销邀请参数无效。",
      );
      const course = ownedCourse(reader, actor, input.courseId);
      const code = textField(input, "code", 100);
      const invite = reader.all("sportsInvitation")
        .find(
          (item) => item.data.courseId === course.id && item.data.code === code,
        );
      demand(invite, "本课程邀请不存在。", 404);
      demand(invite.data.status === "ACTIVE", "邀请已撤销。", 409);
      return yield* effect(repo.save(invite, { status: "REVOKED" }));
    }
    const invite = reader.get(input.id, "sportsInvitation");
    ownedCourse(reader, actor, invite.data.courseId);
    version(invite, input);
    return yield* effect(repo.save(invite, { status: "REVOKED" }));
  }
}

export function* sportsCoursePublishPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields,remind:(course:Entity)=>void|Promise<void>):Generator<unknown,Entity|undefined,unknown> {
 const entities:Entity[]=[];
 for(const kind of ["sportsIdentity","sportsSemester","sportsCourse","sportsTemplate"]) entities.push(...(yield* effect(repo.all(kind))));
 const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  if (action === "sports.course.configurepublish") {
    const course = ownedCourse(reader, actor, input.id);
    demand(
      input.expectedCourseVersion === course.version &&
        input.expectedVersion === 0,
      "课程已变化，请刷新后重新核对。",
      409,
    );
    demand(course.data.status === "DRAFT", "已发布课程规则已锁定。", 409);
    demand(
      input.publish === true &&
        input.maximumMinutes === 60 &&
        input.dailyLimit === 1 &&
        input.globalTargetVersion === 1,
      "请使用现行规则：单次最多60分钟，每天最多1条，总目标1200分钟。",
    );
    demand(
      Object.keys(input).every((key) =>
        [
          "id",
          "expectedCourseVersion",
          "expectedVersion",
          "publish",
          "maximumMinutes",
          "dailyLimit",
          "globalTargetVersion",
          "templateId",
          "minimumMinutes",
          "weeklyLimit",
          "courseTarget",
          "generalTarget",
          "description",
          "regularDeadline",
          "closingDeadline",
          "settlementPlannedAt",
        ].includes(key),
      ),
      "课程发布参数无效。",
    );
    const regular = Date.parse(`${course.data.deadlineDate}T23:59:59+08:00`);
    const readInstant = (key: string) => {
      const value = textField(input, key, 40);
      demand(
        /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
          Number.isFinite(Date.parse(value)),
        "课程时间须包含有效时区。",
      );
      return Date.parse(value);
    };
    demand(
      readInstant("regularDeadline") === regular &&
        readInstant("closingDeadline") === regular + 7 * 86400000,
      "常规截止和七天收尾日期须与已保存时间窗一致。",
    );
    const settlement = readInstant("settlementPlannedAt");
    const settlementDate = new Date(settlement).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
    demand(
      settlement === instant(settlementDate),
      "请选择结算日期，时间使用上海时间零点。",
    );
    const saved = (yield* sportsCourseDraftPolicy(repo, actor, "sports.course.save", {
      ...course.data,
      id: course.id,
      version: course.version,
      templateId: input.templateId,
      threshold: input.minimumMinutes,
      weeklyLimit: input.weeklyLimit,
      relatedTarget: input.courseTarget,
      otherTarget: input.generalTarget,
      description: input.description,
      settlementDate,
    }))!;
    return yield* sportsCoursePublishPolicy(repo, actor, "sports.course.publish", {
      id: saved.id,
      version: saved.version,
    }, remind);
  }
  if (action === "sports.course.publish") {
    const course = ownedCourse(reader, actor, input.id);
    version(course, input);
    currentSemester(reader, course.data.semesterId);
    demand(course.data.status === "DRAFT", "课程已发布，不能重复发布。", 409);
    textField(course.data, "name", 100);
    textField(course.data, "description", 1000);
    courseRules(reader, course.data);
    demand(course.data.checkInAvailable !== false, "发布前须允许打卡。");
    checkFeasibility(course.data);
    const published = yield* effect(repo.save(course, {
      status: "PUBLISHED",
      enrollmentOpen: true,
      publishedAt: new Date().toISOString(),
      rulesVersion: 1,
    }));
    yield* effect(remind(published));
    return published;
  }
}

export function* sportsEnrollmentPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields,nameById:(id:string)=>string|Promise<string>):Generator<unknown,Entity|undefined,unknown> {
 const entities:Entity[]=[];
 for(const kind of ["sportsIdentity","sportsSemester","sportsCourse","sportsEnrollment","sportsEnrollmentFlow","sportsInvitation"]) entities.push(...(yield* effect(repo.all(kind))));
 const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  if (
    action === "sports.enrollment.join" ||
    action === "sports.enrollment.begin"
  ) {
    sportsRole(reader, actor, "student");
    const flow = input.flowId
      ? reader.get(input.flowId, "sportsEnrollmentFlow")
      : undefined;
    if (flow)
      demand(
        action === "sports.enrollment.join" &&
          flow.ownerId === actor.id &&
          flow.data.status === "OPEN",
        "入班流程不属于本人或已结束。",
        409,
      );
    const invite = flow
      ? reader.get(flow.data.invitationId, "sportsInvitation")
      : reader
          .all("sportsInvitation")
          .find((i) => i.data.code === textField(input, "code", 100));
    const now = Date.now();
    demand(
      invite &&
        invite.data.status === "ACTIVE" &&
        (Number(invite.data.expiresAt) > now ||
          (flow &&
            Number(flow.data.startedAt) < Number(invite.data.expiresAt) &&
            now < Number(flow.data.deadline))),
      "邀请无效或已过期。",
    );
    const course = reader.get(invite.data.courseId, "sportsCourse");
    currentSemester(reader, course.data.semesterId);
    demand(
      course.data.status === "PUBLISHED" && course.data.enrollmentOpen,
      "课程未开放入班。",
    );
    demand(
      !reader
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
      !reader
        .all("sportsEnrollment")
        .some(
          (e) =>
            e.ownerId === actor.id &&
            e.data.courseId === course.id &&
            e.data.status === "REMOVED",
        ),
      "已移出的原班成员须由责任教师恢复。",
    );
    if (action === "sports.enrollment.begin") {
      const existing = reader
        .all("sportsEnrollmentFlow")
        .find(
          (f) =>
            f.ownerId === actor.id &&
            f.data.invitationId === invite.id &&
            f.data.status === "OPEN",
        );
      return (
        existing ??
        (yield* effect(repo.create("sportsEnrollmentFlow", actor.id, {
          invitationId: invite.id,
          courseId: course.id,
          courseName: course.data.name,
          semesterName: reader.get(course.data.semesterId).data.name,
          teacherName: yield* effect(nameById(course.ownerId!)),
          startedAt: now,
          deadline: Number(invite.data.expiresAt) + 10 * 60000,
          status: "OPEN",
        })))
      );
    }
    const member = yield* effect(repo.create("sportsEnrollment", actor.id, {
      courseId: course.id,
      semesterId: course.data.semesterId,
      status: "ACTIVE",
      source: "INVITE",
      invitationId: invite.id,
    }));
    if (flow)
      yield* effect(repo.save(flow, {
        status: "COMPLETED",
        completedAt: now,
        enrollmentId: member.id,
      }));
    yield* effect(repo.notify(
      [actor.id, course.ownerId!],
      member.id,
      action,
      "已加入体育教学班。",
    ));
    return member;
  }
}
