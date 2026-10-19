"""Capture image treatments against real local routes without changing business data."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent
ORIGIN='http://127.0.0.1:4174'
FEATURED={'home','discover','campus','me','schedule','activity','manage-activities','community','coffee','alumni','organizations','teacher-coffee','admin-overview','login','welcome'}
def run(before=False):
 accounts=json.loads((ROOT/'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts']
 screens=json.loads((OUT.parent/'round-07/screens.json').read_text(encoding='utf-8'))
 report={'screens':[],'overflow':[],'errors':[],'images':[]}
 with sync_playwright() as p:
  browser=p.chromium.launch();contexts={}
  for role in ['student','teacher','admin','public']:
   contexts[role]=browser.new_context(reduced_motion='reduce')
   if role!='public':
    a=next(a for a in accounts if a['email']==('student-a' if role=='student' else role)+'@example.test')
    assert contexts[role].request.post(ORIGIN+'/api/auth/sign-in',data={'identifier':a['email'],'password':a['password']}).ok
  for e in screens:
   if before and e['id'] not in FEATURED:continue
   page=contexts[e['role']].new_page();page.on('pageerror',lambda err:report['errors'].append(str(err)))
   page.set_viewport_size({'width':1440,'height':900});page.goto(ORIGIN+e['url'])
   page.wait_for_function('document.querySelector("#root")?.innerText.length>50 && !document.querySelector("#root").innerText.includes("正在核对登录状态")')
   if e['role']!='public':page.wait_for_function('document.querySelector(".v2-main") && !document.querySelector(".v2-main").innerText.includes("正在读取")') if e['id']!='identity' else None
   page.evaluate('document.fonts.ready')
   page.locator('img').evaluate_all('(els)=>Promise.all(els.filter(e=>!e.loading||e.loading!=="lazy").map(e=>e.decode().catch(()=>{})))')
   for label,w,h in [('desktop',1440,900),('mobile',393,852),('narrow',320,780),('zoom',720,450)]:
    page.set_viewport_size({'width':w,'height':h})
    if page.evaluate('document.documentElement.scrollWidth>innerWidth'):report['overflow'].append({'id':e['id'],'size':label})
    if e['id'] in FEATURED and label in ['desktop','mobile']:
     page.screenshot(path=str(OUT/f'{"before-" if before else ""}{e["id"]}-{label}.png'),full_page=label=='mobile')
   report['images'].append({'id':e['id'],'items':page.locator('img,[style*="background-image"]').evaluate_all('(els)=>els.map(e=>({tag:e.tagName,classes:e.className,alt:e.getAttribute("alt"),width:Math.round(e.getBoundingClientRect().width),radius:getComputedStyle(e).borderRadius,fit:getComputedStyle(e).objectFit,failed:e.tagName==="IMG"&&e.complete&&!e.naturalWidth}))')})
   report['screens'].append(e);page.close()
  browser.close()
 report['result']='passed' if not report['errors'] and not report['overflow'] else 'needs-review'
 (OUT/('before-report.json' if before else 'report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'result':report['result'],'routes':len(report['screens']),'overflow':report['overflow'],'errors':report['errors']},ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--before',action='store_true');run(parser.parse_args().before)
