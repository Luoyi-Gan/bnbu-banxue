import { uiText, useUiLanguage } from './uiLanguage'
import { UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatedSearchField } from './AnimatedSearchField'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Empty, PageHeading } from './ui'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { coverRatio } from './discoveryLayout'
import './discoveryPage.css'
import {DiscoveryDetail,DetailPhoto} from './DiscoveryDetail'
import {sharedElementTransition} from './sharedElementMotion'

export function CampusOrganizations({ embedded = false, externalQuery, externalCategory }: { embedded?: boolean; externalQuery?: string; externalCategory?: string }) { useUiLanguage();
  const live = useWorkspaceBackend()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState('全部')
  const [selectedId,setSelectedId]=useState<string|null>(null)
  const organizations = (live.data?.entities ?? []).filter(item => item.kind === 'organization' && item.data.status === 'approved' && item.data.visibility === 'visible').map(item => ({
    id: item.id,
    name: String(item.data.name ?? ''),
    category: String(item.data.category ?? ''),
    description: String(item.data.description ?? ''),
    contact: String(item.data.contact ?? ''),
    image: String(item.data.image ?? ''),
  }))
  const follows = new Set(live.data?.relations.filter(item => item.kind === 'follow').map(item => item.entityId) ?? [])
  const selected=organizations.find(item=>item.id===selectedId)
  const categories = ['全部', ...new Set(organizations.map(item => item.category))]
  const normalizedQuery = (externalQuery ?? query).trim().toLocaleLowerCase()
  const shown = organizations.filter(item => ((externalCategory ?? category) === '全部' || (externalCategory ?? category) === item.category) && `${item.name} ${uiText(item.category)} ${item.description}`.toLocaleLowerCase().includes(normalizedQuery))
  const content = <>
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    {!live.data && !live.error && <p role="status">{uiText("正在读取公开组织…")}</p>}
    {externalQuery===undefined&&<div className="v2-directory-tools"><AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText("搜索组织、类别或关键词")}/><span>{shown.length} {uiText("个组织")}</span></div>}
    {externalCategory===undefined&&<nav className="campus-discovery-pills" aria-label={uiText("组织分类")}>{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{uiText(item)}</button>)}</nav>}
    {!!shown.length&&<DiscoveryMasonry key={`${normalizedQuery}|${externalCategory??category}`} items={shown} itemLabel="组织" renderItem={item=><article className="discovery-card organization-discovery-card" key={item.id} data-organization-id={item.id}>
      <button type="button" className="organization-detail-trigger" data-shared-media={`organization:${item.id}`} aria-label={uiText('查看组织：')+item.name} onClick={event=>sharedElementTransition(`organization:${item.id}`,()=>setSelectedId(item.id),{source:event.currentTarget})}><OrganizationCover name={item.name} image={item.image} category={item.category} id={item.id}/></button>
      <h3 className="discovery-title"><button className="organization-title-trigger" type="button" onClick={()=>sharedElementTransition(`organization:${item.id}`,()=>setSelectedId(item.id))}>{item.name}</button></h3>
      <div className="organization-discovery-footer"><small>{uiText(item.category)}</small><button type="button" aria-pressed={follows.has(item.id)} disabled={live.busy} onClick={() => void live.mutate('relation.set', { id: item.id, kind: 'follow', enabled: !follows.has(item.id) })}>{follows.has(item.id)?uiText('已关注'):uiText('关注')}</button></div>
      {(item.description||item.contact)&&<details className="organization-discovery-details"><summary>{uiText('组织介绍与联系')}</summary>{item.description&&<p className="organization-discovery-description">{item.description}</p>}{item.contact&&<small className="organization-discovery-contact">{item.contact}</small>}</details>}
    </article>}/>}
    {live.data && !shown.length && <Empty icon={UsersRound} title={uiText("没有匹配的组织")} description={uiText("试试其他类别或关键词。")}/>}
    {selected&&<DiscoveryDetail title={selected.name} transitionKey={`organization:${selected.id}`} identity={<strong>{uiText(selected.category)}</strong>} media={selected.image?<DetailPhoto src={selected.image} alt={selected.name}/>:<div className="organization-detail-placeholder"><UsersRound size={40}/><strong>{selected.name}</strong></div>} onClose={()=>setSelectedId(null)} actions={<button type="button" disabled={live.busy} aria-pressed={follows.has(selected.id)} onClick={()=>void live.mutate('relation.set',{id:selected.id,kind:'follow',enabled:!follows.has(selected.id)})}>{uiText(follows.has(selected.id)?'已关注':'关注')}</button>}><p>{selected.description||uiText('暂无组织介绍')}</p>{selected.contact&&<p>{uiText('联系方式：')}{selected.contact}</p>}{live.error&&<p role="alert">{uiText(live.error)}</p>}</DiscoveryDetail>}
  </>
  if (embedded) return <section className="organization-discovery" aria-label={uiText("社团组织")}>{content}</section>
  return <div className="v2-page v2-organizations-page"><PageHeading back="/v2/campus" eyebrow="CAMPUS / ORGANIZATIONS" title={uiText("社团组织")} description={uiText("认识校园里的同行者。")}/>{content}</div>
}

function OrganizationCover({id,name,image,category}:{id:string;name:string;image:string;category:string}){
  const [failed,setFailed]=useState(false)
  return <div className="discovery-cover organization-discovery-cover" style={{aspectRatio:coverRatio(id)}}>{image&&!failed?<img src={image} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="organization-text-cover"><UsersRound size={28}/><strong>{name.slice(0,2)}</strong><small>{uiText(category)}</small></span>}</div>
}
