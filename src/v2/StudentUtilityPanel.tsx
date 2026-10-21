import {useEffect, useRef, type ReactNode} from 'react'
import {Modal} from './ui'

export function StudentUtilityPanel({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const initialTitle=useRef(title)
  useEffect(()=>{
    const restoreLabel=initialTitle.current
    const trigger=document.activeElement as HTMLElement|null
    const app=document.querySelector<HTMLElement>('.v2-app-student')
    const overflow=document.body.style.overflow
    app?.setAttribute('inert','')
    document.body.style.overflow='hidden'
    const focusables=()=>Array.from(document.querySelectorAll<HTMLElement>('.v2-modal')).at(-1)?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')
    const frame=requestAnimationFrame(()=>focusables()?.[0]?.focus())
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab'||document.querySelector('.v2-map-picker-layer'))return
      const nodes=Array.from(focusables()??[]).filter(el=>el.getClientRects().length)
      const first=nodes[0],last=nodes.at(-1)
      if(!document.activeElement?.closest('.v2-modal')){event.preventDefault();(event.shiftKey?last:first)?.focus()}
      else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    document.addEventListener('keydown',trap)
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',trap);app?.removeAttribute('inert');document.body.style.overflow=overflow;const restore=trigger?.matches('a,button')?trigger:app?.querySelector<HTMLElement>(`.student-utilities a[aria-label="${restoreLabel}"]`);restore?.focus()}
  },[])
  return <Modal title={title} onClose={()=>{if(document.querySelectorAll('.v2-modal').length===1)onClose()}}><div className="student-utility-content">{children}</div></Modal>
}
