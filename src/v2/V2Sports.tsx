import { uiText, useUiLanguage, uiLocale, uiTemplate } from './uiLanguage'
import { Activity, ChevronRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { sportsHours, sportsProgressLabel } from '../../shared/v2/sportsProgress'
import { recordGroup, recordGroups } from '../live/sportsDashboardModel'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'

export function V2Sports() { useUiLanguage();
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
  return <section className="v2-page reference-sports"><PageHeading eyebrow="CAMPUS MOVEMENT" title={uiText("运动打卡")} description={uiText("每一次坚持，都离目标更近一点。")} action={<button className="v2-button v2-button-secondary" onClick={() => void refresh()} disabled={refreshing}><RefreshCw size={16}/>{refreshing?uiText('更新中…'):uiText('更新进度')}</button>}/>
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    <div className="reference-sports-overview"><div className="reference-progress-ring" role={percent === null?undefined:'progressbar'} aria-label={uiText("本学期完成率")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined}><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/>{percent !== null && percent > 0 && <circle cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${percent} 100`}/>}</svg><span><strong>{percent === null?'—':`${Math.floor(percent)}%`}</strong><small>{uiText("本学期进度")}</small></span></div><div><span className="reference-sports-label">{progress?.semester || uiText('本学期')}</span><h2>{progress?.completedHours == null?'—':sportsHours(progress.completedHours)} <small>/ {progress?.targetHours == null?'—':sportsHours(progress.targetHours)} {uiText("小时")}</small></h2><p>{progress?sportsProgressLabel(progress):!live.data?uiText('正在读取进度…'):live.data.sportsStatus === 'not-enrolled'?uiText('暂无已加入的体育课程'):uiText('体育进度暂不可用')}</p>{progress?.course && <small>{progress.course}</small>}</div></div>
    <div className="reference-sports-note"><Activity size={22}/><div><strong>{uiText("运动，让校园生活更有活力")}</strong><p>{uiText("这里同步体育平台的已授权进度。运动开始、凭证提交与审核由体育平台处理。")}</p></div></div>
    <section className="reference-section"><SectionHeading title={uiText("最近运动记录")} detail={dashboard?uiTemplate([""," 条"],records.length):undefined}/>{records.slice(0,20).map(item => <button className="reference-record" key={item.id} onClick={() => setSelected(item.id)}><span className="reference-icon tone-blue"><Activity size={20}/></span><span><strong>{String(item.data.sportName ?? item.data.sport ?? '运动记录')}</strong><small>{new Date(item.createdAt).toLocaleString(uiLocale())}</small></span><em>{uiText(recordGroups.find(group => group.key === recordGroup(item.data.status))?.label)}</em><ChevronRight size={16}/></button>)}{!records.length && <Empty icon={Activity} title={dashboard?uiText('暂无运动记录'):uiText('暂无可显示的运动记录')} description={live.data?.sportsStatus === 'not-enrolled'?uiText('当前账号未加入体育课程。'):dashboard?uiText('体育平台的记录同步后会显示在这里。'):uiText('当前服务未提供运动记录，暂时无法显示。')}/>}</section>
    {record && <Modal title={uiText("运动记录详情")} onClose={() => setSelected(null)}><dl className="reference-record-detail"><dt>{uiText("运动")}</dt><dd>{String(record.data.sportName ?? record.data.sport ?? '运动记录')}</dd><dt>{uiText("时间")}</dt><dd>{new Date(record.createdAt).toLocaleString(uiLocale())}</dd><dt>{uiText("状态")}</dt><dd>{uiText(recordGroups.find(group => group.key === recordGroup(record.data.status))?.label)}</dd></dl><p className="v2-form-note">{uiText("记录结果以体育平台为准。")}</p></Modal>}
  </section>
}
