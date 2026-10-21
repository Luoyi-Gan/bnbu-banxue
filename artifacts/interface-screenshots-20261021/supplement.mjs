import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out='artifacts/interface-screenshots-20261021/iPhone15',base='http://127.0.0.1:4174';
const m=JSON.parse(await fs.readFile(out+'/manifest.json','utf8'));
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const jobs=[['student','教师介绍与预约时段','/v2/coffee','.v2-teacher-card'],['student','教师预约记录详情','/v2/coffee?view=bookings','.v2-saved-row'],['student','课表周视图','/v2/me?tab=timetable','button:has-text("周课表")'],['student','课表日列表','/v2/me?tab=timetable','button:has-text("日列表")'],['student','课程详情','/v2/me?tab=timetable','.tt-grid-course'],['student','通知详情','/v2/messages?view=notifications','a[href*="notice="]'],['student','队伍会话详情','/v2/messages','a[href*="conversation="]'],['admin','新增店铺表单','/v2/admin/shops','button:has-text("新增店铺")']];
jobs.push(...Object.entries({privacy:'隐私与可见性',notifications:'消息与提醒',preview:'资料展示内容',language:'语言',appearance:'外观与显示',campus:'校园使用偏好',policy:'设置隐私政策',about:'关于会同里',account:'账号与安全',help:'使用指南',data:'演示数据'}).map(([key,name])=>['student',name,'/v2/settings?section='+key,null]),['student','课程校历弹窗','/v2/me?tab=timetable','button:has-text("校历设置")']);
for(const role of ['student','admin']){
 const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const a=accounts.find(a=>a.roles.includes(role==='admin'?'superadmin':role));await c.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}});const p=await c.newPage();
 jobs.push(['student','活动筛选','/v2/activities','.campus-discovery-filters summary']);
 for(const [,name,route,selector] of jobs.filter(j=>j[0]===role&&(!process.env.CAPTURE_ONLY||process.env.CAPTURE_ONLY.split(',').includes(j[1])))){
  await p.goto(base+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1300);
  try{if(name==='通知详情'){const ws=await (await c.request.get(base+'/api/workspace')).json();const id=ws.notifications[0].id;await p.goto(base+route+'&notice='+encodeURIComponent(id));await p.waitForTimeout(700);}else if(selector)await p.locator(name==='课程详情'?'.tt-grid-course,.tt-day-course':name==='队伍会话详情'?'.inbox-conversation':selector).first().click({timeout:2500});await p.waitForTimeout(500);}catch{m.skipped.push({name,reason:'当前数据没有可打开的入口'});continue;}
  await p.evaluate(()=>document.fonts.ready);const num=String(m.entries.length+1).padStart(3,'0'),file=`${role}/${num}-${name}.png`;
  await p.screenshot({path:out+'/'+file});const height=await p.evaluate(()=>Math.max(document.body.scrollHeight,document.documentElement.scrollHeight));let full=null;if(height>882){full=`${role}/${num}-${name}-完整长图.png`;await p.screenshot({path:out+'/'+full,fullPage:true});}
  m.entries.push({num,role,name,route,file,full,height,text:(await p.locator('body').innerText()).slice(0,200)});console.log(num,name);
 }
 await c.close();
}
await b.close();m.skipped=m.skipped.filter(s=>!m.entries.some(e=>e.name===s.name));await fs.writeFile(out+'/manifest.json',JSON.stringify(m,null,2));
const names={public:'公开页面',student:'学生端',teacher:'教师端',admin:'管理员端'};
let html=await fs.readFile(out+'/index.html','utf8');
html=html.replace(/\d+ 个界面与状态/,m.entries.length+' 个界面与状态');
for(const e of m.entries.filter(e=>!html.includes(e.file))){const label=names[e.role];const marker=Object.keys(names).indexOf(e.role)===3?'<h2>覆盖说明</h2>':`<h2 id="${Object.keys(names)[Object.keys(names).indexOf(e.role)+1]}">`;const i=html.indexOf(marker),end=html.lastIndexOf('</section>',i);html=html.slice(0,end)+`<article><a href="${e.file}"><img loading="lazy" src="${e.file}"></a><h3>${e.num} ${e.name}</h3><small>${e.route}</small><a href="${e.file}">首屏原图</a>${e.full?` · <a href="${e.full}">完整长图</a>`:''}</article>`+html.slice(end);}
html=html.replace(/<p>本轮未出现的入口：[\s\S]*?<\/p>/,'');if(m.skipped.length)html+=`<p>本轮未出现的入口：${m.skipped.map(e=>e.name).join('、')}。</p>`;
await fs.writeFile(out+'/index.html',html);console.log('DONE',m.entries.length,m.skipped);
