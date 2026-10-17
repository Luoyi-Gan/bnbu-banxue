import { useEffect, useRef, useState } from 'react'
import './nativeSportsCheckin.css'
/** Reuses the bundled Sports screen while isolating its CSS and mock state. */
export function NativeSportsCheckin() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(720)
  useEffect(() => {
    const resize = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'huitongli-checkin-height' && Number.isFinite(event.data.height)) setHeight(Math.max(480, Math.min(4000, event.data.height)))
    }
    window.addEventListener('message', resize)
    return () => window.removeEventListener('message', resize)
  }, [])
  return <section className="native-sports-checkin" aria-label="运动打卡模拟"><iframe ref={frame} style={{ height }} title="会同里运动打卡模拟" src="/student/huitongli-checkin.html" sandbox="allow-scripts allow-same-origin" allow="camera; microphone" /></section>
}
