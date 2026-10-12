import { gradeWorkspace } from "../sports/grades";
import { enduranceWorkspace } from "../sports/endurance";
import { demand } from '../auth';
import type { Entity, Repository } from '../repository';
import { projectSportsCourses } from '../sports/courses';
import { systemWorkspace } from '../sports/system';
import { requiresPasswordChange } from '../sports/account-gate';
import { materialWorkspace } from '../sports/materials';
import { reviewWorkspace } from '../sports/review';
import { sessionProjection } from '../sports/sessions';
import { PostgresAuth } from './postgres-auth';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresSportsWorkspace(db:PostgresDatabase,token:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),source=new PostgresRepository(client);
    const kinds=['sportsIdentity','sportsSemester','sportsCourse','sportsEnrollment','sportsEnrollmentFlow','sportsMakeup','sportsTemplate','sportsInvitation','sportsSystem','sportsSystemHistory','sportsRecord','sportsSession','sportsPause','sportsMaterialBatch','sportsMaterial','sportsDeadlineAdjustment','sportsProgress','sportsReviewEvent','sportsReviewRound','sportsCalendar','sportsManualMode','sportsEndurance','sportsEnduranceRevision','sportsExemption','sportsGradeDraft','sportsGradePublication'];
    const entities:Entity[]=[];for(const kind of kinds)entities.push(...await source.all(kind));
    const repo:Pick<Repository,'all'|'get'>={all:kind=>entities.filter(e=>e.kind===kind),get:(id,kind)=>{const e=entities.find(e=>e.id===id && (!kind || e.kind===kind));demand(e,'对象不存在。',404);return e;}};
    const system=systemWorkspace(repo,actor),serverNow=Date.now();
    if(requiresPasswordChange(repo,actor)) return {identity:system.identity,firstLoginOnly:true,serverNow,system:{...system.system,canManage:false,history:[],supplements:[]}};
    if(system.system.mode==='MAINTENANCE') {
      const canGovernAi=system.identity.data.role==='admin' && actor.roles.includes('superadmin') && actor.status!=='banned';
      const recovery=canGovernAi?reviewWorkspace(repo,actor):null;
      return {...system,serverNow,semesters:[],templates:[],courses:[],enrollments:[],invitations:[],sessions:[],records:[],materialBatches:[],materials:[],reviewReasons:[],reviewEvents:[],reviewRounds:[],progress:[],manualModes:recovery?.manualModes ?? [],canGovernAi,technicalTasks:recovery?.technicalTasks ?? [],recoveryCourses:canGovernAi?repo.all('sportsCourse').filter(c=>c.data.status!=='DRAFT' && c.data.settlementStatus!=='SETTLED').map(c=>({...c,data:{name:c.data.name}})):[]};
    }
    const names=new Map((await client.query<{id:string;name:string}>('SELECT id,name FROM accounts')).rows.map(a=>[a.id,a.name]));
    return {...system,...projectSportsCourses(repo,actor,id=>names.get(id) ?? '历史学生'),...materialWorkspace(repo,actor),...reviewWorkspace(repo,actor),...enduranceWorkspace(repo,actor),...gradeWorkspace(repo,actor),serverNow,sessions:repo.all('sportsSession').filter(s=>s.ownerId===actor.id).map(s=>sessionProjection(s,serverNow))};
  });
}
