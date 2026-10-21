import {useRef} from 'react'
import {useProfileCoverContrast} from './useProfileCoverContrast'
import {profileCoverSource} from './profileCovers'
import {StudentUtilities} from './StudentUtilities'
import {BookOpen,FileText,ChevronRight,Coffee,ShieldCheck} from 'lucide-react'
import {Link,useNavigate} from 'react-router-dom'
import {CommunityProfile} from './CommunityProfile'
import {useCommunitySocial} from './useCommunitySocial'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {uiText,useUiLanguage} from './uiLanguage'
import {Section,Agenda,Feedback} from './reference/components'
import './communitySocial.css'
import './communityProfile.css'
import './ownProfile.css'

export function OwnProfilePage(){
  const language=useUiLanguage(),navigate=useNavigate(),live=useWorkspaceBackend(),social=useCommunitySocial()
  const coverRef=useRef<HTMLDivElement>(null)
  useProfileCoverContrast(coverRef,social.data?profileCoverSource(social.data.profile.cover):null)
  const data=live.data,id=data?.account.id,entities=data?.entities??[]
  const participates=data?.relations.filter(r=>r.kind==='participate'&&entities.some(e=>e.id===r.entityId&&e.kind==='activity'&&e.data.status==='published'))??[]
  const follows=data?.relations.filter(r=>r.kind==='follow'&&entities.some(e=>e.id===r.entityId&&e.kind==='organization'&&e.data.status==='approved'&&e.data.visibility==='visible'))??[]
  const rooms=entities.filter(e=>e.kind==='room'&&(e.ownerId===id||e.data.isMember))
  const saved=data?.relations.filter(r=>r.kind==='save'&&entities.some(e=>e.id===r.entityId&&(['activity','post','room'].includes(e.kind))&&(e.kind==='activity'?e.data.status==='published':e.kind==='post'?e.data.status==='visible':e.data.visibility==='visible')))??[]
  const menu=[
    {label:'我的课表',copy:'查看、导入与核对课程',path:'/v2/me?tab=timetable',icon:BookOpen},
    {label:'我的笔记',copy:'记录校园生活',path:'/v2/community?person=me',icon:FileText},
    {label:'校友交流',copy:'查看预约与交流安排',path:'/v2/alumni?view=bookings',icon:Coffee},
    {label:'身份认证',copy:'查看与管理认证资料',path:'/v2/me?tab=verification',icon:ShieldCheck},
  ]
  return <div ref={coverRef} className="ref-page ref-me cw-pages own-profile">
      <header className="community-profile-top"><span>{uiText('我的')}</span><nav aria-label={uiText('主页工具')}><StudentUtilities/></nav></header>
    <section className="community-hub is-profile own-profile-summary" aria-label={uiText('我的个人主页')}>
      {social.data?<CommunityProfile profile={social.data.profile} busy={live.busy} onFollow={()=>{}} onList={list=>navigate(`/v2/community?person=me&panel=${list}`)}/>:<div className="own-profile-loading"><p role={social.error?'alert':'status'}>{uiText(social.error||'正在读取本人资料…')}{social.error&&<button onClick={social.refresh}>{uiText('重试')}</button>}</p></div>}
    </section>
    <div className="ref-page-body cw-profile-body"><Feedback live={live}/>
      <Section title={uiText('我的校园足迹')}><nav className="own-campus-shortcuts" aria-label={uiText('校园功能')}>{[{label:'参与活动',value:participates.length,path:'/v2/me?tab=events'},{label:'关注组织',value:follows.length,path:'/v2/organizations'},{label:'参与队伍',value:rooms.length,path:'/v2/me?tab=teams'},{label:'我的收藏',value:saved.length,path:'/v2/me?tab=saved'}].map(item=><Link key={item.label} to={item.path}><strong>{data?item.value:'—'}</strong><span>{language==='en'?({'参与活动':'Activities','关注组织':'Clubs','参与队伍':'Teams','我的收藏':'Saved'}[item.label]):uiText(item.label)}</span></Link>)}</nav></Section>
      <Section title={uiText('我的日历')}><Agenda data={data} calendar/></Section>
      <Section title={uiText('校园工具')}><div className="ref-menu">{menu.map(({label,copy,path,icon:Icon})=><Link key={path} to={path}><span className="ref-icon"><Icon size={22}/></span><div><strong>{uiText(label)}</strong><small>{uiText(copy)}</small></div><ChevronRight size={16}/></Link>)}</div></Section>
    </div>
  </div>
}
