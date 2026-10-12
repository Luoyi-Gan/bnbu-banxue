import { demand } from "../auth";
import { execute } from "../commands";
import { Repository } from "../repository";
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
  const imported = repo.get(result.id, "sportsPortalRosterImport"),
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
