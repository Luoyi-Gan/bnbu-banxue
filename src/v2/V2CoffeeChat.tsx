import {sharedElementTransition} from './sharedElementMotion'
import {ContinuityIcon} from './ContinuityIcon'
import { uiText, useUiLanguage, uiLocale } from './uiLanguage'
import { Link, useSearchParams } from 'react-router-dom'
import { coffeeSlotStatus } from './coffeeSlotStatus'
import { useWorkspaceBackend } from './useWorkspaceBackend'

import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Coffee, MapPin } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import campusServicesPhoto from '../assets/campus/campus-services.jpg'
import campusHomePhoto from '../assets/campus/home-background.jpg'
import campusEveningPhoto from '../assets/campus/evening-campus.jpg'
import campusNightPhoto from '../assets/campus/night-walkway.jpg'
import { AnimatedSearchField } from './AnimatedSearchField'

import { Empty } from './ui'
import './coffeeDirectory.css'


const teacherPhotos = [campusServicesPhoto, campusHomePhoto, campusEveningPhoto, campusNightPhoto]
const facultyOptions = ['全部', 'FST', 'FBM', 'FHSS', 'SCC', '创新创业', '其他']
const facultyOf = (department: string) => department === '理工科技学院' ? 'FST' : department === '工商管理学院' ? 'FBM' : department === '人文社科学院' ? 'FHSS' : department === '通识教育学院' ? 'SCC' : department.includes('创新创业') ? '创新创业' : '其他'
const slotDate = (value: string) => new Intl.DateTimeFormat(uiLocale(), { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(value))
const slotEnd = (value: string) => new Intl.DateTimeFormat(uiLocale(), { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function V2CoffeeChat() { useUiLanguage();
  const live = useWorkspaceBackend()
  const {teachers, coffeeSlots, bookings} = useMemo(() => {
    const entities = live.data?.entities ?? []
    const profiles = entities.filter(e => e.kind === 'teacherProfile')
    const coffeeSlots = entities.filter(e => e.kind === 'coffeeSlot').map(e => ({id: e.id, teacherId: e.ownerId, startAt: String(e.data.startAt), endAt: String(e.data.endAt), timeLabel: slotEnd(String(e.data.startAt)), capacity: Number(e.data.capacity), occupied: Number(e.data.occupied), closed: e.data.closed === true, location: String(e.data.location)}))
    const bookings = entities.filter(e => e.kind === 'coffeeBooking' && e.ownerId === live.data?.account.id && e.data.status === 'confirmed')
    const ids = new Set([...profiles.map(e => e.ownerId), ...coffeeSlots.map(e => e.teacherId)])
    const teachers = [...ids].filter((id): id is string => !!id).map(id => {
      const profile = profiles.find(e => e.ownerId === id)?.data
      const person = live.data?.people.find(p => p.id === id)
      return {id, avatar: person?.avatar ?? '', name: String(profile?.nickname ?? person?.name ?? '老师'), englishName: '', department: person?.organization ?? '', fields: [] as string[], topics: String(profile?.topics ?? '').split('、').filter(Boolean), bio: String(profile?.bio ?? ''), location: String(profile?.location ?? ''), color: '#0865D1', enabled: profile?.enabled !== false}
    }).filter(t => t.enabled || bookings.some(b => b.data.teacherId === t.id))
    return {teachers, coffeeSlots, bookings}
  }, [live.data])
  const state = {coffeeBookings: bookings.map(b => String(b.data.slotId))}
  const occupied = (_unused: unknown, id: string) => coffeeSlots.find(s => s.id === id)?.occupied ?? 0
  const [topic, setTopic] = useState('')
  const [params, setParams] = useSearchParams()
  const [teacherId, setTeacherId] = useState<string | null>(() => params.get('teacher'))
  const [slotId, setSlotId] = useState<string | null>(() => params.get('slot'))
  const [query, setQuery] = useState('')
  const [faculty, setFaculty] = useState('全部')
  const [feedback, setFeedback] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const teacher = teachers.find((person) => person.id === teacherId)
  const slots = coffeeSlots.filter((slot) => slot.teacherId === teacherId)
  const slot = slots.find((item) => item.id === slotId)
  const isBooked = Boolean(slot && state.coffeeBookings.includes(slot.id))
  const filteredTeachers = teachers.filter((person) => (faculty === '全部' || facultyOf(person.department) === faculty) && `${person.name} ${person.englishName} ${person.department} ${person.fields.join(' ')} ${person.topics.join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))

  useEffect(() => {
    if (!teacher) return
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.closest('.v2-drawer-body')?.scrollTo({ top: 0 })
  }, [teacher])

  const openTeacher = (id: string) => {
    setTeacherId(id)
    setSlotId(null)
    setFeedback('')
  }
  const goBack = () => {
    setTeacherId(null)
    setSlotId(null)
    if (params.has('teacher')) setParams({})
    setFeedback('')
  }
  const updateBooking = async () => {
    if (!slot) return
    const booking = bookings.find(b => b.data.slotId === slot.id)
    const cancelled = isBooked && !!booking
    setFeedback('')
    if (await live.mutate(cancelled ? 'coffee.cancel' : 'coffee.book', cancelled ? {id: booking.id, reason: ''} : {slotId: slot.id, topic})) setFeedback(cancelled ? '预约已取消。' : '预约成功，老师已收到通知。')
  }

  if(params.get('view')==='bookings')return <section className="v2-panel v2-list-panel" aria-label={uiText('我的 Coffee Chat 预约')}>
    <div className="v2-section-heading"><h2>{uiText('我的预约')}</h2><Link to="/v2/coffee">{uiText('预约交流')}<ArrowRight size={15}/></Link></div>
    <p className="v2-form-note">{uiText('已确认的预约，包含历史记录；预约不代表实际到场。')}</p>
    {live.error&&<p role="alert">{uiText(live.error)}</p>}
    {!live.data&&!live.error&&<p role="status">{uiText('正在读取预约记录…')}</p>}
    {[...bookings].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(booking=>{
      const bookedSlot=coffeeSlots.find(s=>s.id===booking.data.slotId),person=teachers.find(t=>t.id===booking.data.teacherId)
      return <Link className="v2-saved-row" key={booking.id} onClick={event=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){setTeacherId(String(booking.data.teacherId));setSlotId(String(booking.data.slotId));setFeedback('')}}} to={`/v2/coffee?teacher=${encodeURIComponent(String(booking.data.teacherId))}&slot=${encodeURIComponent(String(booking.data.slotId))}`}><Coffee size={20}/><span><strong>{person?.name??uiText('老师')} · Coffee Chat</strong><small>{bookedSlot?`${new Date(bookedSlot.startAt).toLocaleString(uiLocale(),{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'})} · ${bookedSlot.location}`:uiText('时段信息暂不可用')}</small><small>{uiText(booking.data.proposedSlotId?'改期待确认':'已确认预约')}</small></span><ChevronRight size={16}/></Link>
    })}
    {live.data&&!bookings.length&&<Empty icon={Coffee} title={uiText('还没有已确认的交流预约')} description={uiText('预约老师后，记录会显示在这里。')}/>}
  </section>

  if (teacher) {
    const photo = teacher.avatar || teacherPhotos[teachers.findIndex((person) => person.id === teacher.id) % teacherPhotos.length]
    return <div className="v2-coffee-schedule" data-detail-navigation key={teacher.id}>
      <button type="button" className="v2-coffee-back" onClick={()=>sharedElementTransition(`coffee:${teacher.id}`,goBack,{reverse:true})}><ArrowLeft size={16}/> {uiText("返回老师列表")}</button>
      <div className="v2-coffee-teacher-detail">
        <img data-shared-target={`coffee:${teacher.id}`} src={photo} alt={teacher.avatar?`${teacher.name}${uiText("头像")}`:uiText("校园场景")}/>
        <div><span className="v2-eyebrow">COFFEE CHAT · {facultyOf(teacher.department)}</span><h3 ref={headingRef} tabIndex={-1}>{teacher.name}</h3>{(teacher.englishName || teacher.department) && <small>{[teacher.englishName,teacher.department].filter(Boolean).join(' · ')}</small>}<p>{teacher.bio}</p><div className="v2-coffee-topics">{teacher.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
      </div>
      <div className="v2-coffee-schedule-heading"><div><span className="v2-eyebrow">AVAILABLE TIMES</span><h3>{uiText("选择预约时间")}</h3><p>{uiText("按老师开放的起止时间交流；预约符合条件即成立。")}</p></div><CalendarDays size={22}/></div>
      {slots.length?<div className="v2-coffee-slot-list">{slots.map((item) => {
        const mine = state.coffeeBookings.includes(item.id)
        const cancelled = !!live.data?.entities.some(e => e.kind === 'coffeeBooking' && e.ownerId === live.data?.account.id && e.data.slotId === item.id && e.data.status === 'cancelled')
        const label = coffeeSlotStatus({mine,cancelled,closed:item.closed,enabled:teacher.enabled,started:Date.parse(item.startAt)<=Date.now(),full:occupied(state,item.id)>=item.capacity})
        const full = !mine && (!teacher.enabled || item.closed || Date.parse(item.startAt) <= Date.now() || occupied(state, item.id) >= item.capacity)
        return <button type="button" key={item.id} className={`v2-coffee-slot${slotId === item.id ? ' is-selected' : ''}${mine ? ' is-booked' : ''}`} aria-pressed={slotId === item.id} disabled={full} onClick={() => { setSlotId(item.id); setFeedback('') }}>
          <span className="v2-coffee-slot-date"><CalendarDays size={16}/>{slotDate(item.startAt)}</span>
          <strong><Clock3 size={16}/>{uiText(item.timeLabel)} – {slotEnd(item.endAt)}</strong>
          <span className="v2-coffee-slot-status">{mine?<><Check size={13}/> {uiText("已预约")}</>:uiText(label)}</span>
        </button>
      })}</div>:<Empty icon={Coffee} title={uiText("暂时没有可查看的时段")} description={uiText("稍后再来看看。")}/>}
      {!isBooked && <label className="v2-form">{uiText("想交流的问题")}<textarea maxLength={500} value={topic} onChange={event => setTopic(event.target.value)} placeholder={uiText("请填写交流主题或问题")}/></label>}<div className="v2-coffee-booking-panel"><span><MapPin size={16}/>{slot?.location ?? teacher.location}</span><small>{slot?`${slotDate(slot.startAt)} · ${uiText(slot.timeLabel)}`:uiText('请先选择一个时段')}</small><button type="button" className={`v2-button ${isBooked ? 'v2-button-secondary v2-coffee-cancel' : 'v2-button-primary'}`} aria-busy={live.busy||undefined} disabled={live.busy || !slot || (!isBooked && (!topic.trim() || !teacher.enabled || slot.closed || Date.parse(slot.startAt) <= Date.now() || occupied(state, slot.id) >= slot.capacity))} onClick={updateBooking}>{live.busy?uiText('保存中…'):isBooked?uiText('取消预约'):uiText('确认预约')} <ArrowRight size={15}/></button></div>
      {(live.error || feedback) && <p className={`v2-coffee-feedback continuity-feedback${live.error?' is-error':''}`} role={live.error?'alert':'status'}>{!live.error&&<ContinuityIcon icon={Check} active enter fill={false} size={17}/>}<span>{live.error || feedback}</span></p>}
      <p className="v2-form-note">{uiText("预约保存到会同里后台，实际到场情况不由预约状态推定。")}</p>
    </div>
  }

  return <div className="v2-coffee-directory">
    {live.error && <p role="alert">{uiText(live.error)}</p>}{!live.data && !live.error && <p role="status">{uiText("正在读取老师与时段…")}</p>}
    <div className="v2-directory-tools"><AnimatedSearchField value={query} onChange={setQuery} placeholder={uiText("搜索老师、学院或研究方向")}/><span>{filteredTeachers.length} {uiText("位老师")}</span></div>
    <div className="v2-filter-pills v2-directory-filters">{facultyOptions.map((option) => <button type="button" key={option} className={faculty === option?'is-active':''} onClick={() => setFaculty(option)}>{option}</button>)}</div>
    <div className="v2-teacher-grid coffee-discovery-grid">{filteredTeachers.map(person => <button type="button" key={person.id} className="v2-teacher-card coffee-discovery-card" aria-label={`${uiText('查看')}${person.name}${uiText('的详细信息')}`} onClick={event => sharedElementTransition(`coffee:${person.id}`,()=>openTeacher(person.id),{source:event.currentTarget.querySelector<HTMLElement>('[data-shared-media]')})}>
      <img data-shared-media={`coffee:${person.id}`} src={person.avatar || teacherPhotos[teachers.findIndex(item => item.id === person.id) % teacherPhotos.length]} alt={person.avatar?`${person.name}${uiText('头像')}`:uiText('校园场景')} loading="lazy" draggable={false}/>
      <span className="coffee-discovery-copy"><strong>{person.name}</strong><span className="coffee-discovery-department">{person.department || facultyOf(person.department)}</span>{person.topics.length>0&&<span className="coffee-discovery-topics">{person.topics.slice(0,2).join(' · ')}</span>}<span className="coffee-discovery-more">{uiText('查看详情')}<ChevronRight size={13}/></span></span>
    </button>)}</div>
    {live.data && !filteredTeachers.length && <Empty icon={Coffee} title={uiText("没有匹配的老师")} description={uiText("换个学院或搜索词试试。")}/>}
  </div>
}
