import { afterEach, describe, expect, it, vi } from 'vitest'
import { campusWeekday, correctTimetableLesson, lessonsForDay, parseTimetableResponse, saveTimetable } from '../src/v2/timetableModel'
import { demonstrateRecognition, recognizeTimetable, validateTimetablePhoto } from '../src/v2/timetableAdapter'

const lesson = { name: '数据结构', weekday: 1, startTime: '09:00', endTime: '10:50', location: 'T2-202', weeks: '1–16 周', needsReview: false }
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })
describe('student timetable', () => {
  it('defaults by school timezone, including Sunday and the next day boundary', () => {
    expect(campusWeekday(new Date('2026-10-09T16:01:00Z'))).toBe(6)
    expect(campusWeekday(new Date('2026-10-11T15:59:00Z'))).toBe(7)
    expect(campusWeekday(new Date('2026-10-11T16:00:00Z'))).toBe(1)
  })
  it('deduplicates identical lessons without collapsing different days or week ranges', () => {
    expect(parseTimetableResponse({ lessons: [lesson, lesson, { ...lesson, weekday: 2 }, { ...lesson, weeks: '单周' }] })).toHaveLength(3)
  })
  it('rejects invalid or empty responses instead of replacing the timetable', () => {
    for (const value of [null, {}, { lessons: [] }, { lessons: [{ ...lesson, weekday: 8 }] }, { lessons: [{ ...lesson, startTime: '25:00' }] }, { lessons: [{ ...lesson, endTime: '08:00' }] }, { lessons: [{ ...lesson, name: '' }] }]) expect(() => parseTimetableResponse(value)).toThrow()
  })
  it('keeps unknown times empty and flags them for review', () => {
    const result = parseTimetableResponse({ lessons: [{ name: '课程', weekday: 3, period: '第 3–4 节' }] })
    expect(result[0].startTime).toBe('')
    expect(result[0].needsReview).toBe(true)
    expect(result[0].period).toBe('第 3–4 节')
  })
  it('sorts a selected day by time and does not assert that odd-week lessons happen today', () => {
    const result = parseTimetableResponse({ lessons: [{ ...lesson, startTime: '15:00', endTime: '16:00', weeks: '单周' }, lesson, { ...lesson, weekday: 2 }] })
    expect(lessonsForDay(result, 1).map(row => row.startTime)).toEqual(['09:00', '15:00'])
    expect(lessonsForDay(result, 7)).toEqual([])
  })
  it('corrects only the selected lesson while retaining import metadata', () => {
    const table = saveTimetable(parseTimetableResponse({ lessons: [lesson, { ...lesson, weekday: 2 }] }), '课表.png')
    const next = correctTimetableLesson(table, table.lessons[0].id, { ...table.lessons[0], weekday: 4, location: 'T3-301' })
    expect(next.importedAt).toBe(table.importedAt)
    expect(next.fileName).toBe('课表.png')
    expect(next.lessons[1]).toEqual(table.lessons[1])
    expect(next.lessons[0].weekday).toBe(4)
    expect(table.lessons[0].weekday).toBe(1)
  })
  it('validates photo types and sizes', () => {
    expect(() => validateTimetablePhoto({ type: 'image/png', size: 300 })).not.toThrow()
    expect(() => validateTimetablePhoto({ type: 'image/svg+xml', size: 300 })).toThrow()
    expect(() => validateTimetablePhoto({ type: 'image/jpeg', size: 11 * 1024 * 1024 })).toThrow()
    expect(() => validateTimetablePhoto({ type: 'image/png', size: 0 })).toThrow()
  })
  it('does not send photos when no backend is configured', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
    await expect(recognizeTimetable(new File(['image'], 'test.png', { type: 'image/png' }), new AbortController().signal, vi.fn(), '')).rejects.toThrow('尚未接入')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('uploads multipart data with session credentials and validates backend results', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ lessons: [lesson] }), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal, onStage = vi.fn()
    const result = await recognizeTimetable(new File(['image'], 'test.png', { type: 'image/png' }), signal, onStage, '/api/timetable/recognize')
    expect(result[0].name).toBe('数据结构')
    expect(fetch.mock.calls[0][1].body.get('image').name).toBe('test.png')
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: 'same-origin', signal })
    expect(onStage.mock.calls.map(call => call[0])).toEqual(['preparing', 'recognizing', 'organizing'])
  })
  it('rejects HTML fallback pages and unauthorized service responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html/>', { headers: { 'content-type': 'text/html' } })))
    const photo = new File(['image'], 'test.png', { type: 'image/png' })
    await expect(recognizeTimetable(photo, new AbortController().signal, vi.fn(), '/api/timetable/recognize')).rejects.toThrow('尚未正确接入')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    await expect(recognizeTimetable(photo, new AbortController().signal, vi.fn(), '/api/timetable/recognize')).rejects.toThrow('登录状态')
  })
  it('cancels the demo before it returns any result', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const pending = demonstrateRecognition(controller.signal, vi.fn())
    const assertion = expect(pending).rejects.toThrow('已取消')
    controller.abort(); await assertion
  })
})
