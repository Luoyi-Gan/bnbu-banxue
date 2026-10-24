import {randomUUID} from 'node:crypto'
import {afterAll,beforeAll,describe,expect,it} from 'vitest'
import {Pool} from 'pg'
import {openDatabase} from '../backend/src/database'
import {createAccount,login,digest,type Account} from '../backend/src/auth'
import {execute,snapshot} from '../backend/src/commands'
import {Repository,type Fields,type Entity} from '../backend/src/repository'
import {communitySocial} from '../backend/src/community-page'
import {PostgresDatabase} from '../backend/src/storage/postgres'
import {postgresMigrations} from '../backend/src/storage/postgres-schema'
import {PostgresRepository} from '../backend/src/storage/postgres-repository'
import {executePostgres} from '../backend/src/storage/postgres-commands'
import {postgresWorkspace} from '../backend/src/storage/postgres-workspace'
import {postgresCommunitySocial} from '../backend/src/storage/postgres-community-page'
import {deletionPlan} from '../backend/src/privacy/plan'
import {pushDeviceRequest} from '../backend/src/push/storage'
import {deliverPush} from '../backend/src/push/worker'

type User={token:string;account:Account}
for(const engine of ['SQLite','PostgreSQL'] as const)describe.skipIf(engine==='PostgreSQL'&&!process.env.BNBU_TEST_POSTGRES_URL)(`${engine} chat safety`,()=>{
 const schema=`chat_${randomUUID().replaceAll('-','')}`
 let sqlite:ReturnType<typeof openDatabase>,pg:PostgresDatabase,admin:Pool
 const users:User[]=[]
 beforeAll(async()=>{
  if(engine==='SQLite')sqlite=openDatabase(':memory:')
  else {admin=new Pool({connectionString:process.env.BNBU_TEST_POSTGRES_URL});await admin.query(`CREATE SCHEMA ${schema}`);pg=new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL,options:`-c search_path=${schema}`});await pg.migrate(postgresMigrations)}
  for(const roles of [['student'],['student'],['student'],['student'],['reviewer'],['operator']]){
   const id=randomUUID(),email=`${id}@example.test`,token=randomUUID()
   if(engine==='SQLite'){createAccount(sqlite,{email,name:'Test',password:'Acceptance-123',roles});users.push(login(sqlite,email,'Acceptance-123'))}
   else {await pg.pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)',[id,email,'unused','Test',JSON.stringify(roles),new Date().toISOString()]);await pg.pool.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)',[digest(token),id,Date.now()+3600000,new Date().toISOString()]);users.push({token,account:{id,email,name:'Test',organization:'',status:'active',roles}})}
  }
 })
 afterAll(async()=>{sqlite?.close();await pg?.close();if(admin){await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await admin.end()}})
 const command=async(user:User,action:string,input:Fields,request=randomUUID())=>(engine==='SQLite'?execute(sqlite,user.token,action,input,request):await executePostgres(pg,user.token,action,input,request)) as {id:string}
 const create=async(kind:string,owner:string,data:Fields)=>engine==='SQLite'?new Repository(sqlite).create(kind,owner,data):pg.transaction(c=>new PostgresRepository(c).create(kind,owner,data))
 const get=async(id:string)=>engine==='SQLite'?new Repository(sqlite).get(id):pg.transaction(c=>new PostgresRepository(c).get(id))
 const save=async(entity:Entity,data:Fields)=>engine==='SQLite'?new Repository(sqlite).save(entity,data):pg.transaction(c=>new PostgresRepository(c).save(entity,data))
 const workspace=async(u:User)=>engine==='SQLite'?snapshot(sqlite,u.account):postgresWorkspace(pg,u.token)
 const chat=async(u:User,v:User)=>{const q=new URLSearchParams({person:v.account.id,list:'chat'});return engine==='SQLite'?communitySocial(sqlite,u.token,q):postgresCommunitySocial(pg,u.token,q)}
 const fixture=async()=>{const [a,b,c,outsider,reviewer,operator]=users;const room=await create('room',a.account.id,{title:'Chat',type:'study',capacity:10,status:'open',visibility:'visible',members:[a.account.id,b.account.id,c.account.id]});await create('post',b.account.id,{title:'Contact',body:'Hi',status:'visible'});return {a,b,c,outsider,reviewer,operator,room}}
 it('filters group and direct messages before persistence; disabled keywords allow later sends',async()=>{
  const {a,b,room,reviewer}=await fixture()
  const keyword=await command(reviewer,'keyword.save',{word:'BadWord'})
  for(const [action,input]of [['message.send',{roomId:room.id}],['direct.send',{targetId:b.account.id}]] as const){
   await expect(command(a,action,{...input,body:'ＢＡＤＷＯＲＤ'})).rejects.toThrow('屏蔽词')
   await expect(command(a,action,{...input,body:' '})).rejects.toThrow()
  }
  expect((await workspace(b)).entities.filter(e=>e.kind==='message'&&e.data.roomId===room.id)).toHaveLength(0)
  await command(reviewer,'keyword.set',{id:keyword.id,enabled:false})
  await command(a,'message.send',{roomId:room.id,body:'BadWord now allowed'})
  await command(a,'direct.send',{targetId:b.account.id,body:'BadWord now allowed'})
 })
 it('reports only received participant messages and exposes only selected evidence to reviewers',async()=>{
  const {a,b,room,outsider,reviewer,operator}=await fixture()
  const message=await command(a,'message.send',{roomId:room.id,body:'selected group evidence'})
  await command(a,'message.send',{roomId:room.id,body:'UNREPORTED_PRIVATE_NEIGHBOR'})
  await expect(command(a,'report.create',{id:message.id,reason:'self'})).rejects.toThrow()
  await expect(command(outsider,'report.create',{id:message.id,reason:'outsider'})).rejects.toThrow()
  await expect(command(b,'report.create',{id:message.id,reason:' '})).rejects.toThrow()
  const request=randomUUID(),report=await command(b,'report.create',{id:message.id,reason:'harassment'},request)
  expect(await command(b,'report.create',{id:message.id,reason:'harassment'},request)).toEqual(report)
  await expect(command(b,'report.create',{id:message.id,reason:'duplicate'})).rejects.toThrow('待处理')
  const evidence=(await workspace(reviewer)).entities.find(e=>e.id===report.id)!
  expect(evidence.data.snapshot).toEqual({title:'群聊消息',body:'selected group evidence',createdAt:(await get(message.id)).createdAt})
  expect(JSON.stringify(await workspace(reviewer))).not.toContain('UNREPORTED_PRIVATE_NEIGHBOR')
  expect((await workspace(operator)).entities.some(e=>e.id===report.id)).toBe(false)
  await expect(command(operator,'report.decide',{id:report.id,upheld:true,reason:'x'})).rejects.toThrow()
  await expect(command(reviewer,'report.decide',{id:report.id,upheld:true,reason:' '})).rejects.toThrow()
  await command(reviewer,'report.decide',{id:report.id,upheld:true,reason:'Confirmed harassment'})
  for(const u of [a,b])expect((await workspace(u)).entities.some(e=>e.id===message.id)).toBe(false)
  await expect(command(b,'message.read',{roomId:room.id,ids:[message.id]})).rejects.toThrow()
  await expect(command(reviewer,'report.decide',{id:report.id,upheld:false,reason:'again'})).rejects.toThrow('已处理')
 })
 it('direct report excludes third parties; rejection keeps the message, upheld removes chat and inbox preview',async()=>{
  const {a,b,outsider,reviewer}=await fixture()
  const msg=await command(a,'direct.send',{targetId:b.account.id,body:'direct evidence'})
  await expect(command(outsider,'report.create',{id:msg.id,reason:'x'})).rejects.toThrow()
  await expect(command(reviewer,'report.create',{id:msg.id,reason:'x'})).rejects.toThrow()
  const report=await command(b,'report.create',{id:msg.id,reason:'x'})
  await command(reviewer,'report.decide',{id:report.id,upheld:false,reason:'Not established'})
  expect((await chat(b,a)).messages?.some(m=>m.id===msg.id)).toBe(true)
  const second=await command(b,'report.create',{id:msg.id,reason:'Additional evidence'})
  await command(reviewer,'report.decide',{id:second.id,upheld:true,reason:'Confirmed'})
  for(const [u,v]of [[a,b],[b,a]])expect((await chat(u,v)).messages?.some(m=>m.id===msg.id)).toBe(false)
  await expect(chat(reviewer,a)).rejects.toThrow()
 })
 it('bidirectional block hides group messages, preserves other members and own messages; unblocking restores history',async()=>{
  const {a,b,c,room}=await fixture()
  const first=await command(a,'message.send',{roomId:room.id,body:'from a'})
  const second=await command(b,'message.send',{roomId:room.id,body:'from b'})
  await command(b,'social.block',{targetId:a.account.id,enabled:true})
  expect((await workspace(b)).entities.some(e=>e.id===first.id)).toBe(false)
  expect((await workspace(a)).entities.some(e=>e.id===second.id)).toBe(false)
  expect((await workspace(a)).entities.some(e=>e.id===first.id)).toBe(true)
  expect((await workspace(c)).entities.filter(e=>[first.id,second.id].includes(e.id))).toHaveLength(2)
  await expect(command(b,'message.read',{roomId:room.id,ids:[first.id]})).rejects.toThrow()
  expect((await chat(b,a)).messages).toEqual([])
  await expect(command(a,'direct.send',{targetId:b.account.id,body:'blocked'})).rejects.toThrow()
  await command(b,'social.block',{targetId:a.account.id,enabled:false})
  expect((await workspace(b)).entities.some(e=>e.id===first.id)).toBe(true)
  await command(b,'message.read',{roomId:room.id,ids:[first.id]})
 })
 it('ended rooms do not grant reporting access; account erasure removes message reports and evidence',async()=>{
  const {a,b,room}=await fixture(),msg=await command(a,'message.send',{roomId:room.id,body:'erase evidence'})
  const report=await command(b,'report.create',{id:msg.id,reason:'erase'})
  await save(await get(room.id),{status:'finished'})
  await expect(command(b,'report.create',{id:msg.id,reason:'ended'})).rejects.toThrow()
  const rows=await Promise.all([room.id,msg.id,report.id].map(async id=>{const e=await get(id);return {id:e.id,kind:e.kind,owner_id:e.ownerId,data:JSON.stringify(e.data)}}))
  for(const user of [a,b])expect(deletionPlan(rows,user.account.id).deleted.has(report.id)).toBe(true)
 })
 if(engine==='PostgreSQL')it('push rechecks blocking and moderation after enqueueing and before APNs delivery',async()=>{
  const {a,b,room,reviewer}=await fixture()
  const device={installationID:randomUUID(),installationSecret:randomUUID(),environment:'sandbox',authorization:'authorized',token:'a'.repeat(64),settings:{notifications:true,liveActivities:false,messages:true,teams:true,courseMinutes:15,arrangementMinutes:30}}
  await pg.transaction(c=>pushDeviceRequest(c,b.account,b.token,'register',device))
  const deliveries:unknown[]=[]
  const transport=async(message:unknown)=>{deliveries.push(message);return {status:200,reason:''}}
  await command(a,'message.send',{roomId:room.id,body:'queued before block'})
  await command(b,'social.block',{targetId:a.account.id,enabled:true})
  await deliverPush(pg,transport)
  expect(deliveries).toHaveLength(0)
  const during=await command(a,'message.send',{roomId:room.id,body:'blocked at enqueue'})
  expect((await pg.pool.query('SELECT 1 FROM push_outbox WHERE source_id=$1 AND account_id=$2',[during.id,b.account.id])).rowCount).toBe(0)
  await command(b,'social.block',{targetId:a.account.id,enabled:false})
  for(const [action,input]of [['message.send',{roomId:room.id}],['direct.send',{targetId:b.account.id}]] as const){
   const message=await command(a,action,{...input,body:'moderated before delivery'})
   const report=await command(b,'report.create',{id:message.id,reason:'x'})
   await command(reviewer,'report.decide',{id:report.id,upheld:true,reason:'x'})
   // Decision notifications are expected; only suppress the original message notification.
   await deliverPush(pg,transport)
  }
  expect(JSON.stringify(deliveries)).not.toContain('moderated before delivery')
  expect(deliveries.every(d=>!['room','directChat'].includes((d as {payload:{target?:{kind:string}}}).payload.target?.kind??''))).toBe(true)
  deliveries.length=0
  await command(a,'message.send',{roomId:room.id,body:'allowed'})
  await command(a,'direct.send',{targetId:b.account.id,body:'allowed direct'})
  await deliverPush(pg,transport)
  expect(deliveries).toHaveLength(2)
  deliveries.length=0
  await command(a,'message.send',{roomId:room.id,body:'queued before finish'})
  await command(a,'room.finish',{id:room.id})
  await deliverPush(pg,transport)
  expect(deliveries).toHaveLength(1) // End-of-team notice survives; obsolete chat alert does not.
 })
})
