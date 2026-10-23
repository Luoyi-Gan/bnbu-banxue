import json,zipfile
from pathlib import Path
from PIL import Image
r=Path('artifacts/interface-screenshots-20261021/iPhone15');m=json.loads((r/'manifest.json').read_text('utf-8')); errors=[]
for e in m['entries']:
 p=r/e['file'];im=Image.open(p)
 if im.size!=(1179,2556):errors.append((str(p),im.size))
 if e.get('full') and not (r/e['full']).is_file():errors.append(e['full'])
html=(r/'index.html').read_text('utf-8')
for e in m['entries']:
 if e['file'] not in html:errors.append('missing index '+e['file'])
counts={k:sum(e['role']==k for e in m['entries']) for k in ['public','student','teacher','admin']}
readme=f'''会同里 iPhone 15 界面截图\n截图日期：2026-10-21\n共 {len(m['entries'])} 个界面/状态，{len(list(r.glob('*/*.png')))} 张 PNG。\n分类统计：{counts}\n浏览入口：解压后打开 index.html。\n首屏规格：393×852 CSS 像素，3倍输出，1179×2556 PNG。长页面另附完整长图。\n使用本地 SQLite 验收数据与模拟身份，Chrome 模拟移动视口和触摸；并非 iPhone 真机 Safari 验收。\n覆盖 V2 公开页、学生/教师/管理员页面、个人中心和设置子页、现有活动/组队/预约/通知/会话详情及可打开的表单和地图面板。\n体育服务配置、空数据及错误提示按本地当前实际画面截图。特定数据条件下才出现的其他审核、改期、异常与权限状态未穷举。\n'''
(r/'说明.txt').write_text(readme,encoding='utf-8'); print(counts,'PNG',len(list(r.glob('*/*.png'))),'ERRORS',errors)
assert not errors
z=Path('C:/Users/23328/Desktop/会同里-iPhone15界面截图-20261021.zip')
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as f:
 for p in r.rglob('*'):
  if p.is_file():f.write(p,Path('会同里-iPhone15界面截图')/p.relative_to(r))
with zipfile.ZipFile(z) as f:assert f.testzip() is None
print('ZIP',z,round(z.stat().st_size/1024/1024,1),'MB')
