import { Repository, strings, type Entity } from "../repository";
import { selectCredit, eligibleMinutes, type CreditCandidate } from "./credit";
import type { SportsClock } from "./session-clock";

/** Append-only projections retain their predecessor and the exact candidate versions. */
export function recalculateProgress(
  repo: Repository,
  record: Entity,
  cause: string,
) {
  const course = repo.get(record.data.courseId, "sportsCourse");
  const records = repo
    .all("sportsRecord")
    .filter(
      (r) => r.ownerId === record.ownerId && r.data.courseId === course.id,
    );
  const previous = repo
    .all("sportsProgress")
    .filter(
      (p) => p.ownerId === record.ownerId && p.data.courseId === course.id,
    )
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence))[0];
  const effective = records.filter((r) => r.data.status === "VALID");
  const candidates: CreditCandidate[] = effective.map((r) => {
    const clock = repo.get(r.data.sessionId, "sportsSession").data
      .clock as unknown as SportsClock;
    return {
      id: r.id,
      businessDate: clock.businessDate,
      startedAt: clock.startedAt,
      activeMilliseconds: clock.activeMilliseconds,
      category: r.data.category === "RELATED" ? 0 : 1,
    };
  });
  const certifications = repo
    .all("sportsCertification")
    .filter(
      (c) =>
        c.ownerId === record.ownerId &&
        c.data.courseId === course.id &&
        c.data.status === "VALID",
    );
  const certification: [number, number] = [0, 0];
  for (const c of certifications)
    certification[c.data.category === "RELATED" ? 0 : 1] += Number(
      c.data.minutes,
    );
  const result = selectCredit({
    candidates,
    targets: [
      Number(course.data.relatedTarget),
      Number(course.data.otherTarget),
    ],
    certification,
    threshold: Number(course.data.threshold) as 30 | 45 | 60,
    weeklyLimit: Number(course.data.weeklyLimit) as 2 | 3 | 4,
    previousIds: previous ? strings(previous.data.selectedIds) : [],
  });
  const details = records.map((r) => {
    const eligible = eligibleMinutes(
      Number(r.data.activeMilliseconds),
      Number(course.data.threshold),
    );
    const actual = result.recordActual[r.id] ?? 0;
    return {
      recordId: r.id,
      version: r.version,
      status: r.data.status,
      eligible,
      actual,
      reason:
        r.data.status !== "VALID"
          ? r.data.status === "INVALID"
            ? "审核无效，不计入"
            : "尚未有效，不计入"
          : eligible === 0
            ? "未达到本课程最低运动分钟"
            : actual === 0
              ? "日/周名额或分类目标限制，记录仍有效"
              : actual < eligible
                ? "本分类剩余目标封顶"
                : "已计入",
    };
  });
  return repo.create("sportsProgress", record.ownerId, {
    courseId: course.id,
    sequence: Number(previous?.data.sequence ?? 0) + 1,
    predecessorId: previous?.id ?? null,
    cause,
    at: Date.now(),
    ...result,
    details,
    candidateVersions: effective.map((r) => ({ id: r.id, version: r.version })),
    certificationVersions: certifications.map((c) => ({
      id: c.id,
      version: c.version,
    })),
  });
}
