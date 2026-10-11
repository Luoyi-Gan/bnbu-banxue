import { demand, type Account } from "./auth";
import { has, operator, owner, student } from "./community";
import {
  integerField,
  Repository,
  textField,
  type Entity,
  type Fields,
} from "./repository";
import { readAlumni } from "./alumni";

export function overlaps(a: Fields, b: Fields) {
  return (
    Date.parse(String(a.startAt)) < Date.parse(String(b.endAt)) &&
    Date.parse(String(b.startAt)) < Date.parse(String(a.endAt))
  );
}
export function validPeriod(input: Fields) {
  const startAt = textField(input, "startAt", 40),
    endAt = textField(input, "endAt", 40);
  demand(
    Number.isFinite(Date.parse(startAt)) &&
      Date.parse(startAt) > Date.now() &&
      Date.parse(endAt) > Date.parse(startAt),
    "请填写未来有效起止时间。",
  );
  return { startAt, endAt };
}
export function occupied(repo: Repository, slotId: string, except?: string) {
  return repo
    .all("coffeeBooking")
    .filter(
      (b) =>
        b.id !== except &&
        b.data.status === "confirmed" &&
        (b.data.slotId === slotId || b.data.proposedSlotId === slotId),
    ).length;
}
export function hasConflict(
  repo: Repository,
  personId: string,
  slot: Entity,
  except?: string,
) {
  const alumni = readAlumni(repo);
  return (
    repo
      .all("coffeeBooking")
      .some(
        (b) =>
          b.id !== except &&
          b.ownerId === personId &&
          b.data.status === "confirmed" &&
          [b.data.slotId, b.data.proposedSlotId]
            .filter(Boolean)
            .some((id) => overlaps(repo.get(id, "coffeeSlot").data, slot.data)),
      ) ||
    alumni.bookings.some((b) => {
      if (b.id === except || b.status !== "confirmed") return false;
      const other = alumni.slots.find((s) => s.id === b.slotId);
      return (
        !!other &&
        (b.student === personId ||
          alumni.profiles.some(
            (p) => p.id === other.alumniId && p.owner === personId,
          )) &&
        overlaps({ startAt: other.startAt, endAt: other.endAt }, slot.data)
      );
    })
  );
}
function manageTeacher(actor: Account, teacherId: string) {
  if (actor.id === teacherId && has(actor, "teacher")) return;
  operator(actor);
}
export function coffeeCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action === "coffee.profile") {
    const teacherId =
      typeof input.teacherId === "string" ? input.teacherId : actor.id;
    manageTeacher(actor, teacherId);
    demand(has(repo.person(teacherId), "teacher"), "目标账号没有教师身份。");
    const patch = {
      nickname: textField(input, "nickname", 20),
      bio: textField(input, "bio", 1000, true),
      topics: textField(input, "topics", 500),
      location: textField(input, "location", 120),
      enabled: input.enabled !== false,
    };
    if (!patch.enabled)
      demand(
        !repo
          .all("coffeeBooking")
          .some(
            (b) =>
              b.data.teacherId === teacherId && b.data.status === "confirmed",
          ),
        "仍有有效预约，不能停止交流服务。",
      );
    const old = repo.all("teacherProfile").find((p) => p.ownerId === teacherId);
    return old
      ? repo.save(old, patch)
      : repo.create("teacherProfile", teacherId, patch);
  }
  if (action === "coffee.slot.create") {
    const teacherId =
      typeof input.teacherId === "string" ? input.teacherId : actor.id;
    manageTeacher(actor, teacherId);
    demand(has(repo.person(teacherId), "teacher"), "目标账号没有教师身份。");
    const period = validPeriod(input);
    demand(
      !repo
        .all("coffeeSlot")
        .some(
          (s) =>
            s.ownerId === teacherId &&
            !s.data.closed &&
            overlaps(s.data, period),
        ),
      "与教师其他开放时段重叠。",
    );
    return repo.create("coffeeSlot", teacherId, {
      ...period,
      capacity: integerField(input, "capacity", 1, 1000),
      location: textField(input, "location", 120),
      closed: false,
    });
  }
  if (action === "coffee.slot.update") {
    const slot = repo.get(input.id, "coffeeSlot");
    manageTeacher(actor, slot.ownerId!);
    const count = occupied(repo, slot.id),
      capacity = integerField(input, "capacity", 1, 1000);
    demand(capacity >= count, "容量不能小于预约和改期预留。");
    const period = validPeriod(input);
    demand(
      !count ||
        (Date.parse(period.startAt) === Date.parse(String(slot.data.startAt)) &&
          Date.parse(period.endAt) === Date.parse(String(slot.data.endAt)) &&
          input.closed !== true),
      "已有预约或改期预留，不能调整时间或关闭。",
    );
    demand(
      input.closed === true ||
        !repo
          .all("coffeeSlot")
          .some(
            (s) =>
              s.id !== slot.id &&
              s.ownerId === slot.ownerId &&
              !s.data.closed &&
              overlaps(s.data, period),
          ),
      "时段重叠。",
    );
    return repo.save(slot, {
      ...period,
      capacity,
      closed: input.closed === true,
      location: textField(input, "location", 120),
    });
  }
  if (action === "coffee.book") {
    student(actor);
    const slot = repo.get(input.slotId, "coffeeSlot"),
      teacher = repo.person(slot.ownerId!);
    demand(
      !slot.data.closed &&
        Date.parse(String(slot.data.startAt)) > Date.now() &&
        teacher.status !== "banned" &&
        has(teacher, "teacher") &&
        !repo
          .all("teacherProfile")
          .some((p) => p.ownerId === slot.ownerId && p.data.enabled === false),
      "该时段不可预约。",
    );
    demand(
      occupied(repo, slot.id) < Number(slot.data.capacity) &&
        !hasConflict(repo, actor.id, slot),
      "时段已满或与本人安排冲突。",
      409,
    );
    const booking = repo.create("coffeeBooking", actor.id, {
      slotId: slot.id,
      teacherId: slot.ownerId,
      topic: textField(input, "topic", 500),
      status: "confirmed",
    });
    repo.notify(
      [actor.id, slot.ownerId!],
      booking.id,
      action,
      "Coffee Chat 预约已成立。",
    );
    return booking;
  }
  if (action === "coffee.cancel") {
    const booking = repo.get(input.id, "coffeeBooking");
    if (booking.ownerId === actor.id) student(actor);
    else manageTeacher(actor, String(booking.data.teacherId));
    demand(booking.data.status === "confirmed", "预约已取消。", 409);
    const reason = textField(
      input,
      "reason",
      1000,
      booking.ownerId === actor.id,
    );
    repo.notify(
      [booking.ownerId!, String(booking.data.teacherId)],
      booking.id,
      action,
      `预约已取消${reason ? `：${reason}` : ""}`,
    );
    return repo.save(booking, {
      status: "cancelled",
      proposedSlotId: null,
      reason,
    });
  }
  if (action === "coffee.move") {
    const booking = repo.get(input.id, "coffeeBooking");
    manageTeacher(actor, String(booking.data.teacherId));
    demand(
      booking.data.status === "confirmed" && !booking.data.proposedSlotId,
      "预约当前不能提出改期。",
      409,
    );
    const next = repo.get(input.slotId, "coffeeSlot"),
      reason = textField(input, "reason", 1000);
    demand(
      next.id !== booking.data.slotId &&
        next.ownerId === booking.data.teacherId &&
        !next.data.closed &&
        Date.parse(String(next.data.startAt)) > Date.now(),
      "请选择同一教师的其他未来开放时段。",
    );
    demand(
      occupied(repo, next.id) < Number(next.data.capacity) &&
        !hasConflict(repo, booking.ownerId!, next, booking.id),
      "新时段已满或学生安排冲突。",
      409,
    );
    repo.notify(
      [booking.ownerId!],
      booking.id,
      action,
      `老师提出改期，请接受或拒绝：${reason}`,
    );
    return repo.save(booking, { proposedSlotId: next.id, reason });
  }
  if (action === "coffee.answer") {
    student(actor);
    const booking = repo.get(input.id, "coffeeBooking");
    owner(actor, booking);
    demand(
      booking.data.status === "confirmed" && booking.data.proposedSlotId,
      "当前没有待处理改期。",
      409,
    );
    const next = repo.get(booking.data.proposedSlotId, "coffeeSlot"),
      accept = input.accept === true;
    if (accept)
      demand(
        !next.data.closed &&
          Date.parse(String(next.data.startAt)) > Date.now() &&
          occupied(repo, next.id) <= Number(next.data.capacity) &&
          !hasConflict(repo, actor.id, next, booking.id),
        "新时段已经失效或冲突，请拒绝后重新协调。",
        409,
      );
    repo.notify(
      [actor.id, String(booking.data.teacherId)],
      booking.id,
      action,
      `学生已${accept ? "接受" : "拒绝"}改期。`,
    );
    return repo.save(booking, {
      slotId: accept ? next.id : booking.data.slotId,
      proposedSlotId: null,
    });
  }
  return undefined;
}
