export const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
export interface TimetableLesson {
  id: string
  name: string
  weekday: number
  startTime: string
  endTime: string
  period: string
  location: string
  teacher: string
  weeks: string
  note: string
  needsReview: boolean
}
export interface StudentTimetable {
  lessons: TimetableLesson[]
  importedAt: string
  fileName: string
  updatedAt: string
}

export function campusWeekday(now = new Date()) {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', weekday: 'short' }).format(now)
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day) + 1
}
const text = (value: unknown, max = 300) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const isTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)

// Recognition responses are untrusted. Keep unknown details empty rather than infer them.
export function parseTimetableResponse(value: unknown): TimetableLesson[] {
  if (!value || typeof value !== 'object' || !('lessons' in value) || !Array.isArray(value.lessons) || !value.lessons.length || value.lessons.length > 100) throw new Error('未识别到有效课程，请换一张清晰、完整的课表照片重试。')
  const unique = new Map<string, TimetableLesson>()
  for (const [index, entry] of value.lessons.entries()) {
    if (!entry || typeof entry !== 'object') throw new Error('识别结果格式异常，请重试。')
    const row = entry as Record<string, unknown>
    const name = text(row.name, 100), weekday = row.weekday
    if (!name || typeof weekday !== 'number' || !Number.isInteger(weekday) || weekday < 1 || weekday > 7) throw new Error('部分课程缺少名称或星期，请重新识别，原课表已保留。')
    const startTime = text(row.startTime), endTime = text(row.endTime)
    if ((startTime && !isTime(startTime)) || (endTime && !isTime(endTime)) || (startTime && endTime && endTime <= startTime)) throw new Error('识别出的课程时间无效，请重新识别，原课表已保留。')
    const lesson: TimetableLesson = { id: `lesson-${index}`, name, weekday, startTime, endTime, period: text(row.period, 60), location: text(row.location, 100), teacher: text(row.teacher, 80), weeks: text(row.weeks, 100), note: text(row.note), needsReview: row.needsReview !== false || !startTime || !endTime }
    const key = JSON.stringify([weekday, name, startTime, endTime, lesson.period, lesson.location, lesson.teacher, lesson.weeks])
    if (!unique.has(key)) unique.set(key, lesson)
  }
  return [...unique.values()]
}
export function lessonsForDay(lessons: TimetableLesson[], weekday: number) {
  return lessons.filter(item => item.weekday === weekday).sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99') || a.period.localeCompare(b.period, 'zh-CN', { numeric: true }))
}
export function saveTimetable(lessons: TimetableLesson[], fileName: string): StudentTimetable {
  const now = new Date().toISOString()
  return { lessons: parseTimetableResponse({ lessons }), importedAt: now, updatedAt: now, fileName }
}
export function correctTimetableLesson(table: StudentTimetable, id: string, input: Omit<TimetableLesson, 'id'>): StudentTimetable {
  if (!table.lessons.some(item => item.id === id)) throw new Error('课程已变更，请重新打开。')
  const clean = parseTimetableResponse({ lessons: [input] })[0]
  return { ...table, updatedAt: new Date().toISOString(), lessons: table.lessons.map(item => item.id === id ? { ...clean, id } : item) }
}
