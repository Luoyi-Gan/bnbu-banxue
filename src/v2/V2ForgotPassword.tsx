import { uiText, useUiLanguage } from './uiLanguage'
import {useState,type FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {api} from '../live/api'
const brandIcon = '/huitongli-app-icon.png'
import './auth.css'
import './editorialAuth.css'

export function V2ForgotPassword() { useUiLanguage();
  const navigate=useNavigate()
  const [identifier,setIdentifier]=useState(''),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('')
  const [sent,setSent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setError('');setMessage('');setBusy(true)
    try {
      if(!sent) {const response=await api<{sent:boolean;message:string}>('/api/auth/password-reset/request',{identifier:identifier.trim().toLowerCase()});setSent(true);setMessage(response.message)}
      else {
        if(password!==confirm) {setError('两次输入的密码不一致。');return}
        await api('/api/auth/password-reset/complete',{identifier:identifier.trim().toLowerCase(),code:code.trim(),password})
        navigate('/v2/login',{replace:true,state:{passwordReset:true}})
      }
    } catch(cause) {setError(cause instanceof Error?cause.message:'操作未完成，请稍后重试。')}
    finally {setBusy(false)}
  }
  return <div className="v2-auth-page v2-auth-flow"><header className="v2-auth-header"><Link className="v2-auth-brand" to="/v2"><img src={brandIcon} alt=""/><span>{uiText("会同里")}<small>BNBU CAMPUS</small></span></Link><Link className="v2-auth-back" to="/v2/login">{uiText("返回登录")}</Link></header><main className="v2-auth-layout"><section className="v2-auth-intro"><span className="v2-auth-eyebrow">BNBU / ACCOUNT</span><h1>{uiText("找回密码")}</h1><p>{uiText("通过当前已验证的邮箱设置新密码。成功后，旧登录会话自动失效。")}</p></section><section className="v2-auth-card"><div className="v2-auth-card-head"><h2>{uiText("找回密码")}</h2><p>{sent?uiText('输入邮件中的六位验证码，并设置新密码。'):uiText('填写个人邮箱或独立管理登录账号。')}</p></div>
    {message && <p role="status" className="v2-info-box">{message}</p>}{error && <p role="alert" className="v2-info-box">{uiText(error)}</p>}
    <form className="v2-auth-form" onSubmit={submit}><label>{uiText("邮箱或管理登录账号")}<input value={identifier} onChange={event=>setIdentifier(event.target.value)} required maxLength={254} autoComplete="username" readOnly={sent}/></label>
      {sent && <><label>{uiText("六位验证码")}<input value={code} onChange={event=>setCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code"/></label><label>{uiText("新密码")}<input type="password" value={password} onChange={event=>setPassword(event.target.value)} minLength={8} maxLength={128} required autoComplete="new-password"/></label><label>{uiText("确认新密码")}<input type="password" value={confirm} onChange={event=>setConfirm(event.target.value)} minLength={8} maxLength={128} required autoComplete="new-password"/></label></>}
      <button className="v2-auth-submit" disabled={busy}>{busy?uiText('正在处理…'):sent?uiText('设置新密码'):uiText('发送找回验证码')}</button></form>
    <p><Link to="/v2/login">{uiText("返回登录")}</Link>{sent && <> · <button type="button" onClick={()=>{setSent(false);setCode('');setMessage('')}}>{uiText("重新获取验证码")}</button></>}</p>
  </section></main></div>
}
