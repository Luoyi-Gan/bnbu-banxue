import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/23328/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out='artifacts/partner-create-simple-20261022',base='http://127.0.0.1:4174';
const accounts=JSON.parse(await fs.readFile('data/browser-acceptance-accounts.json','utf8')).accounts;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:430,height:932},reducedMotion:'reduce'});
try {
 const a=accounts.find(a=>a.roles.includes('student'));
 assert((await context.request.post(base+'/api/auth/sign-in',{data:{identifier:a.email,password:a.password},headers:{Origin:base}})).ok());
 const page=await context.newPage();await page.goto(base+'/v2/partners',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'发起组队',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'发起组队',exact:true}),summary=dialog.locator('summary'),options=dialog.locator('details');
 const checks=[];
 for(const width of [430,320,1440]) {
  await page.setViewportSize({width,height:932});
  assert.equal(await dialog.locator('input:visible').count(),2);
  assert.equal(await options.getAttribute('open'),null);
  const dims=await dialog.evaluate(el=>({overflow:el.scrollWidth>el.clientWidth,footer:el.querySelector('.v2-form-actions').getBoundingClientRect().bottom,bottom:el.getBoundingClientRect().bottom,scrollHeight:el.querySelector('.student-utility-content').scrollHeight,clientHeight:el.querySelector('.student-utility-content').clientHeight}));
  assert(!dims.overflow);assert(dims.footer<=dims.bottom+1);
  checks.push({width,...dims});await page.screenshot({path:`${out}/study-${width}.png`});
 }
 await page.setViewportSize({width:430,height:932});
 let submitted;
 await page.route('**/api/commands',route=>{submitted=route.request().postDataJSON();return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'暂时无法保存，请重试。'})})});
 await dialog.locator('[name=courseCode]').fill('计算机科学导论');await dialog.locator('[name=goal]').fill('找两位队友一起完成期末项目');
 await dialog.getByRole('button',{name:'发布学习队伍',exact:true}).click();await dialog.getByRole('alert').waitFor();
 assert.equal(submitted.input.title,'计算机科学导论 组队');assert.equal(submitted.input.capacity,4);assert.equal(submitted.input.time,'时间待商定');assert.equal(submitted.input.place,'校园 / 线上协商');
 assert.equal(await dialog.locator('[name=courseCode]').inputValue(),'计算机科学导论');
 await summary.focus();await page.keyboard.press('Enter');assert.notEqual(await options.getAttribute('open'),null);
 await dialog.locator('[name=capacity]').fill('5');await dialog.getByRole('textbox',{name:'自定义讨论地点',exact:true}).fill('图书馆二楼靠窗区');await dialog.locator('[name=gpaMin]').fill('3');
 await summary.click();await dialog.getByRole('button',{name:'发布学习队伍',exact:true}).click();
 await dialog.getByRole('alert').filter({hasText:'请同时填写绩点区间'}).waitFor();assert.notEqual(await options.getAttribute('open'),null);
 await dialog.locator('[name=gpaMax]').fill('4');await summary.click();
 await dialog.getByRole('button',{name:'发布学习队伍',exact:true}).click();await dialog.getByRole('alert').filter({hasText:'暂时无法保存'}).waitFor();
 assert.equal(submitted.input.capacity,5);assert.equal(submitted.input.place,'图书馆二楼靠窗区');assert.equal(submitted.input.details.gpaMin,3);assert.equal(submitted.input.details.gpaMax,4);
 await summary.click();assert.equal(await dialog.locator('[name=capacity]').inputValue(),'5');assert.equal(await dialog.getByRole('textbox',{name:'自定义讨论地点',exact:true}).inputValue(),'图书馆二楼靠窗区');
 // Invalid collapsed optional controls must be revealed before browser validation focuses them.
 await dialog.locator('[name=capacity]').fill('99');await summary.click();await dialog.getByRole('button',{name:'发布学习队伍',exact:true}).click();assert.notEqual(await options.getAttribute('open'),null);await dialog.locator('[name=capacity]').fill('5');
 await page.screenshot({path:`${out}/study-options.png`});
 for(const [name,kind] of [['拼车','carpool'],['娱乐','entertainment'],['运动','sport']]) {
  await dialog.getByRole('button',{name,exact:true}).click();assert.equal(await options.getAttribute('open'),null);assert.equal(await dialog.locator('textarea:visible').count(),0);
  await page.screenshot({path:`${out}/${kind}.png`});await summary.click();assert(await dialog.locator('textarea').isVisible());
 }
 await fs.writeFile(`${out}/checks.json`,JSON.stringify({viewports:checks,minimalSubmit:true,optionalValuesPreserved:true,gpaErrorRevealsOptions:true,nativeInvalidRevealsOptions:true,keyboardToggle:true,failedSubmitPreservesInput:true,otherTypesFolded:true},null,2));
 console.log('PASS: minimal publish payload, defaults, folding, validation, failure recovery, keyboard, 3 widths and all categories');
} finally {await browser.close()}
