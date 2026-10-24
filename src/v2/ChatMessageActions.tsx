import {useRef,useState} from 'react'
import {command} from '../live/api'
import {Modal} from './ui'
import {uiText,useUiLanguage} from './uiLanguage'

export function ChatMessageActions({id,author,onChanged}:{id:string;author:string;onChanged:()=>unknown}) {
  useUiLanguage()
  const [mode,setMode]=useState<'report'|'block'|null>(null),[reason,setReason]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false)
  const lock=useRef(false)
  const submit=async()=>{
    if(lock.current||!mode)return
    lock.current=true;setBusy(true);setError('')
    try {
      await command(mode==='report'?'report.create':'social.block',mode==='report'?{id,reason:reason.trim()}:{targetId:author,enabled:true})
      setDone(mode==='report');setMode(null);setReason('');await onChanged()
    } catch(cause){setError(cause instanceof Error?cause.message:'操作失败，请重试。')}
    finally{lock.current=false;setBusy(false)}
  }
  return <div className="chat-safety-actions">
    <button type="button" onClick={()=>{setMode('report');setError('')}}>{uiText('举报消息')}</button>
    <button type="button" onClick={()=>{setMode('block');setError('')}}>{uiText('屏蔽此人')}</button>
    {done&&<small role="status">{uiText('举报已提交，等待审核。')}</small>}
    {mode&&<Modal title={uiText(mode==='report'?'举报消息':'屏蔽此人')} onClose={()=>{if(!busy)setMode(null)}}>
      {mode==='report'?<><p>{uiText('审核员只能看到这条被举报消息及举报原因，不会获得整段聊天记录。')}</p><label>{uiText('举报原因')}<textarea autoFocus value={reason} maxLength={1000} onChange={event=>setReason(event.target.value)}/></label></>:<p>{uiText('屏蔽后，双方私信停止，群聊中彼此的消息不再展示或推送。你仍保留群成员身份，可在个人主页的屏蔽管理中解除。')}</p>}
      {error&&<p role="alert">{uiText(error)}</p>}
      <button className="v2-button v2-button-primary" type="button" disabled={busy||(mode==='report'&&!reason.trim())} onClick={()=>void submit()}>{uiText('确认提交')}</button>
    </Modal>}
  </div>
}
