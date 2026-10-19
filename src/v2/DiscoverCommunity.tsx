import { uiText, useUiLanguage } from './uiLanguage'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { CommunityPostDetail } from './CommunityPostDetail'
import { CommunityDiscoveryFeed } from './CommunityDiscoveryFeed'
import type { CommunityBackend } from './useCommunityBackend'
import { Empty } from './ui'

export function DiscoverCommunity({ community }: { community: CommunityBackend }) {
  useUiLanguage()
  const [selected,setSelected]=useState<string|null>(null)
  const posts=community.posts.filter(post=>post.status==='visible')
  const current=community.detailPost?.id===selected?community.detailPost:null
  const openPost=(id:string)=>{setSelected(id);void community.recordOpen(id)}
  return <section aria-label={uiText('校园社区')}>
    {community.error&&<p role="alert">{uiText(community.error)}</p>}
    {posts.length?<CommunityDiscoveryFeed posts={posts} liked={community.likedPosts} saved={community.savedPosts} viewerId={community.account.id} onOpen={openPost} onLike={id=>void community.mutate('relation.set',{id,kind:'like',enabled:!community.likedPosts.includes(id)})} onSave={id=>void community.mutate('relation.set',{id,kind:'save',enabled:!community.savedPosts.includes(id)})} hasMore={community.hasMore} onLoadMore={()=>void community.loadMore()} busy={community.busy}/>:!community.error&&<Empty icon={MessageCircle} title={uiText(community.account.id?'目前没有公开帖子':'正在读取帖子…')} description={uiText('有新内容发布后，会显示在这里。')}/>}
    {current&&<CommunityPostDetail key={current.id} live={community} id={current.id} onClose={()=>setSelected(null)}/>}
  </section>
}
