import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Coffee, CalendarDays, Bell } from 'lucide-react'
import { useV2 } from './useV2'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { PageHeading, Empty, Modal } from './ui'
import { canUseTeacherSports, teacherAccount } from './teacherCoffee'
import './teacherPortal.css'

const stamp = (value: string) => new Date(value).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export function TeacherCoffee() {
  const live = useWorkspaceBackend()
  const id = live.data?.account.id ?? ''
  const entities = live.data?.entities ?? []
  const defaultLocation = String(entities.find(e => e.kind === 'teacherProfile' && e.ownerId === id)?.data.location ?? '')
  const data = {
    slots: entities.filter(e => e.kind === 'coffeeSlot').map(e => ({id: e.id, teacherId: e.ownerId, startAt: String(e.data.startAt), endAt: String(e.data.endAt), location: String(e.data.location), capacity: Number(e.data.capacity), closed: e.data.closed === true})),
    bookings: entities.filter(e => e.kind === 'coffeeBooking').map(e => ({id: e.id, slotId: String(e.data.slotId), proposedSlotId: e.data.proposedSlotId as string | null, student: live.data?.people.find(p => p.id === e.ownerId)?.name ?? '学生', topic: String(e.data.topic), status: String(e.data.status), createdAt: e.createdAt, reason: String(e.data.reason ?? '')})),
  }
  const occupied = (_unused: unknown, slotId: string) => data.bookings.filter(b => b.status === 'confirmed' && (b.slotId === slotId || b.proposedSlotId === slotId)).length
  const state = null
  const slots = data.slots.filter(s => s.teacherId === id).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
  const [tab, setTab] = useState('bookings'), [feedback, setFeedback] = useState(''), [showHistory, setShowHistory] = useState(false)
  const [dialog, setDialog] = useState<{ kind: 'cancel' | 'move'; id: string } | null>(null)
  const bookings = data.bookings.filter(b => slots.some(s => s.id === b.slotId) && (showHistory || b.status === 'confirmed'))
  async function run(action: string, input: Record<string, unknown>) { if (await live.mutate(action, input)) {setFeedback('已保存到伴学后台。'); setDialog(null)} }
  function addSlot(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); void run('coffee.slot.create', {startAt: new Date(String(form.get('start'))).toISOString(), endAt: new Date(String(form.get('end'))).toISOString(), location: String(form.get('location')), capacity: Number(form.get('capacity'))}) }
  return <div className="v2-page"><PageHeading eyebrow="TEACHER · COFFEE CHAT" title="Coffee Chat" description="先看看哪些同学预约了与你交流。"/>
    <div className="v2-filter-pills"><button className={tab === 'bookings' ? 'is-active' : ''} onClick={() => setTab('bookings')}>预约学生</button><button className={tab === 'slots' ? 'is-active' : ''} onClick={() => setTab('slots')}>开放时段</button></div>
    {!live.data && !live.error && <p role="status">正在读取本人预约…</p>}{(feedback || live.error) && <p role="status">{live.error || feedback}</p>}
    {tab === 'bookings' ? <section className="v2-panel v2-teacher-panel"><label><input type="checkbox" checked={showHistory} onChange={e => setShowHistory(e.target.checked)}/> 包含取消记录</label>{bookings.length ? bookings.map(b => { const slot = slots.find(s => s.id === b.slotId)!; const next = slots.find(s => s.id === b.proposedSlotId); return <article className="v2-teacher-card" key={b.id}><div><span className="v2-eyebrow">{b.status === 'cancelled' ? '已取消' : next ? '改期待学生确认' : '已预约'}</span><h2>{b.student}</h2><p>{stamp(slot.startAt)} – {stamp(slot.endAt)} · {slot.location ?? defaultLocation}</p><p>交流问题：{b.topic}</p><small>{b.createdAt ? `预约于 ${stamp(b.createdAt)}` : '旧记录未提供预约时间'} · 时间结束不代表已到场</small>{next && <p>拟改至：{stamp(next.startAt)}；确认前保留原安排。</p>}</div>{b.status === 'confirmed' && <div className="v2-teacher-actions"><button className="v2-button v2-button-secondary" disabled={!!next} onClick={() => setDialog({ kind: 'move', id: b.id })}>提出改期</button><button className="v2-button v2-button-secondary" onClick={() => setDialog({ kind: 'cancel', id: b.id })}>取消预约</button></div>}<details><summary>处理记录</summary><p>{b.reason ? `最近处理说明：${b.reason}` : '暂无处理说明'}</p></details></article> }) : <Empty icon={Coffee} title="还没有同学预约" description="开放时段后，学生预约成功会自动出现在这里。"/>}<p className="v2-form-note">预约和改期待确认的预留都会占用名额。</p></section> : <section className="v2-panel v2-teacher-panel"><h2>新增开放时段</h2><form className="v2-form" onSubmit={addSlot}><div className="v2-form-grid"><label>开始时间<input name="start" type="datetime-local" required/></label><label>结束时间<input name="end" type="datetime-local" required/></label><label>地点<input name="location" required maxLength={100} defaultValue={defaultLocation}/></label><label>预约容量<input name="capacity" type="number" min={1} defaultValue={1} required/></label></div><button className="v2-button v2-button-primary">开放时段</button></form><h2>我的时段</h2>{slots.map(s => <article className="v2-teacher-card" key={s.id}><div><strong>{stamp(s.startAt)} – {stamp(s.endAt)}</strong><p>{s.location ?? defaultLocation} · {occupied(state, s.id)} / {s.capacity} 个名额</p><small>{s.closed ? '已关闭' : Date.parse(s.startAt) <= Date.now() ? '已开始或结束' : '开放中'}</small></div><button className="v2-button v2-button-secondary" disabled={s.closed || occupied(state, s.id) > 0} onClick={() => run('coffee.slot.update', {id: s.id, startAt: s.startAt, endAt: s.endAt, location: s.location, capacity: s.capacity, closed: true})}>关闭时段</button></article>)}<p className="v2-form-note">时间与地点需调整时，关闭空时段后重新开放；已有预约须先与学生改期或取消。</p></section>}
    {dialog && <Modal title={dialog.kind === 'cancel' ? '取消预约' : '提出改期'} onClose={() => setDialog(null)}><form className="v2-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(dialog.kind === 'cancel' ? 'coffee.cancel' : 'coffee.move', {id: dialog.id, slotId: String(form.get('slot')), reason: String(form.get('reason'))}) }}>{dialog.kind === 'move' && <label>新时段<select name="slot" required><option value="">请选择</option>{slots.filter(s => !s.closed && Date.parse(s.startAt) > Date.now() && occupied(state, s.id) < s.capacity).map(s => <option key={s.id} value={s.id}>{stamp(s.startAt)} · {s.location}</option>)}</select></label>}<label>原因<textarea name="reason" required maxLength={500}/></label><button className="v2-button v2-button-primary">确认提交</button>{(live.error || feedback) && <p role="alert">{live.error || feedback}</p>}</form></Modal>}
  </div>
}

export function StudentCoffeeChanges() {
  const live = useWorkspaceBackend()
  const entities = live.data?.entities ?? []
  const bookings = entities.filter(e => e.kind === 'coffeeBooking' && e.ownerId === live.data?.account.id && e.data.status === 'confirmed' && e.data.proposedSlotId)
  return <>{bookings.map(b => {
    const slot = entities.find(e => e.id === b.data.proposedSlotId)
    return <article className="v2-teacher-card" key={b.id}><h3>老师提出 Coffee Chat 改期</h3><p>新时间：{slot ? stamp(String(slot.data.startAt)) : '时段信息暂不可用'}</p><p>{String(b.data.reason ?? '')}</p><div className="v2-teacher-actions"><button disabled={live.busy || !slot} className="v2-button v2-button-primary" onClick={() => void live.mutate('coffee.answer', {id: b.id, accept: true})}>接受改期</button><button disabled={live.busy} className="v2-button v2-button-secondary" onClick={() => void live.mutate('coffee.answer', {id: b.id, accept: false})}>保留原时间</button></div></article>
  })}{live.error && <p role="alert">{live.error}</p>}</>
}

export function TeacherSchedule() {
  const { state } = useV2(), account = teacherAccount(state)
  const live = useWorkspaceBackend()
  const entities = live.data?.entities ?? []
  const items = entities.filter(e => e.kind === 'coffeeBooking' && e.data.status === 'confirmed' && e.data.teacherId === live.data?.account.id).map(booking => ({booking, slot: entities.find(e => e.kind === 'coffeeSlot' && e.id === booking.data.slotId)})).filter(item => item.slot).sort((a,b) => Date.parse(String(a.slot!.data.startAt)) - Date.parse(String(b.slot!.data.startAt)))
  return <div className="v2-page"><PageHeading eyebrow="MY SCHEDULE" title="日程信息" description="已成立的 Coffee Chat 安排；改期确认前保留原时间。"/>{live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人日程…</p>}<section className="v2-panel v2-teacher-panel">{items.length ? items.map(({ booking, slot }) => <Link className="v2-saved-row" key={booking.id} to="/v2/teacher/coffee"><CalendarDays size={20}/><span><strong>{live.data?.people.find(p => p.id === booking.ownerId)?.name ?? '学生'} · Coffee Chat</strong><small>{stamp(String(slot!.data.startAt))} – {stamp(String(slot!.data.endAt))} · {String(slot!.data.location)}{booking.data.proposedSlotId ? ' · 改期待确认' : ''}</small></span></Link>) : live.data && <Empty icon={CalendarDays} title="暂无预约日程"/>}{account.sportsQualified && <Link className="v2-button v2-button-secondary" to="/v2/teacher/sports">查看体育课程安排</Link>}</section></div>
}

export function TeacherMessages() {
  const {state} = useV2(), account = teacherAccount(state)
  const live = useWorkspaceBackend(10000)
  const items = live.data?.notifications.filter(n => n.event.startsWith('coffee.')) ?? []
  return <div className="v2-page"><PageHeading eyebrow="MESSAGES" title="消息与通知" description="预约、取消与改期的业务通知。"/>{live.error && <p role="alert">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人通知…</p>}<section className="v2-panel v2-teacher-panel">{items.length ? items.map(n => <article className="v2-teacher-card" key={n.id}><p>{n.body}</p><small>{stamp(n.createdAt)} · {n.readAt ? '已读' : '未读'}</small><Link to="/v2/teacher/coffee">查看预约</Link>{!n.readAt && <button disabled={live.busy} className="v2-button v2-button-secondary" onClick={() => void live.mutate('notification.read', {id: n.id})}>标为已读</button>}</article>) : live.data && <Empty icon={Bell} title="暂无消息"/>}{account.sportsQualified && <Link to="/v2/teacher/sports">查看体育平台通知</Link>}</section></div>
}

export function TeacherProfile() {
  const live = useWorkspaceBackend()
  const [message, setMessage] = useState('')
  const account = live.data?.account
  const profile = live.data?.entities.find(e => e.kind === 'teacherProfile' && e.ownerId === account?.id)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    setMessage('')
    if (await live.mutate('coffee.profile', {nickname: String(f.get('nickname')).trim(), bio: String(f.get('bio')).trim(), topics: String(f.get('topics')).trim(), location: String(f.get('location')).trim()})) setMessage('资料已保存到伴学后台。')
  }
  return <div className="v2-page"><PageHeading eyebrow="TEACHER PROFILE" title="个人资料" description="维护学生预约前可以查看的介绍。"/>{!account ? <p role={live.error ? 'alert' : 'status'}>{live.error || '正在读取本人资料…'}</p> : <form key={account.id} className="v2-panel v2-form v2-teacher-panel" onSubmit={save}><label>教师标识<input value={account.id} readOnly/></label><label>学院<input value={account.organization} readOnly/></label><label>教师资格<input value="已授权教师；体育资格以体育平台核验为准" readOnly/></label><label>展示名称<input name="nickname" defaultValue={String(profile?.data.nickname ?? account.name)} maxLength={20} required/></label><label>个人介绍<textarea name="bio" defaultValue={String(profile?.data.bio ?? '')} maxLength={1000}/></label><label>交流主题（用顿号分隔）<input name="topics" defaultValue={String(profile?.data.topics ?? '')} maxLength={200}/></label><label>默认交流地点<input name="location" defaultValue={String(profile?.data.location ?? '')} maxLength={100} required/></label><button disabled={live.busy} className="v2-button v2-button-primary">保存资料</button><p role="status">{live.error || message}</p><p className="v2-form-note">体育资格不能通过编辑资料取得。已开放时段的地点以时段记录为准。</p></form>}</div>
}

export function TeacherSports() {
  const { state } = useV2()
  if (!canUseTeacherSports(state)) return <Navigate to="/v2/teacher/coffee" replace/>
  const origin = import.meta.env.DEV ? 'http://127.0.0.1:4186/?mock=teacher' : import.meta.env.VITE_SPORTS_TEACHER_URL
  return <section className="v2-sports-embedded"><div className="v2-sports-toolbar"><Link className="v2-sports-back" to="/v2/teacher/coffee">返回伴学教师端</Link><span>原体育平台教师端 · {import.meta.env.DEV ? '独立本地演示数据' : '使用体育系统授权'}</span></div>{origin ? <iframe className="v2-sports-frame" title="原体育平台教师端" src={origin} allow="camera 'self'; microphone 'self'; fullscreen"/> : <p>尚未配置体育教师平台地址，请配置 VITE_SPORTS_TEACHER_URL 并接入原体育系统身份验证。</p>}</section>
}
