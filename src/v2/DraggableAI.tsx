import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

type Point = { x: number; y: number }
const positionKey = 'bnbu-campus-v2:ai-position'

function keepVisible(point: Point, element: HTMLAnchorElement): Point {
  const bottom = window.innerWidth <= 720 ? 84 : 8
  return {
    x: Math.max(8, Math.min(point.x, window.innerWidth - element.offsetWidth - 8)),
    y: Math.max(8, Math.min(point.y, window.innerHeight - element.offsetHeight - bottom)),
  }
}

export function DraggableAI({ src }: { src: string }) {
  const anchor = useRef<HTMLAnchorElement>(null)
  const drag = useRef<{ id: number; start: Point; origin: Point; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [position, setPosition] = useState<Point | null>(() => {
    try {
      const value = JSON.parse(localStorage.getItem(positionKey) ?? 'null')
      return value && Number.isFinite(value.x) && Number.isFinite(value.y) ? value : null
    } catch { return null }
  })
  const [dragging, setDragging] = useState(false)
  useEffect(() => {
    const resize = () => setPosition(current => current && anchor.current ? keepVisible(current, anchor.current) : current)
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  useEffect(() => {
    if (position) {
      try { localStorage.setItem(positionKey, JSON.stringify(position)) } catch { /* session position remains available */ }
    }
  }, [position])
  const start = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    suppressClick.current = false
    drag.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: { x: rect.left, y: rect.top }, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    const dx = event.clientX - current.start.x
    const dy = event.clientY - current.start.y
    if (!current.moved && Math.hypot(dx, dy) < 6) return
    current.moved = true
    suppressClick.current = true
    setDragging(true)
    setPosition(keepVisible({ x: current.origin.x + dx, y: current.origin.y + dy }, event.currentTarget))
  }
  const finish = (event: PointerEvent<HTMLAnchorElement>) => {
    if (drag.current?.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return <Link ref={anchor} to="/v2/ai" className={`v2-ai-float${dragging ? ' is-dragging' : ''}`}
    aria-label="打开校园 AI" title="点击打开校园 AI，拖动调整位置" draggable={false}
    style={position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}
    onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
    onDragStart={event => event.preventDefault()}
    onClick={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); suppressClick.current = false } }}>
    <img src={src} alt="" draggable={false}/>
  </Link>
}
