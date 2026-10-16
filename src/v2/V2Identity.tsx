import {useEffect,useState,type FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {api} from '../live/api'

type IdentityState={status:string;request:null|{id:string;studentNumber:string;schoolName:string;reason:string};schoolService:string}

export function V2Identity() {
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
  return <div className="v2-auth-page"><main className="v2-auth-layout"><section className="v2-auth-intro"><span className="v2-auth-eyebrow">BNBU / IDENTITY</span><h1>核验校园身份</h1><p>学生身份由校方在读记录或审核员核对的正式证明确认。</p></section><section className="v2-auth-card"><div className="v2-auth-card-head"><h2>学生身份</h2><p>提交的信息用于与学校正式记录核对，填写本身不会授予权限。</p></div>
    {error && <p role="alert" className="v2-info-box">{error}</p>}
    {!state && !error && <p role="status">正在读取身份状态…</p>}
    {state?.request && <div className="v2-info-box"><strong>{state.status==='verified'?'已核验':state.status==='pending'?'待核验':state.status==='rejected'?'申请已驳回':'身份已撤销'}</strong><p>{state.request.schoolName} · {state.request.studentNumber}</p><p>{state.request.reason}</p></div>}
    {(state?.status==='unrequested'||state?.status==='rejected') && <form className="v2-auth-form" onSubmit={submit}><label>学校登记姓名<input name="schoolName" required minLength={2} maxLength={80}/></label><label>完整学号<input name="studentNumber" required pattern="[A-Za-z0-9]{5,30}"/></label><button className="v2-button v2-button-primary" disabled={busy}>{busy?'正在提交…':'提交核验申请'}</button></form>}
    {state?.status==='pending' && <p>校方接口尚未返回完整在读结果时，申请留在审核队列；审核员须查验正式证明后才能授权。</p>}
    <p><Link to="/v2/login">切换账号</Link>{state?.status==='verified' && <> · <Link to="/v2">进入校园服务</Link></>}</p>
  </section></main></div>
}
