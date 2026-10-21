import {useEffect,useRef,useState,type ChangeEvent} from 'react'
import {Camera,Check,RotateCcw,Upload} from 'lucide-react'
import {CommunityModal} from './CommunityModal'
import {profileCovers,profileCoverSource} from './profileCovers'
import {command,loadWorkspace} from '../live/api'
import {uiText,useUiLanguage} from './uiLanguage'
import './profileCoverEditor.css'

export function ProfileCoverEditor({initial,ownerId,onClose}:{initial:string;ownerId:string;onClose:()=>void}){
  useUiLanguage()
  const [cover,setCover]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const active=useRef(true),lock=useRef(false)
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
  async function upload(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];event.target.value='';if(!file||lock.current)return
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');return}
    lock.current=true;setBusy(true);setError('')
    try{
      const bitmap=await createImageBitmap(file)
      try{
        const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=680
        const context=canvas.getContext('2d');if(!context)throw new Error('图片无法读取')
        const scale=Math.max(canvas.width/bitmap.width,canvas.height/bitmap.height),width=bitmap.width*scale,height=bitmap.height*scale
        context.drawImage(bitmap,(canvas.width-width)/2,(canvas.height-height)/2,width,height)
        if(active.current)setCover(canvas.toDataURL('image/webp',.85))
      }finally{bitmap.close()}
    }catch{if(active.current)setError('图片无法读取，请重新选择。')}
    finally{lock.current=false;if(active.current)setBusy(false)}
  }
  async function save(){
    if(lock.current)return
    lock.current=true;setBusy(true);setError('')
    try{
      const latest=await loadWorkspace(),profile=latest.entities.find(e=>e.kind==='profile'&&e.ownerId===latest.account.id)?.data
      if(latest.account.id!==ownerId)throw new Error('登录账号已变化，请重新打开封面编辑。')
      await command('profile.save',{nickname:String(profile?.nickname||latest.account.name),avatar:String(profile?.avatar||''),cover})
      if(active.current)onClose()
    }catch(cause){if(active.current)setError(cause instanceof Error?cause.message:'封面保存失败，请重试。')}
    finally{lock.current=false;if(active.current)setBusy(false)}
  }
  return <CommunityModal title={uiText('自定义封面')} onClose={()=>{if(!lock.current)onClose()}}><div className="profile-cover-editor">
    <img className="profile-cover-preview" src={profileCoverSource(cover)} alt={uiText('封面预览')}/>
    <p>{uiText('选择校园风景，或上传属于你的校园瞬间。')}</p>
    <div className="profile-cover-options">{profileCovers.map(item=><button key={item.key} type="button" disabled={busy} aria-pressed={cover===item.key} onClick={()=>{setCover(item.key);setError('')}}><img src={item.image} alt=""/><span>{uiText(item.label)}</span>{cover===item.key&&<Check size={16}/>}</button>)}</div>
    <label className="profile-cover-upload"><Upload size={18}/>{uiText(busy?'处理中…':'上传自己的图片')}<input aria-label={uiText('选择封面图片')} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>void upload(event)}/></label>
    <small>{uiText('支持 JPG、PNG、WebP，最大 5 MB。保存后生效。')}</small>
    {error&&<p role="alert">{uiText(error)}</p>}
    <footer><button type="button" disabled={busy} onClick={()=>{setCover('lakeside');setError('')}}><RotateCcw size={16}/>{uiText('恢复默认')}</button><button className="profile-cover-save" type="button" disabled={busy} onClick={()=>void save()}><Camera size={16}/>{uiText(busy?'处理中…':'保存封面')}</button></footer>
  </div></CommunityModal>
}
