import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();await page.goto(base+'/v2/shops',{waitUntil:'networkidle'});await page.locator('.shop-card').first().waitFor();const checks=[];
for(const width of [393,320,1440]){await page.setViewportSize({width,height:852});const result=await page.evaluate(()=>{const cards=[...document.querySelectorAll('.shop-cover')].slice(0,2).map(e=>e.getBoundingClientRect());return {gap:cards[1].left-cards[0].right,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(result.gap,width<761?6:8);assert(!result.overflow);checks.push({width,...result});await page.screenshot({path:`artifacts/shop-gap-20261021/shops-${width}.png`});}console.log(checks);await fs.writeFile('artifacts/shop-gap-20261021/checks.json',JSON.stringify(checks,null,2));await browser.close();
