import {uiLocale} from './uiLanguage'

export function detailDate(value:string){
  const date=new Date(value)
  return Number.isFinite(date.getTime())?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(date):value
}

export function detailTimeRange(startAt:string,endAt?:string){
  const start=new Date(startAt),end=endAt?new Date(endAt):null
  if(!Number.isFinite(start.getTime()))return [startAt,endAt].filter(Boolean).join(' – ')
  const day=new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'})
  const clock=new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false})
  const first=`${day.format(start)} ${clock.format(start)}`
  if(!end)return first
  if(!Number.isFinite(end.getTime()))return `${first} – ${endAt}`
  const calendar=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'})
  return calendar.format(start)===calendar.format(end)?`${first}–${clock.format(end)}`:`${first} – ${day.format(end)} ${clock.format(end)}`
}
