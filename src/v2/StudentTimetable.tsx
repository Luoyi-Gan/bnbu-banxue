import { uiText, uiTemplate, useUiLanguage, uiLocale } from './uiLanguage'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, Check, Clock3, ImagePlus, LoaderCircle, MapPin, Upload } from 'lucide-react'
import type {Workspace} from '../live/api'
import { useWorkspaceBackend } from './useWorkspaceBackend'
import { Drawer, Modal, type CardOrigin } from './ui'
import { weekDays, type StudentTimetable as Timetable, type TimetableLesson } from '../../shared/v2/timetableModel'
import { demonstrateRecognition, recognizeTimetable, validateTimetablePhoto, type RecognitionStage } from './timetableAdapter'
import {CampusLocationLink} from './CampusLocationLink'
import {TimetableBoard} from './TimetableBoard'
import './timetable.css'
import {LearningWorkspace} from './LearningWorkspace'
import {useSearchParams} from 'react-router-dom'

const stages: Record<RecognitionStage, string> = { preparing: '准备图片', recognizing: '识别课程信息', organizing: '整理一周课表' }
export function StudentTimetable({ idPrefix = 'timetable', embedded=false, initialLessonId=null, detailOnly=false, onCloseDetails, origin, initialWorkspace }: { idPrefix?: string;embedded?:boolean;initialLessonId?:string|null;detailOnly?:boolean;onCloseDetails?:()=>void;origin?:CardOrigin;initialWorkspace?:Workspace } = {}) { useUiLanguage();
  const [studyParams,setStudyParams]=useSearchParams(),studyOpen=studyParams.has('study')
  const backend = useWorkspaceBackend()
  const live = {...backend,data:backend.data??initialWorkspace??null}
  const record = live.data?.entities.find(e => e.kind === 'timetable' && e.ownerId === live.data?.account.id)
  const table = record ? {...record.data, updatedAt: record.updatedAt} as unknown as Timetable : undefined
  const recognitionPath = live.data?.capabilities?.timetableRecognition === 'configured' ? '/api/timetable/recognize' : ''
  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [stage, setStage] = useState<RecognitionStage | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sample, setSample] = useState<TimetableLesson[] | null>(null)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(initialLessonId)
  const [cardOrigin,setCardOrigin]=useState<CardOrigin|undefined>(origin)
  const controller = useRef<AbortController | null>(null)
  const photoVersion = useRef(0)
  const [readingPhoto, setReadingPhoto] = useState(false)
  const lessons = sample ?? table?.lessons ?? []
  const current = lessons.find(item => item.id === selected)
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file); setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => () => { controller.current?.abort(); photoVersion.current++ }, [])
  const closeImport = () => {
    if (live.busy) return
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
      const result = demo ? await demonstrateRecognition(request.signal, setStage) : await recognizeTimetable(file!, request.signal, setStage, recognitionPath)
      if (request.signal.aborted || controller.current !== request) return
      if (demo) { setSample(result); setMessage('正在查看示例课表，未读取照片，也未写入你的个人课表。') }
      else {
        if (!await live.mutate('timetable.save', {lessons: result, fileName: file!.name})) return
        setSample(null); setMessage('识别完成，课表已自动显示。请核对课程及周次，必要时点击课程修正。')
      }
      setSelected(null); setFile(null); setImportOpen(false)
    } catch (failure) {
      if (controller.current !== request) return
      setError(request.signal.aborted ? request.signal.reason === 'timeout' ? '识别超时，原课表已保留，请重试。' : '识别已取消，原课表已保留。' : failure instanceof Error ? failure.message : '识别失败，请重试。')
    } finally {
      clearTimeout(timeout)
      if (controller.current === request) { controller.current = null; setStage(null); setSampleLoading(false) }
    }
  }
  const edit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!table || !current || sample) return
    const data = new FormData(event.currentTarget)
    const input = { name: String(data.get('name')), weekday: Number(data.get('weekday')), startTime: String(data.get('startTime')), endTime: String(data.get('endTime')), period: String(data.get('period')), location: String(data.get('location')), teacher: String(data.get('teacher')), weeks: String(data.get('weeks')), note: String(data.get('note')), needsReview: false }
    try {
      if (!await live.mutate('timetable.correct', {...input, lessonId: current.id})) return
      setSelected(null); onCloseDetails?.(); setMessage('课程信息已更新。'); setError('')
    } catch (failure) { setError(failure instanceof Error ? failure.message : '保存失败') }
  }
  return <section className="v2-timetable" aria-label={uiText("我的课表")}>
    {!detailOnly&&<><nav className="learning-tabs learning-entry-tabs" aria-label={uiText('课表与学习工具')}><button type="button" aria-pressed={!studyOpen} onClick={()=>setStudyParams(p=>{p.delete('study');return p},{replace:true})}>{uiText('我的课表')}</button><button type="button" aria-pressed={studyOpen} onClick={()=>setStudyParams(p=>{p.set('study','deadlines');return p},{replace:true})}>{uiText('学习工具')}</button></nav>{!studyOpen&&<><div className="v2-timetable-heading"><div className="v2-timetable-heading-icon"><CalendarDays size={25}/></div><div>{!embedded&&<h2>{uiText("我的课表")}</h2>}<p>{table?uiTemplate(["已收录 "," 项课程安排"],table.lessons.length):uiText('上传一张课表照片，查看一周的课程安排。')}</p></div><button className="v2-button v2-button-primary" onClick={() => { setImportOpen(true); setError(''); setMessage('') }}><Upload size={16}/>{table?uiText('重新导入'):uiText('导入课表')}</button></div>
    {message && <p className="v2-timetable-message" role="status">{message}</p>}
    {live.error && <p role="alert" className="v2-info-box">{uiText(live.error)}</p>}
    {sample && <div className="v2-info-box">{uiText("示例模式 · 以下课程为虚构内容。")}<button className="v2-text-button" onClick={() => { setSample(null); setMessage(''); setSelected(null) }}>{uiText("退出示例")}</button></div>}
    <TimetableBoard lessons={lessons} preferences={live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data} idPrefix={idPrefix} onSelect={(id,rect)=>{setCardOrigin(rect);setSelected(id);setError('')}}/>
    <div className="v2-timetable-footnote"><span>{table && !sample?uiTemplate(["","更新于 ",""],table.fileName?`${table.fileName} · `:'',new Date(table.updatedAt).toLocaleString(uiLocale(), { timeZone: 'Asia/Shanghai' })):uiText('识别后自动按星期归类；未识别清楚的内容保留待核对。')}</span><small>{uiText("课程以学校最新安排为准。")}</small></div>
    </>}{studyOpen&&<LearningWorkspace/>}</>}
    {importOpen && <Modal title={uiText("导入我的课表")} onClose={closeImport}>
      {stage?<div className="v2-recognition" aria-busy="true"><LoaderCircle className="v2-recognition-spinner" size={40}/><h3>{sampleLoading?uiText('正在演示识别过程'):uiText('正在识别课表')}</h3><p role="status">{stages[stage]}…</p><ol>{(Object.entries(stages) as [RecognitionStage, string][]).map(([key, label], index) => <li key={key} className={Object.keys(stages).indexOf(stage) >= index ? 'is-active' : ''}>{Object.keys(stages).indexOf(stage) > index ? <Check size={15}/> : <span>{index + 1}</span>}{uiText(label)}</li>)}</ol><p>{uiText("识别完成后自动显示课表，原有课表在识别成功前保留。")}</p><button className="v2-button v2-button-secondary" disabled={live.busy} onClick={closeImport}>{live.busy?uiText('正在保存'):uiText('取消识别')}</button></div>:<div className="v2-timetable-import">
        <p>{uiText("请选择包含星期、课程名和时间的完整课表照片。支持 JPG、PNG、WebP，最大 10 MB。")}</p>
        <label className="v2-timetable-upload"><input type="file" accept="image/jpeg,image/png,image/webp" aria-label={uiText("选择课表照片")} onChange={event => { void selectFile(event.target.files?.[0]); event.target.value = '' }}/>{preview ? <img src={preview} alt={uiText("待识别的课表照片")}/> : <><ImagePlus size={32}/><strong>{uiText("选择课表照片")}</strong><span>{uiText("上传照片或课表截图")}</span></>}</label>
        {readingPhoto && <p role="status">{uiText("正在读取图片…")}</p>}
        {file && <p className="v2-timetable-filename">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
        {table && <p>{uiText("识别成功后将替换当前课表；失败或取消保留原有记录。")}</p>}
        {!recognitionPath && <div className="v2-info-box">{uiText("图片识别服务尚未接入，当前照片不会上传。可先体验加载过程和示例课表。")}</div>}
        {(error || live.error) && <p role="alert">{error || live.error}</p>}
        <button className="v2-button v2-button-primary" disabled={!file || readingPhoto} onClick={() => void start(false)}><Upload size={16}/>{uiText("开始识别")}</button>
        <button className="v2-button v2-button-secondary" onClick={() => void start(true)}>{uiText("体验示例识别流程")}</button>
      </div>}
    </Modal>}
    {current && <Drawer origin={cardOrigin} title={current.name} eyebrow={uiTemplate([""," · ",""],weekDays[current.weekday - 1],uiText(sample ? '示例课程' : '课程详情'))} onClose={() => { setSelected(null); setError(''); onCloseDetails?.() }}>
      {current.location&&<CampusLocationLink place={current.location} onClick={()=>{setSelected(null);onCloseDetails?.()}}/>}
      {sample?<div className="v2-fact-list"><span><Clock3 size={17}/>{current.startTime} — {current.endTime}</span><span><MapPin size={17}/>{current.location || uiText('未提供')}</span><span>{current.weeks || uiText('周次未提供')}</span><p>{uiText("示例内容不会保存到个人课表。")}</p></div>:<form className="v2-form" onSubmit={edit} key={current.id}>
        <p>{uiText("可以修正识别结果；没有明确时间或周次时，请保留为空，不推断学校安排。")}</p>
        <label>{uiText("课程名称")}<input name="name" required maxLength={100} defaultValue={current.name}/></label>
        <label>{uiText("上课星期")}<select name="weekday" defaultValue={current.weekday}>{weekDays.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}</select></label>
        <div className="v2-form-two"><label>{uiText("开始时间")}<input type="time" name="startTime" defaultValue={current.startTime}/></label><label>{uiText("结束时间")}<input type="time" name="endTime" defaultValue={current.endTime}/></label></div>
        <label>{uiText("节次")}<input name="period" maxLength={60} defaultValue={current.period}/></label><label>{uiText("上课地点")}<input name="location" maxLength={100} defaultValue={current.location}/></label><label>{uiText("任课老师")}<input name="teacher" maxLength={80} defaultValue={current.teacher}/></label><label>{uiText("上课周次")}<input name="weeks" maxLength={100} defaultValue={current.weeks} placeholder={uiText("例如：1–16 周 / 单周")}/></label><label>{uiText("备注")}<textarea name="note" maxLength={300} defaultValue={current.note}/></label>
        {(error || live.error) && <p role="alert">{error || live.error}</p>}<button disabled={live.busy} className="v2-button v2-button-primary">{uiText("保存修正")}</button>
      </form>}
    </Drawer>}
  </section>
}
