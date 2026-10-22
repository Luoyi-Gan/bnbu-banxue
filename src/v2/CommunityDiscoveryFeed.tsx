import {useLocation} from 'react-router-dom'
import {knownCoverRatio,rememberCover} from './discoveryCoverCache'
import './materialSkeleton.css'
import { Heart, Layers }  from 'lucide-react'
import { useState } from 'react'
import type { Post } from '../../shared/v2/model'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import {sharedElementTransition} from './sharedElementMotion'
import {SharedMediaLink} from './SharedMediaLink'
import { DisplayAvatar } from './DisplayAvatar'
import { photosForPost } from './postPresentation'
import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'

function PostCover({post,photoIndex=0}:{post:Post;photoIndex?:number}){
  const photos=photosForPost(post),src=photos[Math.min(Math.max(0,photoIndex),photos.length-1)]
  const [failed,setFailed]=useState(false),[loaded,setLoaded]=useState(()=>knownCoverRatio(src)!==undefined),[ratio,setRatio]=useState(()=>knownCoverRatio(src)??.8)
  return <div className={`discovery-cover community-discovery-cover${src&&!failed&&!loaded?' is-loading':''}`} style={{aspectRatio:ratio}} data-shared-media={src?`post:${post.id}`:undefined}>
    {src&&!failed?<img src={src} alt="" loading="lazy" decoding="async" onLoad={e=>{rememberCover(src,e.currentTarget.naturalWidth/e.currentTarget.naturalHeight);setLoaded(true);setRatio(knownCoverRatio(src)??.8)}} onError={()=>setFailed(true)}/>:<span className="discovery-text-cover"><small>{uiText(post.board)}</small><span>{post.body}</span></span>}
    {photosForPost(post).length>1&&<span className="community-photo-count"><Layers size={14}/></span>}
    {failed&&<span className="community-cover-failed">{uiText('封面暂不可用')}</span>}
  </div>
}

export function CommunityDiscoveryFeed({posts,liked,onOpen,onLike,photoIndices={},hasMore=false,onLoadMore,busy=false,viewerId}:{posts:Post[];liked:string[];saved:string[];viewerId:string;photoIndices?:Record<string,number>;onOpen:(id:string)=>void;onLike:(id:string)=>void;onSave:(id:string)=>void;hasMore?:boolean;onLoadMore?:()=>void;busy?:boolean}){
  useUiLanguage()
  const location=useLocation()
  const [pendingLikeId,setPendingLikeId]=useState<string|null>(null)
  return <DiscoveryMasonry entranceScope={`posts:${viewerId}`} items={posts} itemLabel="帖子" hasMore={hasMore} onLoadMore={onLoadMore} busy={busy} renderItem={post=><article className="discovery-card community-discovery-card" key={post.id} data-post-id={post.id}>
    <button type="button" className="community-discovery-open" aria-label={uiTemplate(['查看帖子：',''],post.title)} onClick={event=>sharedElementTransition(`post:${post.id}`,()=>onOpen(post.id),{source:event.currentTarget.querySelector<HTMLElement>('[data-shared-media]')})}><PostCover key={`${post.id}:${photoIndices[post.id]??0}`} post={post} photoIndex={photoIndices[post.id]??0}/><strong className="discovery-title">{post.title}</strong></button>
    <div className="discovery-meta"><SharedMediaLink transitionKey={`avatar:${post.ownerId}`} state={{profileReturnTo:location.pathname+location.search}} resetScroll className="discovery-author" to={`/v2/community?person=${encodeURIComponent(post.ownerId??'')}`}><span className="shared-avatar-source" data-shared-media={`avatar:${post.ownerId}`}><DisplayAvatar className="discovery-avatar" name={post.author} avatar={post.authorAvatar} personId={post.ownerId}/></span><span>{post.author}</span></SharedMediaLink><button type="button" className={liked.includes(post.id)?'is-liked':''} aria-label={uiTemplate(['','：',''],uiText(liked.includes(post.id)?'取消点赞':'点赞'),post.title)} aria-pressed={liked.includes(post.id)} disabled={(busy&&pendingLikeId===post.id)||post.status!=='visible'} aria-disabled={busy||post.status!=='visible'} onClick={()=>{if(busy)return;setPendingLikeId(post.id);onLike(post.id)}}><Heart size={16} fill={liked.includes(post.id)?'currentColor':'none'}/>{post.likes}</button></div>
    {post.status==='pending'&&<small className="community-owner-views">{uiText('待审核')}</small>}
  </article>}/>
}
