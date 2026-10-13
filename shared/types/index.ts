export type EventCategory =
  | '运动'
  | '学术'
  | '社团'
  | 'Workshop'
  | '比赛'
  | '讲座'
  | '英语'
  | '创业'
  | 'Coffee Chat'
  | '校友'

export type EventType =
  | 'standard'
  | 'sports'
  | 'workshop'
  | 'coffee_chat'
  | 'alumni'
  | 'organization'
  | 'competition'

export type RegistrationMode = 'open' | 'approval'
export type RegistrationStatus =
  | 'going'
  | 'pending'
  | 'waitlist'
  | 'checked_in'
  | 'cancelled'
  | 'rejected'

export type TemporalBucket = 'Today' | 'Tomorrow' | 'This Week' | 'Weekend' | 'Next Week'

export interface Event {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  cover: string
  category: EventCategory
  tags: string[]
  startAt: string
  endAt: string
  dateLabel: string
  timeLabel: string
  location: string
  hostId: string
  capacity: number | null
  attendeeCount: number
  registrationMode: RegistrationMode
  waitlistEnabled: boolean
  visibility: 'public' | 'unlisted' | 'members'
  featured: boolean
  status: 'upcoming' | 'live' | 'past'
  eventType: EventType
  temporal: TemporalBucket
  agenda: string[]
}

export interface Host {
  id: string
  name: string
  shortName: string
  type: 'organization' | 'team' | 'department' | 'teacher' | 'alumni'
  verified: boolean
  description: string
  followers: number
  tags: string[]
  color: string
  members: string[]
}

export interface Teacher {
  id: string
  name: string
  englishName: string
  title: string
  department: string
  bio: string
  fields: string[]
  topics: string[]
  location: string
  availability: string
  color: string
}

export interface CoffeeSlot {
  id: string
  teacherId: string
  startAt: string
  endAt: string
  dateLabel: string
  timeLabel: string
  capacity: number
  bookingCount: number
  status: 'available' | 'booked' | 'full'
}

export interface CoffeeBooking {
  id: string
  slotId: string
  studentId: string
  topic: string
  note: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
}

export interface Organization {
  id: string
  hostId: string
  name: string
  category: 'Sports' | 'Academic' | 'Culture' | 'Student Organization' | 'Interest' | 'Department'
  description: string
  memberCount: number
  upcomingEventCount: number
  color: string
  lead: string
  roles: string[]
}

export interface PartnerRequest {
  id: string
  name: string
  activity: string
  level: string
  time: string
  location: string
  detail: string
  spots: string
  color: string
}

export interface Post {
  id: string
  author: string
  authorRole: string
  board: 'Campus' | 'Sports' | 'Study' | 'Activities' | 'Life'
  content: string
  relatedLabel: string
  relatedPath: string
  likes: number
  comments: number
  time: string
}

export interface Alumni {
  id: string
  name: string
  cohort: string
  role: string
  story: string
  activity: string
  color: string
}

export type NotificationCategory = 'Events' | 'Coffee Chat' | 'Organizations' | 'Sports' | 'Social'

export interface MessageRef {
  key: string
  values?: Record<string, string | number>
}

export interface Notification {
  id: string
  category: NotificationCategory
  title?: string
  body?: string
  time?: string
  titleMessage?: MessageRef
  bodyMessage?: MessageRef
  timeMessage?: MessageRef
  read: boolean
  path: string
}

export interface JourneyEntry {
  id: string
  date: string
  title?: string
  detail?: string
  titleMessage?: MessageRef
  detailMessage?: MessageRef
  kind: 'event' | 'sports' | 'organization' | 'coffee' | 'connection' | 'hosted'
}

export interface GraphNode {
  id: string
  label: string
  type: 'User' | 'Event' | 'Organization' | 'Teacher' | 'Interest' | 'Course' | 'Alumni'
  detail: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type:
    | 'registered'
    | 'participated'
    | 'follows'
    | 'member_of'
    | 'coffee_chat'
    | 'interested_in'
    | 'enrolled_in'
    | 'connected_with'
    | 'hosts'
  pending?: boolean
}

export interface Guest {
  id: string
  name: string
  status: 'going' | 'pending' | 'waitlist' | 'checked_in' | 'rejected'
}

export type EventTicketStatus = 'valid' | 'used' | 'void'
export type EventScanMode = 'standard' | 'express'
export type TicketValidationCode = 'valid' | 'invalid' | 'wrong_event' | 'void' | 'duplicate'

export interface EventTicket {
  code: string
  eventId: string
  attendeeId: string
  attendeeName: string
  status: EventTicketStatus
  issuedAt: string
  usedAt?: string
}

export interface TicketValidationResult {
  code: TicketValidationCode
  ticket?: EventTicket
}

export interface EventScanRecord {
  id: string
  eventId: string
  ticketCode: string
  attendeeName?: string
  result: TicketValidationCode
  mode: EventScanMode
  scannedAt: string
}

export interface CheckInRecord {
  id: string
  dateLabel: string
  activity: string
  kind: 'course' | 'other'
  durationMinutes: number
  status: 'completed' | 'in_progress'
  startedAt?: string
  location: string
}

export type Scenario = 'new' | 'active' | 'organizer'

export interface DemoState {
  scenario: Scenario
  registrations: Record<string, RegistrationStatus>
  attendeeDeltas: Record<string, number>
  favorites: string[]
  followedHosts: string[]
  memberships: string[]
  coffeeBookings: Record<string, CoffeeBooking>
  partnerRequests: string[]
  postLikes: string[]
  savedPosts: string[]
  notifications: Notification[]
  createdEvents: Event[]
  journey: JourneyEntry[]
  guestStatuses: Record<string, Guest[]>
  eventTickets: Record<string, EventTicket>
  eventScanRecords: EventScanRecord[]
  checkInRecords: CheckInRecord[]
  activeCheckInId: string | null
}

export type DemoAction =
  | { type: 'REGISTER_EVENT'; event: Event }
  | { type: 'CANCEL_REGISTRATION'; event: Event }
  | { type: 'CHECK_IN'; event: Event }
  | { type: 'TOGGLE_FAVORITE'; eventId: string }
  | { type: 'TOGGLE_FOLLOW_HOST'; host: Host }
  | { type: 'TOGGLE_MEMBERSHIP'; organization: Organization }
  | { type: 'BOOK_COFFEE'; slot: CoffeeSlot; topic: string; teacher: Teacher }
  | { type: 'CANCEL_COFFEE'; slotId: string; teacher: Teacher }
  | { type: 'INVITE_PARTNER'; partner: PartnerRequest }
  | { type: 'TOGGLE_POST_LIKE'; postId: string }
  | { type: 'TOGGLE_POST_SAVE'; postId: string }
  | { type: 'MARK_NOTIFICATION'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS' }
  | { type: 'CREATE_EVENT'; event: Event }
  | { type: 'UPDATE_GUEST'; eventId: string; guestId: string; status: Guest['status'] }
  | { type: 'CHECK_IN_TICKET'; event: Event; payload: string; mode: EventScanMode; scannedAt?: string }
  | { type: 'START_CHECK_IN'; activity: string; kind: CheckInRecord['kind']; location: string }
  | { type: 'COMPLETE_CHECK_IN'; recordId: string; durationMinutes: number }
  | { type: 'SET_SCENARIO'; scenario: Scenario }
  | { type: 'RESET' }
