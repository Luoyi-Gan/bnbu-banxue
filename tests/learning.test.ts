import {afterEach,describe,expect,it,vi} from 'vitest';
import {openDatabase} from '../backend/src/database';
import {createAccount,login,digest} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
import {LearningAuth} from '../backend/src/learning-auth';
import {LearningService,readDocument,validatePersonalItem} from '../backend/src/learning';
import {sqliteLearningStore} from '../backend/src/learning-store';
import {ISpace} from '../backend/src/ispace';
import {personalOccurrences} from '../shared/v2/learning';
import {snapshot} from '../backend/src/commands';

afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
function setup(schoolEmail='student@mail.bnbu.edu.cn'){
 const db=openDatabase(':memory:'),repo=new Repository(db);
 const id=createAccount(db,{email:'student@mail.bnbu.edu.cn',password:'Test-password-123',name:'学生',roles:['student']});
 const second=createAccount(db,{email:'second@mail.bnbu.edu.cn',password:'Test-password-123',name:'乙',roles:['student']});
 const session=login(db,'student@mail.bnbu.edu.cn','Test-password-123'),actor=repo.person(id),other=repo.person(second);
 const transport=vi.fn(async(url:URL|string|Request,init?:RequestInit)=>{
  const values=new URLSearchParams(String(init?.body)),fn=values.get('wsfunction');
  let value:unknown=String(url).endsWith('/login/token.php')?{token:'private-moodle-token'}:{};
  if(fn==='core_webservice_get_site_info')value={userid:42,fullname:'测试学生',functions:[]};
  if(fn==='core_user_get_users_by_field')value=[{id:42,email:schoolEmail}];
  if(fn==='core_enrol_get_users_courses')value=[{id:12,fullname:'数学',shortname:'MATH'}];
  if(fn==='core_calendar_get_calendar_upcoming_view')value={events:[{id:5,name:'作业',timestart:Date.now()/1000+3600,modulename:'assign',course:{fullname:'数学'}}]};
  if(fn==='core_course_get_contents')value=[{name:'第一章',modules:[{contents:[{type:'file',filename:'notes.txt',fileurl:'https://ispace.bnbu.edu.cn/webservice/pluginfile.php/1/notes.txt',mimetype:'text/plain',filesize:7}]}]}];
  if(fn==='gradereport_user_get_grade_items')value={usergrades:[{gradeitems:[{itemname:'作业1',gradeformatted:'95',rangeformatted:'0–100'}]}]};
  if(String(url).includes('/pluginfile.php/'))return new Response('Study notes');
  return Response.json(value);
 });
 const auth=new LearningAuth(sqliteLearningStore(db),new ISpace(transport as typeof fetch)),service=new LearningService(auth,{mis:async()=>({semester:'Semester 1 of 2026-2027',lessons:[{id:'mis-test',name:'数学',weekday:4,startTime:'10:00',endTime:'11:50',period:'',location:'T7-306',teacher:'教师',weeks:'1–14周',note:'MIS',needsReview:false}],courseCount:1})});
 const code=()=>String(db.prepare('SELECT body FROM mail_outbox ORDER BY created_at DESC LIMIT 1').get()!.body).match(/\d{6}/)![0];
 return {db,repo,actor,other,session,auth,service,transport,code};
}
const deadline={type:'deadline',title:'报告',course:'数学',location:'',startAt:new Date(Date.now()+600000).toISOString(),reminderMinutes:30};
describe('学习工具：身份、保存与 iSpace 隔离',()=>{
 it('首次学校登录自动建立个人账号、验证记录与唯一绑定，并发不重复创建',async()=>{
  const t=setup('new-school@mail.bnbu.edu.cn');try{
   const results=await Promise.all([t.auth.schoolLogin('fake','fake','source'),t.auth.schoolLogin('fake','fake','source')]);
   expect(results[0].account.id).toBe(results[1].account.id);expect(results[0].account.roles).toEqual(['student']);
   expect(t.repo.all('verifiedEmail').filter(e=>e.ownerId===results[0].account.id)).toMatchObject([{data:{email:'new-school@mail.bnbu.edu.cn',source:'ispace-school-login'}}]);
   expect(t.repo.all('schoolLink')).toHaveLength(1);expect(t.db.prepare('SELECT count(*) AS n FROM mail_outbox').get()?.n).toBe(0);
  }finally{t.db.close()}
 });
 it('学校登录拒绝封禁、撤销资格及邮箱已绑定其他学校身份',async()=>{
  const t=setup();try{
   t.db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(t.actor.id);
   await expect(t.auth.schoolLogin('fake','fake','source')).rejects.toThrow('封禁');
   t.db.prepare("UPDATE accounts SET status='active' WHERE id=?").run(t.actor.id);
   const revoked=t.repo.create('studentIdentityRequest',t.actor.id,{status:'revoked'});
   await expect(t.auth.schoolLogin('fake','fake','source')).rejects.toThrow('撤销');
   t.db.prepare('DELETE FROM entities WHERE id=?').run(revoked.id);
   t.repo.create('schoolLink',t.actor.id,{subject:'another-school-subject'});
   await expect(t.auth.schoolLogin('fake','fake','source')).rejects.toThrow('其他学校账号');
   expect(t.auth.current(t.session.token,t.actor.id)).toBeUndefined();
  }finally{t.db.close()}
 });
 it('安排请求重试复用事务回执，不能用同一标识更换操作',async()=>{
  const t=setup();try{const input={...deadline,requestId:'learning-retry'};await t.service.operation(t.actor,t.session.token,'save',input);await t.service.operation(t.actor,t.session.token,'save',input);expect((await t.service.overview(t.actor,t.session.token)).items).toHaveLength(1);await expect(t.service.operation(t.actor,t.session.token,'save',{...input,title:'不同输入'})).rejects.toThrow('其他操作');}finally{t.db.close()}
 });
 it('邮箱验证码一次消费、错误次数落库；注册验证码不能用来登录',async()=>{
  const t=setup();try{
   await t.auth.requestCode(t.actor.email,'test',true);const code=t.code();
   await expect(t.auth.emailLogin(t.actor.email,'000000','test')).rejects.toThrow('验证码错误');
   expect(t.db.prepare('SELECT attempts FROM email_challenges WHERE email=?').get('login:'+t.actor.email)?.attempts).toBe(1);
   const sessions=await Promise.allSettled([t.auth.emailLogin(t.actor.email,code,'test'),t.auth.emailLogin(t.actor.email,code,'test')]);
   expect(sessions.filter(r=>r.status==='fulfilled')).toHaveLength(1);
   expect(t.repo.all('verifiedEmail')).toHaveLength(1);
   await expect(t.auth.emailLogin(t.actor.email,code,'test')).rejects.toThrow('失效');
  }finally{t.db.close()}
 });
 it('验证码过期、五次错误、重发与来源限流',async()=>{
  const t=setup();try{
   await t.auth.requestCode(t.actor.email,'source',true);
   await expect(t.auth.requestCode(t.actor.email,'source',true)).rejects.toThrow('稍后');
   for(let i=0;i<5;i++)await expect(t.auth.emailLogin(t.actor.email,'000000','source')).rejects.toThrow();
   await expect(t.auth.emailLogin(t.actor.email,t.code(),'source')).rejects.toThrow('失效');
   t.db.prepare('UPDATE email_challenges SET attempts=0,expires_at=0').run();
   await expect(t.auth.emailLogin(t.actor.email,t.code(),'source')).rejects.toThrow('失效');
  }finally{t.db.close()}
 });
 it('学校首次登录直接关联邮箱；同一账号邮箱会话不能读取学校数据',async()=>{
  const t=setup();try{
   const school=await t.auth.schoolLogin('fake-user','fake-password','source');
   expect(school.authenticated).toBe(true);expect('pendingId'in school).toBe(false);
   expect(t.db.prepare('SELECT count(*) AS n FROM mail_outbox').get()?.n).toBe(0);
   expect(school.account.id).toBe(t.actor.id);
   const sync=await t.service.operation(t.actor,school.token,'sync',{});
   expect(sync).toMatchObject({courses:[{id:12,name:'数学'}],events:[{title:'作业'}]});
   expect((await t.service.overview(t.actor,school.token)).courses).toHaveLength(1);
   await expect(t.service.operation(t.actor,t.session.token,'sync',{})).rejects.toThrow('学校账号');
   expect((await t.service.overview(t.actor,t.session.token)).courses).toEqual([]);
   expect(JSON.stringify(snapshot(t.db,t.actor))).not.toContain('private-moodle-token');
   const later=await t.auth.schoolLogin('fake-user','fake-password','source');expect(later.authenticated).toBe(true);
   t.auth.forget(school.token);await expect(t.service.operation(t.actor,school.token,'sync',{})).rejects.toThrow();
  }finally{t.db.close()}
 });
 it('学校资料只接受本人课程与服务端文件标识，不跟随站外跳转',async()=>{
  const t=setup();try{
   const session=await t.auth.schoolLogin('fake','fake','source');
   await expect(t.service.operation(t.actor,session.token,'materials',{courseId:999})).rejects.toThrow('未加入');
   const result=await t.service.operation(t.actor,session.token,'materials',{courseId:12}) as {materials:{id:string}[]};
   expect(JSON.stringify(result)).not.toContain('token');
   const doc=await t.service.operation(t.actor,session.token,'material.read',{courseId:12,id:result.materials[0].id});expect(doc).toMatchObject({pages:[{text:'Study notes'}]});
   await expect(t.auth.school.file('secret','https://evil.test/pluginfile.php/1')).rejects.toThrow('不受支持');
   expect(t.transport.mock.calls.every(call=>call[1]?.redirect==='error')).toBe(true);
  }finally{t.db.close()}
 });
 it('本人安排持久保存、首页读取；禁止越权与旧版本覆盖',async()=>{
  const t=setup();try{
   await t.service.operation(t.actor,t.session.token,'save',{...deadline,ownerId:t.other.id});
   const [item]=(await t.service.overview(t.actor,t.session.token)).items;
   expect((await t.service.overview(t.other,'other')).items).toEqual([]);
   expect(snapshot(t.db,t.actor).entities.filter(e=>e.kind==='learningItem')).toHaveLength(1);
   expect(snapshot(t.db,t.other).entities.filter(e=>e.kind==='learningItem')).toHaveLength(0);
   await expect(t.service.operation(t.other,'other','delete',{id:item.id,version:item.version})).rejects.toThrow();
   await t.service.operation(t.actor,t.session.token,'save',{...item,done:true});
   await expect(t.service.operation(t.actor,t.session.token,'save',{...item,title:'旧版本'})).rejects.toThrow('变化');
   expect((await t.service.overview(t.actor,t.session.token)).items[0].done).toBe(true);
  }finally{t.db.close()}
 });
 it('到期提醒幂等，完成待办停止提醒',async()=>{
  const t=setup();try{
   await t.service.operation(t.actor,t.session.token,'save',deadline);
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:1});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:0});
   const item=(await t.service.overview(t.actor,t.session.token)).items[0];
   await t.service.operation(t.actor,t.session.token,'save',{...item,done:true});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:0});
  }finally{t.db.close()}
 });
 it('到时提醒覆盖一分钟轮询窗口，过期太久的DDL不补发',async()=>{
  const t=setup();try{
   await t.service.operation(t.actor,t.session.token,'save',{...deadline,startAt:new Date(Date.now()-5000).toISOString(),reminderMinutes:0});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:1});
   await t.service.operation(t.actor,t.session.token,'save',{...deadline,title:'过期旧事项',startAt:new Date(Date.now()-120000).toISOString(),reminderMinutes:0});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:0});
  }finally{t.db.close()}
 });
 it('取消每日课程后停止新课前提醒，重新勾选后恢复',async()=>{
  const t=setup(),clock=vi.spyOn(Date,'now').mockReturnValue(Date.parse('2026-10-22T09:50:00+08:00'));
  try{
   t.repo.create('learningPreferences',t.actor.id,{classReminderEnabled:true});
   t.repo.create('timetable',t.actor.id,{lessons:[{id:'class-choice',name:'数学',weekday:4,startTime:'10:00',endTime:'11:50',weeks:'1–14周',location:'T7'}]});
   const prefs=t.repo.create('preferences',t.actor.id,{academicCalendar:'bnbu-2026-s1',hiddenDailyCourses:['数学']});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:0});
   t.repo.save(prefs,{hiddenDailyCourses:[]});
   expect(await t.service.operation(t.actor,t.session.token,'reminders',{})).toEqual({added:1});
  }finally{clock.mockRestore();t.db.close()}
 });
 it('个人课件仅本人可读，问答须明确同意且不能伪造服务成功',async()=>{
  const t=setup();try{
   const uploaded=await t.service.operation(t.actor,t.session.token,'upload',{name:'notes.txt',base64:Buffer.from('第一页\f第二页').toString('base64')}) as {id:string};
   expect(await t.service.operation(t.actor,t.session.token,'document.read',{id:uploaded.id})).toMatchObject({pages:[{number:1,text:'第一页'},{number:2,text:'第二页'}]});
   await expect(t.service.operation(t.other,'other','document.read',{id:uploaded.id})).rejects.toThrow('不存在');
   await expect(t.service.operation(t.actor,t.session.token,'ask',{id:uploaded.id,page:1,question:'解释'})).rejects.toThrow('确认');
   vi.stubEnv('BNBU_STUDY_AI_URL','');vi.stubEnv('DEEPSEEK_API_KEY','');vi.stubEnv('BNBU_STUDY_DEEPSEEK_KEY','');await expect(t.service.operation(t.actor,t.session.token,'ask',{id:uploaded.id,page:1,question:'解释',consent:true})).rejects.toThrow('尚未配置');
   expect(snapshot(t.db,t.actor).entities.some(e=>e.kind==='learningDocument')).toBe(false);
  }finally{t.db.close()}
 });
 it('DeepSeek只收到所选页的有限文字，不接收另一页、学校账号或完整课件',async()=>{
  const t=setup();try{
   vi.stubEnv('BNBU_STUDY_AI_PROVIDER','deepseek');vi.stubEnv('BNBU_STUDY_DEEPSEEK_KEY','synthetic-api-key');
   const transport=vi.fn(async(_url:unknown,init?:RequestInit)=>{const payload=JSON.parse(String(init?.body));expect(payload.model).toBe('deepseek-flash');expect(payload.max_tokens).toBe(2000);expect(payload.thinking.type).toBe('disabled');const supplied=JSON.parse(payload.messages[1].content);expect(supplied.page).toBe(2);expect(supplied.content).toHaveLength(24000);expect(JSON.stringify(payload)).not.toContain('PRIVATE_FIRST_PAGE');expect(JSON.stringify(payload)).not.toContain(t.actor.email);return Response.json({choices:[{message:{content:'第2页：解释。'}}],usage:{prompt_tokens:123,completion_tokens:12,prompt_cache_hit_tokens:0}});});
   vi.stubGlobal('fetch',transport);
   const answer=await t.service.ask([{number:1,text:'PRIVATE_FIRST_PAGE'},{number:2,text:'a'.repeat(24050)}],{page:2,question:'解释',consent:true});
   expect(answer).toMatchObject({answer:'第2页：解释。',page:2,readCharacters:24000,totalCharacters:24050,provider:'DeepSeek',usage:{promptTokens:123,completionTokens:12}});expect(transport).toHaveBeenCalledOnce();
  }finally{t.db.close()}
 });
 it('封禁账号不能获取学校关联会话',async()=>{
  const t=setup();try{
   await t.auth.requestCode(t.actor.email,'source',true);t.db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(t.actor.id);
   await expect(t.auth.emailLogin(t.actor.email,t.code(),'source')).rejects.toThrow('封禁');
  }finally{t.db.close()}
 });
 it('学校错误与 HTML 响应拒绝登录，不回显上游敏感消息',async()=>{
  const transport=vi.fn(async()=>Response.json({errorcode:'invalidlogin',message:'sensitive'}));
  await expect(new ISpace(transport as typeof fetch).login('fake','fake')).rejects.toThrow('未开放');
  await expect(new ISpace((async()=>new Response('<html>login</html>')) as typeof fetch).login('fake','fake')).rejects.toThrow('有效数据');
 });
 it('重复安排采用北京时间、包含生效边界、暂停不展开',()=>{
  const value=validatePersonalItem({type:'repeat',title:'自习',weekday:4,from:'2026-10-22',until:'2026-10-29',startTime:'20:00',endTime:'21:00'}),item={...value,id:'repeat',version:1};
  expect(personalOccurrences([item],Date.parse('2026-10-22T10:00:00+08:00')).map(i=>i.startAt)).toEqual(['2026-10-22T20:00:00+08:00','2026-10-29T20:00:00+08:00']);
  expect(personalOccurrences([{...item,paused:true}],Date.parse('2026-10-22T10:00:00+08:00'))).toEqual([]);
  expect(()=>validatePersonalItem({...value,until:'2026-02-30'})).toThrow();
 });
 it('拒绝伪装 PDF 和过量文本',async()=>{
  await expect(readDocument(Buffer.from('not a pdf'),'notes.pdf')).rejects.toThrow('支持 PDF');
  await expect(readDocument(Buffer.from('x'.repeat(1000001)),'notes.txt')).rejects.toThrow('过长');
 });
 it('登录验证码摘要不与注册命名空间互通',async()=>{
  const t=setup();try{
   const now=Date.now();t.db.prepare('INSERT INTO email_challenges VALUES(?,?,?,?,?)').run(t.actor.email,digest(t.actor.email+':123456'),now+600000,0,now);
   await expect(t.auth.emailLogin(t.actor.email,'123456','source')).rejects.toThrow('失效');
  }finally{t.db.close()}
 });
});
