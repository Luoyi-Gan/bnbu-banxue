import { useCallback, useEffect, useRef, useState } from "react";
import { api, sportsChangedEvent, type Workspace } from "./api";

export function useSportsAccount() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const active = useRef(false), generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const next = await api<Workspace>("/api/workspace", controller.signal);
      if (active.current && current === generation.current) { setData(next); setError(""); }
    } catch (failure) {
      if (active.current && current === generation.current) { setData(null); setError(failure instanceof Error ? failure.message : "体育账号读取失败。"); }
    } finally { window.clearTimeout(timer); }
  }, []);
  useEffect(() => {
    active.current = true;
    void refresh();
    const visibleRefresh = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", refresh);
    window.addEventListener(sportsChangedEvent, refresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    const timer = window.setInterval(visibleRefresh, 30000);
    return () => { active.current = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener(sportsChangedEvent, refresh); document.removeEventListener("visibilitychange", visibleRefresh); };
  }, [refresh]);
  return { data, error, refresh };
}
