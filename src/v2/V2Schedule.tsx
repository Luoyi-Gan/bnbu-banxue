import { CalendarDays, Check, ChevronLeft, ChevronRight, Coffee, MapPin, Plus, Search, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { liveStudentSchedule } from './liveStudentSchedule'
import { liveActivities } from './liveActivities'
import { shanghaiDate } from '../live/sportsDashboardModel'
import { StudentTimetable } from './StudentTimetable'
import { StudentCoffeeChanges } from './TeacherPortal'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'

export function V2Schedule() {
  const live = useWorkspaceBackend(30000)
  const [params, setParams] = useSearchParams()
  const requestedDay = params.get('day') ?? ''
  const day = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay) && shanghaiDate(requestedDay + 'T12:00:00+08:00') === requestedDay ? requestedDay : shanghaiDate(Date.now())
  const setDay = (value: string) => setParams({day:value})
  const view = params.get('tab') === 'timetable' ? 'timetable' : 'schedule'
  const setView = (value: string) => setParams({day,tab:value})
  const returnPath = `/v2/schedule?${params}`
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const anchor = Date.parse(`${day}T12:00:00+08:00`)
  const weekday = new Date(anchor).getUTCDay() || 7
  const days = Array.from({length: 7}, (_, i) => shanghaiDate(anchor + (i + 1 - weekday) * 86400000))
  const schedule = liveStudentSchedule(live.data)
  const dated = schedule.filter(item => item.startAt && shanghaiDate(item.startAt) === day)
  const undated = schedule.filter(item => !item.startAt)
  const activities = liveActivities(live.data).filter(item => item.local?.status === 'published' && Date.parse(item.endAt ?? item.startAt) > Date.now())
  const featured = activities.find(item => live.data?.relations.some(relation => relation.entityId === item.id && relation.kind === 'participate')) ?? activities[0]
  const changeWeek = (offset: number) => setDay(shanghaiDate(anchor + offset * 7 * 86400000))
  const add = async (id: string) => { if (await live.mutate('relation.set', {id, kind:'participate', enabled:true})) setFeedback('已加入我的安排。参与标记不占用活动名额。') }
  return <div className="v2-page reference-schedule"><PageHeading eyebrow="MY DAYS" title="我的安排" description="让每一次参与，都在日历里相遇。" action={<button className="v2-button v2-button-primary" onClick={() => {setAdding(true); setFeedback('')}}><Plus size={17}/> 添加活动</button>}/>
    <div className="v2-tabs"><button className={view === 'schedule' ? 'is-active' : ''} onClick={() => setView('schedule')}>校园日程</button><button className={view === 'timetable' ? 'is-active' : ''} onClick={() => setView('timetable')}>我的课表</button></div>
    {live.error && <p role="alert">{live.error}</p>}
    {view === 'timetable' ? <StudentTimetable/> : <>
      <section className="reference-calendar" aria-label="周日历"><header><strong>{day.slice(0, 4)} 年 {Number(day.slice(5, 7))} 月</strong><div><button aria-label="上一周" onClick={() => changeWeek(-1)}><ChevronLeft size={17}/></button><button onClick={() => setDay(shanghaiDate(Date.now()))}>今天</button><button aria-label="下一周" onClick={() => changeWeek(1)}><ChevronRight size={17}/></button></div></header><div className="reference-week">{days.map((date, index) => <button key={date} aria-label={`${date} 星期${'一二三四五六日'[index]}`} aria-pressed={date === day} className={date === day ? 'is-active' : ''} onClick={() => setDay(date)}><small>周{'一二三四五六日'[index]}</small><strong>{Number(date.slice(8))}</strong><i className={schedule.some(item => item.startAt && shanghaiDate(item.startAt) === date) ? 'has-event' : ''}/></button>)}</div></section>
      {featured && <Link className="reference-schedule-cover" to={`/v2/activities/${encodeURIComponent(featured.id)}`} state={{from:returnPath}} style={{backgroundImage:`linear-gradient(90deg,#142e60b8,#142e6025),url(${featured.image})`}}><small>校园活动</small><strong>{featured.title}</strong><span><MapPin size={14}/>{featured.location}<ChevronRight size={18}/></span></Link>}
      <StudentCoffeeChanges/>
      <section className="reference-section"><SectionHeading title={day === shanghaiDate(Date.now()) ? '今日日程' : `${Number(day.slice(5,7))} 月 ${Number(day.slice(8))} 日日程`} detail={`${dated.length} 项安排`}/><div className="reference-timeline">{dated.map(item => <Link to={item.path} state={{from:returnPath}} key={item.id}><time>{new Date(item.startAt!).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'})}</time><i/><span className={`reference-icon tone-${item.kind === 'coffee' ? 'orange' : 'blue'}`}>{item.kind === 'coffee' ? <Coffee size={20}/> : <CalendarDays size={20}/>}</span><span><strong>{item.title}</strong><small>{item.location}</small></span><em>{item.label}</em></Link>)}</div>{!dated.length && <Empty icon={CalendarDays} title={live.data ? '这一天，留一点自由时间' : '正在读取日程…'} description="已标记的活动和已确认的交流会出现在这里。"/>}</section>
      {undated.length > 0 && <section className="reference-section"><SectionHeading title="时间待商定"/><div className="reference-timeline">{undated.map(item => <Link key={item.id} to={item.path}><UsersRound size={20}/><span><strong>{item.title}</strong><small>{item.time} · {item.location}</small></span><ChevronRight size={16}/></Link>)}</div></section>}
    </>}
    {adding && <Modal title="添加活动到我的安排" onClose={() => setAdding(false)}><p className="v2-form-note">选择想参与的活动，标记后会同步到日程。</p><label className="reference-inline-search"><Search size={18}/><input aria-label="搜索可添加活动" placeholder="搜索活动" value={query} onChange={event => setQuery(event.target.value)}/></label>{feedback && <p role="status" className="reference-feedback">{feedback}</p>}{live.error && <p role="alert">{live.error}</p>}<div className="reference-add-list">{activities.filter(item => item.title.includes(query.trim())).map(item => { const saved = live.data?.relations.some(relation => relation.entityId === item.id && relation.kind === 'participate'); return <article key={item.id}><span><strong>{item.title}</strong><small>{new Date(item.startAt).toLocaleString('zh-CN')} · {item.location}</small></span><button aria-label={`${saved ? '已添加' : '添加'}：${item.title}`} className="v2-button v2-button-primary" disabled={saved || live.busy} onClick={() => void add(item.id)}>{saved ? <Check size={17}/> : <Plus size={17}/>} {saved ? '已添加' : '添加'}</button></article>})}</div>{!activities.filter(item => item.title.includes(query.trim())).length && <Empty icon={CalendarDays} title="暂无匹配的可参与活动"/>}</Modal>}
  </div>
}
