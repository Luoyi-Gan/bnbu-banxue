"""Selective student entry repair; activate only through the unified runner."""
import hashlib,json,os,re,shutil,subprocess,sys,urllib.request,uuid
from pathlib import Path
BASE=Path('/opt/bnbu-sports-production')
WORK=Path('/home/ubuntu/companion-real-candidate-20261022')
NAME='companion-entry-20261023'
TARGET=BASE/'releases'/NAME
def output(*args):
 r=subprocess.run(args,text=True,capture_output=True);assert r.returncode==0,'Private command failed: '+args[0];return r.stdout.strip()
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def switch(path):
 link=BASE/('entry-swap-'+uuid.uuid4().hex)
 try:link.symlink_to(path);os.replace(link,BASE/'current')
 finally:
  if link.is_symlink():link.unlink()
assert os.geteuid()==0
os.umask(0o077)
if sys.argv[1]=='--prepare':
 previous=(BASE/'current').resolve();assert previous.name=='companion-real-20261022' and not TARGET.exists()
 manifest=json.loads((WORK/'manifest.json').read_text())
 for item in manifest['files']:
  p=WORK/item['path'];assert p.resolve().is_relative_to(WORK) and digest(p)==item['sha256']
 shutil.copytree(previous,TARGET,symlinks=True)
 config=json.loads(output('docker','compose','--project-directory',str(previous),'--profile','*','config','--format','json'))
 (TARGET/'compose.override.yml').write_text(json.dumps(config,indent=2));os.chmod(TARGET/'compose.override.yml',0o600)
 env,n=re.subn(r'(?m)^COMPOSE_FILE=.*$','COMPOSE_FILE='+str(TARGET/'compose.override.yml'),(TARGET/'.env').read_text());assert n==1
 (TARGET/'.env').write_text(env)
 for name in ['companion-entry.js','companion-entry-paths.js']:shutil.copy2(WORK/'web/student/js'/name,TARGET/'web/student/js'/name)
 gate={'previous':str(previous),'release':str(TARGET),'files':{str(p.relative_to(TARGET)):digest(p) for p in [TARGET/'web/student/js/companion-entry.js',TARGET/'web/student/js/companion-entry-paths.js']}}
 (WORK/'entry-prepared.json').write_text(json.dumps(gate,indent=2));os.chmod(WORK/'entry-prepared.json',0o600)
 output('docker','compose','--project-directory',str(TARGET),'config','--quiet')
 print(json.dumps({'result':'PREPARED','release':NAME,'previous':previous.name,'databaseChanges':False}))
elif sys.argv[1]=='--apply':
 assert os.environ.get('BNBU_DEPLOY_MANAGED')=='1'
 gate=json.loads((WORK/'entry-prepared.json').read_text());previous=Path(gate['previous'])
 assert (BASE/'current').resolve()==previous
 for path,sha in gate['files'].items():assert digest(TARGET/path)==sha
 try:
  switch(TARGET)
  output(sys.executable,str(WORK/'verify-production.py'),'--release',NAME,'--manifest',str(WORK/'manifest.json'))
  print(json.dumps({'result':'ACTIVATED','release':NAME,'databaseChanges':False}))
 except BaseException:switch(previous);raise
else:raise SystemExit('Use --prepare or --apply')
