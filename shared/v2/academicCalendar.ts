/** User-supplied BNBU Academic Calendar 2026/27 Semester I, Senate approval 2026-05-26. */
export const schoolCalendarId='bnbu-2026-s1'
const weeks:[string,string,number][]=[
  ['2026-09-01','2026-09-05',1],['2026-09-06','2026-09-12',2],['2026-09-13','2026-09-19',3],['2026-09-20','2026-09-26',4],
  ['2026-09-27','2026-10-10',5],['2026-10-11','2026-10-17',6],['2026-10-18','2026-10-24',7],['2026-10-25','2026-10-31',8],
  ['2026-11-01','2026-11-07',9],['2026-11-08','2026-11-14',10],['2026-11-15','2026-11-21',11],['2026-11-22','2026-11-28',12],
  ['2026-11-29','2026-12-05',13],['2026-12-06','2026-12-11',14],
]
export function schoolCalendarWeek(day:string){return weeks.find(([start,end])=>day>=start&&day<=end)?.[2]}
export function schoolTeachingDay(day:string):{week:number;weekday:number;makeup:boolean}|null{
  const row=weeks.find(([start,end])=>day>=start&&day<=end)
  if(!row||day>='2026-09-25'&&day<='2026-09-27'||day>='2026-10-01'&&day<='2026-10-07'||row[2]===8)return null
  if(day==='2026-09-20')return {week:4,weekday:5,makeup:true}
  if(day==='2026-10-10')return {week:5,weekday:1,makeup:true}
  const weekday=new Date(`${day}T12:00:00+08:00`).getUTCDay()
  return weekday===0?null:{week:row[2],weekday,makeup:false}
}
