import { uiText, uiTemplate, useUiLanguage, uiLocale } from '../uiLanguage'
import { ArrowRight, Bell, CalendarDays, ChevronRight, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { useCommunityBackend } from '../useCommunityBackend'
import { liveActivities } from '../liveActivities'
import { liveStudentSchedule } from '../liveStudentSchedule'
import { showNoticeBadge } from '../notificationPreferences'
import { filterActivityItems } from '../activityFilters'
import { V2Campus, V2Me } from '../services'
import {OwnProfilePage} from '../OwnProfilePage'
import {StudentProfile} from '../StudentProfile'
import { DiscoveryPage } from '../DiscoveryPage'
import { StudentTimetable } from '../StudentTimetable'
import {CampusDirectory} from '../CampusDirectory'
import { campusWeekday } from '../../../shared/v2/timetableModel'
import { Header, Section, EmptyNote, Ring, Services, AssistantBanner, CoffeeBanner, Agenda, EventCard, Organizations, Stories, Feedback, type Live } from './components'
import { campusDate, ownLessons, sportsSummary } from './model'
import {campusMapHref} from '../campusMapLinks'
import campus from '../../assets/campus/home-background.jpg'
import sunset from '../../assets/campus/evening-campus.jpg'
import courtyard from '../../assets/campus/campus-services.jpg'
import partnersPhoto from '../../assets/campus/gallery/tree-lined-path.webp'

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
  return <div className="ref-page ref-home"><Header title={uiText("会同里")} brand/><PhotoHero/><div className="ref-home-body"><section className="ref-today"><header><div><h2>{greeting}，{name} <Sun size={22}/></h2><p>{uiText("新的一天也要加油！")}</p></div><time>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'}).format(new Date())}</time></header><div className="ref-summary"><Link to="/v2/me?tab=timetable"><CalendarDays/><strong>{uiText("我的课表")}<b>{live.data?today:'—'}</b></strong><ChevronRight size={14}/></Link><Link to="/v2/sports"><Ring percent={percent} small/><strong>{uiText("体育打卡")}</strong><ChevronRight size={14}/></Link><Link to="/v2/messages?view=notifications"><Bell/><strong>{uiText("未读通知")}<b>{unread ?? '—'}</b></strong><ChevronRight size={14}/></Link></div></section><Feedback live={live}/><Section title={uiText("接下来")} hint="Upcoming"><Agenda data={live.data}/></Section><Section title={uiText("为你推荐")} hint={uiText("活动 · 组织 · 机会")} to="/v2/activities"><div className="ref-event-carousel">{events.map(item=><EventCard key={item.id} item={item} live={live}/>)}</div>{!events.length&&<EmptyNote to="/v2/activities">{uiText("下一场校园活动，等你来发现。")}</EmptyNote>}</Section><Section title={uiText("校园动态")} hint={uiText("同学们正在发生什么")} to="/v2/community"><Stories community={community}/></Section><Section title={uiText("你可能感兴趣的组织")} to="/v2/organizations"><Organizations live={live}/></Section><Section title={uiText("校园服务")} hint={uiText("常用功能")} to="/v2/campus"><Services/></Section><AssistantBanner/></div></div>
}

export function ReferenceDiscover() { useUiLanguage();
  return <DiscoveryPage/>
}

function TimetablePreview({live}:{live:Live}) { useUiLanguage();
  const [day,setDay]=useState(campusWeekday())
  const lessons=ownLessons(live.data,day)
  return <section className="ref-timetable-preview"><header><strong>{uiText("我的课程")}</strong><Link to="/v2/me?tab=timetable">{uiText("完整课表")}<ChevronRight size={14}/></Link></header><nav aria-label={uiText("选择课程星期")}>{['一','二','三','四','五','六','日'].map((label,i)=><button type="button" key={label} aria-pressed={day===i+1} onClick={()=>setDay(i+1)}>{uiText(label)}</button>)}</nav><div>{lessons.slice(0,3).map((lesson,i)=><Link to={campusMapHref(lesson.location,'/v2/campus')} key={lesson.id} className={`ref-lesson lesson-${i}`} title={uiText('在地图中查看')}><time>{lesson.startTime || lesson.period}<small>{lesson.endTime}</small></time><span><strong>{lesson.name}</strong><small>{lesson.location || uiText('教室待确认')}</small></span></Link>)}{!lessons.length&&<EmptyNote to="/v2/me?tab=timetable" label={uiText("查看或导入课表")}>{live.data?uiText('这一天暂未记录课程。'):uiText('正在读取课表…')}</EmptyNote>}</div><p>{uiText("按已保存课表展示，请核对课程周次。")}</p></section>
}
export function ReferenceCampus() { useUiLanguage();
  const [params]=useSearchParams()
  return params.get('service')==='directory'?<div className="ref-page cw-pages"><Header title={uiText('校园办事')} back="/v2/campus" search={false}/><div className="ref-page-body"><CampusDirectory/></div></div>:params.has('service')?<V2Campus/>:<CampusContent/>
}
function CampusContent() { useUiLanguage();
  const live=useWorkspaceBackend()
  return <div className="ref-page ref-campus cw-pages"><Header title={uiText("校园")}/><Feedback live={live}/><div className="cw-campus-lead"><div className="cw-campus-window" aria-label={uiText("校园公共空间")}><span>{uiText("校园日常")}</span><img src={courtyard} alt={uiText("校园公共空间与建筑")}/></div><TimetablePreview live={live}/></div><div className="ref-page-body"><Section title={uiText("找搭子")}><Link to="/v2/partners" className="ref-coffee" style={{backgroundImage:`linear-gradient(90deg,#173c32dd,#173c3235),url(${partnersPhoto})`}}><strong>{uiText("找个搭子，一起出发")}</strong><span>{uiText("学习、运动、生活，遇见同频的伙伴")}<ArrowRight size={16}/></span></Link></Section><Section title={uiText("校园办事")}><Link className="v2-button v2-button-secondary" to="/v2/campus?service=directory">{uiText("查找办事指南与公开联系方式")}<ArrowRight size={16}/></Link></Section><Section title={uiText("社团组织")}><Link to="/v2/organizations" className="ref-coffee" style={{backgroundImage:`linear-gradient(90deg,#173c32dd,#173c3235),url(${sunset})`}}><strong>{uiText("让兴趣，在校园里相遇")}</strong><span>{uiText("探索社团、认识伙伴，找到你的热爱")}<ArrowRight size={16}/></span></Link></Section><Section title="Coffee Chat"><CoffeeBanner/></Section><Section title={uiText("校园探店")}><Link className="ref-coffee" to="/v2/shops" style={{backgroundImage:'linear-gradient(90deg,#302b21dd,#302b2135),url(/shops/memory-0.jpg)'}}><strong>{uiText("校内外的小店与美食")}</strong><span>{uiText("看看同学的真实体验，分享文字与照片。")}<ArrowRight size={16}/></span></Link></Section><AssistantBanner/></div></div>
}

export function ReferenceMe() { useUiLanguage();
  const [params]=useSearchParams()
  const tab=params.get('tab')
  if(tab==='profile')return <StudentProfile/>
  if(tab==='timetable')return <div className="ref-page ref-subpage cw-pages"><Header title={uiText("我的课表")} back="/v2/me"/><div className="ref-page-body"><StudentTimetable embedded/></div></div>
  if(tab&&tab!=='overview')return <div className="ref-page ref-subpage cw-pages"><Header title={({events:'我的活动',teams:'我的组队',saved:'我的收藏',network:'校园关系',verification:'身份认证',profile:'个人资料'} as Record<string,string>)[tab] ?? uiText('我的')} back="/v2/me"/><div className="ref-legacy-details"><V2Me embedded/></div></div>
  return <OwnProfilePage/>
}

export { MovementEntry as ReferenceSports } from '../sports/MovementEntry'

export function ReferenceWelcome() { useUiLanguage();
  return <main className="ref-welcome" style={{backgroundImage:`linear-gradient(180deg,#e7f1e38c,#e7f1e3b0 34%,#e7f1e35c 55%,#19342545 80%),url(${campus})`}}><div><h1>{uiText("会同里")}</h1><p>{uiText("一个更丰富的校园生活")}</p></div><span>From Campus<br/>to a Bigger You.</span><Link to="/v2">{uiText("开始探索")}<ArrowRight size={19}/></Link><small>{uiText("会同里")}</small></main>
}
