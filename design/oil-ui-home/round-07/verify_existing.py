"""Run existing scoped interaction checks into this round's evidence directory."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent
results=[]
for number,script,repeats in [('04','verify_pages.py',1),('05','verify_details.py',3),('06','verify_staff.py',1)]:
 path=ROOT/f'design/oil-ui-home/round-{number}'/script
 text=path.read_text(encoding='utf-8-sig')
 # The shell can briefly unmount while the authorized role is applied; wait through it.
 text=text.replace('!document.querySelector(".v2-main").innerText.includes("正在读取")','document.querySelector(".v2-main") && !document.querySelector(".v2-main").innerText.includes("正在读取")')
 env={'__file__':str(path),'__name__':'round07_verification'};exec(compile(text,str(path),'exec'),env)
 for repeat in range(repeats):
  target=ROOT/f'.runtime/round07-validation/{number}-{repeat+1}';target.mkdir(parents=True,exist_ok=True);env['OUT']=target;env['run']();results.append({'phase':number,'run':repeat+1,'result':'passed'})
(OUT/'interaction-report.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
