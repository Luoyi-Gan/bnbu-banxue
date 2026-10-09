import { describe, expect, it } from 'vitest'
import { canPublishActivity, changeActivityVisibility, createActivity, ownsActivity } from '../src/v2/activityPolicy'
import { initialV2State, studentName, type Verification } from '../src/v2/model'
import { hideRetiredContent } from '../src/v2/retiredContent'
import { filterActivityItems, type ActivityItem } from '../src/v2/activityFilters'

const state = () => structuredClone(initialV2State)
const input = { title: '社团交流', description: '分享学习经验', startAt: '2099-10-12T12:00:00+08:00', location: 'T2', capacity: 20 }
const certification = (status: Verification['status'], kind: Verification['kind'] = 'club', name = studentName): Verification => ({ id: crypto.randomUUID(), name, kind, organization: '摄影社', note: '成员资格', status, reviewNote: '', date: '今天' })

describe('activity publishing eligibility and ownership', () => {
  it('rejects ordinary students and organization join flags', () => {
    const value = state(); value.joinedOrganizations = ['photography']
    expect(canPublishActivity(value)).toBe(false)
    expect(() => createActivity(value, input)).toThrow('已认证')
    expect(value.localEvents).toEqual([])
  })
  it.each(['pending', 'rejected'] as const)('rejects %s club membership', (status) => {
    const value = state(); value.verifications = [certification(status)]
    expect(() => createActivity(value, input)).toThrow()
  })
  it('does not substitute student or official certification or another person', () => {
    const value = state(); value.verifications = [certification('approved', 'student'), certification('approved', 'official'), certification('approved', 'club', '其他人')]
    expect(canPublishActivity(value)).toBe(false)
  })
  it('publishes for an approved member and keeps explicit ownership', () => {
    const value = state(); value.verifications = [certification('approved')]
    const next = createActivity(value, input)
    expect(next.localEvents[0]).toMatchObject({ ownerId: 'student-demo', host: studentName, status: 'published' })
    expect(value.localEvents).toEqual([])
  })
  it('publishes for a teacher but not an administrator', () => {
    const value = state(); value.role = 'teacher'
    expect(createActivity(value, input).localEvents[0]).toMatchObject({ ownerId: 'prof-zhang', host: '张老师' })
    value.role = 'admin'; value.verifications = [certification('approved')]
    expect(() => createActivity(value, input)).toThrow()
  })
  it('rechecks membership when creating or restoring after revocation', () => {
    let value = state(); value.verifications = [certification('approved')]
    value = createActivity(value, input)
    const id = value.localEvents[0].id
    value = changeActivityVisibility(value, id)
    value.verifications.unshift(certification('rejected'))
    expect(() => createActivity(value, input)).toThrow()
    expect(() => changeActivityVisibility(value, id)).toThrow('资格')
  })
  it('prevents another identity managing events and retains legacy student ownership', () => {
    let value = state(); value.role = 'teacher'; value = createActivity(value, input)
    value.role = 'student'
    expect(ownsActivity(value, value.localEvents[0])).toBe(false)
    expect(() => changeActivityVisibility(value, value.localEvents[0].id)).toThrow('本人')
    expect(ownsActivity(value, { ...value.localEvents[0], ownerId: undefined })).toBe(true)
  })
  it('validates activity fields before writing', () => {
    const value = state(); value.role = 'teacher'
    expect(() => createActivity(value, { ...input, startAt: '2000-01-01' })).toThrow()
    expect(() => createActivity(value, { ...input, description: '', capacity: 0 })).toThrow()
  })
  it('filters hosted events by owner rather than assuming all local events are mine', () => {
    const value = state(); value.role = 'teacher'
    const event = createActivity(value, input).localEvents[0]
    const item: ActivityItem = { ...event, subtitle: '', category: '', host: event.host!, local: event }
    const filters = { query: '', category: '全部', period: '全部时间', host: '全部主办方', status: '我主办', sort: '推荐顺序' } as const
    expect(filterActivityItems([item], filters, 'student-demo')).toEqual([])
    expect(filterActivityItems([item], filters, 'prof-zhang')).toHaveLength(1)
  })
})

it('suppresses retired notices and AI references while preserving business records', () => {
  const value = state()
  value.eventRegistrations = { old: 'going' }
  value.announcements = [{ id: 'legacy' }]
  value.notifications.push({ id: 'old', title: '活动报名成功', body: '旧活动', path: '/v2/activities/old', date: '', read: false }, { id: 'notice', title: '通知', body: '', path: '/v2/announcements?item=x', date: '', read: false })
  value.aiPinnedSources.push('/v2/announcements')
  value.aiMessages.push({ id: 'old-ai', from: 'assistant', body: '去查看电子凭证', sourcePath: '/v2/activities' })
  const next = hideRetiredContent(value)
  expect(next.notifications.map((item) => item.id)).toEqual(['n1'])
  expect(next.aiMessages.some((item) => item.id === 'old-ai')).toBe(false)
  expect(next.aiPinnedSources).not.toContain('/v2/announcements')
  expect(next.eventRegistrations).toEqual(value.eventRegistrations)
  expect(next.announcements).toEqual(value.announcements)
  expect(value.notifications).toHaveLength(3)
})
