import { studentNumber } from './student-search';
import { initialV2State, type V2State } from "../../shared/v2/model";
import type { AlumniData } from "../../shared/v2/alumniModel";
import {
  addAlumniSlot,
  cancelAlumniBooking,
  closeAlumniSlot,
  decideAlumniChat,
  editAlumniProfile,
  followAlumni,
  requestAlumniChat,
  reviewAlumni,
  submitAlumniCertification,
} from "../../shared/v2/alumniPolicy";
import { demand, type Account } from "./auth";
import { canSpeak, reviewer, student } from "./community";
import {
  integerField,
  enumField,
  Repository,
  textField,
  type Entity,
  type Fields,
} from "./repository";

export const emptyAlumni = (): AlumniData => ({
  profiles: [],
  follows: [],
  slots: [],
  bookings: [],
  notices: [],
  history: [],
});
export function readAlumni(repo: Pick<Repository,"all">): AlumniData {
  return (
    (repo.all("alumniState")[0]?.data.value as AlumniData | undefined) ??
    emptyAlumni()
  );
}
export function alumniCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (!action.startsWith("alumni.")) return undefined;
  if (action === "alumni.review") reviewer(actor);
  else student(actor);
  const before = readAlumni(repo);
  if (action === "alumni.post") {
    canSpeak(actor);
    const profile = before.profiles.find(
      (p) => p.owner === actor.id && p.status === "approved",
    );
    demand(profile, "需要本人已通过校友认证。", 403);
    const direction = enumField(input, "direction", ["升学", "就业"]);
    return repo.create("post", actor.id, {
      alumniId: profile.id,
      title: textField(input, "title", 80),
      body: textField(input, "body", 1000),
      board: `校友${direction}`,
      images: [],
      status: "pending",
    });
  }
  const state: V2State = {
    ...initialV2State,
    posts: [],
    role: action === "alumni.review" ? "admin" : "student",
    alumni: before,
    coffeeBookings: [],
    teacherCoffee: {
      profiles: {},
      notices: [],
      slots: repo.all("coffeeSlot").map((s) => ({
        id: s.id,
        teacherId: s.ownerId!,
        startAt: String(s.data.startAt),
        endAt: String(s.data.endAt),
        location: String(s.data.location),
        capacity: Number(s.data.capacity),
        closed: s.data.closed === true,
        bookingCount: 0,
        status: "available",
        dateLabel: "",
        timeLabel: "",
      })),
      bookings: repo.all("coffeeBooking").map((b) => ({
        id: b.id,
        student: b.ownerId!,
        slotId: String(b.data.slotId),
        proposedSlotId:
          typeof b.data.proposedSlotId === "string"
            ? b.data.proposedSlotId
            : undefined,
        topic: String(b.data.topic),
        status: b.data.status === "confirmed" ? "confirmed" : "cancelled",
        createdAt: b.createdAt,
        history: [],
      })),
    },
  };
  const policyActor = { id: actor.id, role: state.role };
  let next: V2State;
  const profileInput = () => ({
    city: textField(input, "city", 40),
    direction: enumField(input, "direction", ["升学", "就业"]),
    experience: textField(input, "experience", 120),
    topics: textField(input, "topics", 120),
    bio: textField(input, "bio", 500, true),
    accepting: input.accepting !== false,
  });
  switch (action) {
    case "alumni.apply":
      next = submitAlumniCertification(state, policyActor, {
        ...profileInput(),
        name: actor.name,
        studentNumber: studentNumber(repo.db, actor) ?? textField(input, "studentNumber", 100),
        studentNumberSource: studentNumber(repo.db, actor) ? "verified-email" : "applicant",
        major: textField(input, "major", 80),
        graduationYear: integerField(
          input,
          "graduationYear",
          2005,
          new Date().getFullYear(),
        ),
        evidence: textField(input, "evidence", 1000),
      });
      break;
    case "alumni.profile":
      next = editAlumniProfile(state, policyActor, profileInput());
      break;
    case "alumni.review":
      next = reviewAlumni(
        state,
        policyActor,
        textField(input, "id", 100),
        input.approve === true,
        textField(input, "reason", 1000, input.approve === true),
      );
      break;
    case "alumni.follow":
      next = followAlumni(state, policyActor, textField(input, "id", 100));
      break;
    case "alumni.slot.create":
      next = addAlumniSlot(state, policyActor, {
        startAt: textField(input, "startAt", 40),
        endAt: textField(input, "endAt", 40),
        location: textField(input, "location", 120),
      });
      break;
    case "alumni.slot.close":
      next = closeAlumniSlot(state, policyActor, textField(input, "id", 100));
      break;
    case "alumni.request": {
      const slot = before.slots.find((s) => s.id === input.slotId),
        profile = before.profiles.find((p) => p.id === slot?.alumniId);
      demand(
        profile && repo.person(profile.owner).status !== "banned",
        "校友当前无法接受申请。",
      );
      next = requestAlumniChat(
        state,
        policyActor,
        textField(input, "slotId", 100),
        textField(input, "question", 500),
      );
      break;
    }
    case "alumni.decide": {
      const booking = before.bookings.find((b) => b.id === input.id);
      demand(
        booking &&
          (input.accept !== true ||
            repo.person(booking.student).status !== "banned"),
        "申请人当前无法预约。",
      );
      next = decideAlumniChat(
        state,
        policyActor,
        textField(input, "id", 100),
        input.accept === true,
        textField(input, "reason", 1000, input.accept === true),
      );
      break;
    }
    case "alumni.cancel":
      next = cancelAlumniBooking(
        state,
        policyActor,
        textField(input, "id", 100),
        textField(input, "reason", 1000, true),
      );
      break;
    default:
      return undefined;
  }
  const data = next.alumni!;
  for (const notice of data.notices.filter(
    (n) => !before.notices.some((old) => old.id === n.id),
  ))
    repo.notify(
      [notice.recipient],
      typeof input.id === "string" ? input.id : null,
      action,
      notice.body,
    );
  // Notices live in the shared notification table; rule history remains append-only.
  data.notices = [];
  const stored = repo.all("alumniState")[0];
  return stored
    ? repo.save(stored, { value: data })
    : repo.create("alumniState", null, { value: data });
}
