import { expect, it } from "vitest";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { createApiServer } from "../server/main";

it("原版课程列表、目录、学期与目标读取本人真实课程，不泄露其他教师数据", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (name: string) => {
      const id = createAccount(db, {
        name,
        email: name + "@example.test",
        password: "Password-123",
        roles: [],
      });
      repo.create("sportsIdentity", id, {
        role: "teacher",
        status: "verified",
      });
      return login(db, name + "@example.test", "Password-123");
    };
    const own = make("course-own"),
      other = make("course-other");
    const current = repo.create("sportsSemester", null, {
      name: "当前学期",
      status: "CURRENT",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    const archived = repo.create("sportsSemester", null, {
      name: "历史学期",
      status: "ARCHIVED",
    });
    repo.create("sportsSemester", null, {
      name: "无关学期",
      status: "UPCOMING",
    });
    const fields = {
      semesterId: current.id,
      name: "真实课程",
      status: "PUBLISHED",
      relatedTarget: 600,
      otherTarget: 600,
      enrollmentOpen: true,
      startDate: "2020-01-01",
      deadlineDate: "2030-01-01",
      startTime: "06:00",
      endTime: "22:00",
      privateNote: "SECRET",
    };
    const course = repo.create("sportsCourse", own.account.id, fields);
    const draft = repo.create("sportsCourse", own.account.id, {
      ...fields,
      status: "DRAFT",
      name: "草稿",
    });
    const old = repo.create("sportsCourse", own.account.id, {
      ...fields,
      semesterId: archived.id,
      status: "CLOSED",
    });
    const foreign = repo.create("sportsCourse", other.account.id, fields);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("missing listener");
    const base = `http://127.0.0.1:${address.port}/api/v1`;
    const get = (path: string) =>
      fetch(base + path, { headers: { Cookie: `bnbu_session=${own.token}` } });
    const first = await (await get("/class-sections?limit=2")).json();
    expect(first.data).toHaveLength(2);
    expect(first.meta.pagination).toMatchObject({ total: 3, hasMore: true });
    const next = await (
      await get(
        "/class-sections?limit=2&cursor=" + first.meta.pagination.nextCursor,
      )
    ).json();
    const rows = [...first.data, ...next.data];
    expect(new Set(rows.map((row) => row.id)).size).toBe(3);
    expect(rows.find((row) => row.id === course.id)).toMatchObject({
      status: "ACTIVE",
      isEnrollmentOpen: true,
    });
    expect(rows.find((row) => row.id === draft.id)).toMatchObject({
      status: "UPCOMING",
      isEnrollmentOpen: false,
    });
    expect(rows.find((row) => row.id === old.id).status).toBe("ARCHIVED");
    expect(JSON.stringify(rows)).not.toContain("SECRET");
    expect((await get("/class-sections/" + foreign.id)).status).toBe(403);
    expect((await get("/class-sections?cursor=" + foreign.id)).status).toBe(
      409,
    );
    expect(
      (await (await get("/courses/" + course.id)).json()).data.courseName,
    ).toBe("真实课程");
    expect((await (await get("/semesters/current")).json()).data.id).toBe(
      current.id,
    );
    expect(
      (await (await get("/teacher/semesters")).json()).data.items,
    ).toHaveLength(2);
    expect(
      (await get("/class-sections/" + draft.id + "/progress-target")).status,
    ).toBe(404);
    expect(
      (await get("/class-sections/" + draft.id + "/v81-rules")).status,
    ).toBe(404);
    expect(
      (await get("/class-sections/" + foreign.id + "/v81-rules")).status,
    ).toBe(403);
    expect(
      (await get("/class-sections/" + course.id + "/v81-rules")).status,
    ).toBe(409);
    expect(
      (
        await (
          await get("/class-sections/" + course.id + "/progress-target")
        ).json()
      ).data,
    ).toMatchObject({
      courseTargetSeconds: 36000,
      generalTargetSeconds: 36000,
      totalTargetSeconds: 72000,
      effectiveFrom: null,
    });
    repo.save(course, {
      templateId: "frozen-template",
      threshold: 45,
      weeklyLimit: 2,
      deadlineDate: "2026-12-01",
      closingDate: "2026-12-08",
      settlementDate: "2026-12-09",
      publishedAt: "2026-10-01T00:00:00.000Z",
      rulesVersion: 1,
    });
    const rules = (
      await (await get("/class-sections/" + course.id + "/v81-rules")).json()
    ).data;
    expect(rules).toEqual({
      version: 1,
      template_id: "frozen-template",
      published_at: "2026-10-01T00:00:00.000Z",
      minimum_minutes: 45,
      maximum_minutes: 60,
      global_target_minutes: 1200,
      global_target_version: 1,
      allocation_pending: false,
      weekly_limit: 2,
      daily_limit: 1,
      course_target: 600,
      general_target: 600,
      regular_deadline: "2026-12-01T15:59:59.000Z",
      closing_deadline: "2026-12-08T15:59:59.000Z",
      settlement_planned_at: "2026-12-08T16:00:00.000Z",
    });
    const createDraft = () =>
      fetch(base + "/teacher/courses", {
        method: "POST",
        headers: {
          Cookie: `bnbu_session=${own.token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "original-create-course",
        },
        body: JSON.stringify({ displayName: "原版新建草稿" }),
      });
    const createdResponse = await createDraft();
    expect(createdResponse.status).toBe(200);
    const created = await createdResponse.json();
    expect(await (await createDraft()).json()).toEqual(created);
    expect(
      (await (await get("/class-sections/" + created.data.id)).json()).data,
    ).toMatchObject({
      displayName: "原版新建草稿",
      isEnrollmentOpen: false,
      checkInWindowMode: "UNAVAILABLE",
    });
    expect(
      repo
        .all("sportsCourse")
        .filter((item) => item.data.name === "原版新建草稿"),
    ).toHaveLength(1);
    const windowInput = {
      expectedVersion: 1,
      checkInWindowMode: "AVAILABLE",
      checkInStartDate: "2026-10-12",
      checkInEndDate: "2026-12-01",
      dailyStartTime: "06:00",
      dailyEndTime: "22:00",
      excludedDates: ["2026-11-01"],
      submissionDeadlineAt: "2026-12-01T15:59:59.000Z",
    };
    const patch = (id: string, body: object, key: string, origin?: string) =>
      fetch(base + "/class-sections/" + id, {
        method: "PATCH",
        headers: {
          Cookie: `bnbu_session=${own.token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
          ...(origin ? { Origin: origin } : {}),
        },
        body: JSON.stringify(body),
      });
    expect(
      (
        await patch(
          created.data.id,
          windowInput,
          "cross-origin",
          "https://example.org",
        )
      ).status,
    ).toBe(403);
    const changed = await patch(created.data.id, windowInput, "draft-window");
    expect(changed.status).toBe(200);
    expect((await changed.json()).data).toMatchObject({
      version: 2,
      checkInWindowMode: "AVAILABLE",
      excludedDates: ["2026-11-01"],
      submissionDeadlineAt: windowInput.submissionDeadlineAt,
      isEnrollmentOpen: false,
    });
    expect(
      (await patch(created.data.id, windowInput, "draft-window")).status,
    ).toBe(200);
    expect(
      (await patch(created.data.id, windowInput, "stale-window")).status,
    ).toBe(409);
    expect(
      (await patch(foreign.id, windowInput, "foreign-window")).status,
    ).toBe(403);
    expect(
      (await patch(course.id, windowInput, "published-window")).status,
    ).toBe(409);
    expect(
      (
        await patch(
          created.data.id,
          { ...windowInput, expectedVersion: 2, excludedDates: ["2026-02-30"] },
          "bad-date",
        )
      ).status,
    ).toBe(400);
    expect(repo.get(created.data.id).version).toBe(2);
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect(
      (await patch(created.data.id, windowInput, "draft-window")).status,
    ).toBe(503);
    expect((await createDraft()).status).toBe(503);
    expect((await get("/class-sections")).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
