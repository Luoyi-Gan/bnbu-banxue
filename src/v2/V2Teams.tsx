import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, MapPin, Plus, Search, Star, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { roomTypeName, type Room, type RoomReview } from '../../shared/v2/model'
import { Drawer, Empty, Modal, PageHeading, SectionHeading } from './ui'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { roomReviewAverage } from './roomReviewPolicy'
import { DisplayAvatar } from './DisplayAvatar'
import { displayPerson } from './displayPerson'

const reviewTags = ['守时可靠', '沟通顺畅', '合作愉快', '认真负责', '愿意再组队']

export function V2Teams() {
  const live = useWorkspaceBackend()
  const studentName = live.data?.account.id ?? ''
  const personName = (id: string) => displayPerson(live.data, id).name
  const entities = live.data?.entities ?? []
  const applications = entities.filter(e => e.kind === 'roomApplication')
  const rooms: Room[] = entities.filter(e => e.kind === 'room').map(e => ({id: e.id, type: e.data.type as Room['type'], title: String(e.data.title), body: String(e.data.body), time: String(e.data.time), place: String(e.data.place), capacity: Number(e.data.capacity), owner: e.ownerId ?? '', members: e.data.members as string[], status: e.data.status as Room['status'], requests: applications.filter(a => a.data.roomId === e.id && a.data.status === 'pending').map(a => a.ownerId!)}))
  const roomReviews: RoomReview[] = entities.filter(e => e.kind === 'roomReview').map(e => ({id: e.id, roomId: String(e.data.roomId), from: e.ownerId!, to: String(e.data.targetId), stars: Number(e.data.stars), tags: e.data.tags as string[], comment: String(e.data.comment), date: e.createdAt}))
  const state = {rooms, roomReviews, applications: applications.filter(a => a.ownerId === studentName).map(a => ({id: a.id, roomId: String(a.data.roomId), status: String(a.data.status), roomSummary: a.data.roomSummary as {title: string; status: string; visibility: string}}))}
  const [tab, setTab] = useState<'ongoing' | 'finished'>('ongoing')
  const [params, setParams] = useSearchParams()
  const selected = params.get('item')
  const setSelected = (id: string | null) => { const next = new URLSearchParams(params); if (id) next.set('item', id); else next.delete('item'); setParams(next) }
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
  const decide = async (room: Room, name: string, approve: boolean) => {
    const application = applications.find(a => a.data.roomId === room.id && a.ownerId === name && a.data.status === 'pending')
    if (application) await live.mutate('room.decide', {id: application.id, accept: approve})
  }
  const finish = async (room: Room) => {
    if (await live.mutate('room.finish', {id: room.id})) {setEnding(null); setTab('finished'); startReview(room)}
  }
  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reviewing || !reviewMember || !stars) return
    const person = reviewMember
    if (!await live.mutate('room.review', {id: reviewing.id, targetId: person, stars, tags, comment: reviewNote.trim()})) return
    const next = remaining(reviewing).find(item => item !== person)
    setReviewMember(next ?? ''); setStars(0); setTags([]); setReviewNote('')
  }
  return <div className="v2-page"><Link to="/v2/partners" className="v2-button v2-button-secondary" style={{ marginBottom: 16 }}><ArrowLeft size={17}/> 返回找搭子</Link><PageHeading eyebrow="MY TEAMS" title="我的组队" description="管理队伍、处理申请，并在完成后评价同行的伙伴。" action={<Link className="v2-button v2-button-primary" to="/v2/partners"><Plus size={17}/> 发起新队伍</Link>}/>
    {live.error && <p role="alert" className="v2-info-box">{live.error}</p>}{!live.data && !live.error && <p role="status">正在读取本人队伍…</p>}
    <div className="v2-tabs"><button type="button" className={tab === 'ongoing' ? 'is-active' : ''} onClick={() => setTab('ongoing')}>进行中 ({mine.filter((room) => room.status === 'open').length})</button><button type="button" className={tab === 'finished' ? 'is-active' : ''} onClick={() => setTab('finished')}>已完成 ({mine.filter((room) => room.status === 'finished').length})</button></div>
    <section className="v2-panel v2-list-panel"><SectionHeading title={tab === 'ongoing' ? '正在进行的队伍' : '已完成的队伍'}/>{shown.length ? <div className="v2-row-list">{shown.map((room) => <button type="button" className="v2-team-row" key={room.id} onClick={() => setSelected(room.id)}><span className={`v2-room-type v2-room-${room.type}`}>{roomTypeName[room.type]}</span><span><strong>{room.title}</strong><small>{room.time} · {room.place} · {room.members.length}/{room.capacity} 人</small></span>{room.owner === studentName && room.requests.length > 0 && room.status === 'open' && <b>{room.requests.length} 待处理</b>}{room.status === 'finished' && remaining(room).length > 0 && <b>待评价 {remaining(room).length} 人</b>}<ChevronRight size={17}/></button>)}</div> : <Empty icon={UsersRound} title={tab === 'ongoing' ? '暂无进行中的队伍' : '暂无已完成的队伍'} description="可以去搭子大厅发现新的计划。"/>}</section>
    <section className="v2-panel v2-list-panel"><SectionHeading title="我的申请" detail="申请状态会保留在这里"/>{state.applications.length ? state.applications.map((application) => { const room = state.rooms.find((item) => item.id === application.roomId); return <div className="v2-team-row" key={application.id}><span className="v2-room-type">申请</span><span><strong>{room?.title ?? application.roomSummary?.title ?? '队伍记录'}</strong><small>{application.roomSummary?.visibility === 'hidden' ? '队伍已下架 · 原申请结果保留' : application.roomSummary?.status === 'finished' ? '队伍已结束 · 原申请结果保留' : room ? `${personName(room.owner)} · ${room.time}` : '队伍信息暂不可用'}</small></span><b className={`v2-status-chip ${application.status === 'approved' ? 'is-success' : 'is-pending'}`}>{application.status === 'pending' ? '待处理' : application.status === 'approved' ? '已加入' : '未通过'}</b></div> }) : <Empty icon={Search} title="还没有申请记录"/>}</section>
    {current && <Drawer title={current.title} eyebrow={current.owner === studentName ? '我发起的队伍' : '我加入的队伍'} onClose={() => setSelected(null)}><p className="v2-detail-lead">{current.body}</p><div className="v2-fact-list"><span><Clock3 size={17}/>{current.time}</span><span><MapPin size={17}/>{current.place}</span><span><UsersRound size={17}/>{current.members.length}/{current.capacity} 人</span></div><SectionHeading title="队伍成员"/><div className="v2-member-list">{current.members.map((id) => <span key={id} className="v2-member-chip"><DisplayAvatar className="v2-member-avatar" name={personName(id)} avatar={displayPerson(live.data, id).avatar} personId={id}/> · {personName(id)}</span>)}</div>{current.owner === studentName && current.requests.length > 0 && current.status === 'open' && <section className="v2-requests"><SectionHeading title="待处理申请" detail={`${current.requests.length} 人等待回复`}/>{current.requests.map((id) => <div key={id} className="v2-request-row"><DisplayAvatar className="v2-avatar" name={personName(id)} avatar={displayPerson(live.data, id).avatar} personId={id}/><strong>{personName(id)}</strong><button type="button" onClick={() => decide(current, id, false)}>婉拒</button><button type="button" className="is-approve" onClick={() => decide(current, id, true)}>同意</button></div>)}</section>}
      {current.status === 'finished' && <div className="v2-review-summary"><strong>组队体验评价</strong><span>{roomReviewAverage(state.roomReviews, current.id) === null ? '评价不足 · 3 条有效评价后展示平均分' : `${roomReviewAverage(state.roomReviews, current.id)!.toFixed(1)} / 5 分`}</span><small>已评价 {current.members.filter((name) => name !== studentName && reviewed(current.id, name)).length} / {current.members.length - 1} 位搭子</small></div>}
      <div className="v2-detail-actions">{current.status === 'open' && <Link to={`/v2/messages?conversation=${encodeURIComponent(current.id)}`} className="v2-button v2-button-primary">查看队伍消息 <ArrowRight size={16}/></Link>}{current.owner === studentName && current.status === 'open' && <button type="button" className="v2-button v2-button-secondary" onClick={() => { setEnding(current.id); setSelected(null) }}>结束组队</button>}{current.status === 'finished' && remaining(current).length > 0 && <button type="button" className="v2-button v2-button-primary" onClick={() => startReview(current)}><Star size={16}/> 评价搭子</button>}</div></Drawer>}
    {endingRoom && <Modal title="结束组队" onClose={() => setEnding(null)}><div className="v2-team-finish"><span className="v2-team-finish-icon"><Check size={25}/></span><h3>{endingRoom.title}</h3><p>结束后队伍移入“已完成”，保留申请与成员记录，已加入成员可以互相评价。结束后无法继续发送队伍消息。</p><div><button type="button" className="v2-button v2-button-secondary" onClick={() => setEnding(null)}>继续组队</button><button type="button" className="v2-button v2-button-primary" onClick={() => finish(endingRoom)}>确认结束并评价</button></div></div></Modal>}
    {reviewing && <Modal title="评价组队伙伴" onClose={() => setReviewRoom(null)}><div className="v2-team-review"><p className="v2-form-note">{reviewing.title} · 只有已完成队伍的成员可以互评，每位搭子只评价一次。</p>{remaining(reviewing).length ? <form className="v2-form" onSubmit={submitReview}><label>评价对象<select value={reviewMember} onChange={(event) => { setReviewMember(event.target.value); setStars(0); setTags([]); setReviewNote('') }} required>{remaining(reviewing).map((name) => <option key={name} value={name}>{personName(name)}</option>)}</select></label><div className="v2-review-stars"><strong>本次体验</strong><div role="group" aria-label="星级评价">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} className={stars >= value ? 'is-active' : ''} aria-label={`${value} 星`} aria-pressed={stars === value} onClick={() => setStars(value)}><Star size={28} fill={stars >= value ? 'currentColor' : 'none'}/></button>)}</div><small>{stars ? `${stars} / 5 星` : '请选择 1 至 5 星'}</small></div><div className="v2-review-tags"><strong>印象标签（可选）</strong><div>{reviewTags.map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? 'is-active' : ''} aria-pressed={tags.includes(tag)} onClick={() => setTags((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag])}>{tag}</button>)}</div></div><label>想说的话（可选）<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} maxLength={300} placeholder="分享这次合作的真实感受"/></label><div className="v2-form-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => setReviewRoom(null)}>稍后评价</button><button type="submit" className="v2-button v2-button-primary" disabled={!stars}>提交评价</button></div></form> : <div className="v2-review-complete"><Check size={28}/><strong>本次评价已完成</strong><p>你已评价这支队伍中的所有其他成员。</p><button type="button" className="v2-button v2-button-primary" onClick={() => setReviewRoom(null)}>完成</button></div>}</div></Modal>}
  </div>
}
