import {useEffect,useRef,useState,type MouseEvent} from 'react'
import {Link} from 'react-router-dom'
import {ArrowRight,BookOpen,CalendarDays,CheckCircle2,ChevronRight,Flag,MapPin} from 'lucide-react'
import {StudentUtilities} from '../StudentUtilities'
import {StudentSearch} from '../StudentSearch'
import {StudentTimetable} from '../StudentTimetable'
import {useDevicePreferences} from '../devicePreferences'
import {useWorkspaceBackend} from '../useWorkspaceBackend'
import {useCommunityBackend} from '../useCommunityBackend'
import {liveActivities} from '../liveActivities'
import {filterActivityItems} from '../activityFilters'
import {showNoticeBadge} from '../notificationPreferences'
import {schedulePreferences} from '../../../shared/v2/schedulePreferences'
import {homepageAgenda,courseClock,deadlineClock,deadlineTitle,isDeadline} from '../homeAgenda'
import {uiText,uiLocale,useUiLanguage} from '../uiLanguage'
import type {StudentScheduleItem} from '../studentSchedule'
import type {CardOrigin} from '../ui'
import {AssistantBanner,EmptyNote,EventCard,Feedback,Organizations,Section,Stories} from './components'
import {sportsSummary} from './model'
import {CampusHeroGallery} from '../CampusHeroGallery'
import './campusHome.css'
import './campusWindow.css'
import './restoredHome.css'

const shortcuts=[{title:'地图',path:'/v2/campus/explore',icon:MapPin},{title:'活动',path:'/v2/activities',icon:CalendarDays},{title:'社团',path:'/v2/organizations',icon:Flag},{title:'课表',path:'/v2/me?tab=timetable',icon:BookOpen}]
function HomeTime({item}:{item:StudentScheduleItem}){
 return <time className="home-row-time" dateTime={item.startAt}>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):uiText('待确认')}<small>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).format(new Date(item.startAt)):''}</small></time>
}
export function CampusWindowHome(){
 useUiLanguage()
 const live=useWorkspaceBackend(30000),community=useCommunityBackend(),device=useDevicePreferences()
 const [now,setNow]=useState(Date.now),[inView,setInView]=useState(true)
 const [allTasks,setAllTasks]=useState(false),[allPlans,setAllPlans]=useState(false)
 const [courseDetail,setCourseDetail]=useState<{id:string;origin:CardOrigin}|null>(null),hero=useRef<HTMLElement>(null)
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[])
 useEffect(()=>{if(!hero.current)return;const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));observer.observe(hero.current);return()=>observer.disconnect()},[])
 const data=live.data,agenda=homepageAgenda(data,now)
 const preferences=schedulePreferences(data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===data.account.id)?.data)
 const limit=preferences.homeScheduleCount
 const plans=allPlans?agenda.arrangements:agenda.arrangements.slice(0,limit),deadlines=allTasks?agenda.deadlines:agenda.deadlines.slice(0,Math.min(2,limit))
 const profile=data?.entities.find(item=>item.kind==='profile'&&item.ownerId===data.account.id)
 const name=String(profile?.data.nickname||data?.account.name||'同学')
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(new Date(now)))
 const greeting=hour<11?'早上好':hour<14?'中午好':hour<18?'下午好':'晚上好'
 const dateFormat=new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'})
 const unread=data?.notifications.filter(notice=>showNoticeBadge(data,notice)).length
 const {percent}=sportsSummary(data)
 const events=filterActivityItems(liveActivities(data),{query:'',category:'全部',period:'全部时间',host:'全部主办方',status:'未结束',sort:'时间最近'},data?.account.id??'').slice(0,2)
 const openCourse=(event:MouseEvent<HTMLAnchorElement>,item:StudentScheduleItem)=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&item.lessonId){event.preventDefault();setCourseDetail({id:item.lessonId,origin:event.currentTarget.getBoundingClientRect().toJSON()})}}
 return <div className="ref-page cw-home campus-home restored-home">
  <header className="cw-header campus-home-header"><h1>{uiText('会同里')}</h1><nav aria-label={uiText('首页工具')}><StudentSearch/><StudentUtilities/></nav></header>
  <section className="cw-window" ref={hero} aria-label={uiText('校园窗口')}>
   <div className="cw-hero-copy"><time className="cw-date" dateTime={new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now))} aria-label={dateFormat.format(new Date(now))}>{dateFormat.formatToParts(new Date(now)).map((part,index)=><span key={index} className={part.type==='month'||part.type==='day'?'cw-date-number':undefined}>{part.value}</span>)}</time>
   <div className="cw-greeting" aria-label={`${uiText(greeting)}，${name}`}><span className="cw-hello">{uiText(greeting)}，</span><span className="cw-name" title={name}>{name}</span></div></div>
   <div className="cw-scene"><CampusHeroGallery autoplay={!device.reducedMotion&&device.preferences.photoAutoplay&&inView}/></div>
  </section>
  {courseDetail&&<StudentTimetable initialWorkspace={data??undefined} detailOnly initialLessonId={courseDetail.id} origin={courseDetail.origin} onCloseDetails={()=>setCourseDetail(null)}/>}
  <div className="home-dashboard-body community-home"><Feedback live={live}/>
   <section className="home-planner" aria-label={uiText('课程与待办')}>
    <header className="home-planner-heading"><Link to="/v2/me?tab=events"><h2>{uiText('今日安排')}</h2><ChevronRight size={17}/></Link><Link className="home-full-timetable" to="/v2/me?tab=events"><CalendarDays size={15}/>{uiText('全部安排')}</Link></header>
    <div className="home-timeline home-course-timeline">{plans.map(item=>{const clock=courseClock(item,now),deadline=isDeadline(item);const content=<><strong>{deadline?deadlineTitle(item.title):item.title}</strong>{!deadline&&item.location&&<span>{item.location}</span>}<small>{uiText(item.lessonId?'课程':deadline?'DDL':item.label)}{item.lessonId&&item.time?` · ${item.time}`:''}{clock.active?` · ${uiText('进行中')}`:''}</small></>;return <div className={`home-timeline-row home-course-row${clock.active?' is-current':''}`} key={item.id}><HomeTime item={item}/>{deadline?<div className="home-course-card" data-plan-kind="deadline">{content}</div>:<Link to={item.path} className="home-course-card" data-plan-kind={item.lessonId?'course':item.kind} onClick={event=>openCourse(event,item)}>{content}</Link>}</div>})}{!plans.length&&<p className="home-empty">{!data?uiText('正在读取今日安排…'):uiText('今天接下来暂无安排，去享受校园生活吧。')}</p>}{agenda.arrangements.length>limit&&<button className="home-more-plans" onClick={()=>setAllPlans(!allPlans)} aria-expanded={allPlans}>{uiText(allPlans?'收起':'查看全部今日安排')}<ChevronRight size={13}/></button>}</div>
    <header className="home-tasks-heading" id="home-deadlines"><h3>{uiText('待办任务')} <small>{agenda.deadlines.length} {uiText('项')}</small></h3>{agenda.deadlines.length>Math.min(2,limit)&&<button onClick={()=>setAllTasks(!allTasks)} aria-expanded={allTasks}>{uiText(allTasks?'收起':'全部')}<ChevronRight size={14}/></button>}</header>
    <div className="home-timeline home-task-timeline">{deadlines.map((item,index)=>{const clock=deadlineClock(item,now);return <div className={`home-timeline-row home-task-row${clock.today?' is-due':''}`} data-home-deadline key={item.id}><span className={`home-task-icon task-tone-${index%2}`}><CheckCircle2 size={15}/></span><div className="home-task-card"><div><strong title={item.title}>{deadlineTitle(item.title)}</strong><small>{uiText('课程作业')} · {uiText('提交截止')}</small></div><span className="home-deadline-countdown">{uiText(clock.today?'今天':clock.days===1?'明天':'还有')}{clock.days!==null&&clock.days>1?` ${clock.days} ${uiText('天')}`:''} {clock.days!==null&&clock.days<=1&&item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):''}</span></div></div>})}{!deadlines.length&&<p className="home-empty">{!data?uiText('正在读取待办任务…'):uiText('当前没有待提交的 DDL。')}</p>}</div>
   </section>

   <nav className="cw-summary" aria-label={uiText('校园概况')}>
    <Link to="/v2/me?tab=events"><span>{uiText('今日安排')}</span><strong>{data?agenda.arrangements.length:'—'}<small>{uiText('项')}</small></strong></Link>
    <Link to="/v2/messages?view=notifications"><span>{uiText('未读通知')}</span><strong>{unread??'—'}<small>{uiText('条')}</small></strong></Link>
    <Link to="/v2/sports"><span>{uiText('体育进度')}</span><strong>{percent===null?'—':`${Math.round(percent)}%`}<small>{uiText(!data?'读取中':data.sportsStatus==='not-enrolled'?'尚未入班':percent===null?'待同步':'本学期')}</small></strong></Link>
   </nav>
   <section className="home-campus-entry" aria-label={uiText('校园快捷入口')}><nav className="home-shortcuts" aria-label={uiText('校园服务')}>{shortcuts.map(({title,path,icon:Icon})=><Link key={path} to={path} className="home-shortcut"><Icon size={25} strokeWidth={1.7}/><span>{uiText(title)}</span></Link>)}</nav></section>
   <div className="cw-content-grid">
    <div className="cw-recommendations"><Section title="校园新鲜事" hint="为你推荐" to="/v2/activities"><div className="cw-event-list">{events.map(item=><EventCard key={item.id} item={item} live={live} row/>)}</div>{!events.length&&<EmptyNote to="/v2/activities">{uiText(data?'下一场校园活动，等你来发现。':'正在读取校园活动…')}</EmptyNote>}</Section></div>
    <div className="cw-stories"><Section title="校园里的声音" hint="来自同学们的分享" to="/v2/community"><Stories community={community} compact/></Section></div>
    <div className="cw-organizations"><Section title="一起，让校园更有意思" to="/v2/organizations"><Organizations live={live}/></Section></div>
    <div className="cw-assistant"><AssistantBanner/></div>
   </div>
   <footer className="cw-footer"><span>{uiText('会同里')}</span><p>{uiText('今天，也在校园里发现一点新的可能。')}</p><Link to="/v2/campus/explore">{uiText('去校园走走')}<ArrowRight size={15}/></Link></footer>

  </div>
 </div>
}
