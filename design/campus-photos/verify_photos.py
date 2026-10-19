"""Verify expanded photography and current image navigation using local acceptance data."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
new=json.loads((OUT/'sources.json').read_text(encoding='utf-8'))['selected']
alts=['树荫下的校园建筑','黄昏时的校园与水面','校园公共空间与建筑']+[x['alt'] for x in new]
account=next(x for x in json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts'] if x['email']=='student-a@example.test')
report={'runs':[],'page_errors':[],'photos':12,'new_photos':9}
with sync_playwright() as p:
 b=p.chromium.launch()
 for run in range(3):
  c=b.new_context(viewport={'width':393,'height':852},reduced_motion='reduce');assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':account['email'],'password':account['password']}).ok
  page=c.new_page();page.on('pageerror',lambda e:report['page_errors'].append(str(e)));page.clock.install();page.goto(ORIGIN+'/v2')
  expect(page.locator('a.cw-next')).to_be_visible();page.evaluate('document.fonts.ready')
  for i,alt in enumerate(alts):
   expect(page.locator('.cw-scene>img.is-active')).to_have_attribute('alt',alt)
   page.wait_for_function('document.querySelector(".cw-scene>img.is-active")?.complete && document.querySelector(".cw-scene>img.is-active")?.naturalWidth>0')
   page.locator('.cw-scene>img.is-active').evaluate('(e)=>e.decode()');page.clock.run_for(50)
   assert page.locator('.cw-scene>img.is-active').evaluate('(e)=>Number(getComputedStyle(e).opacity)>=0.99')
   expect(page.locator('.cw-photo-count')).to_have_text(f'{i+1} / 12');assert page.locator('.cw-scene>img').count()==3
   if run==0:page.locator('.cw-window').screenshot(path=str(OUT/f'slide-{i+1:02d}-mobile.png'))
   page.get_by_role('button',name='下一张校园照片',exact=True).click()
  expect(page.locator('.cw-photo-count')).to_have_text('1 / 12')
  page.get_by_role('button',name='上一张校园照片',exact=True).click();expect(page.locator('.cw-photo-count')).to_have_text('12 / 12')
  page.clock.fast_forward(15000);expect(page.locator('.cw-photo-count')).to_have_text('12 / 12');assert page.get_by_role('button',name='播放校园照片轮播').count()==0
  for w in [320,393,582,720,1440]:
   page.set_viewport_size({'width':w,'height':852});assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   scene=page.locator('.cw-scene').bounding_box();controls=page.locator('.cw-photo-controls').bounding_box();assert controls['x']>=scene['x'] and controls['x']+controls['width']<=scene['x']+scene['width']+1
  if run==0:
   page.set_viewport_size({'width':393,'height':852})
   for _ in range(4):page.get_by_role('button',name='下一张校园照片',exact=True).click()
   page.wait_for_function('document.querySelector(".cw-scene>img.is-active")?.complete && document.querySelector(".cw-scene>img.is-active")?.naturalWidth>0')
   page.locator('.cw-scene>img.is-active').evaluate('(e)=>e.decode()');page.clock.run_for(50)
   page.screenshot(path=str(OUT/'home-mobile.png'));page.set_viewport_size({'width':1440,'height':900});page.screenshot(path=str(OUT/'home-desktop.png'))
  c.close();report['runs'].append({'run':run+1,'result':'passed','checks':['12 images decode and cycle','first/last wrap both directions','only current and two adjacent images mounted','reduced motion does not auto advance','controls fit at 320/393/582/720/1440']})
 # Normal motion: timer is checked with a virtual clock, without sleeping through intervals.
 c=b.new_context(viewport={'width':393,'height':852});assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':account['email'],'password':account['password']}).ok
 page=c.new_page();page.clock.install();page.goto(ORIGIN+'/v2');expect(page.get_by_role('button',name='暂停校园照片轮播')).to_be_visible();page.get_by_role('button',name='暂停校园照片轮播').click();page.clock.fast_forward(13000);expect(page.locator('.cw-photo-count')).to_have_text('1 / 12')
 page.get_by_role('button',name='播放校园照片轮播').click();page.clock.fast_forward(6500);expect(page.locator('.cw-photo-count')).to_have_text('2 / 12');page.get_by_role('button',name='下一张校园照片').click();page.clock.fast_forward(13000);expect(page.locator('.cw-photo-count')).to_have_text('3 / 12');c.close()
 report['normal_motion']='pause/resume and manual navigation pauses autoplay: passed'
 c=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');page=c.new_page();page.goto(ORIGIN+'/design/campus-photos/index.html');expect(page.locator('.grid article')).to_have_count(12)
 page.get_by_role('button',name='湖景',exact=True).click();expect(page.locator('.grid article:visible')).to_have_count(1);page.get_by_role('button',name='查看湖畔建筑与远山',exact=True).click();expect(page.get_by_role('dialog')).to_be_visible();page.get_by_role('button',name='下一张',exact=True).click();expect(page.locator('dialog .full')).to_have_attribute('alt',new[1]['alt']);page.keyboard.press('Escape');expect(page.get_by_role('dialog')).not_to_be_visible()
 page.get_by_role('button',name='全部',exact=True).click();page.evaluate('document.fonts.ready');page.locator('.grid img').evaluate_all('(es)=>Promise.all(es.map(e=>e.decode()))');page.screenshot(path=str(OUT/'gallery-desktop.png'),full_page=True);page.set_viewport_size({'width':393,'height':852});assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=str(OUT/'gallery-mobile.png'));b.close()
report['gallery']='12 images; category filter, full image, next image, Escape, responsive: passed'
assert not report['page_errors'];report['result']='passed';(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
