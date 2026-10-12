import type { SportsCompanion } from "./sportsCompanion";

export interface LiveEntity {
  id: string;
  kind: string;
  ownerId: string | null;
  data: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface Workspace {
  account: { id: string; name: string; roles: string[] };
  firstLoginOnly?: boolean;
  sports?: SportsCompanion | null;
}

/** Read-only contract with the separately supplied, authenticated Companion service. */
export async function api<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? (response.status === 401 ? "请先登录伴学账号。" : "体育数据暂不可用，请稍后重试。"));
  if (!data || typeof data !== "object") throw new Error("体育数据接口尚未连接，请配置伴学数据服务。");
  if (path === "/api/workspace" && (!data.account?.id || !Array.isArray(data.account?.roles))) throw new Error("账号接口尚未返回有效身份，暂不展示体育数据。");
  if (path === "/api/sports/workspace" && !data.firstLoginOnly && data.system?.mode !== "MAINTENANCE" && !data.identity?.data?.role) throw new Error("体育接口尚未返回有效身份，暂不展示统计。");
  return data as T;
}
export const sportsChangedEvent = "bnbu:sports-updated";
