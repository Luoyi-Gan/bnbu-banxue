import {motion} from 'motion/react'
import {useDevicePreferences} from './devicePreferences'
import {PartnerFeedCard} from './PartnerFeedCard'
import {PartnerCreateOptions} from './PartnerCreateOptions'
import {StudentUtilityPanel} from './StudentUtilityPanel'
import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { ArrowRight, BookOpen, CalendarDays, CarFront, ChevronRight, Clapperboard, Clock3, Dumbbell, MapPin, Plus, Search, SlidersHorizontal, UsersRound, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import FlexCarousel from '../components/reactbits/FlexCarousel/FlexCarousel'
import { ActivityDiscovery, ActivityReactions } from './ActivityDiscovery'
import { DiscoveryDetail, DetailPhoto } from './DiscoveryDetail'
import {detailTimeRange} from './detailPresentation'
import {CampusLocationLink} from './CampusLocationLink'
import { CampusMap } from './CampusMap'
import { CampusBuildingPicker } from './V2CampusExplorer'
import type { CampusBuilding } from './campusLocations'
import { roomTypeName, type Room, type RoomType } from '../../shared/v2/model'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Drawer, Empty, Modal, PageHeading, SectionHeading, type CardOrigin } from './ui'
import { AnimatedSearchField } from './AnimatedSearchField'
import { filterActivityItems, type ActivityPeriod, type ActivitySort, type ActivityStatus } from './activityFilters'
import { liveActivities } from './liveActivities'
import campusHomeImage from '../assets/campus/home-background.jpg'
import campusServicesImage from '../assets/campus/campus-services.jpg'
import campusSunsetImage from '../assets/campus/evening-campus.jpg'
import { DisplayAvatar } from './DisplayAvatar'
import { displayPerson } from './displayPerson'
import { PartnerLocationField, type PartnerPlace } from './PartnerLocationField'
import { PartnerScopedLocationField } from './PartnerScopedLocationField'
import { emptyPartnerFilters, type PartnerDetails, type PartnerFilters } from './partnerFilters'
import { usePartnerRooms } from './usePartnerRooms'
import { useCommunityBackend } from './useCommunityBackend'
import { CampusOrganizations } from './CampusOrganizations'
import { DiscoverCommunity } from './DiscoverCommunity'
import { DiscoverHotList } from './DiscoverHotList'
import './partnerFilters.css'

const formatWhen = (value: string) => new Intl.DateTimeFormat(uiLocale(), { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
export { CampusReferenceHome as V2Home } from './CampusReferenceHome'

export function V2Activities() { useUiLanguage();
  const live = useWorkspaceBackend()
  const actorId = live.data?.account.id ?? ''
  const state = {role: live.data?.account.roles.includes('student') ? 'student' : '', participatingActivities: live.data?.relations.filter(r => r.kind === 'participate').map(r => r.entityId) ?? []}
  const owns = (item: {ownerId?: string}) => item.ownerId === actorId
  const routeLocation = useLocation()
  const managing = new URLSearchParams(routeLocation.search).get('view') === 'manage'
  const activityBase = state.role === 'teacher' ? '/v2/teacher/activities' : '/v2/activities'
  const { id } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const [category, setCategory] = useState('全部')
  const [period, setPeriod] = useState<ActivityPeriod>('全部时间')
  const [hostFilter, setHostFilter] = useState('全部主办方')
  const [statusFilter, setStatusFilter] = useState<ActivityStatus>('全部状态')
  const [sort, setSort] = useState<ActivitySort>('推荐顺序')
  const [filterOpen, setFilterOpen] = useState(false)
  const [section, setSection] = useState<'activities' | 'organizations' | 'community' | 'alumni'>('activities')
  const [organizationCategory, setOrganizationCategory] = useState('全部')
  const [communityBoard, setCommunityBoard] = useState('全部')
  const [communitySort, setCommunitySort] = useState<'recommended' | 'newest'>('recommended')
  const [alumniYear, setAlumniYear] = useState('全部')
  const community = useCommunityBackend({board: section === 'community' ? communityBoard : '全部', query: section === 'community' ? query : '', sort: section === 'community' ? communitySort : 'recommended'})
  const [createOpen, setCreateOpen] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [activityBuilding, setActivityBuilding] = useState<CampusBuilding | null>(null)
  const [activityPickerOpen, setActivityPickerOpen] = useState(false)
  const [detailMapOpen,setDetailMapOpen]=useState(false)
  const permitted = live.data?.account.roles.includes('student') && live.data.entities.some(e => e.kind === 'certification' && e.ownerId === actorId && e.data.kind === 'club' && e.data.status === 'approved')
  const [featured, setFeatured] = useState(0)
  const all = useMemo(() => liveActivities(live.data), [live.data])
  const categories = ['全部', ...new Set(all.map((event) => event.category))]
  const organizationCategories = ['全部', ...new Set((live.data?.entities ?? []).filter(item => item.kind === 'organization' && item.data.status === 'approved' && item.data.visibility === 'visible').map(item => String(item.data.category ?? '')))]
  const alumniYears = ['全部', ...new Set((live.data?.alumni.profiles ?? []).filter(item => item.status === 'approved').map(item => String(item.graduationYear)))]
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
  const scene = {
    activities: {image: campusHomeImage, eyebrow: 'DISCOVER / 01', title: '在活动中，遇见新的可能。', description: '走进讲座、比赛和校园活动，找到下一次值得参与的相遇。'},
    organizations: {image: campusServicesImage, eyebrow: 'DISCOVER / 02', title: '和有共同兴趣的人一起出发。', description: '发现社团组织，了解他们正在做的事，加入喜欢的校园生活。'},
    community: {image: campusHomeImage, eyebrow: 'DISCOVER / 03', title: '听见校园里的真实声音。', description: '阅读同学们的故事与提问，分享此刻的想法。'},
    alumni: {image: campusSunsetImage, eyebrow: 'DISCOVER / 04', title: '从这里，走向更远的地方。', description: '看看校友的经历，让未来的方向更清晰。'},
  }[section]
  const searchPlaceholder = {activities: '搜索活动、地点或主办方', organizations: '搜索组织、类别或关键词', community: '搜索帖子', alumni: '搜索校友、专业或经历'}[section]
  const filterCount = section === 'activities' ? activeFilters.length - Number(Boolean(query.trim())) : section === 'organizations' ? Number(organizationCategory !== '全部') : section === 'community' ? Number(communityBoard !== '全部') + Number(communitySort !== 'recommended') : Number(alumniYear !== '全部')
  const create = async (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault()
    const data = new FormData(form.currentTarget)
    const location = activityBuilding ? [activityBuilding.name, String(data.get('locationDetail') ?? '').trim()].filter(Boolean).join(' · ') : ''
    if (!location) { setPublishError('请先从地图选择活动楼栋'); return }
    if (await live.mutate('activity.create', {title: String(data.get('title') ?? ''), description: String(data.get('description') ?? ''), startAt: new Date(String(data.get('date'))).toISOString(), location, capacity: Number(data.get('capacity'))})) {setCreateOpen(false); setActivityBuilding(null); setPublishError('')}
  }
  const changeVisibility = (eventId: string) => live.mutate('activity.visibility', {id: eventId, publish: all.find(e => e.id === eventId)?.local?.status !== 'published'})
  if (id && !active) return <div className="v2-page"><PageHeading back={routeLocation.state?.from ?? activityBase} backLabel="返回活动" eyebrow="ACTIVITY" title={uiText("活动详情")}/>{live.error?<p role="alert">{uiText(live.error)}</p>:!live.data?<p role="status">{uiText("正在读取活动…")}</p>:<Empty icon={CalendarDays} title={uiText("活动已停止公开或暂不可用")} description={uiText("请返回查看其他校园活动。")}/>}</div>
  return <div className="v2-page v2-activities">{!id&&<><header className="v2-discover-top"><div><span className="v2-eyebrow">DISCOVER / CAMPUS</span><h1>{uiText(managing?"活动管理":"发现")}</h1>{managing?<Link className="v2-text-button" to="/v2/activities">{uiText("返回发现")}</Link>:<p>{uiText("活动与校园故事，从这里开始。")}</p>}</div><div className="v2-toolbar v2-activity-toolbar">{managing&&permitted&&<button className="v2-button v2-button-primary" type="button" onClick={()=>setCreateOpen(true)}><Plus size={17}/>{uiText("发起校园活动")}</button>}<label className="v2-discover-search"><Search size={18}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder}/></label><button type="button" className={`v2-activity-filter-toggle${filterOpen ? ' is-open' : ''}`} aria-expanded={filterOpen} aria-controls="v2-discover-filter-popover" onClick={() => setFilterOpen(value => !value)}><SlidersHorizontal size={17}/> {uiText("筛选")}{filterCount > 0 && <b>{filterCount}</b>}</button>
      {filterOpen && <div id="v2-discover-filter-popover" className="v2-discover-filter-popover" role="group" aria-label={uiTemplate(["","筛选条件"],uiText(section === 'activities' ? '活动' : section === 'organizations' ? '社团组织' : section === 'community' ? '校园社区' : '校友'))}>
        {section === 'activities' && <div className="v2-activity-filter-grid"><fieldset><legend>{uiText("活动分类")}</legend><div className="v2-activity-filter-options">{categories.map(item => <button type="button" key={item} className={category === item?'is-active':''} onClick={() => setCategory(item)}>{item}</button>)}</div></fieldset><fieldset><legend>{uiText("活动时间")}</legend><div className="v2-activity-filter-options">{(['全部时间', '今天', '本周', '下周'] as ActivityPeriod[]).map(item => <button type="button" key={item} className={period === item?'is-active':''} onClick={() => setPeriod(item)}>{item}</button>)}</div></fieldset><fieldset><legend>{uiText("活动状态")}</legend><div className="v2-activity-filter-options">{(['全部状态', '未结束', '我主办'] as ActivityStatus[]).map(item => <button type="button" key={item} className={statusFilter === item?'is-active':''} onClick={() => setStatusFilter(item)}>{item}</button>)}</div></fieldset><label>{uiText("主办方")}<select value={hostFilter} onChange={event => setHostFilter(event.target.value)}>{hostsList.map(item => <option value={item} key={item}>{item}</option>)}</select></label><label>{uiText("排序")}<select value={sort} onChange={event => setSort(event.target.value as ActivitySort)}>{(['推荐顺序', '时间最近'] as ActivitySort[]).map(item => <option value={item} key={item}>{item}</option>)}</select></label><button type="button" className="v2-discover-filter-reset" onClick={resetFilters}>{uiText("重置活动筛选")}</button></div>}
        {section === 'organizations' && <fieldset><legend>{uiText("组织分类")}</legend><div className="v2-activity-filter-options">{organizationCategories.map(item => <button type="button" key={item} className={organizationCategory === item?'is-active':''} onClick={() => setOrganizationCategory(item)}>{item}</button>)}</div></fieldset>}
        {section === 'community' && <><fieldset><legend>{uiText("社区话题")}</legend><div className="v2-activity-filter-options">{['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业'].map(item => <button type="button" key={item} className={communityBoard === item?'is-active':''} onClick={() => setCommunityBoard(item)}>{item}</button>)}</div></fieldset><label>{uiText("排序")}<select value={communitySort} onChange={event => setCommunitySort(event.target.value as 'recommended' | 'newest')}><option value="recommended">{uiText("个人推荐")}</option><option value="newest">{uiText("最新发布")}</option></select></label></>}
        {section === 'alumni' && <fieldset><legend>{uiText("毕业年份")}</legend><div className="v2-activity-filter-options">{alumniYears.map(item => <button type="button" key={item} className={alumniYear === item?'is-active':''} onClick={() => setAlumniYear(item)}>{item}</button>)}</div></fieldset>}
      </div>}</div></header>
    {live.error && <p role="alert">{uiText(live.error)}</p>}{!live.data && !live.error && <p role="status">{uiText("正在读取活动…")}</p>}
    {!managing&&<section className="v2-editorial-discover-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(16,30,27,.68),rgba(16,30,27,.08)),url(${scene.image})`}}><span>{scene.eyebrow}</span><strong>{scene.title}</strong><small>{scene.description}</small></section>}
    {!managing&&<nav className="v2-editorial-discover-links" aria-label={uiText("发现分类")}>{([['activities', '活动'], ['organizations', '社团组织'], ['community', '校园社区'], ['alumni', '校友']] as const).map(([key, label]) => <button type="button" key={key} className={section === key?'is-active':''} aria-current={section === key?'page':undefined} onClick={() => {setSection(key); setQuery(''); setFilterOpen(false)}}>{uiText(label)}</button>)}</nav>}
    <DiscoverHotList community={community}/>
    {!managing && section === 'activities' && featuredItems.length > 0 && <section className="v2-featured-events"><div className="v2-featured-carousel"><FlexCarousel items={featuredItems.map(event => ({src: event.image!, alt: event.isDefaultCover ? `${event.title}（校园通用照片，默认封面）` : event.title, title: event.title, subtitle: `${event.category} · ${formatWhen(event.startAt)}`}))} preset="liquid" intro="rise" fit="natural" cardHeight={0.6} gap={12} radius={16} squeeze={0.2} focusOnClick={false} focusOnHover focusScale={1} captions onChange={setFeatured} onSelect={index => navigate(`${activityBase}/${featuredItems[index].id}`)}/></div>{selectedFeatured && <div className="v2-featured-copy"><span className="v2-eyebrow">{uiText("本周精选 ·")}{uiText(selectedFeatured.category)}</span><h2>{selectedFeatured.title}</h2><p>{selectedFeatured.subtitle}{selectedFeatured.isDefaultCover && ' · 默认封面'}</p><div><span><CalendarDays size={15}/>{formatWhen(selectedFeatured.startAt)}</span><span><MapPin size={15}/>{selectedFeatured.location}</span></div><Link className="v2-button v2-button-light" to={`${activityBase}/${selectedFeatured.id}`}>{uiText("查看活动")}<ArrowRight size={16}/></Link></div>}</section>}
    {section === 'activities' && <section className="v2-panel v2-list-panel v2-activity-discovery-panel">
      <SectionHeading title={uiText("所有活动")} detail={uiTemplate([""," 个结果"],filtered.length)}/>
      {activeFilters.length > 0 && <div className="v2-active-filters" aria-label={uiText("已应用的筛选条件")}>{activeFilters.map((item) => <button type="button" key={item.label} aria-label={uiTemplate(["清除",""],uiText(item.label))} onClick={item.clear}>{uiText(item.label)}<X size={13}/></button>)}<button type="button" className="v2-active-filters-reset" onClick={resetFilters}>{uiText("清除全部")}</button></div>}
      <p className="activity-discovery-note">{uiText("点赞与收藏保存到会同里后台 · 点赞标记反映本人状态")}</p>
      {filtered.length?<ActivityDiscovery live={live} key={JSON.stringify([query, category, period, hostFilter, statusFilter, sort])} items={filtered} basePath={activityBase}/>:<div className="v2-filter-empty"><Empty icon={Search} title={all.length?uiText('没有匹配的活动'):uiText('目前没有可展示的活动')} description={all.length?uiText('试试其他分类或清除搜索条件。'):uiText('有新活动发布后，会显示在这里。')}/>{activeFilters.length > 0 && <button type="button" className="v2-button v2-button-secondary" onClick={resetFilters}>{uiText("清除筛选")}</button>}</div>}</section>}
    {section === 'organizations' && <CampusOrganizations embedded externalQuery={query} externalCategory={organizationCategory}/>}
    {section === 'community' && <DiscoverCommunity community={community}/>}
    {section === 'alumni' && <section className="v2-discover-inline-panel" aria-label={uiText("校友")}><div className="v2-discover-panel-heading"><h2>{uiText("校友同行")}</h2></div><p className="v2-discover-panel-intro">{uiText("从校园里的经历出发，看看学长学姐分享的方向与故事。")}</p><div className="v2-discover-alumni">{(live.data?.alumni.profiles ?? []).filter(item => item.status === 'approved' && (alumniYear === '全部' || String(item.graduationYear) === alumniYear) && `${item.name} ${item.major} ${item.experience}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 4).map(item => <article key={item.id}><strong>{item.name}</strong><small>{item.graduationYear} {uiText("届 ·")}{item.major}</small><p>{item.experience}</p></article>)}</div>{live.data && !(live.data.alumni.profiles ?? []).some(item => item.status === 'approved' && (alumniYear === '全部' || String(item.graduationYear) === alumniYear) && `${item.name} ${item.major} ${item.experience}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) && <p className="v2-discover-panel-intro">{uiText("没有匹配的公开校友资料。")}</p>}</section>}
    </>}
    {active&&<DiscoveryDetail transitionKey={`activity:${active.id}`} title={active.title} onClose={()=>routeLocation.state?.from?navigate(routeLocation.state.from):navigate(activityBase)}
      identity={<div className="note-detail-identity"><span className="note-detail-avatar" aria-hidden="true">{active.host.slice(0,1)}</span><span><strong>{active.host}</strong><small>{uiText('主办方')} · {uiText(active.category)}</small></span></div>}
      media={<DetailPhoto key={active.id} src={active.image} alt={active.isDefaultCover?uiText('校园通用照片，默认封面'):uiTemplate(['','封面'],active.title)} caption={active.isDefaultCover?uiText('校园通用照片，默认封面'):undefined}/>}
      actions={<><ActivityReactions live={live} item={active} showNote={false}/>{state.role==='student'&&<button type="button" className="note-detail-participate" aria-pressed={state.participatingActivities.includes(active.id)} disabled={live.busy||!state.participatingActivities.includes(active.id)&&(active.local?.status==='draft'||Date.parse(active.endAt??active.startAt)<=Date.now())} onClick={()=>void live.mutate('relation.set',{id:active.id,kind:'participate',enabled:!state.participatingActivities.includes(active.id)})}>{state.participatingActivities.includes(active.id)?uiText('取消参与标记'):uiText('标记参与')}</button>}</>}
    >
      <p className="note-detail-source">{uiText(active.subtitle)}</p>
      <dl className="note-detail-facts"><div><CalendarDays size={18}/><dt>{uiText('时间')}</dt><dd>{detailTimeRange(active.startAt,active.local?.endAt)}</dd></div><div><MapPin size={18}/><dt>{uiText('地点')}</dt><dd>{active.location}<CampusLocationLink place={active.location}/></dd></div><div><UsersRound size={18}/><dt>{uiText('人数上限')}</dt><dd>{active.capacity?uiTemplate(['',' 人'],active.capacity):active.local?.mailSourceId?uiText('未提供'):uiText('未限定')}</dd></div></dl>
      <section><h3>{uiText('活动介绍')}</h3><p className="note-detail-prose">{active.description}</p>{active.local?.conditions&&<p>{uiText('参与条件：')}{active.local.conditions}</p>}</section>
      {state.role==='student'&&<p className="note-detail-status">{state.participatingActivities.includes(active.id)?uiText('已保存参与标记。'):uiText('标记不占用活动名额。')}</p>}
      <details className="note-detail-map" onToggle={event=>setDetailMapOpen(event.currentTarget.open)}><summary>{uiText('校园位置')}</summary>{detailMapOpen&&<CampusMap key={active.id} location={active.location}/>}</details>
      {active.local&&owns(active.local)&&<details className="note-detail-manage"><summary>{uiText('管理活动')}</summary><p>{uiText('我主办的活动')}</p><button type="button" disabled={active.local.status==='draft'&&!permitted} onClick={()=>changeVisibility(active.id)}>{active.local.status==='published'?uiText('结束展示'):uiText('重新展示')}</button></details>}
      {(publishError||live.error)&&<p role="alert" className="note-detail-status">{publishError||live.error}</p>}
    </DiscoveryDetail>}
    {createOpen && <Modal title={uiText("发起校园活动")} onClose={() => setCreateOpen(false)}><form className="v2-form" onSubmit={create}><label>{uiText("活动名称")}<input name="title" required maxLength={80} placeholder={uiText("例如：周末摄影漫步")}/></label><label>{uiText("活动介绍")}<textarea name="description" required rows={3} placeholder={uiText("告诉大家会发生什么")}/></label><div className="v2-form-two"><label>{uiText("开始时间")}<input name="date" type="datetime-local" required/></label><label>{uiText("人数上限")}<input name="capacity" type="number" min={1} defaultValue={20}/></label></div><div className="v2-activity-location"><strong>{uiText("活动地点")}</strong><button type="button" className={activityBuilding?'is-selected':''} onClick={() => setActivityPickerOpen(true)}><MapPin size={18}/><span>{activityBuilding?activityBuilding.name:uiText('打开 3D 地图选择楼栋')}</span><ChevronRight size={17}/></button>{activityBuilding && <label>{uiText("详细集合点（可选）")}<input name="locationDetail" maxLength={80} placeholder={uiText("例如：二层 202 室或大门口")}/></label>}</div><p className="v2-form-note">{uiText("仅已认证的学生社团成员可以发起活动。")}</p>{(publishError || live.error) && <p role="alert">{publishError || live.error}</p>}<div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>{uiText("取消")}</button><button type="submit" disabled={live.busy || !permitted || !activityBuilding} className="v2-button v2-button-primary">{uiText("发布活动")}</button></div></form></Modal>}
    {activityPickerOpen && <CampusBuildingPicker onClose={() => setActivityPickerOpen(false)} onPick={(building) => { setActivityBuilding(building); setActivityPickerOpen(false) }}/>}
  </div>
}

export { V2Community } from './V2Community'

export function V2Partners() { useUiLanguage();
  const device=useDevicePreferences()
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
  const [selectedOrigin,setSelectedOrigin]=useState<CardOrigin|null>(null)
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
  const [createAttempted, setCreateAttempted] = useState(false)
  const roomSearch = usePartnerRooms({ ...filters, type, query }, selected ?? new URLSearchParams(location.search).get('item'))
  const rooms = roomSearch.rooms
  const current = rooms.find((room) => room.id === (selected ?? new URLSearchParams(location.search).get('item'))) ?? roomSearch.detail
  const application = current && state.applications.find((item) => item.roomId === current.id && item.status === 'pending')
  const chooseCreateType = (next: RoomType) => { setCreateAttempted(false); setCreateType(next); setLocationScope('unset'); setOutsideAddress(''); setFromPlace(''); setDestinationPlace(''); setStudyPlace(''); setLocationChoice(null); setDepartureChoice(null); setDestinationChoice(null); setCreateError('') }
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateAttempted(true)
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
      if (!courseCode || !get('goal')) return
      title = courseName ? `${courseCode} · ${courseName} 组队` : `${courseCode} 组队`
      if (title.length > 80) { event.currentTarget.querySelector('details')?.setAttribute('open', ''); setCreateError('课程信息过长，请缩短课程名称或编号。'); return }
      time = get('time') || '时间待商定'
      place = studyPlace.trim() || '校园 / 线上协商'
      const min = get('gpaMin'), max = get('gpaMax')
      if (Boolean(min) !== Boolean(max) || min && max && Number(min) > Number(max)) { event.currentTarget.querySelector('details')?.setAttribute('open', ''); setCreateError('请同时填写绩点区间的上下限，且下限不能高于上限。'); return }
      details = { ...(min ? {gpaMin: Number(min)} : {}), ...(max ? {gpaMax: Number(max)} : {}), ...(locationChoice?.address ? {placeAddress: locationChoice.address} : {}), ...(locationChoice?.coordinates ? {coordinates: locationChoice.coordinates} : {}) }
      body = [get('goal'), (min || max) && `期望绩点：${min || '不限'}–${max || '不限'}`, get('grade') && `年级：${get('grade')}`, get('major') && `专业偏好：${get('major')}`, get('role') && `需要：${get('role')}`, body].filter(Boolean).join(' · ')
    } else {
      const sportType = get('sportType')
      if (!sportType || !time || locationScope === 'unset' || !outsideAddress.trim()) { setCreateError('请填写运动种类、时间和集合地点。'); return }
      title = get('title') || `${sportType}运动搭子`
      place = outsideAddress.trim()
      details = {startsAt: time, sportType, locationScope, extraCost: get('extraCost') === 'yes', costDescription: get('extraCost') === 'yes' ? get('costDescription') : undefined, genderPreference: get('genderPreference') as PartnerDetails['genderPreference'], ...(locationChoice?.address ? {placeAddress: locationChoice.address} : {}), ...(locationChoice?.coordinates ? {coordinates: locationChoice.coordinates} : {})}
      if (details.extraCost && !details.costDescription) { event.currentTarget.querySelector('details')?.setAttribute('open', ''); setCreateError('请说明额外支出项目和预计金额或范围。'); return }
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
  return <div className="v2-page partner-discovery"><PageHeading back="/v2/campus" eyebrow="FIND YOUR PEOPLE" title={uiText("找搭子")} description={uiText("从一次拼车、一场球赛或一段共同学习开始。")}/>
    {live.error && <p role="alert" className="v2-info-box">{uiText(live.error)}</p>}{!live.data && !live.error && <p role="status">{uiText("正在读取队伍…")}</p>}
    <div className="partner-feed-intro"><p>{uiText("找到同频的人，一起出发")}</p><Link to="/v2/partners/teams">{uiText("我的组队")}<ChevronRight size={14}/></Link></div><div className="partner-feed-controls"><div className="partner-search-row"><div className="v2-toolbar"><AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText("搜索队伍、地点或关键词")}/></div><button type="button" className="v2-partner-filter-toggle" aria-label={uiText("筛选条件")} onClick={() => setFilterOpen(true)} aria-haspopup="dialog" aria-expanded={filterOpen}><SlidersHorizontal size={17}/>{Object.entries(filters).filter(([key,value])=>key!=='type'&&key!=='query'&&value).length>0&&<b className="partner-filter-count">{Object.entries(filters).filter(([key,value])=>key!=='type'&&key!=='query'&&value).length}</b>}</button></div><div className="v2-filter-pills" aria-label={uiText("搭子分类")}>{([['all', '全部'], ['carpool', '拼车'], ['study', '学习'], ['sport', '运动'], ['entertainment', '娱乐']] as const).map(([key, label]) => <button type="button" key={key} className={type === key?'is-active':''} aria-pressed={type===key} onClick={() => {setType(key);setFilters(emptyPartnerFilters)}}>{type===key&&<motion.span className="partner-category-selection" layoutId="partner-category-selection" aria-hidden="true" transition={{duration:device.reducedMotion?0:.18,ease:"easeOut"}}/>}<span className="partner-category-label">{uiText(label)}</span></button>)}</div></div>
    {filterOpen && <StudentUtilityPanel title={uiText("筛选条件")} onClose={() => setFilterOpen(false)}><div className="partner-filter-sheet"><div className="v2-partner-filter-grid">
      <PartnerLocationField label={uiText("地点")} value={filters.location} onChange={value => updateFilter('location', value)} map placeholder={uiText("地点名称或地址")}/>
      <label>{uiText("最早时间")}<input type="datetime-local" value={filters.timeFrom} onChange={event => updateFilter('timeFrom', event.target.value)}/></label><label>{uiText("最晚时间")}<input type="datetime-local" value={filters.timeTo} onChange={event => updateFilter('timeTo', event.target.value)}/></label>
      {(type === 'all' || type === 'carpool') && <details key={`${type}-carpool`} className="partner-filter-group" open={type!=='all'?true:undefined}><summary>{uiText("拼车")}{[filters.departureLocation,filters.destinationLocation].filter(Boolean).length>0&&<b>{[filters.departureLocation,filters.destinationLocation].filter(Boolean).length}</b>}</summary><div className="partner-filter-group-fields"><PartnerLocationField label={uiText("拼车出发地")} value={filters.departureLocation} onChange={value => updateFilter('departureLocation', value)} placeholder={uiText("按出发地点或地址筛选")}/><PartnerLocationField label={uiText("拼车目的地")} value={filters.destinationLocation} onChange={value => updateFilter('destinationLocation', value)} placeholder={uiText("按目的地点或地址筛选")}/></div></details>}
      {(type === 'all' || type === 'entertainment') && <details key={`${type}-entertainment`} className="partner-filter-group" open={type!=='all'?true:undefined}><summary>{uiText("娱乐")}{[filters.activityType].filter(Boolean).length>0&&<b>{[filters.activityType].filter(Boolean).length}</b>}</summary><div className="partner-filter-group-fields"><label>{uiText("娱乐活动")}<select value={filters.activityType} onChange={event => updateFilter('activityType', event.target.value)}><option value="">{uiText("不限")}</option>{['电影', '演唱会', '桌游', '运动', '其他'].map(item => <option value={item} key={item}>{item}</option>)}</select></label></div></details>}
      {(type === 'all' || type === 'study') && <details key={`${type}-study`} className="partner-filter-group" open={type!=='all'?true:undefined}><summary>{uiText("学习")}{[filters.gpaMin,filters.gpaMax].filter(Boolean).length>0&&<b>{[filters.gpaMin,filters.gpaMax].filter(Boolean).length}</b>}</summary><div className="partner-filter-group-fields"><label>{uiText("期望绩点下限")}<input type="number" min="0" step="0.01" value={filters.gpaMin} onChange={event => updateFilter('gpaMin', event.target.value)} placeholder={uiText("不限")}/></label><label>{uiText("期望绩点上限")}<input type="number" min="0" step="0.01" value={filters.gpaMax} onChange={event => updateFilter('gpaMax', event.target.value)} placeholder={uiText("不限")}/></label></div></details>}
      {(type === 'all' || type === 'sport') && <details key={`${type}-sport`} className="partner-filter-group" open={type!=='all'?true:undefined}><summary>{uiText("运动")}{[filters.sportType,filters.locationScope,filters.extraCost,filters.genderPreference].filter(Boolean).length>0&&<b>{[filters.sportType,filters.locationScope,filters.extraCost,filters.genderPreference].filter(Boolean).length}</b>}</summary><div className="partner-filter-group-fields"><label>{uiText("运动种类")}<select value={filters.sportType} onChange={event => updateFilter('sportType', event.target.value)}><option value="">{uiText("不限")}</option>{['羽毛球', '篮球', '足球', '网球', '跑步', '游泳', '健身', '其他'].map(item => <option value={item} key={item}>{item}</option>)}</select></label><label>{uiText("校内／校外")}<select value={filters.locationScope} onChange={event => updateFilter('locationScope', event.target.value)}><option value="">{uiText("不限")}</option><option value="campus">{uiText("校内")}</option><option value="outside">{uiText("校外")}</option></select></label><label>{uiText("额外支出")}<select value={filters.extraCost} onChange={event => updateFilter('extraCost', event.target.value)}><option value="">{uiText("不限")}</option><option value="yes">{uiText("有")}</option><option value="no">{uiText("无")}</option></select></label><label>{uiText("性别偏好")}<select value={filters.genderPreference} onChange={event => updateFilter('genderPreference', event.target.value)}><option value="">{uiText("不限筛选")}</option><option value="any">{uiText("不限")}</option><option value="male">{uiText("男优先")}</option><option value="female">{uiText("女优先")}</option></select></label></div></details>}
      <button type="button" className="v2-button v2-button-secondary" onClick={() => {setFilters(emptyPartnerFilters);setQuery('');setType('all')}}>{uiText("清除全部筛选")}</button>
    </div><div className="partner-filter-sheet-footer"><button type="button" className="v2-button v2-button-primary" onClick={() => setFilterOpen(false)}>{uiText("查看结果")}</button></div></div></StudentUtilityPanel>}
    <section className="v2-panel v2-list-panel partner-feed-panel"><SectionHeading title={uiText("正在招募")} action={<span className="partner-sort-label">{roomSearch.hasMore?uiText("已加载"):""}{rooms.length} {uiText("支队伍")} · {uiText("最新发布")}</span>}/>{rooms.length?<div key={`${query}|${type}`} className="v2-room-grid v2-filtered-list">{rooms.map(room=><PartnerFeedCard key={room.id} room={room} workspace={live.data} actorId={studentName} saved={state.savedRooms.includes(room.id)} busy={live.busy} pending={state.applications.some(item=>item.roomId===room.id&&item.status==='pending')} onSave={()=>void toggleSaved(room.id)} onOpen={origin=>{setSelectedOrigin(origin);setSelected(room.id)}}/>)}</div>:<div className="v2-filter-empty"><Empty icon={UsersRound} title={(query || type !== 'all' || Object.values(filters).some(Boolean))?uiText('没有匹配的队伍'):uiText('暂无招募中的队伍')} description={(query || type !== 'all' || Object.values(filters).some(Boolean))?uiText('试试其他关键词或分类。'):uiText('你可以发起自己的组队。')}/>{(query || type !== 'all' || Object.values(filters).some(Boolean)) && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setQuery(''); setType('all'); setFilters(emptyPartnerFilters) }}>{uiText("清除筛选")}</button>}</div>}{roomSearch.error && <p role="alert">{roomSearch.error}</p>}{roomSearch.loading && !rooms.length && <p role="status">{uiText("正在筛选队伍…")}</p>}{roomSearch.hasMore && <button type="button" className="v2-button v2-button-secondary" disabled={roomSearch.loading} onClick={roomSearch.loadMore}>{uiText("加载更多队伍")}</button>}</section>
    {current && <Drawer origin={selected?selectedOrigin??undefined:undefined} title={current.title} eyebrow={uiTemplate([""," · "," 发起"],roomTypeName[current.type],personName(current.owner))} onClose={() => { setSelected(null); if (location.search) navigate('/v2/partners', { replace: true }) }}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.memberCount} / {current.capacity} {uiText("人")}</span></div><SectionHeading title={uiText("已加入成员")}/><div className="v2-member-list">{current.members.map((id) => <span key={id} className="v2-member-chip"><DisplayAvatar className="v2-member-avatar" name={personName(id)} avatar={displayPerson(live.data, id).avatar} personId={id}/> · {personName(id)}</span>)}</div><div className="v2-detail-actions">{current.owner === studentName?<Link to="/v2/partners/teams" className="v2-button v2-button-primary">{uiText("管理申请")}<ArrowRight size={16}/></Link>:current.members.includes(studentName)?<Link to={`/v2/messages?conversation=${encodeURIComponent(current.id)}`} className="v2-button v2-button-primary">{uiText("进入队伍消息")}<ArrowRight size={16}/></Link>:application?<span className="v2-status-chip is-pending">{application.status === 'pending'?uiText('申请待处理'):application.status === 'approved'?uiText('申请已通过'):uiText('申请未通过')}</span>:current.memberCount >= current.capacity?<span className="v2-status-chip">{uiText("队伍已满")}</span>:<button type="button" className="v2-button v2-button-primary" onClick={() => apply(current)}>{uiText("申请加入")}<ArrowRight size={16}/></button>}</div></Drawer>}
    {!createOpen&&!current&&!filterOpen&&<button type="button" className="partner-create-fab" onClick={()=>{setCreateAttempted(false);setCreateError('');setCreateOpen(true)}}><Plus size={19}/>{uiText("发起组队")}</button>}
    {createOpen && <StudentUtilityPanel title={uiText("发起组队")} onClose={() => setCreateOpen(false)}><form className={`v2-form v2-partner-form type-${createType}`} onSubmit={create} onInvalidCapture={event=>{const options=event.target instanceof HTMLElement?event.target.closest('details'):null;if(options)options.open=true}}>
      {(createError || createAttempted && live.error) && <p role="alert">{createError || live.error}</p>}
      <div className="v2-partner-type-picker">
        <button type="button" className={createType === 'carpool'?'is-active':''} onClick={() => chooseCreateType('carpool')}><CarFront size={19}/><strong>{uiText("拼车")}</strong></button>
        <button type="button" className={createType === 'entertainment'?'is-active':''} onClick={() => chooseCreateType('entertainment')}><Clapperboard size={19}/><strong>{uiText("娱乐")}</strong></button>
        <button type="button" className={createType === 'study'?'is-active':''} onClick={() => chooseCreateType('study')}><BookOpen size={19}/><strong>{uiText("课程组队")}</strong></button>
        <button type="button" className={createType === 'sport'?'is-active':''} onClick={() => chooseCreateType('sport')}><Dumbbell size={19}/><strong>{uiText("运动")}</strong></button>
      </div>
      <p className="partner-create-hint">{createType === 'study'?uiText('填两项就能发布，其他信息可以一起商量。'):createType === 'carpool'?uiText('选好路线和时间，找同路的伙伴。'):uiText('确定时间和地点，其他偏好按需补充。')}</p>
      <div key={createType} className="v2-partner-specific-fields">
        {createType === 'carpool' && <><div className="v2-form-two"><PartnerScopedLocationField label={uiText("出发地")} name="from" value={fromPlace} onChange={setFromPlace} onSelect={setDepartureChoice} required placeholder={uiText("例如：珠海站")}/><PartnerScopedLocationField label={uiText("目的地")} name="destination" value={destinationPlace} onChange={setDestinationPlace} onSelect={setDestinationChoice} required placeholder={uiText("例如：珠海站")}/></div><label>{uiText("出发时间")}<input name="time" type="datetime-local" required/></label><PartnerCreateOptions hint={uiText("车型、人数、费用与同行偏好") }><div className="v2-form-two"><label>{uiText("车型")}<select name="vehicle"><option value={"不限"}>{uiText("不限")}</option><option value={"网约车"}>{uiText("网约车")}</option><option value={"出租车"}>{uiText("出租车")}</option><option value={"自驾"}>{uiText("自驾")}</option></select></label><label>{uiText("总人数")}<input name="capacity" type="number" min={2} max={8} defaultValue={4}/></label></div><div className="v2-form-two"><label>{uiText("预计人均费用")}<input name="cost" type="number" min={0} placeholder={uiText("元，可留空")}/></label><label>{uiText("同行偏好")}<select name="preference"><option value={"不限"}>{uiText("不限")}</option><option value={"安静出行"}>{uiText("安静出行")}</option><option value={"可交流"}>{uiText("可交流")}</option></select></label></div><label>{uiText("补充说明")}<textarea name="body" rows={3} maxLength={500} placeholder={uiText("行李、途经点或集合方式")}/></label></PartnerCreateOptions></>}
        {createType === 'entertainment' && <><label>{uiText("活动类型")}<select name="eventType"><option value={"电影"}>{uiText("电影")}</option><option value={"演唱会"}>{uiText("演唱会")}</option><option value={"桌游"}>{uiText("桌游")}</option><option value={"运动"}>{uiText("运动")}</option><option value={"其他"}>{uiText("其他")}</option></select></label><label>{uiText("一句话描述")}<input name="title" required maxLength={80} placeholder={uiText("例如：周末一起看场电影")}/></label><div className="v2-form-two"><label className="v2-time-field"><span>{uiText("活动时间")}</span><input name="time" type="datetime-local" required/><small><Clock3 size={13}/> {uiText("选择日期与具体时间")}</small></label></div><div className="v2-location-choice"><strong>{uiText("活动地点")}</strong><div><button type="button" className={locationScope === 'campus'?'is-active':''} onClick={() => { setLocationScope('campus'); setOutsideAddress(''); setLocationChoice(null) }}><MapPin size={16}/> {uiText("校内")}</button><button type="button" className={locationScope === 'outside'?'is-active':''} onClick={() => { setLocationScope('outside'); setOutsideAddress(''); setLocationChoice(null) }}><MapPin size={16}/> {uiText("校外")}</button></div>{locationScope !== 'unset' && <PartnerScopedLocationField label={uiText("集合地点")} value={outsideAddress} onChange={setOutsideAddress} onSelect={setLocationChoice} required scope={locationScope === "campus"?"campus":"outside"} placeholder={uiText("搜索校外地点或填写具体集合点")}/>}</div><PartnerCreateOptions hint={uiText("默认4人，可补充人数、标签与说明")}><label>{uiText("人数")}<input name="capacity" type="number" min={2} max={30} defaultValue={4}/></label><label>{uiText("标签")}<input name="tag" placeholder={uiText("例如：轻松、第一次也欢迎")}/></label><label>{uiText("补充说明")}<textarea name="body" rows={3} maxLength={500} placeholder={uiText("门票、费用或需要准备什么")}/></label></PartnerCreateOptions></>}
        {createType === 'study' && <><label>{uiText("课程名称或编号")}<input name="courseCode" required maxLength={70} placeholder={uiText("例如：COMP1021 或计算机科学导论")}/></label><label>{uiText("想一起完成什么")}<input name="goal" required maxLength={120} placeholder={uiText("例如：找队友一起完成期末项目")}/></label><PartnerCreateOptions hint={uiText("默认4人 · 时间地点待商量 · 成员要求不限")}><label>{uiText("课程名称（可选）")}<input name="courseName" maxLength={70} placeholder={uiText("已填编号时，可补充课程名称")}/></label><div className="v2-form-two"><label>{uiText("队伍总人数")}<input name="capacity" type="number" min={2} max={20} defaultValue={4}/></label><label>{uiText("预计讨论时间")}<input name="time" placeholder={uiText("例如：每周三晚")}/></label></div><div className="partner-study-location"><label>{uiText("讨论地点（可选）")}<input aria-label={uiText("自定义讨论地点")} value={studyPlace} onChange={event=>{setStudyPlace(event.target.value);setLocationChoice(null)}} maxLength={120} placeholder={uiText("自定义地点，如图书馆二楼或线上会议")}/></label><PartnerScopedLocationField label={uiText("讨论地点")} value="" onChange={setStudyPlace} onSelect={setLocationChoice} scope="campus" campusButtonLabel={uiText("从校内 3D 地图选择")}/>{studyPlace&&<button type="button" className="partner-study-location-clear" onClick={()=>{setStudyPlace('');setLocationChoice(null)}}>{uiText("清除地点")}</button>}</div><div className="v2-form-two"><label>{uiText("期望绩点下限")}<input name="gpaMin" type="number" min={0} step="0.01" placeholder={uiText("可留空")}/></label><label>{uiText("期望绩点上限")}<input name="gpaMax" type="number" min={0} step="0.01" placeholder={uiText("可留空")}/></label><label>{uiText("年级要求")}<select name="grade"><option value={"不限"}>{uiText("不限")}</option><option value={"大一"}>{uiText("大一")}</option><option value={"大二"}>{uiText("大二")}</option><option value={"大三"}>{uiText("大三")}</option><option value={"大四"}>{uiText("大四")}</option></select></label></div><label>{uiText("专业或学院偏好")}<input name="major" placeholder={uiText("例如：计算机相关优先")}/></label><label>{uiText("能力或角色要求")}<input name="role" placeholder={uiText("例如：前端、设计、研究")}/></label><label>{uiText("补充说明")}<textarea name="body" rows={3} maxLength={500} placeholder={uiText("协作方式和每周节奏")}/></label></PartnerCreateOptions></>}
        {createType === 'sport' && <><label>{uiText("运动种类")}<select name="sportType" required>{['羽毛球', '篮球', '足球', '网球', '跑步', '游泳', '健身', '其他'].map(item => <option value={item} key={item}>{item}</option>)}</select></label><div className="v2-form-two"><label>{uiText("约定时间")}<input name="time" type="datetime-local" required/></label></div><div className="v2-location-choice"><strong>{uiText("运动地点")}</strong><div><button type="button" className={locationScope === 'campus'?'is-active':''} onClick={() => { setLocationScope('campus'); setOutsideAddress(''); setLocationChoice(null) }}>{uiText("校内")}</button><button type="button" className={locationScope === 'outside'?'is-active':''} onClick={() => { setLocationScope('outside'); setOutsideAddress(''); setLocationChoice(null) }}>{uiText("校外")}</button></div>{locationScope !== 'unset' && <PartnerScopedLocationField label={uiText("集合地点")} value={outsideAddress} onChange={setOutsideAddress} onSelect={setLocationChoice} required scope={locationScope === "campus"?"campus":"outside"} placeholder={uiText("搜索校外地点或写明集合点")}/>}</div><PartnerCreateOptions hint={uiText("默认4人、无额外支出、不限性别，可在此修改")}><label>{uiText("人数")}<input name="capacity" type="number" min={2} max={30} defaultValue={4}/></label><label>{uiText("队伍名称")}<input name="title" maxLength={80} placeholder={uiText("例如：周末羽毛球搭子")}/></label><div className="v2-form-two"><label>{uiText("是否有额外支出")}<select name="extraCost"><option value="no">{uiText("没有")}</option><option value="yes">{uiText("有")}</option></select></label><label>{uiText("性别偏好")}<select name="genderPreference"><option value="any">{uiText("不限")}</option><option value="male">{uiText("男优先")}</option><option value="female">{uiText("女优先")}</option></select></label></div><label>{uiText("额外支出说明")}<input name="costDescription" maxLength={120} placeholder={uiText("若有，请填写项目和预计金额或范围")}/></label><label>{uiText("补充说明")}<textarea name="body" rows={3} maxLength={500} placeholder={uiText("适合水平、装备或集合方式")}/></label><small>{uiText("性别偏好只供参考，不影响任何学生申请。")}</small></PartnerCreateOptions></>}
      </div>
      <p className="v2-form-note">{uiText("加入申请会在“我的组队”中收到。")}</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setCreateOpen(false)}>{uiText("取消")}</button><button type="submit" className="v2-button v2-button-primary" disabled={live.busy || (createType === 'entertainment' || createType === 'sport') && (locationScope === 'unset' || !outsideAddress.trim())}>{uiText("发布")}{roomTypeName[createType]}{uiText("队伍")}</button></div>
    </form></StudentUtilityPanel>}
  </div>
}

export { V2Teams } from './V2Teams'

export { V2Messages } from './V2Messages'
