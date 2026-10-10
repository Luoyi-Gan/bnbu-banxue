import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { useV2 } from './useV2'
import { Drawer, Empty, PageHeading, SectionHeading } from './ui'
import { mailFieldLabels, normalizeMailTime, type MailActivityFields, type MailSource } from './mailActivityAdapter'
import { correctActivityMail, importActivityMail, setMailActivityVisibility } from './mailActivityPolicy'
import type { V2State } from './model'

const emptySource: MailSource = { messageId: '', subject: '', sender: '', body: '' }
const labels = { pending: '待核实', published: '已发布', hidden: '已下架' }
const entries = Object.entries(mailFieldLabels) as [keyof MailActivityFields, string][]
export function AdminMailActivities() {
  const { state, setState, persistenceError } = useV2()
  const [source, setSource] = useState<MailSource>(emptySource)
  const [selected, setSelected] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [reason, setReason] = useState('')
  const [loadingImage, setLoadingImage] = useState(false)
  const records = state.mailActivities ?? []
  const current = records.find(m => m.id === selected)
  const act = (change: () => V2State, message: string) => {
    try { setState(change()); setFeedback(message); setReason('') }
    catch (error) { setFeedback(error instanceof Error ? error.message : '操作失败') }
  }
  const importMail = (event: FormEvent) => {
    event.preventDefault()
    act(() => {
      const next = importActivityMail(state, source)
      if (next === state) throw new Error('该邮件已处理，未重复创建，也未覆盖管理员修正。')
      return next
    }, '邮件已记录。信息完整的活动已自动发布，缺项或冲突的邮件保留待核实。')
  }
  const example = () => setSource({ messageId: 'demo-school-mail-20261025', subject: '【演示邮件】校园 AI 交流', sender: '演示学校邮件', body: '活动名称：【演示】校园 AI 交流\n活动介绍：交流学习经验与校园创意，仅用于本地流程演示。\n活动开始时间：2026-10-25 14:00\n活动结束时间：2026-10-25 16:00\n活动地点：资源中心 201\n主办方：校园交流中心（演示）\n参与条件：面向在校学生' })
  const upload = async (file?: File) => {
    if (!file) return
    setLoadingImage(true)
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('请选择不超过 5 MB 的 JPG、PNG 或 WebP 邮件附件。')
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close()
      const data = canvas.toDataURL('image/jpeg', 0.8)
      if (data.length > 1500000) throw new Error('图片处理后仍过大，请选择较小附件。')
      setSource(s => ({ ...s, cover: { name: file.name, data } })); setFeedback('附件已选为活动封面。')
    } catch (error) { setFeedback(error instanceof Error ? error.message : '图片读取失败') }
    finally { setLoadingImage(false) }
  }
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!current) return
    const data = new FormData(event.currentTarget)
    const fields = Object.fromEntries(entries.map(([key]) => [key, key === 'startAt' || key === 'endAt' ? normalizeMailTime(String(data.get(key))) : String(data.get(key) ?? '')])) as unknown as MailActivityFields
    act(() => correctActivityMail(state, current.id, fields, reason), '修正已保存，并同步更新活动信息。')
  }
  const notice = <>{persistenceError && <p role="alert">本地存储失败，当前更改未可靠保存，请勿关闭页面。</p>}{feedback && <p role="status" className="v2-info-box">{feedback}</p>}</>
  return <div className="v2-page v2-mail-page">
    <PageHeading eyebrow="SCHOOL MAIL" title="邮件转活动" description="从学校邮件整理活动信息，自动发布，事后修正。"/>
    <div className="v2-info-box">邮箱接收、AI 识别和 AI 封面生成尚未接入。当前使用本地规则识别演示，数据仅保存在当前浏览器；可手动选择邮件附件图片作为封面。</div>
    {!current && notice}
    <section className="v2-panel v2-list-panel"><SectionHeading title="导入邮件内容" action={<button className="v2-button v2-button-secondary" onClick={example}>填入示例邮件</button>}/>
      <form className="v2-form" onSubmit={importMail}>
        <div className="v2-form-two"><label>邮件标识<input required maxLength={200} value={source.messageId} onChange={e => setSource({ ...source, messageId: e.target.value })} placeholder="原邮件 Message-ID，用于防止重复"/></label><label>发件人<input maxLength={200} value={source.sender} onChange={e => setSource({ ...source, sender: e.target.value })}/></label></div>
        <label>邮件主题<input required maxLength={300} value={source.subject} onChange={e => setSource({ ...source, subject: e.target.value })}/></label>
        <label>邮件原文<textarea required rows={9} maxLength={30000} value={source.body} onChange={e => setSource({ ...source, body: e.target.value })}/></label>
        <p className="v2-form-note">本地识别格式：每行“字段名：内容”。支持活动名称、活动介绍、活动开始时间、活动结束时间、活动地点、主办方、参与条件。时间为北京时间 YYYY-MM-DD HH:mm。自然语言邮件可先导入待核实，再填写结构化信息。</p>
        <label>活动封面 · 选择邮件附件<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }}/></label>
        {source.cover && <div><img className="v2-mail-cover" src={source.cover.data} alt="邮件附件封面预览"/><p>{source.cover.name} <button type="button" className="v2-text-button" onClick={() => setSource({ ...source, cover: undefined })}>移除封面</button></p></div>}
        <button className="v2-button v2-button-primary" disabled={loadingImage}>识别并自动发布（信息完整时）</button>
      </form>
    </section>
    <section className="v2-panel v2-list-panel"><SectionHeading title="邮件处理记录" detail={`已发布 ${records.filter(m => m.status === 'published').length} · 待核实 ${records.filter(m => m.status === 'pending').length} · 已下架 ${records.filter(m => m.status === 'hidden').length}`}/>
      <div className="v2-form v2-form-two"><label>搜索邮件或活动<input value={query} onChange={e => setQuery(e.target.value)}/></label><label>处理状态<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">全部</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
      {records.filter(m => (filter === 'all' || m.status === filter) && (m.source.subject + m.fields.title + m.source.messageId).toLowerCase().includes(query.toLowerCase())).map(m => <button key={m.id} className="v2-mail-record" onClick={() => { setSelected(m.id); setReason(''); setFeedback('') }}><span><strong>{m.fields.title || m.source.subject}</strong><small>{m.source.subject} · {new Date(m.importedAt).toLocaleString('zh-CN')}</small></span><span className="v2-status-chip">{labels[m.status]}</span></button>)}
      {!records.length && <Empty icon={Mail} title="还没有导入邮件" description="导入后可查看识别结果、修正信息及发布历史。"/>}
    </section>
    {current && <Drawer title={current.fields.title || current.source.subject} eyebrow={labels[current.status]} onClose={() => setSelected('')} wide>
      {notice}
      {current.status === 'pending' && <div className="v2-info-box">待核实：{current.extraction.issues.join('；')}。核实补全并保存后自动发布。</div>}
      <details><summary>邮件原文与识别依据</summary><p>标识：{current.source.messageId}</p><p>发件人：{current.source.sender || '未提供'}</p><p>主题：{current.source.subject}</p><pre className="v2-mail-original">{current.source.body}</pre>{entries.map(([key, label]) => <p key={key}>{label}：{current.extraction.evidence[key] || '未识别到明确依据'}</p>)}</details>
      {current.source.cover && <figure><img className="v2-mail-cover" src={current.source.cover.data} alt="活动封面"/><figcaption>邮件附件：{current.source.cover.name}</figcaption></figure>}
      <form key={`${current.id}-${current.history.length}`} className="v2-form" onSubmit={save}>
        {entries.map(([key, label]) => <label key={key}>{label}{key === 'startAt' || key === 'endAt' ? '（北京时间）' : ''}{key === 'description' ? <textarea name={key} required rows={4} defaultValue={current.fields[key]}/> : <input name={key} required={!['host', 'conditions'].includes(key)} type={key === 'startAt' || key === 'endAt' ? 'datetime-local' : 'text'} defaultValue={key === 'startAt' || key === 'endAt' ? current.fields[key].slice(0, 16) : current.fields[key]}/>}</label>)}
        <label>操作原因<textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="说明修正、下架或恢复原因"/></label>
        <button className="v2-button v2-button-primary">{current.status === 'pending' ? '核实保存并发布' : '保存修正'}</button>
        {current.status !== 'pending' && <button type="button" className="v2-button v2-button-secondary" onClick={() => act(() => setMailActivityVisibility(state, current.id, current.status === 'hidden', reason), current.status === 'hidden' ? '已重新核对并恢复活动展示。' : '活动已下架，学生端同步隐藏。')}>{current.status === 'hidden' ? '重新核对并恢复展示' : '下架活动'}</button>}
        <p className="v2-form-note">修正已下架活动后仍保持下架；请重新核对已保存的信息后恢复。学生仅看到活动信息，不展示邮件原文。</p>
      </form>
      <h3>处理历史</h3>{[...current.history].reverse().map((h, i) => <details key={i}><summary>{h.action} · {new Date(h.at).toLocaleString('zh-CN')}</summary><p>{h.actor} · {h.reason || '必要信息齐全'}</p>{entries.filter(([key]) => !h.before || h.before[key] !== h.after[key]).map(([key, label]) => <p key={key}>{label}：{h.before?.[key] || '未记录'} → {h.after[key] || '未提供'}</p>)}</details>)}
    </Drawer>}
  </div>
}
