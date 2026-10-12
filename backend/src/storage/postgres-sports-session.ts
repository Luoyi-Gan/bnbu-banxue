import { demand } from '../auth';
import type { Entity } from '../repository';
import { sportsRole } from '../sports/courses';
import { sportsAvailable } from '../sports/materials';
import { elapsedMilliseconds, type SportsClock } from '../sports/session-clock';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export function studentSessionProjection(session:Entity,now=Date.now()) {
  const clock=session.data.clock as unknown as SportsClock;
  return {id:session.id,studentId:session.ownerId,enrollmentId:session.data.enrollmentId,
    status:session.data.cancelledAt?'CANCELLED':clock.state==='ACTIVE'?'IN_PROGRESS':clock.state==='ENDED'?'COMPLETED':'PAUSED',
    completedAt:clock.endedAt===null?null:new Date(clock.endedAt).toISOString(),
    startedAt:new Date(clock.startedAt).toISOString(),endedAt:clock.endedAt===null?null:new Date(clock.endedAt).toISOString(),
    actualDurationSeconds:Math.floor(elapsedMilliseconds(clock,now)/1000),version:session.version,
    createdAt:session.createdAt,updatedAt:session.updatedAt};
}
export async function postgresSportsSession(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('sportsIdentity');
    sportsRole({all:()=>identities},actor,'student');
    const systems=await repo.all('sportsSystem');sportsAvailable({all:()=>systems});
    const sessions=(await repo.all('sportsSession')).filter(s=>s.ownerId===actor.id);
    const matches=id==='active' ? sessions.filter(s=>(s.data.clock as unknown as SportsClock).state!=='ENDED') : sessions.filter(s=>s.id===id);
    demand(matches.length===1,'运动会话不存在或须核对。',matches.length?409:404);
    return studentSessionProjection(matches[0]);
  });
}
