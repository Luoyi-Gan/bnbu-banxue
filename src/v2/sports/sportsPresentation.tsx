import { uiText, useUiLanguage } from '../uiLanguage'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function SportsHeader({ title, actions }: { title: string; actions?: ReactNode }) { useUiLanguage();
  return <header className="movement-page-header"><h1>{uiText(title)}</h1><nav aria-label={uiText("运动页面工具")}>{actions}<Link to="/v2/messages?view=notifications" aria-label={uiText("通知")}><Bell size={21}/></Link></nav></header>
}
export function SportsEmptyNote({ children }: { children: ReactNode }) { useUiLanguage();
  return <div className="movement-empty"><p>{children}</p></div>
}
