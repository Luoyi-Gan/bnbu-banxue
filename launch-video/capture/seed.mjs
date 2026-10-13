// Prepares local demo records in launch-video/capture-data/video.sqlite through the
// real backend commands. Run against a server started with BNBU_LOCAL_OUTBOX=1.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import sharp from "sharp";

const API = "http://127.0.0.1:4175";
const DB = resolve("launch-video/capture-data/video.sqlite");
const accounts = JSON.parse(readFileSync("data/browser-acceptance-accounts.json", "utf8")).accounts;
const PASSWORD = "VideoDemo2026!";
const db = new DatabaseSync(DB);

class Session {
  constructor(email, password) { this.email = email; this.password = password; this.cookie = ""; }
  async call(path, body, method = "POST") {
    const res = await fetch(API + path, {
      method,
      headers: { "content-type": "application/json", origin: "http://127.0.0.1:4174", cookie: this.cookie },
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    });
    const set = res.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${this.email} ${path} ${JSON.stringify(body).slice(0, 120)} -> ${res.status} ${JSON.stringify(json)}`);
    return json;
  }
  login() { return this.call("/api/auth/login", { email: this.email, password: this.password }); }
  cmd(action, input) { return this.call("/api/commands", { requestId: randomUUID(), action, input }).then((r) => r.data?.id); }
  workspace() { return this.call("/api/workspace", undefined, "GET"); }
}

const pw = (email) => accounts.find((a) => a.email === email).password;
const admin = new Session("admin@example.test", pw("admin@example.test"));
const me = new Session("student-a@example.test", pw("student-a@example.test"));
const captain = new Session("student-b@example.test", pw("student-b@example.test"));
const teacher = new Session("teacher@example.test", pw("teacher@example.test"));
await Promise.all([admin.login(), me.login(), captain.login(), teacher.login()]);

async function registerStudent(email) {
  const exists = db.prepare("SELECT id FROM accounts WHERE email=?").get(email);
  if (!exists) {
    await new Session(email).call("/api/auth/verification-codes", { email });
    const mail = db.prepare("SELECT body FROM mail_outbox WHERE recipient=? ORDER BY created_at DESC").get(email);
    const code = mail.body.match(/(\d{6})/)[1];
    await new Session(email).call("/api/auth/register", { email, code, password: PASSWORD });
  }
  const id = db.prepare("SELECT id FROM accounts WHERE email=?").get(email).id;
  await admin.cmd("account.update", { id, status: "active", roles: ["student"], reason: "本地演示视频采集账号" });
  const s = new Session(email, PASSWORD);
  await s.login();
  return s;
}
const extra = {
  c: await registerStudent("student-c@example.test"),
  d: await registerStudent("student-d@example.test"),
  e: await registerStudent("student-e@example.test"),
  alum: await registerStudent("alumni-demo@example.test"),
};

// Display names for the local demo copy only (not real people).
const rename = {
  "student-a@example.test": "林知夏",
  "student-b@example.test": "陈予安",
  "student-c@example.test": "许嘉禾",
  "student-d@example.test": "周以宁",
  "student-e@example.test": "苏沐言",
  "alumni-demo@example.test": "顾言川",
  "teacher@example.test": "王思远",
};
for (const [email, name] of Object.entries(rename)) db.prepare("UPDATE accounts SET name=? WHERE email=?").run(name, email);
db.prepare("UPDATE accounts SET organization='理工科技学院' WHERE email='teacher@example.test'").run();
for (const s of [me, captain, teacher, ...Object.values(extra)]) await s.login();

// ---------- covers (typographic posters generated from the product palette) ----------
async function cover(title, sub, a, b) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
  <radialGradient id="r" cx="0.5" cy="0.38" r="0.6"><stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
  <rect width="1000" height="1000" fill="url(#g)"/><rect width="1000" height="1000" fill="url(#r)"/>
  <circle cx="500" cy="470" r="230" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="3"/>
  <circle cx="500" cy="470" r="150" fill="none" stroke="#fff" stroke-opacity="0.16" stroke-width="3"/>
  <circle cx="500" cy="470" r="70" fill="#fff" fill-opacity="0.16"/>
  <text x="500" y="790" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="600" font-size="40" fill="#fff" fill-opacity="0.85" letter-spacing="10">${sub}</text>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// ---------- activities via school-mail import (operator) ----------
const mailActivities = [
  ["AI 创作工作坊", "从提示词到作品，一晚完成你的第一支 AI 短片。", "2026-10-16 19:00", "2026-10-16 21:00", "T4-105", "创新创业中心", "全体在校学生", "WORKSHOP", "#4f6bff", "#8b5cf6"],
  ["秋季校园夜跑", "沿校园环线慢跑 5 公里，结束后有拉伸指导。", "2026-10-17 19:30", "2026-10-17 21:00", "体育馆", "跑步协会", "全体在校学生", "NIGHT RUN", "#2563eb", "#06b6d4"],
  ["电影放映夜", "经典影片放映与映后交流。", "2026-10-18 19:00", "2026-10-18 21:30", "演艺厅", "电影协会", "全体在校学生", "CINEMA", "#7c3aed", "#db2777"],
  ["图书馆检索技巧讲座", "学会数据库检索与文献管理，写论文更顺手。", "2026-10-21 14:00", "2026-10-21 15:30", "图书馆", "图书馆", "全体在校学生", "LIBRARY", "#0ea5e9", "#6366f1"],
  ["英文演讲公开课", "演讲结构、发音与临场表达练习。", "2026-10-20 16:00", "2026-10-20 17:30", "T3-201", "语言中心", "全体在校学生", "SPEAKING", "#4338ca", "#0891b2"],
  ["毕业生经验分享会", "升学与求职的真实路径分享。", "2026-10-22 18:30", "2026-10-22 20:00", "大学会堂", "学生事务处", "全体在校学生", "CAREER", "#1d4ed8", "#9333ea"],
];
let i = 0;
for (const [title, desc, start, end, loc, host, cond, tag, a, b] of mailActivities) {
  const body = [`活动名称：${title}`, `活动介绍：${desc}`, `活动开始时间：${start}`, `活动结束时间：${end}`, `活动地点：${loc}`, `主办方：${host}`, `参与条件：${cond}`].join("\n");
  await admin.cmd("mail.import", { messageId: `video-demo-${++i}@example.test`, subject: title, sender: "events@example.test", body, cover: await cover(title, tag, a, b), coverName: `${tag.toLowerCase()}.jpg` });
}

// member activity by a certified club member
const certId = await captain.cmd("certification.apply", { kind: "club", organization: "桌游社", note: "本地演示：社团成员认证" });
await admin.cmd("certification.review", { id: certId, approve: true });
await captain.cmd("activity.create", { title: "桌游交流夜", description: "新手友好，现场教学。", startAt: "2026-10-19T19:00:00+08:00", location: "T2-102", capacity: 24 });

// ---------- teams ----------
const rooms = {
  badminton: await captain.cmd("room.create", { type: "entertainment", title: "周末羽毛球双打", body: "水平不限，球拍可借，打完一起吃饭。", time: "周六 15:00", place: "体育馆", capacity: 4 }),
  library: await extra.c.cmd("room.create", { type: "study", title: "期中周 · 图书馆自习", body: "互相监督，每天两小时专注。", time: "每周二、四 19:00", place: "图书馆", capacity: 5 }),
  carpool: await extra.d.cmd("room.create", { type: "carpool", title: "周五傍晚拼车去珠海站", body: "两人以上成行，费用平摊。", time: "周五 17:30", place: "东大门", capacity: 4 }),
  data: await extra.e.cmd("room.create", { type: "study", title: "数据分析课程小组", body: "一起完成 Python 作业，互相讲题。", time: "周三 20:00", place: "T5-301", capacity: 4 }),
};
const accept = async (leader, applicant, room) => {
  const appId = await applicant.cmd("room.apply", { id: room });
  await leader.cmd("room.decide", { id: appId, accept: true });
};
await accept(captain, extra.c, rooms.badminton);
await accept(extra.c, extra.d, rooms.library);
await accept(extra.c, extra.e, rooms.library);
await accept(extra.d, extra.e, rooms.carpool);
await captain.cmd("message.send", { roomId: rooms.badminton, body: "周六 15:00 体育馆二号场，我带了两支备用拍。" });
await new Promise((r) => setTimeout(r, 1500));
await extra.c.cmd("message.send", { roomId: rooms.badminton, body: "收到！欢迎新队友一起来。" });
// student-a already follows one activity; the rest is done on screen during capture.
const run = (await me.workspace()).entities.find((e) => e.kind === "activity" && e.data.title === "秋季校园夜跑");
await me.cmd("relation.set", { id: run.id, kind: "participate", enabled: true });

// ---------- teacher coffee chat ----------
await teacher.cmd("coffee.profile", { nickname: "王老师", bio: "数据科学方向，欢迎聊课程、科研与升学。", topics: "课程规划、科研入门、升学选择", location: "T6-512 办公室", enabled: true });
const slots = [
  ["2026-10-15T15:00:00+08:00", "2026-10-15T15:30:00+08:00"],
  ["2026-10-15T15:30:00+08:00", "2026-10-15T16:00:00+08:00"],
  ["2026-10-16T10:00:00+08:00", "2026-10-16T10:30:00+08:00"],
  ["2026-10-16T10:30:00+08:00", "2026-10-16T11:00:00+08:00"],
  ["2026-10-20T14:00:00+08:00", "2026-10-20T14:30:00+08:00"],
];
for (const [startAt, endAt] of slots) await teacher.cmd("coffee.slot.create", { startAt, endAt, location: "T6-512 办公室", capacity: 1 });

// ---------- alumni ----------
await extra.alum.cmd("alumni.apply", { major: "计算机科学与技术", graduationYear: 2022, city: "深圳", direction: "就业", experience: "互联网公司产品经理", topics: "求职准备、产品岗位、实习选择", bio: "愿意分享从校园到职场的经验。", evidence: "本地演示：毕业信息说明", studentNumber: "DEMO2022001" });
const wsAdmin = await admin.workspace();
const pendingAlumni = wsAdmin.alumni.profiles.find((p) => p.status === "pending" || p.status === "待审核") ?? wsAdmin.alumni.profiles[0];
await admin.cmd("alumni.review", { id: pendingAlumni.id, approve: true });
for (const [startAt, endAt] of [["2026-10-18T10:00:00+08:00", "2026-10-18T10:45:00+08:00"], ["2026-10-25T20:00:00+08:00", "2026-10-25T20:45:00+08:00"]])
  await extra.alum.cmd("alumni.slot.create", { startAt, endAt, location: "线上视频" });

// ---------- community ----------
const posts = [
  [captain, "期中复习资料怎么整理？", "分享我的三步法：先列考点，再做错题本，最后找搭子互相提问。", "学习交流"],
  [extra.c, "图书馆四楼靠窗座位真的很安静", "适合需要长时间专注的同学，记得带耳塞。", "校园生活"],
  [extra.d, "夜跑新手的第一次 5 公里", "慢慢跑、配速别急，跑完拉伸很重要。", "运动健康"],
  [extra.e, "推荐一门很有收获的选修课", "老师讲得很清楚，作业量适中，适合想入门数据分析的同学。", "学习交流"],
];
for (const [s, title, body, board] of posts) {
  const id = await s.cmd("post.create", { title, body, board, images: [] });
  await admin.cmd("content.review", { id, status: "visible", reason: "本地演示内容审核通过" });
}

// ---------- knowledge (operator) ----------
await admin.cmd("knowledge.save", { title: "如何预约老师的 Coffee Chat", body: "在 Coffee Chat 页面选择老师的开放时段并填写交流问题，提交后即形成预约；如需取消可在预约中操作。", keywords: "Coffee Chat,预约老师,老师", source: "伴学帮助中心 · Coffee Chat", status: "published" });
await admin.cmd("knowledge.save", { title: "如何申请加入搭子队伍", body: "在找搭子页面查看队伍详情并提交申请，队长同意后即可加入并参与队伍消息。", keywords: "搭子,队伍,组队", source: "伴学帮助中心 · 找搭子", status: "published" });

// ---------- timetable ----------
await me.cmd("timetable.save", {
  fileName: "我的课表.png",
  lessons: [
    { name: "数据结构", weekday: 2, startTime: "08:00", endTime: "09:50", period: "1-2 节", location: "T5-201", teacher: "李老师", weeks: "1-16 周", note: "", needsReview: false },
    { name: "大学英语", weekday: 2, startTime: "14:00", endTime: "15:50", period: "5-6 节", location: "T3-105", teacher: "张老师", weeks: "1-16 周", note: "", needsReview: false },
    { name: "线性代数", weekday: 3, startTime: "10:00", endTime: "11:50", period: "3-4 节", location: "T4-302", teacher: "刘老师", weeks: "1-16 周", note: "", needsReview: false },
    { name: "体育（羽毛球）", weekday: 4, startTime: "16:00", endTime: "17:50", period: "7-8 节", location: "体育馆", teacher: "陈老师", weeks: "1-16 周", note: "", needsReview: false },
  ],
});

console.log(JSON.stringify({ rooms }, null, 1));
