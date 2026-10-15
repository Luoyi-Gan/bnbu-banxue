import { AdminMailActivities } from './AdminMailActivities'
import { AdminCommunityKeywords } from './AdminCommunityKeywords'
import { Mail, BookOpen, CalendarDays, Coffee, ChevronDown, Compass, GraduationCap, LayoutDashboard, MapPinned, Menu, MessageCircle, Newspaper, ShieldAlert, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import brandIcon from '../assets/brand/brand-app-icon.svg'
import studentBrandIcon from '../assets/brand/brand-app-icon-a.svg'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import { V2Provider } from './store'
import { useV2 } from './useV2'
import { TeacherCoffee, TeacherProfile, TeacherSchedule, TeacherMessages, TeacherSports } from './TeacherPortal'
import { canAccessPortal, portalHome } from './portalAccess'
import { StudentSearch } from './StudentSearch'
import { AdminDashboard, AdminModeration, AdminVerifications } from './admin'
import { V2Activities, V2Community, V2Home, V2Messages, V2Partners, V2Teams } from './student'
import { V2AI, V2Campus, V2Me, V2Settings } from './services'
import { DraggableAI } from './DraggableAI'
import { V2Alumni } from './V2Alumni'
import { V2Sports } from './V2Sports'
import { useSportsHomeScroll } from './useSportsHomeScroll'
import { V2CampusExplore } from './V2CampusExplorer'
import { V2Auth } from './V2Auth'
import { useOriginalSession } from './useOriginalSession'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { DisplayAvatar } from './DisplayAvatar'
import { notificationPreferences, showNoticeBadge } from './notificationPreferences'
import { liveConversations } from './liveConversations'
import './v2.css'
import './aRedesign.css'
import './aControls.css'
import './timetableShortcut.css'
import './studentTheme.css'

const studentNav = [
  { path: '/v2', label: '首页', icon: LayoutDashboard, end: true },
  { path: '/v2/activities', label: '活动', icon: Compass },
  { path: '/v2/community', label: '社区', icon: Newspaper },
  { path: '/v2/partners', label: '找搭子', icon: UsersRound },
  { path: '/v2/me', label: '我的', icon: UserRound },
]
const studentMore = [
  { path: '/v2/alumni', label: '校友同行', icon: UsersRound },
  { path: '/v2/sports', label: '体育运动', icon: GraduationCap },
  { path: '/v2/campus/explore', label: '校园探索', icon: MapPinned },
  { path: '/v2/campus', label: '校园服务', icon: GraduationCap },
  { path: '/v2/ai', label: '校园 AI', icon: Sparkles },
  { path: '/v2/messages', label: '消息', icon: MessageCircle },
]
const adminNav = [
  { path: '/v2/admin', label: '运营总览', icon: LayoutDashboard, end: true },
  { path: '/v2/admin/mail-activities', label: '邮件转活动', icon: Mail },
  { path: '/v2/admin/verifications', label: '认证审核', icon: ShieldCheck },
  { path: '/v2/admin/moderation', label: '社区内容', icon: Newspaper },
  { path: '/v2/admin/keywords', label: '社区屏蔽词', icon: ShieldAlert },
]

function V2Shell({ children, accountName }: { children: ReactNode; accountName: string }) {
  const { state } = useV2()
  const live = useWorkspaceBackend()
  const location = useLocation()
  useSportsHomeScroll()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [roleMenu, setRoleMenu] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  const admin = state.role === 'admin'
  const teacher = state.role === 'teacher'
  const studentProfile = !admin && !teacher ? live.data?.entities.find(e => e.kind === 'profile' && e.ownerId === live.data?.account.id)?.data : undefined
  const displayName = typeof studentProfile?.nickname === 'string' ? studentProfile.nickname : accountName
  const displayAvatar = typeof studentProfile?.avatar === 'string' ? studentProfile.avatar : ''
  const shellBrandIcon = admin || teacher ? brandIcon : studentBrandIcon
  const sports = location.pathname === '/v2/sports' || location.pathname === '/v2/teacher/sports'
  const teacherNav = [
    { path: '/v2/teacher/coffee', label: 'Coffee Chat', icon: Coffee },
    { path: '/v2/teacher/schedule', label: '日程', icon: CalendarDays },
    { path: '/v2/teacher/messages', label: '消息与通知', icon: MessageCircle },
    { path: '/v2/teacher/profile', label: '个人资料', icon: UserRound },
    { path: '/v2/teacher/sports', label: '体育课程', icon: GraduationCap },
  ]
  const nav = admin ? adminNav : teacher ? teacherNav : studentNav
  const unread = notificationPreferences(live.data).messages ? liveConversations(live.data).reduce((sum, item) => sum + item.unread, 0) : 0
  const unreadNotices = live.data?.notifications.filter((item) => showNoticeBadge(live.data, item)).length ?? 0
  const title = location.pathname === '/v2/campus/explore' ? '校园探索' : [...nav, ...(!admin ? studentMore : [])].sort((a, b) => b.path.length - a.path.length).find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))?.label ?? '伴学'
  useEffect(() => { setMobileMenu(false); setRoleMenu(false) }, [location.pathname, location.search])
  useEffect(() => {
    if (!roleMenu) return
    const closeOutside = (event: PointerEvent) => { if (!roleMenuRef.current?.contains(event.target as Node)) setRoleMenu(false) }
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setRoleMenu(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [roleMenu])
  return <div className={`v2-app${sports ? ' v2-app-sports' : ''}${!admin && !teacher ? ' v2-app-student' : ''}`}>
    <aside className={`v2-sidebar${mobileMenu ? ' is-open' : ''}`} aria-label="新版主导航">
      <Link to={portalHome[state.role]} className="v2-brand"><img src={shellBrandIcon} alt=""/><span><strong>伴学</strong><small>BNBU CAMPUS</small></span></Link>
      <div className="v2-nav-label">{admin ? 'MANAGEMENT' : 'CAMPUS LIFE'}</div>
      <nav className="v2-side-nav">{nav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => `v2-side-link${isActive ? ' is-active' : ''}`}><Icon size={19}/><span>{label}</span>{label === '消息' && unread + unreadNotices > 0 && <b>{unread + unreadNotices}</b>}</NavLink>)}</nav>
      {!admin && !teacher && <><div className="v2-nav-label v2-nav-label-secondary">MORE TO EXPLORE</div><nav className="v2-side-nav">{studentMore.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `v2-side-link${isActive ? ' is-active' : ''}`}><Icon size={19}/><span>{label}</span>{label === '消息' && unread + unreadNotices > 0 && <b>{unread + unreadNotices}</b>}</NavLink>)}</nav></>}
      <div className="v2-sidebar-bottom"><div className="v2-demo-indicator"><span className="v2-pulse-dot"/><span>前端演示模式</span></div></div>
    </aside>
    {mobileMenu && <button type="button" className="v2-sidebar-scrim" aria-label="关闭导航" onClick={() => setMobileMenu(false)}/>}
    <div className="v2-workspace">
      <header className="v2-topbar">
        <div className="v2-top-left"><button type="button" className="v2-icon-button v2-menu-trigger" onClick={() => setMobileMenu(true)} aria-label="打开导航"><Menu size={21}/></button>{!admin && !teacher && <span className="v2-a-mobile-brand"><img src={shellBrandIcon} alt=""/>BNBU 伴学</span>}<div><span className="v2-breadcrumb">BNBU / {admin ? '管理' : teacher ? '教师' : '校园'}</span><strong>{title}</strong></div></div>
        <div className="v2-top-actions">
          {!admin && !teacher && <NavLink to="/v2/messages" className={({ isActive }) => `v2-icon-button v2-header-messages${isActive ? ' is-active' : ''}`} aria-label={unread + unreadNotices > 0 ? `消息，${unread + unreadNotices} 条未读` : live.data ? '消息，暂无未读' : '消息，通知状态暂不可用'} title={`消息 · 聊天 ${unread} 条未读，${live.data ? `通知 ${unreadNotices} 条未读` : '通知状态暂不可用'}`}><MessageCircle size={19} aria-hidden="true"/>{unread + unreadNotices > 0 && <span className="v2-header-message-count" aria-hidden="true">{unread + unreadNotices > 99 ? '99+' : unread + unreadNotices}</span>}</NavLink>}
          {!admin && !teacher && <StudentSearch/>}
          <div ref={roleMenuRef} className="v2-role-wrap"><button type="button" className="v2-role-button" aria-expanded={roleMenu} onClick={() => setRoleMenu((value) => !value)}><DisplayAvatar className="v2-role-avatar" name={displayName} avatar={displayAvatar} personId={live.data?.account.id}/><strong>{displayName}</strong><ChevronDown size={15}/></button>{roleMenu && <div className="v2-role-menu">{(admin || teacher) && <span>{admin ? '管理员账号' : '教师账号'}</span>}{teacher && <Link to="/v2/teacher/profile">个人资料</Link>}{!admin && !teacher && <><Link to="/v2/me?tab=profile" onClick={() => setRoleMenu(false)}>账号与个人资料</Link><Link to="/v2/settings">设置</Link></>}<Link to="/v2/login" onClick={() => setRoleMenu(false)}>登录 / 注册</Link></div>}</div>
        </div>
      </header>
      <main className="v2-main">{children}</main>
    </div>
    {!admin && !teacher && !sports && !mobileMenu && <Link className="v2-timetable-shortcut" to="/v2/me?tab=timetable" aria-label="打开我的课表" aria-current={location.pathname === '/v2/me' && new URLSearchParams(location.search).get('tab') === 'timetable' ? 'page' : undefined}><BookOpen size={19}/><span>我的课表</span></Link>}
    {!admin && !teacher && !sports && <><nav className="v2-mobile-nav" aria-label="手机主导航">{studentNav.slice(0, 5).map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label}</span></NavLink>)}</nav>{location.pathname !== '/v2/ai' && <DraggableAI src={state.aiIconChoice === 'kitty' ? kittyIcon : state.aiIconChoice === 'custom' && state.aiCustomIcon ? state.aiCustomIcon : yellowIcon}/>}</>}
    {teacher && !sports && <nav className="v2-mobile-nav" aria-label="手机教师导航">{teacherNav.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label}</span></NavLink>)}</nav>}
    {admin && <nav className="v2-mobile-nav" aria-label="手机管理导航">{adminNav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label.replace('管理', '')}</span></NavLink>)}</nav>}
  </div>
}

function V2Routes() {
  const location = useLocation()
  const { state, setState } = useV2()
  const session = useOriginalSession(location.pathname, location.key)
  const requestedRole = location.pathname.startsWith('/v2/admin') ? 'admin' : location.pathname.startsWith('/v2/teacher') ? 'teacher' : 'student'
  const authorized = !!session?.account?.roles.some(role => requestedRole === 'admin' ? ['superadmin', 'operator', 'reviewer'].includes(role) : role === requestedRole)
  useEffect(() => {
    if (authorized && state.role !== requestedRole) setState(current => ({...current, role: requestedRole}))
  }, [authorized, requestedRole, state.role, setState])
  if (location.pathname === '/v2/login') return <V2Auth mode="login"/>
  if (location.pathname === '/v2/register') return <V2Auth mode="register"/>
  if (!session) return <p role="status">正在核对登录状态…</p>
  if (session.anonymous) return <Navigate to="/v2/login" state={{returnTo: location.pathname + location.search + location.hash}} replace/>
  if (session.error) return <p role="alert">{session.error}</p>
  if (!authorized) return <Navigate to="/v2/login" state={{returnTo:location.pathname + location.search, roleMismatch:true}} replace/>
  if (state.role !== requestedRole) return <p role="status">正在切换本人已授权身份…</p>
  if (!canAccessPortal(state.role, location.pathname)) return <Navigate to={portalHome[state.role]} replace/>
  return <V2Shell accountName={session.account!.name}><Routes>
    <Route path="/v2" element={<V2Home/>}/>
    <Route path="/v2/alumni" element={<V2Alumni/>}/>
    <Route path="/v2/sports" element={<V2Sports/>}/>
    <Route path="/v2/teacher" element={<Navigate to={portalHome.teacher} replace/>}/>
    <Route path="/v2/teacher/activities" element={<Navigate to="/v2/teacher/coffee" replace/>}/>
    <Route path="/v2/teacher/activities/:id" element={<Navigate to="/v2/teacher/coffee" replace/>}/>
    <Route path="/v2/teacher/coffee" element={<TeacherCoffee/>}/>
    <Route path="/v2/teacher/profile" element={<TeacherProfile/>}/>
    <Route path="/v2/teacher/schedule" element={<TeacherSchedule/>}/>
    <Route path="/v2/teacher/messages" element={<TeacherMessages/>}/>
    <Route path="/v2/teacher/sports" element={<TeacherSports/>}/>
    <Route path="/v2/activities" element={<V2Activities/>}/>
    <Route path="/v2/activities/:id" element={<V2Activities/>}/>
    <Route path="/v2/community" element={<V2Community/>}/>
    <Route path="/v2/partners" element={<V2Partners/>}/>
    <Route path="/v2/partners/teams" element={<V2Teams/>}/>
    <Route path="/v2/messages" element={<V2Messages/>}/>
    <Route path="/v2/campus" element={<V2Campus/>}/>
    <Route path="/v2/campus/explore" element={<V2CampusExplore/>}/>
    <Route path="/v2/ai" element={<V2AI/>}/>
    <Route path="/v2/me" element={<V2Me/>}/>
    <Route path="/v2/settings" element={<V2Settings/>}/>
    <Route path="/v2/admin" element={<AdminDashboard/>}/>
    <Route path="/v2/admin/verifications" element={<AdminVerifications/>}/>
    <Route path="/v2/admin/mail-activities" element={<AdminMailActivities/>}/>
    <Route path="/v2/admin/moderation" element={<AdminModeration/>}/>
    <Route path="/v2/admin/keywords" element={<AdminCommunityKeywords/>}/>
    <Route path="*" element={<Navigate to={portalHome[state.role]} replace/>}/>
  </Routes></V2Shell>
}

export function V2App() { return <V2Provider><V2Routes/></V2Provider> }
