import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:4186',out='artifacts/learning-20261022',manifest={scope:'本地隔离 SQLite 与合成学生；不代表真实设备或生产验收',screenshots:[],checks:[],errors:[]};
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',error=>manifest.errors.push(error.message));
 await page.goto(base+'/v2/login');await page.getByRole('button',{name:'邮箱验证码',exact:true}).waitFor();
 const shot=async(name)=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`horizontal overflow: ${name}`);await page.screenshot({path:`${out}/${name}.png`,fullPage:!name.startsWith('reader-')});manifest.screenshots.push({file:name+'.png',width:(await page.viewportSize()).width});};
 await shot('login-email-mobile');await page.getByRole('button',{name:'学校账号',exact:true}).click();await page.getByRole('textbox',{name:'学校账号',exact:true}).waitFor();await shot('login-school-mobile');
 const actor=accounts.find(a=>a.roles.includes('student'));
 if(process.argv.includes('--password-login')){
 await page.getByRole('button',{name:'平台密码 / 管理账号登录'}).click();await page.getByRole('textbox',{name:'邮箱或管理账号',exact:true}).fill(actor.email);await page.locator('input[name=password]').fill(actor.password);await page.getByRole('button',{name:'登录',exact:true}).click();await page.waitForURL(url=>url.pathname!=='/v2/login');manifest.checks.push('保留的平台密码登录完成本人账号认证');
 }else{
 await page.getByRole('button',{name:'邮箱验证码',exact:true}).click();
 await page.getByRole('textbox',{name:'邮箱地址',exact:true}).fill(actor.email);
 const codeResponse=page.waitForResponse(r=>r.url().endsWith('/api/auth/email-login/request'));
 await page.getByRole('button',{name:'发送验证码',exact:true}).click();assert.equal((await codeResponse).status(),200);
 const db=new DatabaseSync('.runtime/learning-preview.sqlite');
 const email=db.prepare("SELECT body FROM mail_outbox WHERE recipient=? AND subject='会同里登录验证码' ORDER BY created_at DESC LIMIT 1").get(actor.email);
 const code=String(email.body).match(/\d{6}/)[0];db.close();
 await page.getByRole('textbox',{name:'邮箱验证码',exact:true}).fill(code);
 await page.getByRole('button',{name:'登录会同里',exact:true}).click();await page.waitForURL(url=>url.pathname!=='/v2/login');
 manifest.checks.push('邮箱验证码从登录页完成真实请求并进入本人账号');
 }
 const check=await context.request.get(base+'/api/learning');assert.equal(check.status(),200);
 const state=await check.json();assert.equal(state.status.connected,false);
 for(const item of state.items.filter(i=>i.title.startsWith('本地验收 ·')))await context.request.post(base+'/api/learning/command',{data:{operation:'delete',input:{id:item.id,version:item.version}}});
 const docs=await(await context.request.post(base+'/api/learning/command',{data:{operation:'documents',input:{}}})).json();
 for(const doc of docs.documents.filter(d=>d.name==='本地验收笔记.txt'))await context.request.post(base+'/api/learning/command',{data:{operation:'document.delete',input:{id:doc.id}}});
 const blocked=await context.request.post(base+'/api/learning/command',{data:{operation:'sync',input:{}}});assert.equal(blocked.status(),403);manifest.checks.push('邮箱/平台密码会话无法读取 iSpace');
 await page.goto(base+'/v2/me?tab=timetable&study=arrangements');await page.getByRole('heading',{name:'每周给自己留一点时间'}).waitFor();
 await page.getByRole('button',{name:'新增',exact:true}).click();
 await page.locator('input[name=title]').fill('本地验收 · 固定自习');await page.locator('input[name=startTime]').fill('20:00');await page.locator('input[name=endTime]').fill('21:00');await page.locator('input[name=from]').fill('2026-10-22');await page.locator('input[name=until]').fill('2026-12-01');
 await page.getByRole('button',{name:'保存安排',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.reload();await page.getByText('本地验收 · 固定自习',{exact:true}).first().waitFor();manifest.checks.push('重复安排保存后刷新读回');
 await page.locator('.learning-workspace').scrollIntoViewIfNeeded();await shot('repeat-mobile');
 await page.getByRole('button',{name:'DDL 与提醒',exact:true}).click();await page.getByRole('button',{name:'新增',exact:true}).click();await page.locator('input[name=title]').fill('本地验收 · 课程报告');await page.locator('input[name=startAt]').fill('2026-10-23T20:00');await page.getByRole('button',{name:'保存安排',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await shot('deadlines-mobile');
 await page.getByRole('button',{name:'课程资料',exact:true}).click();await page.locator('input[type=file][accept*="application/pdf"]').setInputFiles({name:'本地验收笔记.txt',mimeType:'text/plain',buffer:Buffer.from('第一章：线性代数\n矩阵的乘法需要满足维度匹配。\f第二章：复习重点\n理解线性变换的几何意义。')});
 await page.getByRole('heading',{name:'本地验收笔记.txt',exact:true}).waitFor();await page.getByRole('button',{name:'下一页',exact:true}).click();await page.getByText('第二章：复习重点',{exact:false}).waitFor();manifest.checks.push('课件上传、分页阅读');
 await page.locator('.learning-reader').scrollIntoViewIfNeeded();await shot('reader-mobile');
 await page.getByRole('textbox',{name:'问问这一页'}).fill('解释这一页');await page.getByRole('checkbox',{name:'同意将当前页文字与问题发送给 DeepSeek（API 单独计费）'}).check();if(process.argv.includes('--live-ai')){
  const reply=page.waitForResponse(r=>r.url().endsWith('/api/learning/command')&&r.request().postDataJSON()?.operation==='ask');
  await page.getByRole('button',{name:'询问当前页',exact:true}).click();const response=await reply;assert.equal(response.status(),200);const result=await response.json();assert.ok(result.answer?.length>0);assert.equal(result.page,2);assert.equal(result.provider,'DeepSeek');manifest.aiUsage=result.usage;manifest.checks.push('DeepSeek 实际随页问答成功，返回第2页及读取范围');await page.locator('.learning-answer').scrollIntoViewIfNeeded();await shot('reader-answer-mobile');
 }else{manifest.checks.push('问答表单保留用户同意控制；常规回归不发起付费调用');}
 await page.getByRole('button',{name:'询问当前页',exact:true}).scrollIntoViewIfNeeded();await shot('reader-submit-mobile');
 await page.goto(base+'/v2/campus?service=directory');await page.getByRole('searchbox',{name:'搜索办事或部门'}).fill('VPN');await page.getByRole('heading',{name:'信息科技服务中心 ITSC'}).waitFor();assert.equal(await page.getByRole('heading',{name:'学生事务处 · 奖学金证明'}).count(),0);await shot('directory-mobile');manifest.checks.push('办事搜索按关键词筛选官方公开资料');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);manifest.checks.push('393px 页面无横向溢出');
 await page.goto(base+'/v2/me?tab=timetable&study=exams');await page.getByRole('heading',{name:'我的考试安排',exact:true}).waitFor();await shot('exams-mobile');
 await page.getByRole('button',{name:'成绩查看',exact:true}).click();await page.getByRole('heading',{name:'我的课程评分'}).waitFor();await shot('grades-mobile');
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/v2/me?tab=timetable&study=materials');await page.getByText('课程资料夹',{exact:true}).waitFor();await shot('materials-desktop');
 const reduced=await page.locator('.learning-workspace').evaluate(el=>getComputedStyle(el).animationName);assert.equal(reduced,'none');manifest.checks.push('系统减少动态下禁用进入动画');
 await context.close();
}catch(error){const pages=browser.contexts().flatMap(c=>c.pages());for(const p of pages){console.log((await p.locator('[role=alert]').allTextContents()).join(' | '));await p.screenshot({path:`${out}/failure.png`,fullPage:true});}throw error;}finally{await browser.close();await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));}
assert.deepEqual(manifest.errors,[]);console.log(JSON.stringify({screenshots:manifest.screenshots.length,checks:manifest.checks,errors:manifest.errors,aiUsage:manifest.aiUsage}));
