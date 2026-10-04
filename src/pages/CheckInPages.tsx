import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Languages,
  MapPin,
  Play,
  RotateCcw,
  Settings2,
  Timer,
  Trophy,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getCheckInSummary } from '../store/demoReducer'
import { useDemo } from '../store/DemoStore'
import type { CheckInRecord } from '../types'

const COURSE_TARGET = 10
const OTHER_TARGET = 10
const TOTAL_TARGET = COURSE_TARGET + OTHER_TARGET

const activityOptions: Array<{ activity: string; kind: CheckInRecord['kind']; location: string; icon: typeof Activity; accent: string }> = [
  { activity: 'Morning Campus Run', kind: 'other', location: 'BNBU Sports Field', icon: Activity, accent: 'orange' },
  { activity: 'Badminton Practice', kind: 'course', location: 'Sports Center Court 3', icon: Dumbbell, accent: 'green' },
  { activity: 'Strength Session', kind: 'other', location: 'Fitness Studio', icon: Trophy, accent: 'blue' },
]

const activityKey: Record<string, string> = {
  'Morning Campus Run': 'checkin.run',
  'Badminton Practice': 'checkin.badminton',
  'Strength Session': 'checkin.strength',
  'Evening Yoga': 'checkin.yoga',
  'Campus Walk': 'checkin.walk',
  'Campus Night Run': 'checkin.run',
}

const formatHours = (minutes: number) => (minutes / 60).toFixed(1).replace('.0', '')

function getLocalizedActivity(activity: string, t: (key: string) => string) {
  return activityKey[activity] ? t(activityKey[activity]) : activity
}

function CheckInHero() {
  const { t } = useLanguage()
  return (
    <header className="checkin-hero page-hero">
      <div>
        <span className="eyebrow">{t('checkin.eyebrow')}</span>
        <h1>{t('checkin.title')}</h1>
        <p>{t('checkin.subtitle')}</p>
      </div>
      <div className="checkin-hero-stamp"><Dumbbell size={18} /><span>GEPE101<br /><strong>{t('checkin.term')}</strong></span></div>
    </header>
  )
}

export function CheckInPage() {
  const { state, send } = useDemo()
  const { t, formatDateTime } = useLanguage()
  const [now, setNow] = useState(() => Date.now())
  const summary = getCheckInSummary(state)
  const activeRecord = state.checkInRecords.find((record) => record.id === state.activeCheckInId)
  const todayRecord = state.checkInRecords.find((record) => record.dateLabel.startsWith('Today') && record.status === 'completed')
  const totalPercent = Math.min(100, Math.round((summary.totalHours / TOTAL_TARGET) * 100))
  const coursePercent = Math.min(100, Math.round((summary.courseHours / COURSE_TARGET) * 100))
  const otherPercent = Math.min(100, Math.round((summary.otherHours / OTHER_TARGET) * 100))

  useEffect(() => {
    if (!activeRecord) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [activeRecord])

  const activeMinutes = activeRecord?.startedAt
    ? Math.max(0, Math.round((now - new Date(activeRecord.startedAt).getTime()) / 60000))
    : 0

  const startActivity = (option: typeof activityOptions[number]) => {
    if (state.activeCheckInId) {
      send({ type: 'START_CHECK_IN', activity: option.activity, kind: option.kind, location: option.location }, t('checkin.alreadyActive'))
      return
    }
    send({ type: 'START_CHECK_IN', activity: option.activity, kind: option.kind, location: option.location }, t('checkin.startToast', { activity: getLocalizedActivity(option.activity, t) }))
  }

  const completeActivity = () => {
    if (!activeRecord) return
    const duration = Math.max(30, activeMinutes)
    send({ type: 'COMPLETE_CHECK_IN', recordId: activeRecord.id, durationMinutes: duration }, t('checkin.completeToast'))
  }

  return (
    <div className="page-container checkin-page">
      <CheckInHero />

      <section className="checkin-summary-grid" aria-label={t('checkin.totalHours')}>
        <article className="checkin-total-card">
          <div className="checkin-card-kicker"><span>{t('checkin.totalHours')}</span><span className="checkin-goal-chip"><Trophy size={13} /> {t('checkin.goal', { hours: 20 })}</span></div>
          <div className="checkin-total-body">
            <div className="checkin-orbit" style={{ '--progress': `${totalPercent * 3.6}deg` } as CSSProperties}><div><strong>{formatHours(summary.totalMinutes)}</strong><span>/ 20h</span></div></div>
            <div><strong className="checkin-total-number">{totalPercent}%</strong><p>{totalPercent >= 100 ? t('checkin.goalReached') : t('checkin.remaining', { hours: Math.max(0, TOTAL_TARGET - summary.totalHours).toFixed(1).replace('.0', '') })}</p><Link className="text-link" to="/profile">{t('checkin.viewProfile')} <ArrowRight size={15} /></Link></div>
          </div>
        </article>
        <article className="checkin-summary-card"><span className="summary-icon summary-icon-green"><CheckCircle2 size={18} /></span><div><span>{t('checkin.courseHours')}</span><strong>{formatHours(summary.courseMinutes)}<small> / 10h</small></strong><div className="checkin-bar"><i style={{ width: `${coursePercent}%` }} /></div><small>{t('checkin.percentComplete', { percent: coursePercent })}</small></div></article>
        <article className="checkin-summary-card"><span className="summary-icon summary-icon-orange"><Activity size={18} /></span><div><span>{t('checkin.otherHours')}</span><strong>{formatHours(summary.otherMinutes)}<small> / 10h</small></strong><div className="checkin-bar"><i className="bar-orange" style={{ width: `${otherPercent}%` }} /></div><small>{t('checkin.percentComplete', { percent: otherPercent })}</small></div></article>
      </section>

      <section className="checkin-today-panel">
        <div className="section-heading"><div><span className="eyebrow">{t('checkin.today')}</span><h2>{activeRecord ? t('checkin.activeTitle', { activity: getLocalizedActivity(activeRecord.activity, t) }) : todayRecord ? t('checkin.checked') : t('checkin.today')}</h2><p>{t('checkin.todayHint')}</p></div><span className={`status-pill ${activeRecord ? 'status-going' : todayRecord ? 'status-checked_in' : 'status-pending'}`}>{activeRecord ? t('checkin.inProgress') : todayRecord ? t('checkin.checked') : t('checkin.available')}</span></div>
        {activeRecord ? (
          <article className="checkin-active-card">
            <div className="active-activity-mark"><Timer size={28} /></div>
            <div className="active-activity-copy"><span className="eyebrow">{getLocalizedActivity(activeRecord.activity, t)}</span><h3>{activeRecord.location}</h3><p><MapPin size={15} /> {activeRecord.location}</p></div>
            <div className="checkin-timer"><strong>{String(Math.floor(activeMinutes / 60)).padStart(2, '0')}:{String(activeMinutes % 60).padStart(2, '0')}</strong><span>{t('checkin.inProgress')}</span></div>
            <button className="button button-primary" type="button" onClick={completeActivity}><Check size={17} /> {t('checkin.complete')}</button>
          </article>
        ) : todayRecord ? (
          <article className="checkin-completed-card"><span className="completed-mark"><Check size={22} /></span><div><strong>{getLocalizedActivity(todayRecord.activity, t)}</strong><p>{todayRecord.location} · {t('checkin.minutes', { minutes: todayRecord.durationMinutes })}</p></div><span className="status-pill status-checked_in">{t('checkin.checked')}</span></article>
        ) : (
          <div className="checkin-activity-grid">
            {activityOptions.map((option) => {
              const Icon = option.icon
              return <article className="checkin-activity-card" key={option.activity}><div className={`activity-card-icon icon-${option.accent}`}><Icon size={20} /></div><div><span className="eyebrow">{option.kind === 'course' ? t('checkin.course') : t('checkin.other')}</span><h3>{getLocalizedActivity(option.activity, t)}</h3><p><MapPin size={14} /> {option.location}</p></div><button className="button button-secondary button-small" type="button" onClick={() => startActivity(option)}><Play size={14} /> {t('checkin.start')}</button></article>
            })}
          </div>
        )}
      </section>

      <section className="checkin-history-section">
        <div className="section-heading"><div><span className="eyebrow">{t('checkin.history')}</span><h2>{t('checkin.history')}</h2><p>{t('checkin.historyHint')}</p></div><span className="history-count">{t('checkin.recordCount', { count: state.checkInRecords.filter((record) => record.status === 'completed').length })}</span></div>
        <div className="checkin-history-list">
          {state.checkInRecords.filter((record) => record.status === 'completed').map((record) => <article className="checkin-history-row" key={record.id}><div className="history-date"><CalendarDays size={15} /><span>{formatDateTime(record.dateLabel, { year: 'numeric', month: 'short', day: 'numeric' })}</span></div><div className="history-activity"><strong>{getLocalizedActivity(record.activity, t)}</strong><small><MapPin size={13} /> {record.location}</small></div><span className={`kind-chip kind-${record.kind}`}>{record.kind === 'course' ? t('checkin.course') : t('checkin.other')}</span><span className="history-duration"><Clock3 size={14} /> {t('checkin.minutes', { minutes: record.durationMinutes })}</span><span className="status-pill status-checked_in">{t('checkin.checked')}</span></article>)}
          {!state.checkInRecords.some((record) => record.status === 'completed') && <div className="empty-state compact"><Dumbbell size={26} /><p>{t('checkin.empty')}</p></div>}
        </div>
        <div className="checkin-demo-note"><RotateCcw size={15} /><span>{t('checkin.resetNote')}</span><Link to="/settings"><Settings2 size={14} /> {t('nav.settings')}</Link></div>
      </section>
    </div>
  )
}

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const { send } = useDemo()
  const [applied, setApplied] = useState(false)
  const languageLabel = language === 'zh' ? t('settings.chinese') : t('settings.english')

  const changeLanguage = (next: 'zh' | 'en') => {
    setLanguage(next)
    setApplied(true)
    window.setTimeout(() => setApplied(false), 1800)
  }

  return (
    <div className="page-container settings-page">
      <header className="settings-hero page-hero"><span className="eyebrow">{t('settings.eyebrow')}</span><h1>{t('settings.title')}</h1><p>{t('settings.subtitle')}</p></header>
      <div className="settings-layout">
        <section className="settings-card language-settings-card"><div className="settings-card-heading"><span className="settings-card-icon"><Languages size={20} /></span><div><span className="eyebrow">{t('settings.language')}</span><h2>{languageLabel}</h2></div></div><p>{t('settings.languageHint')}</p><div className="language-picker" role="group" aria-label={t('settings.language')}><button type="button" className={language === 'zh' ? 'is-active' : ''} aria-pressed={language === 'zh'} onClick={() => changeLanguage('zh')}>{t('settings.chinese')}<span>{t('settings.simplifiedChinese')}</span></button><button type="button" className={language === 'en' ? 'is-active' : ''} aria-pressed={language === 'en'} onClick={() => changeLanguage('en')}>{t('settings.english')}<span>{t('settings.americanEnglish')}</span></button></div>{applied && <div className="settings-feedback" role="status"><CheckCircle2 size={15} /> {t('settings.applied')}</div>}</section>
        <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-card-icon-orange"><Activity size={20} /></span><div><span className="eyebrow">{t('nav.checkin')}</span><h2>{t('home.sportsProgress')}</h2></div></div><p>{t('checkin.resetNote')}</p><Link className="button button-primary" to="/check-in">{t('home.checkinEntry')} <ArrowRight size={16} /></Link></section>
        <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-card-icon-blue"><RotateCcw size={20} /></span><div><span className="eyebrow">{t('settings.demo')}</span><h2>{t('settings.demo')}</h2></div></div><p>{t('settings.demoHint')}</p><button type="button" className="button button-secondary" onClick={() => send({ type: 'RESET' }, t('settings.reset'))}><RotateCcw size={16} /> {t('settings.reset')}</button></section>
      </div>
    </div>
  )
}
