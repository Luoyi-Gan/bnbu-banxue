import type { SportsProgress } from "../v2/sportsProgress";

/** A server-selected summary for the signed-in account, never a client email lookup. */
export interface SportsCompanion {
  source: "local";
  role: "student" | "teacher";
  progress: SportsProgress | null;
}
