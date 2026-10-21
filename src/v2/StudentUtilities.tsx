import {Bell, MessageCircle, Settings} from 'lucide-react'
import {Link, useLocation} from 'react-router-dom'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {liveConversations} from './liveConversations'
import {notificationPreferences, showNoticeBadge} from './notificationPreferences'
import {uiText, useUiLanguage} from './uiLanguage'
import './studentUtilities.css'

export function StudentUtilities(){
  useUiLanguage()
  const live=useWorkspaceBackend(10000),location=useLocation()
  const notices=live.data?.notifications.filter(n=>showNoticeBadge(live.data,n)).length??0
  const messages=notificationPreferences(live.data).messages?liveConversations(live.data).reduce((sum,c)=>sum+c.unread,0):0
  return <span className="student-utilities">{[
    {label:'会话',path:'/v2/messages',icon:MessageCircle,count:messages},
    {label:'通知',path:'/v2/messages?view=notifications',icon:Bell,count:notices},
    {label:'设置',path:'/v2/settings',icon:Settings,count:0},
  ].map(({label,path,icon:Icon,count})=><Link key={label} to={path} className={location.pathname+location.search===path?'is-active':''} aria-label={uiText(label)} title={uiText(label)}><Icon size={20}/>{count>0&&<b aria-label={`${count} ${uiText('未读')}`}>{count>99?'99+':count}</b>}</Link>)}</span>
}
