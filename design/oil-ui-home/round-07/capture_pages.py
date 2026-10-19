"""Capture current V2 route designs and their responsive geometry using local fixtures."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ORIGIN='http://127.0.0.1:4174'
REPRESENTATIVE={'campus','me','schedule','coffee','community','settings','teacher-coffee','admin-overview','login','identity'}
def run(baseline=False):
 screens=json.loads((OUT/'screens.json').read_text(encoding='utf-8'));accounts=json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts'];report={'screens':[],'overflow':[],'page_errors':[],'scope':'Current V2 routes, local acceptance data'}
 with sync_playwright() as p:
  browser=p.chromium.launch();contexts={}
  for role in ['student','teacher','admin','public']:
   c=browser.new_context(reduced_motion='reduce');contexts[role]=c
   if role!='public':
    a=next(a for a in accounts if a['email']==('student-a' if role=='student' else role)+'@example.test');assert c.request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
  for entry in screens:
   if baseline and entry['id'] not in REPRESENTATIVE:continue
   page=contexts[entry['role']].new_page();page.on('pageerror',lambda e:report['page_errors'].append(str(e)))
   page.set_viewport_size({'width':1440,'height':900});page.goto(ORIGIN+entry['url']);page.locator('#root').wait_for();page.wait_for_function('document.querySelector("#root").innerText.length>50 && !document.querySelector("#root").innerText.includes("正在核对登录状态")')
   if entry['role']!='public':
    page.wait_for_function('!document.querySelector("#root").innerText.includes("正在读取")')
   page.evaluate('document.fonts.ready')
   title=page.locator('h1').first.inner_text() if page.locator('h1').count() else entry['id']
   for label,w,h in [('desktop',1440,900),('mobile',390,844),('narrow',320,780),('zoom',720,450)]:
    page.set_viewport_size({'width':w,'height':h})
    if page.evaluate('document.documentElement.scrollWidth>innerWidth'):
     report['overflow'].append({'id':entry['id'],'size':label,'elements':page.locator('#root').evaluate('(n)=>Array.from(n.querySelectorAll("*")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.className).slice(0,12)')})
    if label in ['desktop','mobile']:
     page.screenshot(path=str(OUT/f'{"before-" if baseline else ""}{entry["id"]}-{label}.png'))
    if not baseline and entry['id'] in REPRESENTATIVE and label=='desktop':page.screenshot(path=str(OUT/f'{entry["id"]}-full.png'),full_page=True)
   report['screens'].append({**entry,'title':title,'actual_url':page.url});page.close()
  browser.close()
 report['result']='passed' if not report['overflow'] and not report['page_errors'] else 'needs-review'
 (OUT/('before-report.json' if baseline else 'report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'result':report['result'],'screens':len(report['screens']),'overflow':report['overflow'],'page_errors':report['page_errors']},ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--baseline',action='store_true');run(parser.parse_args().baseline)
