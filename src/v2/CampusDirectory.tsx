import {useMemo,useState} from 'react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {uiText,useUiLanguage} from './uiLanguage'
import './learning.css'
import {campusContacts as contacts} from '../../shared/v2/campusContacts'
export function CampusDirectory(){useUiLanguage()
  const [query,setQuery]=useState(''),live=useWorkspaceBackend(),normalized=query.trim().toLowerCase()
  const results=contacts.filter(item=>`${item.name} ${item.keywords} ${item.description} ${item.email} ${item.location}`.toLowerCase().includes(normalized))
  const knowledge=useMemo(()=>live.data?.entities.filter(item=>item.kind==='knowledge'&&item.data.status==='published'&&`${item.data.title} ${item.data.body} ${item.data.tags}`.toLowerCase().includes(normalized)).slice(0,20)??[],[live.data,normalized])
  return <section className="learning-directory" aria-label={uiText('校园办事与公开联系方式搜索')}><h2>{uiText('办事与联系方式')}</h2><p>{uiText('查找负责部门、官方指南和公开联系方式。')}</p><input type="search" aria-label={uiText('搜索办事或部门')} value={query} maxLength={100} onChange={event=>setQuery(event.target.value)} placeholder={uiText('试试：成绩单、邮箱、VPN、奖学金证明')}/><p role="status">{uiText('找到')} {results.length+knowledge.length} {uiText('条公开资料')}</p>{results.map(item=><article key={item.id}><h3>{item.name}</h3><p>{item.description}</p>{item.location&&<p>{uiText('办公地点')}：{item.location}</p>}<nav>{item.email&&<a href={`mailto:${item.email}`}>{item.email}</a>}{item.phone&&<a href={`tel:${item.phone}`}>{item.phone}</a>}<a href={item.action} target="_blank" rel="noreferrer">{item.actionName}</a></nav><p><a href={item.source} target="_blank" rel="noreferrer">{uiText('官方来源')}</a><small>{uiText('资料查阅日期：2026-10-22；最新办理要求请查看官方页面。')}</small></p></article>)}{knowledge.map(item=><article key={item.id}><h3>{String(item.data.title)}</h3><p>{String(item.data.body??item.data.content??'')}</p><small>{uiText('平台已发布校园知识')}</small></article>)}{!results.length&&!knowledge.length&&<p>{uiText('暂未收录对应资料。可换用部门名或事项关键词。')}</p>}</section>
}
