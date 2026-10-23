import {useMemo,useState} from 'react'
import {ArrowUpRight,BookOpen,Building2,ChevronDown,GraduationCap,HeartHandshake,House,Landmark,MapPin,Phone,Search,ShieldCheck,Sparkles,Wifi,X,Mail,ExternalLink} from 'lucide-react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {uiText,useUiLanguage} from './uiLanguage'
import {campusContacts} from '../../shared/v2/campusContacts'
import {campusGuideCategories,searchCampusGuide,type CampusGuideCategory} from '../../shared/v2/campusGuideSearch'
import photo from '../assets/campus/gallery/tree-lined-path.webp'
import './campusDirectory.css'
const icons={全部:Landmark,住宿生活:House,教务学业:GraduationCap,网络与账号:Wifi,图书馆:BookOpen,校园服务:MapPin,医疗与支持:HeartHandshake,成长与发展:Sparkles,学院与部门:Building2,学校概览:Landmark}
const pageSize=12
export function CampusDirectory(){useUiLanguage()
 const [query,setQuery]=useState(''),[category,setCategory]=useState<CampusGuideCategory>('全部'),[limit,setLimit]=useState(pageSize),live=useWorkspaceBackend()
 const results=useMemo(()=>searchCampusGuide(query,category),[query,category])
 const knowledge=useMemo(()=>{const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return live.data?.entities.filter(item=>item.kind==='knowledge'&&item.data.status==='published'&&terms.every(term=>`${item.data.title} ${item.data.body??item.data.content??''} ${item.data.tags}`.toLowerCase().includes(term)))??[]},[live.data,query])
 const changeQuery=(value:string)=>{setQuery(value);setLimit(pageSize)}
 return <section className="campus-guide" aria-label={uiText('校园办事与公开联系方式搜索')}>
  <div className="campus-guide-hero" style={{backgroundImage:`linear-gradient(90deg,#193e36ed,#193e3675),url(${photo})`}}><span>THE CAMPUS GUIDE</span><h2>{uiText('校园生活，从这里找')}</h2><p>{uiText('住得安心，办事省心，探索更轻松。')}</p><small><ShieldCheck size={13}/>{uiText('学校公开资料')} · {campusContacts.length} {uiText('项指南与入口')}</small></div>
  <div className="campus-guide-search"><Search size={19}/><input type="search" aria-label={uiText('搜索办事或部门')} value={query} maxLength={100} onChange={event=>changeQuery(event.target.value)} placeholder={uiText('搜索宿舍、成绩单、VPN、部门…')}/>{query&&<button aria-label={uiText('清除搜索')} onClick={()=>changeQuery('')}><X size={17}/></button>}</div>
  <div className="campus-guide-suggestions" aria-label={uiText('常用搜索')}>{['宿舍','报修','校园卡','成绩单','VPN'].map(value=><button key={value} onClick={()=>{setCategory('全部');changeQuery(value)}}>{uiText(value)}</button>)}</div>
  <nav className="campus-guide-categories" aria-label={uiText('指南分类')}>{campusGuideCategories.map(value=>{const Icon=icons[value];const count=value==='全部'?campusContacts.length:campusContacts.filter(item=>item.category===value).length;return <button type="button" key={value} aria-pressed={category===value} onClick={()=>{setCategory(value);setLimit(pageSize)}}><Icon size={21} strokeWidth={1.6}/><span>{uiText(value)}</span><small>{count}</small></button>})}</nav>
  <header className="campus-guide-result-heading"><h3>{uiText(category==='全部'?'校园指南':category)}</h3><span role="status" aria-live="polite">{results.length} {uiText('项结果')}</span></header>
  <div className="campus-guide-results">{results.slice(0,limit).map(item=>{const Icon=icons[item.category as CampusGuideCategory]??Landmark;return <details className="campus-guide-card" key={item.id}><summary><span className="campus-guide-card-icon"><Icon size={21} strokeWidth={1.6}/></span><span className="campus-guide-card-title"><small>{uiText(item.category)} · {uiText(item.kind==='department'?'部门':'指南')}</small><strong>{item.name}</strong></span><ChevronDown size={17}/></summary><p className="campus-guide-description">{item.description}</p><div className="campus-guide-detail">{item.location&&<p><MapPin size={15}/>{item.location}</p>}{item.contactNote&&<p className="campus-guide-contact-note">{item.contactNote}</p>}<nav aria-label={item.name+uiText('联系方式')}>{item.phone&&<a href={`tel:${item.phone}`}><Phone size={14}/>{item.phone}</a>}{item.email&&<a href={`mailto:${item.email}`}><Mail size={14}/>{item.email}</a>}</nav><a className="campus-guide-official" href={item.action} target="_blank" rel="noreferrer">{uiText(item.kind==='department'?'部门网站':'查看官方指南')}<ArrowUpRight size={16}/></a><footer><a href={item.source} target="_blank" rel="noreferrer">{item.sourceLabel}<ExternalLink size={11}/></a><span>{item.checkedAt} · {uiText(item.verification==='index'?'官方目录收录':'公开资料核对')}</span></footer></div></details>})}</div>
  {!results.length&&<div className="campus-guide-empty"><Search size={27}/><h3>{uiText('没有找到相关资料')}</h3><p>{uiText('试试部门名称，或清除分类查看全部内容。')}</p><button onClick={()=>{setCategory('全部');changeQuery('')}}>{uiText('查看全部指南')}</button></div>}
  {results.length>limit&&<button className="campus-guide-more" onClick={()=>setLimit(value=>value+pageSize)}>{uiText('继续浏览')} · {results.length-limit} {uiText('项')}<ChevronDown size={15}/></button>}
  {knowledge.length>0&&category==='全部'&&<section className="campus-guide-knowledge"><h3>{uiText('平台校园知识')} · {knowledge.length}</h3>{knowledge.slice(0,limit).map(item=><details key={item.id}><summary>{String(item.data.title)}</summary><p>{String(item.data.body??item.data.content??'')}</p><small>{uiText('平台已发布内容')}</small></details>)}{knowledge.length>limit&&<button className="campus-guide-more" onClick={()=>setLimit(value=>value+pageSize)}>{uiText('继续浏览校园知识')}</button>}</section>}
  <p className="campus-guide-footnote">{uiText('按学校公开网站整理。标注“官方目录收录”的入口来自官网导航，具体办理条件、费用、时间与最新通知请打开官方页面核对。')}</p>
 </section>
}
