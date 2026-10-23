import {describe,it,expect} from 'vitest'
import type {StudentScheduleItem} from '../src/v2/studentSchedule'
import {arrangementGroups,arrangementKind} from '../src/v2/arrangementPresentation'
const now=Date.parse('2026-10-22T23:30:00+08:00')
const item=(id:string,startAt?:string,extra:Partial<StudentScheduleItem>={}):StudentScheduleItem=>({id,kind:'course',title:id,time:'',location:'T1',path:'/',label:'我的课程',startAt,...extra})
describe('本人安排的日期与分类呈现',()=>{
 it('按上海日期分组而非设备时区，未定时间排最后',()=>{
  const groups=arrangementGroups([item('undated'),item('tomorrow','2026-10-22T16:10:00Z'),item('today','2026-10-22T15:50:00Z')],'全部','all',now)
  expect(groups.map(g=>g.day)).toEqual(['2026-10-22','2026-10-23','undated'])
 })
 it('未来7天按自然日边界筛选，保留正在跨日进行的活动',()=>{
  const a=[item('overnight','2026-10-21T23:00:00+08:00',{kind:'activity',endAt:'2026-10-23T01:00:00+08:00'}),item('last','2026-10-28T23:59:00+08:00'),item('outside','2026-10-29T00:00:00+08:00')]
  expect(arrangementGroups(a,'全部','week',now).flatMap(g=>g.items.map(i=>i.id))).toEqual(['overnight','last'])
 })
 it('课程类型不吞掉DDL，按类型筛选不改变原事项',()=>{
  const deadline=item('task','2026-10-23T10:00:00+08:00',{label:'DDL',learningType:'deadline'})
  expect(arrangementKind(deadline)).toBe('DDL')
  expect(arrangementGroups([deadline],'课程','all',now)).toHaveLength(0)
  expect(arrangementGroups([deadline],'DDL','all',now)[0].items[0]).toBe(deadline)
 })
 it('空结果与无有效日期的事项不会生成虚构时间',()=>{
  expect(arrangementGroups([],'全部','today',now)).toEqual([])
  expect(arrangementGroups([item('unknown','invalid')],'全部','today',now)[0].day).toBe('undated')
 })
})
