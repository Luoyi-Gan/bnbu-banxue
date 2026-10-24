import {createHash} from 'node:crypto';
import {timetableSchedule} from '../../../src/v2/timetableSchedule';
import {schedulePreferences,scheduleCourseKey} from '../../../shared/v2/schedulePreferences';
import {bookingStatus} from '../../../shared/v2/alumniPolicy';
import type {AlumniData} from '../../../shared/v2/alumniModel';
import type {Entity} from '../repository';
export type PushTarget={kind:'notification'|'activity'|'room'|'post'|'directChat'|'followers'|'timetable'|'coffeeBookings'|'alumniBookings';id:string};
export type AgendaOccurrence={id:string;kind:'course'|'activity'|'teacherCoffee'|'alumniCoffee';title:string;location:string;start:number;end:number;version:string;target:PushTarget};
export type PushSettings={pushInputToken?:boolean;notifications:boolean;liveActivities:boolean;messages:boolean;teams:boolean;courseMinutes:number;arrangementMinutes:number};
export const defaultPushSettings:PushSettings={notifications:false,liveActivities:false,messages:true,teams:true,courseMinutes:15,arrangementMinutes:30};
export function validateSettings(raw:Record<string,unknown>):PushSettings {
 const result={...defaultPushSettings};
 for(const key of ['notifications','liveActivities','messages','teams'] as const){if(raw[key]!==undefined){if(typeof raw[key]!=='boolean')throw new Error('Invalid setting');result[key]=raw[key];}}
 for(const key of ['courseMinutes','arrangementMinutes'] as const){if(raw[key]!==undefined){if(![0,5,10,15,30,60].includes(Number(raw[key]))||typeof raw[key]!=='number')throw new Error('Invalid reminder time');result[key]=raw[key] as number;}}
 return result;
}
/** Same verified calendar/week expansion used by the Web, with no demo data. */
export function projectPushAgenda(accountID:string,entities:Entity[],relations:{entity_id:string;kind:string}[],now=Date.now()):AgendaOccurrence[]{
 const own=(kind:string)=>entities.find(e=>e.kind===kind&&e.ownerId===accountID);
 const pref=schedulePreferences(own('preferences')?.data),items:AgendaOccurrence[]=[];
 const add=(id:string,kind:AgendaOccurrence['kind'],title:unknown,location:unknown,startAt:unknown,endAt:unknown,target:PushTarget)=>{
  const start=Date.parse(String(startAt)),end=Date.parse(String(endAt));
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end<=now||start>now+7*86400000)return;
  const item={id,kind,title:String(title||''),location:String(location||''),start:start/1000,end:end/1000,target};
  if(!item.title)return;
  items.push({...item,version:createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0,20)});
 };
 const lessons=own('timetable')?.data.lessons;
 const selected=Array.isArray(lessons)?lessons.filter((x:any)=>x&&x.needsReview!==true&&!pref.hiddenDailyCourses.includes(scheduleCourseKey(String(x.name??'')))):[];
 for(const lesson of timetableSchedule(selected,now,pref.semesterStartDate,8,pref.academicCalendar))add(lesson.id,'course',lesson.title,lesson.location,lesson.startAt,lesson.endAt,{kind:'timetable',id:lesson.lessonId??''});
 for(const e of entities){const d=e.data;
  if(e.kind==='activity'&&d.status==='published'&&d.visibility!=='hidden'&&(e.ownerId===accountID||relations.some(r=>r.entity_id===e.id&&r.kind==='participate')))add(e.id,'activity',d.title,d.location,d.startAt,d.endAt,{kind:'activity',id:e.id});
  if(e.kind==='coffeeBooking'&&e.ownerId===accountID&&d.status==='confirmed'){
   const slot=entities.find(s=>s.id===d.slotId);if(slot)add(e.id,'teacherCoffee','Coffee Chat',slot.data.location,slot.data.startAt,slot.data.endAt,{kind:'coffeeBookings',id:e.id});
  }
 }
 const alumni=entities.find(e=>e.kind==='alumniState')?.data.value as AlumniData|undefined;
 if(alumni)for(const b of alumni.bookings){const slot=alumni.slots.find(s=>s.id===b.slotId),profile=alumni.profiles.find(p=>p.id===slot?.alumniId);
  if(slot&&profile&&(b.student===accountID||profile.owner===accountID)&&bookingStatus(alumni,b)==='confirmed')add(b.id,'alumniCoffee','Coffee Chat',slot.location,slot.startAt,slot.endAt,{kind:'alumniBookings',id:b.id});
 }
 return items.sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
}
export function selectLiveAgenda(items:AgendaOccurrence[],now=Date.now()/1000,dismissed:string[]=[]){
 const rank={course:0,teacherCoffee:1,alumniCoffee:1,activity:2};
 return items.filter(i=>i.end>now&&i.start<=now+900&&!dismissed.includes(i.id)).sort((a,b)=>{
  const aLive=a.start<=now,bLive=b.start<=now;
  if(aLive!==bLive)return aLive?-1:1;
  return (aLive?a.end-b.end:a.start-b.start)||rank[a.kind]-rank[b.kind]||a.id.localeCompare(b.id);
 })[0];
}
export function liveContent(item:AgendaOccurrence,now=Date.now()/1000){return {occurrenceID:item.id,kind:item.kind,title:item.title,location:item.location,start:item.start,end:item.end,version:item.version,target:item.target,phase:now>=item.end?'ended':now>=item.start?'ongoing':'upcoming'};}
