import { demand, type Account } from "../auth";
import { Repository, type Entity, type Fields } from "../repository";
import { sportsRole, version } from "./courses";
import {
  startClock,
  transitionClock,
  elapsedMilliseconds,
  type SportsClock,
} from "./session-clock";
import { eligibleMinutes } from "./credit";

export function sportsSessionCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (!action.startsWith("sports.session.")) return undefined;
  sportsRole(repo, actor, "student");
  const now = Date.now();
  const mode = repo.all("sportsSystem")[0];
  demand(
    !mode || mode.data.mode === "NORMAL",
    "体育服务当前处于维护模式。",
    503,
  );
  if (action === "sports.session.start") {
    const course = repo.get(input.courseId, "sportsCourse");
    const semester = repo.get(course.data.semesterId, "sportsSemester");
    demand(
      course.data.status === "PUBLISHED" &&
        semester.data.status === "CURRENT" &&
        course.data.settlementStatus !== "SETTLED",
      "当前课程不能开始新运动。",
      409,
    );
    const enrollment = repo
      .all("sportsEnrollment")
      .find(
        (e) =>
          e.ownerId === actor.id &&
          e.data.courseId === course.id &&
          e.data.status === "ACTIVE",
      );
    demand(enrollment, "须有本班有效成员关系。", 403);
    demand(
      !repo
        .all("sportsSession")
        .some(
          (s) =>
            s.ownerId === actor.id &&
            (s.data.clock as unknown as SportsClock).state !== "ENDED",
        ),
      "已有进行中或暂停的运动，请先结束。",
      409,
    );
    const clock = startClock(now),
      day = clock.businessDate;
    const ordinary =
      day >= String(course.data.startDate) &&
      day <= String(course.data.deadlineDate);
    const makeup = repo
      .all("sportsMakeup")
      .some(
        (m) =>
          m.ownerId === actor.id &&
          m.data.courseId === course.id &&
          m.data.status === "ACTIVE" &&
          Date.parse(String(m.data.startAt)) <= now &&
          now < Date.parse(String(m.data.endAt)),
      );
    demand(ordinary || makeup, "当前不在普通打卡日期或本人补练窗口内。", 409);
    const windowStart = Date.parse(`${day}T${course.data.startTime}:00+08:00`),
      windowEnd = Date.parse(`${day}T${course.data.endTime}:00+08:00`);
    demand(
      now >= windowStart && now < windowEnd,
      "当前不在课程允许的当日运动时间内。",
      409,
    );
    const session = repo.create("sportsSession", actor.id, {
      courseId: course.id,
      enrollmentId: enrollment.id,
      semesterId: semester.id,
      ruleSnapshot: {
        threshold: course.data.threshold,
        weeklyLimit: course.data.weeklyLimit,
        relatedTarget: course.data.relatedTarget,
        otherTarget: course.data.otherTarget,
        templateId: course.data.templateId,
        templateVersion: course.data.templateVersion,
      },
      clock,
    });
    repo.create("sportsSessionEvent", actor.id, {
      sessionId: session.id,
      action: "start",
      at: now,
      clock,
    });
    return session;
  }
  demand(
    [
      "sports.session.pause",
      "sports.session.resume",
      "sports.session.end",
    ].includes(action),
    "未知运动会话动作。",
  );
  const session = repo.get(input.id, "sportsSession");
  demand(session.ownerId === actor.id, "只能操作本人运动会话。", 403);
  version(session, input);
  const next = transitionClock(
    session.data.clock as unknown as SportsClock,
    action.split(".")[2] as "pause" | "resume" | "end",
    now,
  );
  repo.create("sportsSessionEvent", actor.id, {
    sessionId: session.id,
    action: action.split(".")[2],
    at: now,
    clock: next,
  });
  return repo.save(session, { clock: next });
}
export function sessionProjection(session: Entity, serverNow: number) {
  const clock = session.data.clock as unknown as SportsClock;
  const elapsed = elapsedMilliseconds(clock, serverNow);
  const rules = session.data.ruleSnapshot as Fields;
  return {
    ...session,
    data: {
      ...session.data,
      elapsedMilliseconds: elapsed,
      eligibleMinutes: eligibleMinutes(elapsed, Number(rules.threshold)),
    },
  };
}
