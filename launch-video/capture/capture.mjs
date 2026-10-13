// Final capture: drives the real /v2 student interface in story order and saves
// 2x screenshots plus element boxes (CSS px, relative to each image) to public/ui.
// Precondition: server running on capture-data/video.sqlite restored from seeded.sqlite.
import { chromium } from "../node_modules/playwright/index.mjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const BASE = "http://127.0.0.1:4174";
const OUT = "launch-video/public/ui";
mkdirSync(OUT, { recursive: true });
const accounts = JSON.parse(readFileSync("data/browser-acceptance-accounts.json", "utf8")).accounts;
const pw = (email) => accounts.find((a) => a.email === email).password;
const layout = {};

const browser = await chromium.launch({ executablePath: "/Users/louis/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
async function studentPage(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: "zh-CN", timezoneId: "Asia/Shanghai", reducedMotion: "reduce" });
  await context.request.post(`${BASE}/api/auth/login`, { data: { email: "student-a@example.test", password: pw("student-a@example.test") }, headers: { origin: BASE } });
  const page = await context.newPage();
  // Hide the draggable AI mascot and caret blink so states differ only by real changes.
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "*{caret-color:transparent!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  });
  return page;
}
async function settle(page, ms = 900) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}
async function box(locator, origin = { x: 0, y: 0 }) {
  const b = await locator.first().boundingBox();
  if (!b) throw new Error("no box for " + locator);
  return { x: Math.round(b.x - origin.x), y: Math.round(b.y - origin.y), w: Math.round(b.width), h: Math.round(b.height) };
}
// name: output id; target: "viewport" | "full" | locator (element clip); boxes: {key: locator}
async function snap(page, name, target, boxes = {}) {
  await settle(page);
  let origin = { x: 0, y: 0 }, size;
  if (target === "viewport") {
    await page.screenshot({ path: `${OUT}/${name}.png` });
    size = page.viewportSize();
  } else if (target === "full") {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
  } else {
    const b = await target.first().boundingBox();
    origin = { x: b.x, y: b.y };
    await page.screenshot({ path: `${OUT}/${name}.png`, clip: b });
    size = { width: Math.round(b.width), height: Math.round(b.height) };
  }
  const entry = { w: size.width, h: size.height, boxes: {} };
  for (const [k, loc] of Object.entries(boxes)) entry.boxes[k] = await box(loc, origin);
  layout[name] = entry;
  console.log("captured", name, entry.w, entry.h);
}

// API helper for the other participants' real decisions (captain approval).
async function session(email) {
  let cookie = "";
  const call = async (path, body, method = "POST") => {
    const res = await fetch("http://127.0.0.1:4175" + path, { method, headers: { "content-type": "application/json", origin: BASE, cookie }, body: method === "GET" ? undefined : JSON.stringify(body) });
    const set = res.headers.get("set-cookie"); if (set) cookie = set.split(";")[0];
    const json = await res.json(); if (!res.ok) throw new Error(JSON.stringify(json)); return json;
  };
  await call("/api/auth/login", { email, password: pw(email) });
  return { cmd: (action, input) => call("/api/commands", { requestId: randomUUID(), action, input }), ws: () => call("/api/workspace", undefined, "GET") };
}

// ---------------- 1. Home before (product's own <=900px layout) ----------------
{
  const page = await studentPage(900, 1240);
  await page.goto(BASE + "/v2", { waitUntil: "networkidle" });
  await snap(page, "home_before", "viewport", {
    heading: page.locator(".v2-a-home-heading h1"),
    task: page.locator(".v2-a-task-card"),
    next: page.locator(".v2-a-next-card"),
    schedule: page.locator(".v2-a-schedule-card"),
    row0: page.locator(".v2-a-schedule-list > a").nth(0),
  });
  await page.context().close();
}

const page = await studentPage(1440, 900);

// ---------------- 2. Activities: filter, open detail, mark ----------------
await page.goto(BASE + "/v2/activities", { waitUntil: "networkidle" });
await snap(page, "act_list", "full", {
  heading: page.locator(".v2-page-heading h1"),
  chipMail: page.getByRole("button", { name: "学校邮件活动" }),
  allSection: page.getByText("所有活动").first(),
});
await page.getByRole("button", { name: "学校邮件活动" }).click();
await snap(page, "act_filtered", "full", {
  chipMail: page.getByRole("button", { name: "学校邮件活动" }),
  aiCard: page.locator(".activity-discovery-card").filter({ hasText: "AI 创作工作坊" }).first(),
  cards: page.locator(".discovery-masonry, .activity-discovery-card").first(),
  allSection: page.getByText("所有活动").first(),
});
await page.locator(".activity-discovery-card .discovery-title", { hasText: "AI 创作工作坊" }).first().click();
const drawer = page.locator(".v2-drawer").first();
await snap(page, "act_detail", "viewport", {
  drawer,
  mark: page.getByRole("button", { name: "标记参与" }),
  info: page.getByText("活动信息").first(),
});
await page.getByRole("button", { name: "标记参与" }).click();
await page.getByRole("button", { name: "取消参与标记" }).waitFor();
await snap(page, "act_marked", "viewport", {
  drawer,
  mark: page.getByRole("button", { name: "取消参与标记" }),
  note: page.getByText("已保存参与标记。"),
});

// ---------------- 3. Teams: filter, view, apply, approval, chat ----------------
await page.goto(BASE + "/v2/partners", { waitUntil: "networkidle" });
await page.locator(".v2-list-panel").first().scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollTo(0, 300));
await snap(page, "teams_list", "viewport", {
  chipEnt: page.locator(".v2-filter-pills button", { hasText: "娱乐" }),
  grid: page.locator(".v2-room-grid"),
  cards: page.locator(".v2-room-card").nth(0),
});
await page.locator(".v2-filter-pills button", { hasText: "娱乐" }).click();
await snap(page, "teams_filtered", "viewport", {
  chipEnt: page.locator(".v2-filter-pills button", { hasText: "娱乐" }),
  card: page.locator(".v2-room-card").first(),
  open: page.locator(".v2-room-card .v2-room-footer").first(),
});
await page.locator(".v2-room-card .v2-room-footer").first().click();
await snap(page, "team_drawer", "viewport", {
  drawer: page.locator(".v2-drawer").first(),
  apply: page.getByRole("button", { name: "申请加入" }),
});
await page.getByRole("button", { name: "申请加入" }).click();
await page.getByText("申请待处理").waitFor();
await snap(page, "team_applied", "viewport", {
  drawer: page.locator(".v2-drawer").first(),
  status: page.getByText("申请待处理"),
});
// Captain (陈予安) reviews and approves in their own account.
const captain = await session("student-b@example.test");
const cws = await captain.ws();
const room = cws.entities.find((e) => e.kind === "room" && e.data.title === "周末羽毛球双打");
const app = cws.entities.find((e) => e.kind === "roomApplication" && e.data.roomId === room.id && e.data.status === "pending");
await captain.cmd("room.decide", { id: app.id, accept: true });
await captain.cmd("message.send", { roomId: room.id, body: "欢迎知夏！周六 15:00 体育馆见。" });
await page.reload({ waitUntil: "networkidle" });
await page.locator(".v2-filter-pills button", { hasText: "娱乐" }).click();
await page.locator(".v2-room-card .v2-room-footer").first().click();
await page.getByText("进入队伍消息").waitFor();
await snap(page, "team_joined", "viewport", {
  drawer: page.locator(".v2-drawer").first(),
  members: page.locator(".v2-member-list"),
  enter: page.getByText("进入队伍消息"),
});
await page.getByText("进入队伍消息").click();
await page.waitForURL(/messages/);
await snap(page, "team_chat", "viewport", {
  page: page.locator(".v2-messages-page"),
  last: page.getByText("欢迎知夏！周六 15:00 体育馆见。").last(),
});

// ---------------- 4. Teacher Coffee Chat ----------------
await page.goto(BASE + "/v2/campus", { waitUntil: "networkidle" });
await page.locator("button, a").filter({ hasText: "预约老师的一对一交流" }).first().click();
await page.locator(".v2-teacher-card").first().click();
const coffee = page.locator(".v2-drawer").first();
await page.getByText("选择预约时间").waitFor();
const slot = page.locator(".v2-coffee-slot").filter({ hasText: "10月15日" }).filter({ hasText: "15:00 – 15:30" });
await snap(page, "coffee_open", coffee, {
  teacher: page.locator(".v2-coffee-teacher-detail > div"),
  photo: page.locator(".v2-coffee-teacher-detail img"),
  heading: page.locator(".v2-coffee-schedule-heading"),
  slots: page.locator(".v2-coffee-slot-list"),
  slot,
});
await slot.click();
await page.locator(".v2-coffee-schedule textarea").fill("想请教数据科学方向的选课与科研入门。");
await snap(page, "coffee_selected", coffee, {
  photo: page.locator(".v2-coffee-teacher-detail img"),
  slot,
  topic: page.locator(".v2-coffee-schedule textarea"),
  confirm: page.getByRole("button", { name: /确认预约/ }),
  panel: page.locator(".v2-coffee-booking-panel"),
});
await page.getByRole("button", { name: /确认预约/ }).click();
await page.getByText("预约成功，老师已收到通知。").waitFor();
await snap(page, "coffee_booked", coffee, {
  photo: page.locator(".v2-coffee-teacher-detail img"),
  slot,
  panel: page.locator(".v2-coffee-booking-panel"),
  feedback: page.getByText("预约成功，老师已收到通知。"),
});

// ---------------- 5. Alumni request (waits for the alumnus) ----------------
await page.goto(BASE + "/v2/alumni?view=people", { waitUntil: "networkidle" });
// Keep the fixed 我的课表 shortcut off the card.
await page.evaluate(() => { const el = [...document.querySelectorAll("article, .v2-alumni-card")].find((n) => n.textContent.includes("顾言川")); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 260); });
await snap(page, "alumni_people", "viewport", {
  card: page.locator("article, .v2-alumni-card").filter({ hasText: "顾言川" }).first(),
  learn: page.getByText("了解校友").first(),
});
await page.getByText("了解校友").first().click();
await page.getByText("交流主题与问题").waitFor();
await page.locator("textarea").first().fill("想了解产品经理岗位的实习准备。");
const scrollToPerson = () => page.evaluate(() => { const el = [...document.querySelectorAll("a")].find((a) => a.textContent.includes("返回校友列表")); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70); });
await scrollToPerson();
await snap(page, "alumni_person", "viewport", {
  question: page.locator("textarea").first(),
  slot: page.locator(".v2-alumni-booking").first(),
  request: page.locator(".v2-alumni-booking button").first(),
  verified: page.getByText("校友身份已认证"),
});
await page.locator(".v2-alumni-booking button").first().click();
await page.getByText("等待校友确认").first().waitFor();
await scrollToPerson();
await snap(page, "alumni_requested", "viewport", {
  slot: page.locator(".v2-alumni-booking").first(),
  request: page.getByText("等待校友确认").first(),
});
await page.goto(BASE + "/v2/alumni?view=bookings", { waitUntil: "networkidle" });
await snap(page, "alumni_bookings", "viewport", {
  pending: page.getByText("待校友确认").first(),
});

// ---------------- 6. Timetable, community, campus AI ----------------
await page.goto(BASE + "/v2/me?tab=timetable", { waitUntil: "networkidle" });
await snap(page, "timetable", page.locator(".v2-panel").filter({ hasText: "一周课程" }).last(), {
  today: page.getByText("周二 · 今天").first(),
});
await page.goto(BASE + "/v2/community", { waitUntil: "networkidle" });
await snap(page, "community", "viewport", {
  heading: page.locator(".v2-page-heading h1"),
  feed: page.getByText("期中复习资料怎么整理？").first(),
});
await page.goto(BASE + "/v2/ai", { waitUntil: "networkidle" });
await page.locator(".v2-ai-composer textarea, .v2-ai-composer input").first().fill("怎么预约老师的 Coffee Chat？");
await snap(page, "ai_typed", "viewport", { composer: page.locator(".v2-ai-composer") });
await page.locator(".v2-ai-composer button[type=submit], .v2-ai-composer button").last().click();
await page.getByText(/来源：/).first().waitFor();
await snap(page, "ai_answer", "viewport", {
  messages: page.locator(".v2-ai-messages"),
  answer: page.locator(".v2-ai-message").last(),
  question: page.locator(".v2-ai-message.is-user").last(),
});
await page.context().close();

// ---------------- 7. Home after ----------------
{
  const home = await studentPage(900, 1240);
  await home.goto(BASE + "/v2", { waitUntil: "networkidle" });
  const rows = {};
  for (let i = 0; i < 4; i++) rows[`row${i}`] = home.locator(".v2-a-schedule-list > a").nth(i);
  await home.waitForTimeout(400);
  await snap(home, "home_after", "viewport", {
    heading: home.locator(".v2-a-home-heading h1"),
    next: home.locator(".v2-a-next-card"),
    schedule: home.locator(".v2-a-schedule-card"),
    shortcut: home.locator(".v2-timetable-shortcut"),
    ...rows,
  });
  const sports = await home.evaluate(async () => (await (await fetch("/api/workspace")).json()).sports ?? null);
  layout.sports = sports;
  await home.context().close();
}

writeFileSync(`${OUT}/layout.json`, JSON.stringify(layout, null, 1));
await browser.close();
