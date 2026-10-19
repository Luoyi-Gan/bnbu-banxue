import { uiText, useUiLanguage } from './uiLanguage'
import { UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatedSearchField } from './AnimatedSearchField'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Empty, PageHeading } from './ui'

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
  }))
  const follows = new Set(live.data?.relations.filter(item => item.kind === 'follow').map(item => item.entityId) ?? [])
  const categories = ['全部', ...new Set(organizations.map(item => item.category))]
  const normalizedQuery = (externalQuery ?? query).trim().toLocaleLowerCase()
  const shown = organizations.filter(item => ((externalCategory ?? category) === '全部' || (externalCategory ?? category) === item.category) && `${item.name} ${uiText(item.category)} ${item.description}`.toLocaleLowerCase().includes(normalizedQuery))
  const content = <>
    {live.error && <p role="alert">{uiText(live.error)}</p>}
    {!live.data && !live.error && <p role="status">{uiText("正在读取公开组织…")}</p>}
    {!embedded && <><div className="v2-directory-tools"><AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText("搜索组织、类别或关键词")}/><span>{shown.length} {uiText("个组织")}</span></div>
    <div className="v2-filter-pills v2-directory-filters" aria-label={uiText("组织分类")}>{categories.map(item => <button type="button" key={item} className={category === item?'is-active':''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></>}
    <div className="v2-organization-grid v2-filtered-list">{shown.map(item => <article key={item.id}><span className="v2-org-mark">{item.name.slice(0, 2)}</span><div><strong>{item.name}</strong><small>{uiText(item.category)} · {item.contact}</small><p>{item.description}</p></div><button type="button" className={`v2-button ${follows.has(item.id) ? 'v2-button-secondary' : 'v2-button-primary'}`} disabled={live.busy} onClick={() => void live.mutate('relation.set', { id: item.id, kind: 'follow', enabled: !follows.has(item.id) })}>{follows.has(item.id)?uiText('已关注'):uiText('关注')}</button></article>)}</div>
    {live.data && !shown.length && <Empty icon={UsersRound} title={uiText("没有匹配的组织")} description={uiText("试试其他类别或关键词。")}/>}
  </>
  if (embedded) return <section className="v2-discover-inline-panel" aria-label={uiText("社团组织")}><div className="v2-discover-panel-heading"><h2>{uiText("社团组织")}</h2><span>{shown.length} {uiText("个组织")}</span></div>{content}</section>
  return <div className="v2-page v2-organizations-page"><PageHeading eyebrow="CAMPUS / ORGANIZATIONS" title={uiText("社团组织")} description={uiText("认识校园里的同行者。")} action={<Link className="v2-button v2-button-secondary" to="/v2/campus">{uiText("返回校园")}</Link>}/>{content}</div>
}
