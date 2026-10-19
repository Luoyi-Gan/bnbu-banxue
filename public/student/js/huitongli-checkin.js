// Direct reuse of the bundled BNBU Sports screen. This adapter never enables API mode.
import {renderCheckIn,checkinActions,checkinTick,restoreCheckinContinuity,attachDraftVideoPreview} from './screens/checkin.js';
import {connectSlideEnd} from './checkin-slide-end.js';
import {buildLocalPreviewWorkspace} from './local-preview.js';
import {loadSession,saveSession,formatTimer} from './session.js';
import {clearProofDrafts} from './checkin-drafts.js';
import {esc} from './ui.js';
import {decorateHuitongliCheckin,sampleEvidence,safePreviewHtml} from './huitongli-presentation.js';
import {SPORT_OPTIONS} from './sports-catalog.js';
const owner='HUITONGLI-SPORTS-DEMO-V1', recordsKey='huitongli.sports.demo.records.v1';
const workspace=buildLocalPreviewWorkspace();
workspace.student.id=owner;workspace.student.localOwnerId=owner;workspace.student.name='会同里同学';
workspace.checkInTimeWindow={...workspace.checkInTimeWindow,dateRangeStart:'2020-01-01',dateRangeEnd:'2099-12-31',semesterDeadline:'2099-12-31'};
let saved=[];try{saved=JSON.parse(localStorage.getItem(recordsKey)||'[]')}catch{/* Keep fixtures if storage is unavailable. */}
workspace.records.forEach(record=>{record.proofFiles=[sampleEvidence()];record.proofPhotoCount=1;record.proofVideoCount=0;record.proofSummary='校园示例凭证';});
workspace.records=[...(Array.isArray(saved)?saved:[]),...workspace.records];
const viewport=document.getElementById('huitongli-checkin');
const embedded=new URLSearchParams(location.search).get('compact')==='1';
document.body.classList.toggle('ht-embedded',embedded);
if(embedded)document.querySelector('.demo-notice').textContent='本机模拟 · 不计入真实学时';
function dialogHtml(d){return `<div class="dialog-scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(d.title||'提示')}"><h2 class="dialog-title">${esc(d.title||'提示')}</h2>${d.body?`<p class="dialog-body">${esc(d.body)}</p>`:''}${d.contentHtml||''}<div class="dialog-actions">${(d.buttons||[{label:'关闭',action:'dialog.close'}]).map(b=>`<button class="text-btn" data-action="${esc(b.action)}">${esc(b.label)}</button>`).join('')}</div></section></div>`}
const app={
 state:{workspace,authenticated:true,dialog:null},ui:{},overlay:{healthReminderAck:false},_viewport:viewport,
 isApiMode:()=>false,isLocalPreview:()=>true,isWriteAllowed:()=>true,hasActiveEnrollment:()=>true,screenKey:()=> 'tab-checkin',saveOverlay(){},
 selectTab(){this.ui.checkin.tab='exercise';this.render()},
 showDialog(d){this.state.dialog=d;this.render()},closeDialog(){this.state.dialog=null;this.render()},
 render(){
  const active=loadSession(owner);if(active&&['active','paused'].includes(active.phase)&&!active.maximumDurationSeconds){active.maximumDurationSeconds=7200;saveSession(owner,active)}
  viewport.innerHTML=renderCheckIn(this).replaceAll('审核阶段暂不可用','模拟 · 未送审').replaceAll('预计计入','模拟预计时长').replaceAll('提交打卡','保存模拟记录').replaceAll('确认提交后才上传','确认后保存为本机模拟记录').replaceAll('现场照片','运动照片').replace('提交成功','模拟提交完成').replace('记录已提交，审核状态与计入时长请查看打卡记录。','已生成本机模拟记录，不送交审核、不计入真实学时。')+(this.state.dialog?dialogHtml(this.state.dialog):'');
  const session=loadSession(owner);
  decorateHuitongliCheckin(viewport,this,session);
  attachDraftVideoPreview(this);
  viewport.querySelector('.dialog button')?.focus();
  if(embedded)parent.postMessage({type:'huitongli-checkin-view',tab:this.ui.checkin?.tab||'exercise',phase:session?.phase||'idle'},location.origin);
 }
};
const actions={...checkinActions,
 'dialog.close':a=>a.closeDialog(),
 'demo.advance':a=>{const s=loadSession(owner);if(!s||!['active','paused'].includes(s.phase))return;s.accumulatedMs+=1800000;saveSession(owner,s);a.render()},
 'demo.proof':a=>{if(a.ui.checkin.drafts.filter(d=>d.type==='image').length>=6||a.ui.checkin.drafts.some(d=>d.id==='huitongli-example'))return;a.ui.checkin.drafts.push({id:'huitongli-example',type:'image',name:'校园运动示例.jpg',url:'/student/huitongli-demo-campus.jpg',size:0});a.render()},
 'checkin.openProof':(a,el)=>a.showDialog({title:'运动凭证',contentHtml:safePreviewHtml(el.dataset.source,el.dataset.type)}),
 'checkin.submit':async a=>{
  const s=loadSession(owner),ui=a.ui.checkin;if(!s||s.phase!=='finished'||ui.finish.submitting)return;
  if(!ui.drafts.length||!s.details.description?.trim()){a.showDialog({title:'完善运动记录',body:'请添加至少一个凭证并填写运动说明。'});return}
  ui.finish.submitting=true;a.render();
  const proofFiles=await Promise.all(ui.drafts.map(async d=>({name:d.name||'运动凭证',fileName:d.name||'运动凭证',type:d.type==='video'?'video':'image',source:d.blob?await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(d.blob)}):d.url})));
  const record={...workspace.records.find(r=>r.id==='preview-record-valid-course'),id:crypto.randomUUID(),businessDate:new Date().toLocaleDateString('sv-SE'),sessionId:null,sportCode:s.details.sportType,serverStatus:'SUBMITTED',reviewResult:null,reviewPublicComment:'本机模拟记录，未送交审核',teacherPublicFeedback:null,hours:null,creditType:s.details.creditType,sportType:s.details.customSportName||SPORT_OPTIONS.find(o=>o.value===s.details.sportType)?.zh||s.details.sportType,submittedAt:new Date().toLocaleString('sv-SE'),startTime:new Date(s.startedAt).toISOString(),endTime:new Date(s.endedAt).toISOString(),actualDurationSeconds:Math.floor(s.activeDurationMillis/1000),note:s.details.description,proofFiles,proofPhotoCount:proofFiles.filter(p=>p.type==='image').length,proofVideoCount:proofFiles.filter(p=>p.type==='video').length,proofSummary:'本机模拟凭证'};
  const next=[record,...saved].slice(0,20);
  try{localStorage.setItem(recordsKey,JSON.stringify(next));saved=next}catch{ui.finish.submitting=false;a.showDialog({title:'本机保存空间不足',body:'请减少凭证大小后重试。记录尚未提交。'});return}
  workspace.records.unshift(record);s.phase='submitted';s.summary={duration:formatTimer(s.activeDurationMillis),sportType:record.sportType,creditType:s.details.creditType==='course'?'课程运动':'自主运动'};saveSession(owner,s);ui.drafts=[];ui.finish.submitting=false;await clearProofDrafts(owner,'pending').catch(()=>{});a.render();
 }
};
app.actions=actions;
connectSlideEnd(viewport,app);
for(const [eventName,attr] of [['click','action'],['input','input'],['change','change']])viewport.addEventListener(eventName,event=>{
 const el=event.target.closest(`[data-${attr}]`);if(!el||el.disabled)return;
 const handler=actions[el.dataset[attr]];if(handler)Promise.resolve().then(()=>handler(app,el,event)).then(()=>{if(embedded)parent.postMessage({type:'huitongli-checkin-view',navigation:true,tab:app.ui.checkin?.tab||'exercise',phase:loadSession(owner)?.phase||'idle'},location.origin)}).catch(error=>{if(app.ui.checkin)app.ui.checkin.finish.submitting=false;app.showDialog({title:'操作未完成',body:error.message||'请重试'});});
});
window.addEventListener('keydown',event=>{
 if(!app.state.dialog)return;
 if(event.key==='Escape'&&app.state.dialog.dismissible!==false)app.closeDialog();
 if(event.key==='Tab'){
  const elements=[...viewport.querySelectorAll('.dialog button,.dialog video')],first=elements[0],last=elements.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
 }
});
window.addEventListener('message',event=>{
 if(!embedded||event.origin!==location.origin||event.source!==parent||event.data?.type!=='huitongli-checkin-select-view'||!['exercise','records'].includes(event.data.tab))return;
 if(event.data.tab==='exercise'&&app.ui.checkin)app.ui.checkin.selectedRecordId=null;
 if(app.ui.checkin?.tab===event.data.tab)return;
 // Reuse the existing tab action so record filters and the current session retain their normal behavior.
 const control=document.createElement('button');control.dataset.tab=event.data.tab;actions['checkin.tab'](app,control);
});
app.render();restoreCheckinContinuity(app).then(()=>app.render());
setInterval(()=>checkinTick(app),1000);
const resizeObserver=new ResizeObserver(()=>parent.postMessage({type:'huitongli-checkin-height',height:Math.ceil(viewport.getBoundingClientRect().height+document.querySelector('.demo-notice').getBoundingClientRect().height+4)},location.origin));
resizeObserver.observe(viewport);
resizeObserver.observe(document.querySelector('.demo-notice'));
