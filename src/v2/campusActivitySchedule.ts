import type { ActivityItem } from './activityFilters'
import { resolveCampusLocation } from './campusLocations'

/** Time groups describe the published schedule, not attendance or completion. */
export function campusActivitySchedule(items: ActivityItem[], buildingId: string | null | undefined, now: number) {
  const ongoing: ActivityItem[] = []
  const upcoming: ActivityItem[] = []
  if (!buildingId || !Number.isFinite(now)) return { ongoing, upcoming }
  for (const item of items) {
    if (item.local?.status !== 'published' || resolveCampusLocation(item.location) !== buildingId) continue
    const start = Date.parse(item.startAt)
    const end = item.endAt ? Date.parse(item.endAt) : NaN
    if (!Number.isFinite(start) || (item.endAt && (!Number.isFinite(end) || end <= start))) continue
    if (start > now) upcoming.push(item)
    else if (end > now) ongoing.push(item)
  }
  const chronological = (a: ActivityItem, b: ActivityItem) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.id.localeCompare(b.id)
  return { ongoing: ongoing.sort(chronological), upcoming: upcoming.sort(chronological) }
}
