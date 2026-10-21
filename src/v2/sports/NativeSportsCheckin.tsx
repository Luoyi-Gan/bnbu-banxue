import {useDevicePreferences} from '../devicePreferences'
import { uiText, useUiLanguage } from '../uiLanguage'
import { useEffect, useRef, useState } from 'react'
import './nativeSportsCheckin.css'
/** Reuses the bundled Sports screen while isolating its CSS and mock state. */
export function NativeSportsCheckin({mode='exercise',onViewChange,onPhaseChange}:{mode?:'exercise'|'records';onViewChange?:(mode:'exercise'|'records')=>void;onPhaseChange?:(phase:string)=>void}) { useUiLanguage();
  const device=useDevicePreferences()
  const appearance=()=>frame.current?.contentWindow?.postMessage({type:'huitongli-device-preferences',language:device.language,theme:device.theme,textSize:device.preferences.textSize,reducedMotion:device.reducedMotion},window.location.origin)
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(420)
  useEffect(() => {
    const resize = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'huitongli-checkin-height' && Number.isFinite(event.data.height)) setHeight(Math.max(240, Math.min(4000, event.data.height)))
      if (event.data?.type === 'huitongli-checkin-view') {
        if(event.data.navigation&&(event.data.tab==='exercise'||event.data.tab==='records'))onViewChange?.(event.data.tab)
        if(typeof event.data.phase==='string')onPhaseChange?.(event.data.phase)
      }
    }
    window.addEventListener('message', resize)
    return () => window.removeEventListener('message', resize)
  }, [onViewChange,onPhaseChange])
  useEffect(()=>{frame.current?.contentWindow?.postMessage({type:'huitongli-device-preferences',language:device.language,theme:device.theme,textSize:device.preferences.textSize,reducedMotion:device.reducedMotion},window.location.origin)},[device.language,device.theme,device.preferences.textSize,device.reducedMotion])
  const selectView=()=>frame.current?.contentWindow?.postMessage({type:'huitongli-checkin-select-view',tab:mode},window.location.origin)
  useEffect(()=>{frame.current?.contentWindow?.postMessage({type:'huitongli-checkin-select-view',tab:mode},window.location.origin)},[mode])
  return <section className="native-sports-checkin" aria-label={uiText("运动打卡模拟")}><iframe ref={frame} style={{ height }} title={uiText("会同里运动打卡模拟")} src="/student/huitongli-checkin.html?compact=1" onLoad={()=>{appearance();selectView()}} sandbox="allow-scripts allow-same-origin" allow="camera; microphone" /></section>
}
