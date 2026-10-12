import { Activity, ArrowUpRight } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import { sportsHours, sportsProgressLabel } from '../../shared/v2/sportsProgress'
import type { SportsCompanion } from '../../shared/live/sportsCompanion'
import { rememberSportsEntryPosition } from './useSportsHomeScroll'
import './sportsProgress.css'

export function SportsProgressCard({ sports, href = '/v2/sports' }: { sports?: SportsCompanion | null; href?: string }) {
  const descriptionId = useId()
  const data = sports?.role === 'student' ? sports.progress : null
  if (!data) return null
  const status = sportsProgressLabel(data)
  const percent = data?.percent ?? null
  const message = data?.status === 'not-enrolled' ? '加入本学期体育班级后，即可查看运动进度。'
    : data?.status === 'sign-in' ? '进入体育平台完成登录与身份验证。'
    : data?.status === 'unavailable' ? '有效运动时长暂不可用，请进入体育平台查看。'
    : data?.status === 'no-target' ? '目标尚未提供，暂不计算完成率。'
    : data?.status === 'completed' ? '本学期已达标，继续保持运动习惯。'
    : percent === 100 ? '总时长已完成，最终达标状态以体育平台为准。'
    : data?.status === 'not-started' ? '从第一次运动开始，慢慢积累。' : '每一次有效运动，都在靠近目标。'
  return <section className="v2-sports-progress-card" aria-label="体育打卡进度看板">
    <Link to={href} onClick={rememberSportsEntryPosition} className="v2-sports-progress-link" aria-label="体育打卡进度，进入体育打卡主界面" aria-describedby={descriptionId}>
      <div className="v2-sports-progress-heading"><span className="v2-sports-progress-icon"><Activity size={21}/></span><div><h2>体育打卡进度</h2><span>{data.semester || '本学期'}{data.source === 'local' ? ' · 本地体育库' : ''}</span></div><ArrowUpRight size={19} className="v2-sports-progress-arrow"/></div>
      <div className="v2-sports-progress-content" id={descriptionId}>
        <div className="v2-sports-progress-ring" role={percent === null ? undefined : 'progressbar'} aria-label="本学期体育打卡完成率" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined}>
          <svg viewBox="0 0 104 104" aria-hidden="true"><circle cx="52" cy="52" r="45"/><circle className="v2-sports-progress-fill" cx="52" cy="52" r="45" pathLength="100" strokeDasharray={`${percent ?? 0} 100`}/></svg>
          <strong>{percent === null ? '—' : Math.floor(percent)}{percent !== null && <small>%</small>}</strong>
        </div>
        <div className="v2-sports-progress-values"><span className="v2-sports-progress-status">{status}</span>
          {data.completedHours !== null ? <><p><strong>{sportsHours(data.completedHours)}</strong><span> / {data.targetHours === null ? '—' : sportsHours(data.targetHours)} 小时</span></p><small>有效运动时长{data.remainingHours !== null ? ` · 还差 ${sportsHours(data.remainingHours)} 小时` : ''}</small></> : <p className="v2-sports-progress-placeholder">暂无可用进度</p>}
        </div>
      </div>
      <div className="v2-sports-progress-footer"><span>{data?.course && <small>{data.course}</small>}{message}</span><span className="v2-sports-progress-cta">进入打卡 <ArrowUpRight size={14}/></span></div>
    </Link>
  </section>
}
