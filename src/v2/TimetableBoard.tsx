import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {CalendarDays,ChevronLeft,ChevronRight,LayoutGrid,List,MapPin,BookOpen,ArrowUpRight} from 'lucide-react'
import {TimetableCalendarSettings} from './TimetableCalendarSettings'
import type {TimetableLesson} from '../../shared/v2/timetableModel'
import {lessonRunsInWeek,schedulePreferences} from '../../shared/v2/schedulePreferences'
import {schoolCalendarWeek} from '../../shared/v2/academicCalendar'
import {campusDate,mondayOf,offsetDate,timetableWeek,courseLanes,clockMinutes,courseTone} from './timetableWeek'
import {uiText} from './uiLanguage'

export function TimetableBoard({lessons,preferences,onSelect,idPrefix}:{lessons:TimetableLesson[];preferences?:Record<string,unknown>;onSelect:(id:string)=>void;idPrefix:string}){
  const [calendarSettings,setCalendarSettings]=useState(false)
  const [now,setNow]=useState(Date.now)
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),60000);return()=>window.clearInterval(timer)},[])
  const today=campusDate(now)
  const [monday,setMonday]=useState(()=>mondayOf(today))
  const [selectedDay,setSelectedDay]=useState(today)
  const [view,setView]=useState<'week'|'day'>(()=>window.matchMedia('(max-width: 600px)').matches?'day':'week')
  const prefs=schedulePreferences(preferences)
  const days=Array.from({length:7},(_,index)=>offsetDate(monday,index))
  const courses=useMemo(()=>timetableWeek(lessons,monday,prefs.semesterStartDate,prefs.academicCalendar),[lessons,monday,prefs.semesterStartDate,prefs.academicCalendar])
  const incomplete=lessons.filter(item=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.startTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.endTime)||item.endTime<=item.startTime||lessonRunsInWeek(item.weeks,1)===null)
  const week=days.map(date=>schoolCalendarWeek(date)).find(Boolean)
  const selected=courses.filter(item=>item.date===selectedDay).sort((a,b)=>a.startAt!.localeCompare(b.startAt!))
  const start=Math.min(8*60,...courses.map(item=>clockMinutes(item.lesson.startTime)))
  const end=Math.max(18*60,...courses.filter(item=>item.endAt).map(item=>clockMinutes(item.lesson.endTime)))
  const firstHour=Math.floor(start/60),lastHour=Math.ceil(end/60),hours=Array.from({length:lastHour-firstHour+1},(_,i)=>firstHour+i)
  const changeWeek=(amount:number)=>{setMonday(offsetDate(monday,amount*7));setSelectedDay(offsetDate(selectedDay,amount*7))}
  const currentMinutes=clockMinutes(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now))
  return <section className="tt-board" aria-label={uiText('课程日历')}>
    <header className="tt-toolbar"><div className="tt-month"><span>{monday.slice(0,4)} / {Number(monday.slice(5,7))} {uiText('月')}</span><strong>{prefs.academicCalendar==='bnbu-2026-s1'&&week?`第 ${week} 周`:uiText('一周课程')}<small>{monday.slice(5).replace('-','.')} — {days[6].slice(5).replace('-','.')}</small></strong></div><div className="tt-week-actions"><button type="button" aria-label={uiText('课表上一周')} onClick={()=>changeWeek(-1)}><ChevronLeft size={18}/></button><button type="button" onClick={()=>{setMonday(mondayOf(today));setSelectedDay(today)}}>{uiText('今天')}</button><button type="button" aria-label={uiText('课表下一周')} onClick={()=>changeWeek(1)}><ChevronRight size={18}/></button></div></header>
    <div className="tt-subbar"><span><i/>{prefs.academicCalendar==='bnbu-2026-s1'&&week===8?uiText('阅读周 · 暂无常规课程'):<>{uiText('本周')} {courses.length} {uiText('项课程')}</>}</span><div className="tt-view-switch" aria-label={uiText('课表显示方式')}><button type="button" aria-pressed={view==='week'} onClick={()=>setView('week')}><LayoutGrid size={14}/>{uiText('周课表')}</button><button type="button" aria-pressed={view==='day'} onClick={()=>setView('day')}><List size={15}/>{uiText('日列表')}</button></div></div>
    {view==='day'?<><nav className="tt-date-strip" aria-label={uiText('选择课程日期')}>{days.map((date,index)=><button key={date} type="button" aria-pressed={selectedDay===date} aria-label={`${date} 周${'一二三四五六日'[index]}`} className={date===today?'is-today':''} onClick={()=>setSelectedDay(date)}><span>{'一二三四五六日'[index]}</span><strong>{Number(date.slice(8))}</strong><i className={courses.some(item=>item.date===date)?'has-course':''}/></button>)}</nav><div className="tt-day-courses" id={`${idPrefix}-day`}>
      <header><strong>{selectedDay===today?uiText('今天'):selectedDay.slice(5).replace('-',uiText('月'))+uiText('日')}</strong><small>{selected.length} {uiText('项课程')}</small></header>
      {selected.map(item=><button type="button" className={`tt-day-course tt-tone-${courseTone(item.title)}`} key={item.id} onClick={()=>onSelect(item.lesson.id)}><time><strong>{item.lesson.startTime}</strong><span>{item.lesson.endTime||uiText('待核对')}</span></time><span className="tt-course-info"><strong>{item.title}</strong><span><MapPin size={14}/>{item.location}</span><small>{item.lesson.teacher}{item.lesson.teacher?' · ':''}{item.time}{item.lesson.needsReview?` · ${uiText('待核对')}`:''}</small></span><ChevronRight size={16}/></button>)}
      {!selected.length&&<div className="tt-empty"><BookOpen size={28}/><strong>{uiText('这一天暂无课程')}</strong><span>{uiText('切换日期，看看其他安排')}</span></div>}
    </div></>:<div className="tt-grid-scroll" tabIndex={0} aria-label={uiText('周课表，可横向滚动')}><div className="tt-grid" style={{'--tt-hours':lastHour-firstHour} as CSSProperties}><div className="tt-grid-head"><span><ClockLabel/></span>{days.map((date,index)=><button key={date} type="button" className={date===today?'is-today':''} aria-label={`${date} 周${'一二三四五六日'[index]}`} onClick={()=>{setSelectedDay(date);setView('day')}}><span>周{'一二三四五六日'[index]}</span><strong>{Number(date.slice(8))}</strong></button>)}</div><div className="tt-grid-body"><div className="tt-hours">{hours.map(hour=><time key={hour} style={{top:(hour-firstHour)*64}}>{String(hour).padStart(2,'0')}:00</time>)}</div>{days.map(date=><div key={date} className={`tt-grid-column ${date===today?'is-today':''}`}>
      {courseLanes(courses.filter(item=>item.date===date)).map(item=><button type="button" key={item.id} className={`tt-grid-course tt-tone-${courseTone(item.title)}`} style={{top:(item.start-firstHour*60)/60*64,height:Math.max(14,(item.end-item.start)/60*64-3),left:`calc(${item.lane/item.lanes*100}% + 3px)`,width:`calc(${100/item.lanes}% - 6px)`}} aria-label={`${item.title}，${item.lesson.startTime}至${item.lesson.endTime}，${item.location}`} onClick={()=>onSelect(item.lesson.id)}><strong>{item.title}</strong><span>{item.location}</span><small>{item.lesson.startTime}</small></button>)}
      {date===today&&currentMinutes>=firstHour*60&&currentMinutes<=lastHour*60&&<div className="tt-now" style={{top:(currentMinutes-firstHour*60)/60*64}}><i/></div>}
    </div>)}</div></div></div>}
    {!!incomplete.length&&<details className="tt-unplaced"><summary>{incomplete.length} {uiText('项课程信息待补充')}</summary><p>{uiText('时间或周次不完整的课程，核对后会显示在日历中。')}</p>{incomplete.map(item=><button type="button" key={item.id} onClick={()=>onSelect(item.id)}>{item.name}<ChevronRight size={15}/></button>)}</details>}
    {!!lessons.length&&<details className="tt-course-catalog"><summary>{uiText('全部课程')}<span>{lessons.length}</span></summary><div>{lessons.map(item=><button type="button" key={item.id} onClick={()=>onSelect(item.id)}><span><strong>{item.name}</strong><small>周{'一二三四五六日'[item.weekday-1]} · {item.startTime||item.period||uiText('时间待核对')} · {item.location||uiText('地点待核对')}</small></span><ChevronRight size={15}/></button>)}</div></details>}
    {prefs.academicCalendar==='custom'&&!prefs.semesterStartDate&&<p className="tt-calendar-note">{uiText('设置学期日期后，课程将按周次显示。')}<button type="button" onClick={()=>setCalendarSettings(true)}>{uiText('设置校历')}<ArrowUpRight size={13}/></button></p>}
    <footer className="tt-board-footer"><span><CalendarDays size={13}/>{uiText(prefs.academicCalendar==='bnbu-2026-s1'?'学校校历 · 2026/27 第一学期':'自定义学期')}</span><button type="button" onClick={()=>setCalendarSettings(true)}>{uiText('校历设置')}<ArrowUpRight size={12}/></button></footer>
    {calendarSettings&&<TimetableCalendarSettings onClose={()=>setCalendarSettings(false)}/>}
  </section>
}
function ClockLabel(){return <span className="tt-time-label">时间</span>}
