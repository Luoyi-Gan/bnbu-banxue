import { uiText, useUiLanguage } from './uiLanguage'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { CommunityPostDetail } from './CommunityPostDetail'
import type { CommunityBackend } from './useCommunityBackend'
import { Empty } from './ui'

export function DiscoverCommunity({ community }: { community: CommunityBackend }) { useUiLanguage();
  const [selected, setSelected] = useState<string | null>(null)
  const posts = community.posts.filter(post => post.status === 'visible').slice(0, 6)
  const current = community.detailPost?.id === selected ? community.detailPost : null
  const openPost = (id: string) => { setSelected(id); void community.recordOpen(id) }
  return <section className="v2-discover-inline-panel" aria-label={uiText("校园社区")}><div className="v2-discover-panel-heading"><h2>{uiText("校园社区")}</h2></div>
    {community.error && <p role="alert">{community.error}</p>}
    <div className="v2-discover-posts">{posts.map(post => <button type="button" key={post.id} onClick={() => openPost(post.id)}><span className="v2-discover-post-board">{post.board}</span><strong>{post.title}</strong><small>{post.author} · {post.date}</small><ArrowRight size={15}/></button>)}</div>
    {!posts.length && !community.error && <Empty icon={MessageCircle} title={uiText("目前没有公开帖子")} description={uiText("有新内容发布后，会显示在这里。")}/>}
    {current && <CommunityPostDetail key={current.id} live={community} id={current.id} onClose={() => setSelected(null)}/>}
  </section>
}
