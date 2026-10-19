import { uiText, useUiLanguage } from './uiLanguage'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { type AlumniCategory } from './alumniDiscoveryPolicy'
import { AnimatedSearchField } from './AnimatedSearchField'
import { CommunityPostDetail } from './CommunityPostDetail'
import {CommunityDiscoveryFeed} from './CommunityDiscoveryFeed'
import { useCommunityBackend } from './useCommunityBackend'
import { Empty } from './ui'
import './alumniDiscovery.css'

export function AlumniDiscovery({ personId,embedded=false }: { personId?: string;embedded?:boolean }) { useUiLanguage();
  const [category,setCategory]=useState<AlumniCategory>('全部'),[query,setQuery]=useState('')
  const live=useCommunityBackend({query,board:category==='升学'?'校友升学':category==='就业'?'校友就业':'全部',view:category==='已收藏'?'saved':'',alumni:personId||'all',alumniFollowing:category==='已关注'})
  const [selected,setSelected]=useState<string|null>(null)
  const posts=live.posts
  const categories: AlumniCategory[] = ['全部', '升学', '就业', '已关注', '已收藏']
  const toggle = (id: string, kind: 'likedPosts' | 'savedPosts') => live.mutate('relation.set', {id, kind: kind === 'likedPosts' ? 'like' : 'save', enabled: !live[kind].includes(id)})
  const openPost = (id: string) => { setSelected(id); void live.recordOpen(id) }
  const categoriesNav=<nav className={embedded?'campus-discovery-pills':'alumni-discovery-categories'} aria-label={uiText('校友内容分类')}>{categories.map(item=><button type="button" key={item} className={category===item?'is-active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{uiText(item)}</button>)}</nav>
  return <section className="alumni-discovery community-hub community-alumni-feed" aria-label={uiText("校友经验信息流")}>
    {embedded?<><div className="campus-discovery-tools"><label className="campus-discovery-search"><Search size={18}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} aria-label={uiText('搜索校友经验')} placeholder={uiText('搜索校友经验')}/></label><div className="campus-discovery-alumni-actions"><Link to="/v2/alumni?view=people">{uiText('寻找校友')}</Link><Link to="/v2/alumni?view=bookings">{uiText('我的交流')}</Link></div></div>{categoriesNav}</>:<div className="alumni-discovery-toolbar">{categoriesNav}<AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText('搜索校友经验')}/></div>}
    {!embedded&&<p className="alumni-discovery-note">{posts.length} {uiText("篇")}{personId?uiText('校友'):''}{uiText("分享 · 内容来自当前服务")}</p>}
    {live.error && <p className="alumni-discovery-note" role="alert">{live.error}</p>}
    {posts.length?<CommunityDiscoveryFeed posts={posts} liked={live.likedPosts} saved={live.savedPosts} viewerId={live.account.id} onOpen={openPost} onLike={id=>void toggle(id,'likedPosts')} onSave={id=>void toggle(id,'savedPosts')} hasMore={live.hasMore} onLoadMore={()=>void live.loadMore()} busy={live.busy||live.loadingMore}/>:<Empty icon={Search} title={category === '已关注'?uiText('还没有关注校友的分享'):category === '已收藏'?uiText('还没有收藏的校友经验'):uiText('暂无相关分享')} description={uiText("试试其他分类或搜索词，也可以前往寻找校友。")}/>}
    {selected && <CommunityPostDetail live={live} key={selected} id={selected} onClose={() => setSelected(null)}/>}
  </section>
}
