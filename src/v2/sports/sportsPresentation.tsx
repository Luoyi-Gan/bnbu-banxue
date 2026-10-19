import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function SportsHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return <header className="movement-page-header"><h1>{title}</h1><nav aria-label="运动页面工具">{actions}<Link to="/v2/messages?view=notifications" aria-label="通知"><Bell size={21}/></Link></nav></header>
}
export function SportsEmptyNote({ children }: { children: ReactNode }) {
  return <div className="movement-empty"><p>{children}</p></div>
}
