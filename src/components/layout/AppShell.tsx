import { Activity, Bell, CalendarDays, Compass, Home, Languages, Search, Sparkles, UserRound, UsersRound, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { hosts } from '../../data/mockData'
import { useLanguage } from '../../i18n/LanguageContext'
import { LocalizationBoundary } from '../../i18n/LocalizationBoundary'
import { useDemo } from '../../store/DemoStore'
import type { Scenario } from '../../types'
import { Modal } from '../feedback/Modal'

const navItems = [
  { label: 'nav.home', to: '/', icon: Home },
  { label: 'nav.discover', to: '/discover', icon: Compass },
  { label: 'nav.campus', to: '/campus', icon: UsersRound },
  { label: 'nav.checkin', to: '/check-in', icon: Activity },
  { label: 'nav.profile', to: '/profile', icon: UserRound },
]

const bottomNavItems = [
  navItems[0],
  navItems[1],
  { label: 'campus.module.ai', to: '/campus/ai', icon: Sparkles },
  navItems[2],
  navItems[4],
]

export function AppShell({ children }: { children: ReactNode }) {
  const { state, allEvents, send, toast } = useDemo()
  const { language, t } = useLanguage()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isCampusPage = (location.pathname.startsWith('/campus') && location.pathname !== '/campus/ai')
    || location.pathname === '/teaching'
    || location.pathname.startsWith('/organizations/')
    || location.pathname.startsWith('/coffee-chat')
    || location.pathname === '/check-in'
  const unread = state.notifications.filter((item) => !item.read).length
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return [
      ...allEvents
        .filter((event) => `${event.title} ${event.category} ${event.tags.join(' ')}`.toLowerCase().includes(normalized))
        .slice(0, 5)
        .map((event) => ({ id: event.id, title: event.title, meta: `${event.category} · ${event.dateLabel}`, path: `/events/${event.id}` })),
      ...hosts
        .filter((host) => `${host.name} ${host.tags.join(' ')}`.toLowerCase().includes(normalized))
        .slice(0, 3)
        .map((host) => ({ id: host.id, title: host.name, meta: 'Campus host', path: `/hosts/${host.id}` })),
    ]
  }, [query, allEvents])

  const applyScenario = (scenario: Scenario) => {
    send({ type: 'SET_SCENARIO', scenario }, `${scenario === 'new' ? t('menu.newStudent') : scenario === 'active' ? t('menu.activeStudent') : t('menu.organizer')} ready`)
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <div className="app-shell">
      <LocalizationBoundary>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/" aria-label="BNBU Campus Hub home">
            <span className="brand-mark">B</span>
            <span className="brand-copy"><strong>BNBU</strong><small>Campus Hub</small></span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'}>{t(item.label)}</NavLink>)}
          </nav>
          <div className="top-actions">
            <button className="icon-button" type="button" aria-label={t('nav.search')} onClick={() => setSearchOpen(true)}><Search size={19} /></button>
            <Link className="icon-button notification-button" to="/notifications" aria-label={`${unread} ${t('nav.notifications').toLowerCase()}`}>
              <Bell size={19} />{unread > 0 && <span className="notification-dot">{unread}</span>}
            </Link>
            <Link className="language-button" to="/settings" aria-label={t('nav.settings')}><Languages size={17} /><span>{language === 'zh' ? 'EN' : '中'}</span></Link>
            <div className="profile-menu-wrap">
              <button className="avatar-button" type="button" aria-label={`${t('nav.profile')} menu`} aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}>晴</button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-user"><strong>陈雨晴</strong><span>工商管理学院 · 22301142</span></div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)}>{t('nav.profile')}</Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}><Languages size={14} /> {t('nav.settings')}</Link>
                  <div className="menu-divider" />
                  <span className="menu-label"><Sparkles size={14} /> {t('menu.demoControl')}</span>
                  <button type="button" onClick={() => applyScenario('new')}>{t('menu.newStudent')}</button>
                  <button type="button" onClick={() => applyScenario('active')}>{t('menu.activeStudent')}</button>
                  <button type="button" onClick={() => applyScenario('organizer')}>{t('menu.organizer')}</button>
                  <button type="button" onClick={() => { send({ type: 'RESET' }, t('menu.restore')); setProfileOpen(false); navigate('/') }}>{t('menu.restore')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main key={location.pathname} className="page-enter">{children}</main>

      <NavLink className="desktop-ai-entry" to="/campus/ai" aria-label={t('campus.module.ai')}><Sparkles size={19} /><span>{t('campus.module.ai')}</span></NavLink>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {bottomNavItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/' || to === '/campus'} aria-current={to === '/campus' && isCampusPage ? 'page' : undefined} className={({ isActive }) => [to === '/campus/ai' ? 'nav-ai' : '', (to === '/campus' ? isCampusPage : isActive) ? 'active' : ''].filter(Boolean).join(' ')}><span className="nav-icon"><Icon size={20} /></span><span>{t(label)}</span></NavLink>
        ))}
      </nav>

      <Modal open={searchOpen} title={t('nav.search')} onClose={() => { setSearchOpen(false); setQuery('') }}>
        <label className="search-field">
          <Search size={19} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('common.searchPlaceholder')} />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}
        </label>
        <div className="search-results">
          {!query && <div className="empty-state compact"><CalendarDays size={24} /><p>{t('search.hint')}</p></div>}
          {query && results.length === 0 && <div className="empty-state compact"><p>{t('search.noResults')}</p></div>}
          {results.map((result) => (
            <button key={`${result.path}-${result.id}`} type="button" onClick={() => { navigate(result.path); setSearchOpen(false); setQuery('') }}>
              <span><strong>{result.title}</strong><small>{result.meta}</small></span><span>→</span>
            </button>
          ))}
        </div>
      </Modal>
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
      </LocalizationBoundary>
    </div>
  )
}
