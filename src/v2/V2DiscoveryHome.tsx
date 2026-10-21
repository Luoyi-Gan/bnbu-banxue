import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { ArrowRight, CalendarDays, Coffee, GraduationCap, MapPin, MessageCircle, Search, UsersRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { liveActivities } from './liveActivities'
import { liveStudentSchedule } from './liveStudentSchedule'
import { SectionHeading } from './ui'
import { sportsProgressLabel } from '../../shared/v2/sportsProgress'
import campusHome from '../assets/campus/home-background.jpg'
import campusEvening from '../assets/campus/evening-campus.jpg'
import campusServices from '../assets/campus/campus-services.jpg'

const slides = [campusHome, campusEvening, campusServices]
const shortcuts = [
  { label: '校园活动', hint: '丰富此刻', path: '/v2/activities', icon: CalendarDays, tone: 'blue' },
  { label: '师生交流', hint: '聊聊未来', path: '/v2/coffee', icon: GraduationCap, tone: 'green' },
  { label: '社团组织', hint: '遇见同好', path: '/v2/organizations', icon: UsersRound, tone: 'orange' },
  { label: '校园生活', hint: '分享日常', path: '/v2/community', icon: MessageCircle, tone: 'purple' },
  { label: '校园指南', hint: '探索校园', path: '/v2/campus/explore', icon: MapPin, tone: 'pink' },
]

export function V2Home() { useUiLanguage();
  const live = useWorkspaceBackend(30000)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => { if (!document.hidden) setSlide(value => (value + 1) % slides.length) }, 6000)
    return () => window.clearInterval(timer)
  }, [])
  const activities = liveActivities(live.data).filter(item => item.local?.status === 'published').sort((a, b) => Number(Date.parse(b.endAt ?? b.startAt) > Date.now()) - Number(Date.parse(a.endAt ?? a.startAt) > Date.now()) || Date.parse(b.startAt) - Date.parse(a.startAt)).slice(0, 3)
  const next = liveStudentSchedule(live.data)[0]
  const progress = live.data?.sportsStatus === 'available' && live.data.sports?.role === 'student' ? live.data.sports.progress : null
  const percent = typeof progress?.percent === 'number' && Number.isFinite(progress.percent) ? Math.max(0, Math.min(100, progress.percent)) : null
  const search = (event: FormEvent) => { event.preventDefault(); navigate(`/v2/activities?q=${encodeURIComponent(query.trim())}`) }
  return <div className="v2-page reference-home">
    <section className="reference-hero" aria-label={uiText("校园照片轮播")}>
      {slides.map((image, index) => <img src={image} alt={index === 0?uiText('校园建筑与树木'):index === 1?uiText('傍晚的校园'):uiText('校园公共空间')} key={image} className={slide === index?'is-active':''} aria-hidden={slide !== index}/>)}
      <div className="reference-hero-copy"><span>{uiText("在 BNBU，让每一天都有新发现")}</span><h1>{uiText("发现校园里的")}<br/>{uiText("精彩活动与有趣的人")}</h1><p>{uiText("参与活动 · 结识伙伴 · 探索更大的校园")}</p></div>
      <div className="reference-slide-dots">{slides.map((_, index) => <button type="button" key={index} aria-label={uiTemplate(["显示第 "," 张校园照片"],index + 1)} aria-pressed={slide === index} onClick={() => setSlide(index)}/>)}</div>
      <form className="reference-home-search" onSubmit={search}><Search size={19}/><input value={query} onChange={event => setQuery(event.target.value)} aria-label={uiText("搜索校园活动")} placeholder={uiText("搜索活动、地点或主办方")}/><button type="submit" aria-label={uiText("搜索活动")}><ArrowRight size={19}/></button></form>
    </section>
    <nav className="reference-shortcuts" aria-label={uiText("校园快捷入口")}>{shortcuts.map(({ label, hint, path, icon: Icon, tone }) => <Link to={path} key={path}><span className={`reference-icon tone-${tone}`}><Icon size={23}/></span><strong>{uiText(label)}</strong><small>{uiText(hint)}</small></Link>)}</nav>
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    <section className="reference-section"><SectionHeading title={uiText("校园精选")} action={<Link to="/v2/activities">{uiText("更多活动")}<ArrowRight size={14}/></Link>}/>
      <div className="reference-activity-grid">{activities.map(item => <Link to={`/v2/activities/${encodeURIComponent(item.id)}`} state={{from:"/v2"}} key={item.id} className="reference-activity-card"><div><img src={item.image} alt={item.isDefaultCover?uiText('校园通用封面'):uiTemplate(["","封面"],item.title)}/><span>{Date.parse(item.endAt ?? item.startAt) <= Date.now()?uiText('往期活动'):item.category}</span></div><h3>{item.title}</h3><small><CalendarDays size={12}/>{new Date(item.startAt).toLocaleString(uiLocale(), { month:'long',day:'numeric',hour:'2-digit',minute:'2-digit' })}</small><small><MapPin size={12}/>{item.location}</small></Link>)}</div>
      {!activities.length && <div className="reference-empty"><CalendarDays size={27}/><strong>{live.data?uiText('新的校园活动，正在路上'):uiText('正在读取校园活动…')}</strong><p>{uiText("活动发布后，会在这里与你见面。")}</p></div>}
    </section>
    <div className="reference-feature-grid"><Link className="reference-coffee-card" to="/v2/coffee"><span><Coffee size={21}/><strong>Coffee Chat</strong><ArrowRight size={16}/></span><h3>{uiText("和老师聊聊")}<br/>{uiText("每一种可能")}</h3><p>{uiText("选一位老师，约一段交流时光。")}</p><Coffee className="reference-coffee-art" size={78} strokeWidth={1}/></Link><Link className="reference-sport-card" to="/v2/sports"><span><strong>{uiText("运动打卡")}</strong><ArrowRight size={16}/></span><div className="reference-progress-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/>{percent !== null && percent > 0 && <circle cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${percent} 100`}/>}</svg><strong>{percent === null?'—':`${Math.floor(percent)}%`}</strong></div><p>{progress?sportsProgressLabel(progress):live.data?.sportsStatus === 'not-enrolled'?uiText('暂无体育课程'):uiText('进度暂不可用')}</p><small>{uiText("本学期运动进度")}</small></Link></div>
    {next && <section className="reference-section"><SectionHeading title={uiText("接下来")} /><Link className="reference-next" to={next.path} state={{from:"/v2"}}><CalendarDays size={21}/><span><strong>{next.title}</strong><small>{next.startAt?new Date(next.startAt).toLocaleString(uiLocale(), {month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}):next.time} · {next.location}</small></span><ArrowRight size={16}/></Link></section>}
    <Link className="reference-campus-more" to="/v2/campus">{uiText("校园服务与更多可能")}<ArrowRight size={16}/></Link>
  </div>
}
