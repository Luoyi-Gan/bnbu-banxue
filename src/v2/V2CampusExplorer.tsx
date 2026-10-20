import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { ArrowLeft, ArrowRight, CalendarDays, LocateFixed, MapPin, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { liveActivities } from './liveActivities'
import { campusActivitySchedule } from './campusActivitySchedule'
import type { ActivityItem } from './activityFilters'
import { fallbackCampusBuildings, resolveCampusLocation, type CampusBuilding } from './campusLocations'
import type { createCampusScene, CampusLocationStatus } from './campusScene'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { LocalPreviewNotice } from './preview/LocalPreviewNotice'
import './campus-explorer.css'

type Scene = ReturnType<typeof createCampusScene>

function BuildingActivities({ items, buildingId }: { items: ActivityItem[]; buildingId: string }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const refresh = () => setNow(Date.now())
    const timer = window.setInterval(refresh, 30000)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh) }
  }, [])
  const { ongoing, upcoming } = campusActivitySchedule(items, buildingId, now)
  const time = (value: string) => new Date(value).toLocaleString(uiLocale(), { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  return <div className="v2-building-activities">
    <p className="v2-building-schedule-note">{uiText('按已发布的活动时间展示')}</p>
    {([{ title: '正在进行', items: ongoing, status: 'ongoing', empty: '这里暂时没有正在进行的活动。' }, { title: '即将开始', items: upcoming, status: 'upcoming', empty: '这里暂时没有即将开始的活动。' }] as const).map(group => <section key={group.status} aria-label={uiText(group.title)}>
      <div className="v2-explorer-section-title"><strong>{uiText(group.title)}</strong><small>{group.items.length} {uiText('项')}</small></div>
      {group.items.length ? <div className="v2-explorer-events">{group.items.map(item => <Link key={item.id} to={'/v2/activities/' + encodeURIComponent(item.id)}>
        <span className={`v2-building-activity-status is-${group.status}`}>{uiText(group.title)}</span><strong>{item.title}</strong>
        <small><CalendarDays size={13}/><span>{time(item.startAt)} — {item.endAt ? time(item.endAt) : uiText('结束时间待确认')}</span></small>
        <small><MapPin size={13}/><span>{item.location}</span></small>
        {item.host && <small>{uiText('主办方')}：{item.host}</small>}<ArrowRight size={16}/>
      </Link>)}</div> : <p className="v2-explorer-empty">{uiText(group.empty)}</p>}
    </section>)}
  </div>
}

function InteractiveCampus({ mode, onPick, onClose }: { mode: 'explore' | 'pick'; onPick?: (building: CampusBuilding) => void; onClose?: () => void }) { useUiLanguage();
  const live = useWorkspaceBackend()
  const canvas = useRef<HTMLDivElement>(null)
  const scene = useRef<Scene | null>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [buildings, setBuildings] = useState<CampusBuilding[]>([])
  const [selected, setSelected] = useState<CampusBuilding | null>(null)
  const [position, setPosition] = useState<CampusLocationStatus>({ state: 'idle' })
  const locationMessages = {
    idle: '位置仅用于当前地图，离开后清除。', locating: '正在获取位置，请允许浏览器定位…', refining: '正在提高定位精度，可随时取消。', located: '',
    denied: '未获定位权限，请在浏览器的网站权限中允许位置访问后重试。',
    unavailable: '暂时无法获取位置，请检查设备定位服务后重试。', timeout: '浏览器未返回位置，请检查系统定位权限，或在系统浏览器中重试。',
    outside: '当前位置在校园地图范围外，继续显示校园视角。', unsupported: '当前浏览器不支持定位。', insecure: '定位需要 HTTPS 或本机 localhost 安全环境。',
    imprecise: '已获取位置但误差超过 1 公里，请到信号较好的位置重试。',
  }
  const selectedId = selected?.id
  const scheduled = [
    ...(live.data?.entities ?? []).filter(room => room.kind === 'room' && room.data.status === 'open' && room.data.visibility === 'visible' && resolveCampusLocation(String(room.data.place)) === selectedId).map(room => ({id: room.id, title: String(room.data.title), when: String(room.data.time), place: String(room.data.place), kind: '正在组队', path: '/v2/partners?item=' + encodeURIComponent(room.id)})),
  ]

  useEffect(() => {
    let cancelled = false
    import('./campusScene').then(({ createCampusScene }) => {
      if (cancelled || !canvas.current) return
      try {
        scene.current = createCampusScene(canvas.current, null, (items) => { setBuildings(items); setStatus('ready') }, setSelected, () => { setBuildings(fallbackCampusBuildings); setStatus('error') }, { immersive: mode === 'explore', onLocation: setPosition })
      } catch { setBuildings(fallbackCampusBuildings); setStatus('error') }
    }).catch(() => { if (!cancelled) { setBuildings(fallbackCampusBuildings); setStatus('error') } })
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null }
  }, [attempt, mode])

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

  return <div className={`v2-campus-explorer ${mode === 'pick' ? 'is-picker' : 'is-immersive'}`}>
      <div className="v2-explorer-map">
      <div className="v2-explorer-canvas" ref={canvas}/>
      {mode === 'explore' && <div className="v2-map-location-control">
        <button type="button" disabled={status !== 'ready'} aria-pressed={position.state === 'located'} onClick={() => scene.current?.locate()}><LocateFixed size={18}/>{uiText(position.state === 'located' ? '清除位置' : ['locating', 'refining'].includes(position.state) ? '取消定位' : '定位我的位置')}</button>
        <p role="status">{position.state === 'located' ? uiTemplate([(position.accuracy ?? 0) > 300 ? '已标记大致位置 · 误差约 ' : '已标记我的位置 · 精度约 ', ' 米'], position.accuracy) : uiText(locationMessages[position.state])}</p>
      </div>}
      {status !== 'ready' && <div className="v2-explorer-status" role="status">{status === 'loading'?<><span className="campus-map-spinner"/>{uiText("正在加载 3D 校园模型…")}</>:<><strong>{uiText("地图暂时无法显示")}</strong><p>{uiText("可重试，或使用右侧楼栋列表选择地点。")}</p><button type="button" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1) }}>{uiText("重新加载")}</button></>}</div>}
      {mode === 'pick' && <><div className="v2-explorer-map-top"><span><MapPin size={16}/> BNBU 3D CAMPUS</span><button type="button" onClick={() => { scene.current?.overview(); setSelected(null) }} disabled={status !== 'ready'}><RotateCcw size={16}/> {uiText("全校视角")}</button></div><span className="v2-explorer-hint">{uiText("拖动旋转 · 滚轮缩放 · 点击楼栋")}</span></>}
    </div>
    {(mode === 'pick' || selected || status === 'error') && <aside className={`v2-explorer-panel${selected ? ' has-selection' : ''}`}>
      {mode === 'explore' && selected && <button type="button" className="v2-explorer-close" aria-label={uiText('关闭地点详情')} onClick={() => setSelected(null)}><X size={20}/></button>}
      <div className="v2-explorer-panel-head"><div><span className="v2-eyebrow">{mode === 'pick'?'SELECT A BUILDING':'EXPLORE BNBU'}</span><h2>{mode === 'pick'?uiText('选择校内地点'):uiText('校园探索')}</h2><p>{mode === 'pick'?uiText('点击地图上的楼栋，确认后带入地点。'):uiText('点击楼栋，查看这里计划中的活动与组队。')}</p></div>{mode === 'pick' && <button ref={closeButton} type="button" className="v2-explorer-close" aria-label={uiText("关闭地图")} onClick={onClose}><X size={20}/></button>}</div>
      <label className="v2-explorer-select">{uiText("楼栋列表")}<select value={selected?.id ?? ''} onChange={(event) => { if (status === 'ready') scene.current?.focus(event.target.value); else setSelected(buildings.find((item) => item.id === event.target.value) ?? null) }} disabled={status === 'loading'}><option value="">{uiText("选择楼栋")}</option>{buildings.filter((item) => !item.name.startsWith('未命名')).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {selected?<div className="v2-explorer-selection" key={selected.id}><div className="v2-explorer-building"><span><LocateFixed size={21}/></span><div><small>{uiText("当前楼栋")}</small><strong>{selected.name}</strong></div></div>{mode === 'pick' ? <p>{uiText("楼栋级定位。具体入口与集合点可在详细说明中补充。")}</p> : <>{live.error ? <p role="alert" className="v2-explorer-empty">{uiText(live.error)}</p> : !live.data ? <p role="status">{uiText("正在读取活动与组队…")}</p> : <><BuildingActivities items={liveActivities(live.data)} buildingId={selected.id}/>{scheduled.length > 0 && <><div className="v2-explorer-section-title"><strong>{uiText("正在组队")}</strong><small>{scheduled.length} {uiText("项")}</small></div><div className="v2-explorer-events">{scheduled.map((item) => <Link key={`${item.kind}-${item.id}`} to={item.path}><span>{item.kind}</span><strong>{item.title}</strong><small><CalendarDays size={13}/>{item.when} · {item.place}</small><ArrowRight size={16}/></Link>)}</div></>}</>}</>}</div>:<div className="v2-explorer-intro"><MapPin size={27}/><strong>{uiText("从一栋楼开始探索")}</strong><p>{uiText("在地图上点选楼栋，或从列表中选择。")}</p></div>}
      {mode === 'pick' && <div className="v2-explorer-actions"><button type="button" className="v2-button v2-button-secondary" onClick={onClose}>{uiText("取消")}</button><button type="button" className="v2-button v2-button-primary" disabled={!selected} onClick={() => selected && onPick?.(selected)}>{uiText("确认这栋楼")}<ArrowRight size={15}/></button></div>}
      <small className="v2-explorer-source">{uiText("BNBU 3D Model · S1.214 · 建筑体量含估算，位置以现场为准")}</small>
      {mode === 'explore' && Boolean(import.meta.hot) && <LocalPreviewNotice/>}
    </aside>}
  </div>
}

export function V2CampusExplore() { useUiLanguage();
  useEffect(() => {
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = before }
  }, [])
  return <div className="v2-explore-immersive"><InteractiveCampus mode="explore"/><Link className="v2-explore-back" to="/v2/campus"><ArrowLeft size={20}/><span>{uiText('返回')}</span></Link></div>
}

export function CampusBuildingPicker({ onPick, onClose }: { onPick: (building: CampusBuilding) => void; onClose: () => void }) { useUiLanguage();
  return createPortal(<div className="v2-map-picker-layer" role="presentation"><button type="button" className="v2-map-picker-scrim" aria-label={uiText("关闭地图")} onClick={onClose}/><div role="dialog" aria-modal="true" aria-label={uiText("选择校内楼栋")} className="v2-map-picker-dialog"><InteractiveCampus mode="pick" onPick={onPick} onClose={onClose}/></div></div>, document.body)
}

