export function validSemesterStart(value:unknown):value is string{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false
  const date=new Date(`${value}T12:00:00+08:00`)
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value&&date.getUTCDay()===1
}
export function schedulePreferences(value:Record<string,unknown>|undefined){
  const semesterStartDate=validSemesterStart(value?.semesterStartDate)?value.semesterStartDate:''
  return {homeScheduleCount:typeof value?.homeScheduleCount==='number'&&Number.isInteger(value.homeScheduleCount)&&value.homeScheduleCount>=1&&value.homeScheduleCount<=6?value.homeScheduleCount:3,semesterStartDate,academicCalendar:value?.academicCalendar==='custom'||value?.academicCalendar===undefined&&semesterStartDate?'custom':'bnbu-2026-s1'}
}
export function lessonRunsInWeek(value:unknown,week:number):boolean|null{
  if(!Number.isInteger(week)||week<1||week>53)return false
  if(typeof value!=='string'||!value.trim())return null
  const odd=/单/.test(value),even=/双/.test(value)
  if(odd&&even)return null
  const text=value.replace(/[\s第周()（）单双]/g,'').replace(/[–—~～至到]/g,'-').replace(/[、，；;]/g,',')
  if(!text)return odd?week%2===1:even?week%2===0:null
  if(!/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(text))return null
  const ranges=text.split(',').map(part=>part.split('-').map(Number))
  if(ranges.some(([start,end=start])=>start<1||end>53||end<start))return null
  return ranges.some(([start,end=start])=>week>=start&&week<=end)&&(!odd||week%2===1)&&(!even||week%2===0)
}
