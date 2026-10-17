import { ArrowRight, Bell, BookOpen, CalendarDays, ChevronRight, Coffee, Compass, MapPin, MessageCircle, Sparkles, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { liveActivities } from './liveActivities'
import { liveStudentSchedule } from './liveStudentSchedule'
import { showNoticeBadge } from './notificationPreferences'
import { SectionHeading } from './ui'
import campusHome from '../assets/campus/home-background.jpg'
import campusEvening from '../assets/campus/evening-campus.jpg'
import campusServices from '../assets/campus/campus-services.jpg'
import companion from '../assets/companion-yellow.png'

const slides = [campusHome, campusEvening, campusServices]
const services = [
  { title: '我的课表', path: '/v2/campus?service=teaching', icon: BookOpen },
  { title: '校园日程', path: '/v2/schedule', icon: CalendarDays },
  { title: '社团组织', path: '/v2/organizations', icon: UsersRound },
  { title: '校园地图', path: '/v2/campus/explore', icon: MapPin },
  { title: '找搭子', path: '/v2/partners', icon: Compass },
  { title: 'Coffee Chat', path: '/v2/coffee', icon: Coffee },
  { title: '我的会话', path: '/v2/messages', icon: MessageCircle },
  { title: '更多服务', path: '/v2/campus', icon: Sparkles },
]

export function CampusServiceLinks() {
  return <nav className="campus-service-grid" aria-label="校园服务">{services.map(({title,path,icon:Icon}, index) => <Link to={path} key={path}><span className={`campus-pastel pastel-${index % 4}`}><Icon size={21}/></span><span>{title}</span></Link>)}</nav>
}

export function CampusAssistantLink() {
  return <Link to="/v2/ai" className="campus-assistant"><div><strong>与 AI 一起，更好地校园生活</strong><p>校园问答 · 信息查询 · 探索校园</p></div><img src={companion} alt=""/><ChevronRight size={18}/></Link>
}

export function CampusReferenceHome() {
  const live = useWorkspaceBackend(30000)
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => { if (!document.hidden) setSlide(value => (value + 1) % slides.length) }, 6000)
    return () => window.clearInterval(timer)
  }, [])
  const now = new Date()
  const schedule = liveStudentSchedule(live.data)
  const today = schedule.filter(item => item.startAt && new Date(item.startAt).toDateString() === now.toDateString())
  const account = live.data?.account
  const profile = live.data?.entities.find(item => item.kind === 'profile' && item.ownerId === account?.id)
  const name = String(profile?.data.nickname || account?.name || '同学')
  const greeting = now.getHours() < 11 ? '早上好' : now.getHours() < 14 ? '中午好' : now.getHours() < 18 ? '下午好' : '晚上好'
  const progress = live.data?.sportsStatus === 'available' && live.data.sports?.role === 'student' ? live.data.sports.progress : null
  const percent = typeof progress?.percent === 'number' && Number.isFinite(progress.percent) ? Math.max(0, Math.min(100, progress.percent)) : null
  const unread = live.data?.notifications.filter(item => showNoticeBadge(live.data, item)).length
  const activities = liveActivities(live.data).filter(item => item.local?.status === 'published' && Date.parse(item.endAt ?? item.startAt) > now.getTime()).sort((a,b) => Date.parse(a.startAt) - Date.parse(b.startAt)).slice(0,2)
  return <div className="v2-page campus-reference-home">
    <section className="campus-photo-hero" aria-label="校园照片轮播">
      {slides.map((src,index) => <img src={src} key={src} alt={index === 0 ? '校园建筑与绿树' : index === 1 ? '校园夕阳' : '校园公共空间'} className={slide === index ? 'is-active' : ''} aria-hidden={slide !== index}/>)}
      <div className="campus-photo-copy"><h1>在这里，<br/>遇见更大的校园生活。</h1><span>A BRIGHTER<br/>CAMPUS LIFE</span></div>
      <div className="campus-photo-controls">{slides.map((_,index) => <button type="button" key={index} aria-label={`显示第 ${index + 1} 张校园照片`} aria-pressed={slide === index} onClick={() => setSlide(index)}/>)}<span>{slide + 1} / {slides.length}</span></div>
    </section>
    <section className="campus-today"><header><div><h2>{greeting}，{name}</h2><p>新的一天，也要好好生活。</p></div><time dateTime={now.toISOString()}>{now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'short'})}</time></header>
      <div className="campus-today-grid"><Link to="/v2/schedule"><span className="campus-pastel pastel-2"><CalendarDays size={24}/></span><strong>今日安排 <b>{live.data ? today.length : '—'}</b></strong><ChevronRight size={15}/></Link><Link to="/v2/sports"><span className="campus-mini-ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18"/>{percent !== null && <circle cx="22" cy="22" r="18" pathLength="100" strokeDasharray={`${percent} 100`}/>}</svg><small>{percent === null ? '—' : `${Math.floor(percent)}%`}</small></span><strong>体育打卡</strong><ChevronRight size={15}/></Link><Link to="/v2/messages?view=notifications"><span className="campus-pastel pastel-1"><Bell size={24}/></span><strong>未读通知 <b>{unread ?? '—'}</b></strong><ChevronRight size={15}/></Link></div>
    </section>
    {live.error && <p role="alert">{live.error}</p>}
    <section className="campus-home-section"><SectionHeading title="接下来" detail="校园里的下一步" action={<Link to="/v2/schedule">全部日程 <ChevronRight size={15}/></Link>}/><div className="campus-agenda">{schedule.slice(0,2).map(item => <Link to={item.path} key={item.id}><time>{item.startAt ? new Date(item.startAt).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'}) : '待商定'}<small>{item.startAt ? new Date(item.startAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}) : ''}</small></time><div><strong>{item.title}</strong><small><MapPin size={12}/>{item.location || '地点待确认'}</small></div><ChevronRight size={16}/></Link>)}{!schedule.length && <p className="campus-quiet">{live.data ? '暂时没有近期安排，去发现感兴趣的活动吧。' : live.error ? '日程暂不可用，请稍后重试。' : '正在读取你的日程…'}</p>}</div></section>
    <section className="campus-home-section"><SectionHeading title="为你推荐" detail="活动 · 机会" action={<Link to="/v2/activities">更多 <ChevronRight size={15}/></Link>}/><div className="campus-featured-activities">{activities.map(item => <Link to={`/v2/activities/${encodeURIComponent(item.id)}`} state={{from:'/v2'}} className="campus-event-card" key={item.id}><div><img src={item.image} alt={item.isDefaultCover ? '校园通用封面' : `${item.title}封面`}/><span>{item.category}</span></div><section><h3>{item.title}</h3><p><CalendarDays size={14}/>{new Date(item.startAt).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p><p><MapPin size={14}/>{item.location}</p></section></Link>)}</div>{!activities.length && <Link className="campus-discover-invite" to="/v2/activities"><Compass size={25}/><span><strong>发现校园的更多可能</strong><small>{live.data ? '看看活动、组织与同学们的分享' : '进入发现，查看校园内容'}</small></span><ArrowRight size={18}/></Link>}</section>
    <section className="campus-home-section"><SectionHeading title="校园服务" detail="常用功能" action={<Link to="/v2/campus">更多 <ChevronRight size={15}/></Link>}/><CampusServiceLinks/></section>
    <CampusAssistantLink/>
  </div>
}
