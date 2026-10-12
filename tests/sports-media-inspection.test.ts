import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { inspectMedia } from "../backend/src/sports/media-inspection";

it("实际MP4解析确认画面、时长和音轨，拒绝无音轨视频", async () => {
  const audio = await readFile("artifacts/fixtures/sports-test-audio.mp4");
  const silent = await readFile("artifacts/fixtures/sports-test-silent.mp4");
  const result = await inspectMedia(audio, "video/mp4");
  expect(result).toMatchObject({ hasAudio: true });
  expect("durationSeconds" in result && result.durationSeconds).toBeCloseTo(
    2,
    1,
  );
  await expect(inspectMedia(silent, "video/mp4")).rejects.toThrow("音轨");
  await expect(
    inspectMedia(audio.subarray(0, 100), "video/mp4"),
  ).rejects.toThrow("无法完整解析");
});
