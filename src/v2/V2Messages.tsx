import { ArrowLeft, ArrowUp, Bell, ChevronRight, MessageCircle, UsersRound } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { liveConversations, type LiveConversation } from './liveConversations'
import { Empty, PageHeading, SectionHeading } from './ui'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { notificationPreferences, showNoticeBadge } from './notificationPreferences'
import { DisplayAvatar } from './DisplayAvatar'
import './messages.css'

function ConversationPane({ conversation, draft, onDraft, onSend, onBack, opened }: {
  conversation: LiveConversation; draft: string; onDraft: (value: string) => void
  onSend: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void; opened: boolean
}) {
  const messages = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const atBottom = useRef(true)
  const previous = useRef('')
  const latest = conversation.messages.at(-1)
  useLayoutEffect(() => {
    const container = messages.current
    if (!container) return
    const changed = previous.current !== conversation.id
    if (changed || atBottom.current || latest?.mine) container.scrollTop = container.scrollHeight
    previous.current = conversation.id
  }, [conversation.id, latest?.id, latest?.mine, opened])
  useLayoutEffect(() => {
    if (!input.current) return
    input.current.style.height = 'auto'
    input.current.style.height = `${Math.min(input.current.scrollHeight, 120)}px`
  }, [draft, opened])

  return <>
    <header className="inbox-chat-heading">
      <button type="button" className="inbox-back" aria-label="返回会话列表" onClick={onBack}><ArrowLeft size={21}/></button>
      <span className="inbox-avatar"><UsersRound size={21}/></span>
      <div><h2>{conversation.title}</h2><p>队伍会话 · 已连接伴学后台</p></div>
    </header>
    <div className="inbox-message-history" ref={messages} role="log" aria-label={`${conversation.title}的消息`} aria-live="polite" onScroll={event => {
      const target = event.currentTarget
      atBottom.current = target.scrollHeight - target.scrollTop - target.clientHeight < 64
    }}>
      <span className="inbox-history-caption">会话记录</span>
      {conversation.messages.map(message => <div className={`inbox-message${message.mine ? ' is-mine' : ''}`} key={message.id}>
        {!message.mine && <DisplayAvatar className="inbox-person-avatar" name={message.from} avatar={message.avatar}/>}
        <div className="inbox-message-content"><div className="inbox-message-meta"><span>{message.mine ? '我' : message.from}</span><time>{message.time}</time></div><p>{message.body}</p></div>
      </div>)}
      {!conversation.messages.length && <Empty icon={MessageCircle} title="开始一段新对话" description="向一起参与的同学打个招呼吧。"/>}
    </div>
    <form className="inbox-composer" onSubmit={onSend}>
      <div className="inbox-input-wrap"><textarea ref={input} rows={1} value={draft} onChange={event => onDraft(event.target.value)} placeholder="聊点什么…" aria-label="消息内容" maxLength={500} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault()
          if (draft.trim()) event.currentTarget.form?.requestSubmit()
        }
      }}/><button type="submit" aria-label="发送消息" disabled={!draft.trim()}><ArrowUp size={21}/></button></div>
      <small className="inbox-composer-hint">Enter 发送 · Shift + Enter 换行</small>
    </form>
  </>
}

export function V2Messages() {
  const live = useWorkspaceBackend(10000)
  const conversations = liveConversations(live.data)
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'notifications' ? 'notifications' : 'conversations'
  const selected = params.get('conversation')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const active = conversations.find(item => item.id === selected)
  const opened = Boolean(selected && active && view === 'conversations')
  const reminders = notificationPreferences(live.data)
  const unreadMessages = reminders.messages ? conversations.reduce((sum, item) => sum + item.unread, 0) : 0

  const notices = live.data?.notifications ?? []
  const unreadNotices = notices.filter(item => !item.readAt).length
  const badgeNotices = notices.filter(item => showNoticeBadge(live.data, item)).length
  const open = (id: string) => {
    setParams({ conversation: id })
    const ids = conversations.find(item => item.id === id)?.messages.filter(m => m.unread).map(m => m.id) ?? []
    if (ids.length) void live.mutate('message.read', {roomId: id, ids})
  }
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!active) return
    const id = active.id, body = (drafts[id] ?? '').trim()
    if (!body) return
    if (await live.mutate('message.send', {roomId: id, body})) setDrafts(value => value[id]?.trim() === body ? {...value, [id]: ''} : value)
  }
  return <div className={`v2-page v2-messages-page${opened ? ' is-chat-open' : ''}`}>
    <PageHeading eyebrow="MESSAGES" title="消息" description="每一次交流，都让校园里的连接更近一点。"/>
    <nav className="inbox-tabs" aria-label="消息分类">
      <button type="button" aria-pressed={view === 'conversations'} onClick={() => setParams({})}><MessageCircle size={17}/>会话{unreadMessages > 0 && <b>{unreadMessages}</b>}</button>
      <button type="button" aria-pressed={view === 'notifications'} onClick={() => setParams({ view: 'notifications' })}><Bell size={17}/>通知{badgeNotices > 0 && <b>{badgeNotices}</b>}</button>
    </nav>
    {view === 'notifications' ? <section className="inbox-notices">
      <SectionHeading title="校园通知" detail={live.data ? `${notices.length} 条通知` : '正在读取'} action={<button type="button" className="v2-text-button" disabled={!unreadNotices || live.busy} onClick={() => void live.mutate('notification.readmany', {ids: notices.filter(item => !item.readAt).map(item => item.id)})}>全部标为已读</button>}/>
      {live.error && <p role="alert">{live.error}</p>}
      {!live.data && !live.error && <p role="status">正在读取本人通知…</p>}
      {notices.map(item => <Link className={`inbox-notice${showNoticeBadge(live.data, item) ? ' is-unread' : ''}`} to="?view=notifications" key={item.id} onClick={event => {event.preventDefault(); if (!item.readAt) void live.mutate('notification.read', {id: item.id})}}>
        <span className="inbox-avatar"><Bell size={20}/></span><div><strong>校园通知{showNoticeBadge(live.data, item) && <i aria-label="未读"/>}</strong><p>{item.body}</p><time>{new Date(item.createdAt).toLocaleString('zh-CN')}</time></div><ChevronRight size={17}/>
      </Link>)}
      {live.data && !notices.length && <Empty icon={Bell} title="暂无通知"/>}
    </section> : <div className="inbox-workspace">
      <aside className="inbox-list" aria-label="会话列表">
        {!live.data && !live.error && <p role="status">正在读取本人会话…</p>}
        <div className="inbox-list-heading"><h2>最近会话</h2><span>{conversations.length} 个会话</span></div>
        {conversations.map(conversation => <button type="button" className={`inbox-conversation${active?.id === conversation.id ? ' is-active' : ''}`} aria-label={`打开会话：${conversation.title}`} aria-current={active?.id === conversation.id ? 'true' : undefined} key={conversation.id} onClick={() => open(conversation.id)}>
          <span className="inbox-avatar"><UsersRound size={22}/></span>
          <span className="inbox-conversation-copy"><strong>{conversation.title}</strong><small>{conversation.messages.at(-1)?.body ?? '开始一段新对话'}</small></span>
          <span className="inbox-conversation-meta"><time>{conversation.messages.at(-1)?.time}</time>{reminders.messages && conversation.unread > 0 && <b aria-label={`${conversation.unread} 条未读`}>{conversation.unread}</b>}</span>
        </button>)}
        {live.data && !conversations.length && <Empty icon={MessageCircle} title="还没有会话" description="加入队伍后，可以在这里继续交流。"/>}
        <p className="inbox-list-note">与一起参与的同学，保持联系。</p>
      </aside>
      <section className="inbox-chat" aria-label="聊天区域">
        {active ? <ConversationPane conversation={active} draft={drafts[active.id] ?? ''} onDraft={value => setDrafts(previous => ({ ...previous, [active.id]: value }))} onSend={send} onBack={() => setParams({})} opened={opened}/> : <Empty icon={MessageCircle} title="选择一个会话" description="在这里延续校园里的交流。"/>}
        {live.error && <p className="inbox-save-error" role="alert">{live.error}</p>}
      </section>
    </div>}
  </div>
}
