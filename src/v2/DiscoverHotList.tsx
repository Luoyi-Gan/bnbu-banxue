import { uiText, useUiLanguage } from './uiLanguage'
import { ArrowRight, Flame } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, workspaceChangedEvent } from '../live/api'
import { CommunityPostDetail } from './CommunityPostDetail'
import type { CommunityBackend } from './useCommunityBackend'

type HotItem = { id: string; kind: 'activity' | 'post'; title: string; subtitle: string }
type HotResponse = { publicPostCount: number; items: HotItem[] }

export function DiscoverHotList({ community }: { community: CommunityBackend }) { useUiLanguage();
  const [data, setData] = useState<HotResponse | null>(null)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const navigate = useNavigate()
  const refresh = useCallback(async () => {
    try { setData(await api<HotResponse>('/api/discover/hot')); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : '榜单暂时无法读取。') }
  }, [])
  useEffect(() => {
    void refresh()
    window.addEventListener(workspaceChangedEvent, refresh)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 60_000)
    return () => { window.clearInterval(timer); window.removeEventListener(workspaceChangedEvent, refresh); window.removeEventListener('focus', refresh) }
  }, [refresh])
  const open = (item: HotItem) => {
    if (item.kind === 'activity') navigate(`/v2/activities/${item.id}`)
    else { setSelectedPost(item.id); void community.recordOpen(item.id) }
  }
  const detail = community.detailPost?.id === selectedPost ? community.detailPost : null
  return <section className="v2-discover-hot" aria-label={uiText("发现热度榜")}>
    <div className="v2-discover-hot-heading"><span><Flame size={18}/><strong>{uiText("热度榜")}</strong></span><small>{uiText("最近 7 天 · 活动与社区")}</small></div>
    {error?<p role="alert">{uiText(error)}</p>:data?.items.length?<ol className="v2-hot-rows">{data.items.map((item, index) => <li key={`${item.kind}-${item.id}`}><button type="button" onClick={() => open(item)}><span className={`v2-hot-rank rank-${index + 1}`}>{index + 1}</span><span><strong>{item.title}</strong><small>{item.kind === 'activity'?uiText('活动'):uiText('社区')} · {item.subtitle}</small></span><ArrowRight size={15}/></button></li>)}</ol>:<p className="v2-hot-empty">{data?uiText('最近 7 天暂无可上榜的互动。'):uiText('正在读取热度榜…')}</p>}
    {detail && <CommunityPostDetail key={detail.id} live={community} id={detail.id} onClose={() => setSelectedPost(null)}/>}
  </section>
}
