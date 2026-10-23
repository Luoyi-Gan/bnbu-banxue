import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();await page.goto(base+'/v2/partners',{waitUntil:'networkidle'});
const panel=page.locator('.v2-partner-filter-panel');const toggle=panel.getByRole('button',{name:'筛选条件'});await toggle.click();
const checks=[];
for(const width of [393,320,1440]){
 await page.setViewportSize({width,height:852});
 const box=await panel.boundingBox();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)console.log(width,await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,14).map(e=>[e.className,e.getBoundingClientRect().width])));assert(!overflow);assert(box.height<540);checks.push({width,height:box.height,overflow});
 await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/partner-filters-20261021/all-${width}.png`});
}
await page.setViewportSize({width:393,height:852});
await panel.locator('summary').filter({hasText:'拼车'}).click();await panel.getByLabel('拼车出发地',{exact:true}).fill('珠海');assert(await panel.locator('summary').filter({hasText:'拼车'}).innerText().then(t=>t.includes('1')));
await panel.locator('summary').filter({hasText:'拼车'}).click();assert(await toggle.innerText().then(t=>t.includes('1')));
await panel.getByRole('button',{name:'清除全部筛选'}).click();await panel.locator('summary').filter({hasText:'拼车'}).click();assert.equal(await panel.getByLabel('拼车出发地',{exact:true}).inputValue(),'');
for(const category of ['运动','学习','娱乐','拼车']){
 await page.locator('.partner-feed-controls .v2-filter-pills').getByRole('button',{name:category,exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.v2-partner-filter-panel details').length===1);assert.equal(await panel.locator('details').count(),1);assert(await panel.locator('details').getAttribute('open')!==null);
 await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/partner-filters-20261021/${category}-393.png`});
}
await fs.writeFile('artifacts/partner-filters-20261021/checks.json',JSON.stringify(checks,null,2));console.log('PASS',checks,'category groups, count, reset');await browser.close();
