import type { Account } from './auth';
import type { Repository, Entity, Fields } from './repository';
import { strings } from './repository';
import { has } from './community';
import { readAlumni } from './alumni';
import { bookingStatus } from '../../shared/v2/alumniPolicy';
import { projectDisplayPeople } from './display-people';
import type { SportsCompanion, SportsSourceStatus } from '../../shared/live/sportsCompanion';
import type { RelationshipHistory } from '../../shared/v2/relationshipAdapter';
import { activityMailboxConfigured } from './activity-mailbox';
import { activityOcrConfigured } from './activity-screenshot-ocr';
export interface SnapshotSource {
 repo: Pick<Repository,'all'|'get'|'people'>;
 firstLoginOnly:boolean;studentNumber:string|null;sports:SportsCompanion|null;sportsStatus?:SportsSourceStatus;
 notifications:Fields[];relations:Fields[];audit:Fields[];notificationBatches:Fields[];
 coffeeHistory:(id:string)=>Fields[];
 relationshipHistory:(visible:Entity[])=>RelationshipHistory[];
}
export function projectWorkspace(source: SnapshotSource, actor: Account) {
  const repo=source.repo;
  if (source.firstLoginOnly)
    return {
      firstLoginOnly: true,
      account: {...actor, studentNumber:source.studentNumber},
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
  const review = has(actor, "reviewer", "superadmin"),
    operate = has(actor, "operator", "superadmin"),
    manageKeywords = has(actor, "reviewer", "operator", "superadmin");
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
  const notifications = source.notifications;
  const eligibleTeachers = new Set(repo.people().filter(p => p.status !== 'banned' && p.roles.includes('teacher')).map(p => p.id));
  const visibleCoffeeBookings = repo.all('coffeeBooking').filter(b => own(b.ownerId) || (b.data.teacherId === actor.id && has(actor, 'teacher')) || operate);
  const readableTeacher = (id: string | null) => !!id && (eligibleTeachers.has(id) || own(id) || operate || visibleCoffeeBookings.some(b => b.data.teacherId === id));
  const entities = [
    ...posts,
    ...(manageKeywords ? repo.all('communityKeyword').filter(keyword => keyword.data.deleted !== true) : []),
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
    ...repo.all("teacherProfile").filter(p => readableTeacher(p.ownerId)).map(p => ({...p, data: {...p.data, enabled: eligibleTeachers.has(p.ownerId!) && p.data.enabled !== false}})),
    ...repo.all("coffeeSlot").filter(s => readableTeacher(s.ownerId)).map((s) => ({
      ...s,
      data: {
        ...s.data,
        closed: s.data.closed === true || !eligibleTeachers.has(s.ownerId!),
        occupied: repo
          .all("coffeeBooking")
          .filter(
            (b) =>
              b.data.status === "confirmed" &&
              (b.data.slotId === s.id || b.data.proposedSlotId === s.id),
          ).length,
      },
    })),
    ...visibleCoffeeBookings.map((booking) => ({...booking, data: {...booking.data, history: source.coffeeHistory(booking.id)}})),
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
    ...scopedAlumni.profiles.map((profile) => profile.owner),
  ].filter((id):id is string=>typeof id==='string'));
  const people=projectDisplayPeople(actor,repo.people(),visiblePeople,repo.all('preferences'),repo.all('profile'));
  return {
    account: {...actor, studentNumber:source.studentNumber},
    sports: source.sports,
    sportsStatus: source.sportsStatus ?? "unavailable",
    entities,
    alumni: scopedAlumni,
    relationshipHistory: source.relationshipHistory(entities),
    notifications,
    people,
    notificationBatches: operate ? source.notificationBatches : [],
    relations: source.relations,
    audit: has(actor,"superadmin") ? source.audit : [],
    capabilities: {
      schoolIdentity: process.env.BNBU_IDENTITY_VERIFICATION_URL
        ? "configured"
        : "external-service-required",
      sports: source.sportsStatus === "available" || source.sportsStatus === "not-enrolled"
        ? "configured" : "external-service-required",
      mail: "explicit-field-extraction",
      activityMailbox: activityMailboxConfigured() ? 'configured' : 'unconfigured',
      activityScreenshotOcr: activityOcrConfigured() ? 'configured' : 'unconfigured',
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
