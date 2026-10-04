import { Bookmark, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { hosts } from '../../data/mockData'
import { useLanguage } from '../../i18n/LanguageContext'
import { useDemo } from '../../store/DemoStore'
import type { Event, RegistrationStatus } from '../../types'

export function EventStatus({ status }: { status?: RegistrationStatus }) {
  const { t } = useLanguage()
  if (!status || status === 'cancelled') return null
  return <span className={`status-pill status-${status}`}>{t(`status.${status}`)}</span>
}

export function EventCard({ event, compact = false }: { event: Event; compact?: boolean }) {
  const { state, send } = useDemo()
  const host = hosts.find((item) => item.id === event.hostId)
  const favorite = state.favorites.includes(event.id)
  const status = state.registrations[event.id]
  const attendeeCount = event.attendeeCount + (state.attendeeDeltas[event.id] ?? 0)

  return (
    <article className={`event-card ${compact ? 'event-card-compact' : ''}`}>
      <Link className={`event-cover ${event.cover}`} to={`/events/${event.id}`} aria-label={`Open ${event.title}`}>
        <span className="event-cover-top">
          <span className="cover-date">{event.dateLabel}</span>
          <EventStatus status={status} />
        </span>
        <span className="cover-mark">BNBU / {event.category}</span>
      </Link>
      <div className="event-card-body">
        <div className="event-card-topline">
          <span>{event.timeLabel}</span>
          <button
            className={`bookmark-button ${favorite ? 'is-active' : ''}`}
            type="button"
            aria-label={favorite ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
            aria-pressed={favorite}
            onClick={() => send({ type: 'TOGGLE_FAVORITE', eventId: event.id }, favorite ? 'Removed from Saved' : 'Saved for later')}
          >
            <Bookmark size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <Link className="event-title-link" to={`/events/${event.id}`}><h3>{event.title}</h3></Link>
        {!compact && <p className="event-subtitle">{event.subtitle}</p>}
        <div className="event-meta"><MapPin size={15} /><span>{event.location}</span></div>
        <div className="event-card-footer">
          <span>{host?.name ?? 'BNBU Campus'}</span>
          <span className="attendee-count"><Users size={15} /> {attendeeCount}</span>
        </div>
      </div>
    </article>
  )
}
