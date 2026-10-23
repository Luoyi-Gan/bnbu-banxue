import {useEffect,useRef,useState,type FormEvent} from 'react'
import {ArrowRight,KeyRound,Mail,ShieldCheck} from 'lucide-react'
import {api,type LiveAccount} from '../live/api'
import {roleLoginPath} from './authReturnPath'
import {useLocation} from 'react-router-dom'
import {uiText,useUiLanguage} from './uiLanguage'
import './studentLoginMethods.css'
const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export function StudentLoginMethods({onLegacy}:{onLegacy:()=>void}){useUiLanguage()
 const location=useLocation(),[method,setMethod]=useState<'email'|'school'>('email'),[identifier,setIdentifier]=useState(''),[password,setPassword]=useState(''),[email,setEmail]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[sending,setSending]=useState(false),[now,setNow]=useState(Date.now),[cooldowns,setCooldowns]=useState<Record<string,number>>({}),[error,setError]=useState(''),[message,setMessage]=useState('')
 const lock=useRef(false),codeInput=useRef<HTMLInputElement>(null)
 const normalizedEmail=email.trim().toLowerCase(),seconds=Math.max(0,Math.ceil(((cooldowns[normalizedEmail]??0)-now)/1000))
 useEffect(()=>{if(!seconds)return;const timer=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(timer)},[seconds])
 const post=<T,>(path:string,input:Record<string,string>)=>api<T>('/api/auth/'+path,input)
 const send=async()=>{
  if(lock.current||seconds>0)return;setError('');setMessage('')
  if(!validEmail(normalizedEmail)){setError('请先填写有效的邮箱地址。');return}
  lock.current=true;setSending(true)
  try{const result=await post<{sent:boolean;message:string}>('email-login/request',{email:normalizedEmail});if(!result.sent)throw Error('邮件服务未确认发送，请稍后重试。');setMessage(result.message);setNow(Date.now());setCooldowns(values=>({...values,[normalizedEmail]:Date.now()+60000}));codeInput.current?.focus()}
  catch(cause){setError(cause instanceof Error?cause.message:'发送失败，请重试。')}
  finally{lock.current=false;setSending(false)}
 }
 const submit=async(event:FormEvent)=>{
  event.preventDefault();if(lock.current)return;setError('');setMessage('')
  if(method==='email'&&(!validEmail(normalizedEmail)||!/^\d{6}$/.test(code))){setError(!validEmail(normalizedEmail)?'请填写有效的邮箱地址。':'请填写六位验证码。');return}
  if(method==='school'&&(!identifier.trim()||!password)){setError('请填写学校账号和密码。');return}
  lock.current=true;setBusy(true)
  try{
   const result:{authenticated:boolean}=method==='school'?await post('school-login',{identifier:identifier.trim(),password}):await post('email-login',{email:normalizedEmail,code})
   setPassword('')
   if(!result.authenticated)throw Error('登录服务未确认成功，请重试。')
   const {account}=await api<{account:LiveAccount}>('/api/auth/me');window.location.replace(roleLoginPath(location.state?.returnTo,account.roles))
  }catch(cause){setError(cause instanceof Error?cause.message:'登录失败，请重试。')}finally{lock.current=false;setBusy(false)}
 }
 return <div className="learning-login">
  <div className="learning-tabs" role="group" aria-label={uiText('选择登录方式')}>{(['email','school'] as const).map(value=><button type="button" key={value} aria-pressed={method===value} disabled={busy||sending} onClick={()=>{setMethod(value);setPassword('');setCode('');setError('');setMessage('')}}>{value==='email'?<Mail size={15}/>:<ShieldCheck size={15}/>} {uiText(value==='email'?'邮箱验证码':'学校账号')}</button>)}</div>
  <p className="login-method-hint">{uiText(method==='school'?'使用学校账号登录，自动同步本人课程、DDL 与 MIS 时间表。':'输入邮箱，获取一次性登录验证码。')}</p>
  <form className="v2-auth-form" onSubmit={submit} noValidate aria-busy={busy||sending}>
   {method==='school'?<><label>{uiText('学校账号')}<div className="v2-auth-input"><ShieldCheck size={17}/><input autoComplete="username" placeholder={uiText('输入学校账号')} value={identifier} disabled={busy} maxLength={254} onChange={e=>setIdentifier(e.target.value)} required/></div></label><label>{uiText('学校密码')}<div className="v2-auth-input"><KeyRound size={17}/><input type="password" autoComplete="current-password" placeholder={uiText('输入学校密码')} value={password} disabled={busy} maxLength={256} onChange={e=>setPassword(e.target.value)} required/></div></label><small>{uiText('密码仅用于本次向 iSpace 验证；登录成功后自动关联学校邮箱。')}</small><a className="login-school-link" href="https://sso.bnbu.edu.cn/#/login" target="_blank" rel="noreferrer">{uiText('前往学校 SSO 登录')}<ArrowRight size={13}/></a></>:<><label>{uiText('邮箱地址')}<div className="v2-auth-input"><Mail size={17}/><input type="email" value={email} placeholder="name@mail.bnbu.edu.cn" autoComplete="email" autoCapitalize="none" spellCheck={false} disabled={busy||sending} maxLength={254} onChange={e=>{setEmail(e.target.value);setCode('');setError('');setMessage('')}} required/></div></label><label>{uiText('邮箱验证码')}<div className="v2-auth-code-row"><div className="v2-auth-input"><KeyRound size={17}/><input ref={codeInput} aria-label={uiText('邮箱验证码')} placeholder={uiText('输入六位验证码')} value={code} disabled={busy} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required/></div><button type="button" disabled={busy||sending||seconds>0} onClick={()=>void send()}>{seconds>0?`${seconds}s ${uiText('后重发')}`:uiText(sending?'发送中…':'获取验证码')}</button></div></label><p className="login-code-hint">{uiText('验证码 10 分钟内有效，首次验证将创建账号。')}</p></>}
   {error&&<p role="alert" className="v2-auth-error">{uiText(error)}</p>}{message&&<p role="status" className="v2-auth-message">{uiText(message)}</p>}
   <button type="submit" disabled={busy||sending} className="v2-auth-submit">{uiText(busy?'正在验证…':method==='school'?'连接学校账号':'登录会同里')}{!busy&&<ArrowRight size={17}/>}</button>
  </form>
  <button type="button" disabled={busy||sending} className="v2-auth-text-action login-legacy" onClick={onLegacy}>{uiText('平台密码 / 管理账号登录')}<ArrowRight size={13}/></button>
 </div>
}
