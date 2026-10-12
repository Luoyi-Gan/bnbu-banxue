import { expect, it } from 'vitest';
import { startClock, transitionClock } from '../backend/src/sports/session-clock';
import { studentSessionProjection } from '../backend/src/storage/postgres-sports-session';
import { restoreServerSession, sessionDurationMs } from '../public/student/js/session.js';

it('restores the backend active and paused clocks through the unchanged student client', () => {
  const now=1800000000000;
  const entity={id:'session-one',kind:'sportsSession',ownerId:'student',version:1,createdAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),data:{enrollmentId:'enrollment-one',clock:startClock(now)}};
  const active=studentSessionProjection(entity,now+65000);
  const local=restoreServerSession(active,{},now+65000);
  expect(local.phase).toBe('active');
  expect(sessionDurationMs(local,now+70000)).toBe(70000);
  const pausedClock=transitionClock(entity.data.clock,'pause',now+70000);
  const paused=studentSessionProjection({...entity,version:2,data:{...entity.data,clock:pausedClock}},now+90000);
  const restored=restoreServerSession(paused,{},now+90000);
  expect(restored.phase).toBe('paused');
  expect(sessionDurationMs(restored,now+120000)).toBe(70000);
});
