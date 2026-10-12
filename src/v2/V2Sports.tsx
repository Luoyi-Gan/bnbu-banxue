import { Link } from 'react-router-dom'
import { SportsPortal } from '../live/SportsPortal'
import { ArrowLeft } from 'lucide-react'
import { useWorkspaceBackend } from './useWorkspaceBackend'

export function V2Sports() {
  const live = useWorkspaceBackend()
  return <section className="v2-sports-embedded" aria-label="体育运动平台">
    <div className="v2-sports-toolbar"><Link to="/v2" className="v2-sports-back"><ArrowLeft size={16}/>返回伴学</Link></div>
    <div className="v2-sports-content"><SportsPortal workspace={live.data} onRefresh={live.refresh} loading={!live.data && !live.error} error={live.error}/></div>
  </section>
}
