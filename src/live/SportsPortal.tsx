import { SportsDashboard } from "./SportsDashboard";
import type { Workspace } from "./api";
import { SportsProgressCard } from "../v2/SportsProgressCard";
import "./sportsDashboard.css";

export function SportsPortal({ workspace }: { workspace: Workspace }) {
  if (workspace.sportsStatus === "not-enrolled") return null;
  if (!workspace.sports) return <p role="status">体育数据源暂未接通，当前无法确认课程情况。</p>;
  return workspace.sports?.role === "student"
    ? <><SportsProgressCard sports={workspace.sports}/>{!workspace.sports.progress && <p role="status">暂无本学期已确认的运动时长。</p>}</>
    : <SportsDashboard />;
}
