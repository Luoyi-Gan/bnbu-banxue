import { ArrowRight, Bookmark, Camera, Heart, ImagePlus, MessageCircle, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatedSearchField } from './AnimatedSearchField'
import { prepareCommunityImage } from './communityImages'
import { type Post } from '../../shared/v2/model'
import { Empty, Modal, PageHeading } from './ui'
import { useCommunityBackend } from './useCommunityBackend'
import { DisplayAvatar } from './DisplayAvatar'

import { photosForPost as photosFor } from './postPresentation'
import { CommunityPostDetail } from './CommunityPostDetail'
import './communityFeed.css'

const boards = ['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业']

function DiscoveryCover({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const src = photosFor(post)[0]
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const ratio = [0.8, 1, 1.25][Array.from(post.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3]
  return <button className={`discovery-cover${!loaded && src && !failed ? ' is-loading' : ''}`} style={{ aspectRatio: ratio }} onClick={onOpen} aria-label={`查看帖子：${post.title}`}>
    {src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)}/> : <span className="discovery-text-cover"><small>{post.board} · 校园分享</small><strong>{post.title}</strong><span>{failed ? '图片暂不可用' : post.body}</span></span>}
    {post.status === 'pending' && <span className="discovery-badge">待审核</span>}
  </button>
}

function DiscoveryFeed({ posts, liked, saved, onOpen, onLike, onSave }: { posts: Post[]; liked: string[]; saved: string[]; onOpen: (id: string) => void; onLike: (id: string) => void; onSave: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(2)
  const [limit, setLimit] = useState(6)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setColumns(Math.max(2, Math.min(4, Math.floor(entry.contentRect.width / 220)))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const element = sentinel.current
    if (!element || limit >= posts.length) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setLimit(value => value + 6) }, { rootMargin: '120px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [limit, posts.length])
  const shown = posts.slice(0, limit)
  return <div ref={container} className="discovery-feed">
    <div className="discovery-columns" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }, (_, column) => <div className="discovery-column" key={column}>{shown.filter((_, index) => index % columns === column).map(post => <article className="discovery-card" key={post.id}>
        <DiscoveryCover post={post} onOpen={() => onOpen(post.id)}/>
        <button className="discovery-title" onClick={() => onOpen(post.id)}>{post.title}</button>
        <div className="discovery-meta"><span className="discovery-author"><DisplayAvatar className="discovery-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span>{post.author}</span></span><button className={liked.includes(post.id) ? 'is-liked' : ''} aria-label={`${liked.includes(post.id) ? '取消点赞' : '点赞'}：${post.title}`} aria-pressed={liked.includes(post.id)} disabled={post.status !== 'visible'} onClick={() => onLike(post.id)}><Heart size={15} fill={liked.includes(post.id) ? 'currentColor' : 'none'}/>{post.likes}</button></div>
        <button className="discovery-save" aria-label={`${saved.includes(post.id) ? '取消收藏' : '收藏'}：${post.title}`} aria-pressed={saved.includes(post.id)} disabled={post.status !== 'visible'} onClick={() => onSave(post.id)}><Bookmark size={15} fill={saved.includes(post.id) ? 'currentColor' : 'none'}/></button>
      </article>)}</div>)}
    </div>
    <div ref={sentinel} className="discovery-end">{limit < posts.length ? <button className="v2-text-button" onClick={() => setLimit(value => value + 6)}>加载更多</button> : posts.length > 0 ? '已经看完当前内容' : null}</div>
  </div>
}

export function V2Community() {
  const state = useCommunityBackend()
  const studentName = state.account.nickname || state.account.name
  const location = useLocation()
  const navigate = useNavigate()
  const [board, setBoard] = useState('全部')
  const [query, setQuery] = useState('')
  const [compose, setCompose] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [draftImages, setDraftImages] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const [processingImages, setProcessingImages] = useState(false)
  useEffect(() => { if (new URLSearchParams(location.search).get('compose') === '1') setCompose(true) }, [location.search])
  const closeCompose = () => { setCompose(false); setDraftImages([]); setImageError(''); if (new URLSearchParams(location.search).has('compose')) navigate('/v2/community', { replace: true }) }
  const canSee = (post: Post) => state.posts.some(item => item.id === post.id)
  const visible = state.posts.filter(canSee).filter((post) => (board === '全部' || post.board === board) && `${post.title} ${post.body} ${post.author}`.toLowerCase().includes(query.toLowerCase()))
  const current = state.posts.find((post) => post.id === (selected ?? new URLSearchParams(location.search).get('item')) && canSee(post))
  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    if (draftImages.length + files.length > 9) { setImageError('最多添加 9 张图片'); return }
    setProcessingImages(true); setImageError('')
    try {
      const images = await Promise.all(files.map(prepareCommunityImage))
      setDraftImages((previous) => [...previous, ...images].slice(0, 9))
    } catch (error) { setImageError(error instanceof Error ? error.message : '图片处理失败，请重试') }
    finally { setProcessingImages(false) }
  }
  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') ?? '').trim()
    const body = String(data.get('body') ?? '').trim()
    if (!title || !body || processingImages || state.busy) return
    const id = await state.mutate('post.create', { title, body, images: draftImages, board: String(data.get('board') ?? '校园') })
    if (id) { closeCompose(); setSelected(id) }
  }
  const toggleSave = (id: string) => { void state.mutate('relation.set', { id, kind: 'save', enabled: !state.savedPosts.includes(id) }) }
  const toggleLike = (id: string) => { void state.mutate('relation.set', { id, kind: 'like', enabled: !state.likedPosts.includes(id) }) }
  return <div className="v2-page v2-community-page">
    <PageHeading eyebrow="CAMPUS / COMMUNITY" title="校园社区" description="先看内容，再决定要不要参与讨论。" action={<button type="button" className="v2-button v2-button-primary v2-community-compose-desktop" onClick={() => setCompose(true)}><Plus size={17}/> 发布帖子</button>}/>
    <div className="v2-social-layout">
      <section className="v2-social-main"><div className="v2-social-filter v2-panel"><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索话题或关键词"/><div className="v2-filter-pills" aria-label="内容分类">{boards.map((item) => <button type="button" aria-pressed={board === item} className={board === item ? 'is-active' : ''} onClick={() => setBoard(item)} key={item}>{item}</button>)}</div></div>
        <DiscoveryFeed key={`${query}|${board}`} posts={visible} liked={state.likedPosts} saved={state.savedPosts} onOpen={setSelected} onLike={toggleLike} onSave={toggleSave}/>
        {(!visible.length || state.error) && <Empty icon={MessageCircle} title={state.error || "暂无帖子"} description="换个分类或搜索词再看看。"/>}
      </section>
      <aside className="v2-social-aside"><div className="v2-panel v2-social-profile"><DisplayAvatar className="v2-social-avatar is-self" name={studentName} avatar={state.account.avatar} personId={state.account.id}/><div><strong>{studentName}</strong><small>分享你眼中的校园</small></div><button type="button" onClick={() => setCompose(true)}>发布 <ArrowRight size={14}/></button></div><div className="v2-panel"><span className="v2-eyebrow">CAMPUS VOICES</span><h3>让校园故事被看见</h3><p>照片、经历或问题，都可以成为下一段交流的开始。</p><span className="v2-social-aside-note"><Camera size={16}/> 最多 9 张图片 · 文字检查通过后直接发布</span></div><div className="v2-panel"><h3>热门话题</h3>{state.posts.filter((post) => post.status === 'visible').sort((a, b) => b.likes - a.likes).slice(0, 3).map((post, index) => <button type="button" className="v2-trend-row" key={post.id} onClick={() => setSelected(post.id)}><span>0{index + 1}</span><strong>{post.title}</strong></button>)}</div></aside>
    </div>
    {createPortal(<button type="button" className="v2-community-compose v2-a-community-compose" aria-label="发布帖子" onClick={() => setCompose(true)}><span className="v2-community-compose-circle"><Plus size={26}/></span></button>, document.body)}
    {compose && <Modal title="发布社区帖子" onClose={closeCompose}><form className="v2-form v2-social-compose" onSubmit={publish}><label>话题标题<input name="title" required maxLength={80} placeholder="想和同学聊什么？"/></label><label>选择分区<select name="board">{boards.slice(1).filter((item) => !item.startsWith('校友')).map((item) => <option key={item}>{item}</option>)}</select></label><label>正文<textarea name="body" required rows={4} maxLength={1000} placeholder="分享一点具体的经历或问题"/></label><div className="v2-image-uploader"><div className="v2-image-uploader-head"><strong>添加图片</strong><span>{draftImages.length} / 9 张</span></div><div className="v2-upload-grid">{draftImages.map((src, index) => <div className="v2-upload-thumb" key={`${index}-${src.slice(-24)}`}><img src={src} alt={`待发布图片 ${index + 1}`}/><button type="button" aria-label={`移除第 ${index + 1} 张图片`} onClick={() => setDraftImages((items) => items.filter((_, number) => number !== index))}><X size={13}/></button></div>)}{draftImages.length < 9 && <label className="v2-upload-add"><ImagePlus size={22}/><span>{processingImages ? '处理中…' : '添加照片'}</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={processingImages}/></label>}</div>{(imageError || state.error) && <p className="v2-upload-error" role="alert">{imageError || state.error}</p>}<small>最多 9 张，图片会压缩后上传保存。</small></div><p className="v2-form-note">文字检查通过后直接公开；命中屏蔽词时请修改。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={closeCompose}>取消</button><button type="submit" className="v2-button v2-button-primary" disabled={processingImages || state.busy}>发布帖子</button></div></form></Modal>}
    {current && <CommunityPostDetail key={current.id} live={state} id={current.id} onClose={() => { setSelected(null); if (location.search) navigate('/v2/community', { replace: true }) }}/>}
  </div>
}
