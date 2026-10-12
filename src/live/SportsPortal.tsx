import { SportsDashboard } from "./SportsDashboard";
import type { Workspace } from "./api";
import { SportsProgressCard } from "../v2/SportsProgressCard";
import "./sportsDashboard.css";

export function SportsPortal({ workspace }: { workspace: Workspace }) {
  if (!workspace.firstLoginOnly && !workspace.sports && !workspace.account.roles.some(role => ["operator", "superadmin"].includes(role))) return <p role="status">当前账号暂无已接入的体育记录。</p>;
  return workspace.sports?.role === "student"
    ? <><SportsProgressCard sports={workspace.sports}/>{!workspace.sports.progress && <p role="status">暂无本学期已确认的运动时长。</p>}</>
    : <SportsDashboard />;
}
