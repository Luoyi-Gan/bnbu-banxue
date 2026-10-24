import {randomUUID} from 'node:crypto';
import type {PostgresDatabase} from '../storage/postgres';
import {apnsConfigured,sendAPNs,type APNsMessage,type APNsResult} from './apns';
import {loadAgenda,enqueue,collapseID,type PushDevice} from './storage';
import {liveContent,selectLiveAgenda,type AgendaOccurrence} from './agenda';
export async function schedulePush(db:PostgresDatabase){
 await db.transaction(async c=>{
  if(!(await c.query('SELECT pg_try_advisory_xact_lock(18422,31) AS locked')).rows[0].locked)return;
  const devices=(await c.query<PushDevice>(`SELECT d.* FROM push_devices d JOIN accounts a ON a.id=d.account_id WHERE d.enabled AND a.status<>'banned' AND a.roles::jsonb ? 'student' AND EXISTS(SELECT 1 FROM sessions s WHERE s.token_hash=d.session_hash AND s.account_id=d.account_id AND s.expires_at>$1)`,[Date.now()])).rows;
  const now=Math.floor(Date.now()/1000);
  for(const d of devices){
   const agenda=await loadAgenda(c,d.account_id),english=d.language==='en';
   for(const item of agenda){const minutes=item.kind==='course'?d.settings.courseMinutes:d.settings.arrangementMinutes;
    if(!minutes||!d.settings.notifications||!d.token||!['authorized','provisional','ephemeral'].includes(d.authorization_status)||now<item.start-minutes*60||now>=item.start)continue;
    const body=english?`${item.title} · ${item.location}`:`${item.title} · ${item.location}`;
    await enqueue(c,d,item.id,'reminder',item.version,{aps:{alert:{title:english?'Upcoming campus schedule':'校园安排即将开始',body},sound:'default','thread-id':'schedule'},accountID:d.account_id,target:item.target,occurrence:item},item.start);
   }
   await c.query(`UPDATE push_live_bindings b SET state='ended' WHERE b.device_id=$1 AND b.state='starting' AND b.token IS NULL AND EXISTS(SELECT 1 FROM push_outbox o WHERE o.device_id=b.device_id AND o.source_id=b.occurrence_id AND o.kind='live-start' AND o.status IN ('failed','expired','cancelled'))`,[d.id]);
   const bindings=(await c.query('SELECT * FROM push_live_bindings WHERE device_id=$1',[d.id])).rows;
   const candidate=d.settings.liveActivities?selectLiveAgenda(agenda,now,bindings.filter(b=>['dismissed','ended'].includes(b.state)).map(b=>b.occurrence_id)):undefined;
   const active=bindings.find(b=>['active','starting','ending'].includes(b.state));
   if(active){
    const current=agenda.find(i=>i.id===active.occurrence_id);
    const expired=now>=Number(active.started_at)+8*3600;
    const end=!candidate||candidate.id!==active.occurrence_id||!current||expired;
    if(end){
     if(active.token){const item=active.content as AgendaOccurrence;
      await enqueue(c,d,active.occurrence_id,'live-end',String(active.started_at),{aps:{timestamp:now,event:'end','content-state':{...liveContent(item,now),phase:'ended'},'dismissal-date':now}},now+3600,active.token);
      await c.query("UPDATE push_live_bindings SET state='ending' WHERE device_id=$1 AND occurrence_id=$2 AND state<>'dismissed'",[d.id,active.occurrence_id]);
     }else if(expired)await c.query("UPDATE push_live_bindings SET state='ended' WHERE device_id=$1 AND occurrence_id=$2",[d.id,active.occurrence_id]);
     continue;
    }
    if(active.token&&current){const phase=now>=current.start?'ongoing':'upcoming';
     await enqueue(c,d,current.id,'live-update',current.version+':'+phase+':'+Math.floor(now/900),{aps:{timestamp:now,event:'update','content-state':liveContent(current,now),'stale-date':Math.min(current.end,now+1800)}},current.end,active.token);
     await c.query('UPDATE push_live_bindings SET content=$3,version=$4 WHERE device_id=$1 AND occurrence_id=$2',[d.id,current.id,JSON.stringify(current),current.version]);
    }
   }else if(candidate&&d.push_start_token){
    await c.query(`INSERT INTO push_live_bindings(device_id,occurrence_id,version,state,content,started_at) VALUES($1,$2,$3,'starting',$4,$5) ON CONFLICT DO NOTHING`,[d.id,candidate.id,candidate.version,JSON.stringify(candidate),now]);
    await enqueue(c,d,candidate.id,'live-start',candidate.version,{aps:{...(d.settings.pushInputToken?{'input-push-token':1}:{}),timestamp:now,event:'start','attributes-type':'CampusActivityAttributes',attributes:{accountID:d.account_id},'content-state':liveContent(candidate,now),'stale-date':Math.min(candidate.end,now+1800),alert:{title:english?'Campus schedule':'校园安排',body:candidate.title,sound:'default'}}},Math.min(candidate.end,now+120),d.push_start_token);
   }
  }
 });
}
export async function deliverPush(db:PostgresDatabase,transport:(m:APNsMessage)=>Promise<APNsResult>=sendAPNs){
 for(let index=0;index<50;index++){
  const lease=randomUUID();
  const job=await db.transaction(async c=>{
   await c.query("UPDATE push_outbox SET status='expired' WHERE status IN ('pending','sending') AND expires_at<=now()");
   const result=(await c.query(`SELECT * FROM push_outbox WHERE status IN ('pending','sending') AND available_at<=now() AND expires_at>now() ORDER BY CASE WHEN kind='live-end' THEN 0 ELSE 1 END,created_at FOR UPDATE SKIP LOCKED LIMIT 1`)).rows[0];
   if(!result)return;
   await c.query("UPDATE push_outbox SET status='sending',lease=$2,available_at=now()+interval '60 seconds',attempts=attempts+1 WHERE id=$1",[result.id,lease]);
   return result;
  });
  if(!job)break;
  // Revalidate at delivery time; data may have changed after enqueueing.
  const delivery=await db.transaction(async c=>{
   const d=(await c.query<PushDevice>(`SELECT d.* FROM push_devices d JOIN accounts a ON a.id=d.account_id WHERE d.id=$1 AND d.account_id=$2 AND d.enabled AND a.status<>'banned' AND a.roles::jsonb ? 'student' AND EXISTS(SELECT 1 FROM sessions s WHERE s.token_hash=d.session_hash AND s.account_id=d.account_id AND s.expires_at>$3)`,[job.device_id,job.account_id,Date.now()])).rows[0];
   if(!d)return;
   const live=job.kind.startsWith('live-'),token=live?job.token:d.token;if(!token)return;
   if(!live&&(!d.settings.notifications||!['authorized','provisional','ephemeral'].includes(d.authorization_status)))return;
   if(live&&job.kind!=='live-end'&&!d.settings.liveActivities)return;
   const payload=job.payload;
   if(job.kind==='alert'){
    const target=payload.target;
    if(target?.kind==='room'){
     if(!d.settings.teams)return;
     const room=(await c.query("SELECT data::jsonb AS data FROM entities WHERE id=$1 AND kind='room'",[target.id])).rows[0];
     if(!room||!room.data.members?.includes(d.account_id)||room.data.visibility!=='visible')return;
    }else if(!d.settings.messages)return;
    if(target?.kind==='directChat'){
     const blocked=(await c.query("SELECT 1 FROM entities WHERE kind='socialEdge' AND data::jsonb->>'kind'='block' AND data::jsonb->>'enabled'='true' AND ((owner_id=$1 AND data::jsonb->>'targetId'=$2) OR (owner_id=$2 AND data::jsonb->>'targetId'=$1))",[d.account_id,target.id])).rowCount;
     if(blocked)return;
    }
    if(payload.notificationID){const n=(await c.query('SELECT read_at FROM notifications WHERE id=$1 AND recipient_id=$2',[payload.notificationID,d.account_id])).rows[0];if(!n||n.read_at)return;}
   }
   if(job.kind==='reminder'||(live&&job.kind!=='live-end')){
    const agenda=await loadAgenda(c,d.account_id),item=agenda.find(i=>i.id===job.source_id);if(!item)return;
    if(job.kind==='reminder'){
     const minutes=item.kind==='course'?d.settings.courseMinutes:d.settings.arrangementMinutes;
     const now=Date.now()/1000;
     if(!minutes||item.version!==job.version||now<item.start-minutes*60||now>=item.start)return;
    }
    if(live){const binding=(await c.query('SELECT state FROM push_live_bindings WHERE device_id=$1 AND occurrence_id=$2',[d.id,job.source_id])).rows[0];if(!binding||['ended','ending','dismissed'].includes(binding.state))return;
     if(item.version!==payload.aps['content-state'].version)return;
     payload.aps.timestamp=Math.floor(Date.now()/1000);payload.aps['content-state']=liveContent(item);
    }
   }
   if(!live){const unread=(await c.query("SELECT count(*) FROM notifications n WHERE n.recipient_id=$1 AND n.read_at IS NULL AND CASE WHEN event LIKE 'room.%' THEN COALESCE((SELECT (data::jsonb->>'teams')::boolean FROM entities WHERE kind='preferences' AND owner_id=$1 LIMIT 1),true) ELSE COALESCE((SELECT (data::jsonb->>'messages')::boolean FROM entities WHERE kind='preferences' AND owner_id=$1 LIMIT 1),true) END",[d.account_id])).rows[0];payload.aps.badge=Number(unread.count);}
   return {token,environment:d.environment,type:live?'liveactivity':'alert',payload,expires:new Date(job.expires_at).getTime()/1000,collapse:collapseID(`${job.device_id}:${job.kind}:${job.source_id}`)} as APNsMessage;
  });
  if(!delivery){await db.pool.query("UPDATE push_outbox SET status='cancelled' WHERE id=$1 AND lease=$2",[job.id,lease]);continue;}
  let result:APNsResult;try{result=await transport(delivery);}catch{result={status:503,reason:'TransportUnavailable'};}
  const retry=result.status===429||result.status>=500;
  await db.transaction(async c=>{
   const status=result.status===200?'sent':retry?'pending':'failed';
   await c.query("UPDATE push_outbox SET status=$3,last_error=$4,available_at=now()+($5*interval '1 second') WHERE id=$1 AND lease=$2 AND status='sending'",[job.id,lease,status,result.reason.slice(0,100),Math.min(900,2**Math.min(job.attempts+1,9)*5)]);
   if(result.status===200&&job.kind==='live-end')await c.query("UPDATE push_live_bindings SET state='ended',token=NULL WHERE device_id=$1 AND occurrence_id=$2 AND state='ending'",[job.device_id,job.source_id]);
   if(result.status===410||['BadDeviceToken','DeviceTokenNotForTopic','Unregistered'].includes(result.reason)){
    if(job.kind==='alert'||job.kind==='reminder')await c.query('UPDATE push_devices SET token=NULL WHERE id=$1 AND token=$2',[job.device_id,delivery.token]);
    else if(job.kind==='live-start')await c.query('UPDATE push_devices SET push_start_token=NULL WHERE id=$1 AND push_start_token=$2',[job.device_id,delivery.token]);
    else await c.query("UPDATE push_live_bindings SET token=NULL,state='ended' WHERE device_id=$1 AND token=$2",[job.device_id,delivery.token]);
   }
  });
 }
}
export function startPushWorker(db:PostgresDatabase){
 let running=false,stopped=false;
 async function tick(){if(running||stopped||!apnsConfigured())return;running=true;try{await schedulePush(db);await deliverPush(db);}catch{console.error('Push worker failed; pending jobs will retry.');}finally{running=false;}}
 const timer=setInterval(()=>void tick(),30_000);timer.unref();void tick();
 if(!apnsConfigured())console.log('APNs not configured; remote notifications and remote Live Activities are disabled.');
 return {stop(){stopped=true;clearInterval(timer);}};
}
