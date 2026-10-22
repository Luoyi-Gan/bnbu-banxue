import {demand,digest,ServiceError,timestamp,type Account} from './auth';
import {list,object,plain} from './ispace';
import type {LearningAuth,SchoolSession} from './learning-auth';
import {learningEntity,type LearningSql} from './learning-store';
import {MisClient,type MisTimetable} from './mis';
import type {LearningMaterial} from '../../shared/v2/learning';

export function courseMaterials(sections:unknown,courseId:number){
  const files:(LearningMaterial&{url:string})[]=[];
  for(const section of list(sections))for(const module of list(section.modules))for(const file of list(module.contents)){
    if(file.type!=='file'||typeof file.fileurl!=='string')continue;
    files.push({id:digest(file.fileurl),courseId,section:plain(section.name),name:plain(file.filename),mime:String(file.mimetype??''),size:Number(file.filesize??0),url:file.fileurl});
  }
  return files;
}
async function mutable(sql:LearningSql,actor:Account){
  const row=(await sql.rows<{status:string;roles:string}>('SELECT status,roles FROM accounts WHERE id=?',[actor.id]))[0];
  demand(row&&row.status!=='banned'&&JSON.parse(row.roles).includes('student'),'当前学生账号不可用。',403);
}
export async function persistMisTable(auth:LearningAuth,actor:Account,result:MisTimetable,startedAt:string){
  await auth.store.transaction(actor.id,async sql=>{
    await mutable(sql,actor);
    const rows=await sql.rows<{id:string;data:string}>("SELECT id,data FROM entities WHERE kind='timetable' AND owner_id=? ORDER BY created_at DESC,id DESC",[actor.id]);
    const current=rows[0],old=current?JSON.parse(current.data):undefined;
    if(old?.schoolSyncStartedAt&&old.schoolSyncStartedAt>startedAt)return;
    if(current&&old.source!=='mis'){
      const backupId='timetable-backup-'+digest(`${actor.id}:${current.data}`);
      if(!(await sql.rows('SELECT id FROM entities WHERE id=?',[backupId])).length)await learningEntity(sql,'timetableBackup',actor.id,{originalId:current.id,table:old,savedAt:timestamp()},backupId);
    }
    const data={lessons:result.lessons,fileName:'MIS · '+result.semester,importedAt:timestamp(),source:'mis',semester:result.semester,schoolSyncStartedAt:startedAt};
    if(result.semester==='Semester 1 of 2026-2027'){
      const preference=(await sql.rows<{id:string;data:string}>("SELECT id,data FROM entities WHERE kind='preferences' AND owner_id=?",[actor.id]))[0];
      if(preference){const old=JSON.parse(preference.data);if(old.academicCalendar!=='bnbu-2026-s1')await sql.rows('UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?',[JSON.stringify({...old,academicCalendar:'bnbu-2026-s1'}),timestamp(),preference.id]);}
    }
    if(current){
      if(JSON.stringify(old.lessons)===JSON.stringify(data.lessons)&&old.source==='mis'&&old.semester===data.semester)return;
      await sql.rows('UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?',[JSON.stringify(data),timestamp(),current.id]);
    }else await learningEntity(sql,'timetable',actor.id,data);
  });
}
export class SchoolSync {
  constructor(private auth:LearningAuth,private readMis=(username:string,password:string)=>new MisClient().timetable(username,password)){}
  async sync(actor:Account,token:string,credentials?:{username:string;password:string}){
    const session=this.auth.current(token,actor.id);demand(session,'请使用学校账号登录。',403);
    const startedAt=timestamp();session.warnings=[];session.sync={state:'syncing',mis:credentials?'pending':session.sync?.mis??'pending'};
    // Both school requests finish before credentials go out of scope. No password is stored.
    await Promise.all([
      this.ispace(actor,session).catch(()=>{session.warnings!.push('iSpace自动同步失败，已保留已有资料。');}),
      credentials?this.readMis(credentials.username,credentials.password).then(async result=>{
        await persistMisTable(this.auth,actor,result,startedAt);
        session.sync={...session.sync!,mis:'success',misLessons:result.lessons.length,misSemester:result.semester};
      }).catch(error=>{session.sync={...session.sync!,mis:'error'};session.warnings!.push(error instanceof ServiceError?`${error.message}原有课表已保留。`:'MIS时间表自动同步失败，原有课表已保留；请重新学校登录重试。');}):Promise.resolve(),
    ]);
    if(!credentials&&session.sync.mis==='error')session.warnings.push('MIS时间表尚未同步，请重新学校登录自动重试。');
    session.syncedAt=timestamp();session.sync.state=session.warnings.length?'partial':'complete';
    return {courses:session.courses??[],events:session.events??[],materials:session.materials??{},warnings:session.warnings,syncedAt:session.syncedAt,sync:session.sync};
  }
  private async ispace(actor:Account,session:SchoolSession){
    const courses=await this.auth.school.courses(session.token,session.userId);
    session.courses=courses.map(c=>({id:Number(c.id),name:plain(c.fullname),shortname:plain(c.shortname)}));
    try{
      const data=object(await this.auth.school.call(session.token,'core_calendar_get_calendar_upcoming_view'));
      demand(Array.isArray(data.events),'iSpace日历返回无效。',502);
      session.events=list(data.events).filter(e=>Number(e.timestart)>0&&Number.isSafeInteger(Number(e.id))).map(e=>({id:Number(e.id),title:plain(e.name),startAt:new Date(Number(e.timestart)*1000).toISOString(),course:plain(object(e.course).fullname),type:String(e.modulename??e.eventtype??'calendar'),deadline:['assign','quiz'].includes(String(e.modulename))&&['due','close'].includes(String(e.eventtype))}));
      await this.deadlines(actor,session);
    }catch{session.warnings!.push('iSpace日历或DDL自动同步失败，原有记录已保留。');}
    const materials={...session.materials};let cursor=0;
    await Promise.all(Array.from({length:Math.min(3,courses.length)},async()=>{
      while(cursor<courses.length){const course=courses[cursor++],courseId=Number(course.id);
        try{const sections=await this.auth.school.call(session.token,'core_course_get_contents',{courseid:String(courseId)});demand(Array.isArray(sections),'课程资料结构无效。',502);materials[String(courseId)]=courseMaterials(sections,courseId).map(({url,...file})=>{void url;return file;});}
        catch{session.warnings!.push(`${plain(course.fullname)}：资料目录自动同步失败。`);}
      }
    }));
    session.materials=materials;
  }
  private async deadlines(actor:Account,session:SchoolSession){
    await this.auth.store.transaction(actor.id,async sql=>{
      await mutable(sql,actor);
      for(const event of session.events??[]){
        if(!event.deadline||Date.parse(event.startAt)<Date.now())continue;
        const id='ispace-ddl-'+digest(`${actor.id}:${event.id}`);
        const row=(await sql.rows<{data:string}>('SELECT data FROM entities WHERE id=? AND owner_id=? AND kind=?',[id,actor.id,'learningItem']))[0],old=row?JSON.parse(row.data):{};
        const data={...old,title:event.title,type:'deadline',course:event.course,location:'',startAt:event.startAt,endAt:event.startAt,weekday:1,startTime:'',endTime:'',from:'',until:'',reminderMinutes:old.reminderMinutes??30,done:old.done===true,paused:old.paused===true,source:'ispace',schoolEventId:event.id};
        if(row){if(JSON.stringify(old)!==JSON.stringify(data))await sql.rows('UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?',[JSON.stringify(data),timestamp(),id]);}
        else await learningEntity(sql,'learningItem',actor.id,data,id);
      }
    });
  }
}
