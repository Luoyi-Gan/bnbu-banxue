import { ChevronDown, Compass, GraduationCap, LayoutDashboard, Menu, MessageCircle, Megaphone, Newspaper, Search, ShieldCheck, Sparkles, UserRound, UsersRound, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import brandIcon from '../assets/brand/brand-app-icon.svg'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import { V2Provider } from './store'
import { useV2 } from './useV2'
import { StudentSearch } from './StudentSearch'
import { AdminAnnouncements, AdminDashboard, AdminModeration, AdminVerifications } from './admin'
import { V2Activities, V2AnnouncementPage, V2Community, V2Home, V2Messages, V2Partners, V2Teams } from './student'
import { V2AI, V2Campus, V2Me, V2Settings } from './services'
import './v2.css'

const studentNav = [
  { path: '/v2', label: '首页', icon: LayoutDashboard, end: true },
  { path: '/v2/activities', label: '活动', icon: Compass },
  { path: '/v2/announcements', label: '公告', icon: Megaphone },
  { path: '/v2/community', label: '社区', icon: Newspaper },
  { path: '/v2/partners', label: '找搭子', icon: UsersRound },
  { path: '/v2/messages', label: '消息', icon: MessageCircle },
]
const studentMore = [
  { path: '/v2/campus', label: '校园服务', icon: GraduationCap },
  { path: '/v2/ai', label: '校园 AI', icon: Sparkles },
  { path: '/v2/me', label: '我的', icon: UserRound },
]
const adminNav = [
  { path: '/v2/admin', label: '运营总览', icon: LayoutDashboard, end: true },
  { path: '/v2/admin/announcements', label: '公告管理', icon: Megaphone },
  { path: '/v2/admin/verifications', label: '认证审核', icon: ShieldCheck },
  { path: '/v2/admin/moderation', label: '内容审核', icon: Newspaper },
]

function V2Shell({ children }: { children: ReactNode }) {
  const { state, setState } = useV2()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [roleMenu, setRoleMenu] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const admin = location.pathname.startsWith('/v2/admin')
  const nav = admin ? adminNav : studentNav
  const unread = state.conversations.reduce((sum, item) => sum + item.unread, 0)
  const unreadNotices = state.notifications.filter((item) => !item.read).length
  const title = [...nav, ...(!admin ? studentMore : [])].sort((a, b) => b.path.length - a.path.length).find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))?.label ?? '伴学'
  const switchRole = (role: 'student' | 'admin') => {
    navigate(role === 'admin' ? '/v2/admin' : '/v2')
    setState((value) => ({ ...value, role }))
    setRoleMenu(false)
    setMobileMenu(false)
  }
  useEffect(() => { setMobileMenu(false); setRoleMenu(false); window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  useEffect(() => {
    if (admin || !roleMenu) return
    const closeOutside = (event: PointerEvent) => { if (!roleMenuRef.current?.contains(event.target as Node)) setRoleMenu(false) }
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setRoleMenu(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [admin, roleMenu])
  const searchMatches = search.trim() ? [
    ...state.announcements.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(search.trim().toLowerCase())).map((item) => ({ id: item.id, label: item.title, path: '/v2/announcements' })),
    ...state.posts.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(search.trim().toLowerCase())).map((item) => ({ id: item.id, label: item.title, path: '/v2/community' })),
    ...state.rooms.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(search.trim().toLowerCase())).map((item) => ({ id: item.id, label: item.title, path: '/v2/partners' })),
  ].slice(0, 6) : []
  return <div className="v2-app">
    <aside className={`v2-sidebar${mobileMenu ? ' is-open' : ''}`} aria-label="新版主导航">
      <Link to="/v2" className="v2-brand"><img src={brandIcon} alt=""/><span><strong>伴学</strong><small>BNBU CAMPUS</small></span></Link>
      <div className="v2-nav-label">{admin ? 'MANAGEMENT' : 'CAMPUS LIFE'}</div>
      <nav className="v2-side-nav">{nav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => `v2-side-link${isActive ? ' is-active' : ''}`}><Icon size={19}/><span>{label}</span>{label === '消息' && unread + unreadNotices > 0 && <b>{unread + unreadNotices}</b>}</NavLink>)}</nav>
      {!admin && <><div className="v2-nav-label v2-nav-label-secondary">MORE TO EXPLORE</div><nav className="v2-side-nav">{studentMore.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `v2-side-link${isActive ? ' is-active' : ''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav></>}
      <div className="v2-sidebar-bottom"><div className="v2-demo-indicator"><span className="v2-pulse-dot"/><span>前端演示模式</span></div></div>
    </aside>
    {mobileMenu && <button type="button" className="v2-sidebar-scrim" aria-label="关闭导航" onClick={() => setMobileMenu(false)}/>}
    <div className="v2-workspace">
      <header className="v2-topbar">
        <div className="v2-top-left"><button type="button" className="v2-icon-button v2-menu-trigger" onClick={() => setMobileMenu(true)} aria-label="打开导航"><Menu size={21}/></button><div><span className="v2-breadcrumb">BNBU / {admin ? '管理' : '校园'}</span><strong>{title}</strong></div></div>
        <div className="v2-top-actions">
          {admin ? <div className={`v2-global-search${searchOpen ? ' is-open' : ''}`}><button type="button" className="v2-icon-button" aria-label="搜索" onClick={() => setSearchOpen((value) => !value)}><Search size={19}/></button>{searchOpen && <><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索公告、社区与搭子" aria-label="搜索公告、社区与搭子"/><button type="button" className="v2-icon-button" aria-label="关闭搜索" onClick={() => { setSearchOpen(false); setSearch('') }}><X size={16}/></button>{search.trim() && <div className="v2-search-results">{searchMatches.length ? searchMatches.map((item) => <Link to={item.path} key={item.id} onClick={() => { setSearchOpen(false); setSearch('') }}>{item.label}</Link>) : <span>没有找到相关内容</span>}</div>}</>}</div> : <StudentSearch/>}
          <div ref={roleMenuRef} className="v2-role-wrap"><button type="button" className="v2-role-button" aria-expanded={roleMenu} onClick={() => setRoleMenu((value) => !value)}><span>{admin ? '管' : '晴'}</span><strong>{admin ? '管理员演示' : '陈雨晴'}</strong><ChevronDown size={15}/></button>{roleMenu && <div className="v2-role-menu"><button type="button" onClick={() => switchRole('student')}>学生视图 {!admin ? '✓' : ''}</button><button type="button" onClick={() => switchRole('admin')}>管理员视图 {admin ? '✓' : ''}</button></div>}</div>
        </div>
      </header>
      <main className="v2-main" key={location.pathname}>{children}</main>
    </div>
    {!admin && <><nav className="v2-mobile-nav" aria-label="手机主导航">{studentNav.slice(0, 5).map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label}</span></NavLink>)}</nav><Link to="/v2/ai" className="v2-ai-float" aria-label="打开校园 AI"><img src={state.aiIconChoice === 'kitty' ? kittyIcon : state.aiIconChoice === 'custom' && state.aiCustomIcon ? state.aiCustomIcon : yellowIcon} alt=""/></Link></>}
    {admin && <nav className="v2-mobile-nav" aria-label="手机管理导航">{adminNav.map(({ path, label, icon: Icon, ...rest }) => <NavLink key={path} to={path} end={'end' in rest} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={20}/><span>{label.replace('管理', '')}</span></NavLink>)}</nav>}
  </div>
}

function V2Routes() {
  const location = useLocation()
  return <V2Shell><Routes>
    <Route path="/v2" element={<V2Home/>}/>
    <Route path="/v2/activities" element={<V2Activities/>}/>
    <Route path="/v2/activities/:id" element={<V2Activities/>}/>
    <Route path="/v2/announcements" element={<V2AnnouncementPage/>}/>
    <Route path="/v2/community" element={<V2Community/>}/>
    <Route path="/v2/partners" element={<V2Partners/>}/>
    <Route path="/v2/partners/teams" element={<V2Teams/>}/>
    <Route path="/v2/messages" element={<V2Messages/>}/>
    <Route path="/v2/campus" element={<V2Campus/>}/>
    <Route path="/v2/ai" element={<V2AI/>}/>
    <Route path="/v2/me" element={<V2Me/>}/>
    <Route path="/v2/settings" element={<V2Settings/>}/>
    <Route path="/v2/admin" element={<AdminDashboard/>}/>
    <Route path="/v2/admin/announcements" element={<AdminAnnouncements/>}/>
    <Route path="/v2/admin/verifications" element={<AdminVerifications/>}/>
    <Route path="/v2/admin/moderation" element={<AdminModeration/>}/>
    <Route path="*" element={<Navigate to={location.pathname.startsWith('/v2/admin') ? '/v2/admin' : '/v2'} replace/>}/>
  </Routes></V2Shell>
}

export function V2App() { return <V2Provider><V2Routes/></V2Provider> }
