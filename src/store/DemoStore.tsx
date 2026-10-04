import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { events } from '../data/mockData'
import { currentUser } from '../data/mockData'
import { useLanguage } from '../i18n/LanguageContext'
import { seedJourneyMessages, seedNotificationMessages } from '../i18n/seedMessages'
import type { DemoAction, DemoState, Event, JourneyEntry, MessageRef, Notification } from '../types'
import { createInitialState, demoReducer } from './demoReducer'
import { makeTicket } from './eventTickets'

const STORAGE_KEY = 'bnbu-campus-hub-demo:v1'

const migrateNotification = (item: Notification): Notification => {
  if (item.titleMessage && item.bodyMessage && item.timeMessage) return item
  const seeded = seedNotificationMessages(item)
  if (seeded.titleMessage) return seeded
  const { title, body, time, ...rest } = item
  return {
    ...rest,
    titleMessage: { key: 'legacy.localized', values: { text: title ?? '' } },
    bodyMessage: { key: 'legacy.localized', values: { text: body ?? '' } },
    timeMessage: { key: 'legacy.localized', values: { text: time ?? '' } },
  }
}

const migrateJourney = (item: JourneyEntry): JourneyEntry => {
  if (item.titleMessage && item.detailMessage) return item
  const seeded = seedJourneyMessages(item)
  if (seeded.titleMessage) return seeded
  const { title, detail, ...rest } = item
  return {
    ...rest,
    titleMessage: { key: 'legacy.localized', values: { text: title ?? '' } },
    detailMessage: { key: 'legacy.localized', values: { text: detail ?? '' } },
  }
}

interface DemoContextValue {
  state: DemoState
  allEvents: Event[]
  send: (action: DemoAction, message?: string | MessageRef) => void
  toast: string | null
}

const DemoContext = createContext<DemoContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function migrateDemoState(parsed: Partial<DemoState>): DemoState {
  const fallback = createInitialState(parsed.scenario === 'new' || parsed.scenario === 'organizer' ? parsed.scenario : 'active')
  const merged = {
    ...fallback,
    ...parsed,
    checkInRecords: Array.isArray(parsed.checkInRecords) ? parsed.checkInRecords : fallback.checkInRecords,
    activeCheckInId: typeof parsed.activeCheckInId === 'string' || parsed.activeCheckInId === null ? parsed.activeCheckInId : fallback.activeCheckInId,
    eventTickets: parsed.eventTickets && typeof parsed.eventTickets === 'object' ? { ...parsed.eventTickets } : { ...fallback.eventTickets },
    eventScanRecords: Array.isArray(parsed.eventScanRecords) ? parsed.eventScanRecords : fallback.eventScanRecords,
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications.map(migrateNotification) : fallback.notifications,
    journey: Array.isArray(parsed.journey) ? parsed.journey.map(migrateJourney) : fallback.journey,
  } as DemoState
  Object.entries(merged.registrations).forEach(([eventId, status]) => {
    if (status !== 'going' && status !== 'checked_in') return
    const existing = Object.values(merged.eventTickets).find((ticket) => ticket.eventId === eventId && ticket.attendeeId === currentUser.id)
    if (existing) return
    const ticket = makeTicket(eventId, currentUser.id, currentUser.name)
    merged.eventTickets[ticket.code] = status === 'checked_in' ? { ...ticket, status: 'used' } : ticket
  })
  return merged
}

const loadState = (): DemoState => {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createInitialState()
    const parsed = JSON.parse(stored) as Partial<DemoState>
    if (!parsed || typeof parsed !== 'object' || !parsed.registrations || !Array.isArray(parsed.notifications)) {
      return createInitialState()
    }
    return migrateDemoState(parsed)
  } catch {
    return createInitialState()
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, loadState)
  const [toastValue, setToastValue] = useState<string | MessageRef | null>(null)
  const { message: resolveMessage } = useLanguage()

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const send = useCallback((action: DemoAction, message?: string | MessageRef) => {
    dispatch(action)
    if (message) {
      setToastValue(message)
      window.setTimeout(() => setToastValue(null), 2800)
    }
  }, [])

  const allEvents = useMemo(() => [...events, ...state.createdEvents], [state.createdEvents])
  const toast = typeof toastValue === 'string' ? toastValue : toastValue ? resolveMessage(toastValue) : null
  const value = useMemo(() => ({ state, allEvents, send, toast }), [state, allEvents, send, toast])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used inside DemoProvider')
  return context
}

export { STORAGE_KEY }
