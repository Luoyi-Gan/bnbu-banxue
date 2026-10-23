import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174';
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));
assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();const checks=[];
for(const width of [393,320,1440]){
 await page.setViewportSize({width,height:852});await page.goto(base+'/v2',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'搜索校园',exact:true}).click();
 await page.getByRole('textbox',{name:'搜索校园内容',exact:true}).waitFor({state:'visible'});
 await page.waitForFunction(()=>document.activeElement===document.querySelector('.v2-student-search.is-open input'));
 const dimensions=await page.evaluate(()=>{const field=document.querySelector('.v2-student-search.is-open .v2-student-search-field'),panel=document.querySelector('.v2-student-search.is-open .v2-student-search-panel');const f=field.getBoundingClientRect(),p=panel.getBoundingClientRect();return {left:f.left,right:f.right,panelLeft:p.left,panelRight:p.right,panelTop:p.top,fieldBottom:f.bottom,background:getComputedStyle(panel).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth,focused:document.activeElement===field.querySelector('input')};});
 assert(dimensions.left>=0&&dimensions.right<=width&&dimensions.panelLeft>=0&&dimensions.panelRight<=width);assert(dimensions.panelTop>=dimensions.fieldBottom);assert(!dimensions.background.includes("rgba"));assert(!dimensions.overflow);assert(dimensions.focused);
 await page.screenshot({path:`artifacts/search-layout-20261021/open-${width}.png`});
 await page.getByRole('textbox',{name:'搜索校园内容',exact:true}).fill('高等数学');
 await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'搜索校园',exact:true}).evaluate(e=>e===document.activeElement));
 await page.getByRole('button',{name:'搜索校园',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'搜索校园内容',exact:true}).inputValue(),'');
 await page.getByRole('button',{name:'关闭搜索',exact:true}).click();await page.screenshot({path:`artifacts/search-layout-20261021/closed-${width}.png`});
 checks.push({width,...dimensions,closeAndFocus:true,queryCleared:true});
}
await fs.writeFile('artifacts/search-layout-20261021/checks.json',JSON.stringify(checks,null,2));console.log(checks);await browser.close();
