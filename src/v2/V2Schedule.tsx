import {schedulePreferences,validSemesterStart} from '../../shared/v2/schedulePreferences'
import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Coffee, MapPin, Plus, Search, UsersRound } from 'lucide-react'
import { useEffect,useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { liveStudentSchedule } from './liveStudentSchedule'
import { liveActivities } from './liveActivities'
import { shanghaiDate } from '../live/sportsDashboardModel'
import { StudentTimetable } from './StudentTimetable'
import { StudentCoffeeChanges } from './TeacherPortal'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'

export function V2Schedule() { useUiLanguage();
  const live = useWorkspaceBackend(30000)
  const [params, setParams] = useSearchParams()
  const requestedDay = params.get('day') ?? ''
  const day = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay) && shanghaiDate(requestedDay + 'T12:00:00+08:00') === requestedDay ? requestedDay : shanghaiDate(Date.now())
  const setDay = (value: string) => setParams({day:value})
  const view = params.get('tab') === 'timetable' ? 'timetable' : params.get('tab')==='upcoming'?'upcoming':'schedule'
  const setView = (value: string) => setParams({day,tab:value})
  const returnPath = `/v2/schedule?${params}`
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const anchor = Date.parse(`${day}T12:00:00+08:00`)
  const weekday = new Date(anchor).getUTCDay() || 7
  const days = Array.from({length: 7}, (_, i) => shanghaiDate(anchor + (i + 1 - weekday) * 86400000))
  const agendaPreferences=schedulePreferences(live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data)
  const [semesterDraft,setSemesterDraft]=useState<string|null>(null)
  const semesterStart=semesterDraft??agendaPreferences.semesterStartDate
  const saveSemester=async()=>{
    if(semesterStart&&!validSemesterStart(semesterStart)){setFeedback('请选择学期第一周的周一。');return}
    if(await live.mutate('preferences.schedule',{semesterStartDate:semesterStart})){setSemesterDraft(null);setFeedback(semesterStart?'学期日期已保存，课程已按周次加入安排。':'学期日期已清除，课程暂不加入安排。')}
  }
  const [now,setNow]=useState(Date.now)
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[])
  const schedule = liveStudentSchedule(live.data,now)
  const dated = schedule.filter(item => item.startAt && (view==='upcoming'||shanghaiDate(item.startAt) === day))
  const undated = schedule.filter(item => !item.startAt)
  const activities = liveActivities(live.data).filter(item => item.local?.status === 'published' && Date.parse(item.endAt ?? item.startAt) > Date.now())
  const featured = activities.find(item => live.data?.relations.some(relation => relation.entityId === item.id && relation.kind === 'participate')) ?? activities[0]
  const changeWeek = (offset: number) => setDay(shanghaiDate(anchor + offset * 7 * 86400000))
  const add = async (id: string) => { if (await live.mutate('relation.set', {id, kind:'participate', enabled:true})) setFeedback('已加入我的安排。参与标记不占用活动名额。') }
  return <div className="v2-page reference-schedule"><PageHeading eyebrow="MY DAYS" title={uiText(view==='timetable'?"我的课表":"我的安排")} description={view==='timetable'?undefined:uiText("让每一次参与，都在日历里相遇。")} action={view!=='timetable'&&<button className="v2-button v2-button-primary" onClick={() => {setAdding(true); setFeedback('')}}><Plus size={17}/> {uiText("添加活动")}</button>}/>
    <div className="v2-tabs"><button className={view === 'upcoming'?'is-active':''} onClick={()=>setView('upcoming')}>{uiText('全部安排')}</button><button className={view === 'schedule'?'is-active':''} onClick={() => setView('schedule')}>{uiText("校园日程")}</button><button className={view === 'timetable'?'is-active':''} onClick={() => setView('timetable')}>{uiText("我的课表")}</button></div>
    {view!=='timetable'&&<section className="schedule-term-settings"><label>{uiText('课程校历')}<select aria-label={uiText('课程校历')} value={agendaPreferences.academicCalendar} disabled={live.busy||!live.data} onChange={event=>{setSemesterDraft(null);setFeedback('');void live.mutate('preferences.schedule',{academicCalendar:event.target.value})}}><option value="bnbu-2026-s1">{uiText('学校校历 · 2026/27 第一学期')}</option><option value="custom">{uiText('手动设置其他学期')}</option></select></label>
      {agendaPreferences.academicCalendar==='custom'?<><label>{uiText('学期第一周的周一')}<input type="date" aria-label={uiText('学期第一周日期')} value={semesterStart} disabled={live.busy} onChange={event=>{setSemesterDraft(event.target.value);setFeedback('')}}/></label><button className="v2-button v2-button-secondary" disabled={live.busy||!live.data} onClick={()=>void saveSemester()}>{uiText(live.busy?'保存中…':'保存学期日期')}</button><small>{uiText('课程严格按单双周和周次范围展示；未设置日期、周次或时间不明确的课程暂不加入。')}</small></>:<small>{uiText('9月1日开课，12月11日常规授课结束；按校历教学周、假期及补课安排计算，阅读周不展示常规课程。校历若有调整，请以学校最新通知为准。')}</small>}
    </section>}
    {feedback&&<p role="status">{uiText(feedback)}</p>}
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    {view === 'timetable'?<StudentTimetable embedded/>:<>
      <div className="cw-schedule-layout"><aside className="cw-schedule-calendar"><section className="reference-calendar" aria-label={uiText("周日历")}><header><strong>{day.slice(0, 4)} {uiText("年")}{Number(day.slice(5, 7))} {uiText("月")}</strong><div><button aria-label={uiText("上一周")} onClick={() => changeWeek(-1)}><ChevronLeft size={17}/></button><button onClick={() => setDay(shanghaiDate(Date.now()))}>{uiText("今天")}</button><button aria-label={uiText("下一周")} onClick={() => changeWeek(1)}><ChevronRight size={17}/></button></div></header><div className="reference-week">{days.map((date, index) => <button key={date} aria-label={uiTemplate([""," 星期",""],date,'一二三四五六日'[index])} aria-pressed={date === day} className={date === day ? 'is-active' : ''} onClick={() => setDay(date)}><small>{uiText("周")}{'一二三四五六日'[index]}</small><strong>{Number(date.slice(8))}</strong><i className={schedule.some(item => item.startAt && shanghaiDate(item.startAt) === date) ? 'has-event' : ''}/></button>)}</div></section>
      {featured && <Link className="reference-schedule-cover" to={`/v2/activities/${encodeURIComponent(featured.id)}`} state={{from:returnPath}} style={{backgroundImage:`linear-gradient(90deg,#142e60b8,#142e6025),url(${featured.image})`}}><small>{uiText("校园活动")}</small><strong>{featured.title}</strong><span><MapPin size={14}/>{featured.location}<ChevronRight size={18}/></span></Link>}
      </aside><div className="cw-schedule-agenda"><StudentCoffeeChanges/>
      <p className="v2-form-note">{uiText('展示已标记参与的活动、已确认的交流、组队及当前课表学期内符合周次的课程。时间未确定的安排单独列出。')}</p>
      <section className="reference-section"><SectionHeading title={view==='upcoming'?uiText('接下来的安排'):day === shanghaiDate(Date.now())?uiText('今日日程'):uiTemplate([""," 月 "," 日日程"],Number(day.slice(5,7)),Number(day.slice(8)))} detail={uiTemplate([""," 项安排"],dated.length)}/><div className="reference-timeline">{dated.map(item => <Link to={item.path} state={{from:returnPath}} key={item.id}><time>{view==='upcoming'&&<small>{shanghaiDate(item.startAt!).slice(5)} </small>}{new Date(item.startAt!).toLocaleTimeString(uiLocale(),{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'})}</time><i/><span className={`reference-icon tone-${item.kind === 'coffee' ? 'orange' : 'blue'}`}>{item.kind === 'coffee' ? <Coffee size={20}/> : <CalendarDays size={20}/>}</span><span><strong>{item.title}</strong><small>{item.location}</small></span><em>{uiText(item.label)}</em></Link>)}</div>{!dated.length && <Empty icon={CalendarDays} title={live.data?uiText(view==='upcoming'?'近期暂无已确定时间的安排':'这一天，留一点自由时间'):uiText('正在读取日程…')} description={uiText("已标记的活动、课程和已确认的交流会出现在这里。")}/>}</section>
      {undated.length > 0 && <section className="reference-section"><SectionHeading title={uiText("时间待商定")}/><div className="reference-timeline">{undated.map(item => <Link key={item.id} to={item.path}><UsersRound size={20}/><span><strong>{item.title}</strong><small>{item.time} · {item.location}</small></span><ChevronRight size={16}/></Link>)}</div></section>}
    </div></div></>}
    {adding && <Modal title={uiText("添加活动到我的安排")} onClose={() => setAdding(false)}><p className="v2-form-note">{uiText("选择想参与的活动，标记后会同步到日程。")}</p><label className="reference-inline-search"><Search size={18}/><input aria-label={uiText("搜索可添加活动")} placeholder={uiText("搜索活动")} value={query} onChange={event => setQuery(event.target.value)}/></label>{feedback && <p role="status" className="reference-feedback">{feedback}</p>}{live.error && <p role="alert">{uiText(live.error)}</p>}<div className="reference-add-list">{activities.filter(item => item.title.includes(query.trim())).map(item => { const saved = live.data?.relations.some(relation => relation.entityId === item.id && relation.kind === 'participate'); return <article key={item.id}><span><strong>{item.title}</strong><small>{new Date(item.startAt).toLocaleString(uiLocale())} · {item.location}</small></span><button aria-label={uiTemplate(["","：",""],uiText(saved ? '已添加' : '添加'),item.title)} className="v2-button v2-button-primary" disabled={saved || live.busy} onClick={() => void add(item.id)}>{saved?<Check size={17}/>:<Plus size={17}/>} {saved?uiText('已添加'):uiText('添加')}</button></article>})}</div>{!activities.filter(item => item.title.includes(query.trim())).length && <Empty icon={CalendarDays} title={uiText("暂无匹配的可参与活动")}/>}</Modal>}
  </div>
}
