import {spawnSync} from 'node:child_process';
import type {SQLInputValue} from 'node:sqlite';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../src/database';
import {createApiServer} from '../src/main';
import {createPostgresApiServer} from '../src/postgres-api';
import {PostgresDatabase} from '../src/storage/postgres';
import {postgresMigrations} from '../src/storage/postgres-schema';
import {digest,encodePassword} from '../src/auth';
import {collectPrivacyObjects} from '../src/privacy/object-gc';
import {LocalObjectStore} from '../src/storage/object-store';
import {deletionPlan} from '../src/privacy/plan';
import {LearningAuth} from '../src/learning-auth';
import {sqliteLearningStore} from '../src/learning-store';
let checks=0;const check=(condition:unknown,message:string)=>{assert.ok(condition,message);checks++;};
const mode=process.argv.includes('--postgres')?'postgres':'sqlite';
const schema='privacy_test_'+randomUUID().replaceAll('-','');
const directory=await mkdtemp(join(tmpdir(),'bnbu-privacy-'));process.env.BNBU_OBJECT_DIRECTORY=directory;
delete process.env.BNBU_EMAIL_DELIVERY_URL;
const db=mode==='sqlite'?openDatabase(':memory:'):new PostgresDatabase({connectionString:process.env.DATABASE_URL,options:`-c search_path=${schema}`});
const sql=async(text:string,args:unknown[]=[])=>{
 if('prepare'in db){const stmt=db.prepare(text);return text.startsWith('SELECT')?stmt.all(...args as SQLInputValue[]):(stmt.run(...args as SQLInputValue[]),[]);}
 let n=0;return (await db.pool.query(text.replace(/\?/g,()=>`$${++n}`),args)).rows;
};
let server:ReturnType<typeof createApiServer>|undefined;
try{
 if(db instanceof PostgresDatabase){await db.pool.query(`CREATE SCHEMA "${schema}"`);await db.migrate(postgresMigrations);await db.migrate(postgresMigrations);}
 if(db instanceof PostgresDatabase){
  const snapshot=await db.transaction(async c=>{
   await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
   return (await c.query("SELECT current_setting('transaction_isolation') AS isolation,pg_backend_pid() AS pid")).rows[0];
  });
  check(snapshot.isolation==='repeatable read','snapshot readers can set isolation before their first query');
  let failedPID=0;
  await assert.rejects(db.transaction(async c=>{failedPID=(await c.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;throw Error('rollback barrier test');}));
  const locks=await db.pool.query("SELECT 1 FROM pg_locks WHERE pid=ANY($1::int[]) AND locktype='advisory' AND classid=18422 AND objid=43",[[snapshot.pid,failedPID]]);
  check(locks.rows.length===0,'privacy barrier is released after commit and rollback');
  await db.pool.query('CREATE TABLE privacy_snapshot_probe(value INTEGER)');
  let release!:()=>void,entered!:()=>void,readerEntered=false;
  const started=new Promise<void>(r=>entered=r),hold=new Promise<void>(r=>release=r);
  const writer=db.transaction(async c=>{await c.query('INSERT INTO privacy_snapshot_probe VALUES(1)');entered();await hold;},true);
  await started;
  const reader=db.transaction(async c=>{readerEntered=true;await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');return (await c.query('SELECT * FROM privacy_snapshot_probe')).rows.length;});
  await new Promise(r=>setTimeout(r,30));const waited=!readerEntered;
  release();await writer;
  check(waited,'snapshot reader waits outside BEGIN for exclusive erasure');
  check(await reader===1,'waiting snapshot sees data committed before the erasure barrier was released');
 }

 const now=new Date().toISOString(),password='Delete-test-password-9';
 const addAccount=async(id:string,kind='PERSONAL')=>{
  await sql('INSERT INTO accounts(id,email,password_hash,name,roles,created_at,login_kind,login_name) VALUES(?,?,?,?,?,?,?,?)',[id,id+'@example.invalid',encodePassword(password),'Synthetic '+id,'[]',now,kind,kind==='ADMIN'?id:null]);
  await sql('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)',[digest('token-'+id),id,Date.now()+3600000,now]);
 };
 for(const id of ['a','b','code','limit','expired','retry','rollback','concurrent','admin'])await addAccount(id,id==='admin'?'ADMIN':'PERSONAL');
 const entity=async(id:string,kind:string,owner:string|null,data:unknown)=>sql('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)',[id,kind,owner,JSON.stringify(data),now,now]);
 const store=new LocalObjectStore(directory),ownImage=await store.put(Buffer.from('own'),'image/png'),sharedImage=await store.put(Buffer.from('shared'),'image/png');
 const image=(key:string)=>({$bnbuStoredImage:key,contentType:'image/png'});
 await entity('post-a','post','a',{body:'private authored text',images:[image(ownImage),image(sharedImage)]});
 await entity('post-b','post','b',{body:'unrelated content',images:[image(sharedImage)]});
 await entity('comment-b','comment','b',{postId:'post-a',body:'reply to removed post'});
 await entity('dm-b','directMessage','b',{targetId:'a',body:'private inbox'});
 await entity('room-a','room','a',{members:['a','b']});
 await entity('room-b','room','b',{members:['a','b'],title:'Keep other room'});
 await entity('message-b','message','b',{roomId:'room-a',body:'dependent'});
 await entity('booking-a','coffeeBooking','a',{slotId:'slot-b',teacherId:'b'});
 await entity('slot-b','coffeeSlot','b',{capacity:1});
 await entity('school-a','schoolLink','a',{username:'school-identity'});
 await entity('alumni','alumniState',null,{value:{profiles:[{id:'alumni-a',owner:'a',name:'name-a'},{id:'alumni-b',owner:'b',name:'name-b'}],slots:[{id:'alumni-slot-a',alumniId:'alumni-a'}],bookings:[{id:'alumni-booking-b',slotId:'alumni-slot-a',student:'b'}],follows:[{student:'b',alumniId:'alumni-a'}],history:[{actor:'b',objectId:'alumni-booking-b',reason:'private'}]}});
 await sql('INSERT INTO relations(account_id,entity_id,kind,created_at) VALUES(?,?,?,?)',['b','post-a','like',now]);
 await sql('INSERT INTO post_views(post_id,viewer_id,open_id,viewed_at) VALUES(?,?,?,?)',['post-a','b','view-a',now]);
 await sql('INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES(?,?,?,?,?,?)',['notice-b','b','post-a','post.comment','removed author notification',now]);
 await sql('INSERT INTO command_receipts(actor_id,request_id,request_hash,result,created_at) VALUES(?,?,?,?,?)',['b','old-result','hash',JSON.stringify({id:'post-a',data:'private snapshot'}),now]);
 await sql('INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)',['audit-b','b','student','read','post-a','',JSON.stringify({images:[image(ownImage)]}),now]);
 await sql('INSERT INTO email_challenges(email,code_hash,expires_at,sent_at) VALUES(?,?,?,?)',['login:a@example.invalid','hash',Date.now()+100000,Date.now()]);
 await sql('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)',['mail-a','a@example.invalid','login','123456',now]);
 if(db instanceof PostgresDatabase){
  await sql("INSERT INTO push_devices(id,secret_hash,account_id,session_hash,environment,settings) VALUES('device-a','secret','a','session','sandbox','{}')");
  await sql("INSERT INTO push_live_bindings(device_id,occurrence_id,version,state,content,started_at) VALUES('device-a','occurrence','1','active','{}',0)");
  await sql("INSERT INTO push_outbox(id,device_id,account_id,source_id,kind,version,payload,expires_at) VALUES('push-a','device-a','a','notice-b','alert','1','{}',now())");
 }
 server=db instanceof PostgresDatabase?createPostgresApiServer(db,{localOutbox:true}):createApiServer(db,{localOutbox:true});
 await new Promise<void>(resolve=>server!.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
 const post=async(id:string,path:string,body:unknown,extra:Record<string,string>={})=>fetch(base+path,{method:'POST',headers:{cookie:'bnbu_session=token-'+id,'content-type':'application/json',...extra},body:JSON.stringify(body)});
 const policy=await fetch(base+'/privacy');
 check(policy.status===200&&(await policy.text()).includes('珠海澄序智能科技有限公司'),'policy public without authentication');
 const policyJSON=await (await fetch(base+'/api/privacy-policy')).json();
 check(policyJSON.version==='2026-10-24'&&policyJSON.sections.length===9&&policyJSON.sections.some((section:string[])=>section[0]==='课表照片识别'&&section.length===4),'versioned bilingual policy available');
 const confirm='/api/account/deletion/confirm',request='/api/account/deletion/request';
 const payload=(credential:unknown={password})=>({requestId:randomUUID(),confirmed:true,...credential as object});
 check((await post('none',confirm,payload())).status===401,'unauthenticated rejected');
 check((await post('a',confirm,{...payload(),accountID:'b'})).status===400,'cannot target another account');
 check((await post('a',confirm,{...payload(),confirmed:false})).status===400,'explicit confirmation required');
 check((await post('admin',confirm,payload())).status===403,'admin not deleted through personal flow');
 check((await post('a',confirm,payload(),{'sec-fetch-site':'cross-site'})).status===403,'CSRF rejected');
 check((await post('a',request,{email:'b@example.invalid'})).status===400,'OTP cannot be redirected');
 check((await post('a',confirm,payload({password:'wrong'}))).status===400,'wrong password rejected');
 check((await sql("SELECT * FROM accounts WHERE id='a'")).length===1,'failed auth preserves account');
 const data=payload();const response=await post('a',confirm,data);const receipt=await response.json();
 check(response.status===200&&receipt.deleted===true&&receipt.requestId===data.requestId,'password deletion succeeds: '+JSON.stringify(receipt));
 check(response.headers.get('set-cookie')?.includes('Max-Age=0'),'session cookie expires');
 check((await sql("SELECT * FROM accounts WHERE id='a'")).length===0,'actual hard deletion');
 check((await sql("SELECT * FROM sessions WHERE account_id='a'")).length===0,'all sessions removed');
 check((await fetch(base+'/api/auth/me',{headers:{cookie:'bnbu_session=token-a'}})).status===401,'old token cannot authenticate');
 check((await post('a',confirm,data)).status===200,'lost response retry succeeds');
 check((await post('none',confirm,data)).status!==200,'receipt cannot be used from another session');
 check((await post('a',confirm,{...data,password:'changed'})).status===409,'receipt bound to original request contents');
 const remaining=await sql('SELECT * FROM entities');
 check(remaining.map(r=>r.id).sort().join(',')==='alumni,post-b,room-b,slot-b','dependent entities deleted, unrelated content preserved');
 check(JSON.parse(remaining.find(r=>r.id==='room-b')!.data as string).members.join(',')==='b','other room membership removed only');
 const alumni=JSON.parse(remaining.find(r=>r.id==='alumni')!.data as string).value;
 check(alumni.profiles.length===1&&alumni.profiles[0].owner==='b'&&alumni.slots.length===0&&alumni.bookings.length===0&&alumni.history.length===0,'shared alumni closure removed');
 for(const table of ['relations','post_views','notifications','command_receipts','audit','mail_outbox','email_challenges'])check((await sql(`SELECT * FROM ${table}`)).length===0,table+' clears dependent copies');
 check((await sql('SELECT * FROM account_erasure_log'))[0].account_hash===digest('a'),'restore log is pseudonymous');
 if(db instanceof PostgresDatabase){
  for(const table of ['push_devices','push_live_bindings','push_outbox'])check((await sql(`SELECT * FROM ${table}`)).length===0,table+' removed');
  await collectPrivacyObjects(db,{put:store.put.bind(store),get:store.get.bind(store),delete:async()=>{throw Error('temporary storage failure');}});
  check((await sql('SELECT * FROM privacy_object_gc')).length===1,'failed object deletion stays queued, shared object excluded');
  await collectPrivacyObjects(db,store);
  await assert.rejects(readFile(join(directory,ownImage)));checks++;
  check((await store.get(sharedImage)).toString()==='shared','shared image remains accessible');
  check((await sql('SELECT * FROM privacy_object_gc')).length===0,'object retry succeeds');
 }
 check((await post('code',request,{})).status===200,'dedicated OTP can be issued without platform password');
 check((await post('code',request,{})).status===429,'OTP cooldown');
 const mail=(await sql("SELECT * FROM mail_outbox WHERE recipient='code@example.invalid'"))[0];const code=String(mail.body).match(/\d{6}/)![0];
 check((await post('code',confirm,payload({code:'000000'}))).status===400,'wrong OTP rejected');
 check(Number((await sql("SELECT attempts FROM account_deletion_challenges WHERE account_id='code'"))[0].attempts)===1,'failed OTP counter commits');
 check((await post('code',confirm,payload({code}))).status===200,'email-only account can delete');
 await post('expired',request,{});await sql("UPDATE account_deletion_challenges SET expires_at=0 WHERE account_id='expired'");
 check((await post('expired',confirm,payload({code:'123456'}))).status===400,'expired code rejected');
 for(let i=0;i<5;i++)check((await post('limit',confirm,payload({password:'wrong'}))).status===400,'bad password counted');
 check((await post('limit',confirm,payload())).status===429,'brute force rate limited');
 const retryData=payload();const concurrent=await Promise.all([post('retry',confirm,retryData),post('retry',confirm,retryData)]);
 check(concurrent.every(r=>r.status===200),'parallel duplicate requests get one deletion and same receipt');
 // A database failure after dependent deletes must roll everything back, including receipts.
 await entity('rollback-owned','preferences','rollback',{private:'keep if rollback'});
 if(db instanceof PostgresDatabase){
  await db.pool.query(`CREATE FUNCTION privacy_test_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.id='rollback' THEN RAISE EXCEPTION 'Synthetic rollback fault'; END IF; RETURN OLD; END; $$; CREATE TRIGGER privacy_test_fail BEFORE DELETE ON accounts FOR EACH ROW EXECUTE FUNCTION privacy_test_fail()`);
 }else db.exec("CREATE TRIGGER privacy_test_fail BEFORE DELETE ON accounts WHEN OLD.id='rollback' BEGIN SELECT RAISE(ABORT,'Synthetic rollback fault'); END");
 const rollbackRequest=payload();
 check((await post('rollback',confirm,rollbackRequest)).status>=400,'injected DB failure does not return success');
 check((await sql("SELECT * FROM entities WHERE id='rollback-owned'")).length===1&&(await sql("SELECT * FROM accounts WHERE id='rollback'")).length===1,'rollback restores dependent data and account');
 check((await sql('SELECT * FROM account_deletion_receipts WHERE request_id=?',[rollbackRequest.requestId])).length===0,'failed transaction has no success receipt');
 if(db instanceof PostgresDatabase)await db.pool.query('DROP TRIGGER privacy_test_fail ON accounts; DROP FUNCTION privacy_test_fail()');else db.exec('DROP TRIGGER privacy_test_fail');
 check((await post('rollback',confirm,rollbackRequest)).status===200,'same request can recover after rollback');
 if(db instanceof PostgresDatabase){
  let release!:()=>void,entered!:()=>void;
  const started=new Promise<void>(r=>entered=r),hold=new Promise<void>(r=>release=r);
  const writer=db.transaction(async c=>{await c.query("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES('concurrent-write','preferences','concurrent','{}',$1,$1)",[now]);entered();await hold;});
  await started;
  const erase=post('concurrent',confirm,payload());
  await new Promise(r=>setTimeout(r,30));
  release();await writer;
  check((await erase).status===200&&(await sql("SELECT * FROM entities WHERE owner_id='concurrent'")).length===0,'erasure waits for concurrent transaction and deletes its committed data');
 }
 if(db instanceof PostgresDatabase){
  const url=new URL(process.env.DATABASE_URL!);url.searchParams.set('options','-c search_path='+schema);
  const env={...process.env,PRIVACY_DATABASE_URL:url.toString()},ledger=join(directory,'erasure-ledger.json');
  const maintenance=(action:string)=>spawnSync(process.execPath,['scripts/check-erasure-restore.mjs',action,ledger],{env,encoding:'utf8'});
  check(maintenance('--export').status===0,'maintenance exports a private erasure ledger');
  check(maintenance('--export').status===2,'maintenance never overwrites an existing ledger');
  check(maintenance('--check').status===0,'clean restore check succeeds');
  await addAccount('a');
  check(maintenance('--check').status===1,'restore check blocks a resurrected deleted account');
 }
 const plan=deletionPlan([{id:'p',kind:'post',owner_id:'a',data:'{}'},{id:'other',kind:'post',owner_id:'b',data:JSON.stringify({body:'ordinary text mentions a, retained'})}],'a');
 check(!plan.deleted.has('other'),'free text from other people is not indiscriminately erased');
 if('prepare'in db){const auth=new LearningAuth(sqliteLearningStore(db));auth.forgetAccount('already-absent');checks++;}
 console.log(`Privacy ${mode}: ${checks} assertions passed`);
}finally{
 if(server)await new Promise<void>(resolve=>server!.close(()=>resolve()));
 if(db instanceof PostgresDatabase){
  // Drain in-flight GC before dropping tables; cleanup must not mask an assertion
  // with a DDL deadlock against a still-running background transaction.
  await db.close();
  const cleanup=new PostgresDatabase({connectionString:process.env.DATABASE_URL});
  try{await cleanup.pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);}finally{await cleanup.close();}
 }else db.close();
 await rm(directory,{recursive:true,force:true});
}
