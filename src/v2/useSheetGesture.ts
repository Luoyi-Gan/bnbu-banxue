import {campusMotion} from './motionTokens'
import {animate} from 'motion/react'
import {useEffect,useRef,type RefObject} from 'react'
import {resistedSheetOffset,shouldDismissSheet} from './sheetGesture'

export function isTopSheet(panel:HTMLElement|null){
 if(!panel)return false
 const layers=[...document.querySelectorAll<HTMLElement>('.v2-modal-layer,.v2-map-picker-layer,.v2-drawer-layer')].filter(layer=>layer.getClientRects().length&&!layer.closest('[inert]'))
 return layers.at(-1)===panel.parentElement
}

/** Only the header captures pointers, never the scrolling body or its controls. */
export function mountSheetGesture(element:HTMLElement,reducedMotion:boolean,onClose:()=>void){
 const layer=element.parentElement,header=element.querySelector('header')
 if(!layer||!header)return()=>{}
 const mobile=matchMedia('(max-width:760px)')
 let offset=0,disposed=false,settling:{stop:()=>void}|undefined,recovery:ReturnType<typeof setTimeout>|undefined
 let drag:{id:number;x:number;y:number;lastY:number;time:number;velocity:number;started:boolean;base:number}|undefined
 const paint=(value:number)=>{
  offset=Math.max(0,value)
  layer.style.setProperty('--sheet-drag-y',`${offset}px`)
  layer.style.setProperty('--sheet-scrim-opacity',String(Math.max(0,1-offset/Math.max(240,element.clientHeight))))
  layer.style.setProperty('--sheet-drag-blur',`${Math.min(offset/160,1)*3}px`)
 }
 const reset=()=>{delete layer.dataset.sheetState;layer.style.removeProperty('--sheet-drag-y');layer.style.removeProperty('--sheet-scrim-opacity');layer.style.removeProperty('--sheet-drag-blur');offset=0}
 const settle=(dismiss:boolean)=>{
  settling?.stop();layer.dataset.sheetState=dismiss?'closing':'settling'
  if(reducedMotion){reset();if(dismiss)onClose();return}
  const target=dismiss?window.innerHeight-element.getBoundingClientRect().top+offset+24:0
  const complete=()=>{
   if(disposed)return
   if(!dismiss){reset();return}
   // Keep the closed position through a deferred route commit instead of flashing back.
   onClose()
   // Existing busy/validation guards may reject closing; recover naturally in that case.
   if(!disposed)recovery=setTimeout(()=>{if(!disposed)settle(false)},80)
  }
  settling=animate(offset,target,dismiss?{duration:.2,ease:[.3,0,.8,.4],onUpdate:paint,onComplete:complete}:{type:'spring',...campusMotion.sheetSpring,onUpdate:paint,onComplete:complete})
 }
 const release=()=>{const id=drag?.id;drag=undefined;if(id!==undefined&&header.hasPointerCapture(id))header.releasePointerCapture(id)}
 const down=(event:PointerEvent)=>{
  if(!mobile.matches||event.button!==0||!event.isPrimary||layer.dataset.sheetState==='closing'||!(event.target instanceof Element)||event.target.closest('button,a,input,textarea,select,[contenteditable=true]')||!isTopSheet(element))return
  settling?.stop()
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastY:event.clientY,time:event.timeStamp,velocity:0,started:false,base:offset}
  header.setPointerCapture(event.pointerId)
 }
 const move=(event:PointerEvent)=>{
  if(!drag||drag.id!==event.pointerId)return
  const distance=event.clientY-drag.y
  if(!drag.started){
   if(Math.abs(event.clientX-drag.x)>Math.max(8,Math.abs(distance))){release();if(offset)settle(false);return}
   if(Math.abs(distance)<6||distance<0&&!drag.base)return
   drag.started=true;layer.dataset.sheetState='dragging'
  }
  event.preventDefault()
  const elapsed=event.timeStamp-drag.time
  if(elapsed>0)drag.velocity=drag.velocity*.35+(event.clientY-drag.lastY)/elapsed*.65
  drag.lastY=event.clientY;drag.time=event.timeStamp
  paint(reducedMotion?0:distance<0?Math.max(0,drag.base+distance):drag.base+resistedSheetOffset(distance))
 }
 const finish=(event:PointerEvent)=>{
  if(!drag||drag.id!==event.pointerId)return
  const started=drag.started,distance=Math.max(0,drag.base+event.clientY-drag.y),velocity=event.timeStamp-drag.time>100?0:drag.velocity
  release()
  if(started)settle(shouldDismissSheet(distance,velocity,element.clientHeight));else if(offset)settle(false)
 }
 const cancel=()=>{const previous=drag;release();if(previous&&(previous.started||offset))settle(false)}
 const resize=()=>{release();settling?.stop();clearTimeout(recovery);reset()}
 header.addEventListener('pointerdown',down);header.addEventListener('pointermove',move);header.addEventListener('pointerup',finish);header.addEventListener('pointercancel',cancel);header.addEventListener('lostpointercapture',cancel)
 window.addEventListener('blur',cancel);window.addEventListener('resize',resize)
 return()=>{disposed=true;release();settling?.stop();clearTimeout(recovery);reset();header.removeEventListener('pointerdown',down);header.removeEventListener('pointermove',move);header.removeEventListener('pointerup',finish);header.removeEventListener('pointercancel',cancel);header.removeEventListener('lostpointercapture',cancel);window.removeEventListener('blur',cancel);window.removeEventListener('resize',resize)}
}

export function useSheetGesture(panel:RefObject<HTMLElement|null>,enabled:boolean,reducedMotion:boolean,onClose:()=>void){
 const close=useRef(onClose)
 useEffect(()=>{close.current=onClose},[onClose])
 useEffect(()=>{if(enabled&&panel.current)return mountSheetGesture(panel.current,reducedMotion,()=>close.current())},[panel,enabled,reducedMotion])
}
