import { useState, type ChangeEvent, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useV2 } from './useV2'
import { studentName, v2StorageKey } from './model'
import { PageHeading } from './ui'
import { updateStudentProfile } from './profilePolicy'

export function StudentProfile() {
  const { state, setState } = useV2()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(state.profile?.nickname ?? studentName)
  const [avatar, setAvatar] = useState(state.profile?.avatar ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
  function save(event: FormEvent) {
    event.preventDefault()
    const name = nickname.trim()
    if (!name || name.length > 20) { setError('昵称需要填写 1–20 个字符。'); return }
    const next = updateStudentProfile(state, name, avatar)
    try { localStorage.setItem(v2StorageKey, JSON.stringify({ ...next, role: undefined })) }
    catch { setError('保存失败，浏览器存储空间不足，请缩小头像后重试。'); return }
    flushSync(() => setState(next)); navigate('/v2/me')
  }
  return <div className="v2-page"><Link className="v2-button v2-button-secondary" style={{ marginBottom: 16 }} to="/v2/me"><ArrowLeft size={17}/> 返回我的</Link><PageHeading eyebrow="MY PROFILE" title="个人资料" description="设置头像与昵称，让同学更容易认识你。"/>
    <form className="v2-profile-editor v2-panel v2-form" onSubmit={save}>
      <div className="v2-profile-photo-row"><span className="v2-profile-avatar">{avatar ? <img src={avatar} alt="头像预览"/> : nickname.slice(0, 1)}</span><div><label className="v2-button v2-button-secondary">{loading ? '处理图片中…' : '更换头像'}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择头像" disabled={loading} onChange={upload}/></label><p>JPG、PNG、WebP，最大 5 MB；头像居中裁剪。</p>{avatar && <button type="button" className="v2-text-button" onClick={() => setAvatar('')}>恢复默认头像</button>}</div></div>
      <label>昵称<input value={nickname} maxLength={20} required onChange={event => setNickname(event.target.value)} placeholder="填写你的昵称"/></label>
      <div className="v2-profile-facts"><div><span>姓名</span><strong>{studentName}</strong></div><div><span>学号</span><strong>22301142</strong></div><div><span>学院</span><strong>工商管理学院</strong></div><div><span>身份</span><strong>学生</strong></div></div>
      <p className="v2-form-note">昵称用于展示；姓名、学号与身份由学校资料维护。当前修改保存在本地浏览器。</p>
      {error && <p role="alert">{error}</p>}<div className="v2-form-actions"><Link to="/v2/me" className="v2-button v2-button-secondary">取消</Link><button className="v2-button v2-button-primary" disabled={loading} type="submit">保存资料</button></div>
    </form></div>
}
