import { ArrowDown, ArrowUp, GripVertical, Plus, RotateCcw, EyeOff } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { defaultSidebarItems, sidebarCampusIds, type SidebarItemId } from '../../shared/v2/sidebarLayout'
import { studentSidebarById } from './studentSidebarCatalog'
import { Modal } from './ui'
import './sidebarCustomizer.css'

function reorder(items: SidebarItemId[], source: SidebarItemId, target: SidebarItemId) {
  const from = items.indexOf(source), to = items.indexOf(target)
  if (from < 0 || to < 0 || from === to) return items
  const next = [...items]
  next.splice(from, 1)
  next.splice(to, 0, source)
  return next
}

type Press = { id: SidebarItemId; pointerId: number; pointerType: string; startX: number; startY: number; x: number; y: number; row: HTMLElement; timer: number }

export function SidebarCustomizer({ initial, busy, error, onSave, onClose }: {
  initial: SidebarItemId[]
  busy: boolean
  error: string
  onSave: (items: SidebarItemId[]) => Promise<boolean>
  onClose: () => void
}) {
  const [items, setItems] = useState(initial)
  const [dragging, setDragging] = useState<SidebarItemId | null>(null)
  const itemsRef = useRef(initial)
  const listRef = useRef<HTMLDivElement>(null)
  const press = useRef<Press | null>(null)
  const dragItem = useRef<SidebarItemId | null>(null)
  const ghost = useRef<HTMLElement | null>(null)
  const previousPositions = useRef<Map<string, number> | null>(null)
  const rowAnimations = useRef(new Map<string, Animation>())
  const scrollFrame = useRef<number | null>(null)
  const hidden = sidebarCampusIds.filter(id => !items.includes(id))
  const changed = items.length !== initial.length || items.some((id, index) => id !== initial[index])

  useEffect(() => () => {
    if (press.current) window.clearTimeout(press.current.timer)
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
    ghost.current?.remove()
    rowAnimations.current.forEach(animation => animation.cancel())
  }, [])

  useLayoutEffect(() => {
    const before = previousPositions.current
    previousPositions.current = null
    if (!before || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    listRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-sort-id]').forEach(row => {
      const id = row.dataset.sidebarSortId!
      const oldTop = before.get(id)
      if (oldTop === undefined || id === dragItem.current) return
      rowAnimations.current.get(id)?.cancel()
      rowAnimations.current.delete(id)
      const distance = oldTop - row.getBoundingClientRect().top
      if (Math.abs(distance) < 1) return
      const animation = row.animate([{ transform: `translateY(${distance}px)` }, { transform: 'translateY(0)' }], { duration: 230, easing: 'cubic-bezier(.2,.7,.2,1)' })
      rowAnimations.current.set(id, animation)
      animation.onfinish = () => { if (rowAnimations.current.get(id) === animation) rowAnimations.current.delete(id) }
    })
  }, [items])

  const updateItems = (next: SidebarItemId[]) => {
    if (next.length === itemsRef.current.length && next.every((id, index) => id === itemsRef.current[index])) return
    previousPositions.current = new Map(Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-sort-id]') ?? [], row => [row.dataset.sidebarSortId!, row.getBoundingClientRect().top]))
    itemsRef.current = next
    setItems(next)
  }

  const reorderUnderPointer = (x: number, y: number) => {
    const source = dragItem.current
    if (!source) return
    const row = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-sidebar-sort-id]')
    const target = row?.dataset.sidebarSortId as SidebarItemId | undefined
    if (target && target !== source) updateItems(reorder(itemsRef.current, source, target))
  }

  const autoScroll = () => {
    const modal = listRef.current?.closest<HTMLElement>('.v2-modal')
    const current = press.current
    if (!modal || !current || !dragItem.current) { scrollFrame.current = null; return }
    const bounds = modal.getBoundingClientRect()
    const upper = bounds.top + 58, lower = bounds.bottom - 58
    const speed = current.y < upper ? -Math.min(15, (upper - current.y) / 3) : current.y > lower ? Math.min(15, (current.y - lower) / 3) : 0
    if (speed) {
      const before = modal.scrollTop
      modal.scrollTop += speed
      if (modal.scrollTop !== before) {
        reorderUnderPointer(current.x, current.y)
        scrollFrame.current = window.requestAnimationFrame(autoScroll)
        return
      }
    }
    scrollFrame.current = null
  }

  const activateDrag = (pending: Press) => {
    if (press.current !== pending || dragItem.current) return
    const bounds = pending.row.getBoundingClientRect()
    const preview = pending.row.cloneNode(true) as HTMLElement
    preview.removeAttribute('data-sidebar-sort-id')
    preview.classList.add('v2-sidebar-sort-ghost')
    preview.setAttribute('aria-hidden', 'true')
    preview.inert = true
    preview.style.left = `${bounds.left}px`
    preview.style.top = `${bounds.top}px`
    preview.style.width = `${bounds.width}px`
    preview.style.height = `${bounds.height}px`
    preview.style.transform = `translate3d(${pending.x - pending.startX}px,${pending.y - pending.startY}px,0) scale(1.035)`
    pending.row.closest('.v2-modal-layer')?.appendChild(preview)
    ghost.current = preview
    dragItem.current = pending.id
    setDragging(pending.id)
    reorderUnderPointer(pending.x, pending.y)
    if (scrollFrame.current === null) scrollFrame.current = window.requestAnimationFrame(autoScroll)
  }

  const startDrag = (event: PointerEvent<HTMLButtonElement>, id: SidebarItemId) => {
    if (!event.isPrimary || event.button !== 0 || press.current) return
    const row = event.currentTarget.closest<HTMLElement>('[data-sidebar-sort-id]')
    if (!row) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const pending: Press = { id, pointerId: event.pointerId, pointerType: event.pointerType, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, row, timer: 0 }
    pending.timer = window.setTimeout(() => activateDrag(pending), 180)
    press.current = pending
  }
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = press.current
    if (!current || current.pointerId !== event.pointerId) return
    current.x = event.clientX
    current.y = event.clientY
    if (!dragItem.current) {
      const distance = Math.hypot(current.x - current.startX, current.y - current.startY)
      if (current.pointerType === 'touch' && distance > 10) window.clearTimeout(current.timer)
      if (current.pointerType === 'mouse' && distance > 6) { window.clearTimeout(current.timer); activateDrag(current) }
      if (!dragItem.current) return
    }
    if (ghost.current) ghost.current.style.transform = `translate3d(${current.x - current.startX}px,${current.y - current.startY}px,0) scale(1.035)`
    reorderUnderPointer(current.x, current.y)
    if (scrollFrame.current === null) scrollFrame.current = window.requestAnimationFrame(autoScroll)
  }
  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (press.current?.pointerId !== event.pointerId) return
    window.clearTimeout(press.current.timer)
    press.current = null
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = null
    ghost.current?.remove()
    ghost.current = null
    dragItem.current = null
    setDragging(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const moveBy = (id: SidebarItemId, offset: number) => {
    const current = itemsRef.current
    const index = current.indexOf(id), target = current[index + offset]
    if (target) updateItems(reorder(current, id, target))
  }

  return <Modal title="侧栏设置" onClose={onClose}>
    <div className="v2-sidebar-customizer">
      <p>长按把手后拖动排序；校园功能可随时添加或隐藏。五个主入口始终保留。</p>
      <h3>侧栏中显示</h3>
      <div className="v2-sidebar-sort-list" ref={listRef} aria-label="侧栏显示顺序">{items.map((id, index) => {
        const entry = studentSidebarById[id]
        const Icon = entry.icon
        return <div key={id} className={`v2-sidebar-sort-row${dragging === id ? ' is-dragging' : ''}`} data-sidebar-sort-id={id}>
          <button type="button" className="v2-sidebar-drag-handle" aria-label={`长按拖动排序：${entry.label}`} onPointerDown={event => startDrag(event, id)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onContextMenu={event => event.preventDefault()}><GripVertical size={18}/></button>
          <Icon size={17} aria-hidden="true"/><span>{entry.label}</span>
          <button type="button" className="v2-sidebar-order-button" aria-label={`上移${entry.label}`} disabled={index === 0} onClick={() => moveBy(id, -1)}><ArrowUp size={15}/></button>
          <button type="button" className="v2-sidebar-order-button" aria-label={`下移${entry.label}`} disabled={index === items.length - 1} onClick={() => moveBy(id, 1)}><ArrowDown size={15}/></button>
          {entry.kind === 'campus' && <button type="button" className="v2-sidebar-visibility-button" aria-label={`隐藏${entry.label}`} onClick={() => updateItems(itemsRef.current.filter(item => item !== id))}><EyeOff size={16}/></button>}
        </div>
      })}</div>
      {hidden.length > 0 && <><h3>可添加的校园功能</h3><div className="v2-sidebar-add-list">{hidden.map(id => {
        const entry = studentSidebarById[id]
        const Icon = entry.icon
        return <button type="button" key={id} onClick={() => updateItems([...itemsRef.current, id])}><Icon size={16}/><span>{entry.label}</span><Plus size={15}/></button>
      })}</div></>}
      {error && <p role="alert" className="v2-sidebar-save-error">{error}</p>}
      <div className="v2-form-actions v2-sidebar-customizer-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => updateItems([...defaultSidebarItems])}><RotateCcw size={15}/> 恢复默认</button><button type="button" className="v2-button v2-button-secondary" onClick={onClose}>取消</button><button type="button" className="v2-button v2-button-primary" disabled={!changed || busy} onClick={() => void onSave(items).then(saved => { if (saved) onClose() })}>{busy ? '保存中…' : '保存侧栏'}</button></div>
    </div>
  </Modal>
}
