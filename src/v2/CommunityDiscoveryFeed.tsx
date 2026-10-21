import { Heart, Layers }  from 'lucide-react'
import { useState } from 'react'
import type { Post } from '../../shared/v2/model'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { Link } from 'react-router-dom'
import { DisplayAvatar } from './DisplayAvatar'
import { photosForPost } from './postPresentation'
import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'

function PostCover({post}:{post:Post}){
  const src=photosForPost(post)[0]
  const [failed,setFailed]=useState(false),[ratio,setRatio]=useState(.8)
  return <div className="discovery-cover community-discovery-cover" style={{aspectRatio:ratio}}>
    {src&&!failed?<img src={src} alt="" loading="lazy" decoding="async" onLoad={e=>setRatio(Math.max(.7,Math.min(1.5,e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)))} onError={()=>setFailed(true)}/>:<span className="discovery-text-cover"><small>{uiText(post.board)}</small><span>{post.body}</span></span>}
    {photosForPost(post).length>1&&<span className="community-photo-count"><Layers size={14}/></span>}
    {failed&&<span className="community-cover-failed">{uiText('封面暂不可用')}</span>}
  </div>
}

export function CommunityDiscoveryFeed({posts,liked,onOpen,onLike,hasMore=false,onLoadMore,busy=false}:{posts:Post[];liked:string[];saved:string[];viewerId:string;onOpen:(id:string)=>void;onLike:(id:string)=>void;onSave:(id:string)=>void;hasMore?:boolean;onLoadMore?:()=>void;busy?:boolean}){
  useUiLanguage()
  const [pendingLikeId,setPendingLikeId]=useState<string|null>(null)
  return <DiscoveryMasonry items={posts} itemLabel="帖子" hasMore={hasMore} onLoadMore={onLoadMore} busy={busy} renderItem={post=><article className="discovery-card community-discovery-card" key={post.id} data-post-id={post.id}>
    <button type="button" className="community-discovery-open" aria-label={uiTemplate(['查看帖子：',''],post.title)} onClick={()=>onOpen(post.id)}><PostCover key={photosForPost(post)[0]??post.id} post={post}/><strong className="discovery-title">{post.title}</strong></button>
    <div className="discovery-meta"><Link className="discovery-author" to={`/v2/community?person=${encodeURIComponent(post.ownerId??'')}`}><DisplayAvatar className="discovery-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/><span>{post.author}</span></Link><button type="button" className={liked.includes(post.id)?'is-liked':''} aria-label={uiTemplate(['','：',''],uiText(liked.includes(post.id)?'取消点赞':'点赞'),post.title)} aria-pressed={liked.includes(post.id)} disabled={(busy&&pendingLikeId===post.id)||post.status!=='visible'} aria-disabled={busy||post.status!=='visible'} onClick={()=>{if(busy)return;setPendingLikeId(post.id);onLike(post.id)}}><Heart size={16} fill={liked.includes(post.id)?'currentColor':'none'}/>{post.likes}</button></div>
    {post.status==='pending'&&<small className="community-owner-views">{uiText('待审核')}</small>}
  </article>}/>
}
