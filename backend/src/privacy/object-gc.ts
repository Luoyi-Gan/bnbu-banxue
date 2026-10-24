import type {PostgresDatabase} from '../storage/postgres';
import {configuredObjectStore} from '../storage/cos-object-store';
import type {ObjectStore} from '../storage/object-store';
import {imageKeys} from './plan';
// GC is transactional and shares a lock with every stored-image upload. A key still in use is kept.
export async function collectPrivacyObjects(db:PostgresDatabase,store:ObjectStore=configuredObjectStore()){
 return db.transaction(async client=>{
  await client.query('SELECT pg_advisory_xact_lock(18422,42)');
  const jobs=(await client.query('SELECT object_key FROM privacy_object_gc ORDER BY queued_at LIMIT 50')).rows;
  await client.query('DELETE FROM account_deletion_receipts WHERE expires_at<$1',[Date.now()]);
  if(!jobs.length)return;
  const live=new Set<string>();
  for(const table of ['entities','audit','command_receipts']){
   const column=table==='command_receipts'?'result':'data';
   for(const row of (await client.query(`SELECT ${column} AS value FROM ${table}`)).rows)imageKeys(row.value,live);
  }
  for(const {object_key:key}of jobs){
   if(live.has(key)){await client.query('DELETE FROM privacy_object_gc WHERE object_key=$1',[key]);continue;}
   try{await store.delete(key);await client.query('DELETE FROM privacy_object_gc WHERE object_key=$1',[key]);}
   catch{await client.query('UPDATE privacy_object_gc SET attempts=attempts+1 WHERE object_key=$1',[key]);}
  }
  await client.query('DELETE FROM account_deletion_receipts WHERE expires_at<$1',[Date.now()]);
 });
}
export function startPrivacyGC(db:PostgresDatabase){
 let busy=false;
 const tick=async()=>{if(busy)return;busy=true;try{await collectPrivacyObjects(db);}catch{console.error('Privacy object cleanup deferred; pending jobs remain in privacy_object_gc.');}finally{busy=false;}};
 const timer=setInterval(()=>void tick(),30_000);timer.unref();void tick();
 return ()=>clearInterval(timer);
}
