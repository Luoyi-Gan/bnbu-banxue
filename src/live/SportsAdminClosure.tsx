import { useState } from "react";
import { api, command } from "./api";
export function SportsAdminClosure() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function close() {
    setBusy(true);
    setError("");
    try {
      const account = await api<{
        id: string;
        version: number;
        name: string;
        loginName: string;
        email: string;
      }>("/api/sports/administrator-self");
      if (
        !window.confirm(
          `确认已完成全部职责移交并注销本人管理账号？\n姓名：${account.name}\n账号：${account.loginName}\n学校邮箱：${account.email}\n登录资料将删除，业务历史保留，原学生／教师账号不受影响。`,
        )
      )
        return;
      await command("sports.account.close", {
        ...account,
        confirmed: true,
        handoverConfirmed: true,
      });
      window.location.assign("/v2/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "注销失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="v2-panel live-card">
      <summary>注销本人管理账号</summary>
      <p>仅在已完成或移交全部职责后操作。注销后管理登录资料删除，历史保留。</p>
      <button disabled={busy} onClick={() => void close()}>
        核对并注销本人管理账号
      </button>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
