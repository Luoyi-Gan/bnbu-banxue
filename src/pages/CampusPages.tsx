import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EventCard } from '../components/events/EventCard'
import { Modal } from '../components/feedback/Modal'
import { alumni, coffeeSlots, hosts, organizations, partners, posts, teachers } from '../data/mockData'
import { useLanguage } from '../i18n/LanguageContext'
import { useDemo } from '../store/DemoStore'
import type { CoffeeSlot, NotificationCategory } from '../types'
import { NotFoundPage } from './EventPages'

const campusModules = [
  { key: 'teaching', group: 'learning', title: 'campus.module.teaching', copy: 'campus.module.teachingCopy', eyebrow: 'campus.module.teachingEyebrow', to: '/teaching', icon: BadgeCheck, color: '#155eef' },
  { key: 'academic', group: 'learning', title: 'campus.module.academic', copy: 'campus.module.academicCopy', eyebrow: 'campus.module.academicEyebrow', to: '/campus/academic', icon: GraduationCap, color: '#7c3aed' },
  { key: 'coffee', group: 'people', title: 'campus.module.coffee', copy: 'campus.module.coffeeCopy', eyebrow: 'campus.module.coffeeEyebrow', to: '/coffee-chat', icon: Coffee, color: '#d97706' },
  { key: 'alumni', group: 'people', title: 'campus.module.alumni', copy: 'campus.module.alumniCopy', eyebrow: 'campus.module.alumniEyebrow', to: '/campus/alumni', icon: GraduationCap, color: '#a16207' },
  { key: 'organizations', group: 'connections', title: 'campus.module.organizations', copy: 'campus.module.organizationsCopy', eyebrow: 'campus.module.organizationsEyebrow', to: '/campus/organizations', icon: UsersRound, color: '#155eef' },
  { key: 'partner', group: 'connections', title: 'campus.module.partner', copy: 'campus.module.partnerCopy', eyebrow: 'campus.module.partnerEyebrow', to: '/campus/partners', icon: UserPlus, color: '#059669' },
  { key: 'community', group: 'connections', title: 'campus.module.community', copy: 'campus.module.communityCopy', eyebrow: 'campus.module.communityEyebrow', to: '/campus/community', icon: MessageCircle, color: '#7c3aed' },
]

const campusGroups = [
  { key: 'connections', title: 'campus.group.connections', eyebrow: 'campus.group.connectionsTitle' },
  { key: 'learning', title: 'campus.group.learning', eyebrow: 'campus.group.learningTitle' },
  { key: 'people', title: 'campus.group.people', eyebrow: 'campus.group.peopleTitle' },
]

const campusStory = [
  'campus.story.activity',
  'campus.story.organization',
  'campus.story.connection',
  'campus.story.community',
  'campus.story.profile',
  'campus.story.graph',
]

export function CampusPage() {
  const { state } = useDemo()
  const { t } = useLanguage()
  return (
    <div className="page-container">
      <header className="page-hero campus-hero"><div><span className="eyebrow">{t('campus.eyebrow')}</span><h1>Campus</h1><p>{t('campus.subtitle')}</p></div><Link className="campus-graph-link" to="/profile/graph"><Sparkles size={21} /><span><small>{t('campus.graphToday')}</small><strong>{t('campus.activeConnections', { count: state.memberships.length + state.followedHosts.length + Object.keys(state.registrations).length })}</strong></span><ArrowRight size={18} /></Link></header>
      <section className="campus-story">{campusStory.flatMap((key, index) => {
        const node = <span className={`story-node${index === 0 ? ' is-active' : ''}`} key={key}><strong>0{index + 1}</strong>{t(key)}</span>
        return index < campusStory.length - 1 ? [node, <i key={`sep-${index}`} />] : [node]
      })}</section>
      {campusGroups.map((group) => {
        const modules = campusModules.filter((module) => module.group === group.key)
        const single = modules.length === 1
        return (
          <section className="campus-group content-section" key={group.key}>
            <div className="section-heading"><div><span className="eyebrow">{t(group.eyebrow)}</span><h2>{t(group.title)}</h2></div></div>
            <div className="module-grid">{modules.map(({ icon: Icon, ...module }) => <Link className={`module-card${single ? ' module-card-wide' : ''}`} to={module.to} style={{ '--module-color': module.color } as React.CSSProperties} key={module.key}><span className="module-icon"><Icon /></span><span className="eyebrow">{t(module.eyebrow)}</span><h2>{t(module.title)}</h2><p>{t(module.copy)}</p><span className="text-link">{t('campus.explore')} <ArrowRight size={16} /></span></Link>)}</div>
          </section>
        )
      })}
      <section className="campus-feature"><div className="campus-feature-art"><span>BNBU</span><strong>REAL LIFE<br />BECOMES<br />YOUR STORY</strong></div><div><span className="eyebrow">{t('campus.feature.eyebrow')}</span><h2>{t('campus.feature.title')}</h2><p>{t('campus.feature.copy')}</p><Link className="button button-dark" to="/discover">{t('campus.feature.cta')} <ArrowRight size={17} /></Link></div></section>
    </div>
  )
}

export function CoffeeChatPage() {
  const { state } = useDemo()
  const { localize, t } = useLanguage()
  return (
    <div className="page-container">
      <header className="page-hero coffee-hero"><div><span className="eyebrow">{t('coffee.eyebrow')}</span><h1>{t('coffee.title1')}<br />{t('coffee.title2')}</h1><p>{t('coffee.subtitle')}</p></div><div className="coffee-cup-art"><span>15:30</span><i /><strong>COFFEE<br />CHAT</strong></div></header>
      <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{t('coffee.facultyHosts')}</span><h2>{t('coffee.facultyHostsTitle')}</h2></div></div><div className="teacher-grid">{teachers.map((teacher) => { const slots = coffeeSlots.filter((slot) => slot.teacherId === teacher.id && slot.status === 'available'); const booked = coffeeSlots.some((slot) => slot.teacherId === teacher.id && state.coffeeBookings[slot.id]); return <Link className="teacher-card" to={`/coffee-chat/teachers/${teacher.id}`} key={teacher.id}><div className="teacher-portrait" style={{ background: teacher.color }}><span>{teacher.name.slice(0, 1)}</span><small>{localize(teacher.fields[0])}</small></div><div><span className="eyebrow">{localize(teacher.availability)}</span><h2>{localize(teacher.name)}</h2><p>{teacher.fields.map(localize).join(' / ')}</p><div className="tag-row">{teacher.topics.slice(0, 3).map((topic) => <span key={topic}>{localize(topic)}</span>)}</div><div className="teacher-card-footer"><span><MapPin size={15} /> {teacher.location}</span><strong>{booked ? t('coffee.confirmed') : t('coffee.slots', { count: slots.length })} <ArrowRight size={16} /></strong></div></div></Link> })}</div></section>
      <section className="coffee-explainer"><span className="eyebrow">{t('coffee.explainerEyebrow')}</span><h2>{t('graph.node.Event')} <span>+</span> {t('graph.node.Teacher')} <span>+</span> {t('common.timeSlot')} <span>+</span> {t('common.booking')}</h2><p>{t('coffee.explainer')}</p></section>
    </div>
  )
}

export function TeacherDetailPage() {
  const { id = '' } = useParams()
  const { state, send } = useDemo()
  const { localize, t } = useLanguage()
  const teacher = teachers.find((item) => item.id === id)
  const slots = coffeeSlots.filter((slot) => slot.teacherId === id)
  const [selected, setSelected] = useState<CoffeeSlot | null>(null)
  const [topic, setTopic] = useState('Marketing Career Planning')
  if (!teacher) return <NotFoundPage />
  const bookingForTeacher = slots.find((slot) => state.coffeeBookings[slot.id])
  const confirm = () => {
    if (!selected) return
    send({ type: 'BOOK_COFFEE', slot: selected, topic, teacher }, t('coffee.toastConfirmed', { teacher: teacher.englishName }))
    setSelected(null)
  }
  return (
    <div className="page-container">
      <Link className="back-link" to="/coffee-chat"><ArrowLeft size={17} /> {t('coffee.backToFaculty')}</Link>
      <section className="teacher-detail-hero"><div className="teacher-detail-portrait" style={{ background: teacher.color }}><span>{teacher.name.slice(0, 1)}</span><small>{teacher.englishName}</small></div><div><span className="eyebrow">{localize(teacher.title)} · {localize(teacher.department)}</span><h1>{localize(teacher.name)}</h1><p>{localize(teacher.bio)}</p><div className="tag-row">{teacher.fields.map((field) => <span key={field}>{localize(field)}</span>)}</div></div></section>
      <div className="teacher-detail-layout"><article className="panel teacher-about"><span className="eyebrow">{t('coffee.preparedEyebrow')}</span><h2>{t('coffee.goodTopics')}</h2><div className="topic-list">{teacher.topics.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>)}</div><div className="location-callout"><MapPin size={20} /><span><strong>{teacher.location}</strong><small>{t('coffee.quietSpace')}</small></span></div></article><aside className="slot-panel"><span className="eyebrow">{teacher.availability}</span><h2>{t('coffee.chooseSlot')}</h2>{bookingForTeacher && <div className="booking-confirmed"><Check size={20} /><div><strong>{t('coffee.confirmed')} · {bookingForTeacher.timeLabel}</strong><small>{state.coffeeBookings[bookingForTeacher.id].topic}</small></div><button type="button" onClick={() => send({ type: 'CANCEL_COFFEE', slotId: bookingForTeacher.id, teacher }, t('coffee.toastCancelled'))}>{t('coffee.cancel')}</button></div>}<div className="slot-grid">{slots.map((slot) => { const bookedByUser = Boolean(state.coffeeBookings[slot.id]); const disabled = slot.status !== 'available' && !bookedByUser; return <button type="button" key={slot.id} disabled={disabled || bookedByUser} className={`${selected?.id === slot.id ? 'is-selected' : ''} ${bookedByUser ? 'is-booked' : ''}`} onClick={() => setSelected(slot)}><strong>{slot.timeLabel}</strong><small>{bookedByUser ? t('coffee.confirmed') : slot.status === 'available' ? t('coffee.slot.available') : slot.status === 'booked' ? t('coffee.slot.booked') : t('coffee.slot.full')}</small></button> })}</div><p className="concept-note">{t('coffee.note')}</p></aside></div>
      <Modal open={Boolean(selected)} title={t('coffee.bookTitle')} onClose={() => setSelected(null)} footer={<><button className="button button-ghost" type="button" onClick={() => setSelected(null)}>{t('common.cancel')}</button><button className="button button-primary" type="button" onClick={confirm}>{t('coffee.confirmBooking')}</button></>}>
        {selected && <div className="booking-modal"><div className="teacher-mini" style={{ background: teacher.color }}>{teacher.name.slice(0, 1)}</div><div><span className="eyebrow">{teacher.englishName}</span><h3>{selected.dateLabel} · {selected.timeLabel}–{selected.endAt.slice(11, 16)}</h3><p><MapPin size={16} /> {teacher.location}</p></div><label className="field field-wide"><span>{t('coffee.topicLabel')}</span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder={t('coffee.topicPlaceholder')} /></label><p className="modal-note">{t('coffee.topicHint')}</p></div>}
      </Modal>
    </div>
  )
}

export function OrganizationsPage() {
  const { state, send } = useDemo()
  const { t } = useLanguage()
  const [category, setCategory] = useState('All')
  const categories = ['All', 'Sports', 'Academic', 'Culture', 'Student Organization', 'Interest', 'Department']
  const display = organizations.filter((organization) => category === 'All' || organization.category === category)
  return (
    <div className="page-container">
      <header className="page-hero"><span className="eyebrow">{t('org.eyebrow')}</span><h1>{t('org.title')}</h1><p>{t('org.subtitle')}</p></header>
      <div className="filter-row">{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} key={item}>{item === 'All' ? t('graph.all') : item}</button>)}</div>
      <section className="organization-grid">{display.map((organization) => { const joined = state.memberships.includes(organization.id); const host = hosts.find((item) => item.id === organization.hostId)!; const followed = state.followedHosts.includes(host.id); return <article className="organization-card" key={organization.id}><Link to={`/organizations/${organization.id}`}><span className="org-logo-large" style={{ background: organization.color }}>{organization.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="eyebrow">{organization.category}</span><h2>{organization.name} <BadgeCheck size={17} /></h2><p>{organization.description}</p><div className="organization-facts"><span><Users size={16} /> {t('common.memberCount', { count: organization.memberCount })}</span><span><CalendarDays size={16} /> {t('common.eventCount', { count: organization.upcomingEventCount })}</span></div></Link><div className="organization-actions"><button className="button button-ghost" type="button" onClick={() => send({ type: 'TOGGLE_FOLLOW_HOST', host }, followed ? t('org.toastUnfollowed') : t('org.toastFollowed', { host: host.name }))}>{followed ? t('org.following') : t('org.follow')}</button><button className={`button ${joined ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => send({ type: 'TOGGLE_MEMBERSHIP', organization }, joined ? t('org.toastLeft', { organization: organization.name }) : t('org.toastJoined', { organization: organization.name }))}>{joined ? t('org.joined') : t('org.join')}</button></div></article> })}</section>
    </div>
  )
}

export function OrganizationDetailPage() {
  const { id = '' } = useParams()
  const { state, allEvents, send } = useDemo()
  const { localize, t } = useLanguage()
  const [tab, setTab] = useState('Home')
  const organization = organizations.find((item) => item.id === id)
  if (!organization) return <NotFoundPage />
  const host = hosts.find((item) => item.id === organization.hostId)!
  const joined = state.memberships.includes(id)
  const followed = state.followedHosts.includes(host.id)
  const orgEvents = allEvents.filter((event) => event.hostId === host.id)
  return (
    <div className="page-container">
      <section className="organization-hero" style={{ '--org-color': organization.color } as React.CSSProperties}><span className="org-logo-large" style={{ background: organization.color }}>{organization.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><span className="eyebrow">{t('org.verified')} · {organization.category}</span><h1>{organization.name} <BadgeCheck size={22} /></h1><p>{organization.description}</p><span>{t('common.membersLedBy', { count: organization.memberCount + (joined ? 1 : 0), lead: organization.lead })}</span></div><div><button className="button button-ghost" type="button" onClick={() => send({ type: 'TOGGLE_FOLLOW_HOST', host }, followed ? t('org.toastUnfollowed') : t('org.toastFollowed', { host: host.name }))}>{followed ? t('org.following') : t('org.follow')}</button><button className={`button ${joined ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => send({ type: 'TOGGLE_MEMBERSHIP', organization }, joined ? t('org.toastLeft', { organization: organization.name }) : t('org.toastJoined', { organization: organization.name }))}>{joined ? <><Check size={17} /> {t('org.joined')}</> : t('org.joinOrg')}</button></div></section>
      <div className="tabs">{(['Home', 'Events', 'Members', 'Posts'] as const).map((item) => <button className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} type="button" key={item}>{t(`common.${item.toLowerCase()}`)}</button>)}</div>
      {tab === 'Home' && <div className="organization-home"><section><div className="section-heading"><h2>{t('org.upcomingEvents')}</h2><button type="button" onClick={() => setTab('Events')}>{t('org.seeAll')}</button></div><div className="event-grid">{orgEvents.slice(0, 3).map((event) => <EventCard event={event} key={event.id} />)}</div></section><aside className="panel"><span className="eyebrow">{t('org.memberRoles')}</span><h2>{t('org.grow')}</h2>{organization.roles.map((role) => <div className="role-row" key={role}><span>{localize(role).slice(0, 1)}</span><strong>{localize(role)}</strong><small>{role === 'Captain' ? t('org.roleCaptain') : role === 'Advisor' ? t('org.roleAdvisor') : t('org.roleMember')}</small></div>)}</aside></div>}
      {tab === 'Events' && <div className="event-grid content-section">{orgEvents.map((event) => <EventCard event={event} key={event.id} />)}</div>}
      {tab === 'Members' && <div className="member-directory">{host.members.map((member, index) => <article key={member}><span>{member.slice(0, 1)}</span><strong>{member}</strong><small>{index === 0 ? organization.roles[0] : t('profile.member')}</small></article>)}</div>}
      {tab === 'Posts' && <div className="empty-state"><MessageCircle size={29} /><h3>{t('org.postsTitle')}</h3><p>{t('org.postsBody')}</p><Link className="button button-primary" to="/campus/community">{t('org.openCommunity')}</Link></div>}
    </div>
  )
}

export function PartnersPage() {
  const { state, send } = useDemo()
  const { t } = useLanguage()
  const [category, setCategory] = useState('全部')
  const categories = ['全部', '羽毛球', '跑步', '健身', '篮球', '英语', '学习', '比赛组队']
  const display = partners.filter((partner) => category === '全部' || partner.activity === category)
  return (
    <div className="page-container">
      <header className="page-hero"><span className="eyebrow">{t('partner.eyebrow')}</span><h1>Find a Partner</h1><p>{t('partner.subtitle')}</p></header>
      <div className="filter-row">{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      <section className="partner-grid">{display.map((partner) => { const sent = state.partnerRequests.includes(partner.id); return <article className="partner-card" key={partner.id}><div className="partner-top"><span className="partner-avatar" style={{ background: partner.color }}>{partner.name.slice(0, 1)}</span><span><strong>{partner.name}</strong><small>{t('partner.verified')}</small></span><span className="activity-pill">{partner.activity}</span></div><h2>{partner.activity} · {partner.level}</h2><p>{partner.detail}</p><div className="partner-facts"><span><Clock3 size={16} /> {partner.time}</span><span><MapPin size={16} /> {partner.location}</span><span><Users size={16} /> {partner.spots}</span></div><button className={`button button-full ${sent ? 'button-secondary' : 'button-primary'}`} type="button" disabled={sent} onClick={() => send({ type: 'INVITE_PARTNER', partner }, t('partner.toastSent', { name: partner.name }))}>{sent ? <><Check size={17} /> {t('partner.inviteSent')}</> : <><Send size={17} /> {t('partner.invite')}</>}</button></article> })}</section>
      <p className="concept-note centered-note">{t('partner.note')}</p>
    </div>
  )
}

export function CommunityPage() {
  const { state, send } = useDemo()
  const { t } = useLanguage()
  const [board, setBoard] = useState('All')
  const [commentPost, setCommentPost] = useState<string | null>(null)
  const display = posts.filter((post) => board === 'All' || post.board === board)
  return (
    <div className="page-container community-page">
      <header className="page-hero"><span className="eyebrow">{t('community.eyebrow')}</span><h1>Campus Community</h1><p>{t('community.subtitle')}</p></header>
      <div className="filter-row">{['All', 'Campus', 'Sports', 'Study', 'Activities', 'Life'].map((item) => <button type="button" className={board === item ? 'is-active' : ''} onClick={() => setBoard(item)} key={item}>{item === 'All' ? t('graph.all') : item}</button>)}</div>
      <div className="community-layout"><section className="post-feed">{display.map((post) => { const liked = state.postLikes.includes(post.id); const saved = state.savedPosts.includes(post.id); return <article className="post-card" key={post.id}><div className="post-author"><span>{post.author.slice(0, 1)}</span><div><strong>{post.author}</strong><small>{post.authorRole} · {post.time}</small></div><span className="board-tag">{post.board}</span></div><p>{post.content}</p><Link className="related-object" to={post.relatedPath}><span>{t('community.related')}</span><strong>{post.relatedLabel}</strong><ChevronRight size={17} /></Link><div className="post-actions"><button type="button" className={liked ? 'is-active' : ''} onClick={() => send({ type: 'TOGGLE_POST_LIKE', postId: post.id })}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {post.likes + (liked ? 1 : 0)}</button><button type="button" onClick={() => setCommentPost(post.id)}><MessageCircle size={17} /> {post.comments}</button><button type="button" className={saved ? 'is-active' : ''} onClick={() => send({ type: 'TOGGLE_POST_SAVE', postId: post.id }, saved ? t('community.toastUnsaved') : t('community.toastSaved'))}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? t('community.saved') : t('common.save')}</button></div></article> })}</section><aside className="community-aside"><div className="panel"><span className="eyebrow">{t('community.principle')}</span><h2>{t('community.principleTitle')}</h2><p>{t('community.principleBody')}</p></div><div className="panel"><h3>{t('community.trending')}</h3>{['Campus Night Run', 'AI Agent Workshop', 'Coffee Chat', 'Badminton Team'].map((item, index) => <div className="trend-row" key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div></aside></div>
      <Modal open={Boolean(commentPost)} title={t('community.commentsTitle')} onClose={() => setCommentPost(null)} footer={<button className="button button-primary" type="button" onClick={() => { setCommentPost(null); send({ type: 'TOGGLE_POST_SAVE', postId: '__comment__' }, t('community.toastComment')) }}>{t('community.postComment')}</button>}><div className="mock-comments"><div><span>明</span><p><strong>李明</strong> This is a useful connection — see you there!</p></div><div><span>嘉</span><p><strong>王嘉</strong> I joined through the event page too.</p></div><label className="field"><span>{t('community.yourComment')}</span><textarea rows={3} defaultValue="Thanks — this helps!" /></label></div></Modal>
    </div>
  )
}

export function AlumniPage() {
  const { t } = useLanguage()
  return (
    <div className="page-container">
      <header className="page-hero alumni-hero"><div><span className="eyebrow">{t('alumni.eyebrow')}</span><h1>Alumni</h1><p>{t('alumni.subtitle')}</p></div><div className="alumni-quote"><span>“</span><p>{t('alumni.quote')}</p></div></header>
      <section className="alumni-grid">{alumni.map((person) => <article className="alumni-card" key={person.id}><div className="alumni-portrait" style={{ background: person.color }}><span>{person.name.slice(0, 1)}</span><small>{person.cohort}</small></div><div><span className="eyebrow">{person.role}</span><h2>{person.name}</h2><p>{person.story}</p><div className="alumni-event"><CalendarDays size={17} /><span><small>{t('alumni.availableThrough')}</small><strong>{person.activity}</strong></span></div><Link className="text-link" to={person.id === 'alumni-lin' ? '/events/alumni-founder-talk' : '/coffee-chat'}>{t('alumni.explore')} <ArrowRight size={16} /></Link></div></article>)}</section>
      <section className="coffee-explainer alumni-explainer"><span className="eyebrow">{t('alumni.explainerEyebrow')}</span><h2>{t('graph.node.Event')} <span>+</span> {t('common.host')} <span>+</span> Coffee Chat <span>+</span> {t('common.profile')}</h2><p>{t('alumni.explainerBody')}</p></section>
    </div>
  )
}

export function NotificationsPage() {
  const { state, send } = useDemo()
  const { message, t } = useLanguage()
  const navigate = useNavigate()
  const [category, setCategory] = useState<'All' | NotificationCategory>('All')
  const display = useMemo(() => state.notifications.filter((item) => category === 'All' || item.category === category), [state.notifications, category])
  const unread = state.notifications.filter((item) => !item.read).length
  const categoryLabel = (value: string) => (value === 'All' ? t('graph.all') : t(`notif.category.${value}`))
  return (
    <div className="page-container">
      <header className="page-hero page-hero-row"><div><span className="eyebrow">{t('notifications.unread', { count: unread })}</span><h1>Notifications</h1><p>{t('notifications.subtitle')}</p></div><button className="button button-secondary" type="button" onClick={() => send({ type: 'MARK_ALL_NOTIFICATIONS' }, t('notifications.markedAll'))}>{t('notifications.markAll')}</button></header>
      <div className="filter-row">{(['All', 'Events', 'Coffee Chat', 'Organizations', 'Sports', 'Social'] as const).map((item) => <button type="button" className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} key={item}>{categoryLabel(item)}</button>)}</div>
      <section className="notification-list">{display.map((notification) => <button type="button" className={notification.read ? 'is-read' : ''} key={notification.id} onClick={() => { send({ type: 'MARK_NOTIFICATION', id: notification.id }); navigate(notification.path) }}><span className="notification-icon">{notification.category === 'Coffee Chat' ? <Coffee /> : notification.category === 'Organizations' ? <UsersRound /> : notification.category === 'Sports' ? <Sparkles /> : notification.category === 'Social' ? <MessageCircle /> : <CalendarDays />}</span><span><strong>{message(notification.titleMessage, notification.title)}</strong><p>{message(notification.bodyMessage, notification.body)}</p><small>{categoryLabel(notification.category)} · {message(notification.timeMessage, notification.time)}</small></span>{!notification.read && <i aria-label={t('notifications.unreadLabel')} />}<ChevronRight size={18} /></button>)}</section>
      {display.length === 0 && <div className="empty-state"><Bell size={30} /><h3>{t('notifications.emptyTitle')}</h3></div>}
    </div>
  )
}
