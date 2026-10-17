import { ArrowRight, Bell, BookOpen, CalendarDays, ChevronRight, Clock3, Coffee, Compass, Footprints, Heart, Info, MessageCircle, Search, Settings, ShieldCheck, Sun, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { useCommunityBackend } from '../useCommunityBackend'
import { liveActivities } from '../liveActivities'
import { liveStudentSchedule } from '../liveStudentSchedule'
import { showNoticeBadge } from '../notificationPreferences'
import { filterActivityItems, type ActivityPeriod, type ActivitySort } from '../activityFilters'
import { V2Campus, V2Me } from '../services'
import { V2Activities } from '../student'
import { StudentTimetable } from '../StudentTimetable'
import { DisplayAvatar } from '../DisplayAvatar'
import { Modal } from '../ui'
import { recordGroup, recordGroups } from '../../live/sportsDashboardModel'
import { sportsHours, sportsProgressLabel } from '../../../shared/v2/sportsProgress'
import { campusWeekday } from '../../../shared/v2/timetableModel'
import { Header, Section, EmptyNote, Ring, Shortcuts, Services, AssistantBanner, CoffeeBanner, Agenda, EventCard, Organizations, Stories, Partners, Feedback, type Live } from './components'
import { campusDate, ownLessons, sportsSummary, when } from './model'
import campus from '../../assets/campus/home-background.jpg'
import sunset from '../../assets/campus/evening-campus.jpg'
import courtyard from '../../assets/campus/campus-services.jpg'
import walkway from '../../assets/campus/night-walkway.jpg'

const photos=[campus,sunset,courtyard]
function PhotoHero() {
  const [slide,setSlide]=useState(0)
  useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=window.setInterval(()=>{if(!document.hidden)setSlide(s=>(s+1)%photos.length)},6500);return()=>window.clearInterval(timer)},[])
  return <section className="ref-home-hero" aria-label="校园风景">{photos.map((photo,index)=><img key={photo} src={photo} alt={['校园建筑与树木','傍晚校园','校园公共空间'][index]} className={index===slide?'is-active':''} aria-hidden={index!==slide}/>)}<div><h2>在这里，<br/>遇见更大的校园生活。</h2><span>A BRIGHTER<br/>CAMPUS LIFE</span></div><nav aria-label="校园照片轮播">{photos.map((_,index)=><button type="button" key={index} aria-label={`显示第 ${index+1} 张校园照片`} aria-pressed={slide===index} onClick={()=>setSlide(index)}/>)}<span>{slide+1}/3</span></nav></section>
}
export function ReferenceHome() {
  const live=useWorkspaceBackend(30000),community=useCommunityBackend()
  const profile=live.data?.entities.find(e=>e.kind==='profile'&&e.ownerId===live.data?.account.id)
  const name=String(profile?.data.nickname||live.data?.account.name||'同学')
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(new Date()))
  const greeting=hour<11?'早上好':hour<14?'中午好':hour<18?'下午好':'晚上好'
  const today=liveStudentSchedule(live.data).filter(item=>item.startAt&&campusDate(item.startAt)===campusDate()).length
  const unread=live.data?.notifications.filter(n=>showNoticeBadge(live.data,n)).length
  const {percent}=sportsSummary(live.data)
  const events=filterActivityItems(liveActivities(live.data),{query:'',category:'全部',period:'全部时间',host:'全部主办方',status:'未结束',sort:'时间最近'},live.data?.account.id??'').slice(0,2)
  return <div className="ref-page ref-home"><Header title="会同里" brand/><PhotoHero/><div className="ref-home-body"><section className="ref-today"><header><div><h2>{greeting}，{name} <Sun size={22}/></h2><p>新的一天也要加油！</p></div><time>{new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'}).format(new Date())}</time></header><div className="ref-summary"><Link to="/v2/schedule"><CalendarDays/><strong>今日安排 <b>{live.data?today:'—'}</b></strong><ChevronRight size={14}/></Link><Link to="/v2/sports"><Ring percent={percent} small/><strong>体育打卡</strong><ChevronRight size={14}/></Link><Link to="/v2/messages?view=notifications"><Bell/><strong>未读通知 <b>{unread??'—'}</b></strong><ChevronRight size={14}/></Link></div></section><Feedback live={live}/><Section title="接下来" hint="Upcoming" to="/v2/schedule"><Agenda data={live.data}/></Section><Section title="为你推荐" hint="活动 · 组织 · 机会" to="/v2/activities"><div className="ref-event-carousel">{events.map(item=><EventCard key={item.id} item={item} live={live}/>)}</div>{!events.length&&<EmptyNote to="/v2/activities">下一场校园活动，等你来发现。</EmptyNote>}</Section><Section title="校园动态" hint="同学们正在发生什么" to="/v2/community"><Stories community={community}/></Section><Section title="你可能感兴趣的组织" to="/v2/organizations"><Organizations live={live}/></Section><Section title="校园服务" hint="常用功能" to="/v2/campus"><Services/></Section><AssistantBanner/></div></div>
}

export function ReferenceDiscover() {
  const [params,setParams]=useSearchParams()
  if(params.get('view')==='manage')return <V2Activities/>
  return <DiscoveryContent key={`${params.get('category')??'all'}:${params.get('q')??''}`} initialQuery={params.get('q')??''} initialCategory={params.get('category')??'全部'} onManage={()=>setParams({view:'manage'})}/>
}
function DiscoveryContent({initialQuery,initialCategory,onManage}:{initialQuery:string;initialCategory:string;onManage:()=>void}) {
  const live=useWorkspaceBackend()
  const [query,setQuery]=useState(initialQuery),[category,setCategory]=useState(initialCategory),[list,setList]=useState(false)
  const [period,setPeriod]=useState<ActivityPeriod>('全部时间'),[sort,setSort]=useState<ActivitySort>('时间最近'),[location,setLocation]=useState('全部地点')
  const all=liveActivities(live.data)
  const categories=['全部',...new Set(all.filter(a=>a.local?.status==='published').map(a=>a.category))]
  const locations=['全部地点',...new Set(all.filter(a=>a.local?.status==='published').map(a=>a.location).filter(Boolean))]
  const filtered=filterActivityItems(all,{query,category,period,sort,host:'全部主办方',status:'全部状态'},live.data?.account.id??'').filter(a=>location==='全部地点'||a.location===location)
  const hasFilters=!!query||category!=='全部'||period!=='全部时间'||location!=='全部地点'
  const canCreate=live.data?.entities.some(e=>e.kind==='certification'&&e.ownerId===live.data?.account.id&&e.data.kind==='club'&&e.data.status==='approved')
  return <div className="ref-page ref-discover"><Header title="发现"/><div className="ref-page-body"><label className="ref-search"><Search size={18}/><input type="search" placeholder="搜索活动、组织、地点…" aria-label="搜索校园活动" value={query} onChange={e=>{setQuery(e.target.value);setList(true)}}/></label>{!list&&!hasFilters&&<><Link to="/v2/activities?view=manage" className="ref-discover-hero" style={{backgroundImage:`linear-gradient(0deg,#14271dc9,transparent 85%),url(${campus})`}}><strong>在校园，<br/>遇见更大的自己。</strong><span>活动 · 组织 · 社团 · 分享 · 相遇 <ArrowRight size={17}/></span></Link><Shortcuts items={[{label:'活动',path:'/v2/activities?view=manage',icon:CalendarDays,tone:'pink'},{label:'社团组织',path:'/v2/organizations',icon:UsersRound,tone:'blue'},{label:'校园社区',path:'/v2/community',icon:MessageCircle},{label:'校友交流',path:'/v2/alumni',icon:Coffee,tone:'orange'}]}/></>}<div className="ref-discover-heading"><h2>{list||hasFilters?'校园活动':'推荐活动'}</h2><button type="button" onClick={()=>setList(v=>!v)}>{list?'精选视图':'全部活动'} <ChevronRight size={14}/></button></div><div className="ref-category-tabs" aria-label="活动类别">{categories.map(c=><button type="button" aria-pressed={c===category} key={c} onClick={()=>{setCategory(c);setList(true)}}>{c}</button>)}</div>{(list||hasFilters)&&<div className="ref-filters"><label><span>时间</span><select aria-label="活动时间" value={period} onChange={e=>setPeriod(e.target.value as ActivityPeriod)}>{['全部时间','今天','本周','下周'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>地点</span><select aria-label="活动地点" value={location} onChange={e=>setLocation(e.target.value)}>{locations.map(x=><option key={x}>{x}</option>)}</select></label><label><span>排序</span><select aria-label="活动排序" value={sort} onChange={e=>setSort(e.target.value as ActivitySort)}><option>时间最近</option><option>推荐顺序</option></select></label></div>}<Feedback live={live}/><div className={list||hasFilters?'ref-event-list':'ref-event-feed'}>{filtered.slice(0,list||hasFilters?50:3).map(item=><EventCard key={item.id} item={item} live={live} row={list||hasFilters}/>)}</div>{!filtered.length&&<EmptyNote>{!live.data?'正在读取活动…':hasFilters?'没有符合条件的活动，试试其他筛选。':'暂时没有公开活动。新的校园消息会在这里出现。'}</EmptyNote>}{hasFilters&&<button className="ref-text-button" type="button" onClick={()=>{setQuery('');setCategory('全部');setPeriod('全部时间');setLocation('全部地点')}}>清除筛选</button>}{(canCreate||all.some(a=>a.local?.ownerId===live.data?.account.id))&&<button className="ref-text-button" onClick={onManage}>发布与管理我的活动 <ArrowRight size={15}/></button>}</div></div>
}

function TimetablePreview({live}:{live:Live}) {
  const [day,setDay]=useState(campusWeekday())
  const lessons=ownLessons(live.data,day)
  return <section className="ref-timetable-preview"><header><strong>我的课程</strong><Link to="/v2/me?tab=timetable">完整课表 <ChevronRight size={14}/></Link></header><nav aria-label="选择课程星期">{['一','二','三','四','五','六','日'].map((label,i)=><button type="button" key={label} aria-pressed={day===i+1} onClick={()=>setDay(i+1)}>{label}</button>)}</nav><div>{lessons.slice(0,3).map((lesson,i)=><Link to="/v2/me?tab=timetable" key={lesson.id} className={`ref-lesson lesson-${i}`}><time>{lesson.startTime||lesson.period}<small>{lesson.endTime}</small></time><span><strong>{lesson.name}</strong><small>{lesson.location||'教室待确认'} {lesson.teacher&&`· ${lesson.teacher}`}</small><small>{lesson.weeks||'周次待核对'}</small></span></Link>)}{!lessons.length&&<EmptyNote to="/v2/me?tab=timetable" label="查看或导入课表">{live.data?'这一天暂未记录课程。':'正在读取课表…'}</EmptyNote>}</div><p>按已保存课表展示，请核对课程周次。</p></section>
}
export function ReferenceCampus() {
  const [params]=useSearchParams()
  return params.has('service')?<V2Campus/>:<CampusContent/>
}
function CampusContent() {
  const live=useWorkspaceBackend(),community=useCommunityBackend()
  return <div className="ref-page ref-campus"><Header title="校园"/><div className="ref-page-body"><Feedback live={live}/><TimetablePreview live={live}/><Shortcuts items={[{label:'社团组织',path:'/v2/organizations',icon:UsersRound},{label:'找搭子',path:'/v2/partners',icon:Compass,tone:'orange'},{label:'校园社区',path:'/v2/community',icon:MessageCircle,tone:'blue'},{label:'Coffee Chat',path:'/v2/coffee',icon:Coffee,tone:'orange'}]}/><Section title="推荐组织" to="/v2/organizations"><Organizations live={live}/></Section><Section title="校园社区" to="/v2/community"><Stories community={community} compact/></Section><Section title="找搭子" to="/v2/partners"><Partners data={live.data}/></Section><Section title="Coffee Chat" to="/v2/coffee"><CoffeeBanner/></Section><Section title="校园服务" hint="常用功能"><Services/></Section><AssistantBanner/></div></div>
}

export function ReferenceMe() {
  const [params]=useSearchParams()
  const tab=params.get('tab')
  if(tab==='timetable')return <div className="ref-page ref-subpage"><Header title="我的课表" back="/v2/me"/><div className="ref-page-body"><StudentTimetable/></div></div>
  if(tab&&tab!=='overview')return <div className="ref-page ref-subpage"><Header title={({events:'我的活动',teams:'我的组队',saved:'我的收藏',network:'校园关系',verification:'身份认证',profile:'个人资料'} as Record<string,string>)[tab]??'我的'} back="/v2/me"/><div className="ref-legacy-details"><V2Me/></div></div>
  return <ProfileContent/>
}
function ProfileContent() {
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
    {label:'我的活动',copy:'活动安排与参与记录',path:'/v2/me?tab=events',icon:CalendarDays,tone:'pink'},
    {label:'我的组队',copy:'我发起或加入的搭子队伍',path:'/v2/me?tab=teams',icon:UsersRound,tone:'orange'},
    {label:'我的收藏',copy:'收藏的活动与校园内容',path:'/v2/me?tab=saved',icon:Heart,tone:'green'},
    {label:'我的日历',copy:'课程、活动与行程',path:'/v2/schedule',icon:CalendarDays,tone:'pink'},
    {label:'我的课表',copy:'查看、导入与核对课程',path:'/v2/me?tab=timetable',icon:BookOpen,tone:'blue'},
    {label:'校友交流',copy:'查看预约与交流安排',path:'/v2/alumni?view=bookings',icon:Coffee,tone:'orange'},
    {label:'身份认证',copy:'查看与管理认证资料',path:'/v2/me?tab=verification',icon:ShieldCheck,tone:'green'},
    {label:'设置',copy:'账号、通知与系统设置',path:'/v2/settings',icon:Settings,tone:'neutral'},
  ]
  return <div className="ref-page ref-me"><section className="ref-profile-cover" style={{backgroundImage:`linear-gradient(0deg,#faf9f6 0%,#faf9f6b8 65%,#faf9f650),url(${background})`}}><Header title="我的" settings/><Link className="ref-profile-identity" to="/v2/me?tab=profile"><DisplayAvatar className="ref-avatar" name={name} avatar={String(profile?.avatar??'')} personId={id}/><div><strong>{name}<ChevronRight size={17}/></strong><p>{data?.account.organization||'个人资料'}</p>{data?.account.studentNumber&&<small>学号 {data.account.studentNumber}</small>}</div></Link><button className="ref-change-cover" onClick={()=>setBackgroundOpen(true)}>更换封面</button></section><div className="ref-page-body"><Feedback live={live}/><div className="ref-profile-stats">{[{label:'参与活动',value:participates.length,path:'/v2/me?tab=events'},{label:'关注组织',value:follows.length,path:'/v2/organizations'},{label:'参与队伍',value:rooms.length,path:'/v2/me?tab=teams'},{label:'我的收藏',value:saved.length,path:'/v2/me?tab=saved'}].map(item=><Link key={item.label} to={item.path}><strong>{data?item.value:'—'}</strong><span>{item.label}</span></Link>)}</div><Shortcuts items={menu.slice(0,4).map(item=>({label:item.label,path:item.path,icon:item.icon,tone:item.tone}))}/><Section title="近期动态" to="/v2/me?tab=events">{recent.length?recent.map(r=>{const item=entities.find(e=>e.id===r.entityId)!;return <Link className="ref-history-row" key={`${r.kind}-${r.entityId}`} to={r.kind==='participate'?`/v2/activities/${encodeURIComponent(r.entityId)}`:`/v2/organizations?q=${encodeURIComponent(String(item.data.name??''))}`}><span className="ref-history-icon">{r.kind==='participate'?<CalendarDays/>:<UsersRound/>}</span><div><strong>{r.kind==='participate'?'标记参与':'关注了'} {String(item.data.title||item.data.name)}</strong><small>{when(r.createdAt)}</small></div><ChevronRight size={16}/></Link>}):<EmptyNote>你的校园足迹，会从每一次参与开始。</EmptyNote>}</Section><Section title="我的日历" to="/v2/schedule"><Agenda data={data} calendar/></Section><Section title="更多功能"><div className="ref-menu">{menu.map(({label,copy,path,icon:Icon,tone})=><Link key={path} to={path}><span className={`ref-icon tone-${tone}`}><Icon size={22}/></span><div><strong>{label}</strong><small>{copy}</small></div><ChevronRight size={16}/></Link>)}</div></Section></div>{backgroundOpen&&<Modal title="选择主页封面" onClose={()=>setBackgroundOpen(false)}><div className="ref-cover-options">{backgrounds.map(b=><button key={b.key} disabled={live.busy} aria-pressed={preferences?.profileBackground===b.key} onClick={()=>void live.mutate('preferences.profilebackground',{choice:b.key}).then(ok=>{if(ok)setBackgroundOpen(false)})}><img src={b.image} alt=""/>{b.label}</button>)}</div><Feedback live={live}/></Modal>}</div>
}

export function ReferenceSports() {
  const live=useWorkspaceBackend(30000),[info,setInfo]=useState(false),[all,setAll]=useState(false),[selected,setSelected]=useState<string|null>(null),[refreshing,setRefreshing]=useState(false)
  const {progress,percent,records,hasRecords}=sportsSummary(live.data)
  const record=records.find(r=>r.id===selected)
  const refresh=async()=>{setRefreshing(true);try{await live.refresh()}finally{setRefreshing(false)}}
  return <div className="ref-page ref-sports"><Header title="体育打卡"/><section className="ref-sports-photo" style={{backgroundImage:`linear-gradient(90deg,#eef4f380,transparent),url(${campus})`}}><h2>运动，<br/>让校园生活更有活力。</h2><button type="button" aria-label="体育打卡说明" onClick={()=>setInfo(true)}><Info size={21}/></button></section><div className="ref-page-body"><section className="ref-sports-card"><div className="ref-sports-progress"><Ring percent={percent}/><dl><div><Footprints/><dt>可查看记录</dt><dd>{hasRecords?records.length:'—'} <small>次</small></dd></div><div><Clock3/><dt>有效学时</dt><dd>{progress?.completedHours==null?'—':sportsHours(progress.completedHours)} <small>小时</small></dd></div><div><CalendarDays/><dt>目标学时</dt><dd>{progress?.targetHours==null?'—':sportsHours(progress.targetHours)} <small>小时</small></dd></div></dl></div><p className="ref-sports-status">{progress?sportsProgressLabel(progress):!live.data?'正在读取运动进度…':live.data.sportsStatus==='not-enrolled'?'当前尚未加入体育课程':'体育进度暂不可用'}</p><div className="ref-sports-actions"><a href="#ref-sport-records"><Footprints size={24}/><span><strong>运动记录</strong><small>查看每一次坚持</small></span></a><button type="button" disabled={refreshing} onClick={()=>void refresh()}><Clock3 size={23}/><span><strong>{refreshing?'正在同步':'同步进度'}</strong><small>获取最新学时</small></span></button></div></section><Feedback live={live}/><section className="ref-section" id="ref-sport-records"><header><h2>近期记录</h2><button type="button" onClick={()=>setAll(v=>!v)}>{all?'收起':'全部记录'} <ChevronRight size={14}/></button></header><div className="ref-records">{records.slice(0,all?records.length:3).map(item=><button type="button" key={item.id} onClick={()=>setSelected(item.id)}><span className="ref-icon tone-green"><Footprints size={23}/></span><div><strong>{String(item.data.sportName??item.data.sport??'运动记录')}</strong><small>{when(item.createdAt)}</small></div><em>{recordGroups.find(g=>g.key===recordGroup(item.data.status))?.label}</em></button>)}</div>{!records.length&&<EmptyNote>{hasRecords?'暂无运动记录，期待你的下一次出发。':'体育服务暂未提供可显示的运动记录。'}</EmptyNote>}</section><div className="ref-sports-help"><Info size={16}/><p>运动开始与凭证提交由体育平台处理，会同里同步展示已授权的进度与记录。</p></div></div>{info&&<Modal title="体育打卡说明" onClose={()=>setInfo(false)}><p>此处展示体育平台提供的个人学时和运动记录。请在体育平台开始运动、提交凭证并查看审核结果。</p><p>当前课程：{progress?.course||'暂无可用课程信息'}</p><p>进度不可用时显示“—”，不代表已完成零学时。</p></Modal>}{record&&<Modal title="运动记录" onClose={()=>setSelected(null)}><dl className="ref-record-detail"><dt>运动类型</dt><dd>{String(record.data.sportName??record.data.sport??'运动记录')}</dd><dt>记录时间</dt><dd>{when(record.createdAt)}</dd><dt>状态</dt><dd>{recordGroups.find(g=>g.key===recordGroup(record.data.status))?.label}</dd></dl></Modal>}</div>
}


export function ReferenceWelcome() {
  return <main className="ref-welcome" style={{backgroundImage:`linear-gradient(180deg,#e7f1e38c,#e7f1e3b0 34%,#e7f1e35c 55%,#19342545 80%),url(${campus})`}}><div><h1>会同里</h1><p>一个更丰富的校园生活</p></div><span>From Campus<br/>to a Bigger You.</span><Link to="/v2">开始探索 <ArrowRight size={19}/></Link><small>会同里</small></main>
}
