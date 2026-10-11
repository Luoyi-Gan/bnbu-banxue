import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { authenticate, demand, timestamp, type Account } from "../auth";
import { transaction } from "../database";
import { Repository, type Entity } from "../repository";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";
import { workbookAccess, type WorkbookSheet } from "./workbook";
export interface OcrImage {
  id: string;
  sha256: string;
  mime: string;
  size: number;
}
export function ocrSourceAccess(repo: Repository, actor: Account, id: string) {
  sportsWriteGate(repo, "sports.endurance.import");
  const source = repo.get(id);
  demand(
    ["sportsEnduranceSource", "sportsRosterSource"].includes(source.kind),
    "原图来源无效。",
    404,
  );
  ownedCourse(repo, actor, source.data.courseId);
  demand(
    source.ownerId === actor.id && source.data.sourceType === "OCR",
    "只能读取本人受理的纸质原件。",
    403,
  );
  return source;
}
export async function uploadOcrSource(
  repo: Repository,
  token: string,
  courseId: string,
  files: File[],
  purpose: "ENDURANCE" | "ROSTER" = "ENDURANCE",
) {
  const kind =
    purpose === "ROSTER" ? "sportsRosterSource" : "sportsEnduranceSource";
  workbookAccess(repo, token, courseId);
  demand(
    files.length > 0 &&
      files.length <= 20 &&
      files.reduce((n, f) => n + f.size, 0) <= 100 * 1024 * 1024,
    "每批须为1–20张图片且合计不超过100MB。",
  );
  const materials: {
    bytes: Buffer;
    sha256: string;
    mime: string;
    size: number;
  }[] = [];
  for (const file of files) {
    demand(
      file.size > 0 &&
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "原图仅接受有效JPEG、PNG或WebP。",
    );
    const bytes = Buffer.from(await file.arrayBuffer());
    const parser = sharp(bytes, {
      limitInputPixels: 40000000,
      failOn: "error",
    });
    const metadata = await parser.metadata().catch(() => null);
    demand(
      metadata &&
        (
          {
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
          } as Record<string, string>
        )[metadata.format ?? ""] === file.type &&
        !(metadata.pages && metadata.pages > 1),
      "图片内容与格式不符或不是单帧原图。",
    );
    await parser.stats().catch(() => {
      demand(false, "原图不能完整解码。");
    });
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    materials.push({ bytes, sha256, mime: file.type, size: bytes.length });
  }
  demand(
    new Set(materials.map((m) => m.sha256)).size === materials.length,
    "本批原图重复，请核对后上传。",
  );
  return transaction(repo.db, () => {
    const actor = workbookAccess(repo, token, courseId);
    const hash = createHash("sha256")
      .update(materials.map((m) => m.sha256).join(":"))
      .digest("hex");
    const prior = repo
      .all(kind)
      .find(
        (s) =>
          s.ownerId === actor.id &&
          s.data.courseId === courseId &&
          s.data.sourceType === "OCR" &&
          s.data.sha256 === hash,
      );
    if (prior) return prior;
    const images: OcrImage[] = materials.map((m) => {
      repo.db
        .prepare(
          "INSERT OR IGNORE INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
        )
        .run(m.sha256, m.bytes, timestamp());
      return { id: randomUUID(), sha256: m.sha256, mime: m.mime, size: m.size };
    });
    const source = repo.create(kind, actor.id, {
      sourceType: "OCR",
      purpose,
      courseId,
      sha256: hash,
      images,
      size: materials.reduce((n, m) => n + m.size, 0),
      status: "AWAITING_OCR",
      sheets: [],
      acceptedEnrollmentIds: repo
        .all("sportsEnrollment")
        .filter(
          (m) => m.data.courseId === courseId && m.data.status === "ACTIVE",
        )
        .map((m) => m.id),
    });
    repo.create("sportsOcrHistory", actor.id, {
      sourceId: source.id,
      status: "UPLOADED",
      at: Date.now(),
    });
    return source;
  });
}
function requestAccess(repo: Repository, token: string, id: string) {
  const source = ocrSourceAccess(repo, authenticate(repo.db, token), id);
  const course = repo.get(source.data.courseId, "sportsCourse");
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "已结算或归档不能重新识别。",
    409,
  );
  return source;
}
function parseResult(
  value: unknown,
  source: Entity,
  requestId: string,
): WorkbookSheet {
  demand(
    value && typeof value === "object" && !Array.isArray(value),
    "OCR响应无效。",
  );
  const data = value as Record<string, unknown>,
    images = source.data.images as OcrImage[];
  const roster = source.kind === "sportsRosterSource";
  demand(
    roster
      ? data.purpose === "ROSTER"
      : data.purpose === undefined || data.purpose === "ENDURANCE",
    "OCR响应业务类型不匹配。",
  );
  demand(
    data.requestId === requestId &&
      data.sourceId === source.id &&
      JSON.stringify(data.imageHashes) ===
        JSON.stringify(images.map((i) => i.sha256)),
    "OCR响应对象或原图不匹配。",
  );
  demand(
    Array.isArray(data.rows) && data.rows.length > 0 && data.rows.length <= 500,
    "OCR须返回1–500行。",
  );
  const matrix: string[][] = [
      roster
        ? ["student_number", "name"]
        : ["student_number", "name", "event", "time", "test_date"],
    ],
    issues: number[] = [],
    rowNumbers = [1],
    imageIds = [""],
    sourceIssues: string[][] = [[]];
  const seen = new Set<string>();
  for (const [index, item] of data.rows.entries()) {
    demand(
      item && typeof item === "object" && !Array.isArray(item),
      "OCR行格式无效。",
    );
    const r = item as Record<string, unknown>;
    demand(
      typeof r.imageId === "string" &&
        images.some((i) => i.id === r.imageId) &&
        Number.isInteger(r.row) &&
        Number(r.row) > 0 &&
        Number(r.row) <= 10000,
      "OCR行来源无效。",
    );
    const key = `${r.imageId}:${r.row}`;
    demand(!seen.has(key), "OCR源行重复。");
    seen.add(key);
    demand(
      typeof r.reviewRequired === "boolean" &&
        Array.isArray(r.issues) &&
        r.issues.length <= 10 &&
        r.issues.every((e) => typeof e === "string" && e.length <= 200),
      "OCR疑点标记无效。",
    );
    const fields = (
      roster
        ? ["studentNumber", "name"]
        : ["studentNumber", "name", "event", "time", "testDate"]
    ).map((k) => {
      demand(
        typeof r[k] === "string" && (r[k] as string).length <= 200,
        "OCR字段须为原始短文本。",
      );
      return r[k] as string;
    });
    const reasons = [...(r.issues as string[])];
    if (fields.every((v) => !v.trim())) {
      fields[0] = "[待核对：空白识别行]";
      reasons.push("原行没有可用识别字段，须核对或明确排除");
    }
    matrix.push(fields);
    rowNumbers.push(Number(r.row));
    imageIds.push(r.imageId);
    sourceIssues.push(reasons);
    if (r.reviewRequired || reasons.length) issues.push(index + 2);
  }
  const csv = matrix
    .map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(","))
    .join("\n");
  demand(csv.length <= 200000, "OCR提取内容超限。");
  return {
    index: 0,
    name: roster ? "纸质学校名单识别草稿" : "纸质成绩单识别草稿",
    csv,
    rowNumbers,
    issues,
    imageIds,
    sourceIssues,
  };
}
export async function recognizeOcrSource(
  repo: Repository,
  token: string,
  id: string,
  version: number,
) {
  const source = transaction(repo.db, () => {
    const old = requestAccess(repo, token, id);
    demand(old.version === version, "原图识别状态已变化，请刷新。", 409);
    demand(
      old.data.status !== "READY",
      "已有成功识别结果，请打开原核对草稿。",
      409,
    );
    demand(
      ![
        ...repo.all("sportsEnduranceImport"),
        ...repo.all("sportsRosterDraft"),
      ].some((b) => b.data.sourceId === id),
      "此原件已有核对草稿，请在原草稿处理，不能覆盖识别来源。",
      409,
    );
    demand(
      old.data.status !== "PROCESSING" ||
        Date.now() - Number(old.data.startedAt) > 35000,
      "此批仍在识别中。",
      409,
    );
    return repo.save(old, {
      status: "PROCESSING",
      requestId: randomUUID(),
      startedAt: Date.now(),
      error: null,
    });
  });
  let sheet: WorkbookSheet | undefined, error: string | undefined;
  const endpoint = process.env.BNBU_SPORTS_OCR_URL;
  if (!endpoint) error = "OCR_NOT_CONFIGURED";
  else
    try {
      const url = new URL(endpoint);
      demand(
        !url.username &&
          !url.password &&
          (url.protocol === "https:" ||
            (url.protocol === "http:" &&
              ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))),
        "OCR地址配置无效。",
      );
      const images = (source.data.images as OcrImage[]).map((i) => {
        const blob = repo.db
          .prepare("SELECT bytes FROM sports_media_blobs WHERE sha256=?")
          .get(i.sha256);
        demand(blob, "原图缺失。");
        return {
          ...i,
          contentBase64: Buffer.from(blob.bytes as Uint8Array).toString(
            "base64",
          ),
        };
      });
      const response = await fetch(url, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(25000),
        headers: {
          "Content-Type": "application/json",
          ...(process.env.BNBU_SPORTS_OCR_TOKEN
            ? { Authorization: `Bearer ${process.env.BNBU_SPORTS_OCR_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          schemaVersion: 1,
          purpose:
            source.kind === "sportsRosterSource" ? "ROSTER" : "ENDURANCE",
          requestId: source.data.requestId,
          sourceId: id,
          images,
        }),
      });
      demand(
        response.ok &&
          response.headers.get("content-type")?.includes("application/json"),
        "OCR服务响应无效。",
      );
      const reader = response.body?.getReader();
      demand(reader, "OCR响应为空。");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.length;
        if (size > 1024 * 1024) {
          await reader.cancel();
          throw Error("response too large");
        }
        chunks.push(next.value);
      }
      sheet = parseResult(
        JSON.parse(Buffer.concat(chunks).toString("utf8")),
        source,
        String(source.data.requestId),
      );
    } catch {
      error = "OCR_TECHNICAL_FAILURE";
    }
  return transaction(repo.db, () => {
    const current = requestAccess(repo, token, id);
    demand(
      current.version === source.version &&
        current.data.requestId === source.data.requestId,
      "识别请求已被更新，旧响应不写入。",
      409,
    );
    const saved = repo.save(current, {
      status: sheet ? "READY" : "FAILED",
      sheets: sheet ? [sheet] : [],
      error: error ?? null,
    });
    repo.create("sportsOcrHistory", source.ownerId, {
      sourceId: id,
      requestId: source.data.requestId,
      status: saved.data.status,
      error: error ?? null,
      at: Date.now(),
    });
    return saved;
  });
}
