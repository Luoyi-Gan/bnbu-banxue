export interface MailActivityFields { title: string; description: string; startAt: string; endAt: string; location: string; host: string; conditions: string }
export const mailFieldLabels: Record<keyof MailActivityFields, string> = { title: '活动名称', description: '活动介绍', startAt: '活动开始时间', endAt: '活动结束时间', location: '活动地点', host: '主办方', conditions: '参与条件' }
export interface MailSource { messageId: string; subject: string; sender: string; body: string; cover?: { name: string; data: string } }
export interface MailExtraction { fields: MailActivityFields; evidence: Partial<Record<keyof MailActivityFields, string>>; issues: string[]; adapter: 'local-rules' }

// Local demonstration adapter. A future authenticated AI service must return
// evidence and explicit uncertainty, never instructions executable by this app.
export function extractMailLocally(source: MailSource): MailExtraction {
  const fields: MailActivityFields = { title: '', description: '', startAt: '', endAt: '', location: '', host: '', conditions: '' }
  const evidence: MailExtraction['evidence'] = {}, issues: string[] = []
  for (const [key, label] of Object.entries(mailFieldLabels) as [keyof MailActivityFields, string][]) {
    const matches = source.body.split(/\r?\n/).map(line => line.trim()).filter(line => new RegExp(`^${label}\\s*[:：]`).test(line))
    if (matches.length > 1) { issues.push(`${label}存在多条信息，请核实是否包含多个活动`); continue }
    if (matches.length === 1) { fields[key] = matches[0].replace(new RegExp(`^${label}\\s*[:：]\\s*`), '').trim(); evidence[key] = matches[0] }
  }
  // Only explicit activity time labels qualify. Receipt/deadline dates are ignored.
  fields.startAt = normalizeMailTime(fields.startAt)
  fields.endAt = normalizeMailTime(fields.endAt)
  return { fields, evidence, issues: [...issues, ...validateMailFields(fields)], adapter: 'local-rules' }
}
export function normalizeMailTime(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::00)?(?:\+08:00)?$/)
  if (!match) return ''
  const [, y, m, d, h, min] = match
  const date = new Date(Date.UTC(+y, +m - 1, +d, +h, +min))
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d || +h > 23 || +min > 59) return ''
  return `${y}-${m}-${d}T${h}:${min}:00+08:00`
}
export function validateMailFields(fields: MailActivityFields) {
  const issues: string[] = []
  for (const key of ['title', 'description', 'startAt', 'endAt', 'location'] as const) if (!fields[key].trim()) issues.push(`缺少${mailFieldLabels[key]}`)
  if (fields.startAt && !normalizeMailTime(fields.startAt)) issues.push('开始时间无效，需明确年月日和时间（北京时间）')
  if (fields.endAt && !normalizeMailTime(fields.endAt)) issues.push('结束时间无效，需明确年月日和时间（北京时间）')
  if (fields.startAt && fields.endAt && Date.parse(fields.endAt) <= Date.parse(fields.startAt)) issues.push('结束时间必须晚于开始时间')
  if (/待定|待通知|另行通知|TBD/i.test(fields.location)) issues.push('地点尚未确定')
  return issues
}
