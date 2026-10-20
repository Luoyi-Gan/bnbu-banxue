import { uiText, useUiLanguage, uiLocale, uiTemplate } from './uiLanguage'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, GraduationCap, MapPin, UsersRound } from 'lucide-react'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { PageHeading, Empty, SectionHeading } from './ui'
import { bookingStatus } from '../../shared/v2/alumniPolicy'
import { DisplayAvatar } from './DisplayAvatar'
import { displayPerson } from './displayPerson'

import { AlumniDiscovery } from './AlumniDiscoveryFeed'

const alumniTime = (value: string) => new Date(value).toLocaleString(uiLocale(), { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const alumniStatus = { pending: '待校友确认', confirmed: '已确认', rejected: '已拒绝', withdrawn: '已撤回', cancelled: '已取消', expired: '已过期', unavailable: '时段已被预约' }

export function V2Alumni() { useUiLanguage();
  const live = useWorkspaceBackend(10000), data = live.data?.alumni ?? {profiles: [], slots: [], bookings: [], follows: [], history: [], notices: []}, actor = {id: live.data?.account.id ?? ''}
  const [params] = useSearchParams(), view = params.get('view') ?? 'discover'
  const [query, setQuery] = useState(''), [direction, setDirection] = useState('全部'), [followed, setFollowed] = useState(false)
  const [error, setError] = useState(''), [success, setSuccess] = useState('')
  const [reason, setReason] = useState('')
  const [cancelBooking, setCancelBooking] = useState<string | null>(null)
  const [, tick] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => tick(n => n + 1), 30000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { setError(''); setSuccess('') }, [view, params])
  const mine = data.profiles.find(item => item.owner === actor.id)
  const person = data.profiles.find(item => item.id === params.get('person') && item.status === 'approved')
  async function act(action: string, input: Record<string, unknown>, message = '') {
    setSuccess(''); setError('')
    if (await live.mutate(action, input)) setSuccess(message)
  }
  const alumniDisplay = (owner: string, name: string) => displayPerson(live.data, owner, name)
  const people = data.profiles.filter(item => item.status === 'approved' && (direction === '全部' || item.direction === direction) && (!followed || data.follows.some(f => f.student === actor.id && f.alumniId === item.id)) && `${alumniDisplay(item.owner, item.name).name} ${item.name} ${item.major} ${item.graduationYear} ${item.city} ${item.experience} ${item.topics}`.toLowerCase().includes(query.trim().toLowerCase()))
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget)
    act('alumni.profile', { city: String(f.get('city')), direction: f.get('direction') as '升学' | '就业', experience: String(f.get('experience')), topics: String(f.get('topics')), bio: String(f.get('bio')), accepting: f.get('accepting') === 'on' }, '校友资料已保存。')
  }
  function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, f = new FormData(form)
    act('alumni.slot.create', { startAt: new Date(String(f.get('start'))).toISOString(), endAt: new Date(String(f.get('end'))).toISOString(), location: String(f.get('location')) }, '交流时段已开放。')
  }
  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget)
    act('alumni.post', { title: String(f.get('title')), body: String(f.get('body')), direction: String(f.get('topic')) }, '经验分享已发布。')
  }
  if (!live.data) return <p role={live.error?'alert':'status'}>{live.error || uiText('正在读取校友信息…')}</p>
  return <div className="v2-page v2-alumni-page"><Link className="v2-text-button" to="/v2"><ArrowLeft size={16}/> {uiText("返回首页")}</Link><PageHeading eyebrow="ALUMNI CONNECTIONS" title={uiText("校友同行")} description={uiText("向走过这段路的人请教，让校园里的连接延续。")} action={view!=='manage'&&<Link className="v2-button v2-button-secondary" to="/v2/alumni?view=manage">{mine?.status === 'approved'?uiText('我的校友资料'):uiText('校友认证')}</Link>}/>
    <nav className="v2-tabs" aria-label={uiText("校友板块")}><Link className={(view === 'discover' || view === 'stories') && !person?'is-active':''} to="/v2/alumni">{uiText("经验发现")}</Link><Link className={view === 'people' || person?'is-active':''} to="/v2/alumni?view=people">{uiText("寻找校友")}</Link><Link className={view === 'bookings'?'is-active':''} to="/v2/alumni?view=bookings">{uiText("我的交流")}</Link></nav>
    {(error || live.error) && <p className="v2-info-box" role="alert">{error || live.error}</p>}{success && <p className="v2-info-box" role="status">{success}</p>}
    {view === 'people' && !person && <><p className="v2-form-note">{uiText("校友资料与时段来自当前服务，升学和工作经历由本人提供。")}</p><section className="v2-panel v2-list-panel"><div className="v2-toolbar"><input className="v2-alumni-search" aria-label={uiText("搜索校友")} placeholder={uiText("姓名、专业、年份、城市或行业")} value={query} onChange={e => setQuery(e.target.value)}/><select aria-label={uiText("交流方向")} value={direction} onChange={e => setDirection(e.target.value)}><option value={"全部"}>{uiText("全部")}</option><option value={"升学"}>{uiText("升学")}</option><option value={"就业"}>{uiText("就业")}</option></select><label className="v2-alumni-follow-filter"><input type="checkbox" checked={followed} onChange={e => setFollowed(e.target.checked)}/>{uiText("只看已关注")}</label></div><div className="v2-alumni-grid">{people.map(item => <article className="v2-alumni-card" key={item.id}><DisplayAvatar className="v2-avatar" name={alumniDisplay(item.owner, item.name).name} avatar={alumniDisplay(item.owner, item.name).avatar} personId={item.owner}/><span className="v2-status-chip is-success">{uiText("认证校友")}</span><h3>{alumniDisplay(item.owner, item.name).name}</h3><p>{item.graduationYear} {uiText("届 ·")}{item.major}</p><p>{item.city} · {item.experience}</p><div className="v2-alumni-topics">{item.topics}</div><div className="v2-detail-actions"><Link className="v2-button v2-button-primary" to={`/v2/alumni?person=${item.id}`}>{uiText("了解校友")}<ArrowRight size={15}/></Link>{item.owner !== actor.id && <button className="v2-button v2-button-secondary" onClick={() => act('alumni.follow', {id: item.id})}>{data.follows.some(f => f.student === actor.id && f.alumniId === item.id)?uiText('取消关注'):uiText('关注')}</button>}</div></article>)}</div>{!people.length && <Empty icon={UsersRound} title={uiText("暂无符合条件的校友")} description={uiText("试试其他关键词，或取消已关注筛选。")}/>}</section></>}
    {view === 'discover' && person && <><Link className="v2-text-button" to="/v2/alumni?view=people"><ArrowLeft size={16}/> {uiText("返回校友列表")}</Link><section className="v2-panel v2-list-panel"><SectionHeading title={alumniDisplay(person.owner, person.name).name} detail={uiTemplate([""," 届 · "," · ",""],person.graduationYear,person.major,person.city)}/><span className="v2-status-chip is-success">{uiText("校友身份已认证")}</span><p>{person.experience}</p><p>{person.bio}</p><p>{uiText("可交流：")}{person.topics}</p><small>{uiText("升学和工作经历由本人提供，校友认证不代表经历均已核验。")}</small>{person.owner !== actor.id && <div className="v2-detail-actions"><button className="v2-button v2-button-secondary" onClick={() => act('alumni.follow', {id: person.id})}>{data.follows.some(f => f.student === actor.id && f.alumniId === person.id)?uiText('取消关注'):uiText('关注校友')}</button></div>}</section><section className="v2-panel v2-list-panel"><SectionHeading title="Coffee Chat" detail={uiText("提交交流问题后，等待校友确认")}/><AlumniAppointmentArea personId={person.id} live={live}/></section></>}
    {((view === 'discover' && !person) || view === 'stories' || person) && <><AlumniDiscovery key={person?.id ?? 'discover'} personId={person?.id}/><div className="alumni-story-publish">{mine?.status === 'approved' && <form className="v2-form" onSubmit={publish}><SectionHeading title={uiText("分享我的经历")}/><label>{uiText("方向")}<select name="topic"><option value={"升学"}>{uiText("升学")}</option><option value={"就业"}>{uiText("就业")}</option></select></label><label>{uiText("标题")}<input name="title" maxLength={80} required/></label><label>{uiText("正文")}<textarea name="body" maxLength={1000} rows={5} required/></label><button className="v2-button v2-button-primary">{uiText("发布经验")}</button></form>}</div></>}
    {view === 'bookings' && <>
      <section className="v2-panel v2-list-panel v2-alumni-notices"><SectionHeading title={uiText('交流通知')}/>
        {(live.data?.notifications ?? []).filter(item => item.event.startsWith('alumni.')).slice(0, 10).map(item => <div className="v2-alumni-notice" key={item.id}><p>{item.body}</p><footer><time>{alumniTime(item.createdAt)}</time>{!item.readAt && <button className="v2-text-button" onClick={() => act('notification.read', {id: item.id})}>{uiText('标为已读')}</button>}</footer></div>)}
        {!live.data?.notifications.some(item => item.event.startsWith('alumni.')) && <p>{uiText('暂无交流通知。')}</p>}
      </section>
      <section className="v2-panel v2-list-panel v2-alumni-bookings-panel"><SectionHeading title={uiText('我的申请与预约')}/>
        <div className="v2-alumni-bookings-list">{data.bookings.filter(item => item.student === actor.id).map(item => {
          const slot = data.slots.find(s => s.id === item.slotId)!, alumnus = data.profiles.find(p => p.id === slot.alumniId)!, status = bookingStatus(data, item)
          const display = alumniDisplay(alumnus.owner, alumnus.name)
          const canCancel = ['pending', 'confirmed'].includes(status) && Date.parse(slot.endAt) > Date.now()
          return <article className="v2-alumni-booking" key={item.id}>
            <header><DisplayAvatar className="v2-avatar" name={display.name} avatar={display.avatar} personId={alumnus.owner}/><div><small>Coffee Chat</small><h3>{uiText('与')}{display.name}{uiText('交流')}</h3></div><span className="v2-status-chip">{uiText(alumniStatus[status])}</span></header>
            <div className="v2-alumni-booking-meta"><p><CalendarDays size={16}/><span>{alumniTime(slot.startAt)} — {alumniTime(slot.endAt)}</span></p><p><MapPin size={16}/><span>{slot.location}</span></p></div>
            <div className="v2-alumni-booking-question"><small>{uiText('交流问题')}</small><p>{item.question}</p></div>
            {item.reason && <p className="v2-form-note">{item.reason}</p>}
            {canCancel && (cancelBooking === item.id ? <form className="v2-alumni-cancel-form" onSubmit={event => { event.preventDefault(); act('alumni.cancel', {id: item.id, reason}, '预约记录已更新。') }}><label className="v2-drawer-label">{uiText('取消原因（已确认预约必填）')}<textarea required={status === 'confirmed'} maxLength={300} value={reason} onChange={event => setReason(event.target.value)} placeholder={uiText('说明取消原因')}/></label><div><button type="button" className="v2-text-button" onClick={() => setCancelBooking(null)}>{uiText('保留预约')}</button><button type="submit" className="v2-button v2-button-secondary" disabled={live.busy}>{uiText('确认取消')}</button></div></form> : <footer><button className="v2-text-button" disabled={live.busy} onClick={() => { if (status === 'pending') act('alumni.cancel', {id: item.id, reason: ''}, '预约记录已更新。'); else { setReason(''); setCancelBooking(item.id) } }}>{status === 'pending' ? uiText('撤回申请') : uiText('取消预约')}</button></footer>)}
          </article>
        })}</div>
        {!data.bookings.some(item => item.student === actor.id) && <Empty icon={GraduationCap} title={uiText('还没有交流申请')} description={uiText('找到合适的校友后，可以申请开放的时段。')}/>}
      </section>
    </>}
    {view === 'manage' && <><AlumniCertification/>{mine?.status === 'approved' && <><section className="v2-panel v2-list-panel"><SectionHeading title={uiText("我的校友资料")}/><form className="v2-form" onSubmit={saveProfile}><label>{uiText("城市")}<input name="city" defaultValue={mine.city} maxLength={40} required/></label><label>{uiText("方向")}<select name="direction" defaultValue={mine.direction}><option value={"升学"}>{uiText("升学")}</option><option value={"就业"}>{uiText("就业")}</option></select></label><label>{uiText("当前经历")}<input name="experience" defaultValue={mine.experience} maxLength={120} required/></label><label>{uiText("可交流话题")}<input name="topics" defaultValue={mine.topics} maxLength={120} required/></label><label>{uiText("个人介绍")}<textarea name="bio" defaultValue={mine.bio} maxLength={500}/></label><label><input type="checkbox" name="accepting" defaultChecked={mine.accepting}/> {uiText("接受新的交流申请")}</label><button className="v2-button v2-button-primary">{uiText("保存校友资料")}</button></form></section><section className="v2-panel v2-list-panel"><SectionHeading title={uiText("我的交流时段")}/><form className="v2-form" onSubmit={addSlot}><label>{uiText("开始时间")}<input type="datetime-local" name="start" required/></label><label>{uiText("结束时间")}<input type="datetime-local" name="end" required/></label><label>{uiText("地点或交流方式")}<input name="location" maxLength={120} required/></label><button className="v2-button v2-button-primary">{uiText("开放时段")}</button></form>{data.slots.filter(s => s.alumniId === mine.id).map(slot => <div className="v2-alumni-booking" key={slot.id}><p>{alumniTime(slot.startAt)} — {alumniTime(slot.endAt)}</p><p>{slot.location} · {slot.open?uiText('开放'):uiText('已关闭')}</p>{slot.open && <button className="v2-button v2-button-secondary" onClick={() => act('alumni.slot.close', {id: slot.id})}>{uiText("关闭时段")}</button>}</div>)}</section><AlumniIncoming live={live}/></>}</>}
  </div>
}

import { AlumniAppointmentArea, AlumniCertification, AlumniIncoming } from './alumniWorkflow'
