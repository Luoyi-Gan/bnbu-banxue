import {PublicPrivacyPage} from './PrivacyPolicy'
import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import { useDevicePreferences } from './devicePreferences'
import './deviceAppearance.css'
import { ReferenceDiscover, ReferenceCampus, ReferenceMe, ReferenceSports, ReferenceWelcome } from './reference/pages'
import { CampusWindowHome } from './reference/CampusWindowHome'
import staffCampusPhoto from '../assets/campus/campus-services.jpg'
import { AdminMailActivities } from './AdminMailActivities'
import { AdminCommunityKeywords } from './AdminCommunityKeywords'
import { Bell, Compass, Footprints, UsersRound, Mail, CalendarDays, Coffee, ChevronDown, GraduationCap, House, LayoutDashboard, Menu, MessageCircle, Newspaper, Settings2, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
const brandIcon = '/huitongli-app-icon.png'
import { V2Provider } from './store'
import { useV2 } from './useV2'
import { TeacherCoffee, TeacherProfile, TeacherSchedule, TeacherMessages, TeacherSports } from './TeacherPortal'
import { canAccessPortal, portalHome } from './portalAccess'
import { StudentSearch } from './StudentSearch'
import { AdminDashboard, AdminModeration, AdminVerifications } from './admin'
import { V2Activities, V2Community, V2Messages, V2Partners, V2Teams } from './student'
import { V2AI, V2Settings } from './services'
import { V2Alumni } from './V2Alumni'
import { V2Schedule } from './V2Schedule'
import { V2CoffeeChat } from './V2CoffeeChat'
import { PageHeading } from './ui'
import { useSportsHomeScroll } from './useSportsHomeScroll'
import { V2CampusExplore } from './V2CampusExplorer'
import { V2Auth } from './V2Auth'
import { V2Identity } from './V2Identity'
import { V2ForgotPassword } from './V2ForgotPassword'
import { FloatingTimetable } from './FloatingTimetable'
import { CampusOrganizations } from './CampusOrganizations'
import { useOriginalSession } from './useOriginalSession'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { DisplayAvatar } from './DisplayAvatar'
import { notificationPreferences, showNoticeBadge } from './notificationPreferences'
import { liveConversations } from './liveConversations'
import { defaultSidebarItems, parseSidebarItems } from '../../shared/v2/sidebarLayout'
import { studentSidebarById, studentSidebarCatalog } from './studentSidebarCatalog'
import { SidebarCustomizer } from './SidebarCustomizer'
import './v2.css'
import './aRedesign.css'
import './aControls.css'
import './studentTheme.css'
import './editorial.css'

const studentNav = [
  { path: '/v2', label: '首页', icon: House, end: true },
  { path: '/v2/activities', label: '发现', icon: Compass },
  { path: '/v2/campus', label: '校园', icon: UsersRound },
  { path: '/v2/sports', label: '运动', icon: Footprints },
  { path: '/v2/me', label: '我的', icon: UserRound },
]
const adminNav = [
  { path: '/v2/admin', label: '运营总览', icon: LayoutDashboard, end: true },
  { path: '/v2/admin/mail-activities', label: '邮件转活动', icon: Mail },
  { path: '/v2/admin/verifications', label: '认证审核', icon: ShieldCheck },
  { path: '/v2/admin/moderation', label: '社区内容', icon: Newspaper },
  { path: '/v2/admin/keywords', label: '社区屏蔽词', icon: ShieldAlert },
]

function V2Shell({ children, accountName }: { children: ReactNode; accountName: string }) { useUiLanguage();
  const { state } = useV2()
  const device=useDevicePreferences()
  const live = useWorkspaceBackend()
  const location = useLocation()
  useSportsHomeScroll()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [roleMenu, setRoleMenu] = useState(false)
  const [customizingSidebar, setCustomizingSidebar] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{const open=()=>setCustomizingSidebar(true);window.addEventListener('huitongli:open-sidebar-settings',open);return()=>window.removeEventListener('huitongli:open-sidebar-settings',open)},[])
  const admin = state.role === 'admin'
  const teacher = state.role === 'teacher'
  const studentProfile = !admin && !teacher ? live.data?.entities.find(e => e.kind === 'profile' && e.ownerId === live.data?.account.id)?.data : undefined
  const displayName = typeof studentProfile?.nickname === 'string' ? studentProfile.nickname : accountName
  const displayAvatar = typeof studentProfile?.avatar === 'string' ? studentProfile.avatar : ''
  const ownPreferences = live.data?.entities.find(item => item.kind === 'preferences' && item.ownerId === live.data?.account.id)?.data
  const sidebarItems = parseSidebarItems(ownPreferences?.sidebarItems) ?? defaultSidebarItems
  const shellBrandIcon = brandIcon
  const sports = location.pathname === '/v2/teacher/sports'
  const studentSectionActive = (path: string, isActive: boolean) => location.pathname==='/v2/community'?path===(new URLSearchParams(location.search).get('person')==='me'?'/v2/me':'/v2/activities'):isActive || (path === '/v2/campus' && ['/v2/community', '/v2/partners', '/v2/organizations', '/v2/coffee', '/v2/alumni'].some(prefix => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)))
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
  const title = location.pathname === '/v2/campus/explore' ? '校园探索' : location.pathname === '/v2/organizations' ? '社团组织' : location.pathname === '/v2/sports' ? '运动' : [...nav, ...(!admin ? studentSidebarCatalog : [])].sort((a, b) => b.path.length - a.path.length).find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))?.label ?? '会同里'
  const service = new URLSearchParams(location.search).get('service')
  const sidebarMatch = (id: typeof sidebarItems[number]) => {
    if (id === 'home') return location.pathname === '/v2'
    if (id === 'conversations') return location.pathname === '/v2/messages' && new URLSearchParams(location.search).get('view') !== 'notifications'
    if (id === 'coffee') return location.pathname === '/v2/coffee'
    if (id === 'teaching' || id === 'academic') return location.pathname === '/v2/campus' && service === id
    if (id === 'campus') return false
    const path = studentSidebarById[id].path
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  const sidebarActiveId = sidebarItems.find(id => id !== 'campus' && sidebarMatch(id)) ?? (location.pathname === '/v2/campus' || ['/v2/community', '/v2/partners', '/v2/alumni', '/v2/organizations', '/v2/sports', '/v2/campus/explore'].some(path => location.pathname === path || location.pathname.startsWith(`${path}/`)) ? 'campus' : undefined)
  useEffect(() => { setMobileMenu(false); setRoleMenu(false) }, [location.pathname, location.search])
  useEffect(() => {
    if (!roleMenu) return
    const closeOutside = (event: PointerEvent) => { if (!roleMenuRef.current?.contains(event.target as Node)) setRoleMenu(false) }
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setRoleMenu(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [roleMenu])
  if (location.pathname === '/v2/campus/explore') return <main>{children}</main>
  return <div data-campus-route={location.pathname} data-campus-tab={new URLSearchParams(location.search).get('tab') ?? ''} className={`v2-app${sports ? ' v2-app-sports' : ''}${!admin && !teacher ? ' v2-app-student' : ` v2-app-staff${teacher ? ' v2-app-teacher' : ' v2-app-admin'}`}`}>
    <aside className={`v2-sidebar${mobileMenu ? ' is-open' : ''}`} aria-label={uiText("新版主导航")}>
      <Link to={portalHome[state.role]} className="v2-brand"><img src={shellBrandIcon} alt=""/><span><strong>{uiText("会同里")}</strong><small>BNBU CAMPUS</small></span></Link>
      {(admin || teacher) && <div className="cw-staff-campus" aria-hidden="true"><img src={staffCampusPhoto} alt=""/></div>}
      <div className="v2-nav-label">{admin?uiText('管理'):teacher?uiText('教师'):uiText('我的导航')}</div>
      {admin || teacher?<nav className="v2-side-nav">{nav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => `v2-side-link${isActive ? ' is-active' : ''}`}><Icon size={19}/><span>{uiText(label)}</span></NavLink>)}</nav>:<nav className="v2-side-nav v2-student-sidebar-nav">{sidebarItems.map(id => { const entry = studentSidebarById[id]; const Icon = entry.icon; return <NavLink key={id} to={entry.path} className={`v2-side-link${sidebarActiveId === id ? ' is-active' : ''}`}><Icon size={19}/><span>{uiText(entry.label)}</span>{id === 'conversations' && unread > 0 && <b>{unread}</b>}</NavLink> })}</nav>}
      <div className="v2-sidebar-bottom">{(admin||teacher)&&<Link className="v2-sidebar-customize-trigger" to={teacher?'/v2/teacher/settings':'/v2/admin/settings'}><Settings2 size={18}/>{uiText('设置')}</Link>}<div className="v2-demo-indicator"><span className="v2-pulse-dot"/><span>{live.data?uiText('校园生活，随时相伴'):live.error?uiText('服务暂不可用'):uiText('正在连接服务')}</span></div>{!admin && !teacher && <button type="button" className="v2-sidebar-customize-trigger" onClick={() => setCustomizingSidebar(true)}><Settings2 size={18}/> {uiText("侧栏设置")}</button>}{!admin && !teacher && <a className="reference-font-credit" href="/fonts/NOTICE.html" target="_blank" rel="noreferrer">{uiText("字体与许可")}</a>}</div>
    </aside>
    {mobileMenu && <button type="button" className="v2-sidebar-scrim" aria-label={uiText("关闭导航")} onClick={() => setMobileMenu(false)}/>}
    <div className="v2-workspace">
      <header className="v2-topbar">
        <div className="v2-top-left"><button type="button" className="v2-icon-button v2-menu-trigger" onClick={() => setMobileMenu(true)} aria-label={uiText("打开导航")}><Menu size={21}/></button>{!admin && !teacher && <span className="v2-a-mobile-brand"><img src={shellBrandIcon} alt=""/>{uiText("会同里")}</span>}<div><span className="v2-breadcrumb">BNBU / {admin?uiText('管理'):teacher?uiText('教师'):uiText('校园')}</span><strong>{title}</strong></div></div>
        <div className="v2-top-actions">
          {!admin && !teacher && <NavLink to="/v2/messages?view=notifications" className={`v2-icon-button v2-header-messages${location.pathname === '/v2/messages' && new URLSearchParams(location.search).get('view') === 'notifications' ? ' is-active' : ''}`} aria-label={unreadNotices > 0?uiTemplate(["通知，"," 条未读"],unreadNotices):live.data?uiText('通知，暂无未读'):uiText('通知状态暂不可用')} title={live.data?uiTemplate(["通知 · "," 条未读"],unreadNotices):uiText('通知状态暂不可用')}><Bell size={19} aria-hidden="true"/>{unreadNotices > 0 && <span className="v2-header-message-count" aria-hidden="true">{unreadNotices > 99?'99+':unreadNotices}</span>}</NavLink>}
          {!admin && !teacher && <StudentSearch/>}
          {!admin && !teacher?<Link to="/v2/settings" className="v2-role-button" aria-label={uiText("进入设置")}><DisplayAvatar className="v2-role-avatar" name={displayName} avatar={displayAvatar} personId={live.data?.account.id}/><strong>{displayName}</strong></Link>:<div ref={roleMenuRef} className="v2-role-wrap"><button type="button" className="v2-role-button" aria-expanded={roleMenu} onClick={() => setRoleMenu((value) => !value)}><DisplayAvatar className="v2-role-avatar" name={displayName} avatar={displayAvatar} personId={live.data?.account.id}/><strong>{displayName}</strong><ChevronDown size={15}/></button>{roleMenu && <div className="v2-role-menu"><span>{admin?uiText('管理员账号'):uiText('教师账号')}</span>{teacher && <Link to="/v2/teacher/profile">{uiText("个人资料")}</Link>}<Link to={teacher?'/v2/teacher/settings':'/v2/admin/settings'}>{uiText('设置')}</Link><Link to="/v2/login" onClick={() => setRoleMenu(false)}>{uiText("登录 / 注册")}</Link></div>}</div>}
        </div>
      </header>
      <main className="v2-main">{children}</main>
    </div>
    {!admin && !teacher && <nav className="v2-mobile-nav" aria-label={uiText("手机主导航")}>{studentNav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => studentSectionActive(path, isActive) ? 'is-active' : ''}><Icon size={20}/><span>{uiText(label)}</span></NavLink>)}</nav>}
    {teacher && !sports && <nav className="v2-mobile-nav" aria-label={uiText("手机教师导航")}>{teacherNav.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{uiText(label)}</span></NavLink>)}</nav>}
    {admin && <nav className="v2-mobile-nav" aria-label={uiText("手机管理导航")}>{adminNav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label.replace('管理', '')}</span></NavLink>)}</nav>}
    {!admin && !teacher && device.preferences.timetableShortcut && <FloatingTimetable/>}
    {!admin && !teacher && customizingSidebar && <SidebarCustomizer initial={sidebarItems} busy={live.busy} error={uiText(live.error)} onSave={items => live.mutate('preferences.sidebarnav', {items})} onClose={() => setCustomizingSidebar(false)}/>}
  </div>
}

function V2Routes() { useUiLanguage();
  const location = useLocation()
  const { state, setState } = useV2()
  const session = useOriginalSession(location.pathname, location.key)
  const requestedRole = location.pathname.startsWith('/v2/admin') ? 'admin' : location.pathname.startsWith('/v2/teacher') ? 'teacher' : 'student'
  const authorized = !!session?.account?.roles.some(role => requestedRole === 'admin' ? ['superadmin', 'operator', 'reviewer'].includes(role) : role === requestedRole)
  useEffect(() => {
    if (authorized && state.role !== requestedRole) setState(current => ({...current, role: requestedRole}))
  }, [authorized, requestedRole, state.role, setState])
  if (location.pathname === '/v2/privacy') return <PublicPrivacyPage/>
  if (location.pathname === '/v2/welcome') return <ReferenceWelcome/>
  if (location.pathname === '/v2/login') return <V2Auth mode="login"/>
  if (location.pathname === '/v2/register') return <V2Auth mode="register"/>
  if (location.pathname === '/v2/forgot-password') return <V2ForgotPassword/>
  if (!session) return null
  if (session.anonymous) return <Navigate to="/v2/login" state={{returnTo: location.pathname + location.search + location.hash}} replace/>
  if (session.error) return <p role="alert">{session.error}</p>
  if (location.pathname === '/v2/identity') return <V2Identity/>
  if (session.account?.roles.length===0) return <Navigate to="/v2/identity" replace/>
  if (!authorized) return <Navigate to="/v2/login" state={{returnTo:location.pathname + location.search, roleMismatch:true}} replace/>
  if (state.role !== requestedRole) return <p role="status">{uiText("正在切换本人已授权身份…")}</p>
  if (!canAccessPortal(state.role, location.pathname)) return <Navigate to={portalHome[state.role]} replace/>
  return <V2Shell accountName={session.account!.name}><Routes>
    <Route path="/v2" element={<CampusWindowHome/>}/>
    {Boolean(import.meta.hot) && <Route path="/v2/design/campus-window" element={<Navigate to="/v2" replace/>}/>}
    <Route path="/v2/alumni" element={<V2Alumni/>}/>
    <Route path="/v2/sports" element={<ReferenceSports/>}/>
    <Route path="/v2/schedule" element={<V2Schedule/>}/>
    <Route path="/v2/coffee" element={<div className="v2-page reference-coffee-page"><PageHeading eyebrow="A LITTLE CONVERSATION" title="Coffee Chat" description={"和老师聊聊，每一种可能。"}/><V2CoffeeChat/></div>}/>
    <Route path="/v2/teacher" element={<Navigate to={portalHome.teacher} replace/>}/>
    <Route path="/v2/teacher/activities" element={<Navigate to="/v2/teacher/coffee" replace/>}/>
    <Route path="/v2/teacher/activities/:id" element={<Navigate to="/v2/teacher/coffee" replace/>}/>
    <Route path="/v2/teacher/coffee" element={<TeacherCoffee/>}/>
    <Route path="/v2/teacher/profile" element={<TeacherProfile/>}/>
    <Route path="/v2/teacher/schedule" element={<TeacherSchedule/>}/>
    <Route path="/v2/teacher/messages" element={<TeacherMessages/>}/>
    <Route path="/v2/teacher/sports" element={<TeacherSports/>}/>
    <Route path="/v2/activities" element={<ReferenceDiscover/>}/>
    <Route path="/v2/activities/:id" element={<V2Activities/>}/>
    <Route path="/v2/community" element={<V2Community/>}/>
    <Route path="/v2/partners" element={<V2Partners/>}/>
    <Route path="/v2/partners/teams" element={<V2Teams/>}/>
    <Route path="/v2/messages" element={<V2Messages/>}/>
    <Route path="/v2/campus" element={<ReferenceCampus/>}/>
    <Route path="/v2/organizations" element={<CampusOrganizations/>}/>
    <Route path="/v2/campus/explore" element={<V2CampusExplore/>}/>
    <Route path="/v2/ai" element={<V2AI/>}/>
    <Route path="/v2/me" element={<ReferenceMe/>}/>
    <Route path="/v2/settings" element={<V2Settings/>}/>
    <Route path="/v2/teacher/settings" element={<V2Settings/>}/>
    <Route path="/v2/admin/settings" element={<V2Settings/>}/>
    <Route path="/v2/admin" element={<AdminDashboard/>}/>
    <Route path="/v2/admin/verifications" element={<AdminVerifications/>}/>
    <Route path="/v2/admin/mail-activities" element={<AdminMailActivities/>}/>
    <Route path="/v2/admin/moderation" element={<AdminModeration/>}/>
    <Route path="/v2/admin/keywords" element={<AdminCommunityKeywords/>}/>
    <Route path="*" element={<Navigate to={portalHome[state.role]} replace/>}/>
  </Routes></V2Shell>
}

export function V2App() { useUiLanguage();
  const device=useDevicePreferences()
  useEffect(()=>{
    const root=document.documentElement
    root.lang=device.language==='en'?'en':'zh-CN'
    root.dataset.uiTheme=device.theme
    root.dataset.uiText=device.preferences.textSize
    root.dataset.uiMotion=device.reducedMotion?'reduce':'normal'
    root.style.colorScheme=device.theme
  },[device.language,device.theme,device.preferences.textSize,device.reducedMotion])
  return <V2Provider><V2Routes/></V2Provider>
}
