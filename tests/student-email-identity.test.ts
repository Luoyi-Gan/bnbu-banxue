import {afterEach,expect,it} from 'vitest';
import {openDatabase} from '../backend/src/database';
import {authenticate,createAccount,issueCode,login,register,verifyOwnEmail} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
import {ownStudentIdentity} from '../backend/src/student-identity-workflow';

const databases:ReturnType<typeof openDatabase>[]=[];
afterEach(()=>{for(const db of databases.splice(0)) db.close()});
function setup(email='student@mail.bnbu.edu.cn') {
  const db=openDatabase(':memory:');databases.push(db);
  const id=createAccount(db,{email,name:'邮箱测试',password:'Acceptance-123'});
  return {db,id,repo:new Repository(db),session:login(db,email,'Acceptance-123')};
}
it('已验证学校邮箱自动消化旧待审申请，保留学号并且通知与审计只写一次',()=>{
  const {db,id,repo,session}=setup();
  const request=repo.create('studentIdentityRequest',id,{status:'pending',studentNumber:'2430036136',schoolName:'测试学生',email:session.account.email});
  repo.create('verifiedEmail',id,{email:session.account.email});
  const actor=authenticate(db,session.token);
  expect(actor.roles).toEqual(['student']);
  expect(ownStudentIdentity(db,actor).status).toBe('verified');
  expect(repo.get(request.id).data.source).toBe('verified-student-email');
  expect(repo.all('companionIdentity')[0].data.studentNumber).toBe('2430036136');
  authenticate(db,session.token);login(db,session.account.email,'Acceptance-123');
  expect(repo.all('companionIdentity')).toHaveLength(1);
  expect(db.prepare("SELECT count(*) AS n FROM audit WHERE action='student.identity.email-grant'").get()?.n).toBe(1);
  expect(db.prepare('SELECT count(*) AS n FROM notifications').get()?.n).toBe(1);
});
it.each(['student@bnbu.edu.cn','student@mail.bnbu.edu.cn.evil.test','student@sub.mail.bnbu.edu.cn','student@example.test'])('其他邮箱 %s 不自动授权',email=>{
  const {db,id,repo,session}=setup(email);repo.create('verifiedEmail',id,{email});
  expect(authenticate(db,session.token).roles).toEqual([]);
});
it('未验证及过期邮箱证明不授权，补验证后立即授权且不推导学号',()=>{
  const {db,id,repo,session}=setup();
  repo.create('verifiedEmail',id,{email:'old@mail.bnbu.edu.cn'});
  expect(authenticate(db,session.token).roles).toEqual([]);
  issueCode(db,session.account.email);
  const mail=db.prepare('SELECT body FROM mail_outbox ORDER BY created_at DESC LIMIT 1').get() as {body:string};
  verifyOwnEmail(db,session.account,mail.body.match(/\d{6}/)![0]);
  expect(authenticate(db,session.token).roles).toEqual(['student']);
  expect(repo.all('companionIdentity')[0].data).not.toHaveProperty('studentNumber');
});
it.each(['banned','revoked','ADMIN'])('不恢复封禁、撤销或管理账号 %s',kind=>{
  const {db,id,repo,session}=setup();repo.create('verifiedEmail',id,{email:session.account.email});
  if(kind==='banned') db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(id);
  if(kind==='revoked') repo.create('companionIdentity',id,{role:'student',status:'revoked'});
  if(kind==='ADMIN') db.prepare("UPDATE accounts SET login_kind='ADMIN',login_name='email-admin-test' WHERE id=?").run(id);
  expect(authenticate(db,session.token).roles).not.toContain('student');
});
it('学校邮箱验证码注册同事务授予学生身份',()=>{
  const db=openDatabase(':memory:');databases.push(db);const email='NEW@mail.bnbu.edu.cn';issueCode(db,email);
  const mail=db.prepare('SELECT body FROM mail_outbox LIMIT 1').get() as {body:string};
  register(db,{email,code:mail.body.match(/\d{6}/)![0],password:'Acceptance-123'});
  expect(login(db,email,'Acceptance-123').account.roles).toEqual(['student']);
  expect(new Repository(db).all('companionIdentity')).toHaveLength(1);
});
