import {useSpring} from 'motion/react'
import {useDevicePreferences} from './devicePreferences'
import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'

/** Update only the toolbar paint value, once per frame; never render on scroll. */
export function useStudentScrollGlass(){
  const {pathname}=useLocation()
  const {reducedMotion}=useDevicePreferences()
  const drift=useSpring(0,{stiffness:200,damping:30,mass:.7})
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('.v2-app-student')
    if(!root)return
    let frame=0
    const paint=()=>{frame=0;root.style.setProperty('--student-toolbar-progress',String(Math.min(1,Math.max(0,window.scrollY)/140)));const target=reducedMotion?0:-2*Math.min(1,Math.max(0,window.scrollY)/240);if(reducedMotion)drift.jump(0);else drift.set(target)}
    const stopDrift=drift.on('change',value=>root.style.setProperty('--student-float-offset',`${value}px`))
    const update=()=>{if(!frame)frame=requestAnimationFrame(paint)}
    paint()
    window.addEventListener('scroll',update,{passive:true})
    return()=>{window.removeEventListener('scroll',update);cancelAnimationFrame(frame);root.style.removeProperty('--student-toolbar-progress');root.style.removeProperty('--student-float-offset');stopDrift()}
  },[pathname,drift,reducedMotion])
}
