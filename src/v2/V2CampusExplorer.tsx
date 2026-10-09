import { ArrowRight, CalendarDays, LocateFixed, MapPin, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { events } from '../data/mockData'
import { fallbackCampusBuildings, resolveCampusLocation, type CampusBuilding } from './campusLocations'
import type { createCampusScene } from './campusScene'
import { useV2 } from './useV2'
import { PageHeading } from './ui'
import './campus-explorer.css'

type Scene = ReturnType<typeof createCampusScene>

function InteractiveCampus({ mode, onPick, onClose }: { mode: 'explore' | 'pick'; onPick?: (building: CampusBuilding) => void; onClose?: () => void }) {
  const { state } = useV2()
  const canvas = useRef<HTMLDivElement>(null)
  const scene = useRef<Scene | null>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [buildings, setBuildings] = useState<CampusBuilding[]>([])
  const [selected, setSelected] = useState<CampusBuilding | null>(null)
  const selectedId = selected?.id
  const scheduled = [
    ...events.filter((event) => resolveCampusLocation(event.location) === selectedId && Date.parse(event.endAt) >= Date.now()).map((event) => ({ id: event.id, title: event.title, when: event.dateLabel, place: event.location, kind: '校园活动', path: `/v2/activities/${event.id}` })),
    ...state.localEvents.filter((event) => event.status === 'published' && resolveCampusLocation(event.location) === selectedId && Date.parse(event.startAt) >= Date.now()).map((event) => ({ id: event.id, title: event.title, when: new Date(event.startAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }), place: event.location, kind: '成员发起', path: `/v2/activities/${event.id}` })),
    ...state.rooms.filter((room) => room.status === 'open' && (room.buildingId ?? resolveCampusLocation(room.place)) === selectedId).map((room) => ({ id: room.id, title: room.title, when: room.time, place: room.place, kind: '正在组队', path: `/v2/partners?item=${encodeURIComponent(room.id)}` })),
  ]

  useEffect(() => {
    let cancelled = false
    import('./campusScene').then(({ createCampusScene }) => {
      if (cancelled || !canvas.current) return
      try {
        scene.current = createCampusScene(canvas.current, null, (items) => { setBuildings(items); setStatus('ready') }, setSelected, () => { setBuildings(fallbackCampusBuildings); setStatus('error') })
      } catch { setBuildings(fallbackCampusBuildings); setStatus('error') }
    }).catch(() => { if (!cancelled) { setBuildings(fallbackCampusBuildings); setStatus('error') } })
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null }
  }, [attempt])

  useEffect(() => {
    if (mode !== 'pick') return
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose?.() }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = before; document.removeEventListener('keydown', keydown) }
  }, [mode, onClose])

  return <div className={`v2-campus-explorer ${mode === 'pick' ? 'is-picker' : ''}`}>
      <div className="v2-explorer-map">
      <div className="v2-explorer-canvas" ref={canvas}/>
      {status !== 'ready' && <div className="v2-explorer-status" role="status">{status === 'loading' ? <><span className="campus-map-spinner"/>正在加载 3D 校园模型…</> : <><strong>地图暂时无法显示</strong><p>可重试，或使用右侧楼栋列表选择地点。</p><button type="button" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1) }}>重新加载</button></>}</div>}
      <div className="v2-explorer-map-top"><span><MapPin size={16}/> BNBU 3D CAMPUS</span><button type="button" onClick={() => { scene.current?.overview(); setSelected(null) }} disabled={status !== 'ready'}><RotateCcw size={16}/> 全校视角</button></div>
      <span className="v2-explorer-hint">拖动旋转 · 滚轮缩放 · 点击楼栋</span>
    </div>
    <aside className={`v2-explorer-panel${selected ? ' has-selection' : ''}`}>
      <div className="v2-explorer-panel-head"><div><span className="v2-eyebrow">{mode === 'pick' ? 'SELECT A BUILDING' : 'EXPLORE BNBU'}</span><h2>{mode === 'pick' ? '选择校内地点' : '校园探索'}</h2><p>{mode === 'pick' ? '点击地图上的楼栋，确认后带入地点。' : '点击楼栋，查看这里计划中的活动与组队。'}</p></div>{mode === 'pick' && <button ref={closeButton} type="button" className="v2-explorer-close" aria-label="关闭地图" onClick={onClose}><X size={20}/></button>}</div>
      <label className="v2-explorer-select">楼栋列表<select value={selected?.id ?? ''} onChange={(event) => { if (status === 'ready') scene.current?.focus(event.target.value); else setSelected(buildings.find((item) => item.id === event.target.value) ?? null) }} disabled={status === 'loading'}><option value="">选择楼栋</option>{buildings.filter((item) => !item.name.startsWith('未命名')).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {selected ? <div className="v2-explorer-selection" key={selected.id}><div className="v2-explorer-building"><span><LocateFixed size={21}/></span><div><small>当前楼栋</small><strong>{selected.name}</strong></div></div>{mode === 'pick' ? <p>楼栋级定位。具体入口与集合点可在详细说明中补充。</p> : <><div className="v2-explorer-section-title"><strong>这里的计划</strong><small>{scheduled.length} 项</small></div>{scheduled.length ? <div className="v2-explorer-events">{scheduled.map((item) => <Link key={`${item.kind}-${item.id}`} to={item.path}><span>{item.kind}</span><strong>{item.title}</strong><small><CalendarDays size={13}/>{item.when} · {item.place}</small><ArrowRight size={16}/></Link>)}</div> : <p className="v2-explorer-empty">当前没有计划中的活动或组队。可以看看其他楼栋。</p>}</>}</div> : <div className="v2-explorer-intro"><MapPin size={27}/><strong>从一栋楼开始探索</strong><p>在地图上点选楼栋，或从列表中选择。</p></div>}
      {mode === 'pick' && <div className="v2-explorer-actions"><button type="button" className="v2-button v2-button-secondary" onClick={onClose}>取消</button><button type="button" className="v2-button v2-button-primary" disabled={!selected} onClick={() => selected && onPick?.(selected)}>确认这栋楼 <ArrowRight size={15}/></button></div>}
      <small className="v2-explorer-source">BNBU 3D Model · S1.214 · 建筑体量含估算，位置以现场为准</small>
    </aside>
  </div>
}

export function V2CampusExplore() {
  return <div className="v2-page v2-explore-page"><PageHeading eyebrow="EXPLORE CAMPUS" title="校园探索" description="在 3D 地图里发现楼栋与正在发生的计划。" action={<Link className="v2-button v2-button-secondary" to="/v2/campus">返回校园服务</Link>}/><InteractiveCampus mode="explore"/></div>
}

export function CampusBuildingPicker({ onPick, onClose }: { onPick: (building: CampusBuilding) => void; onClose: () => void }) {
  return createPortal(<div className="v2-map-picker-layer" role="presentation"><button type="button" className="v2-map-picker-scrim" aria-label="关闭地图" onClick={onClose}/><div role="dialog" aria-modal="true" aria-label="选择校内楼栋" className="v2-map-picker-dialog"><InteractiveCampus mode="pick" onPick={onPick} onClose={onClose}/></div></div>, document.body)
}
