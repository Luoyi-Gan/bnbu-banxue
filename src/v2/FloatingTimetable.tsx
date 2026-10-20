import { uiText, useUiLanguage } from './uiLanguage'
import { CalendarDays, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { StudentTimetable } from './StudentTimetable'

export function FloatingTimetable() { useUiLanguage();
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return <>
    {createPortal(<button type="button" className="student-timetable-launcher" aria-label={open?uiText('收起课表窗口'):uiText('打开课表窗口')} aria-expanded={open} aria-controls="v2-floating-timetable" onClick={() => setOpen(value => !value)}><CalendarDays size={20}/><span>{uiText("我的课表")}</span></button>,document.body)}
    {open && <aside id="v2-floating-timetable" className="v2-floating-timetable-window" role="dialog" aria-label={uiText("我的课表")} aria-modal="false"><header><span><CalendarDays size={18}/> {uiText("我的课表")}</span><button type="button" aria-label={uiText("关闭课表窗口")} onClick={() => setOpen(false)}><X size={18}/></button></header><div className="v2-floating-timetable-content"><StudentTimetable idPrefix="floating-timetable"/></div></aside>}
  </>
}
