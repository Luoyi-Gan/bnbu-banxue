import { uiText, useUiLanguage } from './uiLanguage'
import { CalendarDays, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { StudentTimetable } from './StudentTimetable'

export function FloatingTimetable() { useUiLanguage();
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [toolbar, setToolbar] = useState<Element | null>(null)
  useEffect(() => {
    const slot = document.createElement('span')
    slot.className = 'v2-timetable-toolbar-slot'
    const update = () => {
      const target = document.querySelector('.v2-app .ref-header nav, .v2-app .cw-header nav') ?? document.querySelector('.v2-app .v2-top-actions')
      if (target && slot.parentElement !== target) target.prepend(slot)
      setToolbar(target ? slot : null)
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.querySelector('.v2-app') ?? document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); slot.remove() }
  }, [location.pathname])

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return <>
    {toolbar && createPortal(<button type="button" className="v2-floating-timetable-trigger is-toolbar" aria-label={open?uiText('收起课表窗口'):uiText('打开课表窗口')} aria-expanded={open} aria-controls="v2-floating-timetable" onClick={() => setOpen(value => !value)}><CalendarDays size={18}/><span>{uiText("课表")}</span></button>, toolbar)}
    {open && <aside id="v2-floating-timetable" className="v2-floating-timetable-window" role="dialog" aria-label={uiText("我的课表")} aria-modal="false"><header><span><CalendarDays size={18}/> {uiText("我的课表")}</span><button type="button" aria-label={uiText("关闭课表窗口")} onClick={() => setOpen(false)}><X size={18}/></button></header><div className="v2-floating-timetable-content"><StudentTimetable idPrefix="floating-timetable"/></div></aside>}
  </>
}
