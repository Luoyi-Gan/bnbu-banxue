import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpen, CalendarDays, Check, Clock3, ImagePlus, LoaderCircle, MapPin, Upload, UserRound } from 'lucide-react'
import { useV2 } from './useV2'
import { Drawer, Empty, Modal, SectionHeading } from './ui'
import { campusWeekday, correctTimetableLesson, lessonsForDay, saveTimetable, weekDays, type TimetableLesson } from './timetableModel'
import { demonstrateRecognition, recognizeTimetable, timetableRecognitionPath, validateTimetablePhoto, type RecognitionStage } from './timetableAdapter'
import './timetable.css'

const stages: Record<RecognitionStage, string> = { preparing: '准备图片', recognizing: '识别课程信息', organizing: '整理一周课表' }
export function StudentTimetable() {
  const { state, setState, persistenceError } = useV2()
  const table = state.timetable
  const [today, setToday] = useState(() => campusWeekday())
  const [day, setDay] = useState(today)
  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [stage, setStage] = useState<RecognitionStage | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sample, setSample] = useState<TimetableLesson[] | null>(null)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const photoVersion = useRef(0)
  const [readingPhoto, setReadingPhoto] = useState(false)
  const lessons = sample ?? table?.lessons ?? []
  const shown = lessonsForDay(lessons, day)
  const current = lessons.find(item => item.id === selected)
  useEffect(() => {
    const refresh = () => setToday(campusWeekday())
    const timer = setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [])
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file); setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => () => { controller.current?.abort(); photoVersion.current++ }, [])
  const closeImport = () => {
    controller.current?.abort(); controller.current = null; photoVersion.current++; setReadingPhoto(false)
    setStage(null); setImportOpen(false); setFile(null); setSampleLoading(false); setError('')
  }
  const selectFile = async (photo?: File) => {
    if (!photo) return
    const version = ++photoVersion.current
    setError(''); setFile(null); setReadingPhoto(true)
    try {
      validateTimetablePhoto(photo)
      const bitmap = await createImageBitmap(photo)
      bitmap.close(); if (photoVersion.current === version) setFile(photo)
    } catch (failure) { if (photoVersion.current === version) setError(failure instanceof Error ? failure.message : '照片无法读取，请重新选择。') }
    finally { if (photoVersion.current === version) setReadingPhoto(false) }
  }
  const start = async (demo: boolean) => {
    if (controller.current || (!demo && !file)) return
    const request = new AbortController(); controller.current = request
    photoVersion.current++; setReadingPhoto(false)
    setStage('preparing'); setSampleLoading(demo); setError(''); setMessage('')
    const timeout = setTimeout(() => request.abort('timeout'), 60000)
    try {
      const result = demo ? await demonstrateRecognition(request.signal, setStage) : await recognizeTimetable(file!, request.signal, setStage)
      if (request.signal.aborted || controller.current !== request) return
      if (demo) { setSample(result); setMessage('正在查看示例课表，未读取照片，也未写入你的个人课表。') }
      else {
        const next = saveTimetable(result, file!.name)
        setState(value => value.role === 'student' ? { ...value, timetable: next } : value)
        setSample(null); setMessage('识别完成，课表已自动显示。请核对课程及周次，必要时点击课程修正。')
      }
      setDay(campusWeekday()); setSelected(null); setFile(null); setImportOpen(false)
    } catch (failure) {
      if (controller.current !== request) return
      setError(request.signal.aborted ? request.signal.reason === 'timeout' ? '识别超时，原课表已保留，请重试。' : '识别已取消，原课表已保留。' : failure instanceof Error ? failure.message : '识别失败，请重试。')
    } finally {
      clearTimeout(timeout)
      if (controller.current === request) { controller.current = null; setStage(null); setSampleLoading(false) }
    }
  }
  const edit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!table || !current || sample) return
    const data = new FormData(event.currentTarget)
    const input = { name: String(data.get('name')), weekday: Number(data.get('weekday')), startTime: String(data.get('startTime')), endTime: String(data.get('endTime')), period: String(data.get('period')), location: String(data.get('location')), teacher: String(data.get('teacher')), weeks: String(data.get('weeks')), note: String(data.get('note')), needsReview: false }
    try {
      const next = correctTimetableLesson(table, current.id, input)
      setState(value => value.role === 'student' ? { ...value, timetable: next } : value)
      setDay(input.weekday); setSelected(null); setMessage('课程信息已更新。'); setError('')
    } catch (failure) { setError(failure instanceof Error ? failure.message : '保存失败') }
  }
  return <section className="v2-timetable" aria-label="我的课表">
    <div className="v2-panel v2-timetable-heading"><div className="v2-timetable-heading-icon"><CalendarDays size={25}/></div><div><h2>我的课表</h2><p>{table ? `已导入 ${table.lessons.length} 条课程安排` : '上传一张课表照片，查看一周的课程安排。'}</p></div><button className="v2-button v2-button-primary" onClick={() => { setImportOpen(true); setError(''); setMessage('') }}><Upload size={16}/>{table ? '重新导入' : '导入课表'}</button></div>
    {message && <p className="v2-timetable-message" role="status">{message}</p>}
    {persistenceError && <p role="alert" className="v2-info-box">本地保存失败，当前更改尚未可靠保存，请勿关闭页面。</p>}
    {sample && <div className="v2-info-box">示例模式 · 以下课程为虚构内容。<button className="v2-text-button" onClick={() => { setSample(null); setMessage(''); setSelected(null) }}>退出示例</button></div>}
    <section className="v2-panel v2-timetable-calendar">
      <SectionHeading title="一周课程" detail="按星期查看；单 / 双周和上课周次以课程标注为准。" action={<button className="v2-text-button" onClick={() => setDay(campusWeekday())}>回到今天</button>}/>
      <div className="v2-weekdays" role="tablist" aria-label="选择星期">{weekDays.map((label, index) => <button key={label} type="button" role="tab" aria-selected={day === index + 1} aria-controls="timetable-day" id={`weekday-${index + 1}`} className={day === index + 1 ? 'is-active' : ''} onClick={() => setDay(index + 1)}><span>{label}</span><small>{today === index + 1 ? '今天' : `${lessons.filter(item => item.weekday === index + 1).length} 节`}</small></button>)}</div>
      <div id="timetable-day" role="tabpanel" aria-labelledby={`weekday-${day}`} className="v2-timetable-day"><header><h3>{weekDays[day - 1]}{day === today ? ' · 今天' : ''}</h3><span>{shown.length} 条课程安排</span></header>
        {shown.map(item => <button key={item.id} type="button" className="v2-course-card" onClick={() => { setSelected(item.id); setError('') }}><span className="v2-course-time"><strong>{item.startTime || item.period || '时间待核对'}</strong><small>{item.endTime || (item.startTime ? '结束时间待核对' : '')}</small></span><span className="v2-course-body"><strong>{item.name}</strong><span><MapPin size={14}/>{item.location || '地点未识别'}</span>{item.teacher && <span><UserRound size={14}/>{item.teacher}</span>}<small>{item.weeks || '周次未识别'}{item.period && item.startTime ? ` · ${item.period}` : ''}</small></span>{item.needsReview && <em>待核对</em>}</button>)}
        {!shown.length && <Empty icon={table || sample ? BookOpen : CalendarDays} title={table || sample ? `${weekDays[day - 1]}暂无课程记录` : '还没有个人课表'} description={table || sample ? '可切换其他星期查看课程；安排以学校课表为准。' : '点击“导入课表”，上传完整清晰的课表照片。'}/>}
      </div>
    </section>
    <div className="v2-timetable-footnote"><span>{table && !sample ? `来源：${table.fileName} · 更新于 ${new Date(table.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}` : '识别后自动按星期归类；未识别清楚的内容保留待核对。'}</span><small>当前课表保存在本浏览器，尚未接入账号云端同步。</small></div>
    {importOpen && <Modal title="导入我的课表" onClose={closeImport}>
      {stage ? <div className="v2-recognition" aria-busy="true"><LoaderCircle className="v2-recognition-spinner" size={40}/><h3>{sampleLoading ? '正在演示识别过程' : '正在识别课表'}</h3><p role="status">{stages[stage]}…</p><ol>{(Object.entries(stages) as [RecognitionStage, string][]).map(([key, label], index) => <li key={key} className={Object.keys(stages).indexOf(stage) >= index ? 'is-active' : ''}>{Object.keys(stages).indexOf(stage) > index ? <Check size={15}/> : <span>{index + 1}</span>}{label}</li>)}</ol><p>识别完成后自动显示课表，原有课表在识别成功前保留。</p><button className="v2-button v2-button-secondary" onClick={closeImport}>取消识别</button></div> : <div className="v2-timetable-import">
        <p>请选择包含星期、课程名和时间的完整课表照片。支持 JPG、PNG、WebP，最大 10 MB。</p>
        <label className="v2-timetable-upload"><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择课表照片" onChange={event => { void selectFile(event.target.files?.[0]); event.target.value = '' }}/>{preview ? <img src={preview} alt="待识别的课表照片"/> : <><ImagePlus size={32}/><strong>选择课表照片</strong><span>上传照片或课表截图</span></>}</label>
        {readingPhoto && <p role="status">正在读取图片…</p>}
        {file && <p className="v2-timetable-filename">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
        {table && <p>识别成功后将替换当前课表；失败或取消保留原有记录。</p>}
        {!timetableRecognitionPath && <div className="v2-info-box">图片识别服务尚未接入，当前照片不会上传。可先体验加载过程和示例课表。</div>}
        {error && <p role="alert">{error}</p>}
        <button className="v2-button v2-button-primary" disabled={!file || readingPhoto} onClick={() => void start(false)}><Upload size={16}/>开始识别</button>
        <button className="v2-button v2-button-secondary" onClick={() => void start(true)}>体验示例识别流程</button>
      </div>}
    </Modal>}
    {current && <Drawer title={current.name} eyebrow={`${weekDays[current.weekday - 1]} · ${sample ? '示例课程' : '课程详情'}`} onClose={() => { setSelected(null); setError('') }}>
      {sample ? <div className="v2-fact-list"><span><Clock3 size={17}/>{current.startTime} — {current.endTime}</span><span><MapPin size={17}/>{current.location || '未提供'}</span><span>{current.weeks || '周次未提供'}</span><p>示例内容不会保存到个人课表。</p></div> : <form className="v2-form" onSubmit={edit} key={current.id}>
        <p>可以修正识别结果；没有明确时间或周次时，请保留为空，不推断学校安排。</p>
        <label>课程名称<input name="name" required maxLength={100} defaultValue={current.name}/></label>
        <label>上课星期<select name="weekday" defaultValue={current.weekday}>{weekDays.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}</select></label>
        <div className="v2-form-two"><label>开始时间<input type="time" name="startTime" defaultValue={current.startTime}/></label><label>结束时间<input type="time" name="endTime" defaultValue={current.endTime}/></label></div>
        <label>节次<input name="period" maxLength={60} defaultValue={current.period}/></label><label>上课地点<input name="location" maxLength={100} defaultValue={current.location}/></label><label>任课老师<input name="teacher" maxLength={80} defaultValue={current.teacher}/></label><label>上课周次<input name="weeks" maxLength={100} defaultValue={current.weeks} placeholder="例如：1–16 周 / 单周"/></label><label>备注<textarea name="note" maxLength={300} defaultValue={current.note}/></label>
        {error && <p role="alert">{error}</p>}<button className="v2-button v2-button-primary">保存修正</button>
      </form>}
    </Drawer>}
  </section>
}
