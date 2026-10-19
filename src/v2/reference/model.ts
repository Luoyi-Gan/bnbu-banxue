import {uiLocale} from '../uiLanguage'
import type { Workspace } from '../../live/api'
import { campusWeekday, lessonsForDay, type TimetableLesson } from '../../../shared/v2/timetableModel'

export const campusDate = (date: Date | string = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(date))
export const when = (date: string) => new Intl.DateTimeFormat(uiLocale(), {timeZone:'Asia/Shanghai',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(date))
export function weekDates(now = new Date()) {
  const today = new Date(`${campusDate(now)}T12:00:00+08:00`)
  today.setDate(today.getDate() - campusWeekday(now) + 1)
  return Array.from({length:7}, (_,i) => {const day=new Date(today);day.setDate(today.getDate()+i);return {key:campusDate(day),number:Number(campusDate(day).slice(-2)),label:['一','二','三','四','五','六','日'][i]}})
}
export function ownLessons(data: Workspace | null, day = campusWeekday()) {
  const record = data?.entities.find(item => item.kind === 'timetable' && item.ownerId === data.account.id)
  const lessons = Array.isArray(record?.data.lessons) ? record.data.lessons as TimetableLesson[] : []
  return lessonsForDay(lessons, day)
}
export function sportsSummary(data: Workspace | null) {
  const available = data?.sportsStatus === 'available'
  const progress = available && data.sports?.role === 'student' ? data.sports.progress : null
  const dashboard = available && data.sportsDashboard?.identity.data.role === 'student' ? data.sportsDashboard : null
  const records = dashboard?.records?.filter(item => item.ownerId === dashboard.identity.ownerId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) ?? []
  const percent = typeof progress?.percent === 'number' && Number.isFinite(progress.percent) ? Math.min(100,Math.max(0,progress.percent)) : null
  return {progress, records, percent, available, hasRecords:!!dashboard}
}
