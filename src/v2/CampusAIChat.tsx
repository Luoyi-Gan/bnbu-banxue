import {useEffect,useLayoutEffect,useRef,useState,type FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {ArrowDown,ArrowLeft,ArrowUp,ArrowUpRight,BookOpen,CalendarDays,Check,ChevronDown,Copy,ImagePlus,Info,MessageCircle,PanelLeft,Search,Sparkles,UsersRound,X} from 'lucide-react'
import {api} from '../live/api'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {useDevicePreferences} from './devicePreferences'
import {uiText,useUiLanguage} from './uiLanguage'
import {Modal} from './ui'
import {AIMessageContent,AISourceCards} from './AIMessageContent'
import {nearAILatest,type AIAnswer,type AISource} from './aiPresentation'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import './campusAI.css'

const suggestions=[{icon:CalendarDays,title:'看看我的安排',question:'我今天接下来还有哪些课程和待办？'},{icon:UsersRound,title:'发现校园活动',question:'最近有哪些可以参加的校园活动？'},{icon:BookOpen,title:'探索社团',question:'帮我了解一下学校的学术科技类社团。'},{icon:MessageCircle,title:'校园办事',question:'我想办理在读证明，应该联系哪里？'}]
const normalizeSources=(value:unknown):AISource[]=>Array.isArray(value)?value.filter((s):s is AISource=>s&&typeof s==='object'&&typeof s.title==='string'&&typeof s.source==='string'):[]
export function CampusAIChat(){
 useUiLanguage()
 const live=useWorkspaceBackend(),device=useDevicePreferences()
 const [text,setText]=useState(''),[historyOpen,setHistoryOpen]=useState(()=>window.innerWidth>=1000),[compact,setCompact]=useState(()=>window.innerWidth<1000),[historyQuery,setHistoryQuery]=useState('')
 const [attempt,setAttempt]=useState<{question:string;requestId:string;error?:string}|null>(null),[asking,setAsking]=useState(false),[recent,setRecent]=useState<AIAnswer[]>([]),[followup,setFollowup]=useState<AIAnswer|null>(null)
 const [newBelow,setNewBelow]=useState(false),[copied,setCopied]=useState(''),[copyError,setCopyError]=useState('')
 const [iconMenu,setIconMenu]=useState(false),[uploadError,setUploadError]=useState('')
 const workbench=useRef<HTMLDivElement>(null),inputRef=useRef<HTMLInputElement>(null),textarea=useRef<HTMLTextAreaElement>(null),scroll=useRef<HTMLDivElement>(null),historyToggle=useRef<HTMLButtonElement>(null)
 const pendingQuestion=useRef<{question:string;requestId:string;previousAnswerId?:string}|null>(null),questionLock=useRef(false),nearBottom=useRef(true),mounted=useRef(true),controller=useRef<AbortController|null>(null),copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
 const preferences=live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data
 const aiIconChoice=preferences?.aiIconChoice??'yellow',aiCustomIcon=String(preferences?.aiCustomIcon??'')
 const currentIcon=aiIconChoice==='kitty'?kittyIcon:aiIconChoice==='custom'&&aiCustomIcon?aiCustomIcon:yellowIcon
 const saved:AIAnswer[]=(live.data?.entities??[]).filter(e=>e.kind==='answer'&&e.ownerId===live.data?.account.id&&typeof e.data.question==='string'&&typeof e.data.body==='string').map(e=>({id:e.id,question:String(e.data.question),body:String(e.data.body),sources:normalizeSources(e.data.sources),createdAt:e.createdAt}))
 const answers=[...new Map([...recent,...saved].map(answer=>[answer.id,answer])).values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))
 const hasWorkspace=Boolean(live.data)
 const history=answers.filter(a=>a.question.toLowerCase().includes(historyQuery.trim().toLowerCase())).slice().reverse()
 useEffect(()=>{mounted.current=true;const resize=()=>setCompact(window.innerWidth<1000);window.addEventListener('resize',resize);return()=>{mounted.current=false;controller.current?.abort();if(copyTimer.current)clearTimeout(copyTimer.current);window.removeEventListener('resize',resize)}},[])
 useEffect(()=>{const viewport=window.visualViewport;const update=()=>{const root=workbench.current;if(!root)return;const height=viewport?.height??window.innerHeight,notice=document.querySelector('.local-preview-notice')?.getBoundingClientRect().height??0;root.style.setProperty('--nai-viewport-height',Math.max(180,height-notice)+'px');root.classList.toggle('is-keyboard',window.innerWidth<=720&&height<window.innerHeight*.78)};const observer=new ResizeObserver(update);const notice=document.querySelector('.local-preview-notice');if(notice)observer.observe(notice);observer.observe(document.body);update();viewport?.addEventListener('resize',update);window.addEventListener('resize',update);return()=>{observer.disconnect();viewport?.removeEventListener('resize',update);window.removeEventListener('resize',update)}},[hasWorkspace])
 useLayoutEffect(()=>{if(textarea.current){textarea.current.style.height='0px';textarea.current.style.height=Math.min(textarea.current.scrollHeight,160)+'px'}},[text])
 const contentKey=answers.map(a=>a.id).join('|')+'|'+(attempt?.requestId??'')+'|'+asking
 useLayoutEffect(()=>{const node=scroll.current;if(!node)return;if(nearBottom.current){node.scrollTop=node.scrollHeight;setNewBelow(false)}else setNewBelow(true)},[contentKey])
 const jumpLatest=()=>{const node=scroll.current;if(!node)return;nearBottom.current=true;node.scrollTo({top:node.scrollHeight,behavior:device.reducedMotion?'instant':'smooth'});setNewBelow(false)}
 const ask=async(question:string)=>{
  if(!question.trim()||question.length>500||questionLock.current||!live.data)return
  questionLock.current=true;setAsking(true);setCopyError('')
  const parent=followup?.id
  if(pendingQuestion.current?.question!==question||pendingQuestion.current?.previousAnswerId!==parent)pendingQuestion.current={question,requestId:crypto.randomUUID(),...(parent?{previousAnswerId:parent}:{})}
  const request={...pendingQuestion.current};setAttempt({question,requestId:request.requestId});const abort=new AbortController();controller.current=abort;let timedOut=false;const timeout=window.setTimeout(()=>{timedOut=true;abort.abort()},55000)
  try{
   const response=await api<{question:string;body:string;sources?:AISource[]}>('/api/ai/chat',request,abort.signal)
   if(!mounted.current)return
   if(typeof response.body!=='string'||!response.body.trim()||typeof response.question!=='string')throw new Error('暂未收到有效回答，请重试。')
   setRecent(current=>[...current.filter(a=>a.id!=='campus-ai:'+live.data!.account.id+':'+request.requestId),{id:'campus-ai:'+live.data!.account.id+':'+request.requestId,question:response.question,body:response.body,sources:normalizeSources(response.sources),createdAt:new Date().toISOString()}])
   setAttempt(null);setText(current=>current.trim()===question?'':current);setFollowup(null);pendingQuestion.current=null;window.dispatchEvent(new Event('bnbu:workspace-updated'))
  }catch(error){if(mounted.current)setAttempt({question,requestId:request.requestId,error:timedOut?'等待回答超时，请重试。':error instanceof Error&&error.name!=='AbortError'?error.message:'请求已中断，可重试。'})}
  finally{window.clearTimeout(timeout);questionLock.current=false;if(mounted.current)setAsking(false)}
 }
 const send=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();void ask(text.trim())}
 const copy=async(answer:AIAnswer)=>{try{await navigator.clipboard.writeText(answer.body);setCopied(answer.id);setCopyError('');if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(''),2200)}catch{setCopyError('复制失败，请选择回答文字后复制。')}}
 const selectQuestion=(question:string)=>{setText(question);textarea.current?.focus()}
 const closeHistory=()=>{setHistoryOpen(false);historyToggle.current?.focus()}
 const historyContent=<><label className="nai-history-search"><Search size={15}/><input aria-label={uiText('搜索问答记录')} value={historyQuery} onChange={e=>setHistoryQuery(e.target.value)} placeholder={uiText('搜索记录')}/></label><div className="nai-history-items">{history.map(answer=><button key={answer.id} onClick={()=>{if(compact)closeHistory();document.getElementById('nai-turn-'+answer.id)?.scrollIntoView({block:'start',behavior:device.reducedMotion?'instant':'smooth'});nearBottom.current=false}}><MessageCircle size={14}/><span>{answer.question}</span></button>)}{!history.length&&<p>{uiText(answers.length?'没有匹配的记录。':'从一个校园问题开始，回答会保存在你的账号里。')}</p>}</div><div className="nai-library"><span>{uiText('校园入口')}</span>{[['课程与待办','/v2/me?tab=timetable'],['社团组织','/v2/organizations'],['校园活动','/v2/activities'],['办事与联系','/v2/campus?service=directory']].map(([label,path])=><Link key={path} to={path}>{uiText(label)}<ArrowUpRight size={13}/></Link>)}</div></>
  const choose = async (next: 'yellow' | 'kitty' | 'custom') => { if (await live.mutate('preferences.aiicon', {choice: next})) {setIconMenu(false); setUploadError('')} }
  const upload = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { setUploadError('请选择小于 5 MB 的图片。'); return }
    const objectUrl = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = objectUrl
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const context = canvas.getContext('2d')
      if (!context) throw new Error('canvas unavailable')
      const scale = Math.max(256 / image.naturalWidth, 256 / image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      context.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height)
      const aiCustomIcon = canvas.toDataURL('image/webp', 0.82)
      if (!await live.mutate('preferences.aiicon', {choice: 'custom', image: aiCustomIcon})) {setUploadError('图片保存失败，请重试。'); return}
      setIconMenu(false)
      setUploadError('')
    } catch { setUploadError('无法读取这张图片，请换一张重试。') }
    finally { URL.revokeObjectURL(objectUrl) }
  }
 return <div className="campus-ai-workbench" ref={workbench}>
  <header className="nai-header"><div><Link className="nai-icon-button" to="/v2" aria-label={uiText('返回首页')}><ArrowLeft size={19}/></Link><button ref={historyToggle} className="nai-icon-button" aria-label={uiText(historyOpen?'收起问答记录':'展开问答记录')} aria-expanded={historyOpen} aria-controls="nai-history" onClick={()=>setHistoryOpen(!historyOpen)}><PanelLeft size={18}/></button><span className="nai-header-divider"/><button className="nai-identity" onClick={()=>setIconMenu(true)} aria-label={uiText('更换奶蛙形象')}><img src={currentIcon} alt=""/><span>{uiText('奶蛙')}<small>{uiText('校园 AI')}</small></span><ChevronDown size={12}/></button></div><span className="nai-header-mode"><span/>{uiText('校园资料问答')}</span></header>
  <div className={`nai-workspace${historyOpen&&!compact?' has-history':''}`}>
   {!compact&&<aside className="nai-history" id="nai-history" aria-label={uiText('问答记录')} inert={!historyOpen}><div className="nai-history-inner"><h2>{uiText('问答记录')}</h2>{historyContent}</div></aside>}
   <section className="nai-conversation" aria-label={uiText('与奶蛙对话')}>
    <div ref={scroll} className="nai-scroll" tabIndex={0} aria-label={uiText('问答内容')} onScroll={()=>{const node=scroll.current!;nearBottom.current=nearAILatest(node.scrollTop,node.clientHeight,node.scrollHeight);if(nearBottom.current)setNewBelow(false)}}>
     <div className="nai-reading">
      {!live.data&&!live.error&&<p role="status" className="nai-loading">{uiText('正在读取本人问答…')}</p>}
      {live.error&&<div className="nai-error" role="alert"><p>{live.error}</p><button onClick={()=>void live.refresh()}>{uiText('重新读取')}</button></div>}
      {live.data&&answers.length===0&&!attempt&&<div className="nai-welcome"><div className="nai-welcome-mark"><img src={currentIcon} alt=""/></div><span className="nai-eyebrow">{uiText('你的校园，一起探索')}</span><h1>{uiText('校园里的事，')}<br/>{uiText('问问奶蛙。')}</h1><p>{uiText('从课程安排到校园生活，')}<br className="nai-mobile-break"/>{uiText('带着问题来，找到下一步。')}</p><div className="nai-starters">{suggestions.map(({icon:Icon,title,question})=><button key={title} onClick={()=>selectQuestion(question)}><Icon size={18}/><strong>{uiText(title)}</strong><ArrowUpRight size={14}/></button>)}</div><span className="nai-welcome-note"><BookOpen size={13}/>{uiText('结合当前可见校园资料，回答附来源')}</span></div>}
      {answers.map(answer=><article key={answer.id} id={'nai-turn-'+answer.id} className="nai-turn"><div className="nai-user-message"><span className="nai-sr-only">{uiText('你问：')}</span><p>{answer.question}</p></div><div className="nai-answer"><div className="nai-answer-label"><img src={currentIcon} alt=""/><span>{uiText('奶蛙')}</span></div><AIMessageContent body={answer.body} sources={answer.sources} answerId={answer.id}/><AISourceCards sources={answer.sources} answerId={answer.id} workspace={live.data}/><div className="nai-answer-actions"><button aria-label={uiText(copied===answer.id?'回答已复制':'复制回答')} onClick={()=>void copy(answer)}>{copied===answer.id?<Check size={15}/>:<Copy size={15}/>}<span>{uiText(copied===answer.id?'已复制':'复制')}</span></button><button disabled={asking} onClick={()=>{setFollowup(answer);textarea.current?.focus()}}><MessageCircle size={15}/>{uiText('继续提问')}</button><small>{uiText('DeepSeek · 回答已完成')}</small></div></div></article>)}
      {attempt&&<article className="nai-turn nai-pending"><div className="nai-user-message"><p>{attempt.question}</p></div><div className="nai-answer"><div className="nai-answer-label"><img src={currentIcon} alt=""/><span>{uiText('奶蛙')}</span></div>{attempt.error?<div className="nai-error" role="alert"><strong>{uiText('这次没有得到回答')}</strong><p>{attempt.error}</p><button disabled={asking} onClick={()=>void ask(attempt.question)}>{uiText('重试这次提问')}</button></div>:<div className="nai-request-status" role="status"><span className="nai-status-dot"/><span>{uiText('正在请求回答')}</span><small>{uiText('正在向 DeepSeek 查询，可能需要一些时间。')}</small></div>}</div></article>}
     </div>
    </div>
    <div className="nai-compose-zone">
     {newBelow&&<button className="nai-latest" onClick={jumpLatest}><ArrowDown size={14}/>{uiText('查看最新回答')}</button>}
     {copyError&&<p className="nai-copy-error" role="status">{uiText(copyError)}</p>}
     <span className="nai-sr-only" role="status">{copied?uiText('回答已复制'):''}</span>
     <form className={`nai-composer${asking?' is-requesting':''}`} onSubmit={send}>
      {followup&&<div className="nai-followup"><MessageCircle size={13}/><span>{uiText('接着回答：')}{followup.question}</span><button type="button" disabled={asking} onClick={()=>setFollowup(null)} aria-label={uiText('取消追问引用')}><X size={13}/></button></div>}
      <textarea ref={textarea} rows={1} value={text} readOnly={asking} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&window.matchMedia('(hover:hover)').matches){e.preventDefault();if(!asking)void ask(text.trim())}}} placeholder={uiText('想了解校园里的什么？')} aria-label={uiText('校园 AI 问题')} maxLength={500}/>
      <div className="nai-composer-tools"><details className="nai-provider"><summary><span className="nai-provider-mark"><Sparkles size={13}/></span>DeepSeek<ChevronDown size={12}/></summary><div><strong>{uiText('关于这次问答')}</strong><p>{uiText('提问及相关公开校园资料、本人安排会发送至 DeepSeek，单独计费。仅查询你有权查看的信息。')}</p><p>{uiText('回答用于查询与解释。报名、预约和日程修改请在对应页面确认。')}</p></div></details><span className="nai-composer-limit">{text.length>400?`${text.length}/500`:uiText(asking?'等待本次回答':'Shift + Enter 换行')}</span><button className="nai-send" type="submit" aria-label={uiText('发送问题')} disabled={asking||!text.trim()||!live.data}><ArrowUp size={19}/></button></div>
     </form><p className="nai-disclosure"><Info size={11}/>{uiText('AI 可能出错，请结合来源核对。DeepSeek 单独计费。')}</p>
    </div>
   </section>
  </div>
  {compact&&historyOpen&&<Modal title={uiText('问答记录')} onClose={closeHistory}><div className="nai-mobile-history" id="nai-history">{historyContent}</div></Modal>}
    {iconMenu && <Modal title={uiText("选择奶蛙的形象")} onClose={() => setIconMenu(false)}><div className="v2-icon-options"><button type="button" className={aiIconChoice === 'yellow'?'is-active':''} onClick={() => choose('yellow')}><img src={yellowIcon} alt=""/>{uiText("奶蛙")}</button><button type="button" className={aiIconChoice === 'kitty'?'is-active':''} onClick={() => choose('kitty')}><img src={kittyIcon} alt=""/>Hello Kitty</button></div>{aiCustomIcon && <button type="button" className={`v2-custom-icon-option${aiIconChoice === 'custom' ? ' is-active' : ''}`} onClick={() => choose('custom')}><img src={aiCustomIcon} alt=""/> {uiText("我上传的图片")}</button>}<button type="button" className="v2-button v2-button-secondary v2-upload-button" onClick={() => inputRef.current?.click()}><ImagePlus size={17}/> {uiText("上传自己的图片")}</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }}/>{uploadError && <p className="v2-upload-error" role="alert">{uploadError}</p>}<p className="v2-form-note">{uiText("图片会缩小后保存到当前账号。")}</p></Modal>}
 </div>
}
