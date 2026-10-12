import { SportsDashboard } from "./SportsDashboard";
import type { Workspace } from "./api";
import { useState } from "react";
import "./sportsDashboard.css";

export function SportsPortal({ workspace, onRefresh }: { workspace: Workspace; onRefresh?: () => Promise<void> }) {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };
  if (workspace.sportsStatus === "not-enrolled") return null;
  // A source outage hides data, not the existing visual dashboard. Only a verified
  // no-enrollment result leaves the module blank. Companion roles grant no sports data.
  const available = workspace.sportsStatus === "available" && !!workspace.sports;
  const data = available ? workspace.sportsDashboard ?? null : null;
  return <SportsDashboard data={data} role={workspace.sports?.role ?? (workspace.account.roles.includes("teacher") ? "teacher" : "student")}
    loading={refreshing} onRefresh={onRefresh ? refresh : undefined}
    sourceLabel={data ? "体育平台只读数据" : "体育数据暂不可用"}
    notice={!available ? "体育数据源暂未接通，当前无法确认课程情况。" : !data ? "体育课程明细暂未提供。" : undefined} />;
}
