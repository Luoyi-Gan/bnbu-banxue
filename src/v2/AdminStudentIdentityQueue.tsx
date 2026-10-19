import { uiText, useUiLanguage, uiTemplate } from './uiLanguage'
import {useCallback,useEffect,useState} from 'react'
import {api} from '../live/api'
import {Drawer,SectionHeading} from './ui'

type RequestItem={id:string;ownerId:string;studentNumber:string;schoolName:string;email:string;status:string;reason:string;source?:string;evidenceId?:string;version:number;createdAt:string}
type Page={items:RequestItem[];total:number;page:number;hasMore:boolean}

export function AdminStudentIdentityQueue({superAdmin}:{superAdmin:boolean}) { useUiLanguage();
  const [status,setStatus]=useState('pending'),[query,setQuery]=useState(''),[page,setPage]=useState(1)
  const [data,setData]=useState<Page|null>(null),[selected,setSelected]=useState<RequestItem|null>(null)
  const [reason,setReason]=useState(''),[evidenceId,setEvidenceId]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  const load=useCallback(async()=>{
    try {const result=await api<Page>(`/api/identity/requests?status=${encodeURIComponent(status)}&query=${encodeURIComponent(query)}&page=${page}`);setData(result);setError('')}
    catch(cause){setError(cause instanceof Error?cause.message:'学生身份队列读取失败。')}
  },[status,query,page])
  useEffect(()=>{void load()},[load])
  const decide=async(decision:'approve'|'reject'|'revoke')=>{
    if(!selected||!reason.trim()||decision==='approve'&&!evidenceId.trim()) return
    setBusy(true);setError('')
    try {await api('/api/identity/review',{id:selected.id,version:selected.version,decision,reason:reason.trim(),evidenceId:evidenceId.trim()});setSelected(null);setReason('');setEvidenceId('');await load()}
    catch(cause){setError(cause instanceof Error?cause.message:'处理失败，请刷新后重试。')}
    finally{setBusy(false)}
  }
  return <section className="v2-panel v2-list-panel"><SectionHeading title={uiText("学生身份核验")} detail={uiTemplate([""," 条符合条件的申请"],data?.total ?? 0)}/>
    <div className="v2-toolbar"><input aria-label={uiText("搜索学号、姓名或邮箱")} placeholder={uiText("搜索完整学号、姓名或邮箱")} value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}}/><select aria-label={uiText("身份申请状态")} value={status} onChange={event=>{setStatus(event.target.value);setPage(1)}}><option value="pending">{uiText("待核验")}</option><option value="verified">{uiText("已核验")}</option><option value="rejected">{uiText("已驳回")}</option><option value="revoked">{uiText("已撤销")}</option><option value="all">{uiText("全部")}</option></select></div>
    {error && <p role="alert">{uiText(error)}</p>}
    <div className="v2-row-list">{data?.items.map(item=><button type="button" className="v2-verification-row" key={item.id} onClick={()=>{setSelected(item);setReason('');setEvidenceId('')}}><span><small>{item.email} · {item.createdAt}</small><strong>{item.schoolName} · {item.studentNumber}</strong><em>{item.reason}</em></span><span>{item.status==='pending'?uiText('待核验'):item.status==='verified'?uiText('已核验'):item.status==='rejected'?uiText('已驳回'):uiText('已撤销')}</span></button>)}</div>
    {data && !data.items.length && <p>{uiText("当前没有符合条件的申请。")}</p>}
    {data && <div className="v2-detail-actions"><button type="button" disabled={page<=1} onClick={()=>setPage(page-1)}>{uiText("上一页")}</button><span>{uiText("第")}{page} {uiText("页")}</span><button type="button" disabled={!data.hasMore} onClick={()=>setPage(page+1)}>{uiText("下一页")}</button></div>}
    {selected && <Drawer title={`${selected.schoolName} · ${selected.studentNumber}`} eyebrow={uiText("学生身份核验")} onClose={()=>setSelected(null)}><p>{uiText("已验证邮箱：")}{selected.email}</p><p>{uiText("申请状态：")}{selected.status}</p><p>{uiText("现有说明：")}{selected.reason}</p><p>{uiText("依据标识：")}{selected.evidenceId || uiText('尚无')}</p><p>{uiText("核对校方正式在读状态、独立学号、学校姓名和已验证邮箱一致后处理。")}</p>
      {(selected.status==='pending' || selected.status==='verified'&&superAdmin) && <><label className="v2-drawer-label">{uiText("处理原因")}<textarea value={reason} onChange={event=>setReason(event.target.value)} maxLength={500}/></label>{selected.status==='pending' && <label className="v2-drawer-label">{uiText("校方查询结果或可核验证明的依据标识")}<input value={evidenceId} onChange={event=>setEvidenceId(event.target.value)} maxLength={200}/></label>}<div className="v2-detail-actions">{selected.status==='pending' && <><button type="button" className="v2-button v2-button-secondary" disabled={busy || !reason.trim()} onClick={()=>void decide('reject')}>{uiText("驳回申请")}</button><button type="button" className="v2-button v2-button-primary" disabled={busy||!reason.trim() || evidenceId.trim().length<4} onClick={()=>void decide('approve')}>{uiText("确认校方依据并授权")}</button></>}{selected.status==='verified' && superAdmin && <button type="button" className="v2-button v2-button-secondary" disabled={busy || !reason.trim()} onClick={()=>void decide('revoke')}>{uiText("撤销学生身份")}</button>}</div></>}
    </Drawer>}
  </section>
}
