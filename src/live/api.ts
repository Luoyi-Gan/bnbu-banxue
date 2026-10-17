import type { RelationshipHistory } from '../../shared/v2/relationshipAdapter';
import type { AlumniData } from "../../shared/v2/alumniModel";
import type { SportsCompanion, SportsSourceStatus } from "../../shared/live/sportsCompanion";
import type { SportsDashboardData } from "./sportsDashboardModel";
export interface LiveAccount {
  studentNumber?: string | null;
  id: string;
  email: string;
  name: string;
  organization: string;
  status: string;
  roles: string[];
}
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
  sports?: SportsCompanion | null;
  sportsStatus?: SportsSourceStatus;
  /** Optional server-authorized read-only projection; never populated from companion entities. */
  sportsDashboard?: SportsDashboardData | null;
  firstLoginOnly?: boolean;
  notificationBatches?: {
    id: string;
    createdAt: string;
    total: number;
    read: number;
    readRate: number | null;
  }[];
  capabilities?: Record<string, string>;
  account: LiveAccount;
  entities: LiveEntity[];
  alumni: AlumniData;
  notifications: {
    event: string;
    entityId: string | null;
    id: string;
    body: string;
    readAt: string | null;
    createdAt: string;
  }[];
  people: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    organization: string;
    status?: string;
    roles?: string[];
  }[];
  relations: { entityId: string; kind: string; createdAt: string }[];
  relationshipHistory?: RelationshipHistory[];
  audit: {
    id: string;
    actor_id: string;
    action: string;
    entity_id: string;
    reason: string;
    created_at: string;
  }[];
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      data?.message ?? "暂时无法连接后端，请检查本地服务。",
    );
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new ApiError(response.status, "数据接口尚未连接，请检查本地服务。");
  if (path === "/api/workspace" && (!data.account?.id || !Array.isArray(data.account?.roles)))
    throw new ApiError(response.status, "账号接口尚未返回有效身份，暂不展示业务数据。");
  return data as T;
}
export const loadWorkspace = async () => {
  const data = await api<Workspace>("/api/workspace");
  if (Boolean(import.meta.hot) && typeof window !== 'undefined') {
    const { withPreviewSports } = await import('../v2/preview/localPreview');
    return withPreviewSports(data, true, window.location.hostname);
  }
  return data;
};
export const sportsChangedEvent = "bnbu:sports-updated";
export const workspaceChangedEvent = "bnbu:workspace-updated";
const uncertainRequests = new Map<string, string>();
export async function command(
  action: string,
  input: Record<string, unknown>,
  requestId?: string,
) {
  const fingerprint = JSON.stringify({ action, input });
  const id =
    requestId ?? uncertainRequests.get(fingerprint) ?? crypto.randomUUID();
  uncertainRequests.set(fingerprint, id);
  try {
    const result = await api<{ data: { id: string } }>("/api/commands", {
      action,
      input,
      requestId: id,
    });
    uncertainRequests.delete(fingerprint);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(workspaceChangedEvent));
    return result;
  } catch (error) {
    // Keep the same idempotency key when the server may have committed but its
    // response was lost. A definitive business rejection may be corrected.
    if (error instanceof ApiError && error.status >= 400 && error.status < 500)
      uncertainRequests.delete(fingerprint);
    throw error;
  }
}
