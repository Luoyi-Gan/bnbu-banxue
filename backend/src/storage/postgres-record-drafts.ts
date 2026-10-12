import { demand, type Account } from '../auth';
import { textField, enumField, type Entity, type Fields } from '../repository';
import { sportsRole, version } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import type { SportsClock } from '../sports/session-clock';
import { PostgresRepository } from './postgres-repository';

export async function recordDraftGate(repo:PostgresRepository,actor:Account) {
  const identities=await repo.all('sportsIdentity');sportsRole({all:()=>identities},actor,'student');
  const systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
}
export function recordDraftProjection(record:Entity) {
  const d=record.data;
  return {id:record.id,studentId:record.ownerId,sessionId:d.sessionId,enrollmentId:d.enrollmentId,
    status:d.status,creditType:d.creditType,sportType:d.sportType,sportName:d.sportName,
    description:d.description,businessDate:d.businessDate,version:record.version,
    createdAt:record.createdAt,updatedAt:record.updatedAt};
}
export async function saveRecordDraft(repo:PostgresRepository,actor:Account,operation:string,input:Fields) {
  await recordDraftGate(repo,actor);
  const allowed=operation==='create'?['sessionId','creditType','sportType','sportName','description','clientRequestId']:operation==='edit'?['id','expectedVersion','description']:['id','expectedVersion','reason'];
  demand(Object.keys(input).every(k=>allowed.includes(k)),'运动记录参数无效。');
  if(operation==='create') {
    const session=await repo.get(input.sessionId,'sportsSession');
    demand(session.ownerId===actor.id,'只能保存本人运动记录。',403);
    const clock=session.data.clock as unknown as SportsClock;
    demand(clock.state==='ENDED' && !session.data.cancelledAt,'请先正常结束运动。',409);
    demand(clock.endedAt!==null && Date.now()<clock.endedAt+24*3600000,'首次材料受理窗口已结束。',409);
    const course=await repo.get(session.data.courseId,'sportsCourse'),semester=await repo.get(session.data.semesterId,'sportsSemester');
    demand(course.data.settlementStatus!=='SETTLED' && semester.data.status!=='ARCHIVED','课程已结算或学期已归档。',409);
    demand(!(await repo.all('sportsRecord')).some(r=>r.data.sessionId===session.id),'本次运动已经提交材料。',409);
    demand(!(await repo.all('sportsRecordDraft')).some(r=>r.data.sessionId===session.id && r.data.status==='DRAFT'),'本次运动已有草稿。',409);
    const creditType=enumField(input,'creditType',['COURSE_RELATED','GENERAL'] as const);
    const sportType=enumField(input,'sportType',['RUNNING','BASKETBALL','FOOTBALL','BADMINTON','TABLE_TENNIS','SWIMMING','FITNESS','CYCLING','AEROBICS','CHEERLEADING','HEALTH_QIGONG','DRAGON_LION_DANCE','FRISBEE','GOLF','KAYAKING','PILATES','RUGBY','SELF_DEFENSE','STRETCH_FLEX','TENNIS','YOGA','ORIENTEERING','OUTDOOR_LEADERSHIP','CHINESE_ARCHERY','OTHER'] as const);
    demand((sportType==='SWIMMING')===(session.data.activityType==='SWIM'),'运动项目须与会话一致。',409);
    const sportName=input.sportName==null?null:textField(input,'sportName',100);
    if(sportType==='OTHER') demand(Boolean(sportName),'请填写运动名称。');
    textField(input,'clientRequestId',200);
    return recordDraftProjection(await repo.create('sportsRecordDraft',actor.id,{sessionId:session.id,enrollmentId:session.data.enrollmentId,courseId:course.id,semesterId:semester.id,businessDate:clock.businessDate,status:'DRAFT',creditType,sportType,sportName,description:textField(input,'description',200)}));
  }
  demand(['edit','discard'].includes(operation),'未知草稿操作。');
  const record=await repo.get(input.id,'sportsRecordDraft');
  demand(record.ownerId===actor.id,'只能修改本人草稿。',403);
  version(record,{version:input.expectedVersion});
  demand(record.data.status==='DRAFT','只有草稿可以修改或放弃。',409);
  return recordDraftProjection(await repo.save(record,operation==='edit'?{description:textField(input,'description',200)}:{status:'DISCARDED',discardReason:textField(input,'reason',1000)}));
}
