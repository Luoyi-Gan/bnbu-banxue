import {useEffect,useLayoutEffect,useRef,useState,type FormEvent} from 'react'
import {Link,useLocation,useSearchParams} from 'react-router-dom'
import {ArrowDown,ArrowLeft,ArrowUp,ArrowUpRight,BookOpen,CalendarDays,Check,ChevronDown,Copy,Database,ImagePlus,Info,MessageCircle,PanelLeft,Search,Sparkles,Square,SquarePen,UsersRound,X} from 'lucide-react'
import {api} from '../live/api'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {useDevicePreferences} from './devicePreferences'
import {uiText,useUiLanguage} from './uiLanguage'
import {Modal} from './ui'
import {AIMessageContent,AISourceCards} from './AIMessageContent'
import {nearAILatest,type AIAnswer,type AISource} from './aiPresentation'
import yellowIcon from '../assets/companion-yellow.png'
import kittyIcon from '../assets/companion-kitty.png'
import './campusChat.css'
import type {AIKnowledgeCoverage} from '../../shared/v2/aiKnowledge'

const suggestions=[{icon:CalendarDays,title:'看看我的安排',question:'我今天接下来还有哪些课程和待办？'},{icon:UsersRound,title:'发现校园活动',question:'最近有哪些可以参加的校园活动？'},{icon:BookOpen,title:'探索社团',question:'帮我了解一下学校的学术科技类社团。'},{icon:MessageCircle,title:'校园办事',question:'我想办理在读证明，应该联系哪里？'}]
const normalizeSources=(value:unknown):AISource[]=>Array.isArray(value)?value.filter((s):s is AISource=>s&&typeof s==='object'&&typeof s.title==='string'&&typeof s.source==='string'):[]
const categoryLabels:Record<string,string>={guide:'办事指南与联系',organization:'社团组织',activity:'校园活动',shop:'校园探店',partner:'搭子与组队',community:'社区内容',course:'课程与课表',deadline:'本人待办',coffee:'教师与校友交流',notification:'本人通知',sports:'本人体育资料',map:'校园地图',navigation:'平台导航'}
export function CampusAIChat({embedded=false,initialQuestion='',initialConversationId,onDraftChange,onExpand}:{embedded?:boolean;initialQuestion?:string;initialConversationId?:string;onDraftChange?:(text:string)=>void;onExpand?:(text:string,conversationId:string)=>void}={}){
 useUiLanguage()
 const live=useWorkspaceBackend(),device=useDevicePreferences(),location=useLocation(),[,setSearchParams]=useSearchParams()
 const [text,setText]=useState<string>(()=>initialQuestion||(typeof location.state?.campusAIDraft==='string'?location.state.campusAIDraft.slice(0,500):'')),[historyOpen,setHistoryOpen]=useState(()=>!embedded&&window.innerWidth>=1000),[compact,setCompact]=useState(()=>embedded||window.innerWidth<1000),[historyQuery,setHistoryQuery]=useState('')
 const [attempt,setAttempt]=useState<{question:string;requestId:string;error?:string}|null>(null),[asking,setAsking]=useState(false),[recent,setRecent]=useState<AIAnswer[]>([]),[followup,setFollowup]=useState<AIAnswer|null>(null)
 const [newBelow,setNewBelow]=useState(false),[copied,setCopied]=useState(''),[copyError,setCopyError]=useState('')
 const [conversationId,setConversationId]=useState(()=>{const chat=initialConversationId??(!embedded?new URLSearchParams(location.search).get('chat'):null);return chat&&/^[a-zA-Z0-9_-]{1,100}$/.test(chat)?chat:crypto.randomUUID() as string}),[coverage,setCoverage]=useState<AIKnowledgeCoverage|null>(null),[knowledgeOpen,setKnowledgeOpen]=useState(false),[knowledgeError,setKnowledgeError]=useState('')
 const [iconMenu,setIconMenu]=useState(false),[uploadError,setUploadError]=useState('')
 const workbench=useRef<HTMLDivElement>(null),inputRef=useRef<HTMLInputElement>(null),textarea=useRef<HTMLTextAreaElement>(null),scroll=useRef<HTMLDivElement>(null),historyToggle=useRef<HTMLButtonElement>(null)
 const pendingQuestion=useRef<{question:string;requestId:string;conversationId:string;previousAnswerId?:string}|null>(null),questionLock=useRef(false),nearBottom=useRef(true),mounted=useRef(true),controller=useRef<AbortController|null>(null),copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
 const preferences=live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data
 const aiIconChoice=preferences?.aiIconChoice??'yellow',aiCustomIcon=String(preferences?.aiCustomIcon??'')
 const currentIcon=aiIconChoice==='kitty'?kittyIcon:aiIconChoice==='custom'&&aiCustomIcon?aiCustomIcon:yellowIcon
 const saved:AIAnswer[]=(live.data?.entities??[]).filter(e=>e.kind==='answer'&&e.ownerId===live.data?.account.id&&typeof e.data.question==='string'&&typeof e.data.body==='string').map(e=>({id:e.id,question:String(e.data.question),body:String(e.data.body),sources:normalizeSources(e.data.sources),createdAt:e.createdAt,conversationId:typeof e.data.conversationId==='string'?e.data.conversationId:'legacy',previousAnswerId:typeof e.data.previousAnswerId==='string'?e.data.previousAnswerId:undefined,coverage:e.data.coverage as AIKnowledgeCoverage|undefined}))
 const allAnswers=[...new Map([...recent,...saved].map(answer=>[answer.id,answer])).values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)),answers=allAnswers.filter(a=>(a.conversationId??'legacy')===conversationId)
 const hasWorkspace=Boolean(live.data)
 const matching=allAnswers.filter(a=>(a.question+' '+a.body).toLowerCase().includes(historyQuery.trim().toLowerCase())),history=[...new Map(matching.slice().reverse().map(a=>[a.conversationId??'legacy',a])).values()]
 const newConversation=()=>{if(asking)return;setConversationId(crypto.randomUUID());setText('');setAttempt(null);setFollowup(null);pendingQuestion.current=null;nearBottom.current=true;if(compact)setHistoryOpen(false);textarea.current?.focus()}
 const inspectKnowledge=async()=>{setKnowledgeOpen(true);setKnowledgeError('');try{const result=await api<AIKnowledgeCoverage>('/api/ai/knowledge',{});if(mounted.current)setCoverage(result)}catch(error){if(mounted.current)setKnowledgeError(error instanceof Error?error.message:'无法读取知识库状态。')}}
 useEffect(()=>{mounted.current=true;const resize=()=>setCompact(embedded||window.innerWidth<1000);window.addEventListener('resize',resize);return()=>{mounted.current=false;controller.current?.abort();if(copyTimer.current)clearTimeout(copyTimer.current);window.removeEventListener('resize',resize)}},[embedded])
 useEffect(()=>{onDraftChange?.(text)},[text,onDraftChange])
 useEffect(()=>{if(!embedded&&new URLSearchParams(location.search).get('chat')!==conversationId)setSearchParams(current=>{const next=new URLSearchParams(current);next.set('chat',conversationId);return next},{replace:true})},[conversationId,embedded,location.search,setSearchParams])
 useEffect(()=>{const viewport=window.visualViewport;const update=()=>{const root=workbench.current;if(!root)return;const height=viewport?.height??window.innerHeight,notice=document.querySelector('.local-preview-notice')?.getBoundingClientRect().height??0;root.style.setProperty('--nai-viewport-height',Math.max(180,height-notice)+'px');root.classList.toggle('is-keyboard',window.innerWidth<=720&&height<window.innerHeight*.78)};const observer=new ResizeObserver(update);const notice=document.querySelector('.local-preview-notice');if(notice)observer.observe(notice);observer.observe(document.body);update();viewport?.addEventListener('resize',update);window.addEventListener('resize',update);return()=>{observer.disconnect();viewport?.removeEventListener('resize',update);window.removeEventListener('resize',update)}},[hasWorkspace])
 useLayoutEffect(()=>{if(textarea.current){textarea.current.style.height='0px';textarea.current.style.height=Math.min(textarea.current.scrollHeight,160)+'px'}},[text])
 const contentKey=answers.map(a=>a.id).join('|')+'|'+(attempt?.requestId??'')+'|'+asking
 useLayoutEffect(()=>{const node=scroll.current;if(!node)return;if(nearBottom.current){node.scrollTop=node.scrollHeight;setNewBelow(false)}else setNewBelow(true)},[contentKey])
 const jumpLatest=()=>{const node=scroll.current;if(!node)return;nearBottom.current=true;node.scrollTo({top:node.scrollHeight,behavior:device.reducedMotion?'instant':'smooth'});setNewBelow(false)}
 const ask=async(question:string)=>{
  if(!question.trim()||question.length>500||questionLock.current||!live.data)return
  if(!window.confirm(uiText('本次问题、相关历史问答及你有权访问的课程、预约、通知、体育或校园资料片段会发送给 DeepSeek 生成回答。是否同意分享并发送？')))return
  questionLock.current=true;setAsking(true);setCopyError('')
  const parent=followup?.id??answers.at(-1)?.id
  if(pendingQuestion.current?.question!==question||pendingQuestion.current?.previousAnswerId!==parent)pendingQuestion.current={question,conversationId,requestId:crypto.randomUUID(),...(parent?{previousAnswerId:parent}:{})}
  const request={...pendingQuestion.current};setAttempt({question,requestId:request.requestId});const abort=new AbortController();controller.current=abort;let timedOut=false;const timeout=window.setTimeout(()=>{timedOut=true;abort.abort()},55000)
  try{
   const response=await api<{question:string;body:string;sources?:AISource[];coverage?:AIKnowledgeCoverage}>('/api/ai/chat',request,abort.signal)
   if(!mounted.current)return
   if(typeof response.body!=='string'||!response.body.trim()||typeof response.question!=='string')throw new Error('暂未收到有效回答，请重试。')
   setRecent(current=>[...current.filter(a=>a.id!=='campus-ai:'+live.data!.account.id+':'+request.requestId),{id:'campus-ai:'+live.data!.account.id+':'+request.requestId,question:response.question,body:response.body,sources:normalizeSources(response.sources),createdAt:new Date().toISOString(),conversationId,previousAnswerId:parent,coverage:response.coverage}]);if(response.coverage)setCoverage(response.coverage)
   setAttempt(null);setText(current=>current.trim()===question?'':current);setFollowup(null);pendingQuestion.current=null;window.dispatchEvent(new Event('bnbu:workspace-updated'))
  }catch(error){if(mounted.current)setAttempt({question,requestId:request.requestId,error:timedOut?'等待回答超时，请重试。':error instanceof Error&&error.name!=='AbortError'?error.message:'已停止等待。服务端可能仍在处理并产生费用，重试将复用本次请求。'})}
  finally{window.clearTimeout(timeout);questionLock.current=false;if(mounted.current)setAsking(false)}
 }
 const send=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();void ask(text.trim())}
 const copy=async(answer:AIAnswer)=>{try{await navigator.clipboard.writeText(answer.body);setCopied(answer.id);setCopyError('');if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(''),2200)}catch{setCopyError('复制失败，请选择回答文字后复制。')}}
 const selectQuestion=(question:string)=>{setText(question);textarea.current?.focus()}
 const closeHistory=()=>{setHistoryOpen(false);historyToggle.current?.focus()}
 const historyContent=<><button className="nai-new-chat" disabled={asking} onClick={newConversation}><SquarePen size={18}/>{uiText('新对话')}</button><label className="nai-history-search"><Search size={16}/><input aria-label={uiText('搜索问答记录')} value={historyQuery} onChange={e=>setHistoryQuery(e.target.value)} placeholder={uiText('搜索对话')}/></label><span className="nai-history-caption">{uiText('最近对话')}</span><div className="nai-history-items">{history.map(answer=><button key={answer.conversationId??'legacy'} disabled={asking} aria-current={conversationId===(answer.conversationId??'legacy')?'true':undefined} onClick={()=>{setConversationId(answer.conversationId??'legacy');setAttempt(null);setFollowup(null);pendingQuestion.current=null;nearBottom.current=true;if(compact)closeHistory()}}><MessageCircle size={14}/><span>{answer.question}</span></button>)}{!history.length&&<p>{uiText(allAnswers.length?'没有匹配的对话。':'对话会保存在你的账号中。')}</p>}</div><div className="nai-library"><button onClick={()=>void inspectKnowledge()}><Database size={15}/>{uiText('校园知识库')}<ArrowUpRight size={13}/></button>{[['返回校园','/v2/campus'],['我的课表','/v2/me?tab=timetable']].map(([label,path])=><Link key={path} to={path}>{uiText(label)}<ArrowUpRight size={13}/></Link>)}</div></>
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
 return <div className={`campus-ai-workbench${embedded?' is-embedded':''}`} ref={workbench}>
  <header className="nai-header"><div>{!embedded&&<Link className="nai-icon-button" to="/v2/campus" aria-label={uiText('返回校园')}><ArrowLeft size={20}/></Link>}{!embedded&&<button ref={historyToggle} className="nai-icon-button" aria-label={uiText(historyOpen?'收起问答记录':'展开问答记录')} aria-expanded={historyOpen} aria-controls="nai-history" onClick={()=>setHistoryOpen(!historyOpen)}><PanelLeft size={20}/></button>}<button className="nai-identity" onClick={()=>setIconMenu(true)} aria-label={uiText('更换奶蛙形象')}><span>{uiText('奶蛙')}<small>{uiText('校园 AI')}</small></span><ChevronDown size={14}/></button></div>{embedded?<button className="nai-expand" disabled={asking} onClick={()=>onExpand?.(text,conversationId)}>{uiText('展开对话')}<ArrowUpRight size={14}/></button>:<div><button className="nai-icon-button" aria-label={uiText('查看校园知识库')} onClick={()=>void inspectKnowledge()}><Database size={19}/></button><button className="nai-icon-button" aria-label={uiText('开始新对话')} disabled={asking} onClick={newConversation}><SquarePen size={20}/></button></div>}</header>
  <div className={`nai-workspace${historyOpen&&!compact?' has-history':''}`}>
   {!compact&&<aside className="nai-history" id="nai-history" aria-label={uiText('问答记录')} inert={!historyOpen}><div className="nai-history-inner"><h2>{uiText('会同里')}</h2>{historyContent}</div></aside>}
   <section className="nai-conversation" aria-label={uiText('与奶蛙对话')}>
    <div ref={scroll} className="nai-scroll" tabIndex={0} aria-label={uiText('问答内容')} onScroll={()=>{const node=scroll.current!;nearBottom.current=nearAILatest(node.scrollTop,node.clientHeight,node.scrollHeight);if(nearBottom.current)setNewBelow(false)}}>
     <div className="nai-reading">
      {!live.data&&!live.error&&<p role="status" className="nai-loading">{uiText('正在读取本人问答…')}</p>}
      {live.error&&<div className="nai-error" role="alert"><p>{live.error}</p><button onClick={()=>void live.refresh()}>{uiText('重新读取')}</button></div>}
      {live.data&&answers.length===0&&!attempt&&<div className="nai-welcome"><div className="nai-welcome-mark"><img src={currentIcon} alt=""/></div><h1>{uiText('今天，有什么可以帮你？')}</h1><p>{uiText('校园里的事，一起找到答案。')}</p><div className="nai-starters">{suggestions.map(({icon:Icon,title,question})=><button key={title} onClick={()=>selectQuestion(question)}><Icon size={17}/><strong>{uiText(title)}</strong></button>)}</div><button className="nai-welcome-note" onClick={()=>void inspectKnowledge()}><Database size={13}/>{uiText('查看校园知识库与连接状态')}</button></div>}
      {answers.map(answer=><article key={answer.id} id={'nai-turn-'+answer.id} className="nai-turn"><div className="nai-user-message"><span className="nai-sr-only">{uiText('你问：')}</span><p>{answer.question}</p></div><div className="nai-answer"><div className="nai-answer-label"><img src={currentIcon} alt=""/><span>{uiText('奶蛙')}</span></div><AIMessageContent body={answer.body} sources={answer.sources} answerId={answer.id}/><AISourceCards sources={answer.sources} answerId={answer.id} workspace={live.data}/>{answer.coverage&&<details className="nai-retrieval"><summary><Database size={12}/>{uiText('本次检索')} · {answer.coverage.documents} {uiText('份资料')} · {answer.coverage.selected} {uiText('个片段')}</summary><p>{uiText('索引按当前账号权限更新，回答只引用相关片段。')}</p>{answer.coverage.notes.map(note=><p key={note}>{note}</p>)}</details>}<div className="nai-answer-actions"><button aria-label={uiText(copied===answer.id?'回答已复制':'复制回答')} onClick={()=>void copy(answer)}>{copied===answer.id?<Check size={16}/>:<Copy size={16}/>}<span>{uiText(copied===answer.id?'已复制':'复制')}</span></button><button disabled={asking} onClick={()=>{setFollowup(answer);textarea.current?.focus()}}><MessageCircle size={16}/>{uiText('继续提问')}</button><small>{uiText('DeepSeek')}</small></div></div></article>)}
      {attempt&&<article className="nai-turn nai-pending"><div className="nai-user-message"><p>{attempt.question}</p></div><div className="nai-answer"><div className="nai-answer-label"><img src={currentIcon} alt=""/><span>{uiText('奶蛙')}</span></div>{attempt.error?<div className="nai-error" role="alert"><strong>{uiText('这次没有得到回答')}</strong><p>{attempt.error}</p><button disabled={asking} onClick={()=>void ask(attempt.question)}>{uiText('重试这次提问')}</button></div>:<div className="nai-request-status" role="status"><span className="nai-status-dot"/><span>{uiText('正在请求回答')}</span><small>{uiText('正在向 DeepSeek 查询，可能需要一些时间。')}</small></div>}</div></article>}
     </div>
    </div>
    <div className="nai-compose-zone">
     {newBelow&&<button className="nai-latest" onClick={jumpLatest}><ArrowDown size={14}/>{uiText('查看最新回答')}</button>}
     {copyError&&<p className="nai-copy-error" role="status">{uiText(copyError)}</p>}
     <span className="nai-sr-only" role="status">{copied?uiText('回答已复制'):''}</span>
     <form className={`nai-composer${asking?' is-requesting':''}`} onSubmit={send}>
      {followup&&<div className="nai-followup"><MessageCircle size={13}/><span>{uiText('接着回答：')}{followup.question}</span><button type="button" disabled={asking} onClick={()=>setFollowup(null)} aria-label={uiText('取消追问引用')}><X size={13}/></button></div>}
      <textarea ref={textarea} rows={1} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&window.matchMedia('(hover:hover)').matches){e.preventDefault();if(!asking)void ask(text.trim())}}} placeholder={uiText('向奶蛙提问')} aria-label={uiText('校园 AI 问题')} maxLength={500}/>
      <div className="nai-composer-tools"><button type="button" className="nai-knowledge-tool" aria-label={uiText('检索范围与连接状态')} onClick={()=>void inspectKnowledge()}><Database size={17}/><span>{uiText('知识库')}</span></button><details className="nai-provider"><summary><span className="nai-provider-mark"><Sparkles size={13}/></span>DeepSeek<ChevronDown size={12}/></summary><div><strong>{uiText('关于这次问答')}</strong><p>{uiText('问题及检索到的公开资料、本人课程、预约、通知或体育资料会发送至 DeepSeek，单独计费。只发送本次相关片段。')}</p><p>{uiText('回答用于查询与解释。报名、预约和日程修改请在对应页面确认。')}</p></div></details><span className="nai-composer-limit">{text.length>400?`${text.length}/500`:uiText(asking?'等待本次回答':'Shift + Enter 换行')}</span>{asking?<button key="stop" className="nai-send" type="button" aria-label={uiText('停止等待回答')} title={uiText('停止浏览器等待，服务端可能仍会产生费用')} onClick={event=>{event.preventDefault();event.stopPropagation();controller.current?.abort()}}><Square size={15} fill="currentColor"/></button>:<button key="send" className="nai-send" type="submit" aria-label={uiText('发送问题')} disabled={!text.trim()||!live.data}><ArrowUp size={21}/></button>}</div>
     </form><p className="nai-disclosure"><Info size={11}/>{uiText('AI 可能出错，请结合来源核对。DeepSeek 单独计费。')}</p>
    </div>
   </section>
  </div>
  {compact&&historyOpen&&<Modal title={uiText('问答记录')} className="nai-history-layer" gesture={false} onClose={closeHistory}><div className="nai-mobile-history" id="nai-history">{historyContent}</div></Modal>}
  {knowledgeOpen&&<Modal title={uiText('校园知识库')} onClose={()=>setKnowledgeOpen(false)}><div className="nai-knowledge-panel">{knowledgeError&&<p role="alert">{knowledgeError}</p>}{!coverage&&!knowledgeError&&<p role="status">{uiText('正在核对当前可检索资料…')}</p>}{coverage&&<><p>{uiText('当前账号可检索')} <strong>{coverage.documents}</strong> {uiText('份资料，分为')} <strong>{coverage.chunks}</strong> {uiText('个段落。每次提问前更新权限和内容。')}</p><dl>{Object.entries(coverage.categories).map(([category,count])=><div key={category}><dt>{uiText(categoryLabels[category]??category)}</dt><dd>{count}</dd></div>)}</dl><p>{uiText(coverage.connections.school==='connected'?'学校会话已连接':'学校会话未连接，已保存课表仍可检索')}</p><p>{uiText('体育资料在提问涉及运动时实时读取，不以未查询代替零记录。')}</p>{coverage.notes.map(note=><p key={note}>{note}</p>)}<small>{uiText('私信、凭据、他人私人资料、后台审核材料和未接入的附件正文不纳入索引。索引覆盖不等于学校全部信息已核实。')}</small><p>{uiText('更新时间')} {new Date(coverage.indexedAt).toLocaleString('zh-CN')}</p></>}</div></Modal>}
    {iconMenu && <Modal title={uiText("选择奶蛙的形象")} onClose={() => setIconMenu(false)}><div className="v2-icon-options"><button type="button" className={aiIconChoice === 'yellow'?'is-active':''} onClick={() => choose('yellow')}><img src={yellowIcon} alt=""/>{uiText("奶蛙")}</button><button type="button" className={aiIconChoice === 'kitty'?'is-active':''} onClick={() => choose('kitty')}><img src={kittyIcon} alt=""/>Hello Kitty</button></div>{aiCustomIcon && <button type="button" className={`v2-custom-icon-option${aiIconChoice === 'custom' ? ' is-active' : ''}`} onClick={() => choose('custom')}><img src={aiCustomIcon} alt=""/> {uiText("我上传的图片")}</button>}<button type="button" className="v2-button v2-button-secondary v2-upload-button" onClick={() => inputRef.current?.click()}><ImagePlus size={17}/> {uiText("上传自己的图片")}</button><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }}/>{uploadError && <p className="v2-upload-error" role="alert">{uploadError}</p>}<p className="v2-form-note">{uiText("图片会缩小后保存到当前账号。")}</p></Modal>}
 </div>
}
