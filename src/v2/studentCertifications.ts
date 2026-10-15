import type { Workspace } from '../live/api'

const kindLabels: Record<string, string> = {
  student: '学生身份',
  club: '学生社团成员',
  official: '官方机构',
}

const statusLabels: Record<string, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '未通过或已撤销',
}

export function studentCertifications(data: { account: { id: string }; entities: Workspace['entities'] } | null) {
  if (!data) return { records: [], hasApprovedCertification: false, canPublishActivity: false }
  const records = data.entities
    .filter(entity => entity.kind === 'certification' && entity.ownerId === data.account.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
    .map(entity => ({
      id: entity.id,
      kind: String(entity.data.kind ?? ''),
      kindLabel: kindLabels[String(entity.data.kind)] ?? '其他认证',
      status: String(entity.data.status ?? ''),
      statusLabel: statusLabels[String(entity.data.status)] ?? '状态待核对',
      organization: String(entity.data.organization ?? ''),
      note: String(entity.data.note ?? ''),
      reviewNote: String(entity.data.reviewNote ?? ''),
    }))
  return {
    records,
    hasApprovedCertification: records.some(record => record.status === 'approved'),
    canPublishActivity: records.some(record => record.kind === 'club' && record.status === 'approved'),
  }
}
