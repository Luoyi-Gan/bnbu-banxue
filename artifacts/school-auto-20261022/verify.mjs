import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
// Credentials are supplied by the invoking process; never saved or printed.
assert.ok(process.env.ISPACE_CHECK_USER&&process.env.ISPACE_CHECK_PASSWORD,'School test credentials must be in the process environment');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const result={scope:'用户授权学校账号在本地隔离数据库的实测；不含密码、令牌、邮箱或学校原始资料',checkedAt:new Date().toISOString()};
try{
 const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(120000);
 const commands=[],errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(r.url().endsWith('/api/learning/command'))commands.push(r.postDataJSON()?.operation)});
 await page.goto('http://127.0.0.1:4186/v2/login');await page.getByRole('button',{name:'学校账号',exact:true}).click();
 await page.getByRole('textbox',{name:'学校账号',exact:true}).fill(process.env.ISPACE_CHECK_USER);await page.locator('input[type=password]').fill(process.env.ISPACE_CHECK_PASSWORD);
 await page.getByRole('button',{name:'连接学校账号',exact:true}).click();await page.waitForURL(url=>url.pathname!=='/v2/login');
 const state=await(await context.request.get('http://127.0.0.1:4186/api/learning')).json(),ws=await(await context.request.get('http://127.0.0.1:4186/api/workspace')).json();
 const table=ws.entities.find(e=>e.kind==='timetable'&&e.ownerId===ws.account.id);
 Object.assign(result,{autoSync:state.sync,courseSpaces:state.courses.length,misCourseCount:new Set((table?.data.lessons??[]).map(l=>l.name)).size,automaticDeadlines:state.items.filter(i=>i.source==='ispace').length,materialCourses:Object.keys(state.materials).length,files:Object.values(state.materials).flat().length,warnings:state.warnings});
 assert.equal(state.sync.mis,'success');assert.equal(table.data.source,'mis');
 await page.goto('http://127.0.0.1:4186/v2/me?tab=timetable');await page.getByText(table.data.lessons[0].name,{exact:true}).first().waitFor();
 await page.goto('http://127.0.0.1:4186/v2/me?tab=timetable&study=materials');await page.getByRole('heading',{name:'课程资料夹',exact:true}).waitFor();await page.getByText('MIS 时间表已接入我的课表',{exact:false}).waitFor();
 assert.equal(await page.getByRole('button',{name:'读取课程资料',exact:true}).count(),0);
 const fileCourse=Object.keys(state.materials).find(id=>state.materials[id].length>0);
 if(fileCourse){await page.locator('.learning-course-choice select').selectOption(fileCourse);await page.locator('.learning-file').first().waitFor();}
 assert.equal(commands.includes('sync'),false);assert.equal(commands.includes('materials'),false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'.runtime/school-auto-sync-mobile.png'});
 Object.assign(result,{manualSyncRequests:0,manualMaterialRequests:0,timetableRendered:true,materialsRendered:true,horizontalOverflow:false,pageErrors:errors});assert.deepEqual(errors,[]);
 await context.request.post('http://127.0.0.1:4186/api/auth/logout',{data:{}});await context.close();
}finally{await browser.close();await writeFile('artifacts/school-auto-20261022/live-summary.json',JSON.stringify(result,null,2));}
console.log(JSON.stringify(result));
