import { demand, ServiceError, type Account } from "../auth";
import {
  Repository,
  textField,
  integerField,
  type Entity,
  type Fields,
} from "../repository";
import { ownedCourse, version } from "./courses";
import { businessWeek } from "./credit";
import { parseCsv } from "./csv";
import { sportsEnduranceCommand } from "./endurance";

interface ImportRow {
  row: number;
  studentNumber: string;
  name: string;
  event: string;
  time: string;
  testDate: string;
  columnError?: boolean;
  state: "PENDING" | "CONFIRMED" | "EXCLUDED";
  reason?: string;
  expectedEnrollmentId: string | null;
  expectedVersion: number;
  resultId?: string;
}
function review(repo: Repository, batch: Entity, rows: ImportRow[]) {
  const members = repo
    .all("sportsEnrollment")
    .filter((m) => m.data.courseId === batch.data.courseId);
  const identities = repo
    .all("sportsIdentity")
    .filter((i) => i.data.role === "student" && i.data.status === "verified");
  return rows.map((row) => {
    const errors: string[] = [];
    if (row.columnError) errors.push("原行列数不符，请逐字段核对修正");
    const ids = identities.filter(
      (i) => i.data.studentNumber === row.studentNumber && row.studentNumber,
    );
    const matches =
      ids.length === 1
        ? members.filter((m) => m.ownerId === ids[0].ownerId)
        : [];
    const member = matches.length === 1 ? matches[0] : undefined;
    if (!member) errors.push("学号无法唯一匹配本班学生，不能按姓名猜测");
    const person = member?.ownerId
      ? repo.db
          .prepare("SELECT name FROM accounts WHERE id=?")
          .get(member.ownerId)
      : undefined;
    if (!row.name || person?.name !== row.name)
      errors.push("姓名与该学号当前身份不一致");
    if (
      rows.some(
        (other) =>
          other.row !== row.row &&
          other.state !== "EXCLUDED" &&
          other.studentNumber === row.studentNumber,
      )
    )
      errors.push("本批学号重复，须核对并明确排除错误行");
    const event = Number(row.event);
    if (!["800", "1000"].includes(row.event)) errors.push("项目须为800或1000");
    let seconds = NaN;
    if (/^\d+$/.test(row.time)) seconds = Number(row.time);
    else if (/^\d+:[0-5]\d$/.test(row.time)) {
      const [m, s] = row.time.split(":").map(Number);
      seconds = m * 60 + s;
    }
    if (!Number.isSafeInteger(seconds) || seconds < 0 || seconds > 2147483647)
      errors.push("用时须为整数秒或明确的分:秒，不解释4.30等记法");
    try {
      businessWeek(row.testDate);
      if (Date.parse(`${row.testDate}T00:00:00+08:00`) > Date.now())
        errors.push("测试日期不能在未来");
    } catch (e) {
      if (!(e instanceof ServiceError)) throw e;
      errors.push("测试日期无效");
    }
    const sex = ids.length === 1 ? ids[0].data.sex : undefined;
    if (
      (sex === "MALE" && event !== 1000) ||
      (sex === "FEMALE" && event !== 800)
    )
      errors.push("项目与已登记性别不符");
    const current = member
      ? repo
          .all("sportsEndurance")
          .find((r) => r.data.enrollmentId === member.id)
      : undefined;
    if (
      member &&
      !(batch.data.acceptedEnrollmentIds as string[]).includes(member.id)
    )
      errors.push("不是本批受理时的有效成员");
    if (
      row.expectedEnrollmentId !== (member?.id ?? null) ||
      row.expectedVersion !== (current?.version ?? 0)
    )
      errors.push("身份匹配或正式记录已变化，请重新核对该行");
    if (
      current &&
      current.data.event === event &&
      current.data.seconds === seconds &&
      current.data.testDate === row.testDate
    )
      errors.push("相同原始事实已存在，请明确排除此重复行");
    return {
      ...row,
      errors,
      enrollmentId: member?.id ?? null,
      currentVersion: current?.version ?? 0,
      seconds,
      eventNumber: event,
    };
  });
}
export function sportsEnduranceImportCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (
    ![
      "sports.endurance.import",
      "sports.endurance.row",
      "sports.endurance.batch.confirm",
    ].includes(action)
  )
    return undefined;
  if (action === "sports.endurance.import") {
    const course = ownedCourse(repo, actor, input.courseId);
    demand(
      course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" &&
        repo.get(course.data.semesterId, "sportsSemester").data.status !==
          "ARCHIVED",
      "当前课程不接受新体测导入。",
      409,
    );
    const csv = textField(input, "csv", 200000);
    const cells = parseCsv(csv.replace(/^\uFEFF/, ""));
    const headers = cells.shift()?.map((v) => v.trim()) ?? [];
    const required = ["student_number", "name", "event", "time", "test_date"];
    demand(
      headers.length === 5 && required.every((h) => headers.includes(h)),
      "CSV须且仅含student_number,name,event,time,test_date五列。",
    );
    demand(
      cells.length > 0 && cells.length <= 500,
      "每批须为1–500行，错误或重复行也计入。",
    );
    const rows: ImportRow[] = cells.map((values, index) => {
      const read = (key: string) => (values[headers.indexOf(key)] ?? "").trim();
      return {
        row: index + 2,
        studentNumber: read("student_number"),
        name: read("name"),
        event: read("event"),
        time: read("time"),
        testDate: read("test_date"),
        columnError: values.length !== 5,
        state: "PENDING",
        expectedEnrollmentId: null,
        expectedVersion: 0,
      };
    });
    const batch = repo.create("sportsEnduranceImport", actor.id, {
      courseId: course.id,
      source: "CSV",
      csv,
      rows,
      status: "PENDING",
      acceptedEnrollmentIds: repo
        .all("sportsEnrollment")
        .filter(
          (m) => m.data.courseId === course.id && m.data.status === "ACTIVE",
        )
        .map((m) => m.id),
    });
    const checked = review(repo, batch, rows);
    return repo.save(batch, {
      rows: rows.map((r, i) => ({
        ...r,
        expectedEnrollmentId: checked[i].enrollmentId,
        expectedVersion: checked[i].currentVersion,
      })),
    });
  }
  const batch = repo.get(input.id, "sportsEnduranceImport");
  const course = ownedCourse(repo, actor, batch.data.courseId);
  demand(batch.ownerId === actor.id, "只能处理本人受理的导入。", 403);
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "已结算或归档须通过历史报告更正流程。",
    409,
  );
  version(batch, input);
  const rows = batch.data.rows as ImportRow[];
  let next = rows;
  if (action === "sports.endurance.row") {
    const number = integerField(input, "row", 2, 501),
      old = rows.find((r) => r.row === number);
    demand(old && old.state !== "CONFIRMED", "此行不存在或已经确认。", 409);
    const reason = textField(input, "reason", 1000);
    let edited: ImportRow;
    if (input.exclude === true) edited = { ...old, state: "EXCLUDED", reason };
    else {
      edited = {
        ...old,
        studentNumber: textField(input, "studentNumber", 100),
        name: textField(input, "name", 40),
        event: textField(input, "event", 20),
        time: textField(input, "time", 30),
        testDate: textField(input, "testDate", 10),
        columnError: false,
        state: "PENDING",
        reason,
        expectedEnrollmentId: null,
        expectedVersion: 0,
      };
      const checked = review(
        repo,
        batch,
        rows.map((r) => (r.row === number ? edited : r)),
      ).find((r) => r.row === number)!;
      edited = {
        ...edited,
        expectedEnrollmentId: checked.enrollmentId,
        expectedVersion: checked.currentVersion,
      };
    }
    next = rows.map((r) => (r.row === number ? edited : r));
    repo.create("sportsEnduranceImportHistory", actor.id, {
      batchId: batch.id,
      row: number,
      before: old,
      after: edited,
      at: Date.now(),
    });
  } else {
    demand(input.confirmed === true, "请逐行对照原成绩单核对后确认。");
    demand(
      Array.isArray(input.rows) &&
        input.rows.length > 0 &&
        new Set(input.rows).size === input.rows.length,
      "请选择不重复的待处理行。",
    );
    const selected = review(repo, batch, rows).filter((r) =>
      (input.rows as unknown[]).includes(r.row),
    );
    demand(
      selected.length === input.rows.length &&
        selected.every((r) => r.state === "PENDING" && !r.errors.length),
      "所选范围含未解决疑点、非待处理行或不存在行，整批未保存。",
      409,
    );
    for (const row of selected) {
      const result = sportsEnduranceCommand(
        repo,
        actor,
        "sports.endurance.confirm",
        {
          enrollmentId: row.enrollmentId,
          version: row.currentVersion,
          event: row.eventNumber,
          seconds: row.seconds,
          testDate: row.testDate,
          confirmed: true,
        },
        batch.data.acceptedEnrollmentIds as string[],
      )!;
      next = next.map((r) =>
        r.row === row.row
          ? { ...r, state: "CONFIRMED", resultId: result.id }
          : r,
      );
    }
  }
  return repo.save(batch, {
    rows: next,
    status: next.some((r) => r.state === "PENDING") ? "PENDING" : "COMPLETE",
  });
}
export function enduranceImportWorkspace(repo: Repository, actor: Account) {
  const teacher = repo
    .all("sportsIdentity")
    .some(
      (i) =>
        i.ownerId === actor.id &&
        i.data.role === "teacher" &&
        i.data.status === "verified",
    );
  return {
    enduranceImports: teacher
      ? repo
          .all("sportsEnduranceImport")
          .filter(
            (b) =>
              b.ownerId === actor.id &&
              repo.get(b.data.courseId, "sportsCourse").ownerId === actor.id,
          )
          .map((b) => ({
            ...b,
            data: {
              ...b.data,
              rows: review(repo, b, b.data.rows as ImportRow[]),
            },
          }))
      : [],
  };
}
