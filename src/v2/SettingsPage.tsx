import {version} from '../../package.json'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bell, Check, ChevronRight, Database, FileText, ScanFace, ShieldCheck, Languages, Palette, SlidersHorizontal, Info, LockKeyhole, HelpCircle } from 'lucide-react'
import { DisplayAvatar } from './DisplayAvatar'
import { Modal } from './ui'
import { useV2 } from './useV2'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { useDevicePreferences, saveDevicePreferences, type DevicePreferences } from './devicePreferences'
import {useSettingsLanguage} from './settingsTranslations'
import {PrivacyPolicy} from './PrivacyPolicy'
import {api} from '../live/api'
import './settingsPage.css'
import {HomeCoursePicker} from './HomeCoursePicker'
import {settingsSectionTitles} from './settingsSectionTitles'

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

export function SettingsPage({embedded=false}:{embedded?:boolean}={}) {
  const live=useWorkspaceBackend()
  const device=useDevicePreferences(), t=useSettingsLanguage()
  const [signingOut,setSigningOut]=useState(false), [logoutError,setLogoutError]=useState('')
  const [confirmLogout,setConfirmLogout]=useState(false)
  const logoutTrigger=useRef<HTMLButtonElement>(null)
  const closeLogout=()=>{if(!signingOut){setConfirmLogout(false);logoutTrigger.current?.focus()}}
  const {reset,state}=useV2()
  const student=state.role==='student'
  const basePath=state.role==='teacher'?'/v2/teacher/settings':state.role==='admin'?'/v2/admin/settings':'/v2/settings'
  const profilePath=state.role==='teacher'?'/v2/teacher/profile':state.role==='admin'?basePath+'?section=account':'/v2/me?tab=profile'
  const returnPath=student?'/v2/me':state.role==='teacher'?'/v2/teacher/coffee':'/v2/admin'
  const [params]=useSearchParams()
  const section=params.get('section')
  const group=student?groups.find(item=>item.key===section):undefined
  const isData=section==='data'
  const titles=settingsSectionTitles
  const detail=!!group||!!titles[section||'']
  const profile=live.data?.entities.find(e=>e.kind==='profile'&&e.ownerId===live.data?.account.id)?.data
  const preferences=live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data
  const name=String(profile?.nickname||live.data?.account.name||'个人资料')
  const [confirmReset,setConfirmReset]=useState(false)
  const resetTrigger=useRef<HTMLButtonElement>(null), cancelReset=useRef<HTMLButtonElement>(null)
  const closeReset=()=>{setConfirmReset(false);resetTrigger.current?.focus()}
  useEffect(()=>{
    if(!confirmReset&&!confirmLogout)return
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
  },[confirmReset,confirmLogout])
  const [saved,setSaved]=useState('')
  const heading=useRef<HTMLHeadingElement>(null)
  const previousSection=useRef(section)
  useEffect(()=>{
    if(previousSection.current!==section){heading.current?.focus();setSaved('');previousSection.current=section}
  },[section])
  async function change(key:string,enabled:boolean) {
    setSaved('')
    const action=key.startsWith('hover')?'preferences.hover':key==='profilePreview'?'preferences.preview':key==='searchable'?'preferences.searchable':'preferences.reminders'
    if(await live.mutate(action,{key,enabled}))setSaved('设置已保存')
  }
  const choose=<K extends keyof DevicePreferences>(key:K,value:DevicePreferences[K])=>{if(saveDevicePreferences({[key]:value}))setSaved('设置已保存')}
  const options=<K extends keyof DevicePreferences>(key:K,title:string,items:Array<[DevicePreferences[K],string]>)=><fieldset className="settings-options"><legend>{t(title)}</legend>{items.map(([value,label])=><label key={String(value)}><span>{t(label)}</span><input type="radio" name={key} checked={device.preferences[key]===value} onChange={()=>choose(key,value)}/></label>)}</fieldset>
  const localToggle=(key:'reduceMotion'|'photoAutoplay'|'timetableShortcut',title:string,copy:string)=><label className="settings-toggle"><span><strong>{t(title)}</strong><small>{t(copy)}</small></span><input type="checkbox" role="switch" aria-label={t(title)} checked={device.preferences[key]} onChange={e=>choose(key,e.target.checked)}/></label>
  const entry=(key:string,title:string,copy:string,Icon:typeof Bell)=><Link to={`?section=${key}`} className="settings-entry"><span className="settings-icon"><Icon size={20}/></span><span className="settings-entry-copy"><strong>{t(title)}</strong><small>{t(copy)}</small></span><ChevronRight size={17}/></Link>
  async function signOut(){
    if(signingOut)return
    setSigningOut(true);setLogoutError('')
    try{await api('/api/auth/logout',{});window.location.assign('/v2/login')}
    catch{setLogoutError('退出失败，请重试。');setSigningOut(false)}
  }
  return <div className="v2-page settings-page">
    {!embedded&&<header className="settings-heading">
      <Link to={detail?basePath:returnPath} aria-label={t(detail?'返回设置':'返回我的')}><ArrowLeft size={21}/></Link>
      <h1 ref={heading} tabIndex={-1}>{t(group?.title||titles[section||'']||'设置')}</h1>
    </header>}
    {live.error&&<div className="settings-feedback" role="alert"><span>{live.error}</span>{!live.data&&<button type="button" onClick={()=>void live.refresh()}>{t('重试')}</button>}</div>}
    {!detail?<>
      <Link to={profilePath} className="settings-account">
        <DisplayAvatar name={name} avatar={String(profile?.avatar||'')} personId={live.data?.account.id||'self'} className="settings-avatar"/>
        <span><strong>{name}</strong><small>{t('个人资料与校园身份')}</small></span><ChevronRight size={19}/>
      </Link>
      {student&&<section className="settings-group" aria-labelledby="settings-preferences"><h2 id="settings-preferences">{t('偏好设置')}</h2><div className="settings-list">
        {groups.map(({key,title,copy,icon:Icon})=><Link to={`?section=${key}`} key={key} className="settings-entry"><span className={`settings-icon settings-icon-${key}`}><Icon size={20}/></span><span className="settings-entry-copy"><strong>{t(title)}</strong><small>{t(copy)}</small></span><ChevronRight size={17}/></Link>)}
      </div></section>}
      <section className="settings-group" aria-labelledby="settings-general"><h2 id="settings-general">{t('通用')}</h2><div className="settings-list">
        {entry('language','语言','中文 / English',Languages)}{entry('appearance','外观与显示','主题、文字大小',Palette)}{student&&entry('campus','校园使用偏好','每日课程、轮播与课表入口',SlidersHorizontal)}
      </div></section>
      <section className="settings-group" aria-labelledby="settings-app"><h2 id="settings-app">{t('应用与数据')}</h2><div className="settings-list">
        {entry('account','账号与安全','账号信息、密码与登录',LockKeyhole)}
        {student&&<Link to="?section=data" className="settings-entry"><span className="settings-icon"><Database size={20}/></span><span className="settings-entry-copy"><strong>{t('演示数据')}</strong><small>{t('管理本地演示记录')}</small></span><ChevronRight size={17}/></Link>}
        <a href="/fonts/NOTICE.html" className="settings-entry"><span className="settings-icon"><FileText size={20}/></span><span className="settings-entry-copy"><strong>{t('字体与许可')}</strong></span><ChevronRight size={17}/></a>
      </div></section>
      <section className="settings-group" aria-labelledby="settings-support"><h2 id="settings-support">{t('使用说明')}</h2><div className="settings-list">{entry('policy','隐私政策','了解数据如何使用',ShieldCheck)}{entry('help','使用指南','查看常见问题',HelpCircle)}{entry('about','关于会同里','版本与平台说明',Info)}</div></section>
      <p className="settings-footer">{t('会同里 · 连接校园生活')}</p>
    </>:group?<>
      {group.key!=='notifications'&&<p className="settings-description">{t(group.key==='privacy'?'选择其他同学如何找到你、了解你。':'其他同学查看你的资料悬浮窗时，可看到以下公开内容。')}</p>}
      <div className="settings-list settings-controls" aria-busy={live.busy}>
        {group.rows.map(row=><label className="settings-toggle" key={row.key}><span><strong>{t(row.title)}</strong><small id={`setting-${row.key}-hint`}>{t(row.copy)}</small></span><input type="checkbox" role="switch" aria-label={t(row.title)} aria-describedby={`setting-${row.key}-hint`} checked={preferences?.[row.key]!==false} disabled={!live.data||live.busy} onChange={event=>void change(row.key,event.target.checked)}/></label>)}
      </div>
      <p className="settings-save-state" role="status">{live.busy?t('正在保存…'):saved?<><Check size={15}/>{t(saved)}</>:t(live.data?'更改后自动保存':'正在读取设置…')}</p>
    </>:isData?<>
      <p className="settings-description">{t('演示数据保存在当前浏览器中。恢复默认会重置本地操作记录。')}</p>
      <div className="settings-list settings-data"><Database size={25}/><h2>{t('恢复演示数据')}</h2><p>{t('清除演示中的发布、申请和审核记录，恢复默认状态。')}</p><button ref={resetTrigger} type="button" onClick={()=>setConfirmReset(true)}>{t('恢复新版演示数据')}</button></div>
    </>:<>
      {section==='language'&&<>{options('language','语言',[['system','跟随系统'],['zh','简体中文'],['en','English']])}<p className="settings-description">{t('语言与显示偏好保存在当前浏览器，刷新后继续使用。')}</p></>}
      {section==='appearance'&&<>{options('theme','主题',[['system','跟随系统'],['light','浅色'],['dark','深色']])}{options('textSize','文字大小',[['standard','标准'],['large','大号']])}<div className="settings-type-preview"><strong>{device.language==='en'?'Campus, connected':'校园生活，随时相伴'}</strong><p>{device.language==='en'?'Explore campus activities and keep track of your day.':'发现校园活动，安排属于你的一天。'}</p></div></>}
      {section==='campus'&&<><HomeCoursePicker/><div className="settings-list">{localToggle('reduceMotion','减少动态效果','减弱界面过渡并暂停首页照片自动轮播；系统减少动态设置始终优先。')}{localToggle('photoAutoplay','首页照片自动轮播','关闭后保留当前照片，停止自动切换。')}{localToggle('timetableShortcut','课表快捷入口','显示右下角课表窗口按钮。')}</div><button type="button" className="settings-sidebar-button" onClick={()=>window.dispatchEvent(new Event('huitongli:open-sidebar-settings'))}><SlidersHorizontal size={19}/><span>{t('自定义侧栏')}<small>{t('调整校园功能入口的顺序和显隐')}</small></span><ChevronRight size={18}/></button></>}
      {section==='policy'&&<PrivacyPolicy/>}
      {section==='about'&&<div className="settings-about"><img src="/huitongli-app-icon.png" alt=""/><h2>{t('会同里')}</h2><p>{t('网页端 · 校园窗口')}</p><p>{t('当前版本')} {version}</p><p>{t('会同里提供校园活动、组队、社区、交流预约、课表及体育信息入口。')}</p><Link to="?section=policy">{t('隐私政策')} <ChevronRight size={16}/></Link></div>}
      {section==='help'&&<div className="settings-help">{[['通知关闭后还会收到消息吗？','关闭提醒只隐藏红点；消息和通知仍会保留，未读状态不变。'],['体育模拟会计入学时吗？','不会。浏览器中的模拟运动和凭证不会提交体育平台或计入真实学时。'],['如何调整校园入口？','在校园使用偏好中打开侧栏设置；手机底部主导航保持固定。']].map(([q,a])=><details key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>)}</div>}
      {section==='account'&&<><dl className="settings-account-details"><dt>{t('当前账号')}</dt><dd>{live.data?.account.name||'—'}</dd><dt>{t('邮箱')}</dt><dd>{live.data?.account.email||'—'}</dd><dt>{t('所属机构')}</dt><dd>{live.data?.account.organization||'—'}</dd></dl><div className="settings-list"><Link className="settings-entry" to="/v2/forgot-password"><LockKeyhole size={20}/><span className="settings-entry-copy"><strong>{t('修改 / 找回密码')}</strong><small>{t('通过已验证邮箱重置密码')}</small></span><ChevronRight size={17}/></Link></div><button className="settings-logout" ref={logoutTrigger} type="button" onClick={()=>setConfirmLogout(true)}>{t('退出登录')}</button></>}
      {['language','appearance','campus'].includes(section||'')&&<p className="settings-save-state" role="status">{device.error?t('当前浏览器无法保存偏好，请检查存储权限后重试。'):t(saved||'更改后自动保存')}</p>}
      {['language','appearance','campus'].includes(section||'')&&<p className="settings-device-note">{t('这些偏好只影响当前浏览器，刷新后继续生效。')}</p>}
    </>}
    {confirmLogout&&<Modal title={t('退出当前账号？')} onClose={closeLogout}><p>{t('退出后需要重新登录，浏览器中的设备偏好和模拟运动记录会保留。')}</p>{logoutError&&<p role="alert">{t(logoutError)}</p>}<div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" ref={cancelReset} disabled={signingOut} onClick={closeLogout}>{t('取消')}</button><button type="button" className="v2-button v2-button-primary" disabled={signingOut} onClick={()=>void signOut()}>{t(signingOut?'正在退出…':'退出登录')}</button></div></Modal>}
    {confirmReset&&<Modal title={t('恢复新版演示数据？')} onClose={closeReset}><p className="v2-modal-copy">{t('这会清除演示中的发布、申请和审核记录。')}</p><div className="v2-form-actions"><button type="button" ref={cancelReset} className="v2-button v2-button-secondary" onClick={closeReset}>{t('取消')}</button><button type="button" className="v2-button v2-button-primary" onClick={()=>{reset();closeReset()}}>{t('恢复默认')}</button></div></Modal>}
  </div>
}
