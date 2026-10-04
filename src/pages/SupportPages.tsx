import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

function useCopy() {
  const { language } = useLanguage()
  return (zh: string, en: string) => language === 'zh' ? zh : en
}

export function TeachingPage() {
  const c = useCopy()
  const [signed, setSigned] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const courses = [['STAT1001', '统计学基础', 'Introduction to Statistics', '09:00–10:50 · T2-301'], ['ENG1002', '学术英语', 'Academic English', '14:00–15:50 · T3-205']]
  return <div className="page-container" data-no-translate="true">
    <header className="page-hero"><span className="eyebrow">LEARN · PARTICIPATE · GROW</span><h1>{c('教学支持', 'Teaching support')}</h1><p>{c('课堂签到与体育打卡，一处查看、轻松参与。', 'Class attendance and sports participation in one place.')}</p></header>
    <div className="support-layout"><section className="panel"><h2>{c('课堂签到', 'Class attendance')}</h2><p className="concept-note">{c('演示课表 · 点击体验签到，记录仅在本页保留。', 'Demo schedule · attendance is kept only while this page is open.')}</p>{courses.map(([id, zh, en, time]) => <article className="support-course" key={id}><div><span className="eyebrow">{id}</span><h3>{c(zh, en)}</h3><p>{time}</p></div><button className="button button-primary" disabled={signed.includes(id)} onClick={() => { setSigned([...signed, id]); setNotice(c(`${zh}：演示签到成功`, `${en}: demo attendance recorded`)) }}>{signed.includes(id) ? c('已签到', 'Checked in') : c('模拟签到', 'Demo check-in')}</button></article>)}<p role="status">{notice}</p></section>
    <aside className="panel"><span className="eyebrow">MOVE EVERY DAY</span><h2>{c('体育打卡', 'Sports check-in')}</h2><p>{c('开始运动、记录时长，查看课程与课外运动进度。', 'Start an activity, record time and view your sports progress.')}</p><Link className="button button-primary" to="/check-in">{c('进入体育打卡', 'Open sports check-in')} →</Link><p className="concept-note">{c('使用现有体育打卡记录与进度。', 'Uses your existing sports records and progress.')}</p></aside></div>
  </div>
}

export function AcademicPage() {
  const c = useCopy()
  const [filter, setFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('course')
  const [topics, setTopics] = useState<{ id: number; category: string; title: string; body: string }[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [replies, setReplies] = useState<Record<string, string[]>>({})
  const categories = [['all', c('全部', 'All')], ['course', c('课程交流', 'Coursework')], ['research', c('研究方法', 'Research')], ['project', c('项目合作', 'Projects')]]
  const seed = [
    { id: -1, category: 'course', title: c('如何理解统计学中的置信区间？', 'How should we interpret confidence intervals?'), body: c('想通过一个实际例子理解置信区间，欢迎分享学习思路。', 'Looking for a practical example and study approaches.') },
    { id: -2, category: 'research', title: c('第一次做文献综述，从哪里开始？', 'Where do I start with a literature review?'), body: c('准备先整理关键词、检索来源与文献笔记，大家有什么经验？', 'Planning keywords, sources and reading notes. What has worked for you?') },
    { id: -3, category: 'project', title: c('校园可持续发展数据分析小组', 'Campus sustainability data project'), body: c('寻找对数据分析和可视化感兴趣的同学，一起讨论项目选题。', 'Seeking students interested in data analysis and visualization to discuss project ideas.') },
  ]
  return <div className="page-container" data-no-translate="true"><header className="page-hero"><span className="eyebrow">IDEAS START HERE</span><h1>{c('学术讨论', 'Academic discussions')}</h1><p>{c('交流课程问题、研究思路与合作项目。演示内容及新增讨论仅在本页保留。', 'Discuss coursework, research and projects. Demo contributions stay on this page only.')}</p><a className="button button-secondary academic-compose-link" href="#new-discussion">{c('发起讨论', 'Start a discussion')} ↓</a></header>
    <div className="filter-row">{categories.map(([key, label]) => <button key={key} className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div>
    <div className="support-layout"><section className="post-feed">{[...topics, ...seed].filter(topic => filter === 'all' || topic.category === filter).map(topic => <article className="post-card" key={topic.id}><span className="eyebrow">{categories.find(([key]) => key === topic.category)?.[1]}</span><h2>{topic.title}</h2><p>{topic.body}</p><button className="button button-secondary" onClick={() => { setExpanded(expanded === String(topic.id) ? null : String(topic.id)); setReply('') }}>{c('参与讨论', 'Join discussion')} · {replies[topic.id]?.length ?? 0}</button>{expanded === String(topic.id) && <div className="support-replies">{(replies[topic.id] ?? []).map((text, i) => <p key={i}>{c('我：', 'Me: ')}{text}</p>)}<form onSubmit={event => { event.preventDefault(); if (!reply.trim()) return; setReplies({ ...replies, [topic.id]: [...(replies[topic.id] ?? []), reply.trim()] }); setReply('') }}><label className="field"><span>{c('你的回复', 'Your reply')}</span><textarea required maxLength={1000} value={reply} onChange={event => setReply(event.target.value)} /></label><button className="button button-primary" disabled={!reply.trim()}>{c('回复', 'Reply')}</button></form></div>}</article>)}</section>
    <form id="new-discussion" className="panel support-compose" onSubmit={event => { event.preventDefault(); if (!title.trim() || !body.trim()) return; setTopics([{ id: Date.now(), category, title: title.trim(), body: body.trim() }, ...topics]); setTitle(''); setBody(''); setFilter('all') }}><h2>{c('发起讨论', 'Start a discussion')}</h2><label className="field"><span>{c('分类', 'Category')}</span><select value={category} onChange={event => setCategory(event.target.value)}>{categories.slice(1).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="field"><span>{c('标题', 'Title')}</span><input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} /></label><label className="field"><span>{c('讨论内容', 'Discussion')}</span><textarea required rows={5} maxLength={2000} value={body} onChange={event => setBody(event.target.value)} /></label><button className="button button-primary" disabled={!title.trim() || !body.trim()}>{c('发布演示讨论', 'Post demo discussion')}</button></form></div>
  </div>
}

export function CampusAIPage() {
  const c = useCopy()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ question: string; kind: string }[]>([])
  const ask = (value: string) => { if (!value.trim()) return; const kind = /运动|体育|签到|sport|class|attendance/i.test(value) ? 'teaching' : /活动|event/i.test(value) ? 'event' : /学术|论文|research|study/i.test(value) ? 'academic' : 'campus'; setMessages([...messages, { question: value.trim(), kind }]); setQuestion('') }
  const answers: Record<string, [string, string]> = {
    teaching: [c('教学支持汇总了课堂签到与体育打卡。打开后可选择需要的服务。', 'Teaching support brings together class attendance and sports check-in.'), '/teaching'],
    event: [c('可以在发现页浏览活动，查看时间地点并报名；活动发布入口可以创建自己的活动。', 'Browse events in Discover for schedules and registration, or use Publish events to create one.'), '/discover'],
    academic: [c('建议先明确问题，再整理关键词和文献笔记。可以到学术讨论发布具体问题，与同学交流。', 'Define your question, organize keywords and reading notes, then discuss specific questions with peers.'), '/campus/academic'],
    campus: [c('我可以演示如何找到教学支持、活动和学术讨论。其他问题请通过校园板块查找；这里尚未接入实时校园信息或 AI 模型。', 'Try asking about teaching, events or academic discussions. This demo has no live campus data or AI model connection.'), '/campus'],
  }
  return <div className="page-container" data-no-translate="true"><header className="page-hero"><span className="eyebrow">YOUR CAMPUS COMPANION</span><h1>{c('校园 AI', 'Campus AI')}</h1><p>{c('从一个问题开始，找到校园中的下一步。', 'Start with a question and find your next step on campus.')}</p></header><section className="panel support-ai"><span className="eyebrow">{c('演示模式 · 预设回答 · 未连接 AI 模型', 'Demo mode · preset responses · no AI model connected')}</span><h2>{c('今天想了解什么？', 'What would you like to explore?')}</h2><div className="filter-row">{[c('怎么进行体育打卡？', 'How do I check in for sports?'), c('有哪些校园活动？', 'Where can I find events?'), c('如何开始学术讨论？', 'How do I start an academic discussion?')].map(text => <button key={text} onClick={() => ask(text)}>{text}</button>)}</div><div className="support-messages" role="log" aria-live="polite">{messages.map((message, i) => <article key={i}><strong>{message.question}</strong><p>{answers[message.kind][0]}</p><Link className="text-link" to={answers[message.kind][1]}>{c('打开相关板块', 'Open related section')} →</Link></article>)}</div><form className="support-question" onSubmit={event => { event.preventDefault(); ask(question) }}><label className="field"><span>{c('向校园 AI 提问', 'Ask Campus AI')}</span><input value={question} maxLength={500} onChange={event => setQuestion(event.target.value)} placeholder={c('输入你的校园问题…', 'Enter a campus question…')} /></label><button className="button button-primary" disabled={!question.trim()}>{c('发送', 'Send')}</button></form></section></div>
}
