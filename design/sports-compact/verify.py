"""Exercise the compact Sports page against isolated local acceptance accounts and browser storage."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
account=next(a for a in json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts'] if a['email']=='student-a@example.test')
report={'runs':[],'errors':[],'geometry':[]}
def toolbar(page,width):
 page.set_viewport_size({'width':width,'height':852});page.evaluate('document.fonts.ready');page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
 target=page.locator('.v2-floating-timetable-trigger')
 if target.is_visible() and width<=760:
  a=target.bounding_box()
  for node in page.locator('.movement-page-header h1,.movement-page-header nav>button,.movement-page-header nav>a').all():
   if node.is_visible():
    b=node.bounding_box();assert not(a['x']<b['x']+b['width'] and a['x']+a['width']>b['x'] and a['y']<b['y']+b['height'] and a['y']+a['height']>b['y']),(width,'Toolbar overlap',a,b)
with sync_playwright() as p:
 browser=p.chromium.launch()
 for run in range(3):
  c=browser.new_context(viewport={'width':393,'height':852},reduced_motion='reduce')
  c.add_init_script("""const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='huitongli.sports.demo.records.v1'&&window.__failSportsSave)throw new DOMException('Local check: full storage','QuotaExceededError');return set.call(this,k,v)}""")
  assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':account['email'],'password':account['password']}).ok
  page=c.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)));writes=[];page.on('request',lambda r:writes.append(r.url) if '/api/commands' in r.url else None)
  page.goto(ORIGIN+'/v2/sports');frame=page.frame_locator('iframe[title="会同里运动打卡模拟"]')
  expect(page.locator('.movement-hours strong')).to_have_text('16');expect(frame.get_by_role('button',name='开始运动',exact=True)).to_be_visible();expect(page.locator('.movement-records')).to_have_count(0)
  for width in [320,393,582,720,1440]:toolbar(page,width)
  page.set_viewport_size({'width':393,'height':852});expect(frame.locator('.checkin-cta[data-action="checkin.start"]')).to_be_visible()
  if run==0:
   page.evaluate('document.fonts.ready');page.screenshot(path=str(OUT/'mobile.png'),full_page=True)
   frame_page=page.frames[1];r=frame.get_by_role('button',name='开始运动',exact=True).bounding_box();nav=page.locator('.v2-mobile-nav').bounding_box() if page.locator('.v2-mobile-nav').count() else {'y':788}
   assert r['y']+r['height']<=nav['y'],('Start button is below mobile navigation',r,nav)
   report['mobileHeight']=page.locator('.movement-page').evaluate('(e)=>e.scrollHeight');page.set_viewport_size({'width':1440,'height':900});page.screenshot(path=str(OUT/'desktop.png'),full_page=True);page.set_viewport_size({'width':720,'height':450});page.evaluate('document.fonts.ready');assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=str(OUT/'zoom-desktop.png'));page.set_viewport_size({'width':393,'height':852})
  # One entry, two source views, full synchronized list and record detail.
  page.get_by_role('button',name='运动记录',exact=True).click();expect(frame.locator('.checkin-records')).to_be_visible()
  for width in [320,393,720]:toolbar(page,width)
  page.set_viewport_size({'width':393,'height':852})
  if run==0:page.screenshot(path=str(OUT/'records-local-mobile.png'),full_page=True)
  frame.locator('.checkin-record-row').first.click();expect(frame.locator('.ht-record-detail')).to_be_visible()
  frame.locator('[data-action="checkin.openProof"]').first.click();expect(frame.get_by_role('dialog',name='运动凭证')).to_be_visible();frame.get_by_role('button',name='关闭',exact=True).click()
  page.get_by_role('button',name='返回运动',exact=True).click();expect(frame.get_by_role('button',name='开始运动',exact=True)).to_be_visible();expect(frame.locator('.ht-record-detail')).to_have_count(0)
  page.get_by_role('button',name='运动记录',exact=True).click();page.get_by_role('button',name='平台同步',exact=True).click();expect(page.locator('.movement-record')).to_have_count(8);assert page.get_by_role('button',name='查看全部 8 条记录',exact=True).count()==0
  if run==0:page.screenshot(path=str(OUT/'records-synced-mobile.png'),full_page=True)
  for width in [320,393,720]:toolbar(page,width)
  page.get_by_role('button',name='待处理',exact=True).click();expect(page.locator('.movement-record')).to_have_count(1);page.locator('.movement-record').first.click();expect(page.get_by_role('dialog',name='运动记录详情')).to_be_visible();page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
  page.get_by_role('button',name='返回运动',exact=True).click();expect(frame.get_by_role('button',name='开始运动',exact=True)).to_be_visible();page.set_viewport_size({'width':393,'height':852})
  # Selection and disclosure keep their existing handlers.
  frame.get_by_role('button',name='自主运动',exact=True).click();frame.get_by_role('button',name='更换运动项目',exact=True).click();expect(frame.get_by_role('dialog',name='选择运动项目')).to_be_visible();frame.get_by_role('button',name='选好了',exact=True).click();frame.get_by_role('button',name='课程相关',exact=True).click()
  frame.locator('details[data-checkin-disclosure="requirements"] summary').click();expect(frame.locator('details[data-checkin-disclosure="requirements"]')).to_have_attribute('open','');frame.locator('details[data-checkin-disclosure="requirements"] summary').click()
  frame.get_by_role('button',name='开始运动',exact=True).click();expect(frame.get_by_role('dialog',name='健康安全提醒')).to_be_visible();frame.get_by_role('button',name='我知道了',exact=True).click();expect(frame.get_by_role('button',name='暂停运动',exact=True)).to_be_visible();expect(page.locator('.movement-progress')).to_have_count(0);expect(page.get_by_role('button',name='运动记录',exact=True)).to_have_count(0)
  if run==0:page.screenshot(path=str(OUT/'active-mobile.png'))
  frame.locator('.ht-active-evidence>summary').click();expect(frame.get_by_role('button',name='使用校园示例凭证',exact=True)).to_be_visible();frame.locator('.ht-active-evidence>summary').click();expect(frame.get_by_role('button',name='使用校园示例凭证',exact=True)).not_to_be_visible()
  frame.get_by_role('button',name='演示快进 · 增加 30 分钟',exact=True).click();frame.get_by_role('button',name='暂停运动',exact=True).click();expect(frame.get_by_role('button',name='继续运动',exact=True)).to_be_visible()
  frame.get_by_role('slider',name='向右滑动结束运动',exact=True).press('End');expect(frame.locator('textarea[data-input="checkin.description"]')).to_be_visible()
  if run==0:page.screenshot(path=str(OUT/'finish-mobile.png'))
  frame.get_by_role('button',name='使用校园示例凭证',exact=True).click();description=frame.locator('textarea[data-input="checkin.description"]');description.fill('本地界面验收：模拟运动与凭证，仅在隔离浏览器保存。')
  # Simulated storage failure must keep both description and evidence.
  iframe_page=page.frames[1];iframe_page.evaluate('window.__failSportsSave=true');frame.locator('[data-action="checkin.submit"]').click();expect(frame.get_by_role('dialog',name='本机保存空间不足')).to_be_visible();frame.get_by_role('button',name='关闭',exact=True).click();expect(description).to_have_value('本地界面验收：模拟运动与凭证，仅在隔离浏览器保存。');expect(frame.locator('[data-action="demo.proof"]')).to_contain_text('已添加')
  iframe_page.evaluate('window.__failSportsSave=false');frame.locator('[data-action="checkin.submit"]').click();expect(frame.locator('.checkin-submitted')).to_be_visible();page.reload();expect(frame.locator('.checkin-submitted')).to_be_visible();frame.locator('[data-action="checkin.viewRecords"]').click();expect(page.locator('.movement-page')).to_have_attribute('data-movement-view','records');expect(frame.locator('.checkin-record-row')).to_have_count(4)
  assert not writes,'Unexpected backend business writes from sports UI';c.close();report['runs'].append({'run':run+1,'result':'passed','checks':['Single records entry and 2 source views','All 8 synchronized records, filter/detail/Escape','Local record proof and return to exercise','Toolbar at 320/393/582/720/1440','Course/sport selector and requirements','Start/pause/end; progress removed during session','Local save failure keeps evidence and description','Saved record reloads and is readable','No backend business commands']})
 # Unknown progress and transient API failure stay distinguishable from zero.
 c=browser.new_context(viewport={'width':393,'height':852},reduced_motion='reduce');assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':account['email'],'password':account['password']}).ok
 data=c.request.get(ORIGIN+'/api/workspace').json();page=c.new_page();unknown={**data,'entities':[{**e,'data':{**e['data'],'previewFixture':False}} if e['kind']=='profile' else e for e in data['entities']],'sports':None,'sportsStatus':'unavailable','sportsDashboard':None}
 page.route('**/api/workspace',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(unknown)));page.goto(ORIGIN+'/v2/sports');expect(page.locator('.movement-badge')).to_have_text('暂不可用');expect(page.locator('.movement-hours strong')).to_have_text('—');assert page.get_by_role('progressbar').get_attribute('aria-valuenow') is None;page.screenshot(path=str(OUT/'unknown-mobile.png'))
 page.unroute('**/api/workspace');page.get_by_role('button',name='同步体育进度',exact=True).click();expect(page.locator('.movement-hours strong')).to_have_text('16');page.route('**/api/workspace',lambda r:r.fulfill(status=503,content_type='application/json',body=json.dumps({'message':'本地检查：同步暂不可用'})));page.get_by_role('button',name='同步体育进度',exact=True).click();expect(page.get_by_role('alert')).to_contain_text('同步暂不可用');page.unroute('**/api/workspace');page.get_by_role('button',name='同步体育进度',exact=True).click();expect(page.get_by_role('alert')).to_have_count(0)
 page.get_by_role('button',name='运动记录',exact=True).click();page.get_by_role('button',name='返回运动',exact=True).click();page.get_by_role('button',name='运动记录',exact=True).click();expect(page.frame_locator('iframe').locator('.checkin-records')).to_be_visible();report['navigation']='Rapid records / return / records keeps the final selected view'
 c.close();browser.close()
assert not report['errors'];report['result']='passed';report['states']='Unknown progress, refresh error and retry passed';(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
