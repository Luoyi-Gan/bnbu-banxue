import type { SportsProgress } from "../v2/sportsProgress";

/** A server-selected summary for the signed-in account, never a client email lookup. */
export interface SportsCompanion {
  source: "local";
  role: "student" | "teacher";
  progress: SportsProgress | null;
}

/** Not enrolled is a verified source result, never a fallback for a failed query. */
export type SportsSourceStatus = "available" | "not-enrolled" | "unavailable";
