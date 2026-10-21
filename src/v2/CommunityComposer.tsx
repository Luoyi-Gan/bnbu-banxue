import {useEffect,useState,type ChangeEvent,type FormEvent} from 'react'
import {ChevronLeft,ChevronRight,ImagePlus,X} from 'lucide-react'
import type {Post} from '../../shared/v2/model'
import {api} from '../live/api'
import {DiscoveryDetail} from './DiscoveryDetail'
import {CommunityModal as Modal} from './CommunityModal'
import {prepareCommunityImage} from './communityImages'
import type {CommunityBackend} from './useCommunityBackend'
import {uiText,uiTemplate,useUiLanguage} from './uiLanguage'

export function CommunityComposer({post,draftId,live,onClose,onDone}:{post?:Post;draftId?:string;live:CommunityBackend;onClose:()=>void;onDone:(id?:string)=>void}){
  useUiLanguage()
  const [editing,setEditing]=useState(post),[draftVersion,setDraftVersion]=useState<number>()
  const [title,setTitle]=useState(post?.title??''),[body,setBody]=useState(post?.body??''),[board,setBoard]=useState(post?.board??'校园'),[images,setImages]=useState<string[]>(post?.images??[])
  const [processing,setProcessing]=useState(false),[error,setError]=useState(''),[leaving,setLeaving]=useState(false),[loading,setLoading]=useState(Boolean(draftId)),[draft,setDraft]=useState(draftId)
  const [initial,setInitial]=useState(JSON.stringify([post?.title??'',post?.body??'',post?.board??'校园',post?.images??[]]))
  const dirty=JSON.stringify([title,body,board,images])!==initial
  useEffect(()=>{if(!draftId)return;const controller=new AbortController();void api<{draft:{version:number;data:{title:string;body:string;board:string;images:string[];sourcePostId?:string;sourceVersion?:number}}|null}>(`/api/community/social?draft=${encodeURIComponent(draftId)}`,undefined,controller.signal).then(async result=>{if(!result.draft)throw Error('草稿已失效');const value=result.draft.data;setDraftVersion(result.draft.version);if(value.sourcePostId){const original=await api<{post:Post}>(`/api/community/posts/${encodeURIComponent(value.sourcePostId)}`,undefined,controller.signal);setEditing({...original.post,version:value.sourceVersion})}setTitle(value.title);setBody(value.body);setBoard(value.board);setImages(value.images);setInitial(JSON.stringify([value.title,value.body,value.board,value.images]));setLoading(false)}).catch(cause=>{if(!controller.signal.aborted){setError(cause.message);setLoading(false)}});return()=>controller.abort()},[draftId])
  const close=()=>dirty?setLeaving(true):onClose()
  const addImages=async(event:ChangeEvent<HTMLInputElement>)=>{
    const files=[...event.target.files??[]];event.target.value='';if(!files.length)return
    if(files.length+images.length>9){setError('最多添加 9 张图片');return}
    if(files.some(file=>file.size>20*1024*1024)){setError('单张图片不能超过20MB');return}
    setProcessing(true);setError('')
    try{const next=await Promise.all(files.map(prepareCommunityImage));setImages(value=>[...value,...next])}catch(cause){setError(cause instanceof Error?cause.message:'图片处理失败，请重试')}finally{setProcessing(false)}
  }
  const save=async()=>{if(live.busy||processing||loading)return;const id=await live.mutate('draft.save',{...(draft?{id:draft,version:draftVersion}:{}),...(editing?{sourcePostId:editing.id,sourceVersion:editing.version}:{}),title,body,board,images});if(id){setDraft(id);setInitial(JSON.stringify([title,body,board,images]));onDone()}}
  const publish=async(event:FormEvent)=>{event.preventDefault();if(loading||processing||live.busy||!title.trim()||!body.trim())return;const id=await live.mutate(editing?'post.update':'post.create',{...(editing?{id:editing.id,version:editing.version}:{}),...(draft?{draftId:draft}:{}),title,body,board,images});if(id)onDone(editing?.id??id)}
  const move=(index:number,delta:number)=>setImages(value=>{const next=[...value];[next[index],next[index+delta]]=[next[index+delta],next[index]];return next})
  return <><DiscoveryDetail title={editing?uiText('编辑笔记'):uiText('发布笔记')} identity={<strong>{uiText(editing?'编辑笔记':'发布笔记')}</strong>} onClose={close} actions={<><button type="button" onClick={()=>void save()} disabled={loading||processing||live.busy}>{uiText('存草稿')}</button><button type="submit" form="community-compose" className="community-primary" disabled={loading||processing||live.busy||!title.trim()||!body.trim()}>{uiText(live.busy?'保存中…':editing?'保存修改':'发布笔记')}</button></>}>
    <form id="community-compose" className="community-composer" onSubmit={publish}>
      {loading?<p role="status">{uiText('正在读取草稿…')}</p>:<><div className="community-composer-photos">{images.map((src,index)=><div key={`${index}-${src.slice(-30)}`}><img src={src} alt={uiTemplate(['待发布图片 ',''],index+1)}/>{index===0&&<small>{uiText('封面')}</small>}<button type="button" className="photo-remove" aria-label={uiTemplate(['移除第 ',' 张图片'],index+1)} onClick={()=>setImages(value=>value.filter((_,i)=>i!==index))}><X size={14}/></button><span className="photo-order">{index>0&&<button type="button" aria-label={uiTemplate(['向前移动图片 ',''],index+1)} onClick={()=>move(index,-1)}><ChevronLeft size={15}/></button>}{index<images.length-1&&<button type="button" aria-label={uiTemplate(['向后移动图片 ',''],index+1)} onClick={()=>move(index,1)}><ChevronRight size={15}/></button>}</span></div>)}{images.length<9&&<label className="community-add-photo"><ImagePlus/><span>{uiText(processing?'处理中…':'添加照片')}</span><input type="file" aria-label={uiText('添加照片')} accept="image/jpeg,image/png,image/webp" multiple disabled={processing||live.busy} onChange={addImages}/></label>}</div><p className="community-compose-hint">{images.length}/9 · {uiText('第一张图片作为封面，可调整顺序')}</p>
      <label className="community-compose-title"><span className="sr-only">{uiText('标题')}</span><input aria-label={uiText('标题')} value={title} onChange={event=>setTitle(event.target.value)} maxLength={80} required placeholder={uiText('填写标题会有更多赞哦')}/><small>{title.length}/80</small></label>
      <label><span className="sr-only">{uiText('正文')}</span><textarea aria-label={uiText('正文')} value={body} onChange={event=>setBody(event.target.value)} maxLength={1000} required rows={8} placeholder={uiText('记录这一刻，分享你的校园生活…')}/></label><div className="community-compose-hint">{body.length}/1000</div>
      <fieldset><legend>{uiText('选择分区')}</legend><div className="community-channel-chips">{['校园','学习','生活','活动','互助',...(editing?.alumniId?['校友升学','校友就业']:[])].map(item=><button type="button" aria-pressed={board===item} key={item} onClick={()=>setBoard(item)}>{uiText(item)}</button>)}</div></fieldset><p className="community-compose-hint">{uiText('文字检查通过后直接公开；命中屏蔽词时请修改。')}</p></>}
      {(error||live.error)&&<p role="alert">{uiText(error||live.error)}</p>}
    </form>
  </DiscoveryDetail>{leaving&&<Modal title={uiText('保存这次编辑？')} onClose={()=>setLeaving(false)}><p>{uiText('可以存为草稿，下次继续。')}</p><div className="community-sheet-actions"><button onClick={()=>void save()} disabled={live.busy||processing}>{uiText('保存草稿并离开')}</button><button onClick={onClose}>{uiText('放弃本次编辑')}</button><button onClick={()=>setLeaving(false)}>{uiText('继续编辑')}</button></div>{live.error&&<p role="alert">{uiText(live.error)}</p>}</Modal>}</>
}
