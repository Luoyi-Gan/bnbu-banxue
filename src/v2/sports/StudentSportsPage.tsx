import { uiText, uiTemplate, useUiLanguage, uiLocale } from '../uiLanguage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChartNoAxesCombined, ChevronRight, Footprints, History, Info, RefreshCw, ShieldCheck } from 'lucide-react'
import { sportsSummary } from './sportsSummary'
import { NativeSportsCheckin } from './NativeSportsCheckin'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { SportsHeader as Header, SportsEmptyNote as EmptyNote } from './sportsPresentation'
import { sportsHours, sportsProgressLabel } from '../../../shared/v2/sportsProgress'
import { recordGroup, recordGroups } from '../../live/sportsDashboardModel'
import { Modal } from '../ui'
import './studentSports.css'

const dateLabel = (value: string) => new Date(value).toLocaleString(uiLocale(), {timeZone:'Asia/Shanghai',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})
const hours = (value: number | null | undefined) => value == null ? '—' : sportsHours(value)
type View = 'exercise' | 'records' | 'synced'

export function StudentSportsPage() { useUiLanguage();
  const live = useWorkspaceBackend(30000)
  const {progress, percent, records, hasRecords} = sportsSummary(live.data)
  const [view,setView] = useState<View>('exercise'), [phase,setPhase] = useState('idle')
  const [filter,setFilter] = useState('all')
  const [progressOpen,setProgressOpen] = useState(false)
  const progressTrigger=useRef<HTMLButtonElement>(null), progressPanel=useRef<HTMLDivElement>(null)
  const closeProgress=()=>{setProgressOpen(false);progressTrigger.current?.focus()}
  useEffect(()=>{
    if(!progressOpen)return
    const dialog=progressPanel.current?.closest('[role=dialog]')
    const buttons=()=>Array.from(dialog?.querySelectorAll<HTMLButtonElement>('button:not(:disabled),a[href],input:not(:disabled)')??[])
    buttons()[0]?.focus()
    const trap=(event:KeyboardEvent)=>{if(event.key!=='Tab')return;const items=buttons(),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
    document.addEventListener('keydown',trap);return()=>document.removeEventListener('keydown',trap)
  },[progressOpen])
  const [selected,setSelected] = useState<string|null>(null), [info,setInfo] = useState(false), [refreshing,setRefreshing] = useState(false)
  const onNativeView = useCallback((next:'exercise'|'records')=>setView(current=>current==='synced'?current:next),[])
  const current = records.find(item=>item.id===selected)
  const filtered = records.filter(item=>filter==='all'||(filter==='attention'?['pending','supplement'].includes(recordGroup(item.data.status)):recordGroup(item.data.status)===filter))
  const refresh = async()=>{if(refreshing)return;setRefreshing(true);try{await live.refresh()}finally{setRefreshing(false)}}
  const inRecords=view!=='exercise'
  const focused=['active','paused','finished','submitted'].includes(phase)
  return <div className="ref-page movement-page" data-movement-view={view} data-movement-phase={phase}>
    <Header title={inRecords?uiText('运动记录'):uiText('运动')} actions={<>{inRecords&&<button type="button" className="movement-record-entry" onClick={()=>{setView(inRecords?'exercise':'records');setSelected(null)}}>{inRecords?<ArrowLeft size={17}/>:<History size={17}/>}<span>{inRecords?uiText('返回运动'):uiText('运动记录')}</span></button>}{!inRecords&&<button className="movement-icon" type="button" onClick={()=>setInfo(true)} aria-label={uiText("运动说明")}><Info size={19}/></button>}</>}/>
    {live.error&&!progressOpen && <p className="movement-error" role="alert">{uiText(live.error)}</p>}
    {inRecords && <div className="movement-record-sources" aria-label={uiText("运动记录来源")}><button type="button" aria-pressed={view==='records'} onClick={()=>setView('records')}>{uiText("本机模拟")}</button><button type="button" aria-pressed={view==='synced'} onClick={()=>setView('synced')}>{uiText("平台同步")}</button></div>}
    {!inRecords&&!focused&&<nav className="movement-shortcuts" aria-label={uiText("运动快捷入口")}><button ref={progressTrigger} type="button" onClick={()=>setProgressOpen(true)}><ChartNoAxesCombined size={17}/>{uiText("学期进度")}</button><button type="button" onClick={()=>setView('records')}><History size={17}/>{uiText("运动记录")}</button></nav>}
    <div className="movement-grid">
      <div className="movement-exercise" hidden={view==='synced'}><NativeSportsCheckin mode={view==='exercise'?'exercise':'records'} onViewChange={onNativeView} onPhaseChange={setPhase}/></div>

    </div>
    {view==='synced'&&<section className="movement-records" id="movement-records"><header><h2>{uiText("已同步的运动")}</h2><span>{hasRecords?uiTemplate([""," 条记录"],filtered.length):uiText('等待同步')}</span></header><div className="movement-tabs" aria-label={uiText("记录状态筛选")}>{[{key:'all',label:'全部'},{key:'attention',label:'待处理'},...recordGroups].map(group=><button type="button" key={group.key} aria-pressed={filter===group.key} onClick={()=>setFilter(group.key)}>{uiText(group.label)}</button>)}</div><div className="movement-list">{filtered.map(item=>{const state=recordGroup(item.data.status);return <button type="button" key={item.id} onClick={()=>setSelected(item.id)} className="movement-record"><span className="movement-record-icon"><Footprints size={22}/></span><span className="movement-record-copy"><strong>{String(item.data.sportName??item.data.sport??'运动记录')}</strong><small>{dateLabel(item.createdAt)}</small></span><span className={`movement-state state-${state}`}>{uiText(recordGroups.find(g=>g.key===state)?.label)}</span><ChevronRight size={16}/></button>})}</div>{!filtered.length&&<EmptyNote>{hasRecords?uiText('当前分类没有运动记录。'):uiText('体育平台记录同步后将在这里展示。')}</EmptyNote>}<p className="movement-record-note">{uiText("有效记录与计入学时分别核算，课程要求及每日、每周上限以体育平台为准。")}</p></section>}
    {progressOpen&&<Modal title={uiText("学期进度")} onClose={closeProgress}><div className="movement-progress-dialog" ref={progressPanel}>{live.error&&<p className="movement-error" role="alert">{uiText(live.error)}</p>}
      <section className="movement-progress movement-progress-refined" aria-label={uiText("学期进度")}>
        <header><div><p>{progress?.semester || uiText('本学期')} · {progress?.course || uiText('体育课程信息待同步')}</p></div><span className="movement-badge">{progress?sportsProgressLabel(progress):!live.data?uiText('同步中'):live.data.sportsStatus==='not-enrolled'?uiText('未加入班级'):uiText('暂不可用')}</span></header>
        <div className="movement-progress-overview">
          <div className="movement-hours"><span>{uiText("已完成学时")}</span><p><strong>{hours(progress?.completedHours)}</strong><small>/ {hours(progress?.targetHours)} {uiText("小时")}</small></p><span>{uiText("还需")}{hours(progress?.remainingHours)} {uiText("小时")}</span></div>
          <div className="movement-completion" role="progressbar" aria-label={uiText("本学期运动进度")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent==null?undefined:Math.round(percent)} aria-valuetext={percent==null?'进度待同步':`已完成 ${Math.round(percent)}%`}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43" className="movement-ring-track"/><circle cx="50" cy="50" r="43" className="movement-ring-fill" pathLength="100" strokeDasharray={`${Math.min(100,Math.max(0,percent??0))} 100`}/></svg>
            <strong>{percent==null?'—':`${Math.round(percent)}%`}</strong>
          </div>
        </div>
        <footer><span><ShieldCheck size={14}/>{uiText("学时以体育平台核算为准")}</span><button type="button" onClick={()=>void refresh()} disabled={refreshing} aria-label={uiText("同步体育进度")}><RefreshCw size={14} className={refreshing?'is-refreshing':''}/>{refreshing?uiText('同步中'):uiText('同步')}</button></footer>
      </section>
    </div></Modal>}
    {info&&<Modal title={uiText("运动说明")} onClose={()=>setInfo(false)}><p>{uiText("学期进度与平台同步记录来自本人已授权的体育数据。有效记录不一定全部计入学时，课程要求及每日、每周上限以体育平台为准。未同步的数据保持“—”。")}</p><p>{uiText("运动操作及本机模拟记录仅用于前端体验；运动与凭证保存在当前浏览器，不送交审核，不计入真实学时。")}</p></Modal>}
    {current&&<Modal title={uiText("运动记录详情")} onClose={()=>setSelected(null)}><dl className="movement-detail"><dt>{uiText("运动项目")}</dt><dd>{String(current.data.sportName??current.data.sport??'运动记录')}</dd><dt>{uiText("记录时间")}</dt><dd>{dateLabel(current.createdAt)}</dd><dt>{uiText("审核状态")}</dt><dd>{uiText(recordGroups.find(g=>g.key===recordGroup(current.data.status))?.label)}</dd></dl><p>{uiText("这是已同步的记录摘要；当前数据源尚未提供该记录的凭证与计入学时明细。本机模拟记录可在另一标签查看计时和凭证。")}</p></Modal>}
  </div>
}
