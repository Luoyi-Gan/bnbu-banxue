import {SharedMediaLink} from './SharedMediaLink'
import { uiTemplate, uiText, useUiLanguage , uiLocale } from './uiLanguage'
import { Bookmark, Clock3, MapPin, Heart } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ActivityItem } from './activityFilters'
import { setActivityReaction, type ActivityReaction } from './activityReactions'
import { coverRatio } from './discoveryLayout'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { useV2 } from './useV2'
import type { useWorkspaceBackend } from './useWorkspaceBackend'
import './activityDiscovery.css'

function ActivityCover({ item, path }: { item: ActivityItem; path: string }) { useUiLanguage();
  const location=useLocation()
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  return <SharedMediaLink transitionKey={`activity:${item.id}`} data-shared-media={`activity:${item.id}`} to={path} state={{from:location.pathname+location.search}} className={`discovery-cover activity-discovery-cover${item.image && !loaded && !failed ? ' is-loading' : ''}`} style={{ aspectRatio: coverRatio(item.id) }} aria-label={uiTemplate(["查看活动：",""],item.title)}>
    {item.image && !failed?<img src={item.image} alt={item.isDefaultCover?uiText('校园通用照片，默认封面'):''} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/>:<span className="discovery-text-cover"><small>{uiText(item.category)}</small><strong>{item.title}</strong><span>{failed?uiText('封面暂不可用'):item.subtitle}</span></span>}
    <span className="activity-discovery-category">{uiText(item.category)}{item.isDefaultCover && ' · 默认封面'}</span>
  </SharedMediaLink>
}

export function ActivityReactions({ item, compact = false, only, live, showNote=true }: { item: ActivityItem; compact?: boolean; only?: ActivityReaction; live?: ReturnType<typeof useWorkspaceBackend>;showNote?:boolean }) { useUiLanguage();
  const { state, setState, persistenceError } = useV2()
  const liked = live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'like') ?? false : state.likedActivities?.includes(item.id) ?? false
  const saved = live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'save') ?? false : state.savedActivities?.includes(item.id) ?? false
  const change = (kind: ActivityReaction) => live ? live.mutate('relation.set', {id: item.id, kind: kind === 'likedActivities' ? 'like' : 'save', enabled: !(kind === 'likedActivities' ? liked : saved)}) : setState(value => setActivityReaction(value, item.id, kind, !value[kind]?.includes(item.id)))
  if (live ? !live.data?.account.roles.includes('student') : state.role !== 'student') return null
  return <div className={compact?'activity-discovery-reactions':'activity-detail-reactions'}>
    {only !== 'savedActivities' && <button type="button" className={liked?'is-liked':''} disabled={item.local?.status === 'draft'} aria-label={uiTemplate(["","活动：",""],uiText(liked ? '取消点赞' : '点赞'),item.title)} aria-pressed={liked} title={uiText("点赞标记仅反映本人状态")} onClick={() => change('likedActivities')}><Heart size={compact?16:18} fill={liked?'currentColor':'none'}/><span>{compact?Number(liked):liked?uiText('已点赞'):uiText('点赞')}</span></button>}
    {only !== 'likedActivities' && <button type="button" className={saved?'is-saved':''} disabled={item.local?.status === 'draft'} aria-label={uiTemplate(["","活动：",""],uiText(saved ? '取消收藏' : '收藏'),item.title)} aria-pressed={saved} onClick={() => change('savedActivities')}><Bookmark size={compact?16:18} fill={saved?'currentColor':'none'}/>{!compact && <span>{saved?uiText('已收藏'):uiText('收藏')}</span>}</button>}
    {!compact && showNote && <small>{live?live.error || uiText('点赞与收藏保存到会同里后台，不影响参与标记。'):persistenceError?uiText('本机保存失败，请检查浏览器存储空间。'):uiText('点赞与收藏保存在本机，不影响参与标记。')}</small>}
  </div>
}

export function ActivityDiscovery({ items, basePath, live }: { items: ActivityItem[]; basePath: string; live?: ReturnType<typeof useWorkspaceBackend> }) { useUiLanguage();
  const location=useLocation()
  const { state, persistenceError } = useV2()
  return <>
    {persistenceError && <p className="activity-discovery-note" role="alert">{uiText("本机保存失败，请检查浏览器存储空间。")}</p>}
    <DiscoveryMasonry items={items} renderItem={item => <article className="discovery-card activity-discovery-card" key={item.id} data-activity-id={item.id}>
      <ActivityCover key={item.image ?? item.id} item={item} path={`${basePath}/${item.id}`}/>
      <div className="activity-discovery-save"><ActivityReactions live={live} item={item} compact only="savedActivities"/></div>
      <SharedMediaLink transitionKey={`activity:${item.id}`} className="discovery-title" to={`${basePath}/${item.id}`} state={{from:location.pathname+location.search}}>{item.title}</SharedMediaLink>
      <p className="activity-discovery-when"><Clock3 size={14} aria-hidden="true"/><time dateTime={item.startAt}>{new Intl.DateTimeFormat(uiLocale(), { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.startAt))}</time></p>
      <p className="activity-discovery-location" title={item.location}><MapPin size={14} aria-hidden="true"/><span>{item.location}</span></p>
      <div className="discovery-meta"><span className="discovery-author" title={uiTemplate(['主办方：',''],item.host)}><span className="discovery-avatar" aria-hidden="true">{item.host.slice(0, 1)}</span><span>{item.host}</span></span><ActivityReactions live={live} item={item} compact only="likedActivities"/></div>
      {(live ? live.data?.relations.some(r => r.entityId === item.id && r.kind === 'participate') : state.participatingActivities.includes(item.id)) && <span className="activity-discovery-participating">{uiText('已标记参与')}</span>}
    </article>}/>
  </>
}
