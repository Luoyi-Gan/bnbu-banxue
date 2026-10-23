import type { CampusBuilding } from './campusLocations'
import {deviceAppearance,subscribeDevicePreferences} from './devicePreferences'
import {uiText} from './uiLanguage'
import type {Point} from './campusRouting'

export type CampusLocationState = 'idle' | 'locating' | 'refining' | 'located' | 'denied' | 'unavailable' | 'timeout' | 'outside' | 'unsupported' | 'insecure' | 'imprecise'
export type CampusLocationStatus = { state: CampusLocationState; accuracy?: number }
export function createCampusScene(host: HTMLDivElement, activityId: string | null, onReady: (buildings: CampusBuilding[]) => void, onSelect: (building: CampusBuilding) => void, onError: () => void, options: { immersive?: boolean; picker?: boolean; onLocation?: (value: CampusLocationStatus) => void } = {}) {
  const frame = document.createElement('iframe')
  frame.title = uiText('BNBU 三维校园地图')
  frame.src = '/campus-map/viewer/index.html'+(options.immersive?'?surface=explore':'')
  frame.style.cssText = 'display:block;width:100%;height:100%;border:0'
  frame.setAttribute('allow', "fullscreen; geolocation 'self'")
  let disposed = false
  let ready = false
  let dialogObserver: MutationObserver | null = null
  let buildings: CampusBuilding[] = []
  const command = (action: string, id?: string) => frame.contentWindow?.postMessage({ type: 'huitongli-map-command', action, id }, window.location.origin)
  const appearance=()=>frame.contentWindow?.postMessage({type:'huitongli-map-appearance',...deviceAppearance()},window.location.origin)
  const loaded = () => {
    appearance()
    if (frame.contentDocument && (options.immersive || document.querySelector('.v2-app-student'))) {
      frame.contentDocument.documentElement.dataset.companionGlass='student'
      const glass=frame.contentDocument.createElement('link')
      glass.rel='stylesheet';glass.href='/campus-map/viewer/student-glass.css'
      frame.contentDocument.head.appendChild(glass)
    }
    if (options.picker && frame.contentDocument) {
      const style = frame.contentDocument.createElement('style')
      style.textContent = '.panel.detail{display:none!important}'
      frame.contentDocument.head.appendChild(style)
    }
    if (options.immersive && frame.contentDocument) {
      dialogObserver?.disconnect()
      const syncDialog = () => host.toggleAttribute('data-map-dialog-open', !!frame.contentDocument?.querySelector('dialog[open]'))
      dialogObserver = new MutationObserver(syncDialog)
      dialogObserver.observe(frame.contentDocument.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
      syncDialog()
      const style = frame.contentDocument.createElement('style')
      style.textContent = '.panel.detail,#locate-user{display:none!important}'
      frame.contentDocument.head.appendChild(style)
    }
  }
  frame.addEventListener('load',loaded)
  const unsubscribe=subscribeDevicePreferences(appearance)
  const timeout = window.setTimeout(() => { if (!disposed && !ready) onError() }, 60000)
  const message = (event: MessageEvent) => {
    if (disposed || event.origin !== window.location.origin || event.source !== frame.contentWindow) return
    const value = event.data
    if (!value || typeof value !== 'object') return
    if (value.type === 'huitongli-map-location') {
      const states: CampusLocationState[] = ['idle', 'locating', 'refining', 'located', 'denied', 'unavailable', 'timeout', 'outside', 'unsupported', 'insecure', 'imprecise']
      if (!states.includes(value.state)) return
      if (value.state === 'located' && (!Number.isFinite(value.accuracy) || value.accuracy < 0)) return
      options.onLocation?.({ state: value.state, ...(value.state === 'located' ? { accuracy: value.accuracy } : {}) })
    } else if (value.type === 'huitongli-map-ready' && Array.isArray(value.buildings)) {
      buildings = value.buildings.filter((item: CampusBuilding) => item && typeof item.id === 'string' && typeof item.name === 'string')
      ready = true
      clearTimeout(timeout)
      onReady(buildings)
      if (activityId) command('focus', activityId)
    } else if (value.type === 'huitongli-map-selected') {
      const building = buildings.find(item => item.id === value.id)
      if (building) onSelect(building)
    } else if (value.type === 'huitongli-map-error') { clearTimeout(timeout); onError() }
  }
  window.addEventListener('message', message)
  host.appendChild(frame)
  return {
    layout: () => {if(ready&&!disposed)command('layout')},
    dismissDetails: () => command('dismiss'),
    route: (points:Point[]|null) => {if(ready&&!disposed)frame.contentWindow?.postMessage({type:'huitongli-map-command',action:'route',points},window.location.origin)},
    locate: () => { if (ready) frame.contentDocument?.getElementById('locate-user')?.click() },
    focus: (id: string) => command('focus', id),
    tool: (id: 'open-map-settings' | 'open-campus-tools' | 'open-render-studio' | 'top' | 'quick-reset') => {if(ready)frame.contentDocument?.getElementById(id)?.click()},
    dragMode: (mode: 'pan'|'rotate') => {if(ready)frame.contentDocument?.querySelector<HTMLButtonElement>(`[data-drag-mode="${mode}"]`)?.click()},
    overview: () => command('overview'),
    dispose: () => { disposed = true; clearTimeout(timeout); unsubscribe(); if(dialogObserver){dialogObserver.disconnect();host.removeAttribute('data-map-dialog-open')} frame.removeEventListener('load',loaded);window.removeEventListener('message', message); frame.remove() },
  }
}
