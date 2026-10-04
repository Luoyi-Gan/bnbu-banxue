import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Coffee,
  Dumbbell,
  Network,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUser, organizations } from '../data/mockData'
import { useLanguage } from '../i18n/LanguageContext'
import { useDemo } from '../store/DemoStore'
import { deriveGraph, getCheckInSummary } from '../store/demoReducer'
import type { GraphNode } from '../types'

const nodeTypeLabels: GraphNode['type'][] = ['User', 'Event', 'Organization', 'Teacher', 'Interest', 'Course', 'Alumni']

export function ProfilePage() {
  const { state } = useDemo()
  const { message, t } = useLanguage()
  const completedEvents = Object.values(state.registrations).filter((status) => status === 'checked_in').length
  const activeEvents = Object.values(state.registrations).filter((status) => !['cancelled', 'rejected'].includes(status)).length
  const memberships = organizations.filter((organization) => state.memberships.includes(organization.id))
  const graph = useMemo(() => deriveGraph(state), [state])
  const sports = getCheckInSummary(state)
  const totalPercent = Math.min(100, Math.round((sports.totalHours / 20) * 100))
  const coursePercent = Math.min(100, Math.round((sports.courseHours / 10) * 100))
  const otherPercent = Math.min(100, Math.round((sports.otherHours / 10) * 100))
  const remaining = Math.max(0, 20 - sports.totalHours)
  return (
    <div className="page-container profile-page">
      <section className="profile-hero">
        <div className="profile-person"><span className="profile-avatar-large">晴</span><div><span className="eyebrow">{t('profile.myCampus')}</span><h1>{currentUser.name}</h1><p>{currentUser.faculty} · {currentUser.studentNumber}</p><small>{currentUser.cohort} · BNBU</small></div></div>
        <Link className="profile-graph-cta" to="/profile/graph"><span><Sparkles size={19} /> {t('profile.yourGraph')}</span><strong>{t('profile.graphCounts', { nodes: graph.nodes.length, edges: graph.edges.length })}</strong><small>{t('profile.graphSee')}</small><ArrowRight size={19} /></Link>
      </section>
      <p className="profile-thesis">{t('profile.thesis')}</p>
      <section className="profile-metrics"><article className="profile-sports"><div><span className="metric-icon"><Dumbbell /></span><span className="eyebrow">{t('profile.sports')}</span><h2>{t('profile.sportsHours', { hours: sports.totalHours.toFixed(1).replace('.0', '') })}</h2><p>{totalPercent >= 100 ? t('checkin.goalReached') : t('profile.sportsRemaining', { hours: remaining.toFixed(1).replace('.0', '') })}</p></div><div className="progress-orbit"><span>{t('profile.percent', { percent: totalPercent })}</span></div><div className="mini-progress"><label><span>{t('checkin.course')}</span><strong>{sports.courseHours.toFixed(1).replace('.0', '')} / 10h</strong><i><b style={{ width: `${coursePercent}%` }} /></i></label><label><span>{t('checkin.other')}</span><strong>{sports.otherHours.toFixed(1).replace('.0', '')} / 10h</strong><i><b style={{ width: `${otherPercent}%` }} /></i></label></div></article><article><span className="metric-icon"><CalendarDays /></span><span className="eyebrow">{t('profile.activities')}</span><h2>{12 + activeEvents + completedEvents}</h2><p>{t('profile.thisSemester')}</p><div className="stat-tags"><span>{t('profile.metricSports', { count: 5 })}</span><span>{t('profile.metricWorkshop', { count: 3 + activeEvents })}</span><span>{t('profile.metricCoffee', { count: 2 + Object.keys(state.coffeeBookings).length })}</span></div></article><article><span className="metric-icon"><Users /></span><span className="eyebrow">{t('profile.connections')}</span><h2>{18 + state.partnerRequests.length + state.followedHosts.length}</h2><p>{t('profile.campusConnections')}</p><div className="avatar-line">{['明', '嘉', '楠', 'Leo', '+'].map((item) => <span key={item}>{item}</span>)}</div></article></section>
      <section className="profile-grid"><article className="panel"><div className="section-heading"><div><span className="eyebrow">{t('profile.organizations')}</span><h2>{t('profile.yourCommunities')}</h2></div><Link to="/campus/organizations">{t('profile.explore')}</Link></div><div className="profile-orgs">{memberships.map((organization) => <Link key={organization.id} to={`/organizations/${organization.id}`}><span style={{ background: organization.color }}>{organization.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{organization.name}</strong><small>{t('profile.member')}</small></Link>)}{memberships.length === 0 && <p>{t('profile.joinHint')}</p>}</div></article><article className="panel"><span className="eyebrow">{t('profile.interests')}</span><h2>{t('profile.signals')}</h2><div className="interest-cloud">{currentUser.interests.map((interest, index) => <span className={`interest-${index % 3}`} key={interest}>{interest}</span>)}</div></article></section>
      <section className="journey-section"><div className="section-heading"><div><span className="eyebrow">{t('profile.campusJourney')}</span><h2>{t('profile.timeline')}</h2></div><span>{t('profile.momentCount', { count: state.journey.length })}</span></div><div className="journey-timeline">{state.journey.map((item, index) => <article key={item.id}><div className="journey-date">{item.date}</div><span className={`journey-marker marker-${item.kind}`}>{item.kind === 'sports' ? <Activity /> : item.kind === 'coffee' ? <Coffee /> : item.kind === 'organization' ? <Users /> : item.kind === 'hosted' ? <Sparkles /> : item.kind === 'connection' ? <Network /> : <CheckCircle2 />}</span><div><h3>{message(item.titleMessage, item.title)}</h3><p>{message(item.detailMessage, item.detail)}</p></div>{index < 4 && <span className="new-entry-label">{t('profile.latest')}</span>}</article>)}</div></section>
    </div>
  )
}

export function CampusGraphPage() {
  const { state } = useDemo()
  const { localize, t } = useLanguage()
  const graph = useMemo(() => deriveGraph(state), [state])
  const [selected, setSelected] = useState<GraphNode | null>(() => graph.nodes[0] ?? null)
  const [filter, setFilter] = useState<GraphNode['type'] | 'All'>('All')
  const visibleNodes = graph.nodes.filter((node) => filter === 'All' || node.type === filter || node.type === 'User')
  const visibleIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = graph.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
  const nodeById = (id: string) => graph.nodes.find((node) => node.id === id)
  const reset = () => { setFilter('All'); setSelected(graph.nodes[0] ?? null) }
  const selectedEdges = selected ? graph.edges.filter((edge) => edge.source === selected.id || edge.target === selected.id) : []
  return (
    <div className="graph-page">
      <header className="graph-header"><div><Link className="back-link" to="/profile"><ArrowLeft size={17} /> {t('graph.backToProfile')}</Link><span className="eyebrow">{t('graph.eyebrow')}</span><h1>Campus Graph</h1><p>{t('graph.subtitle')}</p></div><div className="graph-summary"><span>{t('graph.nodes', { count: graph.nodes.length })}</span><span>{t('graph.relationships', { count: graph.edges.length })}</span><button className="button button-secondary" type="button" onClick={reset}><RotateCcw size={16} /> {t('graph.resetView')}</button></div></header>
      <div className="graph-toolbar" aria-label={t('graph.filterLabel')}><button type="button" className={filter === 'All' ? 'is-active' : ''} onClick={() => setFilter('All')}>{t('graph.all')}</button>{nodeTypeLabels.map((type) => <button type="button" className={filter === type ? 'is-active' : ''} onClick={() => setFilter(type)} key={type}><span className={`node-key key-${type.toLowerCase()}`} />{t(`graph.node.${type}`)}</button>)}</div>
      <div className="graph-layout">
        <section className="graph-canvas" aria-label={t('graph.interactive')}>
          <div className="graph-grid-bg" />
          <svg className="graph-edges" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
            {visibleEdges.map((edge) => { const source = nodeById(edge.source); const target = nodeById(edge.target); if (!source || !target) return null; return <g key={edge.id}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={`edge-line edge-${edge.type} ${edge.pending ? 'is-pending' : ''}`} vectorEffect="non-scaling-stroke" /><text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 1.2} className="edge-label">{t(`graph.edge.${edge.type}`)}</text></g> })}
          </svg>
          {visibleNodes.map((node, index) => <button type="button" title={`${t(`graph.node.${node.type}`)}: ${localize(node.label)}`} onClick={() => setSelected(node)} className={`graph-node node-${node.type.toLowerCase()} ${selected?.id === node.id ? 'is-selected' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * 70}ms` }} key={node.id}><span>{node.type === 'User' ? '晴' : node.label.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{localize(node.label)}</strong><small>{t(`graph.node.${node.type}`)}</small></button>)}
          <div className="graph-hint"><Sparkles size={16} /> {t('graph.hint')}</div>
        </section>
        <aside className="graph-detail">
          {selected ? <><span className={`detail-node-icon key-${selected.type.toLowerCase()}`}>{selected.label.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="eyebrow">{t(`graph.node.${selected.type}`)}</span><h2>{localize(selected.label)}</h2><p>{localize(selected.detail)}</p><div className="graph-relationships"><h3>{t('graph.relationships')}</h3>{selectedEdges.map((edge) => { const otherId = edge.source === selected.id ? edge.target : edge.source; const other = nodeById(otherId); return <button type="button" onClick={() => other && setSelected(other)} key={edge.id}><span className={`node-key key-${other?.type.toLowerCase()}`} /><span><strong>{t(`graph.edge.${edge.type}`)}</strong><small>{localize(other?.label ?? '')}</small></span><ArrowRight size={15} /></button> })}</div>{selected.type !== 'User' && <p className="graph-connection-source">{t('graph.connectionCreatedBy', { source: selectedEdges.length ? t(`graph.source.${selectedEdges[0].type}`) : t('graph.source.registered') })}</p>}</> : <div className="empty-state compact"><Network size={27} /><p>{t('graph.selectNode')}</p></div>}
          <div className="graph-legend-note"><BookOpen size={18} /><p><strong>{t('graph.legendHow')}</strong>{t('graph.legendBody')}</p></div>
        </aside>
      </div>
      <section className="graph-derivation"><span className="eyebrow">{t('graph.derivationEyebrow')}</span><h2>{t('graph.derivationTitle')}</h2><p>{t('graph.derivationBody')}</p><div>{['ruleRegister', 'ruleCheckin', 'ruleFollow', 'ruleJoin', 'ruleCoffee', 'ruleCreate'].map((rule) => <span key={rule}>{t(`graph.derivation.${rule}`)}</span>)}</div></section>
    </div>
  )
}
