"""Run the existing homepage flow, adapting only the expanded gallery controls."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent
path=ROOT/'design/oil-ui-home/round-02/verify_preview.py'
text=path.read_text(encoding='utf-8-sig').replace("out = OUT.parent / 'round-03' if homepage else OUT","out = OUT")
text=text.replace("page.get_by_role('button', name='显示第 2 张校园照片', exact=True).click()","page.get_by_role('button', name='下一张校园照片', exact=True).click()")
text=text.replace("expect(page.get_by_role('button', name='显示第 2 张校园照片', exact=True)).to_have_attribute('aria-pressed', 'true')","expect(page.locator('.cw-photo-count')).not_to_have_text('1 / 12')")
text=text.replace("page.get_by_role('button', name='显示第 1 张校园照片', exact=True).click()","page.get_by_role('button', name='上一张校园照片', exact=True).click()")
env={'__file__':str(path),'__name__':'expanded_photo_home_check'};exec(compile(text,str(path),'exec'),env)
target=ROOT/'.runtime/campus-photo-home-check';target.mkdir(parents=True,exist_ok=True);env['OUT']=target;env['run'](homepage=True)
(OUT/'homepage-report.json').write_text((target/'browser-report.json').read_text(encoding='utf-8'),encoding='utf-8')
