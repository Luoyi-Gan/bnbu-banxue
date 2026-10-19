"""Capture existing dialog surfaces without submitting forms or decisions."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
CASES=[
 ('student','schedule-add','添加活动到我的安排','/v2/schedule','添加活动'),
 ('student','post','发布社区帖子','/v2/community','发布帖子'),
 ('student','team','发起组队','/v2/partners','发起组队'),
 ('student','import','导入我的课表','/v2/me?tab=timetable','重新导入'),
 ('student','reset','恢复新版演示数据？','/v2/settings','恢复新版演示数据'),
 ('student','cover','选择主页封面','/v2/me','更换封面'),
 ('student','ai-icon','选择奶蛙的形象','/v2/ai','更换图标'),
 ('student','certification','提交身份认证','/v2/me?tab=verification','提交认证申请'),
 ('teacher','move','提出改期','/v2/teacher/coffee','提出改期'),
 ('teacher','cancel','取消预约','/v2/teacher/coffee','取消预约'),
 ('admin','content','内容详情','/v2/admin/moderation','')]
accounts=json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text())['accounts'];items=[]
with sync_playwright() as p:
 b=p.chromium.launch()
 for role,key,title,url,trigger in CASES:
  c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');a=next(a for a in accounts if a['email']==('student-a' if role=='student' else role)+'@example.test');assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
  page=c.new_page();page.goto(ORIGIN+url)
  if role=='admin':
   page.get_by_role('button',name='已展示',exact=True).click();expect(page.locator('.v2-verification-row').first).to_be_visible();page.locator('.v2-verification-row').first.click()
  else:page.get_by_role('button',name=trigger,exact=(key not in ['ai-icon','certification'])).first.click()
  dialog=page.get_by_role('dialog').last;expect(dialog).to_be_visible();page.evaluate('document.fonts.ready')
  ident='popup-'+role+'-'+key
  for label,w,h in [('desktop',1440,900),('mobile',390,844)]:
   page.set_viewport_size({'width':w,'height':h});page.screenshot(path=str(OUT/f'{ident}-{label}.png'))
  page.keyboard.press('Escape');expect(dialog).to_have_count(0);c.close();items.append({'id':ident,'role':role,'url':url,'family':'overlay','title':title,'label':title,'before':False})
 b.close()
(OUT/'overlays.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'result':'passed','overlays':len(items)}))
