import {tx} from './i18n.js';
import { esc } from './ui.js';

/** Presentation additions only; the upstream Sports actions remain responsible for controls. */
export function decorateHuitongliCheckin(root, app, session) {
  const records = root.querySelector('.checkin-records');
  if (records) {
    const summary = document.createElement('div');
    summary.className = 'ht-record-intro';
    summary.innerHTML = `<span>MY MOVEMENT</span><h2>${tx('把坚持，留在日常里。','Keep moving, every day.')}</h2><p>${app.state.workspace.records.length} ${tx('条模拟记录 · 点击查看运动与凭证','simulated records · View workouts and evidence')}</p>`;
    records.prepend(summary);
  }
  const detail = root.querySelector('.checkin-record-detail');
  if (detail) {
    detail.classList.add('ht-record-detail');
    const summary = detail.querySelector('.checkin-detail-summary');
    if (summary) {
      summary.insertAdjacentHTML('afterbegin', `<span class="ht-eyebrow">${tx('运动档案 · 模拟数据','Workout record · Simulated data')}</span>`);
      const record = app.state.workspace.records.find(r => r.id === app.ui.checkin.selectedRecordId);
      if (record && Number.isFinite(record.actualDurationSeconds)) {
        const value = summary.querySelector('.headline-medium');
        const label = summary.querySelector('.label-medium');
        if (value) value.textContent = `${Math.floor(record.actualDurationSeconds / 60)} ${tx('分钟','min')}`;
        if (label) label.textContent = tx('运动时长','Workout duration');
        summary.insertAdjacentHTML('beforeend', `<p class="ht-detail-credit">${tx('模拟计入学时：','Simulated credited hours: ')}${typeof record.hours === 'number' ? esc(String(record.hours)) + tx(' 小时',' hours') : tx('未计入','Not credited')}</p>`);
      }
    }
  }
  if (session && ['active', 'paused', 'finished'].includes(session.phase)) {
    const tools = document.createElement('section');
    tools.className = 'ht-proof-picker';
    tools.setAttribute('aria-label', tx('添加运动凭证','Add workout evidence'));
    const busy = app.ui.checkin.finish.submitting;
    tools.innerHTML = `<div class="ht-picker-heading"><strong>${tx('留下运动的瞬间','Capture your workout')}</strong><span>${tx('仅保存在此浏览器','Stored in this browser only')}</span></div><div class="ht-file-options"><label><span aria-hidden="true">＋</span><strong>${tx('照片凭证','Photo evidence')}</strong><small>JPG / PNG / WebP</small><input type="file" accept="image/jpeg,image/png,image/webp" data-change="checkin.nativePhoto" aria-label="${tx('选择本机照片','Choose a photo')}" ${busy ? 'disabled' : ''}></label><label><span aria-hidden="true">▷</span><strong>${tx('视频凭证','Video evidence')}</strong><small>${tx('MP4 / WebM · 最长 10 秒','MP4 / WebM · Up to 10 seconds')}</small><input type="file" accept="video/mp4,video/webm" data-change="checkin.nativeVideo" aria-label="${tx('选择本机视频','Choose a video')}" ${busy ? 'disabled' : ''}></label></div><button class="ht-example" data-action="demo.proof" ${busy ? 'disabled' : ''}>${app.ui.checkin.drafts.some(d => d.id === 'huitongli-example') ? tx('示例凭证已添加','Example evidence added') : tx('使用校园示例凭证','Use campus example evidence')}</button>`;
    root.querySelector('.checkin-evidence')?.prepend(tools);
    if (session.phase !== 'finished') {
      const advance = document.createElement('button');
      advance.className = 'ht-example ht-advance';
      advance.dataset.action = 'demo.advance';
      advance.textContent = tx('演示快进 · 增加 30 分钟','Demo: add 30 minutes');
      root.querySelector('.checkin-timer-stage')?.append(advance);
      if(root.ownerDocument.body.classList.contains('ht-embedded')) {
        const evidence=root.querySelector('.checkin-evidence');
        if(evidence) {
          const disclosure=document.createElement('details');
          disclosure.className='ht-active-evidence';
          const summary=document.createElement('summary');
          summary.textContent=`${tx('添加运动凭证','Add workout evidence')}${app.ui.checkin.drafts.length?` · ${app.ui.checkin.drafts.length} ${tx('项已选','selected')}`:''}`;
          disclosure.open=Boolean(app.ui.checkin.huitongliEvidenceOpen);
          disclosure.append(summary);evidence.before(disclosure);disclosure.append(evidence);
          disclosure.addEventListener('toggle',()=>{app.ui.checkin.huitongliEvidenceOpen=disclosure.open});
        }
      }
    } else {
      const steps = document.createElement('ol');
      steps.className = 'ht-proof-steps';
      steps.setAttribute('aria-label', tx('完成记录步骤','Complete workout record'));
      steps.innerHTML = `<li>${tx('01 核对运动','01 Review workout')}</li><li>${tx('02 添加凭证','02 Add evidence')}</li><li>${tx('03 填写说明','03 Add description')}</li>`;
      root.querySelector('.checkin-finish-heading')?.after(steps);
    }
  }
  root.querySelectorAll('.checkin-record-row').forEach(button => {
    const record = app.state.workspace.records.find(r => r.id === button.dataset.recordId);
    if (record) button.setAttribute('aria-label', `${record.sportType}，${record.businessDate || record.submittedAt} ${tx('查看详情','View details')}`);
  });
}

export function sampleEvidence() {
  return { name: '校园运动示例.jpg', fileName: '校园运动示例.jpg', type: 'image', source: '/student/huitongli-demo-campus.jpg' };
}

export function safePreviewHtml(source, type) {
  // Local mock media only. Do not turn record content into arbitrary network requests.
  if (!/^(?:blob:|data:(?:image|video)\/|\/student\/huitongli-demo-campus\.jpg$)/.test(source || '')) return `<p>${tx('该凭证没有可用的本机预览。','No local preview is available for this evidence.')}</p>`;
  return type === 'video' ? `<video class="demo-media" controls playsinline src="${esc(source)}"></video>` : `<img class="demo-media" alt="${tx('运动凭证预览','Workout evidence preview')}" src="${esc(source)}">`;
}
