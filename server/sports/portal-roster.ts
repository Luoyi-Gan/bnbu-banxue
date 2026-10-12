import { demand, ServiceError, type Account } from "../auth";
import { execute } from "../commands";
import {
  Repository,
  integerField,
  type Entity,
  type Fields,
} from "../repository";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";
import { uploadRosterFile } from "./roster-files";
import { workbookAccess, type WorkbookSheet } from "./workbook";

export async function portalRosterUpload(
  repo: Repository,
  token: string,
  courseId: string,
  form: FormData,
  key: string,
) {
  workbookAccess(repo, token, courseId);
  const allowed = [
    "source",
    "fileFormat",
    "sheetName",
    "fieldMappingSnapshot",
    "file",
  ];
  const keys: string[] = [];
  form.forEach((_, key) => keys.push(key));
  demand(
    keys.every((k) => allowed.includes(k)) &&
      allowed.every((k) => form.getAll(k).length <= 1),
    "名单上传字段重复或无效。",
  );
  demand(form.get("source") === "FILE", "这里只接受学校名单文件。");
  const format = form.get("fileFormat"),
    file = form.get("file");
  demand(
    format === "CSV" || format === "XLSX",
    "请使用CSV或XLSX文件，旧XLS请先另存为XLSX。",
  );
  demand(file instanceof File, "缺少名单文件。");
  let mapping: unknown;
  try {
    mapping = JSON.parse(String(form.get("fieldMappingSnapshot")));
  } catch {
    demand(false, "名单列选择格式无效。");
  }
  const source = await uploadRosterFile(
    repo,
    token,
    courseId,
    String(format),
    Buffer.from(await file.arrayBuffer()),
    true,
  );
  const sheets = source.data.sheets as WorkbookSheet[];
  const sheet =
    format === "CSV"
      ? sheets[0]
      : sheets.find((row) => row.name === form.get("sheetName"));
  demand(sheet && !sheet.error, "所选名单工作表不存在或无法解析。");
  const result = execute(
    repo.db,
    token,
    "sports.roster.portal.import",
    { id: source.id, sheet: sheet.index, fieldMapping: mapping },
    key,
  ) as { id: string };
  return rosterImportView(
    repo,
    repo.get(result.id, "sportsPortalRosterImport"),
  );
}

function rosterImportView(repo: Repository, imported: Entity) {
  const courseId = String(imported.data.courseId),
    draft = repo.get(imported.data.draftId, "sportsRosterDraft");
  const rows = draft.data.rows as {
    studentNumber: string;
    name: string;
    columnError: boolean;
    excluded: boolean;
  }[];
  const duplicate = rows.filter(
    (row) =>
      rows.filter((other) => other.studentNumber === row.studentNumber).length >
      1,
  ).length;
  const invalid = rows.filter(
    (row) => row.columnError || !row.studentNumber || !row.name,
  ).length;
  const latest = repo
    .all("sportsPortalRosterImport")
    .filter((row) => row.data.courseId === courseId)
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence))[0];
  return {
    id: imported.id,
    classSectionId: courseId,
    organizationId: null,
    source: "FILE",
    status: "VALIDATED",
    version: imported.version,
    versionNumber: imported.data.sequence,
    createdAt: imported.createdAt,
    importedAt: imported.createdAt,
    importedBy: imported.ownerId,
    totalRowCount: rows.length,
    validRowCount: rows.length - invalid,
    invalidRowCount: invalid,
    duplicatedRowCount: duplicate,
    isCurrent: latest.id === imported.id,
    supersededAt: latest.id === imported.id ? null : latest.createdAt,
    failureCode: null,
  };
}

export function portalRosterRead(
  repo: Repository,
  actor: Account,
  courseId: string,
  current: boolean,
  input: Fields,
) {
  ownedCourse(repo, actor, courseId);
  sportsWriteGate(repo, "sports.roster.read");
  const rows = repo
    .all("sportsPortalRosterImport")
    .filter((row) => row.data.courseId === courseId)
    .sort((a, b) => Number(b.data.sequence) - Number(a.data.sequence));
  if (current) {
    if (!rows.length)
      throw new ServiceError(
        404,
        "ROSTER_IMPORT_NOT_FOUND",
        "本课程还没有导入名单。",
      );
    return { data: rosterImportView(repo, rows[0]) };
  }
  demand(
    Object.keys(input).every((k) => ["limit", "cursor", "sort"].includes(k)) &&
      (input.sort === undefined || input.sort === "-versionNumber"),
    "名单版本查询参数无效。",
  );
  return rosterPage(
    rows.map((row) => rosterImportView(repo, row)),
    input,
  );
}

function rosterPage<T extends { id: string }>(rows: T[], input: Fields) {
  const limit =
    input.limit === undefined
      ? 100
      : integerField({ value: Number(input.limit) }, "value", 1, 100);
  const start =
    input.cursor === undefined
      ? 0
      : rows.findIndex((row) => row.id === input.cursor) + 1;
  demand(input.cursor === undefined || start > 0, "名单分页位置无效。");
  const data = rows.slice(start, start + limit),
    hasMore = start + limit < rows.length;
  return {
    data,
    meta: {
      pagination: {
        total: rows.length,
        limit,
        hasMore,
        nextCursor: hasMore ? data.at(-1)!.id : null,
      },
    },
  };
}

export function portalRosterSource(
  repo: Repository,
  actor: Account,
  id: string,
) {
  const imported = repo.get(id, "sportsPortalRosterImport");
  ownedCourse(repo, actor, imported.data.courseId);
  sportsWriteGate(repo, "sports.roster.read");
  const source = repo.get(imported.data.sourceId, "sportsRosterSource");
  const sheet = (source.data.sheets as WorkbookSheet[]).find(
    (row) => row.index === imported.data.sheet,
  );
  demand(sheet, "名单原工作表缺失。", 409);
  return {
    sourceSha256: source.data.sha256,
    sheetName: source.data.format === "CSV" ? null : sheet.name,
  };
}

export function portalRosterEntries(
  repo: Repository,
  actor: Account,
  id: string,
  input: Fields,
) {
  const imported = repo.get(id, "sportsPortalRosterImport");
  ownedCourse(repo, actor, imported.data.courseId);
  sportsWriteGate(repo, "sports.roster.read");
  demand(
    Object.keys(input).every((k) => ["limit", "cursor", "sort"].includes(k)) &&
      (input.sort === undefined || input.sort === "sourceRowNumber"),
    "名单行查询参数无效。",
  );
  const draft = repo.get(imported.data.draftId, "sportsRosterDraft");
  const rows = draft.data.rows as {
    row: number;
    sourceRow?: number;
    studentNumber: string;
    name: string;
    columnError: boolean;
    excluded: boolean;
  }[];
  return rosterPage(
    rows
      .map((row) => ({
        id: `${imported.id}:${row.row}`,
        rosterImportId: imported.id,
        classSectionId: imported.data.courseId,
        organizationId: null,
        studentNumber: row.studentNumber || null,
        fullName: row.name || null,
        gender: null,
        gradeYear: null,
        collegeName: null,
        majorName: null,
        administrativeClassName: null,
        sourceRowNumber: row.sourceRow ?? row.row,
        rowValidationStatus:
          row.columnError || !row.studentNumber || !row.name
            ? "INVALID"
            : rows.filter((other) => other.studentNumber === row.studentNumber)
                  .length > 1
              ? "DUPLICATED"
              : "VALID",
        rowErrorCodes: [
          ...(row.columnError ? ["COLUMN_ERROR"] : []),
          ...(!row.studentNumber ? ["MISSING_STUDENT_NUMBER"] : []),
          ...(!row.name ? ["MISSING_FULL_NAME"] : []),
        ],
      }))
      .sort((a, b) => a.sourceRowNumber - b.sourceRowNumber),
    input,
  );
}
