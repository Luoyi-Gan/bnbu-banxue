import {digest,ServiceError} from './auth';
import type {Database} from './database';

const exceeded=()=>{throw new ServiceError(429,'RATE_LIMITED','请求过于频繁，请稍后再试。')};
export function normalizedOrigin(value:string|undefined) {return digest((value||'unknown').slice(0,200));}
function count(db:Database,category:string,field:'subject'|'origin',value:string,since:number,distinct=false) {
  const expression=distinct?'count(DISTINCT subject)':'count(*)';
  return Number((db.prepare(`SELECT ${expression} AS count FROM security_rate_events WHERE category=? AND ${field}=? AND occurred_at>=?`).get(category,value,since) as {count:number}).count);
}
function write(db:Database,category:string,subject:string,origin:string,now:number) {
  db.prepare('INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)').run(category,subject,origin,now);
  if(Math.random()<0.01) db.prepare('DELETE FROM security_rate_events WHERE occurred_at<?').run(now-86_400_000);
}
export function takeEmailSend(db:Database,email:string,origin:string) {
  const now=Date.now(),subject=digest(email),source=normalizedOrigin(origin);
  if(count(db,'email-send','subject',subject,now-3_600_000)>=5 || count(db,'email-send','subject',subject,now-86_400_000)>=10 || count(db,'email-send','origin',source,now-3_600_000,true)>=20 || Number((db.prepare("SELECT count(*) AS count FROM security_rate_events WHERE category='email-send' AND occurred_at>=?").get(now-3_600_000) as {count:number}).count)>=1000) exceeded();
  write(db,'email-send',subject,source,now);
}
export function takeStudentSearch(db:Database,accountId:string,origin:string) {
  const now=Date.now(),source=normalizedOrigin(origin),subject=digest(accountId);
  if(count(db,'student-search','subject',subject,now-60_000)>=10 || count(db,'student-search','subject',subject,now-86_400_000)>=100 || count(db,'student-search','origin',source,now-60_000)>=30) exceeded();
  write(db,'student-search',subject,source,now);
}
export function takeLoginAttempt(db:Database,identifier:string,origin:string) {
  const now=Date.now(),source=normalizedOrigin(origin),subject=digest(identifier);
  if(count(db,'login','origin',source,now-60_000)>=60 || Number((db.prepare("SELECT count(*) AS count FROM security_rate_events WHERE category='login' AND subject=? AND origin=? AND occurred_at>=?").get(subject,source,now-60_000) as {count:number}).count)>=12) exceeded();
  write(db,'login',subject,source,now);
}
