import { describe, expect, it } from 'vitest'
import { initialV2State, type V2State } from '../src/v2/model'
import { importActivityMail, correctActivityMail, setMailActivityVisibility } from '../src/v2/mailActivityPolicy'
import { normalizeMailTime } from '../src/v2/mailActivityAdapter'
import { availableActivities, setActivityParticipation, studentSchedule } from '../src/v2/studentSchedule'
const fixture = (): V2State => ({ ...structuredClone(initialV2State), role: 'admin' })
const source = { messageId: 'source-1', subject: '通知', sender: 'school', body: '活动名称：交流\n活动介绍：学习交流\n活动开始时间：2026-10-25 14:00\n活动结束时间：2026-10-25 16:00\n活动地点：资源中心' }
describe('school mail activity transitions', () => {
  it('automatically publishes complete evidence and keeps source private to admin records', () => {
    const s = importActivityMail(fixture(), source)
    expect(s.mailActivities![0].status).toBe('published')
    expect(s.localEvents[0].capacity).toBeNull()
    expect(s.localEvents[0]).not.toHaveProperty('body')
    expect(s.mailActivities![0].extraction.evidence.startAt).toContain('14:00')
  })
  it('does not infer event time from receipt or deadline and leaves non-event mail pending', () => {
    const s = importActivityMail(fixture(), { ...source, body: '收件时间：2026-10-25 14:00\n报名截止时间：2026-10-25 16:00' })
    expect(s.mailActivities![0].status).toBe('pending')
    expect(s.localEvents).toHaveLength(0)
  })
  it('rejects conflicting event evidence and invalid calendar dates', () => {
    expect(importActivityMail(fixture(), { ...source, body: source.body + '\n活动地点：体育馆' }).localEvents).toHaveLength(0)
    expect(normalizeMailTime('2026-02-30 12:00')).toBe('')
    expect(normalizeMailTime('2026-10-25 24:00')).toBe('')
  })
  it('preserves manual correction history and deduplicates reprocessing', () => {
    const s = importActivityMail(fixture(), source), record = s.mailActivities![0]
    const next = correctActivityMail(s, record.id, { ...record.fields, location: '体育馆' }, '邮件补充说明')
    expect(next.localEvents[0].location).toBe('体育馆')
    expect(next.mailActivities![0].history[1].before?.location).toBe('资源中心')
    expect(importActivityMail(next, { ...source, body: source.body + '\n活动地点：其他' })).toBe(next)
  })
  it('synchronizes hiding/restoring to student visibility and personal schedule without erasing marks', () => {
    let s = importActivityMail(fixture(), source)
    const record = s.mailActivities![0], now = Date.parse('2026-10-25T15:00:00+08:00')
    s = setActivityParticipation({ ...s, role: 'student' }, record.eventId, true, now)
    expect(studentSchedule(s, now).some(e => e.id === `activity:${record.eventId}`)).toBe(true)
    s = setMailActivityVisibility({ ...s, role: 'admin' }, record.id, false, '核对地点')
    expect(availableActivities(s).some(e => e.id === record.eventId)).toBe(false)
    expect(studentSchedule(s, now).some(e => e.id === `activity:${record.eventId}`)).toBe(false)
    s = correctActivityMail(s, record.id, { ...record.fields, location: '体育馆' }, '地点已修正')
    expect(s.mailActivities![0].status).toBe('hidden')
    s = setMailActivityVisibility(s, record.id, true, '已重新核对原邮件')
    expect(studentSchedule(s, now).some(e => e.id === `activity:${record.eventId}`)).toBe(true)
  })
  it('requires role, reason and complete information for corrections', () => {
    expect(() => importActivityMail(initialV2State, source)).toThrow()
    const s = importActivityMail(fixture(), source), r = s.mailActivities![0]
    expect(() => correctActivityMail(s, r.id, r.fields, '')).toThrow()
    expect(() => correctActivityMail(s, r.id, { ...r.fields, location: '待定' }, '核实')).toThrow()
    expect(() => setMailActivityVisibility(s, r.id, false, '')).toThrow()
    expect(() => setMailActivityVisibility({ ...s, role: 'teacher' }, r.id, false, '原因')).toThrow()
  })
  it('publishes a resolved pending record using the same event identity', () => {
    const valid = importActivityMail(fixture(), source).mailActivities![0].fields
    const s = importActivityMail(fixture(), { ...source, body: '自然语言邮件待人工核实' }), r = s.mailActivities![0]
    const next = correctActivityMail(s, r.id, valid, '核对原邮件')
    expect(next.localEvents[0].id).toBe(r.eventId)
    expect(next.mailActivities![0].status).toBe('published')
  })
  it('rejects unsupported attachment content', () => {
    expect(() => importActivityMail(fixture(), { ...source, cover: { name: 'x.svg', data: 'data:image/svg+xml;base64,abc' } })).toThrow()
  })
})
