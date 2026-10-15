import { normalizeMailTime, validateMailFields, type MailActivityFields, type MailExtraction } from './mailActivityAdapter'

const aliases: Record<keyof MailActivityFields, string[]> = {
  title: ['活动名称', '活动主题', '主题', '标题'],
  description: ['活动介绍', '活动内容', '内容简介'],
  startAt: ['活动开始时间', '开始时间'],
  endAt: ['活动结束时间', '结束时间'],
  location: ['活动地点', '举办地点', '地点', '会场'],
  host: ['主办方', '主办单位', '主办'],
  conditions: ['参与条件', '参与对象', '面向对象'],
}

const dateTime = /(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})日?\s*(?:[（(][^）)]{0,8}[）)]\s*)?(\d{1,2}):(\d{2})/
const pad = (value: string) => value.padStart(2, '0')

function point(value: string) {
  const match = dateTime.exec(value)
  if (!match) return ''
  return normalizeMailTime(`${match[1]}-${pad(match[2])}-${pad(match[3])} ${pad(match[4])}:${match[5]}`)
}

/** OCR text is a draft only; an administrator must review every extracted field. */
export function extractActivityScreenshot(text: string): MailExtraction {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const fields: MailActivityFields = { title: '', description: '', startAt: '', endAt: '', location: '', host: '', conditions: '' }
  const evidence: MailExtraction['evidence'] = {}
  for (const key of Object.keys(aliases) as (keyof MailActivityFields)[]) {
    const match = lines.find(line => aliases[key].some(label => new RegExp(`^${label}\\s*[:：]`).test(line)))
    if (!match) continue
    fields[key] = match.replace(/^[^:：]+[:：]\s*/, '').trim()
    evidence[key] = match
  }
  if (!fields.title) {
    const first = lines.find(line => line.length <= 80 && !/[:：]|\d{4}[年/.-]\d/.test(line))
    if (first) { fields.title = first; evidence.title = first }
  }
  if (!fields.description) {
    fields.description = lines.join('\n').slice(0, 5000)
    if (fields.description) evidence.description = '识别文字全文，待管理员核对'
  }
  fields.startAt = point(fields.startAt)
  fields.endAt = point(fields.endAt)
  if (!fields.startAt || !fields.endAt) {
    const line = lines.find(item => dateTime.test(item))
    if (line) {
      const start = point(line)
      if (!fields.startAt && start) { fields.startAt = start; evidence.startAt = line }
      if (!fields.endAt && start) {
        const rest = line.slice((dateTime.exec(line)?.index ?? 0) + (dateTime.exec(line)?.[0].length ?? 0))
        const endTime = /^[\s]*(?:至|到|－|—|–|~|～|-)[\s]*(\d{1,2}):(\d{2})/.exec(rest)
        if (endTime) {
          fields.endAt = normalizeMailTime(`${start.slice(0, 10)} ${pad(endTime[1])}:${endTime[2]}`)
          evidence.endAt = line
        }
      }
    }
  }
  return { fields, evidence, issues: validateMailFields(fields), adapter: 'screenshot-ocr' }
}
