from pathlib import Path
import json,tempfile,ctranslate2,sentencepiece as sp,time
root=Path(tempfile.gettempdir())/'huitongli-translation/model/translate-zh_en-1_9'
processor=sp.SentencePieceProcessor(model_file=str(root/'sentencepiece.model'))
translator=ctranslate2.Translator(str(root/'model'),device='cpu',compute_type='int8',inter_threads=2,intra_threads=6)
output=json.loads(Path('src/v2/uiEnglish.json').read_text(encoding='utf-8')); strings=[s for s in json.loads(Path('design/settings-complete/ui-strings.json').read_text(encoding='utf-8')) if s not in output]
start=time.time()
for i in range(0,len(strings),32):
 batch=strings[i:i+32];tokens=[processor.encode(s,out_type=str) for s in batch]
 results=translator.translate_batch(tokens,beam_size=2,max_decoding_length=256)
 output.update({s:processor.decode(r.hypotheses[0]).replace('▁',' ').strip() for s,r in zip(batch,results)})
 Path('src/v2/uiEnglish.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 if i%160==0:print(f'{i+len(batch)}/{len(strings)} in {time.time()-start:.1f}s',flush=True)
print('Translation draft complete',flush=True)
