import { effect, runSync, type BusinessRepository } from "../storage/effects";
import { demand, ServiceError, type Account } from "../auth";
import {
  Repository,
  integerField,
  textField,
  type Fields,
  type Entity,
} from "../repository";
import { ownedCourse } from "./courses";
import { businessWeek } from "./credit";
import { convertEndurance } from "./conversion";
import { approvedExemption } from "./applications";

export function sportsEnduranceCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
  acceptedEnrollmentIds: readonly string[] = [],
  historicalCorrection = false,
) {
  return runSync(sportsEndurancePolicy(repo,actor,action,input,acceptedEnrollmentIds,historicalCorrection));
}
export function* sportsEndurancePolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields,acceptedEnrollmentIds:readonly string[]=[],historicalCorrection=false):Generator<unknown,Entity|undefined,unknown> {
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
  const entities:Entity[]=[];
  for(const kind of ["sportsEnrollment","sportsCourse","sportsIdentity","sportsSemester","sportsExemption","sportsEndurance","sportsConversionTable"]) entities.push(...(yield* effect(repo.all(kind))));
  const reader:Pick<Repository,"all"|"get">={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,"对象不存在。",404);return e;}};
  const member = reader.get(input.enrollmentId, "sportsEnrollment");
  const course = ownedCourse(reader, actor, member.data.courseId);
  demand(
    !approvedExemption(reader, member.ownerId, course.id),
    "当前耐力跑已获免测，不能录入普通用时。",
    409,
  );
  const semester = reader.get(course.data.semesterId, "sportsSemester");
  demand(
    historicalCorrection ||
      (course.data.settlementStatus !== "SETTLED" &&
        semester.data.status !== "ARCHIVED"),
    "已结算或归档体测须通过历史报告更正流程。",
    409,
  );
  const old = reader
    .all("sportsEndurance")
    .find((r) => r.data.enrollmentId === member.id);
  demand(
    old ||
      acceptedEnrollmentIds.includes(member.id) ||
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
  const identities = reader
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
          reader,
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
    ? (yield* effect(repo.save(old, data)))
    : (yield* effect(repo.create("sportsEndurance", member.ownerId, data)));
  yield* effect(repo.create("sportsEnduranceRevision", member.ownerId, {
    ...data,
    recordId: saved.id,
    recordVersion: saved.version,
    previousVersion: old?.version ?? null,
  }));
  if (member.ownerId)
    yield* effect(repo.notify(
      [member.ownerId],
      saved.id,
      action,
      `耐力跑原始记录已${old ? "更正" : "确认"}：${event}米，${seconds}秒，${testDate}。`,
    ));
  return saved;
}

export function enduranceWorkspace(repo: Pick<Repository,"all">, actor: Account) {
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
          (roles.includes("student") &&
            r.ownerId === actor.id &&
            !approvedExemption(repo, actor.id, r.data.courseId)),
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
    enduranceRecords: [
      ...project("sportsEndurance"),
      ...repo
        .all("sportsExemption")
        .filter(
          (e) =>
            roles.includes("student") &&
            e.ownerId === actor.id &&
            e.data.status === "APPROVED" &&
            !courseIds.has(String(e.data.courseId)),
        )
        .map((e) => ({
          ...e,
          data: { courseId: e.data.courseId, exempt: true },
        })),
    ],
    enduranceHistory: project("sportsEnduranceRevision"),
  };
}
