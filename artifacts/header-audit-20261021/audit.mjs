import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());const page=await context.newPage();const checks=[];
for(const route of ['/v2','/v2/activities','/v2/campus','/v2/sports','/v2/me','/v2/shops','/v2/alumni','/v2/organizations','/v2/partners/teams','/v2/ai','/v2/community','/v2/me?tab=timetable']){
 await page.goto(base+route,{waitUntil:'networkidle'});const info=await page.evaluate(()=>({titles:[...document.querySelectorAll('h1')].filter(e=>e.getBoundingClientRect().height).map(e=>({text:e.textContent,top:e.getBoundingClientRect().top})),toolbar:[...document.querySelectorAll('.v2-topbar,.ref-header,.cw-header')].filter(e=>e.getBoundingClientRect().height).map(e=>({class:e.className,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})),overflow:document.documentElement.scrollWidth>innerWidth}));checks.push({route,...info});
 await page.screenshot({path:'artifacts/header-audit-20261021/before-'+route.replaceAll('/','_').replaceAll('?','_')+'.png'});
}console.log(JSON.stringify(checks,null,2));await fs.writeFile('artifacts/header-audit-20261021/before.json',JSON.stringify(checks,null,2));await browser.close();
