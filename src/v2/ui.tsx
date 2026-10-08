import { ArrowLeft, X, type LucideIcon } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="v2-page-heading"><div><span className="v2-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="v2-heading-action">{action}</div>}</header>
}
export function SectionHeading({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <div className="v2-section-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>
}
export function Empty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return <div className="v2-empty"><Icon size={26}/><strong>{title}</strong>{description && <p>{description}</p>}</div>
}
export function Drawer({ title, eyebrow, children, onClose, wide = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [onClose])
  return createPortal(<div className="v2-drawer-layer"><button type="button" className="v2-drawer-scrim" aria-label="关闭详情" onClick={onClose}/><aside className={`v2-drawer${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header><div>{eyebrow && <span className="v2-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><button type="button" className="v2-icon-button" aria-label="关闭" onClick={onClose}><X size={20}/></button></header><div className="v2-drawer-body">{children}</div></aside></div>, document.body)
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [onClose])
  return createPortal(<div className="v2-modal-layer"><button className="v2-modal-scrim" type="button" aria-label="关闭窗口" onClick={onClose}/><div className="v2-modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button type="button" className="v2-icon-button" aria-label="关闭" onClick={onClose}><X size={19}/></button></header>{children}</div></div>, document.body)
}
export function BackLink({ to, children }: { to: string; children: ReactNode }) { return <Link className="v2-back-link" to={to}><ArrowLeft size={17}/>{children}</Link> }
