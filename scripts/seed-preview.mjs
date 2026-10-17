// Explicit local-only fixture. Never called by server startup or production builds.
import { DatabaseSync } from 'node:sqlite'
import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

const file = resolve('data/browser-acceptance.sqlite')
if (!existsSync(file)) throw new Error('请先准备独立本地验收数据库。')
const db = new DatabaseSync(file)
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000')
const people = db.prepare('SELECT id,email,roles FROM accounts').all()
const students = people.filter(p => /^student-[ab]@example\.test$/.test(p.email))
const teacher = people.find(p => p.email === 'teacher@example.test')
const admin = people.find(p => p.email === 'admin@example.test')
if (students.length !== 2 || !teacher || !admin) throw new Error('验收账号不匹配，停止写入。')
mkdirSync('data/preview-backups', { recursive: true })
const backup = resolve(`data/preview-backups/before-preview-${Date.now()}.sqlite`)
db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`)
const stamp = new Date().toISOString()
const at = (days, hour = 19) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString() }
const photo = n => `/src/assets/campus/${['home-background','campus-services','evening-campus','night-walkway'][n % 4]}.jpg`
const put = (key, kind, owner, data) => {
  const id = `preview-${key}`
  db.prepare('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at,version=entities.version+1').run(id,kind,owner,JSON.stringify({...data,previewFixture:true}),stamp,stamp)
  return id
}
const own = (kind, owner, data) => {
  const row = db.prepare('SELECT id,data FROM entities WHERE kind=? AND owner_id=? LIMIT 1').get(kind,owner)
  if (!row) return put(`${kind}-${owner}`,kind,owner,data)
  const previous=JSON.parse(row.data)
  // Preserve existing personal content; refresh only previously seeded sample content.
  const merged=previous.previewFixture?{...previous,...data}:{...data,...previous}
  db.prepare('UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?').run(JSON.stringify({...merged,previewFixture:true}),stamp,row.id)
  return row.id
}
const relate = (owner,id,kind) => db.prepare('INSERT OR IGNORE INTO relations(account_id,entity_id,kind,created_at) VALUES(?,?,?,?)').run(owner,id,kind,stamp)
db.exec('BEGIN IMMEDIATE')
try {
  const activityNames=['秋日校园摄影展','计算机前沿技术分享会','校园夜跑计划','羽毛球交流赛','英语口语工作坊','周末志愿服务','校园音乐分享会','创新项目路演']
  const events=activityNames.map((title,i)=>put(`event-${i}`,'activity',students[i%2].id,{title,description:'模拟活动：和同学一起发现校园里的新鲜事，分享经验与成长。',startAt:at(i,19),endAt:at(i,21),location:['校园广场','教学楼 A101','东区操场','体育馆'][i%4],host:['摄影社','计算机协会','跑步社','羽毛球社'][i%4],image:photo(i),status:'published',capacity:60,conditions:'模拟展示，面向全校同学',source:i%2?'mail':'member'}))
  const orgs=['计算机协会','摄影社','羽毛球社','志愿者协会'].map((name,i)=>put(`org-${i}`,'organization',students[1].id,{name,category:['学术','艺术','运动','公益'][i],description:'模拟组织：一起学习、交流，记录有温度的校园生活。',contact:'通过校园会话联系（模拟）',status:'approved',visibility:'visible',image:photo(i)}))
  const posts=['秋日校园，收藏这一束阳光','分享我的自习路线','傍晚的球场很热闹','技术分享会精彩回顾','我的第一场志愿活动','周末一起练英语'].map((title,i)=>put(`post-${i}`,'post',students[i%2].id,{title,body:'模拟校园动态。今天和同学一起探索校园，记录学习与生活里的小收获。欢迎分享你的故事！',board:['校园','学习','生活'][i%3],images:[photo(i)],status:'visible'}))
  posts.forEach((id,i)=>put(`comment-${i}`,'comment',students[(i+1)%2].id,{postId:id,body:'这个分享很有帮助，下次一起参加！（模拟评论）',status:'visible'}))
  const rooms=['高数学习搭子','羽毛球搭子','周末摄影小队','英语口语练习','周末市区拼车'].map((title,i)=>put(`room-${i}`,'room',students[i%2].id,{title,type:['study','sport','entertainment','study','carpool'][i],body:'模拟队伍：欢迎一起交流，时间可以商量。',time:'本周末 15:00',place:['图书馆','体育馆','校园广场','教学楼','学校南门'][i],capacity:8,members:students.map(p=>p.id),status:'open',visibility:'visible'}))
  rooms.forEach((id,i)=>{put(`message-${i}-1`,'message',students[1].id,{roomId:id,body:'同学们好，本周的活动时间已经安排好了，欢迎一起参加！'});put(`message-${i}-2`,'message',students[0].id,{roomId:id,body:'收到，我会准时到。一起加油！'})})
  students.forEach((s,index)=>{
    own('profile',s.id,{nickname:index?'李同学':'王同学',bio:'热爱校园生活，喜欢摄影、运动和技术交流。'})
    own('timetable',s.id,{lessons:Array.from({length:21},(_,i)=>({id:`preview-lesson-${i}`,name:['高等数学','数据结构','大学英语'][i%3],weekday:Math.floor(i/3)+1,startTime:['08:00','11:00','14:00'][i%3],endTime:['09:50','11:50','15:50'][i%3],location:['教 A101','教 B302','教 C201'][i%3],teacher:['张老师','李老师','陈老师'][i%3],period:'',weeks:'1–16周',note:'模拟课表',needsReview:false}))})
    own('certification',s.id,{kind:'club',organization:'摄影社',note:'本地模拟认证',status:'approved',reviewNote:'仅用于本地展示'})
    events.slice(0,4).forEach(id=>relate(s.id,id,'participate'))
    events.slice(0,3).forEach(id=>relate(s.id,id,'save'))
    orgs.slice(0,3).forEach(id=>relate(s.id,id,'follow'))
    posts.slice(0,3).forEach(id=>{relate(s.id,id,'save');relate(s.id,id,'like')})
    put(`answer-${s.id}`,'answer',s.id,{question:'这周有什么活动可以参加？',body:'可以看看秋日摄影展、技术分享会和夜跑计划。你已标记参与的安排可以在“我的日历”查看。（模拟回答）',sources:[{title:'本地模拟活动',source:'模拟数据'}]})
    for(let i=0;i<3;i++)db.prepare('INSERT OR IGNORE INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES(?,?,?,?,?,?)').run(`preview-notice-${s.id}-${i}`,s.id,events[i],'activity.published',`模拟通知：${activityNames[i]}即将开始，请查看活动安排。`,stamp)
  })
  for (const person of people.filter(p=>/^(admin|operator|reviewer)@example\.test$/.test(p.email))) own('profile',person.id,{bio:'本地模拟管理账号'})
  own('profile',teacher.id,{nickname:'陈老师'})
  own('teacherProfile',teacher.id,{nickname:'陈老师',topics:'学业规划、技术项目、校园成长',bio:'模拟教师资料，欢迎预约交流学习与项目中的问题。',location:'教学楼 B302',enabled:true})
  const slots=Array.from({length:5},(_,i)=>put(`coffee-slot-${i}`,'coffeeSlot',teacher.id,{startAt:at(i+1,14),endAt:at(i+1,15),capacity:3,location:'教学楼 B302',closed:false}))
  students.forEach(s=>put(`coffee-booking-${s.id}`,'coffeeBooking',s.id,{teacherId:teacher.id,slotId:slots[0],status:'confirmed',topic:'如何规划课程项目？',question:'想交流技术项目和学业规划。',reason:'模拟预约'}))
  for (const s of students) db.prepare('INSERT OR IGNORE INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES(?,?,?,?,?,?)').run(`preview-alumni-notice-${s.id}`,s.id,'preview-alumni-booking','alumni.confirmed','模拟交流通知：校友交流预约已确认，请提前准备想讨论的问题。',stamp)
  const oldAlumni=db.prepare("SELECT id,data FROM entities WHERE kind='alumniState' LIMIT 1").get()
  const alumni=oldAlumni?JSON.parse(oldAlumni.data).value:{profiles:[],slots:[],bookings:[],follows:[],notices:[],history:[]}
  const merge=(key,items)=>{alumni[key]=[...(alumni[key]??[]).filter(x=>!String(x.id??x.alumniId).startsWith('preview-')), ...items]}
  merge('profiles',[{id:'preview-alumni',owner:students[1].id,name:'李同学',major:'计算机科学与技术',graduationYear:2023,city:'深圳',direction:'就业',experience:'软件工程与实习经验',topics:'实习、项目、职业规划',bio:'模拟校友资料，欢迎一起交流。',evidence:'本地模拟',status:'approved',reviewNote:'模拟',accepting:true}])
  merge('slots',[{id:'preview-alumni-slot',alumniId:'preview-alumni',startAt:at(2,16),endAt:at(2,17),location:'校园咖啡厅',open:true},{id:'preview-alumni-slot-free',alumniId:'preview-alumni',startAt:at(4,16),endAt:at(4,17),location:'校园咖啡厅',open:true}])
  merge('bookings',[{id:'preview-alumni-booking',slotId:'preview-alumni-slot',student:students[0].id,question:'如何准备第一份实习？',status:'confirmed',reason:'模拟预约',createdAt:stamp}])
  merge('follows',students.map(s=>({student:s.id,alumniId:'preview-alumni'})))
  if(oldAlumni)db.prepare('UPDATE entities SET data=?,updated_at=? WHERE id=?').run(JSON.stringify({value:alumni}),stamp,oldAlumni.id)
  else put('alumni-state','alumniState',null,{value:alumni})
  put('alumni-post','post',students[1].id,{alumniId:'preview-alumni',title:'第一份实习，从整理校园项目开始',body:'模拟经验分享：整理项目目标、自己负责的工作和成果，准备简历与面试。',board:'校友就业',images:[photo(1)],status:'visible'})
  put('knowledge','knowledge',admin.id,{title:'校园活动参与指南',body:'在发现页面浏览活动，收藏感兴趣的内容，在我的日历查看已参与安排。',source:'本地模拟指南',status:'published'})
  db.exec('COMMIT')
  console.log(JSON.stringify({database:file,backup,fixtureEntities:db.prepare("SELECT count(*) AS n FROM entities WHERE id LIKE 'preview-%'").get().n,students:students.length}))
} catch(error) {db.exec('ROLLBACK');throw error} finally {db.close()}
