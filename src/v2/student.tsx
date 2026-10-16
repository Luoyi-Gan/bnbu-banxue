import { ArrowRight, BookOpen, Bookmark, CalendarDays, CarFront, ChevronRight, Clapperboard, Clock3, Dumbbell, MapPin, Megaphone, Plus, Search, SlidersHorizontal, UsersRound, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import FlexCarousel from '../components/reactbits/FlexCarousel/FlexCarousel'
import { ActivityDiscovery, ActivityReactions } from './ActivityDiscovery'
import { CampusMap } from './CampusMap'
import { CampusBuildingPicker } from './V2CampusExplorer'
import type { CampusBuilding } from './campusLocations'
import { roomTypeName, type Room, type RoomType } from '../../shared/v2/model'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Drawer, Empty, Modal, PageHeading, SectionHeading } from './ui'
import { AnimatedSearchField } from './AnimatedSearchField'
import { filterActivityItems, type ActivityPeriod, type ActivitySort, type ActivityStatus } from './activityFilters'
import { liveStudentSchedule } from './liveStudentSchedule'
import { liveActivities } from './liveActivities'
import campusHomeImage from '../assets/campus/home-background.jpg'
import campusEveningImage from '../assets/campus/night-walkway.jpg'
import { DisplayAvatar } from './DisplayAvatar'
import { displayPerson } from './displayPerson'
import { PartnerLocationField, type PartnerPlace } from './PartnerLocationField'
import { PartnerScopedLocationField } from './PartnerScopedLocationField'
import { emptyPartnerFilters, type PartnerDetails, type PartnerFilters } from './partnerFilters'
import { usePartnerRooms } from './usePartnerRooms'
import './partnerFilters.css'

const formatWhen = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export function V2Home() {
  const live = useWorkspaceBackend(30000)
  const schedule = liveStudentSchedule(live.data)
  const next = schedule[0]
  const activities = liveActivities(live.data).filter(item => Date.parse(item.endAt ?? item.startAt) > Date.now() && (!item.local || item.local.status === 'published')).slice(0, 2)
  const roomRequests = live.data?.entities.filter(e => e.kind === 'roomApplication' && e.data.status === 'pending' && live.data?.entities.some(r => r.kind === 'room' && r.id === e.data.roomId && r.ownerId === live.data?.account.id)).length ?? 0
  const now = new Date()
  const greeting = now.getHours() < 11 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'
  const today = `${new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(now)}，${new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now)}`
  const name = String(live.data?.entities.find(e => e.kind === 'profile' && e.ownerId === live.data?.account.id)?.data.nickname ?? live.data?.account.name ?? '同学')
  return <div className="v2-page v2-home v2-editorial-home">
    <section className="v2-editorial-hero" style={{backgroundImage: `linear-gradient(90deg,rgba(17,24,21,.48),rgba(17,24,21,.04)),url(${campusHomeImage})`}}><span className="v2-eyebrow">BNBU · CAMPUS LIFE</span><h1>在这里，<br/>遇见更大的校园生活。</h1><Link to="/v2/activities">开始探索 <ArrowRight size={17}/></Link><small>01 / CAMPUS</small></section>
    <header className="v2-editorial-today"><div><span className="v2-eyebrow">TODAY / {today}</span><h2>{greeting}，{name}</h2><p>把今天的校园生活，过得有声有色。</p></div><Link to="/v2/me?tab=events">我的日程 <ArrowRight size={16}/></Link></header>
    {live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人安排…</p>}
    <div className="v2-editorial-summary"><Link to="/v2/me?tab=events"><CalendarDays size={19}/><span><strong>{schedule.length}</strong><small>近期安排</small></span><ArrowRight size={15}/></Link><Link to="/v2/partners/teams"><UsersRound size={19}/><span><strong>{roomRequests}</strong><small>待处理申请</small></span><ArrowRight size={15}/></Link><Link to="/v2/messages"><Megaphone size={19}/><span><strong>{live.data?.notifications.filter(item => !item.readAt).length ?? 0}</strong><small>未读通知</small></span><ArrowRight size={15}/></Link></div>
    <section className="v2-editorial-section"><SectionHeading title="接下来" action={<Link to="/v2/me?tab=events">全部日程 <ArrowRight size={14}/></Link>}/><div className="v2-editorial-agenda">{next ? <Link to={next.path}><time>{next.startAt ? formatWhen(next.startAt) : next.time}</time><span><strong>{next.title}</strong><small>{next.location}</small></span><em>{next.label}</em><ArrowRight size={16}/></Link> : <p>暂无待进行的安排。<Link to="/v2/activities">看看最近的活动 <ArrowRight size={14}/></Link></p>}</div></section>
    <section className="v2-editorial-section"><SectionHeading title="为你推荐" action={<Link to="/v2/activities">更多活动 <ArrowRight size={14}/></Link>}/><div className="v2-editorial-recommendations">{activities.map(item => <Link to={`/v2/activities/${item.id}`} key={item.id} className="v2-editorial-recommendation"><div className="v2-editorial-recommendation-image" style={item.image ? {backgroundImage: `url(${item.image})`} : undefined}/><span className="v2-eyebrow">{item.category} · {formatWhen(item.startAt)}</span><strong>{item.title}</strong><small>{item.location}</small></Link>)}{live.data && !activities.length && <p>暂无近期活动，稍后再来看看。</p>}</div></section>
    <Link className="v2-editorial-campus-link" to="/v2/campus">校园、社群与更多可能 <ArrowRight size={16}/></Link>
  </div>
}



export function V2Activities() {
  const live = useWorkspaceBackend()
  const actorId = live.data?.account.id ?? ''
  const state = {role: live.data?.account.roles.includes('student') ? 'student' : '', participatingActivities: live.data?.relations.filter(r => r.kind === 'participate').map(r => r.entityId) ?? []}
  const owns = (item: {ownerId?: string}) => item.ownerId === actorId
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
  const [activityBuilding, setActivityBuilding] = useState<CampusBuilding | null>(null)
  const [activityPickerOpen, setActivityPickerOpen] = useState(false)
  const permitted = live.data?.account.roles.includes('student') && live.data.entities.some(e => e.kind === 'certification' && e.ownerId === actorId && e.data.kind === 'club' && e.data.status === 'approved')
  const [featured, setFeatured] = useState(0)
  const all = useMemo(() => liveActivities(live.data), [live.data])
  const categories = ['全部', ...new Set(all.map((event) => event.category))]
  const hostsList = ['全部主办方', ...new Set(all.filter((event) => event.local?.status !== 'draft').map((event) => event.host))]
  const filtered = filterActivityItems(all, { query, category, period, host: hostFilter, status: statusFilter, sort }, actorId)
  const activeFilters = [
    ...(query.trim() ? [{ label: `搜索：${query.trim()}`, clear: () => setQuery('') }] : []),
    ...(category !== '全部' ? [{ label: `分类：${category}`, clear: () => setCategory('全部') }] : []),
    ...(period !== '全部时间' ? [{ label: `时间：${period}`, clear: () => setPeriod('全部时间') }] : []),
    ...(hostFilter !== '全部主办方' ? [{ label: `主办：${hostFilter}`, clear: () => setHostFilter('全部主办方') }] : []),
    ...(statusFilter !== '全部状态' ? [{ label: `状态：${statusFilter}`, clear: () => setStatusFilter('全部状态') }] : []),
    ...(sort !== '推荐顺序' ? [{ label: `排序：${sort}`, clear: () => setSort('推荐顺序') }] : []),
  ]
  const resetFilters = () => { setQuery(''); setCategory('全部'); setPeriod('全部时间'); setHostFilter('全部主办方'); setStatusFilter('全部状态'); setSort('推荐顺序') }
  const active = all.find((item) => item.id === id && (!item.local || item.local.status === 'published' || owns(item.local)))
  const featuredItems = all.filter(event => event.local?.status === 'published' && event.image && Date.parse(event.startAt) > Date.now()).slice(0, 7)
  const selectedFeatured = featuredItems[featured] ?? featuredItems[0]
  const create = async (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault()
    const data = new FormData(form.currentTarget)
    const location = activityBuilding ? [activityBuilding.name, String(data.get('locationDetail') ?? '').trim()].filter(Boolean).join(' · ') : ''
    if (!location) { setPublishError('请先从地图选择活动楼栋'); return }
    if (await live.mutate('activity.create', {title: String(data.get('title') ?? ''), description: String(data.get('description') ?? ''), startAt: new Date(String(data.get('date'))).toISOString(), location, capacity: Number(data.get('capacity'))})) {setCreateOpen(false); setActivityBuilding(null); setPublishError('')}
  }
  const changeVisibility = (eventId: string) => live.mutate('activity.visibility', {id: eventId, publish: all.find(e => e.id === eventId)?.local?.status !== 'published'})
  return <div className="v2-page v2-activities"><PageHeading eyebrow="DISCOVER / CAMPUS" title="发现" description="活动、社群与同行者，从这里开始。" action={permitted && <button className="v2-button v2-button-primary" type="button" onClick={() => { setPublishError(''); setCreateOpen(true) }}><Plus size={17}/> 发起活动</button>}/>
    {live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取活动…</p>}
    <nav className="v2-editorial-discover-links" aria-label="发现更多"><span>活动</span><Link to="/v2/campus">社团组织</Link><Link to="/v2/community">校园社区</Link><Link to="/v2/partners">找搭子</Link><Link to="/v2/alumni">校友</Link></nav>
    {featuredItems.length > 0 && <section className="v2-featured-events"><div className="v2-featured-carousel"><FlexCarousel items={featuredItems.map((event) => ({ src: event.image!, alt: event.isDefaultCover ? `${event.title}（校园通用照片，默认封面）` : event.title, title: event.title, subtitle: `${event.category} · ${formatWhen(event.startAt)}` }))} preset="liquid" intro="rise" fit="natural" cardHeight={0.6} gap={12} radius={16} squeeze={0.2} focusOnClick={false} focusOnHover focusScale={1} captions onChange={setFeatured} onSelect={(index) => navigate(`${activityBase}/${featuredItems[index].id}`)}/></div>{selectedFeatured && <div className="v2-featured-copy"><span className="v2-eyebrow">本周精选 · {selectedFeatured.category}</span><h2>{selectedFeatured.title}</h2><p>{selectedFeatured.subtitle}{selectedFeatured.isDefaultCover && ' · 默认封面'}</p><div><span><CalendarDays size={15}/>{formatWhen(selectedFeatured.startAt)}</span><span><MapPin size={15}/>{selectedFeatured.location}</span></div><Link className="v2-button v2-button-light" to={`${activityBase}/${selectedFeatured.id}`}>查看活动 <ArrowRight size={16}/></Link></div>}</section>}
    {!featuredItems.length && <section className="v2-editorial-discover-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(16,30,27,.60),rgba(16,30,27,.08)),url(${campusEveningImage})`}}><span>DISCOVER / 01</span><strong>发现校园的更多可能。</strong><small>活动 · 社群 · 讲座 · 志愿</small></section>}
    <section className="v2-panel v2-list-panel v2-activity-discovery-panel">
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
      <div className="v2-filter-pills" aria-label="活动分类">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {activeFilters.length > 0 && <div className="v2-active-filters" aria-label="已应用的筛选条件">{activeFilters.map((item) => <button type="button" key={item.label} aria-label={`清除${item.label}`} onClick={item.clear}>{item.label}<X size={13}/></button>)}<button type="button" className="v2-active-filters-reset" onClick={resetFilters}>清除全部</button></div>}
      <p className="activity-discovery-note">点赞与收藏保存到伴学后台 · 点赞标记反映本人状态</p>
      {filtered.length ? <ActivityDiscovery live={live} key={JSON.stringify([query, category, period, hostFilter, statusFilter, sort])} items={filtered} basePath={activityBase}/> : <div className="v2-filter-empty"><Empty icon={Search} title={all.length ? '没有匹配的活动' : '目前没有可展示的活动'} description={all.length ? '试试其他分类或清除搜索条件。' : '有新活动发布后，会显示在这里。'}/>{activeFilters.length > 0 && <button type="button" className="v2-button v2-button-secondary" onClick={resetFilters}>清除筛选</button>}</div>}</section>
    {active && <Drawer title={active.title} eyebrow={`${active.category} · ${active.host}`} onClose={() => navigate(activityBase)} wide>
      <div className="v2-detail-art" role="img" aria-label={active.isDefaultCover ? '校园通用照片，默认封面' : `${active.title}封面`} style={active.image ? { backgroundImage: `url(${active.image})` } : undefined}/>
      <p className="v2-detail-lead">{active.subtitle}{active.isDefaultCover && ' · 默认封面'}</p>
      <ActivityReactions live={live} item={active}/>
      <section className="v2-event-detail-section"><h3>活动介绍</h3><p>{active.description}</p>{active.local?.conditions && <p>参与条件：{active.local.conditions}</p>}{active.local?.mailSourceId && <p>来源：{active.subtitle}</p>}</section>
      <section className="v2-event-detail-section"><h3>活动信息</h3><div className="v2-event-facts">
        <div><CalendarDays size={20}/><span><small>时间</small><strong>{formatWhen(active.startAt)}{active.local?.endAt && <> 至 {formatWhen(active.local.endAt)}</>}</strong></span></div>
        <div><MapPin size={20}/><span><small>地点</small><strong>{active.location}</strong></span></div>
        <div><UsersRound size={20}/><span><small>人数上限</small><strong>{active.capacity ? `${active.capacity} 人` : active.local?.mailSourceId ? '未提供' : '未限定'}</strong></span></div>
        <div><Megaphone size={20}/><span><small>主办方</small><strong>{active.host}</strong></span></div>
      </div></section>
      {state.role === 'student' && <div className="v2-detail-actions"><button type="button" className={`v2-button ${state.participatingActivities.includes(active.id) ? 'v2-button-secondary' : 'v2-button-primary'}`} aria-pressed={state.participatingActivities.includes(active.id)} disabled={!state.participatingActivities.includes(active.id) && (active.local?.status === 'draft' || Date.parse(active.endAt ?? active.startAt) <= Date.now())} onClick={() => void live.mutate('relation.set', {id: active.id, kind: 'participate', enabled: !state.participatingActivities.includes(active.id)})}>{state.participatingActivities.includes(active.id) ? '取消参与标记' : '标记参与'}</button><span className="v2-form-note">{state.participatingActivities.includes(active.id) ? '已保存参与标记。' : '标记不占用活动名额。'}</span></div>}
      <section className="v2-event-detail-section"><h3>校园位置</h3><CampusMap key={active.id} location={active.location}/></section>
      {active.local && owns(active.local) && <div className="v2-detail-actions"><span className="v2-status-chip">我主办的活动</span><button type="button" className="v2-button v2-button-secondary" disabled={active.local.status === 'draft' && !permitted} onClick={() => changeVisibility(active.id)}>{active.local.status === 'published' ? '结束展示' : '重新展示'}</button></div>}
      {(publishError || live.error) && <p role="alert">{publishError || live.error}</p>}
    </Drawer>}
    {createOpen && <Modal title="发起校园活动" onClose={() => setCreateOpen(false)}><form className="v2-form" onSubmit={create}><label>活动名称<input name="title" required maxLength={80} placeholder="例如：周末摄影漫步"/></label><label>活动介绍<textarea name="description" required rows={3} placeholder="告诉大家会发生什么"/></label><div className="v2-form-two"><label>开始时间<input name="date" type="datetime-local" required/></label><label>人数上限<input name="capacity" type="number" min={1} defaultValue={20}/></label></div><div className="v2-activity-location"><strong>活动地点</strong><button type="button" className={activityBuilding ? 'is-selected' : ''} onClick={() => setActivityPickerOpen(true)}><MapPin size={18}/><span>{activityBuilding ? activityBuilding.name : '打开 3D 地图选择楼栋'}</span><ChevronRight size={17}/></button>{activityBuilding && <label>详细集合点（可选）<input name="locationDetail" maxLength={80} placeholder="例如：二层 202 室或大门口"/></label>}</div><p className="v2-form-note">仅已认证的学生社团成员可以发起活动。</p>{(publishError || live.error) && <p role="alert">{publishError || live.error}</p>}<div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>取消</button><button type="submit" disabled={live.busy || !permitted || !activityBuilding} className="v2-button v2-button-primary">发布活动</button></div></form></Modal>}
    {activityPickerOpen && <CampusBuildingPicker onClose={() => setActivityPickerOpen(false)} onPick={(building) => { setActivityBuilding(building); setActivityPickerOpen(false) }}/>}
  </div>
}

export { V2Community } from './V2Community'

export function V2Partners() {
  const live = useWorkspaceBackend()
  const studentName = live.data?.account.id ?? ''
  const personName = (id: string) => displayPerson(live.data, id).name
  const entities = live.data?.entities ?? []
  const state = {applications: entities.filter(e => e.kind === 'roomApplication' && e.ownerId === studentName).sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(e => ({roomId: e.data.roomId, status: String(e.data.status)})), savedRooms: live.data?.relations.filter(r => r.kind === 'save').map(r => r.entityId) ?? []}
  const location = useLocation()
  const navigate = useNavigate()
  const [type, setType] = useState<'all' | RoomType>('all')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyPartnerFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const updateFilter = (key: keyof PartnerFilters, value: string) => setFilters(current => ({...current, [key]: value}))
  const [selected, setSelected] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<RoomType>('study')
  const [locationScope, setLocationScope] = useState<'unset' | 'campus' | 'outside'>('unset')
  const [outsideAddress, setOutsideAddress] = useState('')
  const [fromPlace, setFromPlace] = useState('')
  const [destinationPlace, setDestinationPlace] = useState('')
  const [studyPlace, setStudyPlace] = useState('')
  const [locationChoice, setLocationChoice] = useState<PartnerPlace | null>(null)
  const [departureChoice, setDepartureChoice] = useState<PartnerPlace | null>(null)
  const [destinationChoice, setDestinationChoice] = useState<PartnerPlace | null>(null)
  const [createError, setCreateError] = useState('')
  const roomSearch = usePartnerRooms({ ...filters, type, query }, selected ?? new URLSearchParams(location.search).get('item'))
  const rooms = roomSearch.rooms
  const current = rooms.find((room) => room.id === (selected ?? new URLSearchParams(location.search).get('item'))) ?? roomSearch.detail
  const application = current && state.applications.find((item) => item.roomId === current.id && item.status === 'pending')
  const chooseCreateType = (next: RoomType) => { setCreateType(next); setLocationScope('unset'); setOutsideAddress(''); setFromPlace(''); setDestinationPlace(''); setStudyPlace(''); setLocationChoice(null); setDepartureChoice(null); setDestinationChoice(null); setCreateError('') }
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (key: string) => String(data.get(key) ?? '').trim()
    const capacity = Math.max(2, Number(get('capacity')) || 4)
    let title = get('title')
    let body = get('body')
    let time = get('time')
    let place = get('place')
    let details: PartnerDetails = {}
    setCreateError('')
    if (createType === 'carpool') {
      const from = get('from'), destination = get('destination')
      if (!from || !destination || !time) return
      title = `${from} → ${destination} 拼车`
      place = from
      body = [`目的地：${destination}`, get('vehicle') && `车型：${get('vehicle')}`, get('cost') && `人均费用：¥${get('cost')}`, get('preference') && `同行偏好：${get('preference')}`, body].filter(Boolean).join(' · ')
      details = {startsAt: time, departurePlace: from, destinationPlace: destination, ...(departureChoice?.address ? {departureAddress: departureChoice.address} : {}), ...(destinationChoice?.address ? {destinationAddress: destinationChoice.address} : {}), ...(departureChoice?.coordinates ? {departureCoordinates: departureChoice.coordinates} : {}), ...(destinationChoice?.coordinates ? {destinationCoordinates: destinationChoice.coordinates} : {})}
      time = formatWhen(time)
    } else if (createType === 'entertainment') {
      if (!title || !time) return
      details = {startsAt: time, activityType: get('eventType'), locationScope: locationScope === 'unset' ? undefined : locationScope, ...(locationChoice?.address ? {placeAddress: locationChoice.address} : {}), ...(locationChoice?.coordinates ? {coordinates: locationChoice.coordinates} : {})}
      time = formatWhen(time)
      if (locationScope === 'campus') { place = outsideAddress.trim(); if (!place) return }
      else if (locationScope === 'outside') { place = outsideAddress.trim(); if (!place) return }
      else return
      body = [get('eventType') && `类型：${get('eventType')}`, get('tag') && `标签：${get('tag')}`, body].filter(Boolean).join(' · ')
    } else if (createType === 'study') {
      const courseCode = get('courseCode'), courseName = get('courseName')
      if (!courseCode || !courseName || !get('goal')) return
      title = `${courseCode.toUpperCase()} · ${courseName} 组队`
      time = get('time') || '时间待商定'
      place = studyPlace.trim() || '校园 / 线上协商'
      const min = get('gpaMin'), max = get('gpaMax')
      if (Boolean(min) !== Boolean(max) || min && max && Number(min) > Number(max)) { setCreateError('请同时填写绩点区间的上下限，且下限不能高于上限。'); return }
      details = { ...(min ? {gpaMin: Number(min)} : {}), ...(max ? {gpaMax: Number(max)} : {}), ...(locationChoice?.address ? {placeAddress: locationChoice.address} : {}), ...(locationChoice?.coordinates ? {coordinates: locationChoice.coordinates} : {}) }
      body = [get('goal'), (min || max) && `期望绩点：${min || '不限'}–${max || '不限'}`, get('grade') && `年级：${get('grade')}`, get('major') && `专业偏好：${get('major')}`, get('role') && `需要：${get('role')}`, body].filter(Boolean).join(' · ')
    } else {
      const sportType = get('sportType')
      if (!sportType || !time || locationScope === 'unset' || !outsideAddress.trim()) { setCreateError('请填写运动种类、时间和集合地点。'); return }
      title = get('title') || `${sportType}运动搭子`
      place = outsideAddress.trim()
      details = {startsAt: time, sportType, locationScope, extraCost: get('extraCost') === 'yes', costDescription: get('extraCost') === 'yes' ? get('costDescription') : undefined, genderPreference: get('genderPreference') as PartnerDetails['genderPreference'], ...(locationChoice?.address ? {placeAddress: locationChoice.address} : {}), ...(locationChoice?.coordinates ? {coordinates: locationChoice.coordinates} : {})}
      if (details.extraCost && !details.costDescription) { setCreateError('请说明额外支出项目和预计金额或范围。'); return }
      body = [`${sportType} · ${locationScope === 'campus' ? '校内' : '校外'}`, details.extraCost ? `额外支出：${details.costDescription}` : '无额外支出', `性别偏好：${get('genderPreference') === 'male' ? '男优先' : get('genderPreference') === 'female' ? '女优先' : '不限'}`, body].filter(Boolean).join(' · ')
      time = formatWhen(time)
    }
    if (!await live.mutate('room.create', {type: createType, title, body, time, place, capacity, details})) return
    setCreateOpen(false)
    setLocationScope('unset'); setOutsideAddress(''); setFromPlace(''); setDestinationPlace(''); setStudyPlace(''); setLocationChoice(null); setDepartureChoice(null); setDestinationChoice(null)
    navigate('/v2/partners/teams')
  }
  const apply = (room: Room) => live.mutate('room.apply', {id: room.id})
  const toggleSaved = (id: string) => live.mutate('relation.set', {id, kind: 'save', enabled: !state.savedRooms.includes(id)})
  return <div className="v2-page"><PageHeading eyebrow="FIND YOUR PEOPLE" title="找搭子" description="从一次拼车、一场球赛或一段共同学习开始。" action={<div className="v2-partner-heading-actions"><Link to="/v2/partners/teams" className="v2-button v2-button-secondary"><UsersRound size={17}/> 管理组队</Link><button type="button" className="v2-button v2-button-primary" onClick={() => setCreateOpen(true)}><Plus size={17}/> 发起组队</button></div>}/>
    {live.error && <p role="alert" className="v2-info-box">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取队伍…</p>}
    <section className="v2-panel v2-partner-filter-panel"><button type="button" className="v2-partner-filter-toggle" onClick={() => setFilterOpen(open => !open)} aria-expanded={filterOpen}><SlidersHorizontal size={17}/> 筛选条件 <span>{filterOpen ? '收起' : '展开'}</span></button>{filterOpen && <div className="v2-partner-filter-grid">
      <PartnerLocationField label="地点名称或地址" value={filters.location} onChange={value => updateFilter('location', value)} map placeholder="输入地点片段，搜索队伍地点"/>
      {(type === 'all' || type === 'carpool') && <><PartnerLocationField label="拼车出发地" value={filters.departureLocation} onChange={value => updateFilter('departureLocation', value)} placeholder="按出发地点或地址筛选"/><PartnerLocationField label="拼车目的地" value={filters.destinationLocation} onChange={value => updateFilter('destinationLocation', value)} placeholder="按目的地点或地址筛选"/></>}
      <label>最早时间<input type="datetime-local" value={filters.timeFrom} onChange={event => updateFilter('timeFrom', event.target.value)}/></label><label>最晚时间<input type="datetime-local" value={filters.timeTo} onChange={event => updateFilter('timeTo', event.target.value)}/></label>
      {(type === 'all' || type === 'entertainment') && <label>娱乐活动<select value={filters.activityType} onChange={event => updateFilter('activityType', event.target.value)}><option value="">不限</option>{['电影', '演唱会', '桌游', '运动', '其他'].map(item => <option key={item}>{item}</option>)}</select></label>}
      {(type === 'all' || type === 'study') && <><label>期望绩点下限<input type="number" min="0" step="0.01" value={filters.gpaMin} onChange={event => updateFilter('gpaMin', event.target.value)} placeholder="不限"/></label><label>期望绩点上限<input type="number" min="0" step="0.01" value={filters.gpaMax} onChange={event => updateFilter('gpaMax', event.target.value)} placeholder="不限"/></label></>}
      {(type === 'all' || type === 'sport') && <><label>运动种类<select value={filters.sportType} onChange={event => updateFilter('sportType', event.target.value)}><option value="">不限</option>{['羽毛球', '篮球', '足球', '网球', '跑步', '游泳', '健身', '其他'].map(item => <option key={item}>{item}</option>)}</select></label><label>校内／校外<select value={filters.locationScope} onChange={event => updateFilter('locationScope', event.target.value)}><option value="">不限</option><option value="campus">校内</option><option value="outside">校外</option></select></label><label>额外支出<select value={filters.extraCost} onChange={event => updateFilter('extraCost', event.target.value)}><option value="">不限</option><option value="yes">有</option><option value="no">无</option></select></label><label>性别偏好<select value={filters.genderPreference} onChange={event => updateFilter('genderPreference', event.target.value)}><option value="">不限筛选</option><option value="any">不限</option><option value="male">男优先</option><option value="female">女优先</option></select></label></>}
      <button type="button" className="v2-button v2-button-secondary" onClick={() => {setFilters(emptyPartnerFilters);setQuery('');setType('all')}}>清除全部筛选</button>
    </div>}</section>
    <section className="v2-panel v2-list-panel"><SectionHeading title="搭子大厅" detail={`${roomSearch.hasMore ? "已加载 " : ""}${rooms.length} 个正在招募的队伍`} /><div className="v2-toolbar"><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索队伍、地点或关键词"/></div><div className="v2-filter-pills">{([['all', '全部'], ['carpool', '拼车'], ['entertainment', '娱乐'], ['study', '学习'], ['sport', '运动']] as const).map(([key, label]) => <button type="button" key={key} className={type === key ? 'is-active' : ''} onClick={() => {setType(key);setFilters(emptyPartnerFilters)}}>{label}</button>)}</div>{rooms.length ? <div key={`${query}|${type}`} className="v2-room-grid v2-filtered-list">{rooms.map((room, index) => <article className="v2-room-card" key={room.id} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}><div className="v2-room-card-top"><span className={`v2-room-type v2-room-${room.type}`}>{roomTypeName[room.type]}</span><button type="button" aria-label={state.savedRooms.includes(room.id) ? '取消收藏' : '收藏队伍'} onClick={() => toggleSaved(room.id)}><Bookmark size={17} fill={state.savedRooms.includes(room.id) ? 'currentColor' : 'none'}/></button></div><button type="button" className="v2-room-open" onClick={() => setSelected(room.id)}><h3>{room.title}</h3><p>{room.body}</p></button><div className="v2-room-facts"><span><Clock3 size={14}/>{room.time}</span><span><MapPin size={14}/>{room.place}</span><span><UsersRound size={14}/>{room.memberCount}/{room.capacity} 人</span></div><button type="button" className="v2-room-footer" onClick={() => setSelected(room.id)}><span>{room.owner === studentName ? '我发起的队伍' : `${personName(room.owner)} 发起`}</span><strong>查看详情 <ArrowRight size={15}/></strong></button></article>)}</div> : <div className="v2-filter-empty"><Empty icon={UsersRound} title={(query || type !== 'all' || Object.values(filters).some(Boolean)) ? '没有匹配的队伍' : '暂无招募中的队伍'} description={(query || type !== 'all' || Object.values(filters).some(Boolean)) ? '试试其他关键词或分类。' : '你可以发起自己的组队。'}/>{(query || type !== 'all' || Object.values(filters).some(Boolean)) && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setQuery(''); setType('all'); setFilters(emptyPartnerFilters) }}>清除筛选</button>}</div>}{roomSearch.error && <p role="alert">{roomSearch.error}</p>}{roomSearch.loading && !rooms.length && <p role="status">正在筛选队伍…</p>}{roomSearch.hasMore && <button type="button" className="v2-button v2-button-secondary" disabled={roomSearch.loading} onClick={roomSearch.loadMore}>加载更多队伍</button>}</section>
    {current && <Drawer title={current.title} eyebrow={`${roomTypeName[current.type]} · ${personName(current.owner)} 发起`} onClose={() => { setSelected(null); if (location.search) navigate('/v2/partners', { replace: true }) }}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.memberCount} / {current.capacity} 人</span></div><SectionHeading title="已加入成员"/><div className="v2-member-list">{current.members.map((id) => <span key={id} className="v2-member-chip"><DisplayAvatar className="v2-member-avatar" name={personName(id)} avatar={displayPerson(live.data, id).avatar} personId={id}/> · {personName(id)}</span>)}</div><div className="v2-detail-actions">{current.owner === studentName ? <Link to="/v2/partners/teams" className="v2-button v2-button-primary">管理申请 <ArrowRight size={16}/></Link> : current.members.includes(studentName) ? <Link to={`/v2/messages?conversation=${encodeURIComponent(current.id)}`} className="v2-button v2-button-primary">进入队伍消息 <ArrowRight size={16}/></Link> : application ? <span className="v2-status-chip is-pending">{application.status === 'pending' ? '申请待处理' : application.status === 'approved' ? '申请已通过' : '申请未通过'}</span> : current.memberCount >= current.capacity ? <span className="v2-status-chip">队伍已满</span> : <button type="button" className="v2-button v2-button-primary" onClick={() => apply(current)}>申请加入 <ArrowRight size={16}/></button>}</div></Drawer>}
    {createOpen && <Modal title="发起组队" onClose={() => setCreateOpen(false)}><form className={`v2-form v2-partner-form type-${createType}`} onSubmit={create}>
      {(live.error || createError) && <p role="alert">{live.error || createError}</p>}
      <div className="v2-partner-type-picker">
        <button type="button" className={createType === 'carpool' ? 'is-active' : ''} onClick={() => chooseCreateType('carpool')}><CarFront size={19}/><strong>拼车</strong><small>同路出发</small></button>
        <button type="button" className={createType === 'entertainment' ? 'is-active' : ''} onClick={() => chooseCreateType('entertainment')}><Clapperboard size={19}/><strong>娱乐</strong><small>一起体验</small></button>
        <button type="button" className={createType === 'study' ? 'is-active' : ''} onClick={() => chooseCreateType('study')}><BookOpen size={19}/><strong>课程组队</strong><small>一起完成</small></button>
        <button type="button" className={createType === 'sport' ? 'is-active' : ''} onClick={() => chooseCreateType('sport')}><Dumbbell size={19}/><strong>运动</strong><small>一起锻炼</small></button>
      </div>
      <div className="v2-partner-form-intro"><strong>{createType === 'carpool' ? '发布一段同行路线' : createType === 'entertainment' ? '发起一次共同体验' : createType === 'sport' ? '一起运动' : '寻找课程项目队友'}</strong><span>{createType === 'carpool' ? '让同路的同学看清路线、时间和费用。' : createType === 'entertainment' ? '说清活动类型、时间和想一起做的事。' : createType === 'sport' ? '说明项目、地点和可能的支出。' : '按课程编号和项目目标找到合适的伙伴。'}</span></div>
      <div key={createType} className="v2-partner-specific-fields">
        {createType === 'carpool' && <><div className="v2-form-two"><PartnerScopedLocationField label="出发地" name="from" value={fromPlace} onChange={setFromPlace} onSelect={setDepartureChoice} required placeholder="例如：珠海站"/><PartnerScopedLocationField label="目的地" name="destination" value={destinationPlace} onChange={setDestinationPlace} onSelect={setDestinationChoice} required placeholder="例如：珠海站"/></div><label>出发时间<input name="time" type="datetime-local" required/></label><div className="v2-form-two"><label>车型<select name="vehicle"><option>不限</option><option>网约车</option><option>出租车</option><option>自驾</option></select></label><label>总人数<input name="capacity" type="number" min={2} max={8} defaultValue={4}/></label></div><div className="v2-form-two"><label>预计人均费用<input name="cost" type="number" min={0} placeholder="元，可留空"/></label><label>同行偏好<select name="preference"><option>不限</option><option>安静出行</option><option>可交流</option></select></label></div><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="行李、途经点或集合方式"/></label></>}
        {createType === 'entertainment' && <><label>活动类型<select name="eventType"><option>电影</option><option>演唱会</option><option>桌游</option><option>运动</option><option>其他</option></select></label><label>一句话描述<input name="title" required maxLength={80} placeholder="例如：周末一起看场电影"/></label><div className="v2-form-two"><label className="v2-time-field"><span>活动时间</span><input name="time" type="datetime-local" required/><small><Clock3 size={13}/> 选择日期与具体时间</small></label><label>人数<input name="capacity" type="number" min={2} max={30} defaultValue={4}/></label></div><div className="v2-location-choice"><strong>活动地点</strong><div><button type="button" className={locationScope === 'campus' ? 'is-active' : ''} onClick={() => { setLocationScope('campus'); setOutsideAddress(''); setLocationChoice(null) }}><MapPin size={16}/> 校内</button><button type="button" className={locationScope === 'outside' ? 'is-active' : ''} onClick={() => { setLocationScope('outside'); setOutsideAddress(''); setLocationChoice(null) }}><MapPin size={16}/> 校外</button></div>{locationScope !== 'unset' && <PartnerScopedLocationField label="集合地点" value={outsideAddress} onChange={setOutsideAddress} onSelect={setLocationChoice} required scope={locationScope === "campus" ? "campus" : "outside"} placeholder="搜索校外地点或填写具体集合点"/>}</div><label>标签<input name="tag" placeholder="例如：轻松、第一次也欢迎"/></label><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="门票、费用或需要准备什么"/></label></>}
        {createType === 'study' && <><div className="v2-form-two"><label>课程编号<input name="courseCode" required maxLength={20} placeholder="例如：COMP1021"/></label><label>课程名称<input name="courseName" required maxLength={70} placeholder="例如：计算机科学导论"/></label></div><label>项目目标<input name="goal" required maxLength={120} placeholder="例如：完成课程期末 Web 项目"/></label><div className="v2-form-two"><label>队伍总人数<input name="capacity" type="number" min={2} max={20} defaultValue={4}/></label><label>预计讨论时间<input name="time" placeholder="例如：每周三晚"/></label></div><PartnerScopedLocationField label="讨论地点（可选）" value={studyPlace} onChange={setStudyPlace} onSelect={setLocationChoice} placeholder="搜索校外地点或填线上协商"/><div className="v2-form-two"><label>期望绩点下限<input name="gpaMin" type="number" min={0} step="0.01" placeholder="可留空"/></label><label>期望绩点上限<input name="gpaMax" type="number" min={0} step="0.01" placeholder="可留空"/></label><label>年级要求<select name="grade"><option>不限</option><option>大一</option><option>大二</option><option>大三</option><option>大四</option></select></label></div><label>专业或学院偏好<input name="major" placeholder="例如：计算机相关优先"/></label><label>能力或角色要求<input name="role" placeholder="例如：前端、设计、研究"/></label><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="协作方式和每周节奏"/></label></>}
        {createType === 'sport' && <><label>运动种类<select name="sportType" required>{['羽毛球', '篮球', '足球', '网球', '跑步', '游泳', '健身', '其他'].map(item => <option key={item}>{item}</option>)}</select></label><label>队伍名称<input name="title" maxLength={80} placeholder="例如：周末羽毛球搭子"/></label><div className="v2-form-two"><label>约定时间<input name="time" type="datetime-local" required/></label><label>人数<input name="capacity" type="number" min={2} max={30} defaultValue={4}/></label></div><div className="v2-location-choice"><strong>运动地点</strong><div><button type="button" className={locationScope === 'campus' ? 'is-active' : ''} onClick={() => { setLocationScope('campus'); setOutsideAddress(''); setLocationChoice(null) }}>校内</button><button type="button" className={locationScope === 'outside' ? 'is-active' : ''} onClick={() => { setLocationScope('outside'); setOutsideAddress(''); setLocationChoice(null) }}>校外</button></div>{locationScope !== 'unset' && <PartnerScopedLocationField label="集合地点" value={outsideAddress} onChange={setOutsideAddress} onSelect={setLocationChoice} required scope={locationScope === "campus" ? "campus" : "outside"} placeholder="搜索校外地点或写明集合点"/>}</div><div className="v2-form-two"><label>是否有额外支出<select name="extraCost"><option value="no">没有</option><option value="yes">有</option></select></label><label>性别偏好<select name="genderPreference"><option value="any">不限</option><option value="male">男优先</option><option value="female">女优先</option></select></label></div><label>额外支出说明<input name="costDescription" maxLength={120} placeholder="若有，请填写项目和预计金额或范围"/></label><label>补充说明<textarea name="body" rows={3} maxLength={500} placeholder="适合水平、装备或集合方式"/></label><small>性别偏好只供参考，不影响任何学生申请。</small></>}
      </div>
      <p className="v2-form-note">发布后，其他人可以申请加入；申请会出现在“管理组队”。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>取消</button><button type="submit" className="v2-button v2-button-primary" disabled={live.busy || (createType === 'entertainment' || createType === 'sport') && (locationScope === 'unset' || !outsideAddress.trim())}>发布{roomTypeName[createType]}队伍</button></div>
    </form></Modal>}
  </div>
}

export { V2Teams } from './V2Teams'

export { V2Messages } from './V2Messages'
