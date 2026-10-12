import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { demand, ServiceError } from "../auth";

const run = promisify(execFile);
const require = createRequire(import.meta.url);
export async function inspectMedia(bytes: Buffer, mime: string) {
  if (mime === "image/jpeg" || mime === "image/png") {
    try {
      const image = sharp(bytes, { failOn: "warning" });
      const metadata = await image.metadata();
      demand(
        metadata.format === (mime === "image/jpeg" ? "jpeg" : "png"),
        "图片实际格式与清单不一致。",
      );
      demand((metadata.pages ?? 1) === 1, "凭证须为单张静态照片。");
      await image.stats(); // Decode the whole image, not just its header.
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      throw new ServiceError(
        400,
        "INVALID_MEDIA",
        "图片无法完整解码，请核对原文件。",
      );
    }
  }
  demand(
    mime === "video/mp4" &&
      bytes.length >= 12 &&
      bytes.toString("ascii", 4, 8) === "ftyp",
    "视频实际格式须为MP4。",
  );
  const directory = await mkdtemp(join(tmpdir(), "bnbu-media-"));
  try {
    const filename = join(directory, "evidence.mp4");
    await writeFile(filename, bytes, { flag: "wx" });
    const binary =
      process.env.BNBU_FFPROBE ??
      (require("ffprobe-static") as { path: string }).path;
    const { stdout, stderr } = await run(
      binary,
      [
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-count_frames",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        filename,
      ],
      { timeout: 30000, maxBuffer: 1024 * 1024, windowsHide: true },
    );
    const info = JSON.parse(stdout) as {
      streams?: {
        codec_type: string;
        nb_read_frames?: string;
        duration?: string;
      }[];
      format?: { duration?: string; format_name?: string };
    };
    const duration = Number(info.format?.duration),
      streams = info.streams ?? [];
    demand(
      !stderr.trim() && info.format?.format_name?.includes("mp4"),
      "视频无法完整解析。",
    );
    demand(
      Number.isFinite(duration) && duration >= 1 && duration <= 15,
      "视频须为1–15秒。",
    );
    demand(
      streams.some(
        (s) => s.codec_type === "video" && Number(s.nb_read_frames) > 0,
      ) &&
        streams.some(
          (s) => s.codec_type === "audio" && Number(s.nb_read_frames) > 0,
        ),
      "视频须包含有效画面和音轨。",
    );
    return { durationSeconds: duration, hasAudio: true };
  } catch (e) {
    if (e instanceof ServiceError) throw e;
    const failure = e as NodeJS.ErrnoException & {
      killed?: boolean;
      signal?: string;
    };
    if (
      ["ENOENT", "EACCES", "EIO", "ENOSPC"].includes(String(failure.code)) ||
      failure.killed ||
      failure.signal
    )
      throw new ServiceError(
        503,
        "MEDIA_SERVICE_REQUIRED",
        "视频解析服务不可用，请稍后续传原文件。",
      );
    throw new ServiceError(
      400,
      "INVALID_MEDIA",
      "视频无法完整解析，请核对原文件。",
    );
  } finally {
    // Only this server-created, random temporary directory is removed.
    await rm(directory, { recursive: true, force: true });
  }
}
