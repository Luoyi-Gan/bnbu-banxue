import { uiText, useUiLanguage } from '../uiLanguage'
import {StudentUtilities} from '../StudentUtilities'
import type { ReactNode } from 'react'

export function SportsHeader({ title, actions }: { title: string; actions?: ReactNode }) { useUiLanguage();
  return <header className="movement-page-header"><h1>{uiText(title)}</h1><nav aria-label={uiText("运动页面工具")}>{actions}<StudentUtilities/></nav></header>
}
export function SportsEmptyNote({ children }: { children: ReactNode }) { useUiLanguage();
  return <div className="movement-empty"><p>{children}</p></div>
}
