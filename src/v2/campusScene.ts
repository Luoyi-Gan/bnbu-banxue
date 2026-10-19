import type { CampusBuilding } from './campusLocations'
import {deviceAppearance,subscribeDevicePreferences} from './devicePreferences'
import {uiText} from './uiLanguage'

export function createCampusScene(host: HTMLDivElement, activityId: string | null, onReady: (buildings: CampusBuilding[]) => void, onSelect: (building: CampusBuilding) => void, onError: () => void) {
  const frame = document.createElement('iframe')
  frame.title = uiText('BNBU 三维校园地图')
  frame.src = '/campus-map/viewer/index.html'
  frame.style.cssText = 'display:block;width:100%;height:100%;border:0'
  frame.setAttribute('allow', 'fullscreen')
  let disposed = false
  let ready = false
  let buildings: CampusBuilding[] = []
  const command = (action: string, id?: string) => frame.contentWindow?.postMessage({ type: 'huitongli-map-command', action, id }, window.location.origin)
  const appearance=()=>frame.contentWindow?.postMessage({type:'huitongli-map-appearance',...deviceAppearance()},window.location.origin)
  frame.addEventListener('load',appearance)
  const unsubscribe=subscribeDevicePreferences(appearance)
  const timeout = window.setTimeout(() => { if (!disposed && !ready) onError() }, 60000)
  const message = (event: MessageEvent) => {
    if (disposed || event.origin !== window.location.origin || event.source !== frame.contentWindow) return
    const value = event.data
    if (!value || typeof value !== 'object') return
    if (value.type === 'huitongli-map-ready' && Array.isArray(value.buildings)) {
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
    focus: (id: string) => command('focus', id),
    overview: () => command('overview'),
    dispose: () => { disposed = true; clearTimeout(timeout); unsubscribe(); frame.removeEventListener('load',appearance);window.removeEventListener('message', message); frame.remove() },
  }
}
