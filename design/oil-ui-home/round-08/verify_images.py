"""Check image navigation, readable captions, reduced motion and failure recovery."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
checks=[]
with sync_playwright() as p:
 b=p.chromium.launch()
 for iteration in range(3):
  c=b.new_context(viewport={'width':393,'height':852},reduced_motion='reduce')
  a=next(a for a in json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts'] if a['email']=='student-a@example.test')
  assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
  page=c.new_page();page.goto(ORIGIN+'/v2')
  page.get_by_role('button',name='显示第 2 张校园照片',exact=True).click()
  expect(page.locator('.cw-scene>img.is-active')).to_have_attribute('alt','黄昏时的校园与水面')
  assert page.locator('.cw-scene>img.is-active').evaluate('(e)=>getComputedStyle(e).transitionDuration.split(",").every(s=>parseFloat(s)<=0.001)')
  for w in [320,393,720,1440]:
   page.set_viewport_size({'width':w,'height':852});page.goto(ORIGIN+'/v2/campus')
   title=page.locator('.cw-campus-window>span');expect(title).to_be_visible();a1=title.bounding_box();a2=page.locator('.ref-timetable-preview').bounding_box()
   assert not (a1['x']<a2['x']+a2['width'] and a1['x']+a1['width']>a2['x'] and a1['y']<a2['y']+a2['height'] and a1['y']+a1['height']>a2['y']),(w,'Campus caption overlaps timetable')
  page.set_viewport_size({'width':393,'height':852});page.goto(ORIGIN+'/v2/me')
  page.get_by_role('button',name='更换封面',exact=True).click();expect(page.get_by_role('dialog',name='选择主页封面')).to_be_visible();expect(page.locator('.ref-cover-options img')).to_have_count(4)
  page.screenshot(path=str(OUT/'cover-options-mobile.png'));page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
  page.goto(ORIGIN+'/v2/coffee');page.locator('.v2-teacher-card').first.click();expect(page.locator('.v2-coffee-teacher-detail')).to_be_visible();expect(page.locator('.v2-coffee-teacher-detail>img')).to_have_attribute('alt','校园场景')
  page.screenshot(path=str(OUT/'coffee-detail-mobile.png'))
  page.goto(ORIGIN+'/v2/community');page.locator('.reference-post-photos').first.click();expect(page.locator('.v2-social-media>img')).to_be_visible()
  assert page.locator('.v2-social-media>img').evaluate('(e)=>getComputedStyle(e).objectFit')=='contain'
  page.screenshot(path=str(OUT/'post-detail-mobile.png'));page.keyboard.press('Escape')
  # An unavailable content cover keeps its textual entry and remains navigable.
  page.route('**/*',lambda route:route.abort() if route.request.resource_type=='image' else route.continue_())
  page.goto(ORIGIN+'/v2/activities?view=manage');cover=page.locator('.activity-discovery-cover').first;cover.scroll_into_view_if_needed()
  expect(cover.locator('.discovery-text-cover')).to_contain_text('封面暂不可用')
  href=cover.get_attribute('href');cover.click();expect(page).to_have_url(ORIGIN+href)
  c.close();checks.append({'run':iteration+1,'result':'passed','checks':['manual slideshow with reduced motion','campus caption separated from courses at four widths','cover picker opens and cancels','teacher scene detail reachable','post media preserves full image','missing activity cover keeps a usable text entry']})
 c=b.new_context(viewport={'width':1440,'height':900});page=c.new_page();page.goto(ORIGIN+'/design/oil-ui-home/round-08/index.html')
 expect(page.locator('nav button')).to_have_count(15);expect(page.locator('#current')).to_be_visible()
 page.get_by_role('button',name='校园 全景与标题签',exact=True).click();expect(page.locator('#current')).to_have_attribute('src','campus-mobile.png')
 page.locator('#compare').uncheck();expect(page.locator('#old')).to_be_hidden();page.get_by_role('button',name='桌面',exact=True).click();expect(page.locator('#current')).to_have_attribute('src','campus-desktop.png')
 page.get_by_role('button',name='首页 留白相框',exact=True).click();page.locator('#compare').check();page.get_by_role('button',name='手机',exact=True).click();page.evaluate('document.fonts.ready')
 page.locator('img').evaluate_all('(es)=>Promise.all(es.map(e=>e.decode()))');page.screenshot(path=str(OUT/'gallery-desktop.png'))
 page.set_viewport_size({'width':393,'height':852});assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=str(OUT/'gallery-mobile.png'));b.close()
(OUT/'image-interaction-report.json').write_text(json.dumps({'result':'passed','runs':checks,'gallery':'15 pages; page switch, device switch and before comparison passed'},ensure_ascii=False,indent=2),encoding='utf-8')
print('Image checks: 3 runs passed; gallery passed')
