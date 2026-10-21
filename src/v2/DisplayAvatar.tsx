import { useUiLanguage, uiText } from './uiLanguage'
import './displayAvatar.css'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { api, workspaceChangedEvent } from '../live/api'

type HoverItem = {id: string; title: string; path: string}
type HoverPerson = {id: string; name: string; avatar: string; visibleSections: {recentTeams:boolean; activeTeams:boolean; activities:boolean}; recentTeams: HoverItem[]; activeTeams: HoverItem[]; activities: HoverItem[]}

export function DisplayAvatar({name, avatar, className, personId, lookupNumber}: {name: string; avatar?: string; className: string; personId?: string | null; lookupNumber?: string}) { useUiLanguage();
  const anchor = useRef<HTMLSpanElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [card, setCard] = useState<HoverPerson | null>(null)
  const [failed, setFailed] = useState(false)
  const [position, setPosition] = useState<{top:number;left:number} | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener(workspaceChangedEvent, close)
    return () => {window.clearTimeout(timer.current); window.removeEventListener(workspaceChangedEvent, close)}
  }, [])
  useEffect(() => {setCard(null); setOpen(false)}, [personId, lookupNumber])
  const show = () => {
    if (!personId) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const rect = anchor.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({top: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 330)), left: Math.max(12, Math.min(rect.left, window.innerWidth - 292))})
      setCard(null)
      setFailed(false)
      setOpen(true)
      const query = lookupNumber ? `?number=${encodeURIComponent(lookupNumber)}` : ''
      void api<HoverPerson>(`/api/people/${encodeURIComponent(personId)}/hover${query}`).then(setCard).catch(() => setFailed(true))
    }, 180)
  }
  const hide = () => {window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 180)}
  return <>
    <span ref={anchor} className={`${className} v2-display-avatar`} aria-hidden="true" onMouseEnter={show} onMouseLeave={hide}>
      {avatar?<img src={avatar} alt=""/>:name.slice(0, 1)}
    </span>
    {open && position && createPortal(<div className="v2-person-hover" style={{top: position.top, left: position.left}} onMouseEnter={() => window.clearTimeout(timer.current)} onMouseLeave={hide}>
      {card && card.id === personId?<><div className="v2-person-hover-head"><span className="v2-person-hover-photo">{card.avatar ? <img src={card.avatar} alt=""/> : card.name.slice(0, 1)}</span><strong>{card.name}</strong></div>
        {([['近期组队',card.recentTeams,card.visibleSections.recentTeams],['正在组队',card.activeTeams,card.visibleSections.activeTeams],['参与活动',card.activities,card.visibleSections.activities]] as [string,HoverItem[],boolean][]).map(([label,items,visible]) => visible && <section key={label}><small>{uiText(label)}</small>{items.length ? items.map(item => <Link key={item.id} to={item.path} onClick={() => setOpen(false)}>{item.title}</Link>) : <span className="v2-person-hover-empty">{uiText("暂无公开记录")}</span>}</section>)}
      </>:<span className="v2-person-hover-loading">{failed?uiText('资料暂不可读取'):uiText('正在读取资料…')}</span>}
    </div>, document.body)}
  </>
}
