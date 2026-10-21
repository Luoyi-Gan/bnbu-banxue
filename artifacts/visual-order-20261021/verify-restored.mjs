import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174';
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
for(const role of ['student']){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const a=accounts.find(a=>a.roles.includes(role));
 const login=await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}});
 if(!login.ok())throw Error('login '+role+' '+login.status());
 const page=await context.newPage();
 for(const [name,route] of role==='student'?[['home-restored','/v2']]:[['teacher','/v2/teacher/coffee']]){
  for(const width of [393]){
   await page.setViewportSize({width,height:852});
   await page.goto(base+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:`artifacts/visual-order-20261021/${name}-${width}.png`,fullPage:true});
   results.push({name,width,url:page.url(),...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth, classes:document.querySelector(".v2-app")?.className, token:getComputedStyle(document.querySelector(".v2-app")).getPropertyValue("--ui-radius-card"), outside:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,6).map(e=>e.className),radii:[...document.querySelectorAll('.cw-next,.settings-list,.tt-board,.v2-teacher-panel')].map(e=>getComputedStyle(e).borderRadius),underline:[...document.querySelectorAll('.campus-discovery-sections button[aria-pressed=true]')].map(e=>getComputedStyle(e,'::after').display)}))});
  }
 }
 await context.close();
}
console.log(JSON.stringify(results,null,2));await fs.writeFile('artifacts/visual-order-20261021/restore-checks.json',JSON.stringify(results,null,2));await browser.close();
