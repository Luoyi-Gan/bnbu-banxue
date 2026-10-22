import {describe,it,expect} from 'vitest'
import {dailyDeadlineSelected,dailyCourseIdentity} from '../shared/v2/dailyCourseSelection'
import {homepageAgenda} from '../src/v2/homeAgenda'
import {campusContext} from '../backend/src/campus-ai'
import type {Workspace} from '../src/live/api'
const name='Computer Architecture and Operating Systems (1001)'
const full=name+' (Dr. Guanyao LI) [Semester 1 of 2026-2027]'
const lessons=[{name},{name:'Computer Vision (1001)'}]
const school=(course=full)=>({source:'ispace',course})
describe('DDL follows the selected daily courses',()=>{
 it('matches explicit teacher/semester metadata but keeps class numbers',()=>{
  expect(dailyCourseIdentity(full)).toBe(name.toLowerCase())
  expect(dailyDeadlineSelected(school(),lessons,[])).toBe(true)
  expect(dailyDeadlineSelected(school(),lessons,[name.toLowerCase()])).toBe(false)
  expect(dailyDeadlineSelected(school(name.replace('1001','1002')),lessons,[])).toBe(false)
 })
 it('excludes iSpace courses outside the selectable timetable and unknown course events',()=>{
  expect(dailyDeadlineSelected(school('Introduction to AI Literacy UCAI1003 2026-27S1'),lessons,[])).toBe(false)
  expect(dailyDeadlineSelected(school(''),lessons,[])).toBe(false)
  expect(dailyDeadlineSelected(school(),undefined,[])).toBe(false)
 })
 it('only accepts an omitted class number when the timetable identifies a unique course',()=>{
  expect(dailyDeadlineSelected(school('Computer Vision'),lessons,[])).toBe(true)
  expect(dailyDeadlineSelected(school('Computer Vision'),[...lessons,{name:'Computer Vision (1002)'}],[])).toBe(false)
  expect(dailyDeadlineSelected(school('Computer Vision Advanced'),lessons,[])).toBe(false)
 })
 it('preserves independent manual tasks and follows explicit manual course associations',()=>{
  expect(dailyDeadlineSelected({course:''},lessons,[name.toLowerCase()])).toBe(true)
  expect(dailyDeadlineSelected({course:'个人事务'},lessons,[name.toLowerCase()])).toBe(true)
  expect(dailyDeadlineSelected({course:name},lessons,[name.toLowerCase()])).toBe(false)
 })
 it('home agenda, upcoming arrangements and AI apply the same owned preference; restoring a checkbox restores its DDL',()=>{
  const now=Date.parse('2026-10-22T12:00:00+08:00'),actor={id:'me',email:'owner@example.test',name:'合成学生',roles:['student'],status:'active' as const,organization:'test'}
  const entity=(id:string,kind:string,data:Record<string,unknown>,ownerId='me')=>({id,kind,data,ownerId,version:1,createdAt:'',updatedAt:''})
  const task=(title:string,course:string,source?:string)=>({type:'deadline',title,course,source,startAt:'2026-10-23T23:00:00+08:00',endAt:'2026-10-23T23:00:00+08:00'})
  const pref=entity('prefs','preferences',{hiddenDailyCourses:[name.toLowerCase()],academicCalendar:'custom'})
  const data={account:actor,entities:[entity('table','timetable',{lessons}),pref,entity('selected','learningItem',task('选中课程任务','Computer Vision (1001)','ispace')),entity('hidden','learningItem',task('取消课程任务',full,'ispace')),entity('other-course','learningItem',task('其他课程任务','AI Literacy','ispace')),entity('personal','learningItem',task('个人独立待办','')),entity('other-owner','learningItem',task('他人任务','Computer Vision (1001)','ispace'),'other')],people:[],relations:[],alumni:{bookings:[],slots:[],profiles:[]}} as unknown as Workspace
  expect(homepageAgenda(data,now).deadlines.map(x=>x.title)).toEqual(['个人独立待办','选中课程任务'])
  const text=JSON.stringify(campusContext(actor,data,[],now));expect(text).not.toContain('取消课程任务');expect(text).not.toContain('其他课程任务');expect(text).not.toContain('他人任务');expect(text).toContain('选中课程任务')
  pref.data.hiddenDailyCourses=[]
  expect(homepageAgenda(data,now).deadlines.map(x=>x.title)).toContain('取消课程任务')
  expect(data.entities.filter(x=>x.kind==='learningItem')).toHaveLength(5)
 })
})
