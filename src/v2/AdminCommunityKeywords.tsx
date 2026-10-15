import { useState, type FormEvent } from 'react'
import { PageHeading, SectionHeading } from './ui'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import './adminCommunityKeywords.css'

type Keyword = { id: string; word: string; enabled: boolean; updatedAt: string }

export function AdminCommunityKeywords() {
  const live = useWorkspaceBackend()
  const [editing, setEditing] = useState<string | null>(null)
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
  return <div className="v2-page">
    <PageHeading eyebrow="COMMUNITY / KEYWORDS" title="社区屏蔽词" description="帖子标题、正文与评论共用这套词库。命中启用词汇时，服务端会拒绝发布并提示作者修改。"/>
    <section className="v2-panel v2-list-panel">
      <SectionHeading title={editing ? '修改词汇' : '新增词汇'} detail="保存后立即用于后续发布"/>
      <form className="v2-form" onSubmit={submit}>
        <label>词汇<input value={word} onChange={event => setWord(event.target.value)} maxLength={80} required placeholder="输入需要屏蔽的词或短语"/></label>
        {live.error && <p role="alert" className="v2-info-box">{live.error}</p>}
        <div className="v2-form-actions">
          {editing && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setEditing(null); setWord('') }}>取消修改</button>}
          <button type="submit" className="v2-button v2-button-primary" disabled={live.busy || !word.trim()}>{live.busy ? '正在保存…' : '保存词汇'}</button>
        </div>
      </form>
    </section>
    <section className="v2-panel v2-list-panel">
      <SectionHeading title="词库" detail={`${keywords.filter(item => item.enabled).length} 个启用 · ${keywords.length} 个总计`}/>
      {!live.data && <p role={live.error ? 'alert' : 'status'}>{live.error || '正在读取词库…'}</p>}
      {live.data && !keywords.length && <p>暂无屏蔽词。</p>}
      <div className="v2-row-list">{keywords.map(item => <div className="v2-keyword-row" key={item.id}>
        <span><strong>{item.word}</strong><small>{item.enabled ? '启用中' : '已停用'} · 更新于 {item.updatedAt}</small></span>
        <div className="v2-detail-actions">
          <button type="button" className="v2-button v2-button-secondary" onClick={() => edit(item)} disabled={live.busy}>修改</button>
          <button type="button" className="v2-button v2-button-secondary" onClick={() => { void live.mutate('keyword.set', { id: item.id, enabled: !item.enabled }) }} disabled={live.busy}>{item.enabled ? '停用' : '启用'}</button>
        </div>
      </div>)}</div>
    </section>
  </div>
}
