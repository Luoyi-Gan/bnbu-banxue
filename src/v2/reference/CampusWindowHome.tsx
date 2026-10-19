import { uiText, uiTemplate, useUiLanguage , uiLocale } from '../uiLanguage'
import {useDevicePreferences} from '../devicePreferences'
import { ArrowRight, Bell, ChevronLeft, ChevronRight, MapPin, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DisplayAvatar } from '../DisplayAvatar'
import { StudentSearch } from '../StudentSearch'
import { useCommunityBackend } from '../useCommunityBackend'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { liveStudentSchedule } from '../liveStudentSchedule'
import { liveActivities } from '../liveActivities'
import { filterActivityItems } from '../activityFilters'
import { showNoticeBadge } from '../notificationPreferences'
import type { StudentScheduleItem } from '../studentSchedule'
import { AssistantBanner, EmptyNote, EventCard, Feedback, Organizations, Section, Services, Stories } from './components'
import { campusDate, sportsSummary } from './model'
import { campusPhotographs as photographs } from '../campusPhotographs'
import './campusWindow.css'

function CampusWindow({ greeting, name }: { greeting: string; name: string }) { useUiLanguage();
  const device=useDevicePreferences()
  const stopAutoplay=!device.preferences.photoAutoplay||device.reducedMotion
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [inView, setInView] = useState(true)
  const windowRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!windowRef.current) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(windowRef.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || reduced || stopAutoplay || !inView) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setSlide(current => (current + 1) % photographs.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, reduced, stopAutoplay, inView])
  const dateFormat = new Intl.DateTimeFormat(uiLocale(), { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', weekday: 'short' })
  const date = new Date()
  return <section className="cw-window" aria-label={uiText("校园窗口")} ref={windowRef}>
    <time className="cw-date" aria-label={dateFormat.format(date)}>{dateFormat.formatToParts(date).map((part, index) => <span key={index} className={part.type === 'month' || part.type === 'day'?'cw-date-number':undefined}>{part.value}</span>)}</time>
    <div className="cw-greeting" aria-label={`${uiText(greeting)}，${name}`}>
      <span className="cw-hello">{uiText(greeting)}，</span>
      <span className="cw-name" title={name}>{name}</span>
    </div>
    <div className="cw-scene">
      {photographs.map((photo, index) => (index === slide || (!stopAutoplay && (index === (slide + 1) % photographs.length || index === (slide + photographs.length - 1) % photographs.length))) && <img key={photo.source} src={photo.source} alt={uiText(photo.alt)} style={{objectPosition:photo.position}} className={slide === index?'is-active':''} aria-hidden={slide !== index} decoding="async" fetchPriority={index === slide?'high':'low'}/>)}
      <div className="cw-photo-controls">
        <div role="group" aria-label={uiText("校园照片")}>
          <button type="button" aria-label={uiText("上一张校园照片")} onClick={() => {setSlide(current => (current + photographs.length - 1) % photographs.length);setPaused(true)}}><ChevronLeft size={16}/></button>
          <span className="cw-photo-count" aria-label={uiTemplate(["第 "," 张，共 "," 张校园照片"],slide + 1,photographs.length)}>{slide + 1} / {photographs.length}</span>
          <button type="button" aria-label={uiText("下一张校园照片")} onClick={() => {setSlide(current => (current + 1) % photographs.length);setPaused(true)}}><ChevronRight size={16}/></button>
        </div>
        {!reduced && !stopAutoplay && <button type="button" aria-label={paused?uiText('播放校园照片轮播'):uiText('暂停校园照片轮播')} onClick={() => setPaused(current => !current)}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>}
      </div>
    </div>
  </section>
}

function ScheduleTime({ item }: { item: StudentScheduleItem }) { useUiLanguage();
  if (!item.startAt) return <time className="cw-schedule-time">{uiText("待商定")}</time>
  return <time className="cw-schedule-time" dateTime={item.startAt}>
    {new Intl.DateTimeFormat(uiLocale(), { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' }).format(new Date(item.startAt))}
    <small>{new Intl.DateTimeFormat(uiLocale(), { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric' }).format(new Date(item.startAt))}</small>
  </time>
}

/** Student homepage using the existing authenticated workspace and object routes. */
export function CampusWindowHome() { useUiLanguage();
  const live = useWorkspaceBackend(30000)
  const community = useCommunityBackend()
  const data = live.data
  const profile = data?.entities.find(entity => entity.kind === 'profile' && entity.ownerId === data.account.id)
  const name = String(profile?.data.nickname || data?.account.name || '同学')
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', hourCycle: 'h23' }).format(new Date()))
  const greeting = uiText(hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好')
  const schedule = liveStudentSchedule(data)
  const [next, following] = schedule.slice(0, 2)
  const today = schedule.filter(item => item.startAt && campusDate(item.startAt) === campusDate()).length
  const unread = data?.notifications.filter(notice => showNoticeBadge(data, notice)).length
  const { percent } = sportsSummary(data)
  const sportsNote = uiText(!data ? '读取中' : data.sportsStatus === 'not-enrolled' ? '尚未入班' : percent === null ? '待同步' : '本学期')
  const events = filterActivityItems(liveActivities(data), { query: '', category: '全部', period: '全部时间', host: '全部主办方', status: '未结束', sort: '时间最近' }, data?.account.id ?? '').slice(0, 2)

  return <div className="ref-page cw-home">
    <header className="cw-header"><h1>{uiText("会同里")}</h1><nav aria-label={uiText("首页工具")}>
      <StudentSearch/>
      <Link to="/v2/messages?view=notifications" className="cw-notification" aria-label={uiTemplate(["通知",""],uiText(unread ? `，${unread}条未读` : ''))}><Bell size={22}/>{!!unread && <i/>}</Link>
      <Link to="/v2/settings" className="cw-profile" aria-label={uiText("个人设置")}><DisplayAvatar name={name} avatar={String(profile?.data.avatar || '')} personId={data?.account.id || 'self'} className="cw-avatar"/></Link>
    </nav></header>

    <div className="cw-intro">
      <CampusWindow greeting={uiText(greeting)} name={name}/>
      <div className="cw-focus">
        {next?<Link to={next.path} className="cw-next">
          <div className="cw-next-top"><span><i/>{uiText("下一项安排")}</span><ArrowRight size={22}/></div>
          <h2>{next.title}</h2>
          <div className="cw-next-meta"><ScheduleTime item={next}/><div><span><MapPin size={14}/>{next.location || uiText('地点待商定')}</span><small>{uiText(next.label)}</small>{!next.startAt && next.time && <small>{next.time}</small>}</div></div>
        </Link>:<section className="cw-next cw-next-empty" aria-busy={!data && !live.error}>
          <span className="cw-next-top">{uiText("下一项安排")}</span>
          <h2>{live.error?uiText('安排暂时无法读取'):data?uiText('留一点时间，去看看校园。'):uiText('正在读取你的安排…')}</h2>
          {live.error ? <button type="button" onClick={() => void live.refresh()}>{uiText("重新读取")}<ArrowRight size={16}/></button> : data ? <Link to="/v2/schedule">{uiText("查看我的日程")}<ArrowRight size={16}/></Link> : <p role="status">{uiText("正在读取个人日程")}</p>}
        </section>}
        {following && <Link to={following.path} className="cw-following"><ScheduleTime item={following}/><div><strong>{following.title}</strong><span>{following.location || uiText('地点待商定')} · {uiText(following.label)}</span>{!following.startAt && following.time && <span>{following.time}</span>}</div><ChevronRight size={17}/></Link>}
      </div>
      <Feedback live={live}/>
      <nav className="cw-summary" aria-label={uiText("今日摘要")}>
        <Link to="/v2/schedule"><span>{uiText("今日安排")}</span><strong>{data?today:'—'}{data && <small>{uiText("项")}</small>}</strong></Link>
        <Link to="/v2/messages?view=notifications"><span>{uiText("未读通知")}</span><strong>{unread ?? '—'}{data && <small>{uiText("条")}</small>}</strong></Link>
        <Link to="/v2/sports"><span>{uiText("体育进度")}</span><strong>{percent === null?'—':`${Math.round(percent)}%`}<small>{uiText(sportsNote)}</small></strong></Link>
      </nav>
    </div>

    <div className="cw-content-grid">
      <div className="cw-recommendations"><Section title={uiText("校园新鲜事")} hint={uiText("为你推荐")} to="/v2/activities"><div className="cw-event-list">{events.map(item => <EventCard key={item.id} item={item} live={live} row/>)}</div>{!events.length && <EmptyNote to="/v2/activities">{data?uiText('下一场校园活动，等你来发现。'):uiText('正在读取校园活动…')}</EmptyNote>}</Section></div>
      <div className="cw-services"><Section title={uiText("校园随手可达")} to="/v2/campus"><Services/></Section><AssistantBanner/></div>
      <div className="cw-stories"><Section title={uiText("校园里的声音")} hint={uiText("来自同学们的分享")} to="/v2/community"><Stories community={community}/></Section></div>
      <div className="cw-organizations"><Section title={uiText("一起，让校园更有意思")} hint={uiText("你可能感兴趣的组织")} to="/v2/organizations"><Organizations live={live}/></Section></div>
    </div>
    <footer className="cw-footer"><span>{uiText("会同里")}</span><p>{uiText("今天，也在校园里发现一点新的可能。")}</p><Link to="/v2/campus/explore">{uiText("去校园走走")}<ArrowRight size={15}/></Link></footer>
  </div>
}
