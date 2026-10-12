import assert from 'node:assert/strict';
import {randomUUID,randomBytes,scryptSync} from 'node:crypto';
import {execFileSync} from 'node:child_process';

// Explicit local fixture; never grants access to an existing account.
const base='http://127.0.0.1:4186',id=randomUUID(),identity=randomUUID();
const email=`proxy-${id}@example.test`,password=randomBytes(24).toString('base64url');
const salt=randomBytes(16).toString('hex'),hash=`${salt}:${scryptSync(password,salt,64).toString('hex')}`;
const sql=text=>execFileSync('docker',['exec','-e','PGOPTIONS=-c search_path=sports','bnbu-postgres-local-postgres-1','psql','-U','bnbu','-d','bnbu','-v','ON_ERROR_STOP=1','-Atc',text],{stdio:'pipe'});
sql(`INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES('${id}','${email}','${hash}','Local proxy teacher','["teacher"]','now'); INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES('${identity}','sportsIdentity','${id}','{"role":"teacher","status":"verified"}','now','now');`);
try {
  assert.equal((await fetch(base)).status,200);
  const login=await fetch(base+'/api/v1/auth/password-login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({account:email,password})});
  assert.equal(login.status,200);assert.equal((await login.json()).data.user.id,id);
  const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(cookie,/^bnbu_sports_session=/);
  const me=await fetch(base+'/api/v1/me',{headers:{Cookie:cookie}});assert.equal(me.status,200);assert.equal((await me.json()).data.user.id,id);
  const denied=await fetch(base+'/api/v1/auth/logout',{method:'POST',headers:{Origin:'https://untrusted.invalid',Cookie:cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403);
  const logout=await fetch(base+'/api/v1/auth/logout',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(logout.status,200);
  assert.equal((await fetch(base+'/api/v1/me',{headers:{Cookie:cookie}})).status,401);
  console.log('PASS: original teacher portal proxies login, identity and logout to isolated Docker sports API; untrusted origin rejected.');
} finally {
  sql(`DELETE FROM sessions WHERE account_id='${id}'; UPDATE accounts SET status='banned' WHERE id='${id}'; UPDATE entities SET data=(data::jsonb || '{"status":"revoked"}'::jsonb)::text WHERE id='${identity}';`);
}
