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
import { Drawer, SectionHeading } from './ui'
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
  const alumnus = live ? live.alumniProfiles?.find(profile => profile.id === post.alumniId) : alumniData(state).profiles.find(profile => profile.id === post.alumniId && profile.status === 'approved')
  const toggle = (kind: 'likedPosts' | 'savedPosts') => { if (live) { void live.mutate('relation.set', { id, kind: kind === 'likedPosts' ? 'like' : 'save', enabled: !state[kind].includes(id) }); return } setState(value => setPostReaction(value, id, kind, !value[kind].includes(id))) }
  const comment = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (live) { if (await live.mutate('comment.create', { postId: id, body: text })) setText(''); return } setState(value => addPostComment(value, id, text)); setText('') }
  const remove = async () => {
    if (!live) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    if (await live.mutate('post.delete', { id })) onClose()
  }
  return <Drawer title={post.title} eyebrow={`${post.board} · ${post.author}`} onClose={onClose}>
    <div className="v2-social-detail-media"><PostMedia key={id} post={post}/></div>
    <p className="v2-detail-date">{post.date}{!publicPost?uiText(' · 待审核'):''}</p><p className="v2-detail-lead">{post.body}</p>
    {alumnus && <Link className="v2-post-alumni-link" to={`/v2/alumni?person=${encodeURIComponent(alumnus.id)}`} onClick={onClose}>{uiText("了解")}{post.author} {uiText("· 查看交流时段")}</Link>}
    <div className="v2-detail-actions"><button type="button" className={`v2-pulse-heart${liked ? ' is-active' : ''}`} disabled={!publicPost} aria-label={uiTemplate(["","，当前 "," 个赞"],uiText(liked ? '取消点赞' : '点赞'),post.likes)} aria-pressed={liked} onClick={() => toggle('likedPosts')}><span className="v2-pulse-heart-icon"><Heart size={22} fill={liked?'currentColor':'none'}/></span><span>{post.likes} {uiText("次赞")}</span></button>{live && post.ownerId === live.account.id && typeof post.viewCount === 'number' && <span className="v2-post-owner-views"><Eye size={17}/>{post.viewCount} {uiText("次浏览")}</span>}<button type="button" className="v2-button v2-button-secondary" disabled={!publicPost} aria-pressed={saved} onClick={() => toggle('savedPosts')}><Bookmark size={16} fill={saved?'currentColor':'none'}/>{saved?uiText('已收藏'):uiText('收藏')}</button>{live && post.ownerId === live.account.id && <button type="button" className="v2-button v2-button-secondary" disabled={live.busy} onClick={() => { void remove() }}>{confirmDelete?uiText('确认删除帖子'):uiText('删除帖子')}</button>}</div>
    {confirmDelete && <p className="v2-form-note">{uiText("再次点击“确认删除帖子”，帖子及评论将从社区隐藏。")}</p>}
    {(live ? live.error : persistenceError) && <p role="alert" className="v2-form-note">{live?live.error:uiText('本机保存失败，请检查浏览器存储空间。')}</p>}
    <div className="v2-comments"><SectionHeading title={uiText("评论")} detail={uiTemplate([""," 条已展示"],post.comments.filter(item => item.status === 'visible').length)}/>{post.comments.filter(item => live || item.status === 'visible' || item.status === 'pending' && item.author === studentName).map(item => <div className="v2-comment" key={item.id}><DisplayAvatar className="v2-avatar" name={item.author} avatar={item.authorAvatar} personId={item.ownerId}/><div><strong>{item.author} {item.status === 'pending' && <small>{uiText("待审核")}</small>}</strong><p>{item.body}</p><small>{item.date}</small></div></div>)}
      {live?.detailCommentsHasMore && <button type="button" className="v2-button v2-button-secondary" onClick={()=>void live.loadPost(id,live.detailCommentPage+1)}>{uiText("加载更多评论")}</button>}
      {publicPost?<form onSubmit={comment} className="v2-comment-form"><input value={text} onChange={event => setText(event.target.value)} placeholder={uiText("写下你的评论")} maxLength={300} aria-label={uiText("评论内容")}/><button type="submit" aria-label={uiText("提交评论")} className="v2-button v2-button-primary" disabled={!text.trim() || live?.busy}><Send size={16}/></button></form>:<p className="v2-form-note">{uiText("内容审核通过后可点赞、收藏和评论。")}</p>}
    </div>
  </Drawer>
}
