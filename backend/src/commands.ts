import { notificationPolicy } from "./notification-policy";
import { projectWorkspace } from "./snapshot-projection";
import { runSync } from "./storage/effects";
import { relationPolicy } from "./relation-policy";
import { studentNumber } from './student-search';
import { relationshipHistory } from './relationship-history';
import { randomUUID } from "node:crypto";
import { authenticate, demand, digest, timestamp, type Account } from "./auth";
import { transaction, type Database } from "./database";
import { Repository, type Fields } from "./repository";
import {
  communityCommand,
  has,
} from "./community";
import { coffeeCommand } from "./coffee";
import { governanceCommand } from "./governance";
import { activityCommand } from "./activities";
import { alumniCommand } from "./alumni";

import { sportsCourseCommand } from "./sports/courses";
import { sportsCompanion } from "./sports/companion";
import { sportsCourseManagementCommand } from "./sports/course-management";
import { sportsSessionCommand } from "./sports/sessions";
import { sportsMaterialCommand } from "./sports/materials";
import { sportsReviewCommand } from "./sports/review";
import { sportsSupplementCommand } from "./sports/supplements";
import { sportsSystemCommand, sportsWriteGate } from "./sports/system";
import { sportsCalendarCommand } from "./sports/calendar";
import { sportsIncidentCommand } from "./sports/incidents";
import { sportsSwimCommand } from "./sports/swimming";
import { sportsPasswordCommand } from "./sports/password";
import { sportsTeacherAccountCommand } from "./sports/teacher-accounts";
import { sportsAdministratorCommand } from "./sports/administrators";
import { sportsAdministratorDeletion } from "./sports/administrator-deletion";
import { requireSportsSuperAdmin } from "./sports/permissions";
import { sportsFeedbackCommand } from "./sports/feedback";
import { sportsHelpCommand } from "./sports/help";
import { sportsConversionCommand } from "./sports/conversion";
import { sportsRosterCommand } from "./sports/roster";
import { sportsEnduranceImportCommand } from "./sports/endurance-import";
import { sportsEnduranceCommand } from "./sports/endurance";
import { sportsGradeCommand } from "./sports/grades";
import { sportsApplicationCommand } from "./sports/applications";
import { sportsSettlementCommand } from "./sports/settlement";
import { sportsCorrectionCommand } from "./sports/corrections";
import {
  sportsAccountGate,
  requiresPasswordChange,
} from "./sports/account-gate";

export function execute(
  db: Database,
  token: string,
  action: string,
  input: Fields,
  requestId: string,
) {
  demand(
    /^[a-z]+(?:\.[a-z]+)+$/.test(action) &&
      requestId.length >= 8 &&
      requestId.length <= 100,
    "请求格式无效。",
  );
  return transaction(db, () => {
    const actor = authenticate(db, token),
      repo = new Repository(db);
    demand(actor.status !== "banned", "账号已封禁，不能进行业务写入。", 403);
    if (action !== "sports.password.change") sportsAccountGate(repo, actor);
    sportsWriteGate(repo, action);
    if (action.startsWith("sports.admins."))
      requireSportsSuperAdmin(repo, actor);
    const booleanArguments: Record<string, string> = {
      "content.review": "",
      "room.decide": "accept",
      "report.decide": "upheld",
      "certification.review": "approve",
      "organization.review": "approve",
      "activity.visibility": "publish",
      "relation.set": "enabled",
      "coffee.answer": "accept",
      "coffee.slot.update": "closed",
      "alumni.review": "approve",
      "alumni.decide": "accept",
      "alumni.profile": "accepting",
      "mail.visibility": "publish",
    };
    const flag = booleanArguments[action];
    if (flag)
      demand(
        typeof input[flag] === "boolean",
        `${flag} 必须明确为 true 或 false。`,
      );
    const hash = digest(JSON.stringify({ action, input }));
    const old = db
      .prepare(
        "SELECT request_hash,result FROM command_receipts WHERE actor_id=? AND request_id=?",
      )
      .get(actor.id, requestId);
    if (old) {
      demand(old.request_hash === hash, "该请求标识已用于不同操作。", 409);
      return JSON.parse(String(old.result));
    }
    let result: unknown;
    if (action.startsWith("notification.")) {
      result = runSync(notificationPolicy(repo,actor,action,input));
      demand(result,"不支持该业务操作。",404);
    } else if (action === "relation.set") {
      result = runSync(relationPolicy(repo, actor, input));
    } else {
      result =
        sportsPasswordCommand(repo, actor, token, action, input) ??
        sportsTeacherAccountCommand(repo, actor, action, input) ??
        sportsAdministratorCommand(repo, actor, action, input) ??
        sportsAdministratorDeletion(repo, actor, action, input) ??
        sportsFeedbackCommand(repo, actor, action, input) ??
        sportsHelpCommand(repo, actor, action, input) ??
        sportsConversionCommand(repo, actor, action, input) ??
        sportsRosterCommand(repo, actor, action, input) ??
        sportsEnduranceImportCommand(repo, actor, action, input) ??
        sportsEnduranceCommand(repo, actor, action, input) ??
        sportsGradeCommand(repo, actor, action, input) ??
        sportsApplicationCommand(repo, actor, action, input) ??
        sportsSettlementCommand(repo, actor, action, input) ??
        sportsCorrectionCommand(repo, actor, action, input) ??
        communityCommand(repo, actor, action, input) ??
        coffeeCommand(repo, actor, action, input) ??
        governanceCommand(repo, actor, action, input) ??
        activityCommand(repo, actor, action, input) ??
        alumniCommand(repo, actor, action, input) ??
        sportsSystemCommand(repo, actor, action, input) ??
        sportsCalendarCommand(repo, actor, action, input) ??
        sportsIncidentCommand(repo, actor, action, input) ??
        sportsSwimCommand(repo, actor, action, input) ??
        sportsCourseCommand(repo, actor, action, input) ??
        sportsCourseManagementCommand(repo, actor, action, input) ??
        sportsSessionCommand(repo, actor, action, input) ??
        sportsMaterialCommand(repo, actor, action, input) ??
        sportsReviewCommand(repo, actor, action, input) ??
        sportsSupplementCommand(repo, actor, action, input);
      demand(result, "不支持该业务操作。", 404);
      // A full alumni aggregate must never be returned in a mutation response.
      result = { id: (result as { id: string }).id };
    }
    db.prepare(
      "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      randomUUID(),
      actor.id,
      actor.roles.join(","),
      action,
      typeof input.id === "string"
        ? input.id
        : ((result as { id?: string })?.id ?? null),
      typeof input.reason === "string" ? input.reason : "",
      JSON.stringify({
        result,
        ...(["room.create", "room.decide", "room.finish", "room.moderate"].includes(action)
          ? {teamResult: repo.get((result as {id:string}).id)} : {}),
        ...(action === "relation.set"
          ? { relation: { kind: input.kind, enabled: input.enabled === true } }
          : {}),
        ...(action === "coffee.answer" ? {accepted: input.accept} : {}),
      }),
      timestamp(),
    );
    db.prepare("INSERT INTO command_receipts VALUES(?,?,?,?,?)").run(
      actor.id,
      requestId,
      hash,
      JSON.stringify(result),
      timestamp(),
    );
    return result;
  });
}

export function snapshot(db: Database, actor: Account) {
 const repo=new Repository(db),operate=has(actor,'operator','superadmin');
   const notifications = db
    .prepare(
      "SELECT id,entity_id AS entityId,event,body,created_at AS createdAt,read_at AS readAt FROM notifications WHERE recipient_id=? ORDER BY created_at DESC",
    )
    .all(actor.id);

 return projectWorkspace({repo, firstLoginOnly:requiresPasswordChange(repo,actor),studentNumber:studentNumber(db,actor),sports:sportsCompanion(repo,actor),notifications,
 coffeeHistory:(id:string)=>db.prepare(
        "SELECT id, action, reason, data, created_at AS at FROM audit WHERE entity_id=? AND action IN ('coffee.book','coffee.move','coffee.answer','coffee.cancel') ORDER BY created_at, rowid",
      ).all(id).map(row => {
        const detail = JSON.parse(String(row.data)) as {accepted?: boolean};
        return {id: row.id, action: row.action, reason: row.reason, at: row.at,
          ...(row.action === "coffee.answer" && typeof detail.accepted === "boolean" ? {accepted: detail.accepted} : {})};
      }),
 relationshipHistory:(visible)=>relationshipHistory(db,actor.id,visible),
     notificationBatches: operate
      ? db
          .prepare(
            `SELECT a.entity_id AS id, a.created_at AS createdAt,
      count(n.id) AS total, sum(CASE WHEN n.read_at IS NOT NULL THEN 1 ELSE 0 END) AS read,
      CASE WHEN count(n.id)=0 THEN NULL ELSE 1.0*sum(CASE WHEN n.read_at IS NOT NULL THEN 1 ELSE 0 END)/count(n.id) END AS readRate
      FROM audit a LEFT JOIN notifications n ON n.entity_id=a.entity_id
      WHERE a.action='notification.send' AND (a.actor_id=? OR ?=1)
      GROUP BY a.id ORDER BY a.created_at DESC`,
          )
          .all(actor.id, has(actor, "superadmin") ? 1 : 0)
      : [],
    relations: db
      .prepare(
        "SELECT entity_id AS entityId,kind,created_at AS createdAt FROM relations WHERE account_id=?",
      )
      .all(actor.id),
    audit: has(actor, "superadmin")
      ? db
          .prepare("SELECT * FROM audit ORDER BY created_at DESC LIMIT 200")
          .all()
      : [],

 },actor);
}
