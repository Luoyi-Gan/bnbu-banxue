import {LoadingSwap} from './MaterialSkeleton'
import { CalendarDays, House, MessageCircle, UsersRound, Check, ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActivityDiscovery } from './ActivityDiscovery'
import { AlumniDiscovery } from './AlumniDiscoveryFeed'
import { CampusOrganizations } from './CampusOrganizations'
import { CommunityHub } from './CommunityHub'
import { filterActivityItems, type ActivityPeriod, type ActivitySort } from './activityFilters'
import { liveActivities } from './liveActivities'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Header, EmptyNote, Feedback } from './reference/components'
import { uiText, useUiLanguage } from './uiLanguage'
import './discoveryPage.css'

const sectionIcons={activities:CalendarDays,organizations:UsersRound,community:House,alumni:MessageCircle}
const sections=[['community','校园社区','Community'],['activities','活动','Activities'],['organizations','社团组织','Clubs'],['alumni','校友交流','Alumni']] as const

export function DiscoveryPage(){
  const language=useUiLanguage()
  const [params,setParams]=useSearchParams()
  const section=sections.find(([key])=>key===params.get('section'))?.[0]??'activities'
  return <div className="ref-page cw-pages campus-discovery"><Header title={uiText('发现')} search={false} hideConversations/>
    <nav className="campus-discovery-sections" aria-label={uiText('发现分类')}>{sections.map(([key,label,enLabel])=>{const Icon=sectionIcons[key];return <button key={key} type="button" aria-pressed={section===key} onClick={()=>setParams(key==='activities'?{}:{section:key})}><Icon size={20} aria-hidden="true"/><span>{language==='en'?enLabel:label}</span></button>})}</nav>
    <div className="campus-discovery-panel" key={section}>
      {section==='activities'&&<ActivityPanel initialQuery={params.get('q')??''} initialCategory={params.get('category')??'全部'}/>}
      {section==='organizations'&&<CampusOrganizations embedded/>}
      {section==='community'&&<CommunityPanel/>}
      {section==='alumni'&&<AlumniDiscovery embedded/>}
    </div>
  </div>
}

function SearchField({value,onChange,label}:{value:string;onChange:(value:string)=>void;label:string}){
  return <label className="campus-discovery-search"><Search size={18}/><input type="search" value={value} onChange={e=>onChange(e.target.value)} aria-label={uiText(label)} placeholder={uiText(label)}/></label>
}

function FilterChoice({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(value:string)=>void}){
  const id=useId(),trigger=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false)
  return <div className="discovery-choice-row"><span id={id}>{uiText(label)}</span><div className="discovery-choice"><button type="button" ref={trigger} aria-label={`${uiText(label)}：${uiText(value)}`} aria-expanded={open} aria-controls={`${id}-options`} onClick={()=>setOpen(value=>!value)} onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}><span>{uiText(value)}</span><ChevronDown size={16}/></button>{open&&<div id={`${id}-options`} className="discovery-choice-options" role="radiogroup" aria-labelledby={id} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}}}>{options.map(option=><label key={option}><input type="radio" name={id} value={option} checked={value===option} onChange={()=>{onChange(option);setOpen(false);trigger.current?.focus()}}/><span>{uiText(option)}</span>{value===option&&<Check size={15}/>}</label>)}</div>}</div></div>
}

function ActivityPanel({initialQuery,initialCategory}:{initialQuery:string;initialCategory:string}){
  useUiLanguage()
  const live=useWorkspaceBackend()
  const [query,setQuery]=useState(initialQuery),[category,setCategory]=useState(initialCategory==='校园成员活动'?'全部':initialCategory)
  const [period,setPeriod]=useState<ActivityPeriod>('全部时间'),[sort,setSort]=useState<ActivitySort>('时间最近'),[location,setLocation]=useState('全部地点')
  const all=liveActivities(live.data)
  const categories=['全部',...new Set(all.filter(a=>a.local?.status==='published').map(a=>a.category).filter(value=>value!=='校园成员活动'))]
  const locations=['全部地点',...new Set(all.filter(a=>a.local?.status==='published').map(a=>a.location).filter(Boolean))]
  const filtered=filterActivityItems(all,{query,category,period,sort,host:'全部主办方',status:'全部状态'},live.data?.account.id??'').filter(a=>location==='全部地点'||a.location===location)
  const hasFilters=!!query||category!=='全部'||period!=='全部时间'||location!=='全部地点'
  return <>
    <div className="campus-discovery-tools"><SearchField value={query} onChange={setQuery} label="搜索活动、地点或主办方"/></div>
    <div className="campus-discovery-filter-line"><nav className="campus-discovery-pills" aria-label={uiText('活动类别')}>{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{uiText(c)}</button>)}</nav>
      <details className="campus-discovery-filters"><summary><SlidersHorizontal size={16}/>{uiText('筛选')}</summary><div className="campus-discovery-filter-fields">
        <FilterChoice label="时间" value={period} options={['全部时间','今天','本周','下周']} onChange={value=>setPeriod(value as ActivityPeriod)}/>
        <FilterChoice label="地点" value={location} options={locations} onChange={setLocation}/>
        <FilterChoice label="排序" value={sort} options={['时间最近','推荐顺序']} onChange={value=>setSort(value as ActivitySort)}/>
      </div></details>
    </div>
    {hasFilters&&<button className="campus-discovery-clear" type="button" onClick={()=>{setQuery('');setCategory('全部');setPeriod('全部时间');setLocation('全部地点')}}>{uiText('清除筛选')}</button>}
    <Feedback live={live}/>
    <LoadingSwap loading={!live.data&&!live.error}>{filtered.length?<ActivityDiscovery items={filtered} basePath="/v2/activities" live={live}/>:<EmptyNote>{!live.data?uiText('正在读取活动…'):hasFilters?uiText('没有符合条件的活动，试试其他筛选。'):uiText('暂时没有公开活动。新的校园消息会在这里出现。')}</EmptyNote>}</LoadingSwap>
  </>
}

function CommunityPanel(){return <CommunityHub embedded/>}
