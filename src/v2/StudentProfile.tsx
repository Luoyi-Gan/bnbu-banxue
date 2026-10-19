import { uiText, useUiLanguage } from './uiLanguage'
import {api,workspaceChangedEvent} from '../live/api'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { PageHeading } from './ui'
import { DisplayAvatar } from './DisplayAvatar'

export function StudentProfile() { useUiLanguage();
  const live = useWorkspaceBackend()
  if (!live.data) return <div className="v2-page"><PageHeading eyebrow="MY PROFILE" title={uiText("个人资料")} description={uiText("设置头像与昵称，让同学更容易认识你。")}/><p role={live.error?'alert':'status'}>{live.error || uiText('正在读取本人资料…')}</p></div>
  return <StudentProfileEditor key={live.data.account.id} live={live}/>
}

function StudentProfileEditor({live}: {live: ReturnType<typeof useWorkspaceBackend>}) { useUiLanguage();
  const account = live.data!.account
  const profile = live.data!.entities.find(e => e.kind === 'profile' && e.ownerId === account.id)?.data
  const [bio,setBio]=useState(String(profile?.bio??''))
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(String(profile?.nickname ?? account.name))
  const [avatar, setAvatar] = useState(String(profile?.avatar ?? ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [code,setCode]=useState('')
  const [verification,setVerification]=useState('')
  async function verifyEmail(confirm:boolean) {
    setLoading(true);setVerification('');
    try {
      const result=await api<{message?:string}>(confirm ? '/api/auth/email/confirm' : '/api/auth/email/request',confirm ? {code} : {});
      setVerification(confirm ? '邮箱已验证，学号保持不变。' : result.message ?? '验证码已发送。');
      if(confirm) window.dispatchEvent(new Event(workspaceChangedEvent));
    } catch(error) {setVerification(error instanceof Error ? error.message : '验证失败')} finally {setLoading(false)}
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。'); return }
    setLoading(true); setError('')
    try {
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256
      const context = canvas.getContext('2d')!
      const size = Math.min(bitmap.width, bitmap.height)
      context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256)
      bitmap.close(); setAvatar(canvas.toDataURL('image/webp', .85))
    } catch { setError('图片无法读取，请重新选择。') } finally { setLoading(false) }
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    const name = nickname.trim()
    if (!name || name.length > 20) { setError('昵称需要填写 1–20 个字符。'); return }
    if (await live.mutate('profile.save', {nickname: name, avatar,bio})) navigate('/v2/me')
  }
  return <div className="v2-page"><Link className="v2-button v2-button-secondary" style={{ marginBottom: 16 }} to="/v2/me"><ArrowLeft size={17}/> {uiText("返回我的")}</Link><PageHeading eyebrow="MY PROFILE" title={uiText("个人资料")} description={uiText("设置头像与昵称，让同学更容易认识你。")}/>
    <form className="v2-profile-editor v2-panel v2-form" onSubmit={save}>
      <div className="v2-profile-photo-row"><DisplayAvatar className="v2-profile-avatar" name={nickname} avatar={avatar} personId={account.id}/><div><label className="v2-button v2-button-secondary">{loading?uiText('处理图片中…'):uiText('更换头像')}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label={uiText("选择头像")} disabled={loading || live.busy} onChange={upload}/></label><p>{uiText("JPG、PNG、WebP，最大 5 MB；头像居中裁剪。")}</p>{avatar && <button type="button" className="v2-text-button" onClick={() => setAvatar('')}>{uiText("恢复默认头像")}</button>}</div></div>
      <label>{uiText("昵称")}<input value={nickname} maxLength={20} required onChange={event => setNickname(event.target.value)} placeholder={uiText("填写你的昵称")}/></label>
      <label>{uiText("个人简介")}<textarea value={bio} maxLength={100} rows={3} onChange={event=>setBio(event.target.value)} placeholder={uiText("介绍你的兴趣与校园生活")}/><small>{bio.length}/100</small></label>
      <div className="v2-profile-facts"><div><span>{uiText("姓名")}</span><strong>{account.name}</strong></div><div><span>{uiText("学号")}</span><strong>{account.studentNumber ?? uiText('未验证学校邮箱')}</strong></div><div><span>{uiText("学院")}</span><strong>{account.organization}</strong></div><div><span>{uiText("身份")}</span><strong>{account.roles.includes('student')?uiText('已授权学生'):uiText('以账号授权为准')}</strong></div></div>
      {!account.studentNumber && account.email.endsWith('@bnbu.edu.cn') && <div className="v2-form-note"><p>{uiText("验证本人学校邮箱（学号采用入班时填写的资料）：")}{account.email}</p><button type="button" className="v2-button v2-button-secondary" disabled={loading} onClick={() => void verifyEmail(false)}>{uiText("获取验证码")}</button><input aria-label={uiText("邮箱验证码")} value={code} maxLength={6} onChange={event=>setCode(event.target.value)}/><button type="button" className="v2-button v2-button-secondary" disabled={loading || !code.trim()} onClick={() => void verifyEmail(true)}>{uiText("验证邮箱")}</button></div>}{verification && <p role="status">{verification}</p>}<p className="v2-form-note">{uiText("昵称用于展示；姓名、学号采用入班资料，后续由学校名单核对。当前修改保存到会同里后台。")}</p>
      {(error || live.error) && <p role="alert">{error || live.error}</p>}<div className="v2-form-actions"><Link to="/v2/me" className="v2-button v2-button-secondary">{uiText("取消")}</Link><button className="v2-button v2-button-primary" disabled={loading} type="submit">{uiText("保存资料")}</button></div>
    </form></div>
}
