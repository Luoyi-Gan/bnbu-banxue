import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useV2 } from './useV2'
import { studentName, type V2State } from './model'
import { alumniData, currentAlumniActor, bookingStatus, requestAlumniChat, decideAlumniChat, cancelAlumniBooking, submitAlumniCertification, reviewAlumni } from './alumniPolicy'
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

export function AlumniAppointmentArea({ personId }: { personId: string }) {
  const { state, message, act } = useAction(), data = alumniData(state), actor = currentAlumniActor(state)
  const person = data.profiles.find(p => p.id === personId)!
  const [question, setQuestion] = useState('')
  const slots = data.slots.filter(s => s.alumniId === personId && s.open && Date.parse(s.startAt) > Date.now())
  return <div>{message && <p role="status" className="v2-info-box">{message}</p>}{person.owner === actor.id ? <Link to="/v2/alumni?view=manage">管理我的时段和申请</Link> : !person.accepting ? <p>该校友暂不接受新申请。</p> : <><label className="v2-drawer-label">交流主题与问题<textarea value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} rows={3} placeholder="介绍你的背景，以及希望请教的具体问题"/></label>{slots.map(slot => {
    const taken = data.bookings.some(b => b.slotId === slot.id && b.status === 'confirmed')
    const pending = data.bookings.some(b => b.slotId === slot.id && b.student === actor.id && bookingStatus(data, b) === 'pending')
    return <div className="v2-alumni-booking" key={slot.id}><strong>{time(slot.startAt)} — {time(slot.endAt)}</strong><p>{slot.location}</p><button className="v2-button v2-button-primary" disabled={taken || pending || !question.trim()} onClick={() => act(s => requestAlumniChat(s, actor, slot.id, question), '申请已提交，等待校友确认。')}>{taken ? '已被预约' : pending ? '等待校友确认' : '申请交流'}</button></div>
  })}{!slots.length && <p>暂未开放新的交流时段。</p>}<p className="v2-form-note">同一时段可能有多名申请人，校友确认后预约才成立。</p></>}</div>
}

export function AlumniCertification() {
  const { state, message, act } = useAction(), data = alumniData(state), actor = currentAlumniActor(state)
  const mine = data.profiles.find(p => p.owner === actor.id)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget), get = (key: string) => String(f.get(key) ?? '').trim()
    act(s => submitAlumniCertification(s, actor, { name: studentName, major: get('major'), graduationYear: Number(get('year')), city: get('city'), direction: get('direction') as '升学' | '就业', experience: get('experience'), topics: get('topics'), bio: get('bio'), evidence: get('evidence') }), '认证申请已提交，等待管理员审核。')
  }
  return <section className="v2-panel v2-list-panel"><SectionHeading title="校友身份认证" detail="核验毕业身份，保持原账号的校园关系"/>{message && <p role="status" className="v2-info-box">{message}</p>}{mine && <div className="v2-info-box"><strong>{statusLabel[mine.status]}</strong><p>{mine.name} · {mine.major} · {mine.graduationYear} 届</p>{mine.reviewNote && <p>审核说明：{mine.reviewNote}</p>}</div>}{(!mine || mine.status === 'rejected') && <form className="v2-form" onSubmit={submit}><p>申请人：{studentName}</p><div className="v2-alumni-form-grid"><label>原专业<input name="major" defaultValue={mine?.major} maxLength={80} required/></label><label>毕业年份<input name="year" type="number" min={2005} max={new Date().getFullYear()} defaultValue={mine?.graduationYear} required/></label><label>所在城市<input name="city" defaultValue={mine?.city} maxLength={40} required/></label><label>交流方向<select name="direction" defaultValue={mine?.direction}><option>升学</option><option>就业</option></select></label></div><label>当前升学或职业经历<input name="experience" defaultValue={mine?.experience} maxLength={120} required/></label><label>愿意分享的话题<input name="topics" defaultValue={mine?.topics} maxLength={120} required/></label><label>个人介绍<textarea name="bio" defaultValue={mine?.bio} maxLength={500}/></label><label>毕业身份核验说明<textarea name="evidence" defaultValue={mine?.evidence} maxLength={1000} rows={3} required placeholder="演示填写：毕业专业、年份及可供核验的说明"/></label><p className="v2-form-note">当前为本地演示，请勿填写证件号码或提交真实证明材料。核验说明仅本人及管理员可见。</p><button className="v2-button v2-button-primary">提交校友认证</button></form>}</section>
}

export function AlumniIncoming() {
  const { state, message, act } = useAction(), data = alumniData(state), actor = currentAlumniActor(state)
  const mine = data.profiles.find(p => p.owner === actor.id)
  const [reason, setReason] = useState('')
  const requests = data.bookings.filter(b => data.slots.some(s => s.id === b.slotId && s.alumniId === mine?.id))
  return <section className="v2-panel v2-list-panel"><SectionHeading title="收到的交流申请" detail="只有校友本人可以确认"/>{message && <p role="status" className="v2-info-box">{message}</p>}<label className="v2-drawer-label">处理说明（拒绝或取消必填）<textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={300}/></label>{requests.map(b => {
    const slot = data.slots.find(s => s.id === b.slotId)!, status = bookingStatus(data, b)
    return <article className="v2-alumni-booking" key={b.id}><h3>{b.student}</h3><p>{time(slot.startAt)} — {time(slot.endAt)}</p><p>{b.question}</p><p>{({ pending: '待确认', confirmed: '已确认', rejected: '已拒绝', withdrawn: '已撤回', cancelled: '已取消', expired: '已过期', unavailable: '时段已被预约' })[status]}</p>{b.reason && <p>{b.reason}</p>}{status === 'pending' && <div className="v2-detail-actions"><button className="v2-button v2-button-primary" onClick={() => act(s => decideAlumniChat(s, actor, b.id, true, reason), '已确认，双方日程已更新。')}>确认预约</button><button className="v2-button v2-button-secondary" disabled={!reason.trim()} onClick={() => act(s => decideAlumniChat(s, actor, b.id, false, reason), '已拒绝并通知申请人。')}>拒绝申请</button></div>}{status === 'confirmed' && Date.parse(slot.endAt) > Date.now() && <button className="v2-button v2-button-secondary" disabled={!reason.trim()} onClick={() => act(s => cancelAlumniBooking(s, actor, b.id, reason), '预约已取消并通知学生。')}>取消预约</button>}</article>
  })}{!requests.length && <p>尚未收到交流申请。</p>}</section>
}

export function AdminAlumniReview() {
  const { state, message, act } = useAction(), data = alumniData(state)
  const [selected, setSelected] = useState(''), [reason, setReason] = useState('')
  const [filter, setFilter] = useState('pending')
  const person = data.profiles.find(p => p.id === selected)
  return <section className="v2-panel v2-list-panel"><SectionHeading title="校友认证" detail={`${data.profiles.filter(p => p.status === 'pending').length} 份待审核`}/>{message && <p role="status" className="v2-info-box">{message}</p>}<select value={filter} onChange={e => setFilter(e.target.value)} aria-label="校友认证状态"><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">未通过 / 已撤销</option></select>{data.profiles.filter(p => p.status === filter).map(p => <button className="v2-saved-row" key={p.id} onClick={() => { setSelected(p.id); setReason('') }}><span><strong>{p.name}</strong><small>{p.major} · {p.graduationYear} 届</small></span><span>{statusLabel[p.status]}</span></button>)}{!data.profiles.some(p => p.status === filter) && <p>当前没有此状态的申请。</p>}{person && <div className="v2-alumni-review"><h3>{person.name} · {statusLabel[person.status]}</h3><p>{person.major} · {person.graduationYear} 届 · {person.city}</p><p>核验说明：{person.evidence}</p><p>自述经历：{person.experience}</p><p>审核记录：{person.reviewNote || '暂无'}</p><label className="v2-drawer-label">审核原因<textarea maxLength={300} value={reason} onChange={e => setReason(e.target.value)}/></label><div className="v2-detail-actions">{person.status === 'pending' && <button className="v2-button v2-button-primary" onClick={() => act(s => reviewAlumni(s, { role: state.role, id: 'administrator' }, person.id, true, reason), '校友认证已通过。')}>通过校友认证</button>}{person.status !== 'rejected' && <button className="v2-button v2-button-secondary" disabled={!reason.trim()} onClick={() => act(s => reviewAlumni(s, { role: state.role, id: 'administrator' }, person.id, false, reason), '认证处理已保存并通知相关人员。')}>{person.status === 'approved' ? '撤销校友认证' : '驳回校友认证'}</button>}</div><details><summary>查看处理历史</summary>{data.history.filter(h => h.objectId === person.id).map(h => <p key={h.id}>{time(h.at)} · {h.actor} · {h.action} {h.reason}</p>)}</details></div>}</section>
}
