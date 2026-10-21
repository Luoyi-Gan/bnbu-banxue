import {uiText,useUiLanguage} from './uiLanguage'
import {api,workspaceChangedEvent} from '../live/api'
import {useEffect,useRef,useState,type ChangeEvent,type FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {ArrowLeft,Camera} from 'lucide-react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {DisplayAvatar} from './DisplayAvatar'
import {CoverImageEditor} from './ProfileCoverEditor'
import {profileCoverSource} from './profileCovers'
import './ownProfile.css'

export function StudentProfile(){
  useUiLanguage()
  const live=useWorkspaceBackend()
  if(!live.data)return <div className="own-profile-editor"><header className="own-editor-heading"><Link to="/v2/me" aria-label={uiText('返回我的')}><ArrowLeft size={22}/></Link><h1>{uiText('编辑资料')}</h1></header><p role={live.error?'alert':'status'}>{uiText(live.error||'正在读取本人资料…')}{live.error&&<button onClick={()=>void live.refresh()}>{uiText('重试')}</button>}</p></div>
  return <StudentProfileEditor key={live.data.account.id} live={live}/>
}
function StudentProfileEditor({live}:{live:ReturnType<typeof useWorkspaceBackend>}){
  useUiLanguage()
  const account=live.data!.account,profile=live.data!.entities.find(e=>e.kind==='profile'&&e.ownerId===account.id)?.data
  const preferences=live.data!.entities.find(e=>e.kind==='preferences'&&e.ownerId===account.id)?.data
  const [nickname,setNickname]=useState(String(profile?.nickname??account.name)),[bio,setBio]=useState(String(profile?.bio??'')),[avatar,setAvatar]=useState(String(profile?.avatar??''))
  const [cover,setCover]=useState(String(profile?.cover??preferences?.profileBackground??'lakeside')),[coverOpen,setCoverOpen]=useState(false)
  const [error,setError]=useState(''),[loading,setLoading]=useState(false),[code,setCode]=useState(''),[verification,setVerification]=useState('')
  const navigate=useNavigate(),active=useRef(true)
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
  async function verifyEmail(confirm:boolean) {
    setLoading(true);setVerification('');
    try {
      const result=await api<{message?:string}>(confirm ? '/api/auth/email/confirm' : '/api/auth/email/request',confirm ? {code} : {});
      setVerification(confirm ? '邮箱已验证，学号保持不变。' : result.message ?? '验证码已发送。');
      if(confirm) window.dispatchEvent(new Event(workspaceChangedEvent));
    } catch(error) {setVerification(error instanceof Error ? error.message : '验证失败')} finally {setLoading(false)}
  }
  async function upload(event:ChangeEvent<HTMLInputElement>,kind:'avatar'|'cover'){
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');return}
    setLoading(true);setError('')
    try{
      const bitmap=await createImageBitmap(file)
      try{
        const canvas=document.createElement('canvas');canvas.width=kind==='avatar'?256:1200;canvas.height=kind==='avatar'?256:680
        const context=canvas.getContext('2d');if(!context)throw new Error('canvas')
        const scale=Math.max(canvas.width/bitmap.width,canvas.height/bitmap.height),width=bitmap.width*scale,height=bitmap.height*scale
        context.drawImage(bitmap,(canvas.width-width)/2,(canvas.height-height)/2,width,height)
        const image=canvas.toDataURL('image/webp',.85)
        if(active.current){if(kind==='avatar')setAvatar(image);else{setCover(image);setCoverOpen(false)}}
      }finally{bitmap.close()}
    }catch{if(active.current)setError('图片无法读取，请重新选择。')}finally{if(active.current)setLoading(false)}
  }
  async function save(event:FormEvent){
    event.preventDefault();if(loading||live.busy)return
    const name=nickname.trim();setError('')
    if(!name||name.length>20){setError('昵称需要填写 1–20 个字符。');return}
    if(bio.trim().length>100){setError('个人简介最多100字。');return}
    if(await live.mutate('profile.save',{nickname:name,avatar,bio,cover})&&active.current)navigate('/v2/me')
  }
  return <div className="own-profile-editor">
    <header className="own-editor-heading"><Link to="/v2/me" aria-label={uiText('取消编辑，返回我的')}><ArrowLeft size={22}/></Link><h1>{uiText('编辑资料')}</h1><button type="submit" form="own-profile-form" disabled={loading||live.busy}>{uiText(live.busy?'保存中…':'保存')}</button></header>
    {(error||live.error)&&<p className="own-editor-error" role="alert">{uiText(error||live.error)}</p>}
    <form id="own-profile-form" onSubmit={save}>
      <button type="button" className="own-editor-cover" disabled={loading||live.busy} onClick={()=>{setError('');setCoverOpen(true)}} aria-label={uiText('更换背景图')}><img src={profileCoverSource(cover)} alt={uiText('主页背景预览')}/><span><Camera size={15}/>{uiText('更换背景')}</span></button>
      <div className="own-editor-avatar-row"><DisplayAvatar className="own-editor-avatar" name={nickname} avatar={avatar}/><div><label>{uiText(loading?'处理图片中…':'更换头像')}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label={uiText('选择头像')} disabled={loading||live.busy} onChange={event=>void upload(event,'avatar')}/></label>{avatar&&<button type="button" disabled={loading||live.busy} onClick={()=>{setError('');setAvatar('')}}>{uiText('恢复默认头像')}</button>}</div></div>
      <div className="own-editor-fields"><label><span>{uiText('昵称')}<small>{nickname.length}/20</small></span><input value={nickname} maxLength={20} required onChange={event=>setNickname(event.target.value)} placeholder={uiText('填写你的昵称')}/></label><label><span>{uiText('个人简介')}<small>{bio.length}/100</small></span><textarea value={bio} maxLength={100} rows={3} onChange={event=>setBio(event.target.value)} placeholder={uiText('介绍你的兴趣与校园生活')}/></label></div>
      <p className="own-editor-note">{uiText('头像与背景支持 JPG、PNG、WebP，最大 5 MB；保存后生效。')}</p>
      <details className="own-editor-identity"><summary>{uiText('校园身份资料')}</summary><div className="v2-profile-facts"><div><span>{uiText('姓名')}</span><strong>{account.name}</strong></div><div><span>{uiText('学号')}</span><strong>{account.studentNumber??uiText('未验证学校邮箱')}</strong></div><div><span>{uiText('学院')}</span><strong>{account.organization}</strong></div><div><span>{uiText('身份')}</span><strong>{uiText(account.roles.includes('student')?'已授权学生':'以账号授权为准')}</strong></div></div>
      {!account.studentNumber&&account.email.endsWith('@bnbu.edu.cn')&&<div className="v2-form-note"><p>{uiText('验证本人学校邮箱（学号采用入班时填写的资料）：')}{account.email}</p><button type="button" className="v2-button v2-button-secondary" disabled={loading} onClick={()=>void verifyEmail(false)}>{uiText('获取验证码')}</button><input aria-label={uiText('邮箱验证码')} value={code} maxLength={6} onChange={event=>setCode(event.target.value)}/><button type="button" className="v2-button v2-button-secondary" disabled={loading||!code.trim()} onClick={()=>void verifyEmail(true)}>{uiText('验证邮箱')}</button></div>}{verification&&<p role="status">{uiText(verification)}</p>}<p className="own-editor-note">{uiText('昵称用于展示；姓名、学号采用入班资料，后续由学校名单核对。当前修改保存到会同里后台。')}</p></details>
    </form>
    {coverOpen&&<CoverImageEditor deferred initial={cover} onClose={()=>setCoverOpen(false)} onSave={image=>{setCover(image);setCoverOpen(false)}}/>}
  </div>
}
