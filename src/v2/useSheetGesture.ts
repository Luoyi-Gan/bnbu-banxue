import {animate} from 'motion/react'
import {useEffect,useRef,type RefObject} from 'react'
import {resistedSheetOffset,shouldDismissSheet} from './sheetGesture'

/** Dragging the header never competes with scrolling or editing the sheet body. */
export function useSheetGesture(panel:RefObject<HTMLDivElement|null>,enabled:boolean,reducedMotion:boolean,onClose:()=>void){
 const close=useRef(onClose)
 useEffect(()=>{close.current=onClose},[onClose])
 useEffect(()=>{
  const element=panel.current,layer=element?.parentElement,header=element?.querySelector('header')
  if(!enabled||!element||!layer||!header)return
  let offset=0,disposed=false,settling:{stop:()=>void}|undefined
  let drag:{id:number;x:number;y:number;lastY:number;time:number;velocity:number;started:boolean;base:number}|undefined
  const paint=(value:number)=>{
   offset=value
   layer.style.setProperty('--sheet-drag-y',`${value}px`)
   layer.style.setProperty('--sheet-scrim-opacity',String(Math.max(0,1-value/Math.max(240,element.clientHeight))))
   // The opaque utility surface stays stable; blur exists only during this gesture.
   layer.style.setProperty('--sheet-drag-blur',`${Math.min(value/160,1)*3}px`)
  }
  const reset=()=>{delete layer.dataset.sheetState;layer.style.removeProperty('--sheet-drag-y');layer.style.removeProperty('--sheet-scrim-opacity');layer.style.removeProperty('--sheet-drag-blur');offset=0}
  const settle=(dismiss:boolean)=>{
   layer.dataset.sheetState=dismiss?'closing':'settling'
   if(reducedMotion){reset();if(dismiss)close.current();return}
   const target=dismiss?window.innerHeight-element.getBoundingClientRect().top+offset+24:0
   const complete=()=>{if(disposed)return;reset();if(dismiss)close.current()}
   settling=animate(offset,target,dismiss?{duration:.2,ease:[.3,0,.8,.4],onUpdate:paint,onComplete:complete}:{type:'spring',stiffness:440,damping:34,mass:.8,onUpdate:paint,onComplete:complete})
  }
  const release=()=>{
   const id=drag?.id;drag=undefined
   if(id!==undefined&&header.hasPointerCapture(id))header.releasePointerCapture(id)
  }
  const down=(event:PointerEvent)=>{
   if(event.button!==0||!event.isPrimary||layer.dataset.sheetState==='closing'||!(event.target instanceof Element)||event.target.closest('button,a,input,textarea,select,[contenteditable=true]'))return
   if([...document.querySelectorAll('.v2-modal-layer,.v2-map-picker-layer')].at(-1)!==layer)return
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastY:event.clientY,time:event.timeStamp,velocity:0,started:false,base:0}
   header.setPointerCapture(event.pointerId)
  }
  const move=(event:PointerEvent)=>{
   if(!drag||drag.id!==event.pointerId)return
   const distance=event.clientY-drag.y
   if(!drag.started){
    if(Math.abs(event.clientX-drag.x)>Math.max(8,Math.abs(distance))){release();return}
    if(distance<6)return
    settling?.stop();drag.base=offset;drag.started=true;layer.dataset.sheetState='dragging'
   }
   event.preventDefault()
   const elapsed=event.timeStamp-drag.time
   if(elapsed>0)drag.velocity=(event.clientY-drag.lastY)/elapsed
   drag.lastY=event.clientY;drag.time=event.timeStamp
   paint(reducedMotion?0:drag.base+resistedSheetOffset(distance))
  }
  const finish=(event:PointerEvent)=>{
   if(!drag||drag.id!==event.pointerId)return
   const started=drag.started,distance=Math.max(0,event.clientY-drag.y)
   const velocity=event.timeStamp-drag.time>100?0:drag.velocity
   release()
   if(started)settle(shouldDismissSheet(distance,velocity,element.clientHeight))
  }
  const cancel=()=>{const started=drag?.started;release();if(started)settle(false)}
  header.addEventListener('pointerdown',down)
  header.addEventListener('pointermove',move)
  header.addEventListener('pointerup',finish)
  header.addEventListener('pointercancel',cancel)
  header.addEventListener('lostpointercapture',cancel)
  window.addEventListener('blur',cancel)
  return()=>{
   disposed=true;settling?.stop();release();reset()
   header.removeEventListener('pointerdown',down);header.removeEventListener('pointermove',move);header.removeEventListener('pointerup',finish);header.removeEventListener('pointercancel',cancel);header.removeEventListener('lostpointercapture',cancel);window.removeEventListener('blur',cancel)
  }
 },[panel,enabled,reducedMotion])
}
