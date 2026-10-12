import { demand, type Account } from "../auth";
import {
  Repository,
  textField,
  integerField,
  type Fields,
} from "../repository";
import { requireSportsPermission } from "./permissions";
import { sportsAccountGate } from "./account-gate";
/** Current account data only; no membership, credential, grade or media mutation. */
export function accountDirectory(
  repo: Repository,
  actor: Account,
  kind: "student" | "teacher",
  input: Fields,
) {
  sportsAccountGate(repo, actor);
  requireSportsPermission(repo, actor, "ACCOUNTS");
  const accounts=repo.db.prepare('SELECT id,name,organization,status,email FROM accounts').all();
  return projectAccountDirectory(repo,accounts,kind,input);
}

export function projectAccountDirectory(repo:Pick<Repository,'all'>,accounts:Fields[],kind:'student'|'teacher',input:Fields) {
  demand(
    Object.keys(input).every((k) =>
      ["q", "status", "college", "cursor", "limit", "id"].includes(k),
    ),
    "只读账号查询参数无效。",
  );
  const q = textField(input, "q", 200, true).toLocaleLowerCase(),
    college = textField(input, "college", 200, true),
    status = textField(input, "status", 40, true),
    id = textField(input, "id", 100, true);
  demand(
    !status ||
      (kind === "student"
        ? ["ACTIVE", "MUTED", "DISABLED"]
        : ["ACTIVE", "DISABLED", "RECOVERY_REQUIRED"]
      ).includes(status),
    "账号筛选状态无效。",
  );
  const limit =
    input.limit === undefined
      ? 20
      : integerField({ limit: Number(input.limit) }, "limit", 1, 100);
  const fields = repo
    .all("companionIdentity")
    .filter(
      (i) => i.data.role === kind && i.ownerId && i.data.status === "verified",
    )
    .flatMap((i) => {
      const row = accounts.find(a=>a.id===i.ownerId);
      if (!row) return [];
      return [
        {
          id: i.ownerId!,
          identityId: i.id,
          name: String(row.name),
          studentNumber:
            kind === "student" ? String(i.data.studentNumber ?? "") : null,
          employeeId:
            kind === "teacher" ? String(i.data.employeeId ?? "") : null,
          organizationId:
            typeof i.data.organizationId === "string"
              ? i.data.organizationId
              : null,
          college: String(i.data.collegeName ?? i.data.college ?? row.organization ?? ""),
          department: String(i.data.department ?? ""),
          major: kind === "student" ? String(i.data.majorName ?? i.data.major ?? "") : null,
          administrativeClass:
            kind === "student"
              ? String(i.data.administrativeClassName ?? i.data.administrativeClass ?? "")
              : null,
          sex:
            kind === "student" &&
            ["MALE", "FEMALE"].includes(String(i.data.sex))
              ? String(i.data.sex)
              : null,
          year:
            kind === "student" &&
            typeof i.data.year === "number" &&
            Number.isInteger(i.data.year)
              ? i.data.year
              : null,
          title: kind === "teacher" ? String(i.data.title ?? "") : null,
          status:
            kind === "student"
              ? row.status === "banned" ? "DISABLED" : row.status === "muted" ? "MUTED" : "ACTIVE"
              : row.status === "banned" || i.data.accountState === "DISABLED"
                ? "DISABLED"
                : i.data.accountState === "RECOVERY_REQUIRED"
                  ? "RECOVERY_REQUIRED"
                  : "ACTIVE",
          verifiedEmail:
            i.data.schoolEmailVerified === true &&
            i.data.schoolEmail === row.email
              ? String(row.email)
              : null,
          updatedAt: i.updatedAt,
          version: i.version,
        },
      ];
    });
  const rows = fields
    .filter(
      (r) =>
        (!id || r.id === id) &&
        (!status || r.status === status) &&
        (!college || r.college === college) &&
        (!q ||
          [
            r.name,
            r.studentNumber,
            r.employeeId,
            r.college,
            r.department,
            r.major,
            r.administrativeClass,
          ].some((v) =>
            String(v ?? "")
              .toLocaleLowerCase()
              .includes(q),
          )),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  demand(
    new Set(rows.map((r) => r.id)).size === rows.length,
    "身份资料存在重复，请先核对，不能合并展示。",
    409,
  );
  if (id) {
    demand(rows.length === 1, "当前账号不存在或身份资料需核对。", 404);
    return { items: rows, nextCursor: null, total: 1 };
  }
  const cursor = textField(input, "cursor", 100, true);
  const index = cursor ? rows.findIndex((r) => r.id === cursor) : -1;
  demand(!cursor || index >= 0, "分页基准已变化，请刷新列表。", 409);
  const items = rows.slice(index + 1, index + 1 + limit);
  return {
    items,
    nextCursor: index + 1 + limit < rows.length ? items.at(-1)!.id : null,
    total: rows.length,
  };
}
