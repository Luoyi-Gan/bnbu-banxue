import { uiText, useUiLanguage } from './uiLanguage'
import {useEffect,useState,type FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {api} from '../live/api'
const brandIcon = '/huitongli-app-icon.png'
import './auth.css'
import './editorialAuth.css'

type IdentityState={status:string;request:null|{id:string;studentNumber:string;schoolName:string;reason:string};schoolService:string}

export function V2Identity() { useUiLanguage();
  const [state,setState]=useState<IdentityState|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  useEffect(()=>{void api<IdentityState>('/api/identity/me').then(setState).catch(cause=>setError(cause instanceof Error?cause.message:'身份状态读取失败。'))},[])
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setError('');setBusy(true)
    const data=new FormData(event.currentTarget)
    try {
      const response=await api<IdentityState>('/api/identity/request',{schoolName:String(data.get('schoolName')??'').trim(),studentNumber:String(data.get('studentNumber')??'').trim()})
      setState(response)
      if(response.status==='verified') window.location.replace('/v2')
    } catch(cause) { setError(cause instanceof Error?cause.message:'申请未完成，请重试。') }
    finally {setBusy(false)}
  }
  return <div className="v2-auth-page v2-auth-flow"><header className="v2-auth-header"><Link className="v2-auth-brand" to="/v2"><img src={brandIcon} alt=""/><span>{uiText("会同里")}<small>BNBU CAMPUS</small></span></Link><Link className="v2-auth-back" to="/v2/login">{uiText("切换账号")}</Link></header><main className="v2-auth-layout"><section className="v2-auth-intro"><span className="v2-auth-eyebrow">BNBU / IDENTITY</span><h1>{uiText("核验校园身份")}</h1><p>{uiText("学生身份由校方在读记录或审核员核对的正式证明确认。")}</p></section><section className="v2-auth-card"><div className="v2-auth-card-head"><h2>{uiText("学生身份")}</h2><p>{uiText("提交的信息用于与学校正式记录核对，填写本身不会授予权限。")}</p></div>
    {error && <p role="alert" className="v2-info-box">{uiText(error)}</p>}
    {!state && !error && <p role="status">{uiText("正在读取身份状态…")}</p>}
    {state?.status==='verified' && !state.request && <div className="v2-info-box" role="status"><strong>{uiText("身份已核验")}</strong><p>{uiText("当前账号可以进入校园服务。")}</p></div>}
    {state?.request && <div className="v2-info-box"><strong>{state.status==='verified'?uiText('已核验'):state.status==='pending'?uiText('待核验'):state.status==='rejected'?uiText('申请已驳回'):uiText('身份已撤销')}</strong><p>{state.request.schoolName} · {state.request.studentNumber}</p><p>{state.request.reason}</p></div>}
    {(state?.status==='unrequested'||state?.status==='rejected') && <form className="v2-auth-form" onSubmit={submit}><label>{uiText("学校登记姓名")}<input name="schoolName" required minLength={2} maxLength={80}/></label><label>{uiText("完整学号")}<input name="studentNumber" required pattern="[A-Za-z0-9]{5,30}"/></label><button className="v2-auth-submit" disabled={busy}>{busy?uiText('正在提交…'):uiText('提交核验申请')}</button></form>}
    {state?.status==='pending' && <p>{uiText("校方接口尚未返回完整在读结果时，申请留在审核队列；审核员须查验正式证明后才能授权。")}</p>}
    <p><Link to="/v2/login">{uiText("切换账号")}</Link>{state?.status==='verified' && <> · <Link to="/v2">{uiText("进入校园服务")}</Link></>}</p>
  </section></main></div>
}
