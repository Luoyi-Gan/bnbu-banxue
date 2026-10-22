import {useEffect,useRef,type RefObject} from 'react'
import {animate} from 'motion/react'
import {campusMotion} from './motionTokens'
import {isTopSheet} from './useSheetGesture'
import {resistedSheetHeight,resistedSheetOffset,sheetDetent,shouldDismissSheet} from './sheetGesture'
import './panelGesture.css'

/** Only the dedicated grip captures pointers; scrolling, map gestures and form controls stay native. */
export function usePanelGesture(panel:RefObject<HTMLElement|null>,enabled:boolean,reduced:boolean,kind:'resize'|'dismiss',onClose:()=>void,identity=''){
 const callback=useRef(onClose)
 useEffect(()=>{callback.current=onClose},[onClose])
 useEffect(()=>{
  const element=panel.current,grip=element?.querySelector<HTMLElement>('[data-panel-grip]')
  if(!enabled||!element||!grip)return
  const mobile=matchMedia('(max-width:600px)')
  let value=0,dragged=false,disposed=false,animation:{stop:()=>void}|undefined
  let drag:{id:number;x:number;y:number;last:number;time:number;speed:number;base:number;started:boolean}|undefined
  const stops=()=>{const available=Math.max(120,innerHeight-(parseFloat(getComputedStyle(element).bottom)||0)-68);return[available*.34,available*.62,available]}
  const paint=(next:number)=>{
   value=next;element.style.setProperty(kind==='resize'?'--gesture-height':'--gesture-offset',`${next}px`)
   if(kind==='dismiss')element.parentElement?.style.setProperty('--gesture-scrim',String(Math.max(.25,1-next/innerHeight)))
  }
  const settle=(target:number)=>{
   animation?.stop();element.dataset.panelGesture='settling'
   const finish=()=>{if(!disposed){paint(target);delete element.dataset.panelGesture}}
   if(reduced){finish();return}
   animation=animate(value,target,{type:'spring',...campusMotion.sheetSpring,onUpdate:paint,onComplete:finish})
  }
  const release=()=>{const id=drag?.id;drag=undefined;if(id!==undefined&&grip.hasPointerCapture(id))grip.releasePointerCapture(id)}
  const cancel=()=>{const previous=drag;release();if(previous?.started)settle(kind==='resize'?previous.base:0)}
  const down=(event:PointerEvent)=>{
   if(!mobile.matches||!event.isPrimary||event.button!==0||document.documentElement.dataset.sharedTransition)return
   if(element.closest('.v2-drawer-layer,.v2-modal-layer')?!isTopSheet(element):document.querySelector('.v2-modal-layer,.v2-map-picker-layer'))return
   animation?.stop();dragged=false
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,last:event.clientY,time:event.timeStamp,speed:0,base:kind==='resize'?element.getBoundingClientRect().height:value,started:false}
   grip.setPointerCapture(event.pointerId)
  }
  const move=(event:PointerEvent)=>{
   if(!drag||drag.id!==event.pointerId)return
   const delta=event.clientY-drag.y
   if(!drag.started){if(Math.abs(event.clientX-drag.x)>Math.max(8,Math.abs(delta))){cancel();return}if(Math.abs(delta)<6)return;drag.started=true;dragged=true;element.dataset.panelGesture='dragging'}
   event.preventDefault()
   const elapsed=event.timeStamp-drag.time
   if(elapsed>0)drag.speed=drag.speed*.35+(event.clientY-drag.last)/elapsed*.65
   drag.last=event.clientY;drag.time=event.timeStamp
   if(kind==='resize'){const sizes=stops();paint(reduced?drag.base:resistedSheetHeight(drag.base-delta,sizes[0],sizes[2]))}
   else paint(reduced?0:resistedSheetOffset(delta))
  }
  const up=(event:PointerEvent)=>{
   if(!drag||drag.id!==event.pointerId)return
   const previous=drag,speed=event.timeStamp-drag.time>100?0:drag.speed
   release();if(!previous.started)return
   if(kind==='resize')settle(sheetDetent(previous.base-(event.clientY-previous.y),speed,stops()))
   else if(shouldDismissSheet(Math.max(0,event.clientY-previous.y),speed,element.clientHeight)){element.dataset.panelGesture='closing';callback.current()}
   else settle(0)
  }
  const click=(event:MouseEvent)=>{
   if(!mobile.matches)return
   if(dragged){dragged=false;if(event.detail!==0){event.preventDefault();event.stopImmediatePropagation();return}}
   event.preventDefault()
   if(kind==='dismiss')callback.current()
   else{const sizes=stops(),current=element.getBoundingClientRect().height;value=current;settle(sizes.find(size=>size>current+20)??sizes[0])}
  }
  const resize=()=>{cancel();animation?.stop();delete element.dataset.panelGesture;element.style.removeProperty('--gesture-height');element.style.removeProperty('--gesture-offset');element.parentElement?.style.removeProperty('--gesture-scrim');value=0}
  grip.addEventListener('pointerdown',down);grip.addEventListener('pointermove',move);grip.addEventListener('pointerup',up);grip.addEventListener('pointercancel',cancel);grip.addEventListener('lostpointercapture',cancel);grip.addEventListener('click',click,true)
  window.addEventListener('blur',cancel);window.addEventListener('resize',resize)
  return()=>{disposed=true;animation?.stop();release();resize();grip.removeEventListener('pointerdown',down);grip.removeEventListener('pointermove',move);grip.removeEventListener('pointerup',up);grip.removeEventListener('pointercancel',cancel);grip.removeEventListener('lostpointercapture',cancel);grip.removeEventListener('click',click,true);window.removeEventListener('blur',cancel);window.removeEventListener('resize',resize)}
 },[panel,enabled,reduced,kind,identity])
}
