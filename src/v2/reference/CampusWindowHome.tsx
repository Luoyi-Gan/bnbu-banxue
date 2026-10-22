import {useEffect,useRef,useState,type MouseEvent} from 'react'
import {Link} from 'react-router-dom'
import {ArrowRight,BookOpen,CalendarDays,ChevronRight,Coffee,Heart,MapPin,NotebookPen,Sun,UsersRound} from 'lucide-react'
import {StudentSearch} from '../StudentSearch'
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
import {homepageAgenda,courseClock,deadlineClock,deadlineTitle} from '../homeAgenda'
import {uiText,uiLocale,useUiLanguage} from '../uiLanguage'
import type {StudentScheduleItem} from '../studentSchedule'
import type {CardOrigin} from '../ui'
import {Feedback} from './components'
import evening from '../../assets/campus/evening-campus.jpg'
import reflection from '../../assets/campus/gallery/blue-sky-reflection.webp'
import morning from '../../assets/campus/gallery/morning-campus.webp'
import flowers from '../../assets/campus/gallery/flowers-and-light.webp'
import campus from '../../assets/campus/home-background.jpg'
import './campusHome.css'

const scenes=[{image:evening,label:'湖畔的暮色',location:'校园湖畔'},{image:reflection,label:'晴空与湖面的相遇',location:'校园风景'},{image:morning,label:'晨光里的校园',location:'校园全景'},{image:flowers,label:'花木间，发现校园',location:'校园日常'}]
const shortcuts=[{title:'校园地图',copy:'探索校园',path:'/v2/campus/explore',icon:MapPin,tone:'mint'},{title:'校园活动',copy:'发现精彩',path:'/v2/activities',icon:UsersRound,tone:'blue'},{title:'找搭子',copy:'同学交流',path:'/v2/partners',icon:Coffee,tone:'amber'},{title:'社团组织',copy:'发现热爱',path:'/v2/organizations',icon:UsersRound,tone:'rose'},{title:'我的课表',copy:'全部课程',path:'/v2/me?tab=timetable',icon:CalendarDays,tone:'violet'}]
type Recommendation={id:string;title:string;image:string;category:string;path:string;transitionKey:string;detail:string;time?:string;source:'activity'|'organization'|'post'}
function Cover({src,alt}:{src:string;alt:string}){
 const [failed,setFailed]=useState(false)
 return src&&!failed?<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<div className="home-cover-empty"><BookOpen size={28}/><span>{alt}</span></div>
}
function HomeTime({item}:{item:StudentScheduleItem}){
 return <time className="home-row-time" dateTime={item.startAt}>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):uiText('待确认')}<small>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).format(new Date(item.startAt)):''}</small></time>
}
const clubGroup=(category:string)=>category==='学术'?'学术科技':['文化艺术','体育运动','艺术','运动'].includes(category)?'文艺体育':['义工服务','公益'].includes(category)?'公益志愿':'兴趣爱好'

/** Reference composition backed by the existing permission-scoped campus workspace. */
export function CampusWindowHome(){
 useUiLanguage()
 const live=useWorkspaceBackend(30000),community=useCommunityBackend(),device=useDevicePreferences()
 const [now,setNow]=useState(Date.now),[slide,setSlide]=useState(0),[inView,setInView]=useState(true)
 const [tab,setTab]=useState<'活动'|'社团'|'校园动态'>('活动'),[category,setCategory]=useState('全部')
 const [courseDetail,setCourseDetail]=useState<{id:string;origin:CardOrigin}|null>(null),hero=useRef<HTMLElement>(null)
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[])
 useEffect(()=>{if(!hero.current)return;const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));observer.observe(hero.current);return()=>observer.disconnect()},[])
 useEffect(()=>{if(device.reducedMotion||!device.preferences.photoAutoplay||!inView)return;const timer=window.setInterval(()=>{if(document.visibilityState==='visible')setSlide(index=>(index+1)%scenes.length)},6500);return()=>window.clearInterval(timer)},[device.reducedMotion,device.preferences.photoAutoplay,inView])
 const data=live.data,agenda=homepageAgenda(data,now),scene=scenes[slide]
 const preferences=schedulePreferences(data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===data.account.id)?.data)
 const limit=preferences.homeScheduleCount
 const courses=agenda.visibleCourses.slice(0,limit),deadlines=agenda.deadlines.slice(0,limit)
 const clubs=(data?.entities??[]).filter(e=>e.kind==='organization'&&e.data.status==='approved'&&e.data.visibility==='visible')
 const filteredClubs=clubs.filter(e=>category==='全部'||clubGroup(String(e.data.category))===category)
 const activities=filterActivityItems(liveActivities(data),{query:'',category:'全部',period:'全部时间',host:'全部主办方',status:'未结束',sort:'时间最近'},data?.account.id??'').slice(0,6)
 const recommendations:Recommendation[]=tab==='活动'?activities.map(item=>({id:item.id,title:item.title,image:item.image||campus,category:'活动',path:`/v2/activities/${encodeURIComponent(item.id)}`,transitionKey:`activity:${item.id}`,detail:item.location||item.host||'查看活动详情',time:item.startAt,source:'activity'})):tab==='社团'?clubs.slice(0,6).map(item=>({id:item.id,title:String(item.data.name),image:String(item.data.image??''),category:String(item.data.category),path:`/v2/organizations?id=${encodeURIComponent(item.id)}`,transitionKey:`organization:${item.id}`,detail:item.data.directoryOnly?'学校公开名录':'平台入驻社团',source:'organization'})):community.posts.filter(item=>item.status==='visible').slice(0,6).map(item=>({id:item.id,title:item.title,image:photosForPost(item)[0]??'',category:item.board,path:`/v2/community?item=${encodeURIComponent(item.id)}`,transitionKey:`post:${item.id}`,detail:`${item.author} · ${item.likes} ${uiText('人点赞')}`,source:'post'}))
 const saved=(item:Recommendation)=>item.source==='post'?community.savedPosts.includes(item.id):Boolean(data?.relations.some(r=>r.entityId===item.id&&r.kind===(item.source==='organization'?'follow':'save')))
 const save=(item:Recommendation)=>item.source==='post'?community.mutate('relation.set',{id:item.id,kind:'save',enabled:!saved(item)}):live.mutate('relation.set',{id:item.id,kind:item.source==='organization'?'follow':'save',enabled:!saved(item)})
 const openCourse=(event:MouseEvent<HTMLAnchorElement>,item:StudentScheduleItem)=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&item.lessonId){event.preventDefault();setCourseDetail({id:item.lessonId,origin:event.currentTarget.getBoundingClientRect().toJSON()})}}
 const morePath=tab==='活动'?'/v2/activities':tab==='社团'?'/v2/organizations':'/v2/community'
 return <div className="ref-page campus-home">
  <section className="campus-home-hero" ref={hero} aria-label={uiText('校园窗口')}>
   <div className="home-hero-scene" aria-hidden="true">{scenes.map((item,index)=><img key={item.image} src={item.image} alt="" decoding="async" fetchPriority={index===0?'high':'low'} className={index===slide?'is-active':''}/>)}</div>
   <header className="campus-home-header"><h1>{uiText('会同里')}</h1><nav aria-label={uiText('首页工具')}><StudentSearch/><StudentUtilities profile/></nav></header>
   <p className="home-motto">{uiText('在校园里，')}<br/><span>{uiText('发现更多可能。')}</span></p>
   <div className="home-day"><time>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'}).format(new Date(now))}</time><span><Sun size={14} aria-hidden="true"/>{uiText('珠海 · 校园生活')}</span></div>
   <Link className="home-day-summary" to="/v2/me?tab=timetable"><span>{data?<>{agenda.remainingCourses.length?<>{uiText('今天还有')} <b>{agenda.remainingCourses.length}</b> {uiText('节课')}</>:uiText(agenda.courses.length?'今天课程已结束':'今天暂无课程')}<br/>{uiText('还有')} <b>{agenda.deadlines.length}</b> {uiText('项待办任务')}</>:uiText('正在读取课程与任务…')}</span><ChevronRight size={20}/></Link>
   <button className="home-scene-note" type="button" onClick={()=>setSlide(index=>(index+1)%scenes.length)} aria-label={uiText('切换校园照片')}><strong>{uiText(scene.label)}</strong><span><MapPin size={13}/>{uiText(scene.location)}<ChevronRight size={13}/></span></button>
   <nav className="home-scene-dots" aria-label={uiText('校园照片轮播')}>{scenes.map((item,index)=><button key={item.image} aria-label={uiText('显示校园照片')+` ${index+1}`} aria-pressed={slide===index} onClick={()=>setSlide(index)}/>)}</nav>
  </section>
  {courseDetail&&<StudentTimetable initialWorkspace={data??undefined} detailOnly initialLessonId={courseDetail.id} origin={courseDetail.origin} onCloseDetails={()=>setCourseDetail(null)}/>}
  <div className="home-dashboard-body"><Feedback live={live}/>
   <section className="home-planner" aria-label={uiText('课程与待办')}>
    <header className="home-planner-heading"><Link to="/v2/me?tab=timetable"><h2>{uiText('今日课表')}</h2><ChevronRight size={17}/></Link><Link className="home-full-timetable" to="/v2/me?tab=timetable"><CalendarDays size={15}/>{uiText('完整课表')}</Link></header>
    <div className="home-timeline home-course-timeline">{courses.map(item=>{const clock=courseClock(item,now);return <div className={`home-timeline-row home-course-row${clock.active?' is-current':''}`} key={item.id}><span className="home-course-status">{uiText(clock.active?'进行中':clock.ended?'已结束':'待上课')}</span><HomeTime item={item}/><Link to={item.path} className="home-course-card" onClick={event=>openCourse(event,item)} style={{backgroundImage:`linear-gradient(90deg,var(--home-course-wash) 40%,var(--home-course-clear)),url(${campus})`}}><strong>{item.title}</strong><span><MapPin size={12}/>{item.location||uiText('教室待确认')}</span><small>{item.time}</small>{clock.active&&<div className="home-course-progress"><span>{uiText('还有')} {clock.remaining} {uiText('分钟')}</span><progress value={clock.progress} max={100} aria-label={uiText('课程时间进度')}/></div>}</Link></div>})}{!courses.length&&<p className="home-empty">{!data?uiText('正在读取今日课程…'):uiText('今天暂无已选课程，可选择课程或查看完整课表。')}</p>}</div>
    <header className="home-tasks-heading"><Link to="/v2/me?tab=timetable&study=deadlines">{uiText('待办任务')}<ChevronRight size={16}/></Link></header>
    <div className="home-timeline home-task-timeline">{deadlines.map((item,index)=>{const clock=deadlineClock(item,now);return <div className={`home-timeline-row home-task-row${clock.today?' is-due':''}`} data-home-deadline key={item.id}><span className={`home-task-icon task-tone-${index%2}`}>{index%2?<NotebookPen size={18}/>:<CalendarDays size={18}/>}</span><HomeTime item={item}/><Link to={item.path} className="home-task-card"><div><strong title={item.title}>{deadlineTitle(item.title)}</strong><small>{uiText('课程作业')} · {uiText('提交截止')}</small></div><span className="home-deadline-countdown">{uiText(clock.today?'今天截止':clock.days===1?'明天截止':'还有')}{clock.days!==null&&clock.days>1?` ${clock.days} ${uiText('天')}`:''}</span></Link></div>})}{!deadlines.length&&<p className="home-empty">{!data?uiText('正在读取待办任务…'):uiText('当前没有待提交的 DDL。')}</p>}</div>
    {agenda.other.length>0&&<Link className="home-other-plan" to={agenda.other[0].path}>{uiText('其他安排')} · {agenda.other[0].title}<ChevronRight size={14}/></Link>}
   </section>
   <nav className="home-shortcuts" aria-label={uiText('校园快捷入口')}>{shortcuts.map(({title,copy,path,icon:Icon,tone})=><Link key={path} to={path} className={`home-shortcut tone-${tone}`}><Icon size={27} strokeWidth={1.6}/><strong>{uiText(title)}</strong><small>{uiText(copy)}</small><span><ChevronRight size={12}/></span></Link>)}</nav>
   <section className="home-recommendations" aria-label={uiText('校园推荐')}><header className="home-section-heading"><h2>{uiText('校园推荐')}</h2><nav aria-label={uiText('推荐内容类型')}>{(['活动','社团','校园动态'] as const).map(item=><button key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{uiText(item)}</button>)}</nav><Link to={morePath} aria-label={uiText('查看更多推荐')}><ChevronRight size={19}/></Link></header>
    {tab==='校园动态'&&community.error&&<p role="alert" className="home-empty">{community.error}</p>}
    <div className="home-recommendation-track" key={tab}>{recommendations.map(item=><article className="home-feature-card" key={item.id}><SharedMediaLink className="home-feature-link" to={item.path} transitionKey={item.transitionKey} resetScroll><div className="home-feature-photo" data-shared-media={item.transitionKey}><Cover key={item.image} src={item.image} alt={item.title}/></div><span className="home-feature-category">{uiText(item.category)}</span><div className="home-feature-copy">{item.time&&<time>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(item.time))}</time>}<h3>{item.title}</h3><p>{item.source==='activity'&&<MapPin size={12}/>}<span>{uiText(item.detail)}</span></p></div></SharedMediaLink><button className="home-feature-save" disabled={!data||live.busy||community.busy} aria-label={uiText(saved(item)?'取消收藏或关注':'收藏或关注')+' '+item.title} aria-pressed={saved(item)} onClick={()=>void save(item)}><Heart size={21} fill={saved(item)?'currentColor':'none'}/></button></article>)}</div>
    {!recommendations.length&&<p className="home-empty">{uiText('暂时没有可展示的推荐，去校园里发现更多。')}<Link to={morePath}>{uiText('去看看')}<ArrowRight size={13}/></Link></p>}
   </section>
   <section className="home-club-recommendations" aria-label={uiText('推荐社团')}><header className="home-section-heading"><Link to="/v2/organizations"><h2>{uiText('推荐社团')}</h2><ChevronRight size={17}/></Link><nav aria-label={uiText('推荐社团分类')}>{['全部','学术科技','文艺体育','公益志愿','兴趣爱好'].map(item=><button key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{uiText(item)}</button>)}</nav></header><div className="home-club-track" key={category}>{filteredClubs.slice(0,9).map(item=><Link className="home-club-card" key={item.id} to={`/v2/organizations?id=${encodeURIComponent(item.id)}`}><div><Cover key={String(item.data.image??'')} src={String(item.data.image??'')} alt={String(item.data.name)}/></div><span><strong>{String(item.data.name)}</strong><small>{String(item.data.category)}</small><small>{data?.relations.some(r=>r.kind==='follow'&&r.entityId===item.id)?uiText('已关注'):uiText('了解社团')}<ChevronRight size={10}/></small></span></Link>)}</div>{!filteredClubs.length&&<p className="home-empty">{data?uiText('这个分类暂未收录社团。'):uiText('正在读取社团…')}</p>}</section>
  </div>
 </div>
}
