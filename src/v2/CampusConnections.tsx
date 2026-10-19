import { uiText, useUiLanguage } from './uiLanguage'
import { ChevronRight, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { SectionHeading } from './ui'

/** Small summaries of objects already visible in the student's workspace. */
export function CampusConnections() { useUiLanguage();
  const live = useWorkspaceBackend()
  const organizations = live.data?.entities.filter(item => item.kind === 'organization' && item.data.status === 'approved' && item.data.visibility === 'visible').slice(0,3) ?? []
  const rooms = live.data?.entities.filter(item => item.kind === 'room' && item.data.status === 'open' && item.data.visibility === 'visible').slice(0,2) ?? []
  return <>
    {organizations.length > 0 && <section className="campus-home-section"><SectionHeading title={uiText("发现组织")} action={<Link to="/v2/organizations">{uiText("更多")}<ChevronRight size={15}/></Link>}/><div className="campus-organization-preview">{organizations.map(item => <Link to={`/v2/organizations?q=${encodeURIComponent(String(item.data.name ?? ''))}`} key={item.id}><span><UsersRound size={26}/></span><strong>{String(item.data.name ?? '校园组织')}</strong><small>{String(item.data.category ?? '社团组织')}</small></Link>)}</div></section>}
    {rooms.length > 0 && <section className="campus-home-section"><SectionHeading title={uiText("找搭子")} action={<Link to="/v2/partners">{uiText("更多")}<ChevronRight size={15}/></Link>}/><div className="campus-partner-preview">{rooms.map(item => <Link to={`/v2/partners?item=${encodeURIComponent(item.id)}`} key={item.id}><span>{uiText("一起出发")}</span><strong>{String(item.data.title ?? '')}</strong><p>{String(item.data.place || '地点待商定')}</p><small>{String(item.data.time || '时间待商定')}</small></Link>)}</div></section>}
  </>
}
