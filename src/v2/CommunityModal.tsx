import {useEffect,useRef,type ReactNode} from 'react'
import {Modal} from './ui'

/** Community sheets can sit above the note reader without exposing its focus. */
export function CommunityModal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
  const callback=useRef(onClose)
  useEffect(()=>{callback.current=onClose},[onClose])
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow
    const layer=[...document.querySelectorAll<HTMLElement>('.v2-modal-layer')].at(-1),panel=layer?.querySelector<HTMLElement>('[role=dialog]')
    const selector=document.querySelector('.note-detail-layer')?'.note-detail-layer':'.v2-app'
    const roots=[...document.querySelectorAll<HTMLElement>(selector)].map(root=>({root,inert:root.inert}))
    roots.forEach(({root})=>{root.inert=true});document.body.style.overflow='hidden'
    const items=()=>[...panel?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')??[]].filter(item=>item.getClientRects().length>0)
    items()[0]?.focus({preventScroll:true})
    const keyboard=(event:KeyboardEvent)=>{if(event.key!=='Tab')return;const all=items(),first=all[0],last=all.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
    document.addEventListener('keydown',keyboard)
    return()=>{document.removeEventListener('keydown',keyboard);roots.forEach(({root,inert})=>{root.inert=inert});document.body.style.overflow=overflow;if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})}
  },[])
  return <Modal title={title} onClose={()=>callback.current()}>{children}</Modal>
}
