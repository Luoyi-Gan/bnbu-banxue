import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'

/** Update only the toolbar paint value, once per frame; never render on scroll. */
export function useStudentScrollGlass(){
  const {pathname}=useLocation()
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('.v2-app-student')
    if(!root)return
    let frame=0
    const paint=()=>{frame=0;root.style.setProperty('--student-toolbar-progress',String(Math.min(1,Math.max(0,window.scrollY)/140)))}
    const update=()=>{if(!frame)frame=requestAnimationFrame(paint)}
    paint()
    window.addEventListener('scroll',update,{passive:true})
    return()=>{window.removeEventListener('scroll',update);cancelAnimationFrame(frame);root.style.removeProperty('--student-toolbar-progress')}
  },[pathname])
}
