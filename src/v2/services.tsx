import { ArrowRight, BookOpen, Bookmark, CalendarDays, ChevronRight, Coffee, GraduationCap, ImagePlus, MapPinned, MessageCircle, Network, Send, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { coffeeSlots, organizations, teachers } from '../data/mockData'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import mapPreview from '../assets/campus/campus-guide-map.png'
import { makeId, studentName, todayLabel } from './model'
import { useV2 } from './useV2'
import { Drawer, Empty, Modal, PageHeading, SectionHeading } from './ui'
import { AnimatedSearchField } from './AnimatedSearchField'
import { V2CoffeeChat } from './V2CoffeeChat'
import { V2RelationshipGraph } from './V2RelationshipGraph'
import { ownsActivity } from './activityPolicy'

const serviceCards = [
  { id: 'teaching', title: '教学支持', copy: '课堂、课表与教学服务入口', icon: BookOpen, tone: 'blue' },
  { id: 'academic', title: '学术讨论', copy: '课程、研究与项目交流', icon: GraduationCap, tone: 'purple' },
  { id: 'organizations', title: '校园组织', copy: '发现并加入校园社群', icon: UsersRound, tone: 'green' },
  { id: 'coffee', title: 'Coffee Chat', copy: '预约老师的一对一交流', icon: Coffee, tone: 'orange' },
  { id: 'alumni', title: '校友故事', copy: '从校园走向更多可能', icon: Network, tone: 'pink' },
]

export function V2Campus() {
  const { state, setState } = useV2()
  const [selected, setSelected] = useState<string | null>(null)
  const [organizationQuery, setOrganizationQuery] = useState('')
  const [organizationCategory, setOrganizationCategory] = useState('全部')
  const item = serviceCards.find((card) => card.id === selected)
  const organizationCategories = ['全部', ...new Set(organizations.map((org) => org.category))]
  const filteredOrganizations = organizations.filter((org) => (organizationCategory === '全部' || org.category === organizationCategory) && `${org.name} ${org.category} ${org.description}`.toLocaleLowerCase().includes(organizationQuery.trim().toLocaleLowerCase()))
  return <div className="v2-page"><PageHeading eyebrow="CAMPUS SERVICES" title="校园服务" description="学习、社群和师友资源集中在同一处。"/><Link to="/v2/campus/explore" className="v2-campus-explore-entry" style={{ backgroundImage: `linear-gradient(90deg,rgba(5,31,80,.96),rgba(5,42,107,.74) 48%,rgba(5,42,107,.06)),url(${mapPreview})` }}><span className="v2-eyebrow">3D CAMPUS EXPLORER</span><strong>校园探索，从这里出发。</strong><small>旋转校园地图 · 点击楼栋 · 发现计划中的活动</small><span className="v2-campus-explore-cta"><MapPinned size={17}/> 打开 3D 地图 <ArrowRight size={16}/></span></Link><div className="v2-service-lead"><div><span className="v2-eyebrow">BNBU CAMPUS</span><h2>需要什么，就从这里开始。</h2><p>保留伴学的校园服务，把入口整理得更直接。</p></div><Link to="/v2/ai" className="v2-button v2-button-light"><Sparkles size={17}/> 问问校园 AI</Link></div><div className="v2-service-grid">{serviceCards.map(({ icon: Icon, ...card }, index) => <button type="button" className={`v2-service-card tone-${card.tone}`} key={card.id} style={{ animationDelay: `${index * 60}ms` }} onClick={() => setSelected(card.id)}><span><Icon size={23}/></span><strong>{card.title}</strong><small>{card.copy}</small><ArrowRight size={17}/></button>)}</div>
    {item && <Drawer title={item.title} eyebrow="CAMPUS SERVICE" onClose={() => setSelected(null)} wide={item.id === 'organizations' || item.id === 'coffee'}>
      {item.id === 'teaching' && <><p className="v2-detail-lead">课堂与教学信息的快捷入口。</p><div className="v2-service-detail-grid"><div><CalendarDays size={20}/><strong>本周课程</strong><p>在日历里查看个人活动与学习安排。</p><Link to="/v2/me?tab=events">查看我的日程 <ArrowRight size={14}/></Link></div><div><ShieldCheck size={20}/><strong>课堂签到</strong><p>本轮仅展示教学服务结构；此处没有接入学校签到接口。</p></div></div></>}
      {item.id === 'academic' && <><p className="v2-detail-lead">从一个问题开始，找到愿意一起讨论的人。</p><div className="v2-service-detail-grid"><div><MessageCircle size={20}/><strong>学习社区</strong><p>发布课程与项目问题，等待同学参与。</p><Link to="/v2/community">进入学习讨论 <ArrowRight size={14}/></Link></div><div><UsersRound size={20}/><strong>学习搭子</strong><p>发起小组，交流笔记与项目想法。</p><Link to="/v2/partners">寻找学习搭子 <ArrowRight size={14}/></Link></div></div></>}
      {item.id === 'organizations' && <><p className="v2-detail-lead">选择感兴趣的组织，活动和社群会逐渐串联起来。</p><div className="v2-directory-tools"><AnimatedSearchField value={organizationQuery} onChange={setOrganizationQuery} placeholder="搜索组织、类别或关键词"/><span>{filteredOrganizations.length} 个组织</span></div><div className="v2-filter-pills v2-directory-filters">{organizationCategories.map((category) => <button type="button" key={category} className={organizationCategory === category ? 'is-active' : ''} onClick={() => setOrganizationCategory(category)}>{category}</button>)}</div><div className="v2-organization-grid v2-filtered-list" key={`${organizationQuery}|${organizationCategory}`}>{filteredOrganizations.map((org) => <article key={org.id}><span className="v2-org-mark" style={{ background: org.color }}>{org.name.slice(0, 2)}</span><div><strong>{org.name}</strong><small>{org.category} · {org.memberCount} 人</small><p>{org.description}</p></div><button type="button" className={`v2-button ${state.joinedOrganizations.includes(org.id) ? 'v2-button-secondary' : 'v2-button-primary'}`} onClick={() => setState((value) => ({ ...value, joinedOrganizations: value.joinedOrganizations.includes(org.id) ? value.joinedOrganizations.filter((id) => id !== org.id) : [...value.joinedOrganizations, org.id] }))}>{state.joinedOrganizations.includes(org.id) ? '已加入' : '加入'}</button></article>)}</div>{!filteredOrganizations.length && <Empty icon={UsersRound} title="没有匹配的组织" description="试试其他类别或关键词。"/>}</>}
      {item.id === 'coffee' && <V2CoffeeChat/>}
      {item.id === 'alumni' && <><p className="v2-detail-lead">校友故事从校园活动延伸到真实的交流。</p><div className="v2-service-detail-grid"><div><GraduationCap size={20}/><strong>校友分享活动</strong><p>听一听从 BNBU 出发的成长经历。</p><Link to="/v2/activities/alumni-founder-talk">查看 Founder Stories <ArrowRight size={14}/></Link></div><div><Coffee size={20}/><strong>寻找交流机会</strong><p>也可以先预约老师的 Coffee Chat。</p><button type="button" onClick={() => setSelected('coffee')}>查看 Coffee Chat <ArrowRight size={14}/></button></div></div></>}
    </Drawer>}
  </div>
}

const aiReply = (question: string): { body: string; path: string; label: string } => {
  if (/搭子|组队|拼车|学习/.test(question)) return { body: '找搭子目前有拼车、娱乐和学习三种计划。可以查看招募中的队伍，或自己发起一个。', path: '/v2/partners', label: '打开找搭子' }
  if (/消息|申请|队伍/.test(question)) return { body: '你的组队申请与队伍管理集中在“我的组队”；新消息会出现在消息中心。', path: '/v2/partners/teams', label: '查看我的组队' }
  if (/活动|周末|这周/.test(question)) return { body: '发现活动里可以按时间、类别和关键词筛选。可以查看活动时间、地点和主办方。', path: '/v2/activities', label: '发现活动' }
  return { body: '我可以帮你找到活动、社区与校园服务。当前回答基于本地演示内容，你可以从对应页面查看来源。', path: '/v2/campus', label: '打开校园服务' }
}

export function V2AI() {
  const { state, setState } = useV2()
  const [text, setText] = useState('')
  const [iconMenu, setIconMenu] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const currentIcon = state.aiIconChoice === 'kitty' ? kittyIcon : state.aiIconChoice === 'custom' && state.aiCustomIcon ? state.aiCustomIcon : yellowIcon
  const send = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const question = text.trim(); if (!question) return; const answer = aiReply(question); setState((value) => ({ ...value, aiMessages: [...value.aiMessages, { id: makeId(), from: 'user', body: question }, { id: makeId(), from: 'assistant', body: answer.body, sourcePath: answer.path, sourceLabel: answer.label }] })); setText('') }
  const choose = (next: 'yellow' | 'kitty' | 'custom') => { setState((value) => ({ ...value, aiIconChoice: next })); setIconMenu(false); setUploadError('') }
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
      setState((value) => ({ ...value, aiIconChoice: 'custom', aiCustomIcon }))
      setIconMenu(false)
      setUploadError('')
    } catch { setUploadError('无法读取这张图片，请换一张重试。') }
    finally { URL.revokeObjectURL(objectUrl) }
  }
  const toggleSource = (path: string) => setState((value) => ({ ...value, aiPinnedSources: value.aiPinnedSources.includes(path) ? value.aiPinnedSources.filter((source) => source !== path) : [...value.aiPinnedSources, path] }))
  return <div className="v2-page v2-ai-page"><PageHeading eyebrow="CAMPUS AI" title="问问奶蛙" description="根据本地演示内容，快速找到校园里的下一步。" action={<button type="button" className="v2-button v2-button-secondary" onClick={() => setIconMenu(true)}><img src={currentIcon} alt=""/> 更换图标</button>}/><div className="v2-ai-layout"><aside className="v2-panel v2-ai-context"><span className="v2-eyebrow">CONTEXT</span><h3>资料来源</h3><p>回答可关联到这些本地页面。</p>{[['活动资料', '/v2/activities'], ['组队与申请', '/v2/partners/teams'], ['校园服务', '/v2/campus']].map(([label, path]) => <div className="v2-ai-source" key={path}><button type="button" aria-label={`${state.aiPinnedSources.includes(path) ? '取消固定' : '固定'}${label}`} aria-pressed={state.aiPinnedSources.includes(path)} onClick={() => toggleSource(path)}><Bookmark size={16} fill={state.aiPinnedSources.includes(path) ? 'currentColor' : 'none'}/></button><Link to={path}>{label}<ChevronRight size={15}/></Link></div>)}</aside><section className="v2-panel v2-ai-chat"><div className="v2-ai-messages">{state.aiMessages.map((item) => <div className={`v2-ai-message ${item.from === 'user' ? 'is-user' : ''}`} key={item.id}>{item.from === 'assistant' && <img src={currentIcon} alt="奶蛙"/>}<div className="v2-ai-message-body"><p>{item.id === 'ai-hello' ? item.body.replace('奶娃', '奶蛙') : item.body}</p>{item.sourcePath && <Link className="v2-ai-citation" to={item.sourcePath}><Bookmark size={15}/> 来源：{item.sourceLabel} <ArrowRight size={14}/></Link>}</div></div>)}</div><div className="v2-ai-suggestions">{['这周有什么活动？', '我接下来有什么安排？', '去哪里找学习搭子？'].map((question) => <button type="button" key={question} onClick={() => setText(question)}>{question}</button>)}</div><form className="v2-ai-composer" onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="输入你的校园问题…" aria-label="校园 AI 问题"/><button type="submit" className="v2-button v2-button-primary" disabled={!text.trim()}><Send size={17}/></button></form></section></div>
    {iconMenu && <Modal title="选择奶蛙的形象" onClose={() => setIconMenu(false)}><div className="v2-icon-options"><button type="button" className={state.aiIconChoice === 'yellow' ? 'is-active' : ''} onClick={() => choose('yellow')}><img src={yellowIcon} alt=""/>奶蛙</button><button type="button" className={state.aiIconChoice === 'kitty' ? 'is-active' : ''} onClick={() => choose('kitty')}><img src={kittyIcon} alt=""/>Hello Kitty</button></div>{state.aiCustomIcon && <button type="button" className={`v2-custom-icon-option${state.aiIconChoice === 'custom' ? ' is-active' : ''}`} onClick={() => choose('custom')}><img src={state.aiCustomIcon} alt=""/> 我上传的图片</button>}<button type="button" className="v2-button v2-button-secondary v2-upload-button" onClick={() => inputRef.current?.click()}><ImagePlus size={17}/> 上传自己的图片</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }}/>{uploadError && <p className="v2-upload-error" role="alert">{uploadError}</p>}<p className="v2-form-note">图片会缩小后保存在当前浏览器的新版演示中。</p></Modal>}
  </div>
}

export function V2Me() {
  const { state, setState } = useV2()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'overview'
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyKind, setVerifyKind] = useState<'student' | 'club' | 'official'>('student')
  const myVerification = state.verifications.find((item) => item.name === studentName)
  const myRooms = state.rooms.filter((room) => room.owner === studentName || room.members.includes(studentName))
  const myEvents = state.localEvents.filter((event) => ownsActivity(state, event))
  const registerCount = myEvents.length
  const apply = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const organization = String(data.get('organization') ?? '').trim(); const note = String(data.get('note') ?? '').trim(); if (!organization || !note) return; setState((value) => ({ ...value, verifications: [{ id: makeId(), name: studentName, kind: verifyKind, organization, note, status: 'pending', reviewNote: '', date: todayLabel() }, ...value.verifications] })); setVerifyOpen(false); setSearchParams({ tab: 'verification' }) }
  const tabs = [['overview', '总览'], ['events', '我的活动'], ['teams', '我的组队'], ['saved', '收藏'], ['verification', '身份认证']]
  if (tab === 'notifications') return <Navigate to="/v2/messages?view=notifications" replace/>
  return <div className="v2-page"><PageHeading eyebrow="MY CAMPUS" title="我的" description="校园里的参与、连接与个人设置都在这里。"/><div className="v2-profile-header"><span className="v2-profile-avatar">晴</span><div><strong>陈雨晴</strong><p>工商管理学院 · 22301142</p><span>{myVerification?.status === 'approved' ? '已认证' : myVerification?.status === 'pending' ? '认证审核中' : '学生演示身份'}</span></div><Link to="/v2/settings">管理资料 <ArrowRight size={15}/></Link></div><div className="v2-tabs v2-profile-tabs">{tabs.map(([key, label]) => <button type="button" className={tab === key ? 'is-active' : ''} key={key} onClick={() => setSearchParams({ tab: key })}>{label}</button>)}</div>
    {tab === 'overview' && <div className="v2-profile-overview"><Link to="/v2/me?tab=events"><CalendarDays size={24}/><strong>{registerCount}</strong><span>活动记录</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=teams"><UsersRound size={24}/><strong>{myRooms.length}</strong><span>参与队伍</span><ArrowRight size={15}/></Link><Link to="/v2/me?tab=saved"><Bookmark size={24}/><strong>{state.savedPosts.length + state.savedRooms.length}</strong><span>我的收藏</span><ArrowRight size={15}/></Link><V2RelationshipGraph state={state}/></div>}
    {tab === 'events' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的活动" detail="本人主办活动与老师预约"/>{myEvents.map((event) => <Link className="v2-saved-row" to={`/v2/activities/${event.id}`} key={event.id}><CalendarDays size={20}/><span><strong>{event.title}</strong><small>我主办 · {event.status === 'published' ? '展示中' : '已结束'}</small></span><ChevronRight size={16}/></Link>)}{state.coffeeBookings.map((id) => { const slot = coffeeSlots.find((item) => item.id === id); const person = teachers.find((item) => item.id === slot?.teacherId); return slot && person && <div className="v2-saved-row" key={id}><Coffee size={20}/><span><strong>与{person.name}的 Coffee Chat</strong><small>{slot.dateLabel} · {slot.timeLabel}</small></span></div> })}{!registerCount && !state.coffeeBookings.length && <Empty icon={CalendarDays} title="还没有活动安排"/>}</section>}
    {tab === 'teams' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的组队" action={<Link to="/v2/partners/teams">管理全部 <ArrowRight size={15}/></Link>}/>{myRooms.map((room) => <Link className="v2-saved-row" to="/v2/partners/teams" key={room.id}><UsersRound size={20}/><span><strong>{room.title}</strong><small>{room.owner === studentName ? '我发起' : '已加入'} · {room.time}</small></span><ChevronRight size={16}/></Link>)}</section>}
    {tab === 'saved' && <section className="v2-panel v2-list-panel"><SectionHeading title="我的收藏"/>{state.savedPosts.map((id) => { const post = state.posts.find((item) => item.id === id); return post && <Link className="v2-saved-row" to="/v2/community" key={id}><Bookmark size={20}/><span><strong>{post.title}</strong><small>社区帖子</small></span><ChevronRight size={16}/></Link> })}{state.savedRooms.map((id) => { const room = state.rooms.find((item) => item.id === id); return room && <Link className="v2-saved-row" to="/v2/partners" key={id}><Bookmark size={20}/><span><strong>{room.title}</strong><small>搭子队伍</small></span><ChevronRight size={16}/></Link> })}{!state.savedPosts.length && !state.savedRooms.length && <Empty icon={Bookmark} title="还没有收藏"/>}</section>}
    {tab === 'verification' && <section className="v2-panel v2-list-panel"><SectionHeading title="身份认证" detail="学生社团成员认证通过后可发起活动"/>{myVerification ? <div className="v2-verification-summary"><ShieldCheck size={24}/><div><strong>{myVerification.status === 'pending' ? '审核中' : myVerification.status === 'approved' ? '已通过认证' : '认证未通过'}</strong><p>{myVerification.organization} · {myVerification.note}</p>{myVerification.reviewNote && <small>审核备注：{myVerification.reviewNote}</small>}</div></div> : <div className="v2-verification-summary"><ShieldCheck size={24}/><div><strong>尚未认证</strong><p>提交身份资料后，可在管理员演示视图中完成审核。</p></div></div>}{(!myVerification || myVerification.status !== 'pending') && <button type="button" className="v2-button v2-button-primary" onClick={() => setVerifyOpen(true)}>提交认证申请 <ArrowRight size={16}/></button>}</section>}
    {verifyOpen && <Modal title="提交身份认证" onClose={() => setVerifyOpen(false)}><form className="v2-form" onSubmit={apply}><label>认证类型<select value={verifyKind} onChange={(event) => setVerifyKind(event.target.value as 'student' | 'club' | 'official')}><option value="student">学生</option><option value="club">学生社团成员</option><option value="official">官方机构</option></select></label><label>学院或组织名称<input name="organization" required placeholder="例如：工商管理学院"/></label><label>申请说明<textarea name="note" required rows={4} placeholder="说明你的身份、所属社团和成员资格"/></label><p className="v2-form-note">本地演示申请，不上传真实证件或材料。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setVerifyOpen(false)}>取消</button><button type="submit" className="v2-button v2-button-primary">提交申请</button></div></form></Modal>}
  </div>
}

export function V2Settings() {
  const { state, setState, reset } = useV2()
  const [confirmReset, setConfirmReset] = useState(false)
  const rows: Array<{ key: keyof typeof state.preferences; title: string; copy: string }> = [
    { key: 'searchable', title: '允许通过学号搜索到我', copy: '关闭后别人无法通过学号找到你' },
    { key: 'profilePreview', title: '展示资料预览', copy: '在成员列表中展示学院与兴趣' },
    { key: 'messages', title: '消息提醒', copy: '新私聊和组队消息显示提醒' },
    { key: 'teams', title: '组队状态提醒', copy: '申请通过和队伍状态变化时显示提醒' },
  ]
  return <div className="v2-page"><PageHeading eyebrow="PREFERENCES" title="设置" description="管理资料展示、提醒和本地演示数据。"/><div className="v2-settings-grid"><section className="v2-panel v2-list-panel"><SectionHeading title="隐私与提醒"/>{rows.map((row) => <label className="v2-toggle-row" key={row.key}><span><strong>{row.title}</strong><small>{row.copy}</small></span><input type="checkbox" checked={state.preferences[row.key]} onChange={(event) => setState((value) => ({ ...value, preferences: { ...value.preferences, [row.key]: event.target.checked } }))}/></label>)}</section><aside className="v2-panel v2-settings-aside"><span className="v2-eyebrow">DEMO CONTROL</span><h3>演示数据</h3><p>演示数据保存在当前浏览器中。恢复默认会重置本地操作记录。</p><button type="button" className="v2-button v2-button-secondary" onClick={() => setConfirmReset(true)}>恢复新版演示数据</button></aside></div>{confirmReset && <Modal title="恢复新版演示数据？" onClose={() => setConfirmReset(false)}><p className="v2-modal-copy">这会清除演示中的发布、申请和审核记录。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setConfirmReset(false)}>取消</button><button type="button" className="v2-button v2-button-primary" onClick={() => { reset(); setConfirmReset(false) }}>恢复默认</button></div></Modal>}</div>
}
