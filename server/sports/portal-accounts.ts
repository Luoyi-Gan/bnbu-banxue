import { authenticate, demand, type Account } from "../auth";
import type { Database } from "../database";
import { execute } from "../commands";
import { Repository, type Fields } from "../repository";
import { accountDirectory } from "./account-directory";
import { administratorDirectory } from "./administrators";
import { permissionNames } from "./portal";
import type { SportsPermission } from "./permissions";

export function portalSubadminWrite(
  db: Database,
  token: string,
  id: string | undefined,
  operation: "create" | "profile" | "status",
  input: Fields,
  key: string,
) {
  const repo = new Repository(db),
    actor = authenticate(db, token);
  const directory = administratorDirectory(repo, actor);
  const target = id
    ? directory.items.find((item) => item.id === id)
    : undefined;
  if (id) demand(target, "管理账号不存在。", 404);
  const permissions = () => {
    demand(Array.isArray(input.permissions), "请选择权限。");
    return input.permissions.map((value) => {
      const match = Object.entries(permissionNames).find(
        ([, wire]) => wire === value,
      );
      demand(match, "管理权限无效。");
      return match[0];
    });
  };
  let command: Fields;
  if (operation === "create") {
    demand(
      input.identityVerifiedByAdmin === true,
      "须由管理员确认已核验人员身份。",
    );
    demand(typeof input.email === "string", "请填写已核验人员邮箱。");
    const person = directory.candidates.find(
      (person) => person.email === String(input.email).trim().toLowerCase(),
    );
    demand(
      person,
      "该邮箱没有对应的已核验个人账号，请先完成人员身份核验。",
      409,
    );
    command = {
      personId: person.id,
      loginName: input.account,
      name: input.name,
      email: input.email,
      department: input.department,
      permissions: permissions(),
      initialPassword: input.initialPassword,
      confirmPassword: input.confirmPassword,
      confirmed: true,
    };
  } else if (operation === "profile") {
    command = {
      id: target!.identityId,
      version: input.expectedVersion,
      name: input.name,
      email: input.email,
      department: input.department,
      permissions: permissions(),
      confirmed: true,
    };
  } else {
    command = {
      id: target!.identityId,
      version: input.expectedVersion,
      status: input.status,
      confirmed: true,
      handoverConfirmed: input.handoverCompleted === true,
    };
  }
  const action =
    operation === "create"
      ? "sports.admins.create"
      : operation === "profile"
        ? "sports.admins.edit"
        : "sports.admins.state";
  const result = execute(db, token, action, command, key);
  const identity = repo.get(result.id, "sportsIdentity");
  // The command result identifies the identity; the original UI uses the login account ID.
  const row = administratorDirectory(repo, authenticate(db, token)).items.find(
    (item) => item.id === identity.ownerId,
  )!;
  return {
    id: row.id,
    account: row.loginName,
    name: row.name,
    email: row.email,
    department: row.department,
    status: row.status,
    version: row.version,
    updatedAt: row.updatedAt,
    permissions: (row.permissions as SportsPermission[]).map(
      (p) => permissionNames[p],
    ),
  };
}

export function portalAccountPage(
  repo: Repository,
  actor: Account,
  kind: "student" | "teacher",
  input: Fields,
) {
  const page = accountDirectory(repo, actor, kind, input);
  const items = page.items.map((row) => {
    const identity = repo.get(row.identityId, "sportsIdentity");
    const common = {
      id: row.id,
      userId: row.id,
      organizationId: row.organizationId ?? "BNBU",
      fullName: row.name,
      collegeName: row.college,
      email: row.verifiedEmail,
      status: row.status,
      createdAt: identity.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: null,
      version: row.version,
    };
    return kind === "student"
      ? {
          ...common,
          studentNumber: row.studentNumber,
          gender: row.sex,
          gradeYear: row.year,
          majorName: row.major,
          administrativeClassName: row.administrativeClass,
          emailVerified: row.verifiedEmail !== null,
        }
      : {
          ...common,
          employeeNumber: row.employeeId,
          departmentName: row.department,
          title: row.title,
        };
  });
  return { items, nextCursor: page.nextCursor, total: page.total };
}

export function portalSubadmins(repo: Repository, actor: Account, after = "") {
  const source = administratorDirectory(repo, actor);
  const index = after
    ? source.items.findIndex((item) => item.id === after)
    : -1;
  demand(!after || index >= 0, "分页基准已变化，请刷新。", 409);
  const items = source.items.slice(index + 1, index + 101).map((row) => ({
    id: row.id,
    account: row.loginName,
    name: row.name,
    email: row.email,
    department: row.department,
    status: row.status,
    version: row.version,
    updatedAt: row.updatedAt,
    permissions: (row.permissions as SportsPermission[])
      .filter((p) => p in permissionNames)
      .map((p) => permissionNames[p]),
  }));
  return {
    items,
    nextCursor: index + 101 < source.items.length ? items.at(-1)!.id : null,
  };
}
