// Run only against the restored release-check database, with mail delivery disabled.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomBytes, randomUUID } from 'node:crypto'
import { Pool } from 'pg'
assert.equal(new URL(process.env.DATABASE_URL).pathname, '/huitongli_auth_check_20261020')
assert.equal(process.env.BNBU_LOCAL_OUTBOX, '1')
assert.ok(!process.env.BNBU_EMAIL_DELIVERY_URL)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const user = JSON.parse(readFileSync('/tmp/demo-accounts.json', 'utf8')).accounts[1]
const base = 'http://127.0.0.1:4175'
let cookie = ''
async function request(path, data, status = 200) {
  const r = await fetch(base + path, { method: data ? 'POST' : 'GET', headers: { Cookie: cookie, Origin: 'https://www.bnbuplatform.cn', ...(data ? { 'Content-Type': 'application/json' } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) })
  assert.equal(r.status, status, `${path}: HTTP ${r.status}`)
  if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]
  return r.json()
}
try {
  const login = await request('/api/auth/login', { email: user.email, password: user.password })
  const owner = login.account.id
  await pool.query('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5)', [randomUUID(), 'verifiedEmail', owner, JSON.stringify({ email: user.email, source: 'isolated-release-check' }), new Date().toISOString()])
  const unknown = await request('/api/auth/password-reset/request', { identifier: 'missing@huitongli.example.test' })
  const known = await request('/api/auth/password-reset/request', { identifier: user.email })
  assert.deepEqual(unknown, known)
  const challenge = (await pool.query('SELECT * FROM password_reset_challenges WHERE account_id=$1 ORDER BY sent_at DESC LIMIT 1', [owner])).rows[0]
  const mail = (await pool.query("SELECT body FROM mail_outbox WHERE recipient=$1 AND subject='伴学找回密码' ORDER BY created_at DESC LIMIT 1", [user.email])).rows[0]
  const code = mail.body.match(/\d{6}/)[0]
  assert.ok(Number(challenge.expires_at) - Number(challenge.sent_at) === 600000)
  assert.ok(!challenge.code_hash.includes(code))
  const password = randomBytes(24).toString('base64url')
  await request('/api/auth/password-reset/complete', { identifier: user.email, code: '000000', password }, 400)
  const before = await pool.query('SELECT count(*) FROM password_reset_challenges WHERE account_id=$1', [owner])
  await request('/api/auth/password-reset/request', { identifier: user.email })
  assert.equal((await pool.query('SELECT count(*) FROM password_reset_challenges WHERE account_id=$1', [owner])).rows[0].count, before.rows[0].count)
  assert.equal((await request('/api/auth/password-reset/complete', { identifier: user.email, code, password })).reset, true)
  await request('/api/workspace', undefined, 401)
  await request('/api/auth/login', { email: user.email, password: user.password }, 401)
  await request('/api/auth/login', { email: user.email, password })
  await request('/api/auth/password-reset/complete', { identifier: user.email, code, password }, 400)
  console.log(JSON.stringify({ passwordReset: true, unknownAccountPrivacy: true, expiry: true, resendLimit: true, incorrectCode: true, codeReuseRejected: true, oldPasswordRejected: true, oldSessionsRevoked: true, newPasswordLogin: true, realEmailSent: false }))
} finally { await pool.end() }
