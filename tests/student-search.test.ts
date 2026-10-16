import {createApiServer} from '../backend/src/main';
import {randomUUID} from 'node:crypto';
import {it,expect} from 'vitest';
import {openDatabase} from '../backend/src/database';
import {createAccount,login,issueCode,register,verifyOwnEmail} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
import {searchStudents,studentNumber} from '../backend/src/student-search';
it('入班独立学号用于搜索，邮箱验证不推导学号，尊重角色与隐私',()=>{
 const db=openDatabase(':memory:');try {
 createAccount(db,{email:'viewer@example.test',name:'查找者',password:'Acceptance-123',roles:['student']});
 const viewer=login(db,'viewer@example.test','Acceptance-123').account;
 new Repository(db).create('companionIdentity',viewer.id,{role:'student',status:'verified',studentNumber:'VIEWER001'});
 issueCode(db,'123456@bnbu.edu.cn');
 const mail=db.prepare('SELECT body FROM mail_outbox WHERE recipient=?').get('123456@bnbu.edu.cn') as {body:string};
 register(db,{email:'123456@bnbu.edu.cn',password:'Acceptance-123',code:mail.body.match(/\d{6}/)![0]});
 let person=login(db,'123456@bnbu.edu.cn','Acceptance-123').account;
 expect(studentNumber(db,person)).toBeNull();
 db.prepare('UPDATE accounts SET roles=?,organization=? WHERE id=?').run('["student"]','学院',person.id);
 person=login(db,'123456@bnbu.edu.cn','Acceptance-123').account;
 expect(studentNumber(db,person)).toBeNull();
 new Repository(db).create('companionIdentity',person.id,{role:'student',status:'verified',studentNumber:'2030123456'});
 expect(studentNumber(db,person)).toBe('2030123456');
 expect(searchStudents(db,viewer,'123456')).toEqual({students:[]});
 expect(searchStudents(db,viewer,'123')).toEqual({students:[]});
 expect(searchStudents(db,viewer,'2030123456').students[0]).toMatchObject({id:person.id,organization:'学院'});
 const repo=new Repository(db);repo.create('profile',person.id,{nickname:'学生昵称',avatar:'data:image/png;base64,YQ=='});
 expect(searchStudents(db,viewer,'2030123456').students[0]).toMatchObject({nickname:'学生昵称',avatar:'data:image/png;base64,YQ=='});
 const prefs=repo.create('preferences',person.id,{profilePreview:false});
 expect(searchStudents(db,viewer,'2030123456').students[0].organization).toBe('');
 expect(searchStudents(db,viewer,'2030123456').students[0].avatar).toBeUndefined();
 expect(searchStudents(db,viewer,'2030123456').students[0].nickname).toBeUndefined();
 repo.save(prefs,{searchable:false});expect(searchStudents(db,viewer,'2030123456').students).toEqual([]);
 expect(()=>searchStudents(db,{...viewer,roles:['teacher']},'2030123456')).toThrow();
 createAccount(db,{email:'654321@bnbu.edu.cn',name:'未验证',password:'Acceptance-123',roles:['student']});
 expect(searchStudents(db,viewer,'654321').students).toEqual([]);
 const existing=login(db,'654321@bnbu.edu.cn','Acceptance-123').account;
 issueCode(db,existing.email);
 const existingMail=db.prepare('SELECT body FROM mail_outbox WHERE recipient=?').get(existing.email) as {body:string};
 const code=existingMail.body.match(/\d{6}/)![0];
 expect(()=>verifyOwnEmail(db,viewer,code)).toThrow();
 verifyOwnEmail(db,existing,code);
 expect(searchStudents(db,viewer,'654321').students).toEqual([]);
 repo.create('companionIdentity',existing.id,{role:'student',status:'verified',studentNumber:'654321'});
 db.prepare("DELETE FROM security_rate_events WHERE category='student-search'").run();
 expect(searchStudents(db,viewer,'654321').students[0].id).toBe(existing.id);
 expect(()=>verifyOwnEmail(db,existing,code)).toThrow();
 } finally {db.close()}
});

it('HTTP 本人邮箱验证、学号搜索和隐私设置贯通',async()=>{
 const db=openDatabase(':memory:'); const server=createApiServer(db,{localOutbox:true});
 try {
  createAccount(db,{email:'y123456789@bnbu.edu.cn',name:'测试学生',password:'Acceptance-123',roles:['student']});
  const actor=login(db,'y123456789@bnbu.edu.cn','Acceptance-123');
  new Repository(db).create('companionIdentity',actor.account.id,{role:'student',status:'verified',studentNumber:'2026123'});
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+(server.address() as {port:number}).port;
  const headers={'Content-Type':'application/json',Cookie:'bnbu_session='+actor.token};
  const post=(path:string,body:unknown)=>fetch(base+path,{method:'POST',headers,body:JSON.stringify(body)});
  expect((await fetch(base+'/api/students/search?number=2026123')).status).toBe(401);
  expect((await post('/api/auth/email/request',{})).status).toBe(200);
  const mail=db.prepare('SELECT body FROM mail_outbox WHERE recipient=?').get(actor.account.email) as {body:string};
  const code=mail.body.match(/\d{6}/)![0];
  expect((await post('/api/auth/email/confirm',{code})).status).toBe(200);
  const workspace=await fetch(base+'/api/workspace',{headers});expect((await workspace.json()).account.studentNumber).toBe('2026123');
  const search=()=>fetch(base+'/api/students/search?number=2026123',{headers}).then(r=>r.json());
  expect((await search()).students).toHaveLength(1);
  const response=await post('/api/commands',{action:'preferences.searchable',input:{enabled:false},requestId:randomUUID()});
  expect(response.status).toBe(200);expect((await search()).students).toHaveLength(0);
  expect((await post('/api/auth/email/confirm',{code})).status).toBe(400);
 } finally {server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));db.close()}
});

it('接受字母和数字两种独立学号，不按邮箱前缀转换或合并账号',()=>{
 const db=openDatabase(':memory:');
 try {
  const repo=new Repository(db);
  const ids=['u123456','24123456'].map((number,index)=>{
   const email=index===0?'u123456@bnbu.edu.cn':'v654321@bnbu.edu.cn';
   const id=createAccount(db,{email,name:number,password:'Acceptance-123',roles:['student']});
   repo.create('companionIdentity',id,{role:'student',status:'verified',studentNumber:number});
   return id;
  });
  const viewer=login(db,'u123456@bnbu.edu.cn','Acceptance-123').account;
  expect(searchStudents(db,viewer,'u123456').students.map(p=>p.id)).toEqual([ids[0]]);
  expect(searchStudents(db,viewer,'24123456').students.map(p=>p.id)).toEqual([ids[1]]);
  expect(searchStudents(db,viewer,'v654321').students).toEqual([]);
 }finally{db.close();}
});
