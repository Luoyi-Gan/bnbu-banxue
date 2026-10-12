import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const base='http://127.0.0.1:4188',email='y'+String(Math.floor(Math.random()*1e9)).padStart(9,'0')+'@bnbu.edu.cn',password=randomBytes(24).toString('base64url');
const sql=query=>execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',query],{encoding:'utf8'}).trim();
async function post(path,input,cookie='',key=randomUUID(),headers={}) {
  const response=await fetch(base+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json','Idempotency-Key':key,...(cookie?{Cookie:cookie}:{}),...headers},body:JSON.stringify(input)});
  const body=await response.json();assert.ok(response.ok,`${path}: ${JSON.stringify(body)}`);return {body,cookie:response.headers.get('set-cookie')?.split(';')[0],headers:response.headers};
}
await post('/api/auth/verification-codes',{email});
const code=/\d{6}/.exec(sql(`SELECT body FROM public.mail_outbox WHERE recipient='${email}'`))[0];
await post('/api/auth/register',{email,password,code});
const companion=await post('/api/auth/sign-in',{identifier:email,password});
const companionId=companion.body.account.id;
assert.ok(companion.cookie.startsWith('bnbu_session='));
const teacher=randomUUID(),semester=randomUUID(),course=randomUUID(),invite=randomUUID(),inviteCode='v1.'+randomUUID();
// Explicit independent local teacher fixture; no school verification is claimed.
sql(`INSERT INTO sports.accounts(id,email,password_hash,name,roles,created_at) SELECT '${teacher}','teacher-${teacher}@example.test',password_hash,'Local teacher','["teacher"]','now' FROM public.accounts WHERE id='${companionId}'`);
for(const [id,kind,owner,data] of [
  [semester,'sportsSemester',null,{status:'CURRENT',name:'Isolation semester'}],
  [course,'sportsCourse',teacher,{semesterId:semester,status:'PUBLISHED',enrollmentOpen:true,name:'Isolation course'}],
  [invite,'sportsInvitation',teacher,{courseId:course,status:'ACTIVE',code:inviteCode,expiresAt:Date.now()+600000}],
])sql(`INSERT INTO sports.entities(id,kind,owner_id,data,created_at,updated_at) VALUES('${id}','${kind}',${owner?`'${owner}'`:'NULL'},'${JSON.stringify(data)}','now','now')`);
try {
  assert.equal((await fetch(base+'/api/v1/me',{headers:{Cookie:companion.cookie}})).status,401);
  const sent=(await post('/api/v1/auth/student-sign-in-codes',{organizationCode:'BNBU',account:email,channel:'EMAIL',locale:'zh-CN',joinInviteToken:inviteCode})).body.data;
  const otp=/\d{6}/.exec(sql(`SELECT body FROM sports.mail_outbox WHERE recipient='${email}'`))[0];
  const proof=(await post('/api/v1/auth/student-sign-in-codes/verify',{challengeId:sent.challengeId,code:otp,joinEmail:email,joinInviteToken:inviteCode,deviceId:'docker-isolation'})).body.data;
  const profile={joinEmailProof:proof.joinEmailProof,fullName:'Independent student',studentNumber:'2030123456',gender:'MALE',gradeYear:new Date().getFullYear(),collegeName:'FST',majorName:'CST',dateOfBirth:'2005-01-01',regionCode:'CN-44'};
  const path='/api/v1/course-invites/'+inviteCode;
  const capability=(await post(path+'/join-capabilities',profile)).body.data;
  const key=randomUUID(),joined=await post(path+'/join',{},companion.cookie,key,{'X-Join-Capability':capability.joinCapability});
  assert.ok(joined.cookie.startsWith('bnbu_sports_session='));assert.ok(joined.headers.get('set-cookie').includes('HttpOnly'));
  const studentId=joined.body.data.authSession.user.id;assert.notEqual(studentId,companionId);
  assert.deepEqual((await post(path+'/join',{},companion.cookie,key,{'X-Join-Capability':capability.joinCapability})).body,joined.body);
  const both=companion.cookie+'; '+joined.cookie;
  const me=await (await fetch(base+'/api/v1/me',{headers:{Cookie:both}})).json();assert.equal(me.data.user.id,studentId);assert.equal(me.data.studentProfile.studentNumber,profile.studentNumber);
  const main=await (await fetch(base+'/api/auth/me',{headers:{Cookie:both}})).json();assert.equal(main.account.id,companionId);assert.deepEqual(main.account.roles,[]);
  await post('/api/sports/auth/logout',{},both);
  assert.equal((await fetch(base+'/api/v1/me',{headers:{Cookie:both}})).status,401);
  assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:both}})).status,200);
  assert.equal(sql(`SELECT count(*) FROM sports.accounts WHERE email='${email}'`),'1');
  assert.equal(sql(`SELECT count(*) FROM public.accounts WHERE email='${email}'`),'1');
  sql(`UPDATE sports.accounts SET status='banned' WHERE id='${studentId}'`);
  console.log('PASS: same-email independent accounts, new student email proof and atomic enrollment, cookie isolation, retry and independent logout.');
} finally {
  sql(`UPDATE sports.entities SET data=(data::jsonb || '{"status":"ARCHIVED"}')::text WHERE id='${semester}'; UPDATE sports.entities SET data=(data::jsonb || '{"status":"REVOKED"}')::text WHERE id='${invite}'; UPDATE sports.accounts SET status='banned' WHERE id='${teacher}'`);
}
