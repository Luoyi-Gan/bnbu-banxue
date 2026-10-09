import { describe, expect, it } from 'vitest'
import { initialV2State, studentName, type V2State } from './model'
import { alumniData, requestAlumniChat, decideAlumniChat, cancelAlumniBooking, reviewAlumni, submitAlumniCertification, followAlumni, publishAlumniPost, addAlumniSlot, closeAlumniSlot, bookingStatus, type AlumniActor } from './alumniPolicy'
import { studentSchedule } from './studentSchedule'

const now = Date.parse('2026-10-09T12:00:00+08:00')
const student: AlumniActor = { role: 'student', id: studentName }
const host: AlumniActor = { role: 'student', id: 'alumni-account-lin' }
const admin: AlumniActor = { role: 'admin', id: 'administrator' }
const fresh = (): V2State => structuredClone(initialV2State)
const apply = (state = fresh(), actor = student) => requestAlumniChat(state, actor, 'alumni-slot-lin', '希望请教如何准备申请材料', now)
const firstId = (state: V2State) => alumniData(state).bookings[0].id

describe('alumni booking lifecycle', () => {
  it('keeps pending out of schedule, only owner confirms, confirmed enters schedule', () => {
    let state = apply()
    expect(studentSchedule(state, now).some(s => s.id.startsWith('alumni:'))).toBe(false)
    expect(() => decideAlumniChat(state, admin, firstId(state), true, '', now)).toThrow()
    expect(() => decideAlumniChat(state, student, firstId(state), true, '', now)).toThrow()
    state = decideAlumniChat(state, host, firstId(state), true, '', now)
    expect(studentSchedule(state, now).filter(s => s.id.startsWith('alumni:'))).toHaveLength(1)
    expect(alumniData(state).notices.some(n => n.recipient === studentName && n.body.includes('已确认'))).toBe(true)
    expect(() => decideAlumniChat(state, host, firstId(state), true, '', now)).toThrow()
    state = cancelAlumniBooking(state, student, firstId(state), '课程安排冲突', now)
    expect(studentSchedule(state, now).some(s => s.id.startsWith('alumni:'))).toBe(false)
  })
  it('rejects duplicate, self, expired and unauthorized requests', () => {
    const state = apply()
    expect(() => apply(state)).toThrow()
    expect(() => apply(fresh(), host)).toThrow()
    expect(() => apply(fresh(), admin)).toThrow()
    expect(() => requestAlumniChat(fresh(), student, 'alumni-slot-lin', '问题', Date.parse('2026-10-20'))).toThrow()
  })
  it('allows several applicants but confirms only one and notifies the others', () => {
    let state = apply()
    state = apply(state, { role: 'student', id: 'another-student' })
    state = decideAlumniChat(state, host, firstId(state), true, '', now)
    expect(alumniData(state).bookings.map(b => b.status)).toEqual(['confirmed', 'unavailable'])
    expect(alumniData(state).notices.some(n => n.recipient === 'another-student' && n.body.includes('已被预约'))).toBe(true)
  })
  it('requires rejection and confirmed cancellation reasons; withdrawal preserves history', () => {
    let state = apply()
    expect(() => decideAlumniChat(state, host, firstId(state), false, '', now)).toThrow()
    state = cancelAlumniBooking(state, student, firstId(state), '', now)
    expect(alumniData(state).bookings[0].status).toBe('withdrawn')
    expect(() => decideAlumniChat(state, host, firstId(state), true, '', now)).toThrow()
    state = apply(state)
    expect(alumniData(state).bookings).toHaveLength(2)
  })
  it('expires unanswered requests and forbids late confirmation', () => {
    const state = apply(), data = alumniData(state), late = Date.parse('2026-10-18T14:00:00+08:00')
    expect(bookingStatus(data, data.bookings[0], late)).toBe('expired')
    expect(() => decideAlumniChat(state, host, firstId(state), true, '', late)).toThrow()
  })
  it('rechecks student time conflicts when confirming an earlier pending request', () => {
    let state = apply()
    const data = alumniData(state)
    state.alumni = { ...data, slots: [...data.slots, { ...data.slots[0], id: 'other-slot', alumniId: 'alumni-zhou' }] }
    state = requestAlumniChat(state, student, 'other-slot', '求职问题', now)
    state = decideAlumniChat(state, { role: 'student', id: 'alumni-account-zhou' }, alumniData(state).bookings[1].id, true, '', now)
    expect(() => decideAlumniChat(state, host, firstId(state), true, '', now)).toThrow()
  })
})

describe('alumni certification and shared content', () => {
  it('requires admin review and approved identity to publish; reuses moderation posts', () => {
    let state = submitAlumniCertification(fresh(), student, { name: studentName, major: '金融学', graduationYear: 2024, city: '深圳', direction: '就业', experience: '金融行业', topics: '求职', bio: '', evidence: '演示毕业信息' }, now)
    expect(() => publishAlumniPost(state, student, '标题', '正文', '就业')).toThrow()
    const id = alumniData(state).profiles.find(p => p.owner === studentName)!.id
    expect(() => reviewAlumni(state, student, id, true, '', now)).toThrow()
    state = reviewAlumni(state, admin, id, true, '', now)
    state = publishAlumniPost(state, student, '标题', '正文', '就业')
    expect(state.posts[0]).toMatchObject({ alumniId: id, status: 'pending', board: '校友就业' })
    expect(state.rooms).toEqual(initialV2State.rooms)
  })
  it('revokes certification with cancellation and notification, preserving history', () => {
    let state = apply()
    state = decideAlumniChat(state, host, firstId(state), true, '', now)
    expect(() => reviewAlumni(state, admin, 'alumni-lin', false, '', now)).toThrow()
    state = reviewAlumni(state, admin, 'alumni-lin', false, '核验资料有误', now)
    expect(alumniData(state).bookings[0].status).toBe('cancelled')
    expect(studentSchedule(state, now).some(s => s.id.startsWith('alumni:'))).toBe(false)
    expect(() => publishAlumniPost(state, host, '标题', '正文', '升学')).toThrow()
    expect(alumniData(state).history.length).toBeGreaterThan(2)
  })
  it('follows idempotently by toggle and validates owner slots and occupied closure', () => {
    let state = followAlumni(fresh(), student, 'alumni-lin')
    expect(alumniData(state).follows).toHaveLength(1)
    state = followAlumni(state, student, 'alumni-lin')
    expect(alumniData(state).follows).toHaveLength(0)
    expect(() => addAlumniSlot(state, student, { startAt: '2026-10-20T12:00:00+08:00', endAt: '2026-10-20T12:30:00+08:00', location: '线上' }, now)).toThrow()
    expect(() => addAlumniSlot(state, host, { startAt: '2026-10-18T14:15:00+08:00', endAt: '2026-10-18T15:00:00+08:00', location: '线上' }, now)).toThrow()
    state = apply(state)
    expect(() => closeAlumniSlot(state, host, 'alumni-slot-lin', now)).toThrow()
  })
})
