import ExcelJS from "exceljs";
import { authenticate, demand } from "../auth";
import { Repository } from "../repository";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";
import { courseReport, reportRows, type CourseReport } from "./report";

export async function portalCompositeReportExport(
  repo: Repository,
  token: string,
  courseId: string,
) {
  const report = courseReport(repo, authenticate(repo.db, token), courseId);
  return workbookExport(
    repo,
    token,
    courseId,
    "实时综合名单",
    "composite-roster.xlsx",
    reportRows(report),
  );
}

export async function portalFrozenReportExport(
  repo: Repository,
  token: string,
  courseId: string,
  version: number,
) {
  ownedCourse(repo, authenticate(repo.db, token), courseId);
  sportsWriteGate(repo, "sports.settlement.read");
  demand(Number.isSafeInteger(version) && version > 0, "报告版本无效。");
  const reports = repo
    .all("sportsSettlementReport")
    .filter(
      (row) => row.data.courseId === courseId && row.data.sequence === version,
    );
  demand(reports.length === 1, "该版本结算报告不存在或需要核对。", 404);
  const entry = reports[0];
  // Explicit primitive cells keep source strings as text, never Excel formulas.
  const rows: unknown[][] = [
    ["冻结报告ID", entry.id],
    ["报告版本", version],
    ["内容摘要", entry.data.contentHash],
    ["更正原因", entry.data.correctionReason ?? ""],
    ...reportRows(entry.data.report as CourseReport),
  ];
  return workbookExport(
    repo,
    token,
    courseId,
    "结算报告",
    `settlement-report-v${version}.xlsx`,
    rows,
  );
}

async function workbookExport(
  repo: Repository,
  token: string,
  courseId: string,
  title: string,
  fileName: string,
  rows: unknown[][],
) {
  const book = new ExcelJS.Workbook(),
    sheet = book.addWorksheet(title);
  for (const row of rows)
    sheet.addRow(
      row.map((value) =>
        typeof value === "number" && Number.isFinite(value)
          ? value
          : String(value ?? ""),
      ),
    );
  sheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 24 : 20;
  });
  const bytes = await book.xlsx.writeBuffer();
  // Revalidate after asynchronous serialization before releasing private data.
  ownedCourse(repo, authenticate(repo.db, token), courseId);
  sportsWriteGate(repo, "sports.settlement.read");
  return {
    fileName,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileBase64: Buffer.from(bytes).toString("base64"),
  };
}
