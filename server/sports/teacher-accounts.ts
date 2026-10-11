import { parseCsv } from "./csv";
import { randomUUID } from "node:crypto";
import {
  demand,
  encodePassword,
  normalizeEmail,
  timestamp,
  type Account,
} from "../auth";
import { Repository, textField, type Fields } from "../repository";
import { requireSportsPermission, administratorAccess } from "./permissions";
import { version } from "./courses";

function validateRows(repo: Repository, csv: string) {
  const parsed = parseCsv(csv.replace(/^\uFEFF/, "")),
    headers = parsed.shift()?.map((h) => h.trim()) ?? [];
  demand(
    headers.length >= 3 &&
      new Set(headers).size === headers.length &&
      ["employee_id", "name", "email"].every((h) => headers.includes(h)) &&
      headers.every((h) =>
        ["employee_id", "name", "email", "college"].includes(h),
      ),
    "CSV仅接受employee_id,name,email及可选college，不得包含密码列。",
  );
  demand(
    parsed.length > 0 && parsed.length <= 500,
    "每批须有1–500行教师资料。",
  );
  const domains = (process.env.BNBU_SCHOOL_EMAIL_DOMAINS ?? "bnbu.edu.cn")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  demand(
    domains.length > 0,
    "尚未配置已确认学校邮箱域名，不能建立教师账号。",
    503,
  );
  const emails = new Set<string>(),
    employees = new Set<string>();
  return parsed.map((cells, index) => {
    const raw = Object.fromEntries(
      headers.map((h, i) => [h, (cells[i] ?? "").trim()]),
    );
    const errors: string[] = [];
    if (cells.length !== headers.length) errors.push("列数与表头不一致");
    if (!raw.employee_id || raw.employee_id.length > 100)
      errors.push("工号须为1–100字");
    if (!raw.name || raw.name.length > 40) errors.push("姓名须为1–40字");
    if ((raw.college ?? "").length > 200) errors.push("学院过长");
    let email = raw.email.toLowerCase();
    try {
      email = normalizeEmail(email);
      if (!domains.includes(email.split("@")[1]))
        errors.push("不是已确认学校邮箱域名");
    } catch {
      errors.push("邮箱格式无效");
    }
    if (emails.has(email)) errors.push("本批邮箱重复");
    if (employees.has(raw.employee_id)) errors.push("本批工号重复");
    if (repo.db.prepare("SELECT id FROM accounts WHERE email=?").get(email))
      errors.push("邮箱与现有账号冲突");
    if (
      repo
        .all("sportsIdentity")
        .some((i) => i.data.employeeId === raw.employee_id)
    )
      errors.push("工号与现有教师冲突");
    emails.add(email);
    employees.add(raw.employee_id);
    return {
      row: index + 2,
      employeeId: raw.employee_id,
      name: raw.name,
      email,
      college: raw.college ?? "",
      errors,
    };
  });
}
export function sportsTeacherAccountCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (!["sports.teachers.preview", "sports.teachers.create"].includes(action))
    return undefined;
  requireSportsPermission(repo, actor, "ACCOUNTS");
  if (action === "sports.teachers.preview") {
    const csv = textField(input, "csv", 200000),
      rows = validateRows(repo, csv);
    return repo.create("sportsTeacherImport", actor.id, {
      csv,
      rows,
      status: "PREVIEW",
      canCreate: rows.every((r) => !r.errors.length),
    });
  }
  const batch = repo.get(input.id, "sportsTeacherImport");
  demand(batch.ownerId === actor.id, "只能确认本人预览批次。", 403);
  version(batch, input);
  demand(batch.data.status === "PREVIEW", "本批已建立，不能重复建立。", 409);
  demand(
    input.confirmed === true,
    "须核对每个邮箱对应真实教师并确认受控告知初始密码。",
  );
  const rows = validateRows(repo, String(batch.data.csv));
  demand(
    rows.every((r) => !r.errors.length),
    "存在错误或新账号冲突，整批未建立；请重新预览。",
    409,
  );
  demand(
    typeof input.initialPassword === "string" &&
      input.initialPassword.length >= 8 &&
      /[A-Z]/.test(input.initialPassword) &&
      /[a-z]/.test(input.initialPassword) &&
      /\d/.test(input.initialPassword),
    "教师初始密码至少8位，须含大小写字母和数字。",
  );
  demand(
    input.initialPassword === input.confirmPassword,
    "两次初始密码不一致。",
  );
  const ids: string[] = [];
  for (const row of rows) {
    const id = randomUUID();
    repo.db
      .prepare(
        "INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        id,
        row.email,
        encodePassword(input.initialPassword),
        row.name,
        row.college,
        JSON.stringify(["teacher"]),
        timestamp(),
      );
    repo.create("sportsIdentity", id, {
      role: "teacher",
      status: "verified",
      employeeId: row.employeeId,
      college: row.college,
      mustChangePassword: true,
      source: "ADMIN_CONFIRMED_TEACHER_BATCH",
      importId: batch.id,
    });
    ids.push(id);
  }
  return repo.save(batch, {
    status: "CREATED",
    canCreate: false,
    createdAt: Date.now(),
    accountIds: ids,
  });
}
export function teacherAccountWorkspace(repo: Repository, actor: Account) {
  if (!administratorAccess(repo, actor).permissions.includes("ACCOUNTS"))
    return { teacherImports: [] };
  return {
    teacherImports: repo
      .all("sportsTeacherImport")
      .filter((b) => b.ownerId === actor.id)
      .map((b) => ({
        ...b,
        data: {
          rows: b.data.rows,
          status: b.data.status,
          canCreate: b.data.canCreate,
        },
      })),
  };
}
