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
    const paint=()=>{frame=0;const scroll=Math.max(0,window.scrollY);root.style.setProperty('--student-toolbar-progress',String(Math.min(1,scroll/140)));root.style.setProperty('--student-hero-offset',`${pathname==='/v2'&&!reducedMotion?16*Math.min(1,scroll/320):0}px`);const target=reducedMotion?0:-2*Math.min(1,scroll/240);if(reducedMotion)drift.jump(0);else drift.set(target)}
    const stopDrift=drift.on('change',value=>root.style.setProperty('--student-float-offset',`${value}px`))
    const update=()=>{if(!frame)frame=requestAnimationFrame(paint)}
    paint()
    window.addEventListener('scroll',update,{passive:true})
    return()=>{window.removeEventListener('scroll',update);cancelAnimationFrame(frame);root.style.removeProperty('--student-toolbar-progress');root.style.removeProperty('--student-float-offset');root.style.removeProperty('--student-hero-offset');stopDrift()}
  },[pathname,drift,reducedMotion])
}
