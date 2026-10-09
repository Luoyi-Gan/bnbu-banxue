import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Coffee, CalendarDays, Bell } from 'lucide-react'
import { useV2 } from './useV2'
import { PageHeading, Empty, Modal } from './ui'
import { type V2State, studentName } from './model'
import { canUseTeacherSports, answerCoffeeMove, cancelCoffee, closeCoffeeSlot, coffeeData, managedTeachers, occupied, proposeCoffeeMove, saveCoffeeSlot, teacherAccount } from './teacherCoffee'
import './teacherPortal.css'

const stamp = (value: string) => new Date(value).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export function TeacherCoffee() {
  const { state, setState, persistenceError } = useV2()
  const id = teacherAccount(state).id, data = coffeeData(state)
  const slots = data.slots.filter(s => s.teacherId === id).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
  const [tab, setTab] = useState('bookings'), [feedback, setFeedback] = useState(''), [showHistory, setShowHistory] = useState(false)
  const [dialog, setDialog] = useState<{ kind: 'cancel' | 'move'; id: string } | null>(null)
  const bookings = data.bookings.filter(b => slots.some(s => s.id === b.slotId) && (showHistory || b.status === 'confirmed'))
  function run(action: (value: V2State) => V2State) { try { setState(action(state)); setFeedback('已更新本地记录。'); setDialog(null) } catch (error) { setFeedback((error as Error).message) } }
  function addSlot(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); run(value => saveCoffeeSlot(value, { startAt: String(form.get('start')), endAt: String(form.get('end')), location: String(form.get('location')), capacity: Number(form.get('capacity')) })) }
  return <div className="v2-page"><PageHeading eyebrow="TEACHER · COFFEE CHAT" title="Coffee Chat" description="先看看哪些同学预约了与你交流。"/>
    <div className="v2-filter-pills"><button className={tab === 'bookings' ? 'is-active' : ''} onClick={() => setTab('bookings')}>预约学生</button><button className={tab === 'slots' ? 'is-active' : ''} onClick={() => setTab('slots')}>开放时段</button></div>
    {(feedback || persistenceError) && <p role="status">{persistenceError ? '浏览器保存失败，本次变更刷新后可能丢失。' : feedback}</p>}
    {tab === 'bookings' ? <section className="v2-panel v2-teacher-panel"><label><input type="checkbox" checked={showHistory} onChange={e => setShowHistory(e.target.checked)}/> 包含取消记录</label>{bookings.length ? bookings.map(b => { const slot = slots.find(s => s.id === b.slotId)!; const next = slots.find(s => s.id === b.proposedSlotId); return <article className="v2-teacher-card" key={b.id}><div><span className="v2-eyebrow">{b.status === 'cancelled' ? '已取消' : next ? '改期待学生确认' : '已预约'}</span><h2>{b.student}</h2><p>{stamp(slot.startAt)} – {stamp(slot.endAt)} · {slot.location ?? managedTeachers(state).find(t => t.id === id)?.location}</p><p>交流问题：{b.topic}</p><small>{b.createdAt ? `预约于 ${stamp(b.createdAt)}` : '旧记录未提供预约时间'} · 时间结束不代表已到场</small>{next && <p>拟改至：{stamp(next.startAt)}；确认前保留原安排。</p>}</div>{b.status === 'confirmed' && <div className="v2-teacher-actions"><button className="v2-button v2-button-secondary" disabled={!!next} onClick={() => setDialog({ kind: 'move', id: b.id })}>提出改期</button><button className="v2-button v2-button-secondary" onClick={() => setDialog({ kind: 'cancel', id: b.id })}>取消预约</button></div>}<details><summary>处理记录</summary>{b.history.length ? b.history.map((h, index) => <p key={index}>{stamp(h.at)} · {h.action} {h.reason}</p>) : <p>暂无处理记录</p>}</details></article> }) : <Empty icon={Coffee} title="还没有同学预约" description="开放时段后，学生预约成功会自动出现在这里。"/>}<p className="v2-form-note">原示例时段中仅有占用数量、没有身份的预约不会补造学生姓名。</p></section> : <section className="v2-panel v2-teacher-panel"><h2>新增开放时段</h2><form className="v2-form" onSubmit={addSlot}><div className="v2-form-grid"><label>开始时间<input name="start" type="datetime-local" required/></label><label>结束时间<input name="end" type="datetime-local" required/></label><label>地点<input name="location" required maxLength={100} defaultValue={managedTeachers(state).find(t => t.id === id)?.location}/></label><label>预约容量<input name="capacity" type="number" min={1} defaultValue={1} required/></label></div><button className="v2-button v2-button-primary">开放时段</button></form><h2>我的时段</h2>{slots.map(s => <article className="v2-teacher-card" key={s.id}><div><strong>{stamp(s.startAt)} – {stamp(s.endAt)}</strong><p>{s.location ?? managedTeachers(state).find(t => t.id === id)?.location} · {occupied(state, s.id)} / {s.capacity} 个名额</p><small>{s.closed ? '已关闭' : Date.parse(s.startAt) <= Date.now() ? '已开始或结束' : '开放中'}</small></div><button className="v2-button v2-button-secondary" disabled={s.closed || occupied(state, s.id) > 0} onClick={() => run(value => closeCoffeeSlot(value, s.id))}>关闭时段</button></article>)}<p className="v2-form-note">时间与地点需调整时，关闭空时段后重新开放；已有预约须先与学生改期或取消。</p></section>}
    {dialog && <Modal title={dialog.kind === 'cancel' ? '取消预约' : '提出改期'} onClose={() => setDialog(null)}><form className="v2-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); run(value => dialog.kind === 'cancel' ? cancelCoffee(value, dialog.id, String(form.get('reason'))) : proposeCoffeeMove(value, dialog.id, String(form.get('slot')), String(form.get('reason')))) }}>{dialog.kind === 'move' && <label>新时段<select name="slot" required><option value="">请选择</option>{slots.filter(s => !s.closed && Date.parse(s.startAt) > Date.now() && occupied(state, s.id) < s.capacity).map(s => <option key={s.id} value={s.id}>{stamp(s.startAt)} · {s.location}</option>)}</select></label>}<label>原因<textarea name="reason" required maxLength={500}/></label><button className="v2-button v2-button-primary">确认提交</button>{feedback && <p role="alert">{feedback}</p>}</form></Modal>}
  </div>
}

export function StudentCoffeeChanges() {
  const { state, setState } = useV2(), data = coffeeData(state), [error, setError] = useState('')
  function act(id: string, accept: boolean) { try { setState(answerCoffeeMove(state, id, accept)); setError('已处理改期。') } catch (e) { setError((e as Error).message) } }
  return <>{data.bookings.filter(b => b.student === studentName && b.status === 'confirmed' && b.proposedSlotId).map(b => <article className="v2-teacher-card" key={b.id}><h3>老师提出 Coffee Chat 改期</h3><p>新时间：{stamp(data.slots.find(s => s.id === b.proposedSlotId)!.startAt)}</p><p>{b.history.at(-1)?.reason}</p><div className="v2-teacher-actions"><button className="v2-button v2-button-primary" onClick={() => act(b.id, true)}>接受改期</button><button className="v2-button v2-button-secondary" onClick={() => act(b.id, false)}>保留原时间</button></div></article>)}{error && <p role="status">{error}</p>}</>
}

export function TeacherSchedule() {
  const { state } = useV2(), account = teacherAccount(state), data = coffeeData(state)
  const items = data.bookings.filter(b => b.status === 'confirmed').map(b => ({ booking: b, slot: data.slots.find(s => s.id === b.slotId) })).filter(x => x.slot?.teacherId === account.id).sort((a, b) => Date.parse(a.slot!.startAt) - Date.parse(b.slot!.startAt))
  return <div className="v2-page"><PageHeading eyebrow="MY SCHEDULE" title="日程信息" description="已成立的 Coffee Chat 安排；改期确认前保留原时间。"/><section className="v2-panel v2-teacher-panel">{items.length ? items.map(({ booking, slot }) => <Link className="v2-saved-row" key={booking.id} to="/v2/teacher/coffee"><CalendarDays size={20}/><span><strong>{booking.student} · Coffee Chat</strong><small>{stamp(slot!.startAt)} – {stamp(slot!.endAt)} · {slot!.location ?? managedTeachers(state).find(t => t.id === account.id)?.location}{booking.proposedSlotId ? ' · 改期待确认' : ''}</small></span></Link>) : <Empty icon={CalendarDays} title="暂无预约日程"/>}{account.sportsQualified && <Link className="v2-button v2-button-secondary" to="/v2/teacher/sports">查看体育课程安排</Link>}</section></div>
}

export function TeacherMessages() {
  const { state, setState } = useV2(), account = teacherAccount(state), data = coffeeData(state)
  const items = data.notices.filter(n => n.teacherId === account.id)
  return <div className="v2-page"><PageHeading eyebrow="MESSAGES" title="消息与通知" description="预约、取消与改期的业务通知。"/><section className="v2-panel v2-teacher-panel">{items.length ? items.map(n => <article className="v2-teacher-card" key={n.id}><p>{n.body}</p><small>{stamp(n.at)} · {n.read ? '已读' : '未读'}</small><Link to="/v2/teacher/coffee">查看预约</Link>{!n.read && <button className="v2-button v2-button-secondary" onClick={() => setState(value => ({ ...value, teacherCoffee: { ...coffeeData(value), notices: coffeeData(value).notices.map(item => item.id === n.id && item.teacherId === account.id ? { ...item, read: true } : item) } }))}>标为已读</button>}</article>) : <Empty icon={Bell} title="暂无消息"/>}{account.sportsQualified && <Link to="/v2/teacher/sports">查看体育平台通知</Link>}</section></div>
}

export function TeacherProfile() {
  const { state, setState, persistenceError } = useV2(), account = teacherAccount(state), person = managedTeachers(state).find(t => t.id === account.id)!
  const [message, setMessage] = useState('')
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget), nickname = String(f.get('nickname')).trim(); if (!nickname || nickname.length > 20) { setMessage('展示名称须为 1–20 字。'); return } setState(value => ({ ...value, teacherCoffee: { ...coffeeData(value), profiles: { ...coffeeData(value).profiles, [account.id]: { nickname, bio: String(f.get('bio')).trim(), topics: String(f.get('topics')).split('、').map(t => t.trim()).filter(Boolean), location: String(f.get('location')).trim() } } } })); setMessage('资料已更新，学生端老师介绍同步显示。') }
  return <div className="v2-page"><PageHeading eyebrow="TEACHER PROFILE" title="个人资料" description="维护学生预约前可以查看的介绍。"/><form className="v2-panel v2-form v2-teacher-panel" onSubmit={save}><label>教师标识<input value={account.id} readOnly/></label><label>学院<input value={person.department} readOnly/></label><label>教师资格<input value={account.sportsQualified ? '体育老师（本地演示资格）' : '普通老师（本地演示身份）'} readOnly/></label><label>展示名称<input name="nickname" defaultValue={person.name} maxLength={20} required/></label><label>个人介绍<textarea name="bio" defaultValue={person.bio} maxLength={1000}/></label><label>交流主题（用顿号分隔）<input name="topics" defaultValue={person.topics.join('、')} maxLength={200}/></label><label>默认交流地点<input name="location" defaultValue={person.location} maxLength={100} required/></label><button className="v2-button v2-button-primary">保存资料</button><p role="status">{persistenceError ? '浏览器存储失败，刷新后可能丢失。' : message}</p><p className="v2-form-note">体育资格不能通过编辑资料取得。已开放时段的地点以时段记录为准。</p></form></div>
}

export function TeacherSports() {
  const { state } = useV2()
  if (!canUseTeacherSports(state)) return <Navigate to="/v2/teacher/coffee" replace/>
  const origin = import.meta.env.DEV ? 'http://127.0.0.1:4186/?mock=teacher' : import.meta.env.VITE_SPORTS_TEACHER_URL
  return <section className="v2-sports-embedded"><div className="v2-sports-toolbar"><Link className="v2-sports-back" to="/v2/teacher/coffee">返回伴学教师端</Link><span>原体育平台教师端 · {import.meta.env.DEV ? '独立本地演示数据' : '使用体育系统授权'}</span></div>{origin ? <iframe className="v2-sports-frame" title="原体育平台教师端" src={origin} allow="camera 'self'; microphone 'self'; fullscreen"/> : <p>尚未配置体育教师平台地址，请配置 VITE_SPORTS_TEACHER_URL 并接入原体育系统身份验证。</p>}</section>
}
