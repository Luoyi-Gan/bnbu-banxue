import { Bookmark, Heart, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { alumniData } from '../../shared/v2/alumniPolicy'
import { type AlumniCategory } from './alumniDiscoveryPolicy'
import { AnimatedSearchField } from './AnimatedSearchField'
import { CommunityPostDetail } from './CommunityPostDetail'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { coverRatio } from './discoveryLayout'
import { type Post } from '../../shared/v2/model'
import { useCommunityBackend } from './useCommunityBackend'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { photosForPost, usesCampusIllustration } from './postPresentation'
import { Empty } from './ui'
import { useV2 } from './useV2'
import { DisplayAvatar } from './DisplayAvatar'
import './alumniDiscovery.css'

function AlumniCover({ post }: { post: Post }) {
  const src = photosForPost(post)[0]
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false)
  return <div className={`discovery-cover alumni-discovery-cover${src && !loaded && !failed ? ' is-loading' : ''}`} style={{ aspectRatio: coverRatio(post.id) }}>
    {src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/> : <span className="discovery-text-cover"><small>{post.board}</small><strong>{post.title}</strong><span>{failed ? '图片暂不可用，点击阅读正文' : post.body}</span></span>}
    <span className="alumni-discovery-category">{post.status === 'pending' ? '待审核' : `${post.board.replace('校友', '')}经验`}{usesCampusIllustration(post) ? ' · 校园配图' : ''}</span>
  </div>
}

export function AlumniDiscovery({ personId }: { personId?: string }) {
  const { state: preferences } = useV2()
  const live = useCommunityBackend(), workspace = useWorkspaceBackend()
  const state = {...preferences, posts: live.posts, likedPosts: live.likedPosts, savedPosts: live.savedPosts, alumni: workspace.data?.alumni ?? {profiles: [], slots: [], bookings: [], follows: [], history: [], notices: []}} 
  const [category, setCategory] = useState<AlumniCategory>('全部'), [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const posts = live.posts.filter(post => post.alumniId && (!personId || post.alumniId === personId) && (category !== '升学' && category !== '就业' || post.board === `校友${category}`) && (category !== '已收藏' || live.savedPosts.includes(post.id)) && (category !== '已关注' || state.alumni.follows.some(f => f.student === live.account.id && f.alumniId === post.alumniId)) && `${post.title} ${post.body} ${post.author}`.toLowerCase().includes(query.trim().toLowerCase()))
  const categories: AlumniCategory[] = ['全部', '升学', '就业', '已关注', '已收藏']
  const toggle = (id: string, kind: 'likedPosts' | 'savedPosts') => live.mutate('relation.set', {id, kind: kind === 'likedPosts' ? 'like' : 'save', enabled: !live[kind].includes(id)})
  return <section className="alumni-discovery" aria-label="校友经验信息流">
    <div className="alumni-discovery-toolbar"><nav className="alumni-discovery-categories" aria-label="校友内容分类">{categories.map(item => <button type="button" key={item} className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</nav><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索校友经验"/></div>
    <p className="alumni-discovery-note">{posts.length} 篇{personId ? '校友' : ''}分享 · 内容来自当前服务</p>
    {(live.error || workspace.error) && <p className="alumni-discovery-note" role="alert">{live.error || workspace.error}</p>}
    {posts.length ? <DiscoveryMasonry key={`${personId ?? ''}|${category}|${query}`} items={posts} itemLabel="内容" renderItem={post => {
      const liked = state.likedPosts.includes(post.id), saved = state.savedPosts.includes(post.id)
      const person = alumniData(state).profiles.find(profile => profile.id === post.alumniId && profile.status === 'approved')
      return <article className="discovery-card alumni-discovery-card" key={post.id} data-post-id={post.id}>
        <AlumniCover key={photosForPost(post)[0] ?? post.id} post={post}/>
        <h3 className="discovery-title">{post.title}</h3>
        <button type="button" className="alumni-discovery-open" aria-label={`查看经验：${post.title}`} onClick={() => setSelected(post.id)}/>
        <div className="discovery-meta"><Link className="discovery-author" to={person ? `/v2/alumni?person=${encodeURIComponent(person.id)}` : '#'} onClick={person ? undefined : event => { event.preventDefault(); setSelected(post.id) }} aria-label={person ? `了解校友：${post.author}` : `查看${post.author}的分享`}><DisplayAvatar className="discovery-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span>{post.author}</span></Link><button type="button" className={liked ? 'is-liked' : ''} aria-label={`${liked ? '取消点赞' : '点赞'}：${post.title}`} aria-pressed={liked} disabled={post.status !== 'visible'} onClick={() => toggle(post.id, 'likedPosts')}><Heart size={15} fill={liked ? 'currentColor' : 'none'}/>{post.likes}</button></div>
        <button type="button" className={`discovery-save${saved ? ' is-saved' : ''}`} aria-label={`${saved ? '取消收藏' : '收藏'}：${post.title}`} aria-pressed={saved} disabled={post.status !== 'visible'} onClick={() => toggle(post.id, 'savedPosts')}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'}/></button>
      </article>
    }}/> : <Empty icon={Search} title={category === '已关注' ? '还没有关注校友的分享' : category === '已收藏' ? '还没有收藏的校友经验' : '暂无相关分享'} description="试试其他分类或搜索词，也可以前往寻找校友。"/>}
    {selected && <CommunityPostDetail live={live} key={selected} id={selected} onClose={() => setSelected(null)}/>}
  </section>
}
