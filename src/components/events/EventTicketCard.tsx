import { CalendarDays, Check, MapPin, ShieldCheck, Ticket, UserRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '../../i18n/LanguageContext'
import { createTicketPayload } from '../../store/eventTickets'
import type { Event, EventTicket } from '../../types'

export function EventTicketCard({ event, ticket }: { event: Event; ticket: EventTicket }) {
  const { t, formatDateTime } = useLanguage()
  const statusLabel = t(`ticket.${ticket.status}`)

  return (
    <article className={`event-ticket ticket-${ticket.status}`}>
      <div className={`ticket-cover ${event.cover}`}>
        <span>BNBU / CAMPUS HUB</span>
        <strong>{event.title}</strong>
        <small>{event.location}</small>
      </div>
      <div className="ticket-body">
        <div className="ticket-heading">
          <span className="eyebrow"><Ticket size={15} /> {t('ticket.eyebrow')}</span>
          <span className={`ticket-status ticket-status-${ticket.status}`}>
            {ticket.status === 'used' ? <Check size={15} /> : <ShieldCheck size={15} />}{statusLabel}
          </span>
        </div>
        <div className="ticket-qr-wrap" aria-label={`${t('ticket.title')} · ${statusLabel}`}>
          <div className="ticket-qr">
            <QRCodeSVG
              value={createTicketPayload(ticket)}
              size={232}
              level="M"
              marginSize={4}
              bgColor="#ffffff"
              fgColor="#0b1930"
              title={`${event.title} · ${ticket.code}`}
            />
          </div>
          {ticket.status !== 'valid' && <div className="ticket-qr-overlay"><span>{statusLabel}</span></div>}
        </div>
        <div className="ticket-facts">
          <div><CalendarDays size={18} /><span><small>{event.dateLabel}</small><strong>{event.timeLabel}</strong></span></div>
          <div><MapPin size={18} /><span><small>{event.location}</small><strong>BNBU Campus</strong></span></div>
          <div><UserRound size={18} /><span><small>{t('ticket.attendee')}</small><strong>{ticket.attendeeName}</strong></span></div>
        </div>
        <div className="ticket-code"><span>{t('ticket.ticketCode')}</span><strong>{ticket.code}</strong></div>
        {ticket.usedAt && <p className="ticket-used-at"><Check size={15} /> {formatDateTime(ticket.usedAt)}</p>}
        <p className="ticket-privacy">{t('ticket.demoNote')}</p>
      </div>
    </article>
  )
}
