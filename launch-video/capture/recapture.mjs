// Re-shoots team_chat and alumni_people on the post-capture database and patches layout.json.
// Run from the repo root while the local server is serving capture-data/video.sqlite.
import { chromium } from "../node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "http://127.0.0.1:4174";
const OUT = "launch-video/public/ui";
const accounts = JSON.parse(readFileSync("data/browser-acceptance-accounts.json", "utf8")).accounts;
const pw = (email) => accounts.find((a) => a.email === email).password;
const layout = JSON.parse(readFileSync(`${OUT}/layout.json`, "utf8"));

const browser = await chromium.launch({ executablePath: "/Users/louis/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: "zh-CN", timezoneId: "Asia/Shanghai", reducedMotion: "reduce" });
await context.request.post(`${BASE}/api/auth/login`, { data: { email: "student-a@example.test", password: pw("student-a@example.test") }, headers: { origin: BASE } });
const page = await context.newPage();
await page.addInitScript(() => {
  const style = document.createElement("style");
  style.textContent = "*{caret-color:transparent!important}";
  document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
});
const box = async (loc) => {
  const b = await loc.first().boundingBox();
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};
async function snap(name, boxes) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const entry = { w: 1440, h: 900, boxes: {} };
  for (const [k, loc] of Object.entries(boxes)) entry.boxes[k] = await box(loc);
  layout[name] = entry;
  console.log("captured", name, JSON.stringify(entry.boxes));
}

await page.goto(BASE + "/v2/partners", { waitUntil: "networkidle" });
await page.locator(".v2-filter-pills button", { hasText: "娱乐" }).click();
await page.locator(".v2-room-card .v2-room-footer").first().click();
await page.getByText("进入队伍消息").click();
await page.waitForURL(/messages/);
await snap("team_chat", {
  page: page.locator(".v2-messages-page"),
  last: page.getByText("欢迎知夏！周六 15:00 体育馆见。").last(),
});

await page.goto(BASE + "/v2/alumni?view=people", { waitUntil: "networkidle" });
await page.evaluate(() => { const el = [...document.querySelectorAll("article, .v2-alumni-card")].find((n) => n.textContent.includes("顾言川")); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 260); });
await snap("alumni_people", {
  card: page.locator("article, .v2-alumni-card").filter({ hasText: "顾言川" }).first(),
  learn: page.getByText("了解校友").first(),
});

writeFileSync(`${OUT}/layout.json`, JSON.stringify(layout, null, 2));
await browser.close();
