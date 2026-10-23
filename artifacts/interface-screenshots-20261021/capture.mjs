import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const base='http://127.0.0.1:4174';
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const entries=[],errors=[];
const student=[['首页','/v2'],['发现活动','/v2/activities'],['发现社区','/v2/activities?section=community'],['校园','/v2/campus'],['运动','/v2/sports'],['我的','/v2/me'],['校园探店','/v2/shops'],['校友同行','/v2/alumni'],['校友预约','/v2/alumni?view=bookings'],['Coffee Chat','/v2/coffee'],['我的教师交流预约','/v2/coffee?view=bookings'],['校园社区','/v2/community'],['我的笔记','/v2/community?person=me'],['发布笔记','/v2/community?compose=1'],['找搭子','/v2/partners'],['我的队伍','/v2/partners/teams'],['会话','/v2/messages'],['通知','/v2/messages?view=notifications'],['社团组织','/v2/organizations'],['校园地图','/v2/campus/explore'],['校园AI','/v2/ai'],...Object.entries({profile:'个人资料',timetable:'我的课表',events:'我的活动',teams:'我的组队',saved:'我的收藏',network:'校园关系',verification:'身份认证'}).map(([k,v])=>[v,'/v2/me?tab='+k]),['设置','/v2/settings'],['身份选择','/v2/identity']];
const groups={public:[['产品介绍','/intro'],['宣传页','/promo.html'],['欢迎页','/v2/welcome'],['登录','/v2/login'],['注册','/v2/register'],['找回密码','/v2/forgot-password'],['隐私政策','/v2/privacy']],student,teacher:[['教师交流','/v2/teacher/coffee'],['教师日程','/v2/teacher/schedule'],['教师消息','/v2/teacher/messages'],['教师资料','/v2/teacher/profile'],['教师体育课程','/v2/teacher/sports'],['教师设置','/v2/teacher/settings']],admin:[['运营总览','/v2/admin'],['邮件转活动','/v2/admin/mail-activities'],['认证审核','/v2/admin/verifications'],['社区内容审核','/v2/admin/moderation'],['店铺与点评管理','/v2/admin/shops'],['社区屏蔽词','/v2/admin/keywords'],['管理员设置','/v2/admin/settings']]};
for(const [role,routes] of Object.entries(groups)){
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
 if(role!=='public'){
  const a=accounts.find(a=>a.roles.includes(role==='admin'?'superadmin':role));
  const res=await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}});
  if(!res.ok())throw new Error('Login '+role+' '+res.status());
 }
 const page=await context.newPage();
 if(role==='student'){
  const res=await context.request.get(base+'/api/workspace');const ws=await res.json();
  for(const kind of ['activity','organization','room']){const e=ws.entities?.find(e=>e.kind===kind);if(e)routes.push([({activity:'活动详情',organization:'组织详情',room:'搭子详情'})[kind],kind==='activity'?'/v2/activities/'+e.id:kind==='room'?'/v2/partners?item='+e.id:'/v2/organizations?item='+e.id]);}
 }
 for(const [name,route] of routes){
  const num=String(entries.length+1).padStart(3,'0'),dir=role;await fs.mkdir(out+'/'+dir,{recursive:true});
  await page.goto(base+route,{waitUntil:'networkidle',timeout:45000}).catch(e=>errors.push(name+': '+e.message));
  await page.waitForTimeout(route.includes('explore')?12000:700);await page.evaluate(()=>document.fonts.ready);
  const text=await page.locator('body').innerText();
  if(page.url().includes('/login')&&!route.includes('/login'))errors.push(name+' redirected to login');
  const file=`${dir}/${num}-${name}.png`;await page.screenshot({path:out+'/'+file,fullPage:true});
  let mobile=null;
  if(role==='student'||role==='public'){await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);mobile=`${dir}/${num}-${name}-手机.png`;await page.screenshot({path:out+'/'+mobile,fullPage:true});await page.setViewportSize({width:1440,height:1000});}
  entries.push({num,role,name,route,file,mobile,url:page.url(),text:text.slice(0,350),buttons:await page.getByRole('button').allTextContents()});
  console.log(num,role,name,text.length);
 }
 await context.close();
}
await browser.close();
await fs.writeFile(out+'/manifest.json',JSON.stringify({createdAt:new Date().toISOString(),scope:'本地验收数据，桌面1440×1000，手机390×844；长页面完整截图。',entries,errors},null,2));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await fs.writeFile(out+'/index.html',`<!doctype html><meta charset="utf-8"><title>会同里界面截图目录</title><style>body{font:16px system-ui;background:#f4f5f1;color:#20352c;margin:36px}h1{margin-bottom:8px}nav{position:sticky;top:0;background:#f4f5f1;padding:16px}nav a{margin-right:24px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:22px}article{background:white;padding:16px;border-radius:14px}img{width:100%;height:230px;object-fit:cover;object-position:top;border:1px solid #ddd}a{color:#176b55}small{display:block;overflow-wrap:anywhere;margin:12px 0}</style><h1>会同里 · 界面截图目录</h1><p>2026-10-21 · 本地验收账号与模拟数据 · 桌面 1440×1000 / 手机 390×844 · 点击查看完整原图</p><nav>${Object.keys(groups).map(r=>`<a href="#${r}">${({public:'公开页面',student:'学生端',teacher:'教师端',admin:'管理员端'})[r]}</a>`).join('')}</nav>${Object.keys(groups).map(r=>`<h2 id="${r}">${({public:'公开页面',student:'学生端',teacher:'教师端',admin:'管理员端'})[r]}</h2><section>${entries.filter(e=>e.role===r).map(e=>`<article><a href="${e.file}"><img loading="lazy" src="${e.file}"></a><h3>${e.num} ${esc(e.name)}</h3><small>${esc(e.route)}</small><a href="${e.file}">桌面完整图</a> ${e.mobile?` · <a href="${e.mobile}">手机完整图</a>`:''}</article>`).join('')}</section>`).join('')}`);
console.log('DONE',entries.length,'pages',errors);
