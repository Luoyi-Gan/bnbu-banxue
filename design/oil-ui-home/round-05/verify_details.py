"""Read-only local visual acceptance for student secondary pages and overlays."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
ORIGIN='http://127.0.0.1:4174'
ROUTES={
 'schedule':'/v2/schedule','activity':'/v2/activities/preview-event-2',
 'manage-activities':'/v2/activities?view=manage','organizations':'/v2/organizations',
 'community':'/v2/community','partners':'/v2/partners','teams':'/v2/partners/teams',
 'coffee':'/v2/coffee','alumni':'/v2/alumni','alumni-people':'/v2/alumni?view=people',
 'alumni-bookings':'/v2/alumni?view=bookings','messages':'/v2/messages',
 'notifications':'/v2/messages?view=notifications','settings':'/v2/settings','ai':'/v2/ai',
 **{f'me-{k}':f'/v2/me?tab={k}' for k in ['profile','saved','events','teams','verification','network','timetable']},
 'teaching':'/v2/campus?service=teaching','academic':'/v2/campus?service=academic',
 'explore':'/v2/campus/explore','sports':'/v2/sports'}
SHOTS={'schedule','activity','partners','coffee','settings','me-timetable','community','alumni','messages','sports'}

def run(baseline=False):
 accounts=json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts']
 actor=next(a for a in accounts if a['email']=='student-a@example.test')
 report={'scope':'Local acceptance fixture, no submitted business commands','routes':[],'overlays':[],'page_errors':[]}
 with sync_playwright() as p:
  b=p.chromium.launch()
  c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':actor['email'],'password':actor['password']}).ok
  page=c.new_page()
  page.on('pageerror',lambda e:report['page_errors'].append(str(e)))
  def shot(name):
   page.evaluate('document.fonts.ready')
   page.screenshot(path=str(OUT/f'{"baseline-" if baseline else ""}{name}.png'))
  for name,path in ROUTES.items():
   if baseline and name not in {'schedule','activity','partners','coffee','settings','me-timetable'}:continue
   page.goto(ORIGIN+path)
   expect(page.locator('.v2-app-student .v2-main')).to_be_visible()
   expect(page).to_have_url(ORIGIN+('/v2/community?board=%E5%AD%A6%E4%B9%A0' if name=='academic' else path))
   page.wait_for_function('!document.querySelector(".v2-main").innerText.includes("正在读取")')
   sizes=[('mobile',390,844),('desktop',1440,900),('narrow',320,780),('zoom',720,450)] if not baseline else [('mobile',390,844)]
   for label,w,h in sizes:
    page.set_viewport_size({'width':w,'height':h})
    overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
    if overflow and not baseline:
     report.setdefault('overflow',[]).append({'route':name,'size':label,'elements':page.locator('.v2-main').evaluate('(node)=>Array.from(node.querySelectorAll("*")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className).slice(0,12)')})
    if (name in SHOTS and label=='mobile') or (name in {'schedule','activity','coffee'} and label=='desktop'):shot(f'{name}-{label}')
   report['routes'].append(name)
  page.set_viewport_size({'width':390,'height':844})
  def modal(name,path,opener,dialog_name):
   page.goto(ORIGIN+path)
   if name=='sidebar-settings': page.set_viewport_size({'width':1440,'height':900})
   opener(page).click()
   dialog=page.get_by_role('dialog',name=dialog_name,exact=True)
   expect(dialog).to_be_visible()
   for label,w,h in [('mobile',390,844),('desktop',1440,900),('narrow',320,780),('zoom',720,450)]:
    page.set_viewport_size({'width':w,'height':h})
    rect=dialog.bounding_box()
    assert rect,(name,label)
    if not baseline: assert rect['x']>=-1 and rect['x']+rect['width']<=w+1,(name,label,rect)
    if not baseline: assert rect['y']>=-1 and rect['y']+rect['height']<=h+1,(name,label,rect)
    if label=='mobile':shot(name)
   page.keyboard.press('Escape')
   expect(dialog).to_have_count(0)
   report['overlays'].append(name)
   page.set_viewport_size({'width':390,'height':844})
  modal('add-arrangement','/v2/schedule',lambda p:p.get_by_role('button',name='添加活动',exact=True),'添加活动到我的安排')
  modal('post-composer','/v2/community',lambda p:p.get_by_role('button',name='发布帖子',exact=True),'发布社区帖子')
  modal('create-team','/v2/partners',lambda p:p.get_by_role('button',name='发起组队',exact=True),'发起组队')
  modal('import-timetable','/v2/me?tab=timetable',lambda p:p.get_by_role('button',name='重新导入',exact=True),'导入我的课表')
  modal('reset-confirmation','/v2/settings',lambda p:p.get_by_role('button',name='恢复新版演示数据',exact=True),'恢复新版演示数据？')
  modal('ai-icon-picker','/v2/ai',lambda p:p.get_by_role('button',name='更换图标',exact=False),'选择奶蛙的形象')
  modal('sidebar-settings','/v2/schedule',lambda p:p.get_by_role('button',name='侧栏设置',exact=True),'侧栏设置')
  page.goto(ORIGIN+'/v2/me?tab=timetable')
  page.get_by_role('tabpanel').get_by_role('button').first.click()
  expect(page.locator('.v2-drawer')).to_be_visible()
  shot('lesson-drawer')
  page.keyboard.press('Escape')
  expect(page.locator('.v2-drawer')).to_have_count(0)
  report['overlays'].append('lesson-drawer')
  page.goto(ORIGIN+'/v2/coffee')
  page.locator('.v2-teacher-card').first.click()
  expect(page.locator('.v2-coffee-schedule')).to_be_visible()
  shot('coffee-slots')
  report['overlays'].append('coffee-slots-existing-route')
  page.goto(ORIGIN+'/v2/schedule')
  page.get_by_role('button',name='打开课表窗口',exact=True).click()
  expect(page.get_by_role('dialog',name='我的课表',exact=True)).to_be_visible()
  shot('floating-timetable')
  page.get_by_role('button',name='关闭课表窗口',exact=True).click()
  report['overlays'].append('floating-timetable')
  # Validate the simulator's separate document uses the same palette.
  page.goto(ORIGIN+'/v2/sports')
  frame=page.frame_locator('iframe[title="会同里运动打卡模拟"]')
  expect(frame.locator('.checkin-root')).to_be_visible()
  assert frame.locator('html').evaluate('(n)=>getComputedStyle(n).getPropertyValue("--color-primary").trim()')=='#426575'
  report['overlays'].append('isolated-sports-palette')
  page.route('**/api/workspace',lambda route:route.fulfill(status=503,content_type='application/json',body=json.dumps({'message':'本地视觉检查：暂时无法读取，请重试。'})))
  page.goto(ORIGIN+'/v2/settings')
  expect(page.get_by_role('alert').filter(has_text='本地视觉检查')).to_be_visible()
  shot('recoverable-error')
  page.unroute('**/api/workspace')
  page.reload()
  expect(page.get_by_role('alert').filter(has_text='本地视觉检查')).to_have_count(0)
  report['overlays'].append('browser-only-error-and-reload')
  for email,path in [('teacher@example.test','/v2/teacher/coffee'),('admin@example.test','/v2/admin')]:
   role_actor=next(a for a in accounts if a['email']==email)
   role_context=b.new_context()
   assert role_context.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':role_actor['email'],'password':role_actor['password']}).ok
   role_page=role_context.new_page();role_page.goto(ORIGIN+path)
   expect(role_page.locator('.v2-app')).to_be_visible()
   expect(role_page.locator('.v2-app-student')).to_have_count(0)
   assert role_page.locator('body').evaluate('(n)=>getComputedStyle(n).getPropertyValue("--cw-title").trim()')==''
   role_context.close()
  report['isolation']='Teacher and admin shells do not receive campus-window student tokens'
  b.close()
 report['result']='passed' if not report.get('overflow') and not report['page_errors'] else 'needs-review'
 (OUT/('baseline-report.json' if baseline else 'browser-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--baseline',action='store_true');run(parser.parse_args().baseline)
