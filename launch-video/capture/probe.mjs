import { chromium } from "../node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:4174";
const out = "launch-video/capture/explore";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Users/louis/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "zh-CN", timezoneId: "Asia/Shanghai" });
const pw = JSON.parse((await import("node:fs")).readFileSync("data/browser-acceptance-accounts.json", "utf8")).accounts[0].password;
await context.request.post(`${BASE}/api/auth/login`, { data: { email: "student-a@example.test", password: pw }, headers: { origin: BASE } });
const page = await context.newPage();
const shot = async (n) => { await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/probe_${n}.png` }); console.log(n); };

await page.goto(BASE + "/v2/activities", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "学校邮件活动" }).click();
await shot("activity_filtered");
await page.locator("article, a, button").filter({ hasText: "AI 创作工作坊" }).last().click();
await shot("activity_detail");
await page.mouse.wheel(0, 700); await shot("activity_detail_scroll");

await page.goto(BASE + "/v2/partners", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "娱乐" }).click();
await page.getByText("周末羽毛球双打").first().click();
await shot("team_drawer");

await page.goto(BASE + "/v2/campus", { waitUntil: "networkidle" });
await page.getByText("Coffee Chat").first().click();
await shot("coffee_drawer");
await page.locator(".v2-teacher-card").first().click();
await shot("coffee_teacher");

await page.goto(BASE + "/v2/alumni?view=people", { waitUntil: "networkidle" });
await shot("alumni_people");
await browser.close();
