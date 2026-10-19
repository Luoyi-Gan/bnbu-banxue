import { useEffect, useRef, useState } from 'react'
import './nativeSportsCheckin.css'
/** Reuses the bundled Sports screen while isolating its CSS and mock state. */
export function NativeSportsCheckin({mode='exercise',onViewChange,onPhaseChange}:{mode?:'exercise'|'records';onViewChange?:(mode:'exercise'|'records')=>void;onPhaseChange?:(phase:string)=>void}) {
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
  const selectView=()=>frame.current?.contentWindow?.postMessage({type:'huitongli-checkin-select-view',tab:mode},window.location.origin)
  useEffect(()=>{frame.current?.contentWindow?.postMessage({type:'huitongli-checkin-select-view',tab:mode},window.location.origin)},[mode])
  return <section className="native-sports-checkin" aria-label="运动打卡模拟"><iframe ref={frame} style={{ height }} title="会同里运动打卡模拟" src="/student/huitongli-checkin.html?compact=1" onLoad={selectView} sandbox="allow-scripts allow-same-origin" allow="camera; microphone" /></section>
}
