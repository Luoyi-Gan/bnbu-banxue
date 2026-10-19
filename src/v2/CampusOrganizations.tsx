import { uiText, useUiLanguage } from './uiLanguage'
import { UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatedSearchField } from './AnimatedSearchField'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Empty, PageHeading } from './ui'
import { DiscoveryMasonry } from './DiscoveryMasonry'
import { coverRatio } from './discoveryLayout'
import './discoveryPage.css'

export function CampusOrganizations({ embedded = false, externalQuery, externalCategory }: { embedded?: boolean; externalQuery?: string; externalCategory?: string }) { useUiLanguage();
  const live = useWorkspaceBackend()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState('全部')
  const organizations = (live.data?.entities ?? []).filter(item => item.kind === 'organization' && item.data.status === 'approved' && item.data.visibility === 'visible').map(item => ({
    id: item.id,
    name: String(item.data.name ?? ''),
    category: String(item.data.category ?? ''),
    description: String(item.data.description ?? ''),
    contact: String(item.data.contact ?? ''),
    image: String(item.data.image ?? ''),
  }))
  const follows = new Set(live.data?.relations.filter(item => item.kind === 'follow').map(item => item.entityId) ?? [])
  const categories = ['全部', ...new Set(organizations.map(item => item.category))]
  const normalizedQuery = (externalQuery ?? query).trim().toLocaleLowerCase()
  const shown = organizations.filter(item => ((externalCategory ?? category) === '全部' || (externalCategory ?? category) === item.category) && `${item.name} ${uiText(item.category)} ${item.description}`.toLocaleLowerCase().includes(normalizedQuery))
  const content = <>
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    {!live.data && !live.error && <p role="status">{uiText("正在读取公开组织…")}</p>}
    {externalQuery===undefined&&<div className="v2-directory-tools"><AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText("搜索组织、类别或关键词")}/><span>{shown.length} {uiText("个组织")}</span></div>}
    {externalCategory===undefined&&<nav className="campus-discovery-pills" aria-label={uiText("组织分类")}>{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{uiText(item)}</button>)}</nav>}
    {!!shown.length&&<DiscoveryMasonry key={`${normalizedQuery}|${externalCategory??category}`} items={shown} itemLabel="组织" renderItem={item=><article className="discovery-card organization-discovery-card" key={item.id} data-organization-id={item.id}>
      <OrganizationCover name={item.name} image={item.image} category={item.category} id={item.id}/>
      <h3 className="discovery-title">{item.name}</h3>
      <div className="organization-discovery-footer"><small>{uiText(item.category)}</small><button type="button" aria-pressed={follows.has(item.id)} disabled={live.busy} onClick={() => void live.mutate('relation.set', { id: item.id, kind: 'follow', enabled: !follows.has(item.id) })}>{follows.has(item.id)?uiText('已关注'):uiText('关注')}</button></div>
      {(item.description||item.contact)&&<details className="organization-discovery-details"><summary>{uiText('组织介绍与联系')}</summary>{item.description&&<p className="organization-discovery-description">{item.description}</p>}{item.contact&&<small className="organization-discovery-contact">{item.contact}</small>}</details>}
    </article>}/>}
    {live.data && !shown.length && <Empty icon={UsersRound} title={uiText("没有匹配的组织")} description={uiText("试试其他类别或关键词。")}/>}
  </>
  if (embedded) return <section className="organization-discovery" aria-label={uiText("社团组织")}>{content}</section>
  return <div className="v2-page v2-organizations-page"><PageHeading eyebrow="CAMPUS / ORGANIZATIONS" title={uiText("社团组织")} description={uiText("认识校园里的同行者。")} action={<Link className="v2-button v2-button-secondary" to="/v2/campus">{uiText("返回校园")}</Link>}/>{content}</div>
}

function OrganizationCover({id,name,image,category}:{id:string;name:string;image:string;category:string}){
  const [failed,setFailed]=useState(false)
  return <div className="discovery-cover organization-discovery-cover" style={{aspectRatio:coverRatio(id)}}>{image&&!failed?<img src={image} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="organization-text-cover"><UsersRound size={28}/><strong>{name.slice(0,2)}</strong><small>{uiText(category)}</small></span>}</div>
}
