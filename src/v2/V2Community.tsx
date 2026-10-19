import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import { ArrowRight, Flame, ImagePlus, MessageCircle, Plus, Search, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { prepareCommunityImage } from './communityImages'
import { type Post } from '../../shared/v2/model'
import { Empty, Modal, PageHeading } from './ui'
import { useCommunityBackend } from './useCommunityBackend'

import { CommunityDiscoveryFeed } from './CommunityDiscoveryFeed'
import { CommunityPostDetail } from './CommunityPostDetail'
import './communityFeed.css'

const boards = ['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业']

function CommunityHotLists({ posts, hotLists, board, onBoard, onOpen }: { posts: Pick<Post,'id'|'title'|'board'|'author'|'status'>[]; hotLists?: {eligiblePostCount: number; overall: string[]; byBoard: Record<string, string[]>}; board: string; onBoard: (board: string) => void; onOpen: (id: string) => void }) { useUiLanguage();
  const eligibleCount = hotLists?.eligiblePostCount ?? posts.filter(post => post.status === 'visible').length
  const open = eligibleCount > 75
  const activeIds = board === '全部' ? hotLists?.overall : hotLists?.byBoard[board]
  const byId = new Map(posts.filter(post => post.status === 'visible').map(post => [post.id, post]))
  const ranked = (activeIds ?? []).slice(0, 10).map(id => byId.get(id)).filter((post): post is Pick<Post,'id'|'title'|'board'|'author'|'status'> => Boolean(post))
  return <section className="v2-hot-list v2-panel" aria-label={uiText("社区热点榜")}><div className="v2-hot-header"><span><Flame size={19}/><strong>{uiText("热点榜")}</strong><small>{uiText("最近 7 天 · 综合热度")}</small></span><span className="v2-hot-count">{uiText("公开帖子")}{eligibleCount} {uiText("篇")}</span></div>
    {open && hotLists?<><div className="v2-hot-tabs" aria-label={uiText("热点榜话题")}>{boards.map(item => <button type="button" key={item} className={board === item ? 'is-active' : ''} aria-pressed={board === item} onClick={() => onBoard(item)}>{item === '全部'?uiText('综合'):item}</button>)}</div>{ranked.length ? <ol className="v2-hot-rows">{ranked.map((post, index) => <li key={post.id}><button type="button" onClick={() => onOpen(post.id)}><span className={`v2-hot-rank rank-${index + 1}`}>{index + 1}</span><span><strong>{post.title}</strong><small>{post.board} · {post.author}</small></span><ArrowRight size={15}/></button></li>)}</ol> : <p className="v2-hot-empty">{uiText("该话题最近 7 天暂无有效互动。")}</p>}</>:<p className="v2-hot-empty">{open?uiText('热点榜数据暂不可用。'):uiText('全社区公开帖子超过 75 篇后开放综合榜和话题榜。')}</p>}
  </section>
}

export function V2Community() { useUiLanguage();
  const location = useLocation()
  const navigate = useNavigate()
  const [board, setBoard] = useState(() => { const requested = new URLSearchParams(location.search).get('board'); return requested && boards.includes(requested) ? requested : '全部' })
  const [hotBoard, setHotBoard] = useState('全部')
  const [query, setQuery] = useState('')
  const [sort,setSort]=useState<'recommended'|'newest'>('recommended')
  const state = useCommunityBackend({board,query,sort})
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
    <PageHeading eyebrow="CAMPUS / COMMUNITY" title={uiText("校园社区")} description={uiText("浏览同学分享，或发布你的校园日常。")} action={<button type="button" className="v2-button v2-button-primary v2-community-compose-action" onClick={() => setCompose(true)}><Plus size={17}/> {uiText("发布帖子")}</button>}/>
    <div className="v2-social-layout">
      <section className="v2-social-main">{(state.hotLists?.eligiblePostCount ?? 0) > 75 && <CommunityHotLists posts={state.hotPosts ?? []} hotLists={state.hotLists} board={hotBoard} onBoard={setHotBoard} onOpen={openPost}/>}<div className="v2-social-filter v2-panel"><div className="reference-community-tools"><div aria-label={uiText("帖子排序")}><button type="button" className={sort==='recommended'?'is-active':''} aria-pressed={sort==='recommended'} onClick={()=>setSort('recommended')}>{uiText("推荐")}</button><button type="button" className={sort==='newest'?'is-active':''} aria-pressed={sort==='newest'} onClick={()=>setSort('newest')}>{uiText("最新")}</button></div><label><Search size={16}/><input aria-label={uiText("搜索帖子")} placeholder={uiText("搜索帖子")} value={query} onChange={event => setQuery(event.target.value)}/></label></div><div className="v2-filter-pills" aria-label={uiText("内容分类")}>{boards.map((item) => <button type="button" aria-pressed={board === item} className={board === item?'is-active':''} onClick={() => setBoard(item)} key={item}>{item}</button>)}</div></div>
        <CommunityDiscoveryFeed hasMore={state.hasMore} onLoadMore={()=>void state.loadMore()} busy={state.busy} key={`${query}|${board}|${sort}`} posts={visible} liked={state.likedPosts} saved={state.savedPosts} viewerId={state.account.id} onOpen={openPost} onLike={toggleLike} onSave={toggleSave}/>
        {(!visible.length || state.error) && <Empty icon={MessageCircle} title={state.error || (state.account.id ? "暂无帖子" : "正在读取帖子…")} description={uiText("换个分类或搜索词再看看。")}/>}
      </section>
    </div>
    {compose && <Modal title={uiText("发布社区帖子")} onClose={closeCompose}><form className="v2-form v2-social-compose" onSubmit={publish}><label>{uiText("话题标题")}<input name="title" required maxLength={80} value={draftTitle} onChange={event => setDraftTitle(event.target.value)} placeholder={uiText("想和同学聊什么？")}/></label><label>{uiText("选择分区")}<select name="board" value={draftBoard} onChange={event => setDraftBoard(event.target.value)}>{boards.slice(1).filter((item) => !item.startsWith('校友')).map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>{uiText("正文")}<textarea name="body" required rows={6} maxLength={1000} value={draftBody} onChange={event => setDraftBody(event.target.value)} placeholder={uiText("分享一点具体的经历或问题")}/><small className="reference-word-count">{draftBody.length} / 1000</small></label><div className="v2-image-uploader"><div className="v2-image-uploader-head"><strong>{uiText("添加图片")}</strong><span>{draftImages.length} {uiText("/ 9 张")}</span></div><div className="v2-upload-grid">{draftImages.map((src, index) => <div className="v2-upload-thumb" key={`${index}-${src.slice(-24)}`}><img src={src} alt={uiTemplate(["待发布图片 ",""],index + 1)}/><button type="button" aria-label={uiTemplate(["移除第 "," 张图片"],index + 1)} onClick={() => setDraftImages((items) => items.filter((_, number) => number !== index))}><X size={13}/></button></div>)}{draftImages.length < 9 && <label className="v2-upload-add"><ImagePlus size={22}/><span>{processingImages?uiText('处理中…'):uiText('添加照片')}</span><input type="file" accept="image/*" multiple onChange={addImages} disabled={processingImages}/></label>}</div>{(imageError || state.error) && <p className="v2-upload-error" role="alert">{imageError || state.error}</p>}<small>{uiText("最多 9 张，图片会压缩后上传保存。")}</small></div><p className="v2-form-note">{uiText("文字检查通过后直接公开；命中屏蔽词时请修改。")}</p><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={closeCompose}>{uiText("取消")}</button><button type="submit" className="v2-button v2-button-primary" disabled={processingImages || state.busy || !draftTitle.trim() || !draftBody.trim()}>{uiText("发布帖子")}</button></div></form></Modal>}
    {current && <CommunityPostDetail key={current.id} live={state} id={current.id} onClose={() => { setSelected(null); if (location.search) navigate('/v2/community', { replace: true }) }}/>}
  </div>
}
