"""Read-only local staff portal visual verification using isolated acceptance accounts."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
ROUTES={'teacher':['coffee','schedule','messages','profile','sports'],'admin':['','verifications','moderation','keywords','mail-activities']}
def run(baseline=False):
 accounts=json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts']
 report={'scope':'Local acceptance data; no saved forms or decisions','routes':[],'overlays':[],'page_errors':[],'overflow':[]}
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for role,routes in ROUTES.items():
   context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
   a=next(a for a in accounts if a['email']==role+'@example.test')
   assert context.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
   page=context.new_page();page.on('pageerror',lambda e:report['page_errors'].append(str(e)))
   def shot(name):
    page.evaluate('document.fonts.ready');page.screenshot(path=str(OUT/f'{"baseline-" if baseline else ""}{role}-{name}.png'))
   for path in routes:
    url=f'/v2/{role}'+('/'+path if path else '')
    page.goto(ORIGIN+url);expect(page.locator('.v2-app')).to_be_visible();expect(page).to_have_url(ORIGIN+url)
    page.wait_for_function('!document.querySelector(".v2-main").innerText.includes("正在读取")')
    for label,w,h in ([('desktop',1440,900)] if baseline else [('desktop',1440,900),('mobile',390,844),('narrow',320,780),('zoom',720,450)]):
     page.set_viewport_size({'width':w,'height':h})
     if not baseline:
      expect(page.locator('.v2-app-staff')).to_be_visible()
      if page.evaluate('document.documentElement.scrollWidth>innerWidth'):
       report['overflow'].append({'route':url,'size':label,'elements':page.locator('.v2-main').evaluate('(n)=>Array.from(n.querySelectorAll("*")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className).slice(0,12)')})
     if label in ('desktop','mobile'):shot((path or 'overview')+'-'+label)
    report['routes'].append(url)
   if baseline:context.close();continue
   page.set_viewport_size({'width':390,'height':844})
   if role=='teacher':
    page.goto(ORIGIN+'/v2/teacher/coffee')
    page.get_by_role('button',name='开放时段',exact=True).click()
    expect(page.get_by_role('heading',name='新增开放时段')).to_be_visible()
    shot('slots-form')
    report['overlays'].append('Teacher slot form and bookings tabs')
    page.get_by_role('button',name='预约学生',exact=True).click()
    if page.get_by_role('button',name='取消预约',exact=True).count():
     for name in ['取消预约','提出改期']:
      page.get_by_role('button',name=name,exact=True).first.click()
      dialog=page.get_by_role('dialog',name=name,exact=True);expect(dialog).to_be_visible()
      for w,h in [(390,844),(1440,900),(320,780),(720,450)]:
       page.set_viewport_size({'width':w,'height':h});r=dialog.bounding_box();assert r['x']>=-1 and r['x']+r['width']<=w+1 and r['y']>=-1 and r['y']+r['height']<=h+1
      page.set_viewport_size({'width':390,'height':844});shot('cancel-dialog' if name=='取消预约' else 'move-dialog');page.keyboard.press('Escape');expect(dialog).to_have_count(0)
      report['overlays'].append('Teacher '+name+' opens and closes without submitting')
   else:
    page.goto(ORIGIN+'/v2/admin/moderation')
    page.get_by_role('button',name='已展示',exact=True).click()
    rows=page.locator('.v2-verification-row')
    if rows.count():
     rows.first.click();expect(page.locator('.v2-drawer')).to_be_visible();shot('content-drawer');page.keyboard.press('Escape');expect(page.locator('.v2-drawer')).to_have_count(0);report['overlays'].append('Moderation detail opens and closes without decision')
    page.goto(ORIGIN+'/v2/admin/keywords')
    edits=page.get_by_role('button',name='修改',exact=True)
    if edits.count():
     edits.first.click();shot('keyword-edit');page.get_by_role('button',name='取消修改',exact=True).click();report['overlays'].append('Keyword edit and cancel, no save')
   # Mobile navigation remains usable in both roles.
   page.set_viewport_size({'width':390,'height':844});page.goto(ORIGIN+f'/v2/{role}'+('/profile' if role=='teacher' else '/keywords'))
   page.get_by_role('button',name='打开导航',exact=True).click();expect(page.locator('.v2-sidebar.is-open')).to_be_visible();page.get_by_role('button',name='关闭导航',exact=True).click(position={'x':375,'y':20});expect(page.locator('.v2-sidebar.is-open')).to_have_count(0)
   report['overlays'].append(role+' mobile navigation opens and closes')
   context.close()
  browser.close()
 report['result']='passed' if not report['overflow'] and not report['page_errors'] else 'needs-review'
 (OUT/('baseline-report.json' if baseline else 'browser-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--baseline',action='store_true');run(parser.parse_args().baseline)
