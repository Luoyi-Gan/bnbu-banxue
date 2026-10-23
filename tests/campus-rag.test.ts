import {describe,it,expect,vi,afterEach} from 'vitest'
import {CampusKnowledgeIndex,knowledgeChunks,rankKnowledge} from '../backend/src/campus-rag'
import {CampusAI,campusContext} from '../backend/src/campus-ai'
import {openDatabase} from '../backend/src/database'
import {createAccount,login} from '../backend/src/auth'
import {Repository} from '../backend/src/repository'
import {sqliteLearningStore} from '../backend/src/learning-store'
import type {AIKnowledgeSource} from '../shared/v2/aiKnowledge'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {campusMapKnowledgeVersion} from '../shared/v2/campusMapKnowledge'

const setup=()=>{const db=openDatabase(':memory:');createAccount(db,{email:'rag@example.test',name:'检索测试',password:'Test-password-123',roles:['student']});const a=login(db,'rag@example.test','Test-password-123').account;createAccount(db,{email:'other-rag@example.test',name:'其他学生',password:'Test-password-123',roles:['student']});const b=login(db,'other-rag@example.test','Test-password-123').account;return {db,a,b,repo:new Repository(db),store:sqliteLearningStore(db)}}
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks()})
describe('校园全文索引与检索覆盖',()=>{
 it('公开地图索引与当前平台地图源文件一致，防止更新地图后漏更新AI',()=>{expect(createHash('sha256').update(readFileSync('public/campus-map/data/processed/campus-places.json','utf8')).digest('hex')).toBe(campusMapKnowledgeVersion)})
 it('所有段落入索引，召回第50条及长文后半段；超出上下文预算不丢索引',()=>{
  const docs:AIKnowledgeSource[]=Array.from({length:75},(_,i)=>({id:'doc'+i,title:'校园资料'+i,source:'/v2/campus',category:'guide',text:'普通资料。'.repeat(500)+(i===60?'隐星宿舍维修找后勤办公室':'' )}));
  const chunks=knowledgeChunks(docs),result=rankKnowledge(chunks,'隐星宿舍维修');expect(new Set(chunks.map(c=>c.id)).size).toBe(75);expect(result.some(c=>c.id==='doc60'&&c.text.includes('隐星宿舍维修'))).toBe(true);expect(result.reduce((n,c)=>n+c.text.length,0)).toBeLessThanOrEqual(26000)
 })
 it('持久化按本人分区；更新删除/失去权限资料立即清理，不混入其他账号',async()=>{
  const t=setup();try{const index=new CampusKnowledgeIndex(t.store),source=(id:string,text:string):AIKnowledgeSource=>({id,title:'我的资料',text,source:'/v2',category:'course'});
   await Promise.all([index.retrieve(t.a.id,[source('same','A独有课表')],'课表'),index.retrieve(t.b.id,[source('same','B独有课表')],'课表')]);
   let value=await index.retrieve(t.a.id,[source('same','A更新课表')],'课表');expect(JSON.stringify(value)).not.toContain('B独有');expect(JSON.stringify(value)).not.toContain('A独有');expect(JSON.stringify(value)).toContain('A更新');
   value=await index.retrieve(t.a.id,[],'课表');expect(value.coverage.documents).toBe(0);expect(t.db.prepare('SELECT count(*) AS n FROM campus_ai_chunks WHERE actor_id=?').get(t.a.id)?.n).toBe(0);expect(t.db.prepare('SELECT count(*) AS n FROM campus_ai_chunks WHERE actor_id=?').get(t.b.id)?.n).toBe(1)
  }finally{t.db.close()}
 })
 it('完整公共目录不受workspace的50条限制，屏蔽/未发布/隐藏内容和凭据不进入目录、计数、索引',async()=>{
  const t=setup();try{for(let i=0;i<65;i++)t.repo.create('post',null,{title:'公开帖子'+i,body:'公开帖子正文',status:'visible',password:'DO-NOT-SEND'});
   const blocked=t.repo.create('post',t.b.id,{title:'BLOCKED-POST',body:'BLOCKED-CONTENT',status:'visible'});t.repo.create('socialEdge',t.a.id,{kind:'block',targetId:t.b.id,enabled:true});t.repo.create('comment',null,{postId:blocked.id,body:'BLOCKED-COMMENT',status:'visible'});
   t.repo.create('room',null,{title:'HIDDEN-ROOM',status:'open',visibility:'hidden'});t.repo.create('organization',null,{name:'PENDING-ORG',status:'pending',visibility:'visible'});t.repo.create('shop',null,{name:'HIDDEN-SHOP',status:'hidden'});t.repo.create('knowledge',null,{title:'DRAFT-GUIDE',body:'DRAFT-BODY',status:'draft'});
   const ai=new CampusAI(t.store),result=await ai.retrieve(t.a,{entities:[]},[],'全部公开帖子');expect(result.coverage.categories.community).toBe(65);
   const indexed=JSON.stringify(t.db.prepare('SELECT data FROM campus_ai_chunks WHERE actor_id=?').all(t.a.id));for(const bad of ['BLOCKED-','PENDING-ORG','HIDDEN-','DRAFT-','DO-NOT-SEND'])expect(indexed).not.toContain(bad);
   t.db.prepare("UPDATE entities SET data=? WHERE kind='post'").run(JSON.stringify({status:'hidden',title:'已下架'}));await ai.retrieve(t.a,{entities:[]},[],'全部公开帖子');expect(JSON.stringify(t.db.prepare('SELECT data FROM campus_ai_chunks WHERE actor_id=?').all(t.a.id))).not.toContain('公开帖子正文');
   await expect(ai.retrieve({...t.a,status:'banned'},{entities:[]},[],'帖子')).rejects.toThrow('正常学生')
  }finally{t.db.close()}
 })
 it('课表超过60节不截头；地图及校友公开资料入库但证据和他人预约排除',()=>{
  const t=setup();try{const sources=campusContext(t.a,{entities:[{id:'table',kind:'timetable',ownerId:t.a.id,data:{lessons:Array.from({length:85},(_,i)=>({name:'课程'+i,password:'SECRET'}))}}]});expect(JSON.stringify(sources)).toContain('课程84');expect(sources.filter(s=>s.category==='map').length).toBeGreaterThan(200);expect(JSON.stringify(sources)).not.toContain('SECRET')
  }finally{t.db.close()}
 })
 it('AI课程安排复用已核对校历、结束时间和课程选择，完整课表仍保留隐藏课程',()=>{
  const t=setup();try{const sources=campusContext(t.a,{entities:[{id:'p',kind:'preferences',ownerId:t.a.id,data:{hiddenDailyCourses:['hidden'],academicCalendar:'bnbu-2026-s1'}},{id:'t',kind:'timetable',ownerId:t.a.id,data:{lessons:[{name:'Visible',weekday:5,startTime:'13:00',endTime:'14:00',weeks:'1-14'},{name:'Hidden',weekday:5,startTime:'15:00',endTime:'16:00',weeks:'1-14'}]}}]},[],Date.parse('2026-10-23T12:00:00+08:00'));const occurrences=sources.filter(s=>s.id.startsWith('course-occurrence:'));expect(occurrences.some(s=>s.text.includes('2026-10-23T13:00'))).toBe(true);expect(JSON.stringify(occurrences)).not.toContain('Hidden');expect(JSON.stringify(occurrences)).not.toContain('2026-10-30');expect(sources.find(s=>s.id==='t')?.text).toContain('Hidden')
  }finally{t.db.close()}
 })
 it('已删除的公共资料不会从过时的界面快照或探店回调重新进入索引；完整目录可召回末项',async()=>{
  const t=setup();try{const ai=new CampusAI(t.store),stale={id:'deleted-public',kind:'post',ownerId:null,data:{title:'已删除帖子',body:'STALE-SNAPSHOT-BODY',status:'visible'}};const result=await ai.retrieve(t.a,{entities:[stale]},[{id:'old-shop',kind:'shop',ownerId:null,data:{name:'STALE-SHOP',status:'visible'}}],'所有社团');expect(result.coverage.categories.community).toBeUndefined();const text=JSON.stringify(t.db.prepare('SELECT data FROM campus_ai_chunks WHERE actor_id=?').all(t.a.id));expect(text).not.toContain('STALE-');const catalog={id:'catalog:organization',category:'organization' as const,title:'全部社团目录',source:'/v2/organizations',text:Array.from({length:200},(_,i)=>'社团名称'+i+'：公开资料').join('\n')};expect(rankKnowledge(knowledgeChunks([catalog]),'全部社团').some(c=>c.text.includes('社团名称199'))).toBe(true)
  }finally{t.db.close()}
 })
 it('会话归属与幂等绑定，检索覆盖发往模型，引用仅从本次片段选取',async()=>{
  const t=setup();vi.stubEnv('DEEPSEEK_API_KEY','test-only');try{const transport=vi.fn(async(_url:unknown,init?:RequestInit)=>{const value=JSON.parse(JSON.parse(String(init?.body)).messages[1].content);expect(value.coverage.documents).toBeGreaterThan(200);expect(value.visiblePlatformSources.every((s:Record<string,unknown>)=>!('tokens'in s))).toBe(true);return Response.json({choices:[{message:{content:'可查看校园功能 [1]，不存在引用 [9999]。'}}]})});const ai=new CampusAI(t.store,transport as typeof fetch),input={question:'校园功能',requestId:'conversation-request',conversationId:'thread-one'};
   const first=await ai.ask(t.a,input,async()=>({entities:[]}),async()=>[]);expect(first.coverage.documents).toBeGreaterThan(200);expect(first.sources.every(s=>s.reference!==9999)).toBe(true);await ai.ask(t.a,input,async()=>({entities:[]}),async()=>[]);expect(transport).toHaveBeenCalledTimes(1);
   await expect(ai.ask(t.a,{...input,conversationId:'thread-two'},async()=>({entities:[]}),async()=>[])).rejects.toThrow('请求标识');await expect(ai.ask(t.a,{...input,requestId:'new-request',conversationId:'thread-two',previousAnswerId:'campus-ai:'+t.a.id+':conversation-request'},async()=>({entities:[]}),async()=>[])).rejects.toThrow('其他会话');
  }finally{t.db.close()}
 })
 it('实时体育读取失败标记缺口，移除旧体育缓存，不把错误当作零记录',async()=>{
  const t=setup();try{await new CampusKnowledgeIndex(t.store).retrieve(t.a.id,[{id:'sports:old',title:'过期体育资料',text:'OLD-SPORTS-CREDIT',source:'/v2/sports',category:'sports'}],'体育');const fetch=vi.spyOn(globalThis,'fetch');const result=await new CampusAI(t.store).retrieve(t.a,{entities:[]},[],'我的体育运动学时');expect(result.coverage.connections.sports).toBe('unavailable');expect(result.coverage.partial).toBe(true);expect(result.coverage.notes.join('')).toContain('不能据此判断没有');expect(JSON.stringify(t.db.prepare('SELECT data FROM campus_ai_chunks WHERE actor_id=?').all(t.a.id))).not.toContain('OLD-SPORTS-CREDIT');expect(fetch).not.toHaveBeenCalled()
  }finally{t.db.close()}
 })
 it('同一会话保留多轮上下文，其他会话历史不会混入',async()=>{
  const t=setup();vi.stubEnv('DEEPSEEK_API_KEY','test-only');try{const first=t.repo.create('answer',t.a.id,{question:'第一轮问题',body:'第一轮回答',conversationId:'thread'}),second=t.repo.create('answer',t.a.id,{question:'第二轮问题',body:'第二轮回答',conversationId:'thread',previousAnswerId:first.id});t.repo.create('answer',t.a.id,{question:'OTHER-THREAD-SECRET',body:'OTHER-THREAD-SECRET',conversationId:'elsewhere'});const transport=vi.fn(async(_u:unknown,init?:RequestInit)=>{const payload=JSON.parse(JSON.parse(String(init?.body)).messages[1].content);expect(payload.recentConversation.map((e:{question:string})=>e.question)).toEqual(['第一轮问题','第二轮问题']);expect(String(init?.body)).not.toContain('OTHER-THREAD-SECRET');return Response.json({choices:[{message:{content:'继续回答。'}}]})});await new CampusAI(t.store,transport as typeof fetch).ask(t.a,{question:'继续',requestId:'chain-request',conversationId:'thread',previousAnswerId:second.id},async()=>({entities:[]}),async()=>[])
  }finally{t.db.close()}
 })
})
