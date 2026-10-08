import { Expand, LocateFixed, MapPin, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveCampusLocation, type CampusBuilding } from './campusLocations'
import type { createCampusScene } from './campusScene'
import './campus-map.css'

export function CampusMap({ location }: { location: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const scene = useRef<ReturnType<typeof createCampusScene> | null>(null)
  const cleanupExpansion = useRef<(() => void) | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [buildings, setBuildings] = useState<CampusBuilding[]>([])
  const [selected, setSelected] = useState<CampusBuilding | null>(null)
  const activityId = resolveCampusLocation(location)
  const activityBuilding = buildings.find((building) => building.id === activityId)

  useEffect(() => {
    let cancelled = false
    import('./campusScene').then(({ createCampusScene }) => {
      if (cancelled || !canvas.current) return
      try {
        scene.current = createCampusScene(canvas.current, activityId, (items) => { setBuildings(items); setStatus('ready') }, setSelected, () => setStatus('error'))
      } catch { setStatus('error') }
    }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null }
  }, [activityId, attempt])

  useEffect(() => () => cleanupExpansion.current?.(), [])

  const expand = () => {
    const element = panel.current
    const placeholder = anchor.current
    if (!element || !placeholder || expanded) return
    const rect = placeholder.getBoundingClientRect()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    let closing = false
    let timer = 0
    let animationFrame = 0
    const position = (left: number, top: number, width: number, height: number) => {
      Object.assign(element.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` })
    }
    element.setAttribute('popover', 'manual')
    element.showPopover()
    position(rect.left, rect.top, rect.width, rect.height)
    document.body.style.overflow = 'hidden'
    setExpanded(true)
    const fit = () => {
      const gap = window.innerWidth < 600 ? 8 : 28
      position(gap, gap, window.innerWidth - gap * 2, window.innerHeight - gap * 2)
    }
    const cleanup = () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', keydown, true)
      window.removeEventListener('resize', fit)
      document.body.style.overflow = previousOverflow
      element.hidePopover()
      element.removeAttribute('popover')
      element.removeAttribute('style')
      cleanupExpansion.current = null
    }
    const close = () => {
      if (closing) return
      closing = true
      const target = placeholder.getBoundingClientRect()
      position(target.left, target.top, target.width, target.height)
      timer = window.setTimeout(() => { cleanup(); setExpanded(false); previousFocus?.focus({ preventScroll: true }) }, reduced ? 0 : 460)
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close() }
      if (event.key === 'Tab') {
        const focusable = [...element.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled)')]
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (!element.contains(document.activeElement)) { event.preventDefault(); first?.focus() }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    cleanupExpansion.current = cleanup
    closeExpanded.current = close
    window.addEventListener('keydown', keydown, true)
    window.addEventListener('resize', fit)
    // Commit the starting bounds before transitioning to the viewport.
    element.getBoundingClientRect()
    animationFrame = requestAnimationFrame(() => { fit(); toggle.current?.focus({ preventScroll: true }) })
  }
  const closeExpanded = useRef<() => void>(() => {})

  return <div className="campus-map-anchor" ref={anchor}>
    {expanded && createPortal(<button className="campus-map-backdrop" aria-label="收起三维地图" onClick={() => closeExpanded.current()}/>, document.body)}
    <div className="campus-map-panel" ref={panel} role={expanded ? 'dialog' : 'region'} aria-modal={expanded || undefined} aria-label="互动校园地图">
      <header className="campus-map-header"><div><span>BNBU CAMPUS</span><strong>互动地图导览 <small>3D</small></strong></div><button ref={toggle} type="button" aria-label={expanded ? '收起三维地图' : '展开三维地图'} aria-expanded={expanded} onClick={() => expanded ? closeExpanded.current() : expand()}>{expanded ? <X size={17}/> : <Expand size={17}/>}<span>{expanded ? '收起' : '展开'}</span></button></header>
      <div className="campus-map-viewport">
        <div className="campus-map-canvas" ref={canvas}/>
        {status !== 'ready' && <div className="campus-map-state" role="status">{status === 'loading' ? <><span className="campus-map-spinner"/>正在加载校园模型…</> : <><strong>三维地图暂时无法显示</strong><span>请重试，或使用支持 WebGL 的浏览器。</span><button onClick={() => { setStatus('loading'); setAttempt((value) => value + 1) }}>重新加载</button></>}</div>}
        <div className="campus-map-tools"><button type="button" disabled={status !== 'ready' || !activityBuilding} onClick={() => activityId && scene.current?.focus(activityId)}><LocateFixed size={16}/>活动地点</button><button type="button" disabled={status !== 'ready'} onClick={() => scene.current?.overview()}><RotateCcw size={16}/>全校视角</button></div>
        <div className="campus-map-legend"><span><i className="campus-map-orange"/>活动楼栋</span><span><i className="campus-map-blue"/>当前查看</span></div>
        <span className="campus-map-gesture">拖动旋转 · 双指或滚轮缩放 · 点击楼栋</span>
      </div>
      <footer className="campus-map-footer"><div className="campus-map-location"><MapPin size={18}/><div><strong>{location}</strong><span>{activityBuilding ? `已标记：${activityBuilding.name} · 楼栋级定位` : status === 'loading' && activityId ? '正在定位活动楼栋…' : '地点待确认，暂未标记具体位置'}</span></div></div><label className="campus-map-picker"><span>{selected ? `正在查看：${selected.name}` : '也可选择楼栋查看'}</span><select aria-label="选择校园楼栋" value={selected?.id ?? ''} disabled={status !== 'ready'} onChange={(event) => scene.current?.focus(event.target.value)}><option value="" disabled>选择校园楼栋</option>{buildings.filter((building) => !building.name.startsWith('未命名')).map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></label><small className="campus-map-source">BNBU 3D Model · S1.214 · 建筑体量含估算，具体集合点以活动说明为准</small></footer>
    </div>
  </div>
}
