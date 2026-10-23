import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4174',accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:393,height:852},recordVideo:{dir:'artifacts/settings-scroll-20261021/video',size:{width:393,height:852}}});
const a=accounts.find(a=>a.roles.includes('student'));assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
const page=await context.newPage();await page.goto(base+'/v2/settings',{waitUntil:'networkidle'});const scroller=page.locator('.student-utility-content');await scroller.waitFor();
const states=[];
for(const theme of ['light','dark']){
 await page.evaluate(theme=>document.documentElement.dataset.uiTheme=theme,theme);
 for(const position of [0,250,500,900,500,0]){
  await scroller.evaluate((e,y)=>e.scrollTo({top:y,behavior:'instant'}),position);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  states.push(await page.evaluate(()=>{const content=document.querySelector('.student-utility-content'),modal=content.closest('.v2-modal'),r=modal.getBoundingClientRect(),scrim=document.querySelector('.v2-modal-layer:has(.student-utility-content)>.v2-modal-scrim');return {theme:document.documentElement.dataset.uiTheme,scroll:content.scrollTop,top:r.top,bottom:r.bottom,modalBlur:getComputedStyle(modal).backdropFilter,scrimBlur:getComputedStyle(scrim).backdropFilter,bodyLocked:document.body.style.overflow==='hidden',overflow:document.documentElement.scrollWidth>innerWidth};}));
  if(position===0||position===900)await page.screenshot({path:`artifacts/settings-scroll-20261021/${theme}-${position}.png`});
 }
}
for(const s of states){assert.equal(s.modalBlur,'none');assert.equal(s.scrimBlur,'none');assert(s.bodyLocked);assert(!s.overflow);assert(s.top>=0&&s.bottom<=852);}
assert(states.some(s=>s.scroll>0));assert(states.every(s=>Math.abs(s.top-states[0].top)<1&&Math.abs(s.bottom-states[0].bottom)<1));
await fs.writeFile('artifacts/settings-scroll-20261021/checks.json',JSON.stringify(states,null,2));console.log('PASS: repeated scroll, stable sheet bounds, no backdrop filters, light/dark');await context.close();await browser.close();
