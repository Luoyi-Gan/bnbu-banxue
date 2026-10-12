import { expect, it } from "vitest";
import { createAccount, login } from "../server/auth";
import { openDatabase } from "../server/database";
import { Repository } from "../server/repository";
import { execute } from "../server/commands";
import { createApiServer } from "../server/main";

it("原版成绩页区分缺测、零秒和草稿/发布版本，历史分页不改变已发布分数", async () => {
  const db = openDatabase(":memory:"),
    repo = new Repository(db),
    server = createApiServer(db);
  try {
    const make = (role: string) => {
      const id = createAccount(db, {
        name: role,
        email: role + "@example.test",
        password: "Password-123",
        roles: [],
      });
      repo.create("sportsIdentity", id, { role, status: "verified" });
      return login(db, role + "@example.test", "Password-123");
    };
    const teacher = make("teacher"),
      student = make("student");
    const semester = repo.create("sportsSemester", null, {
      status: "CURRENT",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    const course = repo.create("sportsCourse", teacher.account.id, {
      semesterId: semester.id,
      status: "PUBLISHED",
    });
    const member = repo.create("sportsEnrollment", student.account.id, {
      courseId: course.id,
      status: "ACTIVE",
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("listener");
    const get = (path: string, token = teacher.token) =>
      fetch(
        `http://127.0.0.1:${address.port}/api/v1/enrollments/${member.id}/${path}`,
        { headers: { Cookie: `bnbu_session=${token}` } },
      );
    expect((await (await get("physical-results")).json()).data).toEqual({
      items: [],
      nextBeforeVersion: null,
    });
    expect((await (await get("final-grades")).json()).data.items).toEqual([]);
    execute(
      db,
      teacher.token,
      "sports.endurance.confirm",
      {
        enrollmentId: member.id,
        version: 0,
        event: 800,
        seconds: 0,
        testDate: "2026-01-02",
        confirmed: true,
      },
      "record-zero-seconds",
    );
    const physical = (await (await get("physical-results")).json()).data
      .items[0];
    expect(physical).toMatchObject({
      version: 1,
      elapsedSeconds: 0,
      runType: "800m",
      testedOn: "2026-01-02",
    });
    const draft = execute(
      db,
      teacher.token,
      "sports.grade.save",
      { enrollmentId: member.id, version: 0, score: 72 },
      "save-first-grade",
    ) as { id: string };
    execute(
      db,
      teacher.token,
      "sports.grade.publish",
      { id: draft.id, version: 1 },
      "publish-first-grade",
    );
    execute(
      db,
      teacher.token,
      "sports.grade.save",
      { enrollmentId: member.id, version: 2, score: 80 },
      "save-next-grade",
    );
    const first = (await (await get("final-grades?limit=2")).json()).data;
    expect(
      first.items.map(
        (row: { version: number; finalGrade: number; published: boolean }) => [
          row.version,
          row.finalGrade,
          row.published,
        ],
      ),
    ).toEqual([
      [3, 80, false],
      [2, 72, true],
    ]);
    expect(first.nextBeforeVersion).toBe(2);
    expect(
      (await (await get("final-grades?limit=2&beforeVersion=2")).json()).data
        .items[0],
    ).toMatchObject({ version: 1, finalGrade: 72, published: false });
    expect((await get("final-grades", student.token)).status).toBe(403);
    expect((await get("physical-results?beforeVersion=invalid")).status).toBe(
      400,
    );
    const write = (input: object, key: string) =>
      fetch(
        `http://127.0.0.1:${address.port}/api/v1/enrollments/${member.id}/final-grades`,
        {
          method: "POST",
          headers: {
            Cookie: `bnbu_session=${teacher.token}`,
            "Content-Type": "application/json",
            "Idempotency-Key": key,
          },
          body: JSON.stringify(input),
        },
      );
    const saveInput = { finalGrade: 82, published: false, expectedVersion: 3 };
    const saved = await write(saveInput, "portal-save-grade");
    expect(saved.status).toBe(200);
    const savedReceipt = await saved.json();
    expect(savedReceipt.data).toMatchObject({
      version: 4,
      finalGrade: 82,
      published: false,
    });
    const publishInput = {
      finalGrade: 85,
      published: true,
      expectedVersion: 4,
    };
    const publication = await write(publishInput, "portal-publish-grade");
    expect(publication.status).toBe(200);
    const receipt = await publication.json();
    expect(receipt.data).toMatchObject({
      version: 6,
      finalGrade: 85,
      published: true,
    });
    expect(await (await write(saveInput, "portal-save-grade")).json()).toEqual(
      savedReceipt,
    );
    expect(
      await (await write(publishInput, "portal-publish-grade")).json(),
    ).toEqual(receipt);
    expect(repo.all("sportsGradePublication")).toHaveLength(2);
    expect((await write(publishInput, "stale-portal-publish")).status).toBe(
      409,
    );
    repo.save(repo.get(course.id), { settlementStatus: "SETTLED" });
    expect(
      (
        await write(
          { finalGrade: 90, published: true, expectedVersion: 6 },
          "settled-grade-write",
        )
      ).status,
    ).toBe(409);
    expect(repo.all("sportsGradePublication")).toHaveLength(2);
    repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
    expect((await get("final-grades")).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  }
});
