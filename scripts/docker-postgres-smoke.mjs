import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Explicit local acceptance fixture, isolated from the original SQLite service.
const base='http://127.0.0.1:4188';
const email=`smoke-${randomUUID()}@example.test`;
const password=randomBytes(24).toString('base64url');
let cookie='';
function docker(args,options) { return execFileSync('docker',args,options); }
const fixtureAccounts=[];
// Also revoke fixtures on an assertion failure; never leave a test operator logged in.
process.on('exit',()=>{
  if(!fixtureAccounts.length)return;
  assert.ok(fixtureAccounts.every(id=>/^[0-9a-f-]{36}$/.test(id)));
  const ids=fixtureAccounts.map(id=>`'${id}'`).join(',');
  try {
    docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',`BEGIN; DELETE FROM sessions WHERE account_id IN (${ids}); UPDATE accounts SET status='banned',roles='[]' WHERE id IN (${ids}); COMMIT;`],{stdio:'pipe'});
  } catch {
    console.error('Local smoke fixture cleanup failed; test account sessions require cleanup before sharing this database.');
    process.exitCode=1;
  }
});
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
fixtureAccounts.push(actor.id);
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
{
  const authorCookie=cookie,viewerId=randomUUID(),reviewerId=randomUUID(),operatorId=randomUUID(),teacherId=randomUUID();
  for(const [id,role] of [[viewerId,'student'],[reviewerId,'reviewer'],[operatorId,'operator'],[teacherId,'teacher']]) {
    fixtureAccounts.push(id);
    docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',`INSERT INTO accounts(id,email,password_hash,name,roles,created_at) SELECT '${id}','${id}@example.test',password_hash,'Docker ${role}','["${role}"]','now' FROM accounts WHERE id='${actor.id}'`],{stdio:'pipe'});
  }
  const command=(action,input,requestId=randomUUID())=>request('/api/commands',{action,input,requestId});
  const postInput={title:'Docker社区审核验收',body:'独立本地夹具',board:'校园'},postKey=randomUUID();
  const post=await command('post.create',postInput,postKey);
  assert.deepEqual(await command('post.create',postInput,postKey),post);
  const postId=post.data.id;
  const denied=await fetch(base+'/api/commands',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'content.review',input:{id:postId,status:'visible'},requestId:randomUUID()})});
  assert.equal(denied.status,403);
  await request('/api/auth/sign-in',{identifier:viewerId+'@example.test',password});
  assert.ok(!(await request('/api/community')).posts.some(p=>p.id===postId));
  await request('/api/auth/sign-in',{identifier:reviewerId+'@example.test',password});
  await command('content.review',{id:postId,status:'visible'});
  await request('/api/auth/sign-in',{identifier:viewerId+'@example.test',password});
  assert.ok((await request('/api/community')).posts.some(p=>p.id===postId));
  await command('relation.set',{id:postId,kind:'like',enabled:true});
  await command('relation.set',{id:postId,kind:'save',enabled:true});
  const view=await request('/api/community');assert.ok(view.likedPosts.includes(postId));assert.ok(view.savedPosts.includes(postId));
  cookie=authorCookie;
  assert.ok((await request('/api/workspace')).notifications.some(n=>n.entityId===postId));
  const room=(await command('room.create',{type:'study',title:'Docker组队验收',body:'本地测试',time:'周末',place:'图书馆',capacity:2})).data;
  const rejectCommand=async(action,input,status)=>{
    const response=await fetch(base+'/api/commands',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action,input,requestId:randomUUID()})});
    assert.equal(response.status,status,await response.text());
  };
  await request('/api/auth/sign-in',{identifier:viewerId+'@example.test',password});
  const memberCookie=cookie;
  const application=(await command('room.apply',{id:room.id})).data;
  await rejectCommand('message.send',{roomId:room.id,body:'未入队不能发言'},403);
  cookie=authorCookie;
  await command('room.decide',{id:application.id,accept:true});
  const first=(await command('message.send',{roomId:room.id,body:'队长消息'})).data;
  cookie=memberCookie;
  assert.ok((await request('/api/workspace')).entities.some(e=>e.id===first.id));
  const reply=(await command('message.send',{roomId:room.id,body:'成员回复'})).data;
  cookie=authorCookie;
  assert.ok((await request('/api/workspace')).entities.some(e=>e.id===reply.id));
  await command('room.finish',{id:room.id});
  await command('room.review',{id:room.id,targetId:viewerId,stars:5,comment:'合作愉快'});
  cookie=memberCookie;
  await rejectCommand('message.send',{roomId:room.id,body:'结束后不能发送'},403);
  const reviewInput={id:room.id,targetId:actor.id,stars:5,comment:'合作愉快'};
  await command('room.review',reviewInput);
  await rejectCommand('room.review',reviewInput,409);
  await request('/api/auth/sign-in',{identifier:teacherId+'@example.test',password});
  const teacherCookie=cookie,start=Date.now()+86400000;
  const slots=[];
  for(const offset of [0,7200000]) slots.push((await command('coffee.slot.create',{startAt:new Date(start+offset).toISOString(),endAt:new Date(start+offset+3600000).toISOString(),capacity:1,location:'本地测试交流室'})).data);
  cookie=authorCookie;
  const booking=(await command('coffee.book',{slotId:slots[0].id,topic:'Docker交流预约'})).data;
  cookie=teacherCookie;
  assert.ok((await request('/api/workspace')).entities.some(e=>e.id===booking.id));
  await command('coffee.move',{id:booking.id,slotId:slots[1].id,reason:'本地改期验证'});
  cookie=authorCookie;
  assert.equal((await request('/api/workspace')).entities.find(e=>e.id===booking.id).data.slotId,slots[0].id);
  cookie=memberCookie;
  assert.ok(!(await request('/api/workspace')).entities.some(e=>e.id===booking.id));
  await rejectCommand('coffee.book',{slotId:slots[1].id,topic:'预留名额不可抢占'},409);
  cookie=authorCookie;
  await command('coffee.answer',{id:booking.id,accept:true});
  for(const session of [authorCookie,teacherCookie]) {
    cookie=session;
    assert.equal((await request('/api/workspace')).entities.find(e=>e.id===booking.id).data.slotId,slots[1].id);
  }
  cookie=authorCookie;
  await command('coffee.cancel',{id:booking.id,reason:'本地取消验证'});
  cookie=memberCookie;
  const released=(await command('coffee.book',{slotId:slots[1].id,topic:'使用释放的名额'})).data;
  await command('coffee.cancel',{id:released.id,reason:'验收收尾'});
  cookie=teacherCookie;
  assert.equal((await request('/api/workspace')).entities.find(e=>e.id===booking.id).data.status,'cancelled');
  const teacherView=await request('/api/workspace');
  for(const slot of slots) {
    const data=teacherView.entities.find(e=>e.id===slot.id).data;
    await command('coffee.slot.update',{id:slot.id,startAt:data.startAt,endAt:data.endAt,capacity:1,location:data.location,closed:true});
  }
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',`DELETE FROM sessions WHERE account_id='${teacherId}'; UPDATE accounts SET status='banned',roles='[]' WHERE id='${teacherId}'`],{stdio:'pipe'});
  console.log('PASS Docker teacher appointments: shared booking, reschedule reservation and consent, privacy, cancellation and released capacity.');
  cookie=authorCookie;
  const privateNumber='TEST-'+randomUUID(),privateEvidence='验收核验说明-'+randomUUID();
  await command('alumni.apply',{studentNumber:privateNumber,major:'计算机',graduationYear:2024,city:'珠海',direction:'就业',experience:'工作',topics:'实习',bio:'',evidence:privateEvidence});
  await request('/api/auth/sign-in',{identifier:reviewerId+'@example.test',password});
  const reviewerCookie=cookie;
  const alumniProfile=(await request('/api/workspace')).alumni.profiles.find(p=>p.owner===actor.id);
  assert.equal(alumniProfile.studentNumber,privateNumber);
  await command('alumni.review',{id:alumniProfile.id,approve:true});
  cookie=memberCookie;
  const publicAlumni=await request('/api/workspace');
  assert.equal(publicAlumni.alumni.profiles.find(p=>p.id===alumniProfile.id).studentNumber,undefined);
  assert.ok(!JSON.stringify(publicAlumni).includes(privateEvidence));
  cookie=authorCookie;
  const alumniStart=Date.now()+3*86400000;
  await command('alumni.slot.create',{startAt:new Date(alumniStart).toISOString(),endAt:new Date(alumniStart+3600000).toISOString(),location:'本地校友交流室'});
  const alumniSlot=(await request('/api/workspace')).alumni.slots.find(s=>s.alumniId===alumniProfile.id);
  cookie=memberCookie;
  await command('alumni.request',{slotId:alumniSlot.id,question:'实习交流'});
  const alumniBooking=(await request('/api/workspace')).alumni.bookings.find(b=>b.slotId===alumniSlot.id);
  cookie=authorCookie;
  await command('alumni.decide',{id:alumniBooking.id,accept:true});
  cookie=memberCookie;
  assert.equal((await request('/api/workspace')).alumni.bookings.find(b=>b.id===alumniBooking.id).status,'confirmed');
  cookie=reviewerCookie;
  await command('alumni.review',{id:alumniProfile.id,approve:false,reason:'本地验收撤销认证'});
  for(const session of [authorCookie,memberCookie]) {
    cookie=session;
    assert.equal((await request('/api/workspace')).alumni.bookings.find(b=>b.id===alumniBooking.id).status,'cancelled');
  }
  console.log('PASS Docker alumni: verification, private evidence, appointment acceptance and cancellation after revocation.');
  await request('/api/auth/sign-in',{identifier:operatorId+'@example.test',password});
  const operatorCookie=cookie;
  const mailTime=time=>new Date(time+8*3600000).toISOString().slice(0,16)+'+08:00';
  const eventStart=mailTime(Date.now()+7*86400000),eventEnd=mailTime(Date.now()+7*86400000+3600000);
  const source={messageId:randomUUID(),subject:'容器校园讲座',sender:'school-'+randomUUID()+'@example.test',body:`活动名称：容器公开讲座\n活动介绍：本地测试资料\n活动开始时间：${eventStart}\n活动结束时间：${eventEnd}\n活动地点：图书馆\n主办方：测试学院`};
  const imported=(await command('mail.import',source)).data;
  cookie=authorCookie;
  const activity=(await request('/api/workspace')).entities.find(e=>e.kind==='activity' && e.data.mailId===imported.id);
  assert.equal(activity.data.image,'/activity-default-cover.svg');
  await command('relation.set',{id:activity.id,kind:'save',enabled:true});
  await command('relation.set',{id:activity.id,kind:'participate',enabled:true});
  cookie=memberCookie;
  await command('relation.set',{id:activity.id,kind:'like',enabled:true});
  cookie=operatorCookie;
  await command('mail.correct',{id:imported.id,title:'容器公开讲座',description:'本地测试资料',startAt:eventStart,endAt:eventEnd,location:'测试新地点',host:'测试学院',conditions:'',reason:'邮件地点更正验证'});
  cookie=authorCookie;
  const corrected=await request('/api/workspace');
  assert.equal(corrected.notifications.filter(n=>n.entityId===activity.id && n.event==='activity.changed').length,1);
  assert.ok(!JSON.stringify(corrected).includes(source.sender));
  cookie=memberCookie;
  assert.equal((await request('/api/workspace')).notifications.filter(n=>n.entityId===activity.id && n.event==='activity.changed').length,0);
  cookie=operatorCookie;
  await command('mail.import',source);
  cookie=authorCookie;
  const repeated=(await request('/api/workspace')).entities.filter(e=>e.kind==='activity' && e.data.mailId===imported.id);
  assert.equal(repeated.length,1);
  assert.equal(repeated[0].data.location,'测试新地点');
  cookie=operatorCookie;
  await command('mail.visibility',{id:imported.id,publish:false,reason:'本地验收结束'});
  console.log('PASS Docker mail activities: default cover, correction notifications, deduplication and source privacy.');
  const keyword=randomUUID();
  const knowledgeInput={title:'容器知识验证',body:'测试资料第一版',keywords:keyword,source:'本地验收资料',status:'published'};
  const knowledge=(await command('knowledge.save',knowledgeInput)).data;
  cookie=authorCookie;
  await rejectCommand('knowledge.save',knowledgeInput,403);
  const answer=(await command('knowledge.ask',{question:keyword})).data;
  const original=(await request('/api/workspace')).entities.find(e=>e.id===answer.id);
  assert.ok(original.data.body.includes('测试资料第一版'));
  assert.equal(original.data.sources[0].id,knowledge.id);
  cookie=memberCookie;
  assert.ok(!(await request('/api/workspace')).entities.some(e=>e.id===answer.id));
  await request('/api/auth/sign-in',{identifier:operatorId+'@example.test',password});
  await command('knowledge.save',{...knowledgeInput,id:knowledge.id,body:'测试资料第二版',status:'draft'});
  cookie=authorCookie;
  assert.deepEqual((await request('/api/workspace')).entities.find(e=>e.id===answer.id).data,original.data);
  const unmatched=(await command('knowledge.ask',{question:keyword})).data;
  const unmatchedData=(await request('/api/workspace')).entities.find(e=>e.id===unmatched.id).data;
  assert.deepEqual(unmatchedData.sources,[]);
  assert.equal(unmatchedData.body,'暂无已发布知识能够回答这个问题。');
  // Disable the local operator fixture and its sessions after its writes are complete.
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',`DELETE FROM sessions WHERE account_id='${operatorId}'; UPDATE accounts SET status='banned',roles='[]' WHERE id='${operatorId}'`],{stdio:'pipe'});
  console.log('PASS Docker knowledge: operator publication, student permission, source citation, private answer snapshot, unpublication and no-match result.');
  cookie=authorCookie;
  await request('/api/auth/logout',{});
  assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status,401);
  docker(['exec','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',`DELETE FROM sessions WHERE account_id IN ('${actor.id}','${viewerId}','${reviewerId}'); UPDATE accounts SET status='banned',roles='[]' WHERE id IN ('${actor.id}','${viewerId}','${reviewerId}')`],{stdio:'pipe'});
  console.log('PASS companion-only Docker: registration, persistence across restart, community moderation/visibility/notification, likes, saves, team admission/chat/finish/reviews and logout. No sports writes executed.');
  process.exit(0);
}
