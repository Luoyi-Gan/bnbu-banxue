import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root='artifacts/interface-screenshots-20261021',out=root+'/iPhone15',base='http://127.0.0.1:4174';
await fs.mkdir(out,{recursive:true});
const old=JSON.parse(await fs.readFile(root+'/manifest.json','utf8'));
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const entries=[],skipped=[];
const extras=[
 ['student','发现社团','/v2/activities?section=organizations'],['student','发现校友','/v2/activities?section=alumni'],
 ['student','全局搜索','/v2','搜索校园'],['student','课表导入弹窗','/v2/me?tab=timetable','重新导入|导入课表'],['student','课程校历弹窗','/v2/me?tab=timetable','课程校历'],['student','课表周视图','/v2/me?tab=timetable','周视图'],
 ['student','发起组队表单','/v2/partners','发起组队'],['student','活动筛选','/v2/activities','筛选'],
 ['student','组织介绍','/v2/organizations',null,'summary'],
 ['teacher','开放时段管理','/v2/teacher/coffee','开放时段'],
 ['student','地图路线规划','/v2/campus/explore','路线规划'],['student','地图建筑列表','/v2/campus/explore','建筑列表']
];
for(const role of ['public','student','teacher','admin']){
 const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3,isMobile:true,hasTouch:true,reducedMotion:'reduce',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
 if(role!=='public'){const a=accounts.find(a=>a.roles.includes(role==='admin'?'superadmin':role));const res=await c.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}});if(!res.ok())throw new Error(role+' login '+res.status());}
 const p=await c.newPage();
 const routes=[...old.entries.filter(e=>e.role===role&&!['身份选择','组织详情'].includes(e.name)).map(e=>[role,e.name,e.route]),...extras.filter(e=>e[0]===role)];
 for(const [,name,route,button,selector] of routes){
  await p.goto(base+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(route.includes('explore')?14000:1200);await p.evaluate(()=>document.fonts.ready);
  try{if(button)await p.getByRole('button',{name:new RegExp(button)}).first().click({timeout:2000});if(selector)await p.locator(selector).first().click({timeout:2000});}catch{skipped.push({name,reason:'当前数据或界面未提供此入口'});continue;}
  await p.waitForTimeout(300);
  const num=String(entries.length+1).padStart(3,'0'),dir=out+'/'+role;await fs.mkdir(dir,{recursive:true});
  const file=`${role}/${num}-${name}.png`;await p.screenshot({path:out+'/'+file});
  const height=await p.evaluate(()=>Math.max(document.body.scrollHeight,document.documentElement.scrollHeight));
  let full=null;if(height>882){full=`${role}/${num}-${name}-完整长图.png`;await p.screenshot({path:out+'/'+full,fullPage:true});}
  entries.push({num,role,name,route,file,full,height,text:(await p.locator('body').innerText()).slice(0,200)});console.log(num,role,name,height);
 }
 await c.close();
}
await b.close();
await fs.writeFile(out+'/manifest.json',JSON.stringify({viewport:'393 × 852 CSS px',scale:3,pixels:'1179 × 2556 px',engine:'Chrome，iPhone触摸与视口模拟',entries,skipped},null,2));
const names={public:'公开页面',student:'学生端',teacher:'教师端',admin:'管理员端'};
await fs.writeFile(out+'/index.html',`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>会同里 iPhone 15 界面截图</title><style>body{font:16px system-ui;background:#f1f4ef;color:#203b30;margin:24px}nav{padding:16px 0;position:sticky;top:0;background:#f1f4ef}nav a{margin-right:20px}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px}article{padding:16px;background:white;border-radius:16px}img{display:block;width:100%;height:auto;border:1px solid #ddd}a{color:#176d54}small{display:block;overflow-wrap:anywhere;margin:12px 0}</style><h1>会同里 · iPhone 15 界面截图</h1><p>2026-10-21 · ${entries.length} 个界面与状态 · 393 × 852，3倍像素（1179 × 2556）</p><p>使用本地验收账号及现有模拟数据。首屏截图保留实际显示；长页面另附完整长图。浏览器模拟截图，未进行 iPhone 真机验收。</p><nav>${Object.entries(names).map(([k,v])=>`<a href="#${k}">${v}</a>`).join('')}</nav>${Object.entries(names).map(([k,v])=>`<h2 id="${k}">${v}</h2><section>${entries.filter(e=>e.role===k).map(e=>`<article><a href="${e.file}"><img loading="lazy" src="${e.file}"></a><h3>${e.num} ${e.name}</h3><small>${e.route}</small><a href="${e.file}">首屏原图</a>${e.full?` · <a href="${e.full}">完整长图</a>`:''}</article>`).join('')}</section>`).join('')}<h2>覆盖说明</h2><p>包含当前 V2 独立页面、个人中心子页、发现分类、已有活动和队伍详情，以及可打开的搜索、筛选、组队、课表和地图面板。重定向入口不重复截图；需要特定业务记录才出现的改期、审核和会话详情等状态，受当前验收数据限制。</p>${skipped.length?`<p>本轮未出现的入口：${skipped.map(e=>e.name).join('、')}。</p>`:''}`);
console.log('DONE',entries.length,'skipped',JSON.stringify(skipped));
