import type { Account } from "../auth";
import { Repository } from "../repository";
import type { SportsCompanion } from "../../../shared/live/sportsCompanion";
import { mapSportsProgress } from "../../../shared/v2/sportsProgress";
import { requiresPasswordChange } from "./account-gate";
import { currentSystem } from "./system";

/** The local sports service shares account IDs with Companion. No online sync is implied. */
export function sportsCompanion(repo: Repository, actor: Account): SportsCompanion | null {
  if (actor.status === "banned" || requiresPasswordChange(repo, actor)) return null;
  const system = currentSystem(repo);
  if (system && system.data.mode !== "NORMAL") return null;
  // An independent admin account with the same email must never match a personal account.
  const personal = repo.db.prepare("SELECT id FROM accounts WHERE id=? AND lower(trim(email))=? AND login_kind='PERSONAL'")
    .get(actor.id, actor.email.trim().toLowerCase());
  if (!personal) return null;
  const identity = repo.all("sportsIdentity").find(item => item.ownerId === actor.id && item.data.status === "verified");
  const role = identity?.data.role;
  if ((role !== "teacher" && role !== "student") || !actor.roles.includes(role)) return null;
  if (role === "teacher") return { source: "local", role, progress: null };
  const result: SportsCompanion = { source: "local", role, progress: null };
  const semester = repo.all("sportsSemester").find(item => item.data.status === "CURRENT");
  if (!semester) return result;
  const enrollments = repo.all("sportsEnrollment").filter(item => item.ownerId === actor.id && item.data.status === "ACTIVE" && item.data.semesterId === semester.id);
  const course = repo.all("sportsCourse").find(item => item.data.semesterId === semester.id && ["PUBLISHED", "CLOSED"].includes(String(item.data.status)) && enrollments.some(e => e.data.courseId === item.id));
  if (!course) return result;
  const latest = repo.all("sportsProgress")
    .filter(item => item.ownerId === actor.id && item.data.courseId === course.id)
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence) || b.createdAt.localeCompare(a.createdAt))[0];
  const minutes = latest?.data.total;
  // Missing projections are not a confirmed zero; stale projections cannot fill newer gaps.
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes < 0) return result;
  const related = course.data.relatedTarget, other = course.data.otherTarget;
  const target = typeof related === "number" && Number.isFinite(related) && related >= 0 && typeof other === "number" && Number.isFinite(other) && other >= 0 && related + other > 0 ? (related + other) / 60 : null;
  result.progress = mapSportsProgress({
    courses: [{ isCurrent: true, enrollmentStatus: "enrolled", name: String(course.data.name ?? "体育课程"), semester: String(semester.data.name ?? "本学期") }],
    progress: { totalValidHours: minutes / 60 },
    hourRule: { total: target },
  }, "local");
  return result;
}
