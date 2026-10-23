import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

let sportsEntryPosition: number | null = null
let sportsEntrySource = '/v2'
export function rememberSportsEntryPosition(source = '/v2') { sportsEntryPosition = window.scrollY; sportsEntrySource = source }

export function useSportsHomeScroll() {
  const { pathname, search } = useLocation()
  const previousPath = useRef(pathname)
  const homePosition = useRef(0)
  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])
  useLayoutEffect(() => {
    const returning = previousPath.current === '/v2/sports' && (pathname === '/v2' || pathname === '/v2/campus' && sportsEntrySource === '/v2/campus' && sportsEntryPosition !== null)
    const target = returning ? sportsEntryPosition ?? homePosition.current : 0
    if (returning) sportsEntryPosition = null
    else if (pathname !== '/v2/sports') sportsEntryPosition = null
    window.scrollTo({ top: target, behavior: 'instant' })
    previousPath.current = pathname
    if (pathname !== '/v2' && pathname !== '/v2/campus') return
    const remember = () => { homePosition.current = window.scrollY }
    if (pathname === '/v2') {
      remember()
      window.addEventListener('scroll', remember, { passive: true })
    }
    // On return, the loading card can temporarily shorten the document. Restore
    // once data/images give it enough height, without fighting a user's scroll.
    const observer = new ResizeObserver(() => {
      window.scrollTo({ top: target, behavior: 'instant' })
      if (Math.abs(window.scrollY - target) < 1) stopRestoring()
    })
    const stopRestoring = () => {
      observer.disconnect()
      window.removeEventListener('wheel', stopRestoring)
      window.removeEventListener('touchstart', stopRestoring)
      window.removeEventListener('keydown', stopRestoring)
    }
    if (returning && Math.abs(window.scrollY - target) >= 1) {
      observer.observe(document.querySelector('.v2-main') ?? document.body)
      window.addEventListener('wheel', stopRestoring, { passive: true })
      window.addEventListener('touchstart', stopRestoring, { passive: true })
      window.addEventListener('keydown', stopRestoring)
    }
    const timer = window.setTimeout(stopRestoring, 25000)
    return () => { clearTimeout(timer); stopRestoring(); window.removeEventListener('scroll', remember) }
  }, [pathname, search])
}
