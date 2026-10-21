// Only against a restored check database; no real email is sent.
import assert from 'node:assert/strict'
import {randomUUID,createHash,scryptSync} from 'node:crypto'
import {Pool} from 'pg'
assert.equal(new URL(process.env.DATABASE_URL).pathname,'/huitongli_student_email_check_20261020')
assert.equal(process.env.BNBU_LOCAL_OUTBOX,'1')
assert.ok(!process.env.BNBU_EMAIL_DELIVERY_URL)
const pool=new Pool({connectionString:process.env.DATABASE_URL})
const now=()=>new Date().toISOString()
const digest=value=>createHash('sha256').update(value).digest('hex')
const password='Isolated-Email-123',salt=randomUUID()
const hash=`${salt}:${scryptSync(password,salt,64).toString('hex')}`
const prefix=randomUUID().slice(0,8)
let checks=0
async function entity(kind,id,data) {
  const key=randomUUID()
  await pool.query('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5)',[key,kind,id,JSON.stringify(data),now()])
  return key
}
async function user(domain,verified=true,extra={}) {
  const id=randomUUID(),email=`release-${prefix}-${randomUUID().slice(0,8)}@${domain}`
  await pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,status,login_kind,login_name,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,email,hash,'独立检查学生',JSON.stringify(extra.roles??[]),extra.status??'active',extra.kind??'PERSONAL',extra.kind==='ADMIN'?id:null,now()])
  if(verified) await entity('verifiedEmail',id,{email})
  const token=randomUUID()
  await pool.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)',[digest(token),id,Date.now()+600000,now()])
  return {id,email,cookie:`bnbu_session=${token}`}
}
async function call(path,cookie,body,status=200) {
  const r=await fetch('http://127.0.0.1:4175'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:'https://www.bnbuplatform.cn',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})})
  const result=await r.json()
  assert.equal(r.status,status,`${path} ${JSON.stringify(result)}`)
  return result
}
try {
  const student=await user('mail.bnbu.edu.cn',true,{roles:['teacher']})
  const request=await entity('studentIdentityRequest',student.id,{email:student.email,status:'pending',studentNumber:`S${prefix}`,schoolName:'独立检查学生'})
  const simultaneous=await Promise.all(Array.from({length:6},()=>call('/api/auth/me',student.cookie)))
  for(const result of simultaneous) assert.deepEqual(new Set(result.account.roles),new Set(['teacher','student']))
  assert.equal((await call('/api/identity/me',student.cookie)).status,'verified')
  assert.equal((await pool.query('SELECT data::jsonb->>\'source\' AS source FROM entities WHERE id=$1',[request])).rows[0].source,'verified-student-email')
  assert.equal(Number((await pool.query("SELECT count(*) FROM entities WHERE owner_id=$1 AND kind='companionIdentity'",[student.id])).rows[0].count),1)
  assert.equal(Number((await pool.query("SELECT count(*) FROM audit WHERE actor_id=$1 AND action='student.identity.email-grant'",[student.id])).rows[0].count),1)
  checks+=5
  for(const domain of ['bnbu.edu.cn','mail.bnbu.edu.cn.evil.test','sub.mail.bnbu.edu.cn','example.test']) {
    const other=await user(domain)
    assert.ok(!(await call('/api/auth/me',other.cookie)).account.roles.includes('student'));checks++
  }
  const unverified=await user('mail.bnbu.edu.cn',false)
  assert.ok(!(await call('/api/auth/me',unverified.cookie)).account.roles.includes('student'));checks++
  await pool.query('INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES($1,$2,$3,0,$4)',[unverified.email,digest(unverified.email+':123456'),Date.now()+600000,Date.now()])
  await call('/api/auth/email/confirm',unverified.cookie,{code:'123456'})
  assert.ok((await call('/api/auth/me',unverified.cookie)).account.roles.includes('student'))
  const auto=(await pool.query("SELECT data FROM entities WHERE kind='companionIdentity' AND owner_id=$1",[unverified.id])).rows[0]
  assert.ok(!Object.hasOwn(JSON.parse(auto.data),'studentNumber'));checks+=2
  for(const extra of [{status:'banned'},{kind:'ADMIN'},{revoked:true}]) {
    const blocked=await user('mail.bnbu.edu.cn',true,extra)
    if(extra.revoked) await entity('companionIdentity',blocked.id,{role:'student',status:'revoked'})
    assert.ok(!(await call('/api/auth/me',blocked.cookie)).account.roles.includes('student'));checks++
  }
  const email=`register-${prefix}@mail.bnbu.edu.cn`
  await pool.query('INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES($1,$2,$3,0,$4)',[email,digest(email+':123456'),Date.now()+600000,Date.now()])
  await call('/api/auth/register','',{email,code:'123456',password},201)
  assert.ok((await call('/api/auth/login','',{email,password})).account.roles.includes('student'));checks++
  const conflict=await user('mail.bnbu.edu.cn')
  await entity('studentIdentityRequest',conflict.id,{status:'pending',studentNumber:`S${prefix}`,schoolName:'重复学号检查'})
  assert.ok((await call('/api/auth/me',conflict.cookie)).account.roles.includes('student'))
  assert.ok(!Object.hasOwn(JSON.parse((await pool.query("SELECT data FROM entities WHERE kind='companionIdentity' AND owner_id=$1",[conflict.id])).rows[0].data),'studentNumber'));checks++
  console.log(JSON.stringify({passed:true,checks,concurrentSessions:6,mailDeliveryDisabled:true}))
} finally {await pool.end()}
