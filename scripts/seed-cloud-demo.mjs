// Explicit deployment operation. Run only after a database backup; never on startup.
import { Pool } from 'pg'
import { randomBytes, scryptSync } from 'node:crypto'
import { writeFileSync, readdirSync } from 'node:fs'

if (process.env.BNBU_SEED_DEMO !== 'huitongli-demo-v1') throw new Error('Explicit demo seed authorization required')
const credentials = process.env.BNBU_DEMO_CREDENTIALS_FILE
if (!credentials) throw new Error('Private credentials output file required')
const assets = readdirSync(process.env.BNBU_DEMO_ASSETS || '/release/dist/assets')
const photos = ['home-background', 'campus-services', 'evening-campus', 'night-walkway'].map(name => {
  const file = assets.find(file => file.startsWith(name + '-') && file.endsWith('.jpg'))
  if (!file) throw new Error(`Missing built photo: ${name}`)
  return `/assets/${file}`
})
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = await pool.connect()
const prefix = 'huitongli-demo-v1-'
const stamp = new Date().toISOString()
const at = (day, hour) => new Date(Date.now() + day * 86400000).toISOString().slice(0, 10) + `T${String(hour).padStart(2, '0')}:00:00+08:00`
const users = [0, 1, 2].map(i => ({ id: `${prefix}student-${i}`, email: `demo-${i + 1}@huitongli.example.test`, name: ['小林（演示）', '小陈（演示）', '小周（演示）'][i], password: randomBytes(18).toString('base64url') }))
let created = 0
const put = async (key, kind, owner, data) => {
  const id = prefix + key
  const r = await db.query('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5) ON CONFLICT(id) DO NOTHING', [id, kind, owner, JSON.stringify({ ...data, demoFixture: prefix, dataSource: '模拟演示' }), stamp])
  created += r.rowCount
  return id
}
const relate = (owner, id, kind) => db.query('INSERT INTO relations(account_id,entity_id,kind,created_at) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING', [owner, id, kind, stamp])
try {
  await db.query('BEGIN')
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended('huitongli-demo-v1',0))")
  const existing = await db.query('SELECT id FROM accounts WHERE id=ANY($1::text[]) OR email=ANY($2::text[])', [users.map(u => u.id), users.map(u => u.email)])
  if (existing.rowCount) throw new Error('Demo accounts already exist; seed is insert-only and will not reset their content or passwords')
  // Save credentials before committing; inability to deliver credentials aborts all writes.
  writeFileSync(credentials, JSON.stringify({ notice: '演示账号，仅用于体验；模拟内容不代表学校事实。', accounts: users.map(({ email, password, name }) => ({ email, password, name })) }, null, 2), { mode: 0o600, flag: 'wx' })
  for (const u of users) {
    const salt = randomBytes(16).toString('hex')
    const hash = salt + ':' + scryptSync(u.password, salt, 64).toString('hex')
    await db.query('INSERT INTO accounts(id,email,password_hash,name,organization,roles,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)', [u.id, u.email, hash, u.name, '会同里演示体验', '["student"]', stamp])
    await put(`profile-${u.id}`, 'profile', u.id, { nickname: u.name, bio: '演示角色：喜欢校园摄影、学习与运动。内容均为模拟。' })
    await put(`preferences-${u.id}`, 'preferences', u.id, { profilePreview: true })
    await put(`timetable-${u.id}`, 'timetable', u.id, { lessons: Array.from({ length: 10 }, (_, i) => ({ id: `${prefix}lesson-${i}`, name: ['高等数学（演示）', '数据结构（演示）', '大学英语（演示）'][i % 3], weekday: Math.floor(i / 2) + 1, startTime: i % 2 ? '14:00' : '09:00', endTime: i % 2 ? '15:50' : '10:50', location: 'T1 教学楼（演示）', teacher: '演示教师', weeks: '1–16周', period: '', note: '模拟课表，不代表真实课程安排', needsReview: false })) })
  }
  const names = ['秋日校园摄影漫步', '从零开始做一个校园项目', '傍晚羽毛球交流', '英语口语小圆桌', '周末阅读分享', '校园音乐交流', '志愿服务经验分享', '校园创新点子工作坊']
  for (const [i, name] of names.entries()) {
    const event = await put(`activity-${i}`, 'activity', users[i % 3].id, { title: `${name}（演示）`, description: '模拟活动，用于体验活动浏览、收藏和参与标记。时间、地点与举办方均为演示安排，请勿按此到场。', startAt: at(i + 1, 18), endAt: at(i + 1, 20), location: ['图书馆', 'T1 教学楼', '体育馆', '校园广场'][i % 4], host: '会同里演示工作坊', image: photos[i % 4], status: 'published', source: 'member', capacity: 20, conditions: '仅供功能体验' })
    if (i < 3) { await relate(users[0].id, event, 'save'); await relate(users[0].id, event, 'participate') }
    const post = await put(`post-${i}`, 'post', users[i % 3].id, { title: `${['在校园里寻找一束光', '我的图书馆自习路线', '一起走过傍晚的球场', '第一次项目分享的小收获', '周末读书清单', '记录校园的声音', '和同学聊聊志愿服务', '把一个小点子做出来'][i]}（演示）`, body: '这是一条模拟校园笔记，用来体验浏览、评论、点赞、收藏和作者主页。照片来自项目已有校园素材，文字与人物为演示内容。欢迎用演示账号试试互动。', board: ['校园', '学习', '生活'][i % 3], images: [photos[i % 4]], status: 'visible' })
    await put(`comment-${i}`, 'comment', users[(i + 1) % 3].id, { postId: post, body: '这个主题很有意思，下次可以一起交流。（模拟评论）', status: 'visible' })
    await relate(users[(i + 1) % 3].id, post, 'like')
    if (i < 3) await relate(users[0].id, post, 'save')
  }
  for (const [i, name] of ['摄影交流社', '编程交流社', '羽毛球兴趣社', '阅读分享社'].entries()) {
    const org = await put(`organization-${i}`, 'organization', users[i % 3].id, { name: `${name}（演示）`, category: ['艺术', '学术', '运动', '文化'][i], description: '模拟组织，用于体验组织展示与关注，不代表真实学校社团。', contact: '通过演示账号交流', image: photos[i], status: 'approved', visibility: 'visible' })
    await relate(users[0].id, org, 'follow')
  }
  for (const [i, title] of ['高数互助小组', '周末羽毛球', '校园摄影散步', '英语口语练习', '项目开发交流'].entries()) {
    const room = await put(`room-${i}`, 'room', users[i % 3].id, { title: `${title}（演示）`, type: ['study', 'sport', 'entertainment', 'study', 'study'][i], body: '模拟队伍，供体验申请、入队和会话；请勿按演示安排到场。', time: '周末 15:00（演示）', place: ['图书馆', '体育馆', '校园广场', 'T1 教学楼', '图书馆'][i], capacity: 8, members: users.map(u => u.id), status: 'open', visibility: 'visible' })
    await put(`message-${i}`, 'message', users[(i + 1) % 3].id, { roomId: room, body: '大家好，欢迎体验会同里搭子会话！（模拟消息）' })
  }
  for (const [i, u] of users.entries()) await db.query('INSERT INTO notifications(id,recipient_id,event,body,created_at) VALUES($1,$2,$3,$4,$5)', [`${prefix}notice-${i}`, u.id, 'demo.welcome', '欢迎体验会同里。这些账号、活动、课程与社区内容均为模拟演示。', stamp])
  await db.query('INSERT INTO audit(id,actor_id,role,action,reason,data,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)', [prefix + 'seed-audit', users[0].id, 'student', 'deployment.demo.seed', '用户授权云端持久化演示数据', JSON.stringify({ prefix, entities: created, accounts: users.map(u => u.id) }), stamp])
  await db.query('COMMIT')
  console.log(JSON.stringify({ seeded: true, accounts: users.length, entities: created, prefix }))
} catch (error) {
  await db.query('ROLLBACK')
  throw error
} finally {
  db.release()
  await pool.end()
}
