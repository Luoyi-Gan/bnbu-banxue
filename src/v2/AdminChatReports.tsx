import {useState} from 'react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {Drawer,SectionHeading} from './ui'
import {uiText,useUiLanguage} from './uiLanguage'

export function AdminChatReports(){
  useUiLanguage()
  const live=useWorkspaceBackend(10000)
  const [selected,setSelected]=useState(''),[reason,setReason]=useState('')
  if(!live.data?.account.roles.some(role=>role==='reviewer'||role==='superadmin'))return null
  const reports=live.data.entities.filter(e=>e.kind==='report'&&e.data.privateMessage===true)
  const report=reports.find(e=>e.id===selected)
  const decide=async(upheld:boolean)=>{if(report&&await live.mutate('report.decide',{id:report.id,upheld,reason:reason.trim()})){setSelected('');setReason('')}}
  return <section className="v2-panel"><SectionHeading title={uiText('聊天举报')} detail={uiText('仅审核用户主动提交的单条消息证据')}/>
    {reports.length===0&&<p>{uiText('暂无聊天举报。')}</p>}
    {reports.map(item=><button key={item.id} className="v2-admin-queue-row" onClick={()=>{setSelected(item.id);setReason('')}}><strong>{uiText(item.data.targetKind==='message'?'群聊消息':'私信消息')}</strong><span>{uiText(item.data.status==='pending'?'待处理':item.data.status==='upheld'?'举报成立':'举报驳回')}</span></button>)}
    {report&&<Drawer title={uiText('聊天举报')} onClose={()=>{if(!live.busy)setSelected('')}}>
      <p>{uiText('被举报消息')}</p><blockquote style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{String((report.data.snapshot as Record<string,unknown>)?.body??'')}</blockquote>
      <p>{uiText('举报原因')}：{String(report.data.reason??'')}</p>
      {report.data.status==='pending'?<><label>{uiText('处理原因')}<textarea value={reason} maxLength={1000} onChange={event=>setReason(event.target.value)}/></label><div className="v2-detail-actions"><button disabled={live.busy||!reason.trim()} onClick={()=>void decide(true)}>{uiText('举报成立')}</button><button disabled={live.busy||!reason.trim()} onClick={()=>void decide(false)}>{uiText('驳回举报')}</button></div></>:<p>{String(report.data.resolution??'')}</p>}
      {live.error&&<p role="alert">{uiText(live.error)}</p>}
    </Drawer>}
  </section>
}
