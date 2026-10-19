import { CampusConnections } from './CampusConnections'
import { CampusAssistantLink, CampusServiceLinks } from './CampusReferenceHome'
import { StudentTimetable } from './StudentTimetable'
import { StudentCoffeeChanges } from './TeacherPortal'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { liveActivities } from './liveActivities'
import { liveStudentSchedule } from './liveStudentSchedule'
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, CalendarDays, ChevronRight, Coffee, GraduationCap, ImagePlus, MapPinned, MessageCircle, Network, Send, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import mapPreview from '../assets/campus/campus-guide-map.png'
import campusPhoto from '../assets/campus/evening-campus.jpg'
import profileCampus from '../assets/campus/home-background.jpg'
import profileWalkway from '../assets/campus/night-walkway.jpg'
import profileServices from '../assets/campus/campus-services.jpg'
import { useV2 } from './useV2'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'
import { V2RelationshipGraph } from './V2RelationshipGraph'
import { StudentProfile } from './StudentProfile'
import { DisplayAvatar } from './DisplayAvatar'
import { studentCertifications } from './studentCertifications'

export function V2Campus() {
  const [params] = useSearchParams()
  const service = params.get('service')
  if (service === 'coffee') return <Navigate to="/v2/coffee" replace/>
  if (service === 'academic') return <Navigate to="/v2/community?board=学习" replace/>
  if (service === 'alumni') return <Navigate to="/v2/alumni" replace/>
  if (service === 'organizations') return <Navigate to="/v2/organizations" replace/>
  if (service === 'teaching') return <div className="v2-page"><PageHeading eyebrow="MY CLASSES" title="我的课表" description="查看、导入和核对本人的课程安排。"/><StudentTimetable/></div>
  const entries = [
    {path:'/v2/partners', title:'找搭子', copy:'一起学习、运动与探索', icon:UsersRound},
    {path:'/v2/community', title:'校园社区', copy:'分享见闻，交流想法', icon:MessageCircle},
    {path:'/v2/organizations', title:'社团组织', copy:'认识校园里的同行者', icon:GraduationCap},
    {path:'/v2/coffee', title:'Coffee Chat', copy:'选择老师，预约交流', icon:Coffee},
    {path:'/v2/alumni', title:'校友同行', copy:'了解经历与交流机会', icon:Network},
    {path:'/v2/campus?service=teaching', title:'我的课表', copy:'导入、查看与修正课程', icon:BookOpen},
    {path:'/v2/sports', title:'运动打卡', copy:'查看本学期运动进度', icon:CalendarDays},
    {path:'/v2/ai', title:'校园 AI', copy:'查询校园信息与资料', icon:Sparkles},
  ]
  return <div className="v2-page v2-editorial-campus"><PageHeading eyebrow="CAMPUS LIFE" title="校园" description="让每一种兴趣，都找到归属。"/><div className="v2-editorial-campus-photo" style={{backgroundImage:`linear-gradient(90deg,#162e56b3,#162e5610),url(${campusPhoto})`}}><span>校园 · 社群 · 连接</span><strong>让相遇从这里开始。</strong></div><div className="v2-editorial-campus-links">{entries.map(({path,title,copy,icon:Icon}) => <Link key={path} to={path}><Icon size={23}/><strong>{title}</strong><small>{copy}</small><ArrowRight size={17}/></Link>)}</div><CampusConnections/><Link to="/v2/campus/explore" className="v2-campus-explore-entry" style={{backgroundImage:`linear-gradient(90deg,#162e56d9,#162e5620),url(${mapPreview})`}}><span>校园地图</span><strong>探索校园</strong><small>查看楼栋与附近活动</small><span className="v2-campus-explore-cta"><MapPinned size={17}/> 打开地图 <ArrowRight size={16}/></span></Link><section className="campus-home-section"><SectionHeading title="校园服务" detail="常用功能"/><CampusServiceLinks/></section><CampusAssistantLink/></div>
}

export function V2AI() {
  const { state, setState } = useV2()
  const live = useWorkspaceBackend()
  const messages: {id: string; from: string; body: string; sourcePath?: string; sourceLabel?: string}[] = (live.data?.entities ?? []).filter(e => e.kind === 'answer' && e.ownerId === live.data?.account.id).sort((a,b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).flatMap(e => {
    const sources = e.data.sources as {title: string; source: string}[]
    const citation = sources?.length ? '\n来源：' + sources.map(s => s.title + '（' + s.source + '）').join('；') : ''
    return [{id: e.id + ':question', from: 'user', body: String(e.data.question)}, {id: e.id, from: 'assistant', body: String(e.data.body) + citation}]
  })
  const [text, setText] = useState('')
  const [iconMenu, setIconMenu] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const preferences = live.data?.entities.find(e => e.kind === 'preferences' && e.ownerId === live.data?.account.id)?.data
  const aiIconChoice = preferences?.aiIconChoice ?? 'yellow'
  const aiCustomIcon = String(preferences?.aiCustomIcon ?? '')
  const currentIcon = aiIconChoice === 'kitty' ? kittyIcon : aiIconChoice === 'custom' && aiCustomIcon ? aiCustomIcon : yellowIcon
  const send = async (event: FormEvent<HTMLFormElement>) => {event.preventDefault(); const question = text.trim(); if (!question) return; if (await live.mutate('knowledge.ask', {question})) setText(value => value.trim() === question ? '' : value)}
  const choose = async (next: 'yellow' | 'kitty' | 'custom') => { if (await live.mutate('preferences.aiicon', {choice: next})) {setIconMenu(false); setUploadError('')} }
  const upload = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { setUploadError('请选择小于 5 MB 的图片。'); return }
    const objectUrl = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = objectUrl
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const context = canvas.getContext('2d')
      if (!context) throw new Error('canvas unavailable')
      const scale = Math.max(256 / image.naturalWidth, 256 / image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      context.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height)
      const aiCustomIcon = canvas.toDataURL('image/webp', 0.82)
      if (!await live.mutate('preferences.aiicon', {choice: 'custom', image: aiCustomIcon})) {setUploadError('图片保存失败，请重试。'); return}
      setIconMenu(false)
      setUploadError('')
    } catch { setUploadError('无法读取这张图片，请换一张重试。') }
    finally { URL.revokeObjectURL(objectUrl) }
  }
  const toggleSource = (path: string) => setState((value) => ({ ...value, aiPinnedSources: value.aiPinnedSources.includes(path) ? value.aiPinnedSources.filter((source) => source !== path) : [...value.aiPinnedSources, path] }))
  return <div className="v2-page v2-ai-page"><Link to="/v2" className="v2-button v2-button-secondary" style={{ marginBottom: 16 }}><ArrowLeft size={17}/> 返回首页</Link><PageHeading eyebrow="CAMPUS AI" title="问问奶蛙" description="查询已发布的校园知识，回答附有资料来源。" action={<button type="button" className="v2-button v2-button-secondary" onClick={() => setIconMenu(true)}><img src={currentIcon} alt=""/> 更换图标</button>}/><div className="v2-ai-layout"><aside className="v2-panel v2-ai-context"><span className="v2-eyebrow">CONTEXT</span><h3>资料来源</h3><p>校园功能快捷入口；回答来源以正文引用为准。</p>{[['活动资料', '/v2/activities'], ['组队与申请', '/v2/partners/teams'], ['校园服务', '/v2/campus']].map(([label, path]) => <div className="v2-ai-source" key={path}><button type="button" aria-label={`${state.aiPinnedSources.includes(path) ? '取消固定' : '固定'}${label}`} aria-pressed={state.aiPinnedSources.includes(path)} onClick={() => toggleSource(path)}><Bookmark size={16} fill={state.aiPinnedSources.includes(path) ? 'currentColor' : 'none'}/></button><Link to={path}>{label}<ChevronRight size={15}/></Link></div>)}</aside><section className="v2-panel v2-ai-chat"><div className="v2-ai-messages">{messages.map((item) => <div className={`v2-ai-message ${item.from === 'user' ? 'is-user' : ''}`} key={item.id}>{item.from === 'assistant' && <img src={currentIcon} alt="奶蛙"/>}<div className="v2-ai-message-body"><p>{item.id === 'ai-hello' ? item.body.replace('奶娃', '奶蛙') : item.body}</p>{item.sourcePath && <Link className="v2-ai-citation" to={item.sourcePath}><Bookmark size={15}/> 来源：{item.sourceLabel} <ArrowRight size={14}/></Link>}</div></div>)}</div>{live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人问答…</p>}<div className="v2-ai-suggestions">{['这周有什么活动？', '我接下来有什么安排？', '去哪里找学习搭子？'].map((question) => <button type="button" key={question} onClick={() => setText(question)}>{question}</button>)}</div><form className="v2-ai-composer" onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="输入你的校园问题…" aria-label="校园 AI 问题"/><button type="submit" className="v2-button v2-button-primary" disabled={live.busy || !text.trim()}><Send size={17}/></button></form></section></div>
    {iconMenu && <Modal title="选择奶蛙的形象" onClose={() => setIconMenu(false)}><div className="v2-icon-options"><button type="button" className={aiIconChoice === 'yellow' ? 'is-active' : ''} onClick={() => choose('yellow')}><img src={yellowIcon} alt=""/>奶蛙</button><button type="button" className={aiIconChoice === 'kitty' ? 'is-active' : ''} onClick={() => choose('kitty')}><img src={kittyIcon} alt=""/>Hello Kitty</button></div>{aiCustomIcon && <button type="button" className={`v2-custom-icon-option${aiIconChoice === 'custom' ? ' is-active' : ''}`} onClick={() => choose('custom')}><img src={aiCustomIcon} alt=""/> 我上传的图片</button>}<button type="button" className="v2-button v2-button-secondary v2-upload-button" onClick={() => inputRef.current?.click()}><ImagePlus size={17}/> 上传自己的图片</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }}/>{uploadError && <p className="v2-upload-error" role="alert">{uploadError}</p>}<p className="v2-form-note">图片会缩小后保存到当前账号。</p></Modal>}
  </div>
}

export function V2Me() {
  const { state } = useV2()
  const live = useWorkspaceBackend()
  const actorId = live.data?.account.id ?? ''
  const entities = live.data?.entities ?? []
  const timetable = entities.find(e => e.kind === 'timetable' && e.ownerId === actorId)
  const lessonCount = Array.isArray(timetable?.data.lessons) ? timetable.data.lessons.length : 0
  const activities = liveActivities(live.data)
  const arrangements = liveStudentSchedule(live.data)
  const saved = entities.filter(e => ['activity', 'post', 'room'].includes(e.kind) && live.data?.relations.some(r => r.entityId === e.id && r.kind === 'save') && (e.kind === 'activity' ? e.data.status === 'published' : e.kind === 'post' ? e.data.status === 'visible' : e.data.visibility === 'visible'))
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'overview'
  const [backgroundOpen, setBackgroundOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyKind, setVerifyKind] = useState<'student' | 'club' | 'official'>('student')
  const certifications = studentCertifications(live.data)
  const profile = entities.find(e => e.kind === 'profile' && e.ownerId === actorId)?.data
  const preferences = entities.find(e => e.kind === 'preferences' && e.ownerId === actorId)?.data
  const backgroundChoice = String(preferences?.profileBackground ?? 'campus')
  const backgrounds = [{key:'campus',label:'校园建筑',image:profileCampus},{key:'evening',label:'傍晚校园',image:campusPhoto},{key:'walkway',label:'夜间步道',image:profileWalkway},{key:'services',label:'校园空间',image:profileServices}]
  const backgroundImage = backgrounds.find(item => item.key === backgroundChoice)?.image ?? profileCampus
  const displayName = String(profile?.nickname ?? live.data?.account.name ?? '同学')
  const myRooms = entities.filter(e => e.kind === 'room' && (e.ownerId === actorId || e.data.isMember)).map(e => ({id: e.id, owner: e.ownerId, title: String(e.data.title), time: String(e.data.time)}))
  const myEvents = activities.filter(e => e.local?.ownerId === actorId)
  const registerCount = myEvents.length
  const apply = async (event: FormEvent<HTMLFormElement>) => {event.preventDefault(); const data = new FormData(event.currentTarget); if (await live.mutate('certification.apply', {kind: verifyKind, organization: String(data.get('organization') ?? '').trim(), note: String(data.get('note') ?? '').trim()})) {setVerifyOpen(false); setSearchParams({tab: 'verification'})}}
  const tabs = [['overview', '总览'], ['events', '我的活动'], ['timetable', '我的课表'], ['teams', '我的组队'], ['saved', '收藏'], ['network', '关系网络'], ['verification', '身份认证']]
  if (tab === 'profile') return <StudentProfile/>
  if (tab === 'notifications') return <Navigate to="/v2/messages?view=notifications" replace/>
  return <div className="v2-page"><PageHeading eyebrow="MY CAMPUS" title="我的" description="校园里的参与、连接与个人设置都在这里。"/><div className="v2-profile-header" style={{backgroundImage:`linear-gradient(0deg,#fffdf9 8%,#fffdf9a3 62%,#ffffff40),url(${backgroundImage})`}}><DisplayAvatar className="v2-profile-avatar" name={displayName} avatar={String(profile?.avatar ?? '')} personId={actorId}/><div><strong>{displayName}</strong><p>{live.data?.account.organization ?? ''}</p><span>{certifications.hasApprovedCertification ? '有已通过认证' : certifications.records.some(record => record.status === 'pending') ? '认证审核中' : '以本人实际授权为准'}</span></div><div className="v2-profile-header-actions"><button type="button" onClick={() => setBackgroundOpen(value => !value)} aria-expanded={backgroundOpen}>更换背景</button><Link to="/v2/me?tab=profile">管理资料 <ArrowRight size={15}/></Link></div></div>{backgroundOpen && <div className="v2-profile-background-picker" role="group" aria-label="选择个人主页背景">{backgrounds.map(item => <button type="button" key={item.key} className={backgroundChoice === item.key ? "is-active" : ""} aria-pressed={backgroundChoice === item.key} disabled={live.busy || !live.data} onClick={() => void live.mutate("preferences.profilebackground", {choice:item.key})}><img src={item.image} alt=""/><span>{item.label}</span></button>)}</div>}<div className="v2-tabs v2-profile-tabs">{tabs.map(([key, label]) => <button type="button" className={tab === key ? 'is-active' : ''} key={key} onClick={() => setSearchParams({ tab: key })}>{label}</button>)}</div>
    {live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人记录…</p>}
    {tab === 'overview' && <section className="v2-editorial-profile-agenda"><SectionHeading title="我的日程" action={<Link to="/v2/me?tab=events">更多 <ArrowRight size={14}/></Link>}/>{arrangements.length ? arrangements.slice(0, 3).map(item => <Link to={item.path} key={item.id}><span className="v2-editorial-agenda-dot"/><span><strong>{item.title}</strong><small>{item.startAt ? new Date(item.startAt).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) : item.time} · {item.location}</small></span><ChevronRight size={16}/></Link>) : <p>近期没有日程安排。</p>}</section>}
    {tab === 'overview' && <div className="v2-profile-overview"><Link to="/v2/me?tab=events"><CalendarDays size={24}/><strong>{registerCount}</strong><span>活动记录</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=teams"><UsersRound size={24}/><strong>{myRooms.length}</strong><span>参与队伍</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=saved"><Bookmark size={24}/><strong>{saved.length}</strong><span>我的收藏</span><ArrowRight size={15}/></Link><Link to="/v2/alumni?view=bookings"><GraduationCap size={24}/><strong>校友交流</strong><span>查看预约与通知</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=timetable"><BookOpen size={24}/><strong>我的课表</strong><span>{timetable ? `${lessonCount} 条课程安排` : '上传课表照片'}</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=network"><Network size={24}/><strong>关系网络</strong><span>查看校园连接</span><ArrowRight size={15}/></Link><Link to="/v2/settings"><ShieldCheck size={24}/><strong>设置</strong><span>通知与账号偏好</span><ArrowRight size={15}/></Link></div>}
    {tab === 'network' && <V2RelationshipGraph state={state} workspace={live.data}/>}
    {tab === 'timetable' && <StudentTimetable/>}
    {tab === 'events' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的活动" detail="本人主办活动与确认安排"/><StudentCoffeeChanges/>{myEvents.map(event => <Link className="v2-saved-row" to={`/v2/activities/${event.id}`} key={event.id}><CalendarDays size={20}/><span><strong>{event.title}</strong><small>我主办 · {event.local?.status === 'published' ? '展示中' : '已结束展示'}</small></span><ChevronRight size={16}/></Link>)}{arrangements.filter(item => !myEvents.some(e => e.id === item.id)).map(item => <Link className="v2-saved-row" to={item.path} key={item.id}><CalendarDays size={20}/><span><strong>{item.title}</strong><small>{item.label} · {item.startAt ? new Date(item.startAt).toLocaleString('zh-CN') : item.time} · {item.location}</small></span></Link>)}{live.data && !myEvents.length && !arrangements.length && <Empty icon={CalendarDays} title="还没有活动安排"/>}</section>}
    {tab === 'teams' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的组队" action={<Link to="/v2/partners/teams">管理全部 <ArrowRight size={15}/></Link>}/>{myRooms.map((room) => <Link className="v2-saved-row" to="/v2/partners/teams" key={room.id}><UsersRound size={20}/><span><strong>{room.title}</strong><small>{room.owner === actorId ? '我发起' : '已加入'} · {room.time}</small></span><ChevronRight size={16}/></Link>)}</section>}
    {tab === 'saved' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的收藏"/>{saved.map(e => <Link className="v2-saved-row" key={e.id} to={e.kind === 'activity' ? `/v2/activities/${e.id}` : e.kind === 'room' ? `/v2/partners?item=${e.id}` : '/v2/community'}><Bookmark size={20}/><span><strong>{String(e.data.title)}</strong><small>{e.kind === 'activity' ? '校园活动' : e.kind === 'room' ? '搭子队伍' : '社区帖子'}</small></span><ChevronRight size={16}/></Link>)}{live.data && !saved.length && <Empty icon={Bookmark} title="还没有收藏"/>}</section>}
    {tab === 'verification' && <section className="v2-panel v2-list-panel"><SectionHeading title="身份认证" detail="按本人全部认证记录核对"/>{live.data && <p className="v2-form-note">{certifications.canPublishActivity ? '已有有效学生社团成员认证，可按活动规则发起活动。' : '当前没有有效学生社团成员认证，暂不能发起活动。'}</p>}{certifications.records.map(record => <div className="v2-verification-summary" key={record.id}><ShieldCheck size={24}/><div><strong>{record.kindLabel} · {record.statusLabel}</strong><p>{record.organization} · {record.note}</p>{record.reviewNote && <small>审核备注：{record.reviewNote}</small>}</div></div>)}{live.data && !certifications.records.length && <div className="v2-verification-summary"><ShieldCheck size={24}/><div><strong>尚无认证记录</strong><p>提交身份资料后，由有审核职责的管理员处理。</p></div></div>}<button type="button" className="v2-button v2-button-primary" disabled={!live.data} onClick={() => setVerifyOpen(true)}>提交认证申请 <ArrowRight size={16}/></button></section>}
    {verifyOpen && <Modal title="提交身份认证" onClose={() => setVerifyOpen(false)}><form className="v2-form" onSubmit={apply}><label>认证类型<select value={verifyKind} onChange={(event) => setVerifyKind(event.target.value as 'student' | 'club' | 'official')}><option value="student">学生</option><option value="club">学生社团成员</option><option value="official">官方机构</option></select></label><label>学院或组织名称<input name="organization" required placeholder="例如：工商管理学院"/></label><label>申请说明<textarea name="note" required rows={4} placeholder="说明你的身份、所属社团和成员资格"/></label>{live.error && <p role="alert">{live.error}</p>}<p className="v2-form-note">申请会保存到会同里后台，认证不自动授予管理职责。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setVerifyOpen(false)}>取消</button><button type="submit" disabled={live.busy} className="v2-button v2-button-primary">提交申请</button></div></form></Modal>}
  </div>
}

export { SettingsPage as V2Settings } from './SettingsPage'
