import {useSpring} from 'motion/react'
import {useDevicePreferences} from './devicePreferences'
import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'

/** Update paint variables once per frame, including independently scrolling portals. */
export function useStudentScrollGlass(){
  const {pathname}=useLocation()
  const {reducedMotion}=useDevicePreferences()
  const drift=useSpring(0,{stiffness:200,damping:30,mass:.7})
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('.v2-app-student')
    if(!root)return
    let frame=0
    let panel:HTMLElement|null=null
    let panelScroll=0
    const paint=()=>{frame=0;const scroll=Math.max(0,window.scrollY);root.style.setProperty('--student-toolbar-progress',String(Math.min(1,scroll/140)));root.style.setProperty('--student-hero-offset',`${pathname==='/v2'&&!reducedMotion?16*Math.min(1,scroll/320):0}px`);root.style.setProperty('--student-profile-offset',`${pathname==='/v2/me'&&!reducedMotion?12*Math.min(1,scroll/280):0}px`);const target=reducedMotion?0:-2*Math.min(1,scroll/240);if(reducedMotion)drift.jump(0);else drift.set(target)}
    const stopDrift=drift.on('change',value=>root.style.setProperty('--student-float-offset',`${value}px`))
    const paintGlass=()=>{
      paint()
      root.style.setProperty('--student-liquid-progress',String(reducedMotion?0:Math.min(1,Math.max(0,window.scrollY)/180)))
      panel?.style.setProperty('--student-liquid-progress',String(reducedMotion?0:Math.min(1,panelScroll/180)))
    }
    const update=(event:Event)=>{
      const target=event.target
      panel=target instanceof HTMLElement?target.closest<HTMLElement>('.v2-modal,.v2-student-search-panel,.campus-discovery-filter-fields'):null
      panelScroll=target instanceof HTMLElement?Math.max(0,target.scrollTop):0
      if(!frame)frame=requestAnimationFrame(paintGlass)
    }
    paintGlass()
    window.addEventListener('scroll',update,{passive:true,capture:true})
    return()=>{window.removeEventListener('scroll',update,true);cancelAnimationFrame(frame);root.style.removeProperty('--student-toolbar-progress');root.style.removeProperty('--student-liquid-progress');document.querySelectorAll<HTMLElement>('.v2-modal,.v2-student-search-panel,.campus-discovery-filter-fields').forEach(element=>element.style.removeProperty('--student-liquid-progress'));root.style.removeProperty('--student-float-offset');root.style.removeProperty('--student-hero-offset');root.style.removeProperty('--student-profile-offset');stopDrift()}
  },[pathname,drift,reducedMotion])
}
