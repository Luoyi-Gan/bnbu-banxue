import { currentUser, events, hosts, initialCheckInRecords, initialJourney, initialNotifications, organizations } from '../data/mockData'
import { seedJourneyMessages, seedNotificationMessages } from '../i18n/seedMessages'
import type {
  DemoAction,
  DemoState,
  Event,
  EventScanRecord,
  GraphEdge,
  GraphNode,
  Guest,
  JourneyEntry,
  Notification,
  RegistrationStatus,
  Scenario,
} from '../types'
import { createTicketPayload, makeTicket, validateEventTicket } from './eventTickets'

const uid = (prefix: string, state: DemoState) =>
  `${prefix}-${state.notifications.length}-${state.journey.length}-${state.createdEvents.length}`

const notification = (
  state: DemoState,
  category: Notification['category'],
  titleKey: string,
  bodyKey: string,
  path: string,
  values?: Record<string, string | number>,
): Notification => ({
  id: uid('note', state),
  category,
  titleMessage: { key: titleKey, values },
  bodyMessage: { key: bodyKey, values },
  timeMessage: { key: 'common.justNow' },
  path,
  read: false,
})

const journeyEntry = (
  state: DemoState,
  titleKey: string,
  detailKey: string,
  kind: JourneyEntry['kind'],
  values?: Record<string, string | number>,
): JourneyEntry => ({
  id: uid('journey', state),
  date: '2026.10',
  titleMessage: { key: titleKey, values },
  detailMessage: { key: detailKey, values },
  kind,
})

const organizerEvent: Event = {
  ...events.find((event) => event.id === 'marketing-case-night')!,
  id: 'organizer-campus-mixer',
  slug: 'organizer-campus-mixer',
  title: 'Campus Creators Mixer',
  subtitle: 'Small projects, generous feedback',
  cover: 'cover-design',
  attendeeCount: 18,
}

const organizerGuests: Guest[] = [
  { id: 'guest-chen', name: '陈雨晴', status: 'going' },
  { id: 'guest-li', name: '李明', status: 'pending' },
  { id: 'guest-wang', name: '王嘉', status: 'waitlist' },
  { id: 'guest-luo', name: '罗楠', status: 'checked_in' },
  { id: 'guest-zhao', name: '赵晨', status: 'rejected' },
]

const ticketMap = (...tickets: ReturnType<typeof makeTicket>[]) => Object.fromEntries(tickets.map((ticket) => [ticket.code, ticket]))

const activeTickets = ticketMap(
  makeTicket('campus-night-run', currentUser.id, currentUser.name),
  { ...makeTicket('english-corner', currentUser.id, currentUser.name), status: 'used', usedAt: '2026-10-12T19:02:00+08:00' },
)

const organizerTickets = ticketMap(
  ...Object.values(activeTickets),
  makeTicket('organizer-campus-mixer', 'guest-chen', '陈雨晴'),
  { ...makeTicket('organizer-campus-mixer', 'guest-luo', '罗楠'), status: 'used', usedAt: '2026-10-18T18:52:00+08:00' },
  { ...makeTicket('organizer-campus-mixer', 'guest-zhao', '赵晨'), status: 'void' },
)

const localizableNotification = (item: Notification): Notification => seedNotificationMessages(item)

const localizableJourney = (item: JourneyEntry): JourneyEntry => seedJourneyMessages(item)

export function createInitialState(scenario: Scenario = 'active'): DemoState {
  if (scenario === 'new') {
    return {
      scenario,
      registrations: {},
      attendeeDeltas: {},
      favorites: [],
      followedHosts: [],
      memberships: [],
      coffeeBookings: {},
      partnerRequests: [],
      postLikes: [],
      savedPosts: [],
      notifications: initialNotifications.slice(0, 3).map(localizableNotification),
      createdEvents: [],
      journey: [
        { id: 'journey-welcome', date: '2026.09', titleMessage: { key: 'journey.welcome.title' }, detailMessage: { key: 'journey.welcome.detail' }, kind: 'event' },
      ],
      guestStatuses: {},
      eventTickets: {},
      eventScanRecords: [],
      checkInRecords: [],
      activeCheckInId: null,
    }
  }

  const base: DemoState = {
    scenario,
    registrations: {
      'campus-night-run': 'going',
      'startup-meetup': 'pending',
      'badminton-night': 'waitlist',
      'english-corner': 'checked_in',
    },
    attendeeDeltas: {},
    favorites: ['product-design-jam', 'alumni-founder-talk'],
    followedHosts: ['ai-club'],
    memberships: ['org-badminton', 'org-running', 'org-ai'],
    coffeeBookings: {},
    partnerRequests: [],
    postLikes: ['post-ai'],
    savedPosts: ['post-coffee'],
    notifications: initialNotifications.map(localizableNotification),
    createdEvents: [],
    journey: initialJourney.map(localizableJourney),
    guestStatuses: {},
    eventTickets: { ...activeTickets },
    eventScanRecords: [],
    checkInRecords: initialCheckInRecords,
    activeCheckInId: null,
  }

  if (scenario === 'organizer') {
    return {
      ...base,
      createdEvents: [organizerEvent],
      guestStatuses: { [organizerEvent.id]: organizerGuests },
      eventTickets: { ...organizerTickets },
      journey: [
        journeyEntry(base, 'journey.created.title', 'journey.created.detail', 'hosted', { event: 'Campus Creators Mixer' }),
        ...base.journey,
      ],
    }
  }
  return base
}

const nextRegistrationStatus = (event: Event): RegistrationStatus => {
  if (event.capacity !== null && event.attendeeCount >= event.capacity) return 'waitlist'
  if (event.registrationMode === 'approval') return 'pending'
  return 'going'
}

const remove = (items: string[], id: string) => items.filter((item) => item !== id)

export function getCheckInSummary(state: DemoState) {
  const completed = state.checkInRecords.filter((record) => record.status === 'completed')
  const courseMinutes = completed.filter((record) => record.kind === 'course').reduce((total, record) => total + record.durationMinutes, 0)
  const otherMinutes = completed.filter((record) => record.kind === 'other').reduce((total, record) => total + record.durationMinutes, 0)
  return {
    courseMinutes,
    otherMinutes,
    totalMinutes: courseMinutes + otherMinutes,
    courseHours: courseMinutes / 60,
    otherHours: otherMinutes / 60,
    totalHours: (courseMinutes + otherMinutes) / 60,
  }
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'REGISTER_EVENT': {
      const status = nextRegistrationStatus(action.event)
      const countsAsGoing = status === 'going'
      const ticket = countsAsGoing ? makeTicket(action.event.id, currentUser.id, currentUser.name, new Date().toISOString()) : null
      return {
        ...state,
        registrations: { ...state.registrations, [action.event.id]: status },
        eventTickets: ticket ? { ...state.eventTickets, [ticket.code]: ticket } : state.eventTickets,
        attendeeDeltas: {
          ...state.attendeeDeltas,
          [action.event.id]: (state.attendeeDeltas[action.event.id] ?? 0) + (countsAsGoing ? 1 : 0),
        },
        notifications: [
          notification(
            state,
            'Events',
            status === 'going' ? 'notification.registration.going.title' : status === 'pending' ? 'notification.registration.pending.title' : 'notification.registration.waitlist.title',
            status === 'going' ? 'notification.registration.going.body' : status === 'pending' ? 'notification.registration.pending.body' : 'notification.registration.waitlist.body',
            `/events/${action.event.id}`,
            { event: action.event.title },
          ),
          ...state.notifications,
        ],
        journey: [
          journeyEntry(
            state,
            status === 'going' ? 'journey.registration.going.title' : status === 'pending' ? 'journey.registration.pending.title' : 'journey.registration.waitlist.title',
            'journey.event.detail',
            'event',
            { event: action.event.title, date: action.event.dateLabel, location: action.event.location },
          ),
          ...state.journey,
        ],
      }
    }
    case 'CANCEL_REGISTRATION': {
      const previous = state.registrations[action.event.id]
      const decrement = previous === 'going' || previous === 'checked_in' ? -1 : 0
      return {
        ...state,
        registrations: { ...state.registrations, [action.event.id]: 'cancelled' },
        eventTickets: Object.fromEntries(Object.entries(state.eventTickets).map(([code, ticket]) => [
          code,
          ticket.eventId === action.event.id && ticket.attendeeId === currentUser.id ? { ...ticket, status: 'void' as const } : ticket,
        ])),
        attendeeDeltas: {
          ...state.attendeeDeltas,
          [action.event.id]: Math.max(-1, (state.attendeeDeltas[action.event.id] ?? 0) + decrement),
        },
        notifications: [
          notification(state, 'Events', 'notification.cancelled.title', 'notification.cancelled.body', `/events/${action.event.id}`, { event: action.event.title }),
          ...state.notifications,
        ],
      }
    }
    case 'CHECK_IN': {
      const ticket = Object.values(state.eventTickets).find((item) => item.eventId === action.event.id && item.attendeeId === currentUser.id)
      if (!ticket) return state
      return demoReducer(state, { type: 'CHECK_IN_TICKET', event: action.event, payload: createTicketPayload(ticket), mode: 'standard' })
    }
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.eventId)
          ? remove(state.favorites, action.eventId)
          : [...state.favorites, action.eventId],
      }
    case 'TOGGLE_FOLLOW_HOST': {
      const following = state.followedHosts.includes(action.host.id)
      return {
        ...state,
        followedHosts: following ? remove(state.followedHosts, action.host.id) : [...state.followedHosts, action.host.id],
        notifications: following
          ? state.notifications
          : [notification(state, 'Organizations', 'notification.follow.title', 'notification.follow.body', `/hosts/${action.host.id}`, { host: action.host.name }), ...state.notifications],
        journey: following
          ? state.journey
          : [journeyEntry(state, 'journey.follow.title', 'journey.follow.detail', 'organization', { host: action.host.name }), ...state.journey],
      }
    }
    case 'TOGGLE_MEMBERSHIP': {
      const joined = state.memberships.includes(action.organization.id)
      return {
        ...state,
        memberships: joined ? remove(state.memberships, action.organization.id) : [...state.memberships, action.organization.id],
        notifications: joined
          ? state.notifications
          : [notification(state, 'Organizations', 'notification.membership.title', 'notification.membership.body', `/organizations/${action.organization.id}`, { organization: action.organization.name }), ...state.notifications],
        journey: joined
          ? state.journey
          : [journeyEntry(state, 'journey.membership.title', 'journey.membership.detail', 'organization', { organization: action.organization.name, category: action.organization.category }), ...state.journey],
      }
    }
    case 'BOOK_COFFEE': {
      const booking = {
        id: uid('booking', state),
        slotId: action.slot.id,
        studentId: currentUser.id,
        topic: action.topic,
        note: '',
        status: 'confirmed' as const,
      }
      return {
        ...state,
        coffeeBookings: { ...state.coffeeBookings, [action.slot.id]: booking },
        notifications: [
          notification(state, 'Coffee Chat', 'notification.coffee.confirmed.title', 'notification.coffee.confirmed.body', `/coffee-chat/teachers/${action.teacher.id}`, { teacher: action.teacher.englishName, date: action.slot.dateLabel, time: action.slot.timeLabel, location: action.teacher.location }),
          ...state.notifications,
        ],
        journey: [
          journeyEntry(state, 'journey.coffee.title', 'journey.coffee.detail', 'coffee', { teacher: action.teacher.englishName, topic: action.topic, time: action.slot.timeLabel }),
          ...state.journey,
        ],
      }
    }
    case 'CANCEL_COFFEE': {
      const nextBookings = { ...state.coffeeBookings }
      delete nextBookings[action.slotId]
      return {
        ...state,
        coffeeBookings: nextBookings,
        notifications: [notification(state, 'Coffee Chat', 'notification.coffee.cancelled.title', 'notification.coffee.cancelled.body', '/coffee-chat', { teacher: action.teacher.englishName }), ...state.notifications],
      }
    }
    case 'INVITE_PARTNER':
      if (state.partnerRequests.includes(action.partner.id)) return state
      return {
        ...state,
        partnerRequests: [...state.partnerRequests, action.partner.id],
        notifications: [notification(state, 'Social', 'notification.partner.title', 'notification.partner.body', '/campus/partners', { name: action.partner.name, activity: action.partner.activity }), ...state.notifications],
        journey: [journeyEntry(state, 'journey.partner.title', 'journey.partner.detail', 'connection', { name: action.partner.name, activity: action.partner.activity }), ...state.journey],
      }
    case 'TOGGLE_POST_LIKE':
      return { ...state, postLikes: state.postLikes.includes(action.postId) ? remove(state.postLikes, action.postId) : [...state.postLikes, action.postId] }
    case 'TOGGLE_POST_SAVE':
      return { ...state, savedPosts: state.savedPosts.includes(action.postId) ? remove(state.savedPosts, action.postId) : [...state.savedPosts, action.postId] }
    case 'MARK_NOTIFICATION':
      return { ...state, notifications: state.notifications.map((item) => item.id === action.id ? { ...item, read: true } : item) }
    case 'MARK_ALL_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((item) => ({ ...item, read: true })) }
    case 'CREATE_EVENT': {
      const guests: Guest[] = [
        { id: `${action.event.id}-guest-chen`, name: '陈雨晴', status: 'going' },
        { id: `${action.event.id}-guest-li`, name: '李明', status: 'pending' },
        { id: `${action.event.id}-guest-wang`, name: '王嘉', status: 'waitlist' },
      ]
      const firstTicket = makeTicket(action.event.id, guests[0].id, guests[0].name, new Date().toISOString())
      return {
        ...state,
        scenario: 'organizer',
        createdEvents: [...state.createdEvents, action.event],
        guestStatuses: { ...state.guestStatuses, [action.event.id]: guests },
        eventTickets: { ...state.eventTickets, [firstTicket.code]: firstTicket },
        notifications: [notification(state, 'Events', 'notification.published.title', 'notification.published.body', `/manage/${action.event.id}`, { event: action.event.title }), ...state.notifications],
        journey: [journeyEntry(state, 'journey.created.title', 'journey.event.detail', 'hosted', { event: action.event.title, date: action.event.dateLabel, location: action.event.location }), ...state.journey],
      }
    }
    case 'UPDATE_GUEST': {
      const guest = (state.guestStatuses[action.eventId] ?? []).find((item) => item.id === action.guestId)
      const existing = Object.values(state.eventTickets).find((ticket) => ticket.eventId === action.eventId && ticket.attendeeId === action.guestId)
      const issued = action.status === 'going' && guest && !existing ? makeTicket(action.eventId, guest.id, guest.name, new Date().toISOString()) : null
      const eventTickets = Object.fromEntries(Object.entries(state.eventTickets).map(([code, ticket]) => [
        code,
        ticket.eventId === action.eventId && ticket.attendeeId === action.guestId && action.status === 'rejected'
          ? { ...ticket, status: 'void' as const }
          : ticket.eventId === action.eventId && ticket.attendeeId === action.guestId && action.status === 'checked_in'
            ? { ...ticket, status: 'used' as const, usedAt: new Date().toISOString() }
            : ticket,
      ]))
      if (issued) eventTickets[issued.code] = issued
      return {
        ...state,
        eventTickets,
        guestStatuses: {
          ...state.guestStatuses,
          [action.eventId]: (state.guestStatuses[action.eventId] ?? []).map((guest) =>
            guest.id === action.guestId ? { ...guest, status: action.status } : guest,
          ),
        },
      }
    }
    case 'CHECK_IN_TICKET': {
      const result = validateEventTicket(state, action.event.id, action.payload)
      const scannedAt = action.scannedAt ?? new Date().toISOString()
      const scan: EventScanRecord = {
        id: `scan-${state.eventScanRecords.length}-${scannedAt}`,
        eventId: action.event.id,
        ticketCode: result.ticket?.code ?? 'UNKNOWN',
        attendeeName: result.ticket?.attendeeName,
        result: result.code,
        mode: action.mode,
        scannedAt,
      }
      if (result.code !== 'valid' || !result.ticket) {
        return { ...state, eventScanRecords: [scan, ...state.eventScanRecords].slice(0, 12) }
      }
      const ticket = result.ticket
      const isCurrentUser = ticket.attendeeId === currentUser.id
      return {
        ...state,
        registrations: isCurrentUser ? { ...state.registrations, [action.event.id]: 'checked_in' } : state.registrations,
        guestStatuses: {
          ...state.guestStatuses,
          [action.event.id]: (state.guestStatuses[action.event.id] ?? []).map((item) => item.id === ticket.attendeeId ? { ...item, status: 'checked_in' } : item),
        },
        eventTickets: { ...state.eventTickets, [ticket.code]: { ...ticket, status: 'used', usedAt: scannedAt } },
        eventScanRecords: [scan, ...state.eventScanRecords].slice(0, 12),
        notifications: isCurrentUser ? [notification(state, 'Events', 'notification.ticket.checkedIn.title', 'notification.ticket.checkedIn.body', `/events/${action.event.id}/ticket`, { event: action.event.title }), ...state.notifications] : state.notifications,
        journey: isCurrentUser ? [journeyEntry(state, 'journey.ticket.checkedIn.title', 'journey.ticket.checkedIn.detail', 'event', { event: action.event.title, location: action.event.location, time: new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(scannedAt)) }), ...state.journey] : state.journey,
      }
    }
    case 'START_CHECK_IN': {
      if (state.activeCheckInId) return state
      const recordId = uid('checkin', state)
      const record = {
        id: recordId,
        dateLabel: 'Today · Oct 18',
        activity: action.activity,
        kind: action.kind,
        durationMinutes: 0,
        status: 'in_progress' as const,
        startedAt: new Date().toISOString(),
        location: action.location,
      }
      return {
        ...state,
        checkInRecords: [record, ...state.checkInRecords],
        activeCheckInId: recordId,
        notifications: [notification(state, 'Sports', 'notification.sports.started.title', 'notification.sports.started.body', '/check-in', { activity: action.activity }), ...state.notifications],
      }
    }
    case 'COMPLETE_CHECK_IN': {
      const record = state.checkInRecords.find((item) => item.id === action.recordId)
      if (!record) return state
      return {
        ...state,
        checkInRecords: state.checkInRecords.map((item) => item.id === action.recordId ? { ...item, durationMinutes: action.durationMinutes, status: 'completed' } : item),
        activeCheckInId: state.activeCheckInId === action.recordId ? null : state.activeCheckInId,
        notifications: [notification(state, 'Sports', 'notification.sports.complete.title', 'notification.sports.complete.body', '/profile', { activity: record.activity, minutes: action.durationMinutes }), ...state.notifications],
        journey: [journeyEntry(state, 'journey.sports.complete.title', 'journey.sports.complete.detail', 'sports', { activity: record.activity, minutes: action.durationMinutes, location: record.location }), ...state.journey],
      }
    }
    case 'SET_SCENARIO':
      return createInitialState(action.scenario)
    case 'RESET':
      return createInitialState('active')
    default:
      return state
  }
}

const nodePositions: Record<string, [number, number]> = {
  user: [50, 50],
  course: [14, 18],
  ai: [82, 16],
  running: [88, 50],
  marketing: [78, 84],
  badminton: [18, 82],
  org1: [24, 34],
  org2: [24, 64],
  event1: [62, 24],
  event2: [68, 64],
  teacher: [52, 84],
  partner: [92, 72],
  hosted: [40, 14],
}

export function deriveGraph(state: DemoState): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: currentUser.id, label: currentUser.name, type: 'User', detail: `${currentUser.faculty} · ${currentUser.cohort}`, x: 50, y: 50 },
    { id: 'course-gepe101', label: 'GEPE101', type: 'Course', detail: 'Physical Education · 16/20h', x: nodePositions.course[0], y: nodePositions.course[1] },
    { id: 'interest-ai', label: 'AI', type: 'Interest', detail: 'A growing academic and maker interest', x: nodePositions.ai[0], y: nodePositions.ai[1] },
    { id: 'interest-running', label: 'Running', type: 'Interest', detail: 'Sports and wellbeing', x: nodePositions.running[0], y: nodePositions.running[1] },
    { id: 'interest-marketing', label: 'Marketing', type: 'Interest', detail: 'Study and career interest', x: nodePositions.marketing[0], y: nodePositions.marketing[1] },
  ]
  const edges: GraphEdge[] = [
    { id: 'edge-course', source: currentUser.id, target: 'course-gepe101', type: 'enrolled_in' },
    { id: 'edge-ai', source: currentUser.id, target: 'interest-ai', type: 'interested_in' },
    { id: 'edge-running', source: currentUser.id, target: 'interest-running', type: 'interested_in' },
    { id: 'edge-marketing', source: currentUser.id, target: 'interest-marketing', type: 'interested_in' },
  ]

  const allEvents = [...events, ...state.createdEvents]
  Object.entries(state.registrations).forEach(([eventId, status], index) => {
    if (status === 'cancelled' || status === 'rejected') return
    const event = allEvents.find((item) => item.id === eventId)
    if (!event) return
    const positions: [number, number][] = [[62, 24], [68, 64], [42, 14], [34, 82], [76, 38]]
    const [x, y] = positions[index % positions.length]
    nodes.push({ id: `event-${event.id}`, label: event.title, type: 'Event', detail: `${event.dateLabel} · ${event.location}`, x, y })
    edges.push({ id: `edge-event-${event.id}`, source: currentUser.id, target: `event-${event.id}`, type: status === 'checked_in' ? 'participated' : 'registered', pending: status === 'pending' || status === 'waitlist' })
  })

  state.followedHosts.forEach((hostId, index) => {
    const host = hosts.find((item) => item.id === hostId)
    if (!host) return
    nodes.push({ id: `host-${host.id}`, label: host.name, type: 'Organization', detail: `Following · ${host.tags.join(' · ')}`, x: 24 + index * 7, y: 34 + index * 8 })
    edges.push({ id: `edge-host-${host.id}`, source: currentUser.id, target: `host-${host.id}`, type: 'follows' })
  })

  state.memberships.forEach((organizationId, index) => {
    const organization = organizations.find((item) => item.id === organizationId)
    if (!organization) return
    const id = `organization-${organization.id}`
    if (!nodes.some((node) => node.id === id)) {
      nodes.push({ id, label: organization.name, type: 'Organization', detail: `Member · ${organization.category}`, x: 16 + index * 11, y: 68 + (index % 2) * 14 })
    }
    edges.push({ id: `edge-member-${organization.id}`, source: currentUser.id, target: id, type: 'member_of' })
  })

  Object.values(state.coffeeBookings).forEach((booking, index) => {
    const slotTeacherId = booking.slotId.split('-').slice(1, 2).join('-')
    const teacherId = booking.slotId.startsWith('slot-zhang') ? 'prof-zhang' : `prof-${slotTeacherId}`
    const teacherName = teacherId === 'prof-zhang' ? 'Professor Zhang' : 'Faculty Mentor'
    const id = `teacher-${teacherId}`
    nodes.push({ id, label: teacherName, type: 'Teacher', detail: `Coffee Chat · ${booking.topic}`, x: 52 + index * 6, y: 84 })
    edges.push({ id: `edge-coffee-${booking.id}`, source: currentUser.id, target: id, type: 'coffee_chat' })
  })

  state.partnerRequests.forEach((partnerId, index) => {
    nodes.push({ id: `partner-${partnerId}`, label: index === 0 ? 'Campus Partner' : `Partner ${index + 1}`, type: 'User', detail: 'Pending activity connection', x: 92, y: 72 - index * 10 })
    edges.push({ id: `edge-partner-${partnerId}`, source: currentUser.id, target: `partner-${partnerId}`, type: 'connected_with', pending: true })
  })

  state.createdEvents.forEach((event, index) => {
    const id = `created-${event.id}`
    nodes.push({ id, label: event.title, type: 'Event', detail: 'Hosted by you', x: 40 + index * 6, y: 14 + index * 4 })
    edges.push({ id: `edge-created-${event.id}`, source: currentUser.id, target: id, type: 'hosts' })
  })

  return { nodes, edges }
}
