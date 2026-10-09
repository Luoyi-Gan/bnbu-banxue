import { describe, expect, it } from 'vitest'
import { initialV2State } from '../src/v2/model'
import { canUseTeacherSports, answerCoffeeMove, bookCoffee, cancelCoffee, closeCoffeeSlot, coffeeData, managedSlots, occupied, proposeCoffeeMove, saveCoffeeSlot } from '../src/v2/teacherCoffee'
import { studentSchedule } from '../src/v2/studentSchedule'
import { adaptRelationships } from '../src/v2/relationshipAdapter'
const future = (hour: number) => `2099-10-10T${hour}:00:00+08:00`
function setup() {
  let state = { ...structuredClone(initialV2State), role: 'teacher' as const }
  state = saveCoffeeSlot(state, { startAt: future(10), endAt: future(11), location: 'T2', capacity: 1 }) as typeof state
  state = saveCoffeeSlot(state, { startAt: future(12), endAt: future(13), location: 'T3', capacity: 1 }) as typeof state
  return { ...state, role: 'student' as const }
}
describe('shared teacher Coffee Chat', () => {
  it('requires both teacher role and sports qualification', () => {
    expect(canUseTeacherSports(initialV2State)).toBe(false)
    expect(canUseTeacherSports({ ...initialV2State, role: 'teacher' })).toBe(false)
    expect(canUseTeacherSports({ ...initialV2State, role: 'teacher', teacherAccount: { id: 'prof-zhao', sportsQualified: true } })).toBe(true)
    expect(canUseTeacherSports({ ...initialV2State, role: 'student', teacherAccount: { id: 'prof-zhao', sportsQualified: true } })).toBe(false)
  })
  it('shows successful student booking to its teacher, schedule and graph; rejects duplicates', () => {
    const state = setup(), slot = managedSlots(state).at(-2)!
    const next = bookCoffee(state, slot.id, '升学问题')
    expect(coffeeData(next).bookings.at(-1)).toMatchObject({ student: '陈雨晴', topic: '升学问题', status: 'confirmed' })
    expect(coffeeData(next).notices.at(0)?.teacherId).toBe('prof-zhang')
    expect(studentSchedule(next).some(x => x.id === `coffee:${slot.id}` && x.location === 'T2')).toBe(true)
    expect(adaptRelationships(next).some(x => x.sourceId === slot.id)).toBe(true)
    expect(() => bookCoffee(next, slot.id, '重复')).toThrow()
    expect(() => closeCoffeeSlot({ ...next, role: 'teacher' }, slot.id)).toThrow('不能关闭')
    expect(state.coffeeBookings).toHaveLength(0)
  })
  it('cancellation enforces owner and reason, releases occupancy and updates student projection', () => {
    const state = setup(), id = managedSlots(state).at(-2)!.id, booked = bookCoffee(state, id, '问题'), booking = coffeeData(booked).bookings.at(-1)!
    expect(() => cancelCoffee({ ...booked, role: 'teacher', teacherAccount: { id: 'prof-li', sportsQualified: false } }, booking.id, '有事')).toThrow('他人')
    expect(() => cancelCoffee({ ...booked, role: 'teacher' }, booking.id, '')).toThrow('原因')
    const cancelled = cancelCoffee({ ...booked, role: 'teacher' }, booking.id, '课程冲突')
    expect(cancelled.coffeeBookings).not.toContain(id)
    expect(occupied(cancelled, id)).toBe(0)
    expect(coffeeData(cancelled).bookings.at(-1)?.history.at(-1)?.reason).toBe('课程冲突')
    expect(studentSchedule(cancelled).some(x => x.id === `coffee:${id}`)).toBe(false)
  })
  it('holds both slots during reschedule and only the student can accept or reject', () => {
    const state = setup(), old = managedSlots(state).at(-2)!, next = managedSlots(state).at(-1)!
    const booked = bookCoffee(state, old.id, '问题'), id = coffeeData(booked).bookings.at(-1)!.id
    const proposed = proposeCoffeeMove({ ...booked, role: 'teacher' }, id, next.id, '调整安排')
    expect(proposed.coffeeBookings).toEqual([old.id])
    expect(occupied(proposed, old.id)).toBe(1)
    expect(occupied(proposed, next.id)).toBe(1)
    expect(() => answerCoffeeMove(proposed, id, true)).toThrow('学生')
    const accepted = answerCoffeeMove({ ...proposed, role: 'student' }, id, true)
    expect(accepted.coffeeBookings).toEqual([next.id])
    expect(occupied(accepted, old.id)).toBe(0)
    const rejected = answerCoffeeMove({ ...proposed, role: 'student' }, id, false)
    expect(rejected.coffeeBookings).toEqual([old.id])
    expect(occupied(rejected, next.id)).toBe(0)
  })
  it('rejects overlapping slots, nonteacher writes, past and closed bookings', () => {
    const state = setup(), slot = managedSlots(state).at(-2)!
    expect(() => saveCoffeeSlot(state, slot)).toThrow()
    expect(() => saveCoffeeSlot({ ...state, role: 'teacher' }, slot)).toThrow('重叠')
    const closed = closeCoffeeSlot({ ...state, role: 'teacher' }, slot.id)
    expect(() => bookCoffee({ ...closed, role: 'student' }, slot.id, '问题')).toThrow()
    expect(() => bookCoffee(state, slot.id, '问题', Date.parse(future(14)))).toThrow()
  })
  it('does not fabricate students from seed occupancy or old dates', () => {
    expect(coffeeData(initialV2State).bookings).toEqual([])
    const state = { ...structuredClone(initialV2State), coffeeBookings: ['slot-zhang-1530'] }
    expect(coffeeData(state).bookings[0].createdAt).toBeNull()
    expect(coffeeData(state).bookings).toHaveLength(1)
  })
})
