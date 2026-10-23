import {useLayoutEffect, useRef} from 'react'
import {campusMotion} from './motionTokens'

/** Animate the newly mounted page without moving the persistent header or navigation. */
export function useStudentRouteMotion(path:string|null, enabled:boolean, reducedMotion:boolean) {
  const mainRef=useRef<HTMLElement>(null)
  const previousPath=useRef<string|null>(null)

  useLayoutEffect(()=>{
    if (!path) return
    const changed=previousPath.current!==null&&previousPath.current!==path
    previousPath.current=path
    if (!changed||!enabled||reducedMotion||document.hidden||document.documentElement.dataset.sharedTransition||matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const main=mainRef.current
    if (!main) return
    const page=main.firstElementChild as HTMLElement|null
    const heading=page?.querySelector<HTMLElement>(':scope > .v2-page-heading')
    const fade=main.animate([{opacity:.72},{opacity:1}],{duration:campusMotion.selection,easing:campusMotion.ease})
    const rise=heading?.animate([{opacity:.75,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:campusMotion.cardEnter,easing:campusMotion.ease})
    return ()=>{fade.cancel();rise?.cancel()}
  },[path,enabled,reducedMotion])

  return mainRef
}
