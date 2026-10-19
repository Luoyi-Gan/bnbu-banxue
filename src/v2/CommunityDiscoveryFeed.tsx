import { Bookmark, Eye, Heart } from 'lucide-react'
import { useState } from 'react'
import type { Post } from '../../shared/v2/model'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { coverRatio } from './discoveryLayout'
import { DisplayAvatar } from './DisplayAvatar'
import { photosForPost } from './postPresentation'
import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'

function PostCover({post}:{post:Post}){
  const src=photosForPost(post)[0]
  const [failed,setFailed]=useState(false)
  return <div className="discovery-cover community-discovery-cover" style={{aspectRatio:coverRatio(post.id)}}>
    {src&&!failed?<img src={src} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="discovery-text-cover"><small>{uiText(post.board)}</small><span>{post.body}</span></span>}
    {src&&!failed&&<span className="discovery-badge">{uiText(post.board)}</span>}
    {failed&&<span className="community-cover-failed">{uiText('封面暂不可用')}</span>}
  </div>
}

export function CommunityDiscoveryFeed({posts,liked,saved,viewerId,onOpen,onLike,onSave,hasMore=false,onLoadMore,busy=false}:{posts:Post[];liked:string[];saved:string[];viewerId:string;onOpen:(id:string)=>void;onLike:(id:string)=>void;onSave:(id:string)=>void;hasMore?:boolean;onLoadMore?:()=>void;busy?:boolean}){
  useUiLanguage()
  return <DiscoveryMasonry items={posts} itemLabel="帖子" hasMore={hasMore} onLoadMore={onLoadMore} busy={busy} renderItem={post=><article className="discovery-card community-discovery-card" key={post.id} data-post-id={post.id}>
    <button type="button" className="community-discovery-open" aria-label={uiTemplate(['查看帖子：',''],post.title)} onClick={()=>onOpen(post.id)}><PostCover key={photosForPost(post)[0]??post.id} post={post}/><strong className="discovery-title">{post.title}</strong></button>
    <button type="button" className={`discovery-save${saved.includes(post.id)?' is-saved':''}`} aria-label={uiTemplate(['','：',''],uiText(saved.includes(post.id)?'取消收藏':'收藏'),post.title)} aria-pressed={saved.includes(post.id)} disabled={busy||post.status!=='visible'} onClick={()=>onSave(post.id)}><Bookmark size={16} fill={saved.includes(post.id)?'currentColor':'none'}/></button>
    <div className="discovery-meta"><span className="discovery-author"><DisplayAvatar className="discovery-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span>{post.author}</span></span><button type="button" className={liked.includes(post.id)?'is-liked':''} aria-label={uiTemplate(['','：',''],uiText(liked.includes(post.id)?'取消点赞':'点赞'),post.title)} aria-pressed={liked.includes(post.id)} disabled={busy||post.status!=='visible'} onClick={()=>onLike(post.id)}><Heart size={16} fill={liked.includes(post.id)?'currentColor':'none'}/>{post.likes}</button></div>
    {post.ownerId===viewerId&&typeof post.viewCount==='number'&&<span className="community-owner-views"><Eye size={13}/>{post.viewCount}</span>}
    {post.status==='pending'&&<small className="community-owner-views">{uiText('待审核')}</small>}
  </article>}/>
}
