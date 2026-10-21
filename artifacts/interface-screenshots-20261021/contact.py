from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path('artifacts/interface-screenshots-20261021/iPhone15')
files=sorted(p for p in root.glob('*/*.png') if '完整长图' not in p.name)
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',16)
for offset in range(0,len(files),16):
 batch=files[offset:offset+16]; sheet=Image.new('RGB',(1000,4*580),'#edf1eb');draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(batch):
  im=Image.open(p);im.thumbnail((230,510));x=(i%4)*250+10;y=(i//4)*580+35;sheet.paste(im,(x,y));draw.text((x,y-25),p.stem,font=font,fill='#123a2c')
 sheet.save(root/f'预览总览-{offset//16+1}.jpg')
print(len(files))
