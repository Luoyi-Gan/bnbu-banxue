import { AdminAlumniReview } from './alumniWorkflow'
import { AdminStudentIdentityQueue } from './AdminStudentIdentityQueue'
import { ArrowRight, Check, ChevronRight, CircleAlert, FileCheck2, Newspaper, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type Verification } from '../../shared/v2/model'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { api } from '../live/api'
import { Drawer, Empty, PageHeading, SectionHeading } from './ui'

const kindName = { student: '学生', club: '学生社团成员', official: '官方机构' }
const statusName = { pending: '待审核', approved: '已通过', rejected: '已驳回' }

export function AdminDashboard() {
  const live = useWorkspaceBackend()
  const [pendingContentCount,setPendingContentCount]=useState<number|null>(null)
  const [pendingIdentityCount,setPendingIdentityCount]=useState<number|null>(null)
  useEffect(()=>{
    if(!live.data?.account.roles.some(role=>role==='reviewer'||role==='superadmin')) return
    void api<{total:number}>('/api/admin/community/moderation?status=pending&page=1').then(result=>setPendingContentCount(result.total)).catch(()=>setPendingContentCount(null))
    void api<{total:number}>('/api/identity/requests?status=pending&page=1').then(result=>setPendingIdentityCount(result.total)).catch(()=>setPendingIdentityCount(null))
  },[live.data?.account.id,live.data?.account.roles])
  const entities = live.data?.entities ?? []
  const name = (id: string | null) => live.data?.people.find(person => person.id === id)?.name ?? '用户'
  const state = {
    posts: entities.filter(item => item.kind === 'post').map(item => ({id: item.id, title: String(item.data.title), author: name(item.ownerId), status: item.data.status, comments: entities.filter(comment => comment.kind === 'comment' && comment.data.postId === item.id).map(comment => ({id: comment.id, body: String(comment.data.body), status: comment.data.status}))})),
    verifications: entities.filter(item => item.kind === 'certification').map(item => ({id: item.id, kind: item.data.kind as Verification['kind'], organization: String(item.data.organization), name: name(item.ownerId), status: item.data.status})),
    mailActivities: entities.filter(item => item.kind === 'mail' && !item.data.resolvedAs).map(item => item.data.record as {status: string}),
  }
  const pendingPosts = state.posts.filter((post) => post.status === 'pending')
  const pendingComments = state.posts.flatMap((post) => post.comments.filter((comment) => comment.status === 'pending').map((comment) => ({ ...comment, postTitle: post.title })))
  const pendingVerifications = state.verifications.filter((item) => item.status === 'pending')
  const metrics = [
    { label: '邮件转活动', value: (state.mailActivities ?? []).filter(m => m.status === 'pending').length, detail: '待核实邮件 · 自动发布与事后修正', path: '/v2/admin/mail-activities', icon: Newspaper },
    { label: '内容待审', value: pendingContentCount ?? pendingPosts.length + pendingComments.length, detail: '帖子与评论待审核', path: '/v2/admin/moderation', icon: FileCheck2 },
    { label: '认证待审', value: (pendingIdentityCount??0) + pendingVerifications.length + (live.data?.alumni.profiles.filter(p => p.status === 'pending').length ?? 0), detail: '学生 / 社团成员 / 官方 / 校友', path: '/v2/admin/verifications', icon: ShieldCheck },
  ]
  if (!live.data) return <div className="v2-page"><PageHeading eyebrow="OPERATIONS OVERVIEW" title="运营工作台" description="读取当前账号可见的待办。"/><p role="status">{live.error || '正在读取…'}</p></div>
  return <div className="v2-page"><PageHeading eyebrow="OPERATIONS OVERVIEW" title="运营工作台" description="按当前账号权限显示共享后端中的待办。"/><div className="v2-admin-metrics">{metrics.map(({ icon: Icon, ...metric }, index) => <Link to={metric.path} key={metric.label} style={{ animationDelay: `${index * 65}ms` }}><span><Icon size={20}/>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small><ArrowRight size={16}/></Link>)}</div><div className="v2-admin-grid"><section className="v2-panel v2-list-panel"><SectionHeading title="内容审核待办" detail="保留历史待审内容，并处理已公开内容" action={<Link to="/v2/admin/moderation">查看全部 <ArrowRight size={15}/></Link>}/>{pendingPosts.slice(0, 3).map((post) => <Link to="/v2/admin/moderation" className="v2-admin-queue-row" key={post.id}><span className="v2-queue-icon"><Newspaper size={18}/></span><span><strong>{post.title}</strong><small>帖子 · {post.author}</small></span><span className="v2-status-chip is-pending">待审</span><ChevronRight size={16}/></Link>)}{pendingComments.slice(0, 2).map((comment) => <Link to="/v2/admin/moderation" className="v2-admin-queue-row" key={comment.id}><span className="v2-queue-icon"><CircleAlert size={18}/></span><span><strong>{comment.body}</strong><small>评论 · {comment.postTitle}</small></span><span className="v2-status-chip is-pending">待审</span><ChevronRight size={16}/></Link>)}{!pendingPosts.length && !pendingComments.length && <Empty icon={Check} title="内容队列已处理完"/>}</section><section className="v2-panel v2-list-panel"><SectionHeading title="认证审核待办" detail="核对申请类型与说明" action={<Link to="/v2/admin/verifications">查看全部 <ArrowRight size={15}/></Link>}/>{pendingVerifications.slice(0, 4).map((item) => <Link to="/v2/admin/verifications" className="v2-admin-queue-row" key={item.id}><span className="v2-queue-icon"><ShieldCheck size={18}/></span><span><strong>{item.organization}</strong><small>{kindName[item.kind]} · {item.name}</small></span><ChevronRight size={16}/></Link>)}{!pendingVerifications.length && <Empty icon={Check} title="认证队列已处理完"/>}</section></div></div>
}

export function AdminVerifications() {
  const live = useWorkspaceBackend()
  const verifications: Verification[] = (live.data?.entities ?? []).filter(item => item.kind === 'certification').map(item => ({id: item.id, kind: item.data.kind as Verification['kind'], name: live.data?.people.find(person => person.id === item.ownerId)?.name ?? '申请人', organization: String(item.data.organization), note: String(item.data.note), status: item.data.status as Verification['status'], reviewNote: String(item.data.reviewNote ?? ''), date: item.createdAt}))
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [kind, setKind] = useState<'all' | Verification['kind']>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const items = verifications.filter((item) => (filter === 'all' || item.status === filter) && (kind === 'all' || item.kind === kind))
  const current = verifications.find((item) => item.id === selected)
  const decide = async (item: Verification, approve: boolean) => { if (await live.mutate('certification.review', {id: item.id, approve, reason: note.trim()})) {setSelected(null); setNote('')} }
  return <div className="v2-page"><PageHeading eyebrow="IDENTITY REVIEW" title="认证审核" description="核验学生、社团成员、官方机构及校友身份。"/><AdminStudentIdentityQueue superAdmin={live.data?.account.roles.includes('superadmin') ?? false}/><AdminAlumniReview live={live}/>{live.error && <p role="alert" className="v2-info-box">{live.error}</p>}<section className="v2-panel v2-list-panel"><SectionHeading title="认证申请" detail={`${items.length} 条结果`}/><div className="v2-toolbar"><div className="v2-filter-pills">{([['pending', '待审核'], ['approved', '已通过'], ['rejected', '已驳回'], ['all', '全部']] as const).map(([key, label]) => <button type="button" className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)} key={key}>{label}</button>)}</div><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="认证类型"><option value="all">全部类型</option><option value="student">学生</option><option value="club">学生社团成员</option><option value="official">官方机构</option></select></div><div className="v2-row-list">{items.map((item) => <button type="button" className="v2-verification-row" onClick={() => { setSelected(item.id); setNote(item.status === 'approved' ? '' : item.reviewNote) }} key={item.id}><span className="v2-notice-icon"><ShieldCheck size={20}/></span><span><small>{kindName[item.kind]} · {item.date}</small><strong>{item.organization}</strong><em>{item.name} · {item.note}</em></span><span className={`v2-status-chip ${item.status === 'approved' ? 'is-success' : item.status === 'pending' ? 'is-pending' : ''}`}>{statusName[item.status]}</span><ChevronRight size={17}/></button>)}</div>{!items.length && <Empty icon={ShieldCheck} title="当前筛选下没有申请"/>}</section>{current && <Drawer title={current.organization} eyebrow={`${kindName[current.kind]}认证 · ${statusName[current.status]}`} onClose={() => setSelected(null)}><div className="v2-fact-list"><span>申请人：{current.name}</span><span>提交时间：{current.date}</span></div><p className="v2-detail-lead">{current.note}</p>{current.status === 'pending' ? <><label className="v2-drawer-label">审核备注<textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="可填写通过说明或驳回原因"/></label><div className="v2-detail-actions"><button type="button" className="v2-button v2-button-secondary" onClick={() => decide(current, false)}><X size={16}/> 驳回</button><button type="button" className="v2-button v2-button-primary" onClick={() => decide(current, true)}><Check size={16}/> 通过</button></div></> : <div className="v2-info-box">审核备注：{current.reviewNote || '无'}{current.kind === 'club' && current.status === 'approved' && <><label className="v2-drawer-label">撤销原因<textarea value={note} onChange={(event) => setNote(event.target.value)} required/></label><button type="button" disabled={!note.trim()} className="v2-button v2-button-secondary" onClick={() => decide(current, false)}>撤销社团成员认证</button></>}</div>}</Drawer>}</div>
}

type ModerationItem = { id: string; kind: 'post' | 'comment'; title: string; body: string; author: string; status: 'visible' | 'pending' | 'hidden' | 'deleted'; postTitle?: string; postExcerpt?: string; neighborComments?: {id:string;body:string}[] }
type ModerationPage={items:ModerationItem[];total:number;page:number;hasMore:boolean}
export function AdminModeration() {
  const live = useWorkspaceBackend(10000)
  const [reason, setReason] = useState(''),[reasonError,setReasonError]=useState(''),[confirmDelete,setConfirmDelete]=useState(false)
  const [status,setStatus]=useState<ModerationItem['status']|'all'>('all'),[kind,setKind]=useState<'all'|'post'|'comment'>('all')
  const [query,setQuery]=useState(''),[author,setAuthor]=useState(''),[page,setPage]=useState(1)
  const [data,setData]=useState<ModerationPage|null>(null),[readError,setReadError]=useState(''),[selected,setSelected]=useState<string|null>(null)
  const canReview=live.data?.account.roles.some(role=>role==='reviewer'||role==='superadmin')??false
  const load=useCallback(async()=>{
    try {const result=await api<ModerationPage>(`/api/admin/community/moderation?status=${status}&kind=${kind}&q=${encodeURIComponent(query)}&author=${encodeURIComponent(author)}&page=${page}`);setData(result);setReadError('')}
    catch(cause){setReadError(cause instanceof Error?cause.message:'审核队列读取失败。')}
  },[status,kind,query,author,page])
  useEffect(()=>{void load()},[load])
  const current=data?.items.find(item=>item.id===selected)
  const close=()=>{setSelected(null);setReason('');setReasonError('');setConfirmDelete(false)}
  const requireReason=()=>{if(reason.trim())return true;setReasonError('请先填写处理原因。');return false}
  const moderate=async(item:ModerationItem,next:'visible'|'hidden')=>{
    if((next==='hidden'||item.status==='hidden')&&!requireReason())return
    if(await live.mutate('content.review',{id:item.id,status:next,reason:reason.trim()})){close();await load()}
  }
  const remove=async(item:ModerationItem)=>{
    if(!requireReason())return
    if(!confirmDelete){setConfirmDelete(true);return}
    if(await live.mutate('post.delete',{id:item.id,reason:reason.trim()})){close();await load()}
  }
  return <div className="v2-page"><PageHeading eyebrow="CONTENT REVIEW" title="社区内容管理" description="按状态、作者和关键词分批查阅帖子与评论。"/>
    <section className="v2-panel v2-list-panel"><SectionHeading title="帖子与评论" detail={`${data?.total??0} 条符合条件的内容`}/>
      <div className="v2-toolbar"><div className="v2-filter-pills">{([['pending','待审核'],['visible','已展示'],['hidden','已下架'],['deleted','已删除'],['all','全部']] as const).map(([key,label])=><button type="button" className={status===key?'is-active':''} key={key} onClick={()=>{setStatus(key);setPage(1)}}>{label}</button>)}</div><select value={kind} onChange={event=>{setKind(event.target.value as typeof kind);setPage(1)}} aria-label="内容类型"><option value="all">帖子与评论</option><option value="post">帖子</option><option value="comment">评论</option></select></div>
      <div className="v2-toolbar"><input aria-label="搜索内容关键词" placeholder="搜索标题或正文" value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}}/><input aria-label="搜索作者" placeholder="搜索作者" value={author} onChange={event=>{setAuthor(event.target.value);setPage(1)}}/></div>
      {readError&&<p role="alert">{readError}</p>}
      <div className="v2-row-list">{data?.items.map(item=><button type="button" className="v2-verification-row" key={item.id} onClick={()=>{setSelected(item.id);setReason('');setReasonError('');setConfirmDelete(false)}}><span className="v2-notice-icon"><Newspaper size={19}/></span><span><small>{item.kind==='post'?'帖子':'评论'} · {item.author}</small><strong>{item.title}</strong><em>{item.body}</em></span><span className={`v2-status-chip ${item.status==='visible'?'is-success':item.status==='pending'?'is-pending':''}`}>{item.status==='pending'?'待审':item.status==='visible'?'展示中':item.status==='deleted'?'已删除':'已下架'}</span><ChevronRight size={17}/></button>)}</div>
      {data&&!data.items.length&&<Empty icon={FileCheck2} title="当前队列没有内容"/>}
      {data&&<div className="v2-detail-actions"><button type="button" disabled={page<=1} onClick={()=>setPage(page-1)}>上一页</button><span>第 {page} 页</span><button type="button" disabled={!data.hasMore} onClick={()=>setPage(page+1)}>下一页</button></div>}
    </section>
    {current&&<Drawer title={current.title} eyebrow={`${current.kind==='post'?'帖子':'评论'} · ${current.author}`} onClose={close}>
      {current.kind==='comment'&&<div className="v2-info-box"><strong>所属帖子：{current.postTitle??'原帖子'}</strong><p>{current.postExcerpt??'原帖正文不可用。'}</p>{current.neighborComments?.map(comment=><p key={comment.id}>相邻评论：{comment.body}</p>)}</div>}
      <p className="v2-detail-lead">{current.body}</p>
      {current.status==='deleted'?<p className="v2-info-box">帖子已删除，仅保留记录供审核与举报追溯。</p>:canReview?<><label className="v2-drawer-label">处理原因（通过历史待审内容可不填）<textarea maxLength={1000} value={reason} onChange={event=>{setReason(event.target.value);setReasonError('');setConfirmDelete(false)}} placeholder="驳回、下架、恢复或管理员删帖须填写原因"/></label>{reasonError&&<p role="alert" className="v2-info-box">{reasonError}</p>}{live.error&&<p role="alert" className="v2-info-box">{live.error}</p>}<div className="v2-detail-actions">{current.status!=='hidden'&&<button type="button" className="v2-button v2-button-secondary" disabled={live.busy} onClick={()=>void moderate(current,'hidden')}><X size={16}/>{current.status==='pending'?'驳回':'下架'}</button>}{current.status!=='visible'&&<button type="button" className="v2-button v2-button-primary" disabled={live.busy} onClick={()=>void moderate(current,'visible')}><Check size={16}/>{current.status==='hidden'?'恢复展示':'通过审核'}</button>}{current.kind==='post'&&<button type="button" className="v2-button v2-button-secondary" disabled={live.busy} onClick={()=>void remove(current)}>{confirmDelete?'确认删除帖子':'删除帖子'}</button>}</div>{confirmDelete&&<p className="v2-form-note">再次点击确认，帖子及评论将从社区隐藏。</p>}</>:<p className="v2-info-box">需要审核员或超级管理员职责。</p>}
    </Drawer>}
  </div>
}
