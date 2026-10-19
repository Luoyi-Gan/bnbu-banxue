"""Run previous route, dialog and persistence checks into isolated current-round outputs."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent
results=[]
for number,script,repeats in [('04','verify_pages.py',1),('05','verify_details.py',3),('06','verify_staff.py',1)]:
 path=ROOT/f'design/oil-ui-home/round-{number}'/script
 text=path.read_text(encoding='utf-8-sig').replace('!document.querySelector(".v2-main").innerText.includes("正在读取")','document.querySelector(".v2-main") && !document.querySelector(".v2-main").innerText.includes("正在读取")')
 env={'__file__':str(path),'__name__':'image_verification'};exec(compile(text,str(path),'exec'),env)
 for repeat in range(repeats):
  target=ROOT/f'.runtime/round08-validation/{number}-{repeat+1}';target.mkdir(parents=True,exist_ok=True);env['OUT']=target;env['run']();results.append({'phase':number,'run':repeat+1,'result':'passed'})
path=ROOT/'design/oil-ui-home/round-02/verify_preview.py'
text=path.read_text(encoding='utf-8-sig').replace("out = OUT.parent / 'round-03' if homepage else OUT","out = OUT")
env={'__file__':str(path),'__name__':'homepage_verification'};exec(compile(text,str(path),'exec'),env)
target=ROOT/'.runtime/round08-validation/home';target.mkdir(parents=True,exist_ok=True);env['OUT']=target;env['run'](homepage=True)
report=json.loads((target/'browser-report.json').read_text(encoding='utf-8'))
(OUT/'homepage-interaction-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
results.append({'phase':'homepage','result':'passed'})
(OUT/'interaction-report.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
