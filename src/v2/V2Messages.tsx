import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { ArrowLeft, ArrowUp, Bell, CalendarDays, ChevronRight, Coffee, MessageCircle, UsersRound } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { liveConversations, type LiveConversation } from './liveConversations'
import { Empty, Modal, PageHeading, SectionHeading } from './ui'
import { noticeCategories, noticeCategory, noticeDestination } from './notificationPresentation'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { notificationPreferences, showNoticeBadge } from './notificationPreferences'
import { DisplayAvatar } from './DisplayAvatar'
import './messages.css'
import {CommunityDirectMessages,CommunityDirectInbox} from './CommunityDirectMessages'

function ConversationPane({ conversation, draft, onDraft, onSend, onBack, opened }: {
  conversation: LiveConversation; draft: string; onDraft: (value: string) => void
  onSend: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void; opened: boolean
}) { useUiLanguage();
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
      <button type="button" className="inbox-back" aria-label={uiText("返回会话列表")} onClick={onBack}><ArrowLeft size={21}/></button>
      <span className="inbox-avatar"><UsersRound size={21}/></span>
      <div><h2>{conversation.title}</h2><p>{uiText("队伍会话 · 已连接会同里后台")}</p></div>
    </header>
    <div className="inbox-message-history" ref={messages} role="log" aria-label={uiTemplate(["","的消息"],conversation.title)} aria-live="polite" onScroll={event => {
      const target = event.currentTarget
      atBottom.current = target.scrollHeight - target.scrollTop - target.clientHeight < 64
    }}>
      <span className="inbox-history-caption">{uiText("会话记录")}</span>
      {conversation.messages.map(message => <div className={`inbox-message${message.mine ? ' is-mine' : ''}`} key={message.id}>
        {!message.mine && <DisplayAvatar className="inbox-person-avatar" name={message.from} avatar={message.avatar} personId={message.personId}/>}
        <div className="inbox-message-content"><div className="inbox-message-meta"><span>{message.mine?uiText('我'):message.from}</span><time>{message.time}</time></div><p>{message.body}</p></div>
      </div>)}
      {!conversation.messages.length && <Empty icon={MessageCircle} title={uiText("开始一段新对话")} description={uiText("向一起参与的同学打个招呼吧。")}/>}
    </div>
    <form className="inbox-composer" onSubmit={onSend}>
      <div className="inbox-input-wrap"><textarea ref={input} rows={1} value={draft} onChange={event => onDraft(event.target.value)} placeholder={uiText("聊点什么…")} aria-label={uiText("消息内容")} maxLength={500} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault()
          if (draft.trim()) event.currentTarget.form?.requestSubmit()
        }
      }}/><button type="submit" aria-label={uiText("发送消息")} disabled={!draft.trim()}><ArrowUp size={21}/></button></div>
      <small className="inbox-composer-hint">{uiText("Enter 发送 · Shift + Enter 换行")}</small>
    </form>
  </>
}

export function V2Messages() { useUiLanguage();
  const live = useWorkspaceBackend(10000)
  const conversations = useMemo(() => liveConversations(live.data), [live.data])
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'notifications' ? 'notifications' : 'conversations'
  const selected = params.get('conversation')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const category = noticeCategories.find(item => item === params.get('category')) ?? '全部'
  const setCategory = (value: string) => setParams({view:'notifications',category:value})
  const notice = live.data?.notifications.find(item => item.id === params.get('notice'))
  const destination = notice ? noticeDestination(notice, live.data) : null
  const readAttempt = useRef('')
  const active = conversations.find(item => item.id === selected)
  const opened = Boolean(selected && active && view === 'conversations')
  const unreadIds = useMemo(() => active?.messages.filter(message => message.unread).map(message => message.id) ?? [], [active])
  const unreadKey = opened && active ? `${active.id}:${unreadIds.join(',')}` : ''
  useEffect(() => {
    if (!opened || !active || !unreadIds.length) {
      readAttempt.current = ''
      return
    }
    if (live.busy || readAttempt.current === unreadKey) return
    readAttempt.current = unreadKey
    void live.mutate('message.read', {roomId: active.id, ids: unreadIds})
  }, [active, opened, unreadIds, unreadKey, live])
  const reminders = notificationPreferences(live.data)
  const unreadMessages = reminders.messages ? conversations.reduce((sum, item) => sum + item.unread, 0) : 0

  const notices = live.data?.notifications ?? []
  const unreadNotices = notices.filter(item => !item.readAt).length
  const badgeNotices = notices.filter(item => showNoticeBadge(live.data, item)).length
  const open = (id: string) => {
    setParams({ conversation: id })
  }
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!active) return
    const id = active.id, body = (drafts[id] ?? '').trim()
    if (!body) return
    if (await live.mutate('message.send', {roomId: id, body})) setDrafts(value => value[id]?.trim() === body ? {...value, [id]: ''} : value)
  }
  if(params.get('person'))return <div className="v2-page"><CommunityDirectMessages key={params.get('person')} person={params.get('person')!}/></div>
  return <div className={`v2-page v2-messages-page${opened ? ' is-chat-open' : ''}`}>
    <PageHeading eyebrow="MESSAGES" title={view === 'notifications'?uiText('通知中心'):uiText('我的会话')} description={view === 'notifications'?uiText('校园里的新消息，都在这里。'):uiText('每一次交流，都让校园里的连接更近一点。')}/>
    <nav className="inbox-tabs" aria-label={uiText("消息分类")}>
      <button type="button" aria-pressed={view === 'conversations'} onClick={() => setParams({})}><MessageCircle size={17}/>{uiText("会话")}{unreadMessages > 0 && <b>{unreadMessages}</b>}</button>
      <button type="button" aria-pressed={view === 'notifications'} onClick={() => setParams({ view: 'notifications' })}><Bell size={17}/>{uiText("通知")}{badgeNotices > 0 && <b>{badgeNotices}</b>}</button>
    </nav>
    {view === 'notifications'?<section className="inbox-notices">
      <SectionHeading title={uiText("校园通知")} detail={live.data?uiTemplate([""," 条通知"],notices.length):uiText('正在读取')} action={<button type="button" className="v2-text-button" disabled={!unreadNotices || live.busy} onClick={() => void live.mutate('notification.readmany', {ids: notices.filter(item => !item.readAt).map(item => item.id)})}>{uiText("全部标为已读")}</button>}/>
      {live.error && <p role="alert">{uiText(live.error)}</p>}
      {!live.data && !live.error && <p role="status">{uiText("正在读取本人通知…")}</p>}
      <div className="reference-notice-filters" aria-label={uiText("通知筛选")}>{noticeCategories.map(name => <button key={name} aria-pressed={category === name} className={category === name ? 'is-active' : ''} onClick={() => setCategory(name)}>{name} <small>{notices.filter(item => name === '全部' || noticeCategory(item.event) === name).length}</small></button>)}</div>
      {notices.filter(item => category === '全部' || noticeCategory(item.event) === category).map(item => {const kind = noticeCategory(item.event); const Icon = kind === '活动' ? CalendarDays : kind === '交流' ? Coffee : kind === '社区' ? MessageCircle : Bell; return <button type="button" className={`inbox-notice reference-notice${showNoticeBadge(live.data, item) ? ' is-unread' : ''}`} key={item.id} onClick={() => {setParams({view:'notifications',category,notice:item.id}); if (!item.readAt) void live.mutate('notification.read', {id:item.id})}}>
        <span className={`reference-icon tone-${kind === '交流' ? 'orange' : kind === '社区' ? 'purple' : 'blue'}`}><Icon size={21}/></span><span className="reference-notice-copy"><strong>{kind}{uiText("通知")}{showNoticeBadge(live.data, item) && <i aria-label={uiText("未读")}/>}</strong><p>{item.body}</p><time>{new Date(item.createdAt).toLocaleString(uiLocale())}</time></span><ChevronRight size={17}/>
      </button>})}
      {live.data && !notices.some(item => category === '全部' || noticeCategory(item.event) === category) && <Empty icon={Bell} title={uiText("暂无此类通知")}/>}
      {notice && <Modal title={uiTemplate(["","通知"],noticeCategory(notice.event))} onClose={() => setParams({view:'notifications',category})}><time className="v2-form-note">{new Date(notice.createdAt).toLocaleString(uiLocale())}</time><p className="reference-notice-body">{notice.body}</p>{live.error && <p role="alert">{uiText(live.error)}</p>}{destination && <Link className="v2-button v2-button-primary" to={destination.path} state={{from:`/v2/messages?view=notifications&category=${encodeURIComponent(category)}`}}>{uiText(destination.label)}<ChevronRight size={16}/></Link>}</Modal>}
    </section>:<div className="inbox-workspace">
      <aside className="inbox-list" aria-label={uiText("会话列表")}>{live.data?.account.roles.includes('student')&&<CommunityDirectInbox/>}
        {!live.data && !live.error && <p role="status">{uiText("正在读取本人会话…")}</p>}
        <div className="inbox-list-heading"><h2>{uiText("最近会话")}</h2><span>{conversations.length} {uiText("个会话")}</span></div>
        {conversations.map(conversation => <button type="button" className={`inbox-conversation${active?.id === conversation.id ? ' is-active' : ''}`} aria-label={uiTemplate(["打开会话：",""],conversation.title)} aria-current={active?.id === conversation.id ? 'true' : undefined} key={conversation.id} onClick={() => open(conversation.id)}>
          <span className="inbox-avatar"><UsersRound size={22}/></span>
          <span className="inbox-conversation-copy"><strong>{conversation.title}</strong><small>{conversation.messages.at(-1)?.body ?? uiText('开始一段新对话')}</small></span>
          <span className="inbox-conversation-meta"><time>{conversation.messages.at(-1)?.time}</time>{reminders.messages && conversation.unread > 0 && <b aria-label={uiTemplate([""," 条未读"],conversation.unread)}>{conversation.unread}</b>}</span>
        </button>)}
        {live.data && !conversations.length && <Empty icon={MessageCircle} title={uiText("还没有会话")} description={uiText("加入队伍后，可以在这里继续交流。")}/>}
        <p className="inbox-list-note">{uiText("与一起参与的同学，保持联系。")}</p>
      </aside>
      <section className="inbox-chat" aria-label={uiText("聊天区域")}>
        {active ? <ConversationPane conversation={active} draft={drafts[active.id] ?? ''} onDraft={value => setDrafts(previous => ({ ...previous, [active.id]: value }))} onSend={send} onBack={() => setParams({})} opened={opened}/> : <Empty icon={MessageCircle} title={uiText("选择一个会话")} description={uiText("在这里延续校园里的交流。")}/>}
        {live.error && <p className="inbox-save-error" role="alert">{uiText(live.error)}</p>}
      </section>
    </div>}
  </div>
}
