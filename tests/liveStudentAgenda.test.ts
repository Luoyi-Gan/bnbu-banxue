import {describe,it,expect} from 'vitest'
import type {Workspace,LiveEntity} from '../src/live/api'
import {liveStudentSchedule} from '../src/v2/liveStudentSchedule'
import {lessonRunsInWeek,validSemesterStart,schedulePreferences} from '../shared/v2/schedulePreferences'
import {schoolTeachingDay} from '../shared/v2/academicCalendar'
import {timetableSchedule} from '../src/v2/timetableSchedule'

const now=Date.parse('2026-10-21T10:00:00+08:00')
const entity=(id:string,kind:string,data:Record<string,unknown>,ownerId='me')=>({id,kind,data,ownerId,version:1,createdAt:'',updatedAt:''}) as LiveEntity
const lesson={id:'math',name:'数学',weekday:3,startTime:'14:00',endTime:'15:00',location:'A101',weeks:'1–16周（单周）'}
function fixture(){return {account:{id:'me'},entities:[entity('prefs','preferences',{semesterStartDate:'2026-09-07'}),entity('table','timetable',{lessons:[lesson]})],relations:[],people:[],notifications:[],alumni:{bookings:[],slots:[],profiles:[]}} as unknown as Workspace}
describe('个人下一项安排',()=>{
  it('学校校历按压缩教学周、假期、补课和阅读周计算，周六正常授课',()=>{
    expect(schoolTeachingDay('2026-09-01')).toMatchObject({week:1,weekday:2})
    expect(schoolTeachingDay('2026-09-20')).toEqual({week:4,weekday:5,makeup:true})
    expect(schoolTeachingDay('2026-10-10')).toEqual({week:5,weekday:1,makeup:true})
    expect(schoolTeachingDay('2026-10-12')).toMatchObject({week:6,weekday:1})
    for(const day of ['2026-09-25','2026-10-01','2026-10-07','2026-10-27','2026-12-12','2026-12-16'])expect(schoolTeachingDay(day)).toBeNull()
    expect(schoolTeachingDay('2026-10-24')).toMatchObject({week:7,weekday:6})
    const courses=timetableSchedule([{...lesson,weekday:1,weeks:'1-16周'}],Date.parse('2026-10-09T10:00:00+08:00'),'',3,'bnbu-2026-s1')
    expect(courses.map(c=>c.startAt)).toEqual(['2026-10-10T14:00:00+08:00'])
    expect(courses[0].label).toContain('补课')
  })
  it('严格解析日期、周次范围、单双周及未知内容',()=>{
    expect(validSemesterStart('2026-09-07')).toBe(true)
    expect(validSemesterStart('2026-09-08')).toBe(false)
    expect(validSemesterStart('2026-02-30')).toBe(false)
    expect(lessonRunsInWeek('1–16周（单周）',7)).toBe(true)
    expect(lessonRunsInWeek('1–16周（单周）',8)).toBe(false)
    expect(lessonRunsInWeek('第1-8周、10-16周',9)).toBe(false)
    expect(lessonRunsInWeek('双周',8)).toBe(true)
    expect(lessonRunsInWeek('待确认',7)).toBeNull()
    expect(schedulePreferences({homeScheduleCount:999,semesterStartDate:'bad'})).toEqual({homeScheduleCount:3,semesterStartDate:'',academicCalendar:'bnbu-2026-s1'})
  })
  it('只有本人的有效课表和已设置起始周才能生成课程，结束后移除',()=>{
    const data=fixture(),items=liveStudentSchedule(data,now)
    expect(items[0]).toMatchObject({title:'数学',lessonId:'math',startAt:'2026-10-21T14:00:00+08:00',time:'第7周 · 1–16周（单周）'})
    expect(items.some(i=>i.startAt?.startsWith('2026-10-28'))).toBe(false)
    expect(liveStudentSchedule(data,Date.parse('2026-10-21T15:01:00+08:00')).some(i=>i.startAt?.startsWith('2026-10-21'))).toBe(false)
    data.entities[0].data.semesterStartDate='';data.entities[0].data.academicCalendar='custom'
    expect(liveStudentSchedule(data,now)).toEqual([])
    data.entities[0].data.semesterStartDate='2026-09-07';data.entities[1].ownerId='other'
    expect(liveStudentSchedule(data,now)).toEqual([])
  })
  it('参与活动、课程、已确认预约按时间混排；无时间组队最后展示',()=>{
    const data=fixture()
    data.entities.push(entity('event','activity',{status:'published',title:'参与活动',startAt:'2026-10-21T13:00:00+08:00',endAt:'2026-10-21T14:00:00+08:00'}),entity('unmarked','activity',{status:'published',startAt:'2026-10-21T11:00:00+08:00',endAt:'2026-10-21T12:00:00+08:00'}),entity('team','room',{isMember:true,status:'open',visibility:'visible',title:'组队',time:'本周末15:00'}),entity('slot','coffeeSlot',{startAt:'2026-10-21T16:00:00+08:00',endAt:'2026-10-21T17:00:00+08:00'}),entity('booking','coffeeBooking',{status:'confirmed',slotId:'slot'}))
    data.relations.push({entityId:'event',kind:'participate',createdAt:''})
    const items=liveStudentSchedule(data,now)
    expect(items.slice(0,3).map(i=>i.kind)).toEqual(['activity','course','coffee'])
    expect(items.at(-1)?.id).toBe('team')
    expect(items.some(i=>i.id==='unmarked')).toBe(false)
    data.relations=[];data.entities.find(e=>e.id==='booking')!.data.status='cancelled';data.entities.find(e=>e.id==='team')!.data.isMember=false
    expect(liveStudentSchedule(data,now).every(i=>i.kind==='course')).toBe(true)
  })
})
