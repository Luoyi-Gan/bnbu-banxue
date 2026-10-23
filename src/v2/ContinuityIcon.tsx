import {useLayoutEffect,useRef} from 'react'
import type {LucideIcon} from 'lucide-react'
import {useDevicePreferences} from './devicePreferences'
import './stateContinuity.css'
import {playConfirmedState} from './stateContinuity'

/** React to confirmed state changes, with no animation for initially loaded state. */
export function ContinuityIcon({icon:Icon,active,size=18,fill=true,enter=false}:{icon:LucideIcon;active:boolean;size?:number;fill?:boolean;enter?:boolean}){
 const element=useRef<HTMLSpanElement>(null)
 const previous=useRef(active)
 const {reducedMotion}=useDevicePreferences()
 useLayoutEffect(()=>{
  if(previous.current===active)return
  previous.current=active
  if(element.current)return playConfirmedState(element.current,active,reducedMotion)
 },[active,reducedMotion])
 return <span ref={element} className={`continuity-icon${enter?' continuity-icon-enter':''}`} data-state-active={active} aria-hidden="true"><Icon size={size} fill={fill&&active?'currentColor':'transparent'}/></span>
}
