import {shopPolicy} from './shops';
import { notificationPolicy } from "./notification-policy";
import { projectWorkspace } from "./snapshot-projection";
import { runSync } from "./storage/effects";
import { relationPolicy } from "./relation-policy";
import { recordPostView } from './post-views';
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

import { passwordCommand } from "./accounts/password";
import { administratorCommand } from "./accounts/administrators";
import { administratorDeletion } from "./accounts/administrator-deletion";
import { requireSuperAdmin } from "./accounts/permissions";
import {
  accountSecurityGate,
  requiresPasswordChange,
} from "./accounts/account-gate";

export function execute(
  db: Database,
  token: string,
  action: string,
  input: Fields,
  requestId: string,
) {
  return executeWithActor(db, () => authenticate(db, token), token, action, input, requestId);
}

export function executeMailboxImport(db: Database, actorId: string, input: Fields, requestId: string) {
  return executeWithActor(db, () => {
    const actor = new Repository(db).person(actorId);
    demand(actor.status === 'active' && actor.roles.some(role => role === 'operator' || role === 'superadmin'), '邮箱导入操作账号无效。', 403);
    return actor;
  }, '', 'mail.import', input, requestId);
}

function executeWithActor(db: Database, actorProvider: () => Account, token: string, action: string, input: Fields, requestId: string) {
  demand(
    /^[a-z]+(?:\.[a-z]+)+$/.test(action) &&
      requestId.length >= 8 &&
      requestId.length <= 100,
    "请求格式无效。",
  );
  demand(!action.startsWith('sports.'),'伴学不提供体育业务写入。',404);
  return transaction(db, () => {
    const actor = actorProvider(),
      repo = new Repository(db);
    demand(actor.status !== "banned", "账号已封禁，不能进行业务写入。", 403);
    if (action !== "accounts.password.change") accountSecurityGate(repo, actor);
    if (action.startsWith("accounts.admins."))
      requireSuperAdmin(repo, actor);
    if (action === 'post.view') return recordPostView(db, repo, actor, input);
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
        passwordCommand(repo, actor, token, action, input) ??
        administratorCommand(repo, actor, action, input) ??
        administratorDeletion(repo, actor, action, input) ??
        runSync(shopPolicy(repo, actor, action, input)) ??
        communityCommand(repo, actor, action, input) ??
        coffeeCommand(repo, actor, action, input) ??
        governanceCommand(repo, actor, action, input) ??
        activityCommand(repo, actor, action, input) ??
        alumniCommand(repo, actor, action, input);
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
        ...(action === 'keyword.save' ? { keywordChange: { word: input.word } } : {}),
        ...(action === 'keyword.set' ? { keywordChange: { enabled: input.enabled } } : {}),
        ...(action === 'keyword.delete' ? { keywordChange: { deleted: true } } : {}),
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
 const relations=db.prepare('SELECT entity_id AS entityId,kind,created_at AS createdAt FROM relations WHERE account_id=?').all(actor.id);
 const cached=new Map<string,ReturnType<Repository['all']>>();
 const scopedRepo:Pick<Repository,'all'|'get'|'people'>={
  all(kind) {
   if(!['post','room','comment'].includes(kind)) return repo.all(kind);
   if(cached.has(kind)) return cached.get(kind)!;
   const ids=kind==='post'
    ? db.prepare("SELECT id FROM entities WHERE kind='post' AND (owner_id=? OR (json_extract(data,'$.status')='visible' AND id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save'))) ORDER BY created_at DESC,id LIMIT 50").all(actor.id,actor.id)
    :kind==='room'
    ? db.prepare("SELECT id FROM entities WHERE kind='room' AND (owner_id=? OR id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save') OR EXISTS(SELECT 1 FROM json_each(entities.data,'$.members') WHERE value=?)) ORDER BY created_at DESC,id LIMIT 50").all(actor.id,actor.id,actor.id)
    : db.prepare("SELECT id FROM entities WHERE kind='comment' AND (owner_id=? OR json_extract(data,'$.postId') IN (SELECT id FROM entities WHERE kind='post' AND (owner_id=? OR id IN (SELECT entity_id FROM relations WHERE account_id=? AND kind='save')))) ORDER BY created_at DESC,id LIMIT 50").all(actor.id,actor.id,actor.id);
   const value=ids.map(row=>repo.get(row.id,kind));cached.set(kind,value);return value;
  },get:(id,kind)=>repo.get(id,kind),people:()=>repo.people(),
 };
   const notifications = db
    .prepare(
      "SELECT id,entity_id AS entityId,event,body,created_at AS createdAt,read_at AS readAt FROM notifications WHERE recipient_id=? ORDER BY created_at DESC",
    )
    .all(actor.id);

 return projectWorkspace({repo:scopedRepo, firstLoginOnly:requiresPasswordChange(repo,actor),studentNumber:studentNumber(db,actor),sports:null,notifications,
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
    relations,
    audit: has(actor, "superadmin")
      ? db
          .prepare("SELECT * FROM audit ORDER BY created_at DESC LIMIT 200")
          .all()
      : [],

 },actor);
}
