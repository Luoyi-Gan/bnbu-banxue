export interface PersonalLearningItem {
  id:string;version:number;title:string;type:'deadline'|'repeat'|'exam';course:string;location:string;
  startAt:string;endAt:string;weekday:number;startTime:string;endTime:string;from:string;until:string;
  reminderMinutes:number;done:boolean;paused:boolean;
}
export interface LearningCourse {id:number;name:string;shortname:string}
export interface LearningEvent {id:number;title:string;startAt:string;course:string;type:string}
export interface LearningMaterial {id:string;courseId:number;section:string;name:string;mime:string;size:number}
export interface LearningPage {number:number;text:string}
export interface LearningStatus {connected:boolean;schoolAvailable:boolean;name?:string;expiresAt?:number}
export interface LearningOverview {status:LearningStatus;items:PersonalLearningItem[];courses:LearningCourse[];events:LearningEvent[];syncedAt?:string;warnings:string[];classReminderEnabled:boolean}

/** Shanghai calendar, independent of the browser/device timezone. */
export function personalOccurrences(items:PersonalLearningItem[],now=Date.now(),days=60){
  const result:{id:string;title:string;startAt:string;endAt:string;location:string;label:string}[]=[];
  for(const item of items){
    if(item.done||item.paused)continue;
    if(item.type!=='repeat'){
      if(Date.parse(item.endAt||item.startAt)>now)result.push({id:item.id,title:item.title,startAt:item.startAt,endAt:item.endAt,location:item.location,label:item.type==='exam'?'个人考试安排':'DDL'});
      continue;
    }
    const first=new Date(now+8*3600000).toISOString().slice(0,10);
    for(let day=0;day<days;day++){
      const date=new Date(Date.parse(first+'T00:00:00+08:00')+day*86400000),local=new Date(date.getTime()+8*3600000).toISOString().slice(0,10);
      if(local<item.from||local>item.until)continue;
      const startAt=`${local}T${item.startTime}:00+08:00`,endAt=`${local}T${item.endTime}:00+08:00`;
      // UTC date is the previous day at Shanghai midnight.
      const weekday=(new Date(local+'T12:00:00Z').getUTCDay()+6)%7+1;
      if(weekday!==item.weekday)continue;
      if(Date.parse(endAt)>now)result.push({id:`${item.id}:${local}`,title:item.title,startAt,endAt,location:item.location,label:'个人重复安排'});
    }
  }
  return result.sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt));
}
