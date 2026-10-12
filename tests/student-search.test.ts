import {createApiServer} from '../server/main';
import {randomUUID} from 'node:crypto';
import {it,expect} from 'vitest';
import {openDatabase} from '../server/database';
import {createAccount,login,issueCode,register,verifyOwnEmail} from '../server/auth';
import {Repository} from '../server/repository';
import {searchStudents,studentNumber} from '../server/student-search';
it('学校邮箱验证码绑定前缀，搜索尊重角色与隐私',()=>{
 const db=openDatabase(':memory:');try {
 createAccount(db,{email:'viewer@example.test',name:'查找者',password:'Acceptance-123',roles:['student']});
 const viewer=login(db,'viewer@example.test','Acceptance-123').account;
 issueCode(db,'123456@bnbu.edu.cn');
 const mail=db.prepare('SELECT body FROM mail_outbox WHERE recipient=?').get('123456@bnbu.edu.cn') as {body:string};
 register(db,{email:'123456@bnbu.edu.cn',password:'Acceptance-123',code:mail.body.match(/\d{6}/)![0]});
 let person=login(db,'123456@bnbu.edu.cn','Acceptance-123').account;
 expect(studentNumber(db,person)).toBeNull();
 db.prepare('UPDATE accounts SET roles=?,organization=? WHERE id=?').run('["student"]','学院',person.id);
 person=login(db,'123456@bnbu.edu.cn','Acceptance-123').account;
 expect(studentNumber(db,person)).toBe('123456');
 expect(searchStudents(db,viewer,'123')).toEqual({students:[]});
 expect(searchStudents(db,viewer,'123456').students[0]).toMatchObject({id:person.id,organization:'学院'});
 const repo=new Repository(db);const prefs=repo.create('preferences',person.id,{profilePreview:false});
 expect(searchStudents(db,viewer,'123456').students[0].organization).toBe('');
 repo.save(prefs,{searchable:false});expect(searchStudents(db,viewer,'123456').students).toEqual([]);
 expect(()=>searchStudents(db,{...viewer,roles:['teacher']},'123456')).toThrow();
 createAccount(db,{email:'654321@bnbu.edu.cn',name:'未验证',password:'Acceptance-123',roles:['student']});
 expect(searchStudents(db,viewer,'654321').students).toEqual([]);
 const existing=login(db,'654321@bnbu.edu.cn','Acceptance-123').account;
 issueCode(db,existing.email);
 const existingMail=db.prepare('SELECT body FROM mail_outbox WHERE recipient=?').get(existing.email) as {body:string};
 const code=existingMail.body.match(/\d{6}/)![0];
 expect(()=>verifyOwnEmail(db,viewer,code)).toThrow();
 verifyOwnEmail(db,existing,code);
 expect(searchStudents(db,viewer,'654321').students[0].id).toBe(existing.id);
 expect(()=>verifyOwnEmail(db,existing,code)).toThrow();
 } finally {db.close()}
});

it('HTTP 本人邮箱验证、学号搜索和隐私设置贯通',async()=>{
 const db=openDatabase(':memory:'); const server=createApiServer(db,{localOutbox:true});
 try {
  createAccount(db,{email:'2026123@bnbu.edu.cn',name:'测试学生',password:'Acceptance-123',roles:['student']});
  const actor=login(db,'2026123@bnbu.edu.cn','Acceptance-123');
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
