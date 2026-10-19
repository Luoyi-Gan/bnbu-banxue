import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bell, Check, ChevronRight, Database, FileText, ScanFace, ShieldCheck } from 'lucide-react'
import { DisplayAvatar } from './DisplayAvatar'
import { Modal } from './ui'
import { useV2 } from './useV2'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import './settingsPage.css'

const groups = [
  {key:'privacy',title:'隐私与可见性',copy:'学号搜索、资料预览',icon:ShieldCheck,rows:[
    {key:'searchable',title:'允许通过学号搜索到我',copy:'关闭后别人无法通过学号找到你'},
    {key:'profilePreview',title:'展示资料预览',copy:'向其他学生展示昵称、头像与学院'},
  ]},
  {key:'notifications',title:'消息与提醒',copy:'组队通知及其他消息提醒',icon:Bell,rows:[
    {key:'messages',title:'其他消息提醒',copy:'组队通知以外的消息显示提醒'},
    {key:'teams',title:'组队通知',copy:'组队消息、申请结果和队伍状态变化时显示提醒'},
  ]},
  {key:'preview',title:'资料展示内容',copy:'资料悬浮窗中的组队与活动',icon:ScanFace,rows:[
    {key:'hoverRecentTeams',title:'展示近期组队',copy:'展示最近结束的公开队伍'},
    {key:'hoverActiveTeams',title:'展示正在组队',copy:'展示当前开放的公开队伍'},
    {key:'hoverActivities',title:'展示参与活动',copy:'展示当前保留参与标记的公开活动'},
  ]},
]

export function SettingsPage() {
  const live=useWorkspaceBackend()
  const {reset}=useV2()
  const [params]=useSearchParams()
  const section=params.get('section')
  const group=groups.find(item=>item.key===section)
  const isData=section==='data'
  const detail=!!group||isData
  const profile=live.data?.entities.find(e=>e.kind==='profile'&&e.ownerId===live.data?.account.id)?.data
  const preferences=live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data
  const name=String(profile?.nickname||live.data?.account.name||'个人资料')
  const [confirmReset,setConfirmReset]=useState(false)
  const resetTrigger=useRef<HTMLButtonElement>(null), cancelReset=useRef<HTMLButtonElement>(null)
  const closeReset=()=>{setConfirmReset(false);resetTrigger.current?.focus()}
  useEffect(()=>{
    if(!confirmReset)return
    cancelReset.current?.focus()
    const dialog=cancelReset.current?.closest('[role=dialog]')
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return
      const items=Array.from(dialog?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),first=items[0],last=items.at(-1)
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    document.addEventListener('keydown',trap)
    return()=>document.removeEventListener('keydown',trap)
  },[confirmReset])
  const [saved,setSaved]=useState('')
  const heading=useRef<HTMLHeadingElement>(null)
  const previousSection=useRef(section)
  useEffect(()=>{
    if(previousSection.current!==section){heading.current?.focus();setSaved('');previousSection.current=section}
  },[section])
  async function change(key:string,enabled:boolean,title:string) {
    setSaved('')
    const action=key.startsWith('hover')?'preferences.hover':key==='profilePreview'?'preferences.preview':key==='searchable'?'preferences.searchable':'preferences.reminders'
    if(await live.mutate(action,{key,enabled}))setSaved(`已${enabled?'开启':'关闭'}${title}`)
  }
  return <div className="v2-page settings-page">
    <header className="settings-heading">
      <Link to={detail?'/v2/settings':'/v2/me'} aria-label={detail?'返回设置':'返回我的'}><ArrowLeft size={21}/></Link>
      <h1 ref={heading} tabIndex={-1}>{group?.title||(isData?'演示数据':'设置')}</h1>
    </header>
    {live.error&&<div className="settings-feedback" role="alert"><span>{live.error}</span>{!live.data&&<button type="button" onClick={()=>void live.refresh()}>重试</button>}</div>}
    {!detail?<>
      <Link to="/v2/me?tab=profile" className="settings-account">
        <DisplayAvatar name={name} avatar={String(profile?.avatar||'')} personId={live.data?.account.id||'self'} className="settings-avatar"/>
        <span><strong>{name}</strong><small>个人资料与校园身份</small></span><ChevronRight size={19}/>
      </Link>
      <section className="settings-group" aria-labelledby="settings-preferences"><h2 id="settings-preferences">偏好设置</h2><div className="settings-list">
        {groups.map(({key,title,copy,icon:Icon})=><Link to={`?section=${key}`} key={key} className="settings-entry"><span className={`settings-icon settings-icon-${key}`}><Icon size={20}/></span><span className="settings-entry-copy"><strong>{title}</strong><small>{copy}</small></span><ChevronRight size={17}/></Link>)}
      </div></section>
      <section className="settings-group" aria-labelledby="settings-app"><h2 id="settings-app">应用与数据</h2><div className="settings-list">
        <Link to="?section=data" className="settings-entry"><span className="settings-icon"><Database size={20}/></span><span className="settings-entry-copy"><strong>演示数据</strong><small>管理本地演示记录</small></span><ChevronRight size={17}/></Link>
        <a href="/fonts/NOTICE.html" className="settings-entry"><span className="settings-icon"><FileText size={20}/></span><span className="settings-entry-copy"><strong>字体与许可</strong></span><ChevronRight size={17}/></a>
      </div></section>
      <p className="settings-footer">会同里 · 连接校园生活</p>
    </>:group?<>
      {group.key!=='notifications'&&<p className="settings-description">{group.key==='privacy'?'选择其他同学如何找到你、了解你。':group.key==='notifications'?'选择希望收到的消息提醒。':'其他同学查看你的资料悬浮窗时，可看到以下公开内容。'}</p>}
      <div className="settings-list settings-controls" aria-busy={live.busy}>
        {group.rows.map(row=><label className="settings-toggle" key={row.key}><span><strong>{row.title}</strong><small id={`setting-${row.key}-hint`}>{row.copy}</small></span><input type="checkbox" role="switch" aria-label={row.title} aria-describedby={`setting-${row.key}-hint`} checked={preferences?.[row.key]!==false} disabled={!live.data||live.busy} onChange={event=>void change(row.key,event.target.checked,row.title)}/></label>)}
      </div>
      <p className="settings-save-state" role="status">{live.busy?'正在保存…':saved?<><Check size={15}/>{saved}</>:live.data?'更改后自动保存':'正在读取设置…'}</p>
    </>:<>
      <p className="settings-description">演示数据保存在当前浏览器中。恢复默认会重置本地操作记录。</p>
      <div className="settings-list settings-data"><Database size={25}/><h2>恢复演示数据</h2><p>清除演示中的发布、申请和审核记录，恢复默认状态。</p><button ref={resetTrigger} type="button" onClick={()=>setConfirmReset(true)}>恢复新版演示数据</button></div>
    </>}
    {confirmReset&&<Modal title="恢复新版演示数据？" onClose={closeReset}><p className="v2-modal-copy">这会清除演示中的发布、申请和审核记录。</p><div className="v2-form-actions"><button type="button" ref={cancelReset} className="v2-button v2-button-secondary" onClick={closeReset}>取消</button><button type="button" className="v2-button v2-button-primary" onClick={()=>{reset();closeReset()}}>恢复默认</button></div></Modal>}
  </div>
}
