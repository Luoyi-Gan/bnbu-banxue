import { ArrowRight, Check, ChevronRight, Clock3, MapPin, Plus, Search, Star, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { makeId, roomTypeName, studentName, timeLabel, todayLabel, type Room } from './model'
import { Drawer, Empty, Modal, PageHeading, SectionHeading } from './ui'
import { useV2 } from './useV2'

const reviewTags = ['守时可靠', '沟通顺畅', '合作愉快', '认真负责', '愿意再组队']

export function V2Teams() {
  const { state, setState } = useV2()
  const [tab, setTab] = useState<'ongoing' | 'finished'>('ongoing')
  const [selected, setSelected] = useState<string | null>(null)
  const [ending, setEnding] = useState<string | null>(null)
  const [reviewRoom, setReviewRoom] = useState<string | null>(null)
  const [reviewMember, setReviewMember] = useState('')
  const [stars, setStars] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [reviewNote, setReviewNote] = useState('')
  const mine = state.rooms.filter((room) => room.owner === studentName || room.members.includes(studentName))
  const shown = mine.filter((room) => tab === 'ongoing' ? room.status === 'open' : room.status === 'finished')
  const current = state.rooms.find((room) => room.id === selected)
  const endingRoom = state.rooms.find((room) => room.id === ending)
  const reviewing = state.rooms.find((room) => room.id === reviewRoom)
  const reviewed = (roomId: string, person: string) => state.roomReviews.some((item) => item.roomId === roomId && item.from === studentName && item.to === person)
  const remaining = (room: Room) => room.members.filter((person) => person !== studentName && !reviewed(room.id, person))
  const startReview = (room: Room) => { setSelected(null); setReviewRoom(room.id); setReviewMember(remaining(room)[0] ?? ''); setStars(0); setTags([]); setReviewNote('') }
  const decide = (room: Room, name: string, approve: boolean) => setState((value) => {
    const existing = value.conversations.find((item) => item.title === room.title)
    const systemMessage = { id: makeId(), from: '系统', body: `${name}已加入队伍，可以开始交流。`, time: timeLabel() }
    const conversations = existing
      ? value.conversations.map((item) => item.id === existing.id ? { ...item, messages: [...item.messages, systemMessage], unread: item.unread + 1 } : item)
      : [{ id: makeId(), title: room.title, messages: [systemMessage], unread: 1 }, ...value.conversations]
    return { ...value, rooms: value.rooms.map((item) => item.id === room.id ? { ...item, requests: item.requests.filter((person) => person !== name), members: approve && !item.members.includes(name) ? [...item.members, name] : item.members } : item), applications: value.applications.map((item) => item.roomId === room.id && name === studentName ? { ...item, status: approve ? 'approved' : 'rejected' } : item), conversations: approve ? conversations : value.conversations, notifications: [{ id: makeId(), title: approve ? '组队申请已通过' : '组队申请未通过', body: `${name} · ${room.title}`, path: '/v2/partners/teams', date: '刚刚', read: false }, ...value.notifications] }
  })
  const finish = (room: Room) => {
    setState((value) => ({ ...value, rooms: value.rooms.map((item) => item.id === room.id ? { ...item, status: 'finished', requests: [] } : item), notifications: [{ id: makeId(), title: '组队已结束，可以评价搭子', body: room.title, path: '/v2/partners/teams', date: '刚刚', read: false }, ...value.notifications] }))
    setEnding(null); setTab('finished'); startReview(room)
  }
  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reviewing || reviewing.status !== 'finished' || !reviewing.members.includes(studentName) || !reviewing.members.includes(reviewMember) || reviewMember === studentName || reviewed(reviewing.id, reviewMember) || stars < 1) return
    const roomId = reviewing.id, person = reviewMember
    setState((value) => ({ ...value, roomReviews: value.roomReviews.some((item) => item.roomId === roomId && item.from === studentName && item.to === person) ? value.roomReviews : [{ id: makeId(), roomId, from: studentName, to: person, stars, tags, comment: reviewNote.trim(), date: todayLabel() }, ...value.roomReviews] }))
    const next = remaining(reviewing).find((item) => item !== person)
    setReviewMember(next ?? ''); setStars(0); setTags([]); setReviewNote('')
  }
  return <div className="v2-page"><PageHeading eyebrow="MY TEAMS" title="我的组队" description="管理队伍、处理申请，并在完成后评价同行的伙伴。" action={<Link className="v2-button v2-button-primary" to="/v2/partners"><Plus size={17}/> 发起新队伍</Link>}/>
    <div className="v2-tabs"><button type="button" className={tab === 'ongoing' ? 'is-active' : ''} onClick={() => setTab('ongoing')}>进行中 ({mine.filter((room) => room.status === 'open').length})</button><button type="button" className={tab === 'finished' ? 'is-active' : ''} onClick={() => setTab('finished')}>已完成 ({mine.filter((room) => room.status === 'finished').length})</button></div>
    <section className="v2-panel v2-list-panel"><SectionHeading title={tab === 'ongoing' ? '正在进行的队伍' : '已完成的队伍'}/>{shown.length ? <div className="v2-row-list">{shown.map((room) => <button type="button" className="v2-team-row" key={room.id} onClick={() => setSelected(room.id)}><span className={`v2-room-type v2-room-${room.type}`}>{roomTypeName[room.type]}</span><span><strong>{room.title}</strong><small>{room.time} · {room.place} · {room.members.length}/{room.capacity} 人</small></span>{room.owner === studentName && room.requests.length > 0 && room.status === 'open' && <b>{room.requests.length} 待处理</b>}{room.status === 'finished' && remaining(room).length > 0 && <b>待评价 {remaining(room).length} 人</b>}<ChevronRight size={17}/></button>)}</div> : <Empty icon={UsersRound} title={tab === 'ongoing' ? '暂无进行中的队伍' : '暂无已完成的队伍'} description="可以去搭子大厅发现新的计划。"/>}</section>
    <section className="v2-panel v2-list-panel"><SectionHeading title="我的申请" detail="申请状态会保留在这里"/>{state.applications.length ? state.applications.map((application) => { const room = state.rooms.find((item) => item.id === application.roomId); return room && <div className="v2-team-row" key={application.roomId}><span className="v2-room-type">申请</span><span><strong>{room.title}</strong><small>{room.owner} · {room.time}</small></span><b className={`v2-status-chip ${application.status === 'approved' ? 'is-success' : 'is-pending'}`}>{application.status === 'pending' ? '待处理' : application.status === 'approved' ? '已加入' : '未通过'}</b></div> }) : <Empty icon={Search} title="还没有申请记录"/>}</section>
    {current && <Drawer title={current.title} eyebrow={current.owner === studentName ? '我发起的队伍' : '我加入的队伍'} onClose={() => setSelected(null)}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.members.length}/{current.capacity} 人</span></div><SectionHeading title="队伍成员"/><div className="v2-member-list">{current.members.map((name) => <span key={name} className="v2-member-chip">{name.slice(0, 1)} · {name}</span>)}</div>{current.owner === studentName && current.requests.length > 0 && current.status === 'open' && <section className="v2-requests"><SectionHeading title="待处理申请" detail={`${current.requests.length} 人等待回复`}/>{current.requests.map((name) => <div key={name} className="v2-request-row"><span className="v2-avatar">{name.slice(0, 1)}</span><strong>{name}</strong><button type="button" onClick={() => decide(current, name, false)}>婉拒</button><button type="button" className="is-approve" onClick={() => decide(current, name, true)}>同意</button></div>)}</section>}
      {current.status === 'finished' && <div className="v2-review-summary"><strong>组队体验评价</strong><span>{state.roomReviews.filter((item) => item.roomId === current.id).length < 3 ? '评价不足 · 3 条有效评价后展示平均分' : `${(state.roomReviews.filter((item) => item.roomId === current.id).reduce((sum, item) => sum + item.stars, 0) / state.roomReviews.filter((item) => item.roomId === current.id).length).toFixed(1)} / 5 分`}</span><small>已评价 {current.members.filter((name) => name !== studentName && reviewed(current.id, name)).length} / {current.members.length - 1} 位搭子</small></div>}
      <div className="v2-detail-actions">{current.status === 'open' && <Link to="/v2/messages" className="v2-button v2-button-primary">查看队伍消息 <ArrowRight size={16}/></Link>}{current.owner === studentName && current.status === 'open' && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setEnding(current.id); setSelected(null) }}>结束组队</button>}{current.status === 'finished' && remaining(current).length > 0 && <button type="button" className="v2-button v2-button-primary" onClick={() => startReview(current)}><Star size={16}/> 评价搭子</button>}</div></Drawer>}
    {endingRoom && <Modal title="结束组队" onClose={() => setEnding(null)}><div className="v2-team-finish"><span className="v2-team-finish-icon"><Check size={25}/></span><h3>{endingRoom.title}</h3><p>结束后队伍移入“已完成”，待处理申请将关闭，已加入成员可以互相评价。这个演示操作无法撤回。</p><div><button type="button" className="v2-button v2-button-secondary" onClick={() => setEnding(null)}>继续组队</button><button type="button" className="v2-button v2-button-primary" onClick={() => finish(endingRoom)}>确认结束并评价</button></div></div></Modal>}
    {reviewing && <Modal title="评价组队伙伴" onClose={() => setReviewRoom(null)}><div className="v2-team-review"><p className="v2-form-note">{reviewing.title} · 只有已完成队伍的成员可以互评，每位搭子只评价一次。</p>{remaining(reviewing).length ? <form className="v2-form" onSubmit={submitReview}><label>评价对象<select value={reviewMember} onChange={(event) => { setReviewMember(event.target.value); setStars(0); setTags([]); setReviewNote('') }} required>{remaining(reviewing).map((name) => <option key={name} value={name}>{name}</option>)}</select></label><div className="v2-review-stars"><strong>本次体验</strong><div role="group" aria-label="星级评价">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} className={stars >= value ? 'is-active' : ''} aria-label={`${value} 星`} aria-pressed={stars === value} onClick={() => setStars(value)}><Star size={28} fill={stars >= value ? 'currentColor' : 'none'}/></button>)}</div><small>{stars ? `${stars} / 5 星` : '请选择 1 至 5 星'}</small></div><div className="v2-review-tags"><strong>印象标签（可选）</strong><div>{reviewTags.map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? 'is-active' : ''} aria-pressed={tags.includes(tag)} onClick={() => setTags((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag])}>{tag}</button>)}</div></div><label>想说的话（可选）<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} maxLength={300} placeholder="分享这次合作的真实感受"/></label><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setReviewRoom(null)}>稍后评价</button><button type="submit" className="v2-button v2-button-primary" disabled={!stars}>提交评价</button></div></form> : <div className="v2-review-complete"><Check size={28}/><strong>本次评价已完成</strong><p>你已评价这支队伍中的所有其他成员。</p><button type="button" className="v2-button v2-button-primary" onClick={() => setReviewRoom(null)}>完成</button></div>}</div></Modal>}
  </div>
}
