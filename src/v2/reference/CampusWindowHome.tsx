import {useEffect,useRef,useState,type MouseEvent} from 'react'
import {Link} from 'react-router-dom'
import {ArrowRight,BookOpen,CalendarDays,CheckCircle2,ChevronRight,Coffee,Heart,MapPin,Sparkles,UsersRound} from 'lucide-react'
import {StudentUtilities} from '../StudentUtilities'
import {StudentTimetable} from '../StudentTimetable'
import {useDevicePreferences} from '../devicePreferences'
import {useWorkspaceBackend} from '../useWorkspaceBackend'
import {useCommunityBackend} from '../useCommunityBackend'
import {liveActivities} from '../liveActivities'
import {filterActivityItems} from '../activityFilters'
import {photosForPost} from '../postPresentation'
import {SharedMediaLink} from '../SharedMediaLink'
import {schedulePreferences} from '../../../shared/v2/schedulePreferences'
import {homepageAgenda,courseClock,deadlineClock,deadlineTitle,isDeadline} from '../homeAgenda'
import {uiText,uiLocale,useUiLanguage} from '../uiLanguage'
import type {StudentScheduleItem} from '../studentSchedule'
import type {CardOrigin} from '../ui'
import {Feedback} from './components'
import {CampusHeroGallery} from '../CampusHeroGallery'
import campus from '../../assets/campus/home-background.jpg'
import './campusHome.css'

const shortcuts=[{title:'校园地图',copy:'探索校园',path:'/v2/campus/explore',icon:MapPin,tone:'mint'},{title:'校园活动',copy:'发现精彩',path:'/v2/activities',icon:UsersRound,tone:'blue'},{title:'找搭子',copy:'同学交流',path:'/v2/partners',icon:Coffee,tone:'amber'},{title:'社团组织',copy:'发现热爱',path:'/v2/organizations',icon:UsersRound,tone:'rose'},{title:'我的课表',copy:'全部课程',path:'/v2/me?tab=timetable',icon:CalendarDays,tone:'violet'}]
type Recommendation={id:string;title:string;image:string;category:string;path:string;transitionKey:string;detail:string;time?:string;source:'activity'|'organization'|'post'}
function Cover({src,alt}:{src:string;alt:string}){
 const [failed,setFailed]=useState(false)
 return src&&!failed?<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<div className="home-cover-empty"><BookOpen size={28}/><span>{alt}</span></div>
}
function HomeTime({item}:{item:StudentScheduleItem}){
 return <time className="home-row-time" dateTime={item.startAt}>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):uiText('待确认')}<small>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).format(new Date(item.startAt)):''}</small></time>
}


/** Reference composition backed by the existing permission-scoped campus workspace. */
export function CampusWindowHome(){
 useUiLanguage()
 const live=useWorkspaceBackend(30000),community=useCommunityBackend(),device=useDevicePreferences()
 const [now,setNow]=useState(Date.now),[inView,setInView]=useState(true)
 const [tab,setTab]=useState<'推荐'|'活动'|'社团'|'校园动态'>('推荐'),[allTasks,setAllTasks]=useState(false),[allPlans,setAllPlans]=useState(false)
 const [courseDetail,setCourseDetail]=useState<{id:string;origin:CardOrigin}|null>(null),hero=useRef<HTMLElement>(null)
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[])
 useEffect(()=>{if(!hero.current)return;const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));observer.observe(hero.current);return()=>observer.disconnect()},[])

 const data=live.data,agenda=homepageAgenda(data,now)
 const preferences=schedulePreferences(data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===data.account.id)?.data)
 const limit=preferences.homeScheduleCount
 const plans=allPlans?agenda.arrangements:agenda.arrangements.slice(0,limit),deadlines=allTasks?agenda.deadlines:agenda.deadlines.slice(0,Math.min(2,limit))
 const clubs=(data?.entities??[]).filter(e=>e.kind==='organization'&&e.data.status==='approved'&&e.data.visibility==='visible')
 const activities=filterActivityItems(liveActivities(data),{query:'',category:'全部',period:'全部时间',host:'全部主办方',status:'未结束',sort:'时间最近'},data?.account.id??'').slice(0,6)
 const activityCards:Recommendation[]=activities.map(item=>({id:item.id,title:item.title,image:item.image||campus,category:'活动',path:`/v2/activities/${encodeURIComponent(item.id)}`,transitionKey:`activity:${item.id}`,detail:item.location||item.host||'查看活动详情',time:item.startAt,source:'activity'}))
 const clubCards:Recommendation[]=[...clubs].sort((a,b)=>Number(Boolean(b.data.image))-Number(Boolean(a.data.image))).slice(0,6).map(item=>({id:item.id,title:String(item.data.name),image:String(item.data.image??''),category:String(item.data.category),path:`/v2/organizations?id=${encodeURIComponent(item.id)}`,transitionKey:`organization:${item.id}`,detail:item.data.directoryOnly?'学校公开名录':'平台入驻社团',source:'organization'}))
 const postCards:Recommendation[]=community.posts.filter(item=>item.status==='visible').slice(0,6).map(item=>({id:item.id,title:item.title,image:photosForPost(item)[0]??'',category:item.board,path:`/v2/community?item=${encodeURIComponent(item.id)}`,transitionKey:`post:${item.id}`,detail:`${item.author} · ${item.likes} ${uiText('人点赞')}`,source:'post'}))
 const recommendations=tab==='活动'?activityCards:tab==='社团'?clubCards:tab==='校园动态'?postCards:[...activityCards.slice(0,2),...clubCards.slice(0,2),...postCards.slice(0,2)].slice(0,6)
 const saved=(item:Recommendation)=>item.source==='post'?community.savedPosts.includes(item.id):Boolean(data?.relations.some(r=>r.entityId===item.id&&r.kind===(item.source==='organization'?'follow':'save')))
 const save=(item:Recommendation)=>item.source==='post'?community.mutate('relation.set',{id:item.id,kind:'save',enabled:!saved(item)}):live.mutate('relation.set',{id:item.id,kind:item.source==='organization'?'follow':'save',enabled:!saved(item)})
 const openCourse=(event:MouseEvent<HTMLAnchorElement>,item:StudentScheduleItem)=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&item.lessonId){event.preventDefault();setCourseDetail({id:item.lessonId,origin:event.currentTarget.getBoundingClientRect().toJSON()})}}
 const morePath=tab==='活动'||tab==='推荐'?'/v2/activities':tab==='社团'?'/v2/organizations':'/v2/community'
 return <div className="ref-page campus-home community-home">
  <section className="campus-home-hero" ref={hero} aria-label={uiText('校园窗口')}>
   <CampusHeroGallery autoplay={!device.reducedMotion&&device.preferences.photoAutoplay&&inView}/>
   <header className="campus-home-header"><h1>{uiText('会同里')}</h1><nav aria-label={uiText('首页工具')}><Link className="home-ai-tool" to="/v2/ai" aria-label={uiText('校园 AI')}><Sparkles size={19}/></Link><StudentUtilities notificationsOnly/></nav></header>
   <div className="home-explore-heading"><h2>{uiText('探索校园生活')}<br/>{uiText('遇见有趣的同学')}</h2></div>
  </section>
  {courseDetail&&<StudentTimetable initialWorkspace={data??undefined} detailOnly initialLessonId={courseDetail.id} origin={courseDetail.origin} onCloseDetails={()=>setCourseDetail(null)}/>}
  <div className="home-dashboard-body"><Feedback live={live}/>
   <section className="home-recommendations" aria-label={uiText('校园推荐')}><header className="home-section-heading"><nav aria-label={uiText('推荐内容类型')}>{(['推荐','活动','社团','校园动态'] as const).map(item=><button key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{uiText(item)}</button>)}</nav><Link to={morePath} aria-label={uiText('查看更多推荐')}><ChevronRight size={19}/></Link></header>
    {tab==='校园动态'&&community.error&&<p role="alert" className="home-empty">{community.error}</p>}
    <div className="home-recommendation-track" key={tab}>{recommendations.map(item=><article className="home-feature-card" key={item.id}><SharedMediaLink className="home-feature-link" to={item.path} transitionKey={item.transitionKey} resetScroll><div className="home-feature-photo" data-shared-media={item.transitionKey}><Cover key={item.image} src={item.image} alt={item.title}/></div><span className="home-feature-category">{uiText(item.category)}</span><div className="home-feature-copy">{item.time&&<time>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(item.time))}</time>}<h3>{item.title}</h3><p>{item.source==='activity'&&<MapPin size={12}/>}<span>{uiText(item.detail)}</span></p></div></SharedMediaLink><button className="home-feature-save" disabled={!data||live.busy||community.busy} aria-label={uiText(saved(item)?'取消收藏或关注':'收藏或关注')+' '+item.title} aria-pressed={saved(item)} onClick={()=>void save(item)}><Heart size={21} fill={saved(item)?'currentColor':'none'}/></button></article>)}</div>
    {!recommendations.length&&<p className="home-empty">{uiText('暂时没有可展示的推荐，去校园里发现更多。')}<Link to={morePath}>{uiText('去看看')}<ArrowRight size={13}/></Link></p>}
   </section>

   <section className="home-planner" aria-label={uiText('课程与待办')}>
    <header className="home-planner-heading"><Link to="/v2/me?tab=events"><h2>{uiText('今日安排')}</h2><ChevronRight size={17}/></Link><Link className="home-full-timetable" to="/v2/me?tab=events"><CalendarDays size={15}/>{uiText('全部安排')}</Link></header>
    <div className="home-timeline home-course-timeline">{plans.map(item=>{const clock=courseClock(item,now),deadline=isDeadline(item);const content=<><strong>{deadline?deadlineTitle(item.title):item.title}</strong>{!deadline&&item.location&&<span>{item.location}</span>}<small>{uiText(item.lessonId?'课程':deadline?'DDL':item.label)}{item.lessonId&&item.time?` · ${item.time}`:''}{clock.active?` · ${uiText('进行中')}`:''}</small></>;return <div className={`home-timeline-row home-course-row${clock.active?' is-current':''}`} key={item.id}><HomeTime item={item}/>{deadline?<div className="home-course-card" data-plan-kind="deadline">{content}</div>:<Link to={item.path} className="home-course-card" data-plan-kind={item.lessonId?'course':item.kind} onClick={event=>openCourse(event,item)}>{content}</Link>}</div>})}{!plans.length&&<p className="home-empty">{!data?uiText('正在读取今日安排…'):uiText('今天接下来暂无安排，去享受校园生活吧。')}</p>}{agenda.arrangements.length>limit&&<button className="home-more-plans" onClick={()=>setAllPlans(!allPlans)} aria-expanded={allPlans}>{uiText(allPlans?'收起':'查看全部今日安排')}<ChevronRight size={13}/></button>}</div>
    <header className="home-tasks-heading" id="home-deadlines"><h3>{uiText('待办任务')} <small>{agenda.deadlines.length} {uiText('项')}</small></h3>{agenda.deadlines.length>Math.min(2,limit)&&<button onClick={()=>setAllTasks(!allTasks)} aria-expanded={allTasks}>{uiText(allTasks?'收起':'全部')}<ChevronRight size={14}/></button>}</header>
    <div className="home-timeline home-task-timeline">{deadlines.map((item,index)=>{const clock=deadlineClock(item,now);return <div className={`home-timeline-row home-task-row${clock.today?' is-due':''}`} data-home-deadline key={item.id}><span className={`home-task-icon task-tone-${index%2}`}><CheckCircle2 size={15}/></span><div className="home-task-card"><div><strong title={item.title}>{deadlineTitle(item.title)}</strong><small>{uiText('课程作业')} · {uiText('提交截止')}</small></div><span className="home-deadline-countdown">{uiText(clock.today?'今天':clock.days===1?'明天':'还有')}{clock.days!==null&&clock.days>1?` ${clock.days} ${uiText('天')}`:''} {clock.days!==null&&clock.days<=1&&item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):''}</span></div></div>})}{!deadlines.length&&<p className="home-empty">{!data?uiText('正在读取待办任务…'):uiText('当前没有待提交的 DDL。')}</p>}</div>
   </section>


   <nav className="home-shortcuts" aria-label={uiText('校园快捷入口')}>{shortcuts.map(({title,copy,path,icon:Icon,tone})=><Link key={path} to={path} className={`home-shortcut tone-${tone}`}><Icon size={27} strokeWidth={1.6}/><strong>{uiText(title)}</strong><small>{uiText(copy)}</small><span><ChevronRight size={12}/></span></Link>)}</nav>
  </div>
 </div>
}
