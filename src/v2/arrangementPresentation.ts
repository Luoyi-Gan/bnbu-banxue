import type {StudentScheduleItem} from './studentSchedule'
import {campusDate} from './reference/model'
import {isDeadline} from './homeAgenda'
export const arrangementFilters=['全部','课程','DDL','活动','交流','搭子'] as const
export type ArrangementFilter=typeof arrangementFilters[number]
export type ArrangementRange='today'|'week'|'all'
export function arrangementKind(item:StudentScheduleItem):ArrangementFilter{
 return isDeadline(item)?'DDL':item.kind==='course'?'课程':item.kind==='activity'?'活动':item.kind==='coffee'?'交流':'搭子'
}
export function arrangementGroups(items:StudentScheduleItem[],filter:ArrangementFilter,range:ArrangementRange,now=Date.now()){
 const today=campusDate(new Date(now)),start=Date.parse(today+'T00:00:00+08:00'),end=start+(range==='today'?1:7)*86400000
 const shown=items.filter(item=>{
  if(filter!=='全部'&&arrangementKind(item)!==filter)return false
  if(!item.startAt||!Number.isFinite(Date.parse(item.startAt)))return true
  return range==='all'||Date.parse(item.startAt)<end&&Date.parse(item.endAt??item.startAt)>=start
 }).sort((a,b)=>(Date.parse(a.startAt??'')||Infinity)-(Date.parse(b.startAt??'')||Infinity)||a.id.localeCompare(b.id))
 const groups=new Map<string,StudentScheduleItem[]>()
 for(const item of shown){const key=item.startAt&&Number.isFinite(Date.parse(item.startAt))?campusDate(item.startAt):'undated';groups.set(key,[...(groups.get(key)??[]),item])}
 return [...groups].map(([day,items])=>({day,items}))
}
