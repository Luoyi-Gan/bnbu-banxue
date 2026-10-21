"""Single release: restored-DB verification, backup, then API/frontend activation."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import time
import sys
from urllib.parse import urlsplit, urlunsplit
import yaml

base=Path('/opt/bnbu-banxue')
old=(base/'current').resolve()
release=base/'releases/huitongli-20261020-student-email'
assert old==base/'releases/huitongli-20261020-auth'
resume=len(sys.argv)>1 and sys.argv[1]=='resume'
assert not (release/'deployment-state.json').exists()
if not resume: release.mkdir()
if not resume:
    shutil.copytree(old/'dist',release/'dist')
    with tarfile.open('/tmp/huitongli-student-email.tar.gz') as archive:
        assert all((release/m.name).resolve().is_relative_to(release) and not m.issym() and not m.islnk() for m in archive.getmembers())
        archive.extractall(release,filter='data')
    for line in (release/'SHA256SUMS').read_text().splitlines():
        expected,relative=line.split('  ',1)
        assert hashlib.sha256((release/relative).read_bytes()).hexdigest()==expected,relative

def run(args,**kwargs): return subprocess.run(args,check=True,**kwargs)
def output(args): return subprocess.check_output(args).decode().strip()
def pg(*args,**kwargs): return run(['docker','exec','-i','bnbu-banxue-postgres-1',*args],**kwargs)
def ready(container):
    for _ in range(60):
        result=subprocess.run(['docker','exec',container,'node','-e',"fetch('http://127.0.0.1:4175/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        if result.returncode==0: return
        time.sleep(1)
    raise RuntimeError('API readiness failed')

config=json.loads(output(['docker','compose','-p','bnbu-banxue','-f',str(old/'compose.yaml'),'config','--format','json']))
environment=config['services']['api']['environment']
pg_env=config['services']['postgres']['environment']
user,database=pg_env['POSTGRES_USER'],pg_env['POSTGRES_DB']
backup=base/'backups/before-huitongli-20261020-student-email'
image='bnbu-banxue-api:huitongli-20261020-student-email'
if not resume:
    backup.mkdir(mode=0o700)
    with (backup/'database.dump').open('wb') as stream: pg('pg_dump','-U',user,'-d',database,'-Fc',stdout=stream)
    run(['docker','build','-f',str(release/'api.Dockerfile'),'-t',image,str(release)])
    check_db,check_container='huitongli_student_email_check_20261020','huitongli-student-email-check-20261020'
    pg('psql','-U',user,'-d',database,'-v','ON_ERROR_STOP=1','-c',f'CREATE DATABASE {check_db}')
    with (backup/'database.dump').open('rb') as stream: pg('pg_restore','-U',user,'-d',check_db,'--exit-on-error',stdin=stream)
    check_env=dict(environment)
    check_env['DATABASE_URL']=urlunsplit(urlsplit(environment['DATABASE_URL'])._replace(path='/'+check_db))
    check_env['BNBU_LOCAL_OUTBOX']='1'
    for key in list(check_env):
        if key.startswith(('BNBU_EMAIL_','BNBU_AOKSEND_','BNBU_ACTIVITY_MAIL_','BNBU_ACTIVITY_OCR_')): del check_env[key]
    (release/'check.env').write_text('\n'.join(f'{k}={v}' for k,v in check_env.items())+'\n')
    os.chmod(release/'check.env',0o600)
    run(['docker','run','-d','--name',check_container,'--network','bnbu-banxue_default','--memory','384m','--env-file',str(release/'check.env'),'-v','bnbu-banxue_object-data:/app/data:ro',image])
    ready(check_container)
    try:
        result=output(['docker','exec',check_container,'node','/app/verify-student-email.mjs'])
        (release/'identity-verification.json').write_text(result+'\n')
        print('RESTORED DATABASE CHECK:',result,flush=True)
    finally: run(['docker','stop',check_container],stdout=subprocess.DEVNULL)
config['services']['api']['image']=image
config['services']['api']['build']={'context':str(release),'dockerfile':'api.Dockerfile'}
frontend_config=next(volume['source'] for volume in config['services']['frontend']['volumes'] if volume['target']=='/etc/nginx/conf.d/default.conf')
assert Path(frontend_config).is_file()
config['services']['frontend']['volumes']=[f'{release}/dist:/usr/share/nginx/html:ro',f'{frontend_config}:/etc/nginx/conf.d/default.conf:ro']
(release/'compose.yaml').write_text(yaml.safe_dump(config,sort_keys=False))
os.chmod(release/'compose.yaml',0o600)
assert (base/'current').resolve()==old
try:
    run(['docker','compose','-p','bnbu-banxue','-f',str(release/'compose.yaml'),'up','-d','--no-build','--no-deps','api','frontend'])
    ready('bnbu-banxue-api-1')
    credentials=base/'backups/demo-accounts-20261020.json'
    run(['docker','cp',str(credentials),'bnbu-banxue-api-1:/tmp/demo-accounts.json'])
    run(['docker','exec','-u','0','bnbu-banxue-api-1','chown','1000:1000','/tmp/demo-accounts.json'])
    run(['docker','exec','-e','BNBU_DEMO_CREDENTIALS_FILE=/tmp/demo-accounts.json','bnbu-banxue-api-1','node','/app/verify-release.mjs'])
except BaseException:
    run(['docker','compose','-p','bnbu-banxue','-f',str(old/'compose.yaml'),'up','-d','--no-build','--no-deps','api','frontend'])
    raise
link=base/'current.student-email-next'
link.symlink_to(release)
os.replace(link,base/'current')
(release/'deployment-state.json').write_text(json.dumps({'previous':str(old),'backup':str(backup),'image':image,'activated':True,'studentEmailDomain':'mail.bnbu.edu.cn'},indent=2))
print('STUDENT EMAIL RELEASE DEPLOYED',release,flush=True)
