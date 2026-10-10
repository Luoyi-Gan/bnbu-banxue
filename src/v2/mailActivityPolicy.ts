import { makeId, type LocalEvent, type V2State } from './model'
import { extractMailLocally, validateMailFields, type MailActivityFields, type MailExtraction, type MailSource } from './mailActivityAdapter'
export interface MailActivityRecord {
  id: string; source: MailSource; extraction: MailExtraction; fields: MailActivityFields
  status: 'pending' | 'published' | 'hidden'; eventId: string; importedAt: string
  history: { at: string; actor: string; action: string; reason: string; before: MailActivityFields | null; after: MailActivityFields }[]
}
function adminOnly(state: V2State) { if (state.role !== 'admin') throw new Error('仅管理员可处理学校邮件活动。') }
function project(record: MailActivityRecord): LocalEvent {
  const f = record.fields
  return { id: record.eventId, ownerId: 'school-mail', mailSourceId: record.id, title: f.title, description: f.description, startAt: f.startAt, endAt: f.endAt, location: f.location, host: f.host || '主办方未提供', conditions: f.conditions, capacity: null, image: record.source.cover?.data, status: record.status === 'published' ? 'published' : 'draft', registrations: 0 }
}
function store(state: V2State, record: MailActivityRecord): V2State {
  const mailActivities = [record, ...(state.mailActivities ?? []).filter(m => m.id !== record.id)]
  const localEvents = state.localEvents.filter(e => e.id !== record.eventId)
  return { ...state, mailActivities, localEvents: record.status === 'pending' ? localEvents : [project(record), ...localEvents] }
}
export function importActivityMail(state: V2State, source: MailSource): V2State {
  adminOnly(state)
  if (!source.messageId.trim() || !source.subject.trim() || !source.body.trim()) throw new Error('请填写邮件标识、主题和原文。')
  if ((state.mailActivities ?? []).some(m => m.source.messageId === source.messageId.trim())) return state
  if (source.cover && (!/^data:image\/(png|jpeg|webp);base64,/.test(source.cover.data) || source.cover.data.length > 1500000)) throw new Error('封面须为处理后的 JPG、PNG 或 WebP 图片。')
  const extraction = extractMailLocally(source), at = new Date().toISOString(), published = !extraction.issues.length
  const record: MailActivityRecord = { id: makeId(), source: { ...source, messageId: source.messageId.trim() }, extraction, fields: extraction.fields, status: published ? 'published' : 'pending', eventId: makeId(), importedAt: at, history: [{ at, actor: '本地规则识别演示', action: published ? '信息完整，自动发布' : '信息不完整，待核实', reason: extraction.issues.join('；'), before: null, after: extraction.fields }] }
  return store(state, record)
}
export function correctActivityMail(state: V2State, id: string, fields: MailActivityFields, reason: string): V2State {
  adminOnly(state)
  const record = state.mailActivities?.find(m => m.id === id)
  if (!record || !reason.trim()) throw new Error('请填写修正原因。')
  const clean = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim()])) as unknown as MailActivityFields
  const issues = validateMailFields(clean)
  if (issues.length) throw new Error(issues.join('；'))
  return store(state, { ...record, fields: clean, status: record.status === 'hidden' ? 'hidden' : 'published', history: [...record.history, { at: new Date().toISOString(), actor: '管理员（本地演示）', action: record.status === 'pending' ? '核实修正后发布' : '修正活动信息', reason: reason.trim(), before: record.fields, after: clean }] })
}
export function setMailActivityVisibility(state: V2State, id: string, publish: boolean, reason: string): V2State {
  adminOnly(state)
  const record = state.mailActivities?.find(m => m.id === id)
  if (!record || record.status === 'pending' || !reason.trim()) throw new Error('请先完成信息核实，并填写下架或恢复原因。')
  if (publish && validateMailFields(record.fields).length) throw new Error('活动信息未完整，不能恢复。')
  if ((record.status === 'published') === publish) return state
  return store(state, { ...record, status: publish ? 'published' : 'hidden', history: [...record.history, { at: new Date().toISOString(), actor: '管理员（本地演示）', action: publish ? '重新核对并恢复展示' : '下架活动', reason: reason.trim(), before: record.fields, after: record.fields }] })
}
