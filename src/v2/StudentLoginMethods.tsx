import {useEffect,useState,type FormEvent} from 'react'
import {api,type LiveAccount} from '../live/api'
import {roleLoginPath} from './authReturnPath'
import {useLocation} from 'react-router-dom'
import {uiText,useUiLanguage} from './uiLanguage'
import './studentLoginMethods.css'
export function StudentLoginMethods({onLegacy}:{onLegacy:()=>void}){useUiLanguage()
  const location=useLocation(),[method,setMethod]=useState<'email'|'school'>('email'),[identifier,setIdentifier]=useState(''),[password,setPassword]=useState(''),[email,setEmail]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[sending,setSending]=useState(false),[seconds,setSeconds]=useState(0),[error,setError]=useState(''),[message,setMessage]=useState('')
  useEffect(()=>{if(seconds<=0)return;const timer=setTimeout(()=>setSeconds(s=>s-1),1000);return()=>clearTimeout(timer)},[seconds])
  const post=<T,>(path:string,input:Record<string,string>)=>api<T>('/api/auth/'+path,input)
  const send=async()=>{setError('');setMessage('');setSending(true);try{const result=await post<{message:string}>('email-login/request',{email});setMessage(result.message);setSeconds(60)}catch(cause){setError(cause instanceof Error?cause.message:'发送失败。')}finally{setSending(false)}}
  const submit=async(event:FormEvent)=>{
    event.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('')
    try{
      const result: {authenticated:boolean}=method==='school'?await post('school-login',{identifier,password}):await post('email-login',{email,code})
      setPassword('')
      if(result.authenticated){const {account}=await api<{account:LiveAccount}>('/api/auth/me');window.location.replace(roleLoginPath(location.state?.returnTo,account.roles));return}
      throw new Error('登录服务未确认成功，请重试。')
    }catch(cause){setError(cause instanceof Error?cause.message:'登录失败，请重试。')}finally{setBusy(false)}
  }
  return <div className="learning-login"><div className="learning-tabs" role="group" aria-label={uiText('选择登录方式')}>{(['email','school'] as const).map(value=><button type="button" key={value} aria-pressed={method===value} disabled={busy} onClick={()=>{setMethod(value);setPassword('');setCode('');setError('');setMessage('')}}>{uiText(value==='email'?'邮箱验证码':'学校账号')}</button>)}</div>
    <p>{uiText(method==='school'?'使用学校账号登录，自动同步本人课程、DDL 与 MIS 时间表。':'使用邮箱验证码登录，浏览校园服务；内部课程数据需连接学校账号。')}</p>
    <form className="v2-auth-form" onSubmit={submit}>
      {method==='school'?<><label>{uiText('学校账号')}<div className="v2-auth-input"><input autoComplete="username" value={identifier} maxLength={254} onChange={e=>setIdentifier(e.target.value)} required/></div></label><label>{uiText('学校密码')}<div className="v2-auth-input"><input type="password" autoComplete="current-password" value={password} maxLength={256} onChange={e=>setPassword(e.target.value)} required/></div></label><small>{uiText('密码仅用于本次向 iSpace 验证；登录成功后自动关联学校邮箱。')}</small><a href="https://sso.bnbu.edu.cn/#/login" target="_blank" rel="noreferrer">{uiText('前往学校 SSO 登录')}</a></>:<><label>{uiText('邮箱地址')}<div className="v2-auth-input"><input type="email" value={email} autoComplete="email" maxLength={254} onChange={e=>setEmail(e.target.value)} required/></div></label><label>{uiText('邮箱验证码')}<div className="v2-auth-code-row"><div className="v2-auth-input"><input aria-label={uiText('邮箱验证码')} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required/></div><button type="button" disabled={busy||sending||seconds>0} onClick={()=>void send()}>{seconds>0?`${seconds}s`:uiText(sending?'发送中…':'发送验证码')}</button></div></label></>}
      {error&&<p role="alert" className="v2-auth-error">{error}</p>}{message&&<p role="status" className="v2-auth-message">{message}</p>}
      <button disabled={busy||sending} className="v2-auth-submit">{uiText(busy?'正在验证…':method==='school'?'连接学校账号':'登录会同里')}</button>
    </form><button type="button" className="v2-auth-text-action" onClick={onLegacy}>{uiText('平台密码 / 管理账号登录')}</button>
  </div>
}
