import type { Workspace } from '../../live/api'

export function sportsSummary(data: Workspace | null) {
  const available = data?.sportsStatus === 'available'
  const progress = available && data.sports?.role === 'student' ? data.sports.progress : null
  const dashboard = available && data.sportsDashboard?.identity.data.role === 'student' ? data.sportsDashboard : null
  const records = dashboard?.records?.filter(item => item.ownerId === dashboard.identity.ownerId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) ?? []
  const percent = typeof progress?.percent === 'number' && Number.isFinite(progress.percent) ? Math.min(100,Math.max(0,progress.percent)) : null
  return {progress, records, percent, available, hasRecords:!!dashboard}
}
