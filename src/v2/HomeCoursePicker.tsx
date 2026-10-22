import {useState} from 'react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {scheduleCourseKey,schedulePreferences} from '../../shared/v2/schedulePreferences'
import {uiText} from './uiLanguage'

export function HomeCoursePicker(){
 const live=useWorkspaceBackend(),[draft,setDraft]=useState<string[]|null>(null)
 const data=live.data,table=data?.entities.find(e=>e.kind==='timetable'&&e.ownerId===data.account.id)
 const lessons=Array.isArray(table?.data.lessons)?table.data.lessons as {name:string}[]:[]
 const courses=[...new Map(lessons.filter(l=>typeof l.name==='string'&&l.name.trim()).map(l=>[scheduleCourseKey(l.name),l.name])).entries()]
 const hidden=draft??schedulePreferences(data?.entities.find(e=>e.kind==='preferences'&&e.ownerId===data.account.id)?.data).hiddenDailyCourses
 return <section className="home-course-picker" aria-label={uiText('每日安排的课程')}><h3>{uiText('每日安排的课程')}</h3><p>{uiText('勾选需要上课的课程，自动保存到你的账号。同一课程的各节课一起设置。所选课程会显示在每日安排中，完整课表可查看全部课程。')}</p>{!data?<p>{uiText('正在读取课程…')}</p>:courses.length?courses.map(([key,name])=><label key={key}><input type="checkbox" checked={!hidden.includes(key)} disabled={live.busy} onChange={async event=>{const next=event.target.checked?hidden.filter(k=>k!==key):[...hidden,key];setDraft(next);await live.mutate('preferences.schedule',{hiddenDailyCourses:next});setDraft(null)}}/><span>{name}</span></label>):<p>{uiText('课表还没有课程。学校课程同步后可在这里选择。')}</p>}{live.error&&<p role="alert">{live.error}</p>}<small aria-live="polite">{uiText(live.busy?'正在保存…':'选择后自动保存')}</small></section>
}
