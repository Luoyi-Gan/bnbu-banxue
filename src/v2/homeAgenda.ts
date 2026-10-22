import type {Workspace} from '../live/api'
import type {StudentScheduleItem} from './studentSchedule'
import {liveStudentSchedule} from './liveStudentSchedule'
import {campusDate} from './reference/model'

export const isDeadline=(item:StudentScheduleItem)=>item.learningType==='deadline'||item.label==='DDL'
export function homepageAgenda(data:Workspace|null,now=Date.now()){
 const today=campusDate(new Date(now)),midnight=Date.parse(today+'T00:00:00+08:00')
 const schedule=liveStudentSchedule(data,now)
 const courses=liveStudentSchedule(data,midnight).filter(item=>item.lessonId&&item.startAt&&campusDate(item.startAt)===today)
 const pendingCourses=courses.filter(item=>Date.parse(item.endAt??item.startAt!)>now)
 return {courses,remainingCourses:pendingCourses,visibleCourses:pendingCourses.length?pendingCourses:courses,deadlines:schedule.filter(isDeadline),other:schedule.filter(item=>!item.lessonId&&!isDeadline(item))}
}
export function courseClock(item:StudentScheduleItem,now:number){
 const start=Date.parse(item.startAt??''),end=Date.parse(item.endAt??'')
 const active=Number.isFinite(end)&&start<=now&&end>now
 return {active,ended:Number.isFinite(end)&&end<=now,remaining:active?Math.ceil((end-now)/60000):0,progress:active?Math.min(100,Math.max(0,(now-start)/(end-start)*100)):0}
}
export function deadlineClock(item:StudentScheduleItem,now:number){
 const date=campusDate(new Date(now)),due=item.startAt?campusDate(item.startAt):''
 const days=due?Math.round((Date.parse(due+'T12:00:00+08:00')-Date.parse(date+'T12:00:00+08:00'))/86400000):null
 return {today:days===0,days}
}
export function deadlineTitle(title:string){
 return title.replace(/\s+is due\s*$/i,'').replace(/\s*\(DDL:[^)]*\)/ig,'').replace(/^Lab Assignment Submission Portal\s*[-–]\s*/i,'').replace(/^Essay Submission Portal\s*/i,'Essay ').trim()
}
