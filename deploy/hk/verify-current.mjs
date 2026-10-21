import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const base = process.env.BNBU_VERIFY_BASE || 'http://127.0.0.1:4175'
const { accounts } = JSON.parse(readFileSync(process.env.BNBU_DEMO_CREDENTIALS_FILE, 'utf8'))
let cookie = ''
async function request(path, input) {
  const r = await fetch(base + path, { method: input ? 'POST' : 'GET', headers: { Cookie: cookie, Origin: 'https://www.bnbuplatform.cn', ...(input ? { 'Content-Type': 'application/json' } : {}) }, ...(input ? { body: JSON.stringify(input) } : {}) })
  assert.equal(r.status, 200, `${path}: HTTP ${r.status}`)
  if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]
  return r.json()
}
const health = await request('/api/health')
assert.equal(health.storage, 'postgresql')
await request('/api/auth/login', { email: accounts[0].email, password: accounts[0].password })
const workspace = await request('/api/workspace')
assert.equal(workspace.account.email, accounts[0].email)
const counts = {}
for (const e of workspace.entities.filter(e => e.id.startsWith('huitongli-demo-v1-'))) counts[e.kind] = (counts[e.kind] || 0) + 1
assert.equal(counts.activity, 8)
assert.equal(counts.organization, 4)
assert.equal(counts.room, 5)
assert.equal(counts.timetable, 1)
const community = await request('/api/community')
assert.ok(JSON.stringify(community).includes('huitongli-demo-v1-post-'))
const rooms = await request('/api/rooms')
assert.ok(JSON.stringify(rooms).includes('huitongli-demo-v1-room-'))
await request('/api/auth/logout', {})
const loggedOut = await fetch(base + '/api/workspace', { headers: { Cookie: cookie } })
assert.equal(loggedOut.status, 401)
console.log(JSON.stringify({ verified: true, health: health.storage, counts, community: true, rooms: true, logout: true }))
