import {useEffect,useState,type MouseEvent} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {ArrowUpRight,BookOpen,CalendarDays,ChevronRight,Clock,Coffee,Flag,MapPin,UsersRound} from 'lucide-react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {liveStudentSchedule} from './liveStudentSchedule'
import {liveActivities} from './liveActivities'
import {StudentCoffeeChanges} from './TeacherPortal'
import {StudentTimetable} from './StudentTimetable'
import {arrangementFilters,arrangementGroups,arrangementKind,type ArrangementRange} from './arrangementPresentation'
import {deadlineTitle,isDeadline} from './homeAgenda'
import {campusDate} from './reference/model'
import {uiText,uiLocale,useUiLanguage} from './uiLanguage'
import type {StudentScheduleItem} from './studentSchedule'
import type {CardOrigin} from './ui'
import './studentArrangements.css'

const icons={全部:CalendarDays,课程:BookOpen,DDL:Flag,活动:CalendarDays,交流:Coffee,搭子:UsersRound}
export function StudentArrangements(){useUiLanguage()
 const live=useWorkspaceBackend(30000),[params,setParams]=useSearchParams(),[now,setNow]=useState(Date.now),[limit,setLimit]=useState(24)
 const [course,setCourse]=useState<{id:string;origin:CardOrigin}|null>(null)
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer)},[])
 const filter=arrangementFilters.find(value=>value===params.get('kind'))??'全部'
 const range=(['today','week','all'].includes(params.get('range')??'')?params.get('range'):'week') as ArrangementRange
 const schedule=liveStudentSchedule(live.data,now),groups=arrangementGroups(schedule,filter,range,now)
 const count=groups.reduce((sum,group)=>sum+group.items.length,0)
 const today=campusDate(new Date(now)),tomorrow=campusDate(new Date(Date.parse(today+'T12:00:00+08:00')+86400000))
 const hosted=liveActivities(live.data).filter(item=>item.local?.ownerId===live.data?.account.id)
 const choose=(key:'kind'|'range',value:string)=>{const next=new URLSearchParams(params);next.set(key,value);setParams(next,{replace:true});setLimit(24)}
 const dayLabel=(day:string)=>day==='undated'?uiText('时间待确认'):`${day===today?uiText('今天')+' · ':day===tomorrow?uiText('明天')+' · ':''}${new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',...(day.slice(0,4)!==today.slice(0,4)?{year:'numeric' as const}:{}),month:'long',day:'numeric',weekday:'short'}).format(new Date(day+'T12:00:00+08:00'))}`
 const time=(value:string)=>new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value))
 const openCourse=(event:MouseEvent<HTMLAnchorElement>,item:StudentScheduleItem)=>{if(item.lessonId&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey){event.preventDefault();setCourse({id:item.lessonId,origin:event.currentTarget.getBoundingClientRect().toJSON()})}}
 let rendered=0
 return <section className="student-arrangements" aria-label={uiText('我的安排')}>
  <div className="arrangements-intro"><span>MY AGENDA</span><h2>{uiText('安排清楚，从容出发')}</h2><p>{uiText('查看尚未结束的课程、截止任务与校园安排。')}</p></div>
  <div className="arrangements-tools"><nav aria-label={uiText('安排日期范围')}>{[['today','今天'],['week','未来7天'],['all','全部日期']].map(([key,label])=><button key={key} aria-pressed={range===key} onClick={()=>choose('range',key)}>{uiText(label)}</button>)}</nav><Link to="/v2/me?tab=timetable"><CalendarDays size={15}/>{uiText('完整课表')}<ArrowUpRight size={14}/></Link></div>
  <nav className="arrangements-filters" aria-label={uiText('安排类型')}>{arrangementFilters.map(value=><button key={value} aria-pressed={filter===value} onClick={()=>choose('kind',value)}>{uiText(value)}</button>)}</nav>
  <StudentCoffeeChanges/>
  {live.error&&<p role="alert">{live.error}</p>}{!live.data&&!live.error&&<p role="status">{uiText('正在读取本人安排…')}</p>}
  {live.data&&<p className="arrangements-count" role="status">{uiText(range==='today'?'今天':range==='week'?'未来7天':'全部日期')} · {count} {uiText('项安排')}</p>}
  {groups.map(group=>{const items=group.items.slice(0,Math.max(0,limit-rendered));rendered+=items.length;if(!items.length)return null;return <section className="arrangements-day" key={group.day}><h3>{dayLabel(group.day)}</h3><div>{items.map(item=>{const kind=arrangementKind(item),Icon=icons[kind],deadline=isDeadline(item),active=!deadline&&item.endAt&&Date.parse(item.startAt??'')<=now&&Date.parse(item.endAt)>now;const content=<><div className="arrangement-time"><time dateTime={item.startAt}>{item.startAt?time(item.startAt):'—'}</time>{item.startAt&&item.endAt&&!deadline&&campusDate(item.endAt)===campusDate(item.startAt!)&&<small>{time(item.endAt)}</small>}</div><span className="arrangement-kind-icon"><Icon size={17}/></span><div className="arrangement-copy"><span className="arrangement-kind">{uiText(kind)}{active&&<b>{uiText('进行中')}</b>}</span><strong title={item.title}>{deadline?deadlineTitle(item.title):item.title}</strong>{!deadline&&item.location&&<small><MapPin size={12}/>{item.location}</small>}{item.time&&<small><Clock size={12}/>{item.time}</small>}{deadline&&<small>{uiText('提交截止')}</small>}</div>{!deadline&&<ChevronRight size={16}/>}</>;return deadline?<article key={item.id} className="arrangement-card" data-kind={kind}>{content}</article>:<Link key={item.id} to={item.path} className="arrangement-card" data-kind={kind} onClick={event=>openCourse(event,item)}>{content}</Link>})}</div></section>})}
  {live.data&&!count&&<div className="arrangements-empty"><CalendarDays size={30}/><h3>{uiText('这段时间暂无相关安排')}</h3><p>{uiText('可以切换类型，或查看全部日期。')}</p><button onClick={()=>{const next=new URLSearchParams(params);next.delete('kind');next.set('range','all');setParams(next,{replace:true});setLimit(24)}}>{uiText('查看全部安排')}</button></div>}
  {count>limit&&<button className="arrangements-more" onClick={()=>setLimit(value=>value+24)}>{uiText('继续查看')} · {count-limit}<ChevronRight size={15}/></button>}
  {!!hosted.length&&<details className="arrangements-hosted"><summary>{uiText('我主办的活动')} <span>{hosted.length}</span></summary>{hosted.map(item=><Link key={item.id} to={`/v2/activities/${item.id}`}><span><strong>{item.title}</strong><small>{uiText(item.local?.status==='published'?'已发布':'查看活动状态')}</small></span><ChevronRight size={15}/></Link>)}</details>}
  {course&&<StudentTimetable initialWorkspace={live.data??undefined} detailOnly initialLessonId={course.id} origin={course.origin} onCloseDetails={()=>setCourse(null)}/>}
 </section>
}
