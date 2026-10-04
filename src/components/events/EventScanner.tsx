import { AlertTriangle, Check, CheckCircle2, QrCode, RotateCcw, ScanLine, ShieldCheck, UserRound, XCircle } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useDemo } from '../../store/DemoStore'
import { createTicketPayload, validateEventTicket } from '../../store/eventTickets'
import type { Event, EventScanMode, TicketValidationResult } from '../../types'

type ScanPhase = 'ready' | 'scanning' | 'review' | 'result'

const resultKey = {
  valid: 'scanner.success',
  invalid: 'scanner.invalid',
  wrong_event: 'scanner.wrongEvent',
  void: 'scanner.void',
  duplicate: 'scanner.duplicate',
} as const

export function EventScanner({ event }: { event: Event }) {
  const { state, send } = useDemo()
  const { t, formatDateTime } = useLanguage()
  const [mode, setMode] = useState<EventScanMode>('standard')
  const [phase, setPhase] = useState<ScanPhase>('ready')
  const [pendingPayload, setPendingPayload] = useState('')
  const [result, setResult] = useState<TicketValidationResult | null>(null)
  const timerRef = useRef<number | null>(null)
  const eventTickets = useMemo(() => Object.values(state.eventTickets).filter((ticket) => ticket.eventId === event.id), [state.eventTickets, event.id])
  const scans = state.eventScanRecords.filter((scan) => scan.eventId === event.id).slice(0, 5)

  const finishScan = (payload: string) => {
    const nextResult = validateEventTicket(state, event.id, payload)
    setResult(nextResult)
    if (nextResult.code === 'valid' && mode === 'standard') {
      setPendingPayload(payload)
      setPhase('review')
      return
    }
    send({ type: 'CHECK_IN_TICKET', event, payload, mode })
    setPhase('result')
  }

  const simulate = (kind: 'valid' | 'duplicate' | 'wrong' | 'void' | 'invalid') => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const matching = kind === 'valid'
      ? eventTickets.find((ticket) => ticket.status === 'valid')
      : kind === 'duplicate'
        ? eventTickets.find((ticket) => ticket.status === 'used')
        : kind === 'void'
          ? eventTickets.find((ticket) => ticket.status === 'void')
          : kind === 'wrong'
            ? Object.values(state.eventTickets).find((ticket) => ticket.eventId !== event.id)
            : undefined
    const payload = matching ? createTicketPayload(matching) : kind === 'invalid' ? 'BNBU-DEMO-NOT-A-QR-TICKET' : 'https://campus-demo.bnbu.edu.cn/event-check-in/unknown?ticket=UNKNOWN'
    setResult(null)
    setPhase('scanning')
    timerRef.current = window.setTimeout(() => finishScan(payload), 520)
  }

  const confirmStandard = () => {
    if (!pendingPayload) return
    send({ type: 'CHECK_IN_TICKET', event, payload: pendingPayload, mode: 'standard' })
    setResult((current) => current ? { ...current, code: 'valid' } : current)
    setPendingPayload('')
    setPhase('result')
  }

  const reset = () => {
    setPendingPayload('')
    setResult(null)
    setPhase('ready')
  }

  const ResultIcon = result?.code === 'valid' ? CheckCircle2 : result?.code === 'duplicate' ? AlertTriangle : XCircle

  return (
    <section className="scanner-section">
      <div className="scanner-intro">
        <span className="eyebrow"><QrCode size={16} /> {t('scanner.eyebrow')}</span>
        <h2>{t('scanner.title')}</h2>
        <p>{t('scanner.subtitle')}</p>
        <div className="scanner-mode" role="group" aria-label={t('scanner.eyebrow')}>
          {(['standard', 'express'] as const).map((item) => (
            <button key={item} type="button" className={mode === item ? 'is-active' : ''} onClick={() => { setMode(item); reset() }}>
              <span>{item === 'standard' ? <ShieldCheck size={18} /> : <ScanLine size={18} />}</span>
              <span><strong>{t(`scanner.${item}`)}</strong><small>{t(`scanner.${item}Hint`)}</small></span>
              {mode === item && <Check size={16} />}
            </button>
          ))}
        </div>
        <p className="scanner-local-note"><ShieldCheck size={15} /> {t('scanner.localOnly')} · {t('event.checkInSeparate')}</p>
      </div>

      <div className="scanner-console">
        <div className={`scanner-view scanner-phase-${phase} ${result ? `scanner-result-${result.code}` : ''}`}>
          <div className="scanner-corners" aria-hidden="true"><i /><i /><i /><i /></div>
          {phase === 'scanning' && <div className="scanner-line" aria-hidden="true" />}
          {phase === 'ready' && <><QrCode size={64} /><strong>{t('scanner.ready')}</strong><span>QR / BNBU CAMPUS HUB</span></>}
          {phase === 'scanning' && <><ScanLine size={64} /><strong>{t('scanner.scanning')}</strong></>}
          {phase === 'review' && result?.ticket && <div className="scanner-review"><span className="scanner-avatar"><UserRound size={28} /></span><span className="eyebrow">{t('scanner.review')}</span><h3>{result.ticket.attendeeName}</h3><p>{result.ticket.code}</p><button className="button button-success" type="button" onClick={confirmStandard}><Check size={17} /> {t('scanner.confirmCheckIn')}</button></div>}
          {phase === 'result' && result && <div className="scanner-feedback"><ResultIcon size={58} /><strong>{t(resultKey[result.code])}</strong>{result.ticket?.attendeeName && <span>{result.ticket.attendeeName}</span>}<button className="button button-ghost" type="button" onClick={reset}><RotateCcw size={16} /> {t('scanner.scanAnother')}</button></div>}
        </div>
        <div className="scanner-samples">
          <button type="button" onClick={() => simulate('valid')}><CheckCircle2 size={16} /> {t('scanner.simulateValid')}</button>
          <button type="button" onClick={() => simulate('duplicate')}><AlertTriangle size={16} /> {t('scanner.simulateDuplicate')}</button>
          <button type="button" onClick={() => simulate('wrong')}><QrCode size={16} /> {t('scanner.simulateWrong')}</button>
          <button type="button" onClick={() => simulate('void')}><XCircle size={16} /> {t('ticket.void')}</button>
          <button type="button" onClick={() => simulate('invalid')}><XCircle size={16} /> {t('scanner.simulateInvalid')}</button>
        </div>
      </div>

      <aside className="scan-history">
        <div className="section-heading"><h3>{t('scanner.recent')}</h3><span>{scans.length}</span></div>
        {scans.length === 0 && <div className="scan-empty"><ScanLine size={24} /><span>{t('scanner.empty')}</span></div>}
        {scans.map((scan) => (
          <div className={`scan-row scan-${scan.result}`} key={scan.id}>
            <span>{scan.result === 'valid' ? <Check size={15} /> : scan.result === 'duplicate' ? <AlertTriangle size={15} /> : <XCircle size={15} />}</span>
            <span><strong>{scan.attendeeName ?? t('common.invalid')}</strong><small>{t(resultKey[scan.result])} · {formatDateTime(scan.scannedAt, { hour: '2-digit', minute: '2-digit' })}</small></span>
            <i>{scan.mode === 'express' ? 'EXP' : 'STD'}</i>
          </div>
        ))}
      </aside>
    </section>
  )
}
