import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSportsAccount } from '../live/useSportsAccount'

export function V2Sports() {
  const live = useSportsAccount()
  if (!live.data) return <p role="status">{live.error || '正在读取体育账号…'}</p>
  if (live.data.sports?.role !== 'student') return <Navigate to="/v2" replace/>
  return <section className="v2-sports-embedded" aria-label="体育运动平台">
    <div className="v2-sports-toolbar"><Link to="/v2" className="v2-sports-back"><ArrowLeft size={16}/>返回伴学</Link></div>
    <iframe
      className="v2-sports-frame"
      title="BNBU Sports 体育运动平台"
      src="/student/index.html"
      allow="camera 'self'; microphone 'self'; fullscreen 'self'"
    />
  </section>
}
