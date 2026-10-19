import { uiText, useUiLanguage, uiTemplate } from './uiLanguage'
import { useState, type FormEvent } from 'react'
import { PageHeading, SectionHeading } from './ui'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import './adminCommunityKeywords.css'

type Keyword = { id: string; word: string; enabled: boolean; updatedAt: string }

export function AdminCommunityKeywords() { useUiLanguage();
  const live = useWorkspaceBackend()
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [word, setWord] = useState('')
  const keywords: Keyword[] = (live.data?.entities ?? [])
    .filter(item => item.kind === 'communityKeyword')
    .map(item => ({ id: item.id, word: String(item.data.word), enabled: item.data.enabled === true, updatedAt: item.updatedAt }))
    .sort((a, b) => a.word.localeCompare(b.word, 'zh-CN'))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!word.trim()) return
    if (await live.mutate('keyword.save', { ...(editing ? { id: editing } : {}), word: word.trim() })) {
      setEditing(null)
      setWord('')
    }
  }
  const edit = (item: Keyword) => { setEditing(item.id); setWord(item.word) }
  const remove = async (item: Keyword) => {
    if (await live.mutate('keyword.delete', { id: item.id })) {
      setDeleting(null)
      if (editing === item.id) { setEditing(null); setWord('') }
    }
  }
  return <div className="v2-page">
    <PageHeading eyebrow="COMMUNITY / KEYWORDS" title={uiText("社区屏蔽词")} description={uiText("帖子标题、正文与评论共用这套词库。命中启用词汇时，服务端会拒绝发布并提示作者修改。")}/>
    <section className="v2-panel v2-list-panel">
      <SectionHeading title={editing?uiText('修改词汇'):uiText('新增词汇')} detail={uiText("保存后立即用于后续发布")}/>
      <form className="v2-form" onSubmit={submit}>
        <label>{uiText("词汇")}<input value={word} onChange={event => setWord(event.target.value)} maxLength={80} required placeholder={uiText("输入需要屏蔽的词或短语")}/></label>
        {live.error && <p role="alert" className="v2-info-box">{uiText(live.error)}</p>}
        <div className="v2-form-actions">
          {editing && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setEditing(null); setWord('') }}>{uiText("取消修改")}</button>}
          <button type="submit" className="v2-button v2-button-primary" disabled={live.busy || !word.trim()}>{live.busy?uiText('正在保存…'):uiText('保存词汇')}</button>
        </div>
      </form>
    </section>
    <section className="v2-panel v2-list-panel">
      <SectionHeading title={uiText("词库")} detail={uiTemplate([""," 个启用 · "," 个总计"],keywords.filter(item => item.enabled).length,keywords.length)}/>
      {!live.data && <p role={live.error?'alert':'status'}>{live.error || uiText('正在读取词库…')}</p>}
      {live.data && !keywords.length && <p>{uiText("暂无屏蔽词。")}</p>}
      <div className="v2-row-list">{keywords.map(item => <div className="v2-keyword-row" key={item.id}>
        <span><strong>{item.word}</strong><small>{item.enabled?uiText('启用中'):uiText('已停用')} {uiText("· 更新于")}{item.updatedAt}</small></span>
        <div className="v2-detail-actions">
          <button type="button" className="v2-button v2-button-secondary" onClick={() => edit(item)} disabled={live.busy}>{uiText("修改")}</button>
          <button type="button" className="v2-button v2-button-secondary" onClick={() => { void live.mutate('keyword.set', { id: item.id, enabled: !item.enabled }) }} disabled={live.busy}>{item.enabled?uiText('停用'):uiText('启用')}</button>
          {deleting === item.id?<><button type="button" className="v2-button v2-button-secondary" onClick={() => setDeleting(null)} disabled={live.busy}>{uiText("取消")}</button><button type="button" className="v2-button v2-button-secondary" onClick={() => { void remove(item) }} disabled={live.busy}>{uiText("确认删除")}</button></>:<button type="button" className="v2-button v2-button-secondary" onClick={() => setDeleting(item.id)} disabled={live.busy}>{uiText("删除")}</button>}
        </div>
      </div>)}</div>
    </section>
  </div>
}
