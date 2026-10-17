import { Activity, ChevronRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { sportsHours, sportsProgressLabel } from '../../shared/v2/sportsProgress'
import { recordGroup, recordGroups } from '../live/sportsDashboardModel'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'

export function V2Sports() {
  const live = useWorkspaceBackend(30000)
  const [selected, setSelected] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const available = live.data?.sportsStatus === 'available'
  const progress = available && live.data?.sports?.role === 'student' ? live.data.sports.progress : null
  const percent = typeof progress?.percent === 'number' && Number.isFinite(progress.percent) ? Math.max(0, Math.min(100, progress.percent)) : null
  const dashboard = available && live.data?.sportsDashboard?.identity.data.role === 'student' ? live.data.sportsDashboard : null
  const records = (dashboard?.records ?? []).filter(item => item.ownerId === dashboard?.identity.ownerId).sort((a,b) => b.createdAt.localeCompare(a.createdAt))
  const record = records.find(item => item.id === selected)
  const refresh = async () => {setRefreshing(true); try { await live.refresh() } finally {setRefreshing(false)} }
  return <section className="v2-page reference-sports"><PageHeading eyebrow="CAMPUS MOVEMENT" title="运动打卡" description="每一次坚持，都离目标更近一点。" action={<button className="v2-button v2-button-secondary" onClick={() => void refresh()} disabled={refreshing}><RefreshCw size={16}/>{refreshing ? '更新中…' : '更新进度'}</button>}/>
    {live.error && <p role="alert">{live.error}</p>}
    <div className="reference-sports-overview"><div className="reference-progress-ring" role={percent === null ? undefined : 'progressbar'} aria-label="本学期完成率" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined}><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/>{percent !== null && percent > 0 && <circle cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${percent} 100`}/>}</svg><span><strong>{percent === null ? '—' : `${Math.floor(percent)}%`}</strong><small>本学期进度</small></span></div><div><span className="reference-sports-label">{progress?.semester || '本学期'}</span><h2>{progress?.completedHours == null ? '—' : sportsHours(progress.completedHours)} <small>/ {progress?.targetHours == null ? '—' : sportsHours(progress.targetHours)} 小时</small></h2><p>{progress ? sportsProgressLabel(progress) : !live.data ? '正在读取进度…' : live.data.sportsStatus === 'not-enrolled' ? '暂无已加入的体育课程' : '体育进度暂不可用'}</p>{progress?.course && <small>{progress.course}</small>}</div></div>
    <div className="reference-sports-note"><Activity size={22}/><div><strong>运动，让校园生活更有活力</strong><p>这里同步体育平台的已授权进度。运动开始、凭证提交与审核由体育平台处理。</p></div></div>
    <section className="reference-section"><SectionHeading title="最近运动记录" detail={dashboard ? `${records.length} 条` : undefined}/>{records.slice(0,20).map(item => <button className="reference-record" key={item.id} onClick={() => setSelected(item.id)}><span className="reference-icon tone-blue"><Activity size={20}/></span><span><strong>{String(item.data.sportName ?? item.data.sport ?? '运动记录')}</strong><small>{new Date(item.createdAt).toLocaleString('zh-CN')}</small></span><em>{recordGroups.find(group => group.key === recordGroup(item.data.status))?.label}</em><ChevronRight size={16}/></button>)}{!records.length && <Empty icon={Activity} title={dashboard ? '暂无运动记录' : '暂无可显示的运动记录'} description={live.data?.sportsStatus === 'not-enrolled' ? '当前账号未加入体育课程。' : dashboard ? '体育平台的记录同步后会显示在这里。' : '当前服务未提供运动记录，暂时无法显示。'}/>}</section>
    {record && <Modal title="运动记录详情" onClose={() => setSelected(null)}><dl className="reference-record-detail"><dt>运动</dt><dd>{String(record.data.sportName ?? record.data.sport ?? '运动记录')}</dd><dt>时间</dt><dd>{new Date(record.createdAt).toLocaleString('zh-CN')}</dd><dt>状态</dt><dd>{recordGroups.find(group => group.key === recordGroup(record.data.status))?.label}</dd></dl><p className="v2-form-note">记录结果以体育平台为准。</p></Modal>}
  </section>
}
