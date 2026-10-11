import { createHash, randomUUID } from "node:crypto";
import { demand, timestamp } from "../auth";
import { transaction } from "../database";
import { Repository } from "../repository";
import { parseWorkbook, workbookAccess, type WorkbookSheet } from "./workbook";
import { parseCsv } from "./csv";
export async function uploadRosterFile(
  repo: Repository,
  token: string,
  courseId: string,
  format: string,
  bytes: Buffer,
) {
  workbookAccess(repo, token, courseId);
  demand(["CSV", "XLSX"].includes(format), "只接受CSV或XLSX名单。");
  demand(
    bytes.length > 0 && bytes.length <= 100 * 1024 * 1024,
    "名单文件须为1字节至100MB。",
    413,
  );
  let sheets: WorkbookSheet[];
  if (format === "XLSX") sheets = await parseWorkbook(bytes, 2);
  else {
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      demand(false, "CSV必须为UTF-8编码。");
    }
    const cells = parseCsv(text!.replace(/^\uFEFF/, ""));
    demand(
      cells.length >= 2 && cells.length <= 501,
      "名单须为1–500个人员行，错误或重复行也计入。",
    );
    const csv = cells
      .map((row) =>
        row
          .map((cell) => '"' + cell.trim().replaceAll('"', '""') + '"')
          .join(","),
      )
      .join("\n");
    demand(csv.length <= 200000, "名单有效字段过长，请核对学号和姓名。");
    sheets = [
      {
        index: 0,
        name: "CSV名单",
        csv,
        rowNumbers: cells.map((_, i) => i + 1),
        issues: [],
      },
    ];
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return transaction(repo.db, () => {
    const actor = workbookAccess(repo, token, courseId);
    const prior = repo
      .all("sportsRosterSource")
      .find(
        (s) =>
          s.ownerId === actor.id &&
          s.data.courseId === courseId &&
          s.data.sha256 === sha256,
      );
    if (prior) return prior;
    repo.db
      .prepare(
        "INSERT OR IGNORE INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
      )
      .run(sha256, bytes, timestamp());
    const source = repo.create("sportsRosterSource", actor.id, {
      courseId,
      format,
      sha256,
      size: bytes.length,
      sheets,
    });
    repo.create("sportsRosterSourceHistory", actor.id, {
      sourceId: source.id,
      courseId,
      sha256,
      size: bytes.length,
      at: Date.now(),
    });
    repo.db
      .prepare(
        "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)",
      )
      .run(
        randomUUID(),
        actor.id,
        "teacher",
        "sports.roster.upload",
        source.id,
        "学校名单原件已受理",
        JSON.stringify({ sha256, size: bytes.length, format }),
        timestamp(),
      );
    return source;
  });
}
