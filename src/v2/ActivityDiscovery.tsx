import { Bookmark, Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityItem } from './activityFilters'
import { setActivityReaction, type ActivityReaction } from './activityReactions'
import { coverRatio } from './discoveryLayout'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { useV2 } from './useV2'
import type { useWorkspaceBackend } from './useWorkspaceBackend'
import './activityDiscovery.css'

function ActivityCover({ item, path }: { item: ActivityItem; path: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  return <Link to={path} className={`discovery-cover activity-discovery-cover${item.image && !loaded && !failed ? ' is-loading' : ''}`} style={{ aspectRatio: coverRatio(item.id) }} aria-label={`查看活动：${item.title}`}>
    {item.image && !failed ? <img src={item.image} alt={item.isDefaultCover ? '校园通用照片，默认封面' : ''} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/> : <span className="discovery-text-cover"><small>{item.category}</small><strong>{item.title}</strong><span>{failed ? '封面暂不可用' : item.subtitle}</span></span>}
    <span className="activity-discovery-category">{item.category}{item.isDefaultCover && ' · 默认封面'}</span>
  </Link>
}

export function ActivityReactions({ item, compact = false, only, live }: { item: ActivityItem; compact?: boolean; only?: ActivityReaction; live?: ReturnType<typeof useWorkspaceBackend> }) {
  const { state, setState, persistenceError } = useV2()
  const liked = live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'like') ?? false : state.likedActivities?.includes(item.id) ?? false
  const saved = live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'save') ?? false : state.savedActivities?.includes(item.id) ?? false
  const change = (kind: ActivityReaction) => live ? live.mutate('relation.set', {id: item.id, kind: kind === 'likedActivities' ? 'like' : 'save', enabled: !(kind === 'likedActivities' ? liked : saved)}) : setState(value => setActivityReaction(value, item.id, kind, !value[kind]?.includes(item.id)))
  if (live ? !live.data?.account.roles.includes('student') : state.role !== 'student') return null
  return <div className={compact ? 'activity-discovery-reactions' : 'activity-detail-reactions'}>
    {only !== 'savedActivities' && <button type="button" className={liked ? 'is-liked' : ''} disabled={item.local?.status === 'draft'} aria-label={`${liked ? '取消点赞' : '点赞'}活动：${item.title}`} aria-pressed={liked} title="点赞标记仅反映本人状态" onClick={() => change('likedActivities')}><Heart size={compact ? 16 : 18} fill={liked ? 'currentColor' : 'none'}/><span>{compact ? Number(liked) : liked ? '已点赞' : '点赞'}</span></button>}
    {only !== 'likedActivities' && <button type="button" className={saved ? 'is-saved' : ''} disabled={item.local?.status === 'draft'} aria-label={`${saved ? '取消收藏' : '收藏'}活动：${item.title}`} aria-pressed={saved} onClick={() => change('savedActivities')}><Bookmark size={compact ? 16 : 18} fill={saved ? 'currentColor' : 'none'}/>{!compact && <span>{saved ? '已收藏' : '收藏'}</span>}</button>}
    {!compact && <small>{live ? live.error || '点赞与收藏保存到会同里后台，不影响参与标记。' : persistenceError ? '本机保存失败，请检查浏览器存储空间。' : '点赞与收藏保存在本机，不影响参与标记。'}</small>}
  </div>
}

export function ActivityDiscovery({ items, basePath, live }: { items: ActivityItem[]; basePath: string; live?: ReturnType<typeof useWorkspaceBackend> }) {
  const { state, persistenceError } = useV2()
  return <>
    {persistenceError && <p className="activity-discovery-note" role="alert">本机保存失败，请检查浏览器存储空间。</p>}
    <DiscoveryMasonry items={items} renderItem={item => <article className="discovery-card activity-discovery-card" key={item.id} data-activity-id={item.id}>
      <ActivityCover key={item.image ?? item.id} item={item} path={`${basePath}/${item.id}`}/>
      <div className="activity-discovery-save"><ActivityReactions live={live} item={item} compact only="savedActivities"/></div>
      <Link className="discovery-title" to={`${basePath}/${item.id}`}>{item.title}</Link>
      <p className="activity-discovery-when"><time dateTime={item.startAt}>{new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.startAt))}</time></p>
      <p className="activity-discovery-location" title={item.location}>{item.location}</p>
      <div className="discovery-meta"><span className="discovery-author" title={`主办方：${item.host}`}><span className="discovery-avatar" aria-hidden="true">{item.host.slice(0, 1)}</span><span>{item.host}</span></span><ActivityReactions item={item} compact only="likedActivities"/></div>
      {(live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'participate') : state.participatingActivities.includes(item.id)) && <span className="activity-discovery-participating">已标记参与</span>}
    </article>}/>
  </>
}
