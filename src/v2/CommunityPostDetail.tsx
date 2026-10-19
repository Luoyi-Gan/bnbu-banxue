import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import { Bookmark, ChevronLeft, ChevronRight, Eye, Heart, Send, MessageCircle, MoreHorizontal, X } from 'lucide-react'
import { useRef, useState, type FormEvent, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import { studentName, type Post } from '../../shared/v2/model'
import { alumniData } from '../../shared/v2/alumniPolicy'
import { addPostComment, canReadPost, setPostReaction } from './postInteractions'
import { photosForPost, usesCampusIllustration } from './postPresentation'
import { useV2 } from './useV2'
import type { CommunityBackend } from './useCommunityBackend'
import { Drawer } from './ui'
import {CommunityModal as Modal} from './CommunityModal'
import {useCommunitySocial} from './useCommunitySocial'
import './communitySocial.css'
import { DiscoveryDetail } from './DiscoveryDetail'
import { detailDate } from './detailPresentation'
import { DisplayAvatar } from './DisplayAvatar'

function PostMedia({post}:{post:Post}){useUiLanguage()
  const [index,setIndex]=useState(0),[failed,setFailed]=useState<string|null>(null),[zoom,setZoom]=useState(false),start=useRef<number|null>(null)
  const photos=photosForPost(post),active=Math.min(index,photos.length-1),src=photos[active]
  const step=(delta:number)=>setIndex(value=>(value+delta+photos.length)%photos.length)
  const end=(event:TouchEvent)=>{if(start.current!==null&&photos.length>1){const delta=event.changedTouches[0].clientX-start.current;if(Math.abs(delta)>45)step(delta<0?1:-1)}start.current=null}
  if(!photos.length)return null
  return <><div className="v2-social-media" onTouchStart={event=>{start.current=event.touches[0].clientX}} onTouchEnd={end}>
    {failed===src?<span className="v2-post-media-error">{uiText('图片暂不可用')}</span>:<button type="button" className="community-media-lightbox" aria-label={uiText('查看大图')} onClick={()=>setZoom(true)} onKeyDown={event=>{if(event.key==='ArrowLeft')step(-1);if(event.key==='ArrowRight')step(1)}}><img src={src} alt={uiTemplate(['','，第 ',' 张图片'],post.title,active+1)} decoding="async" onError={()=>setFailed(src)}/></button>}
    {photos.length>1&&<><button type="button" className="v2-social-media-arrow is-prev" aria-label={uiText('上一张图片')} onClick={()=>step(-1)}><ChevronLeft size={19}/></button><button type="button" className="v2-social-media-arrow is-next" aria-label={uiText('下一张图片')} onClick={()=>step(1)}><ChevronRight size={19}/></button><span className="v2-social-media-count">{active+1} / {photos.length}</span></>}
  </div>{usesCampusIllustration(post)&&<p className="v2-form-note">{uiText('校园配图，仅作内容封面。')}</p>}{zoom&&<Modal title={post.title} onClose={()=>setZoom(false)}><img className="community-image-view" src={src} alt={post.title}/>{photos.length>1&&<div className="community-list-pages"><button onClick={()=>step(-1)}>{uiText('上一张图片')}</button><span>{active+1}/{photos.length}</span><button onClick={()=>step(1)}>{uiText('下一张图片')}</button></div>}</Modal>}</>
}

export function CommunityPostDetail({ id, onClose, live }: { id: string; onClose: () => void; live?: CommunityBackend }) { useUiLanguage();
  const { state: previewState, setState, persistenceError } = useV2()
  const state = live ? { ...previewState, posts: live.detailPost ? [...live.posts.filter(item=>item.id!==live.detailPost!.id),live.detailPost] : live.posts, likedPosts: live.likedPosts, savedPosts: live.savedPosts } : previewState
  const [text,setText]=useState(''),[confirmDelete,setConfirmDelete]=useState(false),[sheet,setSheet]=useState(false),[report,setReport]=useState<string|null>(null),[reason,setReason]=useState('内容不实'),[reportText,setReportText]=useState(''),[feedback,setFeedback]=useState(''),[reply,setReply]=useState<{id:string;author:string}|null>(null),[expanded,setExpanded]=useState<string[]>([]),[commentAction,setCommentAction]=useState<string|null>(null),[deleteComment,setDeleteComment]=useState(false)
  const input=useRef<HTMLInputElement>(null),comments=useRef<HTMLElement>(null)
  const post=state.posts.find(item=>item.id===id&&(live||canReadPost(state,item)))
  const social=useCommunitySocial(post?.ownerId??'')
  if(!post)return <Drawer title={uiText('内容暂不可见')} onClose={onClose}><p>{uiText('该内容已下架或暂无查看权限。')}</p></Drawer>
  const liked=state.likedPosts.includes(id),saved=state.savedPosts.includes(id),publicPost=post.status==='visible',own=live?post.ownerId===live.account.id:post.author===studentName
  const shownComments=post.comments.filter(item=>live||item.status==='visible'||item.status==='pending'&&item.author===studentName)
  const alumnus=live?live.alumniProfiles?.find(profile=>profile.id===post.alumniId):alumniData(state).profiles.find(profile=>profile.id===post.alumniId&&profile.status==='approved')
  const toggle = (kind: 'likedPosts' | 'savedPosts') => { if (live) { void live.mutate('relation.set', { id, kind: kind === 'likedPosts' ? 'like' : 'save', enabled: !state[kind].includes(id) }); return } setState(value => setPostReaction(value, id, kind, !value[kind].includes(id))) }
  const comment = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (live) { if (await live.mutate('comment.create', { postId: id, body: text, ...(reply?{replyToId:reply.id}:{}) })) {setText('');setReply(null)}; return } setState(value => addPostComment(value, id, text)); setText('') }
  const remove = async () => {
    if (!live) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    if (await live.mutate('post.delete', { id })) onClose()
  }
  const reportSubmit=async(event:FormEvent)=>{event.preventDefault();if(!live||!report)return;if(await live.mutate('report.create',{id:report,reason:`${reason}${reportText.trim()?`：${reportText.trim()}`:''}`})){setReport(null);setFeedback('举报已提交，可在通知中查看处理结果。')}}
  const commentItem=post.comments.find(item=>item.id===commentAction)
  const renderComment=(item:Post['comments'][number])=><div className={`note-detail-comment${item.parentId?' is-reply':''}`} key={item.id}><Link to={`/v2/community?person=${encodeURIComponent(item.ownerId??'')}`} onClick={onClose}><DisplayAvatar className="note-detail-avatar" name={item.author} avatar={item.authorAvatar} personId={item.ownerId}/></Link><div><Link className="community-comment-author" to={`/v2/community?person=${encodeURIComponent(item.ownerId??'')}`} onClick={onClose}><strong>{item.author}</strong></Link>{item.ownerId===post.ownerId&&<span className="community-author-tag">{uiText('作者')}</span>}{item.status==='pending'&&<small>{uiText('待审核')}</small>}<p>{item.replyToAuthor&&<span className="community-reply-label">{uiText('回复')} {item.replyToAuthor}： </span>}{item.body}</p><div className="community-comment-tools"><small>{detailDate(item.date)}</small>{live&&publicPost&&<><button onClick={()=>{setReply({id:item.id,author:item.author});input.current?.focus()}}>{uiText('回复')}</button><button aria-label={uiTemplate(['','评论：',''],uiText(item.liked?'取消点赞':'点赞'),item.author)} aria-pressed={item.liked??false} disabled={live.busy} onClick={()=>void live.mutate('comment.like',{id:item.id,enabled:!item.liked})}><Heart size={14} fill={item.liked?'currentColor':'none'}/>{item.likes||''}</button><button aria-label={uiTemplate(['评论选项：',''],item.author)} onClick={()=>{setDeleteComment(false);setCommentAction(item.id)}}><MoreHorizontal size={16}/></button></>}</div></div></div>
  const roots=shownComments.filter(item=>!item.parentId||!shownComments.some(parent=>parent.id===item.parentId))
  return <><DiscoveryDetail title={post.title} onClose={onClose}
    identity={<div className="social-note-identity"><Link className="note-detail-identity" to={`/v2/community?person=${encodeURIComponent(post.ownerId??'')}`} onClick={onClose}><DisplayAvatar className="note-detail-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span><strong>{post.author}</strong><small>{uiText(post.board)}{!publicPost?uiText(' · 待审核'):''}</small></span></Link>{live&&!own&&<button className="community-outline" disabled={live.busy||!social.data||social.data.profile.blocked} onClick={()=>void live.mutate('social.follow',{targetId:post.ownerId,enabled:!social.data?.profile.isFollowing}).then(()=>social.refresh())}>{uiText(social.data?.profile.isFollowing?'已关注':'关注')}</button>}<button className="social-note-more" aria-label={uiText('笔记选项')} onClick={()=>{setSheet(true);setConfirmDelete(false)}}><MoreHorizontal size={22}/></button></div>}
    media={photosForPost(post).length?<PostMedia key={id} post={post}/>:undefined}
    actions={<>
      {reply&&<div className="community-reply-target">{uiText('回复')} {reply.author}<button aria-label={uiText('取消回复')} onClick={()=>setReply(null)}><X size={15}/></button></div>}
      {publicPost&&<form onSubmit={comment} className="note-detail-comment-form"><input ref={input} value={text} onChange={event=>setText(event.target.value)} placeholder={uiText(reply?'写下你的回复':'写下你的评论')} maxLength={300} aria-label={uiText('评论内容')}/><button type="submit" aria-label={uiText('提交评论')} disabled={!text.trim()||live?.busy}><Send size={18}/></button></form>}
      <button className="community-count-action" type="button" disabled={!publicPost||live?.busy} aria-label={uiTemplate(['','，当前 ',' 个赞'],uiText(liked?'取消点赞':'点赞'),post.likes)} aria-pressed={liked} onClick={()=>toggle('likedPosts')}><Heart size={21} fill={liked?'currentColor':'none'}/><span>{post.likes}</span></button>
      <button className="community-count-action" type="button" disabled={!publicPost||live?.busy} aria-label={uiText(saved?'已收藏':'收藏')} aria-pressed={saved} onClick={()=>toggle('savedPosts')}><Bookmark size={21} fill={saved?'currentColor':'none'}/><span>{post.saves||''}</span></button>
      <button className="community-count-action" type="button" aria-label={uiText('查看评论')} onClick={()=>{comments.current?.scrollIntoView({block:'start'});input.current?.focus({preventScroll:true})}}><MessageCircle size={21}/><span>{post.commentCount||''}</span></button>
    </>}>
    <p className="note-detail-prose">{post.body}</p>
    <Link className="community-note-topic" to={`/v2/community?board=${encodeURIComponent(post.board)}`} onClick={onClose}>#{uiText(post.board)}</Link>
    <div className="note-detail-date"><time dateTime={post.date}>{detailDate(post.date)}</time>{post.editedAt&&<span>{uiText('已编辑')}</span>}{live&&own&&typeof post.viewCount==='number'&&<span className="v2-post-owner-views"><Eye size={15}/>{post.viewCount} {uiText('次浏览')}</span>}</div>
    {alumnus&&<Link className="note-detail-alumni-link" to={`/v2/alumni?person=${encodeURIComponent(alumnus.id)}`} onClick={onClose}>{uiTemplate(['了解',' · 查看交流时段'],post.author)}<ChevronRight size={16}/></Link>}
    {!publicPost&&<p className="note-detail-status">{uiText('内容审核通过后可点赞、收藏和评论。')}</p>}
    {(live?live.error:persistenceError)&&<p role="alert" className="note-detail-status">{live?uiText(live.error):uiText('本机保存失败，请检查浏览器存储空间。')}</p>}
    {feedback&&<p role="status" className="note-detail-status">{uiText(feedback)}</p>}
    <section ref={comments} className="note-detail-comments"><h3>{uiText('评论')}<small>{post.commentCount??post.comments.filter(item=>item.status==='visible').length}</small></h3>
      {!shownComments.length&&<p className="note-detail-status">{uiText(publicPost?'还没有评论，聊聊你的想法吧。':'暂无公开评论')}</p>}
      {roots.map(root=><div key={root.id}>{renderComment(root)}{shownComments.some(item=>item.parentId===root.id)&&<>{expanded.includes(root.id)?shownComments.filter(item=>item.parentId===root.id).map(renderComment):null}<button className="community-comment-toggle" onClick={()=>setExpanded(value=>value.includes(root.id)?value.filter(id=>id!==root.id):[...value,root.id])}>{expanded.includes(root.id)?uiText('收起回复'):uiTemplate(['展开 ',' 条回复'],shownComments.filter(item=>item.parentId===root.id).length)}</button></>}</div>)}
      {live?.detailCommentsHasMore&&<button type="button" className="v2-text-button" onClick={()=>void live.loadPost(id,live.detailCommentPage+1)}>{uiText('加载更多评论')}</button>}
    </section>
  </DiscoveryDetail>
  {sheet&&<Modal title={uiText('笔记选项')} onClose={()=>setSheet(false)}><div className="community-sheet-actions"><button onClick={()=>void navigator.clipboard.writeText(`${window.location.origin}/v2/community?item=${encodeURIComponent(id)}`).then(()=>{setFeedback('链接已复制');setSheet(false)}).catch(()=>setFeedback('无法复制链接，请从地址栏复制。'))}>{uiText('复制链接')}</button>{live&&own&&<><Link onClick={()=>{setSheet(false);onClose()}} to={`/v2/community?edit=${encodeURIComponent(id)}`}>{uiText('编辑笔记')}</Link><button disabled={live.busy} onClick={()=>void remove()}>{uiText(confirmDelete?'确认删除帖子':'删除帖子')}</button>{confirmDelete&&<p>{uiText('再次点击“确认删除帖子”，帖子及评论将从社区隐藏。')}</p>}</>}{live&&!own&&<><button onClick={()=>{setSheet(false);setReport(id)}}>{uiText('举报笔记')}</button><button disabled={live.busy} onClick={()=>void live.mutate('social.dismiss',{id}).then(ok=>{if(ok){setSheet(false);onClose()}})}>{uiText('不感兴趣')}</button><button disabled={live.busy} onClick={()=>void live.mutate('social.block',{targetId:post.ownerId,enabled:true}).then(ok=>{if(ok){setSheet(false);onClose()}})}>{uiText('屏蔽该用户')}</button></>}</div>{live?.error&&<p role="alert">{uiText(live.error)}</p>}</Modal>}
  {commentAction&&commentItem&&live&&<Modal title={uiText('评论选项')} onClose={()=>setCommentAction(null)}><div className="community-sheet-actions">{commentItem.ownerId===live.account.id?<button disabled={live.busy} onClick={()=>{if(!deleteComment){setDeleteComment(true);return}void live.mutate('comment.delete',{id:commentItem.id}).then(ok=>{if(ok)setCommentAction(null)})}}>{uiText(deleteComment?'确认删除评论':'删除评论')}</button>:<button onClick={()=>{setCommentAction(null);setReport(commentItem.id)}}>{uiText('举报评论')}</button>}</div>{live.error&&<p role="alert">{uiText(live.error)}</p>}</Modal>}
  {report&&<Modal title={uiText('举报内容')} onClose={()=>setReport(null)}><form className="community-report-form" onSubmit={reportSubmit}>{['内容不实','人身攻击','广告营销','侵犯隐私','其他问题'].map(item=><label key={item}><input type="radio" name="reportReason" value={item} checked={reason===item} onChange={()=>setReason(item)}/>{uiText(item)}</label>)}<textarea aria-label={uiText('补充说明')} value={reportText} onChange={event=>setReportText(event.target.value)} rows={3} maxLength={500} placeholder={uiText('补充具体情况，帮助我们处理')}/><button className="community-primary" disabled={live?.busy} type="submit">{uiText('提交举报')}</button>{live?.error&&<p role="alert">{uiText(live.error)}</p>}</form></Modal>}
  </>
}
