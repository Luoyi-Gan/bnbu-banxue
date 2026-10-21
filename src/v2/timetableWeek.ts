import type {TimetableLesson} from '../../shared/v2/timetableModel'
import {timetableSchedule} from './timetableSchedule'

const dayMs=86400000
export const campusDate=(date:number)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)
export function mondayOf(date:string){
  const value=Date.parse(`${date}T12:00:00+08:00`)
  return campusDate(value-((new Date(value).getUTCDay()+6)%7)*dayMs)
}
export const offsetDate=(date:string,days:number)=>campusDate(Date.parse(`${date}T12:00:00+08:00`)+days*dayMs)
export function timetableWeek(lessons:TimetableLesson[],monday:string,semesterStart:string,calendar:string){
  const byId=new Map(lessons.map(lesson=>[String(lesson.id),lesson]))
  return timetableSchedule(lessons,Date.parse(`${monday}T00:00:00+08:00`),semesterStart,7,calendar).map(item=>({
    ...item,lesson:byId.get(item.id.slice(7,-11))!,date:item.startAt!.slice(0,10),
  })).filter(item=>item.lesson)
}
export type WeekCourse=ReturnType<typeof timetableWeek>[number]
export const clockMinutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3,5))
/** Separate overlapping courses into lanes without obscuring either course. */
export function courseLanes(courses:WeekCourse[]){
  const valid=courses.filter(item=>item.endAt).map(item=>({...item,start:clockMinutes(item.lesson.startTime),end:clockMinutes(item.lesson.endTime),lane:0,lanes:1})).sort((a,b)=>a.start-b.start||a.end-b.end)
  let group:typeof valid=[],ends:number[]=[],groupEnd=0
  const finish=()=>{for(const item of group)item.lanes=ends.length;group=[];ends=[]}
  for(const item of valid){
    if(group.length&&item.start>=groupEnd)finish()
    let lane=ends.findIndex(end=>end<=item.start)
    if(lane<0)lane=ends.length
    ends[lane]=item.end;item.lane=lane;group.push(item);groupEnd=Math.max(group.length===1?0:groupEnd,item.end)
  }
  finish();return valid
}
export function courseTone(name:string){return [...name].reduce((sum,char)=>sum+char.codePointAt(0)!,0)%5}
