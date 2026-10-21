import { useUiLanguage } from '../v2/uiLanguage'
import { SportsDashboard } from "./SportsDashboard";
import type { Workspace } from "./api";
import { useState } from "react";
import "./sportsDashboard.css";

export function SportsPortal({ workspace, onRefresh, loading = false, error = "", role = "student" }: {
  workspace: Workspace | null;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  error?: string;
  /** Presentation only; actual sports access requires a server-authorized workspace. */
  role?: "student" | "teacher";
}) { useUiLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };
  if (!error && workspace?.sportsStatus === "not-enrolled") return null;
  // A source outage hides data, not the existing visual dashboard. Only a verified
  // no-enrollment result leaves the module blank. Companion roles grant no sports data.
  const available = !error && workspace?.sportsStatus === "available" && !!workspace.sports;
  const data = available ? workspace.sportsDashboard ?? null : null;
  const pending = loading || refreshing;
  const notice = pending && !data ? "正在读取体育数据…" : error || (!available ? "体育数据源暂未接通，当前无法确认课程情况。" : !data ? "体育课程明细暂未提供。" : undefined);
  return <SportsDashboard data={data} role={workspace?.sports?.role ?? role}
    loading={pending} onRefresh={onRefresh?refresh:undefined}
    sourceLabel={data?"体育平台只读数据":"体育数据暂不可用"}
    notice={notice} />;
}
