import { expect, it } from "vitest";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { createApiServer } from "../server/main";

it("原版名单只含本人课程，移出成员保留关系但不再开放当前个人资料", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (name: string, role: string) => {
      const email = name + "@example.test",
        password = "Password-123";
      const id = createAccount(db, { email, password, name, roles: [] });
      repo.create("sportsIdentity", id, {
        role,
        status: "verified",
        studentNumber: "20260001",
        sex: "FEMALE",
        year: 2026,
        secret: "PRIVATE",
      });
      return login(db, email, password);
    };
    const teacher = make("owner", "teacher"),
      other = make("other", "teacher"),
      student = make("student", "student");
    const course = repo.create("sportsCourse", teacher.account.id, {
      semesterId: "semester",
      relatedTarget: 600,
      otherTarget: 600,
      threshold: 30,
      weeklyLimit: 3,
    });
    const foreign = repo.create("sportsCourse", other.account.id, {
      semesterId: "semester",
    });
    const member = repo.create("sportsEnrollment", student.account.id, {
      courseId: course.id,
      status: "ACTIVE",
      source: "INVITE",
    });
    const hidden = repo.create("sportsEnrollment", student.account.id, {
      courseId: foreign.id,
      status: "ACTIVE",
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("listener");
    const get = (path: string, token = teacher.token) =>
      fetch(`http://127.0.0.1:${address.port}/api/v1${path}`, {
        headers: { Cookie: `bnbu_session=${token}` },
      });
    const list = await (await get("/enrollments?limit=1")).json();
    expect(list.data.map((item: { id: string }) => item.id)).toEqual([
      member.id,
    ]);
    expect(list.meta.pagination).toMatchObject({ total: 1, hasMore: false });
    expect(
      (await get("/enrollments?classSectionId=" + foreign.id)).status,
    ).toBe(403);
    expect((await get("/enrollments?cursor=" + hidden.id)).status).toBe(409);
    expect((await get("/enrollments", student.token)).status).toBe(403);
    expect((await get("/students", teacher.token)).status).toBe(403);
    const profile = await (await get("/students/" + student.account.id)).json();
    expect(profile.data).toEqual({
      id: student.account.id,
      fullName: "student",
      studentNumber: "20260001",
      gender: "FEMALE",
      gradeYear: 2026,
      primaryEmail: null,
    });
    repo.create("sportsCertification", student.account.id, {
      courseId: course.id,
      status: "VALID",
      category: "RELATED",
      minutes: 600,
    });
    for (let day = 12; day <= 17; day++) {
      const clock = {
        businessDate: `2026-10-${day}`,
        startedAt: Date.parse(`2026-10-${day}T10:00:00+08:00`),
        activeMilliseconds: 60 * 60000,
      };
      const session = repo.create("sportsSession", student.account.id, {
        clock,
      });
      repo.create("sportsRecord", student.account.id, {
        courseId: course.id,
        sessionId: session.id,
        category: "OTHER",
        status: day <= 15 ? "VALID" : day === 16 ? "PENDING_AI" : "INVALID",
        activeMilliseconds: clock.activeMilliseconds,
      });
    }
    const progress = (await (await get("/teacher-progress")).json()).data;
    expect(progress).toEqual([
      {
        enrollmentId: member.id,
        courseRelated: { effectiveSeconds: 36000 },
        general: { effectiveSeconds: 10800 },
        totalEffectiveSeconds: 46800,
        status: "IN_PROGRESS",
      },
    ]);
    expect(repo.all("sportsProgress")).toHaveLength(0);
    const certification = repo.create(
      "sportsCertification",
      student.account.id,
      { courseId: course.id, status: "VALID", category: "OTHER", minutes: 420 },
    );
    expect(
      (await (await get("/teacher-progress")).json()).data[0],
    ).toMatchObject({ totalEffectiveSeconds: 72000, status: "COMPLETED" });
    repo.save(certification, { status: "REVOKED" });
    expect(
      (await (await get("/teacher-progress")).json()).data[0],
    ).toMatchObject({ totalEffectiveSeconds: 46800, status: "IN_PROGRESS" });
    expect((await get("/teacher-progress", student.token)).status).toBe(403);
    expect(
      (await get("/teacher-progress?classSectionId=" + foreign.id)).status,
    ).toBe(403);
    repo.save(member, {
      status: "REMOVED",
      changedAt: Date.now(),
      reason: "已移出",
    });
    expect((await get("/students/" + student.account.id)).status).toBe(403);
    expect((await (await get("/enrollments")).json()).data[0]).toMatchObject({
      status: "REMOVED",
      endReason: "已移出",
    });
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await get("/enrollments")).status).toBe(503);
    expect((await get("/teacher-progress")).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
