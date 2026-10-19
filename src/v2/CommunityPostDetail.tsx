import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import { Bookmark, ChevronLeft, ChevronRight, Eye, Heart, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { studentName, type Post } from '../../shared/v2/model'
import { alumniData } from '../../shared/v2/alumniPolicy'
import { addPostComment, canReadPost, setPostReaction } from './postInteractions'
import { photosForPost, usesCampusIllustration } from './postPresentation'
import { useV2 } from './useV2'
import type { CommunityBackend } from './useCommunityBackend'
import { Drawer } from './ui'
import { DiscoveryDetail } from './DiscoveryDetail'
import { detailDate } from './detailPresentation'
import { DisplayAvatar } from './DisplayAvatar'

function PostMedia({ post }: { post: Post }) { useUiLanguage();
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)
  const photos = photosForPost(post)
  if (!photos.length) return null
  const activeIndex = Math.min(index, photos.length - 1)
  const src = photos[activeIndex]
  return <><div className="v2-social-media">
    {failed === src?<span className="v2-post-media-error">{uiText("图片暂不可用")}</span>:<img src={src} alt={uiTemplate(["","，第 "," 张图片"],post.title,activeIndex + 1)} decoding="async" onError={() => setFailed(src)}/>}
    {photos.length > 1 && <><button type="button" className="v2-social-media-arrow is-prev" aria-label={uiText("上一张图片")} onClick={() => setIndex((activeIndex - 1 + photos.length) % photos.length)}><ChevronLeft size={19}/></button><button type="button" className="v2-social-media-arrow is-next" aria-label={uiText("下一张图片")} onClick={() => setIndex((activeIndex + 1) % photos.length)}><ChevronRight size={19}/></button><span className="v2-social-media-count">{activeIndex + 1} / {photos.length}</span></>}
  </div>{usesCampusIllustration(post) && <p className="v2-form-note">{uiText("校园配图，仅作内容封面。")}</p>}</>
}

export function CommunityPostDetail({ id, onClose, live }: { id: string; onClose: () => void; live?: CommunityBackend }) { useUiLanguage();
  const { state: previewState, setState, persistenceError } = useV2()
  const state = live ? { ...previewState, posts: live.detailPost ? [...live.posts.filter(item=>item.id!==live.detailPost!.id),live.detailPost] : live.posts, likedPosts: live.likedPosts, savedPosts: live.savedPosts } : previewState
  const [text, setText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const post = state.posts.find(item => item.id === id && (live || canReadPost(state, item)))
  if (!post) return <Drawer title={uiText("内容暂不可见")} onClose={onClose}><p>{uiText("该内容已下架或暂无查看权限。")}</p></Drawer>
  const liked = state.likedPosts.includes(id), saved = state.savedPosts.includes(id)
  const publicPost = post.status === 'visible'
  const shownComments=post.comments.filter(item=>live||item.status==='visible'||item.status==='pending'&&item.author===studentName)
  const alumnus = live ? live.alumniProfiles?.find(profile => profile.id === post.alumniId) : alumniData(state).profiles.find(profile => profile.id === post.alumniId && profile.status === 'approved')
  const toggle = (kind: 'likedPosts' | 'savedPosts') => { if (live) { void live.mutate('relation.set', { id, kind: kind === 'likedPosts' ? 'like' : 'save', enabled: !state[kind].includes(id) }); return } setState(value => setPostReaction(value, id, kind, !value[kind].includes(id))) }
  const comment = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (live) { if (await live.mutate('comment.create', { postId: id, body: text })) setText(''); return } setState(value => addPostComment(value, id, text)); setText('') }
  const remove = async () => {
    if (!live) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    if (await live.mutate('post.delete', { id })) onClose()
  }
  return <DiscoveryDetail title={post.title} onClose={onClose}
    identity={<div className="note-detail-identity"><DisplayAvatar className="note-detail-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span><strong>{post.author}</strong><small>{uiText(post.board)}{!publicPost?uiText(' · 待审核'):''}</small></span></div>}
    media={photosForPost(post).length?<PostMedia key={id} post={post}/>:undefined}
    actions={<>
      {publicPost&&<form onSubmit={comment} className="note-detail-comment-form"><input value={text} onChange={event=>setText(event.target.value)} placeholder={uiText('写下你的评论')} maxLength={300} aria-label={uiText('评论内容')}/><button type="submit" aria-label={uiText('提交评论')} disabled={!text.trim()||live?.busy}><Send size={19}/></button></form>}
      <button type="button" disabled={!publicPost||live?.busy} aria-label={uiTemplate(['','，当前 ',' 个赞'],uiText(liked?'取消点赞':'点赞'),post.likes)} aria-pressed={liked} onClick={()=>toggle('likedPosts')}><Heart size={21} fill={liked?'currentColor':'none'}/><span>{post.likes}</span></button>
      <button type="button" disabled={!publicPost||live?.busy} aria-label={uiText(saved?'已收藏':'收藏')} aria-pressed={saved} onClick={()=>toggle('savedPosts')}><Bookmark size={21} fill={saved?'currentColor':'none'}/></button>
    </>}>
    <p className="note-detail-prose">{post.body}</p>
    <div className="note-detail-date"><time dateTime={post.date}>{detailDate(post.date)}</time>{live&&post.ownerId===live.account.id&&typeof post.viewCount==='number'&&<span className="v2-post-owner-views"><Eye size={15}/>{post.viewCount} {uiText('次浏览')}</span>}</div>
    {alumnus&&<Link className="note-detail-alumni-link" to={`/v2/alumni?person=${encodeURIComponent(alumnus.id)}`} onClick={onClose}>{uiTemplate(['了解',' · 查看交流时段'],post.author)}<ChevronRight size={16}/></Link>}
    {!publicPost&&<p className="note-detail-status">{uiText('内容审核通过后可点赞、收藏和评论。')}</p>}
    {(live?live.error:persistenceError)&&<p role="alert" className="note-detail-status">{live?live.error:uiText('本机保存失败，请检查浏览器存储空间。')}</p>}
    <section className="note-detail-comments"><h3>{uiText('评论')}<small>{post.comments.filter(item=>item.status==='visible').length}</small></h3>
      {!shownComments.length&&<p className="note-detail-status">{uiText(publicPost?'还没有评论，聊聊你的想法吧。':'暂无公开评论')}</p>}
      {shownComments.map(item=><div className="note-detail-comment" key={item.id}><DisplayAvatar className="note-detail-avatar" name={item.author} avatar={item.authorAvatar} personId={item.ownerId}/><div><strong>{item.author} {item.status==='pending'&&<small>{uiText('待审核')}</small>}</strong><p>{item.body}</p><small>{detailDate(item.date)}</small></div></div>)}
      {live?.detailCommentsHasMore&&<button type="button" className="v2-text-button" onClick={()=>void live.loadPost(id,live.detailCommentPage+1)}>{uiText('加载更多评论')}</button>}
    </section>
    {live&&post.ownerId===live.account.id&&<details className="note-detail-manage"><summary>{uiText('管理帖子')}</summary><button type="button" disabled={live.busy} onClick={()=>void remove()}>{confirmDelete?uiText('确认删除帖子'):uiText('删除帖子')}</button>{confirmDelete&&<p>{uiText('再次点击“确认删除帖子”，帖子及评论将从社区隐藏。')}</p>}</details>}
  </DiscoveryDetail>
}
