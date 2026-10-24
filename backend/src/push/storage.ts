import {createHash,randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';
import {demand,digest,type Account} from '../auth';
import type {Fields,Entity} from '../repository';
import {defaultPushSettings,validateSettings,projectPushAgenda,type PushTarget,type PushSettings} from './agenda';
import {apnsConfigured} from './apns';
export const pushMigration={version:13,sql:`
ALTER TABLE notifications ADD COLUMN target JSONB;
CREATE TABLE push_devices(id TEXT PRIMARY KEY,secret_hash TEXT NOT NULL,account_id TEXT NOT NULL REFERENCES accounts(id),session_hash TEXT NOT NULL,token TEXT,environment TEXT NOT NULL CHECK(environment IN ('sandbox','production')),language TEXT NOT NULL DEFAULT 'zh',authorization_status TEXT NOT NULL DEFAULT 'notDetermined',settings JSONB NOT NULL,enabled BOOLEAN NOT NULL DEFAULT true,push_start_token TEXT,updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE UNIQUE INDEX push_device_token ON push_devices(environment,token) WHERE token IS NOT NULL;
CREATE TABLE push_live_bindings(device_id TEXT NOT NULL REFERENCES push_devices(id),occurrence_id TEXT NOT NULL,activity_id TEXT,token TEXT,version TEXT NOT NULL,state TEXT NOT NULL,content JSONB NOT NULL,started_at BIGINT NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(device_id,occurrence_id));
CREATE TABLE push_outbox(id TEXT PRIMARY KEY,device_id TEXT NOT NULL REFERENCES push_devices(id),account_id TEXT NOT NULL,source_id TEXT NOT NULL,kind TEXT NOT NULL,version TEXT NOT NULL,payload JSONB NOT NULL,token TEXT,expires_at TIMESTAMPTZ NOT NULL,available_at TIMESTAMPTZ NOT NULL DEFAULT now(),status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,lease TEXT,last_error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(device_id,source_id,kind,version));
CREATE INDEX push_outbox_ready ON push_outbox(status,available_at);
`};
export type PushDevice={id:string;account_id:string;session_hash:string;token:string|null;environment:'sandbox'|'production';language:string;authorization_status:string;settings:PushSettings;enabled:boolean;push_start_token:string|null};
export const noticeCategory=(event:string)=>event.startsWith('activity.')?'活动':/^(coffee|alumni\.booking|alumni\.slot|room)\./.test(event)?'交流':/^(post|comment|community)\./.test(event)?'社区':'系统';
export async function notificationTarget(client:PoolClient,recipient:string,entityID:string|null,event:string):Promise<PushTarget|undefined>{
 if(event==='community.follow')return {kind:'followers',id:recipient};
 if(!entityID)return;
 const row=(await client.query('SELECT kind,owner_id,data::jsonb AS data FROM entities WHERE id=$1',[entityID])).rows[0];if(!row)return;
 if(event==='community.direct'&&row.kind==='directMessage'&&row.data.targetId===recipient)return {kind:'directChat',id:row.owner_id};
 if(row.kind==='activity')return {kind:'activity',id:entityID};
 if(row.kind==='coffeeBooking')return {kind:'coffeeBookings',id:entityID};
 if(row.kind==='room')return {kind:'room',id:entityID};
 if(row.kind==='roomApplication')return {kind:'room',id:row.data.roomId};
 if(row.kind==='comment')return {kind:'post',id:row.data.postId};
 if(row.kind==='post'&&!/hidden|delete|removed|rejected/.test(event))return {kind:'post',id:entityID};
}
export async function enqueue(client:PoolClient,device:PushDevice,source:string,kind:string,version:string,payload:object,expires:number,token:string|null=null){
 await client.query('INSERT INTO push_outbox(id,device_id,account_id,source_id,kind,version,payload,expires_at,token) VALUES($1,$2,$3,$4,$5,$6,$7,to_timestamp($8),$9) ON CONFLICT DO NOTHING',[randomUUID(),device.id,device.account_id,source,kind,version,JSON.stringify(payload),expires,token]);
}
export async function enqueueNotice(client:PoolClient,recipient:string,id:string,event:string,body:string,target?:PushTarget){
 const devices=(await client.query<PushDevice>('SELECT * FROM push_devices WHERE account_id=$1 AND enabled',[recipient])).rows;
 for(const d of devices){if(!d.settings.notifications||!d.token||!['authorized','provisional','ephemeral'].includes(d.authorization_status)||(event.startsWith('room.')?!d.settings.teams:!d.settings.messages))continue;
 const english=d.language==='en';const chat=event==='community.direct'||event==='room.message';
 const payload={aps:{alert:{title:english?'Huitongli':'会同里',body:chat?(english?'You received a new message.':'你收到了一条新消息。'):body.slice(0,500)},sound:'default','thread-id':target?`${target.kind}:${target.id}`:noticeCategory(event)},accountID:recipient,notificationID:event==='room.message'?null:id,target:target??{kind:'notification',id}};
 await enqueue(client,d,id,'alert','1',payload,Date.now()/1000+3600);
 }
}
export async function loadAgenda(client:PoolClient,accountID:string){
 const rows=(await client.query("SELECT id,kind,owner_id,data::jsonb AS data,version,created_at,updated_at FROM entities WHERE (owner_id=$1 AND kind IN ('preferences','timetable','coffeeBooking')) OR kind IN ('activity','coffeeSlot','alumniState')",[accountID])).rows;
 const entities=rows.map(r=>({id:r.id,kind:r.kind,ownerId:r.owner_id,data:r.data,version:r.version,createdAt:r.created_at,updatedAt:r.updated_at})) as Entity[];
 const relations=(await client.query<{entity_id:string;kind:string}>('SELECT entity_id,kind FROM relations WHERE account_id=$1 AND kind=\'participate\'',[accountID])).rows;
 return projectPushAgenda(accountID,entities,relations);
}
export async function pushDeviceRequest(client:PoolClient,actor:Account,session:string,action:string,input:Fields){
 demand(actor.roles.includes('student')&&actor.status!=='banned','当前账号不可启用推送。',403);
 const id=String(input.installationID??''),secret=String(input.installationSecret??'');
 demand(/^[a-zA-Z0-9-]{32,64}$/.test(id)&&/^[a-zA-Z0-9-]{32,128}$/.test(secret),'设备标识无效。');
 await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['push-device:'+id]);
 const old=(await client.query('SELECT * FROM push_devices WHERE id=$1',[id])).rows[0];
 demand(!old||old.secret_hash===digest(secret),'设备绑定无效。',403);
 const token=(v:unknown)=>{if(v==null||v==='')return null;demand(typeof v==='string'&&/^[a-f0-9]{32,1024}$/.test(v),'推送 token 无效。');return v;};
 if(action==='register'){
  demand(input.environment==='sandbox'||input.environment==='production','推送环境无效。');
  demand(['notDetermined','denied','authorized','provisional','ephemeral'].includes(String(input.authorization)),'通知权限无效。');
  let settings:PushSettings;try{settings=validateSettings((input.settings??defaultPushSettings) as Fields);}catch{demand(false,'提醒设置无效。');}
  settings.pushInputToken=input.supportsPushInputToken===true;
  const pushToken=token(input.token),startToken=token(input.pushStartToken);
  if(startToken){
   await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['push-start:'+input.environment+':'+startToken]);
   await client.query('UPDATE push_devices SET enabled=false,token=NULL,push_start_token=NULL WHERE push_start_token=$1 AND environment=$2 AND id<>$3',[startToken,input.environment,id]);
  }
  if(old&&(old.account_id!==actor.id||old.session_hash!==digest(session))){await client.query("UPDATE push_outbox SET status='cancelled' WHERE device_id=$1 AND status IN ('pending','sending')",[id]);await client.query('DELETE FROM push_live_bindings WHERE device_id=$1',[id]);}
  // A reinstall can produce a new installation ID for the same APNs token.
  if(pushToken)await client.query('UPDATE push_devices SET enabled=false,token=NULL WHERE token=$1 AND environment=$2 AND id<>$3',[pushToken,input.environment,id]);
  await client.query(`INSERT INTO push_devices(id,secret_hash,account_id,session_hash,token,environment,language,authorization_status,settings,push_start_token) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET account_id=EXCLUDED.account_id,session_hash=EXCLUDED.session_hash,token=EXCLUDED.token,environment=EXCLUDED.environment,language=EXCLUDED.language,authorization_status=EXCLUDED.authorization_status,settings=EXCLUDED.settings,push_start_token=EXCLUDED.push_start_token,enabled=true,updated_at=now()`,[id,digest(secret),actor.id,digest(session),pushToken,input.environment,input.language==='en'?'en':'zh',input.authorization,JSON.stringify(settings),startToken]);
  // Persist user/system removals across session renewal and offline callbacks.
  const suppressed=Array.isArray(input.suppressedOccurrences)?input.suppressedOccurrences.filter((v):v is string=>typeof v==='string'&&v.length<=200).slice(-200):[];
  if(suppressed.length)for(const item of await loadAgenda(client,actor.id)){
   if(!suppressed.includes(item.id))continue;
   await client.query(`INSERT INTO push_live_bindings(device_id,occurrence_id,version,state,content,started_at) VALUES($1,$2,$3,'dismissed',$4,$5) ON CONFLICT(device_id,occurrence_id) DO UPDATE SET state='dismissed',token=NULL`,[id,item.id,item.version,JSON.stringify(item),Math.floor(Date.now()/1000)]);
  }
 }else{
  demand(old?.account_id===actor.id&&old.enabled,'设备不属于当前账号。',403);
  if(action==='unbind'){
   await client.query('UPDATE push_devices SET enabled=false,token=NULL,push_start_token=NULL WHERE id=$1',[id]);
   await client.query("UPDATE push_outbox SET status='cancelled' WHERE device_id=$1 AND status IN ('pending','sending')",[id]);
   await client.query("UPDATE push_live_bindings SET state='ended',token=NULL WHERE device_id=$1",[id]);
  }else if(action==='activity'){
   const occurrenceID=String(input.occurrenceID??''),state=String(input.state??'active');
   demand(['active','dismissed','ended'].includes(state)&&occurrenceID.length<=200,'实时活动状态无效。');
   const occurrence=(await loadAgenda(client,actor.id)).find(i=>i.id===occurrenceID);
   const binding=(await client.query('SELECT * FROM push_live_bindings WHERE device_id=$1 AND occurrence_id=$2',[id,occurrenceID])).rows[0];
   demand(occurrence||binding,'安排不存在。',404);
   demand(!occurrence||occurrence.start<=Date.now()/1000+900,'安排尚未进入展示时间。');
   await client.query(`INSERT INTO push_live_bindings(device_id,occurrence_id,activity_id,token,version,state,content,started_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(device_id,occurrence_id) DO UPDATE SET activity_id=EXCLUDED.activity_id,token=EXCLUDED.token,state=CASE WHEN push_live_bindings.state IN ('dismissed','ended','ending') THEN push_live_bindings.state ELSE EXCLUDED.state END,updated_at=now()`,[id,occurrenceID,String(input.activityID??'').slice(0,200),token(input.token),occurrence?.version??binding.version,state,JSON.stringify(occurrence??binding.content),Math.floor(Date.now()/1000)]);
  }else demand(false,'接口不存在。',404);
 }
 return {configured:apnsConfigured(),agenda:action==='unbind'?[]:await loadAgenda(client,actor.id)};
}
export async function readNotices(client:PoolClient,actor:Account,query:URLSearchParams){
 const category=query.get('category')??'全部',unread=query.get('unread')==='1',cursor=query.get('cursor');let after=['9999',''];
 if(cursor){try{after=JSON.parse(Buffer.from(cursor,'base64url').toString());}catch{demand(false,'分页标识无效。');}demand(Array.isArray(after)&&after.length===2&&after.every(x=>typeof x==='string'&&x.length<100),'分页标识无效。');}
 const rows=(await client.query(`SELECT id,entity_id AS "entityId",event,body,created_at AS "createdAt",read_at AS "readAt",target FROM notifications WHERE recipient_id=$1 AND (created_at,id)<($2,$3) AND (NOT $4 OR read_at IS NULL) AND ($5='全部' OR CASE WHEN event LIKE 'activity.%' THEN '活动' WHEN event ~ '^(coffee|alumni\\.booking|alumni\\.slot|room)\\.' THEN '交流' WHEN event ~ '^(post|comment|community)\\.' THEN '社区' ELSE '系统' END=$5) ORDER BY created_at DESC,id DESC LIMIT 41`,[actor.id,...after,unread,category])).rows;
 const count=Number((await client.query('SELECT count(*) FROM notifications WHERE recipient_id=$1 AND read_at IS NULL',[actor.id])).rows[0].count),page=rows.slice(0,40),last=page.at(-1);
 return {notifications:page,unreadCount:count,nextCursor:rows.length>40&&last?Buffer.from(JSON.stringify([last.createdAt,last.id])).toString('base64url'):null};
}
export const collapseID=(s:string)=>createHash('sha256').update(s).digest('hex');
