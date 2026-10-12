import type { IncomingMessage } from "node:http";
import { demand, ServiceError } from "./auth";
import { parseTimetableResponse } from "../../src/v2/timetableModel";

export async function recognize(request: IncomingMessage) {
  const endpoint = process.env.BNBU_TIMETABLE_UPSTREAM;
  demand(endpoint, "尚未配置真实课表识别服务。", 503);
  demand(/^https?:\/\//.test(endpoint), "课表服务配置无效。", 503);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    demand(size <= 11 * 1024 * 1024, "课表照片不能超过 10MB。", 413);
    chunks.push(chunk);
  }
  const envelope = new Request("http://127.0.0.1/upload", {
    method: "POST",
    headers: { "Content-Type": request.headers["content-type"] ?? "" },
    body: new Blob([Uint8Array.from(Buffer.concat(chunks))]),
  });
  const incoming = await envelope.formData(),
    file = incoming.get("image");
  demand(
    file instanceof File &&
      file.size > 0 &&
      file.size <= 10 * 1024 * 1024 &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "请上传有效的 JPG、PNG 或 WebP 课表照片。",
  );
  const data = new FormData();
  data.append("image", file);
  const result = await fetch(endpoint, {
    method: "POST",
    body: data,
    headers: process.env.BNBU_TIMETABLE_TOKEN
      ? { Authorization: `Bearer ${process.env.BNBU_TIMETABLE_TOKEN}` }
      : {},
    signal: AbortSignal.timeout(50000),
  }).catch(() => {
    throw new ServiceError(
      502,
      "RECOGNITION_UNAVAILABLE",
      "识别服务暂不可用，原课表保留。",
    );
  });
  demand(result.ok, "识别失败，原课表保留。", 502);
  try {
    return { lessons: parseTimetableResponse(await result.json()) };
  } catch {
    throw new ServiceError(502, "RECOGNITION_INVALID_RESPONSE", "识别服务返回的课表无效，原课表保留。");
  }
}
