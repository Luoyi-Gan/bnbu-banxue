const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
import fs from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
const db=new DatabaseSync('data/browser-acceptance.sqlite',{readOnly:true});
const account={id:'promo-student',name:'林同学',email:'student@example.test',organization:'BNBU',status:'active',roles:['student']};
const fixtures=db.prepare("SELECT * FROM entities WHERE json_extract(data,'$.previewFixture')=1 AND kind IN ('activity','organization','room')").all();
const entities=fixtures.map(e=>({id:e.id,kind:e.kind,ownerId:'promo-author',version:1,createdAt:e.created_at,updatedAt:e.updated_at,data:JSON.parse(e.data)}));
db.close();
entities.push({id:'promo-teacher-profile',kind:'teacherProfile',ownerId:'promo-teacher',version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),data:{nickname:'陈老师（演示）',topics:'学习方法、专业探索、校园成长',bio:'带着问题来，一起梳理学习与成长的方向。',location:'学习资源中心',enabled:true}});
const posts=[['在校园里，收集一个普通的晴天','/src/assets/campus/gallery/blue-sky-reflection.webp'],['课后散步，你最喜欢哪一段路？','/src/assets/campus/night-walkway.jpg'],['把学习节奏，慢慢找回来','/src/assets/campus/campus-services.jpg']].map(([title,img],i)=>({id:'promo-post-'+i,title,body:'校园日常分享 · 宣传展示用演示内容',images:[img],board:'校园生活',author:'校园同学',date:'2026-10-20',likes:0,saves:0,status:'visible',comments:[]}));
const ws={account,entities,people:[{id:'promo-author',name:'校园同学',organization:'BNBU',roles:['student']}],relations:entities.filter(e=>e.kind==='activity' && Date.parse(e.data.endAt)>Date.now()).slice(0,1).map(e=>({entityId:e.id,kind:'participate',createdAt:e.createdAt})),notifications:[],audit:[],alumni:{profiles:[],posts:[],requests:[],slots:[],bookings:[],follows:[],notices:[],history:[]}};
const b=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:790},deviceScaleFactor:2});
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;const body=path==='/api/auth/me'?{account}:path==='/api/workspace'?ws:path==='/api/rooms'?{items:entities.filter(e=>e.kind==='room').map(e=>({...e.data,id:e.id,ownerId:e.ownerId,version:1,details:e.data.details||{},memberCount:1,members:[],requests:[]})),nextCursor:null}:path.includes('/community/social')?{profile:{id:account.id,name:account.name,avatar:'',self:true,following:0,followers:0,appreciations:0,posts:0,blocked:false,blockedByMe:false,bio:''},people:[],followingIds:[],drafts:[],draftCount:0,hasMore:false}:path.includes('community')?{account,posts,likedPosts:[],savedPosts:[],hasMore:false}:{items:[],data:[]};return r.fulfill({json:body});});
for(const [name,route] of [['forum','/v2/community'],['coffee','/v2/coffee'],['sports','/v2/sports'],['clubs','/v2/organizations'],['alumni','/v2/alumni'],['schedule','/v2/schedule'],['ai','/v2/ai'],['messages','/v2/messages'],['profile','/v2/me']]){
 await p.goto('http://127.0.0.1:4174'+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(name==='map'?12000:2800);await p.evaluate(()=>document.fonts.ready);if(name==='partners'||name==='map'){await p.evaluate(y=>window.scrollTo(0,y),name==='partners'?235:140);await p.waitForTimeout(300)}await p.screenshot({path:`public/promo/${name}.png`});console.log(name,await p.title(),(await p.locator('body').innerText()).slice(0,160));
}

await b.close();
