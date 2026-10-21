import {useState} from 'react'
import {schedulePreferences,validSemesterStart} from '../../shared/v2/schedulePreferences'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {uiText} from './uiLanguage'
import {Modal} from './ui'

export function TimetableCalendarSettings({onClose}:{onClose:()=>void}){
  const live=useWorkspaceBackend()
  const agendaPreferences=schedulePreferences(live.data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===live.data?.account.id)?.data)
  const [semesterDraft,setSemesterDraft]=useState<string|null>(null)
  const [feedback,setFeedback]=useState('')
  const semesterStart=semesterDraft??agendaPreferences.semesterStartDate
  const saveSemester=async()=>{
    if(semesterStart&&!validSemesterStart(semesterStart)){setFeedback('请选择学期第一周的周一。');return}
    if(await live.mutate('preferences.schedule',{semesterStartDate:semesterStart})){setSemesterDraft(null);setFeedback('学期日期已保存。')}
  }
  return <Modal title={uiText('课程校历')} onClose={onClose}><div className="schedule-term-settings"><label>{uiText('课程校历')}<select aria-label={uiText('课程校历')} value={agendaPreferences.academicCalendar} disabled={live.busy||!live.data} onChange={event=>{setSemesterDraft(null);setFeedback('');void live.mutate('preferences.schedule',{academicCalendar:event.target.value})}}><option value="bnbu-2026-s1">{uiText('学校校历 · 2026/27 第一学期')}</option><option value="custom">{uiText('手动设置其他学期')}</option></select></label>
      {agendaPreferences.academicCalendar==='custom'?<><label>{uiText('学期第一周的周一')}<input type="date" aria-label={uiText('学期第一周日期')} value={semesterStart} disabled={live.busy} onChange={event=>{setSemesterDraft(event.target.value);setFeedback('')}}/></label><button className="v2-button v2-button-secondary" disabled={live.busy||!live.data} onClick={()=>void saveSemester()}>{uiText(live.busy?'保存中…':'保存学期日期')}</button><small>{uiText('课程严格按单双周和周次范围展示；未设置日期、周次或时间不明确的课程暂不加入。')}</small></>:<small>{uiText('9月1日开课，12月11日常规授课结束；按校历教学周、假期及补课安排计算，阅读周不展示常规课程。校历若有调整，请以学校最新通知为准。')}</small>}
    </div>{feedback&&<p role="status">{uiText(feedback)}</p>}{live.error&&<p role="alert">{uiText(live.error)}</p>}</Modal>
}
