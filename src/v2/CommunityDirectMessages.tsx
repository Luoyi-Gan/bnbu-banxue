import {useEffect,useRef,useState,type FormEvent} from 'react'
import {ArrowLeft,ArrowUp,MessageCircle} from 'lucide-react'
import {Link} from 'react-router-dom'
import {command} from '../live/api'
import {DisplayAvatar} from './DisplayAvatar'
import {useCommunitySocial} from './useCommunitySocial'
import {uiText,uiLocale,useUiLanguage} from './uiLanguage'
import './communityProfile.css'

export function CommunityDirectMessages({person}:{person:string}){
  useUiLanguage()
  const [draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[page,setPage]=useState(1)
  const social=useCommunitySocial(person,'chat',page),profile=social.data?.profile
  const active=useRef(true),lock=useRef(false),history=useRef<HTMLDivElement>(null)
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
  useEffect(()=>{const timer=window.setInterval(social.refresh,10000);return()=>window.clearInterval(timer)},[social.refresh])
  useEffect(()=>{history.current?.scrollTo({top:history.current.scrollHeight})},[person,social.data?.messages?.length])
  const send=async(event:FormEvent)=>{event.preventDefault();if(lock.current||!draft.trim())return;lock.current=true;setBusy(true);setError('');try{await command('direct.send',{targetId:person,body:draft.trim()});if(active.current){setDraft('');social.refresh()}}catch(cause){if(active.current)setError(cause instanceof Error?cause.message:'发送失败，请重试。')}finally{lock.current=false;if(active.current)setBusy(false)}}
  return <section className="community-direct" aria-label={uiText('校园私信')}>
    <header><Link to={`/v2/community?person=${encodeURIComponent(person)}`} aria-label={uiText('返回个人主页')}><ArrowLeft size={22}/></Link>{profile&&<Link className="community-direct-person" to={`/v2/community?person=${encodeURIComponent(person)}`}><DisplayAvatar name={profile.name} avatar={profile.avatar} className="community-list-avatar"/><strong>{profile.name}</strong></Link>}<span>{uiText('私信')}</span></header>
    <div className="community-direct-history" ref={history} role="log" aria-live="polite" aria-label={uiText('私信记录')}>
      {!social.data&&!social.error&&<p role="status">{uiText('正在读取私信…')}</p>}
      {social.data&&!social.data.messages?.length&&<div className="community-empty"><MessageCircle size={32}/><strong>{uiText('打个招呼，开始交流')}</strong><p>{uiText('聊聊校园生活，也请尊重彼此的边界。')}</p></div>}
      {social.data?.messages?.map(message=><article className={message.mine?'is-mine':''} key={message.id}><time>{new Date(message.createdAt).toLocaleString(uiLocale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time><p>{message.body}</p></article>)}
      {social.data?.messagesHasMore&&<button onClick={()=>setPage(value=>value+1)}>{uiText('加载更早的消息')}</button>}
    </div>
    {(error||social.error)&&<p className="community-direct-error" role="alert">{uiText(error||social.error)}<button onClick={social.refresh}>{uiText('重试')}</button></p>}
    <form onSubmit={send}><label className="sr-only" htmlFor="direct-message">{uiText('消息内容')}</label><textarea id="direct-message" rows={1} maxLength={500} value={draft} disabled={!profile||profile.blocked||profile.self} placeholder={uiText(profile?.blocked?'当前无法与该用户互动。':'聊点什么…')} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();if(draft.trim())event.currentTarget.form?.requestSubmit()}}}/><button type="submit" aria-label={uiText('发送私信')} disabled={busy||!draft.trim()||!profile||profile.blocked||profile.self}><ArrowUp size={20}/></button></form>
  </section>
}

export function CommunityDirectInbox(){
  useUiLanguage()
  const social=useCommunitySocial('','inbox')
  useEffect(()=>{const timer=window.setInterval(social.refresh,10000);return()=>window.clearInterval(timer)},[social.refresh])
  return <section className="community-direct-inbox" aria-label={uiText('个人私信')}><h2>{uiText('个人私信')}</h2>{social.error&&<p role="alert">{uiText(social.error)}</p>}{social.data?.conversations?.length?social.data.conversations.map(person=><Link key={person.id} to={`/v2/messages?person=${encodeURIComponent(person.id)}`}><DisplayAvatar className="community-list-avatar" name={person.name} avatar={person.avatar}/><span><strong>{person.name}</strong><small>{person.body}</small></span></Link>):<p>{uiText('从同学的个人主页发起一段交流。')}</p>}</section>
}
