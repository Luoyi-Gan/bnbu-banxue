import { useState } from "react";
import { command, sportsChangedEvent } from "./api";
export function SportsSwimStart({ courseId }: { courseId: string }) {
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function start() {
    setBusy(true);
    setMessage("");
    try {
      if (
        !file ||
        !["image/jpeg", "image/png"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error("请选择10MB以内JPEG/PNG运动前照片。");
      const sha256 = Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
        ),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
      const evidence = await command("sports.swim.before", {
        courseId,
        file: { clientId: sha256, sha256, size: file.size, mime: file.type },
      });
      await command("sports.session.start", {
        courseId,
        activityType: "SWIM",
        beforeEvidenceId: evidence.data.id,
      });
      setMessage("游泳已开始，请保留所选原照片；结束后与运动后照片一起提交。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "开始失败。");
    } finally {
      setBusy(false);
      window.dispatchEvent(new Event(sportsChangedEvent));
    }
  }
  return (
    <details>
      <summary>开始游泳</summary>
      <p>
        先选择运动前照片，再开始计时。请在允许拍摄的区域取证，不要求水中或更衣室拍照，不强制露脸。此步锁定原文件，结束后须提交同一张照片。
      </p>
      <label>
        游泳运动前照片
        <input
          type="file"
          accept="image/jpeg,image/png"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button disabled={busy || !file} onClick={() => void start()}>
        {busy ? "正在开始…" : "锁定运动前照片并开始游泳"}
      </button>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
