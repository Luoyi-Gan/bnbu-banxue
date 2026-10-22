import {Fragment,useState,type ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {ArrowUpRight,CalendarDays,ExternalLink,MapPin} from 'lucide-react'
import {aiBlocks,safeAIHref,type AISource} from './aiPresentation'
import type {Workspace} from '../live/api'
import {homepageAgenda} from './homeAgenda'
import {uiText} from './uiLanguage'

function CodeBlock({text='',language=''}:{text?:string;language?:string}){
 const [state,setState]=useState('复制代码')
 return <div className="nai-code"><header><small>{language||'text'}</small><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setState('已复制')}catch{setState('复制失败，请选择文字复制')}}}>{uiText(state)}</button></header><pre><code>{text}</code></pre></div>
}

function Inline({text,sources,answerId}:{text:string;sources:AISource[];answerId:string}){
 const tokens:ReactNode[]=[],pattern=/(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^\s)]+\)|\[\d+\])/g;let last=0
 for(const match of text.matchAll(pattern)){
  tokens.push(text.slice(last,match.index));const token=match[0],key=String(match.index)
  if(token.startsWith('**'))tokens.push(<strong key={key}>{token.slice(2,-2)}</strong>)
  else if(token.startsWith('`'))tokens.push(<code key={key}>{token.slice(1,-1)}</code>)
  else if(/^\[\d+\]$/.test(token)){const reference=Number(token.slice(1,-1)),source=sources.find((s,i)=>(s.reference??i+1)===reference);tokens.push(source?<button className="nai-inline-citation" key={key} aria-label={`查看来源 ${reference}：${source.title}`} onClick={()=>{const target=document.getElementById(answerId+'-source-'+reference);target?.closest('details')?.setAttribute('open','');target?.scrollIntoView({block:'nearest'})}}>{reference}</button>:token)}
  else{const link=token.match(/^\[([^\]]+)\]\((.+)\)$/)!,href=safeAIHref(link[2]);tokens.push(!href?<Fragment key={key}>{link[1]}</Fragment>:href.startsWith('/')?<Link key={key} to={href}>{link[1]}</Link>:<a key={key} href={href} target="_blank" rel="noreferrer">{link[1]}</a>)}
  last=match.index!+token.length
 }
 tokens.push(text.slice(last));return <>{tokens}</>
}
export function AIMessageContent({body,sources,answerId}:{body:string;sources:AISource[];answerId:string}){
 const inline=(text='')=><Inline text={text} sources={sources} answerId={answerId}/>
 return <div className="nai-prose">{aiBlocks(body).map((block,index)=>{
  switch(block.type){
   case 'heading':return block.level===1?<h2 key={index}>{inline(block.text)}</h2>:<h3 key={index}>{inline(block.text)}</h3>
   case 'code':return <CodeBlock key={index} text={block.text} language={block.language}/>
   case 'list':return block.ordered?<ol key={index}>{block.items?.map((item,i)=><li key={i}>{inline(item)}</li>)}</ol>:<ul key={index}>{block.items?.map((item,i)=><li key={i}>{inline(item)}</li>)}</ul>
   case 'quote':return <blockquote key={index}>{inline(block.text)}</blockquote>
   case 'table':return <div className="nai-table" key={index} role="region" aria-label={uiText('回答中的表格')} tabIndex={0}><table><thead><tr>{block.rows?.[0].map((cell,i)=><th key={i} scope="col">{inline(cell)}</th>)}</tr></thead><tbody>{block.rows?.slice(1).map((row,i)=><tr key={i}>{block.rows?.[0].map((_,j)=><td key={j}>{inline(row[j]??'')}</td>)}</tr>)}</tbody></table></div>
   default:return <p key={index}>{inline(block.text)}</p>
  }
 })}</div>
}
export function AISourceCards({sources,answerId,workspace}:{sources:AISource[];answerId:string;workspace:Workspace|null}){
 if(!sources.length)return null
 return <details className="nai-sources"><summary>{uiText('参考来源')} <span>{sources.length}</span></summary><div className="nai-source-grid">{sources.map((source,index)=>{
  const entity=workspace?.entities.find(e=>e.id===source.id),reference=source.reference??index+1
  const href=safeAIHref(entity?.kind==='activity'?'/v2/activities/'+encodeURIComponent(entity.id):source.source)
  const label=entity?.kind==='organization'?'社团资料':entity?.kind==='activity'?'校园活动':entity?.kind==='timetable'?'我的课表':source.source.startsWith('https:')?'官方资料':'平台资料'
  const content=<><span className="nai-source-number">{reference}</span><div><small>{uiText(label)}</small><strong>{source.title}</strong>{entity?.kind==='activity'&&typeof entity.data.location==='string'&&<span className="nai-source-place"><MapPin size={12}/>{entity.data.location}</span>}</div>{href?.startsWith('/')?<ArrowUpRight size={15}/>:<ExternalLink size={14}/>}</>
  return <Fragment key={(source.id??index)+':'+reference}>{href?.startsWith('/')?<Link className="nai-source-card" id={answerId+'-source-'+reference} to={href}>{content}</Link>:href?<a className="nai-source-card" id={answerId+'-source-'+reference} href={href} target="_blank" rel="noreferrer">{content}</a>:<div className="nai-source-card" id={answerId+'-source-'+reference}>{content}</div>}</Fragment>
 })}</div>{sources.some(source=>workspace?.entities.some(e=>e.id===source.id&&e.kind==='timetable'))&&<div className="nai-agenda-card"><header><CalendarDays size={15}/>{uiText('接下来的已选课程')}<small>{uiText('实时课表')}</small></header>{homepageAgenda(workspace).remainingCourses.slice(0,3).map(course=><Link key={course.id} to={course.path}><time>{new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(new Date(course.startAt!))}</time><span><strong>{course.title}</strong><small>{course.location}</small></span><ArrowUpRight size={14}/></Link>)}{!homepageAgenda(workspace).remainingCourses.length&&<p>{uiText('今天已无待上课程，可到完整课表查看其他日期。')}</p>}</div>}</details>
}
