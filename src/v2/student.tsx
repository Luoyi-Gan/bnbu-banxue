import { alumniData } from './alumniPolicy'
import { Activity, ArrowLeft, ArrowRight, Bell, BookOpen, Bookmark, CalendarDays, CarFront, ChevronRight, Clapperboard, Clock3, Heart, MapPin, Megaphone, MessageCircle, Plus, Search, Send, SlidersHorizontal, UsersRound, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import FlexCarousel from '../components/reactbits/FlexCarousel/FlexCarousel'
import { events, hosts } from '../data/mockData'
import { recommendationPhoto } from '../data/recommendationPhoto'
import campusPhoto from '../assets/campus/home-background.jpg'
import { CampusMap } from './CampusMap'
import { CampusBuildingPicker } from './V2CampusExplorer'
import type { CampusBuilding } from './campusLocations'
import { makeId, roomTypeName, studentName, timeLabel, todayLabel, type Room, type RoomType } from './model'
import { useV2 } from './useV2'
import { Drawer, Empty, Modal, PageHeading, SectionHeading } from './ui'
import { AnimatedSearchField } from './AnimatedSearchField'
import { filterActivityItems, type ActivityItem, type ActivityPeriod, type ActivitySort, type ActivityStatus } from './activityFilters'
import { studentSchedule, setActivityParticipation } from './studentSchedule'
import { activityActor, canPublishActivity, changeActivityVisibility, createActivity, ownsActivity } from './activityPolicy'

const formatWhen = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

function PulseHeart({ liked, count, onClick, label }: { liked: boolean; count: number; onClick: () => void; label?: string }) {
  const [pulse, setPulse] = useState(0)
  return <button type="button" className={`v2-pulse-heart${liked ? ' is-active' : ''}`} aria-label={`${liked ? '取消点赞' : '点赞'}，当前 ${count} 个赞`} aria-pressed={liked} onClick={() => { setPulse((value) => value + 1); onClick() }}>
    <span className="v2-pulse-heart-icon" key={pulse}><Heart size={17} strokeWidth={2.1} fill={liked ? 'currentColor' : 'none'}/></span>
    <span className="v2-pulse-heart-count" key={`${pulse}-${count}`}>{label ?? count}</span>
  </button>
}

export function V2Home() {
  const { state } = useV2()
  const schedule = studentSchedule(state)
  const upcoming = schedule.filter(item => item.kind === 'activity')
  const pending = state.applications.filter((item) => item.status === 'pending').length + state.rooms.reduce((count, room) => count + (room.owner === studentName ? room.requests.length : 0), 0)
  return <div className="v2-page v2-home">
    <section className="v2-home-hero" style={{ backgroundImage: `linear-gradient(95deg,rgba(4,22,54,.94),rgba(4,39,87,.72) 55%,rgba(4,24,54,.1)),url(${campusPhoto})` }}>
      <span className="v2-eyebrow">2026 秋季学期 · BNBU CAMPUS</span><h1>你好，{state.profile?.nickname ?? studentName}</h1><p>今天在校园里，先从你关心的事情开始。</p>
      <div className="v2-home-hero-actions"><Link className="v2-button v2-button-light" to="/v2/activities">发现活动 <ArrowRight size={16}/></Link><Link className="v2-button v2-button-outline-light" to="/v2/partners">找搭子 <ArrowRight size={16}/></Link></div>
    </section>
    <div className="v2-home-stats">
      <Link to="/v2/activities"><CalendarDays size={22}/><span><strong>{upcoming.length}</strong><small>接下来的活动</small></span><ArrowRight size={16}/></Link>
      <Link to="/v2/partners/teams"><UsersRound size={22}/><span><strong>{pending}</strong><small>组队待处理</small></span><ArrowRight size={16}/></Link>
      <Link to="/v2/sports" className="v2-sport-stat" aria-label="运动进度，已完成 16 小时，目标 20 小时，进入体育运动平台">
        <div className="v2-sport-stat-head"><span className="v2-sport-stat-icon"><Activity size={20}/></span><span className="v2-sport-stat-title"><strong>运动进度</strong></span><span className="v2-sport-stat-percent">80%</span></div>
        <div className="v2-sport-stat-summary"><span className="v2-sport-stat-value"><strong>16</strong><em> / 20 小时</em></span><small>距离目标还差 <b>4 小时</b></small></div>
        <div className="v2-sport-progress" role="progressbar" aria-label="运动目标完成进度" aria-valuenow={16} aria-valuemin={0} aria-valuemax={20}><span/></div>
      </Link>
    </div>
    <div className="v2-home-grid v2-home-grid-single"><section className="v2-panel v2-home-timeline"><SectionHeading title="近期校园安排" detail="已标记的活动、已加入的搭子与 Coffee Chat" action={<Link to="/v2/activities">查看活动 <ArrowRight size={15}/></Link>}/>
      <div className="v2-timeline">{schedule.map((item, index) => <Link to={item.path} className="v2-timeline-item" style={{ animationDelay: `${index * 45}ms` }} key={item.id}><span className="v2-timeline-dot"/><span><small>{item.startAt ? formatWhen(item.startAt) : item.time}</small><strong>{item.title}</strong><em><MapPin size={13}/>{item.location}</em></span><b>{item.label}</b></Link>)}
      {!schedule.length && <div className="v2-timeline-empty"><span className="v2-timeline-dot"/><div><strong>暂无近期安排</strong><p>标记参与活动、加入搭子或预约 Coffee Chat 后，会显示在这里。</p><Link to="/v2/activities">探索校园活动 <ArrowRight size={14}/></Link></div></div>}</div>
    </section></div>
  </div>
}

const seededActivities: ActivityItem[] = events.map((event) => ({ id: event.id, title: event.title, subtitle: event.subtitle, description: event.description, category: event.category, startAt: event.startAt, endAt: event.endAt, location: event.location, capacity: event.capacity, host: hosts.find((host) => host.id === event.hostId)?.name ?? 'BNBU', image: recommendationPhoto(event) }))

export function V2Activities() {
  const { state, setState } = useV2()
  const activityBase = state.role === 'teacher' ? '/v2/teacher/activities' : '/v2/activities'
  const { id } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [period, setPeriod] = useState<ActivityPeriod>('全部时间')
  const [hostFilter, setHostFilter] = useState('全部主办方')
  const [statusFilter, setStatusFilter] = useState<ActivityStatus>('全部状态')
  const [sort, setSort] = useState<ActivitySort>('推荐顺序')
  const [filterOpen, setFilterOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [publishError, setPublishError] = useState('')
  const permitted = canPublishActivity(state)
  const [featured, setFeatured] = useState(0)
  const all = useMemo(() => [...state.localEvents.map((event): ActivityItem => ({ id: event.id, title: event.title, subtitle: '校园成员发起的活动', description: event.description, category: '校园成员活动', startAt: event.startAt, location: event.location, capacity: event.capacity, host: event.host ?? studentName, local: event })), ...seededActivities], [state.localEvents])
  const categories = ['全部', ...new Set(all.map((event) => event.category))]
  const hostsList = ['全部主办方', ...new Set(all.filter((event) => event.local?.status !== 'draft').map((event) => event.host))]
  const filtered = filterActivityItems(all, { query, category, period, host: hostFilter, status: statusFilter, sort }, activityActor(state).id)
  const activeFilters = [
    ...(query.trim() ? [{ label: `搜索：${query.trim()}`, clear: () => setQuery('') }] : []),
    ...(category !== '全部' ? [{ label: `分类：${category}`, clear: () => setCategory('全部') }] : []),
    ...(period !== '全部时间' ? [{ label: `时间：${period}`, clear: () => setPeriod('全部时间') }] : []),
    ...(hostFilter !== '全部主办方' ? [{ label: `主办：${hostFilter}`, clear: () => setHostFilter('全部主办方') }] : []),
    ...(statusFilter !== '全部状态' ? [{ label: `状态：${statusFilter}`, clear: () => setStatusFilter('全部状态') }] : []),
    ...(sort !== '推荐顺序' ? [{ label: `排序：${sort}`, clear: () => setSort('推荐顺序') }] : []),
  ]
  const resetFilters = () => { setQuery(''); setCategory('全部'); setPeriod('全部时间'); setHostFilter('全部主办方'); setStatusFilter('全部状态'); setSort('推荐顺序') }
  const active = all.find((item) => item.id === id && (!item.local || item.local.status === 'published' || ownsActivity(state, item.local)))
  const featuredItems = seededActivities.filter((event) => new Date(event.startAt).getTime() > Date.now()).slice(0, 7)
  const selectedFeatured = featuredItems[featured] ?? featuredItems[0]
  const create = (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault()
    const data = new FormData(form.currentTarget)
    try {
      const next = createActivity(state, { title: String(data.get('title') ?? ''), description: String(data.get('description') ?? ''), startAt: String(data.get('date') ?? ''), location: String(data.get('location') ?? ''), capacity: Number(data.get('capacity')) })
      setState(next); setCreateOpen(false); setPublishError(''); navigate(activityBase + '/' + next.localEvents[0].id)
    } catch (error) { setPublishError(error instanceof Error ? error.message : '活动发布失败') }
  }
  const changeVisibility = (eventId: string) => {
    try { setState(changeActivityVisibility(state, eventId)); setPublishError('') }
    catch (error) { setPublishError(error instanceof Error ? error.message : '操作失败') }
  }
  return <div className="v2-page v2-activities"><PageHeading eyebrow="DISCOVER CAMPUS" title="发现活动" description="认识新的人，参与正在发生的校园生活。" action={permitted && <button className="v2-button v2-button-primary" type="button" onClick={() => { setPublishError(''); setCreateOpen(true) }}><Plus size={17}/> 发起活动</button>}/>
    {featuredItems.length > 0 && <section className="v2-featured-events"><div className="v2-featured-carousel"><FlexCarousel items={featuredItems.map((event) => ({ src: event.image!, alt: event.title, title: event.title, subtitle: `${event.category} · ${formatWhen(event.startAt)}` }))} preset="liquid" intro="rise" fit="natural" cardHeight={0.6} gap={12} radius={16} squeeze={0.2} focusOnClick={false} focusOnHover focusScale={1} captions onChange={setFeatured} onSelect={(index) => navigate(`${activityBase}/${featuredItems[index].id}`)}/></div>{selectedFeatured && <div className="v2-featured-copy"><span className="v2-eyebrow">本周精选 · {selectedFeatured.category}</span><h2>{selectedFeatured.title}</h2><p>{selectedFeatured.subtitle}</p><div><span><CalendarDays size={15}/>{formatWhen(selectedFeatured.startAt)}</span><span><MapPin size={15}/>{selectedFeatured.location}</span></div><Link className="v2-button v2-button-light" to={`${activityBase}/${selectedFeatured.id}`}>查看活动 <ArrowRight size={16}/></Link></div>}</section>}
    <section className="v2-panel v2-list-panel">
      <SectionHeading title="所有活动" detail={`${filtered.length} 个结果`} />
      <div className="v2-toolbar v2-activity-toolbar">
        <AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索活动、地点或主办方"/>
        <button type="button" className={`v2-activity-filter-toggle${filterOpen ? ' is-open' : ''}`} aria-expanded={filterOpen} aria-controls="v2-activity-filter-panel" onClick={() => setFilterOpen((value) => !value)}><SlidersHorizontal size={17}/> 筛选{activeFilters.length > 0 && <b>{activeFilters.length}</b>}</button>
      </div>
      <div id="v2-activity-filter-panel" className={`v2-activity-filter-panel${filterOpen ? ' is-open' : ''}`} aria-hidden={!filterOpen} inert={!filterOpen}>
        <div className="v2-activity-filter-inner">
          <div className="v2-activity-filter-grid">
            <fieldset><legend>活动时间</legend><div className="v2-activity-filter-options">{(['全部时间', '今天', '本周', '下周'] as ActivityPeriod[]).map((item) => <button type="button" key={item} className={period === item ? 'is-active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div></fieldset>
            <fieldset><legend>活动状态</legend><div className="v2-activity-filter-options">{(['全部状态', '未结束', '我主办'] as ActivityStatus[]).map((item) => <button type="button" key={item} className={statusFilter === item ? 'is-active' : ''} onClick={() => setStatusFilter(item)}>{item}</button>)}</div></fieldset>
            <label>主办方<select value={hostFilter} onChange={(event) => setHostFilter(event.target.value)}>{hostsList.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>排序<select value={sort} onChange={(event) => setSort(event.target.value as ActivitySort)}>{(['推荐顺序', '时间最近'] as ActivitySort[]).map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="v2-activity-filter-footer"><span>可组合多个条件，结果会立即更新</span><button type="button" onClick={resetFilters}>重置全部</button></div>
        </div>
      </div>
      <div className="v2-filter-pills">{categories.map((item) => <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {activeFilters.length > 0 && <div className="v2-active-filters" aria-label="已应用的筛选条件">{activeFilters.map((item) => <button type="button" key={item.label} aria-label={`清除${item.label}`} onClick={item.clear}>{item.label}<X size={13}/></button>)}<button type="button" className="v2-active-filters-reset" onClick={resetFilters}>清除全部</button></div>}
      {filtered.length ? <div key={`${query}|${category}|${period}|${hostFilter}|${statusFilter}|${sort}`} className="v2-activity-grid v2-filtered-list">{filtered.map((event, index) => <Link className="v2-activity-card" to={`${activityBase}/${event.id}`} key={event.id} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}><div className="v2-activity-art" style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}><span>{event.category}</span></div><div className="v2-activity-info"><small>{formatWhen(event.startAt)}</small><h3>{event.title}</h3><p>{event.subtitle}</p><span><MapPin size={14}/>{event.location}</span></div></Link>)}</div> : <div className="v2-filter-empty"><Empty icon={Search} title="没有匹配的活动" description="试试其他分类或清除搜索条件。"/><button type="button" className="v2-button v2-button-secondary" onClick={resetFilters}>清除筛选</button></div>}</section>
    {active && <Drawer title={active.title} eyebrow={`${active.category} · ${active.host}`} onClose={() => navigate(activityBase)} wide>
      <div className="v2-detail-art" style={active.image ? { backgroundImage: `url(${active.image})` } : undefined}/>
      <p className="v2-detail-lead">{active.subtitle}</p>
      <section className="v2-event-detail-section"><h3>活动介绍</h3><p>{active.description}</p></section>
      <section className="v2-event-detail-section"><h3>活动信息</h3><div className="v2-event-facts">
        <div><CalendarDays size={20}/><span><small>时间</small><strong>{formatWhen(active.startAt)}</strong></span></div>
        <div><MapPin size={20}/><span><small>地点</small><strong>{active.location}</strong></span></div>
        <div><UsersRound size={20}/><span><small>人数上限</small><strong>{active.capacity ? `${active.capacity} 人` : '未限定'}</strong></span></div>
        <div><Megaphone size={20}/><span><small>主办方</small><strong>{active.host}</strong></span></div>
      </div></section>
      {state.role === 'student' && <div className="v2-detail-actions"><button type="button" className={`v2-button ${state.participatingActivities.includes(active.id) ? 'v2-button-secondary' : 'v2-button-primary'}`} aria-pressed={state.participatingActivities.includes(active.id)} disabled={!state.participatingActivities.includes(active.id) && (active.local?.status === 'draft' || Date.parse(active.endAt ?? active.startAt) <= Date.now())} onClick={() => setState(value => setActivityParticipation(value, active.id, !value.participatingActivities.includes(active.id)))}>{state.participatingActivities.includes(active.id) ? '取消参与标记' : '标记参与'}</button><span className="v2-form-note">{state.participatingActivities.includes(active.id) ? '已标记参与，将显示在首页近期校园安排中。' : '标记后加入个人安排，不占用活动名额。'}</span></div>}
      <section className="v2-event-detail-section"><h3>校园位置</h3><CampusMap key={active.id} location={active.location}/></section>
      {active.local && ownsActivity(state, active.local) && <div className="v2-detail-actions"><span className="v2-status-chip">我主办的活动</span><button type="button" className="v2-button v2-button-secondary" disabled={active.local.status === 'draft' && !permitted} onClick={() => changeVisibility(active.id)}>{active.local.status === 'published' ? '结束展示' : '重新展示'}</button></div>}
      {publishError && <p role="alert">{publishError}</p>}
    </Drawer>}
    {createOpen && <Modal title="发起校园活动" onClose={() => setCreateOpen(false)}><form className="v2-form" onSubmit={create}><label>活动名称<input name="title" required maxLength={80} placeholder="例如：周末摄影漫步"/></label><label>活动介绍<textarea name="description" required rows={3} placeholder="告诉大家会发生什么"/></label><div className="v2-form-two"><label>开始时间<input name="date" type="datetime-local" required/></label><label>人数上限<input name="capacity" type="number" min={1} defaultValue={20}/></label></div><label>地点<input name="location" required placeholder="校园内的集合地点"/></label><p className="v2-form-note">仅已认证的学生社团成员可以发起活动。</p>{publishError && <p role="alert">{publishError}</p>}<div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>取消</button><button type="submit" disabled={!permitted} className="v2-button v2-button-primary">发布活动</button></div></form></Modal>}
  </div>
}

export function V2Community() {
  const { state, setState } = useV2()
  const location = useLocation()
  const navigate = useNavigate()
  const [board, setBoard] = useState('全部')
  const [query, setQuery] = useState('')
  const [compose, setCompose] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  useEffect(() => { if (new URLSearchParams(location.search).get('compose') === '1') setCompose(true) }, [location.search])
  const closeCompose = () => { setCompose(false); if (new URLSearchParams(location.search).has('compose')) navigate('/v2/community', { replace: true }) }
  const boards = ['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业']
  const visible = state.posts.filter((post) => post.status === 'visible' || post.status === 'pending' && post.author === studentName).filter((post) => (board === '全部' || post.board === board) && `${post.title} ${post.body} ${post.author}`.toLowerCase().includes(query.toLowerCase()))
  const current = state.posts.find((post) => post.id === (selected ?? new URLSearchParams(location.search).get('item')) && (post.status === 'visible' || post.status === 'pending' && (post.author === studentName || alumniData(state).profiles.some(p => p.owner === studentName && p.id === post.alumniId))))
  const publish = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const title = String(data.get('title') ?? '').trim(); const body = String(data.get('body') ?? '').trim(); if (!title || !body) return; const id = makeId(); setState((value) => ({ ...value, posts: [{ id, title, body, board: String(data.get('board') ?? '校园'), author: studentName, date: todayLabel(), likes: 0, status: 'pending', comments: [] }, ...value.posts] })); closeCompose(); setSelected(id) }
  const comment = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!current || !commentText.trim()) return; const body = commentText.trim(); setState((value) => ({ ...value, posts: value.posts.map((post) => post.id === current.id ? { ...post, comments: [...post.comments, { id: makeId(), author: studentName, body, date: todayLabel(), status: 'pending' }] } : post) })); setCommentText('') }
  const toggleSave = (id: string) => setState((value) => ({ ...value, savedPosts: value.savedPosts.includes(id) ? value.savedPosts.filter((item) => item !== id) : [...value.savedPosts, id] }))
  const toggleLike = (id: string) => setState((value) => { const liked = value.likedPosts.includes(id); return { ...value, likedPosts: liked ? value.likedPosts.filter((item) => item !== id) : [...value.likedPosts, id], posts: value.posts.map((post) => post.id === id ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) } : post) } })
  return <div className="v2-page"><PageHeading eyebrow="CAMPUS COMMUNITY" title="校园社区" description="聊课程、活动与生活。让每一条真实的校园经验被看见。" action={<button type="button" className="v2-button v2-button-primary v2-community-compose-desktop" aria-label="发布帖子" title="发布帖子" onClick={() => setCompose(true)}><Plus size={17}/><span>发布帖子</span></button>}/>
    <div className="v2-content-with-aside"><section className="v2-panel v2-list-panel"><div className="v2-toolbar"><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索话题或关键词"/></div><div className="v2-filter-pills">{boards.map((item) => <button type="button" className={board === item ? 'is-active' : ''} onClick={() => setBoard(item)} key={item}>{item}</button>)}</div><div key={`${query}|${board}`} className="v2-post-feed v2-filtered-list">{visible.map((post) => <article className="v2-post-card" key={post.id}><div className="v2-post-author"><span className="v2-avatar">{post.author.slice(0, 1)}</span><div><strong>{post.author}</strong><small>{post.date} · {post.board}{post.alumniId && alumniData(state).profiles.some(p => p.id === post.alumniId && p.status === 'approved') ? ' · 认证校友' : ''}</small></div>{post.status === 'pending' && <span className="v2-status-chip is-pending">待审核</span>}</div><button type="button" className="v2-post-body" onClick={() => setSelected(post.id)}><h3>{post.title}</h3><p>{post.body}</p></button><div className="v2-post-actions"><PulseHeart liked={state.likedPosts.includes(post.id)} count={post.likes} onClick={() => toggleLike(post.id)}/><button type="button" onClick={() => setSelected(post.id)}><MessageCircle size={17}/>{post.comments.filter((comment) => comment.status === 'visible').length}</button><button type="button" className={state.savedPosts.includes(post.id) ? 'is-active' : ''} onClick={() => toggleSave(post.id)}><Bookmark size={17} fill={state.savedPosts.includes(post.id) ? 'currentColor' : 'none'}/>{state.savedPosts.includes(post.id) ? '已收藏' : '收藏'}</button></div></article>)}{!visible.length && <div className="v2-filter-empty"><Empty icon={MessageCircle} title="暂无帖子" description="换个分类，或者发布第一个话题。"/><button type="button" className="v2-button v2-button-secondary" onClick={() => { setQuery(''); setBoard('全部') }}>清除筛选</button></div>}</div></section><aside className="v2-aside-stack"><div className="v2-panel"><span className="v2-eyebrow">CAMPUS VOICES</span><h3>交流从一条帖子开始</h3><p>在这里分享真实的学习与校园生活。新发布内容经演示审核后向所有人展示。</p><button type="button" className="v2-text-button" onClick={() => setCompose(true)}>写一条帖子 <ArrowRight size={15}/></button></div><div className="v2-panel"><h3>热门话题</h3>{state.posts.filter((post) => post.status === 'visible').sort((a, b) => b.likes - a.likes).slice(0, 3).map((post, index) => <button type="button" className="v2-trend-row" key={post.id} onClick={() => setSelected(post.id)}><span>0{index + 1}</span><strong>{post.title}</strong></button>)}</div></aside></div>
    {createPortal(<button type="button" className="v2-community-compose" aria-label="发布帖子" onClick={() => setCompose(true)}><span className="v2-community-compose-circle"><Plus size={26}/></span></button>, document.body)}
    {compose && <Modal title="发布社区帖子" onClose={closeCompose}><form className="v2-form" onSubmit={publish}><label>话题标题<input name="title" required maxLength={80} placeholder="想和同学聊什么？"/></label><label>选择分区<select name="board">{boards.slice(1).filter(item => !item.startsWith('校友')).map((item) => <option key={item}>{item}</option>)}</select></label><label>正文<textarea name="body" required rows={5} maxLength={1000} placeholder="分享一点具体的经历或问题"/></label><p className="v2-form-note">发布后进入本地演示审核队列。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={closeCompose}>取消</button><button type="submit" className="v2-button v2-button-primary">提交帖子</button></div></form></Modal>}
    {current && <Drawer title={current.title} eyebrow={`${current.board} · ${current.author}`} onClose={() => { setSelected(null); if (location.search) navigate('/v2/community', { replace: true }) }}><p className="v2-detail-date">{current.date}{current.status === 'pending' ? ' · 待审核' : ''}</p><p className="v2-detail-lead">{current.body}</p><div className="v2-detail-actions"><PulseHeart liked={state.likedPosts.includes(current.id)} count={current.likes} onClick={() => toggleLike(current.id)} label={state.likedPosts.includes(current.id) ? '已点赞' : '点赞'}/><button type="button" className="v2-button v2-button-secondary" onClick={() => toggleSave(current.id)}><Bookmark size={16}/>{state.savedPosts.includes(current.id) ? '已收藏' : '收藏'}</button></div><div className="v2-comments"><SectionHeading title="评论" detail={`${current.comments.filter((item) => item.status === 'visible').length} 条已展示`}/>{current.comments.filter((item) => item.status === 'visible' || item.status === 'pending' && item.author === studentName).map((item) => <div className="v2-comment" key={item.id}><span className="v2-avatar">{item.author.slice(0, 1)}</span><div><strong>{item.author} {item.status === 'pending' && <small>待审核</small>}</strong><p>{item.body}</p><small>{item.date}</small></div></div>)}<form onSubmit={comment} className="v2-comment-form"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="写下你的评论" maxLength={300} aria-label="评论内容"/><button type="submit" className="v2-button v2-button-primary" disabled={!commentText.trim()}><Send size={16}/></button></form></div></Drawer>}
  </div>
}

export function V2Partners() {
  const { state, setState } = useV2()
  const location = useLocation()
  const navigate = useNavigate()
  const [type, setType] = useState<'all' | RoomType>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<RoomType>('study')
  const [locationScope, setLocationScope] = useState<'unset' | 'campus' | 'outside'>('unset')
  const [campusBuilding, setCampusBuilding] = useState<CampusBuilding | null>(null)
  const [outsideAddress, setOutsideAddress] = useState('')
  const [buildingPickerOpen, setBuildingPickerOpen] = useState(false)
  const rooms = state.rooms.filter((room) => room.status === 'open' && (type === 'all' || room.type === type) && `${room.title} ${room.body} ${room.place}`.toLowerCase().includes(query.toLowerCase()))
  const current = state.rooms.find((room) => room.id === (selected ?? new URLSearchParams(location.search).get('item')))
  const application = current && state.applications.find((item) => item.roomId === current.id)
  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (key: string) => String(data.get(key) ?? '').trim()
    const capacity = Math.max(2, Number(get('capacity')) || 4)
    let title = get('title')
    let body = get('body')
    let time = get('time')
    let place = get('place')
    if (createType === 'carpool') {
      const from = get('from'), destination = get('destination')
      if (!from || !destination || !time) return
      title = `${from} → ${destination} 拼车`
      place = from
      body = [`目的地：${destination}`, get('vehicle') && `车型：${get('vehicle')}`, get('cost') && `人均费用：¥${get('cost')}`, get('preference') && `同行偏好：${get('preference')}`, body].filter(Boolean).join(' · ')
    } else if (createType === 'entertainment') {
      if (!title || !time) return
      if (locationScope === 'campus') { if (!campusBuilding) return; place = campusBuilding.name }
      else if (locationScope === 'outside') { place = outsideAddress.trim(); if (!place) return }
      else return
      body = [get('eventType') && `类型：${get('eventType')}`, get('tag') && `标签：${get('tag')}`, body].filter(Boolean).join(' · ')
    } else {
      const courseCode = get('courseCode'), courseName = get('courseName')
      if (!courseCode || !courseName || !get('goal')) return
      title = `${courseCode.toUpperCase()} · ${courseName} 组队`
      time = get('time') || '时间待商定'
      place = '校园 / 线上协商'
      body = [get('goal'), get('gpa') && `绩点：${get('gpa')}`, get('grade') && `年级：${get('grade')}`, get('major') && `专业偏好：${get('major')}`, get('role') && `需要：${get('role')}`, body].filter(Boolean).join(' · ')
    }
    const room: Room = { id: makeId(), type: createType, title, body, time, place, buildingId: createType === 'entertainment' && locationScope === 'campus' ? campusBuilding?.id : undefined, capacity, members: [studentName], owner: studentName, status: 'open', requests: ['林同学'] }
    setState((value) => ({ ...value, rooms: [room, ...value.rooms], notifications: [{ id: makeId(), title: '新的组队申请', body: '林同学申请加入你刚发起的队伍', path: '/v2/partners/teams', read: false, date: '刚刚' }, ...value.notifications] }))
    setCreateOpen(false)
    setLocationScope('unset'); setCampusBuilding(null); setOutsideAddress('')
    setSelected(room.id)
  }
  const apply = (room: Room) => setState((value) => ({ ...value, applications: value.applications.some((item) => item.roomId === room.id) ? value.applications : [{ roomId: room.id, status: 'pending' }, ...value.applications], rooms: value.rooms.map((item) => item.id === room.id && !item.requests.includes(studentName) ? { ...item, requests: [...item.requests, studentName] } : item) }))
  const toggleSaved = (id: string) => setState((value) => ({ ...value, savedRooms: value.savedRooms.includes(id) ? value.savedRooms.filter((item) => item !== id) : [...value.savedRooms, id] }))
  return <div className="v2-page"><PageHeading eyebrow="FIND YOUR PEOPLE" title="找搭子" description="从一次拼车、一场球赛或一段共同学习开始。" action={<button type="button" className="v2-button v2-button-primary" onClick={() => setCreateOpen(true)}><Plus size={17}/> 发起组队</button>}/>
    <div className="v2-partner-overview"><div><span className="v2-eyebrow">TOGETHER ON CAMPUS</span><h2>一起做，校园会更有趣。</h2><p>查看正在招募的队伍，或发起一个自己的计划。</p><Link to="/v2/partners/teams" className="v2-button v2-button-light">我的组队 <ArrowRight size={16}/></Link></div><div className="v2-partner-graphic" aria-hidden="true"><span>拼车</span><span>娱乐</span><span>学习</span></div></div>
    <section className="v2-panel v2-list-panel"><SectionHeading title="搭子大厅" detail={`${rooms.length} 个正在招募的队伍`} action={<Link to="/v2/partners/teams">我的申请与队伍 <ArrowRight size={15}/></Link>}/><div className="v2-toolbar"><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索队伍、地点或关键词"/></div><div className="v2-filter-pills">{([['all', '全部'], ['carpool', '拼车'], ['entertainment', '娱乐'], ['study', '学习']] as const).map(([key, label]) => <button type="button" key={key} className={type === key ? 'is-active' : ''} onClick={() => setType(key)}>{label}</button>)}</div>{rooms.length ? <div key={`${query}|${type}`} className="v2-room-grid v2-filtered-list">{rooms.map((room, index) => <article className="v2-room-card" key={room.id} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}><div className="v2-room-card-top"><span className={`v2-room-type v2-room-${room.type}`}>{roomTypeName[room.type]}</span><button type="button" aria-label={state.savedRooms.includes(room.id) ? '取消收藏' : '收藏队伍'} onClick={() => toggleSaved(room.id)}><Bookmark size={17} fill={state.savedRooms.includes(room.id) ? 'currentColor' : 'none'}/></button></div><button type="button" className="v2-room-open" onClick={() => setSelected(room.id)}><h3>{room.title}</h3><p>{room.body}</p></button><div className="v2-room-facts"><span><Clock3 size={14}/>{room.time}</span><span><MapPin size={14}/>{room.place}</span><span><UsersRound size={14}/>{room.members.length}/{room.capacity} 人</span></div><button type="button" className="v2-room-footer" onClick={() => setSelected(room.id)}><span>{room.owner === studentName ? '我发起的队伍' : `${room.owner} 发起`}</span><strong>查看详情 <ArrowRight size={15}/></strong></button></article>)}</div> : <div className="v2-filter-empty"><Empty icon={UsersRound} title="暂时没有匹配的队伍" description="调整筛选条件，或发起自己的组队。"/><button type="button" className="v2-button v2-button-secondary" onClick={() => { setQuery(''); setType('all') }}>清除筛选</button></div>}</section>
    {current && <Drawer title={current.title} eyebrow={`${roomTypeName[current.type]} · ${current.owner} 发起`} onClose={() => { setSelected(null); if (location.search) navigate('/v2/partners', { replace: true }) }}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.members.length} / {current.capacity} 人</span></div><SectionHeading title="已加入成员"/><div className="v2-member-list">{current.members.map((name) => <span key={name} className="v2-member-chip">{name.slice(0, 1)} · {name}</span>)}</div><div className="v2-detail-actions">{current.owner === studentName ? <Link to="/v2/partners/teams" className="v2-button v2-button-primary">管理申请 <ArrowRight size={16}/></Link> : current.members.includes(studentName) ? <Link to="/v2/messages" className="v2-button v2-button-primary">进入队伍消息 <ArrowRight size={16}/></Link> : application ? <span className="v2-status-chip is-pending">{application.status === 'pending' ? '申请待处理' : application.status === 'approved' ? '申请已通过' : '申请未通过'}</span> : current.members.length >= current.capacity ? <span className="v2-status-chip">队伍已满</span> : <button type="button" className="v2-button v2-button-primary" onClick={() => apply(current)}>申请加入 <ArrowRight size={16}/></button>}</div></Drawer>}
    {createOpen && <Modal title="发起组队" onClose={() => setCreateOpen(false)}><form className={`v2-form v2-partner-form type-${createType}`} onSubmit={create}>
      <div className="v2-partner-type-picker">
        <button type="button" className={createType === 'carpool' ? 'is-active' : ''} onClick={() => setCreateType('carpool')}><CarFront size={19}/><strong>拼车</strong><small>同路出发</small></button>
        <button type="button" className={createType === 'entertainment' ? 'is-active' : ''} onClick={() => setCreateType('entertainment')}><Clapperboard size={19}/><strong>娱乐</strong><small>一起体验</small></button>
        <button type="button" className={createType === 'study' ? 'is-active' : ''} onClick={() => setCreateType('study')}><BookOpen size={19}/><strong>课程组队</strong><small>一起完成</small></button>
      </div>
      <div className="v2-partner-form-intro"><strong>{createType === 'carpool' ? '发布一段同行路线' : createType === 'entertainment' ? '发起一次共同体验' : '寻找课程项目队友'}</strong><span>{createType === 'carpool' ? '让同路的同学看清路线、时间和费用。' : createType === 'entertainment' ? '说清活动类型、时间和想一起做的事。' : '按课程编号和项目目标找到合适的伙伴。'}</span></div>
      <div key={createType} className="v2-partner-specific-fields">
        {createType === 'carpool' && <><div className="v2-form-two"><label>出发地<input name="from" required placeholder="例如：学校南门"/></label><label>目的地<input name="destination" required placeholder="例如：珠海站"/></label></div><label>出发时间<input name="time" required placeholder="例如：周五 17:30"/></label><div className="v2-form-two"><label>车型<select name="vehicle"><option>不限</option><option>网约车</option><option>出租车</option><option>自驾</option></select></label><label>总人数<input name="capacity" type="number" min={2} max={8} defaultValue={4}/></label></div><div className="v2-form-two"><label>预计人均费用<input name="cost" type="number" min={0} placeholder="元，可留空"/></label><label>同行偏好<select name="preference"><option>不限</option><option>安静出行</option><option>可交流</option></select></label></div><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="行李、途经点或集合方式"/></label></>}
        {createType === 'entertainment' && <><label>活动类型<select name="eventType"><option>电影</option><option>演唱会</option><option>桌游</option><option>运动</option><option>其他</option></select></label><label>一句话描述<input name="title" required maxLength={80} placeholder="例如：周末一起看场电影"/></label><div className="v2-form-two"><label>活动时间<input name="time" required placeholder="例如：周六 19:00"/></label><label>人数<input name="capacity" type="number" min={2} max={30} defaultValue={4}/></label></div><div className="v2-location-choice"><strong>活动地点</strong><div><button type="button" className={locationScope === 'campus' ? 'is-active' : ''} onClick={() => { setLocationScope('campus'); setBuildingPickerOpen(true) }}><MapPin size={16}/> 校内 · 地图选楼栋</button><button type="button" className={locationScope === 'outside' ? 'is-active' : ''} onClick={() => setLocationScope('outside')}><MapPin size={16}/> 校外 · 填写地址</button></div>{locationScope === 'campus' && (campusBuilding ? <div className="v2-location-building"><span><MapPin size={16}/>{campusBuilding.name}</span><button type="button" onClick={() => setBuildingPickerOpen(true)}>重新选择</button></div> : <p>请在 3D 地图中点击楼栋，再确认地点。</p>)}{locationScope === 'outside' && <label>详细地址<input value={outsideAddress} onChange={(event) => setOutsideAddress(event.target.value)} required maxLength={120} placeholder="例如：香洲区某影院，写明集合点"/></label>}</div><label>标签<input name="tag" placeholder="例如：轻松、第一次也欢迎"/></label><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="门票、费用或需要准备什么"/></label></>}
        {createType === 'study' && <><div className="v2-form-two"><label>课程编号<input name="courseCode" required maxLength={20} placeholder="例如：COMP1021"/></label><label>课程名称<input name="courseName" required maxLength={70} placeholder="例如：计算机科学导论"/></label></div><label>项目目标<input name="goal" required maxLength={120} placeholder="例如：完成课程期末 Web 项目"/></label><div className="v2-form-two"><label>队伍总人数<input name="capacity" type="number" min={2} max={20} defaultValue={4}/></label><label>预计讨论时间<input name="time" placeholder="例如：每周三晚"/></label></div><div className="v2-form-two"><label>绩点要求<input name="gpa" placeholder="不限 / 3.4 以上"/></label><label>年级要求<select name="grade"><option>不限</option><option>大一</option><option>大二</option><option>大三</option><option>大四</option></select></label></div><label>专业或学院偏好<input name="major" placeholder="例如：计算机相关优先"/></label><label>能力或角色要求<input name="role" placeholder="例如：前端、设计、研究"/></label><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="协作方式和每周节奏"/></label></>}
      </div>
      <p className="v2-form-note">本地演示发布后会生成一条待处理申请，方便体验队长流程。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>取消</button><button type="submit" className="v2-button v2-button-primary" disabled={createType === 'entertainment' && (locationScope === 'unset' || locationScope === 'campus' && !campusBuilding || locationScope === 'outside' && !outsideAddress.trim())}>发布{roomTypeName[createType]}队伍</button></div>
    </form></Modal>}
    {buildingPickerOpen && <CampusBuildingPicker onClose={() => setBuildingPickerOpen(false)} onPick={(building) => { setCampusBuilding(building); setLocationScope('campus'); setBuildingPickerOpen(false) }}/ >}
  </div>
}

export function V2Teams() {
  const { state, setState } = useV2()
  const [tab, setTab] = useState<'ongoing' | 'finished'>('ongoing')
  const [selected, setSelected] = useState<string | null>(null)
  const mine = state.rooms.filter((room) => room.owner === studentName || room.members.includes(studentName))
  const shown = mine.filter((room) => tab === 'ongoing' ? room.status === 'open' : room.status === 'finished')
  const current = state.rooms.find((room) => room.id === selected)
  const decide = (room: Room, name: string, approve: boolean) => setState((value) => {
    const existing = value.conversations.find((item) => item.title === room.title)
    const systemMessage = { id: makeId(), from: '系统', body: `${name}已加入队伍，可以开始交流。`, time: timeLabel() }
    const conversations = existing
      ? value.conversations.map((item) => item.id === existing.id ? { ...item, messages: [...item.messages, systemMessage], unread: item.unread + 1 } : item)
      : [{ id: makeId(), title: room.title, messages: [systemMessage], unread: 1 }, ...value.conversations]
    return { ...value, rooms: value.rooms.map((item) => item.id === room.id ? { ...item, requests: item.requests.filter((person) => person !== name), members: approve && !item.members.includes(name) ? [...item.members, name] : item.members } : item), applications: value.applications.map((item) => item.roomId === room.id && name === studentName ? { ...item, status: approve ? 'approved' : 'rejected' } : item), conversations: approve ? conversations : value.conversations, notifications: [{ id: makeId(), title: approve ? '组队申请已通过' : '组队申请未通过', body: `${name} · ${room.title}`, path: '/v2/partners/teams', date: '刚刚', read: false }, ...value.notifications] }
  })
  return <div className="v2-page"><Link to="/v2/partners" className="v2-button v2-button-secondary" style={{ marginBottom: 16 }}><ArrowLeft size={17}/> 返回找搭子</Link><PageHeading eyebrow="MY TEAMS" title="我的组队" description="集中管理你发起、加入和申请过的队伍。" action={<Link className="v2-button v2-button-primary" to="/v2/partners"><Plus size={17}/> 发起新队伍</Link>}/><div className="v2-tabs"><button type="button" className={tab === 'ongoing' ? 'is-active' : ''} onClick={() => setTab('ongoing')}>进行中 ({mine.filter((room) => room.status === 'open').length})</button><button type="button" className={tab === 'finished' ? 'is-active' : ''} onClick={() => setTab('finished')}>已完成 ({mine.filter((room) => room.status === 'finished').length})</button></div><section className="v2-panel v2-list-panel"><SectionHeading title={tab === 'ongoing' ? '正在进行的队伍' : '已完成的队伍'}/>{shown.length ? <div className="v2-row-list">{shown.map((room) => <button type="button" className="v2-team-row" key={room.id} onClick={() => setSelected(room.id)}><span className={`v2-room-type v2-room-${room.type}`}>{roomTypeName[room.type]}</span><span><strong>{room.title}</strong><small>{room.time} · {room.place} · {room.members.length}/{room.capacity} 人</small></span>{room.owner === studentName && room.requests.length > 0 && <b>{room.requests.length} 待处理</b>}<ChevronRight size={17}/></button>)}</div> : <Empty icon={UsersRound} title={tab === 'ongoing' ? '暂无进行中的队伍' : '暂无已完成的队伍'} description="可以去搭子大厅发现新的计划。"/>}</section><section className="v2-panel v2-list-panel"><SectionHeading title="我的申请" detail="申请状态会保留在这里"/>{state.applications.length ? state.applications.map((application) => { const room = state.rooms.find((item) => item.id === application.roomId); return room && <div className="v2-team-row" key={application.roomId}><span className="v2-room-type">申请</span><span><strong>{room.title}</strong><small>{room.owner} · {room.time}</small></span><b className={`v2-status-chip ${application.status === 'approved' ? 'is-success' : 'is-pending'}`}>{application.status === 'pending' ? '待处理' : application.status === 'approved' ? '已加入' : '未通过'}</b></div> }) : <Empty icon={Search} title="还没有申请记录"/>}</section>
    {current && <Drawer title={current.title} eyebrow={current.owner === studentName ? '我发起的队伍' : '我加入的队伍'} onClose={() => setSelected(null)}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.members.length}/{current.capacity} 人</span></div>{current.owner === studentName && current.requests.length > 0 && <section className="v2-requests"><SectionHeading title="待处理申请" detail={`${current.requests.length} 人等待回复`}/>{current.requests.map((name) => <div key={name} className="v2-request-row"><span className="v2-avatar">{name.slice(0, 1)}</span><strong>{name}</strong><button type="button" onClick={() => decide(current, name, false)}>婉拒</button><button type="button" className="is-approve" onClick={() => decide(current, name, true)}>同意</button></div>)}</section>}<div className="v2-detail-actions"><Link to="/v2/messages" className="v2-button v2-button-primary">查看队伍消息 <ArrowRight size={16}/></Link>{current.owner === studentName && current.status === 'open' && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setState((value) => ({ ...value, rooms: value.rooms.map((room) => room.id === current.id ? { ...room, status: 'finished' } : room) })); setSelected(null) }}>结束组队</button>}</div></Drawer>}
  </div>
}

export function V2Messages() {
  const { state, setState } = useV2()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'notifications' ? 'notifications' : 'conversations'
  const [selected, setSelected] = useState(state.conversations[0]?.id ?? '')
  const [text, setText] = useState('')
  const active = state.conversations.find((item) => item.id === selected)
  const unreadNotices = state.notifications.filter((item) => !item.read).length
  const open = (id: string) => { setSelected(id); setState((value) => ({ ...value, conversations: value.conversations.map((item) => item.id === id ? { ...item, unread: 0 } : item) })) }
  const send = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!active || !text.trim()) return; const body = text.trim(); setState((value) => ({ ...value, conversations: value.conversations.map((item) => item.id === active.id ? { ...item, messages: [...item.messages, { id: makeId(), from: studentName, body, time: timeLabel() }] } : item) })); setText('') }
  return <div className="v2-page v2-messages-page"><PageHeading eyebrow="MESSAGES" title="消息" description="私聊、组队会话与校园通知集中在这里。"/>
    <div className="v2-tabs v2-message-tabs"><button type="button" className={view === 'conversations' ? 'is-active' : ''} onClick={() => setParams({})}><MessageCircle size={16}/> 会话 {state.conversations.reduce((sum, item) => sum + item.unread, 0) > 0 && <b>{state.conversations.reduce((sum, item) => sum + item.unread, 0)}</b>}</button><button type="button" className={view === 'notifications' ? 'is-active' : ''} onClick={() => setParams({ view: 'notifications' })}><Bell size={16}/> 通知 {unreadNotices > 0 && <b>{unreadNotices}</b>}</button></div>
    {view === 'notifications' ? <section className="v2-panel v2-list-panel v2-notification-panel"><SectionHeading title="校园通知" detail={`${state.notifications.length} 条通知`} action={<button type="button" className="v2-text-button" onClick={() => setState((value) => ({ ...value, notifications: value.notifications.map((item) => ({ ...item, read: true })) }))}>全部标为已读</button>}/>{state.notifications.map((item) => <Link className={`v2-saved-row${item.read ? '' : ' is-unread'}`} to={item.path} key={item.id} onClick={() => setState((value) => ({ ...value, notifications: value.notifications.map((notice) => notice.id === item.id ? { ...notice, read: true } : notice) }))}><Bell size={20}/><span><strong>{item.title}</strong><small>{item.body} · {item.date}</small></span>{!item.read && <i className="v2-notification-unread"/>}<ChevronRight size={16}/></Link>)}{!state.notifications.length && <Empty icon={Bell} title="暂无通知"/>}</section> : <div className="v2-chat-shell"><aside className="v2-chat-list"><div className="v2-chat-list-heading"><strong>会话</strong><small>{state.conversations.length} 条</small></div>{state.conversations.map((conversation) => <button type="button" className={selected === conversation.id ? 'is-active' : ''} key={conversation.id} onClick={() => open(conversation.id)}><span className="v2-chat-avatar"><MessageCircle size={20}/></span><span><strong>{conversation.title}</strong><small>{conversation.messages.at(-1)?.body ?? '开始一段新对话'}</small></span>{conversation.unread > 0 && <b>{conversation.unread}</b>}</button>)}</aside><section className="v2-chat-main">{active ? <><header><span className="v2-chat-avatar"><UsersRound size={20}/></span><div><strong>{active.title}</strong><small>演示对话 · 仅保存在当前浏览器</small></div></header><div className="v2-chat-messages">{active.messages.map((message) => <div className={`v2-bubble${message.from === studentName ? ' is-mine' : ''}`} key={message.id}><small>{message.from} · {message.time}</small><p>{message.body}</p></div>)}</div><form className="v2-chat-composer" onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="输入消息…" aria-label="消息内容" maxLength={500}/><button type="submit" className="v2-button v2-button-primary" disabled={!text.trim()}><Send size={17}/></button></form></> : <Empty icon={MessageCircle} title="选择一个会话" description="加入队伍后可在这里继续交流。"/>}</section></div>}
  </div>
}
