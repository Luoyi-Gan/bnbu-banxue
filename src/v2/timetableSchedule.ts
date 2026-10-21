import type {StudentScheduleItem} from './studentSchedule'
import {campusWeekday} from '../../shared/v2/timetableModel'
import {lessonRunsInWeek,validSemesterStart} from '../../shared/v2/schedulePreferences'
import {schoolTeachingDay} from '../../shared/v2/academicCalendar'

const timePattern=/^([01]\d|2[0-3]):[0-5]\d$/
/** Expand only lessons with known dates, times and teaching weeks. */
export function timetableSchedule(lessons:unknown,now:number,semesterStart:string,days=371,academicCalendar='custom'):StudentScheduleItem[]{
  if(!Array.isArray(lessons)||academicCalendar==='custom'&&!validSemesterStart(semesterStart))return []
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'})
  const today=formatter.format(new Date(now))
  const anchor=Date.parse(`${today}T12:00:00+08:00`),items:StudentScheduleItem[]=[]
  const dates=Array.from({length:days},(_,offset)=>{
    const date=new Date(anchor+offset*86400000),day=formatter.format(date)
    const teaching=academicCalendar==='bnbu-2026-s1'?schoolTeachingDay(day):{week:Math.floor((date.getTime()-Date.parse(`${semesterStart}T12:00:00+08:00`))/(7*86400000))+1,weekday:campusWeekday(date),makeup:false}
    return {day,teaching}
  })
  for(const [index,raw] of lessons.entries()){
    if(!raw||typeof raw!=='object')continue
    const lesson=raw as Record<string,unknown>
    if(typeof lesson.name!=='string'||!lesson.name.trim()||!Number.isInteger(lesson.weekday)||Number(lesson.weekday)<1||Number(lesson.weekday)>7)continue
    const id=String(lesson.id??index),label='我的课程',path='/v2/me?tab=timetable'
    const location=typeof lesson.location==='string'?lesson.location:'教室待确认'
    if(typeof lesson.startTime!=='string'||!timePattern.test(lesson.startTime)){
      continue
    }
    for(const {day,teaching} of dates){
      if(!teaching||teaching.weekday!==lesson.weekday||lessonRunsInWeek(lesson.weeks,teaching.week)!==true)continue
      const week=teaching.week
      const startAt=`${day}T${lesson.startTime}:00+08:00`
      const endAt=typeof lesson.endTime==='string'&&timePattern.test(lesson.endTime)&&lesson.endTime>lesson.startTime?`${day}T${lesson.endTime}:00+08:00`:undefined
      if(Date.parse(endAt??startAt)<=now)continue
      items.push({id:`course:${id}:${day}`,kind:'course',title:lesson.name,location,path,label:teaching.makeup?'我的课程 · 补课':label,time:`第${week}周 · ${String(lesson.weeks)}`,startAt,endAt})
    }
  }
  return items
}
