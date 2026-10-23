import {useEffect,useRef,useState,type ChangeEvent,type PointerEvent} from 'react'
import {Camera,Move,RotateCcw,Upload} from 'lucide-react'
import {CommunityModal} from './CommunityModal'
import {profileCovers,profileCoverSource} from './profileCovers'
import {command,loadWorkspace} from '../live/api'
import {clampCover,coverCrop} from './coverCrop'
import {uiText,useUiLanguage} from './uiLanguage'
import './profileCoverEditor.css'

export function ProfileCoverEditor({initial,ownerId,aspect=3.2,onClose}:{initial:string;ownerId:string;aspect?:number;onClose:()=>void}){
  async function save(cover:string){
    const latest=await loadWorkspace(),profile=latest.entities.find(e=>e.kind==='profile'&&e.ownerId===latest.account.id)?.data
    if(latest.account.id!==ownerId)throw new Error('登录账号已变化，请重新打开封面编辑。')
    await command('profile.save',{nickname:String(profile?.nickname||latest.account.name),avatar:String(profile?.avatar||''),cover})
    onClose()
  }
  return <CoverImageEditor initial={initial} aspect={aspect} onClose={onClose} onSave={save}/>
}

export function CoverImageEditor({initial,aspect=3.2,deferred=false,onClose,onSave}:{initial:string;aspect?:number;deferred?:boolean;onClose:()=>void;onSave:(cover:string)=>Promise<void>|void}){
  useUiLanguage()
  const [source,setSource]=useState<{url:string;width:number;height:number}|null>(null),[zoom,setZoom]=useState(1),[position,setPosition]=useState({x:.5,y:.5}),[preset,setPreset]=useState<string|null>(null)
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  const active=useRef(true),lock=useRef(false),bitmap=useRef<ImageBitmap|null>(null),objectUrl=useRef('')
  const drag=useRef<{id:number;x:number;y:number}|null>(null)
  useEffect(()=>{active.current=true;return()=>{active.current=false;bitmap.current?.close();URL.revokeObjectURL(objectUrl.current)}},[])
  async function upload(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];event.target.value='';if(!file||lock.current)return
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');return}
    lock.current=true;setBusy(true);setError('')
    try{
      const next=await createImageBitmap(file)
      if(!active.current){next.close();return}
      bitmap.current?.close();URL.revokeObjectURL(objectUrl.current)
      bitmap.current=next;objectUrl.current=URL.createObjectURL(file)
      setSource({url:objectUrl.current,width:next.width,height:next.height});setZoom(1);setPosition({x:.5,y:.5});setPreset(null)
    }catch{if(active.current)setError('图片无法读取，请重新选择。')}
    finally{lock.current=false;if(active.current)setBusy(false)}
  }
  async function choosePreset(key:string){
    if(lock.current)return
    const choice=profileCovers.find(item=>item.key===key);if(!choice)return
    lock.current=true;setBusy(true);setError('')
    try{
      const response=await fetch(choice.image);if(!response.ok)throw new Error('封面图片暂时无法读取。')
      const next=await createImageBitmap(await response.blob())
      if(!active.current){next.close();return}
      bitmap.current?.close();URL.revokeObjectURL(objectUrl.current);objectUrl.current=''
      bitmap.current=next;setSource({url:choice.image,width:next.width,height:next.height});setZoom(1);setPosition({x:.5,y:.5});setPreset(key)
    }catch(cause){if(active.current)setError(cause instanceof Error?cause.message:'封面图片暂时无法读取。')}
    finally{lock.current=false;if(active.current)setBusy(false)}
  }
  const crop=source?coverCrop(source.width,source.height,aspect,zoom,position.x,position.y):null
  function move(event:PointerEvent<HTMLDivElement>){
    const current=drag.current;if(!current||current.id!==event.pointerId||!source||!crop||busy)return
    const rect=event.currentTarget.getBoundingClientRect(),dx=event.clientX-current.x,dy=event.clientY-current.y
    current.x=event.clientX;current.y=event.clientY
    const overflowX=rect.width*(source.width/crop.sw-1),overflowY=rect.height*(source.height/crop.sh-1)
    setPosition(p=>({x:overflowX>0?clampCover(p.x-dx/overflowX):.5,y:overflowY>0?clampCover(p.y-dy/overflowY):.5}))
  }
  async function save(){
    if(lock.current||!bitmap.current||!crop)return
    lock.current=true;setBusy(true);setError('')
    try{
      const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=Math.round(1600/aspect)
      const context=canvas.getContext('2d');if(!context)throw new Error('图片无法读取')
      context.drawImage(bitmap.current,crop.sx,crop.sy,crop.sw,crop.sh,0,0,canvas.width,canvas.height)
      await onSave(preset&&zoom===1&&position.x===.5&&position.y===.5?preset:canvas.toDataURL('image/webp',.85))
    }catch(cause){if(active.current)setError(cause instanceof Error?cause.message:'封面保存失败，请重试。')}
    finally{lock.current=false;if(active.current)setBusy(false)}
  }
  return <CommunityModal title={uiText('自定义封面')} onClose={()=>{if(!lock.current)onClose()}}><div className="profile-cover-editor">
    <div className={`profile-cover-crop${source?' is-editable':''}`} style={{aspectRatio:aspect}} role={source?'group':undefined} aria-label={uiText('拖动调整封面位置')} tabIndex={source?0:undefined}
      onPointerDown={event=>{if(!source||busy||event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);drag.current={id:event.pointerId,x:event.clientX,y:event.clientY}}}
      onPointerMove={move} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
      onKeyDown={event=>{if(!source||busy||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();setPosition(p=>({x:clampCover(p.x+(event.key==='ArrowLeft'?.03:event.key==='ArrowRight'?-.03:0)),y:clampCover(p.y+(event.key==='ArrowUp'?.03:event.key==='ArrowDown'?-.03:0))}))}}>
      {source&&crop?<img draggable={false} src={source.url} alt={uiText('封面预览')} style={{width:`${source.width/crop.sw*100}%`,height:`${source.height/crop.sh*100}%`,left:`${-crop.sx/crop.sw*100}%`,top:`${-crop.sy/crop.sh*100}%`}}/>:<img draggable={false} src={profileCoverSource(initial)} alt={uiText('当前封面')}/>}
      {source&&<span className="profile-cover-guide" aria-hidden="true"/>}
    </div>
    <p><Move size={15}/>{uiText(source?'拖动图片调整位置，也可用方向键微调。':'选择原始封面，或上传自己的图片。')}</p>
    <div className="profile-cover-presets" role="group" aria-label={uiText('原始封面')}><strong>{uiText('原始封面')}</strong><div>{profileCovers.map(choice=>{const selected=(preset??(!source?initial:null))===choice.key;return <button key={choice.key} type="button" className={selected?'is-selected':''} aria-label={uiText(choice.label)} aria-pressed={selected} disabled={busy} onClick={()=>void choosePreset(choice.key)}><img src={choice.image} alt=""/><span>{uiText(choice.label)}</span></button>})}</div></div>
    {source&&<label className="profile-cover-zoom">{uiText('缩放')}<input aria-label={uiText('封面缩放')} type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={e=>setZoom(Number(e.target.value))}/><span>{Math.round(zoom*100)}%</span></label>}
    <label className="profile-cover-upload"><Upload size={18}/>{uiText(busy?'处理中…':source?'重新选择图片':'上传自己的图片')}<input aria-label={uiText('选择封面图片')} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>void upload(event)}/></label>
    <small>{uiText(deferred?'支持 JPG、PNG、WebP，最大 5 MB。选好后保存个人资料。':'支持 JPG、PNG、WebP，最大 5 MB。保存后生效。')}</small>
    {error&&<p role="alert">{uiText(error)}</p>}
    <footer><button type="button" disabled={busy} onClick={()=>void choosePreset('lakeside')}><RotateCcw size={16}/>{uiText('重置封面')}</button><button className="profile-cover-save" type="button" disabled={busy||!source} onClick={()=>void save()}><Camera size={16}/>{uiText(busy?'处理中…':deferred?'使用此封面':'保存封面')}</button></footer>
  </div></CommunityModal>
}
