import { uiText, uiTemplate, useUiLanguage, uiLocale } from '../uiLanguage'
import { ArrowRight, Bell, BookOpen, CalendarDays, ChevronRight, Coffee, ShieldCheck, Sun, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { useCommunityBackend } from '../useCommunityBackend'
import { liveActivities } from '../liveActivities'
import { liveStudentSchedule } from '../liveStudentSchedule'
import { showNoticeBadge } from '../notificationPreferences'
import { filterActivityItems } from '../activityFilters'
import { V2Campus, V2Me } from '../services'
import { V2Activities } from '../student'
import { DiscoveryPage } from '../DiscoveryPage'
import { StudentTimetable } from '../StudentTimetable'
import { DisplayAvatar } from '../DisplayAvatar'
import { Modal } from '../ui'
import { campusWeekday } from '../../../shared/v2/timetableModel'
import { Header, Section, EmptyNote, Ring, Services, AssistantBanner, CoffeeBanner, Agenda, EventCard, Organizations, Stories, Partners, Feedback, type Live } from './components'
import { campusDate, ownLessons, sportsSummary, when } from './model'
import campus from '../../assets/campus/home-background.jpg'
import sunset from '../../assets/campus/evening-campus.jpg'
import courtyard from '../../assets/campus/campus-services.jpg'
import walkway from '../../assets/campus/night-walkway.jpg'

const photos=[campus,sunset,courtyard]
function PhotoHero() { useUiLanguage();
  const [slide,setSlide]=useState(0)
  useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=window.setInterval(()=>{if(!document.hidden)setSlide(s=>(s+1)%photos.length)},6500);return()=>window.clearInterval(timer)},[])
  return <section className="ref-home-hero" aria-label={uiText("校园风景")}>{photos.map((photo,index)=><img key={photo} src={photo} alt={['校园建筑与树木','傍晚校园','校园公共空间'][index]} className={index===slide?'is-active':''} aria-hidden={index!==slide}/>)}<div><h2>{uiText("在这里，")}<br/>{uiText("遇见更大的校园生活。")}</h2><span>A BRIGHTER<br/>CAMPUS LIFE</span></div><nav aria-label={uiText("校园照片轮播")}>{photos.map((_,index)=><button type="button" key={index} aria-label={uiTemplate(["显示第 "," 张校园照片"],index+1)} aria-pressed={slide===index} onClick={()=>setSlide(index)}/>)}<span>{slide+1}/3</span></nav></section>
}
export function ReferenceHome() { useUiLanguage();
  const live=useWorkspaceBackend(30000),community=useCommunityBackend()
  const profile=live.data?.entities.find(e=>e.kind==='profile'&&e.ownerId===live.data?.account.id)
  const name=String(profile?.data.nickname||live.data?.account.name||'同学')
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(new Date()))
  const greeting=hour<11?'早上好':hour<14?'中午好':hour<18?'下午好':'晚上好'
  const today=liveStudentSchedule(live.data).filter(item=>item.startAt&&campusDate(item.startAt)===campusDate()).length
  const unread=live.data?.notifications.filter(n=>showNoticeBadge(live.data,n)).length
  const {percent}=sportsSummary(live.data)
  const events=filterActivityItems(liveActivities(live.data),{query:'',category:'全部',period:'全部时间',host:'全部主办方',status:'未结束',sort:'时间最近'},live.data?.account.id??'').slice(0,2)
  return <div className="ref-page ref-home"><Header title={uiText("会同里")} brand/><PhotoHero/><div className="ref-home-body"><section className="ref-today"><header><div><h2>{greeting}，{name} <Sun size={22}/></h2><p>{uiText("新的一天也要加油！")}</p></div><time>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'}).format(new Date())}</time></header><div className="ref-summary"><Link to="/v2/schedule"><CalendarDays/><strong>{uiText("今日安排")}<b>{live.data?today:'—'}</b></strong><ChevronRight size={14}/></Link><Link to="/v2/sports"><Ring percent={percent} small/><strong>{uiText("体育打卡")}</strong><ChevronRight size={14}/></Link><Link to="/v2/messages?view=notifications"><Bell/><strong>{uiText("未读通知")}<b>{unread ?? '—'}</b></strong><ChevronRight size={14}/></Link></div></section><Feedback live={live}/><Section title={uiText("接下来")} hint="Upcoming" to="/v2/schedule"><Agenda data={live.data}/></Section><Section title={uiText("为你推荐")} hint={uiText("活动 · 组织 · 机会")} to="/v2/activities"><div className="ref-event-carousel">{events.map(item=><EventCard key={item.id} item={item} live={live}/>)}</div>{!events.length&&<EmptyNote to="/v2/activities">{uiText("下一场校园活动，等你来发现。")}</EmptyNote>}</Section><Section title={uiText("校园动态")} hint={uiText("同学们正在发生什么")} to="/v2/community"><Stories community={community}/></Section><Section title={uiText("你可能感兴趣的组织")} to="/v2/organizations"><Organizations live={live}/></Section><Section title={uiText("校园服务")} hint={uiText("常用功能")} to="/v2/campus"><Services/></Section><AssistantBanner/></div></div>
}

export function ReferenceDiscover() { useUiLanguage();
  const [params]=useSearchParams()
  return params.get('view')==='manage'?<V2Activities/>:<DiscoveryPage/>
}

function TimetablePreview({live}:{live:Live}) { useUiLanguage();
  const [day,setDay]=useState(campusWeekday())
  const lessons=ownLessons(live.data,day)
  return <section className="ref-timetable-preview"><header><strong>{uiText("我的课程")}</strong><Link to="/v2/me?tab=timetable">{uiText("完整课表")}<ChevronRight size={14}/></Link></header><nav aria-label={uiText("选择课程星期")}>{['一','二','三','四','五','六','日'].map((label,i)=><button type="button" key={label} aria-pressed={day===i+1} onClick={()=>setDay(i+1)}>{uiText(label)}</button>)}</nav><div>{lessons.slice(0,3).map((lesson,i)=><Link to="/v2/me?tab=timetable" key={lesson.id} className={`ref-lesson lesson-${i}`}><time>{lesson.startTime || lesson.period}<small>{lesson.endTime}</small></time><span><strong>{lesson.name}</strong><small>{lesson.location || uiText('教室待确认')} {lesson.teacher&&`· ${lesson.teacher}`}</small><small>{lesson.weeks || uiText('周次待核对')}</small></span></Link>)}{!lessons.length&&<EmptyNote to="/v2/me?tab=timetable" label={uiText("查看或导入课表")}>{live.data?uiText('这一天暂未记录课程。'):uiText('正在读取课表…')}</EmptyNote>}</div><p>{uiText("按已保存课表展示，请核对课程周次。")}</p></section>
}
export function ReferenceCampus() { useUiLanguage();
  const [params]=useSearchParams()
  return params.has('service')?<V2Campus/>:<CampusContent/>
}
function CampusContent() { useUiLanguage();
  const live=useWorkspaceBackend(),community=useCommunityBackend()
  return <div className="ref-page ref-campus cw-pages"><Header title={uiText("校园")}/><Feedback live={live}/><div className="cw-campus-lead"><div className="cw-campus-window" aria-label={uiText("校园公共空间")}><span>{uiText("校园日常")}</span><img src={courtyard} alt={uiText("校园公共空间与建筑")}/></div><TimetablePreview live={live}/></div><div className="ref-page-body"><Section title={uiText("推荐组织")} to="/v2/organizations"><Organizations live={live}/></Section><Section title={uiText("校园社区")} to="/v2/community"><Stories community={community} compact/></Section><Section title={uiText("找搭子")} to="/v2/partners"><Partners data={live.data}/></Section><Section title="Coffee Chat"><CoffeeBanner/></Section><Section title={uiText("校园服务")} hint={uiText("常用功能")}><Services exclude={['/v2/me?tab=timetable']}/></Section><AssistantBanner/></div></div>
}

export function ReferenceMe() { useUiLanguage();
  const [params]=useSearchParams()
  const tab=params.get('tab')
  if(tab==='timetable')return <div className="ref-page ref-subpage cw-pages"><Header title={uiText("我的课表")} back="/v2/me"/><div className="ref-page-body"><StudentTimetable embedded/></div></div>
  if(tab&&tab!=='overview')return <div className="ref-page ref-subpage cw-pages"><Header title={({events:'我的活动',teams:'我的组队',saved:'我的收藏',network:'校园关系',verification:'身份认证',profile:'个人资料'} as Record<string,string>)[tab] ?? uiText('我的')} back="/v2/me"/><div className="ref-legacy-details"><V2Me embedded/></div></div>
  return <ProfileContent/>
}
function ProfileContent() { const language=useUiLanguage();
  const live=useWorkspaceBackend(),[backgroundOpen,setBackgroundOpen]=useState(false)
  const data=live.data,id=data?.account.id,entities=data?.entities??[]
  const profile=entities.find(e=>e.kind==='profile'&&e.ownerId===id)?.data
  const preferences=entities.find(e=>e.kind==='preferences'&&e.ownerId===id)?.data
  const backgrounds=[{key:'campus',label:'校园',image:campus},{key:'evening',label:'夕阳',image:sunset},{key:'walkway',label:'夜色',image:walkway},{key:'services',label:'校园空间',image:courtyard}]
  const background=backgrounds.find(b=>b.key===preferences?.profileBackground)?.image??campus
  const name=String(profile?.nickname||data?.account.name||'同学')
  const participates=data?.relations.filter(r=>r.kind==='participate'&&entities.some(e=>e.id===r.entityId&&e.kind==='activity'&&e.data.status==='published'))??[]
  const follows=data?.relations.filter(r=>r.kind==='follow'&&entities.some(e=>e.id===r.entityId&&e.kind==='organization'&&e.data.status==='approved'&&e.data.visibility==='visible'))??[]
  const rooms=entities.filter(e=>e.kind==='room'&&(e.ownerId===id||e.data.isMember))
  const saved=data?.relations.filter(r=>r.kind==='save'&&entities.some(e=>e.id===r.entityId&&(['activity','post','room'].includes(e.kind))&&(e.kind==='activity'?e.data.status==='published':e.kind==='post'?e.data.status==='visible':e.data.visibility==='visible')))??[]
  const recent=[...participates,...follows].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,3)
  const menu=[
    {label:'我的课表',copy:'查看、导入与核对课程',path:'/v2/me?tab=timetable',icon:BookOpen,tone:'blue'},
    {label:'校友交流',copy:'查看预约与交流安排',path:'/v2/alumni?view=bookings',icon:Coffee,tone:'orange'},
    {label:'身份认证',copy:'查看与管理认证资料',path:'/v2/me?tab=verification',icon:ShieldCheck,tone:'green'},
  ]
  return <div className="ref-page ref-me cw-pages"><section className="ref-profile-cover"><img className="cw-profile-photo" src={background} alt={uiText("个人主页校园封面")}/><Header title={uiText("我的")} settings/><Link className="ref-profile-identity" to="/v2/me?tab=profile"><DisplayAvatar className="ref-avatar" name={name} avatar={String(profile?.avatar??'')} personId={id}/><div><strong>{name}<ChevronRight size={17}/></strong><p>{data?.account.organization || uiText('个人资料')}</p>{data?.account.studentNumber&&<small>{uiText("学号")}{data.account.studentNumber}</small>}</div></Link><button className="ref-change-cover" onClick={()=>setBackgroundOpen(true)}>{uiText("更换封面")}</button></section><div className="ref-page-body cw-profile-body"><Feedback live={live}/><div className="ref-profile-stats">{[{label:'参与活动',value:participates.length,path:'/v2/me?tab=events'},{label:'关注组织',value:follows.length,path:'/v2/organizations'},{label:'参与队伍',value:rooms.length,path:'/v2/me?tab=teams'},{label:'我的收藏',value:saved.length,path:'/v2/me?tab=saved'}].map(item=><Link key={item.label} to={item.path}><strong>{data?item.value:'—'}</strong><span>{language==='en'?({'参与活动':'Activities','关注组织':'Following','参与队伍':'Teams','我的收藏':'Saved'}[item.label]):uiText(item.label)}</span></Link>)}</div><Section title={uiText("近期动态")}>{recent.length?recent.map(r=>{const item=entities.find(e=>e.id===r.entityId)!;return <Link className="ref-history-row" key={`${r.kind}-${r.entityId}`} to={r.kind==='participate'?`/v2/activities/${encodeURIComponent(r.entityId)}`:`/v2/organizations?q=${encodeURIComponent(String(item.data.name??''))}`}><span className="ref-history-icon">{r.kind==='participate'?<CalendarDays/>:<UsersRound/>}</span><div><strong>{r.kind==='participate'?(language==='en'?'Marked participation in':uiText('标记参与')):uiText('关注了')} {String(item.data.title||item.data.name)}</strong><small>{when(r.createdAt)}</small></div><ChevronRight size={16}/></Link>}):<EmptyNote>{uiText("你的校园足迹，会从每一次参与开始。")}</EmptyNote>}</Section><Section title={uiText("我的日历")} to="/v2/schedule"><Agenda data={data} calendar/></Section><Section title={uiText("更多功能")}><div className="ref-menu">{menu.map(({label,copy,path,icon:Icon,tone})=><Link key={path} to={path}><span className={`ref-icon tone-${tone}`}><Icon size={22}/></span><div><strong>{uiText(label)}</strong><small>{uiText(copy)}</small></div><ChevronRight size={16}/></Link>)}</div></Section></div>{backgroundOpen&&<Modal title={uiText("选择主页封面")} onClose={()=>setBackgroundOpen(false)}><div className="ref-cover-options">{backgrounds.map(b=><button key={b.key} disabled={live.busy} aria-pressed={preferences?.profileBackground===b.key} onClick={()=>void live.mutate('preferences.profilebackground',{choice:b.key}).then(ok=>{if(ok)setBackgroundOpen(false)})}><img src={b.image} alt=""/>{uiText(b.label)}</button>)}</div><Feedback live={live}/></Modal>}</div>
}

export { StudentSportsPage as ReferenceSports } from '../sports/StudentSportsPage'

export function ReferenceWelcome() { useUiLanguage();
  return <main className="ref-welcome" style={{backgroundImage:`linear-gradient(180deg,#e7f1e38c,#e7f1e3b0 34%,#e7f1e35c 55%,#19342545 80%),url(${campus})`}}><div><h1>{uiText("会同里")}</h1><p>{uiText("一个更丰富的校园生活")}</p></div><span>From Campus<br/>to a Bigger You.</span><Link to="/v2">{uiText("开始探索")}<ArrowRight size={19}/></Link><small>{uiText("会同里")}</small></main>
}

