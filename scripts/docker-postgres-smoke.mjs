import sharp from 'sharp';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Explicit local acceptance fixture, isolated from the original SQLite service.
const base='http://127.0.0.1:4188';
const email=`smoke-${randomUUID()}@example.test`;
const password=randomBytes(24).toString('base64url');
let cookie='';
let sportsMode=false;
function docker(args,options) {
  if(sportsMode && args[0]==='exec' && args[1]==='bnbu-postgres-local-postgres-1')args=['exec','-e','PGOPTIONS=-c search_path=sports',...args.slice(1)];
  return execFileSync('docker',args,options);
}
async function request(path,input) {
  if(sportsMode){
    if(path.startsWith('/api/auth/'))path=path.replace('/api/auth/','/api/sports/auth/');
    if(path==='/api/commands')path='/api/sports/commands';
  }
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
const body=docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT body FROM mail_outbox WHERE recipient='${email}'`],{encoding:'utf8'});
const code=/\d{6}/.exec(body)?.[0];
assert.ok(code);
await request('/api/auth/register',{email,password,code});
await request('/api/auth/sign-in',{identifier:email,password});
let actor=(await request('/api/auth/me')).account;
assert.deepEqual(actor.roles,[]);
assert.match(actor.id,/^[0-9a-f-]{36}$/);
// Local fixture authorization is explicit; registration itself grants no school role.
docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE accounts SET roles='["student"]' WHERE id='${actor.id}'`],{stdio:'pipe'});
await request('/api/commands',{action:'preferences.preview',input:{enabled:false},requestId:randomUUID()});
const avatar='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
await request('/api/commands',{action:'profile.save',input:{nickname:'容器验证',avatar},requestId:randomUUID()});
const profile=docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT data FROM entities WHERE kind='profile' AND owner_id='${actor.id}'`],{encoding:'utf8'});
assert.ok(profile.includes('$bnbuStoredImage'));
assert.ok(!profile.includes('data:image'));
docker(['restart','bnbu-postgres-local-postgres-1','bnbu-postgres-local-api-1'],{stdio:'pipe'});
let ready=false;
for(let i=0;i<30;i++) {
  try { if((await fetch(base+'/api/health')).ok) {ready=true;break;} } catch { /* startup */ }
  await new Promise(resolve=>setTimeout(resolve,1000));
}
assert.ok(ready,'API did not recover after restart');
assert.equal((await request('/api/auth/me')).account.id,actor.id);
const stored=docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT data::jsonb->>'profilePreview' FROM entities WHERE kind='preferences' AND owner_id='${actor.id}'`],{encoding:'utf8'}).trim();
assert.equal(stored,'false');
assert.ok(JSON.stringify(await request('/api/workspace')).includes(avatar),'Image did not survive restart');
const companionCookie=cookie,companionId=actor.id;
sportsMode=true;
const independentId=randomUUID();
docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO accounts(id,email,password_hash,name,roles,created_at) SELECT '${independentId}',email,password_hash,name,'["student"]','now' FROM public.accounts WHERE id='${companionId}'`],{stdio:'pipe'});
await request('/api/auth/sign-in',{identifier:email,password});
actor=(await request('/api/auth/me')).account;
assert.notEqual(actor.id,companionId);
assert.ok(cookie.startsWith('bnbu_sports_session='));
const sportsIdentity=randomUUID();
docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO entities(id,kind,owner_id,data,version,created_at,updated_at) VALUES('${sportsIdentity}','sportsIdentity','${actor.id}','{"role":"admin","status":"verified","permissions":["HELP"]}',1,'now','now')`],{stdio:'pipe'});
const helpInput={titleZh:'容器帮助验证',titleEn:'Container help',bodyZh:'本地验收内容',bodyEn:'Local acceptance fixture',category:'EXERCISE',keywords:'test',weight:1,publish:true};
const help=(await request('/api/commands',{action:'sports.help.save',input:helpInput,requestId:randomUUID()})).data;
assert.ok((await request('/api/sports/help?lang=zh')).articles.some(article=>article.id===help.id));
docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE entities SET data='{"role":"student","status":"verified"}' WHERE id='${sportsIdentity}'`],{stdio:'pipe'});
const studentArticle=(await request('/api/sports/help?lang=en')).articles.find(article=>article.id===help.id);
assert.equal(studentArticle.data.body,'Local acceptance fixture');
assert.equal(studentArticle.ownerId,null);
const sportsMe=(await request('/api/v1/me')).data;
assert.equal(sportsMe.user.id,actor.id);
assert.equal(sportsMe.user.role,'STUDENT');
assert.equal(sportsMe.user.status,'PENDING');
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
docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO notifications(id,recipient_id,event,body,created_at) VALUES('${notificationId}','${actor.id}','sports.fixture','Docker notification','2026-10-12T00:00:00Z')`],{stdio:'pipe'});
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
  [courseId,'sportsCourse',{name:'Docker 课程',semesterId,status:'PUBLISHED',description:'Local fixture',publishedAt:'2026-09-01T00:00:00Z',closingDate:'2027-01-27',settlementDate:'2027-01-28',startDate:'2026-09-01',deadlineDate:'2027-01-20',enrollmentOpen:true}],
  [enrollmentId,'sportsEnrollment',{courseId,semesterId,status:'ACTIVE'}],
];
for(const [id,kind,data] of fixtureRows) docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO entities(id,kind,owner_id,data,version,created_at,updated_at) VALUES('${id}','${kind}','${actor.id}','${JSON.stringify(data).replaceAll("'","''")}',1,'2026-10-12T00:00:00Z','2026-10-12T00:00:00Z')`],{stdio:'pipe'});
try {
  assert.equal((await request(`/api/v1/courses/${courseId}`)).data.courseName,'Docker 课程');
  const section=(await request(`/api/v1/class-sections/${courseId}`)).data;
  assert.equal(section.semesterId,semesterId);
  assert.equal(section.status,'ARCHIVED');
  assert.equal(section.submissionDeadlineAt,'2027-01-20T15:59:59.000Z');
  const members=await request(`/api/v1/enrollments?classSectionId=${courseId}`);
  assert.equal(members.data[0].studentId,actor.id);
  assert.equal(members.data[0].id,enrollmentId);
  assert.equal((await request('/api/v1/me')).data.user.status,'PENDING');
  const roster=(await request('/api/v1/enrollments/'+enrollmentId+'/roster-status')).data;
  assert.deepEqual(Object.keys(roster).sort(),['enrollmentId','classSectionId','generatedAt','available','rosterVersion','status','registrationComplete'].sort());
  assert.equal(roster.available,false);assert.equal(roster.registrationComplete,false);assert.equal(roster.status,null);
  assert.deepEqual((await request('/api/v1/student/enrollments/'+enrollmentId+'/physical-result')).data,{status:'NOT_RECORDED',result:null});
  assert.equal(members.meta.pagination.hasMore,false);
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE entities SET data=(data::jsonb || '{"status":"CURRENT"}'::jsonb)::text WHERE id='${semesterId}'; UPDATE entities SET data=(data::jsonb || '{"startDate":"${today}","deadlineDate":"${today}","startTime":"00:00","endTime":"23:59","threshold":30}'::jsonb)::text WHERE id='${courseId}'`],{stdio:'pipe'});
  const sessionWrite=async(path,input,key=randomUUID())=>{
    const response=await fetch(base+path,{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(input)});
    const payload=await response.json();assert.equal(response.status,200,JSON.stringify(payload));return payload.data;
  };
  assert.equal((await request('/api/v1/me')).data.user.status,'ACTIVE');
  let session=await sessionWrite('/api/v1/exercise-sessions',{enrollmentId,clientObservedAt:new Date().toISOString()});
  assert.equal((await request('/api/v1/exercise-sessions/active')).data.id,session.id);
  for(const [action,status] of [['pause','PAUSED'],['resume','IN_PROGRESS'],['finish','COMPLETED']]) {
    session=await sessionWrite(`/api/v1/exercise-sessions/${session.id}/${action}`,{expectedVersion:session.version,clientObservedAt:new Date().toISOString()});
    assert.equal(session.status,status);
  }
  assert.equal((await request(`/api/v1/exercise-sessions/${session.id}`)).data.status,'COMPLETED');
  const draft=await sessionWrite('/api/v1/exercise-records',{sessionId:session.id,creditType:'GENERAL',sportType:'RUNNING',sportName:null,description:'Docker record draft',clientRequestId:randomUUID()});
  assert.equal(draft.status,'DRAFT');
  assert.equal((await request('/api/v1/exercise-records/'+draft.id)).data.description,'Docker record draft');
  assert.ok((await request('/api/v1/exercise-records?limit=50&sort=-businessDate')).data.some(r=>r.id===draft.id));
  const editResponse=await fetch(base+'/api/v1/exercise-records/'+draft.id,{method:'PATCH',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:JSON.stringify({description:'Docker edited draft',expectedVersion:draft.version})});
  assert.equal(editResponse.status,200);const edited=(await editResponse.json()).data;
  assert.equal(edited.description,'Docker edited draft');
  const bytes=await sharp({create:{width:3,height:3,channels:3,background:'#123456'}}).png().toBuffer();
  const hash=createHash('sha256').update(bytes).digest('hex');
  const lease=await sessionWrite('/api/v1/media-uploads',{sessionId:session.id,businessPurpose:'EXERCISE_RECORD',mediaType:'IMAGE',mimeType:'image/png',fileSizeBytes:bytes.length,captureSource:'FILE_PICKER',declaredContentSha256:hash,durationSeconds:null});
  const uploaded=await fetch(base+lease.uploadUrl,{method:'PUT',headers:{Cookie:cookie,Origin:base,...lease.requiredHeaders},body:bytes});
  assert.equal(uploaded.status,200,await uploaded.text());
  assert.equal(uploaded.headers.get('etag'), '"'+hash+'"');
  const confirmed=await sessionWrite('/api/v1/media-uploads/'+lease.uploadSessionId+'/confirm',{etag:hash});
  await sessionWrite('/api/v1/media/'+lease.mediaId+'/bind',{sessionId:session.id,expectedVersion:confirmed.version});
  assert.equal((await request('/api/v1/media/'+lease.mediaId)).data.uploadStatus,'AVAILABLE');
  const access=await sessionWrite('/api/v1/media/'+lease.mediaId+'/access-url',{purpose:'VIEW_ORIGINAL'});
  const original=await fetch(base+access.accessUrl,{headers:{Cookie:cookie}});
  assert.equal(original.status,200);assert.equal(original.headers.get('content-type'),'image/png');
  assert.deepEqual(Buffer.from(await original.arrayBuffer()),bytes);
  assert.equal((await fetch(base+access.accessUrl)).status,401);

  assert.ok((await request('/api/v1/exercise-records/'+draft.id+'/evidence-context')).data.mediaIds.includes(lease.mediaId));
  const discarded=await sessionWrite('/api/v1/exercise-records/'+draft.id+'/discard',{expectedVersion:edited.version,reason:'Docker test cleanup'});
  assert.equal(discarded.status,'DISCARDED');
  const finalDraft=await sessionWrite('/api/v1/exercise-records',{sessionId:session.id,creditType:'GENERAL',sportType:'RUNNING',sportName:null,description:'Docker submitted record',clientRequestId:randomUUID()});
  const submitKey=randomUUID(),submitInput={mediaIds:[lease.mediaId],expectedVersion:finalDraft.version};
  const submit=async()=>{const response=await fetch(base+'/api/v1/exercise-records/'+finalDraft.id+'/submit',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':submitKey},body:JSON.stringify(submitInput)});const payload=await response.json();assert.equal(response.status,200,JSON.stringify(payload));return payload.data;};
  const submitted=await submit();assert.equal(submitted.status,'SUBMITTED');assert.equal(submitted.id,finalDraft.id);
  assert.deepEqual(await submit(),submitted);
  let reviewState;
  for(let attempt=0;attempt<80;attempt++) {
    reviewState=(await request('/api/v1/exercise-records/'+finalDraft.id)).data.workflowStage;
    if(reviewState==='TECHNICAL') break;
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.equal(reviewState,'TECHNICAL','Unconfigured AI should retain evidence in technical handling');
  const sportsWorkspace=await request('/api/sports/workspace');
  assert.ok(sportsWorkspace.records.some(r=>r.data.sourceDraftId===finalDraft.id));
  assert.ok(sportsWorkspace.courses.some(c=>c.id===courseId));
  const submittedMaterial=sportsWorkspace.materials.find(m=>m.data.mediaId===lease.mediaId);assert.ok(submittedMaterial);
  const materialResponse=await fetch(base+'/api/sports/materials/'+submittedMaterial.id,{headers:{Cookie:cookie}});
  assert.equal(materialResponse.status,200);assert.deepEqual(Buffer.from(await materialResponse.arrayBuffer()),bytes);
  assert.equal((await request('/api/v1/exercise-records?limit=50')).data.filter(r=>r.sessionId===session.id).length,1);


  const teacherId=randomUUID(),adminId=randomUUID(),adminLogin='smoke-admin-'+randomUUID(),teacherEmail='teacher-'+randomUUID()+'@example.test';
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',
    `INSERT INTO accounts(id,email,password_hash,name,roles,created_at,login_kind,login_name) SELECT '${teacherId}','${teacherEmail}',password_hash,'Docker teacher','["teacher"]','now','PERSONAL',NULL FROM accounts WHERE id='${actor.id}';
     INSERT INTO accounts(id,email,password_hash,name,roles,created_at,login_kind,login_name) SELECT '${adminId}','${adminLogin}@example.test',password_hash,'Docker administrator','["superadmin"]','now','ADMIN','${adminLogin}' FROM accounts WHERE id='${actor.id}';
     INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES('${randomUUID()}','sportsIdentity','${teacherId}','{"role":"teacher","status":"verified"}','now','now'),('${randomUUID()}','sportsIdentity','${adminId}','{"role":"admin","status":"verified"}','now','now');
     UPDATE entities SET owner_id='${teacherId}',data=(data::jsonb || '{"weeklyLimit":3,"relatedTarget":600,"otherTarget":600}'::jsonb)::text WHERE id='${courseId}';`],{stdio:'pipe'});
  const studentCookie=cookie;
  assert.equal((await request('/api/v1/auth/password-login',{account:adminLogin,password})).data.user.role,'ADMIN');
  const publishedTemplate=(await request('/api/commands',{action:'sports.template.publish',input:{name:'Docker fixed V8.1'},requestId:randomUUID()})).data;
  const futureYear=2100+Math.floor(Math.random()*7000),futureSemester={name:'Docker future semester',academicYear:futureYear+'-'+(futureYear+1),type:'SUMMER',startDate:futureYear+'-06-01',endDate:futureYear+'-08-31'};
  const createdSemester=(await request('/api/commands',{action:'sports.semester.create',input:futureSemester,requestId:randomUUID()})).data;
  await request('/api/commands',{action:'sports.semester.update',input:{...futureSemester,id:createdSemester.id,version:1,name:'Docker checked semester'},requestId:randomUUID()});
  const semesterView=(await request('/api/sports/workspace')).semesters.find(s=>s.id===createdSemester.id);
  assert.equal(semesterView.data.status,'UPCOMING');assert.equal(semesterView.data.name,'Docker checked semester');
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`DELETE FROM entities WHERE id='${createdSemester.id}'`],{stdio:'pipe'});
  const conversionTables=(await request('/api/sports/workspace')).conversionTables;
  assert.equal(conversionTables.length,4);assert.equal(conversionTables.reduce((n,t)=>n+t.data.rows.length,0),404);
  const conversionTable=conversionTables[0],conversionRow=conversionTable.data.rows[0];
  await request('/api/commands',{action:'sports.conversion.edit',input:{id:conversionTable.id,version:conversionTable.version,rowId:conversionRow.id,min:conversionRow.min,max:conversionRow.max,score:conversionRow.score,grade:conversionRow.grade,note:'Docker verification'},requestId:randomUUID()});
  const changedConversion=(await request('/api/sports/workspace')).conversionTables.find(t=>t.id===conversionTable.id);
  assert.equal(changedConversion.version,conversionTable.version+1);assert.equal(changedConversion.data.rows[0].note,'Docker verification');
  await request('/api/commands',{action:'sports.conversion.edit',input:{id:conversionTable.id,version:changedConversion.version,rowId:conversionRow.id,min:conversionRow.min,max:conversionRow.max,score:conversionRow.score,grade:conversionRow.grade,note:conversionRow.note},requestId:randomUUID()});
  const mode=(await request('/api/commands',{action:'sports.ai.manual',input:{courseId,endAt:new Date(Date.now()+3600000).toISOString(),reason:'Docker manual review fixture'},requestId:randomUUID()})).data;
  assert.equal((await request('/api/v1/auth/password-login',{account:teacherEmail,password})).data.user.role,'TEACHER');
  const teacherSecurity=(await request('/api/v1/auth/account-security')).data;
  assert.equal(teacherSecurity.mustChangePassword,false);
  const changedPassword=await sessionWrite('/api/v1/auth/own-password',{currentPassword:password,newPassword:password+'-updated',confirmPassword:password+'-updated',expectedVersion:teacherSecurity.version});
  assert.equal(changedPassword.mustChangePassword,false);
  assert.ok(changedPassword.version>teacherSecurity.version);
  const teacherWorkspace=await request('/api/sports/workspace');let reviewRecord=teacherWorkspace.records.find(r=>r.data.sourceDraftId===finalDraft.id);
  assert.equal(reviewRecord.data.status,'TEACHER_PENDING');
  const teacherMaterial=await fetch(base+'/api/sports/materials/'+submittedMaterial.id,{headers:{Cookie:cookie}});assert.equal(teacherMaterial.status,200);
  const teacherCookie=cookie;
  assert.equal((await request('/api/v1/admin/exercise-goal')).data.totalTargetMinutes,1200);
  const templatePage=(await request('/api/v1/rule-templates?limit=1')).data;assert.equal(templatePage.items[0].id,publishedTemplate.id);assert.equal(templatePage.items[0].rules.totalTargetMinutes,1200);
  const createdCourse=await sessionWrite('/api/v1/teacher/courses',{displayName:'Docker real publication'});
  const windowResponse=await fetch(base+'/api/v1/class-sections/'+createdCourse.id,{method:'PATCH',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:JSON.stringify({expectedVersion:1,checkInStartDate:'2026-09-01',checkInEndDate:'2027-01-20',dailyStartTime:'08:00',dailyEndTime:'22:00',excludedDates:[],checkInWindowMode:'AVAILABLE',submissionDeadlineAt:'2027-01-20T23:59:59+08:00'})});
  const savedWindow=await windowResponse.json();assert.equal(windowResponse.status,200,JSON.stringify(savedWindow));assert.equal(savedWindow.data.version,2);
  const publishCommand={action:'sports.course.configurepublish',input:{id:createdCourse.id,expectedCourseVersion:2,expectedVersion:0,publish:true,maximumMinutes:60,dailyLimit:1,globalTargetVersion:1,templateId:publishedTemplate.id,minimumMinutes:30,weeklyLimit:3,courseTarget:600,generalTarget:600,description:'Docker publication verification',regularDeadline:'2027-01-20T23:59:59+08:00',closingDeadline:'2027-01-27T23:59:59+08:00',settlementPlannedAt:'2027-01-28T00:00:00+08:00'},requestId:randomUUID()};
  const {id:publishedId,...publishFields}=publishCommand.input;
  const publishPath='/api/v1/class-sections/'+publishedId+'/v81-rules';
  const publishedCourse=await sessionWrite(publishPath,publishFields,publishCommand.requestId);assert.deepEqual(await sessionWrite(publishPath,publishFields,publishCommand.requestId),publishedCourse);assert.equal(publishedCourse.global_target_minutes,1200);
  assert.ok((await request('/api/v1/teacher/semesters')).data.items.some(s=>s.id===semesterId));
  const publishedView=(await request('/api/sports/workspace')).courses.find(c=>c.id===createdCourse.id);assert.equal(publishedView.data.status,'PUBLISHED');assert.equal(publishedView.data.enrollmentOpen,true);
  assert.equal((await request('/api/v1/class-sections/'+createdCourse.id+'/progress-target')).data.totalTargetSeconds,72000);
  const invitePath='/api/v1/class-sections/'+createdCourse.id+'/course-invites';
  const publishedInvite=await sessionWrite(invitePath,{expiresInMinutes:5});assert.equal(publishedInvite.status,'ACTIVE');
  assert.match(publishedInvite.inviteToken,/^v1\.[A-Za-z0-9_-]{16}$/);
  const publicPreview=await fetch(base+'/api/v1/course-invites/'+publishedInvite.inviteToken+'/preview');assert.equal(publicPreview.status,200);assert.equal((await publicPreview.json()).data.enrollmentOpen,true);
  const joinEmail='y'+String(Math.floor(Math.random()*1000000000)).padStart(9,'0')+'@bnbu.edu.cn';
  const emailChallenge=await sessionWrite('/api/v1/auth/student-sign-in-codes',{organizationCode:'BNBU',account:joinEmail,channel:'EMAIL',locale:'zh-CN',joinInviteToken:publishedInvite.inviteToken});assert.equal(emailChallenge.delivery,'local-outbox');
  const joinMail=docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT body FROM mail_outbox WHERE recipient='${joinEmail}'`],{encoding:'utf8'});
  const emailVerification={challengeId:emailChallenge.challengeId,code:/\d{6}/.exec(joinMail)[0],joinEmail,joinInviteToken:publishedInvite.inviteToken,deviceId:'docker-test'},emailVerifyKey=randomUUID();
  const emailProof=await sessionWrite('/api/v1/auth/student-sign-in-codes/verify',emailVerification,emailVerifyKey);assert.ok(emailProof.joinEmailProof);assert.deepEqual(await sessionWrite('/api/v1/auth/student-sign-in-codes/verify',emailVerification,emailVerifyKey),emailProof);
  const joinStudentId=randomUUID(),joinStudentEmail=joinEmail;
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`INSERT INTO accounts(id,email,password_hash,name,roles,created_at,login_kind) SELECT '${joinStudentId}','${joinStudentEmail}',password_hash,'Docker joining student','["student"]','now','PERSONAL' FROM accounts WHERE id='${actor.id}'; INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES('${randomUUID()}','sportsIdentity','${joinStudentId}','{"role":"student","status":"verified"}','now','now')`],{stdio:'pipe'});
  await request('/api/auth/sign-in',{identifier:joinStudentEmail,password});
  const memberProfile={fullName:'Docker joining student',studentNumber:'2030123456',gender:'MALE',gradeYear:2030,collegeName:'FST',majorName:'CST',dateOfBirth:'2010-01-01',regionCode:'GD'};
  const memberIdentity={role:'student',status:'verified',studentNumber:memberProfile.studentNumber,sex:memberProfile.gender,year:memberProfile.gradeYear,collegeName:memberProfile.collegeName,majorName:memberProfile.majorName,dateOfBirth:memberProfile.dateOfBirth,regionCode:memberProfile.regionCode,schoolEmail:joinStudentEmail,schoolEmailVerified:true};
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`UPDATE entities SET data='${JSON.stringify(memberIdentity)}' WHERE kind='sportsIdentity' AND owner_id='${joinStudentId}'`],{stdio:'pipe'});
  const signInChallenge=await sessionWrite('/api/v1/auth/student-sign-in-codes',{organizationCode:'BNBU',account:joinStudentEmail,channel:'EMAIL',locale:'zh-CN'});
  const signInMail=docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`SELECT body FROM mail_outbox WHERE recipient='${joinStudentEmail}'`],{encoding:'utf8'});
  const signInBody=JSON.stringify({challengeId:signInChallenge.challengeId,code:/\d{6}/.exec(signInMail)[0],deviceId:'docker-email-login'}),signInHeaders={Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID()};
  const signedIn=await fetch(base+'/api/v1/auth/student-sign-in-codes/verify',{method:'POST',headers:signInHeaders,body:signInBody});
  assert.equal(signedIn.status,200);assert.equal((await signedIn.json()).data.kind,'COMPANION');
  assert.ok(signedIn.headers.get('set-cookie').includes('HttpOnly'));cookie=signedIn.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/v1/me')).data.user.id,joinStudentId);
  const memberPath='/api/v1/course-invites/'+publishedInvite.inviteToken,issueKey=randomUUID();
  const capability=await sessionWrite(memberPath+'/join-capabilities/member',memberProfile,issueKey);
  assert.deepEqual(await sessionWrite(memberPath+'/join-capabilities/member',memberProfile,issueKey),capability);
  const joinHeaders={Cookie:cookie,Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID(),'X-Join-Capability':capability.joinCapability};
  const joinedResponse=await fetch(base+memberPath+'/join',{method:'POST',headers:joinHeaders,body:'{}'});
  assert.equal(joinedResponse.status,200);const joined=await joinedResponse.json();
  assert.deepEqual(await (await fetch(base+memberPath+'/join',{method:'POST',headers:joinHeaders,body:'{}'})).json(),joined);
  assert.equal(joined.data.authSession.kind,'COMPANION');
  assert.equal((await request('/api/v1/me')).data.studentProfile.studentNumber,memberProfile.studentNumber);
  assert.ok((await request('/api/v1/enrollments?classSectionId='+createdCourse.id)).data.some(e=>e.id===joined.data.enrollment.id && e.status==='ACTIVE'));
  cookie=teacherCookie;
  assert.ok((await request('/api/v1/enrollments?classSectionId='+createdCourse.id)).data.some(e=>e.studentId===joinStudentId));
  assert.equal((await sessionWrite(invitePath+'/revocations',{inviteToken:publishedInvite.inviteToken})).status,'REVOKED');
  assert.equal((await fetch(base+'/api/v1/course-invites/'+publishedInvite.inviteToken+'/preview')).status,410);
  await request('/api/commands',{action:'sports.course.close',input:{id:createdCourse.id,version:publishedView.version,reason:'Docker test completed'},requestId:randomUUID()});
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`DELETE FROM member_join_capabilities WHERE account_id='${joinStudentId}'; DELETE FROM student_email_challenges WHERE invitation_id IN (SELECT id FROM entities WHERE kind='sportsInvitation' AND data::jsonb->>'courseId'='${createdCourse.id}'); DELETE FROM entities WHERE id='${createdCourse.id}' OR (kind IN ('sportsInvitation','sportsEnrollment','sportsEnrollmentFlow') AND data::jsonb->>'courseId'='${createdCourse.id}'); UPDATE accounts SET status='banned',roles='[]' WHERE id='${joinStudentId}'`],{stdio:'pipe'});
  const teachingReport=await request('/api/sports/course-reports/'+courseId);
  const teachingProgress=await request('/api/v1/student-progress?classSectionId='+courseId);assert.equal(teachingProgress.data.find(p=>p.enrollmentId===enrollmentId).totalEffectiveSeconds,0);
  assert.equal((await request('/api/v1/students/'+actor.id)).data.id,actor.id);
  assert.equal(teachingReport.reportType,'CURRENT_TEACHING_REPORT');
  assert.equal(teachingReport.rows.find(r=>r.enrollmentId===enrollmentId).facts.enduranceStatus,'NOT_RECORDED');
  const reportCsvResponse=await fetch(base+'/api/sports/course-reports/'+courseId+'.csv',{headers:{Cookie:teacherCookie}});
  assert.equal(reportCsvResponse.status,200);assert.ok((await reportCsvResponse.text()).includes('Docker 课程'));
  const gradePath='/api/v1/enrollments/'+enrollmentId+'/final-grades';
  const gradeDraft=await sessionWrite(gradePath,{expectedVersion:0,finalGrade:82,published:false});assert.equal(gradeDraft.published,false);
  const gradePublished=await sessionWrite(gradePath,{expectedVersion:gradeDraft.version,finalGrade:82,published:true});assert.equal(gradePublished.published,true);
  const nextDraft=await sessionWrite(gradePath,{expectedVersion:gradePublished.version,finalGrade:91,published:false});assert.equal(nextDraft.published,false);
  const gradeWorkspace=await request('/api/sports/workspace');assert.equal(gradeWorkspace.gradePublications.find(g=>g.data.enrollmentId===enrollmentId).data.score,82);
  const gradeHistory=(await request(gradePath+'?limit=100')).data;assert.equal(gradeHistory.items[0].finalGrade,91);assert.equal(gradeHistory.items[0].published,false);
  cookie=studentCookie;const studentGradeView=await request('/api/sports/workspace');assert.deepEqual(studentGradeView.gradePublications,[]);assert.deepEqual(studentGradeView.gradeDrafts,[]);cookie=teacherCookie;
  const physical=await sessionWrite('/api/v1/enrollments/'+enrollmentId+'/physical-results',{expectedVersion:0,runType:'1000m',elapsedSeconds:245,testedOn:'2026-10-01'});
  assert.equal(physical.version,1);assert.equal(physical.elapsedSeconds,245);
  const physicalHistory=(await request('/api/v1/enrollments/'+enrollmentId+'/physical-results?limit=1')).data;
  assert.equal(physicalHistory.items.length,1);assert.equal(physicalHistory.items[0].version,1);assert.equal(physicalHistory.items[0].elapsedSeconds,245);assert.equal(physicalHistory.nextBeforeVersion,null);
  cookie=studentCookie;
  assert.deepEqual((await request('/api/v1/student/enrollments/'+enrollmentId+'/physical-result')).data,{status:'RECORDED',result:{runType:'1000m',elapsedSeconds:245,testedOn:'2026-10-01'}});
  cookie=teacherCookie;
  await request('/api/commands',{action:'sports.review.decide',input:{id:reviewRecord.id,version:reviewRecord.version,batchId:reviewRecord.data.batchId,checksCompleted:true,decision:'RETURN',reason:'UNCLEAR',publicExplanation:'Docker supplementary evidence',hours:24,canSupplementOriginal:true},requestId:randomUUID()});
  cookie=studentCookie;
  const workflow=(await request('/api/v1/exercise-records/'+finalDraft.id+'/workflow')).data;
  assert.equal(workflow.stage,'AWAITING_SUPPLEMENT');assert.equal(workflow.supplement.expired,false);
  const proofTodos=(await request('/api/v1/student/proof-todos?limit=100')).data;
  const todo=proofTodos.items.find(item=>item.recordId===finalDraft.id);
  assert.ok(todo);assert.equal(todo.reasonCode,'UNCLEAR_EVIDENCE');assert.equal(todo.publicComment,'Docker supplementary evidence');assert.equal(todo.expired,false);assert.equal(proofTodos.nextCursor,null);
  assert.ok(workflow.materials.some(m=>m.mediaId===lease.mediaId && m.materialVersion===1));
  const extraBytes=await sharp({create:{width:4,height:4,channels:3,background:'#654321'}}).png().toBuffer(),extraHash=createHash('sha256').update(extraBytes).digest('hex');
  const extra=await sessionWrite('/api/v1/media-uploads',{sessionId:session.id,businessPurpose:'EXERCISE_RECORD',mediaType:'IMAGE',mimeType:'image/png',fileSizeBytes:extraBytes.length,captureSource:'FILE_PICKER',declaredContentSha256:extraHash,durationSeconds:null});
  const extraPut=await fetch(base+extra.uploadUrl,{method:'PUT',headers:{Cookie:cookie,Origin:base,...extra.requiredHeaders},body:extraBytes});assert.equal(extraPut.status,200,await extraPut.text());
  const extraConfirmed=await sessionWrite('/api/v1/media-uploads/'+extra.uploadSessionId+'/confirm',{etag:extraHash});
  await sessionWrite('/api/v1/media/'+extra.mediaId+'/bind',{sessionId:session.id,expectedVersion:extraConfirmed.version});
  const supplemented=await sessionWrite('/api/v1/exercise-records/'+finalDraft.id+'/supplements',{mediaIds:[lease.mediaId,extra.mediaId],expectedVersion:workflow.version});
  assert.equal(supplemented.workflowStage,'PENDING_TEACHER');assert.equal(supplemented.materialVersion,2);
  assert.equal((await request('/api/v1/student/proof-todos?limit=100')).data.items.some(item=>item.recordId===finalDraft.id),false);
  assert.equal((await request('/api/v1/exercise-records/'+finalDraft.id)).data.materialVersion,2);
  cookie=teacherCookie;
  const afterSupplement=await request('/api/sports/workspace');reviewRecord=afterSupplement.records.find(r=>r.id===reviewRecord.id);
  const secondMaterials=afterSupplement.materials.filter(m=>m.data.batchId===reviewRecord.data.batchId);assert.equal(secondMaterials.length,2);
  for(const m of secondMaterials) {const response=await fetch(base+'/api/sports/materials/'+m.id,{headers:{Cookie:cookie}});assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),m.data.mediaId===lease.mediaId?bytes:extraBytes);}
  await request('/api/commands',{action:'sports.review.decide',input:{id:reviewRecord.id,version:reviewRecord.version,batchId:reviewRecord.data.batchId,checksCompleted:true,decision:'PASS'},requestId:randomUUID()});
  cookie=studentCookie;const reviewed=(await request('/api/v1/exercise-records/'+finalDraft.id)).data;
  assert.equal(reviewed.status,'REVIEWED');assert.equal(reviewed.currentReview.result,'VALID');assert.equal(reviewed.creditedDurationSeconds,0,'Short fixture must not receive unearned credit');
  assert.equal((await request('/api/v1/class-sections/'+courseId+'/v81-rules')).data.minimum_minutes,30);
  assert.deepEqual((await request('/api/v1/exemption-application-details')).data,[]);
  assert.deepEqual((await request('/api/v1/activity-certification-applications?limit=100')).data,[]);
  const studentProgress=(await request('/api/v1/student-progress?limit=100')).data.find(p=>p.enrollmentId===enrollmentId);
  assert.ok(studentProgress);assert.equal(studentProgress.general.effectiveSeconds,0);
  assert.equal((await request('/api/v1/class-sections/'+courseId+'/progress-target')).data.totalTargetSeconds,72000);
  assert.equal((await request('/api/v1/auth/password-login',{account:adminLogin,password})).data.user.role,'ADMIN');
  const manual=(await request('/api/sports/workspace')).manualModes.find(m=>m.id===mode.id);
  await request('/api/commands',{action:'sports.ai.stop',input:{id:manual.id,version:manual.version,reason:'Docker fixture complete'},requestId:randomUUID()});
  cookie=studentCookie;
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`DELETE FROM entities WHERE id='${mode.id}'; UPDATE accounts SET roles='[]',status='banned' WHERE id IN ('${adminId}','${teacherId}')`],{stdio:'pipe'});
} finally {
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-Atc',`DELETE FROM entities WHERE id IN ('${semesterId}','${courseId}','${enrollmentId}')`],{stdio:'pipe'});
}
await request('/api/auth/logout',{});
assert.equal((await fetch(base+'/api/sports/auth/me',{headers:{Cookie:cookie}})).status,401);
assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:companionCookie}})).status,200);
console.log('PASS: independent-account PostgreSQL Docker proxy, registration, login, settings, private image storage, restart persistence, sports help, exercise upload and submission, technical handling, administrator manual mode, teacher review, student result, logout.');

