import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useV2 } from './useV2'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { type V2State } from './model'
import { alumniData, bookingStatus, reviewAlumni } from './alumniPolicy'
import { SectionHeading } from './ui'

const time = (value: string) => new Date(value).toLocaleString('zh-CN')
const statusLabel = { pending: '待审核', approved: '已通过', rejected: '未通过 / 已撤销' }
function useAction() {
  const { state, setState } = useV2()
  const [message, setMessage] = useState('')
  return { state, message, act: (update: (s: V2State) => V2State, success: string) => {
    try { setState(update(state)); setMessage(success) } catch (error) { setMessage(error instanceof Error ? error.message : '操作失败。') }
  } }
}

export function AlumniAppointmentArea({ personId, live }: { personId: string; live: ReturnType<typeof useWorkspaceBackend> }) {
  const data = live.data?.alumni ?? {profiles: [], slots: [], bookings: [], follows: [], history: [], notices: []}, actor = {id: live.data?.account.id ?? ''}, message = live.error
  const person = data.profiles.find(p => p.id === personId)!
  const [question, setQuestion] = useState('')
  const slots = data.slots.filter(s => s.alumniId === personId && s.open && Date.parse(s.startAt) > Date.now())
  return <div>{message && <p role="status" className="v2-info-box">{message}</p>}{person.owner === actor.id ? <Link to="/v2/alumni?view=manage">管理我的时段和申请</Link> : !person.accepting ? <p>该校友暂不接受新申请。</p> : <><label className="v2-drawer-label">交流主题与问题<textarea value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} rows={3} placeholder="介绍你的背景，以及希望请教的具体问题"/></label>{slots.map(slot => {
    const taken = slot.occupied || data.bookings.some(b => b.slotId === slot.id && b.status === 'confirmed')
    const pending = data.bookings.some(b => b.slotId === slot.id && b.student === actor.id && bookingStatus(data, b) === 'pending')
    return <div className="v2-alumni-booking" key={slot.id}><strong>{time(slot.startAt)} — {time(slot.endAt)}</strong><p>{slot.location}</p><button className="v2-button v2-button-primary" disabled={live.busy || taken || pending || !question.trim()} onClick={() => live.mutate('alumni.request', {slotId: slot.id, question})}>{taken ? '已被预约' : pending ? '等待校友确认' : '申请交流'}</button></div>
  })}{!slots.length && <p>暂未开放新的交流时段。</p>}<p className="v2-form-note">同一时段可能有多名申请人，校友确认后预约才成立。</p></>}</div>
}

export function AlumniCertification() {
  const live = useWorkspaceBackend()
  const [message, setMessage] = useState('')
  const mine = live.data?.alumni.profiles.find(p => p.owner === live.data?.account.id)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget), get = (key: string) => String(f.get(key) ?? '').trim()
    setMessage('')
    if (await live.mutate('alumni.apply', { studentNumber: get('studentNumber'), major: get('major'), graduationYear: Number(get('year')), city: get('city'), direction: get('direction'), experience: get('experience'), topics: get('topics'), bio: get('bio'), evidence: get('evidence') })) setMessage('认证申请已提交，等待管理员审核。')
  }
  if (!live.data) return <p role={live.error ? 'alert' : 'status'}>{live.error || '正在读取校友认证…'}</p>
  return <section className="v2-panel v2-list-panel"><SectionHeading title="校友身份认证" detail="核验毕业身份，保持原账号的校园关系"/>{message && <p role="status" className="v2-info-box">{message}</p>}{mine && <div className="v2-info-box"><strong>{statusLabel[mine.status]}</strong><p>{mine.name} · {mine.major} · {mine.graduationYear} 届</p>{mine.reviewNote && <p>审核说明：{mine.reviewNote}</p>}</div>}{live.error && <p role="alert" className="v2-info-box">{live.error}</p>}{(!mine || mine.status === 'rejected') && <form className="v2-form" onSubmit={submit}><p>申请人：{live.data.account.name}</p><div className="v2-alumni-form-grid"><label>学号<input name="studentNumber" defaultValue={live.data.account.studentNumber ?? mine?.studentNumber} readOnly={!!live.data.account.studentNumber} maxLength={100} required/></label><label>原专业<input name="major" defaultValue={mine?.major} maxLength={80} required/></label><label>毕业年份<input name="year" type="number" min={2005} max={new Date().getFullYear()} defaultValue={mine?.graduationYear} required/></label><label>所在城市<input name="city" defaultValue={mine?.city} maxLength={40} required/></label><label>交流方向<select name="direction" defaultValue={mine?.direction}><option>升学</option><option>就业</option></select></label></div><label>当前升学或职业经历<input name="experience" defaultValue={mine?.experience} maxLength={120} required/></label><label>愿意分享的话题<input name="topics" defaultValue={mine?.topics} maxLength={120} required/></label><label>个人介绍<textarea name="bio" defaultValue={mine?.bio} maxLength={500}/></label><label>毕业身份核验说明<textarea name="evidence" defaultValue={mine?.evidence} maxLength={1000} rows={3} required placeholder="演示填写：毕业专业、年份及可供核验的说明"/></label><p className="v2-form-note">当前为本地演示，请勿填写证件号码或提交真实证明材料。核验说明仅本人及管理员可见。</p><button disabled={live.busy} className="v2-button v2-button-primary">{live.busy ? '正在提交…' : '提交校友认证'}</button></form>}</section>
}

export function AlumniIncoming({live}: {live: ReturnType<typeof useWorkspaceBackend>}) {
  const data = live.data?.alumni ?? {profiles: [], slots: [], bookings: [], follows: [], history: [], notices: []}, actor = {id: live.data?.account.id ?? ''}, message = live.error
  const mine = data.profiles.find(p => p.owner === actor.id)
  const [reason, setReason] = useState('')
  const requests = data.bookings.filter(b => data.slots.some(s => s.id === b.slotId && s.alumniId === mine?.id))
  return <section className="v2-panel v2-list-panel"><SectionHeading title="收到的交流申请" detail="只有校友本人可以确认"/>{message && <p role="status" className="v2-info-box">{message}</p>}<label className="v2-drawer-label">处理说明（拒绝或取消必填）<textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={300}/></label>{requests.map(b => {
    const slot = data.slots.find(s => s.id === b.slotId)!, status = bookingStatus(data, b)
    return <article className="v2-alumni-booking" key={b.id}><h3>{live.data?.people.find(p => p.id === b.student)?.name ?? '申请人'}</h3><p>{time(slot.startAt)} — {time(slot.endAt)}</p><p>{b.question}</p><p>{({ pending: '待确认', confirmed: '已确认', rejected: '已拒绝', withdrawn: '已撤回', cancelled: '已取消', expired: '已过期', unavailable: '时段已被预约' })[status]}</p>{b.reason && <p>{b.reason}</p>}{status === 'pending' && <div className="v2-detail-actions"><button className="v2-button v2-button-primary" onClick={() => live.mutate('alumni.decide', {id: b.id, accept: true, reason})}>确认预约</button><button className="v2-button v2-button-secondary" disabled={live?.busy || !reason.trim()} onClick={() => live.mutate('alumni.decide', {id: b.id, accept: false, reason})}>拒绝申请</button></div>}{status === 'confirmed' && Date.parse(slot.endAt) > Date.now() && <button className="v2-button v2-button-secondary" disabled={live?.busy || !reason.trim()} onClick={() => live.mutate('alumni.cancel', {id: b.id, reason})}>取消预约</button>}</article>
  })}{!requests.length && <p>尚未收到交流申请。</p>}</section>
}

export function AdminAlumniReview({live}: {live?: ReturnType<typeof useWorkspaceBackend>} = {}) {
  const { state, message, act } = useAction(), data = live ? live.data?.alumni ?? {profiles: [], slots: [], bookings: [], follows: [], history: [], notices: []} : alumniData(state)
  const review = (id: string, approve: boolean, reason: string) => live ? live.mutate('alumni.review', {id, approve, reason}) : act(s => reviewAlumni(s, {role: state.role, id: 'administrator'}, id, approve, reason), '认证处理已保存并通知相关人员。')
  const [selected, setSelected] = useState(''), [reason, setReason] = useState('')
  const [filter, setFilter] = useState('pending')
  const person = data.profiles.find(p => p.id === selected)
  return <section className="v2-panel v2-list-panel"><SectionHeading title="校友认证" detail={`${data.profiles.filter(p => p.status === 'pending').length} 份待审核`}/>{message && <p role="status" className="v2-info-box">{message}</p>}<select value={filter} onChange={e => setFilter(e.target.value)} aria-label="校友认证状态"><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">未通过 / 已撤销</option></select>{data.profiles.filter(p => p.status === filter).map(p => <button className="v2-saved-row" key={p.id} onClick={() => { setSelected(p.id); setReason('') }}><span><strong>{p.name}</strong><small>{p.major} · {p.graduationYear} 届</small></span><span>{statusLabel[p.status]}</span></button>)}{!data.profiles.some(p => p.status === filter) && <p>当前没有此状态的申请。</p>}{person && <div className="v2-alumni-review"><h3>{person.name} · {statusLabel[person.status]}</h3><p>{person.major} · {person.graduationYear} 届 · {person.city}</p><p>学号：{person.studentNumber || '旧申请未提供'}{person.studentNumber && (person.studentNumberSource === 'verified-email' ? '（已验证邮箱）' : '（申请人填写，待核对）')}</p><p>核验说明：{person.evidence}</p><p>自述经历：{person.experience}</p><p>审核记录：{person.reviewNote || '暂无'}</p>{live?.error && <p role="alert">{live.error}</p>}<label className="v2-drawer-label">审核原因（驳回或撤销必填，通过可不填）<textarea placeholder="撤销认证前，请说明原因" maxLength={300} value={reason} onChange={e => setReason(e.target.value)}/></label><div className="v2-detail-actions">{person.status === 'pending' && <button className="v2-button v2-button-primary" onClick={() => review(person.id, true, reason)}>通过校友认证</button>}{person.status !== 'rejected' && <button className="v2-button v2-button-secondary" disabled={live?.busy || !reason.trim()} onClick={() => review(person.id, false, reason)}>{person.status === 'approved' ? '撤销校友认证' : '驳回校友认证'}</button>}</div><details><summary>查看处理历史</summary>{data.history.filter(h => h.objectId === person.id).map(h => <p key={h.id}>{time(h.at)} · {h.actor} · {h.action} {h.reason}</p>)}</details></div>}</section>
}
