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
await request('/api/auth/logout',{});
assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status,401);
console.log('PASS: PostgreSQL Docker proxy, registration, login, settings, private image storage, restart persistence, sports help publication and student reading, logout.');
