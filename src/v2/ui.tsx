import {sharedMotion} from './sharedElementMotion'
import {useSheetGesture,isTopSheet} from './useSheetGesture'
import {usePanelGesture} from './usePanelGesture'
import './sheetGesture.css'
import {useDevicePreferences} from './devicePreferences'
import { uiText, useUiLanguage } from './uiLanguage'
import { ArrowLeft, X, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

export function PageHeading({ eyebrow, title, description, action, back, backLabel="返回校园" }: { eyebrow: string; title: string; description?: string; action?: ReactNode; back?: string; backLabel?: string }) { useUiLanguage();
  return <header className="v2-page-heading"><div><span className="v2-eyebrow">{uiText(eyebrow)}</span><h1 className={back?"v2-title-with-back":undefined}>{back&&<Link className="v2-title-back" to={back} aria-label={uiText(backLabel)} title={uiText(backLabel)}><ArrowLeft size={22}/></Link>}{uiText(title)}</h1>{description && <p>{uiText(description)}</p>}</div>{action && <div className="v2-heading-action">{action}</div>}</header>
}
export function SectionHeading({ title, detail, action, hideTitle=false }: { title: string; detail?: string; action?: ReactNode;hideTitle?:boolean }) { useUiLanguage();
  if(hideTitle&&!detail&&!action)return null
  return <div className="v2-section-heading"><div>{!hideTitle&&<h2>{uiText(title)}</h2>}{detail && <p>{uiText(detail)}</p>}</div>{action}</div>
}
export function Empty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) { useUiLanguage();
  return <div className="v2-empty"><Icon size={26}/><strong>{uiText(title)}</strong>{description && <p>{uiText(description)}</p>}</div>
}
export type CardOrigin={x:number;y:number;width:number;height:number}
export function Drawer({ title, eyebrow, children, onClose, wide = false, origin }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean; origin?:CardOrigin }) { useUiLanguage();
  const {reducedMotion}=useDevicePreferences()
  const panel=useRef<HTMLElement>(null),animation=useRef<Animation|null>(null),closing=useRef(false)
  const initialTransform=useRef('')
  useLayoutEffect(()=>{
    const element=panel.current
    if(!element||!origin||reducedMotion)return
    const bounds=element.getBoundingClientRect()
    initialTransform.current=`translate(${origin.x-bounds.x}px,${origin.y-bounds.y}px) scale(${origin.width/bounds.width},${origin.height/bounds.height})`
    animation.current=element.animate([{transform:initialTransform.current,borderRadius:'24px',opacity:.65},{transform:'none',opacity:1}],{duration:sharedMotion.enter,easing:sharedMotion.enterEase})
    return()=>animation.current?.cancel()
  },[origin,reducedMotion])
  const dismiss=useCallback(()=>{
    if(closing.current)return
    const element=panel.current
    if(!element||!initialTransform.current||reducedMotion){onClose();return}
    closing.current=true
    animation.current?.cancel()
    animation.current=element.animate([{transform:'none',translate:getComputedStyle(element).translate,opacity:1},{transform:initialTransform.current,translate:'0px',borderRadius:'24px',opacity:0}],{duration:sharedMotion.exit,easing:sharedMotion.exitEase,fill:'forwards'})
    animation.current.onfinish=onClose
  },[onClose,reducedMotion])
  usePanelGesture(panel,true,reducedMotion,'dismiss',dismiss)
  useEffect(()=>{
    const previous=document.activeElement
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true})
    return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})}
  },[])
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape'&&isTopSheet(panel.current)) dismiss() }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [dismiss])
  return createPortal(<div className="v2-drawer-layer"><button type="button" className="v2-drawer-scrim" aria-label={uiText("关闭详情")} onClick={dismiss}/><aside ref={panel} className={`v2-drawer${wide ? ' is-wide' : ''}${origin?' is-course-expansion':''}`} role="dialog" aria-modal="true" aria-label={uiText(title)}><header><button type="button" className="panel-gesture-grip" data-panel-grip aria-label={uiText("收起详情，或向下拖动")}/><div>{eyebrow && <span className="v2-eyebrow">{uiText(eyebrow)}</span>}<h2>{uiText(title)}</h2></div><button type="button" className="v2-icon-button" aria-label={uiText("关闭")} onClick={dismiss}><X size={20}/></button></header><div className="v2-drawer-body">{children}</div></aside></div>, document.body)
}
export function Modal({ title, children, onClose, gesture=true }: { title: string; children: ReactNode; onClose: () => void;gesture?:boolean }) { useUiLanguage();
  const panel=useRef<HTMLDivElement>(null)
  const {reducedMotion}=useDevicePreferences()
  useSheetGesture(panel,gesture,reducedMotion,onClose)
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape'&&isTopSheet(panel.current)) onClose() }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [onClose])
  return createPortal(<div className="v2-modal-layer"><button className="v2-modal-scrim" type="button" aria-label={uiText("关闭窗口")} onClick={onClose}/><div ref={panel} data-sheet-gesture={gesture?true:undefined} className="v2-modal" role="dialog" aria-modal="true" aria-label={uiText(title)}><header><h2>{uiText(title)}</h2><button type="button" className="v2-icon-button" aria-label={uiText("关闭")} onClick={onClose}><X size={19}/></button></header>{children}</div></div>, document.body)
}
export function BackLink({ to, children }: { to: string; children: ReactNode }) { useUiLanguage();  return <Link className="v2-back-link" to={to}><ArrowLeft size={17}/>{children}</Link> }
