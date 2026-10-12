import type { AlumniData } from "../v2/alumniModel";
export interface LiveAccount {
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
    id: string;
    body: string;
    readAt: string | null;
    createdAt: string;
  }[];
  people: {
    id: string;
    name: string;
    organization: string;
    status?: string;
    roles?: string[];
  }[];
  relations: { entityId: string; kind: string; createdAt: string }[];
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
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new ApiError(
      response.status,
      data?.message ?? "暂时无法连接后端，请检查本地服务。",
    );
  return data as T;
}
export const loadWorkspace = () => api<Workspace>("/api/workspace");
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
