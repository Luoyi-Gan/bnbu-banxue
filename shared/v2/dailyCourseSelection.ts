import {scheduleCourseKey} from './schedulePreferences'

/** Strip only recognised iSpace display metadata; retain the actual class number. */
export function dailyCourseIdentity(value:string){
 return scheduleCourseKey(value.normalize('NFKC')
  .replace(/\s*\[(?:semester\b|学期)[^\]]*\]\s*$/i,'')
  .replace(/\s*\((?:dr\.|dr\s|prof\.|prof\s|professor\s)[^()]*\)\s*$/i,'')
 )
}
export function dailyDeadlineSelected(item:{course?:unknown;source?:unknown},lessons:unknown,hiddenDailyCourses:readonly string[]){
 const course=typeof item.course==='string'?dailyCourseIdentity(item.course):''
 const known=Array.isArray(lessons)?lessons.flatMap(raw=>{
  if(!raw||typeof raw!=='object'||typeof raw.name!=='string'||!raw.name.trim())return []
  return [{identity:dailyCourseIdentity(raw.name),key:scheduleCourseKey(raw.name)}]
 }):[]
 const hidden=new Set(hiddenDailyCourses.map(scheduleCourseKey))
 let matches=course?known.filter(lesson=>lesson.identity===course):[]
 // A missing class suffix may match one unique course, never a different explicit class.
 if(!matches.length&&course&&!/\(\d{4}\)$/.test(course)){
  const candidates=known.filter(lesson=>lesson.identity.replace(/\s*\(\d{4}\)$/,'')===course)
  if(new Set(candidates.map(lesson=>lesson.identity)).size===1)matches=candidates
 }
 if(item.source==='ispace')return matches.length>0&&matches.every(lesson=>!hidden.has(lesson.key))
 // Independent personal tasks remain visible; explicitly linked known courses follow selection.
 return !matches.length||matches.every(lesson=>!hidden.has(lesson.key))
}
