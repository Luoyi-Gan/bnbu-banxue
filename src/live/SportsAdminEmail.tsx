import { useState } from "react";
import { api } from "./api";
export function SportsAdminEmail() {
  const [status, setStatus] = useState<{
      email: string;
      verified: boolean;
    } | null>(null),
    [id, setId] = useState(""),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  const refresh = async () =>
    setStatus(
      await api<{ email: string; verified: boolean }>(
        "/api/sports/admin-email",
      ),
    );
  return (
    <details className="v2-panel live-card">
      <summary>管理账号邮箱验证</summary>
      <button disabled={busy} onClick={() => void run(refresh)}>
        查看本人当前邮箱
      </button>
      {status && (
        <>
          <p>
            {status.email} · {status.verified ? "已验证" : "未验证"}
          </p>
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const result = await api<{
                  challengeId: string;
                  message: string;
                }>("/api/sports/admin-email/request", {});
                setId(result.challengeId);
                setCode("");
                setMessage(result.message);
              })
            }
          >
            发送验证邮件
          </button>
        </>
      )}
      {id && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await api("/api/sports/admin-email/confirm", {
                challengeId: id,
                code,
              });
              setId("");
              setCode("");
              setMessage("管理账号当前邮箱已验证。");
              await refresh();
            });
          }}
        >
          <label>
            邮箱验证码
            <input
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
            />
          </label>
          <button disabled={busy}>确认验证</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
