import { ArrowRight, CalendarDays, Coffee, Network, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { coffeeSlots, events, organizations, teachers } from '../data/mockData'
import { studentName, type V2State } from './model'

type Connection = { id: string; label: string; kind: string; detail: string; path: string; tone: string }
const points = [[18, 24], [81, 23], [17, 75], [81, 75], [50, 12], [51, 87]]

export function V2RelationshipGraph({ state }: { state: V2State }) {
  const nodes: Connection[] = [
    ...Object.keys(state.eventRegistrations).map((id) => events.find((event) => event.id === id)).filter((item) => item !== undefined).slice(0, 2).map((event) => ({ id: `event-${event.id}`, label: event.title, kind: '活动', detail: '已报名的校园活动', path: `/v2/activities/${event.id}`, tone: 'blue' })),
    ...state.rooms.filter((room) => room.owner === studentName || room.members.includes(studentName)).slice(0, 2).map((room) => ({ id: `room-${room.id}`, label: room.title, kind: '组队', detail: `${room.members.length} 位成员 · ${room.time}`, path: '/v2/partners/teams', tone: 'violet' })),
    ...state.joinedOrganizations.map((id) => organizations.find((org) => org.id === id)).filter((item) => item !== undefined).slice(0, 2).map((org) => ({ id: `org-${org.id}`, label: org.name, kind: '组织', detail: `${org.memberCount} 位成员`, path: '/v2/campus', tone: 'green' })),
    ...state.coffeeBookings.map((id) => coffeeSlots.find((slot) => slot.id === id)).filter((item) => item !== undefined).slice(0, 1).map((slot) => ({ id: `coffee-${slot.id}`, label: `与${teachers.find((teacher) => teacher.id === slot.teacherId)?.name ?? '老师'}交流`, kind: 'Coffee Chat', detail: `${slot.dateLabel} · ${slot.timeLabel}`, path: '/v2/me?tab=events', tone: 'orange' })),
  ].slice(0, 6)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  return <section className="v2-panel v2-relationship-panel" aria-labelledby="v2-relationship-title">
    <div className="v2-relationship-heading"><div><span className="v2-eyebrow">MY CONNECTIONS</span><h3 id="v2-relationship-title">我的校园关系网</h3><p>每一次报名、加入队伍与组织都会成为一条连接。</p></div><Network size={23}/></div>
    {nodes.length ? <div className="v2-relationship-layout"><div className="v2-relationship-stage" aria-label="校园关系图">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{nodes.map((node, index) => <line key={node.id} x1="50" y1="50" x2={points[index][0]} y2={points[index][1]}/>)}</svg>
      <div className="v2-relationship-self"><strong>晴</strong><small>我</small></div>
      {nodes.map((node, index) => <button type="button" key={node.id} className={`v2-relationship-node tone-${node.tone}${selected?.id === node.id ? ' is-active' : ''}`} style={{ left: `${points[index][0]}%`, top: `${points[index][1]}%`, animationDelay: `${index * 75}ms` }} onClick={() => setSelectedId(node.id)} aria-pressed={selected?.id === node.id}><span>{node.kind}</span><strong>{node.label}</strong></button>)}
    </div><aside className="v2-relationship-detail"><span className="v2-eyebrow">当前连接</span><strong>{selected?.label}</strong><small>{selected?.kind} · {selected?.detail}</small><Link to={selected?.path ?? '/v2/campus'}>查看来源 <ArrowRight size={15}/></Link><div className="v2-relationship-summary"><span><CalendarDays size={16}/>{Object.keys(state.eventRegistrations).length} 个活动</span><span><UsersRound size={16}/>{state.rooms.filter((room) => room.owner === studentName || room.members.includes(studentName)).length} 个队伍</span><span><Coffee size={16}/>{state.joinedOrganizations.length} 个组织</span></div></aside></div> : <div className="v2-relationship-empty"><Network size={28}/><strong>从一次参与开始连接</strong><p>报名活动或加入组织后，关系会在这里形成。</p><Link to="/v2/activities">发现活动 <ArrowRight size={15}/></Link></div>}
  </section>
}
