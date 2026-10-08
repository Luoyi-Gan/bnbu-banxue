import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Coffee, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { coffeeSlots, teachers } from '../data/mockData'
import campusServicesPhoto from '../assets/campus/campus-services.jpg'
import campusHomePhoto from '../assets/campus/home-background.jpg'
import campusEveningPhoto from '../assets/campus/evening-campus.jpg'
import campusNightPhoto from '../assets/campus/night-walkway.jpg'
import { AnimatedSearchField } from './AnimatedSearchField'
import { makeId } from './model'
import { Empty } from './ui'
import { useV2 } from './useV2'

const teacherPhotos = [campusServicesPhoto, campusHomePhoto, campusEveningPhoto, campusNightPhoto]
const facultyOptions = ['全部', 'FST', 'FBM', 'FHSS', 'SCC', '创新创业']
const facultyOf = (department: string) => department === '理工科技学院' ? 'FST' : department === '工商管理学院' ? 'FBM' : department === '人文社科学院' ? 'FHSS' : department === '通识教育学院' ? 'SCC' : '创新创业'
const slotDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(value))
const slotEnd = (value: string) => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function V2CoffeeChat() {
  const { state, setState } = useV2()
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
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
    setFeedback('')
  }
  const updateBooking = () => {
    if (!teacher || !slot || (slot.status !== 'available' && !isBooked)) return
    const cancelling = isBooked
    setState((value) => ({
      ...value,
      coffeeBookings: cancelling ? value.coffeeBookings.filter((id) => id !== slot.id) : value.coffeeBookings.includes(slot.id) ? value.coffeeBookings : [...value.coffeeBookings, slot.id],
      notifications: [{ id: makeId(), title: cancelling ? 'Coffee Chat 预约已取消' : 'Coffee Chat 预约成功', body: `${teacher.name} · ${slotDate(slot.startAt)} ${slot.timeLabel}`, path: '/v2/me?tab=events', read: false, date: '刚刚' }, ...value.notifications],
    }))
    setFeedback(cancelling ? '预约已取消，你可以重新选择时间。' : '预约成功，已加入“我的接下来”。')
  }

  if (teacher) {
    const photo = teacherPhotos[teachers.findIndex((person) => person.id === teacher.id) % teacherPhotos.length]
    return <div className="v2-coffee-schedule" key={teacher.id}>
      <button type="button" className="v2-coffee-back" onClick={goBack}><ArrowLeft size={16}/> 返回老师列表</button>
      <div className="v2-coffee-teacher-detail">
        <img src={photo} alt="校园场景"/>
        <div><span className="v2-eyebrow">COFFEE CHAT · {facultyOf(teacher.department)}</span><h3 ref={headingRef} tabIndex={-1}>{teacher.name}</h3><small>{teacher.englishName} · {teacher.department}</small><p>{teacher.bio}</p><div className="v2-coffee-topics">{teacher.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
      </div>
      <div className="v2-coffee-schedule-heading"><div><span className="v2-eyebrow">AVAILABLE TIMES</span><h3>选择预约时间</h3><p>每次交流 30 分钟；选择时段后确认预约。</p></div><CalendarDays size={22}/></div>
      {slots.length ? <div className="v2-coffee-slot-list">{slots.map((item) => {
        const mine = state.coffeeBookings.includes(item.id)
        const full = item.status !== 'available' && !mine
        return <button type="button" key={item.id} className={`v2-coffee-slot${slotId === item.id ? ' is-selected' : ''}${mine ? ' is-booked' : ''}`} aria-pressed={slotId === item.id} disabled={full} onClick={() => { setSlotId(item.id); setFeedback('') }}>
          <span className="v2-coffee-slot-date"><CalendarDays size={16}/>{slotDate(item.startAt)}</span>
          <strong><Clock3 size={16}/>{item.timeLabel} – {slotEnd(item.endAt)}</strong>
          <span className="v2-coffee-slot-status">{mine ? <><Check size={13}/> 已预约</> : full ? '已约满' : '可预约'}</span>
        </button>
      })}</div> : <Empty icon={Coffee} title="暂时没有可查看的时段" description="稍后再来看看。"/>}
      <div className="v2-coffee-booking-panel"><span><MapPin size={16}/>{teacher.location}</span><small>{slot ? `${slotDate(slot.startAt)} · ${slot.timeLabel}` : '请先选择一个时段'}</small><button type="button" className={`v2-button ${isBooked ? 'v2-button-secondary v2-coffee-cancel' : 'v2-button-primary'}`} disabled={!slot || (slot.status !== 'available' && !isBooked)} onClick={updateBooking}>{isBooked ? '取消预约' : '确认预约'} <ArrowRight size={15}/></button></div>
      {feedback && <p className="v2-coffee-feedback" role="status">{feedback}</p>}
      <p className="v2-form-note">此处为本地演示，预约状态保存在当前浏览器。</p>
    </div>
  }

  return <div className="v2-coffee-directory">
    <p className="v2-detail-lead">选择老师与时段，让一次谈话更有准备。</p>
    <div className="v2-teacher-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(6,28,68,.92),rgba(6,46,101,.18)),url(${campusServicesPhoto})` }}><span>COFFEE CHAT</span><strong>和老师聊聊，找到新的思路。</strong><small>从学院、研究兴趣和可预约时间开始探索。</small></div>
    <div className="v2-directory-tools"><AnimatedSearchField value={query} onChange={setQuery} placeholder="搜索老师、学院或研究方向"/><span>{filteredTeachers.length} 位老师</span></div>
    <div className="v2-filter-pills v2-directory-filters">{facultyOptions.map((option) => <button type="button" key={option} className={faculty === option ? 'is-active' : ''} onClick={() => setFaculty(option)}>{option}</button>)}</div>
    <div className="v2-teacher-grid v2-filtered-list" key={`${query}|${faculty}`}>{filteredTeachers.map((person) => <button type="button" key={person.id} className="v2-teacher-card" onClick={() => openTeacher(person.id)}><img src={teacherPhotos[teachers.findIndex((item) => item.id === person.id) % teacherPhotos.length]} alt=""/><span className="v2-teacher-row-copy"><span className="v2-avatar" style={{ background: person.color }}>{person.name.slice(0, 1)}</span><strong>{person.name}<small>{person.englishName}</small></strong><em>{facultyOf(person.department)} · {person.department}</em><span className="v2-teacher-topics">{person.topics.slice(0, 2).map((topic) => <i key={topic}>{topic}</i>)}</span></span><ChevronRight size={19}/></button>)}</div>
    {!filteredTeachers.length && <Empty icon={Coffee} title="没有匹配的老师" description="换个学院或搜索词试试。"/>}
  </div>
}
