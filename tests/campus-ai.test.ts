import {describe,it,expect,vi,afterEach} from 'vitest';
import {CampusAI,campusContext,selectCampusSources} from '../backend/src/campus-ai';
import {openDatabase} from '../backend/src/database';
import {createAccount,login} from '../backend/src/auth';
import {sqliteLearningStore} from '../backend/src/learning-store';
import {execute} from '../backend/src/commands';
import {Repository} from '../backend/src/repository';
import clubs from '../data/campus-clubs.json';
afterEach(()=>vi.unstubAllEnvs());
function setup(){const db=openDatabase(':memory:');createAccount(db,{email:'ai@mail.bnbu.edu.cn',password:'Test-password-123',name:'合成学生',roles:['student']});const session=login(db,'ai@mail.bnbu.edu.cn','Test-password-123');return {db,...session};}
describe('校园 AI 查询权限与费用保护',()=>{
 it('只发送可见公开字段及本人未完成待办，排除私信、他人课表、草稿与敏感字段',()=>{
  const t=setup();try{
   const entity=(kind:string,data:Record<string,unknown>,ownerId:string|null=null)=>({id:kind+String(data.title),kind,data,ownerId});
   const base={title:'未完成作业',type:'deadline',startAt:new Date(Date.now()+86400000).toISOString(),done:false};
   const sources=campusContext(t.account,{entities:[entity('learningItem',base,t.account.id),entity('learningItem',{...base,title:'已完成作业',schoolCompleted:true},t.account.id),entity('timetable',{lessons:[{name:'OTHER-SECRET'}]},'someone'),entity('message',{body:'PRIVATE-MESSAGE'},t.account.id),entity('knowledge',{status:'draft',title:'DRAFT'}),entity('organization',{status:'approved',visibility:'visible',name:'天文协会',description:'观星',password:'PASSWORD-SECRET'})]});
   const text=JSON.stringify(sources);expect(text).toContain('未完成作业');expect(text).toContain('天文协会');for(const secret of ['已完成作业','OTHER-SECRET','PRIVATE-MESSAGE','DRAFT','PASSWORD-SECRET'])expect(text).not.toContain(secret);
   expect(selectCampusSources(sources,'天文协会怎么加入')[0].title).toBe('天文协会');
  }finally{t.db.close();}
 });
 it('真实模型请求固定到 DeepSeek，幂等重试复用答案，失败不伪造回复',async()=>{
  const t=setup();vi.stubEnv('DEEPSEEK_API_KEY','fake-test-key');try{
   const transport=vi.fn(async()=>Response.json({choices:[{message:{content:'请查看校园导航 [1]。'}}],usage:{prompt_tokens:5,completion_tokens:5,total_tokens:10}}));
   const ai=new CampusAI(sqliteLearningStore(t.db),transport as typeof fetch),input={question:'校园导航在哪里',requestId:'test-request-123'};
   const result=await ai.ask(t.account,input,async()=>({entities:[]}),async()=>[]);expect(result.provider).toBe('deepseek');expect(result.sources.length).toBeGreaterThan(0);
   await ai.ask(t.account,input,async()=>({entities:[]}),async()=>[]);expect(transport).toHaveBeenCalledTimes(1);
   const call=transport.mock.calls[0] as unknown as [string,RequestInit];expect(call[0]).toBe('https://api.deepseek.com/chat/completions');expect(String(call[1].body)).not.toContain(t.account.email);
   await expect(ai.ask({...t.account,status:'banned'},input,async()=>({entities:[]}),async()=>[])).rejects.toThrow('正常学生');
   const fail=new CampusAI(sqliteLearningStore(t.db),vi.fn(async()=>new Response('',{status:503})) as typeof fetch);
   await expect(fail.ask(t.account,{...input,requestId:'failed-123'},async()=>({entities:[]}),async()=>[])).rejects.toThrow('暂时不可用');
   expect(new Repository(t.db).all('answer')).toHaveLength(1);
  }finally{t.db.close();}
 });
 it('完整公开名录有57个独立社团；导入遵守运营权限、去重及现有维护内容',()=>{
  const t=setup();try{
   expect(clubs.clubs).toHaveLength(57);expect(new Set(clubs.clubs.map(c=>c.name)).size).toBe(57);
   expect(()=>execute(t.db,t.token,'organization.import',{name:clubs.clubs[0].name},'import-12345')).toThrow('运营');
   createAccount(t.db,{email:'operator@example.test',password:'Test-password-123',name:'合成运营',roles:['operator']});const admin=login(t.db,'operator@example.test','Test-password-123');
   for(const entry of clubs.clubs)execute(t.db,admin.token,'organization.import',{name:entry.name},'import-'+entry.name);
   expect(new Repository(t.db).all('organization')).toHaveLength(57);
   execute(t.db,admin.token,'organization.import',{name:clubs.clubs[0].name},'import-repeat');expect(new Repository(t.db).all('organization')).toHaveLength(57);
   expect(new Repository(t.db).all('organization')[0].ownerId).toBe(null);
  }finally{t.db.close();}
 });
});
