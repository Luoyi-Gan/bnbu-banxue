import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EventCard, EventStatus } from '../components/events/EventCard'
import { EventScanner } from '../components/events/EventScanner'
import { EventTicketCard } from '../components/events/EventTicketCard'
import { Modal } from '../components/feedback/Modal'
import { coffeeSlots, currentUser, events, hosts, organizations, teachers } from '../data/mockData'
import { useLanguage } from '../i18n/LanguageContext'
import { useDemo } from '../store/DemoStore'
import { getCheckInSummary } from '../store/demoReducer'
import type { Event, EventCategory, Guest, RegistrationStatus } from '../types'

const registrationLabel = (event: Event, status?: RegistrationStatus): string => {
  if (status === 'going') return 'action.going'
  if (status === 'pending') return 'action.pending'
  if (status === 'waitlist') return 'action.waitlist'
  if (status === 'checked_in') return 'action.checkedIn'
  if (event.capacity !== null && event.attendeeCount >= event.capacity) return 'action.joinWaitlist'
  if (event.registrationMode === 'approval') return 'action.requestJoin'
  return 'action.register'
}

const registrationCopyKey = (status?: RegistrationStatus): string | null => {
  if (status === 'going') return 'event.rsvp.goingCopy'
  if (status === 'pending') return 'event.rsvp.pendingCopy'
  if (status === 'waitlist') return 'event.rsvp.waitlistCopy'
  if (status === 'checked_in') return 'event.rsvp.checkedInCopy'
  return null
}

export function HomePage() {
  const { state, allEvents } = useDemo()
  const { t, message } = useLanguage()
  const today = allEvents.filter((event) => event.temporal === 'Today').slice(0, 3)
  const recommended = allEvents.filter((event) => ['ai-agent-workshop', 'badminton-night', 'startup-meetup', 'marketing-case-night'].includes(event.id))
  const upcoming = allEvents.filter((event) => {
    const status = state.registrations[event.id]
    return status && !['cancelled', 'rejected'].includes(status)
  }).slice(0, 4)
  const bookingCount = Object.keys(state.coffeeBookings).length
  const sportsSummary = getCheckInSummary(state)
  const sportsPercent = Math.min(100, Math.round((sportsSummary.totalHours / 20) * 100))
  const coursePercent = Math.min(100, Math.round((sportsSummary.courseHours / 10) * 100))
  const otherPercent = Math.min(100, Math.round((sportsSummary.otherHours / 10) * 100))

  return (
    <div className="page-container home-page">
      <section className="home-intro">
        <div>
          <span className="eyebrow">{t('home.term')}</span>
          <h1>{t('home.greeting')}</h1>
          <p>{t('home.question')}</p>
        </div>
        <div className="student-identity"><span>工商管理学院</span><strong>22301142</strong></div>
      </section>

      <section className="today-stage">
        <div className="section-heading light-heading">
          <div><span className="eyebrow">{t('home.campusToday')}</span><h2>{t('home.todayAt')}</h2></div>
          <Link to="/discover">{t('home.discoverAll')} <ArrowRight size={17} /></Link>
        </div>
        <div className="today-grid">
          {today.map((event, index) => (
            <Link to={`/events/${event.id}`} className={`today-card ${event.cover} ${index === 0 ? 'today-card-featured' : ''}`} key={event.id}>
              <span className="today-time">{event.timeLabel}</span>
              <div><EventStatus status={state.registrations[event.id]} /><h3>{event.title}</h3><p><MapPin size={15} />{event.location}</p></div>
              <span className="today-going"><Users size={15} /> {t('common.attendingCount', { count: event.attendeeCount + (state.attendeeDeltas[event.id] ?? 0) })}</span>
            </Link>
          ))}
          <Link className="today-card coffee-promo" to="/coffee-chat/teachers/prof-zhang">
            <span className="today-time">{t('home.tomorrow')}</span>
            <div><span className="mini-label">COFFEE CHAT</span><h3>{t('home.chatZhang')}</h3><p>Marketing · Career Planning</p></div>
            <span className="today-going">{t('home.spotsLeft')} <ArrowRight size={15} /></span>
          </Link>
        </div>
      </section>

      <section className="home-dashboard">
        <article className="sports-card">
          <div className="sports-topline"><span className="eyebrow">{t('home.sportsProgress')}</span><span>{sportsSummary.totalHours.toFixed(1).replace('.0', '')}h / 20h</span></div>
          <div className="progress-ring" aria-label={`${sportsPercent} percent of sports hours complete`}><strong>{sportsPercent}%</strong><span>{t('common.complete')}</span></div>
          <div className="sports-copy"><h2>{sportsPercent >= 100 ? t('checkin.goalReached') : t('checkin.remaining', { hours: Math.max(0, 20 - sportsSummary.totalHours).toFixed(1).replace('.0', '') })}</h2><p>{t('home.sportsStory')}</p><Link className="text-link" to="/check-in">{t('home.checkinEntry')} <ChevronRight size={16} /></Link><Link className="teaching-context-link" to="/teaching">{t('home.teachingEntry')} <ArrowRight size={14} /></Link></div>
          <div className="sports-bars">
            <label><span>{t('checkin.course')}</span><strong>{sportsSummary.courseHours.toFixed(1).replace('.0', '')} / 10h</strong><i><b style={{ width: `${coursePercent}%` }} /></i></label>
            <label><span>{t('checkin.other')}</span><strong>{sportsSummary.otherHours.toFixed(1).replace('.0', '')} / 10h</strong><i><b style={{ width: `${otherPercent}%` }} /></i></label>
          </div>
        </article>
        <article className="journey-preview">
          <div className="section-heading"><div><span className="eyebrow">{t('home.journeyEyebrow')}</span><h2>{t('home.journeyTitle')}</h2></div><Link to="/profile">{t('home.viewProfile')}</Link></div>
          <div className="journey-mini-list">
            {state.journey.slice(0, 3).map((item) => <div key={item.id}><span className={`journey-dot dot-${item.kind}`} /><p><strong>{message(item.titleMessage, item.title)}</strong><small>{message(item.detailMessage, item.detail)}</small></p></div>)}
          </div>
          <Link className="graph-teaser" to="/profile/graph"><span><Sparkles size={18} /> Campus Graph</span><strong>{t('home.connectedNodes', { count: 5 + state.followedHosts.length + state.memberships.length + Object.keys(state.registrations).length })}</strong><ArrowRight size={18} /></Link>
        </article>
      </section>

      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">{t('home.recommendedEyebrow')}</span><h2>{t('home.recommendedTitle')}</h2></div><Link to="/discover">{t('home.seeMore')}</Link></div>
        <div className="event-grid">{recommended.map((event) => <EventCard event={event} key={event.id} />)}</div>
      </section>

      <section className="home-columns content-section">
        <div>
          <div className="section-heading"><h2>{t('home.communitiesTitle')}</h2><Link to="/campus/organizations">{t('profile.explore')}</Link></div>
          <div className="community-list">
            {organizations.filter((organization) => state.memberships.includes(organization.id)).map((organization) => (
              <Link to={`/organizations/${organization.id}`} key={organization.id}><span className="org-monogram" style={{ background: organization.color }}>{organization.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{organization.name}</strong><small>{t('common.upcomingEvents', { count: organization.upcomingEventCount })}</small></span><ChevronRight size={18} /></Link>
            ))}
            {state.memberships.length === 0 && <div className="empty-state compact"><p>{t('home.joinHint')}</p><Link className="button button-secondary" to="/campus/organizations">{t('home.exploreOrgs')}</Link></div>}
          </div>
        </div>
        <div>
          <div className="section-heading"><h2>{t('home.upcoming')}</h2><Link to="/my-events">{t('nav.myEvents')}</Link></div>
          <div className="upcoming-list">
            {upcoming.map((event) => <Link to={`/events/${event.id}`} key={event.id}><span className="upcoming-date">{event.dateLabel}</span><span><strong>{event.title}</strong><small>{event.timeLabel} · {event.location}</small></span><EventStatus status={state.registrations[event.id]} /></Link>)}
            {bookingCount > 0 && <Link to="/coffee-chat"><span className="upcoming-date">CHAT</span><span><strong>{t('home.coffeeBooking')}</strong><small>{t('home.coffeeCount', { count: bookingCount })}</small></span><span className="status-pill status-going">{t('coffee.confirmed')}</span></Link>}
          </div>
        </div>
      </section>
    </div>
  )
}

export function DiscoverPage() {
  const { allEvents } = useDemo()
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [temporal, setTemporal] = useState('All dates')
  const categories = ['全部', '运动', '学术', '社团', 'Workshop', '比赛', '讲座', '英语', '创业', 'Coffee Chat', '校友']
  const times = ['All dates', 'Today', 'Tomorrow', 'This Week', 'Weekend']
  const categoryLabel = (value: string) => (value === '全部' ? t('filter.all') : t(`category.${value}`))
  const temporalLabel = (value: string) => (value === 'All dates' ? t('filter.allDates') : t(`temporal.${value}`))
  const filtered = allEvents.filter((event) => {
    const matchesQuery = `${event.title} ${event.subtitle} ${event.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (category === '全部' || event.category === category) && (temporal === 'All dates' || event.temporal === temporal)
  })
  const featured = allEvents.find((event) => event.featured)!
  const heading = temporal === 'All dates' && category === '全部' ? t('discover.popular') : category !== '全部' ? categoryLabel(category) : temporalLabel(temporal)

  return (
    <div className="page-container">
      <header className="page-hero discover-hero">
        <span className="eyebrow">{t('discover.eyebrow')}</span>
        <h1>{t('discover.title')}</h1>
        <p>{t('discover.subtitle')}</p>
        <label className="discover-search"><Search size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('common.searchPlaceholder')} /><span>⌘ K</span></label>
      </header>
      <div className="filter-row" aria-label={t('discover.categories')}>{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} key={item}>{categoryLabel(item)}</button>)}</div>
      <div className="time-filter"><Filter size={16} /><span>{t('filter.when')}</span>{times.map((item) => <button type="button" className={temporal === item ? 'is-active' : ''} onClick={() => setTemporal(item)} key={item}>{temporalLabel(item)}</button>)}</div>

      {!query && category === '全部' && temporal === 'All dates' && (
        <section className="featured-event">
          <div className={`featured-cover ${featured.cover}`}><span>FEATURED / BNBU</span><strong>BUILD<br />WHAT'S<br />NEXT.</strong></div>
          <div className="featured-copy"><span className="eyebrow">Wednesday · 19:30</span><h2>{featured.title}</h2><p>{featured.subtitle}</p><div className="feature-facts"><span><MapPin size={17} />{featured.location}</span><span><Users size={17} />{t('discover.attending', { count: featured.attendeeCount })}</span></div><Link className="button button-dark" to={`/events/${featured.id}`}>{t('discover.viewEvent')} <ArrowRight size={17} /></Link></div>
        </section>
      )}
      <section className="content-section">
        <div className="section-heading"><div><span className="eyebrow">{t('discover.curated', { count: filtered.length })}</span><h2>{heading}</h2></div></div>
        {filtered.length > 0 ? <div className="event-grid">{filtered.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state"><Search size={30} /><h3>{t('discover.emptyTitle')}</h3><p>{t('discover.emptyHint')}</p><button className="button button-secondary" type="button" onClick={() => { setQuery(''); setCategory('全部'); setTemporal('All dates') }}>{t('discover.clearFilters')}</button></div>}
      </section>
      <section className="host-strip"><div><span className="eyebrow">{t('discover.hostsEyebrow')}</span><h2>{t('discover.hostsTitle')}</h2></div><div>{hosts.slice(0, 5).map((host) => <Link to={`/hosts/${host.id}`} key={host.id}><span style={{ background: host.color }}>{host.shortName}</span><strong>{host.name}</strong></Link>)}</div></section>
    </div>
  )
}

export function EventDetailPage() {
  const { id = '' } = useParams()
  const { state, allEvents, send } = useDemo()
  const { t } = useLanguage()
  const event = allEvents.find((item) => item.id === id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  if (!event) return <NotFoundPage />
  const host = hosts.find((item) => item.id === event.hostId)
  const status = state.registrations[event.id]
  const attendeeCount = event.attendeeCount + (state.attendeeDeltas[event.id] ?? 0)
  const related = allEvents.filter((item) => item.id !== event.id && (item.hostId === event.hostId || item.category === event.category)).slice(0, 3)
  const canCancel = status && !['cancelled', 'checked_in', 'rejected'].includes(status)
  const ticket = Object.values(state.eventTickets).find((item) => item.eventId === event.id && item.attendeeId === currentUser.id)
  const actionLabel = registrationLabel(event, status)
  const actionLabelText = t(actionLabel)
  const supportingCopyKey = registrationCopyKey(status)

  const confirmRegistration = () => {
    const toast = event.registrationMode === 'approval'
      ? t('toast.requestSent')
      : event.capacity !== null && event.attendeeCount >= event.capacity
        ? t('toast.waitlisted')
        : t('toast.register', { title: event.title })
    send({ type: 'REGISTER_EVENT', event }, toast)
    setConfirmOpen(false)
  }

  return (
    <div className="page-container event-detail-page">
      <Link className="back-link" to="/discover"><ArrowLeft size={17} /> Back to Discover</Link>
      <div className="event-detail-layout">
        <article className="event-main">
          <div className={`event-hero-cover ${event.cover}`} role="img" aria-label={`${event.title} abstract event cover`}><span>{event.category} / BNBU CAMPUS</span><strong>{event.title}</strong><small>{event.dateLabel}</small></div>
          <div className="event-title-block"><div className="tag-row"><span>{event.category}</span>{event.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><h1>{event.title}</h1><p>{event.subtitle}</p></div>
          <div className="event-fact-grid"><div><CalendarDays /><span><strong>{event.dateLabel}</strong><small>{event.timeLabel}</small></span></div><div><MapPin /><span><strong>{event.location}</strong><small>BNBU Campus</small></span></div><div><Users /><span><strong>{attendeeCount} attending</strong><small>{event.capacity ? `${Math.max(0, event.capacity - attendeeCount)} spots available` : 'Open campus event'}</small></span></div></div>
          <section className="detail-section"><h2>About this event</h2><p>{event.description}</p><p>More than a place on the calendar, this event is designed to help students discover a community and leave with a clear next connection.</p></section>
          <section className="detail-section"><h2>Run of show</h2><ol className="agenda-list">{event.agenda.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol></section>
          {host && <section className="host-card"><span className="host-avatar" style={{ background: host.color }}>{host.shortName}</span><div><span className="eyebrow">{t('event.hostedBy')}</span><h2>{host.name} {host.verified && <BadgeCheck size={19} />}</h2><p>{host.description}</p><div className="tag-row">{host.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><Link className="button button-secondary" to={`/hosts/${host.id}`}>{t('event.viewHost')}</Link></section>}
          <section className="detail-section"><div className="section-heading"><h2>People you may meet</h2><span>{attendeeCount} attending</span></div><div className="attendee-stack-large">{['雨', '明', '嘉', '楠', 'Leo', '+82'].map((avatar, index) => <span key={avatar} style={{ zIndex: 8 - index }}>{avatar}</span>)}</div></section>
          <section className="detail-section"><h2>Location</h2><div className="map-card"><div className="map-grid"><span className="map-pin"><MapPin size={22} /></span></div><div><strong>{event.location}</strong><p>BNBU Campus · Tap directions on the day of the event</p></div></div></section>
          <section className="content-section"><div className="section-heading"><h2>Related Events</h2></div><div className="event-grid">{related.map((item) => <EventCard compact event={item} key={item.id} />)}</div></section>
        </article>
        <aside className="rsvp-card">
          <span className="eyebrow">{event.dateLabel}</span><h2>{event.timeLabel}</h2><p><MapPin size={16} /> {event.location}</p><div className="rsvp-attendees"><div className="attendee-stack">{['雨', '明', '嘉', '+'].map((item) => <span key={item}>{item}</span>)}</div><span>{t('event.rsvp.joining', { count: attendeeCount })}</span></div>
          {status && status !== 'cancelled' && <EventStatus status={status} />}
          {supportingCopyKey && <p className="rsvp-supporting">{t(supportingCopyKey)}</p>}
          {!status || status === 'cancelled' ? <button className="button button-primary button-full" type="button" onClick={() => setConfirmOpen(true)}>{actionLabelText}</button> : canCancel ? <button className="button button-secondary button-full" type="button" onClick={() => send({ type: 'CANCEL_REGISTRATION', event }, t('toast.cancelled'))}>{t('event.rsvp.cancel')}</button> : null}
          {ticket && <Link className="button button-ticket button-full" to={`/events/${event.id}/ticket`}><Ticket size={18} /> {t('ticket.view')}</Link>}
          {status === 'checked_in' && <div className="checked-in-callout"><CheckCircle2 size={20} /> {t('event.rsvp.checkedInAt', { time: '19:02' })}</div>}
          <div className="rsvp-secondary"><button type="button" onClick={() => send({ type: 'TOGGLE_FAVORITE', eventId: event.id }, state.favorites.includes(event.id) ? t('toast.removed') : t('toast.saved'))}><Bookmark size={16} fill={state.favorites.includes(event.id) ? 'currentColor' : 'none'} /> {state.favorites.includes(event.id) ? t('event.rsvp.saved') : t('common.save')}</button><button type="button" onClick={() => setShareOpen(true)}><Share2 size={16} /> {t('event.rsvp.share')}</button></div>
          <button className="contact-host" type="button" onClick={() => send({ type: 'MARK_ALL_NOTIFICATIONS' }, t('toast.hostContact'))}><MessageCircle size={17} /> {t('event.rsvp.contactHost')}</button>
        </aside>
      </div>
      <div className="mobile-rsvp-bar"><span><strong>{event.dateLabel}</strong><small>{event.timeLabel} · {event.location}</small></span>{status && status !== 'cancelled' ? <EventStatus status={status} /> : <button className="button button-primary" type="button" onClick={() => setConfirmOpen(true)}>{actionLabelText}</button>}</div>

      <Modal open={confirmOpen} title={actionLabelText} onClose={() => setConfirmOpen(false)} footer={<><button className="button button-ghost" type="button" onClick={() => setConfirmOpen(false)}>{t('common.notNow')}</button><button className="button button-primary" type="button" onClick={confirmRegistration}>{actionLabelText}</button></>}>
        <div className="confirmation-event"><div className={`mini-cover ${event.cover}`} /><div><h3>{event.title}</h3><p>{event.dateLabel} · {event.timeLabel}</p><p>{event.location}</p></div></div><p className="modal-note">{t('event.confirm.hint')}</p>
      </Modal>
      <Modal open={shareOpen} title={t('event.share.title')} onClose={() => setShareOpen(false)}><div className="share-options"><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); setShareOpen(false); send({ type: 'TOGGLE_FAVORITE', eventId: '__share__' }, t('event.share.copied')) }}>{t('event.share.copyLink')}</button><button type="button" onClick={() => setShareOpen(false)}>{t('event.share.toCommunity')}</button></div></Modal>
    </div>
  )
}

export function EventTicketPage() {
  const { id = '' } = useParams()
  const { state, allEvents } = useDemo()
  const { t } = useLanguage()
  const event = allEvents.find((item) => item.id === id)
  if (!event) return <NotFoundPage />
  const ticket = Object.values(state.eventTickets).find((item) => item.eventId === event.id && item.attendeeId === currentUser.id)

  return (
    <div className="ticket-page">
      <div className="ticket-page-orb ticket-page-orb-one" />
      <div className="ticket-page-orb ticket-page-orb-two" />
      <header className="ticket-page-header">
        <Link className="back-link" to={`/events/${event.id}`}><ArrowLeft size={17} /> {t('ticket.backToEvent')}</Link>
        <span className="ticket-page-brand"><span>B</span> BNBU Campus Hub</span>
      </header>
      <main className="ticket-page-layout">
        <section className="ticket-page-copy">
          <span className="eyebrow"><Ticket size={16} /> {t('ticket.eyebrow')}</span>
          <h1>{t('ticket.title')}</h1>
          <p>{t('ticket.subtitle')}</p>
          <div className="ticket-separation-note"><ShieldCheck size={19} /><span>{t('event.checkInSeparate')}</span></div>
        </section>
        {ticket ? <EventTicketCard event={event} ticket={ticket} /> : (
          <div className="ticket-empty panel"><Ticket size={38} /><h2>{t('ticket.noTicket')}</h2><p>{t('ticket.noTicketHint')}</p><Link className="button button-primary" to={`/events/${event.id}`}>{t('ticket.backToEvent')}</Link></div>
        )}
      </main>
    </div>
  )
}

export function HostDetailPage() {
  const { id = '' } = useParams()
  const { state, allEvents, send } = useDemo()
  const { t } = useLanguage()
  const host = hosts.find((item) => item.id === id)
  if (!host) return <NotFoundPage />
  const following = state.followedHosts.includes(host.id)
  const hostEvents = allEvents.filter((event) => event.hostId === host.id)
  return (
    <div className="page-container">
      <section className="host-hero" style={{ '--host-color': host.color } as React.CSSProperties}>
        <div className="host-avatar hero-avatar" style={{ background: host.color }}>{host.shortName}</div><div><span className="eyebrow">{t('host.verified')}</span><h1>{host.name} <BadgeCheck size={22} /></h1><p>{host.description}</p><div className="tag-row">{host.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="host-actions"><button className={`button ${following ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => send({ type: 'TOGGLE_FOLLOW_HOST', host }, following ? t('org.toastUnfollowed') : t('org.toastFollowed', { host: host.name }))}>{following ? <><Check size={17} /> {t('org.following')}</> : t('org.follow')}</button><span><strong>{(host.followers + (following ? 1 : 0)).toLocaleString()}</strong> {t('host.followers', { count: host.followers + (following ? 1 : 0) })}</span></div>
      </section>
      <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{t('host.upcoming')}</span><h2>{t('host.eventsBy', { host: host.name })}</h2></div></div><div className="event-grid">{hostEvents.length ? hostEvents.map((event) => <EventCard event={event} key={event.id} />) : <div className="empty-state"><p>{t('host.empty')}</p></div>}</div></section>
      <section className="host-detail-grid"><article className="panel"><div className="section-heading"><h2>{t('host.members')}</h2><span>{t('host.featured', { count: host.members.length })}</span></div>{host.members.map((member) => <div className="member-row" key={member}><span>{member.slice(0, 1)}</span><strong>{member}</strong><small>{t('host.campusMember')}</small></div>)}</article><article className="panel"><span className="eyebrow">{t('host.fromCommunity')}</span><h2>{t('host.communityTitle')}</h2><p>{t('host.communityBody')}</p><Link className="text-link" to="/campus/community">{t('host.readPosts')} <ArrowRight size={16} /></Link></article></section>
    </div>
  )
}

export function CalendarPage() {
  const { state, allEvents } = useDemo()
  const { t } = useLanguage()
  const [view, setView] = useState('Agenda')
  const registered = allEvents.filter((event) => {
    const status = state.registrations[event.id]
    return status && !['cancelled', 'rejected'].includes(status)
  })
  const bookings = Object.values(state.coffeeBookings).map((booking) => {
    const slot = coffeeSlots.find((item) => item.id === booking.slotId)
    const teacher = teachers.find((item) => item.id === slot?.teacherId)
    return { booking, slot, teacher }
  })
  return (
    <div className="page-container">
      <header className="page-hero page-hero-row"><div><span className="eyebrow">{t('calendar.eyebrow')}</span><h1>{t('calendar.title')}</h1><p>{t('calendar.subtitle')}</p></div><div className="segmented-control">{['Month', 'Week', 'Agenda'].map((item) => <button type="button" className={view === item ? 'is-active' : ''} onClick={() => setView(item)} key={item}>{item}</button>)}</div></header>
      {view === 'Agenda' ? <div className="agenda-calendar">
        <div className="calendar-month"><button type="button" aria-label="Previous month">‹</button><strong>October 2026</strong><button type="button" aria-label="Next month">›</button></div>
        {registered.length === 0 && bookings.length === 0 && <div className="empty-state"><CalendarDays size={32} /><h3>{t('calendar.agendaEmpty')}</h3><Link className="button button-primary" to="/discover">{t('calendar.discover')}</Link></div>}
        {registered.map((event, index) => <div className="agenda-day" key={event.id}><div className="agenda-date"><span>{['WED', 'THU', 'FRI', 'SAT'][index % 4]}</span><strong>{18 + index}</strong></div><Link to={`/events/${event.id}`} className={`agenda-event agenda-${event.category}`}><span className="agenda-time">{event.timeLabel}</span><span><strong>{event.title}</strong><small>{event.location} · {hosts.find((host) => host.id === event.hostId)?.name}</small></span><EventStatus status={state.registrations[event.id]} /><ChevronRight size={18} /></Link></div>)}
        {bookings.map(({ booking, slot, teacher }) => slot && teacher && <div className="agenda-day" key={booking.id}><div className="agenda-date"><span>WED</span><strong>21</strong></div><Link to={`/coffee-chat/teachers/${teacher.id}`} className="agenda-event agenda-coffee"><span className="agenda-time">{slot.timeLabel}</span><span><strong>{t('calendar.coffeeWith', { teacher: teacher.englishName })}</strong><small>{teacher.location} · {booking.topic}</small></span><span className="status-pill status-going">{t('coffee.confirmed')}</span><ChevronRight size={18} /></Link></div>)}
      </div> : <CalendarConcept view={view} events={registered} />}
    </div>
  )
}

function CalendarConcept({ view, events: calendarEvents }: { view: string; events: Event[] }) {
  const { t } = useLanguage()
  const cells = Array.from({ length: view === 'Month' ? 35 : 7 }, (_, index) => index)
  return <div className={`calendar-concept calendar-${view.toLowerCase()}`}><div className="calendar-weekdays">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{cells.map((cell) => <div key={cell}><span>{view === 'Month' ? Math.max(1, cell - 2) : cell + 18}</span>{calendarEvents[cell % Math.max(1, calendarEvents.length)] && cell % 3 === 0 && <Link to={`/events/${calendarEvents[cell % calendarEvents.length].id}`}>{calendarEvents[cell % calendarEvents.length].title}</Link>}</div>)}</div><p className="concept-note">{t('calendar.conceptNote', { view })}</p></div>
}

export function MyEventsPage() {
  const { state, allEvents } = useDemo()
  const { t } = useLanguage()
  const [tab, setTab] = useState('Upcoming')
  const registered = allEvents.filter((event) => {
    const status = state.registrations[event.id]
    return status && !['cancelled', 'rejected'].includes(status)
  })
  const saved = allEvents.filter((event) => state.favorites.includes(event.id))
  const past = events.filter((event) => ['english-corner'].includes(event.id))
  const display = tab === 'Upcoming' ? registered : tab === 'Hosting' ? state.createdEvents : tab === 'Saved' ? saved : past
  const tabLabel = (item: string) => item === 'Upcoming' ? t('myevents.tab.upcoming') : item === 'Hosting' ? t('myevents.tab.hosting') : item === 'Past' ? t('myevents.tab.past') : t('myevents.tab.saved')
  return (
    <div className="page-container">
      <header className="page-hero page-hero-row"><div><span className="eyebrow">{t('myevents.eyebrow')}</span><h1>{t('myevents.title')}</h1><p>{t('myevents.subtitle')}</p></div><Link className="button button-primary" to="/create">{t('myevents.create')}</Link></header>
      <div className="tabs">{['Upcoming', 'Hosting', 'Past', 'Saved'].map((item) => <button className={tab === item ? 'is-active' : ''} type="button" onClick={() => setTab(item)} key={item}>{tabLabel(item)}<span>{item === 'Upcoming' ? registered.length : item === 'Hosting' ? state.createdEvents.length : item === 'Saved' ? saved.length : past.length}</span></button>)}</div>
      {display.length || (tab === 'Upcoming' && Object.keys(state.coffeeBookings).length) ? <div className="event-list-wide">{display.map((event) => { const ticket = Object.values(state.eventTickets).find((item) => item.eventId === event.id && item.attendeeId === currentUser.id); return <article key={event.id}><Link className={`wide-cover ${event.cover}`} to={tab === 'Hosting' ? `/manage/${event.id}` : `/events/${event.id}`}><span>{event.dateLabel}</span></Link><div><span className="eyebrow">{event.category} · {event.timeLabel}</span><h2>{event.title}</h2><p><MapPin size={16} /> {event.location}</p><EventStatus status={tab === 'Past' ? 'checked_in' : state.registrations[event.id]} />{ticket && tab !== 'Hosting' && <Link className="ticket-inline-link" to={`/events/${event.id}/ticket`}><Ticket size={15} /> {t('ticket.view')}</Link>}</div><Link className="icon-button" to={tab === 'Hosting' ? `/manage/${event.id}` : `/events/${event.id}`}><ArrowRight size={19} /></Link></article> })}{tab === 'Upcoming' && Object.values(state.coffeeBookings).map((booking) => { const slot = coffeeSlots.find((item) => item.id === booking.slotId); const teacher = teachers.find((item) => item.id === slot?.teacherId); if (!slot || !teacher) return null; return <article key={booking.id}><Link className="wide-cover coffee-wide-cover" to={`/coffee-chat/teachers/${teacher.id}`}><span>{slot.dateLabel}</span><strong>COFFEE<br />CHAT</strong></Link><div><span className="eyebrow">Coffee Chat · {slot.timeLabel}</span><h2>{t('calendar.coffeeWith', { teacher: teacher.englishName })}</h2><p><MapPin size={16} /> {teacher.location}</p><span className="status-pill status-going">{t('coffee.confirmed')}</span></div><Link className="icon-button" to={`/coffee-chat/teachers/${teacher.id}`}><ArrowRight size={19} /></Link></article> })}</div> : <div className="empty-state"><CalendarDays size={32} /><h3>{tab === 'Hosting' ? t('myevents.emptyHosting') : t('myevents.emptyOther', { tab: tabLabel(tab) })}</h3><p>{t('myevents.emptyBody')}</p><Link className="button button-primary" to={tab === 'Hosting' ? '/create' : '/discover'}>{tab === 'Hosting' ? t('myevents.create') : t('myevents.discover')}</Link></div>}
    </div>
  )
}

interface CreateEventForm {
  title: string
  category: EventCategory
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: string
  registrationMode: 'open' | 'approval'
  waitlist: boolean
  visibility: 'public' | 'unlisted' | 'members'
}

const initialForm: CreateEventForm = {
  title: 'Marketing Case Night',
  category: '比赛' as EventCategory,
  description: 'Decode a real brand challenge with a small team, then share one clear recommendation.',
  date: '2026-10-22',
  startTime: '19:00',
  endTime: '21:00',
  location: 'T4-105',
  capacity: '30',
  registrationMode: 'approval',
  waitlist: true,
  visibility: 'public',
}

export function CreateEventPage() {
  const { send } = useDemo()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateEventForm>(initialForm)
  const [preview, setPreview] = useState(false)
  const makeEvent = (): Event => {
    const id = `marketing-case-night-${Date.now()}`
    return {
    id,
    slug: id,
    title: form.title,
    subtitle: 'A campus case experience hosted by students',
    description: form.description,
    cover: 'cover-marketing',
    category: form.category,
    tags: ['Marketing', 'Case', 'Teamwork'],
    startAt: `${form.date}T${form.startTime}:00+08:00`,
    endAt: `${form.date}T${form.endTime}:00+08:00`,
    dateLabel: 'THU · OCT 22',
    timeLabel: `${form.startTime}–${form.endTime}`,
    location: form.location,
    hostId: 'marketing-society',
    capacity: Number(form.capacity),
    attendeeCount: 1,
    registrationMode: form.registrationMode,
    waitlistEnabled: form.waitlist,
    visibility: form.visibility,
    featured: false,
    status: 'upcoming',
    eventType: 'competition',
    temporal: 'This Week',
    agenda: ['Welcome and case reveal', 'Team sprint', 'Recommendations and feedback'],
  }
  }
  const publish = (event?: FormEvent) => {
    event?.preventDefault()
    const created = makeEvent()
    send({ type: 'CREATE_EVENT', event: created }, t('create.published'))
    navigate(`/manage/${created.id}`)
  }
  return (
    <div className="page-container create-page">
      <header className="page-hero"><span className="eyebrow">{t('create.eyebrow')}</span><h1>{t('create.title')}</h1><p>{t('create.subtitle')}</p></header>
      <form onSubmit={publish} className="create-layout">
        <div className="create-sections">
          <section className="form-section"><div className="form-section-number">01</div><div className="form-section-content"><h2>{t('create.cover')}</h2><p>{t('create.coverHint')}</p><div className="cover-picker"><div className="cover-marketing"><span>{t('create.templateNote')}</span><strong>{form.title || t('create.yourEvent')}</strong></div><button className="button button-secondary" type="button" onClick={() => send({ type: 'TOGGLE_FAVORITE', eventId: '__cover__' }, t('create.coverToast'))}>{t('create.chooseTemplate')}</button></div></div></section>
          <section className="form-section"><div className="form-section-number">02</div><div className="form-section-content"><h2>{t('create.basic')}</h2><div className="form-grid"><label className="field field-wide"><span>{t('create.eventName')}</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="field"><span>{t('create.category')}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as EventCategory })}>{(['比赛', 'Workshop', '创业', '运动', '学术'] as EventCategory[]).map((item) => <option value={item} key={item}>{t(`category.${item}`)}</option>)}</select></label><label className="field field-wide"><span>{t('create.description')}</span><textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div></div></section>
          <section className="form-section"><div className="form-section-number">03</div><div className="form-section-content"><h2>{t('create.whenWhere')}</h2><div className="form-grid"><label className="field"><span>{t('create.date')}</span><input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label className="field"><span>{t('create.startTime')}</span><input type="time" required value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label><label className="field"><span>{t('create.endTime')}</span><input type="time" required value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label><label className="field field-wide"><span>{t('create.location')}</span><input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label></div></div></section>
          <section className="form-section"><div className="form-section-number">04</div><div className="form-section-content"><h2>{t('create.registration')}</h2><div className="choice-grid"><button type="button" className={form.registrationMode === 'open' ? 'is-active' : ''} onClick={() => setForm({ ...form, registrationMode: 'open' })}><CheckCircle2 /><strong>{t('create.openRegistration')}</strong><span>{t('create.openHint')}</span></button><button type="button" className={form.registrationMode === 'approval' ? 'is-active' : ''} onClick={() => setForm({ ...form, registrationMode: 'approval' })}><CircleUserRound /><strong>{t('create.requireApproval')}</strong><span>{t('create.approvalHint')}</span></button></div><div className="form-grid"><label className="field"><span>{t('create.capacity')}</span><input min="1" type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label><label className="toggle-field"><span><strong>{t('create.waitlist')}</strong><small>{t('create.waitlistHint')}</small></span><input type="checkbox" checked={form.waitlist} onChange={(event) => setForm({ ...form, waitlist: event.target.checked })} /></label></div></div></section>
          <section className="form-section"><div className="form-section-number">05</div><div className="form-section-content"><h2>{t('create.visibility')}</h2><div className="segmented-control wide-control">{(['public', 'unlisted', 'members'] as const).map((item) => <button type="button" className={form.visibility === item ? 'is-active' : ''} onClick={() => setForm({ ...form, visibility: item })} key={item}>{item === 'public' ? t('create.public') : item === 'unlisted' ? t('create.unlisted') : t('create.membersOnly')}</button>)}</div></div></section>
        </div>
        <aside className="create-summary"><span className="eyebrow">{t('create.readyWhen')}</span><h2>{form.title}</h2><p>{form.date} · {form.startTime}</p><p>{form.location}</p><div><span>{t('create.registration')}</span><strong>{form.registrationMode === 'approval' ? t('create.requireApproval') : t('create.open')}</strong></div><div><span>{t('create.capacity')}</span><strong>{form.capacity}</strong></div><button className="button button-secondary button-full" type="button" onClick={() => setPreview(true)}>{t('create.preview')}</button><button className="button button-primary button-full" type="submit">{t('create.publish')}</button></aside>
      </form>
      <Modal open={preview} title={t('create.previewTitle')} onClose={() => setPreview(false)} footer={<><button className="button button-ghost" type="button" onClick={() => setPreview(false)}>{t('create.keepEditing')}</button><button className="button button-primary" type="button" onClick={() => publish()}>{t('create.publish')}</button></>}><div className="event-preview"><div className="cover-marketing"><span>{t('create.templateNote')}</span><strong>{form.title}</strong></div><span className="eyebrow">THU · {form.startTime} · {form.location}</span><h2>{form.title}</h2><p>{form.description}</p><div className="tag-row"><span>{t('create.capacity')} {form.capacity}</span><span>{form.registrationMode === 'approval' ? t('create.approvalRequired') : t('create.open')}</span></div></div></Modal>
    </div>
  )
}

export function ManageEventPage() {
  const { id = '' } = useParams()
  const { state, allEvents, send } = useDemo()
  const { t, localize } = useLanguage()
  const event = allEvents.find((item) => item.id === id)
  const guests = state.guestStatuses[id] ?? []
  const [filter, setFilter] = useState('All')
  if (!event) return <NotFoundPage />
  const filteredGuests = filter === 'All' ? guests : guests.filter((guest) => guest.status === filter.toLowerCase().replace(' ', '_'))
  const update = (guest: Guest, status: Guest['status']) => send(
    { type: 'UPDATE_GUEST', eventId: event.id, guestId: guest.id, status },
    { key: 'toast.guestStatus', values: { name: localize(guest.name), status: t(`status.${status}`) } },
  )
  const count = (status: Guest['status']) => guests.filter((guest) => guest.status === status).length
  return (
    <div className="page-container">
      <header className="manage-hero"><div><Link className="back-link" to="/my-events"><ArrowLeft size={17} /> {t('manage.backHosting')}</Link><span className="eyebrow">{t('manage.liveWorkspace')}</span><h1>{event.title}</h1><p>{event.dateLabel} · {event.timeLabel} · {event.location}</p></div><div><Link className="button button-secondary" to={`/events/${event.id}`}>{t('manage.viewEvent')} <ExternalLink size={16} /></Link><button className="icon-button" type="button" aria-label="More options"><MoreHorizontal /></button></div></header>
      <section className="metric-grid"><article><span>{t('manage.registrations')}</span><strong>{guests.length}</strong><small>{t('manage.localGuests')}</small></article><article><span>{t('manage.going')}</span><strong>{count('going')}</strong><small>{t('manage.confirmed')}</small></article><article><span>{t('manage.pending')}</span><strong>{count('pending')}</strong><small>{t('manage.needsReview')}</small></article><article><span>{t('manage.waitlist')}</span><strong>{count('waitlist')}</strong><small>{t('manage.readyToMove')}</small></article><article><span>{t('manage.checkedIn')}</span><strong>{count('checked_in')}</strong><small>{t('manage.atEvent')}</small></article></section>
      <EventScanner event={event} />
      <section className="guest-panel"><div className="section-heading"><div><span className="eyebrow">{t('manage.guestList')}</span><h2>{t('manage.peopleNotRows')}</h2></div><div className="segmented-control guest-filter">{['All', 'Going', 'Pending', 'Waitlist'].map((item) => <button type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} key={item}>{item === 'All' ? t('manage.all') : item === 'Going' ? t('manage.going') : item === 'Pending' ? t('manage.pending') : t('manage.waitlist')}</button>)}</div></div><div className="guest-list">{filteredGuests.map((guest) => <article key={guest.id}><span className="guest-avatar">{guest.name.slice(0, 1)}</span><span><strong>{guest.name}</strong><small>{t('manage.bnbuStudent')} · {guest.id.slice(-4)}</small></span><span className={`status-pill status-${guest.status}`}>{t(`status.${guest.status}`)}</span><div className="guest-actions">{guest.status === 'pending' && <><button className="button button-small button-primary" type="button" onClick={() => update(guest, 'going')}>{t('manage.approve')}</button><button className="button button-small button-ghost" type="button" onClick={() => update(guest, 'rejected')}>{t('manage.reject')}</button></>}{guest.status === 'waitlist' && <><button className="button button-small button-primary" type="button" onClick={() => update(guest, 'going')}>{t('manage.moveToGoing')}</button><button className="button button-small button-ghost" type="button" onClick={() => update(guest, 'rejected')}>{t('manage.reject')}</button></>}{guest.status === 'going' && <><button className="button button-small button-secondary" type="button" onClick={() => update(guest, 'checked_in')}>{t('manage.checkIn')}</button><button className="button button-small button-ghost" type="button" onClick={() => update(guest, 'rejected')}>{t('manage.markNotGoing')}</button></>}{guest.status === 'checked_in' && <span className="checked-label"><Check size={16} /> {t('status.checked_in')}</span>}</div></article>)}</div></section>
    </div>
  )
}

export function NotFoundPage() {
  const { t } = useLanguage()
  return <div className="page-container"><div className="empty-state not-found"><span className="eyebrow">{t('notfound.eyebrow')}</span><h1>{t('notfound.title')}</h1><p>{t('notfound.subtitle')}</p><Link className="button button-primary" to="/">{t('notfound.backHome')}</Link></div></div>
}
