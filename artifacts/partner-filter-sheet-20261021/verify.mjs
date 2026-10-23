import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();const checks=[];
for(const width of [393,320,1440]){
 await page.setViewportSize({width,height:852});await page.goto(base+'/v2/partners',{waitUntil:'networkidle'});
 const trigger=page.locator('.v2-partner-filter-toggle'),feed=page.locator('.partner-feed-panel');const before=await feed.boundingBox();
 await trigger.click();const dialog=page.getByRole('dialog',{name:'筛选条件',exact:true});await dialog.waitFor();
 const after=await feed.boundingBox();assert(Math.abs(before.y-after.y)<1);
 assert(await page.evaluate(()=>document.body.style.overflow==='hidden'));
 assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 await dialog.locator('summary').filter({hasText:'拼车'}).click();await dialog.getByLabel('拼车出发地',{exact:true}).fill('珠海');
 await page.screenshot({path:`artifacts/partner-filter-sheet-20261021/open-${width}.png`});
 await dialog.getByRole('button',{name:'查看结果',exact:true}).click();await dialog.waitFor({state:'detached'});assert(await trigger.innerText().then(t=>t.includes('1')));
 await trigger.click();assert.equal(await page.getByRole('dialog').getByLabel('拼车出发地',{exact:true}).inputValue(),'珠海');
 await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert(await trigger.evaluate(e=>e===document.activeElement));
 await trigger.click();await page.getByRole('button',{name:'关闭窗口',exact:true}).click({position:{x:2,y:2}});await dialog.waitFor({state:'detached'});
 checks.push({width,feedLayoutStable:true,retainsFilters:true,escapeAndBackdropClose:true,focusRestored:true});
}
await fs.writeFile('artifacts/partner-filter-sheet-20261021/checks.json',JSON.stringify(checks,null,2));console.log(checks);await browser.close();
