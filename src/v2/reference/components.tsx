import {SharedMediaLink} from '../SharedMediaLink'
import {StudentUtilities} from '../StudentUtilities'
import {CommunityDiscoveryFeed} from '../CommunityDiscoveryFeed'
import { uiText, uiTemplate, useUiLanguage, uiLocale } from '../uiLanguage'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronRight, Coffee, Compass, Heart, MapPin, MessageCircle, Sparkles, UsersRound, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Workspace } from '../../live/api'
import { StudentSearch } from '../StudentSearch'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { useCommunityBackend } from '../useCommunityBackend'
import { CommunityPostDetail } from '../CommunityPostDetail'
import type { ActivityItem } from '../activityFilters'
import { liveStudentSchedule } from '../liveStudentSchedule'
import { campusDate, weekDates, when } from './model'
import companion from '../../assets/companion-yellow.png'
import campus from '../../assets/campus/home-background.jpg'
import coffeePhoto from '../../assets/campus/campus-services.jpg'

export type Live = ReturnType<typeof useWorkspaceBackend>
export function Header({title,brand=false,back,onBack,backDisabled=false,backLabel='返回',actions,settings=false,search=true}:{title:string;brand?:boolean;back?:string;onBack?:()=>void;backDisabled?:boolean;backLabel?:string;actions?:ReactNode;settings?:boolean;search?:boolean}) { useUiLanguage();
  return <header className={`ref-header${brand?' ref-brand':''}`}><div>{onBack?<button type="button" className="ref-header-back" disabled={backDisabled} onClick={onBack} aria-label={uiText(backLabel)}><ArrowLeft size={21}/></button>:back&&<Link to={back} aria-label={uiText(backLabel)}><ArrowLeft size={21}/></Link>}<h1>{uiText(title)}</h1></div><nav aria-label={uiText("页面工具")}>{actions??<>{!settings&&search&&<StudentSearch/>}<StudentUtilities/></>}</nav></header>
}
export function Section({title,hint,to,children}:{title:string;hint?:string;to?:string;children:ReactNode}) { useUiLanguage();
  return <section className="ref-section"><header><h2>{uiText(title)}</h2>{hint && <span>{uiText(hint)}</span>}{to && <Link to={to}>{uiText("更多")}<ChevronRight size={14}/></Link>}</header>{children}</section>
}
export function EmptyNote({children,to,label='去看看'}:{children:ReactNode;to?:string;label?:string}) { useUiLanguage();
  return <div className="ref-empty"><p>{children}</p>{to && <Link to={to}>{uiText(label)} <ArrowRight size={14}/></Link>}</div>
}
export function Ring({percent,small=false}:{percent:number|null;small?:boolean}) { useUiLanguage();
  return <div className={`ref-ring${small?' is-small':''}`} role={percent===null?undefined:'progressbar'} aria-label={uiText("本学期运动进度")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined}><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43"/>{percent!==null && <circle cx="50" cy="50" r="43" pathLength="100" strokeDasharray={`${percent} 100`}/>}</svg><div>{!small && <small>{uiText("本学期进度")}</small>}<strong>{percent===null?'—':`${Math.floor(percent)}%`}</strong>{!small && <span>{uiText("保持运动，继续加油！")}</span>}</div></div>
}
export type Shortcut = {label:string;path:string;icon:LucideIcon;tone?:string}
export function Shortcuts({items}:{items:Shortcut[]}) { const language=useUiLanguage();
  return <nav className="ref-shortcuts" aria-label={uiText("功能入口")}>{items.map(({label,path,icon:Icon,tone},i)=><Link key={path} to={path}><span className={`ref-icon tone-${tone ?? ['green','blue','orange','pink'][i%4]}`}><Icon size={23}/></span><strong>{language==='en'?(label==='社团组织'?'Clubs':label==='校友交流'?'Alumni':uiText(label)):uiText(label)}</strong></Link>)}</nav>
}
export function Services({exclude=[],compact=false}:{exclude?:string[];compact?:boolean}={}) { useUiLanguage();
  return <Shortcuts items={[
    {label:'我的课表',path:'/v2/me?tab=timetable',icon:BookOpen},
    {label:'校园地图',path:'/v2/campus/explore',icon:MapPin}, {label:'校友交流',path:'/v2/alumni',icon:Coffee},
    {label:'我的收藏',path:'/v2/me?tab=saved',icon:Heart}, {label:'我的会话',path:'/v2/messages',icon:MessageCircle},
    {label:'个人认证',path:'/v2/me?tab=verification',icon:UsersRound}, {label:'更多服务',path:'/v2/campus',icon:Compass},
  ].filter(item=>!exclude.includes(item.path)&&(!compact||['/v2/me?tab=timetable','/v2/campus/explore','/v2/campus'].includes(item.path))).map(item=>compact&&item.path==='/v2/campus'?{...item,label:'全部服务'}:item)}/>
}
export function AssistantBanner() { useUiLanguage(); return <Link to="/v2/ai" className="ref-assistant"><div><strong>{uiText("与 AI 一起，更好地校园生活")}</strong><p>{uiText("校园问答、信息查询、学习与生活")}</p></div><img src={companion} alt=""/><ChevronRight size={18}/></Link>}
export function CoffeeBanner() { useUiLanguage(); return <Link to="/v2/coffee" className="ref-coffee" style={{backgroundImage:`linear-gradient(90deg,#27251ddd,#27251d35),url(${coffeePhoto})`}}><strong>{uiText("和老师聊一聊，每一种可能")}</strong><span>{uiText("分享想法，听听不同的经验")}<ArrowRight size={16}/></span></Link>}
export function Agenda({data,calendar=false}:{data:Workspace|null;calendar?:boolean}) { useUiLanguage();
  const [selected,setSelected]=useState(campusDate())
  const items=liveStudentSchedule(data).filter(item=>!calendar || (item.startAt && campusDate(item.startAt)===selected)).slice(0,calendar?3:2)
  return <>{calendar && <div className="ref-week" aria-label={uiText("本周日期")}>{weekDates().map(day=><button type="button" key={day.key} aria-pressed={selected===day.key} onClick={()=>setSelected(day.key)}><small>{uiText(day.label)}</small><strong>{day.number}</strong><i className={liveStudentSchedule(data).some(item=>item.startAt && campusDate(item.startAt)===day.key)?'has-event':''}/></button>)}</div>}<div className="ref-agenda">{items.map(item=><Link to={item.path} key={item.id}><time>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(item.startAt)):uiText('待商定')}<small>{item.startAt?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).format(new Date(item.startAt)):''}</small></time><div><strong>{item.title}</strong><small><MapPin size={12}/>{item.location || uiText('地点待商定')}</small></div><ChevronRight size={15}/></Link>)}</div>{!items.length && <EmptyNote>{data?calendar?uiText('这一天暂时没有安排。'):uiText('近期暂无安排，给生活留一点自由。'):uiText('正在读取个人日程…')}</EmptyNote>}</>
}
export function EventCard({item,live,row=false}:{item:ActivityItem;live:Live;row?:boolean}) { useUiLanguage();
  const location=useLocation()
  const saved=live.data?.relations.some(r=>r.kind==='save' && r.entityId===item.id)??false
  const ended=Date.parse(item.endAt??item.startAt)<Date.now()
  return <article className={`ref-event${row?' is-row':''}`}><SharedMediaLink transitionKey={`activity:${item.id}`} state={{from:location.pathname+location.search}} to={`/v2/activities/${encodeURIComponent(item.id)}`} data-shared-media={`activity:${item.id}`} className="ref-event-photo"><img src={item.image || campus} alt={item.isDefaultCover?uiText('校园通用封面'):uiTemplate(["","封面"],item.title)} loading="lazy"/><span>{uiText(item.category)}</span></SharedMediaLink><div className="ref-event-content"><SharedMediaLink transitionKey={`activity:${item.id}`} state={{from:location.pathname+location.search}} to={`/v2/activities/${encodeURIComponent(item.id)}`}><h3>{item.title}</h3></SharedMediaLink><p>{uiText(item.subtitle)}</p><small><CalendarDays size={13}/>{when(item.startAt)}</small><small><MapPin size={13}/>{item.location}</small><footer><span className={ended?'ended':''}>{ended?uiText('已结束'):uiText('即将开始')}</span><span>{item.host}</span></footer></div><button type="button" className={`ref-save${saved?' is-saved':''}`} disabled={!live.data || live.busy} aria-label={uiTemplate(["","：",""],uiText(saved?'取消收藏':'收藏'),item.title)} aria-pressed={saved} onClick={()=>void live.mutate('relation.set',{id:item.id,kind:'save',enabled:!saved})}><Heart size={19} fill={saved?'currentColor':'none'}/></button></article>
}
export function Organizations({live}:{live:Live}) { useUiLanguage();
  const items=live.data?.entities.filter(item=>item.kind==='organization'&&item.data.status==='approved'&&item.data.visibility==='visible').slice(0,4)??[]
  return <>{items.length?<div className="ref-organizations">{items.map((item,i)=>{const followed=live.data?.relations.some(r=>r.kind==='follow'&&r.entityId===item.id);return <article key={item.id}><Link to={`/v2/organizations?q=${encodeURIComponent(String(item.data.name??''))}`}><div className={`ref-org-cover cover-${i}`}><UsersRound size={29}/></div><h3>{String(item.data.name??'校园组织')}</h3><p>{String(item.data.category??'社团组织')}</p></Link><button type="button" disabled={live.busy} onClick={()=>void live.mutate('relation.set',{id:item.id,kind:'follow',enabled:!followed})}>{followed?uiText('已关注'):uiText('关注')}</button></article>})}</div>:<EmptyNote to="/v2/organizations">{live.data?uiText('公开组织将在这里与你相遇。'):uiText('正在读取校园组织…')}</EmptyNote>}</>
}
export function Stories({community,compact=false}:{community:ReturnType<typeof useCommunityBackend>;compact?:boolean}) { useUiLanguage();
  const [selected,setSelected]=useState<string|null>(null)
  const posts=community.posts.filter(p=>p.status==='visible').slice(0,compact?2:4)
  return <>{community.error&&<p role="alert" className="ref-feedback">{community.error}</p>}{posts.length?<div className="community-hub community-summary-feed"><CommunityDiscoveryFeed posts={posts} liked={community.likedPosts} saved={community.savedPosts} viewerId={community.account.id} busy={community.busy} onOpen={id=>{setSelected(id);void community.recordOpen(id)}} onLike={id=>void community.mutate('relation.set',{id,kind:'like',enabled:!community.likedPosts.includes(id)})} onSave={id=>void community.mutate('relation.set',{id,kind:'save',enabled:!community.savedPosts.includes(id)})}/></div>:<EmptyNote to="/v2/community">{uiText('同学们的校园故事，等你来分享。')}</EmptyNote>}{selected && community.detailPost?.id===selected && <CommunityPostDetail id={selected} live={community} onClose={()=>setSelected(null)}/>}</>
}
export function Partners({data}:{data:Workspace|null}) { useUiLanguage();
  const rooms=data?.entities.filter(item=>item.kind==='room'&&item.data.status==='open'&&item.data.visibility==='visible').slice(0,2)??[]
  return rooms.length?<div className="ref-partners">{rooms.map(room=><Link to={`/v2/partners?item=${encodeURIComponent(room.id)}`} key={room.id}><span>{uiText("校园搭子")}</span><h3>{String(room.data.title)}</h3><p>{String(room.data.place||'地点待商定')}</p><small>{String(room.data.time||'时间待商定')}</small></Link>)}</div>:<EmptyNote to="/v2/partners" label={uiText("去找搭子")}>{uiText("学习、运动、生活，找个人一起。")}</EmptyNote>
}
export function Feedback({live}:{live:Live}) { useUiLanguage(); return live.error?<p className="ref-feedback" role="alert">{uiText(live.error)}</p>:null}
export { Sparkles }
