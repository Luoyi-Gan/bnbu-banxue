import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './partnerLocation.css'

export type PartnerPlace = { name: string; address: string; coordinates?: [number, number] }
type AmapPosition = { lng: number; lat: number; toJSON?: () => [number, number] } | [number, number]
type AmapMap = { destroy: () => void; on: (event: string, listener: () => void) => void; getCenter: () => AmapPosition; getZoom: () => number; setCenter: (point: [number, number]) => void; setZoom: (zoom: number) => void }
type AmapApi = {
  Map: new (node: HTMLElement, options: { center: [number, number]; zoom: number; dragEnable: boolean; zoomEnable: boolean }) => AmapMap
  AutoComplete: new (options: Record<string, unknown>) => { search: (keyword: string, callback: (status: string, result: {tips?: Array<{name?: string; address?: string; location?: AmapPosition}>}) => void) => void }
  Geolocation: new (options: Record<string, unknown>) => { getCurrentPosition: (callback: (status: string, result: {position?: AmapPosition}) => void) => void }
}

declare global { interface Window { AMap?: AmapApi; _AMapSecurityConfig?: { serviceHost: string } } }

const defaultCenter: [number, number] = [113.57, 22.27]
const amapKey = import.meta.env.VITE_AMAP_KEY?.trim() ?? ''
const securityHost = import.meta.env.VITE_AMAP_SECURITY_HOST?.trim() ?? ''
const amapConfigured = Boolean(amapKey && securityHost)
let loader: Promise<AmapApi> | null = null

function loadAmap(): Promise<AmapApi> {
  if (window.AMap) return Promise.resolve(window.AMap)
  if (!amapConfigured) return Promise.reject(new Error('高德地图尚未配置'))
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    window._AMapSecurityConfig = { serviceHost: securityHost }
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(amapKey)}&plugin=AMap.AutoComplete,AMap.Geolocation`
    script.async = true
    script.onload = () => { if (window.AMap) resolve(window.AMap); else { loader = null; reject(new Error('地图服务加载失败')) } }
    script.onerror = () => { script.remove(); loader = null; reject(new Error('地图服务加载失败')) }
    document.head.appendChild(script)
  })
  return loader
}

function point(position?: AmapPosition | string): [number, number] | undefined {
  if (!position || typeof position === 'string') return undefined
  const values = Array.isArray(position) ? position : position.toJSON?.() ?? [position.lng, position.lat]
  return values.length === 2 && values.every(Number.isFinite) ? values as [number, number] : undefined
}

export function PartnerLocationField({ label, name, value, onChange, onSelect, required = false, map = false, placeholder = '搜索地点或手动填写集合点' }: {label: string; name?: string; value: string; onChange: (value: string) => void; onSelect?: (place: PartnerPlace | null) => void; required?: boolean; map?: boolean; placeholder?: string}) {
  const [tips, setTips] = useState<PartnerPlace[]>([])
  const [status, setStatus] = useState('')
  const [confirmedText, setConfirmedText] = useState('')
  const [mapOpen, setMapOpen] = useState(false)
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [zoom, setZoom] = useState(13)
  const mapNode = useRef<HTMLDivElement>(null)
  const mapObject = useRef<AmapMap | null>(null)
  const searchSerial = useRef(0)

  useEffect(() => {
    const keyword = value.trim()
    if (!amapConfigured || keyword.length < 2 || keyword === confirmedText) { setTips([]); return }
    const serial = ++searchSerial.current
    const serialRef = searchSerial
    const timer = window.setTimeout(() => {
      void loadAmap().then(AMap => {
        new AMap.AutoComplete({ city: '全国' }).search(keyword, (resultStatus, result) => {
          if (serial !== searchSerial.current) return
          setTips(resultStatus === 'complete' ? (result.tips ?? []).filter(tip => tip.name).slice(0, 8).map(tip => ({name: tip.name ?? '', address: tip.address ?? '', coordinates: point(tip.location)})) : [])
        })
      }).catch(() => { if (serial === searchSerial.current) setStatus('地点候选暂不可用，可手动填写。') })
    }, 260)
    return () => { window.clearTimeout(timer); serialRef.current++ }
  }, [value, confirmedText])

  useEffect(() => {
    if (!mapOpen || !mapNode.current) return
    let disposed = false
    void loadAmap().then(AMap => {
      if (disposed || !mapNode.current) return
      const instance = new AMap.Map(mapNode.current, { center, zoom, dragEnable: true, zoomEnable: true })
      mapObject.current = instance
      instance.on('moveend', () => { if (!disposed) setCenter(point(instance.getCenter()) ?? defaultCenter) })
      instance.on('zoomend', () => { if (!disposed) setZoom(instance.getZoom()) })
      setStatus('')
    }).catch(() => { if (!disposed) { setMapOpen(false); setStatus('地图暂不可用，可手动填写地点。') } })
    return () => { disposed = true; mapObject.current?.destroy(); mapObject.current = null }
  // Initialize only when the user opens the map; later center and zoom changes stay in the map instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOpen])

  const choose = (place: PartnerPlace) => {
    setConfirmedText(place.name)
    onChange(place.name)
    onSelect?.(place)
    setTips([])
    searchSerial.current++
    if (place.coordinates) { setCenter(place.coordinates); mapObject.current?.setCenter(place.coordinates) }
  }
  const locate = () => {
    void loadAmap().then(AMap => {
      new AMap.Geolocation({ enableHighAccuracy: true, timeout: 10000 }).getCurrentPosition((resultStatus, result) => {
        const current = resultStatus === 'complete' ? point(result.position) : undefined
        if (!current) { setStatus('定位未成功，可继续搜索或手动填写。'); return }
        setCenter(current); mapObject.current?.setCenter(current); setStatus('已定位当前区域，地点仍需自行确认。')
      })
    }).catch(() => setStatus('定位暂不可用，可继续手动填写。'))
  }
  return <div className="v2-partner-location-field"><label>{label}<input name={name} value={value} onChange={event => { setConfirmedText(''); onChange(event.target.value); onSelect?.(null); setTips([]) }} required={required} maxLength={120} autoComplete="off" placeholder={placeholder}/></label>
    {tips.length > 0 && <div className="v2-partner-place-tips" role="listbox" aria-label={`${label}候选地点`}>{tips.map((tip, index) => <button type="button" role="option" aria-selected="false" key={`${tip.name}-${tip.address}-${index}`} onClick={() => choose(tip)}><MapPin size={14}/><span><strong>{tip.name}</strong><small>{tip.address || '地点详情以高德结果为准'}</small></span></button>)}</div>}
    <div className="v2-partner-location-tools">{map && amapConfigured && <button type="button" onClick={() => setMapOpen(open => !open)}>{mapOpen ? '收起地图' : '查看地图'}</button>}{!amapConfigured && <small>高德地图未配置，可手动填写地点。</small>}</div>
    {mapOpen && <div className="v2-partner-map-shell"><div ref={mapNode} className="v2-partner-map" role="img" aria-label="高德地图，可拖动与缩放"/><div className="v2-partner-map-controls"><button type="button" aria-label="定位当前位置" onClick={locate}><LocateFixed size={16}/></button><button type="button" aria-label="放大地图" onClick={() => mapObject.current?.setZoom(Math.min(20, zoom + 1))}><Plus size={16}/></button><button type="button" aria-label="缩小地图" onClick={() => mapObject.current?.setZoom(Math.max(2, zoom - 1))}><Minus size={16}/></button></div><small>地图中心 {center[0].toFixed(4)}, {center[1].toFixed(4)} · 拖动地图不会修改已填写地点</small></div>}
    {status && <small role="status" className="v2-partner-location-status">{status}</small>}
  </div>
}
