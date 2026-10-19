"""Extra visual states and toolbar geometry. No account creation or business submission."""
import json,runpy
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
checks=[]
with sync_playwright() as p:
 b=p.chromium.launch();c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');pg=c.new_page()
 pg.goto(ORIGIN+'/v2/login');pg.get_by_role('button',name='登录',exact=True).click();expect(pg.get_by_role('alert')).to_contain_text('请填写邮箱');pg.screenshot(path=str(OUT/'state-login-error-mobile.png'));checks.append('Login client-side empty-field feedback, no authentication attempt')
 pg.goto(ORIGIN+'/v2/register');pg.get_by_role('textbox',name='邮箱地址',exact=True).fill('visual-check@example.test');pg.locator('input[name="code"]').fill('000000');pg.get_by_role('button',name='下一步',exact=True).click();expect(pg.get_by_role('button',name='完成注册')).to_be_visible();pg.screenshot(path=str(OUT/'state-register-password-mobile.png'));checks.append('Existing password step renders without completing registration or sending email')
 a=next(a for a in json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text())['accounts'] if a['email']=='student-a@example.test');assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
 for path in ['/v2/activities','/v2/campus','/v2/me','/v2/me?tab=timetable','/v2/community','/v2/schedule']:
  pg.goto(ORIGIN+path);expect(pg.get_by_role('button',name='打开课表窗口',exact=True)).to_be_visible()
  for width in [320,390,720]:
   pg.set_viewport_size({'width':width,'height':844});r=pg.locator('.v2-floating-timetable-trigger').bounding_box()
   for node in pg.locator('.ref-header nav>a,.ref-header .v2-student-search-trigger,.v2-top-actions>a,.v2-top-actions>button').all():
    if node.is_visible():
     q=node.bounding_box();assert not (r['x']<q['x']+q['width'] and r['x']+r['width']>q['x'] and r['y']<q['y']+q['height'] and r['y']+r['height']>q['y']),(path,width,r,q)
  checks.append(path+': timetable separated from toolbar controls at 320/390/720')
 pg.goto(ORIGIN+'/v2/community');expect(pg.get_by_role('button',name='发布帖子',exact=True)).to_have_count(1)
 pg.get_by_role('button',name='发布帖子',exact=True).click()
 expect(pg.get_by_role('dialog',name='发布社区帖子')).to_be_visible();pg.screenshot(path=str(OUT/'state-community-compose-mobile.png'));pg.keyboard.press('Escape');checks.append('Single visible community publish entry opens and dismisses the existing form')
 b.close()
(OUT/'states-report.json').write_text(json.dumps({'result':'passed','checks':checks},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'result':'passed','checks':len(checks)}))
