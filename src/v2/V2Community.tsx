import { ArrowRight, Bookmark, Camera, Eye, Flame, Heart, ImagePlus, MessageCircle, Plus, Search, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { prepareCommunityImage } from './communityImages'
import { type Post } from '../../shared/v2/model'
import { Empty, Modal, PageHeading } from './ui'
import { useCommunityBackend } from './useCommunityBackend'
import { DisplayAvatar } from './DisplayAvatar'

import { photosForPost as photosFor } from './postPresentation'
import { CommunityPostDetail } from './CommunityPostDetail'
import campusPhoto from '../assets/campus/home-background.jpg'
import './communityFeed.css'

const boards = ['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业']

function DiscoveryFeed({ posts, liked, saved, viewerId, onOpen, onLike, onSave }: { posts: Post[]; liked: string[]; saved: string[]; viewerId: string; onOpen: (id: string) => void; onLike: (id: string) => void; onSave: (id: string) => void }) {
  return <div className="reference-community-feed">{posts.map(post => <article key={post.id} className="reference-post">
    <header><DisplayAvatar className="reference-post-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span><strong>{post.author}</strong><small>{post.board} · {post.status === 'pending' ? '待审核' : '校园分享'}</small></span><button onClick={() => onOpen(post.id)} aria-label={`查看帖子：${post.title}`}><ArrowRight size={18}/></button></header>
    <button className="reference-post-copy" onClick={() => onOpen(post.id)}><strong>{post.title}</strong><p>{post.body}</p></button>
    {photosFor(post).length > 0 && <button className="reference-post-photos" aria-label={`查看${post.title}的图片`} onClick={() => onOpen(post.id)}>{photosFor(post).slice(0,3).map((src,index) => <img key={index} src={src} alt={`帖子图片 ${index+1}`} loading="lazy"/>)}</button>}
    <footer><button className={liked.includes(post.id) ? 'is-liked' : ''} aria-label={`${liked.includes(post.id) ? '取消点赞' : '点赞'}：${post.title}`} aria-pressed={liked.includes(post.id)} disabled={post.status !== 'visible'} onClick={() => onLike(post.id)}><Heart size={17} fill={liked.includes(post.id) ? 'currentColor' : 'none'}/>{post.likes}</button><button onClick={() => onOpen(post.id)} aria-label={`评论：${post.title}`}><MessageCircle size={17}/> 讨论</button><button aria-label={`${saved.includes(post.id) ? '取消收藏' : '收藏'}：${post.title}`} aria-pressed={saved.includes(post.id)} disabled={post.status !== 'visible'} onClick={() => onSave(post.id)}><Bookmark size={17} fill={saved.includes(post.id) ? 'currentColor' : 'none'}/>{saved.includes(post.id) ? '已收藏' : '收藏'}</button>{post.ownerId === viewerId && typeof post.viewCount === 'number' && <span><Eye size={15}/> {post.viewCount}</span>}</footer>
  </article>)}</div>
}

function CommunityHotLists({ posts, hotLists, board, onBoard, onOpen }: { posts: Pick<Post,'id'|'title'|'board'|'author'|'status'>[]; hotLists?: {eligiblePostCount: number; overall: string[]; byBoard: Record<string, string[]>}; board: string; onBoard: (board: string) => void; onOpen: (id: string) => void }) {
  const eligibleCount = hotLists?.eligiblePostCount ?? posts.filter(post => post.status === 'visible').length
  const open = eligibleCount > 75
  const activeIds = board === '全部' ? hotLists?.overall : hotLists?.byBoard[board]
  const byId = new Map(posts.filter(post => post.status === 'visible').map(post => [post.id, post]))
  const ranked = (activeIds ?? []).slice(0, 10).map(id => byId.get(id)).filter((post): post is Pick<Post,'id'|'title'|'board'|'author'|'status'> => Boolean(post))
  return <section className="v2-hot-list v2-panel" aria-label="社区热点榜"><div className="v2-hot-header"><span><Flame size={19}/><strong>热点榜</strong><small>最近 7 天 · 综合热度</small></span><span className="v2-hot-count">公开帖子 {eligibleCount} 篇</span></div>
    {open && hotLists ? <><div className="v2-hot-tabs" aria-label="热点榜话题">{boards.map(item => <button type="button" key={item} className={board === item ? 'is-active' : ''} aria-pressed={board === item} onClick={() => onBoard(item)}>{item === '全部' ? '综合' : item}</button>)}</div>{ranked.length ? <ol className="v2-hot-rows">{ranked.map((post, index) => <li key={post.id}><button type="button" onClick={() => onOpen(post.id)}><span className={`v2-hot-rank rank-${index + 1}`}>{index + 1}</span><span><strong>{post.title}</strong><small>{post.board} · {post.author}</small></span><ArrowRight size={15}/></button></li>)}</ol> : <p className="v2-hot-empty">该话题最近 7 天暂无有效互动。</p>}</> : <p className="v2-hot-empty">{open ? '热点榜数据暂不可用。' : '全社区公开帖子超过 75 篇后开放综合榜和话题榜。'}</p>}
  </section>
}

export function V2Community() {
  const location = useLocation()
  const navigate = useNavigate()
  const [board, setBoard] = useState(() => { const requested = new URLSearchParams(location.search).get('board'); return requested && boards.includes(requested) ? requested : '全部' })
  const [hotBoard, setHotBoard] = useState('全部')
  const [query, setQuery] = useState('')
  const [sort,setSort]=useState<'recommended'|'newest'>('recommended')
  const state = useCommunityBackend({board,query,sort})
  const studentName = state.account.nickname || state.account.name
  const [compose, setCompose] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [draftImages, setDraftImages] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const [processingImages, setProcessingImages] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftBoard, setDraftBoard] = useState('校园')
  useEffect(() => { if (new URLSearchParams(location.search).get('compose') === '1') setCompose(true) }, [location.search])
  const linkedPost=new URLSearchParams(location.search).get('item')
  useEffect(()=>{if(linkedPost) void state.loadPost(linkedPost)
    // Loading a linked post is tied to the URL, not to feed refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[linkedPost])
  const closeCompose = () => { setCompose(false); setImageError(''); if (new URLSearchParams(location.search).has('compose')) navigate('/v2/community', { replace: true }) }
  const visible = state.posts
  const current = state.detailPost?.id === (selected ?? new URLSearchParams(location.search).get('item')) ? state.detailPost : null
  const openPost = (id: string) => { setSelected(id); void state.recordOpen(id) }
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
    if (id) { closeCompose(); setDraftImages([]); setDraftTitle(''); setDraftBody(''); setSelected(id) }
  }
  const toggleSave = (id: string) => { void state.mutate('relation.set', { id, kind: 'save', enabled: !state.savedPosts.includes(id) }) }
  const toggleLike = (id: string) => { void state.mutate('relation.set', { id, kind: 'like', enabled: !state.likedPosts.includes(id) }) }
  return <div className="v2-page v2-community-page">
    <PageHeading eyebrow="CAMPUS / COMMUNITY" title="校园社区" description="浏览同学分享，或发布你的校园日常。" action={<button type="button" className="v2-button v2-button-primary v2-community-compose-desktop" onClick={() => setCompose(true)}><Plus size={17}/> 发布帖子</button>}/>
    <section className="reference-community-hero" style={{backgroundImage:`linear-gradient(90deg,#193b59bb,#193b5920),url(${campusPhoto})`}}><span>校园日常</span></section>
    <div className="v2-social-layout">
      <section className="v2-social-main">{(state.hotLists?.eligiblePostCount ?? 0) > 75 && <CommunityHotLists posts={state.hotPosts ?? []} hotLists={state.hotLists} board={hotBoard} onBoard={setHotBoard} onOpen={openPost}/>}<div className="v2-social-filter v2-panel"><div className="reference-community-tools"><div aria-label="帖子排序"><button type="button" className={sort==='recommended'?'is-active':''} aria-pressed={sort==='recommended'} onClick={()=>setSort('recommended')}>推荐</button><button type="button" className={sort==='newest'?'is-active':''} aria-pressed={sort==='newest'} onClick={()=>setSort('newest')}>最新</button></div><label><Search size={16}/><input aria-label="搜索帖子" placeholder="搜索帖子" value={query} onChange={event => setQuery(event.target.value)}/></label></div><div className="v2-filter-pills" aria-label="内容分类">{boards.map((item) => <button type="button" aria-pressed={board === item} className={board === item ? 'is-active' : ''} onClick={() => setBoard(item)} key={item}>{item}</button>)}</div></div>
        <DiscoveryFeed key={`${query}|${board}|${sort}`} posts={visible} liked={state.likedPosts} saved={state.savedPosts} viewerId={state.account.id} onOpen={openPost} onLike={toggleLike} onSave={toggleSave}/>
        {state.hasMore && <button type="button" className="v2-button v2-button-secondary" onClick={()=>void state.loadMore()}>加载更多帖子</button>}
        {(!visible.length || state.error) && <Empty icon={MessageCircle} title={state.error || (state.account.id ? "暂无帖子" : "正在读取帖子…")} description="换个分类或搜索词再看看。"/>}
      </section>
      <aside className="v2-social-aside"><div className="v2-panel v2-social-profile"><DisplayAvatar className="v2-social-avatar is-self" name={studentName} avatar={state.account.avatar} personId={state.account.id}/><div><strong>{studentName}</strong><small>分享你眼中的校园</small></div><button type="button" onClick={() => setCompose(true)}>发布 <ArrowRight size={14}/></button></div><div className="v2-panel"><span className="v2-eyebrow">CAMPUS VOICES</span><h3>让校园故事被看见</h3><p>照片、经历或问题，都可以成为下一段交流的开始。</p><span className="v2-social-aside-note"><Camera size={16}/> 最多 9 张图片 · 文字检查通过后直接发布</span></div></aside>
    </div>
    {createPortal(<button type="button" className="v2-community-compose v2-a-community-compose" aria-label="发布帖子" onClick={() => setCompose(true)}><span className="v2-community-compose-circle"><Plus size={26}/></span></button>, document.body)}
    {compose && <Modal title="发布社区帖子" onClose={closeCompose}><form className="v2-form v2-social-compose" onSubmit={publish}><label>话题标题<input name="title" required maxLength={80} value={draftTitle} onChange={event => setDraftTitle(event.target.value)} placeholder="想和同学聊什么？"/></label><label>选择分区<select name="board" value={draftBoard} onChange={event => setDraftBoard(event.target.value)}>{boards.slice(1).filter((item) => !item.startsWith('校友')).map((item) => <option key={item}>{item}</option>)}</select></label><label>正文<textarea name="body" required rows={6} maxLength={1000} value={draftBody} onChange={event => setDraftBody(event.target.value)} placeholder="分享一点具体的经历或问题"/><small className="reference-word-count">{draftBody.length} / 1000</small></label><div className="v2-image-uploader"><div className="v2-image-uploader-head"><strong>添加图片</strong><span>{draftImages.length} / 9 张</span></div><div className="v2-upload-grid">{draftImages.map((src, index) => <div className="v2-upload-thumb" key={`${index}-${src.slice(-24)}`}><img src={src} alt={`待发布图片 ${index + 1}`}/><button type="button" aria-label={`移除第 ${index + 1} 张图片`} onClick={() => setDraftImages((items) => items.filter((_, number) => number !== index))}><X size={13}/></button></div>)}{draftImages.length < 9 && <label className="v2-upload-add"><ImagePlus size={22}/><span>{processingImages ? '处理中…' : '添加照片'}</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={processingImages}/></label>}</div>{(imageError || state.error) && <p className="v2-upload-error" role="alert">{imageError || state.error}</p>}<small>最多 9 张，图片会压缩后上传保存。</small></div><p className="v2-form-note">文字检查通过后直接公开；命中屏蔽词时请修改。</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={closeCompose}>取消</button><button type="submit" className="v2-button v2-button-primary" disabled={processingImages || state.busy || !draftTitle.trim() || !draftBody.trim()}>发布帖子</button></div></form></Modal>}
    {current && <CommunityPostDetail key={current.id} live={state} id={current.id} onClose={() => { setSelected(null); if (location.search) navigate('/v2/community', { replace: true }) }}/>}
  </div>
}
