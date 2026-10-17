import { SportsDemo } from './SportsDemo'
import { useState } from 'react'
import { ChevronRight, Clock3, Footprints, Info, RefreshCw, ShieldCheck } from 'lucide-react'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { Header, Ring, EmptyNote } from '../reference/components'
import { sportsSummary } from '../reference/model'
import { sportsHours, sportsProgressLabel } from '../../../shared/v2/sportsProgress'
import { recordGroup, recordGroups } from '../../live/sportsDashboardModel'
import { Modal } from '../ui'
import './studentSports.css'

const dateLabel = (value: string) => new Date(value).toLocaleString('zh-CN', {timeZone:'Asia/Shanghai',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})
const hours = (value: number | null | undefined) => value == null ? '—' : sportsHours(value)

export function StudentSportsPage() {
  const live = useWorkspaceBackend(30000)
  const {progress, percent, records, hasRecords} = sportsSummary(live.data)
  const [filter,setFilter] = useState('all'), [expanded,setExpanded] = useState(false)
  const [selected,setSelected] = useState<string|null>(null), [info,setInfo] = useState(false), [refreshing,setRefreshing] = useState(false)
  const current = records.find(item=>item.id===selected)
  const waiting = records.filter(item=>['pending','supplement'].includes(recordGroup(item.data.status))).length
  const filtered = records.filter(item=>filter==='all'||(filter==='attention'?['pending','supplement'].includes(recordGroup(item.data.status)):recordGroup(item.data.status)===filter))
  const refresh = async()=>{if(refreshing)return;setRefreshing(true);try{await live.refresh()}finally{setRefreshing(false)}}
  return <div className="ref-page movement-page">
    <Header title="体育打卡"/>
    <div className="movement-heading"><div><span>MOVE · EVERY DAY</span><h2>每一次坚持，都算数。</h2><p>{progress?.semester || '本学期'} · {progress?.course || '体育课程信息待同步'}</p></div><button className="movement-icon" type="button" onClick={()=>setInfo(true)} aria-label="体育打卡说明"><Info size={21}/></button></div>
    {live.error && <p className="movement-error" role="alert">{live.error}</p>}
    <div className="movement-grid">
      <SportsDemo/>
      <section className="movement-progress"><header><h2>学期进度</h2><span className="movement-badge">{progress?sportsProgressLabel(progress):!live.data?'同步中':live.data.sportsStatus==='not-enrolled'?'未加入班级':'暂不可用'}</span></header><div className="movement-progress-body"><Ring percent={percent}/><div><span>已计入学时</span><p><strong>{hours(progress?.completedHours)}</strong><small> / {hours(progress?.targetHours)} 小时</small></p><span>{progress?.remainingHours==null?'剩余学时待同步':`距离目标还需 ${hours(progress.remainingHours)} 小时`}</span></div></div><footer><ShieldCheck size={16}/><span>学时以体育平台核算结果为准</span><button onClick={()=>void refresh()} disabled={refreshing} aria-label="同步体育进度"><RefreshCw size={15}/>{refreshing?'同步中':'同步'}</button></footer></section>
    </div>
    <div className="movement-metrics"><div><Footprints size={20}/><strong>{hasRecords?records.length:'—'}</strong><span>已同步记录</span></div><div><ShieldCheck size={20}/><strong>{hasRecords?records.filter(r=>recordGroup(r.data.status)==='valid').length:'—'}</strong><span>有效记录</span></div><button type="button" onClick={()=>{setFilter(waiting?'attention':'all');setExpanded(true);document.getElementById('movement-records')?.scrollIntoView({behavior:'auto',block:'start'})}}><Clock3 size={20}/><strong>{hasRecords?waiting:'—'}</strong><span>待检查 / 待补充</span></button></div>
    <section className="movement-records" id="movement-records"><header><div><h2>运动记录</h2><p>记录每一步，也看见每一次进步。</p></div><span>{hasRecords?`${records.length} 条记录`:'等待同步'}</span></header><div className="movement-tabs" aria-label="记录状态筛选">{[{key:'all',label:'全部'},{key:'attention',label:'待处理'},...recordGroups].map(group=><button type="button" key={group.key} aria-pressed={filter===group.key} onClick={()=>{setFilter(group.key);setExpanded(false)}}>{group.label}</button>)}</div><div className="movement-list">{filtered.slice(0,expanded?filtered.length:4).map(item=>{const state=recordGroup(item.data.status);return <button type="button" key={item.id} onClick={()=>setSelected(item.id)} className="movement-record"><span className="movement-record-icon"><Footprints size={22}/></span><span className="movement-record-copy"><strong>{String(item.data.sportName??item.data.sport??'运动记录')}</strong><small>{dateLabel(item.createdAt)}</small></span><span className={`movement-state state-${state}`}>{recordGroups.find(g=>g.key===state)?.label}</span><ChevronRight size={16}/></button>})}</div>{!filtered.length&&<EmptyNote>{hasRecords?'当前分类没有运动记录。':'体育平台记录同步后将在这里展示。'}</EmptyNote>}{filtered.length>4&&<button className="movement-more" onClick={()=>setExpanded(!expanded)}>{expanded?'收起记录':`查看全部 ${filtered.length} 条记录`} <ChevronRight size={16}/></button>}</section>
    <aside className="movement-help"><Info size={18}/><p>有效记录不一定全部计入学时。课程要求、每日与每周上限等，以体育平台的核算说明为准。</p></aside>
    {info&&<Modal title="体育打卡说明" onClose={()=>setInfo(false)}><p>会同里展示本人已授权的课程进度与运动记录。运动卡片提供独立前端模拟计时和凭证提交流程。</p><p>审核状态与计入学时分别展示，学时以体育平台结果为准。暂未同步的数据显示为“—”。</p></Modal>}
    {current&&<Modal title="运动记录详情" onClose={()=>setSelected(null)}><dl className="movement-detail"><dt>运动项目</dt><dd>{String(current.data.sportName??current.data.sport??'运动记录')}</dd><dt>记录时间</dt><dd>{dateLabel(current.createdAt)}</dd><dt>审核状态</dt><dd>{recordGroups.find(g=>g.key===recordGroup(current.data.status))?.label}</dd></dl><p>这是已同步的记录摘要；当前数据源尚未提供该记录的凭证与计入学时明细。新建模拟运动可在本页查看完整计时和凭证。</p></Modal>}
  </div>
}
