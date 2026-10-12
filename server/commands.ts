import { studentNumber } from './student-search';
import { relationshipHistory } from './relationship-history';
import { randomUUID } from "node:crypto";
import { authenticate, demand, digest, timestamp, type Account } from "./auth";
import { transaction, type Database } from "./database";
import { Repository, strings, textField, type Fields } from "./repository";
import {
  communityCommand,
  has,
  operator,
  publicEntity,
  student,
} from "./community";
import { coffeeCommand } from "./coffee";
import { governanceCommand } from "./governance";
import { activityCommand } from "./activities";
import { alumniCommand, readAlumni } from "./alumni";
import { bookingStatus } from "../src/v2/alumniPolicy";
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
    if (action === "notification.read") {
      const id = textField(input, "id", 100);
      demand(
        db
          .prepare("SELECT 1 FROM notifications WHERE id=? AND recipient_id=?")
          .get(id, actor.id),
        "通知不存在。",
        404,
      );
      db.prepare(
        "UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND recipient_id=?",
      ).run(timestamp(), id, actor.id);
      result = { id };
    } else if (action === "notification.readmany") {
      demand(Array.isArray(input.ids) && input.ids.length > 0 && input.ids.every(id => typeof id === "string" && id.length > 0 && id.length <= 100), "请选择要标为已读的通知。");
      const ids = [...new Set(input.ids as string[])];
      const owned = db.prepare("SELECT 1 FROM notifications WHERE id=? AND recipient_id=?");
      for (const id of ids) demand(owned.get(id, actor.id), "通知不存在。", 404);
      const update = db.prepare("UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND recipient_id=?");
      const at = timestamp();
      for (const id of ids) update.run(at, id, actor.id);
      result = { ids };
    } else if (action === "notification.send") {
      operator(actor);
      const recipients = strings(input.recipients);
      demand(
        recipients.length > 0 && recipients.length <= 1000,
        "请选择 1–1000 位接收人。",
      );
      recipients.forEach((id) => repo.person(id));
      const batch = randomUUID();
      repo.notify(
        recipients,
        batch,
        "broadcast",
        textField(input, "body", 2000),
      );
      result = { id: batch, recipients: [...new Set(recipients)].length };
    } else if (action === "relation.set") {
      student(actor);
      const entity = repo.get(input.id),
        kind = textField(input, "kind", 40);
      const allowed: Record<string, string[]> = {
        post: ["like", "save"],
        activity: ["like", "save", "participate"],
        room: ["save"],
        organization: ["follow"],
      };
      demand(allowed[entity.kind]?.includes(kind), "此对象不支持该操作。");
      if (input.enabled === true) {
        demand(
          entity.kind === "organization"
            ? entity.data.status === "approved" &&
                entity.data.visibility === "visible"
            : publicEntity(entity),
          "对象当前未公开。",
        );
        if (kind === "participate")
          demand(
            Date.parse(String(entity.data.endAt || entity.data.startAt)) >
              Date.now(),
            "已结束活动不能标记参与。",
          );
      }
      repo.relation(actor.id, entity.id, kind, input.enabled === true);
      result = { id: entity.id };
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
  if (requiresPasswordChange(new Repository(db), actor))
    return {
      firstLoginOnly: true,
      account: {...actor, studentNumber:studentNumber(db,actor)},
      entities: [],
      people: [],
      notifications: [],
      relations: [],
      audit: [],
      notificationBatches: [],
      alumni: {
        profiles: [],
        follows: [],
        slots: [],
        bookings: [],
        notices: [],
        history: [],
      },
      capabilities: {},
    };
  const repo = new Repository(db),
    review = has(actor, "reviewer", "superadmin"),
    operate = has(actor, "operator", "superadmin");
  const own = (ownerId: string | null) => ownerId === actor.id;
  const posts = repo
    .all("post")
    .filter((p) => p.data.status === "visible" || own(p.ownerId) || review);
  const rooms = repo
    .all("room")
    .filter((r) => r.data.visibility === "visible" || own(r.ownerId) || review);
  const memberRooms = repo
    .all("room")
    .filter(
      (r) =>
        r.data.status === "open" &&
        r.data.visibility === "visible" &&
        strings(r.data.members).includes(actor.id),
    );
  const alumni = readAlumni(repo);
  const myAlumniIds = alumni.profiles
    .filter((p) => p.owner === actor.id)
    .map((p) => p.id);
  const bookings = alumni.bookings
    .filter(
      (b) =>
        b.student === actor.id ||
        alumni.slots.some(
          (s) => s.id === b.slotId && myAlumniIds.includes(s.alumniId),
        ),
    )
    .map((b) => ({ ...b, status: bookingStatus(alumni, b) }));
  const scopedAlumni = {
    profiles: alumni.profiles
      .filter((p) => p.status === "approved" || p.owner === actor.id || review ||
        alumni.slots.some(s => s.alumniId === p.id && bookings.some(b => b.slotId === s.id)))
      .map((p) =>
        p.owner === actor.id || review
          ? p
          : { ...p, studentNumber: undefined, studentNumberSource: undefined, evidence: "", reviewNote: "" },
      ),
    slots: alumni.slots.filter((s) => bookings.some(b => b.slotId === s.id) ||
      alumni.profiles.some(
        (p) =>
          p.id === s.alumniId &&
          (p.status === "approved" || p.owner === actor.id),
      ),
    ).map(s => ({...s, occupied: alumni.bookings.some(b => b.slotId === s.id && bookingStatus(alumni, b) === "confirmed")})),
    bookings,
    follows: alumni.follows.filter((f) => f.student === actor.id),
    history: alumni.history.filter(
      (h) =>
        h.actor === actor.id ||
        myAlumniIds.includes(h.objectId) ||
        bookings.some((b) => b.id === h.objectId),
    ),
    notices: [],
  };
  const notifications = db
    .prepare(
      "SELECT id,entity_id AS entityId,event,body,created_at AS createdAt,read_at AS readAt FROM notifications WHERE recipient_id=? ORDER BY created_at DESC",
    )
    .all(actor.id);
  const entities = [
    ...posts,
    ...repo
      .all("comment")
      .filter(
        (c) =>
          posts.some(
            (p) =>
              p.id === c.data.postId &&
              (p.data.status === "visible" || review || own(p.ownerId)),
          ) &&
          (c.data.status === "visible" || own(c.ownerId) || review),
      ),
    ...rooms.map((r) => ({
      ...r,
      data: {
        ...r.data,
        memberCount: strings(r.data.members).length,
        members:
          strings(r.data.members).includes(actor.id) || review || own(r.ownerId)
            ? r.data.members
            : [],
        isMember: strings(r.data.members).includes(actor.id),
      },
    })),
    ...repo
      .all("roomApplication")
      .filter(
        (a) =>
          own(a.ownerId) ||
          rooms.some((r) => r.id === a.data.roomId && own(r.ownerId)),
      ).map((application) => {
        const room = repo.get(application.data.roomId, "room");
        return {...application, data: {...application.data, roomSummary: {
          id: room.id, title: room.data.title, status: room.data.status, visibility: room.data.visibility,
        }}};
      }),
    ...repo
      .all("roomReview")
      .filter((r) => rooms.some((room) => room.id === r.data.roomId)),
    ...repo
      .all("message")
      .filter((m) => memberRooms.some((r) => r.id === m.data.roomId)),
    ...repo.all("certification").filter((c) => own(c.ownerId) || review),
    ...repo.all("report").filter((c) => own(c.ownerId) || review).map((report) => {
      if (review) return report;
      const evidence = report.data.snapshot as Fields;
      // Historical evidence does not grant access to a team's member list.
      const publicEvidence = { ...evidence };
      delete publicEvidence.members;
      return { ...report, data: { ...report.data, snapshot: publicEvidence } };
    }),
    ...repo
      .all("organization")
      .filter(
        (o) =>
          (o.data.status === "approved" && o.data.visibility === "visible") ||
          own(o.ownerId) ||
          review ||
          operate,
      ),
    ...repo
      .all("knowledge")
      .filter((k) => k.data.status === "published" || operate),
    ...repo.all("answer").filter((a) => own(a.ownerId)),
    ...repo.all("feedback").filter((f) => own(f.ownerId) || operate),
    ...repo.all("profile").filter((p) => own(p.ownerId)),
    ...repo.all("preferences").filter((p) => own(p.ownerId)),
    ...repo.all("timetable").filter((t) => own(t.ownerId)),
    ...repo.all("teacherProfile"),
    ...repo.all("coffeeSlot").map((s) => ({
      ...s,
      data: {
        ...s.data,
        occupied: repo
          .all("coffeeBooking")
          .filter(
            (b) =>
              b.data.status === "confirmed" &&
              (b.data.slotId === s.id || b.data.proposedSlotId === s.id),
          ).length,
      },
    })),
    ...repo
      .all("coffeeBooking")
      .filter(
        (b) =>
          own(b.ownerId) ||
          (b.data.teacherId === actor.id && has(actor, "teacher")) ||
          operate,
      ).map((booking) => ({...booking, data: {...booking.data, history: db.prepare(
        "SELECT id, action, reason, data, created_at AS at FROM audit WHERE entity_id=? AND action IN ('coffee.book','coffee.move','coffee.answer','coffee.cancel') ORDER BY created_at, rowid",
      ).all(booking.id).map(row => {
        const detail = JSON.parse(String(row.data)) as {accepted?: boolean};
        return {id: row.id, action: row.action, reason: row.reason, at: row.at,
          ...(row.action === "coffee.answer" && typeof detail.accepted === "boolean" ? {accepted: detail.accepted} : {})};
      })}})),
    ...repo
      .all("activity")
      .filter(
        (a) => a.data.status === "published" || own(a.ownerId) || operate,
      ),
    ...(operate ? repo.all("mail") : []),
  ];
  // Expose display identities only when a visible business record needs them.
  const visiblePeople = new Set([
    actor.id,
    ...entities.map((e) => e.ownerId),
    ...memberRooms.flatMap((r) => strings(r.data.members)),
    ...repo.all("coffeeSlot").map((s) => s.ownerId),
  ]);
  const hiddenProfiles = new Set(repo.all("preferences").filter(p => p.data.profilePreview === false).map(p => p.ownerId));
  const people = repo
    .people()
    .filter(
      (p) =>
        operate || has(actor, "superadmin") || visiblePeople.has(String(p.id)),
    )
    .map((p) =>
      has(actor, "superadmin")
        ? p
        : { id: p.id, name: p.name, organization: p.id !== actor.id && hiddenProfiles.has(p.id) && !has(actor, "teacher", "reviewer", "operator") ? "" : p.organization },
    );
  return {
    account: {...actor, studentNumber:studentNumber(db,actor)},
    sports: sportsCompanion(repo, actor),
    entities,
    alumni: scopedAlumni,
    relationshipHistory: relationshipHistory(db, actor.id, entities),
    notifications,
    people,
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
    capabilities: {
      schoolIdentity: process.env.BNBU_IDENTITY_VERIFICATION_URL
        ? "configured"
        : "external-service-required",
      sports: process.env.BNBU_SPORTS_ORIGIN
        ? "configured"
        : "external-service-required",
      mail: "explicit-field-extraction",
      email: process.env.BNBU_EMAIL_DELIVERY_URL
        ? "configured"
        : process.env.BNBU_LOCAL_OUTBOX === "1"
          ? "local-outbox"
          : "unconfigured",
      timetableRecognition: process.env.BNBU_TIMETABLE_UPSTREAM
        ? "configured"
        : "external-service-required",
    },
  };
}
