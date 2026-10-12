import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Explicit local acceptance fixture, isolated from the original SQLite service.
const base='http://127.0.0.1:4188';
const email=`smoke-${randomUUID()}@example.test`;
const password=randomBytes(24).toString('base64url');
let cookie='';
async function request(path,input) {
  const response=await fetch(base+path,{
    method:input===undefined?'GET':'POST',
    headers:{...(cookie?{Cookie:cookie}:{}),...(input===undefined?{}:{'Content-Type':'application/json',Origin:base})},
    ...(input===undefined?{}:{body:JSON.stringify(input)}),
  });
  const data=await response.json();
  assert.equal(response.status, path==='/api/auth/register'?201:200,`${path}: ${JSON.stringify(data)}`);
  if(response.headers.get('set-cookie')) cookie=response.headers.get('set-cookie').split(';')[0];
  return data;
}
assert.equal((await request('/api/health')).storage,'postgresql');
assert.equal((await request('/api/v1/system-mode/announcement')).data.mode,'NORMAL');
assert.equal((await fetch(base+'/api/v1/me')).status,401);
assert.equal((await fetch(base+'/v2/login')).status,200);
assert.equal((await fetch(base+'/api/auth/me')).status,401);
await request('/api/auth/verification-codes',{email});
// email is generated above using UUID characters only, never supplied by a caller.
const body=execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT body FROM mail_outbox WHERE recipient='${email}'`],{encoding:'utf8'});
const code=/\d{6}/.exec(body)?.[0];
assert.ok(code);
await request('/api/auth/register',{email,password,code});
await request('/api/auth/sign-in',{identifier:email,password});
const actor=(await request('/api/auth/me')).account;
assert.deepEqual(actor.roles,[]);
assert.match(actor.id,/^[0-9a-f-]{36}$/);
// Local fixture authorization is explicit; registration itself grants no school role.
execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE accounts SET roles='["student"]' WHERE id='${actor.id}'`],{stdio:'pipe'});
await request('/api/commands',{action:'preferences.preview',input:{enabled:false},requestId:randomUUID()});
const avatar='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
await request('/api/commands',{action:'profile.save',input:{nickname:'容器验证',avatar},requestId:randomUUID()});
const profile=execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT data FROM entities WHERE kind='profile' AND owner_id='${actor.id}'`],{encoding:'utf8'});
assert.ok(profile.includes('$bnbuStoredImage'));
assert.ok(!profile.includes('data:image'));
execFileSync('docker',['restart','bnbu-postgres-local-postgres-1','bnbu-postgres-local-api-1'],{stdio:'pipe'});
let ready=false;
for(let i=0;i<30;i++) {
  try { if((await fetch(base+'/api/health')).ok) {ready=true;break;} } catch { /* startup */ }
  await new Promise(resolve=>setTimeout(resolve,1000));
}
assert.ok(ready,'API did not recover after restart');
assert.equal((await request('/api/auth/me')).account.id,actor.id);
const stored=execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT data::jsonb->>'profilePreview' FROM entities WHERE kind='preferences' AND owner_id='${actor.id}'`],{encoding:'utf8'}).trim();
assert.equal(stored,'false');
assert.ok(JSON.stringify(await request('/api/workspace')).includes(avatar),'Image did not survive restart');
const sportsIdentity=randomUUID();
execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO entities(id,kind,owner_id,data,version,created_at,updated_at) VALUES('${sportsIdentity}','sportsIdentity','${actor.id}','{"role":"admin","status":"verified","permissions":["HELP"]}',1,'now','now')`],{stdio:'pipe'});
const helpInput={titleZh:'容器帮助验证',titleEn:'Container help',bodyZh:'本地验收内容',bodyEn:'Local acceptance fixture',category:'EXERCISE',keywords:'test',weight:1,publish:true};
const help=(await request('/api/commands',{action:'sports.help.save',input:helpInput,requestId:randomUUID()})).data;
assert.ok((await request('/api/sports/help?lang=zh')).articles.some(article=>article.id===help.id));
execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE entities SET data='{"role":"student","status":"verified"}' WHERE id='${sportsIdentity}'`],{stdio:'pipe'});
const studentArticle=(await request('/api/sports/help?lang=en')).articles.find(article=>article.id===help.id);
assert.equal(studentArticle.data.body,'Local acceptance fixture');
assert.equal(studentArticle.ownerId,null);
const sportsMe=(await request('/api/v1/me')).data;
assert.equal(sportsMe.user.id,actor.id);
assert.equal(sportsMe.user.role,'STUDENT');
assert.equal(sportsMe.user.emailVerified,false);
assert.equal(sportsMe.studentProfile.studentNumber,null);
assert.equal(sportsMe.studentProfile.fullName,actor.name);
const originalPreferences=(await request('/api/v1/me/preferences')).data;
assert.equal(originalPreferences.pushEnabled,false);
assert.equal(originalPreferences.emailEnabled,false);
const preferencesHeaders={Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID()};
const preferenceBody=JSON.stringify({locale:'en',pushEnabled:false,emailEnabled:false,expectedVersion:originalPreferences.version});
const preferenceResponse=await fetch(base+'/api/v1/me/preferences',{method:'PATCH',headers:preferencesHeaders,body:preferenceBody});
assert.equal(preferenceResponse.status,200);
const preferenceResult=await preferenceResponse.json();
assert.equal(preferenceResult.data.locale,'en');
assert.deepEqual(await (await fetch(base+'/api/v1/me/preferences',{method:'PATCH',headers:preferencesHeaders,body:preferenceBody})).json(),preferenceResult);
assert.deepEqual((await request('/api/v1/me/preferences')).data,preferenceResult.data);
const notificationId=randomUUID();
execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO notifications(id,recipient_id,event,body,created_at) VALUES('${notificationId}','${actor.id}','sports.fixture','Docker notification','2026-10-12T00:00:00Z')`],{stdio:'pipe'});
assert.ok((await request('/api/v1/notifications?unreadOnly=true')).data.some(n=>n.id===notificationId));
const readHeaders={Cookie:cookie,Origin:base,'Idempotency-Key':randomUUID()};
const readResponse=await fetch(`${base}/api/v1/notifications/${notificationId}/read`,{method:'POST',headers:readHeaders});
assert.equal(readResponse.status,200);
const readResult=await readResponse.json();
assert.ok(readResult.data.readAt);
assert.deepEqual(await (await fetch(`${base}/api/v1/notifications/${notificationId}/read`,{method:'POST',headers:readHeaders})).json(),readResult);
assert.ok(!(await request('/api/v1/notifications?unreadOnly=true')).data.some(n=>n.id===notificationId));
const semesterId=randomUUID(),courseId=randomUUID(),enrollmentId=randomUUID();
// Create isolated read fixtures; this does not claim the course creation flow is migrated.
const fixtureRows=[
  [semesterId,'sportsSemester',{name:'Docker 学期',academicYear:'2026-2027',type:'AUTUMN',status:'ARCHIVED',startDate:'2026-09-01',endDate:'2027-01-31'}],
  [courseId,'sportsCourse',{name:'Docker 课程',semesterId,status:'PUBLISHED',description:'Local fixture',startDate:'2026-09-01',deadlineDate:'2027-01-20',enrollmentOpen:true}],
  [enrollmentId,'sportsEnrollment',{courseId,semesterId,status:'ACTIVE'}],
];
for(const [id,kind,data] of fixtureRows) execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO entities(id,kind,owner_id,data,version,created_at,updated_at) VALUES('${id}','${kind}','${actor.id}','${JSON.stringify(data).replaceAll("'","''")}',1,'2026-10-12T00:00:00Z','2026-10-12T00:00:00Z')`],{stdio:'pipe'});
try {
  assert.equal((await request(`/api/v1/courses/${courseId}`)).data.courseName,'Docker 课程');
  const section=(await request(`/api/v1/class-sections/${courseId}`)).data;
  assert.equal(section.semesterId,semesterId);
  assert.equal(section.status,'ARCHIVED');
  assert.equal(section.submissionDeadlineAt,'2027-01-20T15:59:59.000Z');
  const members=await request(`/api/v1/enrollments?classSectionId=${courseId}`);
  assert.equal(members.data[0].studentId,actor.id);
  assert.equal(members.data[0].id,enrollmentId);
  assert.equal(members.meta.pagination.hasMore,false);
} finally {
  execFileSync('docker',['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`DELETE FROM entities WHERE id IN ('${semesterId}','${courseId}','${enrollmentId}')`],{stdio:'pipe'});
}
await request('/api/auth/logout',{});
assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status,401);
console.log('PASS: PostgreSQL Docker proxy, registration, login, settings, private image storage, restart persistence, sports help publication and student reading, logout.');
