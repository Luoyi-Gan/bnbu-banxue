import { chromium } from "../node_modules/playwright/index.mjs";
import { readFileSync, mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:4174";
const [email = "student-a@example.test", ...paths] = process.argv.slice(2);
const accounts = JSON.parse(readFileSync("data/browser-acceptance-accounts.json", "utf8")).accounts;
const password = accounts.find((a) => a.email === email)?.password ?? "VideoDemo2026!";
const out = "launch-video/capture/explore";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: "/Users/louis/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, locale: "zh-CN", timezoneId: "Asia/Shanghai" });
await context.request.post(`${BASE}/api/auth/login`, { data: { email, password }, headers: { origin: BASE } });
const page = await context.newPage();
for (const path of paths) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const name = path.replace(/[^a-z0-9]+/gi, "_");
  await page.screenshot({ path: `${out}/${email.split("@")[0]}${name}.png`, fullPage: true });
  console.log("ok", path);
}
await browser.close();
