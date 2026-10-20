const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
import fs from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
const db=new DatabaseSync('data/browser-acceptance.sqlite',{readOnly:true});
const account={id:'promo-student',name:'林同学',email:'student@example.test',organization:'BNBU',status:'active',roles:['student']};
const fixtures=db.prepare("SELECT * FROM entities WHERE json_extract(data,'$.previewFixture')=1 AND kind IN ('activity','organization','room')").all();
const entities=fixtures.map(e=>({id:e.id,kind:e.kind,ownerId:'promo-author',version:1,createdAt:e.created_at,updatedAt:e.updated_at,data:JSON.parse(e.data)}));
db.close();
const ws={account,entities,people:[{id:'promo-author',name:'校园同学',organization:'BNBU',roles:['student']}],relations:entities.filter(e=>e.kind==='activity' && Date.parse(e.data.endAt)>Date.now()).slice(0,1).map(e=>({entityId:e.id,kind:'participate',createdAt:e.createdAt})),notifications:[],audit:[],alumni:{profiles:[],posts:[],requests:[],slots:[],bookings:[],follows:[],notices:[],history:[]}};
const b=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:790},deviceScaleFactor:2});
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;const body=path==='/api/auth/me'?{account}:path==='/api/workspace'?ws:path==='/api/rooms'?{items:entities.filter(e=>e.kind==='room').map(e=>({...e.data,id:e.id,ownerId:e.ownerId,version:1,details:e.data.details||{},memberCount:1,members:[],requests:[]})),nextCursor:null}:path.includes('community')?{account,posts:[],likedPosts:[],savedPosts:[],hasMore:false}:{items:[],data:[]};return r.fulfill({json:body});});
for(const [name,route] of [['home','/v2'],['discover','/v2/activities'],['partners','/v2/partners'],['map','/v2/campus/explore']]){
 await p.goto('http://127.0.0.1:4174'+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(name==='map'?12000:2800);await p.evaluate(()=>document.fonts.ready);if(name==='partners'||name==='map'){await p.evaluate(y=>window.scrollTo(0,y),name==='partners'?235:140);await p.waitForTimeout(300)}await p.screenshot({path:`public/promo/${name}.png`});console.log(name,await p.title(),(await p.locator('body').innerText()).slice(0,160));
}

if(process.env.PROMO_STILLS_ONLY){await b.close();process.exit(0)}
const ctx=await b.newContext({viewport:{width:390,height:790},deviceScaleFactor:1,recordVideo:{dir:'artifacts/promo-20261020/video',size:{width:390,height:790}}});
const v=await ctx.newPage();
await v.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;return r.fulfill({json:path==='/api/auth/me'?{account}:path==='/api/workspace'?ws:{account,posts:[],likedPosts:[],savedPosts:[]}})});
await v.goto('http://127.0.0.1:4174/v2/activities');await v.waitForTimeout(2200);
await v.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>{const start=performance.now();function tick(now){const t=Math.min(1,(now-start)/7000);const q=t<.5?t*2:2-t*2;window.scrollTo(0,430*(.5-Math.cos(q*Math.PI)/2));if(t<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});});
await v.waitForTimeout(700);const path=await v.video().path();await ctx.close();await fs.copyFile(path,'public/promo/discover.webm');
await b.close();
