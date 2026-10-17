import { ArrowDown, ArrowUp, GripVertical, Plus, RotateCcw, EyeOff } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
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

export function SidebarCustomizer({ initial, busy, error, onSave, onClose }: {
  initial: SidebarItemId[]
  busy: boolean
  error: string
  onSave: (items: SidebarItemId[]) => Promise<boolean>
  onClose: () => void
}) {
  const [items, setItems] = useState(initial)
  const [dragging, setDragging] = useState<SidebarItemId | null>(null)
  const dragItem = useRef<SidebarItemId | null>(null)
  const dragPointer = useRef<number | null>(null)
  const hidden = sidebarCampusIds.filter(id => !items.includes(id))
  const changed = items.length !== initial.length || items.some((id, index) => id !== initial[index])

  const startDrag = (event: PointerEvent<HTMLButtonElement>, id: SidebarItemId) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragItem.current = id
    dragPointer.current = event.pointerId
    setDragging(id)
  }
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragPointer.current !== event.pointerId || !dragItem.current) return
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-sidebar-sort-id]')
    const target = row?.dataset.sidebarSortId as SidebarItemId | undefined
    if (target) setItems(current => reorder(current, dragItem.current!, target))
  }
  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragPointer.current !== event.pointerId) return
    dragItem.current = null
    dragPointer.current = null
    setDragging(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const moveBy = (id: SidebarItemId, offset: number) => setItems(current => {
    const index = current.indexOf(id), target = current[index + offset]
    return target ? reorder(current, id, target) : current
  })

  return <Modal title="侧栏设置" onClose={onClose}>
    <div className="v2-sidebar-customizer">
      <p>拖动把手调整侧栏顺序；校园功能可随时添加或隐藏。五个主入口始终保留。</p>
      <h3>侧栏中显示</h3>
      <div className="v2-sidebar-sort-list" aria-label="侧栏显示顺序">{items.map((id, index) => {
        const entry = studentSidebarById[id]
        const Icon = entry.icon
        return <div key={id} className={`v2-sidebar-sort-row${dragging === id ? ' is-dragging' : ''}`} data-sidebar-sort-id={id}>
          <button type="button" className="v2-sidebar-drag-handle" aria-label={`拖动排序：${entry.label}`} onPointerDown={event => startDrag(event, id)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><GripVertical size={18}/></button>
          <Icon size={17} aria-hidden="true"/><span>{entry.label}</span>
          <button type="button" className="v2-sidebar-order-button" aria-label={`上移${entry.label}`} disabled={index === 0} onClick={() => moveBy(id, -1)}><ArrowUp size={15}/></button>
          <button type="button" className="v2-sidebar-order-button" aria-label={`下移${entry.label}`} disabled={index === items.length - 1} onClick={() => moveBy(id, 1)}><ArrowDown size={15}/></button>
          {entry.kind === 'campus' && <button type="button" className="v2-sidebar-visibility-button" aria-label={`隐藏${entry.label}`} onClick={() => setItems(current => current.filter(item => item !== id))}><EyeOff size={16}/></button>}
        </div>
      })}</div>
      {hidden.length > 0 && <><h3>可添加的校园功能</h3><div className="v2-sidebar-add-list">{hidden.map(id => {
        const entry = studentSidebarById[id]
        const Icon = entry.icon
        return <button type="button" key={id} onClick={() => setItems(current => [...current, id])}><Icon size={16}/><span>{entry.label}</span><Plus size={15}/></button>
      })}</div></>}
      {error && <p role="alert" className="v2-sidebar-save-error">{error}</p>}
      <div className="v2-form-actions v2-sidebar-customizer-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setItems([...defaultSidebarItems])}><RotateCcw size={15}/> 恢复默认</button><button type="button" className="v2-button v2-button-secondary" onClick={onClose}>取消</button><button type="button" className="v2-button v2-button-primary" disabled={!changed || busy} onClick={() => void onSave(items).then(saved => { if (saved) onClose() })}>{busy ? '保存中…' : '保存侧栏'}</button></div>
    </div>
  </Modal>
}
