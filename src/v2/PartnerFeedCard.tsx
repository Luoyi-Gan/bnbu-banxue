import {sharedElementTransition} from './sharedElementMotion'
import {ArrowRight,Bookmark,BookOpen,CarFront,Clapperboard,Clock3,Dumbbell,MapPin} from 'lucide-react'
import type {PartnerRoom} from '../../shared/v2/partnerFilters'
import {roomTypeName} from '../../shared/v2/model'
import type {Workspace} from '../live/api'
import {DisplayAvatar} from './DisplayAvatar'
import {displayPerson} from './displayPerson'
import {uiLocale,uiText,useUiLanguage} from './uiLanguage'
import './partnerDiscovery.css'

export function PartnerThemeArt({type}:{type:PartnerRoom['type']}){
  const Icon=type==='carpool'?CarFront:type==='study'?BookOpen:type==='sport'?Dumbbell:Clapperboard
  return <div className={`partner-theme-art is-${type}`} role="img" aria-label={`${uiText(roomTypeName[type])}${uiText('主题插画')}`}>
    <svg viewBox="0 0 420 160" fill="none" aria-hidden="true">
      {type==='carpool'?<><path d="M-20 125C45 125 35 45 110 45S175 125 245 115 290 30 450 30" stroke="currentColor" strokeWidth="2" strokeDasharray="5 7"/><circle cx="110" cy="45" r="8" fill="currentColor"/><circle cx="316" cy="51" r="8" stroke="currentColor" strokeWidth="2"/></>:
      type==='study'?<><path d="m80 98 90-40 68 27-89 41-69-28Z" fill="currentColor" opacity=".12"/><path d="m149 126 89-41v14l-89 40-69-28V98m69 28v13" stroke="currentColor" strokeWidth="2"/><path d="m269 42 55-14 30 59-55 14-30-59Zm7 15 28-7m-22 20 31-8" stroke="currentColor" strokeWidth="2"/></>:
      type==='sport'?<><path d="m55 112 75-84 238 19-75 85-238-20Z" stroke="currentColor" strokeWidth="2"/><path d="m92 71 239 19M211 34l-76 85m-21-13 175 14 55-63-175-14-55 63Z" stroke="currentColor"/><ellipse cx="211" cy="79" rx="24" ry="14" stroke="currentColor"/></>:
      <><path d="m102 54 170-22 12 82-170 23-12-83Z" fill="currentColor" opacity=".12"/><path d="m102 54 170-22 12 82-170 23-12-83Zm120-15 12 82" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4"/><path d="m147 72 34 15-29 24-5-39Z" stroke="currentColor" strokeWidth="2"/></>}
    </svg><span className="partner-art-icon"><Icon size={30} strokeWidth={1.4}/></span>
  </div>
}

export function PartnerFeedCard({room,workspace,actorId,saved,busy,pending,onOpen,onSave}:{room:PartnerRoom;workspace:Workspace|null;actorId:string;saved:boolean;busy:boolean;pending:boolean;onOpen:()=>void;onSave:()=>void}){
  useUiLanguage()
  const owner=displayPerson(workspace,room.owner,uiText('校园同学'))
  const members=room.members.slice(0,3).map(id=>({id,...displayPerson(workspace,id,uiText('同学'))}))
  const remaining=Math.max(0,room.capacity-room.memberCount)
  const startsAt=room.details.startsAt?Date.parse(room.details.startsAt):NaN
  const when=Number.isFinite(startsAt)?new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(startsAt):room.time||uiText('时间待商定')
  const focus=room.type==='carpool'?`${room.details.departurePlace||room.place||uiText('出发地待商定')} → ${room.details.destinationPlace||uiText('目的地待商定')}`:
    room.type==='study'&&(room.details.gpaMin!==undefined||room.details.gpaMax!==undefined)?`${uiText('期望绩点')} ${room.details.gpaMin??uiText('不限')}–${room.details.gpaMax??uiText('不限')}`:
    room.type==='sport'?[room.details.sportType,room.details.extraCost===false?uiText('无额外支出'):room.details.extraCost===true?uiText('有额外支出'):''].filter(Boolean).join(' · '):room.details.activityType||''
  return <article className="partner-feed-card" data-room-type={room.type} data-room-id={room.id}>
    <button type="button" className="partner-card-open" onClick={event=>sharedElementTransition(`partner:${room.id}`,onOpen,{source:event.currentTarget.closest('article')?.querySelector<HTMLElement>('[data-shared-media]')})} aria-label={`${uiText('查看')}${room.title}`}>
      <div className="partner-card-visual"><div className="partner-shared-art" data-shared-media={`partner:${room.id}`}><PartnerThemeArt type={room.type}/></div><span className="partner-card-type">{uiText(roomTypeName[room.type])}</span>{focus&&<span className="partner-card-focus">{focus}</span>}</div>
      <div className="partner-card-copy"><h3>{room.title}</h3><strong className="partner-card-time"><Clock3 size={15}/>{when}</strong><span className="partner-card-place"><MapPin size={14}/>{room.place||uiText('地点待商定')}</span>{room.body&&<p>{room.body}</p>}</div>
    </button>
    <button type="button" className="partner-card-save" disabled={busy} aria-label={uiText(saved?'取消收藏':'收藏队伍')} aria-pressed={saved} onClick={onSave}><Bookmark size={18} fill={saved?'currentColor':'none'}/></button>
    <div className="partner-card-social"><div className="partner-card-owner"><DisplayAvatar className="partner-owner-avatar" name={owner.name} avatar={owner.avatar} personId={room.owner}/><span>{room.owner===actorId?uiText('我发起的队伍'):`${owner.name} ${uiText('发起')}`}</span></div><div className="partner-member-stack" aria-label={uiText('已加入成员')}>{members.map(member=><DisplayAvatar key={member.id} className="partner-member-avatar" name={member.name} avatar={member.avatar} personId={member.id}/>)}</div></div>
    <div className="partner-card-recruitment"><div><span>{room.memberCount}/{room.capacity} {uiText('人')}</span><strong>{remaining?`${uiText('还差')} ${remaining} ${uiText('人')}`:uiText('队伍已满')}</strong></div><progress max={room.capacity} value={Math.min(room.memberCount,room.capacity)} aria-label={uiText('组队人数进度')}/></div>
    <button type="button" className="partner-card-details" onClick={event=>sharedElementTransition(`partner:${room.id}`,onOpen,{source:event.currentTarget.closest('article')?.querySelector<HTMLElement>('[data-shared-media]')})}><span>{uiText('看看这支队伍')}</span><span className="partner-card-status">{pending?uiText('申请待处理'):room.members.includes(actorId)?uiText('已加入'):''}</span><ArrowRight size={15}/></button>
  </article>
}
