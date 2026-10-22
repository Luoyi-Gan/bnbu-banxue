import {afterEach,describe,it,expect,vi} from 'vitest';
import {MisClient,parseMisTimetable} from '../backend/src/mis';
import {ISpace} from '../backend/src/ispace';
import {LearningAuth} from '../backend/src/learning-auth';
import {LearningService} from '../backend/src/learning';
import {sqliteLearningStore} from '../backend/src/learning-store';
import {openDatabase} from '../backend/src/database';
import {createAccount,login} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
import {snapshot} from '../backend/src/commands';
import {liveStudentSchedule} from '../src/v2/liveStudentSchedule';
import type {Workspace} from '../src/live/api';
import {sm2} from 'sm-crypto';
afterEach(()=>vi.unstubAllGlobals());
const html=`<select id="semesterList"><option selected>Semester 1 of 2026-2027</option></select><table><tr><th></th><th>Course Category</th><th>Course Code</th><th>Name</th><th>Teachers</th><th>Time</th><th>Room</th><th>Units</th><th>Remark</th></tr><tr><th>1</th><td>MR</td><td>TEST1003</td><td>合成课程 (1001)</td><td>合成教师</td><td>Thu 10:00-11:50<br>Wed 9:00-9:50</td><td>T7-306<br>T6-201</td><td>3</td><td></td></tr></table>`;
function setup(){
 const db=openDatabase(':memory:'),repo=new Repository(db);createAccount(db,{email:'sync@mail.bnbu.edu.cn',password:'Test-password-123',name:'合成学生',roles:['student']});
 const session=login(db,'sync@mail.bnbu.edu.cn','Test-password-123'),actor=session.account;
 let failed=false,misFailed=false,deadline=(Date.now()+86400000)/1000;
 const transport=vi.fn(async(url:unknown,init?:RequestInit)=>{
  const fn=new URLSearchParams(String(init?.body)).get('wsfunction');let value:unknown={};
  if(String(url).endsWith('/token.php'))value={token:'synthetic-token'};
  if(fn==='core_webservice_get_site_info')value={userid:101,fullname:'合成学生',functions:[]};
  if(fn==='core_user_get_users_by_field')value=[{id:101,email:actor.email}];
  if(fn==='core_enrol_get_users_courses'){if(failed)throw new Error('unreachable');value=[{id:88,fullname:'合成课程',shortname:'TEST'}];}
  if(fn==='core_calendar_get_calendar_upcoming_view')value={events:[{id:999,name:'合成作业',timestart:deadline,modulename:'assign',eventtype:'due',course:{fullname:'合成课程'}},{id:1000,name:'测验开放',timestart:deadline,modulename:'quiz',eventtype:'open'}]};
  if(fn==='core_course_get_contents')value=[{name:'合成章节',modules:[{contents:[{type:'file',filename:'notes.pdf',fileurl:'https://ispace.bnbu.edu.cn/webservice/pluginfile.php/1/notes.pdf',filesize:100,mimetype:'application/pdf'}]}]}];
  return Response.json(value);
 });
 const auth=new LearningAuth(sqliteLearningStore(db),new ISpace(transport as typeof fetch));
 const mis=vi.fn(async()=>{if(misFailed)throw new Error('MIS failed');return parseMisTimetable(html);});
 const service=new LearningService(auth,{mis});
 return {db,repo,actor,auth,service,transport,mis,ordinary:session.token,fail:()=>{failed=true;misFailed=true;},reschedule:()=>{deadline+=3600;}};
}
describe('学校登录自动同步',()=>{
 it('MIS解析课程、星期、起止时间、教室和已确认学期；未知学期不猜教学周',()=>{
  const result=parseMisTimetable(html);expect(result.courseCount).toBe(1);expect(result.lessons).toHaveLength(2);
  expect(result.lessons[0]).toMatchObject({weekday:4,startTime:'10:00',endTime:'11:50',location:'T7-306',weeks:'1–14周'});
  expect(result.lessons[1]).toMatchObject({weekday:3,startTime:'09:00',location:'T6-201'});
  expect(parseMisTimetable(html.replaceAll('2026-2027','2027-2028')).lessons[0]).toMatchObject({weeks:'',needsReview:true});
  expect(()=>parseMisTimetable('<html>Login</html>')).toThrow('学期');
  expect(()=>parseMisTimetable(html.replace('Thu 10:00-11:50','TBA'))).toThrow('无法解析');
 });
 it('学校登录返回前自动完成课程、DDL、资料目录和MIS；同一课表接入首页安排',async()=>{
  const t=setup();try{
   const school=await t.auth.schoolLogin('synthetic','synthetic','test');
   const overview=await t.service.overview(t.actor,school.token);expect(overview.sync).toMatchObject({state:'complete',mis:'success',misLessons:2});
   expect(overview.courses).toHaveLength(1);expect(overview.materials?.['88']).toHaveLength(1);expect(overview.items).toMatchObject([{source:'ispace',schoolEventId:999,title:'合成作业'}]);
   const table=t.repo.all('timetable')[0];expect(table.data.source).toBe('mis');expect(table.data.lessons).toHaveLength(2);
   const data=snapshot(t.db,t.actor) as unknown as Workspace;
   expect(liveStudentSchedule(data,Date.parse('2026-10-22T09:00:00+08:00')).some(item=>item.title==='合成课程 (1001)'&&item.startAt==='2026-10-22T10:00:00+08:00')).toBe(true);
   expect((await t.service.overview(t.actor,t.ordinary)).courses).toEqual([]);expect((await t.service.overview(t.actor,t.ordinary)).materials).toEqual({});
   expect(t.transport.mock.calls.some(call=>String(call[0]).includes('pluginfile.php'))).toBe(false);
  }finally{t.db.close()}
 });
 it('重复同步不重复DDL或改写完成状态；保留手动课表备份及其他个人安排',async()=>{
  const t=setup();try{
   t.repo.create('timetable',t.actor.id,{lessons:[{name:'本人旧课表'}],fileName:'manual.png'});
   const school=await t.auth.schoolLogin('synthetic','synthetic','test');
   expect(t.repo.all('timetableBackup')[0].data.table).toMatchObject({fileName:'manual.png'});
   const item=(await t.service.overview(t.actor,school.token)).items[0];
   await t.service.operation(t.actor,school.token,'save',{...item,done:true,reminderMinutes:60});t.reschedule();
   await t.auth.schoolLogin('synthetic','synthetic','test');
   expect(t.repo.all('learningItem')).toHaveLength(1);expect(t.repo.all('learningItem')[0].data).toMatchObject({source:'ispace',done:true,reminderMinutes:60});
   expect(t.repo.all('timetable')).toHaveLength(1);expect(t.repo.all('timetableBackup')).toHaveLength(1);
  }finally{t.db.close()}
 });
 it('部分学校源失败仍能登录，保留原表与缓存并报告失败；不把失败视为空课表',async()=>{
  const t=setup();try{
   await t.auth.schoolLogin('synthetic','synthetic','test');const old=t.repo.all('timetable')[0];t.fail();
   const school=await t.auth.schoolLogin('synthetic','synthetic','test');expect(school.authenticated).toBe(true);
   const overview=await t.service.overview(t.actor,school.token);expect(overview.sync).toMatchObject({state:'partial',mis:'error'});expect(overview.warnings.length).toBeGreaterThan(0);
   expect(t.repo.all('timetable')[0]).toEqual(old);expect(t.repo.all('learningItem')).toHaveLength(1);
  }finally{t.db.close()}
 });
 it('MIS只跟随受信任的学校跳转；加密密码，不重发凭据到重定向目标',async()=>{
  const pair=sm2.generateKeyPairHex();let encrypted='';
  const transport=vi.fn(async(url:unknown,init?:RequestInit)=>{
   const path=new URL(String(url)).pathname;
   if(path==='/auth/flow/login/getSm2PubK')return Response.json({data:pair.publicKey.slice(2)});
   if(path==='/auth/pwd/tencent/login'){encrypted=JSON.parse(String(init?.body)).password;return Response.json({data:{success:true}});}
   if(path.startsWith('/auth/sso/login/'))return new Response('<body onload="redirect(\'https://evil.test/steal\')"></body>');
   return new Response('<html></html>');
  });
  await expect(new MisClient(transport as typeof fetch).timetable('synthetic','fake-password')).rejects.toThrow('不受支持');
  expect(encrypted).not.toContain('fake-password');expect(sm2.doDecrypt(encrypted.slice(2),pair.privateKey,1)).toBe('fake-password');
  expect(transport.mock.calls.every(call=>new URL(String(call[0])).hostname==='sso.bnbu.edu.cn')).toBe(true);
 });
 it('到达MIS后不执行页面菜单中的跳转函数，仅请求本人课表',async()=>{
  const pair=sm2.generateKeyPairHex();const paths:string[]=[];
  const transport=vi.fn(async(url:unknown)=>{const u=new URL(String(url));paths.push(u.pathname);
   if(u.pathname==='/auth/flow/login/getSm2PubK')return Response.json({data:pair.publicKey.slice(2)});
   if(u.pathname==='/auth/pwd/tencent/login')return Response.json({data:{success:true}});
   if(u.pathname.startsWith('/auth/sso/login/'))return new Response('<body onload="redirect(\'https://mis.bnbu.edu.cn/mis/usr/index.do\')"></body>');
   if(u.pathname==='/mis/usr/index.do')return new Response('<script>function menu(){location.href="/mis/unrelated"}</script>');
   if(u.pathname==='/mis/student/tts/timetable_min.do')return new Response(html);
   return new Response('ok');
  });
  expect((await new MisClient(transport as typeof fetch).timetable('synthetic','fake')).lessons).toHaveLength(2);expect(paths).not.toContain('/mis/unrelated');
 });
});
