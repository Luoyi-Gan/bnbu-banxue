import {Bell, MessageCircle, Settings} from 'lucide-react'
import {Link, useLocation} from 'react-router-dom'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {liveConversations} from './liveConversations'
import {notificationPreferences, showNoticeBadge} from './notificationPreferences'
import {uiText, useUiLanguage} from './uiLanguage'
import './studentUtilities.css'
import {DisplayAvatar} from './DisplayAvatar'

export function StudentUtilities({profile=false,notificationsOnly=false}:{profile?:boolean;notificationsOnly?:boolean}={}){
  useUiLanguage()
  const live=useWorkspaceBackend(10000),location=useLocation()
  const notices=live.data?.notifications.filter(n=>showNoticeBadge(live.data,n)).length??0
  const messages=notificationPreferences(live.data).messages?liveConversations(live.data).reduce((sum,c)=>sum+c.unread,0):0
  return <span className="student-utilities">{[
    {label:'会话',path:'/v2/messages',icon:MessageCircle,count:messages},
    {label:'通知',path:'/v2/messages?view=notifications',icon:Bell,count:notices},
    {label:'设置',path:'/v2/settings',icon:Settings,count:0},
  ].filter(item=>(!profile||item.label!=='设置')&&(!notificationsOnly||item.label==='通知')).map(({label,path,icon:Icon,count})=><Link key={label} to={path} className={location.pathname+location.search===path?'is-active':''} aria-label={uiText(label)} title={uiText(label)}><Icon size={20}/>{count>0&&<b aria-label={`${count} ${uiText('未读')}`}>{count>99?'99+':count}</b>}</Link>)}{profile&&<Link to="/v2/me" className="home-profile-link" aria-label={uiText('个人主页')}><DisplayAvatar name={live.data?.account.name??'我'} avatar={String(live.data?.entities.find(e=>e.kind==='profile'&&e.ownerId===live.data?.account.id)?.data.avatar??'')} className="home-profile-avatar"/></Link>}</span>
}
