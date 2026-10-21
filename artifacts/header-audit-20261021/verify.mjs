import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();const checks=[];
for(const route of ['partners','coffee','alumni','organizations','partners/teams','ai','coffee?view=bookings','alumni?view=bookings'])for(const width of [393,320,1440]){
 await page.setViewportSize({width,height:852});await page.goto(base+'/v2/'+route,{waitUntil:'networkidle'});
 const info=await page.evaluate(()=>{const title=[...document.querySelectorAll('h1')].filter(e=>e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden');const heading=document.querySelector('.v2-compact-route-heading'),actions=document.querySelector('.v2-top-actions');return {visibleTitles:title.map(e=>e.textContent),titleRight:heading.getBoundingClientRect().right,actionsLeft:actions.getBoundingClientRect().left,overflow:document.documentElement.scrollWidth>innerWidth,titleTop:title[0].getBoundingClientRect().top};});
 assert(!info.overflow);assert.equal(info.visibleTitles.length,1);if(width<721){assert(info.titleRight<=info.actionsLeft);assert(info.titleTop<85);}
 await page.screenshot({path:`artifacts/header-audit-20261021/after-${route.replaceAll('/','_').replaceAll('?','_')}-${width}.png`});checks.push({route,width,...info});
}
console.log(checks);await fs.writeFile('artifacts/header-audit-20261021/after-checks.json',JSON.stringify(checks,null,2));await browser.close();
