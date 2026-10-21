import {sharedElementTransition} from './sharedElementMotion'
import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { uiText, useUiLanguage } from './uiLanguage'
import './discoveryDetail.css'

/** Reading surface shared by activities, community posts and alumni stories. */
export function DiscoveryDetail({title,identity,media,children,actions,onClose,transitionKey}:{transitionKey?:string;title:string;identity:ReactNode;media?:ReactNode;children:ReactNode;actions?:ReactNode;onClose:()=>void}){
  useUiLanguage()
  const panel=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null),closeCallback=useRef(onClose)
  const dismiss=()=>{if(transitionKey)sharedElementTransition(transitionKey,onClose,{reverse:true});else onClose()}
  useEffect(()=>{closeCallback.current=dismiss})
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow
    const roots=[...document.querySelectorAll<HTMLElement>('.v2-app')].map(root=>({root,inert:root.inert}))
    roots.forEach(({root})=>{root.inert=true})
    document.body.style.overflow='hidden'
    close.current?.focus({preventScroll:true})
    const keyboard=(event:KeyboardEvent)=>{
      if(document.querySelector('.v2-map-picker-layer,.v2-modal-layer'))return
      if(event.key==='Escape'){event.preventDefault();closeCallback.current();return}
      if(event.key!=='Tab')return
      const items=[...panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,[tabindex="0"]')??[]].filter(item=>item.getClientRects().length>0)
      const first=items[0],last=items.at(-1)
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    document.addEventListener('keydown',keyboard)
    return()=>{
      document.removeEventListener('keydown',keyboard)
      document.body.style.overflow=overflow
      roots.forEach(({root,inert})=>{root.inert=inert})
      if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})
    }
  },[])
  return createPortal(<div className="v2-drawer-layer note-detail-layer">
    <button type="button" className="note-detail-scrim" tabIndex={-1} aria-label={uiText('关闭详情')} onClick={dismiss}/>
    <section className={`note-detail${media?'':' note-detail-text'}`} role="dialog" aria-modal="true" aria-label={title} ref={panel}>
      <header className="note-detail-header">{identity}<button type="button" ref={close} className="note-detail-close" aria-label={uiText('关闭')} onClick={dismiss}><X size={22}/></button></header>
      <div className="note-detail-scroll">{media&&<div className="note-detail-media" data-shared-target={transitionKey}>{media}</div>}<article className="note-detail-body"><h2 className="note-detail-title">{title}</h2>{children}</article></div>
      {actions&&<footer className="note-detail-actions">{actions}</footer>}
    </section>
  </div>,document.body)
}

export function DetailPhoto({src,alt,caption}:{src?:string;alt:string;caption?:string}){
  const [failed,setFailed]=useState(false)
  return <figure className="note-detail-photo">{src&&!failed?<img src={src} alt={alt} decoding="async" onError={()=>setFailed(true)}/>:<span className="note-detail-photo-error">{uiText('图片暂不可用')}</span>}{caption&&<figcaption>{caption}</figcaption>}</figure>
}
