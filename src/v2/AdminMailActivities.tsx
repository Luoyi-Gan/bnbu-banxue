import { uiText, useUiLanguage, uiLocale, uiTemplate } from './uiLanguage'
import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { MailResolution } from '../live/MailResolution'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Drawer, Empty, PageHeading, SectionHeading } from './ui'
import { mailFieldLabels, normalizeMailTime, type MailActivityFields, type MailSource } from '../../shared/v2/mailActivityAdapter'
import type { MailActivityRecord } from '../../shared/v2/mailActivityPolicy'


const emptySource: MailSource = { messageId: '', subject: '', sender: '', body: '' }
const labels = { pending: '待核实', published: '已发布', hidden: '已下架' }
const entries = Object.entries(mailFieldLabels) as [keyof MailActivityFields, string][]
export function AdminMailActivities() { useUiLanguage();
  const live = useWorkspaceBackend()
  const canOperate = live.data?.account.roles.some(role => role === 'operator' || role === 'superadmin') ?? false
  const [source, setSource] = useState<MailSource>(emptySource)
  const [selected, setSelected] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [reason, setReason] = useState('')
  const [loadingImage, setLoadingImage] = useState(false)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const records = (live.data?.entities ?? []).filter(e => e.kind === 'mail' && !e.data.resolvedAs).map(e => ({...(e.data.record as unknown as MailActivityRecord), entityId: e.id, purpose: e.data.purpose, screenshot: e.data.screenshot as string | undefined}))
  const current = records.find(m => m.id === selected)
  const act = async (action: string, input: Record<string, unknown>, message: string) => {
    if (!canOperate) {setFeedback('需要运营职责。'); return}
    setFeedback('')
    if (await live.mutate(action, input)) {setFeedback(message); setReason('')}
  }
  const importMail = (event: FormEvent) => {
    event.preventDefault()
    void act('mail.import', {...source, cover: source.cover?.data, coverName: source.cover?.name}, '邮件已保存；完整活动自动发布，缺项或冲突保留待核实，重复邮件沿用原记录。')
  }
  const importScreenshot = async (file?: File) => {
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {setFeedback('请选择不超过 5 MB 的 PNG 或 JPG 活动海报或通知截图。'); return}
    setFeedback(''); setUploadingScreenshot(true)
    try {
      const form = new FormData(); form.set('image', file)
      const response = await fetch('/api/activity/screenshot/import', {method: 'POST', credentials: 'include', body: form})
      const result = await response.json() as {data?: {id?: string}; message?: string}
      if (!response.ok) throw new Error(result.message || '截图识别失败')
      await live.refresh()
      setSelected(result.data?.id || '')
      setFeedback('已打开截图识别记录；新截图需核对原图和提取内容后发布，重复截图沿用原记录。')
    } catch (error) {setFeedback(error instanceof Error ? error.message : '截图识别失败')}
    finally {setUploadingScreenshot(false)}
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
    act('mail.correct', {...fields, id: current.entityId, reason}, '修正已保存，并同步更新活动信息。')
  }
  const notice = <>{live.error && <p role="alert">{uiText(live.error)}</p>}{feedback && <p role="status" className="v2-info-box">{feedback}</p>}</>
  if (!live.data) return <p role={live.error?'alert':'status'}>{live.error || uiText('正在读取邮件处理记录…')}</p>
  return <div className="v2-page v2-mail-page">
    <PageHeading eyebrow="SCHOOL EVENTS" title={uiText("学校活动发布")} description={uiText("自动接收学校邮件，识别海报或通知截图，集中核对待处理活动。")}/>
    <div className="v2-info-box">{!canOperate && <>{uiText("当前账号没有运营职责，不能导入或修改活动。")}</>}{uiText("收件邮箱：")}{live.data.capabilities?.activityMailbox === 'configured'?uiText('已配置定时收取；连接状态以服务端日志为准'):uiText('未配置；部署时需连接学校收件邮箱')}{uiText("。邮件信息完整时自动发布，缺项时进入待核实。")}</div>
    {!current && notice}
    <section className="v2-panel v2-list-panel"><SectionHeading title={uiText("识别活动海报或通知截图")} detail={uiText("识别结果仅保存为待核实，管理员核对后发布")}/>
      <p className="v2-form-note">{live.data.capabilities?.activityScreenshotOcr === 'configured'?uiText('上传 PNG 或 JPG 图片，系统提取文字和活动字段。'):uiText('截图 OCR 尚未配置；部署时配置识别服务后可使用。')}</p>
      <label className="v2-form">{uiText("上传截图")}<input type="file" accept="image/png,image/jpeg" disabled={!canOperate || uploadingScreenshot || live.data.capabilities?.activityScreenshotOcr !== 'configured'} onChange={event => {void importScreenshot(event.target.files?.[0]); event.target.value = ''}}/></label>
      {uploadingScreenshot && <p role="status">{uiText("正在识别截图…")}</p>}
    </section>
    <details className="v2-panel v2-list-panel"><summary>{uiText("高级：手动导入邮件")}</summary><SectionHeading title={uiText("导入邮件内容")} action={<button className="v2-button v2-button-secondary" disabled={!canOperate || live.busy} onClick={example}>{uiText("填入示例邮件")}</button>}/>
      <form className="v2-form" onSubmit={importMail}>
        <div className="v2-form-two"><label>{uiText("邮件标识")}<input disabled={!canOperate || live.busy} required maxLength={200} value={source.messageId} onChange={e => setSource({ ...source, messageId: e.target.value })} placeholder={uiText("原邮件 Message-ID，用于防止重复")}/></label><label>{uiText("发件人")}<input disabled={!canOperate || live.busy} required maxLength={200} value={source.sender} onChange={e => setSource({ ...source, sender: e.target.value })}/></label></div>
        <label>{uiText("邮件主题")}<input disabled={!canOperate || live.busy} required maxLength={300} value={source.subject} onChange={e => setSource({ ...source, subject: e.target.value })}/></label>
        <label>{uiText("邮件原文")}<textarea disabled={!canOperate || live.busy} required rows={9} maxLength={30000} value={source.body} onChange={e => setSource({ ...source, body: e.target.value })}/></label>
        <p className="v2-form-note">{uiText("本地识别格式：每行“字段名：内容”。支持活动名称、活动介绍、活动开始时间、活动结束时间、活动地点、主办方、参与条件。时间为北京时间 YYYY-MM-DD HH:mm。自然语言邮件可先导入待核实，再填写结构化信息。")}</p>
        <label>{uiText("活动封面 · 选择邮件附件")}<input disabled={!canOperate || live.busy} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = '' }}/></label>
        {source.cover && <div><img className="v2-mail-cover" src={source.cover.data} alt={uiText("邮件附件封面预览")}/><p>{source.cover.name} <button type="button" className="v2-text-button" onClick={() => setSource({ ...source, cover: undefined })}>{uiText("移除封面")}</button></p></div>}
        <button className="v2-button v2-button-primary" disabled={!canOperate || loadingImage || live.busy}>{uiText("识别并自动发布（信息完整时）")}</button>
      </form>
    </details>
    <section className="v2-panel v2-list-panel"><SectionHeading title={uiText("活动识别记录")} detail={uiTemplate(["已发布 "," · 待核实 "," · 已下架 ",""],records.filter(m => m.status === 'published').length,records.filter(m => m.status === 'pending').length,records.filter(m => m.status === 'hidden').length)}/>
      <div className="v2-form v2-form-two"><label>{uiText("搜索邮件或活动")}<input value={query} onChange={e => setQuery(e.target.value)}/></label><label>{uiText("处理状态")}<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">{uiText("全部")}</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{uiText(label)}</option>)}</select></label></div>
      {records.filter(m => (filter === 'all' || m.status === filter) && (m.source.subject + m.fields.title + m.source.messageId).toLowerCase().includes(query.toLowerCase())).map(m => <button key={m.id} className="v2-mail-record" onClick={() => { setSelected(m.id); setReason(''); setFeedback('') }}><span><strong>{m.fields.title || m.source.subject}</strong><small>{m.purpose === 'screenshot'?uiText('截图识别'):uiText('学校邮件')} · {new Date(m.importedAt).toLocaleString(uiLocale())}</small></span><span className="v2-status-chip">{labels[m.status]}</span></button>)}
      {!records.length && <Empty icon={Mail} title={uiText("还没有活动识别记录")} description={uiText("收到学校邮件或上传截图后，可在这里核对结果及发布历史。")}/>}
    </section>
    {current && <Drawer title={current.fields.title || current.source.subject} eyebrow={labels[current.status]} onClose={() => setSelected('')} wide>
      {notice}
      {canOperate && <MailResolution source={live.data.entities.find(e => e.id === current.entityId)!} mails={live.data.entities.filter(e => e.kind === 'mail')} onSaved={async () => {setSelected(''); await live.refresh()}} />}
      {current.status === 'pending' && <div className="v2-info-box">{uiText("待核实：")}{current.extraction.issues.join('；') || uiText('请逐项核对来源与识别内容')}{uiText("。核实补全并保存后发布。")}</div>}
      {current.screenshot && <figure><img className="v2-mail-cover" src={current.screenshot} alt={uiText("上传的活动海报或通知截图")}/><figcaption>{uiText("识别原图，请逐项核对")}</figcaption></figure>}
      <details open={current.purpose === 'screenshot'}><summary>{current.purpose === 'screenshot'?uiText('截图识别原文与依据'):uiText('邮件原文与识别依据')}</summary><p>{uiText("标识：")}{current.source.messageId}</p><p>{uiText("发件人：")}{current.source.sender || uiText('未提供')}</p><p>{uiText("主题：")}{current.source.subject}</p><pre className="v2-mail-original">{current.source.body}</pre>{entries.map(([key, label]) => <p key={key}>{uiText(label)}：{current.extraction.evidence[key] || uiText('未识别到明确依据')}</p>)}</details>
      {current.source.cover && <figure><img className="v2-mail-cover" src={current.source.cover.data} alt={uiText("活动封面")}/><figcaption>{uiText("邮件附件：")}{current.source.cover.name}</figcaption></figure>}
      <form key={`${current.id}-${current.history.length}`} className="v2-form" onSubmit={save}>
        {entries.map(([key, label]) => <label key={key}>{uiText(label)}{key === 'startAt' || key === 'endAt'?uiText('（北京时间）'):''}{key === 'description'?<textarea name={key} required rows={4} defaultValue={current.fields[key]}/>:<input name={key} required={!['host', 'conditions'].includes(key)} type={key === 'startAt' || key === 'endAt' ? 'datetime-local' : 'text'} defaultValue={key === 'startAt' || key === 'endAt' ? current.fields[key].slice(0, 16) : current.fields[key]}/>}</label>)}
        <label>{uiText("操作原因")}<textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder={uiText("说明修正、下架或恢复原因")}/></label>
        <button className="v2-button v2-button-primary">{current.status === 'pending'?uiText('核实保存并发布'):uiText('保存修正')}</button>
        {current.status !== 'pending' && <button type="button" className="v2-button v2-button-secondary" onClick={() => act('mail.visibility', {id: current.entityId, publish: current.status === 'hidden', reason}, current.status === 'hidden' ? '已重新核对并恢复活动展示。' : '活动已下架，学生端同步隐藏。')}>{current.status === 'hidden'?uiText('重新核对并恢复展示'):uiText('下架活动')}</button>}
        <p className="v2-form-note">{uiText("修正已下架活动后仍保持下架；请重新核对已保存的信息后恢复。学生仅看到活动信息，不展示邮件原文。")}</p>
      </form>
      <h3>{uiText("处理历史")}</h3>{[...current.history].reverse().map((h, i) => <details key={i}><summary>{h.action} · {new Date(h.at).toLocaleString(uiLocale())}</summary><p>{h.actor} · {h.reason || uiText('必要信息齐全')}</p>{entries.filter(([key]) => !h.before || h.before[key] !== h.after[key]).map(([key, label]) => <p key={key}>{uiText(label)}：{h.before?.[key] || uiText('未记录')} → {h.after[key] || uiText('未提供')}</p>)}</details>)}
    </Drawer>}
  </div>
}
