import { esc } from './ui.js';

/** Presentation additions only; the upstream Sports actions remain responsible for controls. */
export function decorateHuitongliCheckin(root, app, session) {
  const records = root.querySelector('.checkin-records');
  if (records) {
    const summary = document.createElement('div');
    summary.className = 'ht-record-intro';
    summary.innerHTML = `<span>MY MOVEMENT</span><h2>把坚持，留在日常里。</h2><p>${app.state.workspace.records.length} 条模拟记录 · 点击查看运动与凭证</p>`;
    records.prepend(summary);
  }
  const detail = root.querySelector('.checkin-record-detail');
  if (detail) {
    detail.classList.add('ht-record-detail');
    const summary = detail.querySelector('.checkin-detail-summary');
    if (summary) {
      summary.insertAdjacentHTML('afterbegin', '<span class="ht-eyebrow">运动档案 · 模拟数据</span>');
      const record = app.state.workspace.records.find(r => r.id === app.ui.checkin.selectedRecordId);
      if (record && Number.isFinite(record.actualDurationSeconds)) {
        const value = summary.querySelector('.headline-medium');
        const label = summary.querySelector('.label-medium');
        if (value) value.textContent = `${Math.floor(record.actualDurationSeconds / 60)} 分钟`;
        if (label) label.textContent = '运动时长';
        summary.insertAdjacentHTML('beforeend', `<p class="ht-detail-credit">模拟计入学时：${typeof record.hours === 'number' ? esc(String(record.hours)) + ' 小时' : '未计入'}</p>`);
      }
    }
  }
  if (session && ['active', 'paused', 'finished'].includes(session.phase)) {
    const tools = document.createElement('section');
    tools.className = 'ht-proof-picker';
    tools.setAttribute('aria-label', '添加运动凭证');
    const busy = app.ui.checkin.finish.submitting;
    tools.innerHTML = `<div class="ht-picker-heading"><strong>留下运动的瞬间</strong><span>仅保存在此浏览器</span></div><div class="ht-file-options"><label><span aria-hidden="true">＋</span><strong>照片凭证</strong><small>JPG / PNG / WebP</small><input type="file" accept="image/jpeg,image/png,image/webp" data-change="checkin.nativePhoto" aria-label="选择本机照片" ${busy ? 'disabled' : ''}></label><label><span aria-hidden="true">▷</span><strong>视频凭证</strong><small>MP4 / WebM · 最长 10 秒</small><input type="file" accept="video/mp4,video/webm" data-change="checkin.nativeVideo" aria-label="选择本机视频" ${busy ? 'disabled' : ''}></label></div><button class="ht-example" data-action="demo.proof" ${busy ? 'disabled' : ''}>${app.ui.checkin.drafts.some(d => d.id === 'huitongli-example') ? '示例凭证已添加' : '使用校园示例凭证'}</button>`;
    root.querySelector('.checkin-evidence')?.prepend(tools);
    if (session.phase !== 'finished') {
      const advance = document.createElement('button');
      advance.className = 'ht-example ht-advance';
      advance.dataset.action = 'demo.advance';
      advance.textContent = '演示快进 · 增加 30 分钟';
      root.querySelector('.checkin-timer-stage')?.append(advance);
    } else {
      const steps = document.createElement('ol');
      steps.className = 'ht-proof-steps';
      steps.setAttribute('aria-label', '完成记录步骤');
      steps.innerHTML = '<li>01 核对运动</li><li>02 添加凭证</li><li>03 填写说明</li>';
      root.querySelector('.checkin-finish-heading')?.after(steps);
    }
  }
  root.querySelectorAll('.checkin-record-row').forEach(button => {
    const record = app.state.workspace.records.find(r => r.id === button.dataset.recordId);
    if (record) button.setAttribute('aria-label', `${record.sportType}，${record.businessDate || record.submittedAt}，查看详情`);
  });
}

export function sampleEvidence() {
  return { name: '校园运动示例.jpg', fileName: '校园运动示例.jpg', type: 'image', source: '/student/huitongli-demo-campus.jpg' };
}

export function safePreviewHtml(source, type) {
  // Local mock media only. Do not turn record content into arbitrary network requests.
  if (!/^(?:blob:|data:(?:image|video)\/|\/student\/huitongli-demo-campus\.jpg$)/.test(source || '')) return '<p>该凭证没有可用的本机预览。</p>';
  return type === 'video' ? `<video class="demo-media" controls playsinline src="${esc(source)}"></video>` : `<img class="demo-media" alt="运动凭证预览" src="${esc(source)}">`;
}
