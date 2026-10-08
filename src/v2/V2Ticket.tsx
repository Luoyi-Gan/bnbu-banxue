import { CalendarDays, MapPin, ShieldCheck, Ticket, UserRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { studentName } from './model'
import type { ActivityItem } from './activityFilters'
import { Modal } from './ui'

export function V2Ticket({ event, onClose }: { event: ActivityItem; onClose: () => void }) {
  const code = `V2-${event.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}`
  const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(event.startAt))
  return <Modal title="活动电子凭证" onClose={onClose}>
    <article className="v2-ticket-card">
      <div className="v2-ticket-cover" style={event.image ? { backgroundImage: `linear-gradient(90deg,rgba(7,29,74,.88),rgba(7,29,74,.3)),url(${event.image})` } : undefined}>
        <span><Ticket size={16}/> BNBU CAMPUS · DEMO TICKET</span>
        <h3>{event.title}</h3>
        <p>{event.subtitle}</p>
      </div>
      <div className="v2-ticket-content">
        <div className="v2-ticket-status"><ShieldCheck size={17}/> 已报名 · 演示凭证</div>
        <div className="v2-ticket-qr"><QRCodeSVG value={`BNBU-V2-DEMO|${event.id}|${studentName}|${code}`} size={174} marginSize={0} title={`${event.title} 演示凭证`}/></div>
        <div className="v2-ticket-facts"><span><CalendarDays size={17}/><strong>{date}</strong></span><span><MapPin size={17}/><strong>{event.location}</strong></span><span><UserRound size={17}/><strong>{studentName}</strong></span></div>
        <div className="v2-ticket-code"><span>凭证编号</span><strong>{code}</strong></div>
        <p>这是新版的本地演示凭证，二维码不用于现场核验。</p>
      </div>
    </article>
  </Modal>
}
