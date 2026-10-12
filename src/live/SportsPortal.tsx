import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, RotateCcw } from "lucide-react";
import { SportsPortalClassic } from "./SportsPortalClassic";
import { SportsDashboard } from "./SportsDashboard";
import type { Workspace } from "./api";
import { SportsProgressCard } from "../v2/SportsProgressCard";
import "./sportsDashboard.css";

const preferenceKey = "bnbu:sports-layout";
export function SportsPortal({ workspace }: { workspace: Workspace }) {
  const [params, setParams] = useSearchParams();
  const [preference, setPreference] = useState(() => {
    try { return localStorage.getItem(preferenceKey) ?? "dashboard"; } catch { return "dashboard"; }
  });
  const classic = (params.get("view") ?? preference) === "classic";
  function switchView(view: "classic" | "dashboard") {
    setPreference(view);
    try { localStorage.setItem(preferenceKey, view); } catch { /* URL still provides a working fallback. */ }
    setParams(previous => { const next = new URLSearchParams(previous); next.set("view", view); return next; });
  }
  if (!workspace.firstLoginOnly && !workspace.sports && !workspace.account.roles.some(role => ["operator", "superadmin"].includes(role))) return <p role="status">当前账号暂无已接入的体育记录。</p>;
  return <>
    <div className="sports-view-switch" aria-label="体育页面版本">
      <span>{classic ? "原版界面" : "SPORTS / 数据可视化"}</span>
      <button type="button" onClick={() => switchView(classic ? "dashboard" : "classic")}>
        {classic ? <BarChart3 size={15} /> : <RotateCcw size={15} />}
        {classic ? "查看可视化版" : "恢复原版"}
      </button>
    </div>
    {classic ? <SportsPortalClassic /> : workspace.sports?.role === "student" ? <><SportsProgressCard sports={workspace.sports}/>{!workspace.sports.progress && <p role="status">暂无本学期已确认的运动时长。</p>}</> : <SportsDashboard />}
  </>;
}
