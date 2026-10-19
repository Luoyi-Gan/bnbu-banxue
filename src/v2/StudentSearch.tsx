import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import { api } from '../live/api'
import { ArrowRight, CalendarDays, MessageCircle, Search, UsersRound, X } from 'lucide-react'
import { gsap } from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { liveSearch } from './liveSearch'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { DisplayAvatar } from './DisplayAvatar'



const resultIcons = { event: CalendarDays, post: MessageCircle, room: UsersRound }

export function StudentSearch() { useUiLanguage();
  const live = useWorkspaceBackend()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [students, setStudents] = useState<{id:string;name:string;organization:string;nickname?:string;avatar?:string}[]>([])
  const [studentError, setStudentError] = useState('')
  useEffect(() => {
    let active = true; setStudents([]); setStudentError('');
    if (!open || !query.trim()) return;
    const timer = setTimeout(() => { void api<{students:{id:string;name:string;organization:string;nickname?:string;avatar?:string}[]}>('/api/students/search?number='+encodeURIComponent(query.trim())).then(result => {if(active) setStudents(result.students)}).catch(error => {if(active) setStudentError(error instanceof Error ? error.message : '学号查询失败')}) },300);
    return () => {active=false;clearTimeout(timer)}
  },[query,open])
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousPath = useRef(location.pathname)
  const previousOpen = useRef(false)

  const allResults = useMemo(() => liveSearch(live.data), [live.data])

  const normalized = query.trim().toLocaleLowerCase()
  const matched = normalized ? allResults.filter((item) => `${item.title} ${item.meta} ${item.keywords ?? ''}`.toLocaleLowerCase().includes(normalized)) : []
  const firstByKind = (['event', 'post', 'room'] as const).flatMap((kind) => matched.filter((item) => item.kind === kind).slice(0, 2))
  const results = normalized
    ? [...firstByKind, ...matched.filter((item) => !firstByKind.includes(item))].slice(0, 7)
    : allResults.filter((item) => item.kind === 'event').slice(0, 3)

  const close = useCallback(() => { inputRef.current?.blur(); setOpen(false); setQuery('') }, [])
  const closeToTrigger = useCallback(() => { close(); triggerRef.current?.focus() }, [close])

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname
      close()
    }
  }, [location.pathname, close])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (open && !rootRef.current?.contains(event.target as Node)) close() }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) { closeToTrigger(); return }
      const target = event.target as HTMLElement
      if ((event.key === '/' || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) && !target.closest('input, textarea, [contenteditable="true"]')) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey) }
  }, [open, close, closeToTrigger])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 720px)').matches
    const opening = open && !previousOpen.current
    previousOpen.current = open
    gsap.to(panel, { height: open ? 'auto' : 0, opacity: open ? 1 : 0, duration: reduced || mobile && !open ? 0 : mobile ? .22 : .32, ease: 'power3.out', overwrite: true })
    if (opening && !reduced && !mobile) gsap.fromTo(panel.querySelectorAll('.v2-student-search-result'), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .26, stagger: .035, ease: 'power3.out', overwrite: true })
    else gsap.set(panel.querySelectorAll('.v2-student-search-result'), { clearProps: 'opacity,transform' })
    return () => { gsap.killTweensOf(panel); gsap.killTweensOf(panel.querySelectorAll('.v2-student-search-result')) }
  }, [open, results.length])

  const choose = (path: string) => { close(); navigate(path) }

  return <div ref={rootRef} className={`v2-student-search${open ? ' is-open' : ''}`} role="search">
    <button ref={triggerRef} type="button" className="v2-icon-button v2-student-search-trigger" aria-label={uiText("搜索校园")} aria-expanded={open} aria-keyshortcuts="/ Meta+K Control+K" onClick={() => setOpen(true)}><Search size={19}/></button>
    <div className="v2-student-search-field" aria-hidden={!open}>
      <Search size={18} aria-hidden="true"/>
      <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && results[0]) choose(results[0].path) }} placeholder={uiText("搜索校园内容或输入完整学号")} aria-label={uiText("搜索校园内容")} tabIndex={open?0:-1}/>
      {query && <button type="button" className="v2-student-search-clear" aria-label={uiText("清除搜索词")} onClick={() => { setQuery(''); inputRef.current?.focus() }}><X size={15}/></button>}
      <button type="button" className="v2-student-search-close" aria-label={uiText("关闭搜索")} onClick={closeToTrigger}><X size={18}/></button>
    </div>
    <div ref={panelRef} className="v2-student-search-panel" aria-hidden={!open} inert={!open}>
      <div className="v2-student-search-panel-inner">
        <div className="v2-student-search-heading"><strong>{normalized?uiText('搜索结果'):uiText('推荐看看')}</strong><small>{normalized?uiTemplate([""," 条匹配"],results.length + students.length):uiText('校园里正在发生')}</small></div>
        {students.map(person => <div className="v2-student-search-result" key={person.id}><span className="v2-student-search-art"><DisplayAvatar className="v2-search-person-avatar" name={person.nickname || person.name} avatar={person.avatar} personId={person.id} lookupNumber={query.trim()}/></span><span className="v2-student-search-result-copy"><strong>{person.nickname || person.name}</strong><small>{person.organization || uiText('学生')}</small></span></div>)}
        {studentError && <p role="alert">{studentError}</p>}
        {results.length?results.map((item) => {
          const Icon = resultIcons[item.kind]
          return <Link to={item.path} className="v2-student-search-result" key={`${item.kind}-${item.id}`} onClick={close}>
            <span className="v2-student-search-art">{item.image ? <img src={item.image} alt=""/> : <Icon size={20}/>}</span>
            <span className="v2-student-search-result-copy"><strong>{item.title}</strong><small>{item.meta}</small></span>
            <ArrowRight size={16} aria-hidden="true"/>
          </Link>
        }):<div className="v2-student-search-empty">{students.length?uiText('以上为学号匹配结果。'):live.error || (!live.data ? '正在读取校园内容…' : '没有找到相关内容。试试更短的关键词。')}</div>}
        <div className="v2-student-search-footer"><span>{uiText("按 Enter 打开首条结果 · Esc 关闭")}</span><button type="button" onClick={() => choose('/v2/activities')}>{uiText("浏览全部活动")}<ArrowRight size={14}/></button></div>
      </div>
    </div>
  </div>
}
