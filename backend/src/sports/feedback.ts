import { demand, type Account } from "../auth";
import { Repository, enumField, textField, type Fields } from "../repository";
import { sportsRole, version } from "./courses";
import { administratorAccess, requireSportsPermission } from "./permissions";
export const feedbackTypes = [
  "BUG",
  "SUGGESTION",
  "ACCESSIBILITY",
  "PRIVACY",
  "OTHER",
] as const;
export const feedbackStates = [
  "PROCESSING",
  "TECHNICAL",
  "RESOLVED",
  "CLOSED",
] as const;
export function sportsFeedbackCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (action === "sports.feedback.submit") {
    sportsRole(repo, actor, "student");
    return repo.create("sportsFeedback", actor.id, {
      type: enumField(input, "type", feedbackTypes),
      description: textField(input, "description", 5000),
      status: "NEW",
    });
  }
  if (action !== "sports.feedback.reply") return undefined;
  requireSportsPermission(repo, actor, "FEEDBACK");
  const feedback = repo.get(input.id, "sportsFeedback");
  version(feedback, input);
  const status = enumField(input, "status", feedbackStates),
    reply = textField(input, "reply", 5000);
  demand(feedback.ownerId, "反馈缺少原主体。", 409);
  repo.create("sportsFeedbackReply", actor.id, {
    feedbackId: feedback.id,
    actorName: actor.name,
    reply,
    previousStatus: feedback.data.status,
    status,
    at: Date.now(),
    sequence: repo.all("sportsFeedbackReply").filter(r=>r.data.feedbackId===feedback.id).length+1,
  });
  const saved = repo.save(feedback, { status });
  repo.notify(
    [feedback.ownerId],
    feedback.id,
    action,
    `体育反馈已有公开回复：${reply}`,
  );
  return saved;
}
export function feedbackWorkspace(repo: Repository, actor: Account) {
  const manage = administratorAccess(repo, actor).permissions.includes(
    "FEEDBACK",
  );
  const student = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "student" &&
        i.data.status === "verified",
    );
  const feedback = repo
    .all("sportsFeedback")
    .filter((f) => manage || (student && f.ownerId === actor.id))
    .map((f) => {
      if (!manage) return f;
      const person = repo.db
        .prepare("SELECT name,email FROM accounts WHERE id=?")
        .get(f.ownerId!);
      const identity = repo
        .all("sportsIdentity")
        .find((i) => i.ownerId === f.ownerId && i.data.role === "student");
      return {
        ...f,
        data: {
          ...f.data,
          studentName: person?.name ?? "已注销学生",
          studentNumber: identity?.data.studentNumber ?? "",
          email: person?.email ?? "",
        },
      };
    });
  const ids = new Set(feedback.map((f) => f.id));
  return {
    feedback,
    feedbackReplies: repo
      .all("sportsFeedbackReply")
      .filter((r) => ids.has(String(r.data.feedbackId))),
    canManageFeedback: manage,
  };
}
