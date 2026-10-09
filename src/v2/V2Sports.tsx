import { sportsStudentHref } from './sportsEntry'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function V2Sports() {
  return <section className="v2-sports-embedded" aria-label="体育运动平台">
    <div className="v2-sports-toolbar"><Link to="/v2" className="v2-sports-back"><ArrowLeft size={16}/>返回伴学</Link></div>
    <iframe
      className="v2-sports-frame"
      title="BNBU Sports 体育运动平台"
      src={sportsStudentHref(window.location.hostname)}
      allow="camera 'self'; microphone 'self'; fullscreen 'self'"
    />
  </section>
}
